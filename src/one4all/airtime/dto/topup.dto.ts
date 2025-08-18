import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEmail, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';

export class TopupDto {
  @IsOptional()
  readonly retailer?: string;
  
  @IsOptional()
  userName?: string;
  
  @IsOptional()
  userId?: string;
  
  @IsOptional()
  firstName?: string;
  
  @IsOptional()
  lastName?: string;
  
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @IsString()
  @IsNotEmpty({ message: 'Recipient number is required' })
  readonly recipientNumber: string;
  
  // Accept both string and number for amount, but convert to string internally
  @IsNotEmpty({ message: 'Amount is required' })
  @Transform(({ value }) => {
    // Convert number to string if needed
    if (typeof value === 'number') {
      return value.toString();
    }
    // If it's already a string, return as is
    if (typeof value === 'string') {
      return value;
    }
    // For any other type, convert to string
    return String(value);
  })
  readonly amount: string | number;
  
  @IsOptional()
  readonly charge?: string;
  
  @IsOptional()
  @IsNumber()
  readonly channel?: number;
  
  @IsOptional()
  @IsNumber()
  readonly network?: number;
  
  @IsOptional()
  clientReference?: string;
  
  @IsOptional()
  transType?: string;
  
  @IsOptional()
  customerName?: string;
  
  @IsOptional()
  customerEmail?: string;
  
  @IsOptional()
  description?: string;
  
  @IsOptional()
  serviceStatusCode?: string;
  
  @IsOptional()
  statusNarration?: string;
  
  @IsOptional()
  paymentStatus?: string;
  
  @IsOptional()
  redirectURL?: string;
  
  @IsOptional()
  clientId?: string;
  
  @IsOptional()
  clientSecret?: string;
  
  @IsOptional()
  customerMsisdn?: string;
  
  @IsOptional()
  recipientMsisdn?: string;
  
  @IsOptional()
  senderMsisdn?: string;
  
  @IsOptional()
  primaryCallbackUrl?: string;
  
  @IsOptional()
  merchantName?: string;
  
  @IsOptional()
  serviceName?: string;
  
  @IsOptional()
  merchantReference?: string;
  
  @IsOptional()
  transId?: string;
  
  @IsOptional()
  originalAmount?: string;
  
  @IsOptional()
  amountPaid?: string;
  
  @IsOptional()
  mobileNumber?: string;
  
  @IsOptional()
  recipientName?: string;
  
  @IsOptional()
  senderNumber?: string;
  
  @IsOptional()
  product?: string;
  
  @IsOptional()
  transDescription?: string;
  
  @IsOptional()
  voucher?: string;
  
  @IsOptional()
  serviceStatus?: string;
  
  @IsOptional()
  transMessage?: string;
  
  @IsOptional()
  serviceTransId?: string;
  
  @IsOptional()
  transStatus?: string;
  
  @IsOptional()
  callbackReceipt?: string;
  
  @IsOptional()
  commentary?: string;
  
  @IsOptional()
  callbackUrl?: string;
  
  @IsOptional()
  readonly price?: string;
  
  @IsOptional()
  recipient_number?: string;
  
  @IsOptional()
  sender?: string;
  
  @IsOptional()
  award?: string;
  
  @IsOptional()
  apikey?: string;
  
  @IsOptional()
  orderID?: string;
  
  @IsOptional()
  token?: string;
  
  @IsOptional()
  notifyURL?: string;
  
  @IsOptional()
  notificationFormat?: string;
  
  @IsOptional()
  destinationAddress?: string;
  
  @IsOptional()
  criteria?: string;
  
  @IsOptional()
  Status?: string;
  
  @IsOptional()
  transactionId?: string;
  
  @IsOptional()
  Message?: string;
  
  @IsOptional()
  MerchantReference?: string;
  
  @IsOptional()
  CallbackURL?: string;
  
  @IsOptional()
  currentBalance?: string;
  
  @IsOptional()
  balanceBefore?: number;
  
  @IsOptional()
  balanceAfter?: number;
  
  @IsOptional()
  recipient?: string;
  
  @IsOptional()
  trxn?: string;
  
  @IsOptional()
  fee?: any;
  
  @IsOptional()
  serviceCode?: string;
  
  @IsOptional()
  currency?: string;
}
