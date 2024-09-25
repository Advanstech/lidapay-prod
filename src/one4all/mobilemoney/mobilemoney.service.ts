import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as https from 'https';
import {
  ONE4ALL_APIKEY,
  ONE4ALL_APISECRET,
  ONE4ALL_BASEURL,
} from 'src/constants';
import { ReceiveMoneyDto } from './dto/receive.money.dto';
import { SendMoneyDto } from './dto/send.money.dto';
import { GeneratorUtil } from 'src/utilities/generator.util';

@Injectable()
export class MobilemoneyService {
  private logger = new Logger('MobilemoneyService');
  private readonly momoBaseUrl = ONE4ALL_BASEURL;

  constructor(private httpService: HttpService) {}

  sendMobileMoney(
    transDto: SendMoneyDto,
  ): Observable<AxiosResponse<SendMoneyDto>> {
    const { recipientMsisdn, amount } = transDto;

    const rm2Params = {
      recipient: recipientMsisdn || '',
      amount: amount || '',
      trxn: GeneratorUtil.generateTransactionId() || '',
    };
    // https://tppgh.myone4all.com/api/TopUpApi/b2c?recipient=233245667942&amount=1&trxn=1234567890

    const sm2Url = `/TopUpApi/b2c?recipient=${rm2Params.recipient}&amount=${rm2Params.amount}&trxn=${rm2Params.trxn}`;

    const configs = {
      url: this.momoBaseUrl + sm2Url,
      headers: { ApiKey: ONE4ALL_APIKEY, ApiSecret: ONE4ALL_APISECRET },
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };
    this.logger.log(`SEND MONEY payload config == ${JSON.stringify(configs)}`);
    return this.httpService
      .get(configs.url, { httpsAgent: configs.agent, headers: configs.headers })
      .pipe(
        map((Sm2Res) => {
          this.logger.verbose(
            `SEND MONEY server response => ${JSON.stringify(Sm2Res.data)}`,
          );
          // if (res.data.Status === 0) {
          //     this.logger.error(`debit wallet service response STATUS =  ${JSON.stringify(res.data.Status)}`);
          //     this.logger.error(`service response MESSAGE =  ${JSON.stringify(res.data.Message)}`);
          //     this.logger.error(`service response DETAILS = ${JSON.stringify(res.data.Details)}`);
          // } else if (res.data.Status === 1) {
          //     this.logger.debug(`debit wallet  service response TRANSACTION ID == ${JSON.stringify(res.data.Transactionid)}`);
          //     this.logger.debug(`service response STATUS ==  ${JSON.stringify(res.data.Status)}`);
          //     this.logger.debug(`response MESSAGE ==  ${JSON.stringify(res.data.Message)}`);
          //     this.logger.debug(`response MERCHANT REFERENCE == ${JSON.stringify(res.data.MerchantReference)}`);
          // } else if (res.data.Status === 2) {
          //     this.logger.warn(`debit wallet service response STATUS =  ${JSON.stringify(res.data.Status)}`);
          //     this.logger.warn(`service response MESSAGE =  ${JSON.stringify(res.data.Message)}`);
          //     this.logger.warn(`service response TRANSACTIONID = ${JSON.stringify(res.data.transactionid)}`);
          // }

          return Sm2Res.data;
        }),
        catchError((Sm2Error) => {
          this.logger.error(`ERROR CREDIT WALLET => ${JSON.stringify(Sm2Error.response.data)}`);
          const Sm2ErrorMessage =  Sm2Error.response.data;
          throw new NotFoundException(Sm2ErrorMessage);
        }),
      );
  }

  receiveMobileMoney(
    transDto: ReceiveMoneyDto,
  ): Observable<AxiosResponse<ReceiveMoneyDto>> {
    const { customerMsisdn, amount } = transDto;

    const rm2Params = {
      recipient: customerMsisdn || '',
      amount: amount || '',
      trxn: GeneratorUtil.generateTransactionId() || '',
    };
    // https://tppgh.myone4all.com/api/TopUpApi/c2b?recipient=233245667942&amount=1&trxn=1234567890

    const rm2Url = `/TopUpApi/c2b?recipient=${rm2Params.recipient}&amount=${rm2Params.amount}&trxn=${rm2Params.trxn}`;

    const configs = {
      url: this.momoBaseUrl + rm2Url,
      headers: { ApiKey: ONE4ALL_APIKEY, ApiSecret: ONE4ALL_APISECRET },
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };
    this.logger.log(
      `RECEIVE MONEY payload config == ${JSON.stringify(configs)}`,
    );
    return this.httpService
      .get(configs.url, { httpsAgent: configs.agent, headers: configs.headers })
      .pipe(
        map((rm2Res) => {
          this.logger.verbose(
            `RECEIVE MONEY server response => ${JSON.stringify(rm2Res.data)}`,
          );
          // if (res.data.Status === 0) {
          //     this.logger.error(`debit wallet service response STATUS =  ${JSON.stringify(res.data.Status)}`);
          //     this.logger.error(`service response MESSAGE =  ${JSON.stringify(res.data.Message)}`);
          //     this.logger.error(`service response DETAILS = ${JSON.stringify(res.data.Details)}`);
          // } else if (res.data.Status === 1) {
          //     this.logger.debug(`debit wallet  service response TRANSACTION ID == ${JSON.stringify(res.data.Transactionid)}`);
          //     this.logger.debug(`service response STATUS ==  ${JSON.stringify(res.data.Status)}`);
          //     this.logger.debug(`response MESSAGE ==  ${JSON.stringify(res.data.Message)}`);
          //     this.logger.debug(`response MERCHANT REFERENCE == ${JSON.stringify(res.data.MerchantReference)}`);
          // } else if (res.data.Status === 2) {
          //     this.logger.warn(`debit wallet service response STATUS =  ${JSON.stringify(res.data.Status)}`);
          //     this.logger.warn(`service response MESSAGE =  ${JSON.stringify(res.data.Message)}`);
          //     this.logger.warn(`service response TRANSACTIONID = ${JSON.stringify(res.data.transactionid)}`);
          // }

          return rm2Res.data;
        }),
        catchError((rm2Error) => {
          this.logger.error(`ERROR DEBIT WALLET => ${JSON.stringify(rm2Error.response.data)}`);
          const rm2ErrorMessage = rm2Error.response.data;
          throw new NotFoundException(rm2ErrorMessage);
        }),
      );
  }
}
