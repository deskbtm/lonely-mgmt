import {
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DeviceDto } from './device.dto';
import { IsDevice } from 'src/common/class-validation';
import { ValidRegExps } from 'src/common';

export class UserDto {
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

  @IsDevice({
    message: '设备信息不合法',
  })
  device: DeviceDto;

  @IsNotEmpty({
    message: '请填写验证码',
  })
  captcha: string;

  // @IsNotEmpty({
  //   message: '需提供软件包名',
  // })
  // packageName: string;
}
export class UserLoginPwdDto {
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

  @IsNotEmpty({
    message: '需提供软件包名',
  })
  packageName: string;
}

export class FollowedBilibiliDto {
  @ApiProperty()
  @IsNotEmpty()
  packageName?: string;

  @ApiProperty()
  @IsNotEmpty()
  uid?: string;
}
export class ShareGoodsDto {
  @ApiProperty()
  @IsNotEmpty()
  u: string;

  @ApiProperty()
  @IsNotEmpty()
  t: string;

  @ApiProperty()
  @IsNotEmpty()
  packageName: string;
}
export class GetShareGoodsUrlDto {
  @ApiProperty()
  @IsNotEmpty()
  packageName: string;
}

export class ModifyUserPwdDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  captcha: string;
}
export class ModifyUserPwdCaptchaDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;
}

export class RegisterCaptchaDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;
}

export class PurchasedGoodsDto {
  @ApiProperty()
  @IsNotEmpty()
  packageName: string;
}
