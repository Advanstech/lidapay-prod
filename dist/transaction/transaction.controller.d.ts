import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './schemas/transaction.schema';
export declare class TransactionController {
    private readonly transactionService;
    constructor(transactionService: TransactionService);
    create(createTransactionDto: CreateTransactionDto): Promise<Transaction>;
    findAll(page?: number, limit?: number): Promise<{
        transactions: Transaction[];
        total: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Transaction>;
    updateByTrxn(trxn: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction>;
    updateByTransId(transId: string, trxn: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction>;
    deleteByTransIdTrxn(trxn: string): Promise<{
        message: string;
    }>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<{
        transactions: Transaction[];
        total: number;
        totalPages: number;
    }>;
    getTransactionStats(userId: string): Promise<any>;
    findByDateRange(startDate: string, endDate: string): Promise<Transaction[]>;
    remove(id: string): Promise<{
        message: string;
        deletedTransaction: Transaction;
    }>;
    findByTransId(transId: string): Promise<Transaction>;
    findByTrxn(trxn: string): Promise<Transaction>;
}
