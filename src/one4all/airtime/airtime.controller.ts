import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AirtimeService } from './airtime.service';
import { TopupDto } from './dto/topup.dto';
import { TransStatusDto } from './dto/transtatus.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserOrMerchantGuard } from 'src/auth/user-or-merchant.guard';

@ApiTags('Airtime')
@Controller('api/v1/airtime')
export class AirtimeController {
  private logger = new Logger(AirtimeController.name);

  constructor(private airtimeService: AirtimeService) {}

  // Find transaction  status
  @UseGuards(JwtAuthGuard)
  @Post('/transtatus')
  @ApiOperation({ summary: 'Query transaction status' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['transReference'],
      properties: {
        transReference: {
          type: 'string',
          description: 'Client transaction reference number',
          example: '1234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Transaction status',
          example: 'success',
        },
        message: {
          type: 'string',
          description: 'Transaction status message',
          example: 'Transaction successful',
        },
      },
    },
  })
  public async queryTransactionstatus(
    @Body() qtsDto: TransStatusDto,
  ): Promise<any> {
    this.logger.log(`transtatus dto => ${JSON.stringify(qtsDto)}`);
    const ts = this.airtimeService.transactionStatus(qtsDto);
    return ts;
  }

  // Make airtime topup
  @UseGuards(UserOrMerchantGuard)
  @Post('/topup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process airtime top-up' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['recipientNumber', 'amount', 'network'],
      properties: {
        recipientNumber: {
          type: 'string',
          description: 'The recipient phone number',
          pattern: '^\\+?[1-9]\\d{1,14}$',
          example: '+1234567890',
        },
        amount: {
          oneOf: [
            {
              type: 'string',
              description: 'The amount to be transferred (as string)',
              minimum: 1,
              example: '50',
            },
            {
              type: 'number',
              description: 'The amount to be transferred (as number)',
              minimum: 1,
              example: 50,
            }
          ],
          description: 'The amount to be transferred (accepts both string and number)',
        },
        network: {
          type: 'number',
          description: 'The recipient mobile network provider',
          enum: [
            '0 - Unknown (auto detect network)',
            '1 - AirtelTigo', 
            '2 - EXPRESSO', 
            '3 - GLO', 
            '4 - MTN',
            '5 - TiGO',
            '6 - Telecel',
            '8 - Busy',
            '9 - Surfline'
          ],
          example: 4,
    
        }
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Airtime top-up processed successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Top-up status message',
          example: 'Top-up successful',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid userId' })
  public async processTopup(
    @Body() ptDto: TopupDto,
    @Request() req,
  ): Promise<any> {
    // Enhanced logging for debugging
    this.logger.log(`=== AIRTIME TOPUP REQUEST START ===`);
    this.logger.log(`Request URL: ${req.url}`);
    this.logger.log(`Request Method: ${req.method}`);
    this.logger.log(`Request Timestamp: ${new Date().toISOString()}`);
    
    // Log raw request details
    this.logger.log(`Raw request body: ${JSON.stringify(req.body, null, 2)}`);
    this.logger.log(`Content-Type: ${req.headers['content-type']}`);
    this.logger.log(`User-Agent: ${req.headers['user-agent']}`);
    this.logger.log(`Authorization: ${req.headers.authorization ? 'Bearer [HIDDEN]' : 'None'}`);
    
    // Log parsed DTO details
    this.logger.log(`Parsed DTO: ${JSON.stringify(ptDto, null, 2)}`);
    this.logger.log(`DTO Type: ${typeof ptDto}`);
    this.logger.log(`DTO Keys: ${Object.keys(ptDto).join(', ')}`);
    
    // Log individual parameter details
    this.logger.log(`=== PARAMETER ANALYSIS ===`);
    this.logger.log(`recipientNumber: "${ptDto.recipientNumber}" (type: ${typeof ptDto.recipientNumber})`);
    this.logger.log(`amount: "${ptDto.amount}" (type: ${typeof ptDto.amount})`);
    this.logger.log(`network: ${ptDto.network} (type: ${typeof ptDto.network})`);
    this.logger.log(`retailer: "${ptDto.retailer}" (type: ${typeof ptDto.retailer})`);
    this.logger.log(`currency: "${ptDto.currency}" (type: ${typeof ptDto.currency})`);
    
    // Log user authentication details
    this.logger.log(`User object: ${JSON.stringify(req.user, null, 2)}`);
    this.logger.log(`User ID from token: ${req.user?.sub}`);
    this.logger.log(`Username from token: ${req.user?.username}`);
    this.logger.log(`User roles: ${JSON.stringify(req.user?.roles)}`);
    
    // Validate that required fields are present in the DTO
    this.logger.log(`=== VALIDATION START ===`);
    
    if (!ptDto.recipientNumber) {
      this.logger.error('recipientNumber is missing from DTO');
      throw new BadRequestException('Recipient number is required');
    }
    this.logger.log(`✅ recipientNumber validation passed`);
    
    if (ptDto.amount === undefined || ptDto.amount === null) {
      this.logger.error('amount is missing from DTO');
      throw new BadRequestException('Amount is required');
    }
    this.logger.log(`✅ amount presence validation passed`);
    
    // Additional amount validation for type safety
    if (typeof ptDto.amount === 'string' && ptDto.amount.trim() === '') {
      this.logger.error('amount string is empty');
      throw new BadRequestException('Amount cannot be empty');
    }
    this.logger.log(`✅ amount string validation passed`);
    
    if (typeof ptDto.amount === 'number' && (isNaN(ptDto.amount) || ptDto.amount <= 0)) {
      this.logger.error(`Invalid amount number: ${ptDto.amount}`);
      throw new BadRequestException('Amount must be a positive number');
    }
    this.logger.log(`✅ amount number validation passed`);
    
    if (ptDto.network === undefined || ptDto.network === null) {
      this.logger.error('network is missing from DTO');
      throw new BadRequestException('Network is required');
    }
    this.logger.log(`✅ network validation passed`);
    
    this.logger.log(`=== VALIDATION COMPLETED ===`);
    
    // Set user information from the authenticated request
    ptDto.userId = req.user?.sub;
    ptDto.userName = req.user?.username;
    
    this.logger.log(`DTO after setting user info: ${JSON.stringify(ptDto, null, 2)}`);
    
    // Validate userId
    if (!ptDto.userId || typeof ptDto.userId !== 'string') {
      this.logger.error(`Invalid userId: ${ptDto.userId}`);
      throw new BadRequestException('Invalid userId');
    }
    this.logger.log(`✅ userId validation passed: ${ptDto.userId}`);
    
    if (!ptDto.userName || typeof ptDto.userName !== 'string') {
      this.logger.error(`Invalid userName: ${ptDto.userName}`);
      throw new BadRequestException('Invalid userName');
    }
    this.logger.log(`✅ userName validation passed: ${ptDto.userName}`);
    
    this.logger.log(`=== AIRTIME TOPUP REQUEST END ===`);
    this.logger.log(`Forwarding request to service with validated DTO`);
    
    return this.airtimeService.topupAirtimeService(ptDto);
  }

}