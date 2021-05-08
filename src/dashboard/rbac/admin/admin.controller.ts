import { AdminAuthService } from './../../auth/auth.service';
import { AdminJwtAuthGuard } from './../../auth/jwt.guard';
import { RedisService } from 'nestjs-redis';
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Res,
  NotFoundException,
  Req,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { ApiProperty } from '@nestjs/swagger';
import { StatusCode } from 'src/common/status';
import { RolesGuard } from '../role/role.guard';
import { Response } from 'express';
import { nanoid } from 'nanoid';
import { ModifyAdminDto } from './dto/admin.dto';
import { AdminService } from './admin.service';

@Controller('dashboard/admin')
export class AdminController {
  constructor(
    private readonly adminSrv: AdminService,
    private readonly authSrv: AdminAuthService,
    private readonly redisSrv: RedisService,
  ) {}

  // 支持rbac暂时用不到
  // @Post('register')
  // @UsePipes(new ValidationPipe())
  // @ApiBody({ type: [AdminDto] })
  // async registerAdmin(@Body() body: AdminDto) {
  //   const { username } = body;
  //   const user = await this.adminSrv.findByName(username);

  //   if (!!user) {
  //     return {
  //       message: '该用户/邮箱已经注册',
  //       code: StatusCode.ERROR,
  //     };
  //   } else {
  //     const createdUser = await this.adminSrv.createUser(body as any);
  //     const uid = nanoid(16);
  //     createdUser.auth = await this.authSrv.signTarget({
  //       username,
  //       t: uid,
  //     });

  //     await this.redisSrv.getClient().set(username, uid);

  //     return {
  //       message: '注册成功',
  //       code: StatusCode.SUCCESS,
  //       data: createdUser,
  //     };
  //   }
  // }

  @Post('login_pwd')
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('admin-local'))
  async login(@Body('username') username: string, @Res() res: Response) {
    const uid = nanoid(16);
    const data = await this.authSrv.signTarget({ username, t: uid });
    const user = await this.adminSrv.findByName(username);
    await this.redisSrv.getClient().set(username, uid);

    res.json({
      message: '登录成功',
      code: StatusCode.SUCCESS,
      data: {
        auth: data,
        ...user,
      },
    });
  }

  @ApiProperty()
  @UsePipes(new ValidationPipe())
  @Post('login_jwt')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async getProfile(@Req() req) {
    const { username } = req.user;
    const data = await this.adminSrv.findByName(username);

    if (data) {
      return {
        message: '登录成功',
        code: StatusCode.SUCCESS,
        data,
      };
    } else {
      throw new NotFoundException({ message: '未查询到用户' });
    }
  }

  // @UsePipes(new ValidationPipe())
  // @Post('user_list')
  // @UseGuards(AdminJwtAuthGuard, RolesGuard)
  // @ApiProperty()
  // async getUsers(@Request() req) {}

  @UsePipes(new ValidationPipe())
  @Post('modify')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @ApiProperty()
  async modify(@Body() body: ModifyAdminDto, @Req() req: any) {
    await this.adminSrv.modifyInfo({
      username: req.user.username,
      ...body,
    });

    return {
      code: StatusCode.SUCCESS,
      message: '修改成功',
    };
  }
}
