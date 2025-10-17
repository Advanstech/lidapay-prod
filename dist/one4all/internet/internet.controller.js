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
exports.InternetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const internet_dto_1 = require("./dto/internet.dto");
const bundle_list_dto_1 = require("./dto/bundle-list.dto");
const internet_service_1 = require("./internet.service");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
let InternetController = class InternetController {
    constructor(internetService) {
        this.internetService = internetService;
        this.logger = new common_1.Logger('InternetController');
    }
    async buyInternetData(bidDto, req) {
        bidDto.userId = req.user.sub;
        bidDto.userName = req.user.username;
        if (!bidDto.userId || typeof bidDto.userId !== 'string') {
            throw new common_1.BadRequestException('Invalid userId');
        }
        this.logger.log(`INTERNET DATA dto => ${JSON.stringify(bidDto)}`);
        const ts = await this.internetService.topupInternetData(bidDto);
        return ts;
    }
    async listDataBundle(ldbDto) {
        this.logger.log(`Raw request body received: ${JSON.stringify(ldbDto)}`);
        this.logger.log(`Network value: ${ldbDto.network}, Type: ${typeof ldbDto.network}`);
        if (ldbDto.network && typeof ldbDto.network === 'string') {
            ldbDto.network = parseInt(ldbDto.network, 10);
            this.logger.debug(`Converted network string to number: ${ldbDto.network}`);
        }
        this.logger.log(`BUNDLE LIST dto => ${JSON.stringify(ldbDto)}`);
        const ta = this.internetService.dataBundleList(ldbDto);
        return ta;
    }
};
exports.InternetController = InternetController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('/buydata'),
    (0, swagger_1.ApiOperation)({ summary: 'Buy internet data' }),
    (0, swagger_1.ApiBody)({
        type: internet_dto_1.InternetDto,
        description: 'Internet data purchase details',
        schema: {
            type: 'object',
            required: ['userId', 'recipientNumber', 'dataCode', 'network'],
            properties: {
                recipientNumber: {
                    type: 'string',
                    description: 'Recipient number',
                    example: '1234567890',
                },
                dataCode: {
                    type: 'string',
                    description: 'Data code',
                    example: 'DATA_10GB',
                },
                network: {
                    type: 'number',
                    description: 'Network code (0-9) 1: AirtelTigo, 4: MTN, 5: Telecel, 6: Telecel, 7: Glo, 8: Expresso, 9:Busy',
                    example: 1
                }
            },
        },
        examples: {
            example1: {
                value: {
                    recipientNumber: '1234567890',
                    dataCode: 'DATA_10GB',
                    network: 1
                },
                summary: 'Basic data purchase'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successful response',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        transactionId: { type: 'string' }
                    }
                },
                examples: {
                    success: {
                        value: {
                            success: true,
                            message: 'Data purchase successful',
                            transactionId: 'TRX123456'
                        },
                        summary: 'Successful purchase'
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal Server Error',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                },
                examples: {
                    error: {
                        value: {
                            success: false,
                            message: 'An error occurred while processing the request'
                        },
                        summary: 'Error response'
                    }
                }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [internet_dto_1.InternetDto, Object]),
    __metadata("design:returntype", Promise)
], InternetController.prototype, "buyInternetData", null);
__decorate([
    (0, common_1.Post)('/bundlelist'),
    (0, swagger_1.ApiOperation)({ summary: 'List data bundles' }),
    (0, swagger_1.ApiBody)({
        type: bundle_list_dto_1.BundleListDto,
        description: 'Data bundle list request details',
        examples: {
            example1: {
                value: {
                    network: 4
                },
                summary: 'MTN network bundle list request'
            },
            example2: {
                value: {
                    network: 1
                },
                summary: 'AirtelTigo network bundle list request'
            },
            example3: {
                value: {},
                summary: 'All networks bundle list request'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successful response',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        bundles: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    price: { type: 'number' },
                                    dataAmount: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                examples: {
                    success: {
                        value: {
                            success: true,
                            bundles: [
                                { id: 'DATA_5GB', name: '5GB Bundle', price: 5, dataAmount: '5GB' },
                                { id: 'DATA_10GB', name: '10GB Bundle', price: 10, dataAmount: '10GB' }
                            ]
                        },
                        summary: 'Successful bundle list'
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal Server Error',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                },
                examples: {
                    error: {
                        value: {
                            success: false,
                            message: 'An error occurred while fetching the bundle list'
                        },
                        summary: 'Error response'
                    }
                }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bundle_list_dto_1.BundleListDto]),
    __metadata("design:returntype", Promise)
], InternetController.prototype, "listDataBundle", null);
exports.InternetController = InternetController = __decorate([
    (0, swagger_1.ApiTags)('Internet'),
    (0, common_1.Controller)('api/v1/internet'),
    __metadata("design:paramtypes", [internet_service_1.InternetService])
], InternetController);
//# sourceMappingURL=internet.controller.js.map