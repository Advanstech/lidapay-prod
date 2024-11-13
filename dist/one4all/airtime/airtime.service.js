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
var AirtimeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirtimeService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const https = require("https");
const constants_1 = require("../../constants");
const transaction_service_1 = require("../../transaction/transaction.service");
const generator_util_1 = require("../../utilities/generator.util");
let AirtimeService = AirtimeService_1 = class AirtimeService {
    constructor(httpService, transService) {
        this.httpService = httpService;
        this.transService = transService;
        this.logger = new common_1.Logger(AirtimeService_1.name);
        this.AirBaseUrl = process.env.ONE4ALL_BASEURL || constants_1.ONE4ALL_BASEURL;
        this.ONE4ALL_RETAILER = process.env.ONE4ALL_RETAILER || constants_1.ONE4ALL_RETAILER;
        this.ONE4ALL_APIKEY = process.env.ONE4ALL_APIKEY || constants_1.ONE4ALL_APIKEY;
        this.ONE4ALL_APISECRET = process.env.ONE4ALL_APISECRET || constants_1.ONE4ALL_APISECRET;
        this.ONE4ALL_BASEURL = process.env.ONE4ALL_BASEURL || constants_1.ONE4ALL_BASEURL;
    }
    getOperatorName(networkCode) {
        const operators = {
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
    transactionStatus(transDto) {
        const { transReference } = transDto;
        const payload = {
            trnx: transReference || '',
        };
        const tsUrl = this.AirBaseUrl + `/TopUpApi/transactionStatus?trnx=${payload.trnx}`;
        const configs = {
            url: tsUrl,
            headers: { ApiKey: constants_1.ONE4ALL_APIKEY, ApiSecret: constants_1.ONE4ALL_APISECRET },
            agent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        this.logger.log(`transaction status payload == ${JSON.stringify(configs)}`);
        return this.httpService
            .get(configs.url, { httpsAgent: configs.agent, headers: configs.headers })
            .pipe((0, operators_1.map)((tsRes) => {
            this.logger.log(`Query TRANSACTION STATUS response ++++ ${JSON.stringify(tsRes.data)}`);
            return tsRes.data;
        }), (0, operators_1.catchError)((tsError) => {
            this.logger.error(`Query TRANSACTION STATUS ERROR response ---- ${JSON.stringify(tsError.response.data)}`);
            const tsErrorMessage = tsError.response.data;
            throw new common_1.NotFoundException(tsErrorMessage);
        }));
    }
    topupAirtimeService(transDto) {
        const { retailer, recipientNumber, amount, network, userId, userName, currency } = transDto;
        const taParams = {
            userId: userId,
            userName: userName,
            transType: 'AIRTIME',
            retailer: retailer ?? 'PRYMO',
            network: network || 0,
            operator: this.getOperatorName(network || 0),
            trxn: generator_util_1.GeneratorUtil.generateTransactionId() || '',
            transId: '',
            fee: constants_1.FEE_CHARGES || 0,
            originalAmount: amount || '',
            amount: (Number(amount) + Number(constants_1.FEE_CHARGES)).toString() || '',
            recipientNumber: recipientNumber || '',
            transMessage: `${userName} topup airtime ${amount} GHS for ${this.getOperatorName(network)} to ${recipientNumber}`,
            transStatus: 'pending',
            transCode: '',
            commentary: 'Airtime topup transaction pending',
            balance_before: '',
            balance_after: '',
            currentBalance: '',
            currency: currency || 'GHS',
            serviceName: 'ONE4ALL AIRTIME TOPUP',
            serviceStatus: 'inprogress',
            serviceCode: '',
            serviceTransId: '',
            serviceMessage: '',
        };
        this.logger.log(`AIRTIME TOPUP params == ${JSON.stringify(taParams)}`);
        taParams.transId = taParams.trxn;
        this.transService.create(taParams);
        const configs = {
            url: this.AirBaseUrl + `/TopUpApi/airtime?retailer=${constants_1.ONE4ALL_RETAILER}&recipient=${taParams.recipientNumber}&amount=${taParams.amount}&network=${taParams.network}&trxn=${taParams.trxn}`,
            headers: { ApiKey: constants_1.ONE4ALL_APIKEY, ApiSecret: constants_1.ONE4ALL_APISECRET },
            agent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        this.logger.log(`Airtime topup payload == ${JSON.stringify(configs)}`);
        return this.httpService
            .get(configs.url, {
            httpsAgent: configs.agent,
            headers: configs.headers,
        })
            .pipe((0, operators_1.map)((taRes) => {
            this.logger.verbose(`AIRTIME TOPUP response ++++ ${JSON.stringify(taRes.data)}`);
            if (taRes.data['status-code'] === '02') {
                this.logger.warn(`insufficient balance`);
                taParams.serviceCode = taRes.data['status-code'];
                taParams.serviceMessage = taRes.data.message;
                taParams.serviceTransId = taRes.data.trxn;
                taParams.transStatus = taRes.data.status;
                taParams.serviceStatus = taRes.data.status;
                taParams.commentary = 'Insufficient balance, topup failed';
                this.transService.updateByTrxn(taParams.trxn, taParams);
            }
            else if (taRes.data['status-code'] === '09') {
                this.logger.warn(`recharge requested but awaiting status`);
                taParams.serviceCode = taRes.data['status-code'];
                taParams.serviceMessage = taRes.data.message;
                taParams.serviceTransId = taRes.data.trxn;
                taParams.transStatus = taRes.data.status;
                taParams.serviceStatus = taRes.data.status;
                taParams.commentary = 'recharge requested but awaiting status';
                this.transService.updateByTrxn(taParams.trxn, taParams);
            }
            else if (taRes.data['status-code'] === '06') {
                this.logger.log(`other error message`);
                taParams.serviceCode = taRes.data['status-code'];
                taParams.serviceMessage = taRes.data.message;
                taParams.serviceTransId = taRes.data.trxn;
                taParams.transStatus = taRes.data.status;
                taParams.serviceStatus = taRes.data.status;
                taParams.commentary = 'Other error message';
                this.transService.updateByTrxn(taParams.trxn, taParams);
            }
            else if (taRes.data['status-code'] == '00') {
                this.logger.verbose(`airtime topup successful`);
                taParams.serviceCode = taRes.data['status-code'];
                taParams.serviceMessage = taRes.data.message;
                taParams.serviceTransId = taRes.data.trxn;
                taParams.transStatus = taRes.data.status;
                taParams.serviceStatus = taRes.data.status;
                taParams.balance_before = taRes.data.balance_before;
                taParams.balance_after = taRes.data.balance_after;
                taParams.operator = taRes.data.network;
                taParams.commentary = `Airtime topup successful delivered to ${taParams.recipientNumber}`;
                this.transService.updateByTrxn(taParams.trxn, taParams);
            }
            return taRes.data;
        }), (0, operators_1.catchError)((taError) => {
            this.logger.error(`AIRTIME TOP-UP ERROR response --- ${JSON.stringify(taError.response.data)}`);
            taParams.serviceCode = taError.response.data['status-code'];
            taParams.serviceMessage = taError.response.data.message;
            taParams.serviceTransId = taError.response.data.trxn;
            taParams.transStatus = taError.response.data.status;
            taParams.serviceStatus = taError.response.data.status;
            taParams.commentary = 'Airtime topup failed';
            this.transService.updateByTrxn(taParams.trxn, taParams);
            const taErrorMessage = taError.response.data;
            throw new common_1.NotFoundException(taErrorMessage);
        }));
    }
};
exports.AirtimeService = AirtimeService;
exports.AirtimeService = AirtimeService = AirtimeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        transaction_service_1.TransactionService])
], AirtimeService);
//# sourceMappingURL=airtime.service.js.map