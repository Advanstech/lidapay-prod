"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirtimeModule = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const airtime_controller_1 = require("./airtime.controller");
const airtime_service_1 = require("./airtime.service");
const transaction_service_1 = require("../../transaction/transaction.service");
const transaction_module_1 = require("../../transaction/transaction.module");
const merchant_service_1 = require("../../merchant/merchant.service");
const merchant_module_1 = require("../../merchant/merchant.module");
const auth_module_1 = require("../../auth/auth.module");
const user_module_1 = require("../../user/user.module");
const email_service_1 = require("../../utilities/email.service");
const notification_service_1 = require("../../notification/notification.service");
const sms_util_1 = require("../../utilities/sms.util");
const notification_module_1 = require("../../notification/notification.module");
const user_or_merchant_guard_1 = require("../../auth/user-or-merchant.guard");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
let AirtimeModule = class AirtimeModule {
};
exports.AirtimeModule = AirtimeModule;
exports.AirtimeModule = AirtimeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            transaction_module_1.TransactionModule,
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => merchant_module_1.MerchantModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            notification_module_1.NotificationModule
        ],
        controllers: [airtime_controller_1.AirtimeController],
        providers: [
            airtime_service_1.AirtimeService,
            transaction_service_1.TransactionService,
            merchant_service_1.MerchantService,
            email_service_1.EmailService,
            notification_service_1.NotificationService,
            sms_util_1.SmsService,
            user_or_merchant_guard_1.UserOrMerchantGuard,
            jwt_auth_guard_1.JwtAuthGuard
        ],
        exports: [airtime_service_1.AirtimeService]
    })
], AirtimeModule);
//# sourceMappingURL=airtime.module.js.map