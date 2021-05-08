import { ValidRegExps } from 'src/common/utils';
import { IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '用户姓名不可为空',
  })
  @Matches(ValidRegExps.email, {
    message: '邮箱格式不正确',
  })
  username?: string;

  @ApiProperty()
  @IsNotEmpty({
    message: '密码不可为空',
  })
  @MinLength(8, {
    message: '密码长度不可低于8',
  })
  @MaxLength(64, {
    message: '密码长度不可超过64',
  })
  password?: string;
}
export class ModifyAdminDto {
  @ApiProperty()
  bilibiliUid?: string;

  @ApiProperty()
  bilibiliCookie?: string;
}
