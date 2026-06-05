import { otpUtil } from '../utils/otp.util';
import { emailUtil } from '../utils/email.util';
import { OtpRepository } from '../repositories/OtpRepository';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../entities/User';
import { UnauthorizedException, TooManyRequestsException } from '../exceptions/index';
import { OTP_CONFIG } from '../utils/constants.util';
import { logger } from '../utils/logger.util';

export class OtpService {
    constructor(
        private readonly otpRepository: OtpRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async sendOtp(email: string): Promise<{ success: boolean }> {
        const normalizedEmail = email.toLowerCase().trim();

        const recentOtp = await this.otpRepository.findRecentByEmail(normalizedEmail);

        if (recentOtp) {
            const timeSinceLastOtp = Date.now() - recentOtp.createdAt.getTime();
            const cooldownMs = OTP_CONFIG.RESEND_COOLDOWN_SECONDS * 1000;

            if (timeSinceLastOtp < cooldownMs) {
                const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOtp) / 1000);
                throw new TooManyRequestsException(
                    `Please wait ${remainingSeconds} seconds before requesting another OTP`
                );
            }
        }

        const otp = otpUtil.generate();
        const codeHash = await otpUtil.hash(otp);

        await this.otpRepository.create({
            email: normalizedEmail,
            codeHash,
            purpose: 'LOGIN',
            attempts: 0,
            maxAttempts: OTP_CONFIG.MAX_ATTEMPTS,
            expiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000),
            isUsed: false,
        });

        emailUtil.sendOtpEmail(normalizedEmail, otp).catch((err) =>
            logger.error('Failed to send OTP email', err)
        );

        logger.info(`OTP sent to ${normalizedEmail}`);

        return { success: true };
    }

    async verifyOtp(email: string, code: string): Promise<User> {
        const normalizedEmail = email.toLowerCase().trim();

        const otp = await this.otpRepository.findValidByEmail(normalizedEmail);

        if (!otp) {
            throw new UnauthorizedException('Invalid or expired OTP. Please request a new one.');
        }

        if (otp.attempts >= otp.maxAttempts) {
            await this.otpRepository.markUsed(otp.id);
            throw new UnauthorizedException(
                'OTP has exceeded maximum attempts. Please request a new one.'
            );
        }

        const isValid = await otpUtil.verify(code, otp.codeHash);

        if (!isValid) {
            await this.otpRepository.incrementAttempts(otp.id);
            const remainingAttempts = otp.maxAttempts - otp.attempts - 1;

            if (remainingAttempts <= 0) {
                await this.otpRepository.markUsed(otp.id);
                throw new UnauthorizedException(
                    'Invalid OTP. No attempts remaining. Please request a new one.'
                );
            }

            throw new UnauthorizedException(
                `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
            );
        }

        await this.otpRepository.markUsed(otp.id);

        let user = await this.userRepository.findByEmail(normalizedEmail);

        if (!user) {
            user = await this.userRepository.create({
                email: normalizedEmail,
                displayName: normalizedEmail.split('@')[0],
            } as User);
            logger.info(`New user created: ${user.id} (${normalizedEmail})`);
        }

        return user;
    }
}