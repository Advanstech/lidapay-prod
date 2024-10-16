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
const transaction_service_1 = require("./transaction.service");
const create_transaction_dto_1 = require("./dto/create-transaction.dto");
const update_transaction_dto_1 = require("./dto/update-transaction.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
const transaction_schema_1 = require("./schemas/transaction.schema");
const user_or_merchant_guard_1 = require("../auth/user-or-merchant.guard");
let TransactionController = class TransactionController {
    constructor(transactionService) {
        this.transactionService = transactionService;
    }
    create(createTransactionDto) {
        return this.transactionService.create(createTransactionDto);
    }
    async findAll(page = 1, limit = 10) {
        return this.transactionService.findAll(page, limit);
    }
    async findOne(id) {
        try {
            const transaction = await this.transactionService.findOne(id);
            return transaction;
        }
        catch (error) {
            throw new common_1.NotFoundException(`Transaction #${id} not found`);
        }
    }
    update(id, updateTransactionDto) {
        return this.transactionService.update(id, updateTransactionDto);
    }
    updateByTrxn(trxn, updateTransactionDto) {
        return this.transactionService.updateByTrxn(trxn, updateTransactionDto);
    }
    remove(id) {
        return this.transactionService.remove(id);
    }
    async getTransactionsByTransactionId(transactionId) {
        return this.transactionService.findByTransId(transactionId);
    }
    async findByType(type) {
        return this.transactionService.findByType(type);
    }
    async findByStatus(status) {
        return this.transactionService.findByStatus(status);
    }
    async findByDateRange(startDate, endDate) {
        return this.transactionService.findByDateRange(new Date(startDate), new Date(endDate));
    }
    async getTransactionStats(userId) {
        return this.transactionService.getTransactionStats(userId);
    }
    async findByUserId(userId, page = 1, limit = 10) {
        return this.transactionService.findByUserId(userId, page, limit);
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new transaction' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The transaction has been successfully created.', type: transaction_schema_1.Transaction }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({
        type: create_transaction_dto_1.CreateTransactionDto,
        description: 'Transaction data',
        examples: {
            airtime: {
                value: {
                    userId: '123456',
                    transType: 'airtime',
                    amount: 10,
                    currency: 'GHS',
                    transStatus: 'pending',
                    serviceStatus: 'pending',
                    transactionId: 'TRX123456',
                    operator: 'MTN',
                    recipientNumber: '233241234567'
                }
            },
            momo: {
                value: {
                    userId: '789012',
                    transType: 'momo',
                    amount: 50,
                    currency: 'GHS',
                    transStatus: 'pending',
                    serviceStatus: 'pending',
                    transactionId: 'TRX789012',
                    operator: 'Vodafone',
                    recipientNumber: '233501234567',
                    momoTransType: 'send'
                }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all transactions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return all transactions.',
        example: {
            "transactions": [
                {
                    "id": "616e7f7a0c2e4d001a6a1fc9",
                    "userId": "616e7f7a0c2e4d001a6a1fc9",
                    "transType": "airtime",
                    "amount": 10,
                    "currency": "GHS",
                    "transStatus": "pending",
                    "serviceStatus": "pending",
                    "transactionId": "TRX123456",
                    "operator": "MTN",
                    "recipientNumber": "233241234567",
                    "createdAt": "2021-10-14T14:30:00.000Z",
                    "updatedAt": "2021-10-14T14:30:00.000Z"
                }
            ],
            "total": 50,
            "totalPages": 5
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: 'number', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: 'number', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a transaction by id' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Transaction ID', example: '616e7f7a0c2e4d001a6a1fc9' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the transaction.', type: transaction_schema_1.Transaction }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Transaction ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('update/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a transaction' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Transaction ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The transaction has been successfully updated.', type: transaction_schema_1.Transaction }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({
        type: update_transaction_dto_1.UpdateTransactionDto,
        description: 'Updated transaction data',
        examples: {
            completed: {
                value: {
                    transStatus: 'completed',
                    serviceStatus: 'completed',
                    transMessage: 'Transaction successful'
                }
            },
            failed: {
                value: {
                    transStatus: 'failed',
                    serviceStatus: 'failed',
                    transMessage: 'Insufficient balance'
                }
            }
        }
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_transaction_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "update", null);
__decorate([
    (0, common_1.Put)('update-by-trxn/:trxn'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a transaction by trxn' }),
    (0, swagger_1.ApiParam)({ name: 'trxn', type: 'string', description: 'Transaction trxn' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The transaction has been successfully updated.', type: transaction_schema_1.Transaction }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiBody)({
        type: update_transaction_dto_1.UpdateTransactionDto,
        description: 'Updated transaction data',
        examples: {
            completed: {
                value: {
                    transStatus: 'completed',
                    serviceStatus: 'completed',
                    transMessage: 'Transaction successful'
                }
            },
        }
    }),
    __param(0, (0, common_1.Param)('trxn')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_transaction_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "updateByTrxn", null);
__decorate([
    (0, common_1.Delete)('remove/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a transaction' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', description: 'Transaction ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The transaction has been successfully deleted.', type: transaction_schema_1.Transaction }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':transId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a transaction by transaction Id' }),
    (0, swagger_1.ApiParam)({ name: 'transId', type: 'string', description: 'Transaction ID', example: '1234567890' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The transaction has been successfully retrieved.', type: transaction_schema_1.Transaction }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found.' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionsByTransactionId", null);
__decorate([
    (0, common_1.Get)('type/:type'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions by type' }),
    (0, swagger_1.ApiParam)({ name: 'type', type: 'string', description: 'Transaction type (e.g., airtime, momo)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return transactions of the specified type.', type: [transaction_schema_1.Transaction] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findByType", null);
__decorate([
    (0, common_1.Get)('status/:status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions by status' }),
    (0, swagger_1.ApiParam)({ name: 'status', type: 'string', description: 'Transaction status (e.g., pending, completed, failed)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return transactions with the specified status.', type: [transaction_schema_1.Transaction] }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findByStatus", null);
__decorate([
    (0, common_1.Get)('date-range'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions by date range' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', type: 'string', description: 'Start date (YYYY-MM-DD)', example: '2022-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', type: 'string', description: 'End date (YYYY-MM-DD)', example: '2022-01-31' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return transactions within the specified date range.', type: [transaction_schema_1.Transaction] }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid date format' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findByDateRange", null);
__decorate([
    (0, common_1.Get)('stats/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction statistics for a user' }),
    (0, swagger_1.ApiParam)({ name: 'userId', type: 'string', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200, description: 'Return transaction statistics for the user.', schema: {
            type: 'object',
            properties: {
                totalTransactions: { type: 'number' },
                totalAmount: { type: 'number' },
                transactionsByType: {
                    type: 'object',
                    additionalProperties: { type: 'number' }
                },
                transactionsByStatus: {
                    type: 'object',
                    additionalProperties: { type: 'number' }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransactionStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transactions by user id with pagination' }),
    (0, swagger_1.ApiParam)({ name: 'userId', type: 'string', description: 'User ID' }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: 'number', required: false, description: 'Page number' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: 'number', required: false, description: 'Number of transactions per page' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return transactions for the user with pagination.',
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
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "findByUserId", null);
exports.TransactionController = TransactionController = __decorate([
    (0, swagger_1.ApiTags)('Transactions'),
    (0, common_1.Controller)('api/v1/transactions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(user_or_merchant_guard_1.UserOrMerchantGuard),
    __metadata("design:paramtypes", [transaction_service_1.TransactionService])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map