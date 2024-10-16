import { ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvitationLink, User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { PasswordUtil } from '../utilities/password.util';
import { ValidationUtil } from '../utilities/validation.util';
import { EmailService } from '../utilities/email.service';
import { NodemailService } from '../utilities/nodemail.service';
import { generateQrCode } from '../utilities/qr-code.util'; // Import QR code utility
import { SmsService } from 'src/utilities/sms.util';
import { GravatarService } from 'src/utilities/gravatar.util';
import { MerchantService } from 'src/merchant/merchant.service';
import { EmailTemplates } from 'src/utilities/email-templates';
import { EMAIL_VERIFICATION_REWARD_POINTS, PHONE_VERIFICATION_REWARD_POINTS, QR_CODE_SCAN_REWARD_POINTS } from 'src/constants';
import { v4 as uuidv4 } from 'uuid';
import { INVITATION_LINK_REWARD_POINTS } from 'src/constants';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { TokenUtil } from 'src/utilities/token.util';
import { NotificationService } from 'src/notification/notification.service';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import { LidapayAccount, LidapayAccountDocument } from './schemas/lidapay-account.schema'; // Import Lidapay account schema
import { Wallet, WalletDocument } from './schemas/wallet.schema';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  private emailVerifyRewardPoints = process.env.EMAIL_VERIFICATION_REWARD_POINTS || EMAIL_VERIFICATION_REWARD_POINTS;
  private phoneVerifyRewardPoints = process.env.PHONE_VERIFICATION_REWARD_POINTS || PHONE_VERIFICATION_REWARD_POINTS;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private emailService: EmailService,
    private nodemailService: NodemailService,
    private smsService: SmsService,
    private gravatarService: GravatarService,
    private readonly merchantService: MerchantService,
    private notificationService: NotificationService
  ) { }

  // Create a new user
  async create(userDto: CreateUserDto): Promise<User> {
    try {
      if (!ValidationUtil.isValidEmail(userDto.email)) {
        throw new Error('Invalid email address');
      }
      // Check for existing user
      const existingUser = await this.userModel.findOne({
        $or: [
          { email: userDto.email },
          { username: userDto.phoneNumber || userDto.mobile }
        ]
      });

      if (existingUser) {
        throw new ConflictException('User with this email or phone number already exists');
      }

      const hashedPassword = await PasswordUtil.hashPassword(userDto.password);
      const gravatarUrl = await this.gravatarService.fetchAvatar(userDto.email);
      // Initialize wallet and Lidapay account for the user
      const wallet = new Wallet(); // Create a new wallet instance
      const lidapayAccount = new LidapayAccount(); // Create a new Lidapay account instance
      const createdUser = new this.userModel({
        ...userDto,
        password: hashedPassword,
        wallet,
        lidapayAccount // Add Lidapay account to user
      });

      if (createdUser.roles && createdUser.roles.some(role => role.toLowerCase() === 'agent')) {
        this.logger.debug(`User QrCode Generating ==>`);
        createdUser.qrCode = await generateQrCode(createdUser._id.toString());
      }

      createdUser.username = userDto.phoneNumber || userDto.mobile;
      createdUser.points = 0; // Initialize points
      createdUser.gravatar = gravatarUrl;
      await createdUser.save();
      // Send welcome email
      try {
        await this.nodemailService.sendMail(
          userDto.email,
          'Welcome to Lidapay App 👋',
          EmailTemplates.welcomeEmail(userDto.firstName)
        );
      } catch (emailError) {
        this.logger.error(`Failed to send welcome email: ${emailError.message}`);
        // Consider adding the email to a queue for retry later
      }
      // await this.smsService.sendSms(userDto.phoneNumber, 'Welcome to our airtime and internet data service!');
      if (userDto.referrerClientId) {
        await this.merchantService.updateRewardPoints(userDto.referrerClientId, 10); // Example reward points
      }
      return createdUser;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      if (error instanceof ConflictException) {
        throw error; // Re-throw ConflictException
      }
      // Handle other creation errors
      throw new Error(`Failed to create user: ${error.message}`);
    }

  }
  // Find a user by username
  async findOneByUsername(username: string): Promise<User | undefined> {
    if (!username) {
      throw new Error('Username is required');
    }
    return this.userModel.findOne({ username }).exec();
  }
  // Find a user by email
  async findOneByEmail(email: string): Promise<User | undefined> {
    if (!email) {
      throw new Error('Email is required');
    }
    return this.userModel.findOne({ email }).exec();
  }
  // Find one by either email or phoneNumber
  async findOneByEmailOrPhoneNumber(email: string, phoneNumber?: string): Promise<User | undefined> {
    if (!email && !phoneNumber) {
      throw new Error('Email or phone number is required');
    }
    return this.userModel.findOne({ $or: [{ email }, { phoneNumber }] }).exec();
  }
  // Find a user by phone number  
  async findOneByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    if (!phoneNumber) {
      throw new Error('Phone number is required');
    }
    return this.userModel.findOne({ phoneNumber }).exec();
  }
  // Find a user by ID
  async findOneById(userId: string): Promise<User | undefined> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.userModel.findById(userId).exec();
  }
  // Update user profile
  async updateProfile(userId: string, updateData: any): Promise<User> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Invalid update data');
    }

    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true }).exec();
      if (!updatedUser) {
        throw new Error('User not found');
      }

      // Prepare notification data
      const notificationData: CreateNotificationDto = {
        userId: updatedUser.email, // Assuming _id is the user ID
        type: 'email',    // Set appropriate type
        subject: 'Profile Updated', // Set appropriate subject
        message: `Your profile has been updated successfully. Details: ${JSON.stringify(updatedUser)}` // Include updated details
      };
      // Notify user about the profile update using the existing notification module
      await this.notificationService.create(notificationData);

      return updatedUser;
    } catch (error) {
      // Handle update errors
      this.logger.error(`Failed to update user profile: ${error.message}`);
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Invalid update data');
      } else if (error.name === 'CastError') {
        throw new NotFoundException('User not found');
      } else {
        throw new InternalServerErrorException('Failed to update user profile');
      }
    }
  }
  // Add reward points
  async addPoints(userId: string, points: number): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { points: points } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    // Here you could add logic to check for level-ups or other reward milestones
    // await this.checkRewardMilestones(updatedUser);

    return updatedUser;
  }
  // Find all users
  async findAll(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    users: User[],
    totalCount: number,
    totalPages: number
  }> {
    const skip = (page - 1) * limit;
    try {
      const users = await this.userModel.find().skip(skip).limit(limit).exec();
      const totalCount = await this.userModel.countDocuments().exec();
      const totalPages = Math.ceil(totalCount / limit);
      return { users, totalCount, totalPages };
    } catch (error) {
      // Handle errors
      this.logger.error(`Failed to get all users: ${error.message}`);
      throw new InternalServerErrorException('Failed to get all users');
    }
  }
  // Delete user by id
  async deleteUserById(userId: string): Promise<{ message: string }> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    try {
      const result = await this.userModel.findByIdAndDelete(userId).exec();
      if (!result) {
        throw new NotFoundException('User not found');
      }
      return { message: 'User successfully deleted' };
    } catch (error) {
      // Handle deletion errors
      this.logger.error(`Failed to delete user: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
  // Delete all users
  async deleteAllUsers(): Promise<{ message: string }> {
    try {
      await this.userModel.deleteMany({}).exec();
      return { message: 'All users successfully deleted' };
    } catch (error) {
      // Handle deletion errors
      this.logger.error(`Failed to delete all users: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete all users');
    }
  }
  // Update password
  async updatePassword(userId: string, newHashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { password: newHashedPassword });
  }

  async trackQRCodeUsage(userId: string): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $inc: { qrCodeUsageCount: 1 },
        $set: { lastQRCodeUsage: new Date() }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    // Award points using the existing addPoints method
    await this.addPoints(userId, QR_CODE_SCAN_REWARD_POINTS);

    return updatedUser;
  }

  async getQRCodeUsageStats(userId: string): Promise<{ usageCount: number; lastUsed: Date | null }> {
    const user = await this.userModel.findById(userId, 'qrCodeUsageCount lastQRCodeUsage');

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      usageCount: user.qrCodeUsageCount || 0,
      lastUsed: user.lastQRCodeUsage || null,
    };
  }
  // Get add reward points
  async awardPoints(userId: string, points: number): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { points: points } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }
  // Generate Invitation Link
  async generateInvitationLink(username: string): Promise<string> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentDate = new Date().toISOString().replace(/-/g, '').slice(0, 8);
    const invitationLink = `${process.env.DOMAIN_URL}/invite/${currentDate}/${user.firstName}/${uuidv4()}`;

    const newInvitationLink = {
      link: invitationLink,
      createdAt: new Date(),
      lastUsed: null,
      usageCount: 0,
      pointsEarned: 0
    };

    user.invitationLinks.push(newInvitationLink);
    await user.save();

    this.logger.log(`User generated link => ${invitationLink}`);
    return invitationLink;
  }
  // Track Invitation Link Usage
  async trackInvitationLinkUsage(invitationLink: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ 'invitationLinks.link': invitationLink });
      if (!user) {
        throw new NotFoundException('Invalid invitation link');
      }

      const linkIndex = user.invitationLinks.findIndex(link => link.link === invitationLink);
      if (linkIndex === -1) {
        throw new NotFoundException('Invitation link not found for this user');
      }

      const INVITATION_LINK_REWARD_POINTS = 10; // You might want to make this configurable

      // Update the specific invitation link
      user.invitationLinks[linkIndex].lastUsed = new Date();
      user.invitationLinks[linkIndex].usageCount += 1;
      user.invitationLinks[linkIndex].pointsEarned += INVITATION_LINK_REWARD_POINTS;

      // Update total points earned and user's points
      user.totalPointsEarned = (user.totalPointsEarned || 0) + INVITATION_LINK_REWARD_POINTS;
      user.points = (user.points || 0) + INVITATION_LINK_REWARD_POINTS;

      const updatedUser = await user.save();

      if (!updatedUser) {
        throw new NotFoundException('User not found after update');
      }

      return updatedUser;
    } catch (error) {
      this.logger.error(`Failed to track invitation link usage: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to track invitation link usage');
    }
  }
  // Get Invitation Link Stats
  async getInvitationLinkStats(userId: string): Promise<{
    totalUsageCount: number;
    totalPointsEarned: number;
    userTotalPoints: number;
    invitationLinks: InvitationLink[];
  }> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const totalUsageCount = user.invitationLinks.reduce((sum, link) => sum + link.usageCount, 0);
    const totalPointsEarned = user.totalPointsEarned || 0;

    return {
      totalUsageCount,
      totalPointsEarned,
      userTotalPoints: user.points || 0,
      invitationLinks: user.invitationLinks
    };
  }
  // user account verification by email
  async verifyEmail(email: string, token: string): Promise<User> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verificationToken !== token) {
      throw new UnauthorizedException('Invalid verification token');
    }

    if (user.emailVerified) {
      return user;
    }

    user.emailVerified = true;
    user.verificationToken = null;
    await user.save();
    // Send a confirmation email after successful verification
    try {
      await this.nodemailService.sendMail(
        user.email,
        'Email Verification Successful',
        EmailTemplates.emailVerificationSuccess(user.firstName)
      );
    } catch (emailError) {
      this.logger.error(`Failed to send verification success email: ${emailError.message}`);
      // Consider adding the email to a queue for retry
    }
  }
  // resend verification email
  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('User is already verified');
    }

    const verificationToken = uuidv4();

    user.verificationToken = verificationToken;
    user.emailVerificationToken = verificationToken; // 
    user.points += Number(this.emailVerifyRewardPoints); // Convert to number to avoid type error
    // Ensure User interface has verificationToken
    await user.save();

    await this.sendVerificationEmail(user, verificationToken);
  }
  // send verifiation email
  async sendVerificationEmail(user: User, verificationToken: string): Promise<void> {
    const url = `${process.env.DOMAIN_URL}/auth/verify-email/${verificationToken}`;
    const message = `Click the link below to verify your email address: ${url}`;

    await this.emailService.sendMail(user.email, 'Verify your email address', message);
  }

  // User account verification by phone number with optional reward points
  async verifyPhoneNumber(phoneNumber: string, verificationCode: string): Promise<void> {
    const user = await this.userModel.findOne({ phoneNumber });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.phoneVerified) {
      throw new BadRequestException('User is already verified');
    }
    if (verificationCode !== user.phoneNumberVerificationCode) {
      throw new BadRequestException('Invalid verification code');
    }
    user.phoneVerified = true;
    user.phoneNumberVerificationCode = null;
    // Optionally, reward points for verifying phone number
    user.points += Number(this.phoneVerifyRewardPoints); // Convert to number to avoid type error
    await user.save();
  }

  // New method to generate and send verification code
  async sendPhoneNumberVerificationCode(phoneNumber: string): Promise<void> {
    const user = await this.userModel.findOne({ phoneNumber });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const verificationCode = TokenUtil.generateVerificationCode(); // Generate a new verification code
    user.phoneNumberVerificationCode = verificationCode; // Store the code in the user document
    await user.save();

    // Send the verification code via SMS (assuming you have an SMS service)
    await this.smsService.sendSms(phoneNumber, `Your verification code is: ${verificationCode}`);
  }

  // New method to validate wallet before transactions
  async validateWallet(userId: string): Promise<void> {
    const user = await this.userModel
      .findById(userId)
      .populate('wallet') // Populate wallet details
      .exec(); // Ensure that the query is executed

    if (!user || !user.wallet) {
      throw new NotFoundException('User or wallet not found');
    }

    // Type assertion: tell TypeScript that `user.wallet` is a populated WalletDocument
    const wallet = user.wallet as any;

    // Check if the user has at least one mobile money account or card (credit/debit)
    const hasMobileMoney = wallet.mobileMoneyAccounts && wallet.mobileMoneyAccounts.length > 0;
    const hasCard = wallet.cardDetails && wallet.cardDetails.length > 0;

    if (!hasMobileMoney && !hasCard) {
      throw new BadRequestException('User must have at least one payment method in their wallet');
    }
  }

  // Example of using validateWallet in a transaction method
  async purchaseAirtime(userId: string, amount: number): Promise<void> {
    await this.validateWallet(userId); // Ensure wallet is valid before proceeding
    // Logic for purchasing airtime...
  }
  // New method to validate wallet and Lidapay account before transactions
  async validateUserAccounts(userId: string): Promise<void> {
    const user = await this.userModel
      .findById(userId)
      .populate('wallet lidapayAccount') // Populate wallet and Lidapay account details
      .exec(); // Ensure the query is executed

    if (!user || !user.wallet || !user.lidapayAccount) {
      throw new NotFoundException('User, wallet, or Lidapay account not found');
    }

    // Type assertion: cast wallet and Lidapay account safely using 'unknown'
    const wallet = user.wallet as unknown as WalletDocument;
    const lidapayAccount = user.lidapayAccount as unknown as LidapayAccountDocument;

    // Check if the user has at least one mobile money account or card (credit/debit) in the wallet
    const hasMobileMoney = wallet.mobileMoneyAccounts && wallet.mobileMoneyAccounts.length > 0;
    const hasCard = wallet.cardDetails && wallet.cardDetails.length > 0;

    if (!hasMobileMoney && !hasCard) {
      throw new BadRequestException('User must have at least one payment method in their wallet');
    }

    // Additional checks for Lidapay account (e.g., checking balance) can be added here if needed
    if (lidapayAccount.balance <= 0) {
      throw new BadRequestException('Insufficient funds in Lidapay account');
    }
  }



  // Other user management methods...
}
