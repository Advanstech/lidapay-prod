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
var ReloadlyController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReloadlyController = void 0;
const common_1 = require("@nestjs/common");
const reloadly_service_1 = require("./reloadly.service");
const reloadly_dto_1 = require("./dto/reloadly.dto");
const network_operators_dto_1 = require("./dto/network.operators.dto");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ReloadlyController = ReloadlyController_1 = class ReloadlyController {
    constructor(reloadlyService) {
        this.reloadlyService = reloadlyService;
        this.logger = new common_1.Logger(ReloadlyController_1.name);
    }
    async getAccountBalance() {
        try {
            const gab = this.reloadlyService.getAccountBalance();
            return gab;
        }
        catch (error) {
            this.logger.error(`Error getting account balance: ${error}`);
        }
    }
    async getAccessToken() {
        try {
            const gatRes = await this.reloadlyService.accessToken();
            this.logger.debug(`reloadly access token ===>  ${gatRes}`);
            return gatRes;
        }
        catch (error) {
            this.logger.error(`Error getting access token: ${error}`);
        }
    }
    async listCountryList() {
        try {
            const lcl = this.reloadlyService.countryList();
            this.logger.log(`${JSON.stringify(lcl)}`);
            return lcl;
        }
        catch (error) {
            this.logger.error(`Error listing countries: ${error}`);
        }
    }
    async findCountryByCode(fcbDto) {
        if (!fcbDto) {
            throw new Error('Invalid input data');
        }
        try {
            const fcb = await this.reloadlyService.findCountryByCode(fcbDto);
            return fcb;
        }
        catch (error) {
            this.logger.error(`Error finding country by code: ${error}`);
        }
    }
    async getNetworkGenerator(gngDto) {
        if (!gngDto) {
            throw new Error('Invalid input data');
        }
        try {
            const gng = await this.reloadlyService.networkOperators(gngDto);
            return gng;
        }
        catch (error) {
            this.logger.error(`Error getting network generator: ${error}`);
        }
    }
    async findOperatorById(adoDto) {
        if (!adoDto) {
            throw new Error('Invalid input data');
        }
        try {
            const ado = this.reloadlyService.findOperatorById(adoDto);
            return ado;
        }
        catch (error) {
            this.logger.error(`Error finding operator by id: ${error}`);
        }
    }
    async autoDetectOperator(adoDto) {
        if (!adoDto) {
            throw new Error('Invalid input data');
        }
        try {
            const accessToken = await this.getAccessToken();
            this.logger.debug(`access token <:::> ${JSON.stringify(accessToken)}`);
            const ado = await this.reloadlyService.autoDetectOperator(adoDto);
            this.logger.debug(`network autodetect input ==>${JSON.stringify(adoDto)}`);
            return ado;
        }
        catch (error) {
            this.logger.error(`Error auto detecting operator: ${error}`);
        }
    }
    async getNetworkOperatorByCode(gnobcDto) {
        if (!gnobcDto) {
            throw new Error('Invalid input data');
        }
        try {
            const gnobc = await this.reloadlyService.getOperatorByCode(gnobcDto);
            return gnobc;
        }
        catch (error) {
            this.logger.error(`Error getting network operator by code: ${error}`);
        }
    }
};
exports.ReloadlyController = ReloadlyController;
__decorate([
    (0, common_1.Get)('/account-balance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the account balance' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "getAccountBalance", null);
__decorate([
    (0, common_1.Get)('/auth/access-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Get access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the access token' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "getAccessToken", null);
__decorate([
    (0, common_1.Get)('/countries'),
    (0, swagger_1.ApiOperation)({ summary: 'List all countries' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the list of countries' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "listCountryList", null);
__decorate([
    (0, common_1.Post)('country/code'),
    (0, swagger_1.ApiOperation)({ summary: 'Find country by code' }),
    (0, swagger_1.ApiBody)({
        type: reloadly_dto_1.ReloadlyDto,
        schema: {
            type: 'object',
            properties: {
                countryCode: {
                    type: 'string',
                    description: 'The ISO country code',
                    example: 'US'
                }
            },
            required: ['countryCode']
        },
        examples: {
            validRequest: {
                value: {
                    countryCode: 'US'
                },
                summary: 'Valid country code request'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the country details' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reloadly_dto_1.ReloadlyDto]),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "findCountryByCode", null);
__decorate([
    (0, common_1.Post)('operators'),
    (0, swagger_1.ApiOperation)({ summary: 'Get network operators' }),
    (0, swagger_1.ApiBody)({
        type: network_operators_dto_1.NetworkOperatorsDto,
        schema: {
            type: 'object',
            properties: {
                countryCode: {
                    type: 'string',
                    description: 'The ISO country code',
                    example: 'NG'
                }
            },
            required: ['countryCode']
        },
        examples: {
            validRequest: {
                value: {
                    countryCode: 'NG'
                },
                summary: 'Valid network operators request'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the list of network operators' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [network_operators_dto_1.NetworkOperatorsDto]),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "getNetworkGenerator", null);
__decorate([
    (0, common_1.Post)('/operator/id'),
    (0, swagger_1.ApiOperation)({ summary: 'Find operator by ID' }),
    (0, swagger_1.ApiBody)({
        type: network_operators_dto_1.NetworkOperatorsDto,
        schema: {
            type: 'object',
            properties: {
                operatorId: {
                    type: 'number',
                    description: 'The ID of the operator',
                    example: 1
                }
            },
            required: ['operatorId']
        },
        examples: {
            validRequest: {
                value: {
                    operatorId: 1
                },
                summary: 'Valid operator ID request'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the operator details' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [network_operators_dto_1.NetworkOperatorsDto]),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "findOperatorById", null);
__decorate([
    (0, common_1.Post)('/operator/autodetect'),
    (0, swagger_1.ApiOperation)({ summary: 'Auto-detect operator' }),
    (0, swagger_1.ApiBody)({
        type: network_operators_dto_1.NetworkOperatorsDto,
        schema: {
            type: 'object',
            properties: {
                countryCode: {
                    type: 'string',
                    description: 'The ISO country code',
                    example: 'NG'
                },
                phoneNumber: {
                    type: 'string',
                    description: 'The phone number to detect the operator for',
                    example: '2348012345678'
                }
            },
            required: ['countryCode', 'phoneNumber']
        },
        examples: {
            validRequest: {
                value: {
                    countryCode: 'NG',
                    phoneNumber: '2348012345678'
                },
                summary: 'Valid auto-detect operator request'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the auto-detected operator' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [network_operators_dto_1.NetworkOperatorsDto]),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "autoDetectOperator", null);
__decorate([
    (0, common_1.Post)('/operator/country-code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get network operator by country code' }),
    (0, swagger_1.ApiBody)({
        type: network_operators_dto_1.NetworkOperatorsDto,
        schema: {
            type: 'object',
            properties: {
                countryCode: {
                    type: 'string',
                    description: 'The ISO country code',
                    example: 'NG'
                }
            },
            required: ['countryCode']
        },
        examples: {
            validRequest: {
                value: {
                    countryCode: 'NG'
                },
                summary: 'Valid network operator by country code request'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the network operator details' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [network_operators_dto_1.NetworkOperatorsDto]),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "getNetworkOperatorByCode", null);
exports.ReloadlyController = ReloadlyController = ReloadlyController_1 = __decorate([
<<<<<<< HEAD
    (0, swagger_1.ApiTags)('Reloadly Services'),
=======
    (0, swagger_1.ApiTags)('Reloadly'),
>>>>>>> 9a6de866e98eee94bf1b44a3191d0a5a866d12cb
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/reloadly'),
    __metadata("design:paramtypes", [reloadly_service_1.ReloadlyService])
], ReloadlyController);
//# sourceMappingURL=reloadly.controller.js.map