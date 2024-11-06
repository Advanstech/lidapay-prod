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
var MobileMoneyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobileMoneyService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const axios_1 = require("@nestjs/axios");
const constants_1 = require("../../constants");
const transaction_service_1 = require("../../transaction/transaction.service");
const generator_util_1 = require("../../utilities/generator.util");
const https_1 = require("https");
let MobileMoneyService = MobileMoneyService_1 = class MobileMoneyService {
    constructor(httpService, transactionService) {
        this.httpService = httpService;
        this.transactionService = transactionService;
        this.logger = new common_1.Logger(MobileMoneyService_1.name);
        this.psUrl = constants_1.PAYSWTICH_PROD_BASEURL + '/v1.1/transaction/process';
    }
    async processTransaction(transData) {
        const base64_encode = generator_util_1.GeneratorUtil.generateMerchantKey();
        const ptParams = {
            amount: transData.amount,
            processing_code: constants_1.PROCESSING_CODE_DEBIT || process.env.PROCESSING_CODE_DEBIT,
            transaction_id: generator_util_1.GeneratorUtil.generateTransactionIdPayswitch() || 'TNX-',
            desc: transData.description ||
                `debit GhS${transData.amount} from ${transData.customerMsisdn} momo wallet.`,
            merchant_id: 'TTM-00006115',
            subscriber_number: transData.customerMsisdn,
            'r-switch': transData.channel,
        };
        const configs = {
            url: this.psUrl,
            data: ptParams,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${base64_encode}`,
            },
            httpsAgent: new https_1.Agent({
                rejectUnauthorized: false,
            }),
        };
        try {
            console.log('Sending transaction data:', JSON.stringify(ptParams));
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(configs.url, configs.data, {
                headers: configs.headers,
                httpsAgent: configs.httpsAgent,
            }));
            await this.saveOrUpdateTransaction(response.data);
            return response.data;
        }
        catch (error) {
            this.handleError(error);
        }
    }
    async saveOrUpdateTransaction(responseData) {
        const dwParamSave = {
            paymentServiceStatus: '',
            paymentTransactionId: responseData.transaction_id,
            paymentServiceMessage: responseData.reason,
            paymentStatus: '',
            paymentCommentary: '',
        };
        switch (responseData.status) {
            case 'Approved':
                dwParamSave.paymentServiceStatus = 'Success';
                dwParamSave.paymentCommentary = `Transaction successful: ${responseData.reason}`;
                await this.transactionService.updateByTrxn(dwParamSave.paymentTransactionId, dwParamSave);
                break;
            case 'failed':
                dwParamSave.paymentServiceStatus = 'Failed';
                dwParamSave.paymentCommentary = `Transaction failed: ${responseData.reason}`;
                await this.transactionService.updateByTrxn(dwParamSave.paymentTransactionId, dwParamSave);
                break;
            case 'null':
            case null:
                dwParamSave.paymentServiceStatus = 'Pending';
                dwParamSave.paymentCommentary = `Transaction is pending: ${responseData.reason}`;
                await this.transactionService.updateByTrxn(dwParamSave.paymentTransactionId, dwParamSave);
                break;
            case 'PIN_LOCKED':
                dwParamSave.paymentServiceStatus = 'Failed';
                dwParamSave.paymentCommentary = `Transaction failed due to PIN lock: ${responseData.reason}`;
                await this.transactionService.updateByTrxn(dwParamSave.paymentTransactionId, dwParamSave);
                break;
            case 'error':
                dwParamSave.paymentServiceStatus = 'Failed';
                dwParamSave.paymentCommentary = `Transaction failed with error: ${responseData.reason}`;
                await this.transactionService.updateByTrxn(dwParamSave.paymentTransactionId, dwParamSave);
                break;
            case 'TIMEOUT':
                dwParamSave.paymentServiceStatus = 'Failed';
                dwParamSave.paymentCommentary = `Transaction failed due to timeout: ${responseData.reason}`;
                await this.transactionService.updateByTrxn(dwParamSave.paymentTransactionId, dwParamSave);
                break;
            default:
                this.logger.warn(`Unhandled transaction status: ${responseData.status}`);
                break;
        }
    }
    handleError(error) {
        const errorMessage = error.response?.data?.reason || error.message || 'Unknown error occurred';
        const statusCode = error.response?.status;
        console.error(`Transaction failed: ${JSON.stringify(error.response?.data)} (Status Code: ${statusCode})`);
        throw new Error(`Transaction failed: ${errorMessage} (Status Code: ${statusCode})`);
    }
};
exports.MobileMoneyService = MobileMoneyService;
exports.MobileMoneyService = MobileMoneyService = MobileMoneyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        transaction_service_1.TransactionService])
], MobileMoneyService);
//# sourceMappingURL=mobile-money.service.js.map