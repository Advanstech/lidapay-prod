// express-pay.service.ts
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { ExpressPayConfig } from './interface/express-pay-config.interface';
import { EXPRESSPAY_MERCHANT_ID, EXPRESSPAY_API_KEY, EXPRESSPAY_BASE_URL, EXPRESSPAY_TEST_BASE_URL, EXPRESSPAY_REDIRECT_URL, EXPRESSPAY_POST_URL, FEE_CHARGES } from 'src/constants';
import { ExpressPayError } from './express-pay.error';
import { GeneratorUtil } from 'src/utilities/generator.util';
import * as qr from 'querystring'; // Add this import

@Injectable()
export class ExpressPayService {
  private readonly logger = new Logger(ExpressPayService.name);
  private readonly config: ExpressPayConfig;

  constructor(
    private readonly httpService: HttpService,
    private readonly transactionService: TransactionService,
  ) {
    this.config = {
      merchantId: process.env.EXPRESSPAY_MERCHANT_ID || EXPRESSPAY_MERCHANT_ID,
      apiKey: process.env.EXPRESSPAY_API_KEY || EXPRESSPAY_API_KEY,
      baseUrl: process.env.EXPRESSPAY_BASE_URL || EXPRESSPAY_BASE_URL,
      testUrl: process.env.EXPRESSPAY_TEST_BASE_URL || EXPRESSPAY_TEST_BASE_URL,
      redirectUrl: process.env.EXPRESSPAY_REDIRECT_URL || EXPRESSPAY_REDIRECT_URL,
      postUrl: process.env.EXPRESSPAY_POST_URL || EXPRESSPAY_POST_URL,
    };
  }
  // Payment Callback Url to accept payment response from ExpressPay
  async paymentCallbackURL(req: any) {
    // Extracting orderId and token from the URL parameters
    const { 'order-id': orderId, token } = req.query; // Extract from query parameters
    this.logger.log(`Received payment callback for order: ${orderId}, token: ${token}`);

    try {
      // Validate the response (ensure orderId and token are present)
      if (!token || !orderId) {
        throw new HttpException('Invalid callback data', HttpStatus.BAD_REQUEST);
      }

      // Check the payment status using the existing queryTransaction method
      const transactionResponse = await this.queryTransaction(token);
      const paymentStatus = transactionResponse.status; // Extract the status from the response

      // Update transaction status in the database
      await this.transactionService.updateByTrxn(orderId, {
        status: paymentStatus,
        lastChecked: new Date(),
        metadata: req.body, // Store the full response for reference
      });

      this.logger.log(`Transaction status updated for order: ${orderId}, new status: ${paymentStatus}`);

      // Optionally, you can send a response back to ExpressPay
      return { message: 'Callback processed successfully' };
    } catch (error) {
      this.logger.error('Error processing payment callback', {
        error: error.message,
        orderId,
        stack: error.stack,
      });

      throw new ExpressPayError('CALLBACK_PROCESSING_FAILED', error.message);
    }
  }

  // Method to handle the POST request from ExpressPay
  async handlePostPaymentStatus(req: any) {
    const { 'order-id': orderId, token, status } = req.body; // Extract from request body
    this.logger.log(`Received post payment status for order: ${orderId}, status: ${status}`);

    try {
      // Validate the response (ensure orderId, token, and status are present)
      if (!token || !orderId || !status) {
        throw new HttpException('Invalid post data', HttpStatus.BAD_REQUEST);
      }

      // Update transaction status in the database
      await this.transactionService.updateByTrxn(orderId, {
        status,
        lastChecked: new Date(),
        metadata: req.body, // Store the full response for reference
      });

      this.logger.log(`Transaction status updated for order: ${orderId}, new status: ${status}`);
    } catch (error) {
      this.logger.error('Error processing post payment status', {
        error: error.message,
        orderId,
        stack: error.stack,
      });

      throw new ExpressPayError('POST_STATUS_PROCESSING_FAILED', error.message);
    }
  }

