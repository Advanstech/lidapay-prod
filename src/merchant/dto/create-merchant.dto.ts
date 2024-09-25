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
  country?: string;
}
