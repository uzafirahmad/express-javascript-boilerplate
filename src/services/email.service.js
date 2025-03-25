import nodemailer from 'nodemailer';
import CustomError from '../utils/errors.js';

class EmailService {
    #transporter

    constructor() {
        this.#validateEmailConfig();
        this.#transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    #validateEmailConfig() {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new CustomError('Email configuration is missing', 500);
        }
    }

    async send(options) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                ...options
            };

            await this.#transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Email sending failed:', error);
            throw new CustomError('Failed to send email', 500);
        }
    }
}

const emailService = new EmailService();
export default emailService;