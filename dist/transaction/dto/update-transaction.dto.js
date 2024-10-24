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
exports.UpdateTransactionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateTransactionDto {
}
exports.UpdateTransactionDto = UpdateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The status of the transaction', required: false, enum: ['pending', 'completed', 'failed', 'successful'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['pending', 'completed', 'failed', 'successful']),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The transaction message' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "transMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The transaction status', enum: ['pending', 'completed', 'failed', 'successful'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['pending', 'completed', 'failed', 'successful']),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "transStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The balance before the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTransactionDto.prototype, "balance_before", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The balance after the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTransactionDto.prototype, "balance_after", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The amount of the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The type of transaction', enum: ['topup', 'sms'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['topup', 'sms']),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "transType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The phone number associated with the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The operator for the transaction', enum: ['Unknown', 'AirtelTigo', 'EXPRESSO', 'GLO', 'MTN', 'TiGO', 'Telecel', 'Busy', 'Surfline'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['Unknown', 'AirtelTigo', 'EXPRESSO', 'GLO', 'MTN', 'TiGO', 'Telecel', 'Busy', 'Surfline']),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "operator", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The transaction ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The service status of the transaction', enum: ['refunded', 'reversed', 'cancelled', 'completed', 'failed'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['refunded', 'reversed', 'cancelled', 'completed', 'failed']),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "serviceStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The service message of the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "serviceMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The service code of the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "serviceCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The service transaction ID of the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "serviceTransId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The recipient phone number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "recipientNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional details specific to the transaction type' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateTransactionDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentType', description: 'The payment type for the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "paymentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentCurrency', description: 'The payment currency for the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "paymentCurrency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentCommentary', description: 'The payment commentary for the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "paymentCommentary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentStatus', description: 'The payment status for the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentServiceCode', description: 'The payment service code for the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "paymentServiceCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentTransactionId', description: 'The payment transaction ID for the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "paymentTransactionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'paymentServiceMessage', description: 'The payment service message for the transaction' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "paymentServiceMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional metadata related to the transaction' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateTransactionDto.prototype, "metadata", void 0);
//# sourceMappingURL=update-transaction.dto.js.map