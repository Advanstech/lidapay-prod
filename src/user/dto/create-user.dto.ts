import { IsString, IsNotEmpty, IsOptional, Length, Matches, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsOptional()
  readonly userId?: string;

  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  username?: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(6, 100, { message: 'Password must be between 6 and 100 characters' })
  readonly password: string;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value]; // Convert single string to array
    }
    if (Array.isArray(value)) {
      return value; // Keep as array
    }
    return value;
  })
  @IsArray({ message: 'Roles must be an array' })
  @IsString({ each: true, message: 'Each role must be a string' })
  @IsNotEmpty({ each: true, message: 'Each role must not be empty' })
  readonly roles: string[];

  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Email must be a valid email address' })
  readonly email: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;

  @IsOptional()
  @IsString({ message: 'Mobile must be a string' })
  mobile?: string;

  @IsOptional()
  @IsString({ message: 'Referrer Client ID must be a string' })
  readonly referrerClientId?: string;

  @IsOptional()
  resetPasswordToken?: string;

  @IsOptional()
  resetPasswordExpires?: any;
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  })
  @IsString({ message: 'Country must be a string' })
  @IsNotEmpty({ message: 'Country is required' })
  @Length(2, 100, { message: 'Country must be between 2 and 100 characters' })
  country: string;
}
