import { Body, Controller, Get, Logger, Post, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ReloadAirtimeService } from './reload-airtime.service';
import { ReloadAirtimeDto } from './dto/reload.airtime.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserOrMerchantGuard } from 'src/auth/user-or-merchant.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MerchantAuthGuard } from 'src/auth/merchant-auth.guard';

@ApiTags('Reloadly Airtime')
@ApiBearerAuth()
@Controller('api/v1/reload-airtime')
export class ReloadAirtimeController {
  private logger = new Logger(ReloadAirtimeController.name);

  constructor(
    private reloadAirtimeService: ReloadAirtimeService
  ) {}

  @ApiOperation({ summary: 'Generate access token' })
  @ApiResponse({ status: 200, description: 'Access token generated successfully' })
  @Get('/token')
  public async getAccessToken(): Promise<any> {
    const gatRes = this.reloadAirtimeService.generateAccessToken();
    console.log(`access token response:::  ${gatRes}`);
    return gatRes;
  }

  @ApiOperation({ summary: 'Test endpoint' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  @Get('/test')
  public testReloadLyAirtime(): string {
    return `we made it ...`;
  }
 
  @UseGuards(UserOrMerchantGuard)
  @Post('recharge')
  @ApiOperation({ summary: 'Recharge airtime' })
  @ApiBody({
    type: ReloadAirtimeDto,
    description: 'Airtime recharge details',
    schema: {
      type: 'object',
      properties: {
        operatorId: {
          type: 'number',
          description: 'The ID of the operator',
          example: 1
        },
        amount: {
          type: 'number',
          description: 'The amount to recharge',
          example: 10
        },
        recipientEmail: {
          type: 'string',
          format: 'email',
          description: 'Email of the recipient',
          example: 'recipient@example.com'
        },
        recipientNumber: {
          type: 'string',
          description: 'Phone number of the recipient',
          example: '1234567890'
        },
        senderNumber: {
          type: 'string',
          description: 'Phone number of the sender',
          example: '9876543210'
        },
        recipientCountryCode: {
          type: 'string',
          description: 'Country code of the recipient',
          example: 'NG'
        },
        senderCountryCode: {
          type: 'string',
          description: 'Country code of the sender',
          example: 'US'
        }
      },
      required: ['operatorId', 'amount', 'recipientNumber', 'recipientCountryCode']
    },
    examples: {
      validRequest: {
        value: {
          operatorId: 1,
          amount: 10,
          recipientEmail: 'recipient@example.com',
          recipientNumber: '1234567890',
          senderNumber: '9876543210',
          recipientCountryCode: 'NG',
          senderCountryCode: 'US'
        },
        summary: 'Valid airtime recharge request'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Airtime recharged successfully' })
  public async airtimeRecharge(
    @Body() airDto: ReloadAirtimeDto,
    @Request() req,
  ): Promise<any> {
    console.debug(`airtime dto ==> ${airDto}`);
    this.logger.log(`topup airtime user => ${JSON.stringify(req.user)}`);
    airDto.userId = req.user.sub;
    airDto.userName = req.user.name || req.user.username;
    // Validate userId
    if (!airDto.userId || typeof airDto.userId !== 'string') {
      throw new BadRequestException('Invalid userId');
    }
    const ar = this.reloadAirtimeService.makeTopUp(airDto);
    return ar;
  }

  @UseGuards(JwtAuthGuard, MerchantAuthGuard)
  @Post('/recharge-async')
  @ApiOperation({ summary: 'Recharge airtime asynchronously' })
  @ApiResponse({ status: 200, description: 'Asynchronous airtime recharge initiated' })
  @ApiBody({
    type: ReloadAirtimeDto,
    description: 'Airtime recharge details',
    schema: {
      type: 'object',
      properties: {
        operatorId: {
          type: 'number',
          description: 'The ID of the operator',
          example: 1
        },
        amount: {
          type: 'number',
          description: 'The amount to recharge',
          example: 10
        },
        recipientEmail: {
          type: 'string',
          format: 'email',
          description: 'Email of the recipient',
          example: 'recipient@example.com'
        },
        recipientNumber: {
          type: 'string',
          description: 'Phone number of the recipient',
          example: '1234567890'
        },
        senderNumber: {
          type: 'string',
          description: 'Phone number of the sender',
          example: '9876543210'
        },
        recipientCountryCode: {
          type: 'string',
          description: 'Country code of the recipient',
          example: 'NG'
        },
        senderCountryCode: {
          type: 'string',
          description: 'Country code of the sender',
          example: 'US'
        }
      },
      required: ['operatorId', 'amount', 'recipientNumber', 'recipientCountryCode']
    },
    examples: {
      validRequest: {
        value: {
          operatorId: 1,
          amount: 10,
          recipientEmail: 'recipient@example.com',
          recipientNumber: '1234567890',
          senderNumber: '9876543210',
          recipientCountryCode: 'NG',
          senderCountryCode: 'US'
        },
        summary: 'Valid airtime recharge request'
      }
    }
  })
  public async asyncAirtimeRecharge(
    @Body() aarDto: ReloadAirtimeDto,
    @Request() req,
  ): Promise<any> {
    this.logger.debug(`async airtime recharge Dto ==> ${aarDto}`);
    this.logger.log(`topup airtime user => ${JSON.stringify(req.user)}`);
    aarDto.userId = req.user.sub;
    aarDto.userName = req.user.name || req.user.username;
    // Validate userId
    if (!aarDto.userId || typeof aarDto.userId !== 'string') {
      throw new BadRequestException('Invalid userId');
    }
    const aar = this.reloadAirtimeService.makeAsynchronousTopUp(aarDto);
    return aar;
  }
}
