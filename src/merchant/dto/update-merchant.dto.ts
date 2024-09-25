import { PartialType } from '@nestjs/mapped-types';
import { CreateMerchantDto } from './create-merchant.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateMerchantDto extends PartialType(CreateMerchantDto) {
    readonly name?: string;
    readonly email?: string;
    readonly phoneNumber?: string;
    readonly password?: string;
    readonly roles?: string[];
    readonly city?: string;
    street?: string;
    ghanaPostGPS?: string;
    state?: string;
    zip?: string;
    country?: string;
    
    @IsString()
    merchantId?: string;
}