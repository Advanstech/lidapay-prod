import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AffiliateService } from './affiliate.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateAffiliateDto } from './dto/create.affiliate.dto';

@ApiTags('Affiliate')
@Controller('api/v1/affiliate')
export class AffiliateController {
  private readonly logger = new Logger(AffiliateController.name);

  constructor(private readonly affiliateService: AffiliateService) {}
  // Create a new affiliate
  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new affiliate' })
  @ApiBody({
    description: 'Create Affiliate DTO',
    schema: {
      type: 'object',
      properties: {
        referralCode: {
          type: 'string',
          description: 'The referral code for the affiliate',
          example: 'ABC123',
        },
        referredBy: {
          type: 'string',
          description: 'The email of the user who referred the affiliate',
          example: 'user@example.com',
        },
      },
      required: ['referralCode', 'referredBy'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The affiliate has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createAffiliate(
    @Body() createAffiliateDto: CreateAffiliateDto,
    @Request() req,
  ) {
    this.logger.log(`Creating affiliate for user: ${JSON.stringify(req.user)}`);
    const user = req.user;
    const affiliate = {
      ...createAffiliateDto,
      referredBy: user.userId,
      email: user.email,
      name: user.username,
    };
    return this.affiliateService.createAffiliate(affiliate);
  }
  // Find all affiliates
  @Get('all')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all affiliates' })
  @ApiResponse({ status: 200, description: 'Affiliates found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAllAffiliates() {
    return this.affiliateService.findAllAffiliates();
  }
  // Get a referral by code
  @Get(':code')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get referral by code' })
  @ApiResponse({ status: 200, description: 'Referral found.' })
  @ApiResponse({ status: 404, description: 'Referral not found.' })
  @ApiParam({ name: 'code', type: 'string', description: 'Referral code' })
  getReferralByCode(@Param('code') code: string) {
    return this.affiliateService.getReferralByCode(code);
  }
  // Get dashboard summary
  @Get('dashboard/summary')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get dashboard summary' })
  @ApiResponse({ status: 200, description: 'Dashboard summary retrieved.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getDashboardSummary() {
    return this.affiliateService.getDashboardSummary();
  }
  // Get top performing affiliates
  @Post('trigger-commission-update')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Trigger commission update' })
  @ApiResponse({
    status: 200,
    description: 'Commission update triggered successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ description: 'Trigger commission update' })
  async triggerCommissionUpdate() {
    await this.affiliateService.updateAffiliateCommissions();
    return { message: 'Commission update triggered successfully' };
  }
}
