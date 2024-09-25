import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NodemailService {
  private readonly logger = new Logger(NodemailService.name);

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('GMAIL_MAIL_SERVICE'),
      port: this.configService.get<number>('GMAIL_MAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_ADDRESS'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });

    try {
      await transporter.verify();
      this.logger.log('SMTP connection established successfully');

      const mailOptions = {
        from: this.configService.get<string>('EMAIL_ADDRESS'),
        to,
        subject,
        text,
        html: html || undefined,
      };

      const info = await transporter.sendMail(mailOptions);

      this.logger.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`);
      this.logger.error(`SMTP Config: ${JSON.stringify({
        host: this.configService.get<string>('GMAIL_MAIL_SERVICE'),
        port: this.configService.get<number>('GMAIL_MAIL_PORT'),
        user: this.configService.get<string>('EMAIL_ADDRESS'),
      })}`);
      throw new Error(`Error sending email: ${error.message}`);
    }
  }
}