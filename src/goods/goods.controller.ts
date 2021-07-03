import { ApiProperty } from '@nestjs/swagger';
import { RolesGuard } from '../dashboard/rbac/role/role.guard';
import { StatusCode } from '../common/status';
import { GoodsService } from './goods.service';
import { AdminJwtAuthGuard } from '../dashboard/auth/jwt.guard';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import {
  CreateGoodsDto,
  QueryGoodsDto,
  ModifyGoodsDto,
  DeleteGoodsDto,
  DisableGoodsDto,
  GetGoodsInfoDto,
} from './dto/goods.dto';

@Controller('goods')
export class GoodsController {
  constructor(private readonly goodsSrv: GoodsService) {}

  @Post('create')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiProperty()
  async createGoods(@Body() body: CreateGoodsDto, @Req() req: Request) {
    const { username } = req.user as { username: string };
    return this.goodsSrv.createGoods(body, username);
  }

  @Post('query')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @ApiProperty()
  async getGoods(@Body() body: QueryGoodsDto) {
    const data = await this.goodsSrv.queryGoods(body);
    return {
      code: StatusCode.SUCCESS,
      message: '查询成功',
      data,
    };
  }

  @Post('modify')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @ApiProperty()
  async modifyGoods(@Body() body: ModifyGoodsDto) {
    return this.goodsSrv.modifyGoods(body);
  }

  @Post('delete')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @ApiProperty()
  async deleteGoods(@Body() body: DeleteGoodsDto) {
    await this.goodsSrv.delGoods(body);
    return {
      code: StatusCode.SUCCESS,
      message: '删除成功',
    };
  }

  @Post('disable')
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  async disableGoods(@Body() body: DisableGoodsDto) {
    await this.goodsSrv.disableGoods(body);
    return {
      code: StatusCode.SUCCESS,
      message: '修改成功',
    };
  }

  @Post('info')
  @UsePipes(new ValidationPipe())
  @ApiProperty()
  async getGoodsInfo(@Body() body: GetGoodsInfoDto) {
    const data = await this.goodsSrv.getGoodsInfo(body);
    return {
      code: StatusCode.SUCCESS,
      data,
    };
  }
}
