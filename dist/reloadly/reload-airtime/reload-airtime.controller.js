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
var ReloadAirtimeController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReloadAirtimeController = void 0;
const common_1 = require("@nestjs/common");
const reload_airtime_service_1 = require("./reload-airtime.service");
const reload_airtime_dto_1 = require("./dto/reload.airtime.dto");
const swagger_1 = require("@nestjs/swagger");
const user_or_merchant_guard_1 = require("../../auth/user-or-merchant.guard");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const merchant_auth_guard_1 = require("../../auth/merchant-auth.guard");
let ReloadAirtimeController = ReloadAirtimeController_1 = class ReloadAirtimeController {
    constructor(reloadAirtimeService) {
        this.reloadAirtimeService = reloadAirtimeService;
        this.logger = new common_1.Logger(ReloadAirtimeController_1.name);
    }
    async getAccessToken() {
        const gatRes = this.reloadAirtimeService.generateAccessToken();
        console.log(`access token response:::  ${gatRes}`);
        return gatRes;
    }
    testReloadLyAirtime() {
        return `we made it ...`;
    }
    async airtimeRecharge(airDto, req) {
        console.debug(`airtime dto ==> ${airDto}`);
        this.logger.log(`topup airtime user => ${JSON.stringify(req.user)}`);
        airDto.userId = req.user.sub;
        airDto.userName = req.user.name || req.user.username;
        if (!airDto.userId || typeof airDto.userId !== 'string') {
            throw new common_1.BadRequestException('Invalid userId');
        }
        const ar = this.reloadAirtimeService.makeTopUp(airDto);
        return ar;
    }
    async asyncAirtimeRecharge(aarDto, req) {
        this.logger.debug(`async airtime recharge Dto ==> ${aarDto}`);
        this.logger.log(`topup airtime user => ${JSON.stringify(req.user)}`);
        aarDto.userId = req.user.sub;
        aarDto.userName = req.user.name || req.user.username;
        if (!aarDto.userId || typeof aarDto.userId !== 'string') {
            throw new common_1.BadRequestException('Invalid userId');
        }
        const aar = this.reloadAirtimeService.makeAsynchronousTopUp(aarDto);
        return aar;
    }
    async getTopupStatus(transactionId) {
        try {
            this.logger.log(`TRANSACTION ID: ${transactionId}`);
            const status = await this.reloadAirtimeService.getTopupStatus(transactionId);
            return status;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to fetch topup status');
        }
    }
};
exports.ReloadAirtimeController = ReloadAirtimeController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Access token generated successfully' }),
    (0, common_1.Get)('/token'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReloadAirtimeController.prototype, "getAccessToken", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Test endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Test successful' }),
    (0, common_1.Get)('/test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], ReloadAirtimeController.prototype, "testReloadLyAirtime", null);
__decorate([
    (0, common_1.UseGuards)(user_or_merchant_guard_1.UserOrMerchantGuard),
    (0, common_1.Post)('recharge'),
    (0, swagger_1.ApiOperation)({ summary: 'Recharge airtime' }),
    (0, swagger_1.ApiBody)({
        type: reload_airtime_dto_1.ReloadAirtimeDto,
        description: 'Airtime recharge details',
        schema: {
            type: 'object',
            properties: {
                operatorId: {
                    type: 'number',
                    description: 'The ID of the operator',
                    example: 1
                },
                amount: {
                    type: 'number',
                    description: 'The amount to recharge',
                    example: 10
                },
                recipientEmail: {
                    type: 'string',
                    format: 'email',
                    description: 'Email of the recipient',
                    example: 'recipient@example.com'
                },
                recipientNumber: {
                    type: 'string',
                    description: 'Phone number of the recipient',
                    example: '1234567890'
                },
                senderNumber: {
                    type: 'string',
                    description: 'Phone number of the sender',
                    example: '9876543210'
                },
                recipientCountryCode: {
                    type: 'string',
                    description: 'Country code of the recipient',
                    example: 'NG'
                },
                senderCountryCode: {
                    type: 'string',
                    description: 'Country code of the sender',
                    example: 'US'
                }
            },
            required: ['operatorId', 'amount', 'recipientNumber', 'recipientCountryCode']
        },
        examples: {
            validRequest: {
                value: {
                    operatorId: 1,
                    amount: 10,
                    recipientEmail: 'recipient@example.com',
                    recipientNumber: '1234567890',
                    senderNumber: '9876543210',
                    recipientCountryCode: 'NG',
                    senderCountryCode: 'US'
                },
                summary: 'Valid airtime recharge request'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Airtime recharged successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reload_airtime_dto_1.ReloadAirtimeDto, Object]),
    __metadata("design:returntype", Promise)
], ReloadAirtimeController.prototype, "airtimeRecharge", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, merchant_auth_guard_1.MerchantAuthGuard),
    (0, common_1.Post)('/recharge-async'),
    (0, swagger_1.ApiOperation)({ summary: 'Recharge airtime asynchronously' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asynchronous airtime recharge initiated' }),
    (0, swagger_1.ApiBody)({
        type: reload_airtime_dto_1.ReloadAirtimeDto,
        description: 'Airtime recharge details',
        schema: {
            type: 'object',
            properties: {
                operatorId: {
                    type: 'number',
                    description: 'The ID of the operator',
                    example: 1
                },
                amount: {
                    type: 'number',
                    description: 'The amount to recharge',
                    example: 10
                },
                recipientEmail: {
                    type: 'string',
                    format: 'email',
                    description: 'Email of the recipient',
                    example: 'recipient@example.com'
                },
                recipientNumber: {
                    type: 'string',
                    description: 'Phone number of the recipient',
                    example: '1234567890'
                },
                senderNumber: {
                    type: 'string',
                    description: 'Phone number of the sender',
                    example: '9876543210'
                },
                recipientCountryCode: {
                    type: 'string',
                    description: 'Country code of the recipient',
                    example: 'NG'
                },
                senderCountryCode: {
                    type: 'string',
                    description: 'Country code of the sender',
                    example: 'US'
                }
            },
            required: ['operatorId', 'amount', 'recipientNumber', 'recipientCountryCode']
        },
        examples: {
            validRequest: {
                value: {
                    operatorId: 1,
                    amount: 10,
                    recipientEmail: 'recipient@example.com',
                    recipientNumber: '1234567890',
                    senderNumber: '9876543210',
                    recipientCountryCode: 'NG',
                    senderCountryCode: 'US'
                },
                summary: 'Valid airtime recharge request'
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reload_airtime_dto_1.ReloadAirtimeDto, Object]),
    __metadata("design:returntype", Promise)
], ReloadAirtimeController.prototype, "asyncAirtimeRecharge", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, merchant_auth_guard_1.MerchantAuthGuard),
    (0, common_1.Get)('topup-status/:transactionId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Topup Transaction Status',
        description: 'Retrieve the status of a topup transaction using its ID'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction status retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                transactionId: {
                    type: 'number',
                    example: 4602843
                },
                status: {
                    type: 'string',
                    example: 'SUCCESSFUL',
                    enum: ['SUCCESSFUL', 'PENDING', 'FAILED']
                },
                operatorTransactionId: {
                    type: 'string',
                    example: '7297929551:OrderConfirmed'
                },
                customIdentifier: {
                    type: 'string',
                    example: 'TRX-123456789'
                },
                recipientPhone: {
                    type: 'string',
                    example: '447951631337'
                },
                operatorId: {
                    type: 'number',
                    example: 535
                },
                operatorName: {
                    type: 'string',
                    example: 'EE PIN England'
                },
                deliveredAmount: {
                    type: 'number',
                    example: 4.9985
                },
                deliveredAmountCurrencyCode: {
                    type: 'string',
                    example: 'GBP'
                },
                transactionDate: {
                    type: 'string',
                    example: '2024-03-20 08:13:39'
                },
                balanceInfo: {
                    type: 'object',
                    properties: {
                        oldBalance: {
                            type: 'number',
                            example: 5109.53732
                        },
                        newBalance: {
                            type: 'number',
                            example: 2004.50532
                        },
                        currencyCode: {
                            type: 'string',
                            example: 'NGN'
                        }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Transaction not found',
        schema: {
            type: 'object',
            properties: {
                statusCode: {
                    type: 'number',
                    example: 404
                },
                message: {
                    type: 'string',
                    example: 'Transaction not found'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Invalid or expired token'
    }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReloadAirtimeController.prototype, "getTopupStatus", null);
exports.ReloadAirtimeController = ReloadAirtimeController = ReloadAirtimeController_1 = __decorate([
    (0, swagger_1.ApiTags)('Reloadly Airtime'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/reload-airtime'),
    __metadata("design:paramtypes", [reload_airtime_service_1.ReloadAirtimeService])
], ReloadAirtimeController);
//# sourceMappingURL=reload-airtime.controller.js.map