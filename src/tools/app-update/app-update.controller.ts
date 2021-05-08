import { RolesGuard } from './../../dashboard/rbac/role/role.guard';
import { AdminJwtAuthGuard } from './../../dashboard/auth/jwt.guard';
import { StatusCode } from 'src/common/status';
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AppUpdateService } from './app-update.service';
import {
  UpdateAppDto,
  AddUpdateAppDto,
  UpdateAppVersionDto,
  UpdateAppHistoryDto,
  ForceUpdateAppDto,
  ModifyUpdateAppDto,
} from './dto/update.dto';

@Controller('tools/app_update')
export class AppUpdateController {
  constructor(private readonly appUpdateSrv: AppUpdateService) {}

  @UsePipes(new ValidationPipe())
  @Post('latest')
  async getLatestUpdate(@Body() body: UpdateAppDto) {
    const data = await this.appUpdateSrv.getLatest(body);
    return {
      code: StatusCode.SUCCESS,
      data,
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('history')
  async getHistoryUpdate(@Body() body: UpdateAppHistoryDto) {
    const [data, total] = await this.appUpdateSrv.listUpdateRecords(body);

    return {
      code: StatusCode.SUCCESS,
      data: {
        total,
        list: data,
      },
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('add')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async addUpdate(@Req() req, @Body() body: AddUpdateAppDto) {
    await this.appUpdateSrv.addUpdate({
      username: req.user.username,
      ...body,
    });

    return {
      code: StatusCode.SUCCESS,
      message: '添加成功',
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('version')
  async getByVersion(@Body() body: UpdateAppVersionDto) {
    const data = await this.appUpdateSrv.getRecordByVersion(body);
    return {
      code: StatusCode.SUCCESS,
      data,
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('force_update')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async forceUpdate(@Body() body: ForceUpdateAppDto) {
    await this.appUpdateSrv.forceUpdate(body);
    return {
      code: StatusCode.SUCCESS,
      message: '修改成功',
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('modify')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async modifyUpdate(@Body() body: ModifyUpdateAppDto) {
    await this.appUpdateSrv.modifyUpdate(body);
    return {
      code: StatusCode.SUCCESS,
      message: '修改成功',
    };
  }
}
