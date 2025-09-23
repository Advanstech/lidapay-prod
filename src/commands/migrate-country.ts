#!/usr/bin/env node

import { Command } from 'commander';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AddCountryFieldMigration } from '../user/migrations/add-country-field';

const program = new Command();

program
  .name('migrate-country')
  .description('Add country field to existing users')
  .option('-d, --default <country>', 'Default country code (ISO 3166-1 alpha-2)', 'NG')
  .action(async (options) => {
    try {
      console.log('Starting migration process...');
      
      // Create NestJS application context
      const app = await NestFactory.createApplicationContext(AppModule);
      
      // Get the migration service
      const migrationService = app.get(AddCountryFieldMigration);
      
      // Run the migration
      const result = await migrationService.migrate();
      
      console.log('Migration completed successfully!');
      console.log(`Updated ${result.updatedCount} users with country field`);
      
      await app.close();
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
