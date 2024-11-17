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
exports.MonetaryDetailsSchema = exports.MonetaryDetails = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let MonetaryDetails = class MonetaryDetails {
};
exports.MonetaryDetails = MonetaryDetails;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], MonetaryDetails.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], MonetaryDetails.prototype, "fee", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MonetaryDetails.prototype, "originalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'GHS' }),
    __metadata("design:type", String)
], MonetaryDetails.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MonetaryDetails.prototype, "balance_before", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MonetaryDetails.prototype, "balance_after", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], MonetaryDetails.prototype, "currentBalance", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], MonetaryDetails.prototype, "deliveredAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], MonetaryDetails.prototype, "requestedAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], MonetaryDetails.prototype, "discount", void 0);
exports.MonetaryDetails = MonetaryDetails = __decorate([
    (0, mongoose_1.Schema)()
], MonetaryDetails);
exports.MonetaryDetailsSchema = mongoose_1.SchemaFactory.createForClass(MonetaryDetails);
//# sourceMappingURL=monetary-details.schema.js.map