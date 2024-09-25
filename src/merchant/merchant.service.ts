import { Injectable, NotFoundException, ConflictException, BadRequestException, forwardRef, Inject, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Merchant, MerchantDocument } from './schemas/merchant.schema';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { v4 as uuidv4 } from 'uuid';
import { PasswordUtil } from 'src/utilities/password.util';
import { TokenUtil } from 'src/utilities/token.util';
import { generateQrCode } from 'src/utilities/qr-code.util';
import { EMAIL_VERIFICATION_REWARD_POINTS, JWT_SECRET, MERCHANT_INVITATION_LINK_REWARD_POINTS, PHONE_VERIFICATION_REWARD_POINTS, QR_CODE_SCAN_REWARD_POINTS } from 'src/constants';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/utilities/email.service';
import { NotificationService } from 'src/notification/notification.service';
import { EmailTemplates } from 'src/utilities/email-templates';
import { NodemailService } from 'src/utilities/nodemail.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MerchantService {
  private logger = new Logger(MerchantService.name);
  private emailVerifyRewardPoints = process.env.EMAIL_VERIFICATION_REWARD_POINTS || EMAIL_VERIFICATION_REWARD_POINTS;
  private phoneVerifyRewardPoints = process.env.PHONE_VERIFICATION_REWARD_POINTS || PHONE_VERIFICATION_REWARD_POINTS;

  constructor(
    @InjectModel(Merchant.name) private readonly merchantModel: Model<MerchantDocument>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private emailService: EmailService,
    private notificationService: NotificationService,
    private nodemailService: NodemailService,
    private readonly jwtService: JwtService,
  ) { }

  // Create a new merchant
  async create(createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    // Check if a merchant with the same email or phone number already exists
    const existingMerchant = await this.merchantModel.findOne({
      $or: [
        { email: createMerchantDto.email },
        { phoneNumber: createMerchantDto.phoneNumber }
      ]
    }).exec();

    if (existingMerchant) {
      throw new ConflictException('A merchant with this email or phone number already exists');
    }

    const hashedPassword = await PasswordUtil.hashPassword(createMerchantDto.password);
    const clientId = uuidv4();
    const clientKey = TokenUtil.generateToken({ clientId }, '365d'); // Client key valid for 1 year

    const qrCode = await generateQrCode(clientId);

    const merchantData = {
      ...createMerchantDto,
      password: hashedPassword,
      clientId,
      clientKey,
      qrCode,
      roles: createMerchantDto.roles ?? ['merchant'],
      address: [
        {
          ghanaPostGPS: createMerchantDto.ghanaPostGPS,
          street: createMerchantDto.street,
          city: createMerchantDto.city,
          state: createMerchantDto.state,
          zip: createMerchantDto.zip,
          country: createMerchantDto.country,
        }
      ]
    };

    const createdMerchant = new this.merchantModel(merchantData);
    return createdMerchant.save();
  }

  // Merchant login
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
      const refreshToken = this.authService.generateRefreshToken(payload);

      // Update last login timestamp
      await this.updateLastLogin(merchant._id);

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

  async findMerchantById(id: string): Promise<Merchant> {
    const merchant = await this.merchantModel.findById(id).exec();
    if (!merchant) {
      throw new NotFoundException(`Merchant with ID "${id}" not found`);
    }
    return merchant;
  }

  // Find a merchant by clientId
  async findOneByClientId(clientId: string): Promise<Merchant> {
    const merchant = await this.merchantModel.findOne({ clientId }).exec();
    if (!merchant) {
      throw new NotFoundException(`Merchant with clientId "${clientId}" not found`);
    }
    return merchant;
  }

  // Update a merchant
  async update(merchantId: string, updateMerchantDto: UpdateMerchantDto): Promise<Merchant> {
    const updateData: Partial<Merchant> = {
      ...updateMerchantDto,
      address: [
        {
          ghanaPostGPS: updateMerchantDto.ghanaPostGPS,
          street: updateMerchantDto.street,
          city: updateMerchantDto.city,
          state: updateMerchantDto.state,
          zip: updateMerchantDto.zip,
          country: updateMerchantDto.country
        }
      ]
    };

    if (updateData.password) {
      updateData.password = await PasswordUtil.hashPassword(updateData.password);
    }

    const updatedMerchant = await this.merchantModel.findByIdAndUpdate(
      merchantId,
      updateData,
      { new: true, runValidators: true }
    ).exec();

    if (!updatedMerchant) {
      throw new NotFoundException(`Merchant with ID "${merchantId}" not found`);
    }

    return updatedMerchant;
  }

  // Delete a merchant
  async delete(merchantId: string): Promise<void> {
    const result = await this.merchantModel.findByIdAndDelete(merchantId).exec();
    if (!result) {
      throw new NotFoundException(`Merchant with ID "${merchantId}" not found`);
    }
  }

  // Update last login
  async updateLastLogin(merchantId: string): Promise<void> {
    await this.merchantModel.findByIdAndUpdate(merchantId, { lastLogin: new Date() });
  }

  // Find all registered merchants
  async findAllRegisteredMerchants(): Promise<{ merchants: Merchant[]; total: number }> {
    const merchants = await this.merchantModel.find().exec();
    const total = merchants.length;
    return { merchants, total };
  }

  async updateRewardPoints(clientId: string, points: number): Promise<void> {
    const result = await this.merchantModel.updateOne(
      { clientId },
      { $inc: { rewardPoints: points } }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException('Merchant not found');
    }

    // Here you could add logic to check for level-ups or other reward milestones
    // await this.checkMerchantRewardMilestones(clientId);
  }

  // Change Merchant password
  async changePassword(clientId: string, currentPassword: string, newPassword: string): Promise<void> {
    const merchant = await this.merchantModel.findOne({ clientId }).select('+password');
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const isPasswordValid = await PasswordUtil.comparePassword(currentPassword, merchant.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different from the current password');
    }

    const hashedPassword = await PasswordUtil.hashPassword(newPassword);
    await this.merchantModel.updateOne(
      { clientId },
      { $set: { password: hashedPassword } },
    );
  }

  /**
   * Update the client token for a merchant
   * @param clientId The client ID of the merchant
   * @param newClientKey The new client token
   */
  async updateClientToken(clientId: string, newClientKey: string): Promise<void> {
    const result = await this.merchantModel.updateOne(
      { clientId },
      { $set: { clientKey: newClientKey } }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException('Merchant not found');
    }

    const merchant = await this.merchantModel.findOne({ clientId }, { _id: 0, name: 1, email: 1 });
    if (merchant) {
      // this.notificationService.sendMerchantTokenUpdate(merchant.name, merchant.email, newClientKey);
      // send email
      await this.emailService.sendMail(merchant.email, 'Merchant client token update', `Your new client token is ${newClientKey}`);
      // send sms
    } else {
      throw new NotFoundException('Merchant not found');
    }

  }

  // Track QR code usage
  async trackQRCodeUsage(clientId: string): Promise<Merchant> {
    const updatedMerchant = await this.merchantModel.findOneAndUpdate(
      { clientId },
      {
        $inc: { qrCodeUsageCount: 1 },
        $set: { lastQRCodeUsage: new Date() }
      },
      { new: true, runValidators: true }
    );

    if (!updatedMerchant) {
      throw new NotFoundException('Merchant not found');
    }

    // Award points using the existing updateRewardPoints method
    await this.updateRewardPoints(clientId, QR_CODE_SCAN_REWARD_POINTS);

    return updatedMerchant;
  }

  // Get QR code usage stats
  async getQRCodeUsageStats(clientId: string): Promise<{ usageCount: number; lastUsed: Date | null }> {
    const merchant = await this.merchantModel.findOne({ clientId }, 'qrCodeUsageCount lastQRCodeUsage');

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return {
      usageCount: merchant.qrCodeUsageCount || 0,
      lastUsed: merchant.lastQRCodeUsage || null,
    };
  }

  // Generate invitation link
  async generateInvitationLink(merchantId: string): Promise<string> {
    const merchant = await this.merchantModel.findById(merchantId);
    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const invitationLink = `${process.env.APP_URL}/merchant-invite/${uuidv4()}`;
    merchant.invitationLink = invitationLink;
    await merchant.save();

    return invitationLink;
  }

  // Track invitation link usage
  async trackInvitationLinkUsage(invitationLink: string): Promise<Merchant> {
    const merchant = await this.merchantModel.findOne({ invitationLink });
    if (!merchant) {
      throw new NotFoundException('Invalid invitation link');
    }

    const updatedMerchant = await this.merchantModel.findByIdAndUpdate(
      merchant._id,
      {
        $inc: { invitationLinkUsageCount: 1 },
        $set: { lastInvitationLinkUsage: new Date() }
      },
      { new: true, runValidators: true }
    );

    // Award points
    await this.updateRewardPoints(merchant.clientId, MERCHANT_INVITATION_LINK_REWARD_POINTS);

    return updatedMerchant;
  }

  // Get invitation link stats
  async getInvitationLinkStats(clientId: string): Promise<{ usageCount: number; lastUsed: Date | null }> {
    const merchant = await this.merchantModel.findOne({ clientId }, 'invitationLinkUsageCount lastInvitationLinkUsage');

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return {
      usageCount: merchant.invitationLinkUsageCount || 0,
      lastUsed: merchant.lastInvitationLinkUsage || null,
    };
  }

    // user account verification by email
    async verifyEmail(email: string, token: string): Promise<Merchant> {
      const merchant = await this.merchantModel.findOne({ email });
  
      if (!merchant) {
        throw new NotFoundException('merchant not found');
      }
  
      if (merchant.verificationToken !== token) {
        throw new UnauthorizedException('Invalid verification token');
      }
  
      if (merchant.emailVerified) {
        return merchant;
      }
  
      merchant.emailVerified = true;
      merchant.verificationToken = null;
      await merchant.save();
  
      // Send a confirmation email after successful verification
      try {
        await this.nodemailService.sendMail(
          merchant.email,
          'Email Verification Successful',
          EmailTemplates.emailVerificationSuccess(merchant.name)
        );
      } catch (emailError) {
        this.logger.error(`Failed to send verification success email: ${emailError.message}`);
        // Consider adding the email to a queue for retry
      }
    }
  
    async resendVerificationEmail(email: string): Promise<void> {
      const merchant = await this.merchantModel.findOne({ email });
  
      if (!merchant) {
        throw new NotFoundException('merchant not found');
      }
  
      if (merchant.emailVerified) {
        throw new BadRequestException('merchant is already verified');
      }
  
      const verificationToken = uuidv4();
  
      merchant.verificationToken = verificationToken;
      merchant.emailVerificationToken = verificationToken; // 
      merchant.points += Number(this.emailVerifyRewardPoints); // Convert to number to avoid type error
       // Ensure merchant interface has verificationToken
      await merchant.save();
  
      await this.sendVerificationEmail(merchant, verificationToken);
    }
  
    async sendVerificationEmail(merchant: Merchant, verificationToken: string): Promise<void> {
      const url = `${process.env.DOMAIN_URL}/auth/verify-email/${verificationToken}`;
      const message = `Click the link below to verify your email address: ${url}`;
  
      await this.emailService.sendMail(merchant.email, 'Verify your email address', message);
    }

  // Other merchant management methods...
}