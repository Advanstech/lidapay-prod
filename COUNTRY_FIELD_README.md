# Country Field Addition for Reloadly API Integration

## Overview
This update adds a required `country` field to both user and merchant registration to support Reloadly API requirements. The country field stores full country names (e.g., "United States", "Nigeria", "Ghana") which can be converted to ISO codes on the frontend using the Reloadly API.

## Changes Made

### 1. User Schema (`src/user/schemas/user.schema.ts`)
- Added `country: string` field to the User interface
- Added `@Prop({ required: true, minlength: 2, maxlength: 100 })` decorator to the User class
- Field is required and accepts full country names

### 2. Create User DTO (`src/user/dto/create-user.dto.ts`)
- Added `country` field with validation decorators
- Uses `@IsString()`, `@IsNotEmpty()`, `@Length(2, 100)`
- Accepts full country names with automatic trimming
- Added proper import for class-validator decorators

### 3. User Controller (`src/user/user.controller.ts`)
- Updated API documentation to include country field
- Added country to required fields in API schema
- Updated example response to include country

### 4. User Migration Script (`src/user/migrations/add-country-field.ts`)
- Created migration service to add country field to existing users
- Sets default country to 'NG' (Nigeria) for existing users
- Can be customized to use different default country

### 5. User CLI Command (`src/commands/migrate-country.ts`)
- Created command-line tool to run the migration
- Added npm script: `npm run migrate:country`

### 6. Merchant Schema (`src/merchant/schemas/merchant.schema.ts`)
- Added `country: string` field to the Merchant class
- Added `@Prop({ required: true, minlength: 2, maxlength: 100 })` decorator
- Field is required and accepts full country names

### 7. Create Merchant DTO (`src/merchant/dto/create-merchant.dto.ts`)
- Updated `country` field to be required with validation decorators
- Uses `@IsString()`, `@IsNotEmpty()`, `@Length(2, 100)`
- Accepts full country names with automatic trimming
- Added proper import for class-validator decorators

### 8. Merchant Controller (`src/merchant/merchant.controller.ts`)
- Updated API documentation to include country field
- Added country to required fields in API schema
- Updated country field description and example

### 9. Merchant Migration Script (`src/merchant/migrations/add-country-field.ts`)
- Created migration service to add country field to existing merchants
- Sets default country to 'NG' (Nigeria) for existing merchants
- Can be customized to use different default country

### 10. Merchant CLI Command (`src/commands/migrate-merchant-country.ts`)
- Created command-line tool to run the merchant migration
- Added npm script: `npm run migrate:merchant-country`

## Usage

### New User Registration
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+1234567890",
  "password": "securePassword123",
  "roles": ["user"],
  "country": "United States"
}
```

### New Merchant Registration
```json
{
  "name": "Accra Supermarket",
  "email": "info@accrasupermarket.com",
  "phoneNumber": "+233241234567",
  "password": "securePassword123!",
  "roles": ["merchant"],
  "country": "Ghana",
  "street": "123 Independence Avenue",
  "city": "Accra",
  "state": "Greater Accra"
}
```

### Running Migration for Existing Users
```bash
# Run migration with default country (NG)
npm run migrate:country

# Run migration with custom default country
npm run migrate:country -- --default US
```

### Running Migration for Existing Merchants
```bash
# Run migration with default country (NG)
npm run migrate:merchant-country

# Run migration with custom default country
npm run migrate:merchant-country -- --default US
```

## Country Name Format
- Must be between 2 and 100 characters
- Accepts full country names in any language
- Examples: "United States", "Nigeria", "Ghana", "United Kingdom"
- Frontend can convert to ISO codes using Reloadly API

## Validation Rules
- **Required**: Yes
- **Type**: String
- **Length**: Between 2 and 100 characters
- **Format**: Any valid country name
- **Auto-transformation**: Input is automatically trimmed
- **Flexible input**: Accepts "Ghana", " ghana ", "GHANA" and converts to "Ghana"

## Database Impact
- New field added to User collection
- Existing users will have country set to default value after migration
- Field is indexed and required for all new users

## Reloadly API Integration
This country field is essential for:
- Determining available airtime/data packages
- Currency conversion
- Regulatory compliance
- Geographic restrictions

## Testing
After implementation, test:
1. User registration with valid country codes
2. User registration with invalid country codes (should fail validation)
3. Migration script execution
4. API documentation accuracy

## Troubleshooting

### Common Validation Errors

**Error**: "Country must be a valid ISO 3166-1 alpha-2 country code"
**Solution**: Ensure the country code is exactly 2 letters (e.g., "US", "NG", "GB")

**Error**: "country must be shorter than or equal to 2 characters"
**Solution**: The country field should be exactly 2 characters, not more or less

**Error**: "Country is required"
**Solution**: The country field must be included in the request body

### Input Flexibility
The system automatically handles various input formats:
- `"Ghana"` → `"Ghana"` (already correct format)
- `" ghana "` → `"Ghana"` (trims whitespace)
- `"GHANA"` → `"Ghana"` (preserves original case)

### Testing the API
```bash
# Valid country names
curl -X POST /api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"country": "Ghana", ...}'

# Invalid country names (will fail validation)
curl -X POST /api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"country": "U", ...}'    # Too short (1 character)
curl -X POST /api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"country": "", ...}'     # Empty string
```

## Rollback
If needed, the country field can be made optional by:
1. Removing `required: true` from schema
2. Making field optional in DTO
3. Updating validation rules
