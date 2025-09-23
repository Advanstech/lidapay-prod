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
exports.CreateUserDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Username must be a string' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'First name must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'First name is required' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Last name must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Last name is required' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.Length)(6, 100, { message: 'Password must be between 6 and 100 characters' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return [value];
        }
        if (Array.isArray(value)) {
            return value;
        }
        return value;
    }),
    (0, class_validator_1.IsArray)({ message: 'Roles must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'Each role must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ each: true, message: 'Each role must not be empty' }),
    __metadata("design:type", Array)
], CreateUserDto.prototype, "roles", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Email must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_validator_1.Matches)(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Email must be a valid email address' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Phone number must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Phone number is required' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Mobile must be a string' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "mobile", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Referrer Client ID must be a string' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "referrerClientId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "resetPasswordToken", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateUserDto.prototype, "resetPasswordExpires", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    }),
    (0, class_validator_1.IsString)({ message: 'Country must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Country is required' }),
    (0, class_validator_1.Length)(2, 100, { message: 'Country must be between 2 and 100 characters' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "country", void 0);
//# sourceMappingURL=create-user.dto.js.map