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
var MerchantAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const constants_1 = require("../constants");
let MerchantAuthGuard = MerchantAuthGuard_1 = class MerchantAuthGuard {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(MerchantAuthGuard_1.name);
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        this.logger.debug(`Extracted token: ${token}`);
        if (!token) {
            this.logger.error('No token found in request');
            throw new common_1.UnauthorizedException('No token provided');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || constants_1.JWT_SECRET
            });
            request['user'] = payload;
            this.logger.debug(`Full payload: ${JSON.stringify(payload)}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to verify token: ${error.message}`);
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.MerchantAuthGuard = MerchantAuthGuard;
exports.MerchantAuthGuard = MerchantAuthGuard = MerchantAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], MerchantAuthGuard);
//# sourceMappingURL=merchant-auth.guard.js.map