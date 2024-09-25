import { CreateMerchantDto } from './create-merchant.dto';
declare const UpdateMerchantDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateMerchantDto>>;
export declare class UpdateMerchantDto extends UpdateMerchantDto_base {
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
    merchantId?: string;
}
export {};
