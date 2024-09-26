import { Body, Controller, Get, Logger, Post, UseGuards } from "@nestjs/common";
import { ReloadlyService } from "./reloadly.service";
import { ReloadlyDto } from "./dto/reloadly.dto";
import { NetworkOperatorsDto } from "./dto/network.operators.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@ApiTags('Reloadly Services')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/reloadly')
export class ReloadlyController {
  private logger = new Logger(ReloadlyController.name);

  constructor(
    private readonly reloadlyService: ReloadlyService
  ) { }

  @Get('/account-balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiResponse({ status: 200, description: 'Returns the account balance' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAccountBalance(): Promise<any> {
    try {
      const gab = this.reloadlyService.getAccountBalance();
      return gab;
    } catch (error) {
      this.logger.error(`Error getting account balance: ${error}`);
      // Return an error response or throw an exception
    }
  }

  @Get('/auth/access-token')
  @ApiOperation({ summary: 'Get access token' })
  @ApiResponse({ status: 200, description: 'Returns the access token' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getAccessToken(): Promise<any> {
    try {
      const gatRes = await this.reloadlyService.accessToken();
      this.logger.debug(`reloadly access token ===>  ${gatRes}`);
      return gatRes;
    } catch (error) {
      this.logger.error(`Error getting access token: ${error}`);
      // Return an error response or throw an exception
    }
  }

  @Get('/countries')
  @ApiOperation({ summary: 'List all countries' })
  @ApiResponse({ status: 200, description: 'Returns the list of countries' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async listCountryList(): Promise<any> {
    try {
      const lcl = this.reloadlyService.countryList();
      this.logger.log(`${JSON.stringify(lcl)}`);
      return lcl;
    } catch (error) {
      this.logger.error(`Error listing countries: ${error}`);
      // Return an error response or throw an exception
    }
  }

  @Post('country/code')
  @ApiOperation({ summary: 'Find country by code' })
  @ApiBody({
    type: ReloadlyDto,
    schema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'The ISO country code',
          example: 'US'
        }
      },
      required: ['countryCode']
    },
    examples: {
      validRequest: {
        value: {
          countryCode: 'US'
        },
        summary: 'Valid country code request'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Returns the country details' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findCountryByCode(
    @Body() fcbDto: ReloadlyDto
  ): Promise<any> {
    if (!fcbDto) {
      throw new Error('Invalid input data');
    }
    try {
      const fcb = await this.reloadlyService.findCountryByCode(fcbDto);
      return fcb;
    } catch (error) {
      this.logger.error(`Error finding country by code: ${error}`);
      // Return an error response or throw an exception
    }
  }

  @Post('operators')
  @ApiOperation({ summary: 'Get network operators' })
  @ApiBody({
    type: NetworkOperatorsDto,
    schema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'The ISO country code',
          example: 'NG'
        }
      },
      required: ['countryCode']
    },
    examples: {
      validRequest: {
        value: {
          countryCode: 'NG'
        },
        summary: 'Valid network operators request'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Returns the list of network operators' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getNetworkGenerator(
    @Body() gngDto: NetworkOperatorsDto
  ): Promise<any> {
    if (!gngDto) {
      throw new Error('Invalid input data');
    }
    try {
      const gng = await this.reloadlyService.networkOperators(gngDto);
      return gng;
    } catch (error) {
      this.logger.error(`Error getting network generator: ${error}`);
      // Return an error response or throw an exception
    }
  }

  @Post('/operator/id')
  @ApiOperation({ summary: 'Find operator by ID' })
  @ApiBody({
    type: NetworkOperatorsDto,
    schema: {
      type: 'object',
      properties: {
        operatorId: {
          type: 'number',
          description: 'The ID of the operator',
          example: 1
        }
      },
      required: ['operatorId']
    },
    examples: {
      validRequest: {
        value: {
          operatorId: 1
        },
        summary: 'Valid operator ID request'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Returns the operator details' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOperatorById(
    @Body() adoDto: NetworkOperatorsDto
  ): Promise<any> {
    if (!adoDto) {
      throw new Error('Invalid input data');
    }
    try {
      const ado = this.reloadlyService.findOperatorById(adoDto);
      return ado;
    } catch (error) {
      this.logger.error(`Error finding operator by id: ${error}`);
      // Return an error response or throw an exception
    }
  }

  @Post('/operator/autodetect')
  @ApiOperation({ summary: 'Auto-detect operator' })
  @ApiBody({
    type: NetworkOperatorsDto,
    schema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'The ISO country code',
          example: 'NG'
        },
        phoneNumber: {
          type: 'string',
          description: 'The phone number to detect the operator for',
          example: '2348012345678'
        }
      },
      required: ['countryCode', 'phoneNumber']
    },
    examples: {
      validRequest: {
        value: {
          countryCode: 'NG',
          phoneNumber: '2348012345678'
        },
        summary: 'Valid auto-detect operator request'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Returns the auto-detected operator' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async autoDetectOperator(
    @Body() adoDto: NetworkOperatorsDto
  ): Promise<any> {
    if (!adoDto) {
      throw new Error('Invalid input data');
    }
    try {
      const accessToken = await this.getAccessToken();
      this.logger.debug(`access token <:::> ${JSON.stringify(accessToken)}`);
      const ado = await this.reloadlyService.autoDetectOperator(adoDto);
      this.logger.debug(`network autodetect input ==>${JSON.stringify(adoDto)}`);
      return ado;
    } catch (error) {
      this.logger.error(`Error auto detecting operator: ${error}`);
      // Return an error response or throw an exception
    }
  }

  @Post('/operator/country-code')
  @ApiOperation({ summary: 'Get network operator by country code' })
  @ApiBody({
    type: NetworkOperatorsDto,
    schema: {
      type: 'object',
      properties: {
        countryCode: {
          type: 'string',
          description: 'The ISO country code',
          example: 'NG'
        }
      },
      required: ['countryCode']
    },
    examples: {
      validRequest: {
        value: {
          countryCode: 'NG'
        },
        summary: 'Valid network operator by country code request'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Returns the network operator details' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getNetworkOperatorByCode(
    @Body() gnobcDto: NetworkOperatorsDto
  ): Promise<any> {
    if (!gnobcDto) {
      throw new Error('Invalid input data');
    }
    try {
      const gnobc = await this.reloadlyService.getOperatorByCode(gnobcDto);
      return gnobc;
    } catch (error) {
      this.logger.error(`Error getting network operator by code: ${error}`);
      // Return an error response or throw an exception
    }
  }
}