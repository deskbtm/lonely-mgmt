import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from 'src/dashboard/auth/jwt.guard';
import { RolesGuard } from 'src/dashboard/rbac/role/role.guard';
import { StatusCode } from '../../common/status';
import {
  AddNotificationDto,
  LatestNotificationDto,
  ModifyNotificationDto,
  NotificationHistoryDto,
} from './dto/notification.dto';
import { SplashNotificationService } from './splash-notification.service';

@Controller('tools/splash_notification')
export class SplashNotificationController {
  constructor(private readonly splashSrv: SplashNotificationService) {}

  @UsePipes(new ValidationPipe())
  @Post('latest')
  async getLatest(@Body() body: LatestNotificationDto) {
    const data = await this.splashSrv.getLatest(body);
    return {
      code: StatusCode.SUCCESS,
      data,
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('history')
  async getList(@Body() body: NotificationHistoryDto) {
    const data = await this.splashSrv.listNotificationHistory({
      ...body,
    });

    return {
      code: StatusCode.SUCCESS,
      data,
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('add')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async add(@Req() req, @Body() body: AddNotificationDto) {
    await this.splashSrv.addNotification({
      username: req.user.username,
      ...body,
    });
    return {
      message: '添加成功',
      code: StatusCode.SUCCESS,
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('modify')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async modify(@Body() body: ModifyNotificationDto) {
    await this.splashSrv.modifySplashNotification(body);
    return {
      message: '修改成功',
      code: StatusCode.SUCCESS,
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('delete')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async delete(@Body() body: ModifyNotificationDto) {
    await this.splashSrv.deleteNotification(body);
    return {
      message: '删除成功',
      code: StatusCode.SUCCESS,
    };
  }
}
