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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transaction_service_1 = require("./transaction.service");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const update_transaction_dto_1 = require("./dto/update-transaction.dto");
const transaction_schema_1 = require("./schemas/transaction.schema");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const user_or_merchant_guard_1 = require("../auth/user-or-merchant.guard");
let TransactionController = class TransactionController {
    constructor(transactionService) {
        this.transactionService = transactionService;
    }
    create(createTransactionDto) {
        return this.transactionService.create(createTransactionDto);
    }
    findAll(page = 1, limit = 10) {
        return this.transactionService.findAll(page, limit);
    }
    async findOne(id) {
        const transaction = await this.transactionService.findById(id);
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction #${id} not found`);
        }
        return transaction;
    }
    updateByTrxn(trxn, updateTransactionDto) {
        return this.transactionService.updateByTrxn(trxn, updateTransactionDto);
    }
    updateByTransId(transId, trxn, updateTransactionDto) {
        return this.transactionService.updateByTransId(transId, updateTransactionDto);
    }
    deleteByTransIdTrxn(trxn) {
        return this.transactionService.removeByTrxn(trxn);
    }
    findByUserId(userId, page = 1, limit = 10) {
        return this.transactionService.findByUserId(userId, page, limit);
    }
    getTransactionStats(userId) {
        return this.transactionService.getTransactionStats(userId);
    }
    findByDateRange(startDate, endDate) {
        return this.transactionService.findByDateRange(new Date(startDate), new Date(endDate));
    }
    remove(id) {
        return this.transactionService.remove(id);
    }
    async findByTransId(transId) {
        const transaction = await this.transactionService.findByTransId(transId);
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction with ID ${transId} not found`);
        }
        return transaction;
    }
    async findByTrxn(trxn) {
        const transaction = await this.transactionService.findByTrxn(trxn);
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction with reference ${trxn} not found`);
        }
        return transaction;
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Post)('create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new transaction' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Transaction created successfully.',
        type: transaction_schema_1.Transaction
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({
        type: create_transaction_dto_1.CreateTransactionDto,
        description: 'Transaction creation data',
        examples: {
            airtime: {
                value: {
                    userId: '123456',
                    userName: 'John Doe',
                    transType: 'AIRTIME',
                    transId: 'TRX-123456',
                    recipientNumber: '233241234567',
                    operator: 'MTN',
                    network: '1',
                    retailer: 'PRYMO',
                    monetary: {
                        amount: 10,
                        fee: 0,
                        currency: 'GHS',
                        originalAmount: '10'
                    },
                    status: {
                        transaction: 'pending',
                        service: 'pending'
                    }
                }
            },
            momo: {
                value: {
                    userId: '789012',
                    userName: 'Jane Smith',
                    transType: 'MOMO',
                    transId: 'TRX-789012',
                    recipientNumber: '233501234567',
                    operator: 'Vodafone',
                    network: '2',
                    retailer: 'EXPRESSPAY',
                    monetary: {
                        amount: 50,
                        fee: 1,
                        currency: 'GHS',
                        originalAmount: '50'
                    },
                    status: {
                        transaction: 'pending',
                        service: 'pending'
                    },
                    payment: {
                        type: 'DEBIT',
                        currency: 'GHS'
                    }
                }
            }
        }
    }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: 'number', required: false, description: 'Items per page (default: 10)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns paginated transactions',
        schema: {
            type: 'object',
            properties: {
                transactions: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Transaction' }
                },
                total: { type: 'number' },
                totalPages: { type: 'number' }
            }
        }
    }),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Transaction ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: transaction_schema_1.Transaction }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('update/trxn-id:trxn'),
    (0, swagger_1.ApiOperation)({ summary: 'Update transaction by transaction ID' }),
    (0, swagger_1.ApiParam)({ name: 'trxn', description: 'Transaction ID' }),
    (0, swagger_1.ApiBody)({
        type: update_transaction_dto_1.UpdateTransactionDto,
        description: 'Transaction update data',
        examples: {
            success: {
                value: {
                    status: {
                        transaction: 'completed',
                        service: 'completed'
                    },
                    monetary: {
                        balance_before: '100',
                        balance_after: '90',
                        currentBalance: '90'
                    },
                    commentary: 'Transaction completed successfully'
                }
            },
            failed: {
                value: {
                    status: {
                        transaction: 'failed',
                        service: 'failed'
                    },
                    payment: {
                        status: 'failed',
                        serviceMessage: 'Insufficient balance'
                    },
                    commentary: 'Transaction failed due to insufficient balance'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, type: transaction_schema_1.Transaction }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('trxn')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_transaction_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "updateByTrxn", null);
__decorate([
    (0, common_1.Put)('update/trans-id/:transId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update transaction by transaction ID and TransId' }),
    (0, swagger_1.ApiParam)({ name: 'transId', description: 'Transaction ID' }),
    (0, swagger_1.ApiParam)({ name: 'trxn', description: 'Transaction ID' }),
    (0, swagger_1.ApiBody)({
        type: update_transaction_dto_1.UpdateTransactionDto,
        description: 'Transaction update data',
        examples: {
            success: {
                value: {
                    status: {
                        transaction: 'completed',
                        service: 'completed'
                    },
                    monetary: {
                        balance_before: '100',
                        balance_after: '90',
                        currentBalance: '90'
                    },
                    commentary: 'Transaction completed successfully'
                }
            },
            failed: {
                value: {
                    status: {
                        transaction: 'failed',
                        service: 'failed'
                    },
                    payment: {
                        status: 'failed',
                        serviceMessage: 'Insufficient balance'
                    },
                    commentary: 'Transaction failed due to insufficient balance'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, type: transaction_schema_1.Transaction }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('transId')),
    __param(1, (0, common_1.Param)('trxn')),
    __param(2, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_transaction_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "updateByTransId", null);
__decorate([
    (0, common_1.Delete)('delete/:trxn'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete transaction by transaction ID and TransId and Trxn' }),
    (0, swagger_1.ApiParam)({ name: 'transId', description: 'Transaction ID' }),
    (0, swagger_1.ApiParam)({ name: 'trxn', description: 'Transaction ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: transaction_schema_1.Transaction }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('trxn')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "deleteByTransIdTrxn", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions by user ID with pagination' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: 'number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: 'number', required: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns user transactions with pagination',
        schema: {
            type: 'object',
            properties: {
                transactions: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Transaction' }
                },
                total: { type: 'number' },
                totalPages: { type: 'number' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Get)('stats/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction statistics for a user' }),
    (0, swagger_1.ApiParam)({ name: 'userId', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns transaction statistics',
        schema: {
            type: 'object',
            properties: {
                _id: {
                    type: 'object',
                    properties: {
                        transType: { type: 'string' },
                        status: { type: 'string' }
                    }
                },
                count: { type: 'number' },
                totalAmount: { type: 'number' },
                avgAmount: { type: 'number' },
                minAmount: { type: 'number' },
                maxAmount: { type: 'number' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "getTransactionStats", null);
__decorate([
    (0, common_1.Get)('date-range'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions by date range' }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: true,
        type: String,
        description: 'Start date (YYYY-MM-DD)'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: true,
        type: String,
        description: 'End date (YYYY-MM-DD)'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        type: [transaction_schema_1.Transaction],
        description: 'Returns transactions within date range'
    }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "findByDateRange", null);
__decorate([
    (0, common_1.Delete)('remove/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete transaction' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Transaction ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Transaction deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                deletedTransaction: { $ref: '#/components/schemas/Transaction' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('trans-id/:transId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by transaction ID' }),
    (0, swagger_1.ApiParam)({ name: 'transId', description: 'Transaction ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: transaction_schema_1.Transaction }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('transId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findByTransId", null);
__decorate([
    (0, common_1.Get)('trans-trxn/:trxn'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by transaction reference' }),
    (0, swagger_1.ApiParam)({ name: 'trxn', description: 'Transaction reference' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: transaction_schema_1.Transaction }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('trxn')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findByTrxn", null);
exports.TransactionController = TransactionController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, common_1.Controller)('api/v1/transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(user_or_merchant_guard_1.UserOrMerchantGuard),
    __metadata("design:paramtypes", [transaction_service_1.TransactionService])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map