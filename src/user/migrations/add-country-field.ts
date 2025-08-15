import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AddCountryFieldMigration {
  private logger = new Logger(AddCountryFieldMigration.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async migrate() {
    try {
      this.logger.log('Starting migration: Adding country field to existing users');
      
      // Find all users without a country field
      const usersWithoutCountry = await this.userModel.find({
        $or: [
          { country: { $exists: false } },
          { country: null },
          { country: '' }
        ]
      });

      this.logger.log(`Found ${usersWithoutCountry.length} users without country field`);

      if (usersWithoutCountry.length > 0) {
        // Update all users without country to have a default country
        // You can change 'NG' to your preferred default country
        const result = await this.userModel.updateMany(
          {
            $or: [
              { country: { $exists: false } },
              { country: null },
              { country: '' }
            ]
          },
          { $set: { country: 'NG' } } // Default to Nigeria, change as needed
        );

        this.logger.log(`Successfully updated ${result.modifiedCount} users with default country`);
      }

      this.logger.log('Migration completed successfully');
      return { success: true, updatedCount: usersWithoutCountry.length };
    } catch (error) {
      this.logger.error(`Migration failed: ${error.message}`);
      throw error;
    }
  }
}
