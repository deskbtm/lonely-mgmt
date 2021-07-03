import { PaginationDto } from './../../../common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateAppDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '需要软件包名',
  })
  packageName: string;
}

export class AddUpdateAppDto extends UpdateAppDto {
  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  descriptionHtml: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '缺少标题',
  })
  title: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '缺少版本号',
  })
  semver: string;

  @ApiProperty()
  forceUpdate: boolean;
}

export class ModifyUpdateAppDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  descriptionHtml: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  semver: string;

  @ApiProperty()
  forceUpdate: boolean;
}

export class UpdateAppVersionDto extends UpdateAppDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '请提供版本号',
  })
  semver: string;
}
export class UpdateAppHistoryDto extends PaginationDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '请提供包名',
  })
  packageName: string;
}

export class ForceUpdateAppDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsBoolean()
  forceUpdate: boolean;
}
