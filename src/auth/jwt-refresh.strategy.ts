import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from '../constants';

interface JwtPayload {
  sub: string;
  username: string;
  email?: string;
  roles: string[];
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET || process.env.JWT_SECRET 
    });
  }


  async validate(payload: JwtPayload) {
    return { sub: payload.sub, username: payload.username, email: payload.email, roles: payload.roles };
  }
}
