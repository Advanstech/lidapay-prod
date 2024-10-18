import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AxiosResponse } from 'axios';
import { Observable, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as https from 'https';
import { TransferMobileMoneyDto } from './dto/transfer.mobilemoney.dto';
import { PayMobileMoneyDto } from './dto/pay.mobilemoney.dto';
import { GeneratorUtil } from 'src/utilities/generator.util';
import { FEE_CHARGES, PAYSWITCH_MERCHANTID, PAYSWITCH_TEST_BASEURL, PAYSWTICH_PROD_BASEURL, PROCESSING_CODE_DEBIT, PROCESSING_CODE_SEND } from 'src/constants';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class PsmobilemoneyService {
  private logger = new Logger(PsmobilemoneyService.name);

  constructor(
    private httpService: HttpService,
    private transactionService: TransactionService
  ) { }

  public primaryCallbackUrl() {
    // https://webhook.site/da10dbc3-9adf-4b2c-b7dd-fd03d3504fa0?amount=1&channel=mobile&code=040&currency=GHS&r_switch=MTN&reason=You%20are%20not%20allowed%20to%20transact%20with%20MTN%20%28Mtn%29&status=Access%20Denied&subscriber_number=0244588584&transaction_id=000000123457
  }
  // transfer mobile money
  public transferMobilemoney(
    transDto: TransferMobileMoneyDto,
  ): Observable<AxiosResponse<TransferMobileMoneyDto>> {
    const {
      description,
      recipientMsisdn,
      amount,
      transType,
      channel,
      currency,
      userId,
      userName,
      transId
    } = transDto;

    // params to send to payswitch
    const tmParams: any = {
      amount: amount || '',
      processing_code: process.env.PROCESSING_CODE_SEND || PROCESSING_CODE_SEND,
      transaction_id: GeneratorUtil.generateTransactionId || 'TNX-',
      desc: `Transfer GHs${amount} to ${recipientMsisdn}`,
      merchant_id: process.env.PAYSWITCH_MERCHANTID || PAYSWITCH_MERCHANTID,
      subscriber_number: recipientMsisdn,
      'r-switch': channel,
    };

    // save transaction to database
    const tmParamSave: any = {
      userId: userId,
      userName: userName,
      transId,
      transType: transType || 'MOMO TRANSFER',
      retailer: 'PAYSWITCH',
      fee: FEE_CHARGES || 0,
      originalAmount: tmParams.amount,
      amount: (Number(amount) + Number(FEE_CHARGES)).toString() || '',
      recipientNumber: tmParams.subscriber_number || '',
      transMessage: `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType}`,
      network: 0 || '',
      trxn: tmParams.transaction_id || '',
      transStatus: 'pending',
      serviceStatus: 'inprogress',
      operator: tmParams.r_switch || '',
      serviceCode: '',
      serviceTransId: '',
      serviceMessage: '',
      serviceName: 'MOMO TRANSFER',
      currency: currency || 'GHS',
      commentary: '',
      paymentStatus: 'pending',
    };

    const base64_encode = GeneratorUtil.generateMerchantKey();

    // Instead of creating a new transaction, find and update the existing one

    const configs = {
      url: PAYSWITCH_TEST_BASEURL + '/v1.1/transaction/process',
      body: tmParams,
      headers: {
        Authorization: `Basic ${base64_encode}`,
      },
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };
    this.logger.log(
      `TRANSFER MOBILE MONEY payload config == ${JSON.stringify(configs)}`,
    );
    return this.httpService
      .post(configs.url, configs.body, {
        httpsAgent: configs.agent,
        headers: configs.headers,
      })
      .pipe(
        map((tmRes) => {
          this.logger.verbose(
            `TRANSFER MOBILE MONEY server response => ${JSON.stringify(
              tmRes.data,
            )}`,
          );
          if (tmRes.data.status == 'Approved') {
            this.logger.log(`debit wallet service response STATUS =  ${JSON.stringify(tmRes.data.status)} `);
            this.logger.log(`service response CODE = ${JSON.stringify(tmRes.data.code)} `);
            this.logger.log(`service response MESSAGE =  ${JSON.stringify(tmRes.data.reason)} `);
            this.logger.log(`service response TRANSACTIONiD ==> ${JSON.stringify(tmRes.data.transaction_id)} `);

            tmParamSave.transStatus = 'Success';
            tmParamSave.serviceStatus = tmRes.data.status;
            tmParamSave.serviceTransId = tmRes.data.transaction_id;
            tmParamSave.serviceMessage = tmRes.data.reason;
            tmParamSave.paymentStatus = 'Success';
            tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} was successful`;
            // Update the transaction using the transactionId
            this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);

          } else if (tmRes.data.status === 'failed') {
            this.logger.error(` service response STATUS ==>  ${JSON.stringify(tmRes.data.status)} `);
            this.logger.error(` debit wallet  service response TRANSACTION ID ==> ${JSON.stringify(tmRes.data.transaction_id)}`);
            this.logger.error(` response MESSAGE ==>  ${JSON.stringify(tmRes.data.reason)} `);
            this.logger.error(` response  CODE ==> ${JSON.stringify(tmRes.data.code)} `);
            tmParamSave.transStatus = 'Failed';
            tmParamSave.serviceStatus = tmRes.data.status;
            tmParamSave.serviceTransId = tmRes.data.transaction_id;
            tmParamSave.serviceMessage = tmRes.data.reason;
            tmParamSave.paymentStatus = 'Failed';
            tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} was failed`;
            // Update the transaction using the transactionId
            this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);

          } else if (tmRes.data.status == null || tmRes.data.status == 'null') {
            this.logger.debug(` service response STATUS ==>  ${JSON.stringify(tmRes.data.status)} `);
            this.logger.debug(` response  CODE ==> ${JSON.stringify(tmRes.data.code)} `);
            this.logger.debug(` response MESSAGE ==>  ${JSON.stringify(tmRes.data.reason)} `);
            this.logger.debug(` service response TRANSACTION ID ==> ${JSON.stringify(tmRes.data.transaction_id)}`);
            this.logger.debug(` response custmerDescription ==>  ${JSON.stringify(tmRes.data.desc)} `);
            tmParamSave.transStatus = 'Pending';
            tmParamSave.serviceStatus = tmRes.data.status;
            tmParamSave.serviceTransId = tmRes.data.transaction_id;
            tmParamSave.serviceMessage = tmRes.data.reason;
            tmParamSave.paymentStatus = 'Pending';
            tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} is pending`;
            // Update the transaction using the transactionId
            this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);

          } else if (tmRes.data.status == 'PIN_LOCKED') {
            this.logger.warn(` debit wallet service response STATUS ==>  ${JSON.stringify(tmRes.data.status)} `);
            this.logger.warn(` service response MESSAGE ==>  ${JSON.stringify(tmRes.data.reason)} `);
            this.logger.warn(` service response TRANSACTIONID ==> ${JSON.stringify(tmRes.data.transaction_id)} `);
            tmParamSave.transStatus = 'Failed';
            tmParamSave.serviceStatus = tmRes.data.status;
            tmParamSave.serviceTransId = tmRes.data.transaction_id;
            tmParamSave.serviceMessage = tmRes.data.reason;
            tmParamSave.paymentStatus = 'Failed';
            tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} was failed`;
            // Update the transaction using the transactionId
            this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);

          } else if (tmRes.data.status == 'error') {
            this.logger.error(` debit wallet service response STATUS ==>  ${JSON.stringify(tmRes.data.status)} `);
            this.logger.error(` service response CODE ==>  ${JSON.stringify(tmRes.data.code)} `);
            this.logger.error(` service response MESSAGE ==> ${JSON.stringify(tmRes.data.reason)} `);

            tmParamSave.transStatus = 'Failed';
            tmParamSave.serviceStatus = tmRes.data.status;
            tmParamSave.serviceTransId = tmRes.data.transaction_id;
            tmParamSave.serviceMessage = tmRes.data.reason;
            tmParamSave.paymentStatus = 'Failed';
            tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} was failed`;
            // Update the transaction using the transactionId
            this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);

          } else if (tmRes.data.status == 'TIMEOUT') {
            this.logger.warn(`debit wallet service response STATUS ==>  ${JSON.stringify(tmRes.data.status)}`);
            this.logger.warn(`service response STATUS_CODE ==>  ${JSON.stringify(tmRes.data.code)}`);
            this.logger.warn(`service response TRANSACTION_ID ==> ${JSON.stringify(tmRes.data.transaction_id)}`);
            this.logger.warn(`service response MESSAGE ==> ${JSON.stringify(tmRes.data.reason)}`);
            this.logger.warn(`service response DESCRIPTION ==> ${JSON.stringify(tmRes.data.desc)}`);
            tmParamSave.transStatus = 'Failed';
            tmParamSave.serviceStatus = tmRes.data.status;
            tmParamSave.serviceTransId = tmRes.data.transaction_id;
            tmParamSave.serviceMessage = tmRes.data.reason;
            tmParamSave.paymentStatus = 'Failed';
            tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} was failed`;
            // Update the transaction using the transactionId
            this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);
          }

          return tmRes.data;
        }),
        catchError((Sm2Error) => {
          this.logger.error(`ERROR TRANSFER MOBILE MONEY => ${JSON.stringify(Sm2Error.response.data)}`);

          tmParamSave.transStatus = 'Failed';
          tmParamSave.serviceStatus = Sm2Error.response.data.status;
          tmParamSave.serviceTransId = Sm2Error.response.data.transaction_id;
          tmParamSave.serviceMessage = Sm2Error.response.data.reason;
          tmParamSave.paymentStatus = 'Failed';
          tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} was failed`;
          // Update the transaction using the transactionId
          this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);

          const Sm2ErrorMessage = Sm2Error.response.data;
          throw new NotFoundException(Sm2ErrorMessage);
        }),
      );

  }

  public mobileMoneyPayment(
    transDto: PayMobileMoneyDto,
  ): Observable<AxiosResponse<PayMobileMoneyDto>> {
    const {
      customerMsisdn,
      amount,
      description,
      channel,
      transType,
      userId,
      userName,
      currency,
      transId,
    } = transDto;

    const localTransId = GeneratorUtil.generateTransactionIdPayswitch() || 'TNX-';
    this.logger.log(`payment transId =>> ${localTransId}`);

    // params to send to payswitch
    const dwParams: any = {
      amount: amount || '',
      processing_code: process.env.PROCESSING_CODE_DEBIT || PROCESSING_CODE_DEBIT,
      transaction_id: localTransId,
      desc: description || `debit GhS${amount} from ${customerMsisdn} momo wallet.`,
      merchant_id: process.env.PAYSWITCH_MERCHANTID || PAYSWITCH_MERCHANTID,
      subscriber_number: customerMsisdn,
      'r-switch': channel,
    };

    // save transaction to database
    const dwParamSave: any = {
      userId: userId,
      userName: userName,
      transId,
      paymentType: 'MOMO',
      retailer: 'PAYSWITCH',
      fee: FEE_CHARGES || 0,
      originalAmount: dwParams.amount,
      amount: (Number(amount) + Number(FEE_CHARGES)).toString() || '',
      customerMsisdn: dwParams.subscriber_number || '',
      walletOperator: dwParams.r_switch || '',
      paymentCurrency: currency || 'GHS',
      paymentCommentary: '',
      paymentStatus: 'pending',
      paymentServiceCode: '',
      paymentTransactionId: dwParams.transaction_id || '',
      paymentServiceMessage: '',
    };

    const base64_encode = GeneratorUtil.generateMerchantKey();

    const configs = {
      url: PAYSWTICH_PROD_BASEURL + '/v1.1/transaction/process',
      body: dwParams,
      auth: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${base64_encode}`,
      },
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };
    this.logger.log(
      `RECEIVE MONEY payload config == ${JSON.stringify(configs)}`,
    );
    return this.httpService
      .post(configs.url, configs.body, {
        httpsAgent: configs.agent,
        headers: configs.auth,
      })
      .pipe(
        map((mpRes) => {
          this.logger.verbose(`RECEIVE MONEY server response => ${JSON.stringify(mpRes.data)}`);
          if (mpRes.data.status == 'Approved') {
            this.logger.log(`debit wallet service response STATUS =  ${JSON.stringify(mpRes.data.status)} `);
            this.logger.log(`service response CODE = ${JSON.stringify(mpRes.data.code)} `);
            this.logger.log(`service response MESSAGE =  ${JSON.stringify(mpRes.data.reason)} `);
            this.logger.log(`service response TRANSACTIONiD ==> ${JSON.stringify(mpRes.data.transaction_id)} `);
            dwParamSave.paymentServiceCode = mpRes.data.code;
            dwParamSave.paymentTransactionId = mpRes.data.transaction_id;
            dwParamSave.paymentServiceMessage = mpRes.data.reason;
            dwParamSave.paymentStatus = 'Success';
            dwParamSave.paymentCommentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} was successful`;
            // Update the transaction using the transactionId
            this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
          } else if (mpRes.data.status === 'failed') {
            this.logger.error(` service response STATUS ==>  ${JSON.stringify(mpRes.data.status)} `);
            this.logger.error(` debit wallet  service response TRANSACTION ID ==> ${JSON.stringify(mpRes.data.transaction_id)}`);
            this.logger.error(` response MESSAGE ==>  ${JSON.stringify(mpRes.data.reason)} `);
            this.logger.error(` response  CODE ==> ${JSON.stringify(mpRes.data.code)} `);
            dwParamSave.paymentServiceStatus = mpRes.data.status;
            dwParamSave.paymentTransactionId = mpRes.data.transaction_id;
            dwParamSave.paymentServiceMessage = mpRes.data.reason;
            dwParamSave.paymentStatus = 'Failed';
            dwParamSave.paymentCommentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} was failed`;
            // Update the transaction using the transactionId
            this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
          } else if (mpRes.data.status == null || mpRes.data.status == 'null') {
            this.logger.debug(` service response STATUS ==>  ${JSON.stringify(mpRes.data.status)} `);
            this.logger.debug(` response  CODE ==> ${JSON.stringify(mpRes.data.code)} `);
            this.logger.debug(` response MESSAGE ==>  ${JSON.stringify(mpRes.data.reason)} `);
            this.logger.debug(` service response TRANSACTION ID ==> ${JSON.stringify(mpRes.data.transaction_id)}`);
            this.logger.debug(` response custmerDescription ==>  ${JSON.stringify(mpRes.data.desc)} `);
            dwParamSave.paymentServiceStatus = mpRes.data.status;
            dwParamSave.paymentTransactionId = mpRes.data.transaction_id;
            dwParamSave.paymentServiceMessage = mpRes.data.reason;
            dwParamSave.paymentStatus = 'Pending';
            dwParamSave.paymentCommentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} is pending`;
            // Update the transaction using the transactionId
            this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
          } else if (mpRes.data.status == 'PIN_LOCKED') {
            this.logger.warn(` debit wallet service response STATUS ==>  ${JSON.stringify(mpRes.data.status)} `);
            this.logger.warn(` service response MESSAGE ==>  ${JSON.stringify(mpRes.data.reason)} `);
            this.logger.warn(` service response TRANSACTIONID ==> ${JSON.stringify(mpRes.data.transaction_id)} `);
            dwParamSave.paymentServiceStatus = mpRes.data.status;
            dwParamSave.paymentTransactionId = mpRes.data.transaction_id;
            dwParamSave.paymentServiceMessage = mpRes.data.reason;
            dwParamSave.paymentStatus = 'Failed';
            dwParamSave.paymentCommentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} was failed`;
            // Update the transaction using the transactionId
            this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
          } else if (mpRes.data.status == 'error') {
            this.logger.error(` debit wallet service response STATUS ==>  ${JSON.stringify(mpRes.data.status)} `);
            this.logger.error(` service response CODE ==>  ${JSON.stringify(mpRes.data.code)} `);
            this.logger.error(` service response MESSAGE ==> ${JSON.stringify(mpRes.data.reason)} `);
            dwParamSave.paymentServiceStatus = mpRes.data.status;
            dwParamSave.paymentTransactionId = mpRes.data.transaction_id;
            dwParamSave.paymentServiceMessage = mpRes.data.reason;
            dwParamSave.paymentStatus = 'Failed';
            dwParamSave.paymentCommentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} was failed`;
            // Update the transaction using the transactionId
            this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
          } else if (mpRes.data.status == 'TIMEOUT') {
            this.logger.warn(`debit wallet service response STATUS ==>  ${JSON.stringify(mpRes.data.status)}`);
            this.logger.warn(`service response STATUS_CODE ==>  ${JSON.stringify(mpRes.data.code)}`);
            this.logger.warn(`service response TRANSACTION_ID ==> ${JSON.stringify(mpRes.data.transaction_id)}`);
            this.logger.warn(`service response MESSAGE ==> ${JSON.stringify(mpRes.data.reason)}`);
            this.logger.warn(`service response DESCRIPTION ==> ${JSON.stringify(mpRes.data.desc)}`);
            dwParamSave.paymentServiceStatus = mpRes.data.status;
            dwParamSave.paymentTransactionId = mpRes.data.transaction_id;
            dwParamSave.paymentServiceMessage = mpRes.data.reason;
            dwParamSave.paymentStatus = 'Failed';
            dwParamSave.paymentCommentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} was failed`;
            // Update the transaction using the transactionId
            this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
          }

          return mpRes.data;
        }),
        catchError((mpError) => {
          this.logger.error(`ERROR DEBIT WALLET => ${JSON.stringify(mpError.response.data)}`);
          dwParamSave.transStatus = 'Failed';
          dwParamSave.serviceStatus = mpError.response.data.status;
          dwParamSave.serviceTransId = mpError.response.data.transaction_id;
          dwParamSave.serviceMessage = mpError.response.data.reason;
          dwParamSave.paymentStatus = 'Failed';
          dwParamSave.commentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} was failed`;
          // Update the transaction using the transactionId
          this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
          const mpErrorMessage = mpError.response.data;
          throw new NotFoundException(mpErrorMessage);
        }),

      );
  }
}
