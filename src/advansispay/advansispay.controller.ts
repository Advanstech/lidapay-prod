import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Logger, Post, Query, Res } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { MobileMoneyService } from "./mobile-money/mobile-money.service";
import { ExpressPayService } from './express-pay.service';
import { IsString } from 'class-validator';
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";
import { CreateTransactionDto } from "./mobile-money/dto/create-transaction.dto";
import { PaymentCallbackDto } from "./dto/callback.dto"; // Import the PaymentCallbackDto
import { Response } from "express";

@ApiTags('Advansis Money')
@Controller('api/v1/advansispay')
export class AdvansispayController {
    private readonly logger = new Logger(AdvansispayController.name);
    constructor(
        private readonly mobileMoneyService: MobileMoneyService,
        private readonly expressPayService: ExpressPayService
    ) { }
    // Redirect URL
    @Get(`redirect-url`)
    async primaryCallback(
        @Res() res: Response,
        @Query() qr: PaymentCallbackDto
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
        description: 'Payment initiation data',
        type: InitiatePaymentDto,
    })
    @ApiResponse({ status: 201, description: 'Payment initiated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    async initiatePayment(
        @Body() paymentData: InitiatePaymentDto
    ): Promise<any> {
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
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    // Debit  Wallet from Payswitch
    @Post('debit-wallet')
    @ApiOperation({
        summary: 'Process a mobile money transaction'
    })
    @ApiBody({
        description: 'Transaction data to be processed',
        type: CreateTransactionDto, // Reference to the DTO
    })
    @ApiResponse({ status: 201, description: 'Transaction processed successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    async processTransaction(
        @Body() transData: CreateTransactionDto
    ): Promise<any> {
        try {
            const result = await this.mobileMoneyService.processTransaction(transData);
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
    @ApiOperation({
        summary: 'Query transaction by token',
    })
    @ApiQuery({
        name: 'token',
        description: 'Transaction token',
        required: true,
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
            }
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
        type: Object,
        schema: {
            type: 'object',
            properties: {
                'order-id': {
                    type: 'string',
                    example: 'ADV-M2NN2COD-11D269AA',
                },
                token: {
                    type: 'string',
                    example: '4686671a924bd07e32.72722384671a924bd07ea5.886127862734671a924bd0',
                },
                status: {
                    type: 'string',
                    enum: ['success', 'failed', 'pending'],
                    example: 'success',
                },
            },
            required: ['order-id', 'token', 'status'],
        },
    })
    @ApiResponse({ status: 200, description: 'Payment status updated successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid input data.' })
    async handlePostPaymentStatus(@Body() req: any) {
        return await this.expressPayService.handlePostPaymentStatus(req);
    }

}
