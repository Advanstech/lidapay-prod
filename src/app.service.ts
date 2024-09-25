import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // Welcome to Lidapay services
    return 'Akwaaba Lidapay reload services';  
  }
}
