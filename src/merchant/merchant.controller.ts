import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  UseGuards,
  Logger,
  NotFoundException,
  BadRequestException,
  Request,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { MerchantService } from './merchant.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Merchant } from './schemas/merchant.schema';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RewardService } from 'src/reward/reward.service';
import { MerchantInvitationLink } from './interface/merchant.interface';
import { MerchantInvitationLinkDto } from './dto/merchant-invitation-link.dto';
import { MerchantAuthGuard } from 'src/auth/merchant-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthService } from 'src/auth/auth.service';

@ApiTags('Merchants')
@Controller('api/v1/merchants')
export class MerchantController {
  private logger = new Logger(MerchantController.name);

  constructor(
    private readonly merchantService: MerchantService,
    private rewardsService: RewardService,
    private authService: AuthService,
  ) {}
  // Register a new merchant
  @Post('register')
  @ApiOperation({ summary: 'Register a new merchant' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created',
    type: Merchant,
  })
  @ApiBody({
    description: 'Merchant registration details',
    schema: {
      type: 'object',
      required: ['name', 'email', 'phoneNumber', 'password', 'country'],
      properties: {
        name: {
          type: 'string',
          description: 'The name of the merchant',
          example: 'Accra Supermarket',
        },
        email: {
          type: 'string',
          description: 'Email address of the merchant',
          example: 'info@accrasupermarket.com',
        },
        phoneNumber: {
          type: 'string',
          description: 'Phone number of the merchant',
          example: '+233241234567',
        },
        password: {
          type: 'string',
          description: 'Password for the merchant account',
          example: 'securePassword123!',
        },
        street: {
          type: 'string',
          description: 'Street address of the merchant',
          example: '123 Independence Avenue',
        },
        city: {
          type: 'string',
          description: 'City of the merchant',
          example: 'Accra',
        },
        ghanaPostGPS: {
          type: 'string',
          description: 'Ghana Post GPS location of the merchant',
          example: 'GA-123-4567',
        },
        state: {
          type: 'string',
          description: 'State or region of the merchant',
          example: 'Greater Accra',
        },
        zip: {
          type: 'string',
          description: 'Zip code of the merchant',
          example: '00233',
        },
        country: {
          type: 'string',
          description: 'Full country name (e.g., Nigeria, Ghana, United States)',
          example: 'Ghana',
        },
        businessType: {
          type: 'string',
          description: 'Type of business',
          example: 'Retail',
        },
        taxId: {
          type: 'string',
          description: 'Tax identification number',
          example: 'GH1234567890',
        },
      },
    },
  })
  async register(
    @Body() createMerchantDto: CreateMerchantDto,
  ): Promise<Merchant> {
    console.log(`createMerchantDto ==> ${JSON.stringify(createMerchantDto)}`);
    return this.merchantService.create(createMerchantDto);
  }
  // Merchant login
  @Post('login')
  @ApiOperation({ summary: 'Merchant login' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created',
    type: Merchant,
  })
  @ApiBody({
    description: 'Merchant login details',
    schema: {
      type: 'object',
      required: ['clientId', 'clientKey'],
      properties: {
        clientId: {
          type: 'string',
          description: 'The client ID of the merchant',
          example: 'accrasupermarket',
        },
        clientKey: {
          type: 'string',
          description: 'The client key of the merchant',
          example: 'securePassword123!',
        },
      },
    },
  })
  async merchantLogin(
    @Body() loginDto: { clientId: string; clientKey: string },
  ): Promise<any> {
    const merchant = await this.authService.validateMerchant(
      loginDto.clientId,
      loginDto.clientKey,
    );
    if (!merchant) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.merchantService.merchantLogin(merchant);
  }
  // Find a merchant by client ID
  @UseGuards(JwtAuthGuard)
  @Get('client/:id')
  @ApiOperation({ summary: 'Find a merchant by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found merchant',
    type: Merchant,
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Merchant ID', required: true })
  async findMerchantByClientId(
    @Param('id') merchantId: string,
  ): Promise<Merchant> {
    this.logger.log(`MERCHANT_ID ==> ${merchantId}`);
    return this.merchantService.findOneByClientId(merchantId);
  }
  // Find a merchant by ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Find a merchant by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found merchant',
    type: Merchant,
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Merchant ID',
    required: true,
    example: '1234567890',
  })
  async findMerchantById(@Param('id') merchantId: string): Promise<Merchant> {
    this.logger.log(`MERCHANT_ID ==> ${merchantId}`);
    return this.merchantService.findMerchantById(merchantId);
  }
  // Find all registered merchants
  @UseGuards(MerchantAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Find all registered merchants' })
  @ApiResponse({
    status: 200,
    description: 'List of merchants',
    type: [Merchant],
  })
  @ApiBearerAuth()
  async findAllMerchants(): Promise<{ merchants: Merchant[]; total: number }> {
    return this.merchantService.findAllRegisteredMerchants();
  }
  // Update a merchant
  @ApiOperation({ summary: 'Update a merchant' })
  @ApiResponse({
    status: 200,
    description: 'The updated merchant',
    type: Merchant,
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('update/:id')
  @ApiParam({ name: 'id', description: 'Merchant ID', required: true })
  async update(
    @Param('id') merchantId: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ): Promise<Merchant> {
    return this.merchantService.update(merchantId, updateMerchantDto);
  }
  // Delete a merchant
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a merchant' })
  @ApiResponse({
    status: 200,
    description: 'Merchant has been successfully removed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Merchant ID', required: true })
  async delete(
    @Request() req,
    @Param('id') merchantId: string,
  ): Promise<{ message: string }> {
    // Check if the authenticated user has permission to delete this merchant
    if (
      req.user.roles.includes('admin') ||
      req.user.merchantId === merchantId
    ) {
      try {
        await this.merchantService.delete(merchantId);
        return { message: 'Merchant has been successfully removed' };
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new NotFoundException(error.message);
        }
        throw error;
      }
    } else {
      throw new UnauthorizedException(
        'You do not have permission to delete this merchant',
      );
    }
  }
  // Get a merchant QR code
  @UseGuards(JwtAuthGuard)
  @Get(':clientId/qrcode')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a merchant QR code' })
  @ApiResponse({
    status: 200,
    description: 'QR code of the merchant',
    type: String,
  })
  @ApiParam({ name: 'clientId', description: 'Client ID', required: true })
  async getQRCode(@Param('clientId') clientId: string) {
    const merchant = await this.merchantService.findOneByClientId(clientId);
    return { qrCode: merchant.qrCode };
  }
  // Change merchant password
  @UseGuards(JwtAuthGuard)
  @Put(':clientId/change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change merchant password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiBody({
    description: 'Password change details',
    type: ChangePasswordDto,
  })
  @ApiParam({ name: 'clientId', description: 'Client ID', required: true })
  async changePassword(
    @Param('clientId') clientId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    try {
      await this.merchantService.changePassword(
        clientId,
        changePasswordDto.currentPassword,
        changePasswordDto.newPassword,
      );
      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
  // Track QR code usage for a merchant
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':clientId/track-qr-usage')
  @ApiOperation({ summary: 'Track QR code usage for a merchant' })
  @ApiResponse({
    status: 200,
    description: 'QR code usage tracked successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiParam({ name: 'clientId', description: 'Client ID', required: true })
  async trackQRCodeUsage(
    @Param('clientId') clientId: string,
  ): Promise<Merchant> {
    return this.merchantService.trackQRCodeUsage(clientId);
  }
  // Get QR code usage stats for a merchant
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':clientId/qr-usage-stats')
  @ApiOperation({ summary: 'Get QR code usage stats for a merchant' })
  @ApiResponse({
    status: 200,
    description: 'QR code usage stats retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiParam({ name: 'clientId', description: 'Client ID', required: true })
  async getQRCodeUsageStats(
    @Param('clientId') clientId: string,
  ): Promise<{ usageCount: number; lastUsed: Date | null }> {
    return this.merchantService.getQRCodeUsageStats(clientId);
  }
  // Scan QR code
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':clientId/scan-qr')
  @ApiOperation({ summary: 'Scan QR code' })
  @ApiResponse({
    status: 200,
    description: 'QR code scanned and points awarded',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiParam({ name: 'clientId', description: 'Client ID', required: true })
  async scanQRCode(@Param('clientId') clientId: string) {
    await this.merchantService.trackQRCodeUsage(clientId);
    await this.rewardsService.awardQRCodeScanPoints(clientId, 'merchant');
    return { message: 'QR code scanned and points awarded' };
  }
  // Generate invitation link
  @UseGuards(JwtAuthGuard, MerchantAuthGuard)
  @ApiBearerAuth()
  @Post('generate-invitation-link')
  @ApiOperation({ summary: 'Generate invitation link' })
  @ApiResponse({
    status: 200,
    description: 'Invitation link generated successfully',
    type: String,
  })
  async generateInvitationLink(
    @Request() req,
  ): Promise<{ invitationLink: string }> {
    const merchantId = req.user.merchantId;
    const invitationLink =
      await this.merchantService.generateInvitationLink(merchantId);
    return { invitationLink };
  }
  // Track invitation link usage
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('track-invitation-link/:invitationLink')
  @ApiOperation({ summary: 'Track invitation link usage' })
  @ApiResponse({
    status: 200,
    description: 'Invitation link usage tracked successfully',
    type: Merchant,
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  @ApiParam({
    name: 'invitationLink',
    description: 'Invitation link',
    required: true,
  })
  async trackInvitationLinkUsage(
    @Param('invitationLink') invitationLink: string,
  ): Promise<Merchant> {
    return this.merchantService.trackInvitationLinkUsage(invitationLink);
  }
  // Get invitation link stats
  @UseGuards(JwtAuthGuard, MerchantAuthGuard)
  @ApiBearerAuth()
  @Get('invitation-link-stats')
  @ApiOperation({ summary: 'Get invitation link stats' })
  @ApiResponse({
    status: 200,
    description: 'Invitation link stats retrieved successfully',
    type: MerchantInvitationLinkDto,
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async getInvitationLinkStats(
    @Request() req,
  ): Promise<MerchantInvitationLinkDto> {
    const clientId = req.user.merchantId;
    return this.merchantService.getInvitationLinkStats(clientId);
  }
}
