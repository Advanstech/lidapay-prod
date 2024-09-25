import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PasswordUtil } from '../utilities/password.util';
import { TokenUtil } from '../utilities/token.util';
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { JWT_EXPIRE, JWT_SECRET } from 'src/constants';
import { MerchantService } from 'src/merchant/merchant.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import e from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private secretKey = process.env.JWT_SECRET ||  JWT_SECRET;


  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly merchantService: MerchantService
  ) { }

  async validateUser(identifier: string, password: string, email?: string): Promise<any> {
    this.logger.log(`validateUser: ${identifier}, ${password}`);
    
    let user = await this.userService.findOneByUsername(identifier);
    if (!user) {
      user = await this.userService.findOneByEmail(identifier);
    }
    if (!user) {
      user = await this.userService.findOneByPhoneNumber(identifier);
    }
    
    this.logger.log('ValidateUser findOneByIdentifier ==>', user);

    if (user && PasswordUtil.comparePassword(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any): Promise<any> {
    this.logger.verbose(`Login User ==> ${JSON.stringify(user)}`);
    try {
      const payload = {
        username: user._doc.username || user._doc.phoneNumber,
        email: user._doc.email,
        sub: user._doc._id,
        roles: user._doc.roles,
      };

      this.logger.log(`Login Payload ===> ${JSON.stringify(payload)}`);

      const accessToken = this.jwtService.sign(payload, { secret: this.secretKey });
      const refreshToken = this.generateRefreshToken(payload);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        // user: user._doc
      };
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Failed to generate tokens');
    }
  }

  generateRefreshToken(payload: any) {
    this.logger.debug(`GenerateRefreshToken ==> ${JSON.stringify(payload)}`);
    return TokenUtil.generateToken(payload, '7d');
  }

  async refreshToken(refreshToken: string) {
    this.logger.log(`RefreshToken input: ${refreshToken}`);

    try {
      const payload = TokenUtil.verifyToken(refreshToken);
      if (typeof payload === 'string') {
        this.logger.error(`Invalid payload: ${payload}`);
        throw new Error('Invalid token payload');
      }

      this.logger.log('RefreshToken Payload:', payload);
      const user = await this.userService.findOneById(payload.sub);

      if (!user) {
        this.logger.error(`User not found for sub: ${payload.sub}`);
        throw new Error('User not found');
      }

      return this.login(user);
    } catch (error) {
      this.logger.error(`Error refreshing token: ${error.message}`);
      throw new UnauthorizedException(`Failed to refresh token: ${error.message}`);
    }
  }

  async validateMerchant(clientId: string, clientKey: string): Promise<any> {
    const merchant = await this.merchantService.findOneByClientId(clientId);
    if (merchant && merchant.clientKey === clientKey) {
      const { clientKey, password, ...result } = merchant;
      return result;
    }
    return null;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    this.logger.log(`Changing password for user: ${userId}`);

    const user = await this.userService.findOneById(userId);

    if (!user) {
      this.logger.error(`User not found for ID: ${userId}`);
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await PasswordUtil.comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      this.logger.error(`Invalid current password for user: ${userId}`);
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNewPassword = await PasswordUtil.hashPassword(newPassword);
    await this.userService.updatePassword(userId, hashedNewPassword);

    this.logger.log(`Password changed successfully for user: ${userId}`);
    return true;
  }

  async merchantLogin(merchant: any) {
    try {
      const payload = { 
        name: merchant._doc.name || merchant._doc.clientId, 
        sub: merchant._doc._id, 
        roles: ['merchant'],
        // name: merchant.name,
        // email: merchant.email
      };

      const accessToken = this.jwtService.sign(payload, { secret: JWT_SECRET });
      const refreshToken = this.generateRefreshToken(payload);

      // Update last login timestamp
      await this.merchantService.updateLastLogin(merchant._id);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        merchant: {
          id: merchant._id,
          clientId: merchant.clientId,
          // name: merchant.name,
          // email: merchant.email
        }
      };
    } catch (error) {
      this.logger.error(`Error during merchant login: ${error.message}`);
      throw new Error('Failed to generate merchant tokens');
    }
  }


}

