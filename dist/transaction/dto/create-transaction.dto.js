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
    (0, swagger_1.ApiProperty)({ example: 'user123', description: 'The ID of the user initiating the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user123', description: 'The ID of the user initiating the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "userName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AIRTIME', description: 'The type of transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "transType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: 'The amount of the transaction' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'USD', description: 'The currency of the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pending', description: 'The status of the transaction', enum: ['pending', 'completed', 'failed', 'successfull'] }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "transStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'completed', description: 'The service status of the transaction', enum: ['refunded', 'reversed', 'cancelled', 'completed', 'failed'] }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "serviceStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MERCH123', description: 'The referrer client ID' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "referrerClientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MTN', description: 'The operator for the transaction', enum: ['Unknown', 'AirtelTigo', 'EXPRESSO', 'GLO', 'MTN', 'TiGO', 'Telecel', 'Busy', 'Surfline'] }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "operator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+233123456789', description: 'The recipient phone number' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "recipientNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'recipient@example.com', description: 'The recipient email address' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "recipientEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '5GB', description: 'The data package for internet transactions' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "dataPackage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'send', description: 'The type of mobile money transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "momoTransType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'GH', description: 'The country code for Reloadly transactions' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "reloadlyCountryCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1.5, description: 'The transaction fee' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "transFee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0.5, description: 'The discount applied to the transaction' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "discountApplied", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, description: 'The points earned from the transaction' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "pointsEarned", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5, description: 'The points redeemed for the transaction' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "pointsRedeemed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Transaction successful', description: 'The transaction message' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "transactionMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-05-01T12:00:00Z', description: 'The timestamp of the transaction' }),
    __metadata("design:type", Date)
], CreateTransactionDto.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MTN', description: 'The network for the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "network", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TRX123456', description: 'The transaction reference' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "trxn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1.0, description: 'The fee for the transaction' }),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "fee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '100', description: 'The original amount of the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "originalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Airtime topup', description: 'Commentary on the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "commentary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1000', description: 'The balance before the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "balance_before", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '900', description: 'The balance after the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "balance_after", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '900', description: 'The current balance after the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "currentBalance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { phoneNumber: '1234567890' }, description: 'Additional details specific to the transaction type' }),
    __metadata("design:type", Object)
], CreateTransactionDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'serviceCode', description: 'The service code for the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "serviceCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'transMessage', description: 'The transaction message' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "transMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'serviceTransId', description: 'The service transaction ID' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "serviceTransId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'phoneNumber', description: 'The phone number for the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'serviceName', description: 'The service name for the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "serviceName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'merchantReference', description: 'The merchant reference for the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "merchantReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'transId', description: 'The transaction ID' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "transId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'dataCode', description: 'The data code for internet transactions' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "dataCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentType', description: 'The payment type for the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "paymentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentCurrency', description: 'The payment currency for the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "paymentCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentCommentary', description: 'The payment commentary for the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "paymentCommentary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentStatus', description: 'The payment status for the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentServiceCode', description: 'The payment service code for the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "paymentServiceCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentTransactionId', description: 'The payment transaction ID for the transaction' }),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "paymentTransactionId", void 0);
//# sourceMappingURL=create-transaction.dto.js.map