import { AirtimeService } from './airtime.service';
import { TopupDto } from './dto/topup.dto';
import { TransStatusDto } from './dto/transtatus.dto';
export declare class AirtimeController {
    private airtimeService;
    private logger;
    constructor(airtimeService: AirtimeService);
    queryTransactionstatus(qtsDto: TransStatusDto): Promise<any>;
    processTopup(ptDto: TopupDto, req: any): Promise<any>;
}
