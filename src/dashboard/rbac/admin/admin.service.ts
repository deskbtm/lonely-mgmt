import { Repository } from 'typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from './entity/admin.entity';
import { ModifyAdminDto } from './dto/admin.dto';

type UserProps = AdminEntity & { auth?: string };

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepo: Repository<AdminEntity>,
  ) {}

  public async createAdmin(
    user: Partial<AdminEntity>,
  ): Promise<Partial<UserProps>> {
    let saveUser;
    try {
      const userEntity = this.adminRepo.create(user);
      saveUser = await this.adminRepo.save(userEntity);
    } catch (e) {
      throw new BadRequestException({ message: '管理员创建失败' });
    }
    return saveUser;
  }

  public async findByName(username: string) {
    const selectUser = await this.adminRepo.findOne({
      username,
    });
    return !!selectUser ? selectUser : false;
  }

  public async findByNameWithPwd(username: string) {
    return this.adminRepo
      .createQueryBuilder('admin')
      .addSelect('admin.password')
      .where({ username })
      .getOne();
  }

  public async modifyInfo(body: ModifyAdminDto & { username: string }) {
    const { username, ...rest } = body;

    try {
      return this.adminRepo.update(
        {
          username,
        },
        rest,
      );
    } catch (error) {
      throw new BadRequestException({ message: '修改失败' });
    }
  }
}
