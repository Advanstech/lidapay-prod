#!/usr/bin/env node

import { Command } from 'commander';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AddMerchantCountryFieldMigration } from '../merchant/migrations/add-country-field';

const program = new Command();

program
  .name('migrate-merchant-country')
  .description('Add country field to existing merchants')
  .option('-d, --default <country>', 'Default country code (ISO 3166-1 alpha-2)', 'NG')
  .action(async (options) => {
    try {
      console.log('Starting merchant migration process...');
      
      // Create NestJS application context
      const app = await NestFactory.createApplicationContext(AppModule);
      
      // Get the migration service
      const migrationService = app.get(AddMerchantCountryFieldMigration);
      
      // Run the migration
      const result = await migrationService.migrate();
      
      console.log('Merchant migration completed successfully!');
      console.log(`Updated ${result.updatedCount} merchants with country field`);
      
      await app.close();
      process.exit(0);
    } catch (error) {
      console.error('Merchant migration failed:', error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
