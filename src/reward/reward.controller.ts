import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { RewardService } from './reward.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Rewards')
@ApiBearerAuth()
@Controller('api/v1/rewards')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new reward' })
  @ApiResponse({ status: 201, description: 'The reward has been successfully created', type: CreateRewardDto })
  @ApiBody({
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
        // Add other properties as needed
      },
    },
  })
  @Post()
  async create(@Body() createRewardDto: CreateRewardDto) {
    return this.rewardService.create(createRewardDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find all rewards' })
  @ApiResponse({ status: 200, description: 'List of rewards', isArray: true, type: [CreateRewardDto] })
  @Get()
  async findAll() {
    return this.rewardService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Find a reward by userId' })
  @ApiResponse({ status: 200, description: 'The found reward', type: CreateRewardDto })
  @Get(':userId')
  async findOne(@Param('userId') userId: string) {
    return this.rewardService.findOne(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a reward' })
  @ApiResponse({ status: 200, description: 'The reward has been successfully updated', type: UpdateRewardDto })
  @Put(':userId')
  async update(@Param('userId') userId: string, @Body() updateRewardDto: UpdateRewardDto) {
    return this.rewardService.update(userId, updateRewardDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a reward' })
  @ApiResponse({ status: 200, description: 'The reward has been successfully removed' })
  @Delete(':userId')
  async delete(@Param('userId') userId: string) {
    return this.rewardService.delete(userId);
  }

}
