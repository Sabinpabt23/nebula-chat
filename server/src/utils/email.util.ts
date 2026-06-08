/**
 * Email Utility
 * 
 * Handles transactional email delivery via nodemailer.
 * Uses MailHog (no auth) in development, real SMTP with credentials in production.
 * The transporter is configured once on startup; auth is skipped when credentials are empty.
 */
import nodemailer from 'nodemailer';
import { env } from '../config/env.config';
import { logger } from './logger.util';

class EmailUtil {
    private transporter: nodemailer.Transporter;

    constructor() {
        const config: any = {
            host: env.email.host,
            port: env.email.port,
            secure: env.email.port === 465,
        };

        if (env.email.user && env.email.pass) {
            config.auth = {
                user: env.email.user,
                pass: env.email.pass,
            };
        }

        this.transporter = nodemailer.createTransport(config);
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

        await this.transporter.sendMail(mailOptions);
        logger.info(`OTP email sent to ${email}`);
    }
}

export const emailUtil = new EmailUtil();