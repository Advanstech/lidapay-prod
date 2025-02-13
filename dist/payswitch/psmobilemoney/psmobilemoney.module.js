"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsmobilemoneyModule = void 0;
const common_1 = require("@nestjs/common");
const psmobilemoney_controller_1 = require("./psmobilemoney.controller");
const axios_1 = require("@nestjs/axios");
const transaction_module_1 = require("../../transaction/transaction.module");
const transaction_service_1 = require("../../transaction/transaction.service");
const psmobilemoney_service_1 = require("./psmobilemoney.service");
let PsmobilemoneyModule = class PsmobilemoneyModule {
};
exports.PsmobilemoneyModule = PsmobilemoneyModule;
exports.PsmobilemoneyModule = PsmobilemoneyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            transaction_module_1.TransactionModule,
        ],
        providers: [psmobilemoney_service_1.PsmobilemoneyService, transaction_service_1.TransactionService],
        controllers: [psmobilemoney_controller_1.PsmobilemoneyController]
    })
], PsmobilemoneyModule);
//# sourceMappingURL=psmobilemoney.module.js.map