  // Step 1
  async initiatePayment(paymentData: InitiatePaymentDto) {
    const localTransId = GeneratorUtil.generateOrderId() || 'TNX-';
    this.logger.log(`Initiating payment for orderId as localTransId:: ${localTransId}`);
    try {
      const ipFormData: any = {
        'merchant-id': this.config.merchantId,
        'api-key': this.config.apiKey,
        firstname: paymentData.firstName,
        lastname: paymentData.lastName,
        email: paymentData.email,
        phonenumber: paymentData.phoneNumber,
        username: paymentData.username || paymentData.email, // Default to email if username not provided
        accountnumber: paymentData.accountNumber || '', // Include empty string if not provided
        currency: 'GHS',
        amount: paymentData.amount.toFixed(2),
        'order-id': localTransId,
        'order-desc': paymentData.orderDesc || '',
        'redirect-url': this.config.redirectUrl,
        'post-url': this.config.postUrl,
        'order-img-url': paymentData.orderImgUrl || '',
      };
     
      console.log('initiate payment payload  =>>', ipFormData);
      this.logger.debug('Sending payment request to ExpressPay', {
        'order-id': ipFormData,
        amount: ipFormData.amount,
      });
      // Wait for response
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.testUrl}/api/submit.php`,
          qr.stringify(ipFormData), // Use querystring.stringify to format as x-www-form-urlencoded
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )
      );
      // Extracted Response from ExpressPay
      const { status, token, message } = response.data;
      if (status !== 1) {
        this.logger.error('Payment initiation failed', {
          status,
          orderId: ipFormData['order-id'],
          message,
        });
        throw new ExpressPayError('PAYMENT_INITIATION_FAILED', { status, message });
      }
      this.logger.log(`Payment initiated successfully. Token: ${token}`);
       // save transaction to database
       const ipParamSave: any = {
        userId: paymentData.userId,
        userName: paymentData.userName,
        email: paymentData.email,
        transId: ipFormData['order-id'],
        paymentType: 'MOMO',
        retailer: 'EXPRESSPAY',
        fee: FEE_CHARGES || 0,
        originalAmount: paymentData.amount,
        amount: (Number(paymentData.amount) + Number(FEE_CHARGES)).toString() || '',
        customerMsisdn: paymentData.phoneNumber,
        walletOperator: '',
        paymentCurrency: 'GHS',
        paymentCommentary: '',
        paymentStatus: 'pending',
        paymentServiceCode: '',
        paymentTransactionId: '',
        paymentServiceMessage: '',
        payTransRef: paymentData.payTransRef || '',
        expressToken: token,
        serviceStatus: 'pending',
        transStatus: 'pending',
        transType: 'MOMO',
      };
      // persist to Transaction
      await this.transactionService.create(ipParamSave);

      return {
        checkoutUrl: `${this.config.testUrl}/api/checkout.php?token=${token}`,
        token,
        'order-id': ipParamSave.transId,
      };
    } catch (error) {
      this.logger.error('Payment initiation error', {
        error: error.message,
        'order-id': error['order-id'],
        stack: error.stack,
      });

      if (error instanceof ExpressPayError) {
        throw error;
      }

      throw new ExpressPayError('SYSTEM_ERROR', error.message);
    }
  }
  // STEP 4a: Merchant initiates HTTP POST request to expressPay Query API to check trans status of 
  async queryTransaction(token: string) {
    this.logger.log(`Querying transaction status for token: ${token}`);

    try {
      const formData = {
        'merchant-id': this.config.merchantId,
        'api-key': this.config.apiKey,
        token,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.testUrl}/api/query.php`,
          qr.stringify(formData),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )
      );
      // {
      //   "result": 1,
      //   "result-text": "Approved",
      //   "order-id": "49039ruuir",
      //   "token": "316152c48865d04e73.2568619f619f52c4d04ec2.177113153192653f52c4d0",
      //   "transaction-id": "906962986353",
      //   "currency": "GHS",
      //   "amount": 25,
      //   "date-processed": "31st January, 1995"
      // }
      const {
        result,
        orderId,
        amount,
        'transaction-id': transactionId,
        'result-text': resultText,
      } = response.data;

      this.logger.debug('Transaction query response', {
        token,
        result,
        orderId,
        resultText
      });
      // Map ExpressPay status to your status
      const statusMap = {
        1: 'COMPLETED',
        2: 'DECLINED',
        3: 'ERROR',
        4: 'PENDING',
      };

      const status = statusMap[result];

      // Update transaction in database
      await this.transactionService.updateByExpressToken(token, {
        status,
        transactionId,
        lastChecked: new Date(),
        metadata: {
          ...response.data,
          lastQueryAt: new Date(),
        }
      });

      return {
        status,
        orderId,
        transactionId,
        amount,
        resultText,
        originalResponse: response.data,
      };
    } catch (error) {
      this.logger.error('Transaction query error', {
        error: error.message,
        token,
        stack: error.stack,
      });

      throw new ExpressPayError('QUERY_FAILED', error.message);
    }
  }

}
