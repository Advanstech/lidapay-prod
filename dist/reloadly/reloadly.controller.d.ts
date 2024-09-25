import { ReloadlyService } from "./reloadly.service";
import { ReloadlyDto } from "./dto/reloadly.dto";
import { NetworkOperatorsDto } from "./dto/network.operators.dto";
export declare class ReloadlyController {
    private readonly reloadlyService;
    private logger;
    constructor(reloadlyService: ReloadlyService);
    getAccountBalance(): Promise<any>;
    getAccessToken(): Promise<any>;
    listCountryList(): Promise<any>;
    findCountryByCode(fcbDto: ReloadlyDto): Promise<any>;
    getNetworkGenerator(gngDto: NetworkOperatorsDto): Promise<any>;
    findOperatorById(adoDto: NetworkOperatorsDto): Promise<any>;
    autoDetectOperator(adoDto: NetworkOperatorsDto): Promise<any>;
    getNetworkOperatorByCode(gnobcDto: NetworkOperatorsDto): Promise<any>;
}
