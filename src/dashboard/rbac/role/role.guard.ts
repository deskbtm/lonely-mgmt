import { AdminService } from '../admin/admin.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    // private readonly reflector: Reflector,
    private readonly adminSrv: AdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // const roles = this.reflector.get<string[]>('roles', context.getHandler());

    const user = await this.adminSrv.findByName(req.user.username);

    if (!req.user || !user) {
      throw new UnauthorizedException({ message: '角色认证失败' });
    }

    return true;
  }
}
