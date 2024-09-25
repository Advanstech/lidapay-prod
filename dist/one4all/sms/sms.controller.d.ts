import { SmsDto } from './dto/sms.dto';
import { SmsService } from './sms.service';
export declare class SmsController {
    private smsService;
    private logger;
    constructor(smsService: SmsService);
    sendSms(transDto: SmsDto): Promise<import("rxjs").Observable<import("axios").AxiosResponse<SmsDto, any>>>;
    sendBulkSms(transDto: SmsDto): Promise<any>;
}
