import { IsString } from 'class-validator';

export class PaymentCallbackDto {
    @IsString()
    token: string;

    @IsString()
    status?: string;

    @IsString()
    'order-id'?: string;

    @IsString()
    orderId?: string;
}
