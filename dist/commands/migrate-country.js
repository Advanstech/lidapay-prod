#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const add_country_field_1 = require("../user/migrations/add-country-field");
const program = new commander_1.Command();
program
    .name('migrate-country')
    .description('Add country field to existing users')
    .option('-d, --default <country>', 'Default country code (ISO 3166-1 alpha-2)', 'NG')
    .action(async (options) => {
    try {
        console.log('Starting migration process...');
        const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
        const migrationService = app.get(add_country_field_1.AddCountryFieldMigration);
        const result = await migrationService.migrate();
        console.log('Migration completed successfully!');
        console.log(`Updated ${result.updatedCount} users with country field`);
        await app.close();
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
});
program.parse(process.argv);
//# sourceMappingURL=migrate-country.js.map