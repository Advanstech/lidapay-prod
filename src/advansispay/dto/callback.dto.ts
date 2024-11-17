import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaymentCallbackDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Transaction token from ExpressPay',
        example: '4686671a924bd07e32.72722384671a924bd07ea5.886127862734671a924bd0'
    })
    token: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Order ID from ExpressPay',
        example: 'ADV-M2NN2COD-11D269AA',
        name: 'order-id'
    })
    'order-id': string;
    orderId: string;

    @ApiProperty({
        description: 'Transaction amount',
        example: '100.00'
    })
    amount?: string;

    @ApiProperty({
        description: 'Currency code',
        example: 'GHS',
        default: 'GHS'
    })
    currency?: string;

    result?: any;
}