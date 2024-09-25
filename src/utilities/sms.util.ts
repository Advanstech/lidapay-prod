import { Injectable } from '@nestjs/common';
import { TWILIO_ACCOUNT_SID, TWILIO_TOKEN } from 'src/constants';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private client: Twilio;

  constructor() {
    this.client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_TOKEN);
  }

  async sendSms(to: string, body: string) {
    return this.client.messages.create({
      body,
      from: '233244588584',
      to,
    });
  }
}
