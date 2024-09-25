import { HttpService } from '@nestjs/axios';
import { ReloadAirtimeDto } from './dto/reload.airtime.dto';
import { Observable } from 'rxjs';
import { TransactionService } from 'src/transaction/transaction.service';
export declare class ReloadAirtimeService {
    private httpService;
    private readonly transService;
    private logger;
    private reloadLyBaseURL;
    private accessTokenURL;
    constructor(httpService: HttpService, transService: TransactionService);
    generateAccessToken(): Observable<{
        accessToken: string;
    }>;
    makeTopUp(airDto: ReloadAirtimeDto): Promise<Observable<any>>;
    makeAsynchronousTopUp(matDto: ReloadAirtimeDto): Promise<Observable<any>>;
    private reloadlyAccessToken;
}
