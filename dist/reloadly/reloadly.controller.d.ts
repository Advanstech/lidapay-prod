import { ReloadlyService } from "./reloadly.service";
import { ReloadlyDto } from "./dto/reloadly.dto";
import { NetworkOperatorsDto } from "./dto/network.operators.dto";
export declare class ReloadlyController {
    private readonly reloadlyService;
    private readonly logger;
    constructor(reloadlyService: ReloadlyService);
    getAccountBalance(): Promise<any>;
    accessToken(): Promise<any>;
    countryList(): Promise<any>;
    findCountryByCode(fcbDto: ReloadlyDto): Promise<any>;
    networkOperators(gngDto: any): Promise<any>;
    findOperatorById(adoDto: NetworkOperatorsDto): Promise<any>;
    autoDetectOperator(adoDto: NetworkOperatorsDto): Promise<any>;
    getOperatorByCode(gnobcDto: NetworkOperatorsDto): Promise<any>;
    getFxRate(operatorId: number, amount: number, currencyCode?: string): Promise<any>;
}
