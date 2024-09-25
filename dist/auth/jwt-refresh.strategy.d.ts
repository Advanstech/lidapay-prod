import { Strategy } from 'passport-jwt';
interface JwtPayload {
    sub: string;
    username: string;
    email?: string;
    roles: string[];
}
declare const JwtRefreshStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    constructor();
    validate(payload: JwtPayload): Promise<{
        sub: string;
        username: string;
        email: string;
        roles: string[];
    }>;
}
export {};
