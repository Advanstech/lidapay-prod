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
        if (!createTransactionDto.transactionId) {
            createTransactionDto.transactionId = this.generateUniqueTransactionId();
        }
        return this.transactionModel.create(createTransactionDto);
        if (createTransactionDto.transactionId === null) {
            throw new Error('Transaction ID cannot be null');
        }
        const existingTransaction = await this.transactionModel.findOne({
            transactionId: createTransactionDto.transactionId,
        });
        if (existingTransaction) {
            throw new Error('Transaction with this ID already exists.');
        }
        await this.transactionModel.create(createTransactionDto);
    }
    async findAll(page, limit) {
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
        }
        catch (error) {
            this.logger.error(`Failed to fetch transactions: ${error.message}`);
            throw new Error(`Failed to fetch transactions: ${error.message}`);
        }
    }
    async findOne(id) {
        const transaction = await this.transactionModel.findById(id).exec();
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction #${id} not found`);
        }
        return transaction;
    }
    async findByTransId(transId) {
        const transaction = await this.transactionModel.findOne({ transId }).exec();
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction #${transId} not found`);
        }
        return transaction;
    }
    async update(id, updateTransactionDto) {
        const updatedTransaction = await this.transactionModel
            .findByIdAndUpdate(id, updateTransactionDto, { new: true })
            .exec();
        if (!updatedTransaction) {
            throw new common_1.NotFoundException(`Transaction #${id} not found`);
        }
        return updatedTransaction;
    }
    async updateByTrxn(trxn, updateTransactionDto) {
        const updatedTransaction = await this.transactionModel.findOneAndUpdate({ trxn: trxn }, { $set: updateTransactionDto }, { new: true });
        if (!updatedTransaction) {
            throw new common_1.NotFoundException(`Transaction with trxn ${trxn} not found`);
        }
        return updatedTransaction;
    }
    async updateByExpressToken(expressToken, updateTransactionDto) {
        const updatedTransaction = await this.transactionModel.findOneAndUpdate({ expressToken: expressToken }, { $set: updateTransactionDto }, { new: true });
        if (!updatedTransaction) {
            throw new common_1.NotFoundException(`Transaction with expressToken ${expressToken} not found`);
        }
        return updatedTransaction;
    }
    async remove(id) {
        const deletedTransaction = await this.transactionModel
            .findByIdAndDelete(id)
            .exec();
        if (!deletedTransaction) {
            throw new common_1.NotFoundException(`Transaction #${id} not found`);
        }
        return { message: 'Transaction deleted successfully', deletedTransaction };
    }
    async findByUserId(userId, page, limit) {
        const skip = (page - 1) * limit;
        const transactions = await this.transactionModel
            .find({ userId })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.transactionModel.countDocuments({ userId });
        const totalPages = Math.ceil(total / limit);
        return { transactions, total, totalPages };
    }
    async findByType(type) {
        return this.transactionModel.find({ transactionType: type }).exec();
    }
    async findByStatus(status) {
        return this.transactionModel.find({ status }).exec();
    }
    async getTransactionStats(userId) {
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
    async findByDateRange(startDate, endDate) {
        return this.transactionModel
            .find({
            createdAt: { $gte: startDate, $lte: endDate },
        })
            .exec();
    }
    async updateById(id, updateTransactionDto) {
        return this.transactionModel
            .findByIdAndUpdate(id, updateTransactionDto, { new: true })
            .exec();
    }
    async deleteAll() {
        await this.transactionModel.deleteMany({});
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