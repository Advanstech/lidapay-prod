import { HttpService } from "@nestjs/axios";
import { ReloadlyDto } from "./dto/reloadly.dto";
import { AxiosResponse } from "axios";
import { NetworkOperatorsDto } from "./dto/network.operators.dto";
import { Observable } from "rxjs/internal/Observable";
export declare class ReloadlyService {
    private httpService;
    private logger;
    private reloadLyBaseURL;
    private authURL;
    constructor(httpService: HttpService);
    accessToken(): Promise<Observable<any>>;
    getAccountBalance(): Promise<Observable<any>>;
    countryList(): Promise<Observable<any>>;
    findCountryByCode(reloadDto: ReloadlyDto): Promise<Observable<AxiosResponse<ReloadlyDto>>>;
    networkOperators(netDto: NetworkOperatorsDto): Promise<Observable<AxiosResponse<NetworkOperatorsDto>>>;
    findOperatorById(fobDto: NetworkOperatorsDto): Promise<Observable<AxiosResponse<NetworkOperatorsDto>>>;
    autoDetectOperator(adoDto: NetworkOperatorsDto): Promise<Observable<AxiosResponse<NetworkOperatorsDto>>>;
    getOperatorByCode(gobcDto: NetworkOperatorsDto): Promise<Observable<AxiosResponse<NetworkOperatorsDto>>>;
    fxRates(): Promise<any>;
    private reloadlyAccessToken;
}
