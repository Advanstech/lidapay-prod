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
    update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction>;
    updateByTrxn(trxn: string, updateTransactionDto: UpdateTransactionDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/transaction.schema").TransactionDocument> & Transaction & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v?: number;
    }>;
    remove(id: string): Promise<{
        message: string;
        deletedTransaction: Transaction;
    }>;
    getTransactionsByTransactionId(transactionId: string): Promise<Transaction>;
    findByUserId(userId: string): Promise<Transaction[]>;
    findByType(type: string): Promise<Transaction[]>;
    findByStatus(status: string): Promise<Transaction[]>;
    findByDateRange(startDate: string, endDate: string): Promise<Transaction[]>;
    getTransactionStats(userId: string): Promise<any>;
}
