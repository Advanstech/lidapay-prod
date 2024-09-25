import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Observable, from, switchMap } from 'rxjs';
import { AxiosResponse } from 'axios';
import { catchError, map } from 'rxjs/operators';
import * as https from 'https';
import {
  FEE_CHARGES,
  ONE4ALL_APIKEY,
  ONE4ALL_APISECRET,
  ONE4ALL_BASEURL,
  ONE4ALL_RETAILER,
} from 'src/constants';
import { TransStatusDto } from './dto/transtatus.dto';
import { TopupDto } from './dto/topup.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { GeneratorUtil } from 'src/utilities/generator.util';
import { UpdateTransactionDto } from 'src/transaction/dto/update-transaction.dto';

@Injectable()
export class AirtimeService {
  private logger = new Logger(AirtimeService.name);
  private AirBaseUrl = process.env.ONE4ALL_BASEURL || ONE4ALL_BASEURL;
  private ONE4ALL_RETAILER = process.env.ONE4ALL_RETAILER || ONE4ALL_RETAILER;
  private ONE4ALL_APIKEY = process.env.ONE4ALL_APIKEY || ONE4ALL_APIKEY;
  private ONE4ALL_APISECRET = process.env.ONE4ALL_APISECRET || ONE4ALL_APISECRET;
  private ONE4ALL_BASEURL = process.env.ONE4ALL_BASEURL || ONE4ALL_BASEURL;

  constructor(
    private readonly httpService: HttpService,
    private readonly transService: TransactionService,
  ) { }

  // Get operator name based on network code e.g:
  private getOperatorName(networkCode: number): string {
    const operators: Record<number, string> = {
      0: 'Unknown (auto detect network)',
      1: 'AirtelTigo',
      2: 'EXPRESSO',
      3: 'GLO',
      4: 'MTN',
      5: 'TiGO',
      6: 'Telecel',
      8: 'Busy',
      9: 'Surfline'
    };
    return operators[networkCode] || 'Unknown';
  }

  transactionStatus(
    transDto: TransStatusDto,
  ): Observable<AxiosResponse<TransStatusDto>> {
    const { transReference } = transDto;

    const payload = {
      trnx: transReference || '',
    };

    // https://tppgh.myone4all.com/api/TopUpApi/transactionStatus?trnx=1KNRUW111021
    const tsUrl =
      this.AirBaseUrl + `/TopUpApi/transactionStatus?trnx=${payload.trnx}`;

    const configs = {
      url: tsUrl,
      headers: { ApiKey: ONE4ALL_APIKEY, ApiSecret: ONE4ALL_APISECRET },
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };
    this.logger.log(`transaction status payload == ${JSON.stringify(configs)}`);

    return this.httpService
      .get(configs.url, { httpsAgent: configs.agent, headers: configs.headers })
      .pipe(
        map((tsRes) => {
          this.logger.log(
            `Query TRANSACTION STATUS response ++++ ${JSON.stringify(tsRes.data)}`,
          );
          return tsRes.data;
        }),
        catchError((tsError) => {
          this.logger.error(
            `Query TRANSACTION STATUS ERROR response ---- ${JSON.stringify(
              tsError.response.data,
            )}`,
          );
          const tsErrorMessage = tsError.response.data;
          throw new NotFoundException(tsErrorMessage);
        }),
      );
  }

