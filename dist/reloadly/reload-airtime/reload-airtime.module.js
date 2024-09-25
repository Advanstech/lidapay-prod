"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReloadAirtimeModule = void 0;
const common_1 = require("@nestjs/common");
const reload_airtime_service_1 = require("./reload-airtime.service");
const reload_airtime_controller_1 = require("./reload-airtime.controller");
const axios_1 = require("@nestjs/axios");
const transaction_service_1 = require("../../transaction/transaction.service");
const transaction_module_1 = require("../../transaction/transaction.module");
const auth_module_1 = require("../../auth/auth.module");
const merchant_module_1 = require("../../merchant/merchant.module");
const user_module_1 = require("../../user/user.module");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const merchant_auth_guard_1 = require("../../auth/merchant-auth.guard");
const user_or_merchant_guard_1 = require("../../auth/user-or-merchant.guard");
let ReloadAirtimeModule = class ReloadAirtimeModule {
};
exports.ReloadAirtimeModule = ReloadAirtimeModule;
exports.ReloadAirtimeModule = ReloadAirtimeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            transaction_module_1.TransactionModule,
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => merchant_module_1.MerchantModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
        ],
        controllers: [reload_airtime_controller_1.ReloadAirtimeController],
        providers: [
            reload_airtime_service_1.ReloadAirtimeService,
            transaction_service_1.TransactionService,
            user_or_merchant_guard_1.UserOrMerchantGuard,
            jwt_auth_guard_1.JwtAuthGuard,
            merchant_auth_guard_1.MerchantAuthGuard
        ]
    })
], ReloadAirtimeModule);
//# sourceMappingURL=reload-airtime.module.js.map