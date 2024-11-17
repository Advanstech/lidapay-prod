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
var ReloadAirtimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReloadAirtimeService = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../../constants");
const axios_1 = require("@nestjs/axios");
const operators_1 = require("rxjs/operators");
const generator_util_1 = require("../../utilities/generator.util");
const transaction_service_1 = require("../../transaction/transaction.service");
const rxjs_1 = require("rxjs");
let ReloadAirtimeService = ReloadAirtimeService_1 = class ReloadAirtimeService {
    constructor(httpService, transService) {
        this.httpService = httpService;
        this.transService = transService;
        this.logger = new common_1.Logger(ReloadAirtimeService_1.name);
        this.reloadLyBaseURL = constants_1.RELOADLY_BASEURL_SANDBOX;
        this.accessTokenURL = process.env.RELOADLY_BASEURL || constants_1.RELOADLY_BASEURL;
    }
    generateAccessToken() {
        const gatPayload = {
            client_id: process.env.RELOADLY_CLIENT_ID_SANDBOX || constants_1.RELOADLY_CLIENT_ID_SANDBOX,
            client_secret: process.env.RELOADLY_CLIENT_SECRET_SANDBOX ||
                constants_1.RELOADLY_CLIENT_SECRET_SANDBOX,
            grant_type: process.env.RELOADLY_GRANT_TYPE_SANDBOX || constants_1.RELOADLY_GRANT_TYPE_SANDBOX,
            audience: process.env.RELOADLY_AUDIENCE_SANDBOX || constants_1.RELOADLY_AUDIENCE_SANDBOX,
        };
        const gatURL = `${this.accessTokenURL}/oauth/token`;
        const configs = {
            url: gatURL,
            body: gatPayload,
        };
        this.logger.log(`Access token http configs == ${JSON.stringify(configs)}`);
        return this.httpService.post(configs.url, configs.body).pipe((0, operators_1.map)((gatRes) => {
            this.logger.debug(`ACCESS TOKEN HTTPS RESPONSE ++++ ${JSON.stringify(gatRes.data)}`);
            return { accessToken: gatRes.data.access_token };
        }), (0, operators_1.catchError)((gatError) => {
            this.logger.error(`ERROR ACCESS TOKEN RESPONSE --- ${JSON.stringify(gatError.response.data)}`);
            throw new common_1.NotFoundException(gatError.response.data);
        }));
    }
    async makeTopUp(airDto) {
        let rAccessToken = await this.reloadlyAccessToken();
        this.logger.debug(`Reloadly Token::: ${rAccessToken}`);
        const { operatorId, amount, recipientEmail, recipientNumber, senderNumber, recipientCountryCode, currency, userId, userName, retailer, network, operatorName, senderCountryCode, } = airDto;
        if (isNaN(amount) || amount <= 0) {
            this.logger.error(`Invalid amount provided: ${amount}`);
            throw new common_1.BadRequestException('Invalid amount provided');
        }
        const mtPayload = {
            operatorId,
            operatorName,
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
        this.logger.debug(`make topup payload: ${JSON.stringify(mtPayload)}`);
        const mtPayloadSave = {
            userId: userId,
            userName: userName,
            transType: 'GLOBAL AIRTIME',
            retailer: 'RELOADLY',
            network: operatorId,
            operator: operatorName || '',
            transId: mtPayload.customIdentifier,
            trxn: mtPayload.customIdentifier,
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
                type: 'airtime',
                currency: currency || 'GHS',
                commentary: `${userName} global topup airtime ${amount} GHS for ${operatorName} to ${recipientNumber}`,
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
            commentary: 'Global airtime topup transaction pending',
        };
        await this.transService.create(mtPayloadSave);
        const mtURL = `https://topups-sandbox.reloadly.com/topups`;
        const config = {
            url: mtURL,
            body: mtPayload,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/com.reloadly.topups-v1+json',
                Authorization: `Bearer ${rAccessToken}`,
            },
        };
        this.logger.log(`Access token http configs == ${JSON.stringify(config)}`);
        return this.httpService
            .post(config.url, config.body, { headers: config.headers })
            .pipe((0, operators_1.map)((mtRes) => {
            if (!mtRes.data || !mtRes.data.status) {
                throw new Error('Invalid response structure from Reloadly API');
            }
            mtPayloadSave.status.transaction = mtRes.data.status;
            mtPayloadSave.payment.transactionId = mtRes.data.transactionId;
            mtPayloadSave.payment.operatorTransactionId = mtRes.data.operatorTransactionId;
            mtPayloadSave.payment.serviceMessage = mtRes.data.message;
            mtPayloadSave.monetary = {
                amount: mtRes.data.requestedAmount,
                fee: mtRes.data.fee || 0,
                discount: mtRes.data.discount || 0,
                originalAmount: mtRes.data.requestedAmount.toString(),
                currency: mtRes.data.requestedAmountCurrencyCode || 'GHS',
                balance_before: mtRes.data.balanceInfo.oldBalance.toString(),
                balance_after: mtRes.data.balanceInfo.newBalance.toString(),
                currentBalance: mtRes.data.balanceInfo.currencyCode,
                deliveredAmount: mtRes.data.deliveredAmount,
                requestedAmount: mtRes.data.requestedAmount
            };
            this.transService.updateByTransId(mtPayloadSave.transId, mtPayloadSave);
            return mtRes.data;
        }), (0, operators_1.catchError)((mtError) => {
            this.logger.error(`MAKE ASYNC TOP-UP ERROR --- ${JSON.stringify(mtError.response?.data)}`);
            const matErrorMessage = mtError.response?.data?.message || 'Unknown error';
            mtPayloadSave.payment.serviceMessage = matErrorMessage;
            mtPayloadSave.status.transaction = 'FAILED';
            mtPayloadSave.status.service = 'FAILED';
            mtPayloadSave.payment.serviceCode = mtError.response?.data?.errorCode || 'Unknown code';
            mtPayloadSave.commentary = `Airtime reload failed: ${matErrorMessage}`;
            this.transService.updateByTrxn(mtPayloadSave.trxn, mtPayloadSave);
            throw new common_1.NotFoundException(`Asynchronous top-up failed: ${matErrorMessage}`);
        }));
    }
    async makeAsynchronousTopUp(matDto) {
        let rAccessToken = await this.reloadlyAccessToken();
        this.logger.debug(`Reloadly Token ==> ${rAccessToken}`);
        const { operatorId, operatorName, amount, recipientEmail, recipientNumber, senderNumber, recipientCountryCode, customIdentifier, currency, userId, userName, senderCountryCode } = matDto;
        if (isNaN(amount) || amount <= 0) {
            this.logger.error(`Invalid amount provided: ${amount}`);
            throw new common_1.BadRequestException('Invalid amount provided');
        }
        const matPayload = {
            operatorId,
            amount: Number(amount),
            useLocalAmount: false,
            customIdentifier: generator_util_1.GeneratorUtil.generateTransactionId() || customIdentifier,
            recipientEmail,
            recipientPhone: {
                countryCode: recipientCountryCode,
                number: recipientNumber,
            },
            senderPhone: {
                countryCode: senderCountryCode,
                number: senderNumber,
            },
            currency: currency || 'GHS',
        };
        console.debug(`reloadly asynchronous topup payload ===> ${JSON.stringify(matPayload)}`);
        const matPayloadSave = {
            userId,
            userName,
            transType: 'RELOADLY',
            retailer: 'RELOADLY',
            network: operatorId,
            operator: operatorName,
            trxn: matPayload.customIdentifier,
            transId: matPayload.customIdentifier,
            monetary: {
                amount: Number(amount) + Number(constants_1.FEE_CHARGES),
                fee: Number(constants_1.FEE_CHARGES) || 0,
                discount: 0,
                originalAmount: String(Number(amount) || 0),
                currency: currency || 'GHS',
                balance_before: String(0),
                balance_after: String(0),
                currentBalance: String(0),
            },
            status: {
                transaction: 'pending',
                service: 'inprogress',
                payment: '',
            },
            payment: {
                type: 'airtime',
                currency: currency || 'GHS',
                commentary: `${userName} global topup airtime ${amount} GHS for ${operatorName} to ${recipientNumber}`,
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
            commentary: 'Global airtime topup transaction pending',
        };
        await this.transService.create(matPayloadSave);
        const matURL = `https://topups-sandbox.reloadly.com/topups-async`;
        const config = {
            url: matURL,
            body: matPayload,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/com.reloadly.topups-v1+json',
                Authorization: `Bearer ${rAccessToken}`,
            },
        };
        this.logger.log(`Make Async TopUp configs == ${JSON.stringify(config)}`);
        return this.httpService
            .post(config.url, config.body, { headers: config.headers })
            .pipe((0, operators_1.map)((matRes) => {
            if (!matRes.data || !matRes.data.status) {
                throw new Error('Invalid response structure from Reloadly API');
            }
            matPayloadSave.status.transaction = matRes.data.status;
            matPayloadSave.payment.transactionId = matRes.data.transactionId;
            matPayloadSave.payment.serviceMessage = matRes.data.message;
            this.transService.updateByTransId(matPayloadSave.transId, matPayloadSave);
            return matRes.data;
        }), (0, operators_1.catchError)((matError) => {
            this.logger.error(`MAKE ASYNC TOP-UP ERROR --- ${JSON.stringify(matError)}`);
            const matErrorMessage = matError.response?.data?.message || 'Unknown error';
            matPayloadSave.payment.serviceMessage = matErrorMessage;
            matPayloadSave.status.transaction = 'FAILED';
            matPayloadSave.status.service = 'FAILED';
            matPayloadSave.payment.serviceCode = matError.response?.data?.errorCode || 'Unknown code';
            matPayloadSave.commentary = `Airtime reload failed: ${matErrorMessage}`;
            console.debug('matPayload save: ', matPayloadSave.trxn);
            this.transService.updateByTrxn(matPayloadSave.trxn, matPayloadSave);
            throw new common_1.NotFoundException(`Asynchronous top-up failed: ${matErrorMessage}`);
        }));
    }
    async getTopupStatus(trxnId) {
        const accessToken = await this.reloadlyAccessToken();
        const config = {
            url: `${this.reloadLyBaseURL}/topups/${trxnId}/status`,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/com.reloadly.topups-v1+json',
                Authorization: `Bearer ${accessToken}`,
            },
        };
        this.logger.debug(`TOPUP STATUS CONFIG: ${JSON.stringify(config)}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(config.url, { headers: config.headers })
                .pipe((0, operators_1.map)((gtsRes) => {
                this.logger.debug(`RELOADLY AIRTIME TOPUP  STATUS --- ${JSON.stringify(gtsRes.data)}`);
            }), (0, operators_1.catchError)(error => {
                this.logger.error(`Error fetching topup status: ${JSON.stringify(error.response?.data)}`);
                throw new common_1.NotFoundException(error.response?.data || 'Failed to fetch topup status');
            })));
            return response;
        }
        catch (error) {
            throw error;
        }
    }
    async numberLookup(accessToken, msisdn) {
        const url = `${this.reloadLyBaseURL}/airtime/number-lookup?msisdn=${msisdn}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/com.reloadly.topups-v1+json',
                Authorization: `Bearer ${accessToken}`,
            },
        };
        this.logger.debug(`Number lookup request URL: ${url}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, config));
            this.logger.debug(`Number lookup response: ${JSON.stringify(response.data)}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to lookup number ${msisdn}: ${error.message}`);
            throw new common_1.NotFoundException(`Failed to lookup number: ${error.message}`);
        }
    }
    async reloadlyAccessToken() {
        const tokenPayload = {
            client_id: constants_1.RELOADLY_CLIENT_ID_SANDBOX,
            client_secret: constants_1.RELOADLY_CLIENT_SECRET_SANDBOX,
            grant_type: constants_1.RELOADLY_GRANT_TYPE_SANDBOX,
            audience: constants_1.RELOADLY_AUDIENCE_SANDBOX,
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
exports.ReloadAirtimeService = ReloadAirtimeService;
exports.ReloadAirtimeService = ReloadAirtimeService = ReloadAirtimeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        transaction_service_1.TransactionService])
], ReloadAirtimeService);
//# sourceMappingURL=reload-airtime.service.js.map