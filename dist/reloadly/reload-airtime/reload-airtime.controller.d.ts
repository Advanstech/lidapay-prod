import { ReloadAirtimeService } from './reload-airtime.service';
import { ReloadAirtimeDto } from './dto/reload.airtime.dto';
export declare class ReloadAirtimeController {
    private reloadAirtimeService;
    private logger;
    constructor(reloadAirtimeService: ReloadAirtimeService);
    getAccessToken(): Promise<any>;
    testReloadLyAirtime(): string;
    airtimeRecharge(airDto: ReloadAirtimeDto, req: any): Promise<any>;
    asyncAirtimeRecharge(aarDto: ReloadAirtimeDto, req: any): Promise<any>;
    mnpLookup(phone: string, countryCode: string): Promise<any>;
    getTopupStatus(transactionId: string): Promise<any>;
}
