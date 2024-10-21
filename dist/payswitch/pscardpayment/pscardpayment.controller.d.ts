import { Response } from "express";
import { CallbackDto } from "./dto/callback.dto";
import { InlinePayDto } from "./dto/inline.pay.dto";
import { PscardpaymentService } from "./pscardpayment.service";
export declare class PscardpaymentController {
    private pscardpaymentService;
    private logger;
    constructor(pscardpaymentService: PscardpaymentService);
    primaryCallback(res: Response, qr: CallbackDto): Promise<any>;
    inlineCardMobilePayments(transDto: InlinePayDto): Promise<import("rxjs").Observable<import("axios").AxiosResponse<import("./dto/card.payments.dto").CardPaymentDto, any>>>;
}
