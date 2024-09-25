import { Controller, Get, Post, Body, Put, Delete, Param, UseGuards} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully', type: CreateNotificationDto })
  @ApiBody({
    description: 'Notification creation details',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user123' },
        message: { type: 'string', example: 'You have a new message' },
        type: { type: 'string', example: 'info' },
        isRead: { type: 'boolean', example: false },
      },
    },
  })
  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find all notifications' })
  @ApiResponse({ status: 200, description: 'List of notifications', isArray: true })
  @Get()
  async findAll() {
    return this.notificationService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a notification by ID' })
  @ApiResponse({ status: 200, description: 'Notification found', type: CreateNotificationDto })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a notification' })
  @ApiResponse({ status: 200, description: 'Notification updated successfully', type: UpdateNotificationDto })
  @ApiBody({
    description: 'Notification update details',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Updated notification message' },
        isRead: { type: 'boolean', example: true },
      },
    },
  })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.notificationService.delete(id);
  }
}
