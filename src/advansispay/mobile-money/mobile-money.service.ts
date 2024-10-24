import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { PAYSWTICH_PROD_BASEURL, PROCESSING_CODE_DEBIT } from 'src/constants';
import { TransactionService } from 'src/transaction/transaction.service';
import { GeneratorUtil } from 'src/utilities/generator.util';
import { Agent } from 'https'; // Add this import statement

@Injectable()
export class MobileMoneyService {
    private logger = new Logger(MobileMoneyService.name);
    private readonly psUrl = PAYSWTICH_PROD_BASEURL + '/v1.1/transaction/process';

    constructor(
        private readonly httpService: HttpService,
        private transactionService: TransactionService
    ) { }

    async processTransaction(transData: any): Promise<any> {
        const base64_encode = GeneratorUtil.generateMerchantKey(); // Generate the merchant key

        const ptParams: any = {
            amount: transData.amount,
            processing_code: PROCESSING_CODE_DEBIT || process.env.PROCESSING_CODE_DEBIT,
            transaction_id: GeneratorUtil.generateTransactionIdPayswitch() || 'TNX-',
            desc: transData.description || `debit GhS${transData.amount} from ${transData.customerMsisdn} momo wallet.`,
            merchant_id: 'TTM-00006115',
            subscriber_number: transData.customerMsisdn,
            'r-switch': transData.channel,
        };

        const configs = {
            url: this.psUrl, // Use the existing psUrl
            data: ptParams, // Use ptParams as the request body
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${base64_encode}`, // Set the Authorization header
            },
            httpsAgent: new Agent({ // Change this line
                rejectUnauthorized: false,
            }),
        };

        try {
            console.log('Sending transaction data:', JSON.stringify(ptParams)); // Log the request data
            const response: AxiosResponse<any> = await firstValueFrom(
                this.httpService.post(configs.url, configs.data, { headers: configs.headers, httpsAgent: configs.httpsAgent })
            );
            // Save or update the transaction based on the response
            await this.saveOrUpdateTransaction(response.data);
            return response.data;
        } catch (error) {
            // Improved error handling
            this.handleError(error);
        }
    }

    private async saveOrUpdateTransaction(responseData: any): Promise<void> {
        const dwParamSave = {
            paymentServiceStatus: '',
            paymentTransactionId: responseData.transaction_id,
            paymentServiceMessage: responseData.reason,
            paymentStatus: '',
            paymentCommentary: '',
            // Add any other necessary fields here
        };

        switch (responseData.status) {
            case 'Approved':
                dwParamSave.paymentServiceStatus = 'Success';
                dwParamSave.paymentCommentary = `Transaction successful: ${responseData.reason}`;
                // Update the transaction using the transactionId
                await this.transactionService.updateByTrxn(dwParamSave.paymentTransactionId, dwParamSave);
                break;

            case 'failed':
                dwParamSave.paymentServiceStatus = 'Failed';
                dwParamSave.paymentCommentary = `Transaction failed: ${responseData.reason}`;
                // Update the transaction using the transactionId
                await this.transactionService.updateByTrxn(dwParamSave.paymentTransactionId, dwParamSave);
                break;

            case 'null':
            case null:
                dwParamSave.paymentServiceStatus = 'Pending';
                dwParamSave.paymentCommentary = `Transaction is pending: ${responseData.reason}`;
                // Update the transaction using the transactionId
                await this.transactionService.updateByTrxn(dwParamSave.paymentTransactionId, dwParamSave);
                break;

            case 'PIN_LOCKED':
                dwParamSave.paymentServiceStatus = 'Failed';
                dwParamSave.paymentCommentary = `Transaction failed due to PIN lock: ${responseData.reason}`;
                // Update the transaction using the transactionId
                await this.transactionService.updateByTrxn(dwParamSave.paymentTransactionId, dwParamSave);
                break;

            case 'error':
                dwParamSave.paymentServiceStatus = 'Failed';
                dwParamSave.paymentCommentary = `Transaction failed with error: ${responseData.reason}`;
                // Update the transaction using the transactionId
                await this.transactionService.updateByTrxn(dwParamSave.paymentTransactionId, dwParamSave);
                break;

            case 'TIMEOUT':
                dwParamSave.paymentServiceStatus = 'Failed';
                dwParamSave.paymentCommentary = `Transaction failed due to timeout: ${responseData.reason}`;
                // Update the transaction using the transactionId
                await this.transactionService.updateByTrxn(dwParamSave.paymentTransactionId, dwParamSave);
                break;

            default:
                this.logger.warn(`Unhandled transaction status: ${responseData.status}`);
                break;
        }
    }
    // Error  handling
    private handleError(error: any): void {
        const errorMessage = error.response?.data?.reason || error.message || 'Unknown error occurred';
        const statusCode = error.response?.status; // Capture the status code
        // Log the entire error response for debugging
        console.error(`Transaction failed: ${JSON.stringify(error.response?.data)} (Status Code: ${statusCode})`);
        throw new Error(`Transaction failed: ${errorMessage} (Status Code: ${statusCode})`);
    }
}
