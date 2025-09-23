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
var AirtimeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirtimeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const airtime_service_1 = require("./airtime.service");
const topup_dto_1 = require("./dto/topup.dto");
const transtatus_dto_1 = require("./dto/transtatus.dto");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const user_or_merchant_guard_1 = require("../../auth/user-or-merchant.guard");
let AirtimeController = AirtimeController_1 = class AirtimeController {
    constructor(airtimeService) {
        this.airtimeService = airtimeService;
        this.logger = new common_1.Logger(AirtimeController_1.name);
    }
    async queryTransactionstatus(qtsDto) {
        this.logger.log(`transtatus dto => ${JSON.stringify(qtsDto)}`);
        const ts = this.airtimeService.transactionStatus(qtsDto);
        return ts;
    }
    async processTopup(ptDto, req) {
        this.logger.log(`=== AIRTIME TOPUP REQUEST START ===`);
        this.logger.log(`Request URL: ${req.url}`);
        this.logger.log(`Request Method: ${req.method}`);
        this.logger.log(`Request Timestamp: ${new Date().toISOString()}`);
        this.logger.log(`Raw request body: ${JSON.stringify(req.body, null, 2)}`);
        this.logger.log(`Content-Type: ${req.headers['content-type']}`);
        this.logger.log(`User-Agent: ${req.headers['user-agent']}`);
        this.logger.log(`Authorization: ${req.headers.authorization ? 'Bearer [HIDDEN]' : 'None'}`);
        this.logger.log(`Parsed DTO: ${JSON.stringify(ptDto, null, 2)}`);
        this.logger.log(`DTO Type: ${typeof ptDto}`);
        this.logger.log(`DTO Keys: ${Object.keys(ptDto).join(', ')}`);
        this.logger.log(`=== PARAMETER ANALYSIS ===`);
        this.logger.log(`recipientNumber: "${ptDto.recipientNumber}" (type: ${typeof ptDto.recipientNumber})`);
        this.logger.log(`amount: "${ptDto.amount}" (type: ${typeof ptDto.amount})`);
        this.logger.log(`network: ${ptDto.network} (type: ${typeof ptDto.network})`);
        this.logger.log(`retailer: "${ptDto.retailer}" (type: ${typeof ptDto.retailer})`);
        this.logger.log(`currency: "${ptDto.currency}" (type: ${typeof ptDto.currency})`);
        this.logger.log(`User object: ${JSON.stringify(req.user, null, 2)}`);
        this.logger.log(`User ID from token: ${req.user?.sub}`);
        this.logger.log(`Username from token: ${req.user?.username}`);
        this.logger.log(`User roles: ${JSON.stringify(req.user?.roles)}`);
        this.logger.log(`=== VALIDATION START ===`);
        if (!ptDto.recipientNumber) {
            this.logger.error('recipientNumber is missing from DTO');
            throw new common_1.BadRequestException('Recipient number is required');
        }
        this.logger.log(`✅ recipientNumber validation passed`);
        if (ptDto.amount === undefined || ptDto.amount === null) {
            this.logger.error('amount is missing from DTO');
            throw new common_1.BadRequestException('Amount is required');
        }
        this.logger.log(`✅ amount presence validation passed`);
        if (typeof ptDto.amount === 'string' && ptDto.amount.trim() === '') {
            this.logger.error('amount string is empty');
            throw new common_1.BadRequestException('Amount cannot be empty');
        }
        this.logger.log(`✅ amount string validation passed`);
        if (typeof ptDto.amount === 'number' && (isNaN(ptDto.amount) || ptDto.amount <= 0)) {
            this.logger.error(`Invalid amount number: ${ptDto.amount}`);
            throw new common_1.BadRequestException('Amount must be a positive number');
        }
        this.logger.log(`✅ amount number validation passed`);
        if (ptDto.network === undefined || ptDto.network === null) {
            this.logger.error('network is missing from DTO');
            throw new common_1.BadRequestException('Network is required');
        }
        this.logger.log(`✅ network validation passed`);
        this.logger.log(`=== VALIDATION COMPLETED ===`);
        ptDto.userId = req.user?.sub;
        ptDto.userName = req.user?.username;
        this.logger.log(`DTO after setting user info: ${JSON.stringify(ptDto, null, 2)}`);
        if (!ptDto.userId || typeof ptDto.userId !== 'string') {
            this.logger.error(`Invalid userId: ${ptDto.userId}`);
            throw new common_1.BadRequestException('Invalid userId');
        }
        this.logger.log(`✅ userId validation passed: ${ptDto.userId}`);
        if (!ptDto.userName || typeof ptDto.userName !== 'string') {
            this.logger.error(`Invalid userName: ${ptDto.userName}`);
            throw new common_1.BadRequestException('Invalid userName');
        }
        this.logger.log(`✅ userName validation passed: ${ptDto.userName}`);
        this.logger.log(`=== AIRTIME TOPUP REQUEST END ===`);
        this.logger.log(`Forwarding request to service with validated DTO`);
        return this.airtimeService.topupAirtimeService(ptDto);
    }
};
exports.AirtimeController = AirtimeController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/transtatus'),
    (0, swagger_1.ApiOperation)({ summary: 'Query transaction status' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['transReference'],
            properties: {
                transReference: {
                    type: 'string',
                    description: 'Client transaction reference number',
                    example: '1234567890',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    description: 'Transaction status',
                    example: 'success',
                },
                message: {
                    type: 'string',
                    description: 'Transaction status message',
                    example: 'Transaction successful',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transtatus_dto_1.TransStatusDto]),
    __metadata("design:returntype", Promise)
], AirtimeController.prototype, "queryTransactionstatus", null);
__decorate([
    (0, common_1.UseGuards)(user_or_merchant_guard_1.UserOrMerchantGuard),
    (0, common_1.Post)('/topup'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Process airtime top-up' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['recipientNumber', 'amount', 'network'],
            properties: {
                recipientNumber: {
                    type: 'string',
                    description: 'The recipient phone number',
                    pattern: '^\\+?[1-9]\\d{1,14}$',
                    example: '+1234567890',
                },
                amount: {
                    oneOf: [
                        {
                            type: 'string',
                            description: 'The amount to be transferred (as string)',
                            minimum: 1,
                            example: '50',
                        },
                        {
                            type: 'number',
                            description: 'The amount to be transferred (as number)',
                            minimum: 1,
                            example: 50,
                        }
                    ],
                    description: 'The amount to be transferred (accepts both string and number)',
                },
                network: {
                    type: 'number',
                    description: 'The recipient mobile network provider',
                    enum: [
                        '0 - Unknown (auto detect network)',
                        '1 - AirtelTigo',
                        '2 - EXPRESSO',
                        '3 - GLO',
                        '4 - MTN',
                        '5 - TiGO',
                        '6 - Telecel',
                        '8 - Busy',
                        '9 - Surfline'
                    ],
                    example: 4,
                }
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Airtime top-up processed successfully',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Top-up status message',
                    example: 'Top-up successful',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid userId' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [topup_dto_1.TopupDto, Object]),
    __metadata("design:returntype", Promise)
], AirtimeController.prototype, "processTopup", null);
exports.AirtimeController = AirtimeController = AirtimeController_1 = __decorate([
    (0, swagger_1.ApiTags)('Airtime'),
    (0, common_1.Controller)('api/v1/airtime'),
    __metadata("design:paramtypes", [airtime_service_1.AirtimeService])
], AirtimeController);
//# sourceMappingURL=airtime.controller.js.map