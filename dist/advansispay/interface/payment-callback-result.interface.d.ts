export interface PaymentCallbackResult {
    success: boolean;
    message?: string;
    status?: string;
    orderId?: string;
    token?: string;
    redirectUrl?: string;
}
