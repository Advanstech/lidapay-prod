"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternetModule = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const internet_controller_1 = require("./internet.controller");
const internet_service_1 = require("./internet.service");
const transaction_service_1 = require("../../transaction/transaction.service");
const transaction_module_1 = require("../../transaction/transaction.module");
const auth_module_1 = require("../../auth/auth.module");
const user_module_1 = require("../../user/user.module");
const merchant_module_1 = require("../../merchant/merchant.module");
let InternetModule = class InternetModule {
};
exports.InternetModule = InternetModule;
exports.InternetModule = InternetModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            transaction_module_1.TransactionModule,
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => merchant_module_1.MerchantModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
        ],
        controllers: [internet_controller_1.InternetController],
        providers: [internet_service_1.InternetService, transaction_service_1.TransactionService,]
    })
], InternetModule);
//# sourceMappingURL=internet.module.js.map