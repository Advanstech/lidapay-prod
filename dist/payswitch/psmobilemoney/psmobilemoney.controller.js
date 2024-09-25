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
var PsmobilemoneyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsmobilemoneyController = void 0;
const common_1 = require("@nestjs/common");
const psmobilemoney_service_1 = require("./psmobilemoney.service");
const transfer_mobilemoney_dto_1 = require("./dto/transfer.mobilemoney.dto");
const pay_mobilemoney_dto_1 = require("./dto/pay.mobilemoney.dto");
const swagger_1 = require("@nestjs/swagger");
let PsmobilemoneyController = PsmobilemoneyController_1 = class PsmobilemoneyController {
    constructor(psMobilemoneyService) {
        this.psMobilemoneyService = psMobilemoneyService;
        this.logger = new common_1.Logger(PsmobilemoneyController_1.name);
    }
    async creditWallet(transDto) {
        const cw = await this.psMobilemoneyService.transferMobilemoney(transDto);
        return cw;
    }
    async debitWallet(transDto) {
        this.logger.debug(`Debit wallet request: ${JSON.stringify(transDto)}`);
        const dw = await this.psMobilemoneyService.mobileMoneyPayment(transDto);
        this.logger.debug(`Debit wallet response: ${JSON.stringify(dw)}`);
        return dw;
    }
};
exports.PsmobilemoneyController = PsmobilemoneyController;
__decorate([
    (0, common_1.Post)('transfermoney'),
    (0, swagger_1.ApiOperation)({ summary: 'Transfer mobile money' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                amount: { type: 'number', example: 100.00 },
                recipient: { type: 'string', example: '0201234567' },
                network: { type: 'string', example: 'MTN' },
                description: { type: 'string', example: 'Transfer for goods' },
                transactionId: { type: 'string', example: 'TRX123456789' }
            },
            required: ['amount', 'recipient', 'network', 'transactionId']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Mobile money transferred successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transfer_mobilemoney_dto_1.TransferMobileMoneyDto]),
    __metadata("design:returntype", Promise)
], PsmobilemoneyController.prototype, "creditWallet", null);
__decorate([
    (0, common_1.Post)('debitwallet'),
    (0, swagger_1.ApiOperation)({ summary: 'Debit mobile money' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                amount: { type: 'number', example: 50.00 },
                customerMsisdn: { type: 'string', example: '0201234567' },
                network: { type: 'string', example: 'VODAFONE' },
                description: { type: 'string', example: 'Payment for service' },
                transactionId: { type: 'string', example: 'PAY987654321' }
            },
            required: ['amount', 'customerMsisdn', 'network', 'transactionId']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Mobile money debited successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pay_mobilemoney_dto_1.PayMobileMoneyDto]),
    __metadata("design:returntype", Promise)
], PsmobilemoneyController.prototype, "debitWallet", null);
exports.PsmobilemoneyController = PsmobilemoneyController = PsmobilemoneyController_1 = __decorate([
    (0, swagger_1.ApiTags)('PS Mobile Money'),
    (0, common_1.Controller)('api/v1/psmobilemoney'),
    __metadata("design:paramtypes", [psmobilemoney_service_1.PsmobilemoneyService])
], PsmobilemoneyController);
//# sourceMappingURL=psmobilemoney.controller.js.map