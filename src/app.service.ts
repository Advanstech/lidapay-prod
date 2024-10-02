import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // Welcome to Lidapay services
    return `AKWAABA !!! 
            World Wide Lidapay Airtime & Data Reload Services.
            `;
  }
}
