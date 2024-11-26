import { HttpService } from '@nestjs/axios';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { TransactionService } from 'src/transaction/transaction.service';
import { PaymentCallbackDto } from './dto/callback.dto';
import { UserService } from 'src/user/user.service';
import { PaymentCallbackResult } from './interface/payment-callback-result.interface';
export declare class ExpressPayService {
    private readonly httpService;
    private readonly transactionService;
    private readonly userService;
    private readonly logger;
    private readonly config;
    constructor(httpService: HttpService, transactionService: TransactionService, userService: UserService);
    paymentCallbackURL(req: any): Promise<PaymentCallbackResult>;
    handlePostPaymentStatus(postData: PaymentCallbackDto): Promise<{
        success: boolean;
        message: string;
        status: string;
        orderId: string;
        token: string;
    } | {
        success: boolean;
        message: string;
        orderId: string;
        token: string;
        status?: undefined;
    }>;
    initiatePayment(paymentData: InitiatePaymentDto): Promise<{
        checkoutUrl: string;
        token: any;
        'order-id': string;
    }>;
    queryTransaction(token: string): Promise<{
        status: string;
        orderId: any;
        transactionId: any;
        amount: any;
        resultText: any;
        originalResponse: any;
        result: any;
    }>;
    private updateTransactionStatus;
    private buildMetadata;
    private handleErrorDuringCallback;
    private buildPostPaymentUpdateData;
    private handleErrorDuringPostStatus;
    private buildInitialTransaction;
    private getUserAccountNumber;
    private buildIpFormData;
    private handleErrorDuringPaymentInitiation;
    private handleFailedTransaction;
    private handleSuccessfulTransaction;
    private buildQueryTransactionUpdateData;
    private mapServiceStatus;
    private mapTransactionStatus;
    private generateCommentary;
    private generatePostUrlCommentary;
    private mapCallbackStatusUpdate;
}
