import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';

// monetary-details dto
export class MonetaryDetailsDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number; // Ensure this is a number

  @IsNumber()
  @IsOptional()
  fee?: number;

  @IsString()
  @IsOptional()
  originalAmount?: string;

  @IsString()
  @IsOptional()
  currency?: string = 'GHS'; // Default currency

  @IsString()
  @IsOptional()
  balance_before?: string;

  @IsString()
  @IsOptional()
  balance_after?: string;

  @IsString()
  @IsOptional()
  currentBalance?: string;

  deliveredAmount?: any;
  requestedAmount?: any; // New field
  discount: any; // New field
}
// transaction status dto
export class TransactionStatusDto {
  @IsEnum(['pending', 'completed', 'failed', 'success', 'approved'])
  transaction: string;

  @IsEnum([
    'pending',
    'inprogress',
    'refunded',
    'reversed',
    'cancelled',
    'completed',
    'failed',
    'success',
    'approved',
    'declined',
    'error'
  ])
  service: string;

  @IsString()
  @IsOptional()
  payment?: string;
}
// payment-details dto
export class PaymentDetailsDto {
  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  commentary?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  serviceCode?: string;

  @IsString()
  @IsOptional()
  transactionId?: string;

  @IsString()
  @IsOptional()
  serviceMessage?: string;

  @IsString()
  @IsOptional()
  type?: string;

  operatorTransactionId?: string; // Add this line

}
// create trans dto
export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsString()
  @IsNotEmpty()
  transType: string;

  @IsString()
  @IsNotEmpty()
  transId: string;

  @IsString()
  @IsOptional()
  recipientNumber?: string;

  @IsString()
  @IsOptional()
  operator?: string;

  @IsString()
  @IsOptional()
  network?: string;

  @IsString()
  @IsOptional()
  retailer?: string;

  @IsString()
  @IsOptional()
  expressToken?: string;

  @IsNotEmpty()
  monetary: MonetaryDetailsDto; // Ensure monetary details are provided

  @IsNotEmpty()
  status: TransactionStatusDto; // Ensure status is provided

  @IsOptional()
  payment?: PaymentDetailsDto; // Payment details are optional

  @IsArray()
  @IsOptional()
  metadata?: Array<{
    initiatedAt: Date;
    provider: string;
    username: string;
    accountNumber: string;
    lastQueryAt: Date;
    token?: string;
    result?: number;
    'result-text'?: string;
  }>;

  @IsString()
  @IsOptional()
  commentary?: string;

  @IsOptional()
  trxn?: string;

  @IsOptional()
  paymentCommentary?: string;

  @IsOptional()
  deliveredAmount?: number;

  @IsOptional()
  requestedAmount?: number;

  @IsOptional()
  operatorTransactionId?: string;

  @IsOptional()
  discount?: number;

  @IsOptional()
  balanceInfo?: {
    oldBalance: number;
    newBalance: number;
    cost: number;
    currencyCode: string;
    currencyName: string;
    updatedAt: Date;
  };
}