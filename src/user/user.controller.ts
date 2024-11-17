import { Controller, Get, Post, Body, Put, Request, UseGuards, Logger, Delete, Param, NotFoundException, Headers, UnauthorizedException, Query, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtRefreshGuard } from '../auth/jwt-refresh.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { RewardService } from 'src/reward/reward.service';
import { Wallet } from './schemas/wallet.schema'; // Assuming you have a Wallet schema
import { AccountDocument } from './schemas/account.schema'; // Ensure correct import

@ApiTags('Users')
@Controller('api/v1/users')
export class UserController {
  private logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private rewardsService: RewardService,
  ) { }
  // Register user
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created',
    type: CreateUserDto,
    content: {
      'application/json': {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          firstName: 'Kofi',
          lastName: 'Annan',
          email: 'kofi.annan@example.com',
          phoneNumber: '+1234567890',
          roles: ['user'],
          createdAt: '2023-04-01T12:00:00Z',
          updatedAt: '2023-04-01T12:00:00Z'
        }
      }
    }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Kofi' },
        lastName: { type: 'string', example: 'Annan' },
        password: { type: 'string', example: 'securePassword123' },
        roles: {
          type: 'array',
          items: { type: 'string' },
          example: ['user', 'MERCHANT']
        },
        email: {
          type: 'string',
          example: 'kofi.annan@example.com'
        },
        phoneNumber: { type: 'string', example: '+1234567890' },
        referrerClientId: { type: 'string', description: 'Optional Merchant ClientID', example: 'MERCH123' }
      }
    }
  })
  async register(@Body() createUserDto: CreateUserDto) {
    this.logger.debug(`UserDto ==> ${JSON.stringify(createUserDto)}`);
    return this.userService.create(createUserDto);
  }
  // Login user
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    description: 'User logged in successfully',
    content: {
      'application/json': {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: '0123456789' },
        password: { type: 'string', example: 'securePassword123' }
      },
    },
  })
  async login(@Request() req) {
    this.logger.debug(`User login request ==> ${JSON.stringify(req.user)}`);
    return this.authService.login(req.user);
  }
  // Generate a new refresh token
  @Post('refresh-token')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a new refresh token' })
  @ApiResponse({
    status: 200,
    description: 'New refresh token generated',
    type: String,
    content: {
      'application/json': {
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  async genRefreshToken(@Headers('authorization') authHeader: string) {
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new Error('Invalid authorization header format');
    }
    return this.authService.refreshToken(token);
  }
  // User points
  @UseGuards(JwtAuthGuard)
  @Get('points')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user points' })
  @ApiResponse({
    status: 200,
    description: 'User points retrieved',
    type: Number,
    content: {
      'application/json': {
        example: 1000
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized request' })
  async getPoints(@Request() req) {
    const user = await this.userService.findOneById(req.user.sub);
    return { points: user.points };
  }
  // User profile
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
    type: CreateUserDto,
    content: {
      'application/json': {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          firstName: 'Kofi',
          lastName: 'Annan',
          email: 'kofi.annan@example.com',
          phoneNumber: '+1234567890',
          roles: ['user'],
          points: 1000,
          createdAt: '2023-04-01T12:00:00Z',
          updatedAt: '2023-04-01T12:00:00Z'
        }
      }
    }
  })
  @ApiParam({ name: 'id', type: String, description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Get('profile')
  async getProfile(@Request() req) {
    this.logger.debug(`Profile request ==> ${JSON.stringify(req.user)}`);
    const user = await this.userService.findOneById(req.user.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...profile } = user;
    return user;
  }
  // Update user profile
  @UseGuards(JwtAuthGuard)
  @Put('profile/update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: CreateUserDto,
    content: {
      'application/json': {
        example: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          firstName: 'Kofi',
          lastName: 'Annan',
          email: 'kofi.annan@example.com',
          phoneNumber: '+1234567890',
          roles: ['user'],
          points: 1000,
          createdAt: '2023-04-01T12:00:00Z',
          updatedAt: '2023-04-01T12:00:00Z'
        }
      }
    }
  })
  @ApiBody({
    description: 'Update user profile. Any combination of these properties can be provided.',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Kofi' },
        lastName: { type: 'string', example: 'Annan' },
        email: { type: 'string', example: 'kofi.annan@example.com' },
        phoneNumber: { type: 'string', example: '+1234567890' },
        referrerClientId: { type: 'string', description: 'Optional Merchant ClientID', example: 'MERCH123' },
        points: { type: 'number', example: 1000 },
        emailVerified: { type: 'boolean', example: false },
        phoneVerified: { type: 'boolean', example: false },
        status: { type: 'string', example: 'ACTIVE' },
        roles: {
          type: 'array',
          items: { type: 'string' },
          example: ['user', 'MERCHANT']
        },
      }
    }
  })
  async updateProfile(@Request() req, @Body() updateData: any) {
    this.logger.debug(`Profile request ===> ${req.user}`);
    // pass user email to the updateData
    updateData.email = req.user.email;
    return this.userService.updateProfile(req.user.sub, updateData);
  }
  // Get all users
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                  firstName: { type: 'string', example: 'Kofi' },
                  lastName: { type: 'string', example: 'Annan' },
                  email: { type: 'string', example: 'kofi.annan@example.com' },
                  phoneNumber: { type: 'string', example: '+1234567890' },
                  roles: { type: 'array', items: { type: 'string' }, example: ['user'] },
                  points: { type: 'number', example: 1000 },
                  createdAt: { type: 'string', format: 'date-time', example: '2023-04-01T12:00:00Z' },
                  updatedAt: { type: 'string', format: 'date-time', example: '2023-04-01T12:00:00Z' }
                }
              }
            },
            meta: {
              type: 'object',
              properties: {
                itemCount: { type: 'number', example: 2 },
                totalItems: { type: 'number', example: 2 },
                itemsPerPage: { type: 'number', example: 2 },
                totalPages: { type: 'number', example: 1 },
                currentPage: { type: 'number', example: 1 }
              }
            }
          }
        },
        example: {
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              firstName: 'Kofi',
              lastName: 'Annan',
              email: 'kofi.annan@example.com',
              phoneNumber: '+1234567890',
              roles: ['user'],
              points: 1000,
              createdAt: '2023-04-01T12:00:00Z',
              updatedAt: '2023-04-01T12:00:00Z'
            },
            {
              id: '456f7890-a1b2-c3d4-e5f6-789012345678',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              phoneNumber: '+9876543210',
              roles: ['user', 'MERCHANT'],
              points: 2000,
              createdAt: '2023-04-02T10:30:00Z',
              updatedAt: '2023-04-02T10:30:00Z'
            }
          ],
          meta: {
            itemCount: 2,
            totalItems: 2,
            itemsPerPage: 2,
            totalPages: 1,
            currentPage: 1
          }
        }
      }
    }
  })
  @ApiParam({ name: 'page', description: 'Page number', required: false, schema: { type: 'number', default: 1 } })
  @ApiParam({ name: 'limit', description: 'Number of users per page', required: false, schema: { type: 'number', default: 10 } })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10): Promise<any> {
    return this.userService.findAll(page, limit);
  }
  // Get user by phoneNumber
  @UseGuards(JwtAuthGuard)
  @Get('phone/:phoneNumber')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by phone number' })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
  })
  @ApiParam({ name: 'phoneNumber', description: 'User phone number', required: true })
  async getUserByPhoneNumber(@Param('phoneNumber') phoneNumber: string) {
    return this.userService.findOneByPhoneNumber(phoneNumber);
  }
  // Get user by Email
  @UseGuards(JwtAuthGuard)
  @Get('email/:email')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by email' })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
  })
  @ApiParam({ name: 'email', description: 'User email', required: true })
  async getUserByEmail(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }
  // Delete user by ID
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: String,
    content: {
      'application/json': {
        example: 'User deleted successfully'
      }
    }
  })
  @ApiParam({ name: 'id', description: 'User ID', required: true })
  async deleteUserById(@Param('id') userId: string) {
    this.logger.debug(`Deleting user with ID: ${userId}`);
    return this.userService.deleteUserById(userId);
  }
  // Delete all users
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('delete')
  @ApiOperation({ summary: 'Delete all users' })
  @ApiResponse({
    status: 200,
    description: 'All users deleted successfully',
    type: String,
    content: {
      'application/json': {
        example: 'All users deleted successfully'
      }
    }
  })
  async deleteAllUsers() {
    this.logger.debug('Deleting all users');
    return this.userService.deleteAllUsers();
  }
  // Merchant login
  @Post('merchant/login')
  @ApiOperation({ summary: 'Merchant login' })
  @ApiResponse({
    status: 200,
    description: 'Merchant logged in successfully',
    type: CreateUserDto,
    content: {
      'application/json': {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'kofi.annan@example.com',
            roles: ['user']
          }
        }
      }
    }
  })
  @ApiBody({
    description: 'Merchant login credentials',
    required: true,
    schema: {
      type: 'object',
      properties:
      {
        clientId: { type: 'string', example: 'MERCH123' },
        clientSecret: { type: 'string', example: 'secureMerchantSecret123' }
      },
    }
  })
  async merchantLogin(@Body() loginDto: { clientId: string; clientKey: string }) {
    const merchant = await this.authService.validateMerchant(loginDto.clientId, loginDto.clientKey);
    if (!merchant) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.merchantLogin(merchant);
  }
  // Change user password 
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    content: {
      'application/json': {
        example: 'Password changed successfully'
      }
    }
  })
  @ApiBody({
    description: 'Password change credentials',
    required: true,
    schema: {
      type: 'object',
      properties: {
        currentPassword: { type: 'string', description: 'Current password of the user' },
        newPassword: { type: 'string', description: 'New password to set' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: { currentPassword: string; newPassword: string }
  ) {
    return this.authService.changePassword(req.user.sub, changePasswordDto.currentPassword, changePasswordDto.newPassword);
  }
  // Track QR code usage
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('track-qr-code-usage')
  @ApiOperation({ summary: 'Track QR code usage' })
  @ApiResponse({
    status: 200,
    description: 'QR code usage tracked successfully',
    content: {
      'application/json': {
        example: 'QR code usage tracked successfully'
      }
    }
  })
  async trackQRCodeUsage(@Request() req) {
    return this.userService.trackQRCodeUsage(req.user.sub);
  }
  // Get QR code usage stats
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('qr-code-usage-stats')
  @ApiOperation({ summary: 'Get QR code usage stats' })
  @ApiResponse({
    status: 200,
    description: 'QR code usage stats retrieved successfully',
    type: Object,
    content: {
      'application/json': {
        example: {
          totalScans: 10,
          lastScanDate: '2023-04-01T12:00:00Z'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'userId', description: 'The ID of the user whose QR code usage stats are being retrieved' })
  async getQRCodeUsageStats(@Request() req) {
    return this.userService.getQRCodeUsageStats(req.user.sub);
  }
  // Scan QR code
  @Post(':userId/scan-qr')
  @ApiOperation({ summary: 'Scan a user\'s QR code' })
  @ApiParam({ name: 'userId', description: 'The ID of the user whose QR code is being scanned' })
  @ApiResponse({
    status: 200,
    description: 'QR code scanned successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'QR code scanned and points awarded' }
      }
    }
  })
  async scanQRCode(@Param('userId') userId: string) {
    await this.userService.trackQRCodeUsage(userId);
    await this.rewardsService.awardQRCodeScanPoints(userId, 'user');
    return { message: 'QR code scanned and points awarded' };
  }
  // Generate invitation link
  @UseGuards(JwtAuthGuard)
  @Get('invitation-link/generate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate an invitation link for the user' })
  @ApiResponse({
    status: 201,
    description: 'Invitation link generated successfully',
    schema: {
      type: 'object',
      properties: {
        invitationLink: { type: 'string', example: 'https://example.com/invite/yyyymmdd/abc123' }
      }
    }
  })
  async generateInvitationLink(@Request() req): Promise<{ invitationLink: string }> {
    this.logger.debug(`Generating invitation link for user: ${JSON.stringify(req.user)}`);
    const invitationLink = await this.userService.generateInvitationLink(req.user.username);
    return { invitationLink };
  }
  // Track invitation link usage
  @Post('invitation-link/track')
  @ApiOperation({ summary: 'Track the usage of an invitation link' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        invitationLink: { type: 'string', example: 'http://advansistechnologies.com/invite/20241016/Peprah/a17fe6dd-cdf6-4aca-b91d-522420026dc4' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Invitation link usage tracked successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invitation link usage tracked and points awarded' },
        updatedUser: {
          type: 'object',
          properties: {
            totalPointsEarned: { type: 'number', example: 110 },
            points: { type: 'number', example: 160 },
            invitationLinks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  link: { type: 'string', example: 'http://advansistechnologies.com/invite/20241016/Peprah/a17fe6dd-cdf6-4aca-b91d-522420026dc4' },
                  lastUsed: { type: 'string', format: 'date-time', example: '2024-10-17T10:30:00.000Z' },
                  usageCount: { type: 'number', example: 4 },
                  pointsEarned: { type: 'number', example: 40 }
                }
              }
            }
          }
        }
      }
    }
  })
  async trackInvitationLinkUsage(@Body('invitationLink') invitationLink: string) {
    this.logger.debug(`Tracking invitation link usage: ${invitationLink}`);
    const updatedUser = await this.userService.trackInvitationLinkUsage(invitationLink);
    return {
      message: 'Invitation link usage tracked and points awarded',
      updatedUser: {
        totalPointsEarned: updatedUser.totalPointsEarned,
        points: updatedUser.points,
        invitationLinks: updatedUser.invitationLinks
      }
    };
  }
  // Get invitation link stats
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('invitation-link/stats')
  @ApiOperation({ summary: 'Get statistics for the user\'s invitation links' })
  @ApiResponse({
    status: 200,
    description: 'Invitation link statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalUsageCount: { type: 'number', example: 10 },
        totalPointsEarned: { type: 'number', example: 100 },
        invitationLinks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              link: { type: 'string', example: 'https://example.com/invite/yyyymmdd/abc123' },
              createdAt: { type: 'string', format: 'date-time', example: '2023-04-01T12:00:00Z' },
              lastUsed: { type: 'string', format: 'date-time', example: '2023-04-05T15:30:00Z', nullable: true },
              usageCount: { type: 'number', example: 3 },
              pointsEarned: { type: 'number', example: 30 }
            }
          }
        }
      }
    }
  })
  async getInvitationLinkStats(@Request() req) {
    const userId = req.user.sub;
    return this.userService.getInvitationLinkStats(userId);
  }
  // Email Verification
  @UseGuards(JwtAuthGuard)
  @Get('verify-email/:token')
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email verified successfully' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid verification token',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid verification token' }
      }
    }
  })
  @ApiParam({ name: 'token', description: 'Email verification token', example: 'abc123' })
  @ApiParam({ name: 'email', description: 'User email', example: 'user@example.com' })
  async verifyEmail(@Param('token') token: string, @Request() req) {
    try {
      this.logger.debug(`User request for email ==> ${req.user}`);
      const user = await this.userService.verifyEmail(req.user.email, token);
      return { message: 'Email verified successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      } else if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid verification token');
      } else {
        throw new InternalServerErrorException('Failed to verify email');
      }
    }
  }
  // Resend Verification Email
  @Post('resend-verification-email')
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiResponse({
    status: 200,
    description: 'Verification email resent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Verification email resent successfully' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'User is already verified',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User is already verified' }
      }
    }
  })
  async resendVerificationEmail(@Body('email') email: string) {
    try {
      await this.userService.resendVerificationEmail(email);
      return { message: 'Verification email resent successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException('User is already verified');
      } else {
        throw new InternalServerErrorException('Failed to resend verification email');
      }
    }
  }
  // Phone Number Verification
  @Post('verify-phone')
  @ApiOperation({ summary: 'Verify user phone number' })
  @ApiResponse({
    status: 200,
    description: 'Phone number verified successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Phone number verified successfully' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid verification code',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid verification code' }
      }
    }
  })
  async verifyPhoneNumber(@Body('phoneNumber') phoneNumber: string, @Body('verificationCode') verificationCode: string) {
    try {
      await this.userService.verifyPhoneNumber(phoneNumber, verificationCode);
      return { message: 'Phone number verified successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException('Invalid verification code');
      } else {
        throw new InternalServerErrorException('Failed to verify phone number');
      }
    }
  }
  // Resend Phone Verification Code
  @Post('resend-phone-verification-code')
  @ApiOperation({ summary: 'Resend phone verification code' })
  @ApiResponse({
    status: 200,
    description: 'Verification code resent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Verification code resent successfully' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User not found' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'User is already verified',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User is already verified' }
      }
    }
  })
  async resendPhoneVerificationCode(@Body('phoneNumber') phoneNumber: string) {
    try {
      await this.userService.sendPhoneNumberVerificationCode(phoneNumber);
      return { message: 'Verification code resent successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException('User is already verified');
      } else {
        throw new InternalServerErrorException('Failed to resend verification code');
      }
    }
  }
  // Reset Password
  @Post('reset-password')
  @ApiOperation({ summary: 'Initiate password reset' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@example.com' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset initiated successfully',
    schema: {
      example: {
        message: 'Password reset link sent to your email',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async resetPassword(@Body('email') email: string, @Body('phoneNumber') phoneNumber?: string) {
    try {
      const identifier = email || phoneNumber;
      return await this.authService.resetPassword(identifier);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to initiate password reset');
    }
  }
  // Create or update wallet
  @UseGuards(JwtAuthGuard)
  @Post('wallet')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update user wallet' })
  @ApiResponse({
    status: 200,
    description: 'Wallet created or updated successfully',
    type: Wallet,
  })
  @ApiBody({
    description: 'Wallet data',
    type: Wallet,
  })
  async createOrUpdateWallet(@Request() req, @Body() walletData: Wallet) {
    return this.userService.createOrUpdateWallet(req.user.sub, walletData);
  }
   // Get wallet by ID
   @UseGuards(JwtAuthGuard)
   @Get('wallet/:id')
   @ApiBearerAuth()
   @ApiOperation({ summary: 'Get wallet by ID' })
   @ApiResponse({
     status: 200,
     description: 'Wallet retrieved successfully',
     type: Wallet,
   })
   @ApiResponse({
     status: 404,
     description: 'Wallet not found',
   })
   @ApiParam({ name: 'id', description: 'Wallet ID', required: true })
   async getWalletById(@Param('id') walletId: string) {
     const wallet = await this.userService.getWalletById(walletId);
     if (!wallet) {
       throw new NotFoundException('Wallet not found');
     }
     return wallet;
   }
  // Get wallet by user Id
  @UseGuards(JwtAuthGuard)
  @Get('wallet/user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user wallet' })
  @ApiResponse({
    status: 200,
    description: 'User wallet retrieved successfully',
    type: Wallet,
  })
  async getWalletUserId(@Request() req) {
    const userId = req.user.sub; // Ensure this is the correct user ID
    this.logger.debug(`User request for wallet ==> ${userId}`);
    const wallet = await this.userService.getWalletByUserId(userId);
    this.logger.debug(`Retrieved wallet for user ${userId}: ${JSON.stringify(wallet)}`);
    if (!wallet) {
        throw new NotFoundException(`Wallet not found for user ID: ${userId}`);
    }
    return wallet;
  }
  // Delete wallet by user ID
  @UseGuards(JwtAuthGuard)
  @Delete('wallet')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user wallet' })
  @ApiResponse({
    status: 200,
    description: 'Wallet successfully deleted',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Wallet successfully deleted' },
      },
    },
  })
  async deleteWallet(@Request() req) {
    return this.userService.deleteWalletByUserId(req.user.sub);
  }
  // Other endpoints...
  @Get('account')
  @UseGuards(JwtAuthGuard) // Protect the route with authentication
  @ApiOperation({ summary: 'Get user account' })
  @ApiResponse({
    status: 200,
    description: 'User account retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '5f9f1c82f77a8a2b8c9d0e1f' },
        userId: { type: 'string', example: '5f9f1c82f77a8a2b8c9d0e1f' },
        balance: { type: 'number', example: 1000 },
        transactions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '5f9f1c82f77a8a2b8c9d0e1f' },
              amount: { type: 'number', example: 500 },
              date: { type: 'string', example: '2023-04-02T10:30:00Z' },
              type: { type: 'string', example: 'DEPOSIT' },
            },
          },
        },
      },
    },
  })
  async getUserAccount(@Request() req): Promise<AccountDocument> {
    const userId = req.user.sub; // Ensure this is the correct user ID
    this.logger.debug(`User request for user account ==> ${userId}`);
    const userAccount = await this.userService.getUserAccount(userId);
    this.logger.debug(`Retrieved user account for user ${userId}: ${JSON.stringify(userAccount)}`);
    if (!userAccount) {
        throw new NotFoundException(`User account not found for user ID: ${userId}`);
    }
    return userAccount;
  }
}
