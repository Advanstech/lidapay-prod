import { MobileMoneyService } from "./mobile-money/mobile-money.service";
import { ExpressPayService } from './express-pay.service';
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";
import { CreateTransactionDto } from "./mobile-money/dto/create-transaction.dto";
import { PaymentCallbackDto } from "./dto/callback.dto";
import { Response } from "express";
export declare class AdvansispayController {
    private readonly mobileMoneyService;
    private readonly expressPayService;
    private readonly logger;
    constructor(mobileMoneyService: MobileMoneyService, expressPayService: ExpressPayService);
    primaryCallback(res: Response, qr: PaymentCallbackDto): Promise<any>;
    initiatePayment(paymentData: InitiatePaymentDto): Promise<any>;
    processTransaction(transData: CreateTransactionDto): Promise<any>;
    queryTransaction(token: string): Promise<any>;
    handlePostPaymentStatus(req: any): Promise<void>;
}
