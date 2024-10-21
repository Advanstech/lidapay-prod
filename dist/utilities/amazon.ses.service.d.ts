import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private ses;
    constructor(configService: ConfigService);
    sendMail(to: string, subject: string, text: string, html?: string): Promise<import("aws-sdk/lib/request").PromiseResult<AWS.SES.SendEmailResponse, AWS.AWSError>>;
}
