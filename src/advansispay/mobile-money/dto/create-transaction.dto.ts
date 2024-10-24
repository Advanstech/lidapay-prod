import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
    @ApiProperty({ example: '1234567890', description: 'Customer mobile number' })
    customerMsisdn: string;
    @ApiProperty({ example: 100, description: 'Amount to be transferred' })
    amount: number;
    @ApiProperty({ example: 'Payment for services', description: 'Description of the transaction' })
    description: string;
    @ApiProperty({ example: 'mobile', description: 'Payment channel' })
    channel: string;
    @ApiProperty({ example: 'debit', description: 'Transaction type' })
    transType?: string;
    @ApiProperty({ example: 'user123', description: 'User ID' })
    userId?: string;
    @ApiProperty({ example: 'John Doe', description: 'User name' })
    userName?: string;
    @ApiProperty({ example: 'GHS', description: 'Currency code' })
    currency: string;
    @ApiProperty({ example: 'TXN-001', description: 'Transaction ID' })
    transId: string;
    readonly merchantId?: string;
    readonly serviceName: string;
    recipientName?: string;
    customerEmail: string;
    clientReference: string;
    token?: string;
    transStatus?: string;
    transMessage?: string;
    serviceStatus?: string;
    serviceTransId?: string;
    paymentStatus?: string;
    otherInfo?: string; 
    r_switch: any;
    processing_code: any;
    transaction_id: any;
    desc: any;
    merchant_id: any;
    subscriber_number: any;
    retailer?: any;
    fee: any;
    originalAmount: any;
    recipientNumber: any;
    network: any;
}
