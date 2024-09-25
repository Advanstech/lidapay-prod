import { MerchantService } from './merchant.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { Merchant } from './schemas/merchant.schema';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RewardService } from 'src/reward/reward.service';
import { MerchantInvitationLinkDto } from './dto/merchant-invitation-link.dto';
import { AuthService } from 'src/auth/auth.service';
export declare class MerchantController {
    private readonly merchantService;
    private rewardsService;
    private authService;
    private logger;
    constructor(merchantService: MerchantService, rewardsService: RewardService, authService: AuthService);
    register(createMerchantDto: CreateMerchantDto): Promise<Merchant>;
    merchantLogin(loginDto: {
        clientId: string;
        clientKey: string;
    }): Promise<any>;
    findMerchantByClientId(merchantId: string): Promise<Merchant>;
    findMerchantById(merchantId: string): Promise<Merchant>;
    findAllMerchants(): Promise<{
        merchants: Merchant[];
        total: number;
    }>;
    update(merchantId: string, updateMerchantDto: UpdateMerchantDto): Promise<Merchant>;
    delete(req: any, merchantId: string): Promise<{
        message: string;
    }>;
    getQRCode(clientId: string): Promise<{
        qrCode: string;
    }>;
    changePassword(clientId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    trackQRCodeUsage(clientId: string): Promise<Merchant>;
    getQRCodeUsageStats(clientId: string): Promise<{
        usageCount: number;
        lastUsed: Date | null;
    }>;
    scanQRCode(clientId: string): Promise<{
        message: string;
    }>;
    generateInvitationLink(req: any): Promise<{
        invitationLink: string;
    }>;
    trackInvitationLinkUsage(invitationLink: string): Promise<Merchant>;
    getInvitationLinkStats(req: any): Promise<MerchantInvitationLinkDto>;
}
