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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOrMerchantGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const merchant_auth_guard_1 = require("./merchant-auth.guard");
let UserOrMerchantGuard = class UserOrMerchantGuard {
    constructor(jwtAuthGuard, merchantAuthGuard) {
        this.jwtAuthGuard = jwtAuthGuard;
        this.merchantAuthGuard = merchantAuthGuard;
    }
    async canActivate(context) {
        try {
            const canActivateUser = this.jwtAuthGuard.canActivate(context);
            if (canActivateUser) {
                return true;
            }
        }
        catch (userError) {
            try {
                const canActivateMerchant = await this.merchantAuthGuard.canActivate(context);
                if (canActivateMerchant) {
                    return true;
                }
            }
            catch (merchantError) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
        }
        return false;
    }
};
exports.UserOrMerchantGuard = UserOrMerchantGuard;
exports.UserOrMerchantGuard = UserOrMerchantGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_auth_guard_1.JwtAuthGuard,
        merchant_auth_guard_1.MerchantAuthGuard])
], UserOrMerchantGuard);
//# sourceMappingURL=user-or-merchant.guard.js.map