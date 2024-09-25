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
var PscardpaymentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PscardpaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const callback_dto_1 = require("./dto/callback.dto");
const inline_pay_dto_1 = require("./dto/inline.pay.dto");
const pscardpayment_service_1 = require("./pscardpayment.service");
let PscardpaymentController = PscardpaymentController_1 = class PscardpaymentController {
    constructor(pscardpaymentService) {
        this.pscardpaymentService = pscardpaymentService;
        this.logger = new common_1.Logger(PscardpaymentController_1.name);
    }
    async primaryCallback(res, qr) {
        const pc = qr;
        this.logger.log(`TRANSACTION RESPONSE URL => ${JSON.stringify(pc)}`);
        res.status(common_1.HttpStatus.OK).json(pc);
    }
    async inlineCardMobilePayments(transDto) {
        this.logger.debug(`PAYMENT PAYLOAD => ${JSON.stringify(transDto)}`);
        const icmp = await this.pscardpaymentService.inlinePayments(transDto);
        return icmp;
    }
};
exports.PscardpaymentController = PscardpaymentController;
__decorate([
    (0, common_1.Get)('redirecturl'),
    (0, swagger_1.ApiOperation)({ summary: 'Primary Callback' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction response', type: callback_dto_1.CallbackDto }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, callback_dto_1.CallbackDto]),
    __metadata("design:returntype", Promise)
], PscardpaymentController.prototype, "primaryCallback", null);
__decorate([
    (0, common_1.Post)('inline'),
    (0, swagger_1.ApiOperation)({ summary: 'Inline Card Mobile Payments' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                amount: { type: 'number', example: 1.00 },
                email: { type: 'string', example: 'customer@example.com' },
                currency: { type: 'string', example: 'GHS' },
                card_number: { type: 'string', example: '4111111111111111' },
                card_expiry: { type: 'string', example: '05/24' },
                card_cvv: { type: 'string', example: '123' },
                transaction_id: { type: 'string', example: 'TX123456789' },
                description: { type: 'string', example: 'Payment for Product XYZ' },
            },
            required: ['amount', 'email', 'currency', 'card_number', 'card_expiry', 'card_cvv', 'transaction_id']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment response' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [inline_pay_dto_1.InlinePayDto]),
    __metadata("design:returntype", Promise)
], PscardpaymentController.prototype, "inlineCardMobilePayments", null);
exports.PscardpaymentController = PscardpaymentController = PscardpaymentController_1 = __decorate([
    (0, swagger_1.ApiTags)('Card Payment'),
    (0, common_1.Controller)('api/v1/pscardpayment'),
    __metadata("design:paramtypes", [pscardpayment_service_1.PscardpaymentService])
], PscardpaymentController);
//# sourceMappingURL=pscardpayment.controller.js.map