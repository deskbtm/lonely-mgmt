import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QrCodeDto {
  @ApiProperty()
  @IsNotEmpty({
    message: '需要软件包名',
  })
  readonly packageName?: string;
}

export class QueryTradeDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly out_trade_no?: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly subject?: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly total_amount?: string;
}
