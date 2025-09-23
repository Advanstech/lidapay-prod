import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ReloadDataDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    userName: string;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    operatorId: number;

    @IsOptional()
    @IsString()
    operatorName?: string;

    @Type(() => Number)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    @Min(0.01)
    amount: number;

    @IsOptional()
    @IsBoolean()
    useLocalAmount?: boolean;

    @IsOptional()
    @IsString()
    customIdentifier?: string;

    @IsOptional()
    @IsString()
    recipientEmail?: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (value === undefined || value === null ? '' : String(value).trim()))
    recipientNumber: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (value === undefined || value === null ? '' : String(value).trim().toUpperCase()))
    recipientCountryCode: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (value === undefined || value === null ? '' : String(value).trim()))
    senderNumber: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => (value === undefined || value === null ? '' : String(value).trim().toUpperCase()))
    senderCountryCode: string;

    @IsOptional()
    @IsString()
    currency?: string;

    // The following are internal/metadata fields; keep optional so whitelist won't strip if present
    @IsOptional()
    @IsString()
    transType?: string;

    @IsOptional()
    @IsString()
    transId?: string;

    @IsOptional()
    @IsString()
    transStatus?: string;

    @IsOptional()
    @IsString()
    network?: string;

    @IsOptional()
    @IsString()
    countryCode?: string;

    @IsOptional()
    @IsBoolean()
    includeData?: boolean;

    @IsOptional()
    @IsString()
    retailer?: string;

    @IsOptional()
    @IsString()
    retailerId?: string;
}