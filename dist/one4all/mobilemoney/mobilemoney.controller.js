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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobilemoneyController = void 0;
const common_1 = require("@nestjs/common");
const send_money_dto_1 = require("./dto/send.money.dto");
const receive_money_dto_1 = require("./dto/receive.money.dto");
const mobilemoney_service_1 = require("./mobilemoney.service");
const swagger_1 = require("@nestjs/swagger");
let MobilemoneyController = class MobilemoneyController {
    constructor(mobilemoneyService) {
        this.mobilemoneyService = mobilemoneyService;
        this.logger = new common_1.Logger('MobilemoneyController');
    }
    async creditWallet(transDto) {
        const cw = await this.mobilemoneyService.sendMobileMoney(transDto);
        return cw;
    }
    async debitWallet(transDto) {
        const dw = await this.mobilemoneyService.receiveMobileMoney(transDto);
        return dw;
    }
};
exports.MobilemoneyController = MobilemoneyController;
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send money to a recipient' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                apiKey: { type: 'string' },
                apiSecret: { type: 'string' },
                transId: { type: 'string' },
                transType: { type: 'string' },
                serviceName: { type: 'string' },
                customerName: { type: 'string' },
                customerEmail: { type: 'string' },
                clientReference: { type: 'string' },
                recipientMsisdn: { type: 'string' },
                network: { type: 'string' },
                amount: { type: 'string' },
                description: { type: 'string' },
                primaryCallbackUrl: { type: 'string' },
                secondaryCallbackUrl: { type: 'string' },
                token: { type: 'string' },
                transStatus: { type: 'string' },
                transMessage: { type: 'string' },
                serviceStatus: { type: 'string' },
                serviceTransId: { type: 'string' },
                paymentStatus: { type: 'string' },
                otherInfo: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully sent money' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_money_dto_1.SendMoneyDto]),
    __metadata("design:returntype", Promise)
], MobilemoneyController.prototype, "creditWallet", null);
__decorate([
    (0, common_1.Post)('receive'),
    (0, swagger_1.ApiOperation)({ summary: 'Receive money from a sender' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                apiKey: { type: 'string' },
                apiSecret: { type: 'string' },
                transId: { type: 'string' },
                transType: { type: 'string' },
                serviceName: { type: 'string' },
                recipientName: { type: 'string' },
                customerEmail: { type: 'string' },
                clientReference: { type: 'string' },
                customerMsisdn: { type: 'string' },
                channel: { type: 'string' },
                amount: { type: 'string' },
                description: { type: 'string' },
                transStatus: { type: 'string' },
                transMessage: { type: 'string' },
                serviceStatus: { type: 'string' },
                serviceTransId: { type: 'string' },
                paymentStatus: { type: 'string' },
                otherInfo: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Successfully received money' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [receive_money_dto_1.ReceiveMoneyDto]),
    __metadata("design:returntype", Promise)
], MobilemoneyController.prototype, "debitWallet", null);
exports.MobilemoneyController = MobilemoneyController = __decorate([
    (0, swagger_1.ApiTags)('Mobile Money'),
    (0, common_1.Controller)('api/v1/mobilemoney'),
    __metadata("design:paramtypes", [mobilemoney_service_1.MobilemoneyService])
], MobilemoneyController);
//# sourceMappingURL=mobilemoney.controller.js.map