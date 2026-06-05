import crypto from 'crypto';
import { hashUtil } from './hash.util';
import { OTP_CONFIG } from './constants.util';

class OtpUtil {
    generate(): string {
        const digits = '0123456789';
        let otp = '';
        for (let i = 0; i < OTP_CONFIG.LENGTH; i++) {
            otp += digits[crypto.randomInt(0, digits.length)];
        }
        return otp;
    }

    async hash(otp: string): Promise<string> {
        return hashUtil.hash(otp);
    }

    async verify(otp: string, hash: string): Promise<boolean> {
        return hashUtil.compare(otp, hash);
    }
}

export const otpUtil = new OtpUtil();