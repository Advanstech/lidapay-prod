import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { GeneratorUtil } from 'src/utilities/generator.util';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) { }

  /**
   * Creates a new transaction in the database.
   */
  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    try {
      // Log the incoming DTO
      this.logger.debug(`Incoming DTO: ${JSON.stringify(createTransactionDto)}`);

      // Generate transaction ID if not provided
      if (!createTransactionDto.transId) {
        createTransactionDto.transId = this.generateUniqueTransactionId();
      }

      // Check for existing transaction
      const existingTransaction = await this.transactionModel.findOne({
        transId: createTransactionDto.transId,
      });

      if (existingTransaction) {
        throw new Error('Transaction with this ID already exists.');
      }

      // Transform DTO to match schema structure
      const transformedDto = this.transformCreateDto(createTransactionDto);

      // Log the transformed DTO to verify its structure
      this.logger.debug(`Transformed DTO: ${JSON.stringify(transformedDto)}`);

      const transaction = await this.transactionModel.create(transformedDto);
      this.logger.debug(`Created transaction: ${transaction.transId}`);
      return transaction;
    } catch (error) {
      this.logger.error(`Failed to create transaction: ${error.message}`);
      // Log the entire error object for more context
      this.logger.error(`Error details: ${JSON.stringify(error)}`);
      throw error;
    }
  }
  /**
   * Finds all transactions with pagination
   */
  async findAll(page: number, limit: number): Promise<{
    transactions: Transaction[];
    total: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const [transactions, total] = await Promise.all([
        this.transactionModel
          .find()
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.transactionModel.countDocuments()
      ]);

      return {
        transactions,
        total,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      this.logger.error(`Failed to fetch transactions: ${error.message}`);
      throw error;
    }
  }
  /**
 * Updates a transaction by transId
 */
  async updateByTransId(transId: string, updateData: UpdateTransactionDto): Promise<Transaction> {
    try {
      const updatedTransaction = await this.transactionModel.findOneAndUpdate(
        { transId: transId },
        updateData,
        { new: true }
      );

      if (!updatedTransaction) {
        throw new NotFoundException(`Transaction with ID ${transId} not found`);
      }

      return updatedTransaction;
    } catch (error) {
      this.logger.error(`Failed to update transaction: ${error.message}`);
      throw error;
    }
  }
  /**
   * Updates a transaction by trxn ID
   */
  async updateByTrxn(trxn: string, updateDto: UpdateTransactionDto): Promise<Transaction> {
    try {
      const transformedUpdate = this.transformUpdateDto(updateDto);

      const updatedTransaction = await this.transactionModel.findOneAndUpdate(
        { trxn: String(trxn) },
        { $set: transformedUpdate },
        { new: true }
      );

      if (!updatedTransaction) {
        throw new NotFoundException(`Transaction with ID ${trxn} not found`);
      }

      this.logger.debug(`Updated transaction: ${trxn}`);
      return updatedTransaction;
    } catch (error) {
      this.logger.error(`Failed to update transaction ${trxn}: ${error.message}`);
      throw error;
    }
  }
  /**
   * Updates a transaction by token or express token
   */
  async updateByTokenOrExpressToken(identifier: string, updateData: UpdateTransactionDto): Promise<Transaction> {
    try {
      const updatedTransaction = await this.transactionModel.findOneAndUpdate(
        { $or: [{ expressToken: identifier }, { token: identifier }] },
        { $set: updateData },
        { new: true }
      );

      if (!updatedTransaction) {
        throw new NotFoundException(`Transaction with identifier ${identifier} not found`);
      }

      this.logger.debug(`Updated transaction with identifier: ${identifier}`);
      return updatedTransaction;
    } catch (error) {
      this.logger.error(`Failed to update transaction with identifier ${identifier}: ${error.message}`);
      throw error;
    }
  }
  /**
  * Finds a transaction by ID
  */
  async findById(id: string): Promise<Transaction> {
    try {
      const transaction = await this.transactionModel.findById(id);
      if (!transaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }
      return transaction;
    } catch (error) {
      this.logger.error(`Failed to find transaction with ID ${id}: ${error.message}`);
      throw error;
    }
  }
  /**
  * Finds a transaction by transaction ID
 */
  async findByTransId(transId: string): Promise<Transaction | null> {
    try {
      const transaction = await this.transactionModel.findOne({ 'transId': transId }).exec();
      if (!transaction) {
        this.logger.warn(`Transaction with ID ${transId} not found`);
      }
      return transaction;
    } catch (error) {
      this.logger.error(`Failed to find transaction by ID ${transId}: ${error.message}`);
      throw error;
    }
  }
  /**
   * Finds transactions by user ID with pagination
   */
  async findByUserId(userId: string, page: number, limit: number): Promise<{
    transactions: Transaction[];
    total: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find({ userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.transactionModel.countDocuments({ userId })
    ]);

    return {
      transactions,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }
  // I want find by trxn
  async findByTrxn(trxn: string): Promise<Transaction | null> {
    try {
      const transaction = await this.transactionModel.findOne({ 'trxn': trxn }).exec();
      if (!transaction) {
        this.logger.warn(`Transaction with ID ${trxn} not found`);
      }
      return transaction;
    } catch (error) {
      this.logger.error(`Failed to find transaction by ID ${trxn}: ${error.message}`);
      throw error;
    }
  }
  /**
   * Gets transaction statistics for a user
   */
  async getTransactionStats(userId: string): Promise<any> {
    return this.transactionModel
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              transType: '$transType',
              status: '$status.transaction'
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$monetary.amount' },
            avgAmount: { $avg: '$monetary.amount' },
            minAmount: { $min: '$monetary.amount' },
            maxAmount: { $max: '$monetary.amount' }
          }
        },
        { $sort: { '_id.transType': 1, '_id.status': 1 } }
      ])
      .exec();
  }
  /**
   * Find transactions within a date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    try {
      this.logger.debug(`Fetching transactions between ${startDate} and ${endDate}`);

      const transactions = await this.transactionModel
        .find({
          timestamp: {
            $gte: startDate,
            $lte: new Date(endDate.setHours(23, 59, 59, 999)) // Include entire end date
          }
        })
        .sort({ timestamp: -1 })
        .exec();

      this.logger.debug(`Found ${transactions.length} transactions in date range`);
      return transactions;
    } catch (error) {
      this.logger.error(`Failed to fetch transactions by date range: ${error.message}`);
      throw error;
    }
  }
  /**
   * Remove a transaction by ID
   */
  async remove(id: string): Promise<{ message: string; deletedTransaction: Transaction }> {
    try {
      const deletedTransaction = await this.transactionModel
        .findByIdAndDelete(id)
        .exec();

      if (!deletedTransaction) {
        this.logger.warn(`Transaction ${id} not found for deletion`);
        throw new NotFoundException(`Transaction #${id} not found`);
      }

      this.logger.debug(`Successfully deleted transaction ${id}`);

      // Check for dependent records or perform additional cleanup if needed
      await this.handleTransactionDeletion(deletedTransaction);

      return {
        message: 'Transaction deleted successfully',
        deletedTransaction
      };
    } catch (error) {
      this.logger.error(`Failed to delete transaction ${id}: ${error.message}`);
      throw error;
    }
  }
  // Delete by trxn
  async removeByTrxn(trxn: string): Promise<{ message: string }> {
    try {
      const deletedTransaction = await this.transactionModel
        .findOneAndDelete({ trxn })
        .exec();
      if (!deletedTransaction) {
        this.logger.warn(`Transaction ${trxn} not found for deletion`);
        throw new NotFoundException(`Transaction #${trxn} not found`);
      }
      this.logger.debug(`Successfully deleted transaction ${trxn}`);
      return {
        message: 'Transaction deleted successfully'
      };
    } catch (error) {
      this.logger.error(`Failed to delete transaction ${trxn}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle any necessary cleanup after transaction deletion
   * This method can be extended based on your specific requirements
   */
  private async handleTransactionDeletion(transaction: Transaction): Promise<void> {
    try {
      // Example: Update related statistics
      if (transaction.userId) {
        await this.updateUserTransactionStats(transaction.userId);
      }

      // Example: Clean up related metadata
      if (transaction.metadata && transaction.metadata.length > 0) {
        await this.cleanupTransactionMetadata(transaction.metadata);
      }

      // Add more cleanup tasks as needed
    } catch (error) {
      this.logger.warn(`Cleanup after transaction deletion failed: ${error.message}`);
      // Decide whether to throw or just log the error based on your requirements
    }
  }
  /**
   * Update user transaction statistics after deletion
   */
  private async updateUserTransactionStats(userId: string): Promise<void> {
    try {
      const stats = await this.getTransactionStats(userId);
      // Implement any necessary updates based on the new stats
      this.logger.debug(`Updated transaction stats for user ${userId}`);
    } catch (error) {
      this.logger.warn(`Failed to update user transaction stats: ${error.message}`);
    }
  }
  /**
   * Clean up any related metadata
   */
  private async cleanupTransactionMetadata(metadata: any[]): Promise<void> {
    try {
      // Implement any necessary metadata cleanup
      // For example, removing related files, updating external services, etc.
      this.logger.debug(`Cleaned up metadata for ${metadata.length} entries`);
    } catch (error) {
      this.logger.warn(`Failed to cleanup transaction metadata: ${error.message}`);
    }
  }
  /**
   * Transforms flat DTO to nested schema structure
   */
  private transformCreateDto(dto: CreateTransactionDto): any {
    // Ensure amount is parsed as a number
    const amount = parseFloat(dto.monetary.amount.toString());
    if (isNaN(amount)) {
      throw new Error('Invalid amount provided');
    }

    return {
      ...dto,
      monetary: {
        amount: amount, // Include the parsed amount
        fee: dto.monetary.fee || 0, // Access fee from monetary
        originalAmount: dto.monetary.originalAmount, // Access originalAmount from monetary
        currency: dto.monetary.currency || 'GHS', // Access currency from monetary
        balance_before: dto.monetary.balance_before, // Access balance_before from monetary
        balance_after: dto.monetary.balance_after, // Access balance_after from monetary
        currentBalance: dto.monetary.currentBalance, // Access currentBalance from monetary
        deliveredAmount: dto.monetary.deliveredAmount, // New field
        requestedAmount: dto.monetary.requestedAmount, // New field
        discount: dto.monetary.discount // New field
      },
      status: {
        transaction: dto.status.transaction || 'pending', // Access transaction status
        service: dto.status.service || 'pending', // Access service status
        payment: dto.status.payment // Access payment status
      },
      payment: dto.payment ? {
        type: dto.payment.type,
        currency: dto.payment.currency,
        commentary: dto.payment.commentary,
        status: dto.payment.status,
        serviceCode: dto.payment.serviceCode,
        transactionId: dto.payment.transactionId,
        serviceMessage: dto.payment.serviceMessage,
        operatorTransactionId: dto.payment.operatorTransactionId // New field
      } : undefined
    };
  }
  /**
   * Transforms update DTO to nested schema structure
   */
  private transformUpdateDto(dto: any): any {
    const update: any = {};
    // Handle monetary updates
    if (this.hasMonetaryFields(dto)) {
      update['monetary'] = {};
      ['amount', 'fee', 'originalAmount', 'currency', 'balance_before', 'balance_after', 'currentBalance', 'deliveredAmount', 'requestedAmount', 'discount']
        .forEach(field => {
          if (dto[field] !== undefined) {
            update.monetary[field] = dto[field];
          }
        });
    }
    // Handle status updates
    if (this.hasStatusFields(dto)) {
      update['status'] = {};
      if (dto.status?.transaction) update.status.transaction = dto.status.transaction;
      if (dto.status?.service) update.status.service = dto.status.service;
      if (dto.status?.payment) update.status.payment = dto.status.payment;
    }
    // Handle payment updates
    if (this.hasPaymentFields(dto)) {
      update['payment'] = {};
      const paymentFields = {
        currency: 'paymentCurrency',
        commentary: 'paymentCommentary',
        status: 'paymentStatus',
        serviceCode: 'paymentServiceCode',
        transactionId: 'paymentTransactionId',
        serviceMessage: 'paymentServiceMessage',
        type: 'paymentType',
        operatorTransactionId: 'paymentOperatorTransactionId' // New field
      };

      Object.entries(paymentFields).forEach(([key, dtoKey]) => {
        if (dto[dtoKey] !== undefined) {
          update.payment[key] = dto[dtoKey];
        }
      });
    }
    // Handle metadata updates
    if (dto.metadata) {
      if (Array.isArray(dto.metadata)) {
        update.metadata = dto.metadata;
      } else {
        update.$push = { metadata: { ...dto.metadata, lastQueryAt: new Date() } };
      }
    }
    // Handle direct field updates
    ['commentary', 'operator', 'network', 'retailer', 'expressToken', 'queryLastChecked']
      .forEach(field => {
        if (dto[field] !== undefined) {
          update[field] = dto[field];
        }
      });

    return update;
  }
  // has monetary fields
  private hasMonetaryFields(dto: any): boolean {
    return ['amount', 'fee', 'originalAmount', 'currency', 'balance_before', 'balance_after', 'currentBalance', 'deliveredAmount', 'requestedAmount', 'discount']
      .some(field => dto[field] !== undefined);
  }
  private hasStatusFields(dto: any): boolean {
    return ['transStatus', 'serviceStatus', 'paymentStatus']
      .some(field => dto[field] !== undefined);
  }
  // has payment field
  private hasPaymentFields(dto: any): boolean {
    return ['paymentCurrency', 'paymentCommentary', 'paymentStatus', 'paymentServiceCode', 'paymentTransactionId', 'paymentOperatorTransactionId'] // New field
      .some(field => dto[field] !== undefined);
  }
  // generate uniqu transId
  private generateUniqueTransactionId(): string {
    return `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
