import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from '../constants';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

interface JwtPayload {
  sub: string;
  username: string;
  email?: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET || configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    console.debug(`validate user payload ==>${JSON.stringify(payload)}`);
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }
    const user = await this.userService.findOneById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return { userId: payload.sub, username: payload.username, email: payload.email, roles: user.roles };
  }
}
