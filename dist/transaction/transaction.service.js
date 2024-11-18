"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TransactionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const transaction_schema_1 = require("./schemas/transaction.schema");
let TransactionService = TransactionService_1 = class TransactionService {
    constructor(transactionModel) {
        this.transactionModel = transactionModel;
        this.logger = new common_1.Logger(TransactionService_1.name);
    }
    async create(createTransactionDto) {
        try {
            this.logger.debug(`Incoming DTO: ${JSON.stringify(createTransactionDto)}`);
            if (!createTransactionDto.transId) {
                createTransactionDto.transId = this.generateUniqueTransactionId();
            }
            const existingTransaction = await this.transactionModel.findOne({
                transId: createTransactionDto.transId,
            });
            if (existingTransaction) {
                throw new Error('Transaction with this ID already exists.');
            }
            const transformedDto = this.transformCreateDto(createTransactionDto);
            this.logger.debug(`Transformed DTO: ${JSON.stringify(transformedDto)}`);
            const transaction = await this.transactionModel.create(transformedDto);
            this.logger.debug(`Created transaction: ${transaction.transId}`);
            return transaction;
        }
        catch (error) {
            this.logger.error(`Failed to create transaction: ${error.message}`);
            this.logger.error(`Error details: ${JSON.stringify(error)}`);
            throw error;
        }
    }
    async findAll(page, limit) {
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
        }
        catch (error) {
            this.logger.error(`Failed to fetch transactions: ${error.message}`);
            throw error;
        }
    }
    async updateByTransId(transId, updateData) {
        try {
            const updatedTransaction = await this.transactionModel.findOneAndUpdate({ transId: transId }, updateData, { new: true });
            if (!updatedTransaction) {
                throw new common_1.NotFoundException(`Transaction with ID ${transId} not found`);
            }
            return updatedTransaction;
        }
        catch (error) {
            this.logger.error(`Failed to update transaction: ${error.message}`);
            throw error;
        }
    }
    async updateByTrxn(trxn, updateDto) {
        try {
            const transformedUpdate = this.transformUpdateDto(updateDto);
            const updatedTransaction = await this.transactionModel.findOneAndUpdate({ trxn: String(trxn) }, { $set: transformedUpdate }, { new: true });
            if (!updatedTransaction) {
                throw new common_1.NotFoundException(`Transaction with ID ${trxn} not found`);
            }
            this.logger.debug(`Updated transaction: ${trxn}`);
            return updatedTransaction;
        }
        catch (error) {
            this.logger.error(`Failed to update transaction ${trxn}: ${error.message}`);
            throw error;
        }
    }
    async updateByTokenOrExpressToken(identifier, updateData) {
        try {
            const updatedTransaction = await this.transactionModel.findOneAndUpdate({ $or: [{ expressToken: identifier }, { token: identifier }] }, { $set: updateData }, { new: true });
            if (!updatedTransaction) {
                throw new common_1.NotFoundException(`Transaction with identifier ${identifier} not found`);
            }
            this.logger.debug(`Updated transaction with identifier: ${identifier}`);
            return updatedTransaction;
        }
        catch (error) {
            this.logger.error(`Failed to update transaction with identifier ${identifier}: ${error.message}`);
            throw error;
        }
    }
    async findById(id) {
        try {
            const transaction = await this.transactionModel.findById(id);
            if (!transaction) {
                throw new common_1.NotFoundException(`Transaction with ID ${id} not found`);
            }
            return transaction;
        }
        catch (error) {
            this.logger.error(`Failed to find transaction with ID ${id}: ${error.message}`);
            throw error;
        }
    }
    async findByTransId(transId) {
        try {
            const transaction = await this.transactionModel.findOne({ 'transId': transId }).exec();
            if (!transaction) {
                this.logger.warn(`Transaction with ID ${transId} not found`);
            }
            return transaction;
        }
        catch (error) {
            this.logger.error(`Failed to find transaction by ID ${transId}: ${error.message}`);
            throw error;
        }
    }
    async findByUserId(userId, page, limit) {
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
    async findByTrxn(trxn) {
        try {
            const transaction = await this.transactionModel.findOne({ 'trxn': trxn }).exec();
            if (!transaction) {
                this.logger.warn(`Transaction with ID ${trxn} not found`);
            }
            return transaction;
        }
        catch (error) {
            this.logger.error(`Failed to find transaction by ID ${trxn}: ${error.message}`);
            throw error;
        }
    }
    async getTransactionStats(userId) {
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
    async findByDateRange(startDate, endDate) {
        try {
            this.logger.debug(`Fetching transactions between ${startDate} and ${endDate}`);
            const transactions = await this.transactionModel
                .find({
                timestamp: {
                    $gte: startDate,
                    $lte: new Date(endDate.setHours(23, 59, 59, 999))
                }
            })
                .sort({ timestamp: -1 })
                .exec();
            this.logger.debug(`Found ${transactions.length} transactions in date range`);
            return transactions;
        }
        catch (error) {
            this.logger.error(`Failed to fetch transactions by date range: ${error.message}`);
            throw error;
        }
    }
    async remove(id) {
        try {
            const deletedTransaction = await this.transactionModel
                .findByIdAndDelete(id)
                .exec();
            if (!deletedTransaction) {
                this.logger.warn(`Transaction ${id} not found for deletion`);
                throw new common_1.NotFoundException(`Transaction #${id} not found`);
            }
            this.logger.debug(`Successfully deleted transaction ${id}`);
            await this.handleTransactionDeletion(deletedTransaction);
            return {
                message: 'Transaction deleted successfully',
                deletedTransaction
            };
        }
        catch (error) {
            this.logger.error(`Failed to delete transaction ${id}: ${error.message}`);
            throw error;
        }
    }
    async removeByTrxn(trxn) {
        try {
            const deletedTransaction = await this.transactionModel
                .findOneAndDelete({ trxn })
                .exec();
            if (!deletedTransaction) {
                this.logger.warn(`Transaction ${trxn} not found for deletion`);
                throw new common_1.NotFoundException(`Transaction #${trxn} not found`);
            }
            this.logger.debug(`Successfully deleted transaction ${trxn}`);
            return {
                message: 'Transaction deleted successfully'
            };
        }
        catch (error) {
            this.logger.error(`Failed to delete transaction ${trxn}: ${error.message}`);
            throw error;
        }
    }
    async handleTransactionDeletion(transaction) {
        try {
            if (transaction.userId) {
                await this.updateUserTransactionStats(transaction.userId);
            }
            if (transaction.metadata && transaction.metadata.length > 0) {
                await this.cleanupTransactionMetadata(transaction.metadata);
            }
        }
        catch (error) {
            this.logger.warn(`Cleanup after transaction deletion failed: ${error.message}`);
        }
    }
    async updateUserTransactionStats(userId) {
        try {
            const stats = await this.getTransactionStats(userId);
            this.logger.debug(`Updated transaction stats for user ${userId}`);
        }
        catch (error) {
            this.logger.warn(`Failed to update user transaction stats: ${error.message}`);
        }
    }
    async cleanupTransactionMetadata(metadata) {
        try {
            this.logger.debug(`Cleaned up metadata for ${metadata.length} entries`);
        }
        catch (error) {
            this.logger.warn(`Failed to cleanup transaction metadata: ${error.message}`);
        }
    }
    transformCreateDto(dto) {
        const amount = parseFloat(dto.monetary.amount.toString());
        if (isNaN(amount)) {
            throw new Error('Invalid amount provided');
        }
        return {
            ...dto,
            monetary: {
                amount: amount,
                fee: dto.monetary.fee || 0,
                originalAmount: dto.monetary.originalAmount,
                currency: dto.monetary.currency || 'GHS',
                balance_before: dto.monetary.balance_before,
                balance_after: dto.monetary.balance_after,
                currentBalance: dto.monetary.currentBalance,
                deliveredAmount: dto.monetary.deliveredAmount,
                requestedAmount: dto.monetary.requestedAmount,
                discount: dto.monetary.discount
            },
            status: {
                transaction: dto.status.transaction || 'pending',
                service: dto.status.service || 'pending',
                payment: dto.status.payment
            },
            payment: dto.payment ? {
                type: dto.payment.type,
                currency: dto.payment.currency,
                commentary: dto.payment.commentary,
                status: dto.payment.status,
                serviceCode: dto.payment.serviceCode,
                transactionId: dto.payment.transactionId,
                serviceMessage: dto.payment.serviceMessage,
                operatorTransactionId: dto.payment.operatorTransactionId
            } : undefined
        };
    }
    transformUpdateDto(dto) {
        const update = {};
        if (this.hasMonetaryFields(dto)) {
            update['monetary'] = {};
            ['amount', 'fee', 'originalAmount', 'currency', 'balance_before', 'balance_after', 'currentBalance', 'deliveredAmount', 'requestedAmount', 'discount']
                .forEach(field => {
                if (dto[field] !== undefined) {
                    update.monetary[field] = dto[field];
                }
            });
        }
        if (this.hasStatusFields(dto)) {
            update['status'] = {};
            if (dto.status?.transaction)
                update.status.transaction = dto.status.transaction;
            if (dto.status?.service)
                update.status.service = dto.status.service;
            if (dto.status?.payment)
                update.status.payment = dto.status.payment;
        }
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
                operatorTransactionId: 'paymentOperatorTransactionId'
            };
            Object.entries(paymentFields).forEach(([key, dtoKey]) => {
                if (dto[dtoKey] !== undefined) {
                    update.payment[key] = dto[dtoKey];
                }
            });
        }
        if (dto.metadata) {
            if (Array.isArray(dto.metadata)) {
                update.metadata = dto.metadata;
            }
            else {
                update.$push = { metadata: { ...dto.metadata, lastQueryAt: new Date() } };
            }
        }
        ['commentary', 'operator', 'network', 'retailer', 'expressToken', 'queryLastChecked']
            .forEach(field => {
            if (dto[field] !== undefined) {
                update[field] = dto[field];
            }
        });
        return update;
    }
    hasMonetaryFields(dto) {
        return ['amount', 'fee', 'originalAmount', 'currency', 'balance_before', 'balance_after', 'currentBalance', 'deliveredAmount', 'requestedAmount', 'discount']
            .some(field => dto[field] !== undefined);
    }
    hasStatusFields(dto) {
        return ['transStatus', 'serviceStatus', 'paymentStatus']
            .some(field => dto[field] !== undefined);
    }
    hasPaymentFields(dto) {
        return ['paymentCurrency', 'paymentCommentary', 'paymentStatus', 'paymentServiceCode', 'paymentTransactionId', 'paymentOperatorTransactionId']
            .some(field => dto[field] !== undefined);
    }
    generateUniqueTransactionId() {
        return `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = TransactionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map