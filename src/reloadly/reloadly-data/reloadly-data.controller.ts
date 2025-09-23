import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ReloadlyDataService } from './reloadly-data.service';
import { BuyDataDto } from './dto/buy-data.dto';
import { ReloadDataDto } from './dto/reload.data.dto';
import { Logger } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('Reloadly Data')
@ApiBearerAuth()
@Controller('api/v1/reloadly-data')
export class ReloadlyDataController {
    private readonly logger = new Logger(ReloadlyDataController.name);
    constructor(private readonly reloadlyDataService: ReloadlyDataService) { }

    @Get('data-test')
    @ApiOperation({ summary: 'Health check for Reloadly Data integration' })
    @ApiResponse({ status: 200, description: 'Health check successful' })
    async getReloadlyData() {
        return this.reloadlyDataService.getReloadlyData();
    }

    @Get('auto-detect')
    @ApiOperation({ summary: 'Auto-detect operator by MSISDN and country code' })
    @ApiQuery({ name: 'msisdn', required: true, description: 'Phone number to detect operator for', example: '233501234567' })
    @ApiQuery({ name: 'countryCode', required: true, description: '2-letter ISO country code', example: 'GH' })
    @ApiResponse({ status: 200, description: 'Detected operator details returned' })
    @ApiResponse({ status: 400, description: 'Invalid or missing query parameters' })
    async autoDetect(
        @Query('msisdn') msisdn: string,
        @Query('countryCode') countryCode: string,
    ) {
        this.logger.log(`auto-detect ==> ${msisdn} & ${countryCode}`);
        const trimmedMsisdn = (msisdn || '').trim();
        const code = (countryCode || '').trim().toUpperCase();
        if (!trimmedMsisdn) throw new BadRequestException('Query param "msisdn" is required');
        if (!code || code.length !== 2) throw new BadRequestException('Query param "countryCode" must be a 2-letter ISO code');
        return this.reloadlyDataService.autoDetectOperator(trimmedMsisdn, code);
    }

    @Post('list-operators')
    @ApiOperation({ summary: 'List data operators by country code' })
    @ApiBody({
        description: 'Country filter',
        schema: {
            type: 'object',
            properties: {
                countryCode: { type: 'string', description: '2-letter ISO country code', example: 'NG' }
            },
            required: ['countryCode']
        },
        examples: {
            validRequest: {
                value: { countryCode: 'NG' },
                summary: 'List Nigerian data operators'
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Operators listed successfully' })
    @ApiResponse({ status: 400, description: 'Invalid country code supplied' })
    async listDataOperators(
        @Body('countryCode') countryCode: string
    ) {
        const code = (countryCode || '').trim().toUpperCase();
        if (!code || code.length !== 2) throw new BadRequestException('Country code must be a 2-letter ISO code');
        return this.reloadlyDataService.listDataOperators(code);
    }

    @Post('buy-data')
    @ApiOperation({ summary: 'Purchase internet data bundle' })
    @ApiBody({
        type: ReloadDataDto,
        description: 'Internet data purchase details',
        schema: {
            type: 'object',
            properties: {
                userId: { type: 'string', description: 'Purchaser unique ID', example: 'user_123' },
                userName: { type: 'string', description: 'Purchaser name', example: 'John Doe' },
                operatorId: { type: 'number', description: 'Operator ID', example: 1234 },
                operatorName: { type: 'string', description: 'Operator name', example: 'MTN Ghana' },
                amount: { type: 'number', description: 'Purchase amount', example: 20 },
                useLocalAmount: { type: 'boolean', description: 'Treat amount as local operator currency', example: true },
                customIdentifier: { type: 'string', description: 'Optional custom reference', example: 'INV-2024-0001' },
                recipientEmail: { type: 'string', format: 'email', description: 'Recipient email', example: 'recipient@example.com' },
                recipientNumber: { type: 'string', description: 'Recipient MSISDN', example: '233501234567' },
                recipientCountryCode: { type: 'string', description: 'Recipient ISO country code', example: 'GH' },
                senderNumber: { type: 'string', description: 'Sender MSISDN', example: '14085551234' },
                senderCountryCode: { type: 'string', description: 'Sender ISO country code', example: 'US' },
                currency: { type: 'string', description: 'Currency code', example: 'GHS' },
                includeData: { type: 'boolean', description: 'Include raw provider data in response', example: false },
                retailer: { type: 'string', description: 'Retailer name (internal)', example: 'Lidapay' },
                retailerId: { type: 'string', description: 'Retailer ID (internal)', example: 'ret_456' }
            },
            required: ['userId', 'userName', 'operatorId', 'amount', 'recipientNumber', 'recipientCountryCode', 'senderNumber', 'senderCountryCode']
        },
        examples: {
            validRequest: {
                value: {
                    userId: 'user_123',
                    userName: 'John Doe',
                    operatorId: 1234,
                    amount: 20,
                    recipientEmail: 'recipient@example.com',
                    recipientNumber: '233501234567',
                    senderNumber: '14085551234',
                    recipientCountryCode: 'GH',
                    senderCountryCode: 'US',
                    currency: 'GHS',
                    includeData: false
                },
                summary: 'Valid internet data purchase request'
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Internet data purchased successfully' })
    @ApiResponse({ status: 400, description: 'Validation error in request body' })
    async buyInternetData(@Body() dto: ReloadDataDto): Promise<any> {
        this.logger.log(`Buy internet data input ==> ${JSON.stringify(dto)}`);
        return this.reloadlyDataService.buyInternetData(dto);
    }
}
