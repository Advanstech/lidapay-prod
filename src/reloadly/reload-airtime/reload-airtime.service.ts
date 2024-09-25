import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  FEE_CHARGES,
  RELOADLY_AUDIENCE_SANDBOX,
  RELOADLY_BASEURL,
  RELOADLY_BASEURL_SANDBOX,
  RELOADLY_CLIENT_ID_SANDBOX,
  RELOADLY_CLIENT_SECRET_SANDBOX,
  RELOADLY_GRANT_TYPE_SANDBOX,
  RELOADLY_TOKEN_SANDBOX,
} from '../../constants';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs/operators';
import { ReloadAirtimeDto } from './dto/reload.airtime.dto';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { GeneratorUtil } from 'src/utilities/generator.util';
import { ValidationUtil } from 'src/utilities/validation.util';
import { TransactionService } from 'src/transaction/transaction.service';
import { UpdateTransactionDto } from 'src/transaction/dto/update-transaction.dto';
import { time } from 'console';

@Injectable()
export class ReloadAirtimeService {
  private logger = new Logger(ReloadAirtimeService.name);
  private reloadLyBaseURL = RELOADLY_BASEURL_SANDBOX;
  private accessTokenURL = process.env.RELOADLY_BASEURL || RELOADLY_BASEURL;
  // private accessToken: string;

  constructor(
    private httpService: HttpService,
    private readonly transService: TransactionService,
  ) {}

