import { Model } from 'mongoose';
import { InvitationLink, User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailService } from '../utilities/email.service';
import { NodemailService } from '../utilities/nodemail.service';
import { SmsService } from 'src/utilities/sms.util';
import { GravatarService } from 'src/utilities/gravatar.util';
import { MerchantService } from 'src/merchant/merchant.service';
import { NotificationService } from 'src/notification/notification.service';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { AccountDocument } from './schemas/account.schema';
export declare class UserService {
    private userModel;
    private walletModel;
    private accountModel;
    private emailService;
    private nodemailService;
    private smsService;
    private gravatarService;
    private readonly merchantService;
    private notificationService;
    private logger;
    private emailVerifyRewardPoints;
    private phoneVerifyRewardPoints;
    constructor(userModel: Model<UserDocument>, walletModel: Model<WalletDocument>, accountModel: Model<AccountDocument>, emailService: EmailService, nodemailService: NodemailService, smsService: SmsService, gravatarService: GravatarService, merchantService: MerchantService, notificationService: NotificationService);
    create(userDto: CreateUserDto): Promise<User>;
    findOneByUsername(username: string): Promise<User | undefined>;
    findOneByEmail(email: string): Promise<User | undefined>;
    findOneByEmailOrPhoneNumber(email: string, phoneNumber?: string): Promise<User | undefined>;
    findOneByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
    findOneById(userId: string): Promise<User | undefined>;
    updateProfile(userId: string, updateData: any): Promise<User>;
    addPoints(userId: string, points: number): Promise<User>;
    findAll(page?: number, limit?: number): Promise<{
        users: User[];
        totalCount: number;
        totalPages: number;
    }>;
    deleteUserById(userId: string): Promise<{
        message: string;
    }>;
    suspendAccount(userId: string): Promise<User>;
    deleteAllUsers(): Promise<{
        message: string;
    }>;
    updatePassword(userId: string, newHashedPassword: string): Promise<void>;
    trackQRCodeUsage(userId: string): Promise<User>;
    getQRCodeUsageStats(userId: string): Promise<{
        usageCount: number;
        lastUsed: Date | null;
    }>;
    awardPoints(userId: string, points: number): Promise<User>;
    generateInvitationLink(username: string): Promise<string>;
    trackInvitationLinkUsage(invitationLink: string): Promise<User>;
    getInvitationLinkStats(userId: string): Promise<{
        totalUsageCount: number;
        totalPointsEarned: number;
        userTotalPoints: number;
        invitationLinks: InvitationLink[];
    }>;
    verifyEmail(email: string, token: string): Promise<User>;
    resendVerificationEmail(email: string): Promise<void>;
    sendVerificationEmail(user: User, verificationToken: string): Promise<void>;
    verifyPhoneNumber(phoneNumber: string, verificationCode: string): Promise<void>;
    sendPhoneNumberVerificationCode(phoneNumber: string): Promise<void>;
    validateWallet(userId: string): Promise<void>;
    purchaseAirtime(userId: string, amount: number): Promise<void>;
    validateUserAccounts(userId: string): Promise<void>;
    createOrUpdateWallet(userId: string, walletData: any): Promise<Wallet>;
    getWalletById(walletId: string): Promise<Wallet | null>;
    getWalletByUserId(userId: string): Promise<Wallet>;
    deleteWalletByUserId(userId: string): Promise<{
        message: string;
    }>;
    getAccountById(accountId: string): Promise<AccountDocument | null>;
    getUserAccount(userId: string): Promise<AccountDocument | null>;
    createOrUpdateUserBankAccount(userId: string, accountData: any): Promise<AccountDocument>;
    deleteUserBankAccount(userId: string): Promise<{
        message: string;
    }>;
}
