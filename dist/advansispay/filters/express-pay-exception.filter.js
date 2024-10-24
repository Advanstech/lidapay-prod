"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressPayExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const express_pay_error_1 = require("../express-pay.error");
let ExpressPayExceptionFilter = class ExpressPayExceptionFilter {
    constructor() {
        this.errorStatusMap = {
            INVALID_CREDENTIALS: common_1.HttpStatus.UNAUTHORIZED,
            PAYMENT_INITIATION_FAILED: common_1.HttpStatus.BAD_REQUEST,
            QUERY_FAILED: common_1.HttpStatus.BAD_REQUEST,
            INVALID_TOKEN: common_1.HttpStatus.BAD_REQUEST,
            SYSTEM_ERROR: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            NETWORK_ERROR: common_1.HttpStatus.SERVICE_UNAVAILABLE,
            CALLBACK_PROCESSING_FAILED: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
        };
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = this.errorStatusMap[exception.code] || common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status).json({
            statusCode: status,
            error: exception.code,
            message: exception.message,
            details: exception.details,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.ExpressPayExceptionFilter = ExpressPayExceptionFilter;
exports.ExpressPayExceptionFilter = ExpressPayExceptionFilter = __decorate([
    (0, common_1.Catch)(express_pay_error_1.ExpressPayError)
], ExpressPayExceptionFilter);
//# sourceMappingURL=express-pay-exception.filter.js.map