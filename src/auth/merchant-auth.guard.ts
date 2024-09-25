import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from '../constants';

@Injectable()
export class MerchantAuthGuard implements CanActivate {
  private readonly logger = new Logger(MerchantAuthGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    this.logger.debug(`Extracted token: ${token}`);

    if (!token) {
      this.logger.error('No token found in request');
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || JWT_SECRET
      });
      
      // Attach the payload to the request object
      request['user'] = payload;
      
      this.logger.debug(`Full payload: ${JSON.stringify(payload)}`);
      // this.logger.debug(`Merchant ID: ${payload.merchantId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to verify token: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}