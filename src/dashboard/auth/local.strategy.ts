import { RedisService } from 'nestjs-redis';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AdminAuthService } from './auth.service';

@Injectable()
export class AdminLocalStrategy extends PassportStrategy(
  Strategy,
  'admin-local',
) {
  constructor(
    private readonly authSrv: AdminAuthService,
    private readonly redisSrv: RedisService,
  ) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    await this.redisSrv.getClient().del(username);
    const user = await this.authSrv.validateUser(username, password);

    return user;
  }
}
