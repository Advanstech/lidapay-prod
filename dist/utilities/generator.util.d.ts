export declare class GeneratorUtil {
    static generateTransactionId(prefix?: string): string;
    static generateMerchantKey(): any;
    static generateTransactionIdPayswitch(prefix?: string): string;
    static generateOrderId(prefix?: string): string;
    static psRandomGeneratedNumber(): string;
    static generateAccountNumber(): Promise<string>;
}
