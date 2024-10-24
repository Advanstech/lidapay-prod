export declare class ExpressPayError extends Error {
    readonly code: ExpressPayErrorCode;
    readonly details?: any;
    constructor(code: ExpressPayErrorCode, details?: any);
}
export type ExpressPayErrorCode = 'INVALID_CREDENTIALS' | 'PAYMENT_INITIATION_FAILED' | 'QUERY_FAILED' | 'INVALID_TOKEN' | 'SYSTEM_ERROR' | 'NETWORK_ERROR' | 'CALLBACK_PROCESSING_FAILED';
