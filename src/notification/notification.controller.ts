import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('/')
  async sendNotification(
    @Body('tokens') tokens: string[],
    @Body('title') title: string,
    @Body('message') message: string,
    @Body('url') url: string,
  ) {
    const result = await this.notificationService.sendPushNotifications(
      tokens,
      title,
      message,
      url,
    );
    return { result };
  }
}
