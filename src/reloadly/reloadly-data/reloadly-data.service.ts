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

            // Map Reloadly status to our transaction status
            const reloadlyStatus = data.status;
            let transactionStatus = 'pending';
            let serviceStatus = 'inprogress';
            let paymentStatus = 'pending';
            
            if (reloadlyStatus === 'SUCCESSFUL' || reloadlyStatus === 'SUCCESS') {
                transactionStatus = 'SUCCESSFUL';
                serviceStatus = 'completed';
                paymentStatus = 'completed';
            } else if (reloadlyStatus === 'FAILED' || reloadlyStatus === 'FAILURE') {
                transactionStatus = 'FAILED';
                serviceStatus = 'failed';
                paymentStatus = 'failed';
            } else if (reloadlyStatus === 'PENDING' || reloadlyStatus === 'PROCESSING') {
                transactionStatus = 'pending';
                serviceStatus = 'inprogress';
                paymentStatus = 'pending';
            }

            // Update transaction status
            toSave.status.transaction = transactionStatus;
            toSave.status.service = serviceStatus;
            toSave.status.payment = paymentStatus;

            // Update payment details
            toSave.payment.transactionId = data.transactionId || '';
            toSave.payment.operatorTransactionId = data.operatorTransactionId || '';
            toSave.payment.serviceMessage = data.message || '';
            toSave.payment.status = paymentStatus;
            toSave.payment.serviceCode = reloadlyStatus;

            // Update monetary details
            toSave.monetary = {
                amount: data.requestedAmount || Number(amount),
                fee: data.fee || 0,
                discount: data.discount || 0,
                originalAmount: (data.requestedAmount || Number(amount)).toString(),
                currency: data.requestedAmountCurrencyCode || currency || 'GHS',
                balance_before: data.balanceInfo?.oldBalance?.toString() || '0',
                balance_after: data.balanceInfo?.newBalance?.toString() || '0',
                currentBalance: data.balanceInfo?.currencyCode || currency || 'GHS',
                deliveredAmount: data.deliveredAmount || 0,
                requestedAmount: data.requestedAmount || Number(amount)
            } as any;

            // Update commentary based on status
            if (transactionStatus === 'SUCCESSFUL') {
                toSave.commentary = `Global data topup successful delivered to ${recipientNumber}`;
            } else if (transactionStatus === 'FAILED') {
                toSave.commentary = `Global data topup failed: ${data.message || 'Unknown error'}`;
            }

            // Update the transaction in the database with correct field names
            try {
                const updateData = {
                    status: {
                        transaction: transactionStatus,
                        service: serviceStatus,
                        payment: paymentStatus
                    },
                    paymentStatus: paymentStatus,
                    paymentServiceCode: reloadlyStatus,
                    paymentServiceMessage: data.message || '',
                    paymentTransactionId: data.transactionId || '',
                    commentary: transactionStatus === 'SUCCESSFUL' 
                        ? `Global data topup successful delivered to ${recipientNumber}`
                        : transactionStatus === 'FAILED' 
                          ? `Global data topup failed: ${data.message || 'Unknown error'}`
                          : 'Global data topup transaction pending'
                };
                
                await this.transService.updateByTransId(toSave.transId, updateData as UpdateTransactionDto);
                this.logger.debug(`Data transaction ${toSave.transId} updated successfully with status: ${transactionStatus}`);
            } catch (updateError) {
                this.logger.error(`Failed to update data transaction ${toSave.transId}: ${updateError.message}`);
            }

            return data;
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Unknown error';
            const errorCode = error?.response?.data?.errorCode || 'UNKNOWN_ERROR';
            
            // Update transaction status for failure
            toSave.status.transaction = 'FAILED';
            toSave.status.service = 'failed';
            toSave.status.payment = 'failed';
            
            // Update payment details for failure
            toSave.payment.serviceMessage = message;
            toSave.payment.serviceCode = errorCode;
            toSave.payment.status = 'failed';
            toSave.payment.transactionId = error?.response?.data?.transactionId || '';
            
            // Update commentary
            toSave.commentary = `Global data topup failed: ${message}`;
            
            // Update the transaction status in the database
            try {
                const updateData = {
                    status: {
                        transaction: 'FAILED',
                        service: 'failed',
                        payment: 'failed'
                    },
                    paymentStatus: 'failed',
                    paymentServiceCode: errorCode,
                    paymentServiceMessage: message,
                    paymentTransactionId: error?.response?.data?.transactionId || '',
                    commentary: `Global data topup failed: ${message}`
                };
                
                await this.transService.updateByTrxn(toSave.trxn, updateData as UpdateTransactionDto);
                this.logger.debug(`Data transaction ${toSave.trxn} updated with FAILED status`);
            } catch (updateError) {
                this.logger.error(`Failed to update failed data transaction ${toSave.trxn}: ${updateError.message}`);
            }
            
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
     * Get data transaction status
     * @param trxnId 
     * @returns 
     */
    async getDataStatus(trxnId: string): Promise<any> {
        const accessToken = await this.reloadlyAccessToken();
        const url = `${this.reloadLyBaseURL}/topups/${trxnId}/status`;
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/com.reloadly.topups-v1+json',
            Authorization: `Bearer ${accessToken}`,
        };
        
        this.logger.debug(`Data status check URL: ${url}`);
        
        try {
            const response = await firstValueFrom(this.httpService.get(url, { headers }));
            const data = response.data;
            
            this.logger.debug(`Data status response: ${JSON.stringify(data)}`);
            
            // Update transaction status based on Reloadly status
            if (data && data.status) {
                const reloadlyStatus = data.status;
                let transactionStatus = 'pending';
                let serviceStatus = 'inprogress';
                let paymentStatus = 'pending';
                
                if (reloadlyStatus === 'SUCCESSFUL' || reloadlyStatus === 'SUCCESS') {
                    transactionStatus = 'SUCCESSFUL';
                    serviceStatus = 'completed';
                    paymentStatus = 'completed';
                } else if (reloadlyStatus === 'FAILED' || reloadlyStatus === 'FAILURE') {
                    transactionStatus = 'FAILED';
                    serviceStatus = 'failed';
                    paymentStatus = 'failed';
                } else if (reloadlyStatus === 'PENDING' || reloadlyStatus === 'PROCESSING') {
                    transactionStatus = 'pending';
                    serviceStatus = 'inprogress';
                    paymentStatus = 'pending';
                }
                
                // Update transaction in database
                try {
                    const updateData = {
                        status: {
                            transaction: transactionStatus,
                            service: serviceStatus,
                            payment: paymentStatus
                        },
                        paymentStatus: paymentStatus,
                        paymentServiceCode: reloadlyStatus,
                        paymentServiceMessage: data.message || '',
                        paymentTransactionId: data.transactionId || '',
                        commentary: transactionStatus === 'SUCCESSFUL' 
                            ? `Global data topup successful delivered` 
                            : transactionStatus === 'FAILED' 
                              ? `Global data topup failed: ${data.message || 'Unknown error'}`
                              : 'Global data topup transaction pending'
                    };
                    
                    await this.transService.updateByTransId(trxnId, updateData as UpdateTransactionDto);
                    this.logger.debug(`Data transaction ${trxnId} status updated to: ${transactionStatus}`);
                } catch (updateError) {
                    this.logger.error(`Failed to update data transaction ${trxnId} status: ${updateError.message}`);
                }
            }
            
            return data;
        } catch (error) {
            this.logger.error(`Error fetching data status: ${JSON.stringify(error?.response?.data)}`);
            throw new NotFoundException(error?.response?.data || 'Failed to fetch data status');
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
