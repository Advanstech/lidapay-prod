"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvansispayModule = void 0;
const common_1 = require("@nestjs/common");
const mobile_money_service_1 = require("./mobile-money/mobile-money.service");
const card_payment_service_1 = require("./card-payment/card-payment.service");
const axios_1 = require("@nestjs/axios");
const transaction_module_1 = require("../transaction/transaction.module");
const advansispay_controller_1 = require("./advansispay.controller");
const express_pay_service_1 = require("./express-pay.service");
const user_service_1 = require("../user/user.service");
const user_module_1 = require("../user/user.module");
const email_service_1 = require("../utilities/email.service");
const nodemail_service_1 = require("../utilities/nodemail.service");
const sms_util_1 = require("../utilities/sms.util");
const gravatar_util_1 = require("../utilities/gravatar.util");
const merchant_service_1 = require("../merchant/merchant.service");
const notification_service_1 = require("../notification/notification.service");
const merchant_module_1 = require("../merchant/merchant.module");
const auth_service_1 = require("../auth/auth.service");
const jwt_1 = require("@nestjs/jwt");
const notification_module_1 = require("../notification/notification.module");
let AdvansispayModule = class AdvansispayModule {
};
exports.AdvansispayModule = AdvansispayModule;
exports.AdvansispayModule = AdvansispayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            transaction_module_1.TransactionModule,
            user_module_1.UserModule,
            merchant_module_1.MerchantModule,
            notification_module_1.NotificationModule
        ],
        providers: [
            mobile_money_service_1.MobileMoneyService,
            card_payment_service_1.CardPaymentService,
            express_pay_service_1.ExpressPayService,
            user_service_1.UserService,
            email_service_1.EmailService,
            nodemail_service_1.NodemailService,
            sms_util_1.SmsService,
            gravatar_util_1.GravatarService,
            merchant_service_1.MerchantService,
            notification_service_1.NotificationService,
            auth_service_1.AuthService,
            jwt_1.JwtService
        ],
        controllers: [advansispay_controller_1.AdvansispayController]
    })
], AdvansispayModule);
//# sourceMappingURL=advansispay.module.js.map