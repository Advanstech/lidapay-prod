import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
export declare class TransactionService {
    private transactionModel;
    private readonly logger;
    constructor(transactionModel: Model<TransactionDocument>);
    create(createTransactionDto: CreateTransactionDto): Promise<Transaction>;
    findAll(page: number, limit: number): Promise<{
        transactions: Transaction[];
        total: number;
        totalPages: number;
    }>;
    updateByTransId(transId: string, updateData: UpdateTransactionDto): Promise<Transaction>;
    updateByTrxn(trxn: string, updateDto: UpdateTransactionDto): Promise<Transaction>;
    updateByTokenOrExpressToken(identifier: string, updateData: UpdateTransactionDto): Promise<Transaction>;
    findById(id: string): Promise<Transaction>;
    findByTransId(transId: string): Promise<Transaction | null>;
    findByUserId(userId: string, page: number, limit: number): Promise<{
        transactions: Transaction[];
        total: number;
        totalPages: number;
    }>;
    findByTrxn(trxn: string): Promise<Transaction | null>;
    getTransactionStats(userId: string): Promise<any>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
    remove(id: string): Promise<{
        message: string;
        deletedTransaction: Transaction;
    }>;
    removeByTrxn(trxn: string): Promise<{
        message: string;
    }>;
    private handleTransactionDeletion;
    private updateUserTransactionStats;
    private cleanupTransactionMetadata;
    private transformCreateDto;
    private transformUpdateDto;
    private hasMonetaryFields;
    private hasStatusFields;
    private hasPaymentFields;
    private generateUniqueTransactionId;
}
