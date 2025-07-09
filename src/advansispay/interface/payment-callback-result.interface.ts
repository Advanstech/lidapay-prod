export interface PaymentCallbackResult {
  success: boolean;
  message?: string;
  status?: string;
  orderId?: string;
  token?: string;
  redirectUrl?: string; // Add redirectUrl to the return type
}
