import { SendMoneyDto } from './dto/send.money.dto';
import { ReceiveMoneyDto } from './dto/receive.money.dto';
import { MobilemoneyService } from './mobilemoney.service';
export declare class MobilemoneyController {
    private mobilemoneyService;
    private logger;
    constructor(mobilemoneyService: MobilemoneyService);
    creditWallet(transDto: SendMoneyDto): Promise<import("rxjs").Observable<import("axios").AxiosResponse<SendMoneyDto, any>>>;
    debitWallet(transDto: ReceiveMoneyDto): Promise<any>;
}
