// dto/initiate-payment.dto.ts
import { IsString, IsEmail, IsNumber, IsNotEmpty, Min, Matches, Length, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class InitiatePaymentDto {
    @IsString()
    @Length(2, 50)
    @Transform(({ value }) => value?.trim())
    firstName: string;

    @IsString()
    @Length(2, 50)
    @Transform(({ value }) => value?.trim())
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    @Matches(/^[\+\d]{10,15}$/)
    phoneNumber: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    accountNumber?: string;

    @IsNumber()
    @Min(1)
    @Transform(({ value }) => parseFloat(value))
    amount: number;

    // @IsString()
    // @IsNotEmpty()
    // @Length(3, 50)
    // orderId: string;

    @IsOptional()
    @IsString()
    @Length(0, 200)
    orderDesc?: string;

    @IsOptional()
    @IsString()
    @Matches(/^https?:\/\/.+/, {
        message: 'Order image URL must be a valid URL',
    })
    orderImgUrl?: string;

    redirectUrl: string;

    @IsString({ message: 'User ID must be a string' })
    @IsNotEmpty({ message: 'User ID is required' })
    @Transform(({ value }) => {
        console.log(`DTO Transform - userId value: "${value}"`);
        console.log(`DTO Transform - userId type: ${typeof value}`);
        return value?.trim();
    })
    userId: string;
    userName: string;
    transId: string;
    paymentType: string;
    retailer: string;
    fee: any;
    originalAmount: any;
    customerMsisdn: string;
    walletOperator: string;
    paymentCurrency: string;
    paymentCommentary: string;
    paymentStatus: string;
    paymentServiceCode: string;
    paymentTransactionId: string;
    paymentServiceMessage: string;
    payTransRef: string;
    transType?: string;
    orderId?: string;
    recipientNumber: string;
}
