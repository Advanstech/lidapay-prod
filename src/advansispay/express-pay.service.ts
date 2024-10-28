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
    const orderId = req['order-id'] ? String(req['order-id']) : null; // Ensure orderId is a string or null
    const token = req.token ? String(req.token) : null; // Ensure token is a string or null
    this.logger.log(`Received payment callback for order: ${orderId}, token: ${token}`);
    
    try {
      // Validate the response (ensure orderId and token are present)
      if (!token || !orderId) {
        throw new HttpException('Invalid callback data', HttpStatus.BAD_REQUEST);
      }

      // Check if the transaction exists
      this.logger.log(`Payment Callback URL orderId =>>${orderId}`);
      const transactionExists = await this.transactionService.findByTransId(orderId);
      if (!transactionExists) {
        this.logger.warn(`Transaction with orderId ${orderId} not found. Cannot update status.`);
        return { message: 'Transaction not found' }; // Handle gracefully
      }

      // Check the payment status using the existing queryTransaction method
      this.logger.log(`Payment Callback Query Transaction with Token =>>${token}`);
      const transactionResponse = await this.queryTransaction(token);
      const paymentStatus = String(transactionResponse.status); // Ensure paymentStatus is a string

      // Handle the case where no transaction data is available
      if (transactionResponse.result === 3) { // Assuming 3 means no transaction data
        this.logger.warn(`No transaction data available for token: ${token}. Updating status to UNKNOWN.`);
        await this.transactionService.updateByTrxn(orderId, {
          paymentServiceCode: '3',
          paymentStatus: 'UNKNOWN',
          paymentServiceMessage: `UNKNOWN error`,
          lastChecked: new Date(),
          metadata: req.body, // Store the full response for reference
          paymentCommentary: `Payment status is unknown for order ID: ${orderId}. Please check the transaction details.`,
        });
        return { message: 'Transaction status updated to UNKNOWN' };
      } else if (transactionResponse.result === 2) { // Transaction declined
        this.logger.error(`Transaction declined for token: ${token}. Result text: ${transactionResponse.resultText}`);
        await this.transactionService.updateByTrxn(orderId, {
          paymentServiceCode: '2',
          paymentStatus: 'DECLINED',
          paymentServiceMessage: `Payment with order-ID: ${orderId} DECLINED`, // Improved message clarity
          lastChecked: new Date(),
          metadata: req.body, // Store the full response for reference
          paymentCommentary: `Payment declined for order-ID: ${orderId}, token: ${token}. Reason: ${transactionResponse.resultText}`
        });
      } else if (transactionResponse.result === 1) { // Transaction successful
        // Update transaction status in the database
        await this.transactionService.updateByTrxn(orderId, {
          paymentServiceCode: '1',
          paymentStatus: 'COMPLETED', // Set status to COMPLETED
          paymentServiceMessage: `SUCCESS`, // Store the payment service message
          lastChecked: new Date(),
          metadata: req.body, // Store the full response for reference
          paymentCommentary: `Transaction payment completed successfully with token: ${token}`
        });
        this.logger.log(`Transaction status updated for order: ${orderId}, new status: COMPLETED`);
        return { message: 'Callback processed successfully' };
      } else {
        this.logger.warn(`Unexpected transaction result: ${transactionResponse.result}`);
      }
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
    const orderId = String(req.body['order-id']); // Ensure orderId is a string
    const token = String(req.body.token); // Ensure token is a string
    const paymentStatus = String(req.body.status); // Ensure paymentStatus is a string
    this.logger.log(`Received post payment status for order: ${orderId}, status: ${paymentStatus}`);
    try {
      // Validate the response (ensure orderId, token, and status are present)
      if (!token || !orderId || !paymentStatus) {
        throw new HttpException('Invalid post data', HttpStatus.BAD_REQUEST);
      }
      // Update transaction status in the database
      await this.transactionService.updateByTrxn(orderId, {
        status: paymentStatus,
        lastChecked: new Date(),
        metadata: req.body, // Store the full response for reference
      });
      this.logger.log(`Transaction status updated for order: ${orderId}, new status: ${paymentStatus}`);
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
        username: paymentData.username || paymentData.phoneNumber, // Default to email if username not provided
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
        firstName: paymentData.firstName || '',
        lastName: paymentData.lastName || '',
        email: paymentData.email,
        transId: ipFormData['order-id'],
        paymentType: 'DEBIT',
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
        transType: paymentData.transType || 'MOMO',
        recipientNumber: ipFormData.phonenumber
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
      const {
        result,
        orderId,
        amount,
        'transaction-id': transactionId,
        'result-text': resultText,
      } = response.data;

      this.logger.debug('Query Transaction response', {
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
        serviceStatus:status,
        paymentTransactionId:transactionId,
        queryLastChecked: new Date(),
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
        result, // Add this line to include result in the return object
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
