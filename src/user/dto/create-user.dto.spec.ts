import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  let createUserDto: CreateUserDto;

  beforeEach(() => {
    createUserDto = new CreateUserDto();
    createUserDto.username = 'testuser';
    createUserDto.firstName = 'John';
    createUserDto.lastName = 'Doe';
    createUserDto.password = 'password123';
    createUserDto.roles = ['user'];
    createUserDto.email = 'john.doe@example.com';
    createUserDto.phoneNumber = '+1234567890';
    createUserDto.country = 'US';
  });

  describe('country field validation', () => {
    it('should pass validation with valid country name', async () => {
      createUserDto.country = 'United States';
      const errors = await validate(createUserDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with another valid country name', async () => {
      createUserDto.country = 'Nigeria';
      const errors = await validate(createUserDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with short country name', async () => {
      createUserDto.country = 'Ghana';
      const errors = await validate(createUserDto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with long country name', async () => {
      createUserDto.country = 'United Kingdom of Great Britain and Northern Ireland';
      const errors = await validate(createUserDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with country name shorter than 2 characters', async () => {
      createUserDto.country = 'U';
      const errors = await validate(createUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.length).toBeDefined();
    });

    it('should fail validation with empty country code', async () => {
      createUserDto.country = '';
      const errors = await validate(createUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation with null country code', async () => {
      createUserDto.country = null as any;
      const errors = await validate(createUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation with undefined country code', async () => {
      createUserDto.country = undefined as any;
      const errors = await validate(createUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });
  });

  describe('complete DTO validation', () => {
    it('should pass validation with all required fields', async () => {
      const errors = await validate(createUserDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation without country field', async () => {
      delete (createUserDto as any).country;
      const errors = await validate(createUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('country');
    });
  });
});
