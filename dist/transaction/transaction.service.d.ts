import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
export declare class TransactionService {
    private transactionModel;
    private logger;
    constructor(transactionModel: Model<TransactionDocument>);
    create(createTransactionDto: CreateTransactionDto): Promise<Transaction>;
    findAll(page: number, limit: number): Promise<{
        transactions: Transaction[];
        total: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Transaction>;
    findByTransId(transId: string): Promise<Transaction>;
    update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction>;
    updateByTrxn(trxn: string, updateTransactionDto: UpdateTransactionDto): Promise<import("mongoose").Document<unknown, {}, TransactionDocument> & Transaction & import("mongoose").Document<unknown, any, any> & Required<{
        _id: unknown;
    }> & {
        __v?: number;
    }>;
    remove(id: string): Promise<{
        message: string;
        deletedTransaction: Transaction;
    }>;
    findByUserId(userId: string, page: number, limit: number): Promise<{
        transactions: Transaction[];
        total: number;
        totalPages: number;
    }>;
    findByType(type: string): Promise<Transaction[]>;
    findByStatus(status: string): Promise<Transaction[]>;
    getTransactionStats(userId: string): Promise<any>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
    updateById(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction | null>;
    deleteAll(): Promise<void>;
    private generateUniqueTransactionId;
}
