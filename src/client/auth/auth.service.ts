import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/client/user/user.service';

@Injectable()
export class ClientAuthService {
  constructor(
    private readonly userSrv: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser(username: string, pwd: string): Promise<any> {
    const user = await this.userSrv.findByNameWithPwd(username);

    if (user) {
      if (await bcrypt.compare(pwd, user.password)) {
        return user;
      } else {
        throw new UnauthorizedException('用户认证错误, 请重新输入密码');
      }
    } else {
      throw new BadRequestException('用户不存在, 请先注册');
    }
  }

  async signTarget(object: string | Buffer | object) {
    return this.jwtService.sign(object);
  }
}
