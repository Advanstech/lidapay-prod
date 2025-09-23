import { HttpService } from "@nestjs/axios";
import { ReloadlyDto } from "./dto/reloadly.dto";
import { AxiosResponse } from "axios";
import { NetworkOperatorsDto } from "./dto/network.operators.dto";
import { Observable } from "rxjs";
export declare class ReloadlyService {
    private readonly httpService;
    private readonly logger;
    private readonly reloadLyBaseURL;
    private readonly authURL;
    constructor(httpService: HttpService);
    accessToken(): Observable<any>;
    getAccountBalance(): Observable<any>;
    countryList(): Observable<any>;
    findCountryByCode(reloadDto: ReloadlyDto): Observable<any>;
    networkOperators(reloadDto?: {
        size?: number;
        page?: number;
    }): Observable<any>;
    findOperatorById(fobDto: NetworkOperatorsDto): Observable<any>;
    autoDetectOperator(adoDto: NetworkOperatorsDto): Observable<AxiosResponse<NetworkOperatorsDto>>;
    getOperatorByCode(gobcDto: NetworkOperatorsDto): Observable<any>;
    fxRates(params: {
        operatorId: number;
        amount: number;
        currencyCode?: string;
    }): Promise<any>;
    private reloadlyAccessToken;
}
