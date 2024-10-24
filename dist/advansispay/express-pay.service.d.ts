import { HttpService } from '@nestjs/axios';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { TransactionService } from 'src/transaction/transaction.service';
export declare class ExpressPayService {
    private readonly httpService;
    private readonly transactionService;
    private readonly logger;
    private readonly config;
    constructor(httpService: HttpService, transactionService: TransactionService);
    paymentCallbackURL(req: any): Promise<{
        message: string;
    }>;
    handlePostPaymentStatus(req: any): Promise<void>;
    initiatePayment(paymentData: InitiatePaymentDto): Promise<{
        checkoutUrl: string;
        token: any;
        'order-id': any;
    }>;
    queryTransaction(token: string): Promise<{
        status: any;
        orderId: any;
        transactionId: any;
        amount: any;
        resultText: any;
        originalResponse: any;
    }>;
}
