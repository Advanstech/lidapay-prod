import { Model } from 'mongoose';
import { Merchant, MerchantDocument } from './schemas/merchant.schema';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { EmailService } from 'src/utilities/email.service';
import { NotificationService } from 'src/notification/notification.service';
import { NodemailService } from 'src/utilities/nodemail.service';
import { JwtService } from '@nestjs/jwt';
export declare class MerchantService {
    private readonly merchantModel;
    private userService;
    private authService;
    private emailService;
    private notificationService;
    private nodemailService;
    private readonly jwtService;
    private logger;
    private emailVerifyRewardPoints;
    private phoneVerifyRewardPoints;
    constructor(merchantModel: Model<MerchantDocument>, userService: UserService, authService: AuthService, emailService: EmailService, notificationService: NotificationService, nodemailService: NodemailService, jwtService: JwtService);
    create(createMerchantDto: CreateMerchantDto): Promise<Merchant>;
    merchantLogin(merchant: any): Promise<{
        access_token: string;
        refresh_token: string;
        merchant: {
            id: any;
            clientId: any;
        };
    }>;
    findMerchantById(id: string): Promise<Merchant>;
    findOneByClientId(clientId: string): Promise<Merchant>;
    update(merchantId: string, updateMerchantDto: UpdateMerchantDto): Promise<Merchant>;
    delete(merchantId: string): Promise<void>;
    updateLastLogin(merchantId: string): Promise<void>;
    findAllRegisteredMerchants(): Promise<{
        merchants: Merchant[];
        total: number;
    }>;
    updateRewardPoints(clientId: string, points: number): Promise<void>;
    changePassword(clientId: string, currentPassword: string, newPassword: string): Promise<void>;
    updateClientToken(clientId: string, newClientKey: string): Promise<void>;
    trackQRCodeUsage(clientId: string): Promise<Merchant>;
    getQRCodeUsageStats(clientId: string): Promise<{
        usageCount: number;
        lastUsed: Date | null;
    }>;
    generateInvitationLink(merchantId: string): Promise<string>;
    trackInvitationLinkUsage(invitationLink: string): Promise<Merchant>;
    getInvitationLinkStats(clientId: string): Promise<{
        usageCount: number;
        lastUsed: Date | null;
    }>;
    verifyEmail(email: string, token: string): Promise<Merchant>;
    resendVerificationEmail(email: string): Promise<void>;
    sendVerificationEmail(merchant: Merchant, verificationToken: string): Promise<void>;
}
