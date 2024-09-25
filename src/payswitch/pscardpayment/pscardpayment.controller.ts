import { Body, Controller, Get, HttpStatus, Logger, Post, Query, Res } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from "@nestjs/swagger";
import { Response } from "express";
import { CallbackDto } from "./dto/callback.dto";
import { InlinePayDto } from "./dto/inline.pay.dto";
import { PscardpaymentService } from "./pscardpayment.service";

@ApiTags('Card Payment')
@Controller('api/v1/pscardpayment')
export class PscardpaymentController {
  private logger = new Logger(PscardpaymentController.name);

  constructor(
    private pscardpaymentService: PscardpaymentService
  ) { }

  @Get('redirecturl')
  @ApiOperation({ summary: 'Primary Callback' })
  @ApiResponse({ status: 200, description: 'Transaction response', type: CallbackDto })
  public async primaryCallback(
    @Res() res: Response,
    @Query() qr: CallbackDto
  ): Promise<any> {
    const pc = qr;
    this.logger.log(`TRANSACTION RESPONSE URL => ${JSON.stringify(pc)}`);
    res.status(HttpStatus.OK).json(pc);
  }

  @Post('inline')
  @ApiOperation({ summary: 'Inline Card Mobile Payments' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 1.00 },
        email: { type: 'string', example: 'customer@example.com' },
        currency: { type: 'string', example: 'GHS' },
        card_number: { type: 'string', example: '4111111111111111' },
        card_expiry: { type: 'string', example: '05/24' },
        card_cvv: { type: 'string', example: '123' },
        transaction_id: { type: 'string', example: 'TX123456789' },
        description: { type: 'string', example: 'Payment for Product XYZ' },
      },
      required: ['amount', 'email', 'currency', 'card_number', 'card_expiry', 'card_cvv', 'transaction_id']
    }
  })
  @ApiResponse({ status: 200, description: 'Payment response' })
  public async inlineCardMobilePayments(
    @Body() transDto: InlinePayDto
  ) {
    this.logger.debug(`PAYMENT PAYLOAD => ${JSON.stringify(transDto)}`);
    const icmp = await this.pscardpaymentService.inlinePayments(transDto);
    return icmp;
  }
  
}