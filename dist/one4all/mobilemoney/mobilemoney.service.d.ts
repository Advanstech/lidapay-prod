import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { ReceiveMoneyDto } from './dto/receive.money.dto';
import { SendMoneyDto } from './dto/send.money.dto';
export declare class MobilemoneyService {
    private httpService;
    private logger;
    private readonly momoBaseUrl;
    constructor(httpService: HttpService);
    sendMobileMoney(transDto: SendMoneyDto): Observable<AxiosResponse<SendMoneyDto>>;
    receiveMobileMoney(transDto: ReceiveMoneyDto): Observable<AxiosResponse<ReceiveMoneyDto>>;
}
