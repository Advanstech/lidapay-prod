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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AdvansispayController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvansispayController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const mobile_money_service_1 = require("./mobile-money/mobile-money.service");
const express_pay_service_1 = require("./express-pay.service");
const initiate_payment_dto_1 = require("./dto/initiate-payment.dto");
const create_transaction_dto_1 = require("./mobile-money/dto/create-transaction.dto");
const callback_dto_1 = require("./dto/callback.dto");
let AdvansispayController = AdvansispayController_1 = class AdvansispayController {
    constructor(mobileMoneyService, expressPayService) {
        this.mobileMoneyService = mobileMoneyService;
        this.expressPayService = expressPayService;
        this.logger = new common_1.Logger(AdvansispayController_1.name);
    }
    async primaryCallback(res, qr) {
        const { 'order-id': orderId, token } = qr;
        this.logger.log(`callback response =>> ${JSON.stringify(qr)}`);
        await this.expressPayService.paymentCallbackURL(qr);
        res.status(common_1.HttpStatus.OK).json({ orderId, token });
    }
    async initiatePayment(paymentData) {
        try {
            const result = await this.expressPayService.initiatePayment(paymentData);
            return {
                status: 201,
                message: 'Payment initiated successfully.',
                data: result,
            };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Internal server error.', error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async processTransaction(transData) {
        try {
            const result = await this.mobileMoneyService.processTransaction(transData);
            return {
                status: 201,
                message: 'Transaction processed successfully.',
                data: result,
            };
        }
        catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error.',
            };
        }
    }
    async paymentCallbackURL(req) {
        return this.expressPayService.paymentCallbackURL(req);
    }
    async queryTransaction(token) {
        try {
            const result = await this.expressPayService.queryTransaction(token);
            return {
                status: 200,
                message: 'Transaction found.',
                data: result,
            };
        }
        catch (error) {
            return {
                status: error.status || 500,
                message: error.message || 'Internal server error.',
            };
        }
    }
};
exports.AdvansispayController = AdvansispayController;
__decorate([
    (0, common_1.Get)(`redirecturl`),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, callback_dto_1.PaymentCallbackDto]),
    __metadata("design:returntype", Promise)
], AdvansispayController.prototype, "primaryCallback", null);
__decorate([
    (0, common_1.Post)('initiate-payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate a mobile money payment' }),
    (0, swagger_1.ApiBody)({
        description: 'Payment initiation data',
        type: initiate_payment_dto_1.InitiatePaymentDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment initiated successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [initiate_payment_dto_1.InitiatePaymentDto]),
    __metadata("design:returntype", Promise)
], AdvansispayController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Post)('debit-wallet'),
    (0, swagger_1.ApiOperation)({
        summary: 'Process a mobile money transaction'
    }),
    (0, swagger_1.ApiBody)({
        description: 'Transaction data to be processed',
        type: create_transaction_dto_1.CreateTransactionDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transaction processed successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", Promise)
], AdvansispayController.prototype, "processTransaction", null);
__decorate([
    (0, common_1.Post)('payment-callback'),
    (0, swagger_1.ApiOperation)({
        summary: 'Receive payment callback from ExpressPay'
    }),
    (0, swagger_1.ApiBody)({
        description: 'Callback data from ExpressPay',
        type: callback_dto_1.PaymentCallbackDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Callback processed successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid callback data.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdvansispayController.prototype, "paymentCallbackURL", null);
__decorate([
    (0, common_1.Post)('query-transaction'),
    (0, swagger_1.ApiOperation)({
        summary: 'Query transaction by token',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'token',
        description: 'Transaction token',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction found.' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found.' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error.' }),
    __param(0, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdvansispayController.prototype, "queryTransaction", null);
exports.AdvansispayController = AdvansispayController = AdvansispayController_1 = __decorate([
    (0, swagger_1.ApiTags)('Advansis Money'),
    (0, common_1.Controller)('api/v1/advansispay'),
    __metadata("design:paramtypes", [mobile_money_service_1.MobileMoneyService,
        express_pay_service_1.ExpressPayService])
], AdvansispayController);
//# sourceMappingURL=advansispay.controller.js.map