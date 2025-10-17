import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { InternetDto } from './dto/internet.dto';
import { BundleListDto } from './dto/bundle-list.dto';
import { TransactionService } from 'src/transaction/transaction.service';
export declare class InternetService {
    private httpService;
    private transService;
    private logger;
    private DataUrl;
    constructor(httpService: HttpService, transService: TransactionService);
    topupInternetData(transDto: InternetDto): Observable<AxiosResponse<InternetDto>>;
    private handleTransactionFailure;
    private handleTransactionPending;
    dataBundleList(transDto: BundleListDto): Observable<AxiosResponse<InternetDto>>;
}
