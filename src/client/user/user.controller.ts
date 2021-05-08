import { ClientJwtAuthGuard } from './../auth/jwt.guard';
import { RedisService } from 'nestjs-redis';
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Req,
  UseGuards,
  Res,
  NotFoundException,
  Get,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UserDto,
  FollowedBilibiliDto,
  ShareGoodsDto,
  GetShareGoodsUrlDto,
  ModifyUserPwdDto,
  ModifyUserPwdCaptchaDto,
  UserLoginPwdDto,
  RegisterCaptchaDto,
} from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { StatusCode } from 'src/common/status';
import { Request } from 'express';
import { nanoid } from 'nanoid';
import { ClientAuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { GoodsEntity } from 'src/goods/entity/goods.entity';
import { Repository } from 'typeorm';

@Controller('client/user')
export class UserController {
  constructor(
    private readonly userSrv: UserService,
    private readonly authSrv: ClientAuthService,
    private readonly redisSrv: RedisService,
    @InjectRepository(GoodsEntity)
    private readonly goodsRepo: Repository<GoodsEntity>,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe())
  @ApiBody({ type: [UserDto] })
  async registerCustomer(@Body() body: UserDto) {
    return this.userSrv.register(body, this.authSrv);
  }

  @Post('login_pwd')
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard('client-local'))
  async login(@Body() body: UserLoginPwdDto) {
    const { username, packageName } = body;

    const uid = nanoid(16);
    const data = await this.authSrv.signTarget({ username, t: uid });
    let user = await this.userSrv.findByNameWithGoods(username, packageName);

    if (Array.isArray(user.goods) && user.goods.length === 0) {
      await this.goodsRepo.update({ packageName }, { user });
    }

    await this.redisSrv.getClient().set(username, uid);
    delete user.goods;

    return {
      message: '登录成功',
      code: StatusCode.SUCCESS,
      data: {
        auth: data,
        ...user,
      },
    };
  }

  @UseGuards(ClientJwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @Post('login_jwt')
  @ApiProperty()
  async getProfile(@Req() req) {
    const { username } = req.user;
    const data = await this.userSrv.findByName(username);

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

  @Get('share_goods')
  @UsePipes(new ValidationPipe())
  async shareGoods(@Query() query: ShareGoodsDto, @Res() res) {
    await this.userSrv.setShareGoods(query, res);
    return {};
  }

  @Post('share_goods_url')
  @UsePipes(new ValidationPipe())
  @UseGuards(ClientJwtAuthGuard)
  async getShareGoodsUrl(
    @Req() req: Request,
    @Body() body: GetShareGoodsUrlDto,
  ) {
    const data = await this.userSrv.generateShareGoodsUrl({
      username: (req.user as any).username,
      packageName: body.packageName,
    });

    return {
      code: StatusCode.SUCCESS,
      message: '完成',
      data,
    };
  }

  @UseGuards(ClientJwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @Post('followed_bilibili')
  @ApiProperty()
  async check(@Req() req: any, @Body() body: FollowedBilibiliDto) {
    return this.userSrv.followTargetBilibili({
      username: req.user.username,
      ...body,
    });
  }

  @UsePipes(new ValidationPipe())
  @Post('modify_pwd')
  @ApiProperty()
  async modifyPwd(@Body() body: ModifyUserPwdDto) {
    await this.userSrv.modifyPassword(body);
    return {
      code: StatusCode.SUCCESS,
      message: '修改成功',
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('modify_pwd_captcha')
  @ApiProperty()
  async modifyPwdCaptcha(@Body() body: ModifyUserPwdCaptchaDto) {
    await this.userSrv.setModifyPasswordEmailCaptcha(body);
    return {
      code: StatusCode.SUCCESS,
      message: '发送成功',
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('register_captcha')
  @ApiProperty()
  async registerCaptcha(@Body() body: RegisterCaptchaDto) {
    await this.userSrv.setRegisterEmailCaptcha(body);

    return {
      code: StatusCode.SUCCESS,
      message: '发送成功',
    };
  }

  // @Post('purchased')
  // @ApiProperty()
  // @UsePipes(new ValidationPipe())
  // @UseGuards(ClientJwtAuthGuard)
  // async purchased(@Body() body: PurchasedGoodsDto, @Req() req) {
  //   await this.userSrv.purchasedGoods({
  //     username: req.user.username,
  //     ...body,
  //   });
  //   // const data = await this.goodsSrv.getGoodsInfo(body);
  //   // return {
  //   //   code: StatusCode.SUCCESS,
  //   //   data,
  //   // };
  // }
}
