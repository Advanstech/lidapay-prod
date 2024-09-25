"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const transaction_controller_1 = require("./transaction.controller");
const transaction_service_1 = require("./transaction.service");
const transaction_schema_1 = require("./schemas/transaction.schema");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const merchant_auth_guard_1 = require("../auth/merchant-auth.guard");
const user_or_merchant_guard_1 = require("../auth/user-or-merchant.guard");
const auth_module_1 = require("../auth/auth.module");
let TransactionModule = class TransactionModule {
};
exports.TransactionModule = TransactionModule;
exports.TransactionModule = TransactionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: transaction_schema_1.Transaction.name, schema: transaction_schema_1.TransactionSchema }]),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
        ],
        controllers: [transaction_controller_1.TransactionController],
        providers: [
            transaction_service_1.TransactionService,
            jwt_auth_guard_1.JwtAuthGuard,
            merchant_auth_guard_1.MerchantAuthGuard,
            user_or_merchant_guard_1.UserOrMerchantGuard,
        ],
        exports: [transaction_service_1.TransactionService, mongoose_1.MongooseModule]
    })
], TransactionModule);
//# sourceMappingURL=transaction.module.js.map