import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { env } from '../config/env.config';
import { logger } from './logger.util';

class EmailUtil {
    private transporter: nodemailer.Transporter | null = null;
    private resend: Resend | null = null;
    private readonly isProduction: boolean;

    constructor() {
        this.isProduction = env.nodeEnv === 'production';

        if (this.isProduction) {
            this.resend = new Resend(env.email.pass);
        } else {
            const config: any = {
                host: env.email.host,
                port: env.email.port,
                secure: env.email.port === 465,
            };

            if (env.email.user && env.email.pass) {
                config.auth = { user: env.email.user, pass: env.email.pass };
            }

            this.transporter = nodemailer.createTransport(config);
        }
    }

    async sendOtpEmail(email: string, otp: string): Promise<void> {
        if (this.isProduction && this.resend) {
            await this.resend.emails.send({
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
            });
        } else if (this.transporter) {
            await this.transporter.sendMail({
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
            });
        }

        logger.info(`OTP email sent to ${email}`);
    }
}

export const emailUtil = new EmailUtil();