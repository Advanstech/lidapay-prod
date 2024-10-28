import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export class UpdateTransactionDto {
    @ApiProperty({ description: 'The status of the transaction', required: false, enum: ['pending', 'completed', 'failed', 'successful'] })
    @IsOptional()
    @IsEnum(['pending', 'completed', 'failed', 'successful'])
    readonly status?: string;

    @ApiProperty({ description: 'The transaction message' })
    @IsOptional()
    @IsString()
    transMessage?: string;

    @ApiProperty({ description: 'The transaction status', enum: ['pending', 'completed', 'failed', 'successful'] })
    @IsOptional()
    @IsEnum(['pending', 'completed', 'failed', 'successful'])
    transStatus?: string;

    @ApiProperty({ description: 'The balance before the transaction' })
    @IsOptional()
    @IsNumber()
    balance_before?: number;

    @ApiProperty({ description: 'The balance after the transaction' })
    @IsOptional()
    @IsNumber()
    balance_after?: number;

    @ApiProperty({ description: 'The amount of the transaction' })
    @IsOptional()
    @IsNumber()
    amount?: number;

    @ApiProperty({ description: 'The type of transaction', enum: ['topup', 'sms'] })
    @IsOptional()
    @IsEnum(['topup', 'sms'])
    transType?: string;

    @ApiProperty({ description: 'The phone number associated with the transaction' })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty({ description: 'The operator for the transaction', enum: ['Unknown', 'AirtelTigo', 'EXPRESSO', 'GLO', 'MTN', 'TiGO', 'Telecel', 'Busy', 'Surfline'] })
    @IsOptional()
    @IsEnum(['Unknown', 'AirtelTigo', 'EXPRESSO', 'GLO', 'MTN', 'TiGO', 'Telecel', 'Busy', 'Surfline'])
    operator?: string;

    @ApiProperty({ description: 'The transaction ID' })
    @IsOptional()
    @IsString()
    transactionId?: string;

    @ApiProperty({ description: 'The service status of the transaction', enum: ['refunded', 'reversed', 'cancelled', 'completed', 'failed'] })
    @IsOptional()
    @IsEnum(['refunded', 'reversed', 'cancelled', 'completed', 'failed'])
    serviceStatus?: string;

    @ApiProperty({ description: 'The service message of the transaction' })
    @IsOptional()
    @IsString()
    serviceMessage?: string;

    @ApiProperty({ description: 'The service code of the transaction' })
    @IsOptional()
    @IsString()
    serviceCode?: string;

    @ApiProperty({ description: 'The service transaction ID of the transaction' })
    @IsOptional()
    @IsString()
    serviceTransId?: string;    

    @ApiProperty({ description: 'The recipient phone number' })
    @IsOptional()
    @IsString()
    recipientNumber?: string;

    @ApiProperty({ description: 'Additional details specific to the transaction type' })
    @IsOptional()
    details?: Record<string, any>;

    @ApiProperty({ example: 'paymentType', description: 'The payment type for the transaction' })
    @IsOptional()
    @IsString()
    paymentType?: string;

    @ApiProperty({ example: 'paymentCurrency', description: 'The payment currency for the transaction' })
    @IsOptional()
    @IsString()
    paymentCurrency?: string;

    @ApiProperty({ example: 'paymentCommentary', description: 'The payment commentary for the transaction' })
    @IsOptional()
    @IsString()
    paymentCommentary?: string;

    @ApiProperty({ example: 'paymentStatus', description: 'The payment status for the transaction' })
    @IsOptional()
    @IsString() 
    paymentStatus?: string;

    @ApiProperty({ example: 'paymentServiceCode', description: 'The payment service code for the transaction' })
    @IsOptional()
    @IsString()
    paymentServiceCode?: string;

    @ApiProperty({ example: 'paymentTransactionId', description: 'The payment transaction ID for the transaction' })
    @IsOptional()
    @IsString()
    paymentTransactionId?: string;

    @ApiProperty({ example: 'paymentServiceMessage', description: 'The payment service message for the transaction' })
    @IsOptional()
    @IsString()
    paymentServiceMessage?: string; 

    curency?: string;
    currencyName?: string;
    expressToken?: string;
    timestamp?: Date;
    lastChecked?: Date;
    
    @ApiProperty({ description: 'Additional metadata related to the transaction' })
    @IsOptional()
    metadata?: Record<string, any>; // Changed from object to Record<string, any>
    queryLastChecked?: Date;
}
