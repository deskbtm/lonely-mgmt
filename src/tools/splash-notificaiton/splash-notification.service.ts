import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from 'src/dashboard/rbac/admin/entity/admin.entity';
import { GoodsEntity } from 'src/goods/entity/goods.entity';
import { Repository } from 'typeorm';
import {
  UpdateAppDto,
} from '../app-update/dto/update.dto';
import {
  AddNotificationDto,
  ModifyNotificationDto,
  NotificationHistoryDto,
} from './dto/notification.dto';
import { SplashNotificationEntity } from './entity/splash-notification.entity';

@Injectable()
export class SplashNotificationService {
  constructor(
    @InjectRepository(SplashNotificationEntity)
    private readonly splashRepo: Repository<SplashNotificationEntity>,
    @InjectRepository(GoodsEntity)
    private readonly goodsRepo: Repository<GoodsEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepo: Repository<AdminEntity>,
  ) {}

  public findGoods(packageName: string) {
    return this.splashRepo
      .createQueryBuilder('app-update')
      .leftJoinAndSelect(
        'app-update.goods',
        'goods',
        'goods.packageName=:packageName',
        { packageName },
      );
  }

  private async _findLatest(packageName) {
    return this.findGoods(packageName)
      .orderBy('releaseTimestamp', 'DESC')
      .orderBy()
      .getOne();
  }

  public async getLatest(body: UpdateAppDto) {
    return this._findLatest(body.packageName);
  }

  public async listNotificationHistory(body: NotificationHistoryDto) {
    body = Object.assign({}, { pageSize: 20, current: 1 }, body);
    const [data, total] = await this.splashRepo
      .createQueryBuilder('splash-notification')
      .leftJoinAndSelect('splash-notification.releaseBy', 'releaseBy')
      .leftJoinAndSelect('splash-notification.goods', 'goods')
      .where('goods.packageName=:packageName', {
        packageName: body.packageName,
      })
      .orderBy('splash-notification.releaseTimestamp', 'DESC')
      .skip((body.current - 1) * body.pageSize)
      .take(body.pageSize)
      .getManyAndCount();

    return {
      list: data,
      total,
    };
  }

  public async deleteNotification(body: ModifyNotificationDto) {
    const { id } = body;
    try {
      return this.splashRepo.delete({ id });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({ message: '删除失败' });
    }
  }

  public async modifySplashNotification(body: ModifyNotificationDto) {
    const { id, ...rest } = body;

    try {
      await this.splashRepo.update({ id }, rest);
    } catch (error) {
      throw new InternalServerErrorException({ message: '修改失败' });
    }
  }

  public async addNotification(
    body: AddNotificationDto & { username: string },
  ) {
    const { username, packageName, ...rest } = body;
    const admin = await this.adminRepo.findOne({ username });
    if (!admin) {
      throw new NotFoundException({ message: '未发现管理员' });
    }

    const goods = await this.goodsRepo.findOne({ packageName });

    if (!goods) {
      throw new NotFoundException({ message: '未发现' + packageName });
    }

    const entryEntity = this.splashRepo.create(
      Object.assign({}, rest, { releaseBy: admin, goods }),
    );

    try {
      await this.splashRepo.insert(entryEntity);
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException({
        message: '服务器内部错误',
        error: String(e),
      });
    }
    return;
  }
}
