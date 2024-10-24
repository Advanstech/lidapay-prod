import { HttpService } from '@nestjs/axios';
import { TransactionService } from 'src/transaction/transaction.service';
export declare class MobileMoneyService {
    private readonly httpService;
    private transactionService;
    private logger;
    private readonly psUrl;
    constructor(httpService: HttpService, transactionService: TransactionService);
    processTransaction(transData: any): Promise<any>;
    private saveOrUpdateTransaction;
    private handleError;
}
