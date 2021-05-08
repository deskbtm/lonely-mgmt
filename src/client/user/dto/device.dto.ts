import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeviceDto {
  @ApiProperty()
  @IsNotEmpty()
  os: string;

  @ApiProperty()
  @IsNotEmpty()
  osVersion: string;

  @ApiProperty()
  @IsNotEmpty()
  brand: string;

  @ApiProperty()
  totalMemory?: number;

  @ApiProperty()
  @IsNotEmpty()
  modelName: string;
}
