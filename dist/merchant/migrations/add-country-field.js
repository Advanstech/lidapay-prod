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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AddMerchantCountryFieldMigration_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMerchantCountryFieldMigration = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const merchant_schema_1 = require("../schemas/merchant.schema");
let AddMerchantCountryFieldMigration = AddMerchantCountryFieldMigration_1 = class AddMerchantCountryFieldMigration {
    constructor(merchantModel) {
        this.merchantModel = merchantModel;
        this.logger = new common_1.Logger(AddMerchantCountryFieldMigration_1.name);
    }
    async migrate() {
        try {
            this.logger.log('Starting migration: Adding country field to existing merchants');
            const merchantsWithoutCountry = await this.merchantModel.find({
                $or: [
                    { country: { $exists: false } },
                    { country: null },
                    { country: '' }
                ]
            });
            this.logger.log(`Found ${merchantsWithoutCountry.length} merchants without country field`);
            if (merchantsWithoutCountry.length > 0) {
                const result = await this.merchantModel.updateMany({
                    $or: [
                        { country: { $exists: false } },
                        { country: null },
                        { country: '' }
                    ]
                }, { $set: { country: 'NG' } });
                this.logger.log(`Successfully updated ${result.modifiedCount} merchants with default country`);
            }
            this.logger.log('Migration completed successfully');
            return { success: true, updatedCount: merchantsWithoutCountry.length };
        }
        catch (error) {
            this.logger.error(`Migration failed: ${error.message}`);
            throw error;
        }
    }
};
exports.AddMerchantCountryFieldMigration = AddMerchantCountryFieldMigration;
exports.AddMerchantCountryFieldMigration = AddMerchantCountryFieldMigration = AddMerchantCountryFieldMigration_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(merchant_schema_1.Merchant.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AddMerchantCountryFieldMigration);
//# sourceMappingURL=add-country-field.js.map