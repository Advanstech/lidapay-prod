import { InternetDto } from './dto/internet.dto';
import { BundleListDto } from './dto/bundle-list.dto';
import { InternetService } from './internet.service';
export declare class InternetController {
    private internetService;
    private logger;
    constructor(internetService: InternetService);
    buyInternetData(bidDto: InternetDto, req: any): Promise<any>;
    listDataBundle(ldbDto: BundleListDto): Promise<any>;
}
