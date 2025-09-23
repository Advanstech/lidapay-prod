import { ReloadlyDataService } from './reloadly-data.service';
import { ReloadDataDto } from './dto/reload.data.dto';
export declare class ReloadlyDataController {
    private readonly reloadlyDataService;
    private readonly logger;
    constructor(reloadlyDataService: ReloadlyDataService);
    getReloadlyData(): Promise<string>;
    autoDetect(msisdn: string, countryCode: string): Promise<any>;
    listDataOperators(countryCode: string): Promise<any>;
    buyInternetData(dto: ReloadDataDto): Promise<any>;
}
