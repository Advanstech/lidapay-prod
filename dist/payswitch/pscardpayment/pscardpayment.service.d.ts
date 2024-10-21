import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { CardPaymentDto } from './dto/card.payments.dto';
import { CallbackDto } from './dto/callback.dto';
import { InlinePayDto } from './dto/inline.pay.dto';
export declare class PscardpaymentService {
    private httpService;
    private logger;
    constructor(httpService: HttpService);
    psCallback(transDto: CallbackDto): Observable<AxiosResponse<CallbackDto>>;
    inlinePayments(transDto: InlinePayDto): Observable<AxiosResponse<CardPaymentDto>>;
    cardPayment(transDto: CardPaymentDto): Observable<AxiosResponse<CardPaymentDto>>;
}
