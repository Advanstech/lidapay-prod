"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantModule = void 0;
const common_1 = require("@nestjs/common");
const merchant_service_1 = require("./merchant.service");
const merchant_controller_1 = require("./merchant.controller");
const mongoose_1 = require("@nestjs/mongoose");
const merchant_schema_1 = require("./schemas/merchant.schema");
const user_module_1 = require("../user/user.module");
const auth_module_1 = require("../auth/auth.module");
const reward_service_1 = require("../reward/reward.service");
const reward_module_1 = require("../reward/reward.module");
const merchant_auth_guard_1 = require("../auth/merchant-auth.guard");
const jwt_strategy_1 = require("../auth/jwt.strategy");
const email_service_1 = require("../utilities/email.service");
const notification_service_1 = require("../notification/notification.service");
const notification_module_1 = require("../notification/notification.module");
const sms_util_1 = require("../utilities/sms.util");
const nodemail_service_1 = require("../utilities/nodemail.service");
let MerchantModule = class MerchantModule {
};
exports.MerchantModule = MerchantModule;
exports.MerchantModule = MerchantModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: merchant_schema_1.Merchant.name, schema: merchant_schema_1.MerchantSchema }]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            reward_module_1.RewardModule,
            notification_module_1.NotificationModule
        ],
        providers: [
            merchant_service_1.MerchantService,
            reward_service_1.RewardService,
            merchant_auth_guard_1.MerchantAuthGuard,
            jwt_strategy_1.JwtStrategy,
            email_service_1.EmailService,
            notification_service_1.NotificationService,
            sms_util_1.SmsService,
            nodemail_service_1.NodemailService
        ],
        controllers: [merchant_controller_1.MerchantController],
        exports: [merchant_service_1.MerchantService, mongoose_1.MongooseModule],
    })
], MerchantModule);
//# sourceMappingURL=merchant.module.js.map