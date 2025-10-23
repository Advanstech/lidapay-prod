import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
    this.logger.log(`=== AIRTIME SERVICE PROCESSING START ===`);
    this.logger.log(`Service received DTO: ${JSON.stringify(transDto, null, 2)}`);
    
    const { retailer, recipientNumber, amount, network, userId, userName, currency } = transDto;

    // Log the incoming DTO for debugging
    this.logger.debug(`Incoming DTO: ${JSON.stringify(transDto, null, 2)}`);
    this.logger.log(`Extracted parameters:`);
    this.logger.log(`  - retailer: "${retailer}" (type: ${typeof retailer})`);
    this.logger.log(`  - recipientNumber: "${recipientNumber}" (type: ${typeof recipientNumber})`);
    this.logger.log(`  - amount: "${amount}" (type: ${typeof amount})`);
    this.logger.log(`  - network: ${network} (type: ${typeof network})`);
    this.logger.log(`  - userId: "${userId}" (type: ${typeof userId})`);
    this.logger.log(`  - userName: "${userName}" (type: ${typeof userName})`);
    this.logger.log(`  - currency: "${currency}" (type: ${typeof currency})`);

    // Validate required fields with better error messages
    this.logger.log(`=== VALIDATION PHASE ===`);
    
    if (amount === undefined || amount === null || amount === '') {
      this.logger.error('Amount is required and cannot be empty');
      throw new BadRequestException('Amount is required and cannot be empty');
    }
    this.logger.log(`✅ Amount presence check passed`);

    // Handle amount validation for both string and number types
    let amountStr: string;
    this.logger.log(`Processing amount value: "${amount}" (type: ${typeof amount})`);
    
    if (typeof amount === 'string') {
      amountStr = amount.trim();
      this.logger.log(`Amount is string, trimmed to: "${amountStr}"`);
      if (amountStr === '') {
        this.logger.error('Amount string is empty after trimming');
        throw new BadRequestException('Amount cannot be empty');
      }
    } else if (typeof amount === 'number') {
      amountStr = amount.toString();
      this.logger.log(`Amount is number, converted to string: "${amountStr}"`);
    } else {
      this.logger.error(`Invalid amount type: ${typeof amount}`);
      throw new BadRequestException('Amount must be a string or number');
    }
    
    this.logger.log(`Final amount string: "${amountStr}"`);

    // Validate and convert amount
    const amountNum = parseFloat(amountStr);
    this.logger.log(`Parsed amount number: ${amountNum}`);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      this.logger.error(`Invalid amount provided: ${amountStr}`);
      throw new BadRequestException('Invalid amount. Please provide a valid positive number.');
    }
    this.logger.log(`✅ Amount validation passed: ${amountNum}`);

    // Validate recipient number
    if (!recipientNumber || recipientNumber.trim() === '') {
      this.logger.error('Recipient number is required');
      throw new BadRequestException('Recipient number is required');
    }
    this.logger.log(`✅ Recipient number validation passed: "${recipientNumber}"`);

    // Validate userId
    if (!userId || userId.trim() === '') {
      this.logger.error('User ID is required');
      throw new BadRequestException('User ID is required');
    }
    this.logger.log(`✅ User ID validation passed: "${userId}"`);

    // Validate userName
    if (!userName || userName.trim() === '') {
      this.logger.error('User name is required');
      throw new BadRequestException('User name is required');
    }
    this.logger.log(`✅ User name validation passed: "${userName}"`);

    // Calculate fees and total amount
    this.logger.log(`=== FEE CALCULATION ===`);
    const fee = typeof FEE_CHARGES === 'string' ? parseFloat(FEE_CHARGES) : typeof FEE_CHARGES === 'number' ? FEE_CHARGES : 0;
    const totalAmount = (amountNum + fee).toFixed(2);
    this.logger.log(`  - Original amount: ${amountNum}`);
    this.logger.log(`  - Fee charges: ${fee}`);
    this.logger.log(`  - Total amount: ${totalAmount}`);

    // Build transaction parameters
    this.logger.log(`=== BUILDING TRANSACTION PARAMS ===`);
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
        amount: totalAmount,
        fee: fee,
        originalAmount: amountNum.toFixed(2),
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
      transMessage: `${userName} topup airtime ${amountStr} GHS for ${this.getOperatorName(network)} to ${recipientNumber}`,
      commentary: 'Airtime topup transaction pending',
    };
    
    this.logger.log(`Transaction parameters built:`);
    this.logger.log(`  - Transaction ID: ${taParams.trxn}`);
    this.logger.log(`  - Operator: ${taParams.operator}`);
    this.logger.log(`  - Transaction message: ${taParams.transMessage}`);
    this.logger.log(`  - Monetary details: ${JSON.stringify(taParams.monetary, null, 2)}`);

    try {
      this.logger.log(`=== SAVING TRANSACTION ===`);
      // Create transaction with updated structure and persist it
      await this.transService.create(taParams); // Save transaction details
      this.logger.log(`✅ Transaction saved successfully with ID: ${taParams.trxn}`);

      // Query transaction status here
      const savedTransaction = await this.transService.findByTrxn(taParams.trxn); // Pass only the trxn string
      this.logger.log(`Retrieved saved transaction: ${JSON.stringify(savedTransaction, null, 2)}`);

      // Check if the transaction was saved successfully
      if (!savedTransaction) {
        this.logger.error('Failed to save transaction.');
        throw new InternalServerErrorException('Transaction could not be created.');
      }
      this.logger.log(`✅ Transaction retrieval confirmed`);
    } catch (error) {
      this.logger.error(`Failed to create or save transaction: ${error.message}`);
      throw new InternalServerErrorException('Failed to process transaction. Please try again.');
    }

    // Prepare API call parameters
    this.logger.log(`=== PREPARING API CALL ===`);
    const configs: any = {
      url: this.AirBaseUrl + `/TopUpApi/airtime?retailer=${ONE4ALL_RETAILER}&recipient=${taParams.recipientNumber}&amount=${taParams.monetary.amount}&network=${taParams.network}&trxn=${taParams.trxn}`,
      headers: { ApiKey: ONE4ALL_APIKEY, ApiSecret: ONE4ALL_APISECRET },
      agent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };

    this.logger.log(`API call configuration:`);
    this.logger.log(`  - Base URL: ${this.AirBaseUrl}`);
    this.logger.log(`  - Endpoint: /TopUpApi/airtime`);
    this.logger.log(`  - Retailer: ${ONE4ALL_RETAILER}`);
    this.logger.log(`  - Recipient: ${taParams.recipientNumber}`);
    this.logger.log(`  - Amount: ${taParams.monetary.amount}`);
    this.logger.log(`  - Network: ${taParams.network}`);
    this.logger.log(`  - Transaction ID: ${taParams.trxn}`);
    this.logger.log(`  - Full URL: ${configs.url}`);
    this.logger.log(`  - Headers: ${JSON.stringify(configs.headers, null, 2)}`);

    this.logger.log(`Airtime topup payload == ${JSON.stringify(configs)}`);
    this.logger.log(`=== AIRTIME SERVICE PROCESSING END ===`);

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