import { Body, Controller, Get, Logger, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'; // Import Swagger decorators
import { SmsDto } from './dto/sms.dto';
import { SmsService } from './sms.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('SMS')
@ApiBearerAuth()
@Controller('api/v1/sms')
export class SmsController {
    private logger = new Logger(SmsController.name);

    constructor(
        private smsService: SmsService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('sendsms')
    @ApiOperation({ summary: 'Send SMS' }) // Description for the endpoint
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                recipient: { type: 'string', example: '123456789' },
                message: { type: 'string', example: 'Hello, world!' },
                senderId: { type: 'string', example: 'LIDADA' },

            },
            required: ['recipient', 'message', 'senderId'] // Specify required properties
        }
    })
    @ApiResponse({ status: 200, description: 'SMS sent successfully' })
    @ApiResponse({ status: 400, description: 'Invalid request' })
    @ApiResponse({ status: 404, description: 'Not Found' })
    public async sendSms(
        @Body() transDto: SmsDto
    ) {
        const s2 = await this.smsService.SendSMS(transDto);
        return s2;
    }

    @UseGuards(JwtAuthGuard)
    @Post('bulk')
    @ApiOperation({ summary: 'Send Bulk SMS' }) // Description for the endpoint
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                recipient: { type: 'string', example: '233593998216,0244588584' },
                message: { type: 'string', example: 'Hello, world!' },
                senderId: { type: 'string', example: 'LISADA' },
            },
            required: ['recipient', 'message', 'senderId'] // Specify required properties
        }
    })
    public async sendBulkSms(
        @Body() transDto: SmsDto
    ): Promise<any> {
        const sbs = this.smsService.postBulkSMS(transDto);
        return sbs;
    }

}


