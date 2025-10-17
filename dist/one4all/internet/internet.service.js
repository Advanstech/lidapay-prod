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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternetService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const https = require("https");
const constants_1 = require("../../constants");
const generator_util_1 = require("../../utilities/generator.util");
const transaction_service_1 = require("../../transaction/transaction.service");
const validation_util_1 = require("../../utilities/validation.util");
let InternetService = class InternetService {
    constructor(httpService, transService) {
        this.httpService = httpService;
        this.transService = transService;
        this.logger = new common_1.Logger('InternetService');
        this.DataUrl = constants_1.ONE4ALL_BASEURL;
    }
    topupInternetData(transDto) {
        const { retailer, recipientNumber, dataCode, network, userId, userName, amount, currency } = transDto;
        const tibParams = {
            userId: userId,
            userName: userName,
            transType: 'INTERNET DATA BUNDLE',
            retailer: retailer ?? 'PRYMO',
            fee: constants_1.FEE_CHARGES || 0,
            originalAmount: amount || '',
            amount: (Number(amount) + Number(constants_1.FEE_CHARGES)).toString() || '',
            recipientNumber: recipientNumber || '',
            data_code: dataCode || '',
            network: network || 0,
            operator: validation_util_1.ValidationUtil.getOperatorName(network || 0),
            trxn: generator_util_1.GeneratorUtil.generateTransactionId() || '',
            transId: '',
            status: {
                transaction: 'pending',
                service: 'inprogress',
                payment: 'pending',
            },
            commentary: 'Internet data bundle transaction pending',
            currency: currency || 'GHS',
            balance_before: '',
            balance_after: ''
        };
        const tibUrl = this.DataUrl +
            `/TopUpApi/dataBundle?retailer=${constants_1.ONE4ALL_RETAILER}&recipient=${tibParams.recipientNumber}&data_code=${tibParams.data_code}&network=${tibParams.network}&trxn=${tibParams.trxn}`;
        tibParams.transId = tibParams.trxn;
        this.transService.create(tibParams);
        const configs = {
            url: tibUrl,
            headers: { ApiKey: constants_1.ONE4ALL_APIKEY, ApiSecret: constants_1.ONE4ALL_APISECRET },
            agent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        this.logger.log(`INTERNET DATA BUNDLE payload config ==> ${JSON.stringify(configs)}`);
        return this.httpService
            .get(configs.url, { httpsAgent: configs.agent, headers: configs.headers })
            .pipe((0, operators_1.map)((tibRes) => {
            this.logger.verbose(`INTERNET DATA BUNDLE server response => ${tibRes.data}`);
            switch (tibRes.data['status-code']) {
                case '00':
                    this.logger.verbose(`Data bundle reload successful`);
                    tibParams.serviceCode = tibRes.data['status-code'];
                    tibParams.serviceMessage = tibRes.data.message;
                    tibParams.serviceTransId = tibRes.data.trxn;
                    tibParams.balance_before = tibRes.data.balance_before;
                    tibParams.balance_after = tibRes.data.balance_after;
                    tibParams.commentary = `Data bundle reload successful for ${tibParams.recipientNumber}`;
                    this.transService.updateByTrxn(tibParams.trxn, {
                        status: {
                            transaction: 'SUCCESSFUL',
                            service: 'completed',
                            payment: 'completed',
                        },
                        paymentStatus: 'completed',
                        paymentServiceCode: tibRes.data['status-code'],
                        paymentServiceMessage: tibRes.data.message,
                        paymentTransactionId: tibRes.data.trxn,
                        commentary: tibParams.commentary,
                    });
                    break;
                case '02':
                    this.logger.warn(`Insufficient balance`);
                    this.handleTransactionFailure(tibParams, tibRes.data);
                    break;
                case '09':
                    this.logger.warn(`Recharge requested but awaiting status`);
                    this.handleTransactionPending(tibParams, tibRes.data);
                    break;
                case '06':
                    this.logger.log(`Other error message`);
                    this.handleTransactionFailure(tibParams, tibRes.data);
                    break;
                default:
                    this.logger.error(`Unexpected status code: ${tibRes.data['status-code']}`);
                    this.handleTransactionFailure(tibParams, tibRes.data);
                    break;
            }
            return tibRes.data;
        }), (0, operators_1.catchError)((tibError) => {
            this.logger.error(`ERROR INTERNET DATA BUNDLE => ${JSON.stringify(tibError.response?.data || tibError.data)}`);
            this.handleTransactionFailure(tibParams, tibError.response?.data || { 'status-code': 'ERROR', message: 'Network error' });
            const tibErrorMessage = tibError.response?.data || tibError.message || 'Unknown error';
            throw new common_1.NotFoundException(tibErrorMessage);
        }));
    }
    handleTransactionFailure(tibParams, responseData) {
        tibParams.serviceCode = responseData['status-code'];
        tibParams.serviceMessage = responseData.message;
        tibParams.serviceTransId = responseData.trxn;
        tibParams.transStatus = responseData.status;
        tibParams.serviceStatus = responseData.status;
        tibParams.commentary = `Data bundle reload failed: ${responseData.message || 'Unknown error'}`;
        this.transService.updateByTrxn(tibParams.trxn, {
            status: {
                transaction: 'FAILED',
                service: 'failed',
                payment: 'failed',
            },
            paymentStatus: 'failed',
            paymentServiceCode: responseData['status-code'],
            paymentServiceMessage: responseData.message,
            paymentTransactionId: responseData.trxn,
            commentary: tibParams.commentary,
        });
    }
    handleTransactionPending(tibParams, responseData) {
        tibParams.serviceCode = responseData['status-code'];
        tibParams.serviceMessage = responseData.message;
        tibParams.serviceTransId = responseData.trxn;
        tibParams.transStatus = responseData.status;
        tibParams.serviceStatus = responseData.status;
        tibParams.commentary = 'Recharge requested but awaiting status';
        this.transService.updateByTrxn(tibParams.trxn, {
            status: {
                transaction: 'pending',
                service: 'inprogress',
                payment: 'pending',
            },
            paymentStatus: 'pending',
            paymentServiceCode: responseData['status-code'],
            paymentServiceMessage: responseData.message,
            paymentTransactionId: responseData.trxn,
            commentary: tibParams.commentary,
        });
    }
    dataBundleList(transDto) {
        const { network } = transDto;
        console.log('transDto network', transDto);
        let networkId;
        if (typeof network === 'string') {
            networkId = parseInt(network, 10);
            this.logger.debug(`Converted string network "${network}" to number: ${networkId}`);
        }
        else {
            networkId = network;
        }
        if (networkId === undefined || networkId === null || isNaN(networkId)) {
            this.logger.warn(`Invalid or missing network parameter: ${network}. Defaulting to 0 (All networks)`);
            networkId = 0;
        }
        this.logger.debug(`Data bundle list request - Original network: ${network}, Using networkId: ${networkId}`);
        const dblURL = this.DataUrl + `/TopUpApi/dataBundleList?network=${networkId}`;
        const configs = {
            url: dblURL,
            headers: { ApiKey: constants_1.ONE4ALL_APIKEY, ApiSecret: constants_1.ONE4ALL_APISECRET },
            agent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };
        this.logger.log(`DATA BUNDLE LIST payload config ==> ${JSON.stringify(configs.url)}`);
        return this.httpService
            .get(configs.url, { httpsAgent: configs.agent, headers: configs.headers })
            .pipe((0, operators_1.map)((dblRes) => {
            this.logger.verbose(`DATA BUNDLE LIST server response => ${dblRes.data}`);
            return dblRes.data;
        }), (0, operators_1.catchError)((dblError) => {
            this.logger.error(`ERROR DATA BUNDLE LIST => ${JSON.stringify(dblError.response?.data || dblError.data)}`);
            const dblErrorMessage = dblError.response?.data || dblError.message || 'Unknown error';
            throw new common_1.NotFoundException(dblErrorMessage);
        }));
    }
};
exports.InternetService = InternetService;
exports.InternetService = InternetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        transaction_service_1.TransactionService])
], InternetService);
//# sourceMappingURL=internet.service.js.map