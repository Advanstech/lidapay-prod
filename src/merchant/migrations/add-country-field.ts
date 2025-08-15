import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Merchant, MerchantDocument } from '../schemas/merchant.schema';

@Injectable()
export class AddMerchantCountryFieldMigration {
  private logger = new Logger(AddMerchantCountryFieldMigration.name);

  constructor(
    @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>,
  ) {}

  async migrate() {
    try {
      this.logger.log('Starting migration: Adding country field to existing merchants');
      
      // Find all merchants without a country field
      const merchantsWithoutCountry = await this.merchantModel.find({
        $or: [
          { country: { $exists: false } },
          { country: null },
          { country: '' }
        ]
      });

      this.logger.log(`Found ${merchantsWithoutCountry.length} merchants without country field`);

      if (merchantsWithoutCountry.length > 0) {
        // Update all merchants without country to have a default country
        // You can change 'NG' to your preferred default country
        const result = await this.merchantModel.updateMany(
          {
            $or: [
              { country: { $exists: false } },
              { country: null },
              { country: '' }
            ]
          },
          { $set: { country: 'NG' } } // Default to Nigeria, change as needed
        );

        this.logger.log(`Successfully updated ${result.modifiedCount} merchants with default country`);
      }

      this.logger.log('Migration completed successfully');
      return { success: true, updatedCount: merchantsWithoutCountry.length };
    } catch (error) {
      this.logger.error(`Migration failed: ${error.message}`);
      throw error;
    }
  }
}
