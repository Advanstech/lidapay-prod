import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';
import { RewardService } from 'src/reward/reward.service';
import { Wallet } from './schemas/wallet.schema';
import { LidapayAccount } from './schemas/lidapay-account.schema';
export declare class UserController {
    private readonly userService;
    private readonly authService;
    private rewardsService;
    private logger;
    constructor(userService: UserService, authService: AuthService, rewardsService: RewardService);
    register(createUserDto: CreateUserDto): Promise<import("./schemas/user.schema").User>;
    login(req: any): Promise<any>;
    genRefreshToken(authHeader: string): Promise<any>;
    getPoints(req: any): Promise<{
        points: number;
    }>;
    getProfile(req: any): Promise<import("./schemas/user.schema").User>;
    updateProfile(req: any, updateData: any): Promise<import("./schemas/user.schema").User>;
    getAllUsers(page?: number, limit?: number): Promise<any>;
    getUserByPhoneNumber(phoneNumber: string): Promise<import("./schemas/user.schema").User>;
    getUserByEmail(email: string): Promise<import("./schemas/user.schema").User>;
    deleteUserById(userId: string): Promise<{
        message: string;
    }>;
    deleteAllUsers(): Promise<{
        message: string;
    }>;
    merchantLogin(loginDto: {
        clientId: string;
        clientKey: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
        merchant: {
            id: any;
            clientId: any;
        };
    }>;
    changePassword(req: any, changePasswordDto: {
        currentPassword: string;
        newPassword: string;
    }): Promise<boolean>;
    trackQRCodeUsage(req: any): Promise<import("./schemas/user.schema").User>;
    getQRCodeUsageStats(req: any): Promise<{
        usageCount: number;
        lastUsed: Date | null;
    }>;
    scanQRCode(userId: string): Promise<{
        message: string;
    }>;
    generateInvitationLink(req: any): Promise<{
        invitationLink: string;
    }>;
    trackInvitationLinkUsage(invitationLink: string): Promise<{
        message: string;
        updatedUser: {
            totalPointsEarned: number;
            points: number;
            invitationLinks: import("./schemas/user.schema").InvitationLink[];
        };
    }>;
    getInvitationLinkStats(req: any): Promise<{
        totalUsageCount: number;
        totalPointsEarned: number;
        userTotalPoints: number;
        invitationLinks: import("./schemas/user.schema").InvitationLink[];
    }>;
    verifyEmail(token: string, req: any): Promise<{
        message: string;
    }>;
    resendVerificationEmail(email: string): Promise<{
        message: string;
    }>;
    verifyPhoneNumber(phoneNumber: string, verificationCode: string): Promise<{
        message: string;
    }>;
    resendPhoneVerificationCode(phoneNumber: string): Promise<{
        message: string;
    }>;
    resetPassword(email: string, phoneNumber?: string): Promise<{
        message: string;
    }>;
    createOrUpdateWallet(req: any, walletData: Wallet): Promise<Wallet>;
    getWalletById(walletId: string): Promise<Wallet>;
    getWallet(req: any): Promise<Wallet>;
    deleteWallet(req: any): Promise<{
        message: string;
    }>;
    createOrUpdateLidapayAccount(req: any, lidapayData: LidapayAccount): Promise<LidapayAccount>;
    getLidapayAccountById(lidapayAccountId: string): Promise<LidapayAccount>;
    getLidapayAccount(req: any): Promise<LidapayAccount>;
    deleteLidapayAccount(req: any): Promise<{
        message: string;
    }>;
}
