import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MobileMoneyService } from './mobile-money/mobile-money.service';
import { ExpressPayService } from './express-pay.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { CreateTransactionDto } from './mobile-money/dto/create-transaction.dto';
import { PaymentCallbackDto } from './dto/callback.dto'; // Import the PaymentCallbackDto
import { Response } from 'express';

@ApiTags('Advansis Money')
@Controller('api/v1/advansispay')
export class AdvansispayController {
  private readonly logger = new Logger(AdvansispayController.name);
  constructor(
    private readonly mobileMoneyService: MobileMoneyService,
    private readonly expressPayService: ExpressPayService,
  ) {}
  // Redirect URL
  @Get('redirect-url')
  @ApiOperation({ summary: 'Handle payment callback' })
  @ApiQuery({
    name: 'order-id',
    description: 'Order ID from the payment gateway',
    required: true,
    example: 'ADV-M2NN2COD-11D269AA',
  })
  @ApiQuery({
    name: 'token',
    description: 'Token for the transaction',
    required: true,
    example: '4686671a924bd07e32.72722384671a924bd07ea5.886127862734671a924bd0',
  })
  @ApiResponse({ status: 200, description: 'Callback processed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid callback data.' })
  async primaryCallback(
    @Res() res: Response,
    @Query() qr: PaymentCallbackDto,
  ): Promise<any> {
    const { 'order-id': orderId, token } = qr; // Extracting orderId and token
    this.logger.log(`callback response =>> ${JSON.stringify(qr)}`);
    // Call the paymentCallbackURL service method to update transactions
    await this.expressPayService.paymentCallbackURL(qr); // Pass the entire qr object
    res.status(HttpStatus.OK).json({ orderId, token }); // Example usage
  }
  //  Initiate Payment as Step 1
  @Post('initiate-payment')
  @ApiOperation({ summary: 'Initiate a mobile money payment' })
  @ApiBody({
    description: 'Initiate payment data',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Kofi' },
        lastName: { type: 'string', example: 'Owusu' },
        email: { type: 'string', example: 'kofi.owusu@gmail.com' },
        phoneNumber: { type: 'string', example: '233205678901' },
        username: { type: 'string', example: 'kofiowusu' },
        amount: { type: 'number', example: 10 },
        orderDesc: { type: 'string', example: 'Kofi airtime payment to 233205678901 on 29102024' },
        userId: { type: 'string', example: '1234567890abcdef' },
        accountNumber: { type: 'string', example: '1234' },
        orderImgUrl: { type: 'string', example: 'https://www.ghanaweb.com' },
        transType: { type: 'string', example: 'MOMO' },
        payTransRef: { type: 'string', example: 'PAY-REF-12345' },
      },
      required: ['firstName', 'lastName', 'email', 'phoneNumber', 'username', 'amount', 'orderDesc', 'userId', 'accountNumber', 'orderImgUrl', 'transType', 'payTransRef'],
    },
  })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async initiatePayment(@Body() paymentData: InitiatePaymentDto): Promise<any> {
    try {
      const result = await this.expressPayService.initiatePayment(paymentData);
      return {
        status: 201,
        message: 'Payment initiated successfully.',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // Debit  Wallet from Payswitch
  @Post('debit-wallet')
  @ApiOperation({
    summary: 'Process a mobile money transaction',
  })
  @ApiBody({
    description: 'Transaction data to be processed',
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 100.5 },
        currency: { type: 'string', example: 'GHS' },
        customerEmail: { type: 'string', example: 'customer@example.com' },
        customerMsisdn: { type: 'string', example: '233241234567' },
        description: { type: 'string', example: 'Payment for order #123' },
        callbackUrl: { type: 'string', example: 'https://example.com/callback' },
      },
      required: ['amount', 'currency', 'customerEmail', 'customerMsisdn'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction processed successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async processTransaction(
    @Body() transData: CreateTransactionDto,
  ): Promise<any> {
    try {
      const result =
        await this.mobileMoneyService.processTransaction(transData);
      return {
        status: 201,
        message: 'Transaction processed successfully.',
        data: result,
      };
    } catch (error) {
      // Handle error response
      return {
        status: error.status || 500,
        message: error.message || 'Internal server error.',
      };
    }
  }
  // Query Transaction with token
  @Post('query-transaction')
  @ApiOperation({ summary: 'Query transaction by token' })
  @ApiQuery({
    name: 'token',
    description: 'Transaction token',
    required: true,
    example: '4686671a924bd07e32.72722384671a924bd07ea5.886127862734671a924bd0',
  })
  @ApiResponse({ status: 200, description: 'Transaction found.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async queryTransaction(@Body('token') token: string): Promise<any> {
    try {
      const result = await this.expressPayService.queryTransaction(token);
      return {
        status: 200,
        message: 'Transaction found.',
        data: result,
      };
    } catch (error) {
      // Handle error response
      return {
        status: error.status || 500,
        message: error.message || 'Internal server error.',
      };
    }
  }
  // Handler for the POST request from ExpressPay
  @Post('post-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive payment status update from ExpressPay' })
  @ApiBody({
    description: 'Payment status update from ExpressPay',
    type: PaymentCallbackDto,
  })
  @ApiResponse({ status: 200, description: 'Payment status processed successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async handlePostPaymentStatus(@Body() postData: PaymentCallbackDto): Promise<void> {
    try {
      this.logger.log(`Received payment status update: ${JSON.stringify(postData)}`);
      await this.expressPayService.handlePostPaymentStatus(postData);
    } catch (error) {
      this.logger.error(`Error processing payment status: ${error.message}`);
      throw new HttpException(
        error.message || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
