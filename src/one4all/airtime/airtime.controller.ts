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
          type: 'string',
          description: 'The amount to be transferred',
          minimum: 1,
          example: 50,
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
    this.logger.log(`topup airtime dto => ${JSON.stringify(ptDto)}`);
    this.logger.log(`topup airtime user => ${JSON.stringify(req.user)}`);
    ptDto.userId = req.user.sub;
    ptDto.userName = req.user.username;
    // Validate userId
    if (!ptDto.userId || typeof ptDto.userId !== 'string') {
      throw new BadRequestException('Invalid userId');
    }
    return this.airtimeService.topupAirtimeService(ptDto);
  }

}