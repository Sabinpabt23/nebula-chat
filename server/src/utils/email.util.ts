import nodemailer from 'nodemailer';
import { env } from '../config/env.config';
import { logger } from './logger.util';

class EmailUtil {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: env.email.host,
            port: env.email.port,
            secure: env.email.port === 465,
            auth: {
                user: env.email.user,
                pass: env.email.pass,
            },
        });
    }

    async sendOtpEmail(email: string, otp: string): Promise<void> {
        const mailOptions = {
            from: env.email.from,
            to: email,
            subject: 'Your Nebula Chat Login Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Nebula Chat</h2>
                    <p>Your login code is:</p>
                    <div style="background: #f4f4f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #18181b;">${otp}</span>
                    </div>
                    <p style="color: #71717a; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`OTP email sent to ${email}`);
        } catch (error) {
            logger.error(`Failed to send OTP email to ${email}`, error);
            throw error;
        }
    }
}

export const emailUtil = new EmailUtil();