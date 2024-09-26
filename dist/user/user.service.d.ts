import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailService } from '../utilities/email.service';
import { NodemailService } from '../utilities/nodemail.service';
import { SmsService } from 'src/utilities/sms.util';
import { GravatarService } from 'src/utilities/gravatar.util';
import { MerchantService } from 'src/merchant/merchant.service';
<<<<<<< HEAD
import { NotificationService } from 'src/notification/notification.service';
=======
>>>>>>> 9a6de866e98eee94bf1b44a3191d0a5a866d12cb
export declare class UserService {
    private userModel;
    private emailService;
    private nodemailService;
    private smsService;
    private gravatarService;
    private readonly merchantService;
<<<<<<< HEAD
    private notificationService;
    private logger;
    private emailVerifyRewardPoints;
    private phoneVerifyRewardPoints;
    constructor(userModel: Model<UserDocument>, emailService: EmailService, nodemailService: NodemailService, smsService: SmsService, gravatarService: GravatarService, merchantService: MerchantService, notificationService: NotificationService);
=======
    private logger;
    private emailVerifyRewardPoints;
    private phoneVerifyRewardPoints;
    constructor(userModel: Model<UserDocument>, emailService: EmailService, nodemailService: NodemailService, smsService: SmsService, gravatarService: GravatarService, merchantService: MerchantService);
>>>>>>> 9a6de866e98eee94bf1b44a3191d0a5a866d12cb
    create(userDto: CreateUserDto): Promise<User>;
    findOneByUsername(username: string): Promise<User | undefined>;
    findOneByEmail(email: string): Promise<User | undefined>;
    findOneByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
    findOneById(userId: string): Promise<User | undefined>;
    updateProfile(userId: string, updateData: any): Promise<User>;
    addPoints(userId: string, points: number): Promise<User>;
    findAll(page?: number, limit?: number): Promise<{
        users: User[];
        totalCount: number;
    }>;
    deleteUserById(userId: string): Promise<{
        message: string;
    }>;
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
    generateInvitationLink(phoneNumber: string): Promise<string>;
    trackInvitationLinkUsage(invitationLink: string): Promise<User>;
    getInvitationLinkStats(userId: string): Promise<{
        usageCount: number;
        lastUsed: Date | null;
    }>;
    verifyEmail(email: string, token: string): Promise<User>;
    resendVerificationEmail(email: string): Promise<void>;
    sendVerificationEmail(user: User, verificationToken: string): Promise<void>;
    verifyPhoneNumber(phoneNumber: string, verificationCode: string): Promise<void>;
    sendPhoneNumberVerificationCode(phoneNumber: string): Promise<void>;
}
