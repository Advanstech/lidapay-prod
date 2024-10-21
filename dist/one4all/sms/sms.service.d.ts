import { HttpService } from "@nestjs/axios";
import { Observable } from "rxjs";
import { AxiosResponse } from "axios";
import { SmsDto } from "./dto/sms.dto";
export declare class SmsService {
    private httpService;
    private logger;
    private readonly smsBaseUrl;
    constructor(httpService: HttpService);
    SendSMS(transDto: SmsDto): Observable<AxiosResponse<SmsDto>>;
    postBulkSMS(transDto: SmsDto): Observable<AxiosResponse<SmsDto>>;
}
