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
        const { operatorId, amount, recipientEmail, recipientNumber, senderNumber, recipientCountryCode, currency, userId, userName, retailer, network, operatorName, } = airDto;
        const mtPayload = {
            operatorId,
            operatorName,
            amount,
            useLocalAmount: false,
            customIdentifier: generator_util_1.GeneratorUtil.generateTransactionId(),
            recipientEmail,
            recipientPhone: {
                countryCode: recipientCountryCode,
                number: recipientNumber,
            },
            senderPhone: {
                countryCode: airDto.senderCountryCode,
                number: senderNumber,
            },
        };
        const mtPayloadSave = {
            userId: userId,
            userName: userName,
            transType: 'RELOADLY AIRTIME TOPUP',
            retailer: 'RELOADLY',
            network: mtPayload.operatorId,
            operator: mtPayload.operatorName || '',
            trxn: mtPayload.customIdentifier || '',
            transId: mtPayload.customIdentifier,
            fee: constants_1.FEE_CHARGES || 0,
            originalAmount: amount || '',
            amount: (Number(amount) + Number(constants_1.FEE_CHARGES)).toString() || '',
            recipientNumber: recipientNumber || '',
            transMessage: `${userName} global topup airtime ${amount} GHS for ${mtPayload.operatorName} to ${recipientNumber}`,
            transStatus: 'pending',
            transCode: '',
            commentary: 'Global airtime topup transaction pending',
            balance_before: '',
            balance_after: '',
            currentBalance: '',
            currency: currency || 'GHS',
            serviceName: 'RELOADLY AIRTIME TOPUP',
            serviceStatus: 'inprogress',
            serviceCode: '',
            serviceTransId: '',
            serviceMessage: '',
            timestamp: ''
        };
        this.transService.create(mtPayloadSave);
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
            this.logger.debug(`MAKE TOPUP RESPONSE ++++ ${JSON.stringify(mtRes.data)}`);
            if (mtRes.data.status === 'SUCCESSFUL') {
                this.logger.log(`topup successful`);
                mtPayloadSave.serviceMessage = mtRes.data.message;
                mtPayloadSave.serviceTransId = mtRes.data.transactionId;
                mtPayloadSave.transStatus = mtRes.data.status;
                mtPayloadSave.serviceStatus = mtRes.data.status;
                mtPayloadSave.balance_before = mtRes.data.balanceInfo.oldBalance;
                mtPayloadSave.balance_after = mtRes.data.balanceInfo.newBalance;
                mtPayloadSave.currentBalance = mtRes.data.balanceInfo.newBalance;
                mtPayloadSave.operator = mtRes.data.operatorName;
                mtPayloadSave.network = mtRes.data.operatorId;
                mtPayloadSave.currency = mtRes.data.currencyCode;
                mtPayloadSave.commentary = 'Airtime topup transaction successful';
                this.transService.updateByTrxn(mtPayloadSave.trxn, mtPayloadSave);
            }
            return mtRes.data;
        }), (0, operators_1.catchError)((mtError) => {
            this.logger.error(`ERROR RELOADLY MAKE TOPUP RESPONSE --- ${JSON.stringify(mtError.response?.data)}`);
            const mtErrorMessage = mtError.response?.data || {};
            mtPayloadSave.serviceMessage = mtErrorMessage.message || 'Unknown error';
            mtPayloadSave.transStatus = 'FAILED';
            mtPayloadSave.serviceStatus = 'FAILED';
            mtPayloadSave.serviceCode = mtErrorMessage.errorCode || 'Unknown code';
            mtPayloadSave.timestamp = mtErrorMessage.timeStamp || new Date().toISOString();
            mtPayloadSave.commentary = `Airtime reload failed=> ${mtErrorMessage.message || 'Unknown error'}`;
            this.transService.updateByTrxn(mtPayloadSave.trxn, mtPayloadSave);
            throw new common_1.NotFoundException(mtErrorMessage);
        }));
    }
    async makeAsynchronousTopUp(matDto) {
        let rAccessToken = await this.reloadlyAccessToken();
        this.logger.debug(`Reloadly Token ==> ${rAccessToken}`);
        const { operatorId, operatorName, amount, recipientEmail, recipientNumber, senderNumber, recipientCountryCode, customIdentifier, currency, userId, userName, } = matDto;
        const matPayload = {
            operatorId,
            operatorName,
            amount,
            useLocalAmount: false,
            customIdentifier: generator_util_1.GeneratorUtil.generateTransactionId() || customIdentifier,
            recipientEmail,
            recipientPhone: {
                countryCode: recipientCountryCode,
                number: recipientNumber,
            },
            senderPhone: {
                countryCode: matDto.senderCountryCode,
                number: senderNumber,
            },
        };
        const matPayloadSave = {
            userId: userId,
            userName: userName,
            transType: 'RELOADLY',
            retailer: 'RELOADLY',
            network: matPayload.operatorId,
            operator: matPayload.operatorName,
            trxn: matPayload.customIdentifier || '',
            transId: matPayload.customIdentifier,
            fee: constants_1.FEE_CHARGES || 0,
            originalAmount: amount || '',
            amount: (Number(amount) + Number(constants_1.FEE_CHARGES)).toString() || '',
            recipientNumber: recipientNumber || '',
            transMessage: `${userName} global topup airtime ${amount} GHS for ${matPayload.operatorName} to ${recipientNumber}`,
            transStatus: 'pending',
            transCode: '',
            commentary: 'Global airtime topup transaction pending',
            currency: currency || 'GHS',
            serviceName: 'RELOADLY AIRTIME TOPUP',
            serviceStatus: 'inprogress',
            serviceCode: '',
            serviceTransId: '',
            serviceMessage: '',
        };
        this.transService.create(matPayloadSave);
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
            this.logger.debug(`MAKE ASYNC TOP-UP RESPONSE ++++ ${JSON.stringify(matRes.data)}`);
            if (matRes.data) {
                this.logger.log(`topup successful`);
                matPayloadSave.serviceMessage = matRes.data.message;
                matPayloadSave.serviceTransId = matRes.data.transactionId;
                matPayloadSave.transStatus = matRes.data.status;
                matPayloadSave.serviceStatus = matRes.data.status;
                matPayloadSave.balance_before = matRes.data.balanceInfo.oldBalance;
                matPayloadSave.balance_after = matRes.data.balanceInfo.newBalance;
                matPayloadSave.commentary = 'Airtime topup transaction successful';
                this.transService.updateByTrxn(matPayloadSave.trxn, matPayloadSave);
            }
            return matRes.data;
        }), (0, operators_1.catchError)((matError) => {
            this.logger.error(`MAKE ASYNC TOP-UP ERROR --- ${JSON.stringify(matError.response?.data)}`);
            const matErrorMessage = matError.response?.data || {};
            matPayloadSave.serviceMessage = matErrorMessage.message || 'Unknown error';
            matPayloadSave.transStatus = 'FAILED';
            matPayloadSave.serviceStatus = 'FAILED';
            matPayloadSave.serviceCode = matErrorMessage.errorCode || 'Unknown code';
            matPayloadSave.timestamp = matErrorMessage.timeStamp || new Date().toISOString();
            matPayloadSave.commentary = `Airtime reload failed: ${matErrorMessage.message || 'Unknown error'}`;
            this.transService.updateByTrxn(matPayloadSave.trxn, matPayloadSave);
            throw new common_1.NotFoundException(matErrorMessage);
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
        return '';
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
            const response = await this.httpService
                .post(tokenUrl, tokenPayload)
                .toPromise();
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