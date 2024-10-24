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
let AdvansispayModule = class AdvansispayModule {
};
exports.AdvansispayModule = AdvansispayModule;
exports.AdvansispayModule = AdvansispayModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            transaction_module_1.TransactionModule,
        ],
        providers: [mobile_money_service_1.MobileMoneyService, card_payment_service_1.CardPaymentService, express_pay_service_1.ExpressPayService],
        controllers: [advansispay_controller_1.AdvansispayController]
    })
], AdvansispayModule);
//# sourceMappingURL=advansispay.module.js.map