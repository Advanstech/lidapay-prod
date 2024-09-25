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
var PsmobilemoneyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsmobilemoneyService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const https = require("https");
const generator_util_1 = require("../../utilities/generator.util");
const constants_1 = require("../../constants");
const transaction_service_1 = require("../../transaction/transaction.service");
let PsmobilemoneyService = PsmobilemoneyService_1 = class PsmobilemoneyService {
    constructor(httpService, transactionService) {
        this.httpService = httpService;
        this.transactionService = transactionService;
        this.logger = new common_1.Logger(PsmobilemoneyService_1.name);
    }
    primaryCallbackUrl() {
    }
    transferMobilemoney(transDto) {
        const { description, recipientMsisdn, amount, transType, channel, currency, userId, userName, transId } = transDto;
        const tmParams = {
            amount: amount || '',
            processing_code: process.env.PROCESSING_CODE_SEND || constants_1.PROCESSING_CODE_SEND,
            transaction_id: generator_util_1.GeneratorUtil.generateTransactionId || 'TNX-',
            desc: `Transfer GHs${amount} to ${recipientMsisdn}`,
            merchant_id: process.env.PAYSWITCH_MERCHANTID || constants_1.PAYSWITCH_MERCHANTID,
            subscriber_number: recipientMsisdn,
            'r-switch': channel,
        };
        const tmParamSave = {
            userId: userId,
            userName: userName,
            transId,
            transType: transType || 'MOMO TRANSFER',
            retailer: 'PAYSWITCH',
            fee: constants_1.FEE_CHARGES || 0,
            originalAmount: tmParams.amount,
            amount: (Number(amount) + Number(constants_1.FEE_CHARGES)).toString() || '',
            recipientNumber: tmParams.subscriber_number || '',
            transMessage: `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType}`,
            network: 0 || '',
            trxn: tmParams.transaction_id || '',
            transStatus: 'pending',
            serviceStatus: 'inprogress',
            operator: tmParams.r_switch || '',
            serviceCode: '',
            serviceTransId: '',
            serviceMessage: '',
            serviceName: 'MOMO TRANSFER',
            currency: currency || 'GHS',
            commentary: '',
            paymentStatus: 'pending',
        };
        const base64_encode = generator_util_1.GeneratorUtil.generateMerchantKey();
        return (0, rxjs_1.from)(this.transactionService.updateByTrxn(transId, tmParamSave)).pipe((0, operators_1.switchMap)((updatedTransaction) => {
            if (!updatedTransaction) {
                throw new common_1.NotFoundException(`Transaction with id ${transId} not found`);
            }
            const configs = {
                url: constants_1.PAYSWITCH_TEST_BASEURL + '/v1.1/transaction/process',
                body: tmParams,
                headers: {
                    Authorization: `Basic ${base64_encode}`,
                },
                agent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            };
            this.logger.log(`TRANSFER MOBILE MONEY payload config == ${JSON.stringify(configs)}`);
            return this.httpService
                .post(configs.url, configs.body, {
                httpsAgent: configs.agent,
                headers: configs.headers,
            })
                .pipe((0, operators_1.map)((tmRes) => {
                this.logger.verbose(`TRANSFER MOBILE MONEY server response => ${JSON.stringify(tmRes.data)}`);
                if (tmRes.data.status == 'Approved') {
                    this.logger.log(`debit wallet service response STATUS =  ${JSON.stringify(tmRes.data.status)} `);
                    this.logger.log(`service response CODE = ${JSON.stringify(tmRes.data.code)} `);
                    this.logger.log(`service response MESSAGE =  ${JSON.stringify(tmRes.data.reason)} `);
                    this.logger.log(`service response TRANSACTIONiD ==> ${JSON.stringify(tmRes.data.transaction_id)} `);
                    tmParamSave.transStatus = 'Success';
                    tmParamSave.serviceStatus = tmRes.data.status;
                    tmParamSave.serviceTransId = tmRes.data.transaction_id;
                    tmParamSave.serviceMessage = tmRes.data.reason;
                    tmParamSave.paymentStatus = 'Success';
                    tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} was successful`;
                    this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);
                }
                else if (tmRes.data.status === 'failed') {
                    this.logger.error(` service response STATUS ==>  ${JSON.stringify(tmRes.data.status)} `);
                    this.logger.error(` debit wallet  service response TRANSACTION ID ==> ${JSON.stringify(tmRes.data.transaction_id)}`);
                    this.logger.error(` response MESSAGE ==>  ${JSON.stringify(tmRes.data.reason)} `);
                    this.logger.error(` response  CODE ==> ${JSON.stringify(tmRes.data.code)} `);
                    tmParamSave.transStatus = 'Failed';
                    tmParamSave.serviceStatus = tmRes.data.status;
                    tmParamSave.serviceTransId = tmRes.data.transaction_id;
                    tmParamSave.serviceMessage = tmRes.data.reason;
                    tmParamSave.paymentStatus = 'Failed';
                    tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} was failed`;
                    this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);
                }
                else if (tmRes.data.status == null || tmRes.data.status == 'null') {
                    this.logger.debug(` service response STATUS ==>  ${JSON.stringify(tmRes.data.status)} `);
                    this.logger.debug(` response  CODE ==> ${JSON.stringify(tmRes.data.code)} `);
                    this.logger.debug(` response MESSAGE ==>  ${JSON.stringify(tmRes.data.reason)} `);
                    this.logger.debug(` service response TRANSACTION ID ==> ${JSON.stringify(tmRes.data.transaction_id)}`);
                    this.logger.debug(` response custmerDescription ==>  ${JSON.stringify(tmRes.data.desc)} `);
                    tmParamSave.transStatus = 'Pending';
                    tmParamSave.serviceStatus = tmRes.data.status;
                    tmParamSave.serviceTransId = tmRes.data.transaction_id;
                    tmParamSave.serviceMessage = tmRes.data.reason;
                    tmParamSave.paymentStatus = 'Pending';
                    tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} is pending`;
                    this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);
                }
                else if (tmRes.data.status == 'PIN_LOCKED') {
                    this.logger.warn(` debit wallet service response STATUS ==>  ${JSON.stringify(tmRes.data.status)} `);
                    this.logger.warn(` service response MESSAGE ==>  ${JSON.stringify(tmRes.data.reason)} `);
                    this.logger.warn(` service response TRANSACTIONID ==> ${JSON.stringify(tmRes.data.transaction_id)} `);
                    tmParamSave.transStatus = 'Failed';
                    tmParamSave.serviceStatus = tmRes.data.status;
                    tmParamSave.serviceTransId = tmRes.data.transaction_id;
                    tmParamSave.serviceMessage = tmRes.data.reason;
                    tmParamSave.paymentStatus = 'Failed';
                    tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} was failed`;
                    this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);
                }
                else if (tmRes.data.status == 'error') {
                    this.logger.error(` debit wallet service response STATUS ==>  ${JSON.stringify(tmRes.data.status)} `);
                    this.logger.error(` service response CODE ==>  ${JSON.stringify(tmRes.data.code)} `);
                    this.logger.error(` service response MESSAGE ==> ${JSON.stringify(tmRes.data.reason)} `);
                    tmParamSave.transStatus = 'Failed';
                    tmParamSave.serviceStatus = tmRes.data.status;
                    tmParamSave.serviceTransId = tmRes.data.transaction_id;
                    tmParamSave.serviceMessage = tmRes.data.reason;
                    tmParamSave.paymentStatus = 'Failed';
                    tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} was failed`;
                    this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);
                }
                else if (tmRes.data.status == 'TIMEOUT') {
                    this.logger.warn(`debit wallet service response STATUS ==>  ${JSON.stringify(tmRes.data.status)}`);
                    this.logger.warn(`service response STATUS_CODE ==>  ${JSON.stringify(tmRes.data.code)}`);
                    this.logger.warn(`service response TRANSACTION_ID ==> ${JSON.stringify(tmRes.data.transaction_id)}`);
                    this.logger.warn(`service response MESSAGE ==> ${JSON.stringify(tmRes.data.reason)}`);
                    this.logger.warn(`service response DESCRIPTION ==> ${JSON.stringify(tmRes.data.desc)}`);
                    tmParamSave.transStatus = 'Failed';
                    tmParamSave.serviceStatus = tmRes.data.status;
                    tmParamSave.serviceTransId = tmRes.data.transaction_id;
                    tmParamSave.serviceMessage = tmRes.data.reason;
                    tmParamSave.paymentStatus = 'Failed';
                    tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} was failed`;
                    this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);
                }
                return tmRes.data;
            }), (0, operators_1.catchError)((Sm2Error) => {
                this.logger.error(`ERROR TRANSFER MOBILE MONEY => ${JSON.stringify(Sm2Error.response.data)}`);
                tmParamSave.transStatus = 'Failed';
                tmParamSave.serviceStatus = Sm2Error.response.data.status;
                tmParamSave.serviceTransId = Sm2Error.response.data.transaction_id;
                tmParamSave.serviceMessage = Sm2Error.response.data.reason;
                tmParamSave.paymentStatus = 'Failed';
                tmParamSave.commentary = `Momo Transfer GHs${amount} to ${recipientMsisdn} for ${transType} was failed`;
                this.transactionService.updateByTrxn(tmParamSave.transId, tmParamSave);
                const Sm2ErrorMessage = Sm2Error.response.data;
                throw new common_1.NotFoundException(Sm2ErrorMessage);
            }));
        }));
    }
    mobileMoneyPayment(transDto) {
        const { customerMsisdn, amount, description, channel, transType, userId, userName, currency, transId, } = transDto;
        const dwParams = {
            amount: amount || '',
            processing_code: process.env.PROCESSING_CODE_DEBIT || constants_1.PROCESSING_CODE_DEBIT,
            transaction_id: generator_util_1.GeneratorUtil.generateTransactionIdPayswitch() || 'TNX-',
            desc: description || `debit GhS${amount} from ${customerMsisdn} momo wallet.`,
            merchant_id: process.env.PAYSWITCH_MERCHANTID || constants_1.PAYSWITCH_MERCHANTID,
            subscriber_number: customerMsisdn,
            'r-switch': channel,
        };
        const dwParamSave = {
            userId: userId,
            userName: userName,
            transId,
            paymentType: 'MOMO PAYMENT',
            retailer: 'PAYSWITCH',
            fee: constants_1.FEE_CHARGES || 0,
            originalAmount: dwParams.amount,
            amount: (Number(amount) + Number(constants_1.FEE_CHARGES)).toString() || '',
            customerMsisdn: dwParams.subscriber_number || '',
            walletOperator: dwParams.r_switch || '',
            paymentCurrency: currency || 'GHS',
            paymentCommentary: '',
            paymentStatus: 'pending',
            paymentServiceCode: '',
            paymentTransactionId: dwParams.transaction_id || '',
            paymentServiceMessage: '',
        };
        const base64_encode = generator_util_1.GeneratorUtil.generateMerchantKey();
        return (0, rxjs_1.from)(this.transactionService.updateByTrxn(transId, dwParamSave)).pipe((0, operators_1.switchMap)((updatedTransaction) => {
            if (!updatedTransaction) {
                throw new common_1.NotFoundException(`Transaction with id ${transId} not found`);
            }
            const configs = {
                url: constants_1.PAYSWTICH_PROD_BASEURL + '/v1.1/transaction/process',
                body: dwParams,
                auth: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${base64_encode}`,
                },
                agent: new https.Agent({
                    rejectUnauthorized: false,
                }),
            };
            this.logger.log(`RECEIVE MONEY payload config == ${JSON.stringify(configs)}`);
            return this.httpService
                .post(configs.url, configs.body, {
                httpsAgent: configs.agent,
                headers: configs.auth,
            })
                .pipe((0, operators_1.map)((mpRes) => {
                this.logger.verbose(`RECEIVE MONEY server response => ${JSON.stringify(mpRes.data)}`);
                if (mpRes.data.status == 'Approved') {
                    this.logger.log(`debit wallet service response STATUS =  ${JSON.stringify(mpRes.data.status)} `);
                    this.logger.log(`service response CODE = ${JSON.stringify(mpRes.data.code)} `);
                    this.logger.log(`service response MESSAGE =  ${JSON.stringify(mpRes.data.reason)} `);
                    this.logger.log(`service response TRANSACTIONiD ==> ${JSON.stringify(mpRes.data.transaction_id)} `);
                    dwParamSave.paymentServiceCode = mpRes.data.code;
                    dwParamSave.paymentTransactionId = mpRes.data.transaction_id;
                    dwParamSave.paymentServiceMessage = mpRes.data.reason;
                    dwParamSave.paymentStatus = 'Success';
                    dwParamSave.paymentCommentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} was successful`;
                    this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
                }
                else if (mpRes.data.status === 'failed') {
                    this.logger.error(` service response STATUS ==>  ${JSON.stringify(mpRes.data.status)} `);
                    this.logger.error(` debit wallet  service response TRANSACTION ID ==> ${JSON.stringify(mpRes.data.transaction_id)}`);
                    this.logger.error(` response MESSAGE ==>  ${JSON.stringify(mpRes.data.reason)} `);
                    this.logger.error(` response  CODE ==> ${JSON.stringify(mpRes.data.code)} `);
                    dwParamSave.paymentServiceStatus = mpRes.data.status;
                    dwParamSave.paymentTransactionId = mpRes.data.transaction_id;
                    dwParamSave.paymentServiceMessage = mpRes.data.reason;
                    dwParamSave.paymentStatus = 'Failed';
                    dwParamSave.paymentCommentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} was failed`;
                    this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
                }
                else if (mpRes.data.status == null || mpRes.data.status == 'null') {
                    this.logger.debug(` service response STATUS ==>  ${JSON.stringify(mpRes.data.status)} `);
                    this.logger.debug(` response  CODE ==> ${JSON.stringify(mpRes.data.code)} `);
                    this.logger.debug(` response MESSAGE ==>  ${JSON.stringify(mpRes.data.reason)} `);
                    this.logger.debug(` service response TRANSACTION ID ==> ${JSON.stringify(mpRes.data.transaction_id)}`);
                    this.logger.debug(` response custmerDescription ==>  ${JSON.stringify(mpRes.data.desc)} `);
                    dwParamSave.paymentServiceStatus = mpRes.data.status;
                    dwParamSave.paymentTransactionId = mpRes.data.transaction_id;
                    dwParamSave.paymentServiceMessage = mpRes.data.reason;
                    dwParamSave.paymentStatus = 'Pending';
                    dwParamSave.paymentCommentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} is pending`;
                    this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
                }
                else if (mpRes.data.status == 'PIN_LOCKED') {
                    this.logger.warn(` debit wallet service response STATUS ==>  ${JSON.stringify(mpRes.data.status)} `);
                    this.logger.warn(` service response MESSAGE ==>  ${JSON.stringify(mpRes.data.reason)} `);
                    this.logger.warn(` service response TRANSACTIONID ==> ${JSON.stringify(mpRes.data.transaction_id)} `);
                    dwParamSave.paymentServiceStatus = mpRes.data.status;
                    dwParamSave.paymentTransactionId = mpRes.data.transaction_id;
                    dwParamSave.paymentServiceMessage = mpRes.data.reason;
                    dwParamSave.paymentStatus = 'Failed';
                    dwParamSave.paymentCommentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} was failed`;
                    this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
                }
                else if (mpRes.data.status == 'error') {
                    this.logger.error(` debit wallet service response STATUS ==>  ${JSON.stringify(mpRes.data.status)} `);
                    this.logger.error(` service response CODE ==>  ${JSON.stringify(mpRes.data.code)} `);
                    this.logger.error(` service response MESSAGE ==> ${JSON.stringify(mpRes.data.reason)} `);
                    dwParamSave.paymentServiceStatus = mpRes.data.status;
                    dwParamSave.paymentTransactionId = mpRes.data.transaction_id;
                    dwParamSave.paymentServiceMessage = mpRes.data.reason;
                    dwParamSave.paymentStatus = 'Failed';
                    dwParamSave.paymentCommentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} was failed`;
                    this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
                }
                else if (mpRes.data.status == 'TIMEOUT') {
                    this.logger.warn(`debit wallet service response STATUS ==>  ${JSON.stringify(mpRes.data.status)}`);
                    this.logger.warn(`service response STATUS_CODE ==>  ${JSON.stringify(mpRes.data.code)}`);
                    this.logger.warn(`service response TRANSACTION_ID ==> ${JSON.stringify(mpRes.data.transaction_id)}`);
                    this.logger.warn(`service response MESSAGE ==> ${JSON.stringify(mpRes.data.reason)}`);
                    this.logger.warn(`service response DESCRIPTION ==> ${JSON.stringify(mpRes.data.desc)}`);
                    dwParamSave.paymentServiceStatus = mpRes.data.status;
                    dwParamSave.paymentTransactionId = mpRes.data.transaction_id;
                    dwParamSave.paymentServiceMessage = mpRes.data.reason;
                    dwParamSave.paymentStatus = 'Failed';
                    dwParamSave.paymentCommentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} was failed`;
                    this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
                }
                return mpRes.data;
            }), (0, operators_1.catchError)((mpError) => {
                this.logger.error(`ERROR DEBIT WALLET => ${JSON.stringify(mpError.response.data)}`);
                dwParamSave.transStatus = 'Failed';
                dwParamSave.serviceStatus = mpError.response.data.status;
                dwParamSave.serviceTransId = mpError.response.data.transaction_id;
                dwParamSave.serviceMessage = mpError.response.data.reason;
                dwParamSave.paymentStatus = 'Failed';
                dwParamSave.commentary = `Momo Transfer GHs${amount} to ${customerMsisdn} for ${transType} was failed`;
                this.transactionService.updateByTrxn(dwParamSave.transId, dwParamSave);
                const mpErrorMessage = mpError.response.data;
                throw new common_1.NotFoundException(mpErrorMessage);
            }));
        }));
    }
};
exports.PsmobilemoneyService = PsmobilemoneyService;
exports.PsmobilemoneyService = PsmobilemoneyService = PsmobilemoneyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        transaction_service_1.TransactionService])
], PsmobilemoneyService);
//# sourceMappingURL=psmobilemoney.service.js.map