import { IsNotEmpty, IsBoolean } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class QueryPaymentDto extends PaginationDto {
  @ApiProperty()
  tradeNo: string;

  @ApiProperty()
  username: string;
}

export class ModifyPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsBoolean()
  purchased: boolean;
}

export class DeletePaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}
