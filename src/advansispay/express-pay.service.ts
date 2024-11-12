// express-pay.service.ts
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { ExpressPayConfig } from './interface/express-pay-config.interface';
import {
  EXPRESSPAY_MERCHANT_ID,
  EXPRESSPAY_API_KEY,
  EXPRESSPAY_BASE_URL,
  EXPRESSPAY_TEST_BASE_URL,
  EXPRESSPAY_REDIRECT_URL,
  EXPRESSPAY_POST_URL,
  FEE_CHARGES,
  EXPRESSPAY_LIVE_MERCHANT_ID,
  EXPRESSPAY_LIVE_API_KEY,
} from 'src/constants';
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
      liveMerchantId: process.env.EXPRESSPAY_LIVE_MERCHANT_ID || EXPRESSPAY_LIVE_MERCHANT_ID,
      apiKey: process.env.EXPRESSPAY_API_KEY || EXPRESSPAY_API_KEY,
      liveApiKey: process.env.EXPRESSPAY_LIVE_API_KEY || EXPRESSPAY_LIVE_API_KEY,
      baseUrl: process.env.EXPRESSPAY_BASE_URL || EXPRESSPAY_BASE_URL,
      testUrl: process.env.EXPRESSPAY_TEST_BASE_URL || EXPRESSPAY_TEST_BASE_URL,
      redirectUrl:
        process.env.EXPRESSPAY_REDIRECT_URL || EXPRESSPAY_REDIRECT_URL,
      postUrl: process.env.EXPRESSPAY_POST_URL || EXPRESSPAY_POST_URL,
    };
  }
  // Payment Callback Url to accept payment response from ExpressPay
  async paymentCallbackURL(req: any) {
    const orderId = req['order-id'] ? String(req['order-id']) : null; // Ensure orderId is a string or null
    const token = req.token ? String(req.token) : null; // Ensure token is a string or null
    this.logger.log(
      `Received payment callback for order: ${orderId}, token: ${token}`,
    );

    try {
      // Validate the response (ensure orderId and token are present)
      if (!token || !orderId) {
        throw new HttpException(
          'Invalid callback data',
          HttpStatus.BAD_REQUEST,
        );
      }
      // Check if the transaction exists
      this.logger.log(`Payment Callback URL orderId =>>${orderId}`);
      const transactionExists =
        await this.transactionService.findByTransId(orderId);
      if (!transactionExists) {
        this.logger.warn(
          `Transaction with orderId ${orderId} not found. Cannot update status.`,
        );
        return { message: 'Transaction not found' }; // Handle gracefully
      }
      // Check the payment status using the existing queryTransaction method
      this.logger.log(
        `Payment Callback Query Transaction with Token =>>${token}`,
      );
      const transactionResponse = await this.queryTransaction(token);
      // const paymentStatus = String(transactionResponse.status);
      // Ensure paymentStatus is a string

      // Handle the case where no transaction data is available
      if (transactionResponse.result === 3) {
        // Assuming 3 means no transaction data
        this.logger.warn(
          `No transaction data available for token: ${token}. Updating status to UNKNOWN.`,
        );
        await this.transactionService.updateByTrxn(orderId, {
          paymentServiceCode: '3',
          paymentStatus: 'UNKNOWN',
          paymentServiceMessage: `UNKNOWN error`,
          lastChecked: new Date(),
          metadata: req.body, // Store the full response for reference
          paymentCommentary: `Payment status is unknown for order ID: ${orderId}. Please check the transaction details.`,
        });
        return { message: 'Transaction status updated to UNKNOWN' };
      } else if (transactionResponse.result === 2) {
        // Transaction declined
        this.logger.error(
          `Transaction declined for token: ${token}. Result text: ${transactionResponse.resultText}`,
        );
        await this.transactionService.updateByTrxn(orderId, {
          paymentServiceCode: '2',
          paymentStatus: 'DECLINED',
          paymentServiceMessage: `Payment with order-ID: ${orderId} DECLINED`, // Improved message clarity
          lastChecked: new Date(),
          metadata: req.body, // Store the full response for reference
          paymentCommentary: `Payment declined for order-ID: ${orderId}, token: ${token}. Reason: ${transactionResponse.resultText}`,
        });
      } else if (transactionResponse.result === 1) {
        // Transaction successful
        // Update transaction status in the database
        await this.transactionService.updateByTrxn(orderId, {
          paymentServiceCode: '1',
          paymentStatus: 'APPROVED', // Set status to COMPLETED
          paymentServiceMessage: `SUCCESS`, // Store the payment service message
          lastChecked: new Date(),
          metadata: req.body, // Store the full response for reference
          paymentCommentary: `Transaction payment completed successfully with token: ${token}`,
        });
        this.logger.log(
          `Transaction status updated for order: ${orderId}, new status: COMPLETED`,
        );
        return { message: 'Callback processed successfully' };
      }  else if (transactionResponse.result === 4) {
        // Transaction is pending
        this.logger.log(
          `Transaction pending for token: ${token}. Waiting for post-url callback.`,
        );
        await this.transactionService.updateByTrxn(orderId, {
          paymentServiceCode: '4',
          paymentStatus: 'PENDING',
          paymentServiceMessage: `Payment processing in progress`,
          lastChecked: new Date(),
          metadata: req.body,
          paymentCommentary: `Transaction pending for order-ID: ${orderId}. Final status will be provided via post-url.`,
        });
        return { message: 'Transaction is pending, waiting for final status' };
      } else {
        this.logger.warn(
          `Unexpected transaction result: ${transactionResponse.result}`,
        );
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
    const result = Number(req.body.result); // Get the result code
    const resultText = String(req.body['result-text']); // Get the result description
    const transactionId = req.body['transaction-id'] || ''; // Get transaction ID if available

    this.logger.log(
      `Received post payment status for order: ${orderId}, result: ${result}, resultText: ${resultText}`,
    );

    try {
      // Validate the response
      if (!token || !orderId || result === undefined) {
        throw new HttpException('Invalid post data', HttpStatus.BAD_REQUEST);
      }

      // Map result codes to status
      let paymentStatus;
      switch (result) {
        case 1:
          paymentStatus = 'APPROVED';
          break;
        case 2:
          paymentStatus = 'DECLINED';
          break;
        case 3:
          paymentStatus = 'ERROR';
          break;
        case 4:
          paymentStatus = 'PENDING';
          break;
        default:
          paymentStatus = 'UNKNOWN';
      }
      // Update transaction status in the database
      await this.transactionService.updateByTrxn(orderId, {
        paymentServiceCode: String(result),
        paymentStatus: paymentStatus,
        paymentServiceMessage: resultText,
        paymentTransactionId: transactionId,
        lastChecked: new Date(),
        metadata: req.body, // Store the full response for reference
        paymentCommentary: `Post-URL update: ${resultText} (Result: ${result})`,
      });

      this.logger.log(
        `Transaction status updated for order: ${orderId}, new status: ${paymentStatus}`,
      );

      return { message: 'Post payment status processed successfully' };
    } catch (error) {
      this.logger.error('Error processing post payment status', {
        error: error.message,
        orderId,
        stack: error.stack,
      });

      // Update transaction with error status
      try {
        await this.transactionService.updateByTrxn(orderId, {
          paymentServiceCode: '500', // Using 500 to indicate system error
          paymentStatus: 'ERROR',
          paymentServiceMessage: 'Error processing post payment status',
          lastChecked: new Date(),
          metadata: {
            ...req.body,
            error: error.message,
            errorTimestamp: new Date(),
          },
          paymentCommentary: `Failed to process post-URL update: ${error.message}`,
        });
      } catch (updateError) {
        // Log if we can't even update the error status
        this.logger.error('Failed to update transaction with error status', {
          error: updateError.message,
          orderId,
          originalError: error.message,
        });
      }

      throw new ExpressPayError('POST_STATUS_PROCESSING_FAILED', error.message);
    }
  }
  // Step 1
  async initiatePayment(paymentData: InitiatePaymentDto) {
    const localTransId = GeneratorUtil.generateOrderId() || 'TNX-';
    this.logger.log(
      `Initiating payment for orderId as localTransId:: ${localTransId}`,
    );
    const ipParamSave: any = {
      userId: paymentData.userId,
      userName: paymentData.userName,
      firstName: paymentData.firstName || '',
      lastName: paymentData.lastName || '',
      email: paymentData.email,
      transId: localTransId,
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
      expressToken: '',
      serviceStatus: 'pending',
      transStatus: 'pending',
      transType: paymentData.transType || 'MOMO',
      recipientNumber: paymentData.phoneNumber,
      timestamp: new Date(),
      queryLastChecked: new Date()
    };

    try {
      const ipFormData: any = {
        'merchant-id': this.config.liveMerchantId,
        'api-key': this.config.liveApiKey,
        firstname: paymentData.firstName,
        lastname: paymentData.lastName,
        email: paymentData.email,
        phonenumber: paymentData.phoneNumber,
        username: paymentData.username || paymentData.phoneNumber,
        accountnumber: paymentData.accountNumber || '',
        currency: 'GHS',
        amount: paymentData.amount.toFixed(2),
        'order-id': localTransId,
        'order-desc': paymentData.orderDesc || '',
        'redirect-url': this.config.redirectUrl,
        'post-url': this.config.postUrl,
        'order-img-url': paymentData.orderImgUrl || '',
      };
      // Log params
      console.log('initiate payment payload  =>>');
      this.logger.debug('Sending payment request to ExpressPay', {
        'order-id': ipFormData,
        amount: ipFormData.amount,
      });

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}/api/submit.php`,
          qr.stringify(ipFormData),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      const { status, token, message } = response.data;
      if (status !== 1) {
        this.logger.error('Payment initiation failed', {
          status,
          orderId: ipFormData['order-id'],
          message,
        });

        const failedTransaction = {
          ...ipParamSave,
          transStatus: 'failed',
          serviceStatus: 'FAILED',
          paymentStatus: 'FAILED',
          paymentServiceCode: status.toString(),
          paymentTransactionId: '',
          paymentServiceMessage: message || 'Payment initiation failed',
          paymentCommentary: `Transaction failed: ${message}`,
          expressToken: '',
          metadata: [{
            result: status,
            'result-text': message,
            'order-id': localTransId,
            token: '',
            currency: 'GHS',
            amount: paymentData.amount.toFixed(2),
            'transaction-id': '',
            'date-processed': new Date().toISOString().replace('T', ' ').slice(0, 19),
            lastQueryAt: new Date().toISOString()
          }],
          timestamp: new Date(),
          queryLastChecked: new Date()
        };
        await this.transactionService.create(failedTransaction);

        throw new ExpressPayError('PAYMENT_INITIATION_FAILED', {
          status,
          message,
        });
      }

      this.logger.log(`Payment initiated successfully. Token: ${token}`);

      // Update ipParamSave with success data
      ipParamSave.expressToken = token;
      ipParamSave.metadata = [{
        result: 1,
        'result-text': 'Pending',
        'order-id': localTransId,
        token: token,
        currency: 'GHS',
        amount: paymentData.amount.toFixed(2),
        'transaction-id': '',
        'date-processed': new Date().toISOString().replace('T', ' ').slice(0, 19),
        lastQueryAt: new Date().toISOString()
      }];

      // persist to Transaction
      await this.transactionService.create(ipParamSave);

      return {
        checkoutUrl: `${this.config.baseUrl}/api/checkout.php?token=${token}`,
        token,
        'order-id': ipParamSave.transId,
      };
    } catch (error) {
      this.logger.error('Payment initiation error', {
        error: error.message,
        'order-id': localTransId,
        stack: error.stack,
      });

      if (!(error instanceof ExpressPayError)) {
        const errorTransaction = {
          ...ipParamSave,
          transId: localTransId,
          transStatus: 'failed',
          serviceStatus: 'FAILED',
          paymentStatus: 'FAILED',
          paymentServiceCode: '500',
          paymentTransactionId: '',
          paymentServiceMessage: 'SYSTEM_ERROR',
          paymentCommentary: `System error occurred: ${error.message}`,
          expressToken: '',
          metadata: [{
            result: 0,
            'result-text': error.message,
            'order-id': localTransId,
            token: '',
            currency: 'GHS',
            amount: paymentData.amount.toFixed(2),
            'transaction-id': '',
            'date-processed': new Date().toISOString().replace('T', ' ').slice(0, 19),
            lastQueryAt: new Date().toISOString()
          }],
          timestamp: new Date(),
          queryLastChecked: new Date()
        };
        await this.transactionService.create(errorTransaction);
      }

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
          `${this.config.baseUrl}/api/query.php`,
          qr.stringify(formData),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
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
        resultText,
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
        serviceStatus: status,
        paymentTransactionId: transactionId,
        queryLastChecked: new Date(),
        metadata: {
          ...response.data,
          lastQueryAt: new Date(),
        },
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
