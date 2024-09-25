"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const reward_schema_1 = require("./schemas/reward.schema");
const constants_1 = require("../constants");
let RewardService = class RewardService {
    constructor(rewardModel) {
        this.rewardModel = rewardModel;
    }
    async create(createRewardDto) {
        const createdReward = new this.rewardModel({
            ...createRewardDto,
            history: [{ date: new Date(), points: createRewardDto.points, reason: 'Initial points' }]
        });
        return createdReward.save();
    }
    async findAll() {
        return this.rewardModel.find().exec();
    }
    async findOne(userId) {
        return this.rewardModel.findOne({ userId }).exec();
    }
    async update(userId, updateRewardDto) {
        const reward = await this.rewardModel.findOne({ userId }).exec();
        if (!reward) {
            throw new Error('Reward not found');
        }
        reward.points += updateRewardDto.points;
        reward.history.push({ date: new Date(), points: updateRewardDto.points, reason: updateRewardDto.reason });
        return reward.save();
    }
    async delete(userId) {
        await this.rewardModel.findOneAndDelete({ userId }).exec();
    }
    async awardQRCodeScanPoints(scannerId, scannerType) {
        if (scannerType === 'user') {
            await this.userService.addPoints(scannerId, constants_1.QR_CODE_SCAN_REWARD_POINTS);
        }
        else {
            await this.merchantService.updateRewardPoints(scannerId, constants_1.QR_CODE_SCAN_REWARD_POINTS);
        }
    }
};
exports.RewardService = RewardService;
exports.RewardService = RewardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(reward_schema_1.Reward.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RewardService);
//# sourceMappingURL=reward.service.js.map