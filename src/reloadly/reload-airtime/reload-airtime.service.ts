import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  FEE_CHARGES,
  RELOADLY_AUDIENCE,
  RELOADLY_BASEURL,
  RELOADLY_BASEURL_LIVE,
  RELOADLY_CLIENT_ID,
  RELOADLY_CLIENT_SECRET,
  RELOADLY_GRANT_TYPE,
} from '../../constants';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs/operators';
import { ReloadAirtimeDto } from './dto/reload.airtime.dto';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { GeneratorUtil } from 'src/utilities/generator.util';
import { TransactionService } from 'src/transaction/transaction.service';
import { UpdateTransactionDto } from 'src/transaction/dto/update-transaction.dto';
import { firstValueFrom } from 'rxjs';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';

@Injectable()
export class ReloadAirtimeService {
  private logger = new Logger(ReloadAirtimeService.name);
  private reloadLyBaseURL = RELOADLY_BASEURL_LIVE;
  private accessTokenURL = process.env.RELOADLY_BASEURL || RELOADLY_BASEURL;
  // private accessToken: string;

  constructor(
    private httpService: HttpService,
    private readonly transService: TransactionService,
  ) { }

  public generateAccessToken(): Observable<{ accessToken: string }> {
    const gatPayload = {
      client_id:
        process.env.RELOADLY_CLIENT_ID || RELOADLY_CLIENT_ID,
      client_secret:
        process.env.RELOADLY_CLIENT_SECRET ||
        RELOADLY_CLIENT_SECRET,
      grant_type:
        process.env.RELOADLY_GRANT_TYPE || RELOADLY_GRANT_TYPE,
      audience:
        process.env.RELOADLY_AUDIENCE || RELOADLY_AUDIENCE,
    };

    const gatURL = `${this.accessTokenURL}/oauth/token`;

    const configs = {
      url: gatURL,
      body: gatPayload,
    };
    this.logger.log(`Access token http configs == ${JSON.stringify(configs)}`);

    return this.httpService.post(configs.url, configs.body).pipe(
      map((gatRes) => {
        this.logger.debug(
          `ACCESS TOKEN HTTPS RESPONSE ++++ ${JSON.stringify(gatRes.data)}`,
        );
        return { accessToken: gatRes.data.access_token };
      }),
      catchError((gatError) => {
        this.logger.error(
          `ERROR ACCESS TOKEN RESPONSE --- ${JSON.stringify(gatError.response.data)}`,
        );
        throw new NotFoundException(gatError.response.data);
      }),
    );
  }
  // Reloadly Airtime API
  public async makeTopUp(airDto: ReloadAirtimeDto): Promise<Observable<any>> {
    // Get access token for authentication
    let rAccessToken = await this.reloadlyAccessToken(); // Await the Promise
    this.logger.debug(`Reloadly Token::: ${rAccessToken}`);

    const {
      operatorId,
      amount,
      recipientEmail,
      recipientNumber,
      senderNumber,
      recipientCountryCode,
      currency,
      userId,
      userName,
      retailer,
      network,
      operatorName,
      senderCountryCode,
    } = airDto;
    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      this.logger.error(`Invalid amount provided: ${amount}`);
      throw new BadRequestException('Invalid amount provided');
    }
    // Prepare payload for API call
    const mtPayload: any = {
      operatorId,
      operatorName,
      amount: Number(amount), // Ensure amount is a number
      useLocalAmount: false,
      customIdentifier: GeneratorUtil.generateTransactionId(),
      recipientEmail,
      recipientPhone: {
        countryCode: recipientCountryCode,
        number: recipientNumber,
      },
      senderPhone: {
        countryCode: senderCountryCode,
        number: senderNumber,
      },
    };
    this.logger.debug(`make topup payload: ${JSON.stringify(mtPayload)}`);
    // Prepare transaction payload
    const mtPayloadSave: CreateTransactionDto = {
      userId: userId,
      userName: userName,
      transType: 'GLOBAL AIRTIME',
      retailer: 'RELOADLY',
      network: String(operatorId),
      operator: operatorName || '',
      transId: mtPayload.customIdentifier,
      trxn: mtPayload.customIdentifier,
      monetary: {
        amount: Number(amount) + Number(FEE_CHARGES), // Include fee in the amount
        fee: Number(FEE_CHARGES) || 0,
        discount: 0,
        originalAmount: String(Number(amount) || 0),
        currency: currency || 'GHS',
        balance_before: '0',
        balance_after: '0',
        currentBalance: '0',
      },
      status: {
        transaction: 'pending',
        service: 'inprogress',
        payment: '', // Set this based on your logic
      },
      payment: {
        type: 'airtime',
        currency: currency || 'GHS',
        commentary: `${userName} global topup airtime ${amount} GHS for ${operatorName} to ${recipientNumber}`,
        status: 'pending',
        serviceCode: '',
        transactionId: '',
        serviceMessage: '',
      },
      metadata: [{
        initiatedAt: new Date(),
        provider: 'Reloadly',
        username: userName,
        accountNumber: recipientNumber,
        lastQueryAt: new Date(),
      }],
      commentary: 'Global airtime topup transaction pending',
    };
    // Save transaction
    await this.transService.create(mtPayloadSave);
    // Access URL
    const mtURL = `${this.reloadLyBaseURL}/topups`;
    // https config
    const config = {
      url: mtURL,
      body: mtPayload,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/com.reloadly.topups-v1+json',
        Authorization: `Bearer ${rAccessToken}`,
      },
    };

    this.logger.log(`Access token http configs == ${JSON.stringify(config)}`);

    return this.httpService
      .post(config.url, config.body, { headers: config.headers })
      .pipe(
        map(async (mtRes) => {
          // Validate response structure
          if (!mtRes.data || !mtRes.data.status) {
            throw new Error('Invalid response structure from Reloadly API');
          }
          
          // Map Reloadly status to our transaction status
          const reloadlyStatus = mtRes.data.status;
          let transactionStatus = 'pending';
          let serviceStatus = 'inprogress';
          let paymentStatus = 'pending';
          
          if (reloadlyStatus === 'SUCCESSFUL' || reloadlyStatus === 'SUCCESS') {
            transactionStatus = 'SUCCESSFUL';
            serviceStatus = 'completed';
            paymentStatus = 'completed';
          } else if (reloadlyStatus === 'FAILED' || reloadlyStatus === 'FAILURE') {
            transactionStatus = 'FAILED';
            serviceStatus = 'failed';
            paymentStatus = 'failed';
          } else if (reloadlyStatus === 'PENDING' || reloadlyStatus === 'PROCESSING') {
            transactionStatus = 'pending';
            serviceStatus = 'inprogress';
            paymentStatus = 'pending';
          }
          
          // Update transaction status after successful top-up
          mtPayloadSave.status.transaction = transactionStatus;
          mtPayloadSave.status.service = serviceStatus;
          mtPayloadSave.status.payment = paymentStatus;
          
          // Update payment details
          mtPayloadSave.payment.transactionId = mtRes.data.transactionId || '';
          mtPayloadSave.payment.operatorTransactionId = mtRes.data.operatorTransactionId || '';
          mtPayloadSave.payment.serviceMessage = mtRes.data.message || '';
          mtPayloadSave.payment.status = paymentStatus;
          mtPayloadSave.payment.serviceCode = reloadlyStatus;
          
          // Populate monetary details
          mtPayloadSave.monetary = {
            amount: mtRes.data.requestedAmount || Number(amount), // Amount requested
            fee: mtRes.data.fee || 0, // Fee from the response
            discount: mtRes.data.discount || 0, // Update discount from response, default to 0 if not available
            originalAmount: (mtRes.data.requestedAmount || Number(amount)).toString(), // Original amount
            currency: mtRes.data.requestedAmountCurrencyCode || currency || 'GHS', // Currency code
            balance_before: mtRes.data.balanceInfo?.oldBalance?.toString() || '0', // Old balance
            balance_after: mtRes.data.balanceInfo?.newBalance?.toString() || '0', // New balance
            currentBalance: mtRes.data.balanceInfo?.currencyCode || currency || 'GHS', // Current balance
            deliveredAmount: mtRes.data.deliveredAmount || 0, // Amount delivered
            requestedAmount: mtRes.data.requestedAmount || Number(amount) // Amount requested
          };
          
          // Update commentary based on status
          if (transactionStatus === 'SUCCESSFUL') {
            mtPayloadSave.commentary = `Global ${airDto.transType?.toLowerCase() || 'airtime'} topup successful delivered to ${recipientNumber}`;
          } else if (transactionStatus === 'FAILED') {
            mtPayloadSave.commentary = `Global ${airDto.transType?.toLowerCase() || 'airtime'} topup failed: ${mtRes.data.message || 'Unknown error'}`;
          }
          
          // Update the transaction in the database
          try {
            const updateData = {
              status: {
                transaction: transactionStatus,
                service: serviceStatus,
                payment: paymentStatus
              },
              paymentStatus: paymentStatus,
              paymentServiceCode: reloadlyStatus,
              paymentServiceMessage: mtRes.data.message || '',
              paymentTransactionId: mtRes.data.transactionId || '',
              commentary: transactionStatus === 'SUCCESSFUL' 
                ? `Global ${airDto.transType?.toLowerCase() || 'airtime'} topup successful delivered to ${recipientNumber}`
                : transactionStatus === 'FAILED' 
                  ? `Global ${airDto.transType?.toLowerCase() || 'airtime'} topup failed: ${mtRes.data.message || 'Unknown error'}`
                  : 'Global airtime topup transaction pending'
            };
            
            await this.transService.updateByTransId(mtPayloadSave.transId, updateData as UpdateTransactionDto);
            this.logger.debug(`Transaction ${mtPayloadSave.transId} updated successfully with status: ${transactionStatus}`);
          } catch (updateError) {
            this.logger.error(`Failed to update transaction ${mtPayloadSave.transId}: ${updateError.message}`);
          }

          return mtRes.data;
        }),
        catchError(async (mtError) => {
          // Log the full error response for debugging
          this.logger.error(`MAKE ASYNC TOP-UP ERROR --- ${JSON.stringify(mtError.response?.data)}`);
          const matErrorMessage = mtError.response?.data?.message || 'Unknown error';
          const errorCode = mtError.response?.data?.errorCode || 'UNKNOWN_ERROR';
          
          // Update transaction status for failure
          mtPayloadSave.status.transaction = 'FAILED';
          mtPayloadSave.status.service = 'failed';
          mtPayloadSave.status.payment = 'failed';
          
          // Update payment details for failure
          mtPayloadSave.payment.serviceMessage = matErrorMessage;
          mtPayloadSave.payment.serviceCode = errorCode;
          mtPayloadSave.payment.status = 'failed';
          mtPayloadSave.payment.transactionId = mtError.response?.data?.transactionId || '';
          
          // Update commentary
          mtPayloadSave.commentary = `Global ${airDto.transType?.toLowerCase() || 'airtime'} reload failed: ${matErrorMessage}`;
          
          // Update the transaction status in the database
          try {
            const updateData = {
              status: {
                transaction: 'FAILED',
                service: 'failed',
                payment: 'failed'
              },
              paymentStatus: 'failed',
              paymentServiceCode: errorCode,
              paymentServiceMessage: matErrorMessage,
              paymentTransactionId: mtError.response?.data?.transactionId || '',
              commentary: `Global ${airDto.transType?.toLowerCase() || 'airtime'} reload failed: ${matErrorMessage}`
            };
            
            await this.transService.updateByTrxn(mtPayloadSave.trxn, updateData as UpdateTransactionDto);
            this.logger.debug(`Transaction ${mtPayloadSave.trxn} updated with FAILED status`);
          } catch (updateError) {
            this.logger.error(`Failed to update failed transaction ${mtPayloadSave.trxn}: ${updateError.message}`);
          }

          // Throw a more informative error
          throw new NotFoundException(`Asynchronous top-up failed: ${matErrorMessage}`);
        }),
      );
  }
  // Reloadly async topup
  public async makeAsynchronousTopUp(matDto: ReloadAirtimeDto): Promise<Observable<any>> {
    // Get access token for authentication
    let rAccessToken = await this.reloadlyAccessToken();
    this.logger.debug(`Reloadly Token ==> ${rAccessToken}`);

    const {
      operatorId,
      operatorName,
      amount,
      recipientEmail,
      recipientNumber,
      senderNumber,
      recipientCountryCode,
      customIdentifier,
      currency,
      userId,
      userName,
      senderCountryCode
    } = matDto;

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      this.logger.error(`Invalid amount provided: ${amount}`);
      throw new BadRequestException('Invalid amount provided');
    }

    // Prepare the payload for the Reloadly API
    const matPayload = {
      operatorId,
      amount: Number(amount),
      useLocalAmount: false,
      customIdentifier: GeneratorUtil.generateTransactionId() || customIdentifier,
      recipientEmail, // Ensure this is required as per the API
      recipientPhone: {
        countryCode: recipientCountryCode,
        number: recipientNumber,
      },
      senderPhone: {
        countryCode: senderCountryCode,
        number: senderNumber,
      },
      currency: currency || 'GHS',
    };
    console.debug(`reloadly asynchronous topup payload ===> ${JSON.stringify(matPayload)}`);

    // Prepare transaction payload
    const matPayloadSave: CreateTransactionDto = {
      userId,
      userName,
      transType: 'RELOADLY',
      retailer: 'RELOADLY',
      network: String(operatorId),
      operator: operatorName,
      trxn: matPayload.customIdentifier,
      transId: matPayload.customIdentifier,
      monetary: {
        amount: Number(amount) + Number(FEE_CHARGES),
        fee: Number(FEE_CHARGES) || 0,
        discount: 0,
        originalAmount: String(Number(amount) || 0),
        currency: currency || 'GHS',
        balance_before: String(0),
        balance_after: String(0),
        currentBalance: String(0),
      },
      status: {
        transaction: 'pending',
        service: 'inprogress',
        payment: '',
      },
      payment: {
        type: 'airtime',
        currency: currency || 'GHS',
        commentary: `${userName} global topup airtime ${amount} GHS for ${operatorName} to ${recipientNumber}`,
        status: 'pending',
        serviceCode: '',
        transactionId: '',
        serviceMessage: '',
      },
      metadata: [{
        initiatedAt: new Date(),
        provider: 'Reloadly',
        username: userName,
        accountNumber: recipientNumber,
        lastQueryAt: new Date(),
      }],
      commentary: 'Global airtime topup transaction pending',
    };

    // Save transaction
    await this.transService.create(matPayloadSave);

    // Access URL
    const matURL = `${this.reloadLyBaseURL}/topups-async`;
    const config = {
      url: matURL,
      body: matPayload,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/com.reloadly.topups-v1+json',
        Authorization: `Bearer ${rAccessToken}`,
      },
    };
    this.logger.log(`Make Async TopUp configs == ${JSON.stringify(config)}`);

    return this.httpService
      .post(config.url, config.body, { headers: config.headers })
      .pipe(
        map(async (matRes) => {
          // Validate response structure
          if (!matRes.data || !matRes.data.status) {
            throw new Error('Invalid response structure from Reloadly API');
          }
          
          // Map Reloadly status to our transaction status
          const reloadlyStatus = matRes.data.status;
          let transactionStatus = 'pending';
          let serviceStatus = 'inprogress';
          let paymentStatus = 'pending';
          
          if (reloadlyStatus === 'SUCCESSFUL' || reloadlyStatus === 'SUCCESS') {
            transactionStatus = 'SUCCESSFUL';
            serviceStatus = 'completed';
            paymentStatus = 'completed';
          } else if (reloadlyStatus === 'FAILED' || reloadlyStatus === 'FAILURE') {
            transactionStatus = 'FAILED';
            serviceStatus = 'failed';
            paymentStatus = 'failed';
          } else if (reloadlyStatus === 'PENDING' || reloadlyStatus === 'PROCESSING') {
            transactionStatus = 'pending';
            serviceStatus = 'inprogress';
            paymentStatus = 'pending';
          }
          
          // Update transaction status after successful top-up
          matPayloadSave.status.transaction = transactionStatus;
          matPayloadSave.status.service = serviceStatus;
          matPayloadSave.status.payment = paymentStatus;
          
          // Update payment details
          matPayloadSave.payment.transactionId = matRes.data.transactionId || '';
          matPayloadSave.payment.operatorTransactionId = matRes.data.operatorTransactionId || '';
          matPayloadSave.payment.serviceMessage = matRes.data.message || '';
          matPayloadSave.payment.status = paymentStatus;
          matPayloadSave.payment.serviceCode = reloadlyStatus;
          
          // Update commentary based on status
          if (transactionStatus === 'SUCCESSFUL') {
            matPayloadSave.commentary = `Global ${matDto.transType?.toLowerCase() || 'airtime'} topup successful delivered to ${recipientNumber}`;
          } else if (transactionStatus === 'FAILED') {
            matPayloadSave.commentary = `Global ${matDto.transType?.toLowerCase() || 'airtime'} topup failed: ${matRes.data.message || 'Unknown error'}`;
          }

          // Update the transaction in the database
          try {
            const updateData = {
              status: {
                transaction: transactionStatus,
                service: serviceStatus,
                payment: paymentStatus
              },
              paymentStatus: paymentStatus,
              paymentServiceCode: reloadlyStatus,
              paymentServiceMessage: matRes.data.message || '',
              paymentTransactionId: matRes.data.transactionId || '',
              commentary: transactionStatus === 'SUCCESSFUL' 
                ? `Global ${matDto.transType?.toLowerCase() || 'airtime'} topup successful delivered to ${recipientNumber}`
                : transactionStatus === 'FAILED' 
                  ? `Global ${matDto.transType?.toLowerCase() || 'airtime'} topup failed: ${matRes.data.message || 'Unknown error'}`
                  : 'Global airtime topup transaction pending'
            };
            
            await this.transService.updateByTransId(matPayloadSave.transId, updateData as UpdateTransactionDto);
            this.logger.debug(`Async transaction ${matPayloadSave.transId} updated successfully with status: ${transactionStatus}`);
          } catch (updateError) {
            this.logger.error(`Failed to update async transaction ${matPayloadSave.transId}: ${updateError.message}`);
          }

          return matRes.data;
        }),
        catchError(async (matError) => {
          this.logger.error(`MAKE ASYNC TOP-UP ERROR --- ${JSON.stringify(matError)}`);
          const matErrorMessage = matError.response?.data?.message || 'Unknown error';
          const errorCode = matError.response?.data?.errorCode || 'UNKNOWN_ERROR';
          
          // Update transaction status for failure
          matPayloadSave.status.transaction = 'FAILED';
          matPayloadSave.status.service = 'failed';
          matPayloadSave.status.payment = 'failed';
          
          // Update payment details for failure
          matPayloadSave.payment.serviceMessage = matErrorMessage;
          matPayloadSave.payment.serviceCode = errorCode;
          matPayloadSave.payment.status = 'failed';
          matPayloadSave.payment.transactionId = matError.response?.data?.transactionId || '';
          
          // Update commentary
          matPayloadSave.commentary = `Global ${matDto.transType?.toLowerCase() || 'airtime'} reload failed: ${matErrorMessage}`;

          console.debug('matPayload save: ', matPayloadSave.trxn);
          // Update the transaction status in the database
          try {
            const updateData = {
              status: {
                transaction: 'FAILED',
                service: 'failed',
                payment: 'failed'
              },
              paymentStatus: 'failed',
              paymentServiceCode: errorCode,
              paymentServiceMessage: matErrorMessage,
              paymentTransactionId: matError.response?.data?.transactionId || '',
              commentary: `Global ${matDto.transType?.toLowerCase() || 'airtime'} reload failed: ${matErrorMessage}`
            };
            
            await this.transService.updateByTrxn(matPayloadSave.trxn, updateData as UpdateTransactionDto);
            this.logger.debug(`Async transaction ${matPayloadSave.trxn} updated with FAILED status`);
          } catch (updateError) {
            this.logger.error(`Failed to update failed async transaction ${matPayloadSave.trxn}: ${updateError.message}`);
          }

          // Throw a more informative error
          throw new NotFoundException(`Asynchronous top-up failed: ${matErrorMessage}`);
        }),
      );
  }
  // get topup status
  async getTopupStatus(trxnId: string): Promise<any> {
    const accessToken = await this.reloadlyAccessToken();
    // https config
    const config = {
      url: `${this.reloadLyBaseURL}/topups/${trxnId}/status`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/com.reloadly.topups-v1+json',
        Authorization: `Bearer ${accessToken}`,
      },
    };
    this.logger.debug(`TOPUP STATUS CONFIG: ${JSON.stringify(config)}`)
    try {
      const response = await firstValueFrom(
        this.httpService.get(config.url, { headers: config.headers })
          .pipe(
            map(async (gtsRes) => {
              this.logger.debug(
                `RELOADLY AIRTIME TOPUP STATUS --- ${JSON.stringify(gtsRes.data)}`,
              );
              
              // Update transaction status based on Reloadly status
              if (gtsRes.data && gtsRes.data.status) {
                const reloadlyStatus = gtsRes.data.status;
                let transactionStatus = 'pending';
                let serviceStatus = 'inprogress';
                let paymentStatus = 'pending';
                
                if (reloadlyStatus === 'SUCCESSFUL' || reloadlyStatus === 'SUCCESS') {
                  transactionStatus = 'SUCCESSFUL';
                  serviceStatus = 'completed';
                  paymentStatus = 'completed';
                } else if (reloadlyStatus === 'FAILED' || reloadlyStatus === 'FAILURE') {
                  transactionStatus = 'FAILED';
                  serviceStatus = 'failed';
                  paymentStatus = 'failed';
                } else if (reloadlyStatus === 'PENDING' || reloadlyStatus === 'PROCESSING') {
                  transactionStatus = 'pending';
                  serviceStatus = 'inprogress';
                  paymentStatus = 'pending';
                }
                
                // Update transaction in database
                try {
                  const updateData = {
                    status: {
                      transaction: transactionStatus,
                      service: serviceStatus,
                      payment: paymentStatus
                    },
                    paymentStatus: paymentStatus,
                    paymentServiceCode: reloadlyStatus,
                    paymentServiceMessage: gtsRes.data.message || '',
                    paymentTransactionId: gtsRes.data.transactionId || '',
                    commentary: transactionStatus === 'SUCCESSFUL' 
                      ? `Global topup successful delivered` 
                      : transactionStatus === 'FAILED' 
                        ? `Global topup failed: ${gtsRes.data.message || 'Unknown error'}`
                        : 'Global topup transaction pending'
                  };
                  
                  await this.transService.updateByTransId(trxnId, updateData as UpdateTransactionDto);
                  this.logger.debug(`Transaction ${trxnId} status updated to: ${transactionStatus}`);
                } catch (updateError) {
                  this.logger.error(`Failed to update transaction ${trxnId} status: ${updateError.message}`);
                }
              }
              
              return gtsRes.data;
            }),
            catchError(error => {
              this.logger.error(`Error fetching topup status: ${JSON.stringify(error.response?.data)}`);
              throw new NotFoundException(error.response?.data || 'Failed to fetch topup status');
            })
          )
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
  // number lookup via MNP Lookup (POST)
  async numberLookup(accessToken: string, msisdn: string, countryCode: string): Promise<any> {
    const url = `${this.reloadLyBaseURL}/operators/mnp-lookup`;

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/com.reloadly.topups-v1+json',
      Authorization: `Bearer ${accessToken}`,
    };

    const body = {
      phone: msisdn,
      countryCode: countryCode,
    };

    this.logger.debug(`MNP Lookup POST URL: ${url} | Body: ${JSON.stringify(body)}`);

    try {
      const response = await firstValueFrom(this.httpService.post(url, body, { headers }));
      this.logger.debug(`MNP lookup response: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message || 'Lookup failed';
      this.logger.error(`MNP lookup failed for ${msisdn}/${countryCode} | status=${status} | error=${JSON.stringify(error.response?.data || message)}`);
      if (status === 404) {
        throw new NotFoundException('MNP Lookup for given phone number failed');
      }
      throw new NotFoundException(`Failed to lookup number: ${message}`);
    }
  }
  // access token
  private async reloadlyAccessToken(): Promise<string> {
    const tokenPayload = {
      client_id: RELOADLY_CLIENT_ID,
      client_secret: RELOADLY_CLIENT_SECRET,
      grant_type: RELOADLY_GRANT_TYPE,
      audience: RELOADLY_AUDIENCE,
    };
    const tokenUrl = `${this.accessTokenURL}/oauth/token`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, tokenPayload)
      );
      const accessToken = response.data.access_token;
      // this.logger.debug(`Access token generated: ${accessToken}`);
      return accessToken;
    } catch (error) {
      this.logger.error(`Error generating access token: ${error.message}`);
      throw new NotFoundException('Failed to generate access token');
    }
  }
}
