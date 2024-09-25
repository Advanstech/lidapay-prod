import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EMAIL_ADDRESS, EMAIL_PASSWORD, GMAIL_MAIL_PORT, GMAIL_MAIL_SERVICE } from 'src/constants';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: GMAIL_MAIL_SERVICE,
      port: GMAIL_MAIL_PORT,
      secure: false, // or 'STARTTLS'
      auth: {
        user: process.env.EMAIL_ADDRESS || EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD || EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
      
    });

  }

  async sendMail(to: string, subject: string, text?: string, html?: string) {
    const mailOptions = {
      from: 'info@advansistechnologies.com',
      to,
      subject,
      text,
      html,
    };
    try {
      const result = await this.transporter.sendMail(mailOptions);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Error sending email');
    }
  }
}