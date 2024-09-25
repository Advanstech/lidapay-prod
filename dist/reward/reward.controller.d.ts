import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
export declare class RewardController {
    private readonly rewardService;
    constructor(rewardService: RewardService);
    create(createRewardDto: CreateRewardDto): Promise<import("./schemas/reward.schema").Reward>;
    findAll(): Promise<import("./schemas/reward.schema").Reward[]>;
    findOne(userId: string): Promise<import("./schemas/reward.schema").Reward>;
    update(userId: string, updateRewardDto: UpdateRewardDto): Promise<import("./schemas/reward.schema").Reward>;
    delete(userId: string): Promise<void>;
}
