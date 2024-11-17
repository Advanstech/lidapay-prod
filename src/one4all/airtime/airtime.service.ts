import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Observable, of } from 'rxjs';
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

  constructor(
    private readonly httpService: HttpService,
    private readonly transService: TransactionService,
  ) { }
  /*
  *   Transaction Status Query
  *   @param transactionId
  */
  public transactionStatus(
    transDto: TransStatusDto,
  ): Observable<AxiosResponse<TransStatusDto>> {
    const { transReference } = transDto;

    const payload = {
      trnx: transReference || '',
    };

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
  /*
  *   Airtime Topup
  *   @param topupDto
  */
  async topupAirtimeService(transDto: TopupDto): Promise<Observable<AxiosResponse<TopupDto>>> {
    const { retailer, recipientNumber, amount, network, userId, userName, currency } = transDto;

    const taParams: any = {
      userId: userId,
      userName: userName,
      transType: 'AIRTIME',
      retailer: retailer ?? 'PRYMO',
      network: network || 0,
      operator: this.getOperatorName(network || 0),
      trxn: GeneratorUtil.generateTransactionId() || '',
      transId: '', // Will be set after creating the transaction
      monetary: {
        amount: (Number(amount) + Number(FEE_CHARGES)).toString() || '',
        fee: FEE_CHARGES || 0,
        originalAmount: amount || '',
        currency: currency || 'GHS',
        balance_before: '', // Set this based on your logic
        balance_after: '', // Set this based on your logic
        currentBalance: '', // Set this based on your logic
      },
      status: {
        transaction: 'pending',
        service: 'pending',
        payment: 'pending', // Assuming payment is pending initially
      },
      recipientNumber: recipientNumber || '',
      transMessage: `${userName} topup airtime ${amount} GHS for ${this.getOperatorName(network)} to ${recipientNumber}`,
      commentary: 'Airtime topup transaction pending',
    };

    // Create transaction with updated structure and persist it
    await this.transService.create(taParams); // Save transaction details

    // Query transaction status here
    const savedTransaction = await this.transService.findByTrxn(taParams.trxn); // Pass only the trxn string

    // Check if the transaction was saved successfully
    if (!savedTransaction) {
      this.logger.error('Failed to save transaction.');
      throw new NotFoundException('Transaction could not be created.');
    }

    const configs: any = {
      url: this.AirBaseUrl + `/TopUpApi/airtime?retailer=${ONE4ALL_RETAILER}&recipient=${taParams.recipientNumber}&amount=${taParams.monetary.amount}&network=${taParams.network}&trxn=${taParams.trxn}`,
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
          this.logger.verbose(`AIRTIME TOPUP response ++++ ${JSON.stringify(taRes.data)}`);
          if (taRes.data['status-code'] === '00') {
            this.logger.verbose(`airtime topup successful`);
            this.transService.updateByTrxn(taParams.trxn, {
              ...taParams,
              status: {
                transaction: 'completed',
                service: 'completed',
                payment: 'completed',
              },
              commentary: `Airtime topup successful delivered to ${taParams.recipientNumber}`,
            });
          } else {
            this.logger.warn(`Transaction status code: ${taRes.data['status-code']}`);
            this.transService.updateByTrxn(taParams.trxn, {
              ...taParams,
              status: {
                transaction: 'failed',
                service: 'failed',
                payment: 'failed',
              },
              commentary: 'Airtime topup failed',
            });
          }
          return taRes.data;
        }),
        catchError(async (taError) => {
          // Log the full error response for debugging
          if (taError.response) {
            this.logger.error(`AIRTIME TOP-UP ERROR response --- ${JSON.stringify(taError.response.data)}`);
          } else {
            this.logger.error(`AIRTIME TOP-UP ERROR response --- No response data available`);
          }

          // Extract the error message from the response
          const taErrorMessage = taError.response?.data?.message || 'Unknown error occurred';

          // Attempt to update the transaction status to failed with the error message
          try {
            const updateResult = await this.transService.updateByTrxn(String(taParams.trxn), {
              ...taParams,
              status: {
                transaction: 'failed',
                service: 'failed',
                payment: 'failed',
              },
              commentary: taErrorMessage,
            });

            if (!updateResult) {
              this.logger.warn(`Transaction with ID ${taParams.trxn} not found for update.`);
            }
          } catch (updateError) {
            this.logger.error(`Failed to update transaction: ${updateError.message}`);
          }

          // Log the error message
          this.logger.error(`Error message: ${taErrorMessage}`);

          // Return a structured error response
          return {
            status: 'FAIL',
            message: taErrorMessage,
            error: taError.response?.data || {},
            transactionId: taParams.trxn,
          };
        }),
      );
  }
  // Get operator name based on network code
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
}