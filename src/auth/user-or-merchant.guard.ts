import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MerchantAuthGuard } from './merchant-auth.guard';

@Injectable()
export class UserOrMerchantGuard implements CanActivate {
  constructor(
    private jwtAuthGuard: JwtAuthGuard,
    private merchantAuthGuard: MerchantAuthGuard
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Try user authentication first
      const canActivateUser = this.jwtAuthGuard.canActivate(context);
      if (canActivateUser) {
        return true;
      }
    } catch (userError) {
      // User authentication failed, try merchant authentication
      try {
        const canActivateMerchant = await this.merchantAuthGuard.canActivate(context);
        if (canActivateMerchant) {
          return true;
        }
      } catch (merchantError) {
        // Both user and merchant authentication failed
        throw new UnauthorizedException('Invalid token');
      }
    }

    // If we reach here, both guards failed
    return false;
  }
}