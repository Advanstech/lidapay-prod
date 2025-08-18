import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
interface JwtPayload {
    sub: string;
    username: string;
    email?: string;
    roles: string[];
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userService;
    private readonly logger;
    constructor(configService: ConfigService, userService: UserService);
    validate(payload: JwtPayload): Promise<{
        sub: string;
        username: string;
        email: string;
        roles: string[];
    }>;
}
export {};
