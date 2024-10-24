import { Logger } from '@nestjs/common';
import { PAYSWITCH_APIKEY, PAYSWITCH_USERNAME } from 'src/constants';
import { v4 as uuidv4 } from 'uuid';

export class GeneratorUtil {
  static generateTransactionId(prefix: string = 'TXN'): string {
    const timestamp = Date.now().toString(36); // Convert timestamp to a base-36 string
    const randomString = uuidv4().split('-')[0]; // Get a random alphanumeric string
    return `${prefix}-${timestamp}-${randomString}`.toUpperCase();
  }

  static generateMerchantKey(): any {
    const merchantId = process.env.PAYSWITCH_USERNAME || PAYSWITCH_USERNAME;
    const merchantToken = process.env.PAYSWITCH_APIKEY || PAYSWITCH_APIKEY;

    const encodedAuth = '' + Buffer.from(merchantId + ':' + merchantToken).toString('base64');
    console.log('encoded string toBase64 Auth ===>');
    console.debug(encodedAuth);

    return encodedAuth;
  }

  static generateTransactionIdPayswitch(prefix: string = 'PSW'): string {
    const timestamp = Date.now().toString(36); // Convert timestamp to a base-36 string
    const randomString = uuidv4().split('-')[0]; // Get a random alphanumeric string
    return `${prefix}-${timestamp}-${randomString}`.toUpperCase();
  }
  
  static generateOrderId(prefix: string = 'ADV'): string {
    const timestamp = Date.now().toString(36); // Convert timestamp to a base-36 string
    const randomString = uuidv4().split('-')[0]; // Get a random alphanumeric string
    return `${prefix}-${timestamp}-${randomString}`.toUpperCase();
  }

  static psRandomGeneratedNumber() {
    const logger = new Logger();

    let text = '';
    const possible = '0123456789';
    const date = new Date();
    const day = (date.getDate() < 10 ? '0' : '') + date.getDate();
    const month = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1);
    const year = date.getFullYear().toString().substr(2, 2);
    const customDate = '' + month + day + year;
    for (let i = 0; i < 6; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    const transId = text + customDate;
    logger.log('generated random transaction +++ ' + transId);
    return transId;
  }

    // Generate Account Number
static async generateAccountNumber(){
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}${(currentDate.getMonth() + 1).toString().padStart(2, '0')}${currentDate.getFullYear().toString().slice(-2)}`; // Format as ddmmyy
      const shortUniqueId = uuidv4().split('-')[0]; // Take the first part of the UUID for uniqueness
      return `${formattedDate}-${shortUniqueId}`; // Concatenate date with short unique ID
    }

}