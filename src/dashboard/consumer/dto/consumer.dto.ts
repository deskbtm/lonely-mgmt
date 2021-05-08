import { PaginationDto } from './../../../common/dto/pagination.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ForbidUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: '用户id不能为空' })
  id: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'forbid不能为空' })
  forbidden: boolean;
}

export class DeleteUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: '用户id不能为空' })
  id: string;
}

export class QueryUserDto extends PaginationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;
}
