import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ExpressPayError } from '../express-pay.error';
export declare class ExpressPayExceptionFilter implements ExceptionFilter {
    private readonly errorStatusMap;
    catch(exception: ExpressPayError, host: ArgumentsHost): void;
}
