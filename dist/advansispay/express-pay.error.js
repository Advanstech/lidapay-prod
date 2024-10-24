"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressPayError = void 0;
class ExpressPayError extends Error {
    constructor(code, details) {
        super(`ExpressPay Error: ${code}`);
        this.code = code;
        this.details = details;
        this.name = 'ExpressPayError';
    }
}
exports.ExpressPayError = ExpressPayError;
//# sourceMappingURL=express-pay.error.js.map