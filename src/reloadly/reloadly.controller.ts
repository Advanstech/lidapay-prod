import { Body, Controller, Get, Logger, Post, UseGuards, BadRequestException, InternalServerErrorException, HttpException, Param, Query, ParseIntPipe, ParseFloatPipe } from "@nestjs/common";
import { ReloadlyService } from "./reloadly.service";
import { ReloadlyDto } from "./dto/reloadly.dto";
import { NetworkOperatorsDto } from "./dto/network.operators.dto";
import { firstValueFrom } from "rxjs";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('Reloadly Services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/reloadly')
export class ReloadlyController {
  private readonly logger = new Logger(ReloadlyController.name);

  constructor(
    private readonly reloadlyService: ReloadlyService
  ) { }

  // Check account balance
  @Get('account-balance')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get Reloadly account balance' })
  @ApiResponse({ status: 200, description: 'Account balance retrieved successfully' })
  async getAccountBalance(): Promise<any> {
    try {
      const gab = await firstValueFrom(this.reloadlyService.getAccountBalance());
      this.logger.debug(`Account balance response ==>${JSON.stringify(gab)}`);
      return gab;
    } catch (error) {
      this.logger.error(`Error getting account balance: ${error}`);
      throw new Error('Internal server error');
    }
  }

  // Get access token
  @Get('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate Reloadly access token' })
  @ApiResponse({ status: 200, description: 'Access token generated successfully' })
  async accessToken(): Promise<any> {
    try {
      const gatRes = await firstValueFrom(this.reloadlyService.accessToken());
      this.logger.debug(`Access token response ==>${JSON.stringify(gatRes)}`);
      return gatRes;
    } catch (error) {
      this.logger.error(`Error getting access token: ${error}`);
      throw new Error('Internal server error');
    }
  }

  // List available countries
  @Get('country-list')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List supported countries' })
  @ApiResponse({ status: 200, description: 'Supported countries listed successfully' })
  async countryList(): Promise<any> {
    try {
      const lcl = await firstValueFrom(this.reloadlyService.countryList());
      this.logger.debug(`Country list response ==>${JSON.stringify(lcl)}`);
      return lcl;
    } catch (error) {
      this.logger.error(`Error getting country list: ${error}`);
      throw new Error('Internal server error');
    }
  }

  // Get country by countryCode
  @Post('find-country-by-code')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find country by ISO code' })
  @ApiBody({
    description: 'Country lookup payload',
    schema: {
      type: 'object',
      properties: {
        countryCode: { type: 'string', description: '2-letter ISO country code', example: 'NG' },
        isoCode: { type: 'string', description: 'Optional numeric/alpha-3 code if used', example: '566' }
      },
      required: ['countryCode']
    }
  })
  @ApiResponse({ status: 200, description: 'Country details fetched successfully' })
  @ApiResponse({ status: 404, description: 'Country not found' })
  async findCountryByCode(@Body() fcbDto: ReloadlyDto): Promise<any> {
    try {
      const fcb = await firstValueFrom(this.reloadlyService.findCountryByCode(fcbDto));
      this.logger.debug(`Find country by code response ==>${JSON.stringify(fcb)}`);
      return fcb;
    } catch (error) {
      this.logger.error(`Error finding country by code: ${error}`);
      throw new Error('Internal server error');
    }
  }

  // Get all network operators with pagination
  @Post('network-operators')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List network operators with pagination and filters' })
  @ApiBody({
    description: 'Pagination and filter options',
    schema: {
      type: 'object',
      properties: {
        size: { type: 'number', description: 'Page size', example: 10 },
        page: { type: 'number', description: 'Page index (0-based)', example: 0 },
        includeBundles: { type: 'boolean', example: true },
        includeData: { type: 'boolean', example: true },
        suggestedAmountsMap: { type: 'boolean', example: false },
        includeCombo: { type: 'boolean', example: false },
        comboOnly: { type: 'boolean', example: false },
        bundlesOnly: { type: 'boolean', example: false },
        dataOnly: { type: 'boolean', example: false },
        pinOnly: { type: 'boolean', example: false }
      }
    },
    examples: {
      default: {
        value: { size: 10, page: 0, includeBundles: true, includeData: true },
        summary: 'Basic operator list request'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Operators listed successfully' })
  async networkOperators(@Body() gngDto: any): Promise<any> {
    try {
      const operators = await firstValueFrom(this.reloadlyService.networkOperators(gngDto));
      this.logger.debug(`Network operators response ==>${JSON.stringify(operators)}`);
      return operators;
    } catch (error) {
      this.logger.error(`Error getting network operators: ${error}`);
      throw new Error('Internal server error');
    }
  }

  //  Get network operators by id eg. 340
  @Post('find-operator-by-id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find operator by ID' })
  @ApiBody({
    description: 'Operator lookup payload',
    schema: {
      type: 'object',
      properties: {
        operatorId: { type: 'number', description: 'Operator ID', example: 340 }
      },
      required: ['operatorId']
    }
  })
  @ApiResponse({ status: 200, description: 'Operator details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Operator not found' })
  async findOperatorById(@Body() adoDto: NetworkOperatorsDto): Promise<any> {
    try {
      const ado = await firstValueFrom(this.reloadlyService.findOperatorById(adoDto));
      this.logger.debug(`Find operator by ID response ==>${JSON.stringify(ado)}`);
      return ado;
    } catch (error) {
      this.logger.error(`Error finding operator by ID: ${error}`);
      throw new Error('Internal server error');
    }
  }

  // Auto Detect Operator
  @Post('operator/autodetect')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Auto-detect operator by phone and country' })
  @ApiBody({
    description: 'Auto-detect payload',
    schema: {
      type: 'object',
      properties: {
        phone: { type: 'string', description: 'MSISDN of the subscriber', example: '233501234567' },
        countryIsoCode: { type: 'string', description: '2-letter ISO country code', example: 'GH' },
        suggestedAmountsMap: { type: 'boolean', example: true },
        suggestedAmount: { type: 'boolean', example: false }
      },
      required: ['phone', 'countryIsoCode']
    }
  })
  @ApiResponse({ status: 200, description: 'Detected operator returned' })
  @ApiResponse({ status: 400, description: 'Missing required fields' })
  async autoDetectOperator(
    @Body() adoDto: NetworkOperatorsDto
  ): Promise<any> {
    console.log("autoDetectOperator input =>", adoDto);
    
    // Validate required fields
    if (!adoDto || !adoDto.phone || !adoDto.countryIsoCode) {
      throw new BadRequestException('Phone number and country ISO code are required');
    }

    try {
      const ado = await firstValueFrom(this.reloadlyService.autoDetectOperator(adoDto));
      this.logger.debug(`Network autodetect input ==>${JSON.stringify(adoDto)}`);
      return ado;
    } catch (error: any) {
      this.logger.error(`Error auto detecting operator: ${error?.message || error}`);
      // If the service already threw an HttpException (e.g., NotFoundException), rethrow it to preserve status and message
      if (error instanceof HttpException) {
        throw error;
      }
      // If error has a response from downstream, bubble up message
      const message = error?.response?.data || error?.message || 'Auto-detect failed';
      throw new InternalServerErrorException(message);
    }
  }

  // Get network operator by country-code
  @Post('get-operator-by-code')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get operators by country ISO code with filters' })
  @ApiBody({
    description: 'Country and filter options',
    schema: {
      type: 'object',
      properties: {
        countryIsoCode: { type: 'string', description: '2-letter ISO country code', example: 'NG' },
        includePin: { type: 'boolean', example: false },
        includeData: { type: 'boolean', example: false },
        includeBundles: { type: 'boolean', example: false },
        includeCombo: { type: 'boolean', example: false },
        comboOnly: { type: 'boolean', example: false },
        dataOnly: { type: 'boolean', example: false },
        bundlesOnly: { type: 'boolean', example: false },
        pinOnly: { type: 'boolean', example: false },
        suggestedAmountsMap: { type: 'boolean', example: false },
        suggestedAmount: { type: 'boolean', example: false }
      },
      required: ['countryIsoCode']
    },
    examples: {
      default: {
        value: { countryIsoCode: 'NG', includeData: true },
        summary: 'Fetch Nigerian operators including data'
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Operators by country returned' })
  async getOperatorByCode(@Body() gnobcDto: NetworkOperatorsDto): Promise<any> {
    try {
      const gnobc = await firstValueFrom(this.reloadlyService.getOperatorByCode(gnobcDto));
      this.logger.debug(`Get operator by code response ==>${JSON.stringify(gnobc)}`);
      return gnobc;
    } catch (error) {
      this.logger.error(`Error getting operator by code: ${error}`);
      throw new Error('Internal server error');
    }
  }

  // Fetch FX Rate for operator and amount
  @Get('operators/:operatorId/fx-rate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fetch FX rate for operator and amount' })
  @ApiParam({ name: 'operatorId', type: Number, description: 'Operator ID', example: 340 })
  @ApiQuery({ name: 'amount', required: true, type: Number, description: 'Amount to convert', example: 10 })
  @ApiQuery({ name: 'currencyCode', required: false, type: String, description: 'Currency code (optional)', example: 'USD' })
  @ApiResponse({ status: 200, description: 'FX rate returned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async getFxRate(
    @Param('operatorId', ParseIntPipe) operatorId: number,
    @Query('amount', new ParseFloatPipe()) amount: number,
    @Query('currencyCode') currencyCode?: string,
  ): Promise<any> {
    try {
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new BadRequestException('Query param "amount" must be a positive number');
      }
      const res = await this.reloadlyService.fxRates({ operatorId, amount, currencyCode });
      this.logger.debug(`FX rate response ==> ${JSON.stringify(res)}`);
      return res;
    } catch (error: any) {
      this.logger.error(`Error fetching FX rate: ${error?.message || error}`);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch FX rate');
    }
  }
}