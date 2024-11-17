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
const user_service_1 = require("../user/user.service");
let ExpressPayService = ExpressPayService_1 = class ExpressPayService {
    constructor(httpService, transactionService, userService) {
        this.httpService = httpService;
        this.transactionService = transactionService;
        this.userService = userService;
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
        this.logger.log(`Received payment callback for order: ${orderId}, token: ${token}`, {
            body: req.body,
            params: req.params,
            query: req.query
        });
        try {
            if (!token || !orderId) {
                throw new common_1.HttpException('Invalid callback data', common_1.HttpStatus.BAD_REQUEST);
            }
            const transaction = await this.transactionService.findByTransId(orderId);
            if (!transaction) {
                this.logger.warn(`Transaction not found: ${orderId}`);
                return { message: 'Transaction not found', success: false };
            }
            const queryResponse = await this.queryTransaction(token);
            const updateData = this.mapCallbackStatusUpdate(queryResponse, orderId, req.body);
            this.updateTransactionStatus(updateData, queryResponse, orderId);
            updateData.metadata = this.buildMetadata(queryResponse, orderId, token, req.body);
            await this.transactionService.updateByTrxn(orderId, updateData);
            return {
                success: true,
                message: `Transaction ${updateData.status.service.toLowerCase()}`,
                status: updateData.status.service,
                orderId,
                token
            };
        }
        catch (error) {
            this.handleErrorDuringCallback(error, orderId, token, req.body);
        }
    }
    async handlePostPaymentStatus(postData) {
        const orderId = postData['order-id'] || postData.orderId || null;
        const token = postData.token;
        const result = postData.result !== undefined ? Number(postData.result) : null;
        const resultText = postData['result-text'] || '';
        const transactionId = postData['transaction-id'] || '';
        const amount = postData.amount;
        const currency = postData.currency || 'GHS';
        this.logger.log('Received post payment status', {
            orderId,
            token,
            result,
            resultText,
            transactionId
        });
        try {
            if (!token || !orderId) {
                this.logger.error('Invalid post data', { orderId, token, result });
                throw new common_1.HttpException('Invalid post data', common_1.HttpStatus.BAD_REQUEST);
            }
            const updateData = this.buildPostPaymentUpdateData(postData, orderId, token);
            await this.transactionService.updateByTransId(orderId, updateData);
            this.logger.log(`Transaction status updated`, {
                orderId,
                status: updateData.status.service,
                result
            });
            return {
                success: true,
                message: 'Post payment status processed successfully',
                status: updateData.status.service,
                orderId,
                token
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.warn(`Transaction not found: ${orderId}`);
                return {
                    success: false,
                    message: `Transaction with ID ${orderId} not found`,
                    orderId,
                    token
                };
            }
            this.handleErrorDuringPostStatus(error, orderId, token, postData);
        }
    }
    async initiatePayment(paymentData) {
        const localTransId = generator_util_1.GeneratorUtil.generateOrderId() || 'TNX-';
        const accountNumber = await this.getUserAccountNumber(paymentData.userId);
        this.logger.log(`Initiating payment for orderId: ${localTransId}`);
        this.logger.log(`User Account Number: ${accountNumber}`);
        const initialTransaction = this.buildInitialTransaction(paymentData, localTransId);
        try {
            const ipFormData = await this.buildIpFormData(localTransId, paymentData, accountNumber);
            console.debug(`initiate payment ipFormData: ${JSON.stringify(ipFormData)}`);
            this.logger.debug('Sending payment request to ExpressPay', {
                'order-id': localTransId,
                amount: ipFormData.amount,
            });
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.config.baseUrl}/api/submit.php`, qr.stringify(ipFormData), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }));
            const { status, token, message } = response.data;
            if (status !== 1) {
                await this.handleFailedTransaction(initialTransaction, status, message);
            }
            await this.handleSuccessfulTransaction(initialTransaction, token);
            return {
                checkoutUrl: `${this.config.baseUrl}/api/checkout.php?token=${token}`,
                token,
                'order-id': localTransId
            };
        }
        catch (error) {
            await this.handleErrorDuringPaymentInitiation(error, initialTransaction);
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
            const { result, 'result-text': resultText, 'order-id': orderId, 'transaction-id': transactionId, currency, amount, 'date-processed': dateProcessed } = response.data;
            this.logger.debug('Query Transaction response', {
                token,
                result,
                orderId,
                resultText,
                transactionId
            });
            const updateData = this.buildQueryTransactionUpdateData(result, resultText, orderId, transactionId, currency, amount, dateProcessed);
            await this.transactionService.updateByExpressToken(token, updateData);
            return {
                status: updateData.status.service,
                orderId,
                transactionId,
                amount,
                resultText,
                originalResponse: response.data,
                result
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
    updateTransactionStatus(updateData, queryResponse, orderId) {
        switch (queryResponse.result) {
            case 1:
                this.logger.log(`Payment successful for order: ${orderId}`);
                updateData.status = {
                    service: 'COMPLETED',
                    payment: 'APPROVED',
                    transaction: 'completed'
                };
                updateData.payment = {
                    serviceCode: '1',
                    transactionId: queryResponse.transactionId,
                    serviceMessage: 'SUCCESS',
                    commentary: `Payment completed successfully for order-ID: ${orderId}`
                };
                break;
            case 2:
                this.logger.warn(`Payment declined for order: ${orderId}`);
                updateData.status = {
                    service: 'DECLINED',
                    payment: 'DECLINED',
                    transaction: 'failed'
                };
                updateData.payment = {
                    serviceCode: '2',
                    transactionId: queryResponse.transactionId,
                    serviceMessage: 'DECLINED',
                    commentary: `Payment declined for order-ID: ${orderId}. Reason: ${queryResponse.resultText}`
                };
                break;
            case 3:
                this.logger.error(`Payment error for order: ${orderId}`);
                updateData.status = {
                    service: 'ERROR',
                    payment: 'ERROR',
                    transaction: 'failed'
                };
                updateData.payment = {
                    serviceCode: '3',
                    transactionId: queryResponse.transactionId,
                    serviceMessage: 'ERROR',
                    commentary: `Payment error for order-ID: ${orderId}. Reason: ${queryResponse.resultText}`
                };
                break;
            case 4:
                this.logger.log(`Payment pending for order: ${orderId}`);
                updateData.status = {
                    service: 'PENDING',
                    payment: 'PENDING',
                    transaction: 'pending'
                };
                updateData.payment = {
                    serviceCode: '4',
                    transactionId: queryResponse.transactionId,
                    serviceMessage: 'PENDING',
                    commentary: `Transaction pending for order-ID: ${orderId}. Final status will be provided via post-url`
                };
                break;
            default:
                this.logger.warn(`Unexpected status for order: ${orderId}`);
                updateData.status = {
                    service: 'UNKNOWN',
                    payment: 'UNKNOWN',
                    transaction: 'failed'
                };
                updateData.payment = {
                    serviceCode: '0',
                    transactionId: queryResponse.transactionId,
                    serviceMessage: 'UNKNOWN',
                    commentary: `Unknown payment status for order-ID: ${orderId}. Please check transaction details`
                };
        }
    }
    buildMetadata(queryResponse, orderId, token, callbackData) {
        return [{
                result: queryResponse.result,
                'result-text': queryResponse.resultText,
                'order-id': orderId,
                token,
                'transaction-id': queryResponse.transactionId,
                amount: queryResponse.amount,
                currency: callbackData.currency || 'GHS',
                'date-processed': new Date().toISOString(),
                lastQueryAt: new Date().toISOString(),
                callbackData
            }];
    }
    async handleErrorDuringCallback(error, orderId, token, callbackData) {
        this.logger.error('Payment callback processing failed', {
            error: error.message,
            orderId,
            token,
            stack: error.stack
        });
        if (orderId) {
            try {
                const errorUpdate = {
                    status: {
                        service: 'ERROR',
                        payment: 'ERROR',
                        transaction: 'failed'
                    },
                    payment: {
                        serviceCode: '500',
                        transactionId: '',
                        serviceMessage: 'Callback processing failed',
                        commentary: `Error processing callback: ${error.message}`
                    },
                    metadata: [{
                            result: 0,
                            'result-text': error.message,
                            'order-id': orderId,
                            token,
                            lastQueryAt: new Date().toISOString(),
                            error: true,
                            errorDetails: error.message
                        }],
                    queryLastChecked: new Date()
                };
                await this.transactionService.updateByTrxn(orderId, errorUpdate);
            }
            catch (updateError) {
                this.logger.error('Failed to update transaction with error status', {
                    error: updateError.message,
                    orderId,
                    originalError: error.message
                });
            }
        }
        throw new express_pay_error_1.ExpressPayError('CALLBACK_PROCESSING_FAILED', error.message);
    }
    buildPostPaymentUpdateData(postData, orderId, token) {
        const result = postData.result !== undefined ? Number(postData.result) : null;
        const resultText = postData['result-text'] || '';
        const transactionId = postData['transaction-id'] || '';
        return {
            status: {
                service: this.mapServiceStatus(result),
                payment: this.mapServiceStatus(result),
                transaction: this.mapTransactionStatus(this.mapServiceStatus(result))
            },
            payment: {
                serviceCode: String(result),
                transactionId: transactionId,
                serviceMessage: resultText,
                commentary: this.generatePostUrlCommentary(result, orderId, resultText)
            },
            queryLastChecked: new Date(),
            metadata: [{
                    result,
                    'result-text': resultText,
                    'order-id': orderId,
                    token,
                    'transaction-id': transactionId,
                    amount: postData.amount,
                    currency: postData.currency || 'GHS',
                    'date-processed': new Date().toISOString(),
                    lastQueryAt: new Date().toISOString(),
                    postUrlData: postData
                }]
        };
    }
    async handleErrorDuringPostStatus(error, orderId, token, postData) {
        this.logger.error('Post payment status processing failed', {
            error: error.message,
            orderId,
            token,
            stack: error.stack
        });
        if (orderId) {
            try {
                const errorUpdate = {
                    status: {
                        service: 'ERROR',
                        payment: 'ERROR',
                        transaction: 'failed'
                    },
                    payment: {
                        serviceCode: '500',
                        transactionId: '',
                        serviceMessage: 'Post-URL processing failed',
                        commentary: `Error processing post-URL update: ${error.message}`
                    },
                    metadata: [{
                            result: 0,
                            'result-text': error.message,
                            'order-id': orderId,
                            token,
                            'transaction-id': postData['transaction-id'],
                            lastQueryAt: new Date().toISOString(),
                            error: true,
                            errorDetails: error.message,
                            originalPostData: postData
                        }],
                    queryLastChecked: new Date()
                };
                await this.transactionService.updateByTransId(orderId, errorUpdate);
            }
            catch (updateError) {
                this.logger.error('Failed to update transaction with error status', {
                    error: updateError.message,
                    orderId,
                    originalError: error.message
                });
            }
        }
        throw new express_pay_error_1.ExpressPayError('POST_STATUS_PROCESSING_FAILED', error.message);
    }
    buildInitialTransaction(paymentData, localTransId) {
        return {
            userId: paymentData.userId,
            userName: paymentData.userName,
            firstName: paymentData.firstName || '',
            lastName: paymentData.lastName || '',
            email: paymentData.email,
            transId: localTransId,
            recipientNumber: paymentData.phoneNumber,
            retailer: 'EXPRESSPAY',
            expressToken: '',
            transType: paymentData.transType || 'MOMO',
            customerMsisdn: paymentData.phoneNumber,
            walletOperator: '',
            payTransRef: paymentData.payTransRef || '',
            status: {
                transaction: 'pending',
                service: 'pending',
                payment: 'pending'
            },
            monetary: {
                amount: Number(paymentData.amount) + Number(constants_1.FEE_CHARGES),
                fee: constants_1.FEE_CHARGES || 0,
                originalAmount: paymentData.amount.toString(),
                currency: 'GHS'
            },
            payment: {
                type: 'DEBIT',
                currency: 'GHS',
                serviceCode: '',
                transactionId: '',
                serviceMessage: '',
                commentary: ''
            },
            metadata: [{
                    result: 0,
                    'result-text': 'Initiated',
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
    }
    async getUserAccountNumber(userId) {
        const user = await this.userService.findOneById(userId);
        if (user && user.account) {
            const account = await this.userService.getAccountById(user.account.toString());
            return account ? account.accountId : null;
        }
        return null;
    }
    async buildIpFormData(localTransId, paymentData, accountNumber) {
        return {
            'merchant-id': this.config.liveMerchantId,
            'api-key': this.config.liveApiKey,
            firstname: paymentData.firstName,
            lastname: paymentData.lastName,
            email: paymentData.email,
            phonenumber: paymentData.phoneNumber,
            username: paymentData.username || paymentData.phoneNumber,
            accountnumber: accountNumber,
            currency: 'GHS',
            amount: paymentData.amount.toFixed(2),
            'order-id': localTransId,
            'order-desc': paymentData.orderDesc || '',
            'redirect-url': this.config.redirectUrl,
            'post-url': this.config.postUrl,
            'order-img-url': paymentData.orderImgUrl || '',
        };
    }
    async handleErrorDuringPaymentInitiation(error, initialTransaction) {
        this.logger.error('Payment initiation failed', {
            error: error.message,
            transaction: initialTransaction,
            stack: error.stack
        });
        if (!(error instanceof express_pay_error_1.ExpressPayError)) {
            const errorTransaction = {
                ...initialTransaction,
                status: {
                    transaction: 'failed',
                    service: 'FAILED',
                    payment: 'FAILED'
                },
                payment: {
                    ...initialTransaction.payment,
                    serviceCode: '500',
                    serviceMessage: 'SYSTEM_ERROR',
                    commentary: `System error occurred: ${error.message}`
                },
                metadata: [{
                        initiatedAt: new Date(),
                        provider: 'EXPRESSPAY',
                        username: initialTransaction.userName || initialTransaction.recipientNumber,
                        accountNumber: initialTransaction.payTransRef || '',
                        lastQueryAt: new Date()
                    }],
                queryLastChecked: new Date()
            };
            await this.transactionService.create(errorTransaction);
        }
        if (error instanceof express_pay_error_1.ExpressPayError) {
            throw error;
        }
        throw new express_pay_error_1.ExpressPayError('SYSTEM_ERROR', error.message);
    }
    async handleFailedTransaction(initialTransaction, status, message) {
        const failedTransaction = {
            ...initialTransaction,
            status: {
                transaction: 'failed',
                service: 'FAILED',
                payment: 'FAILED'
            },
            payment: {
                ...initialTransaction.payment,
                serviceCode: status.toString(),
                serviceMessage: message || 'Payment initiation failed',
                commentary: `Transaction failed: ${message}`
            },
            metadata: [{
                    initiatedAt: new Date(),
                    provider: 'EXPRESSPAY',
                    username: initialTransaction.userName || initialTransaction.phoneNumber,
                    accountNumber: initialTransaction.accountNumber || '',
                    lastQueryAt: new Date()
                }],
            queryLastChecked: new Date()
        };
        await this.transactionService.create(failedTransaction);
        throw new express_pay_error_1.ExpressPayError('PAYMENT_INITIATION_FAILED', { status, message });
    }
    async handleSuccessfulTransaction(initialTransaction, token) {
        const successTransaction = {
            ...initialTransaction,
            expressToken: token,
            metadata: [{
                    initiatedAt: new Date(),
                    provider: 'EXPRESSPAY',
                    username: initialTransaction.userName || initialTransaction.phoneNumber,
                    accountNumber: initialTransaction.accountNumber || '',
                    token: token,
                    result: 1,
                    'result-text': 'Pending',
                    lastQueryAt: new Date()
                }]
        };
        await this.transactionService.create(successTransaction);
    }
    buildQueryTransactionUpdateData(result, resultText, orderId, transactionId, currency, amount, dateProcessed) {
        return {
            status: {
                service: this.mapServiceStatus(result),
                payment: this.mapServiceStatus(result),
                transaction: this.mapTransactionStatus(this.mapServiceStatus(result))
            },
            payment: {
                serviceCode: result.toString(),
                transactionId: transactionId,
                serviceMessage: resultText,
                commentary: this.generateCommentary(this.mapServiceStatus(result), orderId, resultText)
            },
            queryLastChecked: new Date(),
            metadata: [{
                    result,
                    'result-text': resultText,
                    'order-id': orderId,
                    token: '',
                    'transaction-id': transactionId,
                    currency,
                    amount,
                    'date-processed': dateProcessed,
                    lastQueryAt: new Date().toISOString()
                }]
        };
    }
    mapServiceStatus(result) {
        const statusMap = {
            1: 'COMPLETED',
            2: 'DECLINED',
            3: 'ERROR',
            4: 'PENDING'
        };
        return statusMap[result] || 'UNKNOWN';
    }
    mapTransactionStatus(serviceStatus) {
        const statusMap = {
            'COMPLETED': 'completed',
            'DECLINED': 'failed',
            'ERROR': 'failed',
            'PENDING': 'pending',
            'UNKNOWN': 'failed'
        };
        return statusMap[serviceStatus] || 'failed';
    }
    generateCommentary(status, orderId, resultText) {
        const commentaryMap = {
            'COMPLETED': `Payment completed successfully for order-ID: ${orderId}`,
            'DECLINED': `Payment declined for order-ID: ${orderId}. Reason: ${resultText}`,
            'ERROR': `Payment error for order-ID: ${orderId}. Reason: ${resultText}`,
            'PENDING': `Transaction pending for order-ID: ${orderId}. Final status will be provided via post-url`,
            'UNKNOWN': `Unknown payment status for order-ID: ${orderId}. Please check transaction details`
        };
        return commentaryMap[status] || `Unexpected status for order-ID: ${orderId}`;
    }
    generatePostUrlCommentary(result, orderId, resultText) {
        const commentaryMap = {
            1: `Payment confirmed via post-URL for order-ID: ${orderId}`,
            2: `Payment declined via post-URL for order-ID: ${orderId}. Reason: ${resultText}`,
            3: `Payment error reported via post-URL for order-ID: ${orderId}. Details: ${resultText}`,
            4: `Payment still pending via post-URL for order-ID: ${orderId}`,
        };
        return commentaryMap[result] || `Unexpected post-URL status (${result}) for order-ID: ${orderId}. Details: ${resultText}`;
    }
    mapCallbackStatusUpdate(queryResponse, orderId, callbackData) {
        return {
            status: {
                service: this.mapServiceStatus(queryResponse.result),
                payment: this.mapServiceStatus(queryResponse.result),
                transaction: this.mapTransactionStatus(this.mapServiceStatus(queryResponse.result))
            },
            payment: {
                serviceCode: queryResponse.result.toString(),
                transactionId: queryResponse['transaction-id'] || '',
                serviceMessage: queryResponse['result-text'] || '',
                commentary: this.generateCommentary(this.mapServiceStatus(queryResponse.result), orderId, queryResponse['result-text'])
            },
            queryLastChecked: new Date(),
            metadata: [{
                    result: queryResponse.result,
                    'result-text': queryResponse['result-text'],
                    'order-id': orderId,
                    token: '',
                    'transaction-id': queryResponse['transaction-id'] || '',
                    amount: queryResponse.amount,
                    currency: callbackData.currency || 'GHS',
                    'date-processed': new Date().toISOString(),
                    lastQueryAt: new Date().toISOString(),
                    postUrlData: callbackData
                }]
        };
    }
};
exports.ExpressPayService = ExpressPayService;
exports.ExpressPayService = ExpressPayService = ExpressPayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        transaction_service_1.TransactionService,
        user_service_1.UserService])
], ExpressPayService);
//# sourceMappingURL=express-pay.service.js.map