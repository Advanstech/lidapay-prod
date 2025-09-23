import { validate } from 'class-validator';
import { CreateMerchantDto } from './create-merchant.dto';

describe('CreateMerchantDto', () => {
  let createMerchantDto: CreateMerchantDto;

  beforeEach(() => {
    createMerchantDto = new CreateMerchantDto();
    createMerchantDto.name = 'Test Merchant';
    createMerchantDto.email = 'merchant@test.com';
    createMerchantDto.phoneNumber = '+1234567890';
    createMerchantDto.password = 'password123';
    createMerchantDto.roles = ['merchant'];
    createMerchantDto.country = 'US';
  });

  describe('country field validation', () => {
    it('should pass validation with valid country name', async () => {
      createMerchantDto.country = 'United States';
      const errors = await validate(createMerchantDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with another valid country name', async () => {
      createMerchantDto.country = 'Nigeria';
      const errors = await validate(createMerchantDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with short country name', async () => {
      createMerchantDto.country = 'Ghana';
      const errors = await validate(createMerchantDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with long country name', async () => {
      createMerchantDto.country = 'United Kingdom of Great Britain and Northern Ireland';
      const errors = await validate(createMerchantDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with country name shorter than 2 characters', async () => {
      createMerchantDto.country = 'U';
      const errors = await validate(createMerchantDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.length).toBeDefined();
    });

    it('should fail validation with empty country code', async () => {
      createMerchantDto.country = '';
      const errors = await validate(createMerchantDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation with null country code', async () => {
      createMerchantDto.country = null as any;
      const errors = await validate(createMerchantDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation with undefined country code', async () => {
      createMerchantDto.country = undefined as any;
      const errors = await validate(createMerchantDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });
  });

  describe('complete DTO validation', () => {
    it('should pass validation with all required fields', async () => {
      const errors = await validate(createMerchantDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation without country field', async () => {
      delete (createMerchantDto as any).country;
      const errors = await validate(createMerchantDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('country');
    });
  });
});
