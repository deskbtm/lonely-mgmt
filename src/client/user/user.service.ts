import { Captcha } from 'src/common/utils';
import {
  ModifyUserPwdCaptchaDto,
  UserDto,
  RegisterCaptchaDto,
} from './dto/user.dto';

import { GoodsEntity } from 'src/goods/entity/goods.entity';
import { AdminEntity } from 'src/dashboard/rbac/admin/entity/admin.entity';
import { DeviceEntity } from './entity/device.entity';
import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { StatusCode } from 'src/common';
import got from 'got';
import {
  FollowedBilibiliDto,
  ModifyUserPwdDto,
  ShareGoodsDto,
} from './dto/user.dto';
import { v4 } from 'uuid';
import { RedisService } from 'nestjs-redis';
import { Response } from 'express';
import { MailerService } from '@nestjs-modules/mailer';
import { nanoid } from 'nanoid';
import { ClientAuthService } from '../auth/auth.service';

type UserProps = UserEntity & { auth?: string };

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(AdminEntity)
    private readonly adminRepo: Repository<AdminEntity>,

    @InjectRepository(DeviceEntity)
    private readonly deviceRepo: Repository<DeviceEntity>,

    @InjectRepository(GoodsEntity)
    private readonly goodsRepo: Repository<GoodsEntity>,

    private readonly redisSrv: RedisService,

    private readonly mailerSrv: MailerService,
  ) {}

  public async createUser(user: UserDto): Promise<Partial<UserProps>> {
    let saveUser;
    try {
      const { device, username, password } = user;
      const deviceEntity = this.deviceRepo.create(device);

      const userEntity = this.userRepo.create({ username, password });
      userEntity.device = deviceEntity;
      await this.deviceRepo.save(deviceEntity);
      saveUser = await this.userRepo.save(userEntity);
      delete saveUser.password;
    } catch (e) {
      throw new BadRequestException(e);
    }
    return saveUser;
  }

  public async findDeviceByUsername(username: string) {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.device', 'device')
      .where('user.username = :username', { username })
      .getOne();
  }

  public async findByName(username: string) {
    return this.userRepo.findOne({
      username,
    });
  }

  public async register(body: UserDto, authSrv: ClientAuthService) {
    const { username, captcha } = body;
    const user = await this.findByName(username);

    const redis = this.redisSrv.getClient();
    const captchaKey = Captcha.getRegisterCaptcha(captcha, username);
    const c = await redis.get(captchaKey);

    if (c) {
      await redis.del(captchaKey);
    } else {
      throw new BadRequestException({ message: '验证码错误或失效' });
    }

    if (!!user) {
      return {
        message: '该用户/邮箱已经注册',
        code: StatusCode.ERROR,
      };
    } else {
      const createdUser = await this.createUser(body);
      const uid = nanoid(16);
      createdUser.auth = await authSrv.signTarget({
        username,
        t: uid,
      });

      await this.redisSrv.getClient().set(username, uid);

      return {
        message: '注册成功',
        code: StatusCode.SUCCESS,
        data: createdUser,
      };
    }
  }

  public async findByNameWithGoods(username: string, packageName?: string) {
    if (packageName) {
      return this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect(
          'user.goods',
          'goods',
          'goods.packageName=:packageName',
          { packageName },
        )
        .where('user.username=:username', { username })
        .getOne();
    } else {
      return this.userRepo.findOne({
        relations: ['goods'],
        where: { username },
      });
    }
  }

  public async generateShareGoodsUrl(body: {
    username: string;
    packageName: string;
  }) {
    const { username, packageName } = body;
    const u = v4();
    const redis = this.redisSrv.getClient();
    await redis.set(u, 0, 'ex', 43200);

    return {
      path: `/v1/client/user/share_goods?u=${u}&t=${username}&packageName=${packageName}`,
    };
  }

  // 查找用户带上密码
  public async findByNameWithPwd(username: string) {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where({ username })
      .getOne();
  }

  // 查找用户带上密码
  public async modifyPassword(body: ModifyUserPwdDto) {
    const { captcha, username, newPassword } = body;

    const c = await this.redisSrv
      .getClient()
      .get(Captcha.getModifyPwdCaptcha(captcha, username));

    if (c) {
      const user = new UserEntity();
      user.password = newPassword;
      await this.userRepo.update({ username }, user);
    } else {
      throw new BadRequestException({ message: '验证码过期或无效' });
    }
  }

  // 发送验证码
  public async setModifyPasswordEmailCaptcha(body: ModifyUserPwdCaptchaDto) {
    const { username } = body;
    const captcha = parseInt(Math.random() * 0x2710 + '');
    const subject = '修改密码';

    await this.mailerSrv.sendMail({
      to: username,
      subject,
      template: 'captcha.handlebars',
      context: {
        captcha,
        subject,
      },
    });

    // 一分钟失效
    await this.redisSrv
      .getClient()
      .set(Captcha.getModifyPwdCaptcha(captcha, username), captcha, 'ex', 3000);
  }

  // 发送验证码
  public async setRegisterEmailCaptcha(body: RegisterCaptchaDto) {
    const { username } = body;
    const captcha = parseInt(Math.random() * 0x2710 + '');
    const subject = '注册验证';

    await this.mailerSrv.sendMail({
      to: username,
      subject,
      template: 'captcha.handlebars',
      context: {
        captcha,
        subject,
      },
    });

    // 一分钟失效
    await this.redisSrv
      .getClient()
      .set(Captcha.getRegisterCaptcha(captcha, username), captcha, 'ex', 3000);
  }

  public async setShareGoods(query: ShareGoodsDto, res: Response) {
    const { u, t, packageName } = query;
    const redis = this.redisSrv.getClient();
    let count = parseInt(await redis.get(u));

    if (count < 5) {
      await redis.set(u, ++count);
      const goods = await this.goodsRepo.findOne({ packageName });
      if (goods) {
        if (goods.shareUrl) {
          res.redirect(goods.shareUrl);
        } else {
          res.json({
            code: StatusCode.SUCCESS,
            message: '未发现重定向链接',
          });
        }
      } else {
        res.json({
          code: StatusCode.ERROR,
          message: '未发现商品',
        });
      }
    } else if (count >= 5) {
      try {
        const goodsBuilder = this.goodsRepo
          .createQueryBuilder('goods')
          .leftJoinAndSelect('goods.user', 'user', 'user.username=:username', {
            username: t,
          });

        const goods = await goodsBuilder
          .where('goods.packageName=:packageName', { packageName })
          .getOne();

        if (!goods.user) {
          const user = this.userRepo.create(
            await this.userRepo.findOne({ username: t }),
          );
          await this.goodsRepo.update({ packageName }, { user });
        }

        await goodsBuilder
          .update({ accomplishShareTask: true })
          .where('packageName=:packageName', { packageName })
          .execute();

        res.json({
          code: StatusCode.SUCCESS,
          message: '分享任务完成',
        });
      } catch (error) {
        console.error(error);
        res.json({
          code: StatusCode.ERROR,
          message: '服务器内部错误',
        });
      }
    } else {
      res.json({
        code: StatusCode.SUCCESS,
        message: '记录丢失, 请重新分享',
      });
    }
  }

  public async followTargetBilibili(
    b: FollowedBilibiliDto & { username: string },
  ) {
    const { packageName, username, uid } = b;
    const admin = await this.adminRepo
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.goods', 'goods')
      .where('goods.packageName=:packageName', { packageName })
      .getOne();

    if (!(admin && admin.bilibiliUid && admin.bilibiliCookie)) {
      throw new BadRequestException({
        message: '管理员bilibili设置出现问题 请联系管理员',
      });
    }

    const discount = admin.goods[0]?.discount ?? 0;

    const { body } = (await got
      .get(
        `https://api.bilibili.com/x/space/acc/relation?vmid=${admin.bilibiliUid}&mid=${uid}`,
        {
          headers: {
            Referer: 'https://space.bilibili.com/',
            Cookie: admin.bilibiliCookie,
            Connection: 'keep-alive',
          },
          responseType: 'json',
        },
      )
      .catch(() => {})) as any;
    let result;
    let followedBilibili: boolean = false;

    if (body?.code >= 0) {
      if (body?.data.be_relation?.attribute === 2) {
        followedBilibili = true;
        result = {
          message: `您已关注作者 可享${discount}元优惠`,
          code: StatusCode.SUCCESS,
          data: {
            followedBilibili,
          },
        };
      } else {
        result = {
          message: `您还未关注作者,关注后,可享${discount}元优惠`,
          code: StatusCode.SUCCESS,
          data: {
            followedBilibili,
          },
        };
      }
    } else {
      result = {
        message: `作者b站账号可能登录过期, 请联系`,
        code: StatusCode.SUCCESS,
        data: {
          followedBilibili,
        },
      };
    }

    await this.userRepo.update(
      { username },
      { followedBilibili, bilibiliUid: uid },
    );

    return result;
  }

  // public async purchasedGoods(body: PurchasedGoodsDto & { username: string }) {
  //   const { packageName, username } = body;
  //   const data = await this.paymentRepo
  //     .createQueryBuilder('payment')
  //     .leftJoinAndSelect('payment.user', 'user')
  //     .leftJoinAndSelect('payment.goods', 'goods')
  //     .where('user.username=:username', { username })
  //     .andWhere('goods.packageName=:packageName', { packageName })
  //     .getOne();
  // }
}
