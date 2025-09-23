import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RELOADLY_BASEURL, FEE_CHARGES, RELOADLY_BASEURL_LIVE, RELOADLY_CLIENT_ID, RELOADLY_CLIENT_SECRET, RELOADLY_GRANT_TYPE, RELOADLY_AUDIENCE, RELOADLY_AUTH_BASEURL } from 'src/constants';
import { TransactionService } from 'src/transaction/transaction.service';
import { GeneratorUtil } from 'src/utilities/generator.util';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import { UpdateTransactionDto } from 'src/transaction/dto/update-transaction.dto';
import { BuyDataDto } from './dto/buy-data.dto';
import { ReloadDataDto } from './dto/reload.data.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReloadlyDataService {
    private readonly logger = new Logger(ReloadlyDataService.name);
    private readonly reloadLyBaseURL: string;
    private readonly accessTokenURL: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly transService: TransactionService,
        private readonly configService: ConfigService,
    ) {
        this.reloadLyBaseURL = this.configService.get<string>('RELOADLY_TOPUPS_BASEURL', RELOADLY_BASEURL_LIVE);
        this.accessTokenURL = this.configService.get<string>('RELOADLY_AUTH_BASEURL', RELOADLY_AUTH_BASEURL);
    }
    /**
     * Get reloadly data
     * @returns 
     */
    async getReloadlyData() {
        return 'Reloadly Data is working';
    }
    /**
     * Buy internet data
     * @param dto 
     * @returns 
     */
    async buyInternetData(dto: ReloadDataDto): Promise<any> {
        const accessToken = await this.reloadlyAccessToken();
        const {
            operatorId,
            amount,
            recipientEmail,
            recipientNumber,
            senderNumber,
            recipientCountryCode,
            senderCountryCode,
            currency,
            userId,
            userName,
            operatorName
        } = dto;

        if (isNaN(amount) || Number(amount) <= 0) {
            throw new BadRequestException('Invalid amount provided');
        }

        const payload: any = {
            operatorId,
            amount: Number(amount),
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

        const toSave: CreateTransactionDto = {
            userId: userId,
            userName: userName,
            transType: 'GLOBAL DATA',
            retailer: 'RELOADLY',
            network: String(operatorId),
            operator: operatorName || '',
            transId: payload.customIdentifier,
            trxn: payload.customIdentifier,
            monetary: {
                amount: Number(amount) + Number(FEE_CHARGES),
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
                payment: '',
            },
            payment: {
                type: 'data',
                currency: currency || 'GHS',
                commentary: `${userName} global data topup ${amount} ${currency || 'GHS'} for ${operatorName} to ${recipientNumber}`,
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
            commentary: 'Global data topup transaction pending',
        };

        await this.transService.create(toSave);

        const url = `${this.reloadLyBaseURL}/topups`;
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/com.reloadly.topups-v1+json',
            Authorization: `Bearer ${accessToken}`,
        };

        try {
            const response = await firstValueFrom(this.httpService.post(url, payload, { headers }));
            const data = response.data;

            if (!data || !data.status) {
                throw new Error('Invalid response structure from Reloadly API');
            }

            toSave.status.transaction = data.status;
            toSave.payment.transactionId = data.transactionId;
            toSave.payment.operatorTransactionId = data.operatorTransactionId;
            toSave.payment.serviceMessage = data.message;

            toSave.monetary = {
                amount: data.requestedAmount,
                fee: data.fee || 0,
                discount: data.discount || 0,
                originalAmount: data.requestedAmount?.toString?.() || String(amount),
                currency: data.requestedAmountCurrencyCode || currency || 'GHS',
                balance_before: data.balanceInfo?.oldBalance?.toString?.() || '0',
                balance_after: data.balanceInfo?.newBalance?.toString?.() || '0',
                currentBalance: data.balanceInfo?.currencyCode || '0',
                deliveredAmount: data.deliveredAmount,
                requestedAmount: data.requestedAmount
            } as any;

            this.transService.updateByTransId(toSave.transId, toSave as UpdateTransactionDto);

            return data;
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Unknown error';
            toSave.payment.serviceMessage = message;
            toSave.status.transaction = 'FAILED';
            toSave.status.service = 'FAILED';
            toSave.payment.serviceCode = error?.response?.data?.errorCode || 'Unknown code';
            toSave.commentary = `Data reload failed: ${message}`;
            this.transService.updateByTrxn(toSave.trxn, toSave as UpdateTransactionDto);
            throw new NotFoundException(`Data top-up failed: ${message}`);
        }
    }
    /**
     * Auto detect operator
     * @param msisdn 
     * @param countryCode 
     * @returns 
     */
    async autoDetectOperator(msisdn: string, countryCode: string) {
        const accessToken = await this.reloadlyAccessToken();
        const url = `${this.reloadLyBaseURL}/operators/auto-detect/phone/${msisdn}/countries/${countryCode}`;
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/com.reloadly.topups-v1+json',
            Authorization: `Bearer ${accessToken}`,
        };
        try {
            const response = await firstValueFrom(this.httpService.get(url, { headers }));
            this.logger.debug(`Auto-detect response: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Auto-detect failed: ${JSON.stringify(error?.response?.data)}`);
            throw new NotFoundException(error?.response?.data || 'Failed to auto-detect operator');
        }
    }
    /**
     * List data operators
     * @param countryCode 
     * @returns 
     */
    async listDataOperators(countryCode: string): Promise<any> {
        const code = (countryCode || '').toUpperCase();
        const accessToken = await this.reloadlyAccessToken();
        const url = `${this.reloadLyBaseURL}/operators/countries/${code}?includeData=true`;
        console.log("List data operators URL: " + url);
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/com.reloadly.topups-v1+json',
            Authorization: `Bearer ${accessToken}`,
        };
        try {
            const response = await firstValueFrom(this.httpService.get(url, { headers }));
            console.log("List data operators response: " + JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            this.logger.error(`List data operators failed: ${JSON.stringify(error?.response?.data)}`);
            throw new NotFoundException(error?.response?.data || 'Failed to list data operators');
        }
    }
    /**
     * Reloadly access token
     * @returns 
     */
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
