import { IsBoolean, IsNumber, IsOptional, IsString, Min, IsInt, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class NetworkOperatorsDto {
  @IsOptional()
  @IsBoolean()
  includeBundles?: boolean;

  @IsOptional()
  @IsBoolean()
  includeData?: boolean;

  @IsOptional()
  @IsBoolean()
  suggestedAmountsMap?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  size?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number;

  @IsOptional()
  @IsBoolean()
  includeCombo?: boolean;

  @IsOptional()
  @IsBoolean()
  comboOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  bundlesOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  dataOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  pinOnly?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  operatorId?: number;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (value === undefined || value === null ? '' : String(value).trim()))
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (value === undefined || value === null ? '' : String(value).trim().toUpperCase()))
  countryIsoCode: string;

  @IsOptional()
  @IsBoolean()
  suggestedAmount?: boolean;

  @IsOptional()
  accessToken?: any;
}
