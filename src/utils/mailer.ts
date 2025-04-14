import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Types for our email templates
type TemplateType = 'register' | 'code' | '2fa';

// Email configuration interface
interface MailConfig {
    host: string;
    port: number;
    secure: boolean; // true for 465, false for other ports
    auth: {
        user: string;
        pass: string;
    };
    from: string; // sender address
}

// Response interface for sending emails
interface SendMailResponse {
    success: boolean;
    message: string;
    error?: string;
    messageId?: string;
}

// Initialize mailer with configuration
export class Mailer {
    private transporter: nodemailer.Transporter;
    private config: MailConfig;

    constructor(config: MailConfig) {
        this.config = config;
        this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: config.auth,
        });

        // Verify connection configuration
        this.transporter.verify((error) => {
            if (error) {
                console.error('SMTP connection verification failed:', error);
            } else {
                console.log('SMTP server is ready to take our messages');
            }
        });
    }

    // Method to send email with proper success/failure tracking
    public async sendMail(
        to: string,
        templateType: TemplateType,
        code?: string
    ): Promise<SendMailResponse> {
        try {
            // Load the appropriate template
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

            // Prepare template data
            const templateData = { code };

            // Generate HTML
            const html = template(templateData);

            // Determine subject based on template type
            let subject: string;
            switch (templateType) {
                case 'register':
                    subject = 'Welcome to Our Platform!';
                    break;
                case 'code':
                    subject = 'Your Verification Code';
                    break;
                case '2fa':
                    subject = '2FA Has Been Enabled';
                    break;
                default:
                    subject = 'Notification from Our Platform';
            }

            // Send email and get the response
            const info = await this.transporter.sendMail({
                from: this.config.from,
                to,
                subject,
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

// Example configuration (should come from environment variables in production)
const mailConfig: MailConfig = {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
    // from: process.env.SMTP_FROM || '"Your App Name" <no-reply@example.com>',
    from: process.env.SMTP_FROM  || ''
};

// Create a singleton instance of the mailer
export const mailer = new Mailer(mailConfig);