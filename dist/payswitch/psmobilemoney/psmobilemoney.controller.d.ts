import { PsmobilemoneyService } from './psmobilemoney.service';
import { TransferMobileMoneyDto } from './dto/transfer.mobilemoney.dto';
import { PayMobileMoneyDto } from './dto/pay.mobilemoney.dto';
export declare class PsmobilemoneyController {
    private psMobilemoneyService;
    private logger;
    constructor(psMobilemoneyService: PsmobilemoneyService);
    creditWallet(transDto: TransferMobileMoneyDto): Promise<import("rxjs").Observable<import("axios").AxiosResponse<TransferMobileMoneyDto, any>>>;
    debitWallet(transDto: PayMobileMoneyDto): Promise<import("rxjs").Observable<import("axios").AxiosResponse<PayMobileMoneyDto, any>>>;
}
