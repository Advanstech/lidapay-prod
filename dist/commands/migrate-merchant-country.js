#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const add_country_field_1 = require("../merchant/migrations/add-country-field");
const program = new commander_1.Command();
program
    .name('migrate-merchant-country')
    .description('Add country field to existing merchants')
    .option('-d, --default <country>', 'Default country code (ISO 3166-1 alpha-2)', 'NG')
    .action(async (options) => {
    try {
        console.log('Starting merchant migration process...');
        const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
        const migrationService = app.get(add_country_field_1.AddMerchantCountryFieldMigration);
        const result = await migrationService.migrate();
        console.log('Merchant migration completed successfully!');
        console.log(`Updated ${result.updatedCount} merchants with country field`);
        await app.close();
        process.exit(0);
    }
    catch (error) {
        console.error('Merchant migration failed:', error.message);
        process.exit(1);
    }
});
program.parse(process.argv);
//# sourceMappingURL=migrate-merchant-country.js.map