  topupAirtimeService(transDto: TopupDto): Observable<AxiosResponse<TopupDto>> {
    const { retailer, recipientNumber, amount, network, userId, userName, currency } = transDto;

    const taParams: any = {
      userId: userId,
      userName: userName,
      transType: 'AIRTIME TOPUP',
      retailer: retailer ?? 'PRYMO',
      network: network || 0,
      operator: this.getOperatorName(network || 0),
      trxn: GeneratorUtil.generateTransactionId() || '',
      transId: '', // We'll set this after creating the transaction
      fee: FEE_CHARGES || 0,
      originalAmount: amount || '',
      amount: (Number(amount) + Number(FEE_CHARGES)).toString() || '',
      recipientNumber: recipientNumber || '',
      transMessage: `${userName} topup airtime ${amount} GHS for ${this.getOperatorName(network)} to ${recipientNumber}`,
      transStatus: 'pending',
      transCode: '',
      commentary: 'Airtime topup transaction pending',
      balance_before: '',
      balance_after: '',
      currentBalance: '',
      currency: currency || 'GHS',
      serviceName: 'ONE4ALL AIRTIME TOPUP',
      serviceStatus: 'inprogress',
      serviceCode: '',
      serviceTransId: '',
      serviceMessage: '',
    };
    // https://tppgh.myone4all.com/api/TopUpApi/airtime?retailer=233241603241&recipient=233244588584&amount=1&network=0&trxn=1234567890
    this.logger.log(`AIRTIME TOPUP params == ${JSON.stringify(taParams)}`);

    taParams.transId = taParams.trxn;
    this.transService.create(taParams);

    const configs: any = {
      url: this.AirBaseUrl + `/TopUpApi/airtime?retailer=${ONE4ALL_RETAILER}&recipient=${taParams.recipientNumber}&amount=${taParams.amount}&network=${taParams.network}&trxn=${taParams.trxn}`,
      headers: { ApiKey: ONE4ALL_APIKEY, ApiSecret: ONE4ALL_APISECRET },
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };
    this.logger.log(`Airtime topup payload == ${JSON.stringify(configs)}`);

    return this.httpService
      .get<any>(configs.url, {
        httpsAgent: configs.agent,
        headers: configs.headers,
      })
      .pipe(
        map((taRes) => {
          this.logger.verbose(
            `AIRTIME TOPUP response ++++ ${JSON.stringify(taRes.data)}`,
          );
          if (taRes.data.status_code === '02') {
            this.logger.warn(`insufficient balance`);
            taParams.serviceCode = taRes.data['status-code'];
            taParams.serviceMessage = taRes.data.message;
            taParams.serviceTransId = taRes.data.trxn;
            taParams.transStatus = taRes.data.status;
            taParams.serviceStatus = taRes.data.status;
            taParams.commentary = 'Insufficient balance, topup failed';
            this.transService.updateByTrxn(taParams.trxn, taParams as UpdateTransactionDto);
          } else if (taRes.data.status_code === '09') {
            this.logger.warn(`recharge requested but awaiting status`);
            taParams.serviceCode = taRes.data['status-code'];
            taParams.serviceMessage = taRes.data.message;
            taParams.serviceTransId = taRes.data.trxn;
            taParams.transStatus = taRes.data.status;
            taParams.serviceStatus = taRes.data.status;
            taParams.commentary = 'recharge requested but awaiting status';
            this.transService.updateByTrxn(taParams.trxn, taParams as UpdateTransactionDto);
          } else if (taRes.data.status_code === '06') {
            this.logger.log(`other error message`);
            taParams.serviceCode = taRes.data['status-code'];
            taParams.serviceMessage = taRes.data.message;
            taParams.serviceTransId = taRes.data.trxn;
            taParams.transStatus = taRes.data.status;
            taParams.serviceStatus = taRes.data.status;
            taParams.commentary = 'Other error message';
            this.transService.updateByTrxn(taParams.trxn, taParams as UpdateTransactionDto);
          } else if (taRes.data.status_code === '00') {
            this.logger.verbose(`airtime topup successful`);
            taParams.serviceCode = taRes.data['status-code'];
            taParams.serviceMessage = taRes.data.message;
            taParams.serviceTransId = taRes.data.trxn;
            taParams.transStatus = taRes.data.status;
            taParams.serviceStatus = taRes.data.status;
            taParams.balance_before = taRes.data.balance_before;
            taParams.balance_after = taRes.data.balance_after;
            taParams.commentary = `Airtime topup successful delivered to ${taParams.recipientNumber}`
            // Update transaction
            this.transService.updateByTrxn(taParams.trxn, taParams as UpdateTransactionDto);
          }

          return taRes.data;
        }),
        catchError((taError) => {
          this.logger.error(
            `AIRTIME TOP-UP ERROR response --- ${JSON.stringify(
              taError.response.data,
            )}`,
          );

          taParams.serviceCode = taError.response.data['status-code'];
          taParams.serviceMessage = taError.response.data.message;
          taParams.serviceTransId = taError.response.data.trxn;
          taParams.transStatus = taError.response.data.status;
          taParams.serviceStatus = taError.response.data.status;
          taParams.commentary = 'Airtime topup failed';

          // Update the transaction using the transactionId
          this.transService.updateByTrxn(taParams.trxn, taParams as UpdateTransactionDto);

          const taErrorMessage = taError.response.data;
          throw new NotFoundException(taErrorMessage);
        }),
      );

  }
}
