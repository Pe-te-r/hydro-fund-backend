import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Types for our email templates
type TemplateType = 'register' | 'code' | '2fa' | 'forget' | 'password_changed';

// Enhanced email data interface
interface EmailData {
    username: string; // Always required
    email?: string;
    changeDate?: string;
    location?: string;
    ip?: string;
    device?: string;
    browser?: string;
    supportEmail?: string;
    contactPhone?: string;
    code?: string; // For backward compatibility
}

// Email configuration interface
interface MailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: string;
    defaultSupportEmail?: string;
    defaultContactPhone?: string;
}

// Response interface for sending emails
interface SendMailResponse {
    success: boolean;
    message: string;
    error?: string;
    messageId?: string;
}

export class Mailer {
    private transporter: nodemailer.Transporter;
    private config: MailConfig;

    constructor(config: MailConfig) {
        this.config = {
            ...config,
            defaultSupportEmail: config.defaultSupportEmail || 'support@yourdomain.com',
            defaultContactPhone: config.defaultContactPhone || '+1 (555) 123-4567'
        };

        this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: config.auth,
        });

        this.transporter.verify((error) => {
            if (error) {
                console.error('SMTP connection verification failed:', error);
            } else {
                console.log('SMTP server is ready to take our messages');
            }
        });
    }

    public async sendMail(
        to: string,
        templateType: TemplateType,
        data?: EmailData | string // Accepts either full data object or just code (for backward compatibility)
    ): Promise<SendMailResponse> {
        try {
            const templatePath = path.join(
                __dirname,
                '../templates',
                `${templateType}.html`
            );

            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template file not found: ${templatePath}`);
            }

            const templateSource = fs.readFileSync(templatePath, 'utf8');
            const template = handlebars.compile(templateSource);

            // Normalize the data parameter
            let templateData: EmailData;

            if (typeof data === 'string') {
                // Backward compatibility for code-only emails
                templateData = {
                    username: 'User', // Default username
                    code: data
                };
            } else {
                // Enhanced email data
                templateData = {
                    username: data?.username || 'User',
                    email: data?.email || to, // Use recipient email if not provided
                    changeDate: data?.changeDate || new Date().toLocaleString(),
                    location: data?.location || 'Unknown location',
                    ip: data?.ip || 'Unknown IP',
                    device: data?.device || 'Unknown device',
                    browser: data?.browser || 'Unknown browser',
                    supportEmail: data?.supportEmail || this.config.defaultSupportEmail,
                    contactPhone: data?.contactPhone || this.config.defaultContactPhone,
                    code: data?.code
                };
            }

            const html = template(templateData);

            // Determine subject based on template type
            const subjects = {
                register: 'Welcome to Our Platform!',
                code: 'Your Verification Code',
                '2fa': 'Two-Factor Authentication Notification',
                forget: 'Password Reset Confirmation',
                password_changed: 'Your Password Has Been Changed'
            };

            const info = await this.transporter.sendMail({
                from: this.config.from,
                to,
                subject: subjects[templateType] || 'Notification from Our Platform',
                html,
            });

            console.log(`Email sent to ${to} (Message ID: ${info.messageId})`);

            return {
                success: true,
                message: `Email successfully sent to ${to}`,
                messageId: info.messageId
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error sending email:', errorMessage);

            return {
                success: false,
                message: `Failed to send email to ${to}`,
                error: errorMessage
            };
        }
    }
}

// Updated configuration with default support contacts
const mailConfig: MailConfig = {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
    from: process.env.SMTP_FROM || '"Your App Name" <no-reply@example.com>',
    defaultSupportEmail: process.env.SUPPORT_EMAIL || 'support@yourdomain.com',
    defaultContactPhone: process.env.SUPPORT_PHONE || '+1 (555) 123-4567'
};

export const mailer = new Mailer(mailConfig);