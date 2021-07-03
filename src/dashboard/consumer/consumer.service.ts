import { ForbidUserDto, DeleteUserDto, QueryUserDto } from './dto/consumer.dto';
import { Repository } from 'typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/client/user/entity/user.entity';

@Injectable()
export class ConsumerService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  public async findAllConsumer(body: QueryUserDto) {
    body = Object.assign({}, { pageSize: 20, current: 1 }, body);
    const { username, id } = body;
    const condition = [];
    username && condition.push({ username });
    id && condition.push({ id });

    try {
      const [list, total] = await this.userRepo.findAndCount({
        where: condition,
        relations: ['device', 'goods'],
        skip: (body.current - 1) * body.pageSize,
        take: body.pageSize,
      });
      // const total = list.length;
      return {
        list,
        total,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: '服务器出现错误',
        error,
      });
    }
  }

  public async forbid(body: ForbidUserDto) {
    try {
      return this.userRepo.update(
        {
          id: body.id,
        },
        {
          forbidden: body.forbidden,
        },
      );
    } catch (error) {
      throw new InternalServerErrorException({
        message: '服务器出现错误',
        error,
      });
    }
  }

  public async delete(body: DeleteUserDto) {
    try {
      return this.userRepo.delete({
        id: body.id,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: '服务器出现错误',
        error,
      });
    }
  }
}
