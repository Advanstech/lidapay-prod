// express-pay.service.ts
import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import * as qr from 'querystring';
import { PaymentCallbackDto } from './dto/callback.dto';
import { UpdateTransactionDto } from 'src/transaction/dto/update-transaction.dto';
import { UserService } from 'src/user/user.service';
import { PaymentCallbackResult } from './interface/payment-callback-result.interface';

@Injectable()
export class ExpressPayService {
  private readonly logger = new Logger(ExpressPayService.name);
  private readonly config: ExpressPayConfig;

  constructor(
    private readonly httpService: HttpService,
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
  ) {
    this.config = {
      merchantId: process.env.EXPRESSPAY_MERCHANT_ID || EXPRESSPAY_MERCHANT_ID,
      liveMerchantId:
        process.env.EXPRESSPAY_LIVE_MERCHANT_ID || EXPRESSPAY_LIVE_MERCHANT_ID,
      apiKey: process.env.EXPRESSPAY_API_KEY || EXPRESSPAY_API_KEY,
      liveApiKey:
        process.env.EXPRESSPAY_LIVE_API_KEY || EXPRESSPAY_LIVE_API_KEY,
      baseUrl: process.env.EXPRESSPAY_BASE_URL || EXPRESSPAY_BASE_URL,
      testUrl: process.env.EXPRESSPAY_TEST_BASE_URL || EXPRESSPAY_TEST_BASE_URL,
      redirectUrl:
        process.env.EXPRESSPAY_REDIRECT_URL || EXPRESSPAY_REDIRECT_URL,
      postUrl: process.env.EXPRESSPAY_POST_URL || EXPRESSPAY_POST_URL,
    };
  }
  // Payment Callback URL handler
  async paymentCallbackURL(req: any): Promise<PaymentCallbackResult> {
    const orderId = req['order-id'] ? String(req['order-id']) : null;
    const token = req.token ? String(req.token) : null;

    this.logger.log(
      `Received payment callback for order: ${orderId}, token: ${token}`,
      {
        body: req.body,
        params: req.params,
        query: req.query,
      },
    );

    try {
      if (!token || !orderId) {
        throw new HttpException(
          'Invalid callback data',
          HttpStatus.BAD_REQUEST,
        );
      }
      const transaction = await this.transactionService.findByTransId(orderId);
      if (!transaction) {
        this.logger.warn(`Transaction not found: ${orderId}`);
        return {
          success: false,
          message: 'Transaction not found',
          redirectUrl: `lidapay://redirect-url?orderId=${orderId}&token=${token}&status=not_found`,
        };
      }
      const queryResponse = await this.queryTransaction(token);
      const updateData: UpdateTransactionDto = this.mapCallbackStatusUpdate(
        queryResponse,
        orderId,
        req.body,
      );
      // Update transaction status based on query response
      this.updateTransactionStatus(updateData, queryResponse, orderId);
      // Add metadata
      updateData.metadata = this.buildMetadata(
        queryResponse,
        orderId,
        token,
        req.body,
      );
      // Update transaction
      await this.transactionService.updateByTrxn(orderId, updateData);
      // Redirect to the Lidapay app using deep linking
      // Enhanced redirect URL with more status information
      const redirectUrl = `lidapay://redirect-url?
      orderId=${orderId}
      &token=${token}
      &status=${updateData.status.service}
      &timestamp=${Date.now()}`;

      return { success: true, redirectUrl };
    } catch (error) {
      // Redirect with error status
      const redirectUrl = `lidapay://redirect-url?
       orderId=${orderId}
       &token=${token}
       &status=error
       &errorMessage=${encodeURIComponent(error.message)}`;

      // Log the error and update the transaction status
      this.handleErrorDuringCallback(error, orderId, token, req.body);

      return {
        success: false,
        message: error.message,
        redirectUrl,
      }; // Ensure a return value in case of error
    }
  }
  // Post Payment Status Handler
  async handlePostPaymentStatus(postData: PaymentCallbackDto) {
    const orderId = postData['order-id'] || postData.orderId || null;
    const token = postData.token;
    const result =
      postData.result !== undefined ? Number(postData.result) : null;
    const resultText = postData['result-text'] || '';
    const transactionId = postData['transaction-id'] || '';
    // const amount = postData.amount;
    // const currency = postData.currency || 'GHS';

    this.logger.log('Received post payment status', {
      orderId,
      token,
      result,
      resultText,
      transactionId,
    });

    try {
      if (!token || !orderId) {
        this.logger.error('Invalid post data', { orderId, token, result });
        throw new HttpException('Invalid post data', HttpStatus.BAD_REQUEST);
      }

      const updateData: UpdateTransactionDto = this.buildPostPaymentUpdateData(
        postData,
        orderId,
        token,
      );
      // Attempt to update the transaction
      await this.transactionService.updateByTransId(orderId, updateData);

      this.logger.log(`Transaction status updated`, {
        orderId,
        status: updateData.status.service,
        result,
      });

      return {
        success: true,
        message: 'Post payment status processed successfully',
        status: updateData.status.service,
        orderId,
        token,
      };
    } catch (error) {
      // Handle specific error for transaction not found
      if (error instanceof NotFoundException) {
        this.logger.warn(`Transaction not found: ${orderId}`);
        return {
          success: false,
          message: `Transaction with ID ${orderId} not found`,
          orderId,
          token,
        };
      }
      // Handle other errors
      await this.handleErrorDuringPostStatus(error, orderId, token, postData);
    }
  }
  // Payment Initiation
  async initiatePayment(paymentData: InitiatePaymentDto) {
    this.logger.log('=== EXPRESSPAY SERVICE INITIATE PAYMENT START ===');
    this.logger.log(`Received payment data: ${JSON.stringify(paymentData, null, 2)}`);
    this.logger.log(`userId in service: "${paymentData.userId}"`);
    this.logger.log(`userId type in service: ${typeof paymentData.userId}`);
    
    const localTransId = GeneratorUtil.generateOrderId() || 'TNX-';
    this.logger.log(`Generated transaction ID: ${localTransId}`);
    
    this.logger.log(`Attempting to get user account number for userId: "${paymentData.userId}"`);
    const accountNumber = await this.getUserAccountNumber(paymentData.userId);
    this.logger.log(`Initiating payment for orderId: ${localTransId}`);
    this.logger.log(`User Account Number: ${accountNumber}`);

    const initialTransaction = this.buildInitialTransaction(
      paymentData,
      localTransId,
    );

    try {
      const ipFormData = await this.buildIpFormData(
        localTransId,
        paymentData,
        accountNumber,
      );
      console.debug(
        `initiate payment ipFormData: ${JSON.stringify(ipFormData)}`,
      );
      this.logger.debug('Sending payment request to ExpressPay', {
        'order-id': localTransId,
        amount: ipFormData.amount,
      });

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.config.baseUrl}/api/submit.php`,
          qr.stringify(ipFormData),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      );
      this.logger.verbose(
        `Initiate payment URL: ${this.config.baseUrl}/api/submit.php && headers => Content-Type': 'application/x-www-form-urlencoded'`,
      );
      const { status, token, message } = response.data;

