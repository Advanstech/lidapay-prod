import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MerchantAuthGuard } from './merchant-auth.guard';
export declare class UserOrMerchantGuard implements CanActivate {
    private jwtAuthGuard;
    private merchantAuthGuard;
    constructor(jwtAuthGuard: JwtAuthGuard, merchantAuthGuard: MerchantAuthGuard);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
