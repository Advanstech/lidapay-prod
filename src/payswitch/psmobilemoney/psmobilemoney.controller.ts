import { Controller, Post, Body, Logger } from '@nestjs/common';
import { PsmobilemoneyService } from './psmobilemoney.service';
import { TransferMobileMoneyDto } from './dto/transfer.mobilemoney.dto';
import { PayMobileMoneyDto } from './dto/pay.mobilemoney.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('PS Mobile Money')
@Controller('api/v1/psmobilemoney')
export class PsmobilemoneyController {
    private logger = new Logger(PsmobilemoneyController.name);

    constructor(private psMobilemoneyService: PsmobilemoneyService) { }

    @Post('transfermoney')
    @ApiOperation({ summary: 'Transfer mobile money' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                amount: { type: 'number', example: 100.00 },
                recipient: { type: 'string', example: '0201234567' },
                network: { type: 'string', example: 'MTN' },
                description: { type: 'string', example: 'Transfer for goods' },
                transactionId: { type: 'string', example: 'TRX123456789' }
            },
            required: ['amount', 'recipient', 'network', 'transactionId']
        }
    })
    @ApiResponse({ status: 201, description: 'Mobile money transferred successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    public async creditWallet(
        @Body() transDto: TransferMobileMoneyDto,
    ) {
        const cw = await this.psMobilemoneyService.transferMobilemoney(transDto);
        return cw;
    }

    @Post('debitwallet')
    @ApiOperation({ summary: 'Debit mobile money' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                amount: { type: 'number', example: 50.00 },
                customerMsisdn: { type: 'string', example: '0201234567' },
                network: { type: 'string', example: 'VODAFONE' },
                description: { type: 'string', example: 'Payment for service' },
                transactionId: { type: 'string', example: 'PAY987654321' }
            },
            required: ['amount', 'customerMsisdn', 'network', 'transactionId']
        }
    })
    @ApiResponse({ status: 201, description: 'Mobile money debited successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    public async debitWallet(
        @Body() transDto: PayMobileMoneyDto,
    ) {
        this.logger.debug(`Debit wallet request: ${JSON.stringify(transDto)}`);
        const dw = await this.psMobilemoneyService.mobileMoneyPayment(transDto);
        this.logger.debug(`Debit wallet response: ${JSON.stringify(dw)}`);
        return dw;
    }
}