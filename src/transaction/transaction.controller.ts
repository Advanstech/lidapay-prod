import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MerchantAuthGuard } from '../auth/merchant-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery, ApiSecurity } from '@nestjs/swagger';
import { Transaction } from './schemas/transaction.schema';
import { UserOrMerchantGuard } from '../auth/user-or-merchant.guard';

@ApiTags('Transactions')
@Controller('api/v1/transactions')
@ApiBearerAuth()
@UseGuards(UserOrMerchantGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  // Create  a new transaction
  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'The transaction has been successfully created.', type: Transaction })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    type: CreateTransactionDto,
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
  })
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }
  // Get all transactions
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<{ transactions: Transaction[], total: number, totalPages: number }> {
    return this.transactionService.findAll(page, limit);
  }
  // Get a transaction by id
  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction by id' })
  @ApiParam({ name: 'id', type: 'string', description: 'Transaction ID', example: '616e7f7a0c2e4d001a6a1fc9' })
  @ApiResponse({ status: 200, description: 'Return the transaction.', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', type: 'string', description: 'Transaction ID' })
  async findOne(@Param('id') id: string): Promise<Transaction> {
    try {
      const transaction = await this.transactionService.findOne(id);
      return transaction;
    } catch (error) {
      throw new NotFoundException(`Transaction #${id} not found`);
    }
  }
  // Update  a transaction
  @Put('update/:id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiParam({ name: 'id', type: 'string', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'The transaction has been successfully updated.', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    type: UpdateTransactionDto,
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
  })
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.update(id, updateTransactionDto);
  }
  // Update a transaction by trxn
  @Put('update-by-trxn/:trxn')
  @ApiOperation({ summary: 'Update a transaction by trxn' })
  @ApiParam({ name: 'trxn', type: 'string', description: 'Transaction trxn' })
  @ApiResponse({ status: 200, description: 'The transaction has been successfully updated.', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    type: UpdateTransactionDto,
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
  })
  updateByTrxn(@Param('trxn') trxn: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionService.updateByTrxn(trxn, updateTransactionDto);
  }
  // Delete a transaction by id
  @Delete('remove/:id')
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({ name: 'id', type: 'string', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'The transaction has been successfully deleted.', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }
  // Get transaction by transaction id
  @UseGuards(JwtAuthGuard)
  @Get(':transId')
  @ApiOperation({ summary: 'Get a transaction by transaction Id' })
  @ApiParam({ name: 'transId', type: 'string', description: 'Transaction ID', example: '1234567890' })
  @ApiResponse({ status: 200, description: 'The transaction has been successfully retrieved.', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  async getTransactionsByTransactionId(@Param('transactionId') transactionId: string) {
    return this.transactionService.findByTransId(transactionId);
  }
  // Get transactions by type
  @Get('type/:type')
  @ApiOperation({ summary: 'Get transactions by type' })
  @ApiParam({ name: 'type', type: 'string', description: 'Transaction type (e.g., airtime, momo)' })
  @ApiResponse({ status: 200, description: 'Return transactions of the specified type.', type: [Transaction] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByType(@Param('type') type: string): Promise<Transaction[]> {
    return this.transactionService.findByType(type);
  }

  // Get transactions by status
  @Get('status/:status')
  @ApiOperation({ summary: 'Get transactions by status' })
  @ApiParam({ name: 'status', type: 'string', description: 'Transaction status (e.g., pending, completed, failed)' })
  @ApiResponse({ status: 200, description: 'Return transactions with the specified status.', type: [Transaction] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByStatus(@Param('status') status: string): Promise<Transaction[]> {
    return this.transactionService.findByStatus(status);
  }

  // Get transactions by date range
  @Get('date-range')
  @ApiOperation({ summary: 'Get transactions by date range' })
  @ApiQuery({ name: 'startDate', type: 'string', description: 'Start date (YYYY-MM-DD)', example: '2022-01-01' })
  @ApiQuery({ name: 'endDate', type: 'string', description: 'End date (YYYY-MM-DD)', example: '2022-01-31' })
  @ApiResponse({ status: 200, description: 'Return transactions within the specified date range.', type: [Transaction] })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<Transaction[]> {
    return this.transactionService.findByDateRange(new Date(startDate), new Date(endDate));
  }
  // Get transaction statistics for a user
  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get transaction statistics for a user' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactionStats(@Param('userId') userId: string): Promise<any> {
    return this.transactionService.getTransactionStats(userId);
  }
  // Get transactions by user id with pagination
  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get transactions by user id with pagination' })
  @ApiParam({ name: 'userId', type: 'string', description: 'User ID' })
  @ApiQuery({ name: 'page', type: 'number', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: 'Number of transactions per page' })
  @ApiResponse({
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
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByUserId(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    return this.transactionService.findByUserId(userId, page, limit);
  }


}
