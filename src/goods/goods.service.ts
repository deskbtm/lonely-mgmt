import {
  CreateGoodsDto,
  DeleteGoodsDto,
  DisableGoodsDto,
  GetGoodsInfoDto,
  ModifyGoodsDto,
  QueryGoodsDto,
} from './dto/goods.dto';
import { StatusCode } from '../common/status';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GoodsEntity } from './entity/goods.entity';
import { AdminService } from '../dashboard/rbac/admin/admin.service';
import { AdminEntity } from '../dashboard/rbac/admin/entity/admin.entity';

@Injectable()
export class GoodsService {
  constructor(
    private readonly adminSrv: AdminService,
    @InjectRepository(GoodsEntity)
    private readonly goodsRepo: Repository<GoodsEntity>,

    @InjectRepository(AdminEntity)
    private readonly adminRepo: Repository<AdminEntity>,
  ) {}

  public async findPackage({
    packageName,
    goodsName,
  }: {
    packageName?: string;
    goodsName?: string;
  }) {
    return this.goodsRepo.findOne({
      where: [
        {
          packageName,
        },
        {
          goodsName,
        },
      ],
    });
  }

  public async findAllPackages({
    packageName,
    goodsName,
  }: {
    packageName?: string;
    goodsName?: string;
  }) {
    return this.goodsRepo.find({
      where: [
        {
          packageName,
        },
        {
          goodsName,
        },
      ],
    });
  }

  public async queryGoods(body: QueryGoodsDto): Promise<GoodsEntity[]> {
    return this.goodsRepo.find({ relations: ['createBy'] });
  }

  public async disableGoods(body: DisableGoodsDto) {
    try {
      await this.goodsRepo.update({ id: body.id }, { disabled: body.disabled });
    } catch (error) {
      throw new InternalServerErrorException({ message: '禁用失败' });
    }
  }

  public async delGoods(body: DeleteGoodsDto) {
    try {
      return this.goodsRepo.delete({
        id: body.id,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: '服务器出现错误',
        error,
      });
    }
  }

  public async getGoodsInfo(body: GetGoodsInfoDto) {
    const { packageName } = body;
    try {
      return this.goodsRepo.find({ packageName });
    } catch (error) {
      throw new InternalServerErrorException({
        message: '服务器出现错误',
        error,
      });
    }
  }

  public async modifyGoods(body: ModifyGoodsDto): Promise<any> {
    const { id, ...rest } = body;
    const allGoods = await this.findAllPackages({
      packageName: body.packageName,
      goodsName: body.goodsName,
    });

    if (allGoods?.length > 1) {
      return {
        code: StatusCode.ERROR,
        message: `${body.packageName} ${body.goodsName} 已存在`,
      };
    } else {
      await this.goodsRepo.update({ id }, rest);
      return {
        code: StatusCode.SUCCESS,
        message: '修改成功',
      };
    }
  }

  public async createGoods(
    goods: CreateGoodsDto,
    username: string,
  ): Promise<any> {
    try {
      const admin = await this.adminSrv.findByName(username);
      if (admin) {
        const goodsByPkg = await this.findPackage({
          packageName: goods.packageName,
          goodsName: goods.goodsName,
        });

        if (goodsByPkg) {
          return {
            code: StatusCode.ERROR,
            message: `${goods.goodsName}(${goods.packageName})已创建`,
          };
        }
        const adminEntity = this.adminRepo.create(admin);
        const goodsEntity = this.goodsRepo.create(
          (goods as unknown) as GoodsEntity,
        );
        goodsEntity.createBy = adminEntity;
        this.goodsRepo.save(goodsEntity);

        return {
          code: StatusCode.SUCCESS,
          message: `${goods.goodsName} 创建成功`,
        };
      } else {
        return {
          code: StatusCode.ERROR,
          message: '未发现管理员',
        };
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
