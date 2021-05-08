import { RedisService } from 'nestjs-redis';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClientJwtStrategy extends PassportStrategy(
  Strategy,
  'client-jwt',
) {
  constructor(
    private readonly config: ConfigService,
    private readonly redisSrv: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    const uid = await this.redisSrv.getClient().get(payload.username);

    if (uid !== payload.t) {
      throw new UnauthorizedException({
        message: '认证过期, 请重新登录',
      });
    } else {
      return { username: payload.username };
    }
  }
}
