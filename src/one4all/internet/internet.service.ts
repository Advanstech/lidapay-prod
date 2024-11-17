import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Observable } from 'rxjs';
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
import { InternetDto } from './dto/internet.dto';
import { GeneratorUtil } from 'src/utilities/generator.util';
import { TransactionService } from 'src/transaction/transaction.service';
import { UpdateTransactionDto } from 'src/transaction/dto/update-transaction.dto';
import { ValidationUtil } from 'src/utilities/validation.util';

@Injectable()
export class InternetService {
  private logger = new Logger('InternetService');
  private DataUrl = ONE4ALL_BASEURL;

  constructor(
    private httpService: HttpService,
    private transService: TransactionService
  ) {}

  topupInternetData(
    transDto: InternetDto,
  ): Observable<AxiosResponse<InternetDto>> {
    const { retailer, recipientNumber, dataCode, network, userId, userName, amount, currency } = transDto;

    const tibParams: any = {
      userId: userId,
      userName: userName,
      transType: 'INTERNET DATA BUNDLE',
      retailer: retailer ?? 'PRYMO',
      fee: FEE_CHARGES || 0,
      originalAmount: amount || '',
      amount: (Number(amount) + Number(FEE_CHARGES)).toString() || '',
      recipientNumber: recipientNumber || '',
      data_code: dataCode || '',
      network: network || 0,
      operator: ValidationUtil.getOperatorName(network || 0),
      trxn: GeneratorUtil.generateTransactionId() || '',
      transId: '',
      status: {
        transaction: 'pending',
        service: 'inprogress',
        payment: 'pending',
      },
      commentary: 'Internet data bundle transaction pending',
      currency: currency || 'GHS',
      balance_before: '',
      balance_after: ''
    };

    const tibUrl =
      this.DataUrl +
      `/TopUpApi/dataBundle?retailer=${ONE4ALL_RETAILER}&recipient=${tibParams.recipientNumber}&data_code=${tibParams.data_code}&network=${tibParams.network}&trxn=${tibParams.trxn}`;

    tibParams.transId = tibParams.trxn;
    this.transService.create(tibParams);

    const configs = {
      url: tibUrl,
      headers: { ApiKey: ONE4ALL_APIKEY, ApiSecret: ONE4ALL_APISECRET },
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };
    this.logger.log(
      `INTERNET DATA BUNDLE payload config ==> ${JSON.stringify(configs)}`,
    );
    return this.httpService
      .get(configs.url, { httpsAgent: configs.agent, headers: configs.headers })
      .pipe(
        map((tibRes) => {
          this.logger.verbose(
            `INTERNET DATA BUNDLE server response => ${tibRes.data}`,
          );
          
          switch (tibRes.data['status-code']) {
            case '00':
              this.logger.verbose(`Data bundle reload successful`);
              tibParams.serviceCode = tibRes.data['status-code'];
              tibParams.serviceMessage = tibRes.data.message;
              tibParams.serviceTransId = tibRes.data.trxn;
              tibParams.balance_before = tibRes.data.balance_before;
              tibParams.balance_after = tibRes.data.balance_after;
              tibParams.commentary = `Data bundle reload successful for ${tibParams.recipientNumber}`;
              this.transService.updateByTrxn(tibParams.trxn, {
                ...tibParams,
                status: {
                  transaction: 'completed',
                  service: 'completed',
                  payment: 'completed',
                },
                commentary: tibParams.commentary,
              });
              break;

            case '02':
              this.logger.warn(`Insufficient balance`);
              this.handleTransactionFailure(tibParams, tibRes.data);
              break;

            case '09':
              this.logger.warn(`Recharge requested but awaiting status`);
              this.handleTransactionPending(tibParams, tibRes.data);
              break;

            case '06':
              this.logger.log(`Other error message`);
              this.handleTransactionFailure(tibParams, tibRes.data);
              break;

            default:
              this.logger.error(`Unexpected status code: ${tibRes.data['status-code']}`);
              this.handleTransactionFailure(tibParams, tibRes.data);
              break;
          }
          return tibRes.data;
        }),
        catchError((tibError) => {
          this.logger.error(`ERROR INTERNET DATA BUNDLE => ${JSON.stringify(tibError.data)}`);
          this.handleTransactionFailure(tibParams, tibError.response.data);
          const tibErrorMessage = tibError.response.data;
          throw new NotFoundException(tibErrorMessage);
        }),
      );
  }

  private handleTransactionFailure(tibParams: any, responseData: any) {
    tibParams.serviceCode = responseData['status-code'];
    tibParams.serviceMessage = responseData.message;
    tibParams.serviceTransId = responseData.trxn;
    tibParams.transStatus = responseData.status;
    tibParams.serviceStatus = responseData.status;
    tibParams.commentary = 'Transaction failed';
    this.transService.updateByTrxn(tibParams.trxn, {
      ...tibParams,
      status: {
        transaction: 'failed',
        service: 'failed',
        payment: 'failed',
      },
      commentary: tibParams.commentary,
    });
  }

  private handleTransactionPending(tibParams: any, responseData: any) {
    tibParams.serviceCode = responseData['status-code'];
    tibParams.serviceMessage = responseData.message;
    tibParams.serviceTransId = responseData.trxn;
    tibParams.transStatus = responseData.status;
    tibParams.serviceStatus = responseData.status;
    tibParams.commentary = 'Recharge requested but awaiting status';
    this.transService.updateByTrxn(tibParams.trxn, {
      ...tibParams,
      status: {
        transaction: 'pending',
        service: 'pending',
        payment: 'pending',
      },
      commentary: tibParams.commentary,
    });
  }

  dataBundleList(
    transDto: InternetDto,
  ): Observable<AxiosResponse<InternetDto>> {
    const dblParams: any = { network: 0 || transDto.network };

    const dblURL =
      this.DataUrl + `/TopUpApi/dataBundleList?network=${dblParams.network}`;

    const configs = {
      url: dblURL,
      headers: { ApiKey: ONE4ALL_APIKEY, ApiSecret: ONE4ALL_APISECRET },
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };
    this.logger.log(
      `DATA BUNDLE LIST payload config ==> ${JSON.stringify(configs)}`,
    );
    return this.httpService
      .get(configs.url, { httpsAgent: configs.agent, headers: configs.headers })
      .pipe(
        map((dblRes) => {
          this.logger.verbose(
            `DATA BUNDLE LIST server response => ${dblRes.data}`,
          );

          return dblRes.data;
        }),
        catchError((dblError) => {
          this.logger.error(`ERROR DATA BUNDLE LIST => ${JSON.stringify(dblError.response.data)}`);

          const dblErrorMessage = dblError.response.data;
          throw new NotFoundException(dblErrorMessage);
        }),
      );
  }
}
