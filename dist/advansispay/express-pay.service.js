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
var ExpressPayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressPayService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const transaction_service_1 = require("../transaction/transaction.service");
const constants_1 = require("../constants");
const express_pay_error_1 = require("./express-pay.error");
const generator_util_1 = require("../utilities/generator.util");
const qr = require("querystring");
let ExpressPayService = ExpressPayService_1 = class ExpressPayService {
    constructor(httpService, transactionService) {
        this.httpService = httpService;
        this.transactionService = transactionService;
        this.logger = new common_1.Logger(ExpressPayService_1.name);
        this.config = {
            merchantId: process.env.EXPRESSPAY_MERCHANT_ID || constants_1.EXPRESSPAY_MERCHANT_ID,
            apiKey: process.env.EXPRESSPAY_API_KEY || constants_1.EXPRESSPAY_API_KEY,
            baseUrl: process.env.EXPRESSPAY_BASE_URL || constants_1.EXPRESSPAY_BASE_URL,
            testUrl: process.env.EXPRESSPAY_TEST_BASE_URL || constants_1.EXPRESSPAY_TEST_BASE_URL,
            redirectUrl: process.env.EXPRESSPAY_REDIRECT_URL || constants_1.EXPRESSPAY_REDIRECT_URL,
            postUrl: process.env.EXPRESSPAY_POST_URL || constants_1.EXPRESSPAY_POST_URL,
        };
    }
    async paymentCallbackURL(req) {
        const orderId = String(req.query['order-id']);
        const token = String(req.query.token);
        this.logger.log(`Received payment callback for order: ${orderId}, token: ${token}`);
        try {
            if (!token || !orderId) {
                throw new common_1.HttpException('Invalid callback data', common_1.HttpStatus.BAD_REQUEST);
            }
            const transactionResponse = await this.queryTransaction(token);
            const paymentStatus = String(transactionResponse.status);
            await this.transactionService.updateByTrxn(orderId, {
                status: paymentStatus,
                lastChecked: new Date(),
                metadata: req.body,
            });
            this.logger.log(`Transaction status updated for order: ${orderId}, new status: ${paymentStatus}`);
            return { message: 'Callback processed successfully' };
        }
        catch (error) {
            this.logger.log(`Received payment callback for order: ${orderId}, token: ${token}`);
            const paymentStatus = 'UNKNOWN';
            this.logger.log(`Transaction status updated for order: ${orderId}, new status: ${paymentStatus}`);
            this.logger.log(`Received post payment status for order: ${orderId}, status: ${status}`);
            this.logger.log(`Transaction status updated for order: ${orderId}, new status: ${status}`);
            this.logger.log(`Payment initiated successfully. Token: ${token}`);
            this.logger.log(`Querying transaction status for token: ${token}`);
            this.logger.error('Error processing payment callback', {
                error: error.message,
                orderId,
                stack: error.stack,
            });
            throw new express_pay_error_1.ExpressPayError('CALLBACK_PROCESSING_FAILED', error.message);
        }
    }
    async handlePostPaymentStatus(req) {
        const orderId = String(req.body['order-id']);
        const token = String(req.body.token);
        const paymentStatus = String(req.body.status);
        this.logger.log(`Received post payment status for order: ${orderId}, status: ${paymentStatus}`);
        try {
            if (!token || !orderId || !paymentStatus) {
                throw new common_1.HttpException('Invalid post data', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.transactionService.updateByTrxn(orderId, {
                status: paymentStatus,
                lastChecked: new Date(),
                metadata: req.body,
            });
            this.logger.log(`Transaction status updated for order: ${orderId}, new status: ${paymentStatus}`);
        }
        catch (error) {
            this.logger.error('Error processing post payment status', {
                error: error.message,
                orderId,
                stack: error.stack,
            });
            throw new express_pay_error_1.ExpressPayError('POST_STATUS_PROCESSING_FAILED', error.message);
        }
    }
    async initiatePayment(paymentData) {
        const localTransId = generator_util_1.GeneratorUtil.generateOrderId() || 'TNX-';
        this.logger.log(`Initiating payment for orderId as localTransId:: ${localTransId}`);
        try {
            const ipFormData = {
                'merchant-id': this.config.merchantId,
                'api-key': this.config.apiKey,
                firstname: paymentData.firstName,
                lastname: paymentData.lastName,
                email: paymentData.email,
                phonenumber: paymentData.phoneNumber,
                username: paymentData.username || paymentData.phoneNumber,
                accountnumber: paymentData.accountNumber || '',
                currency: 'GHS',
                amount: paymentData.amount.toFixed(2),
                'order-id': localTransId,
                'order-desc': paymentData.orderDesc || '',
                'redirect-url': this.config.redirectUrl,
                'post-url': this.config.postUrl,
                'order-img-url': paymentData.orderImgUrl || '',
            };
            console.log('initiate payment payload  =>>', ipFormData);
            this.logger.debug('Sending payment request to ExpressPay', {
                'order-id': ipFormData,
                amount: ipFormData.amount,
            });
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.config.testUrl}/api/submit.php`, qr.stringify(ipFormData), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }));
            const { status, token, message } = response.data;
            if (status !== 1) {
                this.logger.error('Payment initiation failed', {
                    status,
                    orderId: ipFormData['order-id'],
                    message,
                });
                throw new express_pay_error_1.ExpressPayError('PAYMENT_INITIATION_FAILED', { status, message });
            }
            this.logger.log(`Payment initiated successfully. Token: ${token}`);
            const ipParamSave = {
                userId: paymentData.userId,
                userName: paymentData.userName,
                firstName: paymentData.firstName || '',
                lastName: paymentData.lastName || '',
                email: paymentData.email,
                transId: ipFormData['order-id'],
                paymentType: 'DEBIT',
                retailer: 'EXPRESSPAY',
                fee: constants_1.FEE_CHARGES || 0,
                originalAmount: paymentData.amount,
                amount: (Number(paymentData.amount) + Number(constants_1.FEE_CHARGES)).toString() || '',
                customerMsisdn: paymentData.phoneNumber,
                walletOperator: '',
                paymentCurrency: 'GHS',
                paymentCommentary: '',
                paymentStatus: 'pending',
                paymentServiceCode: '',
                paymentTransactionId: '',
                paymentServiceMessage: '',
                payTransRef: paymentData.payTransRef || '',
                expressToken: token,
                serviceStatus: 'pending',
                transStatus: 'pending',
                transType: paymentData.transType || 'MOMO',
                recipientNumber: ipFormData.phonenumber
            };
            await this.transactionService.create(ipParamSave);
            return {
                checkoutUrl: `${this.config.testUrl}/api/checkout.php?token=${token}`,
                token,
                'order-id': ipParamSave.transId,
            };
        }
        catch (error) {
            this.logger.error('Payment initiation error', {
                error: error.message,
                'order-id': error['order-id'],
                stack: error.stack,
            });
            if (error instanceof express_pay_error_1.ExpressPayError) {
                throw error;
            }
            throw new express_pay_error_1.ExpressPayError('SYSTEM_ERROR', error.message);
        }
    }
    async queryTransaction(token) {
        this.logger.log(`Querying transaction status for token: ${token}`);
        try {
            const formData = {
                'merchant-id': this.config.merchantId,
                'api-key': this.config.apiKey,
                token,
            };
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.config.testUrl}/api/query.php`, qr.stringify(formData), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }));
            const { result, orderId, amount, 'transaction-id': transactionId, 'result-text': resultText, } = response.data;
            this.logger.debug('Transaction query response', {
                token,
                result,
                orderId,
                resultText
            });
            const statusMap = {
                1: 'COMPLETED',
                2: 'DECLINED',
                3: 'ERROR',
                4: 'PENDING',
            };
            const status = statusMap[result];
            await this.transactionService.updateByExpressToken(token, {
                status,
                transactionId,
                lastChecked: new Date(),
                metadata: {
                    ...response.data,
                    lastQueryAt: new Date(),
                }
            });
            return {
                status,
                orderId,
                transactionId,
                amount,
                resultText,
                originalResponse: response.data,
            };
        }
        catch (error) {
            this.logger.error('Transaction query error', {
                error: error.message,
                token,
                stack: error.stack,
            });
            throw new express_pay_error_1.ExpressPayError('QUERY_FAILED', error.message);
        }
    }
};
exports.ExpressPayService = ExpressPayService;
exports.ExpressPayService = ExpressPayService = ExpressPayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        transaction_service_1.TransactionService])
], ExpressPayService);
//# sourceMappingURL=express-pay.service.js.map