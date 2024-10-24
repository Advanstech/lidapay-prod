// express-pay.errors.ts
export class ExpressPayError extends Error {
    constructor(
      public readonly code: ExpressPayErrorCode,
      public readonly details?: any
    ) {
      super(`ExpressPay Error: ${code}`);
      this.name = 'ExpressPayError';
    }
  }
  
  export type ExpressPayErrorCode =
    | 'INVALID_CREDENTIALS'
    | 'PAYMENT_INITIATION_FAILED'
    | 'QUERY_FAILED'
    | 'INVALID_TOKEN'
    | 'SYSTEM_ERROR'
    | 'NETWORK_ERROR'
    | 'CALLBACK_PROCESSING_FAILED';
  
