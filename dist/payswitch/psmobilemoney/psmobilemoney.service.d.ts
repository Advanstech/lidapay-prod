import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { TransferMobileMoneyDto } from './dto/transfer.mobilemoney.dto';
import { PayMobileMoneyDto } from './dto/pay.mobilemoney.dto';
import { TransactionService } from 'src/transaction/transaction.service';
export declare class PsmobilemoneyService {
    private httpService;
    private transactionService;
    private logger;
    constructor(httpService: HttpService, transactionService: TransactionService);
    primaryCallbackUrl(): void;
    transferMobilemoney(transDto: TransferMobileMoneyDto): Observable<AxiosResponse<TransferMobileMoneyDto>>;
    mobileMoneyPayment(transDto: PayMobileMoneyDto): Observable<AxiosResponse<PayMobileMoneyDto>>;
}
