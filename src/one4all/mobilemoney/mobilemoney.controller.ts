import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SendMoneyDto } from './dto/send.money.dto';
import { ReceiveMoneyDto } from './dto/receive.money.dto';
import { MobilemoneyService } from './mobilemoney.service';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Mobile Money')
@Controller('api/v1/mobilemoney')
export class MobilemoneyController {
  private logger = new Logger('MobilemoneyController');

  constructor(private mobilemoneyService: MobilemoneyService) { }

  @Post('send')
  @ApiOperation({ summary: 'Send money to a recipient' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        apiKey: { type: 'string' },
        apiSecret: { type: 'string' },
        transId: { type: 'string' },
        transType: { type: 'string' },
        serviceName: { type: 'string' },
        customerName: { type: 'string' },
        customerEmail: { type: 'string' },
        clientReference: { type: 'string' },
        recipientMsisdn: { type: 'string' },
        network: { type: 'string' },
        amount: { type: 'string' },
        description: { type: 'string' },
        primaryCallbackUrl: { type: 'string' },
        secondaryCallbackUrl: { type: 'string' },
        token: { type: 'string' },
        transStatus: { type: 'string' },
        transMessage: { type: 'string' },
        serviceStatus: { type: 'string' },
        serviceTransId: { type: 'string' },
        paymentStatus: { type: 'string' },
        otherInfo: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Successfully sent money' })
  public async creditWallet(@Body() transDto: SendMoneyDto) {
    const cw = await this.mobilemoneyService.sendMobileMoney(transDto);
    return cw;
  }

  @Post('receive')
  @ApiOperation({ summary: 'Receive money from a sender' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        apiKey: { type: 'string' },
        apiSecret: { type: 'string' },
        transId: { type: 'string' },
        transType: { type: 'string' },
        serviceName: { type: 'string' },
        recipientName: { type: 'string' },
        customerEmail: { type: 'string' },
        clientReference: { type: 'string' },
        customerMsisdn: { type: 'string' },
        channel: { type: 'string' },
        amount: { type: 'string' },
        description: { type: 'string' },
        transStatus: { type: 'string' },
        transMessage: { type: 'string' },
        serviceStatus: { type: 'string' },
        serviceTransId: { type: 'string' },
        paymentStatus: { type: 'string' },
        otherInfo: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Successfully received money' })
  public async debitWallet(@Body() transDto: ReceiveMoneyDto): Promise<any> {
    const dw = await this.mobilemoneyService.receiveMobileMoney(transDto);
    return dw;
  }
}

