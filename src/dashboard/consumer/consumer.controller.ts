import { StatusCode } from './../../common/status';
import {
  Controller,
  Post,
  UsePipes,
  UseGuards,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/dashboard/auth/jwt.guard';
import { RolesGuard } from '../rbac/role/role.guard';
import { ConsumerService } from './consumer.service';
import { DeleteUserDto, ForbidUserDto, QueryUserDto } from './dto/consumer.dto';

@Controller('dashboard/consumer')
export class ConsumerController {
  constructor(private readonly consumerSrv: ConsumerService) {}

  @ApiProperty()
  @UsePipes(new ValidationPipe())
  @Post('query')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async getAllConsumer(@Body() body: QueryUserDto) {
    const data = await this.consumerSrv.findAllConsumer(body);
    return {
      code: StatusCode.SUCCESS,
      data,
    };
  }

  @ApiProperty()
  @UsePipes(new ValidationPipe())
  @Post('forbid')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async forbidUser(@Body() body: ForbidUserDto) {
    await this.consumerSrv.forbid(body);
    return {
      code: StatusCode.SUCCESS,
      message: '操作成功',
    };
  }

  @ApiProperty()
  @UsePipes(new ValidationPipe())
  @Post('delete')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async deleteUser(@Body() body: DeleteUserDto) {
    await this.consumerSrv.delete(body);
    return {
      code: StatusCode.SUCCESS,
      message: '操作成功',
    };
  }
}
