"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ReloadlyDataService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReloadlyDataService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const constants_1 = require("../../constants");
const transaction_service_1 = require("../../transaction/transaction.service");
const generator_util_1 = require("../../utilities/generator.util");
const config_1 = require("@nestjs/config");
let ReloadlyDataService = ReloadlyDataService_1 = class ReloadlyDataService {
    constructor(httpService, transService, configService) {
        this.httpService = httpService;
        this.transService = transService;
        this.configService = configService;
        this.logger = new common_1.Logger(ReloadlyDataService_1.name);
        this.reloadLyBaseURL = this.configService.get('RELOADLY_TOPUPS_BASEURL', constants_1.RELOADLY_BASEURL_LIVE);
        this.accessTokenURL = this.configService.get('RELOADLY_AUTH_BASEURL', constants_1.RELOADLY_AUTH_BASEURL);
    }
    async getReloadlyData() {
        return 'Reloadly Data is working';
    }
    async buyInternetData(dto) {
        const accessToken = await this.reloadlyAccessToken();
        const { operatorId, amount, recipientEmail, recipientNumber, senderNumber, recipientCountryCode, senderCountryCode, currency, userId, userName, operatorName } = dto;
        if (isNaN(amount) || Number(amount) <= 0) {
            throw new common_1.BadRequestException('Invalid amount provided');
        }
        const payload = {
            operatorId,
            amount: Number(amount),
            useLocalAmount: false,
            customIdentifier: generator_util_1.GeneratorUtil.generateTransactionId(),
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
        const toSave = {
            userId: userId,
            userName: userName,
            transType: 'GLOBAL DATA',
            retailer: 'RELOADLY',
            network: String(operatorId),
            operator: operatorName || '',
            transId: payload.customIdentifier,
            trxn: payload.customIdentifier,
            monetary: {
                amount: Number(amount) + Number(constants_1.FEE_CHARGES),
                fee: Number(constants_1.FEE_CHARGES) || 0,
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
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, { headers }));
            const data = response.data;
            if (!data || !data.status) {
                throw new Error('Invalid response structure from Reloadly API');
            }
            const reloadlyStatus = data.status;
            let transactionStatus = 'pending';
            let serviceStatus = 'inprogress';
            let paymentStatus = 'pending';
            if (reloadlyStatus === 'SUCCESSFUL' || reloadlyStatus === 'SUCCESS') {
                transactionStatus = 'SUCCESSFUL';
                serviceStatus = 'completed';
                paymentStatus = 'completed';
            }
            else if (reloadlyStatus === 'FAILED' || reloadlyStatus === 'FAILURE') {
                transactionStatus = 'FAILED';
                serviceStatus = 'failed';
                paymentStatus = 'failed';
            }
            else if (reloadlyStatus === 'PENDING' || reloadlyStatus === 'PROCESSING') {
                transactionStatus = 'pending';
                serviceStatus = 'inprogress';
                paymentStatus = 'pending';
            }
            toSave.status.transaction = transactionStatus;
            toSave.status.service = serviceStatus;
            toSave.status.payment = paymentStatus;
            toSave.payment.transactionId = data.transactionId || '';
            toSave.payment.operatorTransactionId = data.operatorTransactionId || '';
            toSave.payment.serviceMessage = data.message || '';
            toSave.payment.status = paymentStatus;
            toSave.payment.serviceCode = reloadlyStatus;
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
            };
            if (transactionStatus === 'SUCCESSFUL') {
                toSave.commentary = `Global data topup successful delivered to ${recipientNumber}`;
            }
            else if (transactionStatus === 'FAILED') {
                toSave.commentary = `Global data topup failed: ${data.message || 'Unknown error'}`;
            }
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
                await this.transService.updateByTransId(toSave.transId, updateData);
                this.logger.debug(`Data transaction ${toSave.transId} updated successfully with status: ${transactionStatus}`);
            }
            catch (updateError) {
                this.logger.error(`Failed to update data transaction ${toSave.transId}: ${updateError.message}`);
            }
            return data;
        }
        catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Unknown error';
            const errorCode = error?.response?.data?.errorCode || 'UNKNOWN_ERROR';
            toSave.status.transaction = 'FAILED';
            toSave.status.service = 'failed';
            toSave.status.payment = 'failed';
            toSave.payment.serviceMessage = message;
            toSave.payment.serviceCode = errorCode;
            toSave.payment.status = 'failed';
            toSave.payment.transactionId = error?.response?.data?.transactionId || '';
            toSave.commentary = `Global data topup failed: ${message}`;
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
                await this.transService.updateByTrxn(toSave.trxn, updateData);
                this.logger.debug(`Data transaction ${toSave.trxn} updated with FAILED status`);
            }
            catch (updateError) {
                this.logger.error(`Failed to update failed data transaction ${toSave.trxn}: ${updateError.message}`);
            }
            throw new common_1.NotFoundException(`Data top-up failed: ${message}`);
        }
    }
    async autoDetectOperator(msisdn, countryCode) {
        const accessToken = await this.reloadlyAccessToken();
        const url = `${this.reloadLyBaseURL}/operators/auto-detect/phone/${msisdn}/countries/${countryCode}`;
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/com.reloadly.topups-v1+json',
            Authorization: `Bearer ${accessToken}`,
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers }));
            this.logger.debug(`Auto-detect response: ${JSON.stringify(response.data)}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Auto-detect failed: ${JSON.stringify(error?.response?.data)}`);
            throw new common_1.NotFoundException(error?.response?.data || 'Failed to auto-detect operator');
        }
    }
    async listDataOperators(countryCode) {
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
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers }));
            console.log("List data operators response: " + JSON.stringify(response.data));
            return response.data;
        }
        catch (error) {
            this.logger.error(`List data operators failed: ${JSON.stringify(error?.response?.data)}`);
            throw new common_1.NotFoundException(error?.response?.data || 'Failed to list data operators');
        }
    }
    async getDataStatus(trxnId) {
        const accessToken = await this.reloadlyAccessToken();
        const url = `${this.reloadLyBaseURL}/topups/${trxnId}/status`;
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/com.reloadly.topups-v1+json',
            Authorization: `Bearer ${accessToken}`,
        };
        this.logger.debug(`Data status check URL: ${url}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { headers }));
            const data = response.data;
            this.logger.debug(`Data status response: ${JSON.stringify(data)}`);
            if (data && data.status) {
                const reloadlyStatus = data.status;
                let transactionStatus = 'pending';
                let serviceStatus = 'inprogress';
                let paymentStatus = 'pending';
                if (reloadlyStatus === 'SUCCESSFUL' || reloadlyStatus === 'SUCCESS') {
                    transactionStatus = 'SUCCESSFUL';
                    serviceStatus = 'completed';
                    paymentStatus = 'completed';
                }
                else if (reloadlyStatus === 'FAILED' || reloadlyStatus === 'FAILURE') {
                    transactionStatus = 'FAILED';
                    serviceStatus = 'failed';
                    paymentStatus = 'failed';
                }
                else if (reloadlyStatus === 'PENDING' || reloadlyStatus === 'PROCESSING') {
                    transactionStatus = 'pending';
                    serviceStatus = 'inprogress';
                    paymentStatus = 'pending';
                }
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
                    await this.transService.updateByTransId(trxnId, updateData);
                    this.logger.debug(`Data transaction ${trxnId} status updated to: ${transactionStatus}`);
                }
                catch (updateError) {
                    this.logger.error(`Failed to update data transaction ${trxnId} status: ${updateError.message}`);
                }
            }
            return data;
        }
        catch (error) {
            this.logger.error(`Error fetching data status: ${JSON.stringify(error?.response?.data)}`);
            throw new common_1.NotFoundException(error?.response?.data || 'Failed to fetch data status');
        }
    }
    async reloadlyAccessToken() {
        const tokenPayload = {
            client_id: constants_1.RELOADLY_CLIENT_ID,
            client_secret: constants_1.RELOADLY_CLIENT_SECRET,
            grant_type: constants_1.RELOADLY_GRANT_TYPE,
            audience: constants_1.RELOADLY_AUDIENCE,
        };
        const tokenUrl = `${this.accessTokenURL}/oauth/token`;
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(tokenUrl, tokenPayload));
            const accessToken = response.data.access_token;
            return accessToken;
        }
        catch (error) {
            this.logger.error(`Error generating access token: ${error.message}`);
            throw new common_1.NotFoundException('Failed to generate access token');
        }
    }
};
exports.ReloadlyDataService = ReloadlyDataService;
exports.ReloadlyDataService = ReloadlyDataService = ReloadlyDataService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        transaction_service_1.TransactionService,
        config_1.ConfigService])
], ReloadlyDataService);
//# sourceMappingURL=reloadly-data.service.js.map