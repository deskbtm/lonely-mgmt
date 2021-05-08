import { TinyToolService } from './tiny-tool.service';
import {
  Controller,
  InternalServerErrorException,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from 'src/dashboard/auth/jwt.guard';
import { RolesGuard } from 'src/dashboard/rbac/role/role.guard';
import { StatusCode } from 'src/common';

@Controller('tools/tiny_tool')
export class TinyToolController {
  constructor(private readonly tinyToolSrv: TinyToolService) {}

  @UsePipes(new ValidationPipe())
  @Post('bak_db')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async backupDb() {
    try {
      await this.tinyToolSrv.bakDb();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({ message: '备份失败' });
    }
    return {
      code: StatusCode.SUCCESS,
      message: '备份成功',
    };
  }
}
