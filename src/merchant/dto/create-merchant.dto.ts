import { IsString, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMerchantDto {
  readonly name: string;
  readonly email: string;
  readonly phoneNumber: string;
  readonly password: string;
  readonly roles: string[];
  street?: string;
  city?: string;
  ghanaPostGPS?: string;
  state?: string;
  zip?: string;
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
