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
      amount: amount + FEE_CHARGES || 0,
      recipientNumber: recipientNumber || '',
      transMessage: ``,
      currentBalance: '',
      recipient: recipientNumber || '',
      data_code: dataCode || '',
      network: network || 0,
      operator: ValidationUtil.getOperatorName(network || 0),
      trxn: GeneratorUtil.generateTransactionId() || '',
      transId: '',
      transStatus: 'pending',
      serviceStatus: 'inprogress',
      serviceCode: '',
      serviceTransId: '',
      serviceMessage: '',
      serviceName: '',
      currency: currency || 'GHS',
      balance_before: '',
      balance_after: '' 
    };

    // https://tppgh.myone4all.com/api/TopUpApi/dataBundle?retailer=233245000000&recipient=233245667942&data_code=DAILY_20MB&network=4&trxn=1234567890
    const tibUrl =
      this.DataUrl +
      `/TopUpApi/dataBundle?retailer=${ONE4ALL_RETAILER}&recipient=${tibParams.recipient}&data_code=${tibParams.data_code}&network=${tibParams.network}&trxn=${tibParams.trxn}`;

    tibParams.transId = tibParams.trxn; // Set transactionId to the same value as trxn
    // Record transaction
    this.transService.create(tibParams as any);

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
          if (tibRes.data['status-code'] === '02') {
            this.logger.warn(`insufficient balance`);
            tibParams.serviceCode = tibRes.data['status-code'];
            tibParams.serviceMessage = tibRes.data.message;
            tibParams.serviceTransId = tibRes.data.trxn;
            tibParams.transStatus = tibRes.data.status;
            tibParams.serviceStatus = tibRes.data.status;
            tibParams.commentary = 'insufficient balance, topup failed';
            this.transService.updateByTrxn(tibParams.trxn, tibParams as UpdateTransactionDto);
          } else if (tibRes.data['status-code'] === '09') {
            this.logger.warn(`recharge requested but awaiting status`);
            tibParams.serviceCode = tibRes.data['status-code'];
            tibParams.serviceMessage = tibRes.data.message;
            tibParams.serviceTransId = tibRes.data.trxn;
            tibParams.transStatus = tibRes.data.status;
            tibParams.serviceStatus = tibRes.data.status;
            tibParams.commentary = 'recharge requested but awaiting status';
            this.transService.updateByTrxn(tibParams.trxn, tibParams as UpdateTransactionDto);
          } else if (tibRes.data['status-code'] === '06') {
            this.logger.log(`other error message`);
            tibParams.serviceCode = tibRes.data['status-code'];
            tibParams.serviceMessage = tibRes.data.message;
            tibParams.serviceTransId = tibRes.data.trxn;
            tibParams.transStatus = tibRes.data.status;
            tibParams.serviceStatus = tibRes.data.status;
            tibParams.commentary = 'Other error message';
            this.transService.updateByTrxn(tibParams.trxn, tibParams as UpdateTransactionDto);
          } else if (tibRes.data['status-code'] === '00') {
            this.logger.verbose(`Data bundle reload successful`);
            tibParams.serviceCode = tibRes.data['status-code'];
            tibParams.serviceMessage = tibRes.data.message;
            tibParams.serviceTransId = tibRes.data.trxn;
            tibParams.transStatus = tibRes.data.status;
            tibParams.serviceStatus = tibRes.data.status;
            tibParams.balance_before = tibRes.data.balance_before;
            tibParams.balance_after = tibRes.data.balance_after;
            tibParams.commentary = `data bundle reload successful for ${tibParams.recipientNumber}`;
            // Update transaction
            this.transService.updateByTrxn(tibParams.trxn, tibParams as UpdateTransactionDto);
          }
          return tibRes.data;
        }),
        catchError((tibError) => {
          this.logger.error(`ERROR INTERNET DATA BUNDLE => ${JSON.stringify(tibError.data)}`);
          tibParams.serviceCode = tibError.response.data['status-code'];
          tibParams.serviceMessage = tibError.response.data.message;
          tibParams.serviceTransId = tibError.response.data.trxn;
          tibParams.transStatus = tibError.response.data.status;
          tibParams.serviceStatus = tibError.response.data.status;
          tibParams.commentary = 'Internet data bundle recharge failed';

          this.transService.updateByTrxn(tibParams.trxn, tibParams as UpdateTransactionDto);

          const tibErrorMessage = tibError.response.data;
          throw new NotFoundException(tibErrorMessage);
        }),
      );
  }

  dataBundleList(
    transDto: InternetDto,
  ): Observable<AxiosResponse<InternetDto>> {
    // const { network } = transDto;
    const dblParams: any = { network: 0 || transDto.network };

    // https://tppgh.myone4all.com/api/TopUpApi/dataBundleList?network=0
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
            `DATA BUNDLE lIST server response => ${dblRes.data}`,
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
