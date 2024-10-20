"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_service_1 = require("./user.service");
const user_controller_1 = require("./user.controller");
const user_schema_1 = require("./schemas/user.schema");
const email_service_1 = require("../utilities/email.service");
const sms_util_1 = require("../utilities/sms.util");
const auth_module_1 = require("../auth/auth.module");
const gravatar_util_1 = require("../utilities/gravatar.util");
const merchant_service_1 = require("../merchant/merchant.service");
const merchant_module_1 = require("../merchant/merchant.module");
const nodemail_service_1 = require("../utilities/nodemail.service");
const config_1 = require("@nestjs/config");
const reward_module_1 = require("../reward/reward.module");
const notification_module_1 = require("../notification/notification.module");
const wallet_schema_1 = require("./schemas/wallet.schema");
const lidapay_account_schema_1 = require("./schemas/lidapay-account.schema");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            mongoose_1.MongooseModule.forFeature([{ name: user_schema_1.User.name, schema: user_schema_1.UserSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: wallet_schema_1.Wallet.name, schema: wallet_schema_1.WalletSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: lidapay_account_schema_1.LidapayAccount.name, schema: lidapay_account_schema_1.LidapayAccountSchema }]),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            (0, common_1.forwardRef)(() => merchant_module_1.MerchantModule),
            reward_module_1.RewardModule,
            notification_module_1.NotificationModule
        ],
        controllers: [user_controller_1.UserController],
        providers: [
            user_service_1.UserService,
            email_service_1.EmailService,
            sms_util_1.SmsService,
            gravatar_util_1.GravatarService,
            merchant_service_1.MerchantService,
            nodemail_service_1.NodemailService
        ],
        exports: [user_service_1.UserService, mongoose_1.MongooseModule],
    })
], UserModule);
//# sourceMappingURL=user.module.js.map