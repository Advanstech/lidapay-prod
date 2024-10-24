import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ example: 'user123', description: 'The ID of the user initiating the transaction' })
  userId: string;

  @ApiProperty({ example: 'user123', description: 'The ID of the user initiating the transaction' })
  userName: string;

  @ApiProperty({ example: 'AIRTIME', description: 'The type of transaction' })
  transType: string;
  @ApiProperty({ example: 100, description: 'The amount of the transaction' })
  amount: number;
  @ApiProperty({ example: 'USD', description: 'The currency of the transaction' })
  currency?: string;
  currencyName?: string;
  @ApiProperty({ example: 'pending', description: 'The status of the transaction', enum: ['pending', 'completed', 'failed', 'successfull'] })
  transStatus: string;
  @ApiProperty({ example: 'completed', description: 'The service status of the transaction', enum: ['refunded', 'reversed', 'cancelled', 'completed', 'failed'] })
  serviceStatus: string;
  @ApiProperty({ example: 'MERCH123', description: 'The referrer client ID' })
  referrerClientId?: string;

  @ApiProperty({ example: 'MTN', description: 'The operator for the transaction', enum: ['Unknown', 'AirtelTigo', 'EXPRESSO', 'GLO', 'MTN', 'TiGO', 'Telecel', 'Busy', 'Surfline'] })
  operator: string;

  @ApiProperty({ example: '+233123456789', description: 'The recipient phone number' })
  recipientNumber: string;

  @ApiProperty({ example: 'recipient@example.com', description: 'The recipient email address' })
  recipientEmail?: string;

  @ApiProperty({ example: '5GB', description: 'The data package for internet transactions' })
  dataPackage?: string;

  @ApiProperty({ example: 'send', description: 'The type of mobile money transaction' })
  momoTransType?: string;

  @ApiProperty({ example: 'GH', description: 'The country code for Reloadly transactions' })
  reloadlyCountryCode?: string;

  @ApiProperty({ example: 1.5, description: 'The transaction fee' })
  transFee?: number;

  @ApiProperty({ example: 0.5, description: 'The discount applied to the transaction' })
  discountApplied?: number;

  @ApiProperty({ example: 10, description: 'The points earned from the transaction' })
  pointsEarned?: number;

  @ApiProperty({ example: 5, description: 'The points redeemed for the transaction' })
  pointsRedeemed?: number;

  @ApiProperty({ example: 'Transaction successful', description: 'The transaction message' })
  transactionMessage?: string;

  @ApiProperty({ example: '2023-05-01T12:00:00Z', description: 'The timestamp of the transaction' })
  timestamp?: Date;

  @ApiProperty({ example: 'MTN', description: 'The network for the transaction' })
  network?: string;

  @ApiProperty({ example: 'TRX123456', description: 'The transaction reference' })
  trxn?: string;

  @ApiProperty({ example: 1.0, description: 'The fee for the transaction' })
  fee?: number;

  @ApiProperty({ example: '100', description: 'The original amount of the transaction' })
  originalAmount?: string;

  @ApiProperty({ example: 'Airtime topup', description: 'Commentary on the transaction' })
  commentary?: string;

  @ApiProperty({ example: '1000', description: 'The balance before the transaction' })
  balance_before?: string;

  @ApiProperty({ example: '900', description: 'The balance after the transaction' })
  balance_after?: string;

  @ApiProperty({ example: '900', description: 'The current balance after the transaction' })
  currentBalance?: string;

  @ApiProperty({ example: { phoneNumber: '1234567890' }, description: 'Additional details specific to the transaction type' })
  details?: Record<string, any>;

  @ApiProperty({ example: 'serviceCode', description: 'The service code for the transaction' })
  serviceCode: string;

  @ApiProperty({ example: 'transMessage', description: 'The transaction message' })
  transMessage: string;

  @ApiProperty({ example: 'serviceTransId', description: 'The service transaction ID' })
  serviceTransId: string;

  @ApiProperty({ example: 'phoneNumber', description: 'The phone number for the transaction' })
  phoneNumber?: string;

  @ApiProperty({ example: 'serviceName', description: 'The service name for the transaction' })
  serviceName?: string;

  @ApiProperty({ example: 'merchantReference', description: 'The merchant reference for the transaction' })
  merchantReference?: string;

  @ApiProperty({ example: 'transId', description: 'The transaction ID' })
  transId?: string;

  @ApiProperty({ example: 'dataCode', description: 'The data code for internet transactions' })
  dataCode?: string;

  @ApiProperty({ example: 'paymentType', description: 'The payment type for the transaction' })
  paymentType?: string;

  @ApiProperty({ example: 'paymentCurrency', description: 'The payment currency for the transaction' })
  paymentCurrency?: string;

  @ApiProperty({ example: 'paymentCommentary', description: 'The payment commentary for the transaction' })
  paymentCommentary?: string;

  @ApiProperty({ example: 'paymentStatus', description: 'The payment status for the transaction' })
  paymentStatus?: string;

  @ApiProperty({ example: 'paymentServiceCode', description: 'The payment service code for the transaction' })
  paymentServiceCode?: string;

  @ApiProperty({ example: 'paymentTransactionId', description: 'The payment transaction ID for the transaction' })
  paymentTransactionId?: string;

  transactionId?: string; // Add this line to include transactionId
  paymentId?: string;
  expressToken?: string;
  metadata?: Record<string, any>;
}
