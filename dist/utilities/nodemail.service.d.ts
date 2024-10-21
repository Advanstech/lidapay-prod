import { ConfigService } from '@nestjs/config';
export declare class NodemailService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendMail(to: string, subject: string, text: string, html?: string): Promise<void>;
}