  public generateAccessToken(): Observable<{ accessToken: string }> {
    const gatPayload = {
      client_id:
        process.env.RELOADLY_CLIENT_ID_SANDBOX || RELOADLY_CLIENT_ID_SANDBOX,
      client_secret:
        process.env.RELOADLY_CLIENT_SECRET_SANDBOX ||
        RELOADLY_CLIENT_SECRET_SANDBOX,
      grant_type:
        process.env.RELOADLY_GRANT_TYPE_SANDBOX || RELOADLY_GRANT_TYPE_SANDBOX,
      audience:
        process.env.RELOADLY_AUDIENCE_SANDBOX || RELOADLY_AUDIENCE_SANDBOX,
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

  public async makeTopUp(airDto: ReloadAirtimeDto): Promise<Observable<any>> {
    // Change return type to Promise<Observable<any>>
    // get access token for authentication
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
    } = airDto;

    // token payload
    const mtPayload: any = {
      operatorId,
      operatorName,
      amount,
      useLocalAmount: false,
      customIdentifier: GeneratorUtil.generateTransactionId(),
      recipientEmail,
      recipientPhone: {
        countryCode: recipientCountryCode,
        number: recipientNumber,
      },
      senderPhone: {
        countryCode: airDto.senderCountryCode,
        number: senderNumber,
      },
    };

    const mtPayloadSave: any = {
      userId: userId,
      userName: userName,
      transType: 'RELOADLY AIRTIME TOPUP',
      retailer: 'RELOADLY',
      network: mtPayload.operatorId,
      operator: mtPayload.operatorName || '',
      trxn: mtPayload.customIdentifier || '',
      transId: mtPayload.customIdentifier,
      fee: FEE_CHARGES || 0,
      originalAmount: amount || '',
      amount: (Number(amount) + Number(FEE_CHARGES)).toString() || '',
      recipientNumber: recipientNumber || '',
      transMessage: `${userName} global topup airtime ${amount} GHS for ${mtPayload.operatorName} to ${recipientNumber}`,
      transStatus: 'pending',
      transCode: '',
      commentary: 'Global airtime topup transaction pending',
      balance_before: '',
      balance_after: '',
      currentBalance: '',
      currency: currency || 'GHS',
      serviceName: 'RELOADLY AIRTIME TOPUP',
      serviceStatus: 'inprogress',
      serviceCode: '',
      serviceTransId: '',
      serviceMessage: '',
      timestamp: ''
    };

    this.transService.create(mtPayloadSave);
    // Access URL
    const mtURL = `https://topups-sandbox.reloadly.com/topups`;

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
        map((mtRes) => {
          this.logger.debug(
            `MAKE TOPUP RESPONSE ++++ ${JSON.stringify(mtRes.data)}`,
          );
          if (mtRes.data.status === 'SUCCESSFUL') {
            this.logger.log(`topup successful`);
            mtPayloadSave.serviceMessage = mtRes.data.message;
            mtPayloadSave.serviceTransId = mtRes.data.transactionId;
            mtPayloadSave.transStatus = mtRes.data.status;
            mtPayloadSave.serviceStatus = mtRes.data.status;
            mtPayloadSave.balance_before = mtRes.data.balanceInfo.oldBalance;
            mtPayloadSave.balance_after = mtRes.data.balanceInfo.newBalance;
            mtPayloadSave.currentBalance = mtRes.data.balanceInfo.newBalance;
            mtPayloadSave.operator = mtRes.data.operatorName;
            mtPayloadSave.network = mtRes.data.operatorId;
            mtPayloadSave.currency = mtRes.data.currencyCode;
            mtPayloadSave.commentary = 'Airtime topup transaction successful';
            this.transService.updateByTrxn(mtPayloadSave.trxn, mtPayloadSave as UpdateTransactionDto);
          }
          //response sample
        //   {
        //     "transactionId": 4602843,
        //     "status": "SUCCESSFUL",
        //     "operatorTransactionId": "7297929551:OrderConfirmed",
        //     "customIdentifier": "This is example identifier 130",
        //     "recipientPhone": 447951631337,
        //     "recipientEmail": null,
        //     "senderPhone": 11231231231,
        //     "countryCode": "GB",
        //     "operatorId": 535,
        //     "operatorName": "EE PIN England",
        //     "discount": 63.37,
        //     "discountCurrencyCode": "NGN",
        //     "requestedAmount": 3168.4,
        //     "requestedAmountCurrencyCode": "NGN",
        //     "deliveredAmount": 4.9985,
        //     "deliveredAmountCurrencyCode": "GBP",
        //     "transactionDate": "2021-12-06 08:13:39",
        //     "fee": 2.99891,
        //     "pinDetail": {
        //         "serial": 558111,
        //         "info1": "DIAL *611",
        //         "info2": "DIAL *611",
        //         "info3": "DIAL *611",
        //         "value": null,
        //         "code": 773709733097662,
        //         "ivr": "1-888-888-8888",
        //         "validity": "30 days"
        //     },
        //     "balanceInfo": {
        //         "oldBalance": 5109.53732,
        //         "newBalance": 2004.50532,
        //         "currencyCode": "NGN",
        //         "currencyName": "Nigerian Naira",
        //         "updatedAt": "2021-12-06 13:13:39"
        //     }
        // }
          return mtRes.data;
        }),
        catchError((mtError) => {
          this.logger.error(
            `ERROR RELOADLY MAKE TOPUP RESPONSE --- ${JSON.stringify(mtError.response?.data)}`,
          );
          const mtErrorMessage = mtError.response?.data || {};
          mtPayloadSave.serviceMessage = mtErrorMessage.message || 'Unknown error';
          mtPayloadSave.transStatus = 'FAILED';
          mtPayloadSave.serviceStatus = 'FAILED';
          mtPayloadSave.serviceCode = mtErrorMessage.errorCode || 'Unknown code';
          mtPayloadSave.timestamp = mtErrorMessage.timeStamp || new Date().toISOString();
          mtPayloadSave.commentary = `Airtime reload failed=> ${mtErrorMessage.message || 'Unknown error'}`;
        
          this.transService.updateByTrxn(mtPayloadSave.trxn, mtPayloadSave as UpdateTransactionDto);

          throw new NotFoundException(mtErrorMessage);
        }),
      );
  }

  public async makeAsynchronousTopUp(
    matDto: ReloadAirtimeDto,
  ): Promise<Observable<any>> {
    // get access token for authentication
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
    } = matDto;

    const matPayload = {
      operatorId,
      operatorName,
      amount,
      useLocalAmount: false,
      customIdentifier:
        GeneratorUtil.generateTransactionId() || customIdentifier,
      recipientEmail,
      recipientPhone: {
        countryCode: recipientCountryCode,
        number: recipientNumber,
      },
      senderPhone: {
        countryCode: matDto.senderCountryCode,
        number: senderNumber,
      },
    };

