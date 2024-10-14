import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { GeneratorUtil } from 'src/utilities/generator.util';

@Injectable()
export class TransactionService {
  private logger = new Logger(TransactionService.name);

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) { }

  /**
   * Creates a new transaction in the database.
   *
   * @param createTransactionDto The data transfer object containing the transaction details.
   * @returns A promise that resolves to the newly created transaction document.
   */
  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    // Ensure transactionId is generated if not provided
    if (!createTransactionDto.transactionId) {
      createTransactionDto.transactionId = this.generateUniqueTransactionId(); // Generate a unique transaction ID
    }
    return this.transactionModel.create(createTransactionDto);

    // Ensure transactionId is not null before inserting
    if (createTransactionDto.transactionId === null) {
      throw new Error('Transaction ID cannot be null');
    }

    // Check for existing transaction with the same transactionId
    const existingTransaction = await this.transactionModel.findOne({
      transactionId: createTransactionDto.transactionId,
    });
    if (existingTransaction) {
      throw new Error('Transaction with this ID already exists.');
    }

    // Proceed with the insert operation
    await this.transactionModel.create(createTransactionDto);
  }

  // Helper method to generate a unique transaction ID
  private generateUniqueTransactionId(): string {
    // Implement your logic to generate a unique transaction ID
    return `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // Example implementation
  }

  //find all transactions with pagination
  async findAll(
    page: number,
    limit: number,
  ): Promise<{
    transactions: Transaction[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    try {
      const transactions = await this.transactionModel
      .find()
      .skip(skip)
      .limit(limit)
      .exec();
    const total = await this.transactionModel.countDocuments();
    const totalPages = Math.ceil(total / limit);
    return { transactions, total, totalPages };
    } catch( error) {
      this.logger.error(`Failed to fetch transactions: ${error.message}`);
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    } 
   
  }

  //find one transaction
  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction #${id} not found`);
    }
    return transaction;
  }

  // Find by Transaction Id
  async findByTransId(transId: string): Promise<Transaction> {
    const transaction = await this.transactionModel.findOne({ transId }).exec();
    if (!transaction) {
      throw new NotFoundException(`Transaction #${transId} not found`);
    }
    return transaction;
  }

  //update transaction
  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const updatedTransaction = await this.transactionModel
      .findByIdAndUpdate(id, updateTransactionDto, { new: true })
      .exec();
    if (!updatedTransaction) {
      throw new NotFoundException(`Transaction #${id} not found`);
    }
    return updatedTransaction;
  }

  //update transaction by trxn
  async updateByTrxn(trxn: string, updateTransactionDto: UpdateTransactionDto) {
    const updatedTransaction = await this.transactionModel.findOneAndUpdate(
      { trxn: trxn }, // Use the 'trxn' field instead of '_id'
      { $set: updateTransactionDto },
      { new: true },
    );

    if (!updatedTransaction) {
      throw new NotFoundException(`Transaction with trxn ${trxn} not found`);
    }

    return updatedTransaction;
  }

  //delete transaction
  async remove(
    id: string,
  ): Promise<{ message: string; deletedTransaction: Transaction }> {
    const deletedTransaction = await this.transactionModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedTransaction) {
      throw new NotFoundException(`Transaction #${id} not found`);
    }
    return { message: 'Transaction deleted successfully', deletedTransaction };
  }

  //find transactions by user id
  async findByUserId(userId: string): Promise<Transaction[]> {
    return this.transactionModel.find({ userId }).exec();
  }

  //find transactions by type
  async findByType(type: string): Promise<Transaction[]> {
    return this.transactionModel.find({ transactionType: type }).exec();
  }

  //find transactions by status
  async findByStatus(status: string): Promise<Transaction[]> {
    return this.transactionModel.find({ status }).exec();
  }

  //get transaction stats
  async getTransactionStats(userId: string): Promise<any> {
    const stats = await this.transactionModel
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              transactionType: '$transactionType',
              status: '$status',
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' },
            minAmount: { $min: '$amount' },
            maxAmount: { $max: '$amount' },
          },
        },
        { $sort: { '_id.transactionType': 1, '_id.status': 1 } },
      ])
      .exec();
    return stats;
  }

  // Add a new method to find transactions by date range
  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Transaction[]> {
    return this.transactionModel
      .find({
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .exec();
  }

  // Add a new method to update transaction by id
  async updateById(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction | null> {
    return this.transactionModel
      .findByIdAndUpdate(id, updateTransactionDto, { new: true })
      .exec();
  }

  // Add a new method to delete all transaction
  async deleteAll(): Promise<void> {
    await this.transactionModel.deleteMany({});
  }
}
