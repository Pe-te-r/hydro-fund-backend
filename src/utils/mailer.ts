import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

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

// Mail options interface
interface MailOptions {
    to: string;
    subject: string;
    html: string;
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
    }

    // Method to send email
    public async sendMail(
        to: string,
        templateType: TemplateType,
        code?: string
    ): Promise<void> {
        try {
            // Load the appropriate template
            const templatePath = path.join(
                __dirname,
                '../templates',
                `${templateType}.html`
            );
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

            // Prepare mail options
            const mailOptions: MailOptions = {
                to,
                subject,
                html,
            };

            // Send email
            await this.transporter.sendMail({
                from: this.config.from,
                ...mailOptions,
            });

            console.log(`Email sent to ${to} with template ${templateType}`);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}

// Example configuration (you should get these from environment variables)
const mailConfig: MailConfig = {
    host: 'smtp.example.com', // Your SMTP host
    port: 587, // Your SMTP port
    secure: false, // true for port 465, false for other ports
    auth: {
        user: 'your-email@example.com', // Your email
        pass: 'your-password', // Your email password or app password
    },
    from: '"Your App Name" <no-reply@example.com>', // Sender address
};

// Create a singleton instance of the mailer
export const mailer = new Mailer(mailConfig);