
// filters/express-pay-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ExpressPayError } from '../express-pay.error';

@Catch(ExpressPayError)
export class ExpressPayExceptionFilter implements ExceptionFilter {

    private readonly errorStatusMap = {
        INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
        PAYMENT_INITIATION_FAILED: HttpStatus.BAD_REQUEST,
        QUERY_FAILED: HttpStatus.BAD_REQUEST,
        INVALID_TOKEN: HttpStatus.BAD_REQUEST,
        SYSTEM_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
        NETWORK_ERROR: HttpStatus.SERVICE_UNAVAILABLE,
        CALLBACK_PROCESSING_FAILED:  HttpStatus.INTERNAL_SERVER_ERROR,
    };

    catch(exception: ExpressPayError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = this.errorStatusMap[exception.code] || HttpStatus.INTERNAL_SERVER_ERROR;

        response.status(status).json({
            statusCode: status,
            error: exception.code,
            message: exception.message,
            details: exception.details,
            timestamp: new Date().toISOString(),
        });
    }
}