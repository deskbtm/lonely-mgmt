import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CommonNotificationDto {
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
  @IsNotEmpty()
  forceDisplay: boolean;

  @ApiProperty()
  @IsNotEmpty()
  display: boolean;

  @ApiProperty()
  buttons: object;
}

export class AddNotificationDto extends CommonNotificationDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '需要软件包名',
  })
  packageName: string;
}
export class LatestNotificationDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '需要软件包名',
  })
  packageName: string;
}

export class ModifyNotificationDto {
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
  forceDisplay: boolean;

  @ApiProperty()
  display: boolean;

  @ApiProperty()
  buttons: object;
}

export class NotificationHistoryDto extends PaginationDto {
  @ApiProperty()
  @IsNotEmpty()
  packageName: string;
}
