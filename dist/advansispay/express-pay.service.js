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
            liveMerchantId: process.env.EXPRESSPAY_LIVE_MERCHANT_ID || constants_1.EXPRESSPAY_LIVE_MERCHANT_ID,
            apiKey: process.env.EXPRESSPAY_API_KEY || constants_1.EXPRESSPAY_API_KEY,
            liveApiKey: process.env.EXPRESSPAY_LIVE_API_KEY || constants_1.EXPRESSPAY_LIVE_API_KEY,
            baseUrl: process.env.EXPRESSPAY_BASE_URL || constants_1.EXPRESSPAY_BASE_URL,
            testUrl: process.env.EXPRESSPAY_TEST_BASE_URL || constants_1.EXPRESSPAY_TEST_BASE_URL,
            redirectUrl: process.env.EXPRESSPAY_REDIRECT_URL || constants_1.EXPRESSPAY_REDIRECT_URL,
            postUrl: process.env.EXPRESSPAY_POST_URL || constants_1.EXPRESSPAY_POST_URL,
        };
    }
    async paymentCallbackURL(req) {
        const orderId = req['order-id'] ? String(req['order-id']) : null;
        const token = req.token ? String(req.token) : null;
        this.logger.log(`Received payment callback for order: ${orderId}, token: ${token}`);
        try {
            if (!token || !orderId) {
                throw new common_1.HttpException('Invalid callback data', common_1.HttpStatus.BAD_REQUEST);
            }
            this.logger.log(`Payment Callback URL orderId =>>${orderId}`);
            const transactionExists = await this.transactionService.findByTransId(orderId);
            if (!transactionExists) {
                this.logger.warn(`Transaction with orderId ${orderId} not found. Cannot update status.`);
                return { message: 'Transaction not found' };
            }
            this.logger.log(`Payment Callback Query Transaction with Token =>>${token}`);
            const transactionResponse = await this.queryTransaction(token);
            if (transactionResponse.result === 3) {
                this.logger.warn(`No transaction data available for token: ${token}. Updating status to UNKNOWN.`);
                await this.transactionService.updateByTrxn(orderId, {
                    paymentServiceCode: '3',
                    paymentStatus: 'UNKNOWN',
                    paymentServiceMessage: `UNKNOWN error`,
                    lastChecked: new Date(),
                    metadata: req.body,
                    paymentCommentary: `Payment status is unknown for order ID: ${orderId}. Please check the transaction details.`,
                });
                return { message: 'Transaction status updated to UNKNOWN' };
            }
            else if (transactionResponse.result === 2) {
                this.logger.error(`Transaction declined for token: ${token}. Result text: ${transactionResponse.resultText}`);
                await this.transactionService.updateByTrxn(orderId, {
                    paymentServiceCode: '2',
                    paymentStatus: 'DECLINED',
                    paymentServiceMessage: `Payment with order-ID: ${orderId} DECLINED`,
                    lastChecked: new Date(),
                    metadata: req.body,
                    paymentCommentary: `Payment declined for order-ID: ${orderId}, token: ${token}. Reason: ${transactionResponse.resultText}`,
                });
            }
            else if (transactionResponse.result === 1) {
                await this.transactionService.updateByTrxn(orderId, {
                    paymentServiceCode: '1',
                    paymentStatus: 'APPROVED',
                    paymentServiceMessage: `SUCCESS`,
                    lastChecked: new Date(),
                    metadata: req.body,
                    paymentCommentary: `Transaction payment completed successfully with token: ${token}`,
                });
                this.logger.log(`Transaction status updated for order: ${orderId}, new status: COMPLETED`);
                return { message: 'Callback processed successfully' };
            }
            else if (transactionResponse.result === 4) {
                this.logger.log(`Transaction pending for token: ${token}. Waiting for post-url callback.`);
                await this.transactionService.updateByTrxn(orderId, {
                    paymentServiceCode: '4',
                    paymentStatus: 'PENDING',
                    paymentServiceMessage: `Payment processing in progress`,
                    lastChecked: new Date(),
                    metadata: req.body,
                    paymentCommentary: `Transaction pending for order-ID: ${orderId}. Final status will be provided via post-url.`,
                });
                return { message: 'Transaction is pending, waiting for final status' };
            }
            else {
                this.logger.warn(`Unexpected transaction result: ${transactionResponse.result}`);
            }
        }
        catch (error) {
            this.logger.error('Error processing payment callback', {
                error: error.message,
                orderId,
                stack: error.stack,
            });
            throw new express_pay_error_1.ExpressPayError('CALLBACK_PROCESSING_FAILED', error.message);
        }
    }
    async handlePostPaymentStatus(postData) {
        const orderId = postData['order-id'];
        const token = postData.token;
        const result = postData.result !== undefined ? Number(postData.result) : null;
        const resultText = postData['result-text'] || '';
        const transactionId = postData['transaction-id'] || '';
        this.logger.log(`Received post payment status for order: ${orderId}, token: ${token}, result: ${result}, resultText: ${resultText}`);
        try {
            if (!token || !orderId) {
                this.logger.error('Invalid post data', { orderId, token, result });
                throw new common_1.HttpException('Invalid post data', common_1.HttpStatus.BAD_REQUEST);
            }
            let paymentStatus;
            switch (result) {
                case 1:
                    paymentStatus = 'APPROVED';
                    break;
                case 2:
                    paymentStatus = 'DECLINED';
                    break;
                case 3:
                    paymentStatus = 'ERROR';
                    break;
                case 4:
                    paymentStatus = 'PENDING';
                    break;
                default:
                    paymentStatus = 'UNKNOWN';
            }
            await this.transactionService.updateByTrxn(orderId, {
                paymentServiceCode: String(result),
                paymentStatus: paymentStatus,
                paymentServiceMessage: resultText,
                paymentTransactionId: transactionId,
                lastChecked: new Date(),
                metadata: postData,
                paymentCommentary: `Post-URL update: ${resultText} (Result: ${result})`,
            });
            this.logger.log(`Transaction status updated for order: ${orderId}, new status: ${paymentStatus}`);
            return { message: 'Post payment status processed successfully' };
        }
        catch (error) {
            this.logger.error('Error processing post payment status', {
                error: error.message,
                orderId,
                stack: error.stack,
            });
            if (orderId) {
                try {
                    await this.transactionService.updateByTrxn(orderId, {
                        paymentServiceCode: '500',
                        paymentStatus: 'ERROR',
                        paymentServiceMessage: 'Error processing post payment status',
                        lastChecked: new Date(),
                        metadata: {
                            ...postData,
                            error: error.message,
                            errorTimestamp: new Date(),
                        },
                        paymentCommentary: `Failed to process post-URL update: ${error.message}`,
                    });
                }
                catch (updateError) {
                    this.logger.error('Failed to update transaction with error status', {
                        error: updateError.message,
                        orderId,
                        originalError: error.message,
                    });
                }
            }
            throw new express_pay_error_1.ExpressPayError('POST_STATUS_PROCESSING_FAILED', error.message);
        }
    }
    async initiatePayment(paymentData) {
        const localTransId = generator_util_1.GeneratorUtil.generateOrderId() || 'TNX-';
        this.logger.log(`Initiating payment for orderId as localTransId:: ${localTransId}`);
        const ipParamSave = {
            userId: paymentData.userId,
            userName: paymentData.userName,
            firstName: paymentData.firstName || '',
            lastName: paymentData.lastName || '',
            email: paymentData.email,
            transId: localTransId,
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
            expressToken: '',
            serviceStatus: 'pending',
            transStatus: 'pending',
            transType: paymentData.transType || 'MOMO',
            recipientNumber: paymentData.phoneNumber,
            timestamp: new Date(),
            queryLastChecked: new Date()
        };
        try {
            const ipFormData = {
                'merchant-id': this.config.liveMerchantId,
                'api-key': this.config.liveApiKey,
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
            console.log('initiate payment payload  =>>');
            this.logger.debug('Sending payment request to ExpressPay', {
                'order-id': ipFormData,
                amount: ipFormData.amount,
            });
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.config.baseUrl}/api/submit.php`, qr.stringify(ipFormData), {
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
                const failedTransaction = {
                    ...ipParamSave,
                    transStatus: 'failed',
                    serviceStatus: 'FAILED',
                    paymentStatus: 'FAILED',
                    paymentServiceCode: status.toString(),
                    paymentTransactionId: '',
                    paymentServiceMessage: message || 'Payment initiation failed',
                    paymentCommentary: `Transaction failed: ${message}`,
                    expressToken: '',
                    metadata: [{
                            result: status,
                            'result-text': message,
                            'order-id': localTransId,
                            token: '',
                            currency: 'GHS',
                            amount: paymentData.amount.toFixed(2),
                            'transaction-id': '',
                            'date-processed': new Date().toISOString().replace('T', ' ').slice(0, 19),
                            lastQueryAt: new Date().toISOString()
                        }],
                    timestamp: new Date(),
                    queryLastChecked: new Date()
                };
                await this.transactionService.create(failedTransaction);
                throw new express_pay_error_1.ExpressPayError('PAYMENT_INITIATION_FAILED', {
                    status,
                    message,
                });
            }
            this.logger.log(`Payment initiated successfully. Token: ${token}`);
            ipParamSave.expressToken = token;
            ipParamSave.metadata = [{
                    result: 1,
                    'result-text': 'Pending',
                    'order-id': localTransId,
                    token: token,
                    currency: 'GHS',
                    amount: paymentData.amount.toFixed(2),
                    'transaction-id': '',
                    'date-processed': new Date().toISOString().replace('T', ' ').slice(0, 19),
                    lastQueryAt: new Date().toISOString()
                }];
            await this.transactionService.create(ipParamSave);
            return {
                checkoutUrl: `${this.config.baseUrl}/api/checkout.php?token=${token}`,
                token,
                'order-id': ipParamSave.transId,
            };
        }
        catch (error) {
            this.logger.error('Payment initiation error', {
                error: error.message,
                'order-id': localTransId,
                stack: error.stack,
            });
            if (!(error instanceof express_pay_error_1.ExpressPayError)) {
                const errorTransaction = {
                    ...ipParamSave,
                    transId: localTransId,
                    transStatus: 'failed',
                    serviceStatus: 'FAILED',
                    paymentStatus: 'FAILED',
                    paymentServiceCode: '500',
                    paymentTransactionId: '',
                    paymentServiceMessage: 'SYSTEM_ERROR',
                    paymentCommentary: `System error occurred: ${error.message}`,
                    expressToken: '',
                    metadata: [{
                            result: 0,
                            'result-text': error.message,
                            'order-id': localTransId,
                            token: '',
                            currency: 'GHS',
                            amount: paymentData.amount.toFixed(2),
                            'transaction-id': '',
                            'date-processed': new Date().toISOString().replace('T', ' ').slice(0, 19),
                            lastQueryAt: new Date().toISOString()
                        }],
                    timestamp: new Date(),
                    queryLastChecked: new Date()
                };
                await this.transactionService.create(errorTransaction);
            }
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
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.config.baseUrl}/api/query.php`, qr.stringify(formData), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }));
            const { result, orderId, amount, 'transaction-id': transactionId, 'result-text': resultText, } = response.data;
            this.logger.debug('Query Transaction response', {
                token,
                result,
                orderId,
                resultText,
            });
            const statusMap = {
                1: 'COMPLETED',
                2: 'DECLINED',
                3: 'ERROR',
                4: 'PENDING',
            };
            const status = statusMap[result];
            await this.transactionService.updateByExpressToken(token, {
                serviceStatus: status,
                paymentTransactionId: transactionId,
                queryLastChecked: new Date(),
                metadata: {
                    ...response.data,
                    lastQueryAt: new Date(),
                },
            });
            return {
                status,
                orderId,
                transactionId,
                amount,
                resultText,
                originalResponse: response.data,
                result,
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