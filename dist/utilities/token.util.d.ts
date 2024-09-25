export declare class TokenUtil {
    static generateToken(payload: any, expiresIn?: string): string;
    static verifyToken(token: string): any;
    static generateVerificationCode(): string;
}
