import { Body, Controller, Logger, Post, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InternetDto } from './dto/internet.dto';
import { InternetService } from './internet.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Internet')
@Controller('api/v1/internet')
export class InternetController {
  private logger = new Logger('InternetController');

  constructor(
    private internetService: InternetService
  ) { }
  
  @UseGuards(JwtAuthGuard)
  @Post('/buydata')
  @ApiOperation({ summary: 'Buy internet data' })
  @ApiBody({
    type: InternetDto,
    description: 'Internet data purchase details',
    schema: {
      type: 'object',
      required: ['userId', 'recipientNumber', 'dataCode', 'network'],
      properties: {
        recipientNumber: {
          type: 'string',
          description: 'Recipient number',
          example: '1234567890',
        },
        dataCode: {
          type: 'string',
          description: 'Data code',
          example: 'DATA_10GB',
        },
        network: {
          type: 'number',
          description: 'Network code (0-9) 1: AirtelTigo, 4: MTN, 5: Telecel, 6: Telecel, 7: Glo, 8: Expresso, 9:Busy',
          example: 1
        }
      },
    },
    examples: {
      example1: {
        value: {
          recipientNumber: '1234567890',
          dataCode: 'DATA_10GB',
          network: 1
        },
        summary: 'Basic data purchase'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            transactionId: { type: 'string' }
          }
        },
        examples: {
          success: {
            value: {
              success: true,
              message: 'Data purchase successful',
              transactionId: 'TRX123456'
            },
            summary: 'Successful purchase'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        examples: {
          error: {
            value: {
              success: false,
              message: 'An error occurred while processing the request'
            },
            summary: 'Error response'
          }
        }
      }
    }
  })
  public async buyInternetData(
    @Body() bidDto: InternetDto,
    @Request() req
  ): Promise<any> {
    bidDto.userId = req.user.sub;
    bidDto.userName = req.user.username;
    if (!bidDto.userId || typeof bidDto.userId !== 'string') {
      throw new BadRequestException('Invalid userId');
    }
    this.logger.log(`INTERNET DATA dto => ${JSON.stringify(bidDto)}`);
    const ts = await this.internetService.topupInternetData(bidDto);
    return ts;
  }

  @Post('/bundlelist')
  @ApiOperation({ summary: 'List data bundles' })
  @ApiBody({
    type: InternetDto,
    description: 'Data bundle list request details',
    schema: {
      type: 'object',
      properties: {
        network: {
          type: 'number',
          description: 'Network code (0-9) 1: AirtelTigo, 4: MTN, 5: Telecel, 6: Telecel, 7: Glo, 8: Expresso, 9:Busy',
          example: 4
        }
      },
      required: ['network']
    },
    examples: {
      example1: {
        value: {
          network: 4
        },
        summary: 'MTN network bundle list request'
      },
      example2: {
        value: {
          network: 1
        },
        summary: 'AirtelTigo network bundle list request'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            bundles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  price: { type: 'number' },
                  dataAmount: { type: 'string' }
                }
              }
            }
          }
        },
        examples: {
          success: {
            value: {
              success: true,
              bundles: [
                { id: 'DATA_5GB', name: '5GB Bundle', price: 5, dataAmount: '5GB' },
                { id: 'DATA_10GB', name: '10GB Bundle', price: 10, dataAmount: '10GB' }
              ]
            },
            summary: 'Successful bundle list'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        examples: {
          error: {
            value: {
              success: false,
              message: 'An error occurred while fetching the bundle list'
            },
            summary: 'Error response'
          }
        }
      }
    }
  })
  public async listDataBundle(
    @Body() ldbDto: InternetDto
  ): Promise<any> {
    this.logger.log(`BUNDLE LIST dto => ${JSON.stringify(ldbDto)}`);
    const ta = this.internetService.dataBundleList(ldbDto);
    return ta;
  }

}
