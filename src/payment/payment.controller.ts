import {
  QueryPaymentDto,
  ModifyPaymentDto,
  DeletePaymentDto,
} from './dto/payment.dto';
import { RolesGuard } from './../dashboard/rbac/role/role.guard';
import { AdminJwtAuthGuard } from './../dashboard/auth/jwt.guard';
import { StatusCode, TradeStatus } from 'src/common/status';
import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AlipayCallback } from './interface/pay.interface';
import { QrCodeDto, QueryTradeDto } from './dto/qrcode.dto';
import { ClientJwtAuthGuard } from 'src/client/auth/jwt.guard';

@Controller('pay')
export class PaymentController {
  constructor(private readonly paymentSrv: PaymentService) {}

  @UsePipes(new ValidationPipe())
  @UseGuards(ClientJwtAuthGuard)
  @Post('qrcode')
  async payQr(@Req() req, @Body() body: QrCodeDto) {
    const qrCodeInfo = await this.paymentSrv.createTempTrade({
      packageName: body.packageName,
      username: req.user.username,
    });

    return {
      message: '成功',
      code: StatusCode.SUCCESS,
      data: qrCodeInfo,
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('qrcode_n')
  async payQrWithoutLogin(@Body() body: QrCodeDto) {
    const qrCodeInfo = await this.paymentSrv.createTempTrade({
      packageName: body.packageName,
    });

    return {
      message: '成功',
      code: StatusCode.SUCCESS,
      data: qrCodeInfo,
    };
  }

  @UsePipes(new ValidationPipe())
  @Post('query_trade')
  async queryTrade(@Body() body: QueryTradeDto) {
    const data = await this.paymentSrv.queryTrade(body);

    if (
      data?.alipay_trade_query_response?.trade_status === TradeStatus.SUCCESS
    ) {
      return {
        message: '成功',
        code: StatusCode.SUCCESS,
        data,
      };
    } else {
      return {
        message: data?.alipay_trade_query_response?.sub_msg || '查询失败',
        code: StatusCode.ERROR,
        data,
      };
    }
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Post('query')
  async queryPayments(@Body() body: QueryPaymentDto) {
    const data = await this.paymentSrv.queryPayments(body);
    return {
      code: StatusCode.SUCCESS,
      data,
    };
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Post('modify')
  async modifyPayment(@Body() body: ModifyPaymentDto) {
    await this.paymentSrv.modifyPayment(body);
    return {
      code: StatusCode.SUCCESS,
      message: '修改成功',
    };
  }

  @UsePipes(new ValidationPipe())
  @UseGuards(AdminJwtAuthGuard, RolesGuard)
  @Post('delete')
  async deletePayment(@Body() body: DeletePaymentDto) {
    await this.paymentSrv.deletePayment(body);
    return {
      code: StatusCode.SUCCESS,
      message: '修改成功',
    };
  }

  @Post('callback')
  async paymentCallback(@Body() body: AlipayCallback) {
    return this.paymentSrv.saveAccomplishTrade(body);
  }
}
