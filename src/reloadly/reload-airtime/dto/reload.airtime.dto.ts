import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ReloadAirtimeDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  userName: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  operatorId: number;

  @IsString()
  @IsOptional()
  operatorName: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsBoolean()
  @IsOptional()
  useLocalAmount: boolean;

  @IsString()
  @IsOptional()
  customIdentifier: string;

  @IsEmail()
  @IsOptional()
  recipientEmail: string;

  @IsString()
  @IsNotEmpty()
  recipientNumber: string;

  @IsString()
  @IsNotEmpty()
  recipientCountryCode: string;

  @IsString()
  @IsOptional()
  senderNumber: string;

  @IsString()
  @IsOptional()
  senderCountryCode: string;

  @IsString()
  @IsOptional()
  retailer?: string;

  @IsString()
  @IsOptional()
  retailerId?: string;

  @IsString()
  @IsOptional()
  currency: string;

  @IsString()
  @IsOptional()
  transType: string;

  @IsString()
  @IsOptional()
  transId: string;

  @IsString()
  @IsOptional()
  transStatus: string;

  @IsString()
  @IsOptional()
  network: string;
}
