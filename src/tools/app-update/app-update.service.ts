import { AdminEntity } from './../../dashboard/rbac/admin/entity/admin.entity';
import { GoodsEntity } from 'src/goods/entity/goods.entity';
import {
  UpdateAppDto,
  AddUpdateAppDto,
  UpdateAppVersionDto,
  UpdateAppHistoryDto,
  ForceUpdateAppDto,
  ModifyUpdateAppDto,
} from './dto/update.dto';
import { AppUpdateEntity } from './entity/app-update.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as semver from 'semver';

@Injectable()
export class AppUpdateService {
  constructor(
    @InjectRepository(AppUpdateEntity)
    private readonly appUpdateRepo: Repository<AppUpdateEntity>,
    @InjectRepository(GoodsEntity)
    private readonly goodsRepo: Repository<GoodsEntity>,
    @InjectRepository(AdminEntity)
    private readonly adminRepo: Repository<AdminEntity>,
  ) {}

  public findGoods(packageName: string) {
    return this.appUpdateRepo
      .createQueryBuilder('app-update')
      .leftJoinAndSelect(
        'app-update.goods',
        'goods',
        'goods.packageName=:packageName',
        { packageName },
      );
  }

  public async findLatest(packageName) {
    return this.findGoods(packageName)
      .orderBy('semver', 'DESC')
      .orderBy()
      .getOne();
  }

  public async getLatest(body: UpdateAppDto) {
    return this.findLatest(body.packageName);
  }

  public async listUpdateRecords(body: UpdateAppHistoryDto) {
    body = Object.assign({}, { pageSize: 20, current: 1 }, body);

    // 用goods 来查 先不改
    return this.appUpdateRepo
      .createQueryBuilder('app-update')
      .leftJoinAndSelect('app-update.releaseBy', 'releaseBy')
      .leftJoinAndSelect('app-update.goods', 'goods')
      .where('goods.packageName=:packageName', {
        packageName: body.packageName,
      })
      .orderBy('app-update.semver', 'DESC')
      .skip((body.current - 1) * body.pageSize)
      .take(body.pageSize)
      .getManyAndCount();
  }

  public async getRecordByVersion(body: UpdateAppVersionDto) {
    const { semver, packageName } = body;
    return this.findGoods(packageName)
      .where('app-update.semver=:semver', {
        semver,
      })
      .getOne();
  }

  public async forceUpdate(body: ForceUpdateAppDto) {
    const { id, forceUpdate } = body;
    return this.appUpdateRepo.update({ id }, { forceUpdate });
  }

  public async modifyUpdate(body: ModifyUpdateAppDto) {
    const { id, semver, ...rest } = body;

    try {
      await this.appUpdateRepo.update({ id }, rest);
    } catch (error) {
      throw new InternalServerErrorException({ message: '修改失败' });
    }
  }

  public async addUpdate(body: AddUpdateAppDto & { username: string }) {
    const { username, packageName, ...rest } = body;
    const admin = await this.adminRepo.findOne({ username });
    if (!admin) {
      throw new NotFoundException({ message: '未发现管理员' });
    }

    const goods = await this.goodsRepo.findOne({ packageName });

    if (!goods) {
      throw new NotFoundException({ message: '未发现' + packageName });
    }

    const record = await this.appUpdateRepo.findOne({ semver: body.semver });

    if (record) {
      throw new BadRequestException({ message: '版本号重复' });
    } else {
      const latest = await this.findLatest(packageName);

      if (body.semver && latest?.semver) {
        if (semver.lt(body.semver, latest?.semver)) {
          throw new BadRequestException({ message: '版本需要大于最新版本' });
        }
      }
    }

    const recordEntity = this.appUpdateRepo.create(
      Object.assign({}, rest, { releaseBy: admin }, { goods }),
    );

    try {
      await this.appUpdateRepo.insert(recordEntity);
    } catch (e) {
      throw new InternalServerErrorException({
        message: '服务器内部错误',
        error: String(e),
      });
    }
    return;
  }
}
