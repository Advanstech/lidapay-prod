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
exports.RewardController = void 0;
const common_1 = require("@nestjs/common");
const reward_service_1 = require("./reward.service");
const create_reward_dto_1 = require("./dto/create-reward.dto");
const update_reward_dto_1 = require("./dto/update-reward.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let RewardController = class RewardController {
    constructor(rewardService) {
        this.rewardService = rewardService;
    }
    async create(createRewardDto) {
        return this.rewardService.create(createRewardDto);
    }
    async findAll() {
        return this.rewardService.findAll();
    }
    async findOne(userId) {
        return this.rewardService.findOne(userId);
    }
    async update(userId, updateRewardDto) {
        return this.rewardService.update(userId, updateRewardDto);
    }
    async delete(userId) {
        return this.rewardService.delete(userId);
    }
};
exports.RewardController = RewardController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new reward' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'The reward has been successfully created', type: create_reward_dto_1.CreateRewardDto }),
    (0, swagger_1.ApiBody)({
        description: 'Reward creation details',
        schema: {
            type: 'object',
            required: ['name', 'description', 'points'],
            properties: {
                name: {
                    type: 'string',
                    description: 'The name of the reward',
                },
                description: {
                    type: 'string',
                    description: 'A brief description of the reward',
                },
                points: {
                    type: 'integer',
                    description: 'The number of points required to redeem the reward',
                },
            },
        },
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reward_dto_1.CreateRewardDto]),
    __metadata("design:returntype", Promise)
], RewardController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Find all rewards' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of rewards', isArray: true, type: [create_reward_dto_1.CreateRewardDto] }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RewardController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Find a reward by userId' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The found reward', type: create_reward_dto_1.CreateRewardDto }),
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RewardController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update a reward' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The reward has been successfully updated', type: update_reward_dto_1.UpdateRewardDto }),
    (0, common_1.Put)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_reward_dto_1.UpdateRewardDto]),
    __metadata("design:returntype", Promise)
], RewardController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a reward' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'The reward has been successfully removed' }),
    (0, common_1.Delete)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RewardController.prototype, "delete", null);
exports.RewardController = RewardController = __decorate([
    (0, swagger_1.ApiTags)('Rewards'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('api/v1/rewards'),
    __metadata("design:paramtypes", [reward_service_1.RewardService])
], RewardController);
//# sourceMappingURL=reward.controller.js.map