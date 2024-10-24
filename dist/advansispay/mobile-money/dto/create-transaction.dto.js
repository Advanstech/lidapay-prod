"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateTransactionDto {
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234567890', description: 'Customer mobile number' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "customerMsisdn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: 'Amount to be transferred' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Payment for services', description: 'Description of the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'mobile', description: 'Payment channel' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'debit', description: 'Transaction type' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "transType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user123', description: 'User ID' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe', description: 'User name' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'GHS', description: 'Currency code' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TXN-001', description: 'Transaction ID' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "transId", void 0);
//# sourceMappingURL=create-transaction.dto.js.map