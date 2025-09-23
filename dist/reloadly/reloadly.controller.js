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
const rxjs_1 = require("rxjs");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let ReloadlyController = ReloadlyController_1 = class ReloadlyController {
    constructor(reloadlyService) {
        this.reloadlyService = reloadlyService;
        this.logger = new common_1.Logger(ReloadlyController_1.name);
    }
    async getAccountBalance() {
        try {
            const gab = await (0, rxjs_1.firstValueFrom)(this.reloadlyService.getAccountBalance());
            this.logger.debug(`Account balance response ==>${JSON.stringify(gab)}`);
            return gab;
        }
        catch (error) {
            this.logger.error(`Error getting account balance: ${error}`);
            throw new Error('Internal server error');
        }
    }
    async accessToken() {
        try {
            const gatRes = await (0, rxjs_1.firstValueFrom)(this.reloadlyService.accessToken());
            this.logger.debug(`Access token response ==>${JSON.stringify(gatRes)}`);
            return gatRes;
        }
        catch (error) {
            this.logger.error(`Error getting access token: ${error}`);
            throw new Error('Internal server error');
        }
    }
    async countryList() {
        try {
            const lcl = await (0, rxjs_1.firstValueFrom)(this.reloadlyService.countryList());
            this.logger.debug(`Country list response ==>${JSON.stringify(lcl)}`);
            return lcl;
        }
        catch (error) {
            this.logger.error(`Error getting country list: ${error}`);
            throw new Error('Internal server error');
        }
    }
    async findCountryByCode(fcbDto) {
        try {
            const fcb = await (0, rxjs_1.firstValueFrom)(this.reloadlyService.findCountryByCode(fcbDto));
            this.logger.debug(`Find country by code response ==>${JSON.stringify(fcb)}`);
            return fcb;
        }
        catch (error) {
            this.logger.error(`Error finding country by code: ${error}`);
            throw new Error('Internal server error');
        }
    }
    async networkOperators(gngDto) {
        try {
            const operators = await (0, rxjs_1.firstValueFrom)(this.reloadlyService.networkOperators(gngDto));
            this.logger.debug(`Network operators response ==>${JSON.stringify(operators)}`);
            return operators;
        }
        catch (error) {
            this.logger.error(`Error getting network operators: ${error}`);
            throw new Error('Internal server error');
        }
    }
    async findOperatorById(adoDto) {
        try {
            const ado = await (0, rxjs_1.firstValueFrom)(this.reloadlyService.findOperatorById(adoDto));
            this.logger.debug(`Find operator by ID response ==>${JSON.stringify(ado)}`);
            return ado;
        }
        catch (error) {
            this.logger.error(`Error finding operator by ID: ${error}`);
            throw new Error('Internal server error');
        }
    }
    async autoDetectOperator(adoDto) {
        console.log("autoDetectOperator input =>", adoDto);
        if (!adoDto || !adoDto.phone || !adoDto.countryIsoCode) {
            throw new common_1.BadRequestException('Phone number and country ISO code are required');
        }
        try {
            const ado = await (0, rxjs_1.firstValueFrom)(this.reloadlyService.autoDetectOperator(adoDto));
            this.logger.debug(`Network autodetect input ==>${JSON.stringify(adoDto)}`);
            return ado;
        }
        catch (error) {
            this.logger.error(`Error auto detecting operator: ${error?.message || error}`);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            const message = error?.response?.data || error?.message || 'Auto-detect failed';
            throw new common_1.InternalServerErrorException(message);
        }
    }
    async getOperatorByCode(gnobcDto) {
        try {
            const gnobc = await (0, rxjs_1.firstValueFrom)(this.reloadlyService.getOperatorByCode(gnobcDto));
            this.logger.debug(`Get operator by code response ==>${JSON.stringify(gnobc)}`);
            return gnobc;
        }
        catch (error) {
            this.logger.error(`Error getting operator by code: ${error}`);
            throw new Error('Internal server error');
        }
    }
    async getFxRate(operatorId, amount, currencyCode) {
        try {
            if (!Number.isFinite(amount) || amount <= 0) {
                throw new common_1.BadRequestException('Query param "amount" must be a positive number');
            }
            const res = await this.reloadlyService.fxRates({ operatorId, amount, currencyCode });
            this.logger.debug(`FX rate response ==> ${JSON.stringify(res)}`);
            return res;
        }
        catch (error) {
            this.logger.error(`Error fetching FX rate: ${error?.message || error}`);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('Failed to fetch FX rate');
        }
    }
};
exports.ReloadlyController = ReloadlyController;
__decorate([
    (0, common_1.Get)('account-balance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get Reloadly account balance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account balance retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "getAccountBalance", null);
__decorate([
    (0, common_1.Get)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Generate Reloadly access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Access token generated successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "accessToken", null);
__decorate([
    (0, common_1.Get)('country-list'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List supported countries' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Supported countries listed successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "countryList", null);
__decorate([
    (0, common_1.Post)('find-country-by-code'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Find country by ISO code' }),
    (0, swagger_1.ApiBody)({
        description: 'Country lookup payload',
        schema: {
            type: 'object',
            properties: {
                countryCode: { type: 'string', description: '2-letter ISO country code', example: 'NG' },
                isoCode: { type: 'string', description: 'Optional numeric/alpha-3 code if used', example: '566' }
            },
            required: ['countryCode']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Country details fetched successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Country not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reloadly_dto_1.ReloadlyDto]),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "findCountryByCode", null);
__decorate([
    (0, common_1.Post)('network-operators'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'List network operators with pagination and filters' }),
    (0, swagger_1.ApiBody)({
        description: 'Pagination and filter options',
        schema: {
            type: 'object',
            properties: {
                size: { type: 'number', description: 'Page size', example: 10 },
                page: { type: 'number', description: 'Page index (0-based)', example: 0 },
                includeBundles: { type: 'boolean', example: true },
                includeData: { type: 'boolean', example: true },
                suggestedAmountsMap: { type: 'boolean', example: false },
                includeCombo: { type: 'boolean', example: false },
                comboOnly: { type: 'boolean', example: false },
                bundlesOnly: { type: 'boolean', example: false },
                dataOnly: { type: 'boolean', example: false },
                pinOnly: { type: 'boolean', example: false }
            }
        },
        examples: {
            default: {
                value: { size: 10, page: 0, includeBundles: true, includeData: true },
                summary: 'Basic operator list request'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Operators listed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "networkOperators", null);
__decorate([
    (0, common_1.Post)('find-operator-by-id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Find operator by ID' }),
    (0, swagger_1.ApiBody)({
        description: 'Operator lookup payload',
        schema: {
            type: 'object',
            properties: {
                operatorId: { type: 'number', description: 'Operator ID', example: 340 }
            },
            required: ['operatorId']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Operator details retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Operator not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [network_operators_dto_1.NetworkOperatorsDto]),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "findOperatorById", null);
__decorate([
    (0, common_1.Post)('operator/autodetect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Auto-detect operator by phone and country' }),
    (0, swagger_1.ApiBody)({
        description: 'Auto-detect payload',
        schema: {
            type: 'object',
            properties: {
                phone: { type: 'string', description: 'MSISDN of the subscriber', example: '233501234567' },
                countryIsoCode: { type: 'string', description: '2-letter ISO country code', example: 'GH' },
                suggestedAmountsMap: { type: 'boolean', example: true },
                suggestedAmount: { type: 'boolean', example: false }
            },
            required: ['phone', 'countryIsoCode']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detected operator returned' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Missing required fields' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [network_operators_dto_1.NetworkOperatorsDto]),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "autoDetectOperator", null);
__decorate([
    (0, common_1.Post)('get-operator-by-code'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get operators by country ISO code with filters' }),
    (0, swagger_1.ApiBody)({
        description: 'Country and filter options',
        schema: {
            type: 'object',
            properties: {
                countryIsoCode: { type: 'string', description: '2-letter ISO country code', example: 'NG' },
                includePin: { type: 'boolean', example: false },
                includeData: { type: 'boolean', example: false },
                includeBundles: { type: 'boolean', example: false },
                includeCombo: { type: 'boolean', example: false },
                comboOnly: { type: 'boolean', example: false },
                dataOnly: { type: 'boolean', example: false },
                bundlesOnly: { type: 'boolean', example: false },
                pinOnly: { type: 'boolean', example: false },
                suggestedAmountsMap: { type: 'boolean', example: false },
                suggestedAmount: { type: 'boolean', example: false }
            },
            required: ['countryIsoCode']
        },
        examples: {
            default: {
                value: { countryIsoCode: 'NG', includeData: true },
                summary: 'Fetch Nigerian operators including data'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Operators by country returned' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [network_operators_dto_1.NetworkOperatorsDto]),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "getOperatorByCode", null);
__decorate([
    (0, common_1.Get)('operators/:operatorId/fx-rate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Fetch FX rate for operator and amount' }),
    (0, swagger_1.ApiParam)({ name: 'operatorId', type: Number, description: 'Operator ID', example: 340 }),
    (0, swagger_1.ApiQuery)({ name: 'amount', required: true, type: Number, description: 'Amount to convert', example: 10 }),
    (0, swagger_1.ApiQuery)({ name: 'currencyCode', required: false, type: String, description: 'Currency code (optional)', example: 'USD' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'FX rate returned successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid query parameters' }),
    __param(0, (0, common_1.Param)('operatorId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('amount', new common_1.ParseFloatPipe())),
    __param(2, (0, common_1.Query)('currencyCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], ReloadlyController.prototype, "getFxRate", null);
exports.ReloadlyController = ReloadlyController = ReloadlyController_1 = __decorate([
    (0, swagger_1.ApiTags)('Reloadly Services'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/reloadly'),
    __metadata("design:paramtypes", [reloadly_service_1.ReloadlyService])
], ReloadlyController);
//# sourceMappingURL=reloadly.controller.js.map