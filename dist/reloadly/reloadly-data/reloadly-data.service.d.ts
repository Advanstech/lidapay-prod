import { HttpService } from '@nestjs/axios';
import { TransactionService } from 'src/transaction/transaction.service';
import { ReloadDataDto } from './dto/reload.data.dto';
import { ConfigService } from '@nestjs/config';
export declare class ReloadlyDataService {
    private readonly httpService;
    private readonly transService;
    private readonly configService;
    private readonly logger;
    private readonly reloadLyBaseURL;
    private readonly accessTokenURL;
    constructor(httpService: HttpService, transService: TransactionService, configService: ConfigService);
    getReloadlyData(): Promise<string>;
    buyInternetData(dto: ReloadDataDto): Promise<any>;
    autoDetectOperator(msisdn: string, countryCode: string): Promise<any>;
    listDataOperators(countryCode: string): Promise<any>;
    getDataStatus(trxnId: string): Promise<any>;
    private reloadlyAccessToken;
}