      if (status !== 1) {
        await this.handleFailedTransaction(initialTransaction, status, message);
      }
      // Success case
      await this.handleSuccessfulTransaction(initialTransaction, token);

      return {
        checkoutUrl: `${this.config.baseUrl}/api/checkout.php?token=${token}`,
        token,
        'order-id': localTransId,
      };
    } catch (error) {
      // Use the private handler for error processing
      await this.handleErrorDuringPaymentInitiation(error, initialTransaction);
    }
  }
  async queryTransaction(token: string) {
    this.logger.log(`Querying transaction status for token: ${token}`);

    try {
      const formData = {
        'merchant-id': this.config.liveMerchantId,
        'api-key': this.config.liveApiKey,
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

      this.logger.verbose(
        `Query Transaction URL: ${this.config.baseUrl}/api/query.php && headers => Content-Type': 'application/x-www-form-urlencoded'`,
      );

      // Destructure the response data
      const {
        result,
        'result-text': resultText,
        'order-id': orderId,
        'transaction-id': transactionId,
        currency,
        amount,
        'date-processed': dateProcessed,
      } = response.data;

      // Log the full response for debugging
      this.logger.debug('API Response:', response.data);

      // Check if the result indicates success
      if (result === 1) {
        this.logger.debug('Transaction found, updating database', {
          token,
          orderId,
          transactionId,
          amount,
          resultText,
        });

        // Build the update data using the new method
        const updateData: UpdateTransactionDto =
          this.buildQueryTransactionUpdateData(
            result,
            resultText,
            orderId,
            transactionId,
            currency,
            amount,
            dateProcessed,
            token, // Pass the token to include in metadata
          );

        // Use the expressToken from the response to update the transaction
        const expressToken = response.data.token; // Assuming the token is in the original response

        // Update the transaction in the database
        await this.transactionService.updateByTokenOrExpressToken(
          expressToken,
          updateData,
        );

        return {
          status: updateData.status.service,
          orderId,
          transactionId,
          amount,
          resultText,
          originalResponse: response.data,
          result,
        };
      } else {
        this.logger.warn(
          `Transaction not found for token: ${token}. API Response: ${JSON.stringify(response.data)}`,
        );
        throw new NotFoundException(
          `Transaction not found for token: ${token}`,
        );
      }
    } catch (error) {
      this.logger.error('Transaction query error', {
        error: error.message,
        token,
        stack: error.stack,
      });

      // Persist the error in the transaction record
      if (token) {
        try {
          const errorUpdate: UpdateTransactionDto = {
            status: {
              service: 'ERROR',
              payment: 'ERROR',
              transaction: 'failed',
            },
            payment: {
              serviceCode: '500',
              transactionId: '',
              serviceMessage: 'Query transaction failed',
              commentary: `Error querying transaction: ${error.message}`,
            },
            metadata: [
              {
                result: 0,
                'result-text': error.message,
                'order-id': token, // Assuming token is the order ID
                token,
                'transaction-id': '',
                amount: '0',
                currency: 'GHS',
                'date-processed': new Date().toISOString(),
                lastQueryAt: new Date().toISOString(),
              },
            ],
            queryLastChecked: new Date(),
          };

          await this.transactionService.updateByTokenOrExpressToken(
            token,
            errorUpdate,
          );
        } catch (updateError) {
          this.logger.error('Failed to update transaction with error status', {
            error: updateError.message,
            token,
            originalError: error.message,
          });
        }
      }

      throw new ExpressPayError('QUERY_FAILED', error.message);
    }
  } // Query Transaction Status

  // Helper Methods
  private updateTransactionStatus(
    updateData: UpdateTransactionDto,
    queryResponse: any,
    orderId: string,
  ) {
    switch (queryResponse.result) {
      case 1: // Success
        this.logger.log(`Payment successful for order: ${orderId}`);
        updateData.status = {
          service: 'COMPLETED',
          payment: 'APPROVED',
          transaction: 'completed',
        };
        updateData.payment = {
          serviceCode: '1',
          transactionId: queryResponse.transactionId,
          serviceMessage: 'SUCCESS',
          commentary: `Payment completed successfully for order-ID: ${orderId}`,
        };
        break;

      case 2: // Declined
        this.logger.warn(`Payment declined for order: ${orderId}`);
        updateData.status = {
          service: 'DECLINED',
          payment: 'DECLINED',
          transaction: 'failed',
        };
        updateData.payment = {
          serviceCode: '2',
          transactionId: queryResponse.transactionId,
          serviceMessage: 'DECLINED',
          commentary: `Payment declined for order-ID: ${orderId}. Reason: ${queryResponse.resultText}`,
        };
        break;

      case 3: // Error
        this.logger.error(`Payment error for order: ${orderId}`);
        updateData.status = {
          service: 'ERROR',
          payment: 'ERROR',
          transaction: 'failed',
        };
        updateData.payment = {
          serviceCode: '3',
          transactionId: queryResponse.transactionId,
          serviceMessage: 'ERROR',
          commentary: `Payment error for order-ID: ${orderId}. Reason: ${queryResponse.resultText}`,
        };
        break;

      case 4: // Pending
        this.logger.log(`Payment pending for order: ${orderId}`);
        updateData.status = {
          service: 'PENDING',
          payment: 'PENDING',
          transaction: 'pending',
        };
        updateData.payment = {
          serviceCode: '4',
          transactionId: queryResponse.transactionId,
          serviceMessage: 'PENDING',
          commentary: `Transaction pending for order-ID: ${orderId}. Final status will be provided via post-url`,
        };
        break;

      default:
        this.logger.warn(`Unexpected status for order: ${orderId}`);
        updateData.status = {
          service: 'UNKNOWN',
          payment: 'UNKNOWN',
          transaction: 'failed',
        };
        updateData.payment = {
          serviceCode: '0',
          transactionId: queryResponse.transactionId,
          serviceMessage: 'UNKNOWN',
          commentary: `Unknown payment status for order-ID: ${orderId}. Please check transaction details`,
        };
    }
  }

  private buildMetadata(
    queryResponse: any,
    orderId: string,
    token: string,
    callbackData: any,
  ) {
    return [
      {
        result: queryResponse.result,
        'result-text': queryResponse.resultText,
        'order-id': orderId,
        token,
        'transaction-id': queryResponse.transactionId,
        amount: queryResponse.amount,
        currency: callbackData.currency || 'GHS',
        'date-processed': new Date().toISOString(),
        lastQueryAt: new Date().toISOString(),
        callbackData,
      },
    ];
  }

  private async handleErrorDuringCallback(
    error: any,
    orderId: string,
    token: string,
    callbackData: any,
  ) {
    this.logger.error('Payment callback processing failed', {
      error: error.message,
      orderId,
      token,
      stack: error.stack,
    });

    if (orderId) {
      try {
        const errorUpdate: UpdateTransactionDto = {
          status: {
            service: 'ERROR',
            payment: 'ERROR',
            transaction: 'failed',
          },
          payment: {
            serviceCode: '500',
            transactionId: '',
            serviceMessage: 'Callback processing failed',
            commentary: `Error processing callback: ${error.message}`,
          },
          metadata: [
            {
              result: 0,
              'result-text': error.message,
              'order-id': orderId,
              token,
              lastQueryAt: new Date().toISOString(),
              error: true,
              errorDetails: error.message,
            },
          ],
          queryLastChecked: new Date(),
        };

        await this.transactionService.updateByTrxn(orderId, errorUpdate);
      } catch (updateError) {
        this.logger.error('Failed to update transaction with error status', {
          error: updateError.message,
          orderId,
          originalError: error.message,
        });
      }
    }

    throw new ExpressPayError('CALLBACK_PROCESSING_FAILED', error.message);
  }

  private buildPostPaymentUpdateData(
    postData: PaymentCallbackDto,
    orderId: string,
    token: string,
  ): UpdateTransactionDto {
    const result =
      postData.result !== undefined ? Number(postData.result) : null;
    const resultText = postData['result-text'] || '';
    const transactionId = postData['transaction-id'] || '';

    return {
      status: {
        service: this.mapServiceStatus(result),
        payment: this.mapServiceStatus(result),
        transaction: this.mapTransactionStatus(this.mapServiceStatus(result)),
      },
      payment: {
        serviceCode: String(result),
        transactionId: transactionId,
        serviceMessage: resultText,
        commentary: this.generatePostUrlCommentary(result, orderId, resultText),
      },
      queryLastChecked: new Date(),
      metadata: [
        {
          result,
          'result-text': resultText,
          'order-id': orderId,
          token,
          'transaction-id': transactionId,
          amount: postData.amount,
          currency: postData.currency || 'GHS',
          'date-processed': new Date().toISOString(),
          lastQueryAt: new Date().toISOString(),
          postUrlData: postData,
        },
      ],
    };
  }
  // handle error post status
  private async handleErrorDuringPostStatus(
    error: any,
    orderId: string,
    token: string,
    postData: PaymentCallbackDto,
  ) {
    this.logger.error('Post payment status processing failed', {
      error: error.message,
      orderId,
      token,
      stack: error.stack,
    });

    if (orderId) {
      try {
        const errorUpdate = {
          status: {
            service: 'ERROR',
            payment: 'ERROR',
            transaction: 'failed',
          },
          payment: {
            serviceCode: '500',
            transactionId: '',
            serviceMessage: 'Post-URL processing failed',
            commentary: `Error processing post-URL update: ${error.message}`,
          },
          metadata: [
            {
              result: 0,
              'result-text': error.message,
              'order-id': orderId,
              token,
              'transaction-id': postData['transaction-id'],
              lastQueryAt: new Date().toISOString(),
              error: true,
              errorDetails: error.message,
              originalPostData: postData,
            },
          ],
          queryLastChecked: new Date(),
        };

        await this.transactionService.updateByTransId(orderId, errorUpdate);
      } catch (updateError) {
        this.logger.error('Failed to update transaction with error status', {
          error: updateError.message,
          orderId,
          originalError: error.message,
        });
      }
    }

    throw new ExpressPayError('POST_STATUS_PROCESSING_FAILED', error.message);
  }

  private buildInitialTransaction(
    paymentData: InitiatePaymentDto,
    localTransId: string,
  ) {
    return {
      userId: paymentData.userId,
      userName: paymentData.userName,
      firstName: paymentData.firstName || '',
      lastName: paymentData.lastName || '',
      email: paymentData.email,
      transId: localTransId,
      recipientNumber: paymentData.phoneNumber,
      retailer: 'EXPRESSPAY',
      expressToken: '',
      transType: paymentData.transType || 'MOMO',
      customerMsisdn: paymentData.phoneNumber,
      walletOperator: '',
      payTransRef: paymentData.payTransRef || '',
      status: {
        transaction: 'pending',
        service: 'pending',
        payment: 'pending',
      },
      monetary: {
        amount: Number(paymentData.amount) + Number(FEE_CHARGES),
        fee: FEE_CHARGES || 0,
        originalAmount: paymentData.amount.toString(),
        currency: 'GHS',
      },
      payment: {
        type: 'DEBIT',
        currency: 'GHS',
        serviceCode: '',
        transactionId: '',
        serviceMessage: '',
        commentary: '',
      },
      metadata: [
        {
          result: 0,
          'result-text': 'Initiated',
          'order-id': localTransId,
          token: '',
          currency: 'GHS',
          amount: paymentData.amount.toFixed(2),
          'transaction-id': '',
          'date-processed': new Date()
            .toISOString()
            .replace('T', ' ')
            .slice(0, 19),
          lastQueryAt: new Date().toISOString(),
        },
      ],
      timestamp: new Date(),
      queryLastChecked: new Date(),
    };
  }
  // user account number
  private async getUserAccountNumber(userId: string): Promise<string | null> {
    this.logger.log(`=== GET USER ACCOUNT NUMBER START ===`);
    this.logger.log(`Looking up user with userId: "${userId}"`);
    this.logger.log(`userId type: ${typeof userId}`);
    this.logger.log(`userId is null: ${userId === null}`);
    this.logger.log(`userId is undefined: ${userId === undefined}`);
    
    if (!userId || userId.trim() === '') {
      this.logger.error('User ID is required but not provided to getUserAccountNumber');
      throw new Error('User ID is required');
    }
    
    try {
      const user = await this.userService.findOneById(userId);
      this.logger.log(`User found: ${user ? 'Yes' : 'No'}`);
      
      if (user) {
        this.logger.log(`User account: ${user.account}`);
        this.logger.log(`User account type: ${typeof user.account}`);
      }
      
      if (user && user.account) {
        const account = await this.userService.getAccountById(
          user.account.toString(),
        ); // Use the userService to get the account
        this.logger.log(`Account found: ${account ? 'Yes' : 'No'}`);
        this.logger.log(`Account ID: ${account ? account.accountId : 'N/A'}`);
        return account ? account.accountId : null; // Return the accountId
      }
      
      this.logger.warn('User or account not found');
      return null;
    } catch (error) {
      this.logger.error(`Error in getUserAccountNumber: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    } finally {
      this.logger.log(`=== GET USER ACCOUNT NUMBER END ===`);
    }
  }
  // Build initiatePayment Form data
  private async buildIpFormData(
    localTransId: string,
    paymentData: InitiatePaymentDto,
    accountNumber: string,
  ) {
    return {
      'merchant-id': this.config.liveMerchantId,
      'api-key': this.config.liveApiKey,
      firstname: paymentData.firstName,
      lastname: paymentData.lastName,
      email: paymentData.email,
      phonenumber: paymentData.phoneNumber,
      username: paymentData.username || paymentData.phoneNumber,
      accountnumber: accountNumber, // Now guaranteed to be valid
      currency: 'GHS',
      amount: paymentData.amount.toFixed(2),
      'order-id': localTransId,
      'order-desc': paymentData.orderDesc || '',
      'redirect-url': this.config.redirectUrl,
      'post-url': this.config.postUrl,
      'order-img-url': paymentData.orderImgUrl || '',
    };
  }
  // Private error handling method
  private async handleErrorDuringPaymentInitiation(
    error: any,
    initialTransaction: any,
  ) {
    this.logger.error('Payment initiation failed', {
      error: error.message,
      transaction: initialTransaction,
      stack: error.stack,
    });

    if (!(error instanceof ExpressPayError)) {
      // Persist the error transaction
      const errorTransaction = {
        ...initialTransaction,
        status: {
          transaction: 'failed',
          service: 'FAILED',
          payment: 'FAILED',
        },
        payment: {
          ...initialTransaction.payment,
          serviceCode: '500',
          serviceMessage: 'SYSTEM_ERROR',
          commentary: `System error occurred: ${error.message}`,
        },
        metadata: [
          {
            initiatedAt: new Date(),
            provider: 'EXPRESSPAY',
            username:
              initialTransaction.userName || initialTransaction.recipientNumber,
            accountNumber: initialTransaction.payTransRef || '',
            lastQueryAt: new Date(),
          },
        ],
        queryLastChecked: new Date(),
      };
      await this.transactionService.create(errorTransaction);
    }

    if (error instanceof ExpressPayError) {
      throw error;
    }
    throw new ExpressPayError('SYSTEM_ERROR', error.message);
  }

  private async handleFailedTransaction(
    initialTransaction: any,
    status: number,
    message: string,
  ) {
    const failedTransaction = {
      ...initialTransaction,
      status: {
        transaction: 'failed',
        service: 'FAILED',
        payment: 'FAILED',
      },
      payment: {
        ...initialTransaction.payment,
        serviceCode: status.toString(),
        serviceMessage: message || 'Payment initiation failed',
        commentary: `Transaction failed: ${message}`,
      },
      metadata: [
        {
          initiatedAt: new Date(),
          provider: 'EXPRESSPAY',
          username:
            initialTransaction.userName || initialTransaction.phoneNumber,
          accountNumber: initialTransaction.accountNumber || '',
          lastQueryAt: new Date(),
        },
      ],
      queryLastChecked: new Date(),
    };

    await this.transactionService.create(failedTransaction);
    throw new ExpressPayError('PAYMENT_INITIATION_FAILED', { status, message });
  }

  private async handleSuccessfulTransaction(
    initialTransaction: any,
    token: string,
  ) {
    const successTransaction = {
      ...initialTransaction,
      expressToken: token,
      metadata: [
        {
          initiatedAt: new Date(),
          provider: 'EXPRESSPAY',
          username:
            initialTransaction.userName || initialTransaction.phoneNumber,
          accountNumber: initialTransaction.accountNumber || '',
          token: token,
          result: 1,
          'result-text': 'Pending',
          lastQueryAt: new Date(),
        },
      ],
    };

    await this.transactionService.create(successTransaction);
  }

  private buildQueryTransactionUpdateData(
    result: number,
    resultText: string,
    orderId: string,
    transactionId: string,
    currency: string,
    amount: number,
    dateProcessed: string,
    token: string, // Added token as a parameter
  ): UpdateTransactionDto {
    // Validate parameters
    if (!orderId || !transactionId || !currency || !dateProcessed) {
      throw new Error(
        'Invalid parameters provided to buildQueryTransactionUpdateData',
      );
    }

    return {
      status: {
        service: this.mapServiceStatus(result),
        payment: this.mapServiceStatus(result),
        transaction: this.mapTransactionStatus(this.mapServiceStatus(result)),
      },
      payment: {
        serviceCode: result.toString(),
        transactionId: transactionId,
        serviceMessage: resultText,
        commentary: this.generateCommentary(
          this.mapServiceStatus(result),
          orderId,
          resultText,
        ),
      },
      queryLastChecked: new Date(),
      metadata: [
        {
          result,
          'result-text': resultText,
          'order-id': orderId,
          token, // Use the token passed as a parameter
          'transaction-id': transactionId,
          currency,
          amount,
          'date-processed': dateProcessed,
          lastQueryAt: new Date().toISOString(),
        },
      ],
    };
  }

  private mapServiceStatus(result: number): string {
    const statusMap = {
      1: 'COMPLETED', // Approved
      2: 'DECLINED', // Declined
      3: 'ERROR', // Error in transaction data or system error
      4: 'PENDING', // Pending (Final status will be provided via post-url)
    };
    return statusMap[result] || 'UNKNOWN';
  }

  private mapTransactionStatus(serviceStatus: string): string {
    const statusMap = {
      COMPLETED: 'completed',
      DECLINED: 'failed',
      ERROR: 'failed',
      PENDING: 'pending',
      UNKNOWN: 'failed',
    };
    return statusMap[serviceStatus] || 'failed';
  }

  private generateCommentary(
    status: string,
    orderId: string,
    resultText: string,
  ): string {
    const commentaryMap = {
      COMPLETED: `Payment completed successfully for order-ID: ${orderId}`,
      DECLINED: `Payment declined for order-ID: ${orderId}. Reason: ${resultText}`,
      ERROR: `Payment error for order-ID: ${orderId}. Reason: ${resultText}`,
      PENDING: `Transaction pending for order-ID: ${orderId}. Final status will be provided via post-url`,
      UNKNOWN: `Unknown payment status for order-ID: ${orderId}. Please check transaction details`,
    };
    return (
      commentaryMap[status] || `Unexpected status for order-ID: ${orderId}`
    );
  }

  private generatePostUrlCommentary(
    result: number,
    orderId: string,
    resultText: string,
  ): string {
    const commentaryMap = {
      1: `Payment confirmed via post-URL for order-ID: ${orderId}`,
      2: `Payment declined via post-URL for order-ID: ${orderId}. Reason: ${resultText}`,
      3: `Payment error reported via post-URL for order-ID: ${orderId}. Details: ${resultText}`,
      4: `Payment still pending via post-URL for order-ID: ${orderId}`,
    };

    return (
      commentaryMap[result] ||
      `Unexpected post-URL status (${result}) for order-ID: ${orderId}. Details: ${resultText}`
    );
  }

  // New method to map callback status update
  private mapCallbackStatusUpdate(
    queryResponse: any,
    orderId: string,
    callbackData: any,
  ): UpdateTransactionDto {
    return {
      status: {
        service: this.mapServiceStatus(queryResponse.result),
        payment: this.mapServiceStatus(queryResponse.result),
        transaction: this.mapTransactionStatus(
          this.mapServiceStatus(queryResponse.result),
        ),
      },
      payment: {
        serviceCode: queryResponse.result.toString(),
        transactionId: queryResponse['transaction-id'] || '',
        serviceMessage: queryResponse['result-text'] || '',
        commentary: this.generateCommentary(
          this.mapServiceStatus(queryResponse.result),
          orderId,
          queryResponse['result-text'],
        ),
      },
      queryLastChecked: new Date(),
      metadata: [
        {
          result: queryResponse.result,
          'result-text': queryResponse['result-text'],
          'order-id': orderId,
          token: '',
          'transaction-id': queryResponse['transaction-id'] || '',
          amount: queryResponse.amount,
          currency: callbackData.currency || 'GHS',
          'date-processed': new Date().toISOString(),
          lastQueryAt: new Date().toISOString(),
          postUrlData: callbackData,
        },
      ],
    };
  }
}
