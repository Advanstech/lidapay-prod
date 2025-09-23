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
var ReloadlyDataController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReloadlyDataController = void 0;
const common_1 = require("@nestjs/common");
const reloadly_data_service_1 = require("./reloadly-data.service");
const reload_data_dto_1 = require("./dto/reload.data.dto");
const common_2 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let ReloadlyDataController = ReloadlyDataController_1 = class ReloadlyDataController {
    constructor(reloadlyDataService) {
        this.reloadlyDataService = reloadlyDataService;
        this.logger = new common_2.Logger(ReloadlyDataController_1.name);
    }
    async getReloadlyData() {
        return this.reloadlyDataService.getReloadlyData();
    }
    async autoDetect(msisdn, countryCode) {
        this.logger.log(`auto-detect ==> ${msisdn} & ${countryCode}`);
        const trimmedMsisdn = (msisdn || '').trim();
        const code = (countryCode || '').trim().toUpperCase();
        if (!trimmedMsisdn)
            throw new common_1.BadRequestException('Query param "msisdn" is required');
        if (!code || code.length !== 2)
            throw new common_1.BadRequestException('Query param "countryCode" must be a 2-letter ISO code');
        return this.reloadlyDataService.autoDetectOperator(trimmedMsisdn, code);
    }
    async listDataOperators(countryCode) {
        const code = (countryCode || '').trim().toUpperCase();
        if (!code || code.length !== 2)
            throw new common_1.BadRequestException('Country code must be a 2-letter ISO code');
        return this.reloadlyDataService.listDataOperators(code);
    }
    async buyInternetData(dto) {
        this.logger.log(`Buy internet data input ==> ${JSON.stringify(dto)}`);
        return this.reloadlyDataService.buyInternetData(dto);
    }
};
exports.ReloadlyDataController = ReloadlyDataController;
__decorate([
    (0, common_1.Get)('data-test'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check for Reloadly Data integration' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Health check successful' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReloadlyDataController.prototype, "getReloadlyData", null);
__decorate([
    (0, common_1.Get)('auto-detect'),
    (0, swagger_1.ApiOperation)({ summary: 'Auto-detect operator by MSISDN and country code' }),
    (0, swagger_1.ApiQuery)({ name: 'msisdn', required: true, description: 'Phone number to detect operator for', example: '233501234567' }),
    (0, swagger_1.ApiQuery)({ name: 'countryCode', required: true, description: '2-letter ISO country code', example: 'GH' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detected operator details returned' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or missing query parameters' }),
    __param(0, (0, common_1.Query)('msisdn')),
    __param(1, (0, common_1.Query)('countryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReloadlyDataController.prototype, "autoDetect", null);
__decorate([
    (0, common_1.Post)('list-operators'),
    (0, swagger_1.ApiOperation)({ summary: 'List data operators by country code' }),
    (0, swagger_1.ApiBody)({
        description: 'Country filter',
        schema: {
            type: 'object',
            properties: {
                countryCode: { type: 'string', description: '2-letter ISO country code', example: 'NG' }
            },
            required: ['countryCode']
        },
        examples: {
            validRequest: {
                value: { countryCode: 'NG' },
                summary: 'List Nigerian data operators'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Operators listed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid country code supplied' }),
    __param(0, (0, common_1.Body)('countryCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReloadlyDataController.prototype, "listDataOperators", null);
__decorate([
    (0, common_1.Post)('buy-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Purchase internet data bundle' }),
    (0, swagger_1.ApiBody)({
        type: reload_data_dto_1.ReloadDataDto,
        description: 'Internet data purchase details',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', description: 'Purchaser unique ID', example: 'user_123' },
                userName: { type: 'string', description: 'Purchaser name', example: 'John Doe' },
                operatorId: { type: 'number', description: 'Operator ID', example: 1234 },
                operatorName: { type: 'string', description: 'Operator name', example: 'MTN Ghana' },
                amount: { type: 'number', description: 'Purchase amount', example: 20 },
                useLocalAmount: { type: 'boolean', description: 'Treat amount as local operator currency', example: true },
                customIdentifier: { type: 'string', description: 'Optional custom reference', example: 'INV-2024-0001' },
                recipientEmail: { type: 'string', format: 'email', description: 'Recipient email', example: 'recipient@example.com' },
                recipientNumber: { type: 'string', description: 'Recipient MSISDN', example: '233501234567' },
                recipientCountryCode: { type: 'string', description: 'Recipient ISO country code', example: 'GH' },
                senderNumber: { type: 'string', description: 'Sender MSISDN', example: '14085551234' },
                senderCountryCode: { type: 'string', description: 'Sender ISO country code', example: 'US' },
                currency: { type: 'string', description: 'Currency code', example: 'GHS' },
                includeData: { type: 'boolean', description: 'Include raw provider data in response', example: false },
                retailer: { type: 'string', description: 'Retailer name (internal)', example: 'Lidapay' },
                retailerId: { type: 'string', description: 'Retailer ID (internal)', example: 'ret_456' }
            },
            required: ['userId', 'userName', 'operatorId', 'amount', 'recipientNumber', 'recipientCountryCode', 'senderNumber', 'senderCountryCode']
        },
        examples: {
            validRequest: {
                value: {
                    userId: 'user_123',
                    userName: 'John Doe',
                    operatorId: 1234,
                    amount: 20,
                    recipientEmail: 'recipient@example.com',
                    recipientNumber: '233501234567',
                    senderNumber: '14085551234',
                    recipientCountryCode: 'GH',
                    senderCountryCode: 'US',
                    currency: 'GHS',
                    includeData: false
                },
                summary: 'Valid internet data purchase request'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Internet data purchased successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error in request body' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reload_data_dto_1.ReloadDataDto]),
    __metadata("design:returntype", Promise)
], ReloadlyDataController.prototype, "buyInternetData", null);
exports.ReloadlyDataController = ReloadlyDataController = ReloadlyDataController_1 = __decorate([
    (0, swagger_1.ApiTags)('Reloadly Data'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/reloadly-data'),
    __metadata("design:paramtypes", [reloadly_data_service_1.ReloadlyDataService])
], ReloadlyDataController);
//# sourceMappingURL=reloadly-data.controller.js.map