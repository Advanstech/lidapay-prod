import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  NotFoundException,
  ParseIntPipe,
  ValidationPipe
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './schemas/transaction.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserOrMerchantGuard } from '../auth/user-or-merchant.guard';

@ApiTags('Transactions')
@Controller('api/v1/transactions')
@ApiBearerAuth()
@UseGuards(UserOrMerchantGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @Post('create')
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully.',
    type: Transaction
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    type: CreateTransactionDto,
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
  })
  create(@Body(ValidationPipe) createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all transactions with pagination' })
  @ApiQuery({ name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: 'Items per page (default: 10)' })
  @ApiResponse({
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
  })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
  ) {
    return this.transactionService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id') id: string) {
    const transaction = await this.transactionService.findById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction #${id} not found`);
    }
    return transaction;
  }

  @Put('update/trxn-id:trxn')
  @ApiOperation({ summary: 'Update transaction by transaction ID' })
  @ApiParam({ name: 'trxn', description: 'Transaction ID' })
  @ApiBody({
    type: UpdateTransactionDto,
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
  })
  @ApiResponse({ status: 200, type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  updateByTrxn(
    @Param('trxn') trxn: string,
    @Body(ValidationPipe) updateTransactionDto: UpdateTransactionDto
  ) {
    return this.transactionService.updateByTrxn(trxn, updateTransactionDto);
  }
  // Update by TransId
  @Put('update/trans-id/:transId')
  @ApiOperation({ summary: 'Update transaction by transaction ID and TransId' })
  @ApiParam({ name: 'transId', description: 'Transaction ID' })
  @ApiParam({ name: 'trxn', description: 'Transaction ID' })
  @ApiBody({
    type: UpdateTransactionDto,
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
  })
  @ApiResponse({ status: 200, type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  updateByTransId(
    @Param('transId') transId: string,
    @Param('trxn') trxn: string,
    @Body(ValidationPipe) updateTransactionDto: UpdateTransactionDto
  ) {
    return this.transactionService.updateByTransId(transId, updateTransactionDto);
  }

  // Delete by TransId and Trxn
  @Delete('delete/:trxn')
  @ApiOperation({ summary: 'Delete transaction by transaction ID and TransId and Trxn' })
  @ApiParam({ name: 'transId', description: 'Transaction ID' })
  @ApiParam({ name: 'trxn', description: 'Transaction ID' })
  @ApiResponse({ status: 200, type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  deleteByTransIdTrxn(
    @Param('trxn') trxn: string
  ) {
    return this.transactionService.removeByTrxn(trxn);
  }
  // Find transaction by userId
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get transactions by user ID with pagination' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiResponse({
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
  })
  findByUserId(
    @Param('userId') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10
  ) {
    return this.transactionService.findByUserId(userId, page, limit);
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get transaction statistics for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
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
  })
  getTransactionStats(@Param('userId') userId: string) {
    return this.transactionService.getTransactionStats(userId);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get transactions by date range' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Start date (YYYY-MM-DD)'
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'End date (YYYY-MM-DD)'
  })
  @ApiResponse({
    status: 200,
    type: [Transaction],
    description: 'Returns transactions within date range'
  })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.transactionService.findByDateRange(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Delete('remove/:id')
  @ApiOperation({ summary: 'Delete transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedTransaction: { $ref: '#/components/schemas/Transaction' }
      }
    }
  })
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }

  @Get('trans-id/:transId')
  @ApiOperation({ summary: 'Get transaction by transaction ID' })
  @ApiParam({ name: 'transId', description: 'Transaction ID' })
  @ApiResponse({ status: 200, type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findByTransId(@Param('transId') transId: string) {
    const transaction = await this.transactionService.findByTransId(transId);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transId} not found`);
    }
    return transaction;
  }
  /*
   * find transaction by trxn
  */
  @Get('trans-trxn/:trxn')
  @ApiOperation({ summary: 'Get transaction by transaction reference' })
  @ApiParam({ name: 'trxn', description: 'Transaction reference' })
  @ApiResponse({ status: 200, type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findByTrxn(@Param('trxn') trxn: string) {
    const transaction = await this.transactionService.findByTrxn(trxn);
    if (!transaction) {
      throw new NotFoundException(`Transaction with reference ${trxn} not found`);
    }
    return transaction;
  }

}
