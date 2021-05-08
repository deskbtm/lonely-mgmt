import { IsBoolean, IsNotEmpty, IsNumber, IsUrl, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateGoodsDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '用户姓名不可为空',
  })
  @IsNotEmpty()
  goodsName: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '包名不可为空',
  })
  packageName: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '价格不可为空',
  })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  discount: number;

  @ApiProperty()
  @IsNotEmpty({
    message: '支付宝回调不可为空',
  })
  @IsUrl({}, { message: '回调需要是uri' })
  alipayCallback: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '支付宝回调不可为空',
  })
  @IsUrl({}, { message: '网关需要是uri' })
  alipayGateway: string;

  @ApiProperty()
  shareUrl: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '支付宝卖家描述不可为空',
  })
  alipayDesc: string;
}

export class QueryGoodsDto {
  @ApiProperty()
  packageName: string;
}

export class GetGoodsInfoDto {
  @ApiProperty()
  packageName: string;
}
export class ModifyGoodsDto extends CreateGoodsDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'id 不可为空',
  })
  id: string;
}
export class DeleteGoodsDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'id 不可为空',
  })
  id: string;
}
export class DisableGoodsDto extends DeleteGoodsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  disabled: boolean;
}
