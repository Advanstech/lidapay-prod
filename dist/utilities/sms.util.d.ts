export declare class SmsService {
    private client;
    constructor();
    sendSms(to: string, body: string): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
}