    const matPayloadSave: any = {
      userId: userId,
      userName: userName,
      transType: 'ASYNC RELOADLY AIRTIME TOPUP',
      retailer: 'RELOADLY',
      network: matPayload.operatorId,
      operator: matPayload.operatorName,
      trxn: matPayload.customIdentifier || '',
      transId: matPayload.customIdentifier,
      fee: FEE_CHARGES || 0,
      originalAmount: amount || '',
      amount: (Number(amount) + Number(FEE_CHARGES)).toString() || '',
      recipientNumber: recipientNumber || '',
      transMessage: `${userName} global topup airtime ${amount} GHS for ${matPayload.operatorName} to ${recipientNumber}`,
      transStatus: 'pending',
      transCode: '',
      commentary: 'Global airtime topup transaction pending',
      currency: currency || 'GHS',
      serviceName: 'RELOADLY AIRTIME TOPUP',
      serviceStatus: 'inprogress',
      serviceCode: '',
      serviceTransId: '',
      serviceMessage: '',
    };

    this.transService.create(matPayloadSave);

    // Access URL
    const matURL = `https://topups-sandbox.reloadly.com/topups-async`;

    // https config
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
        map((matRes) => {
          this.logger.debug(
            `MAKE ASYNC TOP-UP RESPONSE ++++ ${JSON.stringify(matRes.data)}`,
          );
          if (matRes.data.status === 'SUCCESSFUL') {
            this.logger.log(`topup successful`);
            matPayloadSave.serviceMessage = matRes.data.message;
            matPayloadSave.serviceTransId = matRes.data.transactionId;
            matPayloadSave.transStatus = matRes.data.status;
            matPayloadSave.serviceStatus = matRes.data.status;
            matPayloadSave.balance_before = matRes.data.balanceInfo.oldBalance;
            matPayloadSave.balance_after = matRes.data.balanceInfo.newBalance;
            matPayloadSave.commentary = 'Airtime topup transaction successful';
            this.transService.updateByTrxn(matPayloadSave.trxn, matPayloadSave as UpdateTransactionDto);
          }

          return matRes.data;
        }),
        catchError((matError) => {
          this.logger.error(
            `MAKE ASYNC TOP-UP ERROR --- ${JSON.stringify(matError.response?.data)}`,
          );
          const matErrorMessage = matError.response?.data || {};
          matPayloadSave.serviceMessage = matErrorMessage.message || 'Unknown error';
          matPayloadSave.transStatus = 'FAILED';
          matPayloadSave.serviceStatus = 'FAILED';
          matPayloadSave.serviceCode = matErrorMessage.errorCode || 'Unknown code';
          matPayloadSave.timestamp = matErrorMessage.timeStamp || new Date().toISOString();
          matPayloadSave.commentary = `Airtime reload failed: ${matErrorMessage.message || 'Unknown error'}`;

          this.transService.updateByTrxn(matPayloadSave.trxn, matPayloadSave as UpdateTransactionDto);

          // const matErrorMessage = matError.response.data;
          throw new NotFoundException(matErrorMessage);
        }),
      );
  }

  private async reloadlyAccessToken(): Promise<string> {
    const tokenPayload = {
      client_id: RELOADLY_CLIENT_ID_SANDBOX,
      client_secret: RELOADLY_CLIENT_SECRET_SANDBOX,
      grant_type: RELOADLY_GRANT_TYPE_SANDBOX,
      audience: RELOADLY_AUDIENCE_SANDBOX,
    };

    const tokenUrl = `${this.accessTokenURL}/oauth/token`;

    try {
      const response = await this.httpService
        .post(tokenUrl, tokenPayload)
        .toPromise();
      const accessToken = response.data.access_token;
      // this.logger.debug(`Access token generated: ${accessToken}`);
      return accessToken;
    } catch (error) {
      this.logger.error(`Error generating access token: ${error.message}`);
      throw new NotFoundException('Failed to generate access token');
    }
  }
}
