import { v4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AlipayCallback, CreateQrCodeParams } from './interface/pay.interface';
import { Repository } from 'typeorm';

import { PaymentEntity } from './entity/payment.entity';
import { initClient } from './alipay_interface';
import { resolve } from 'path';
import * as qrcodeLib from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/client/user/user.service';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { TradeStatus } from 'src/common';
import { GoodsService } from 'src/goods/goods.service';
import {
  QueryPaymentDto,
  ModifyPaymentDto,
  DeletePaymentDto,
} from './dto/payment.dto';

@Injectable()
export class PaymentService {
  alipayApp;

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly payRepo: Repository<PaymentEntity>,
    private readonly userSrv: UserService,
    private readonly goodsSrv: GoodsService,
    private readonly config: ConfigService,
  ) {
    this.alipayApp = initClient({
      private_key: process.env.ALIPAY_APP_PRIVATE_KEY,
      app_id: this.config.get('payment.appId'),
    });
  }

  private async createQrCode(args: CreateQrCodeParams) {
    const { price, tradeNo, subject, callback } = args;
    const bizContent = {
      subject,
      out_trade_no: tradeNo,
      total_amount: price,
    };

    const body = await this.alipayApp.precreate({
      biz_content: bizContent,
      notify_url: callback,
    });

    const qrcode = await this._genBase64QrCodeImage(body);

    return {
      qrcode,
      details: body,
      bizContent: bizContent,
    };
  }

  private async getPayment(username: string, packageName: string) {
    return this.payRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user', 'user.username=:username', {
        username,
      })
      .leftJoinAndSelect('payment.goods', 'goods')
      .where('goods.packageName=:packageName', {
        packageName,
      })
      .andWhere('user.username=:username', {
        username,
      });
  }

  private async updateTradeNo({ username, packageName, tradeNo }) {
    await this.payRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user', 'user.username=:username', {
        username,
      })
      .leftJoinAndSelect(
        'payment.goods',
        'goods',
        'goods.packageName=:packageName',
        {
          packageName,
        },
      )
      .update('payment')
      .set({
        tradeNo,
      })
      .execute();
  }

  public async queryTrade(body) {
    return this.alipayApp.query({
      biz_content: body,
    });
  }

  public async createTempTrade(tempInfo: {
    username?: string;
    packageName?: string;
  }) {
    const { username, packageName } = tempInfo;

    const tradeNo = v4();

    const goods = await this.goodsSrv.findPackage({
      packageName,
    });

    if (!goods) {
      throw new NotFoundException({
        message: `未发${packageName}`,
      });
    }

    if (username) {
      const payment = await this.getPayment(username, packageName);
      const payResult = await payment.getOne();

      if (payResult) {
        await this.updateTradeNo({ packageName, username, tradeNo });
      } else {
        const user = await this.userSrv.findByName(username);

        if (!user) {
          throw new NotFoundException({ message: `未发现用户${username}` });
        }

        const pay = new PaymentEntity();

        pay.goods = goods;
        pay.payAmount = goods.price;
        pay.user = user;
        pay.tradeNo = tradeNo;

        await this.payRepo.save(pay);
      }
    }

    try {
      return this.createQrCode({
        price: goods.price,
        tradeNo: tradeNo,
        callback: goods.alipayCallback,
        subject: goods.goodsName + ': ' + goods.alipayDesc,
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException({
        message: '服务器出现错误',
      });
    }
  }

  private _getVerifyParams(params) {
    if (!params) return null;
    let sPara = [];
    for (const key in params) {
      if (!params[key] || key === 'sign' || key === 'sign_type') {
        continue;
      }
      sPara.push([key, params[key]]);
    }
    sPara = sPara.sort();
    let prestr = '';
    for (let i2 = 0; i2 < sPara.length; i2++) {
      const obj = sPara[i2];
      if (i2 == sPara.length - 1) {
        prestr = prestr + obj[0] + '=' + obj[1] + '';
      } else {
        prestr = prestr + obj[0] + '=' + obj[1] + '&';
      }
    }
    return prestr;
  }

  // 校验回调签名
  private verifyAlipaySign(params) {
    const publicPem = fs.readFileSync(
      resolve(__dirname, '../../key/alipay_public.pem'),
      'utf-8',
    );

    const prestr = this._getVerifyParams(params);
    const sign = params['sign'] ? params['sign'] : '';
    let verify;

    switch (params['sign_type']) {
      case 'RSA':
        verify = crypto.createVerify('RSA-SHA1');
        break;
      case 'RSA2':
        verify = crypto.createVerify('RSA-SHA256');
        break;
    }

    verify.update(prestr);
    return verify.verify(publicPem, sign, 'base64');
  }

  // 处理支付宝回调
  public async saveAccomplishTrade(body: AlipayCallback) {
    const {
      trade_status,
      out_trade_no,
      buyer_id,
      buyer_pay_amount,
      trade_no,
    } = body;
    if (trade_status === TradeStatus.SUCCESS) {
      const verifyResult = this.verifyAlipaySign(body);
      if (verifyResult) {
        await this.payRepo.update(
          { tradeNo: out_trade_no },
          {
            buyerAlipayId: buyer_id,
            payAmount: parseFloat(buyer_pay_amount),
            alipayTradeNo: trade_no,
            json: body,
            purchased: true,
          },
        );
      }
    }
  }

  private async _genBase64QrCodeImage(body): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!!!body.alipay_trade_precreate_response.qr_code) {
        reject();
      }
      qrcodeLib.toDataURL(
        body?.alipay_trade_precreate_response?.qr_code,
        (error, url) => {
          if (error) {
            reject(error);
          } else {
            resolve(url);
          }
        },
      );
    });
  }

  private async _findPayments(body: QueryPaymentDto) {
    const { tradeNo, username } = body;
    const paramLen = Object.keys(body).length - 2;
    const condition: { s: string; c: {} }[] = [];
    tradeNo &&
      condition.push({ s: 'payments.tradeNo=:tradeNo', c: { tradeNo } });
    username &&
      condition.push({ s: 'user.username=:username', c: { username } });

    let pay = this.payRepo
      .createQueryBuilder('payments')
      .leftJoinAndSelect('payments.user', 'user')
      .leftJoinAndSelect('payments.goods', 'goods')
      .orderBy('payments.payTimestamp', 'DESC')
      .skip((body.current - 1) * body.pageSize)
      .take(body.pageSize);

    for (let c of condition) {
      if (condition.length === paramLen) {
        pay = pay.andWhere(c.s, c.c);
      } else {
        pay = pay.orWhere(c.s, c.c);
      }
    }

    return pay.getManyAndCount();
  }

  public async queryPayments(body: QueryPaymentDto) {
    body = Object.assign({}, { pageSize: 20, current: 1 }, body);
    // const { tradeNo, username } = body;
    // const condition = [];
    const [list, total] = await this._findPayments(body);
    // tradeNo && condition.push({ tradeNo });
    // username && condition.push((db) => {});

    // const [list, total] = await this.payRepo.findAndCount({
    //   // relations: ['goods', 'user'],
    //   // alias: 'payments',
    //   join: {
    //     alias: 'payments',
    //     leftJoinAndSelect: {
    //       user: 'payments.user',
    //       goods: 'payments.goods',
    //     },
    //   },
    //   where: (db) => {

    //   },
    //   skip: (body.current - 1) * body.pageSize,
    //   take: body.pageSize,
    // });

    return {
      list,
      total,
    };
  }

  public async modifyPayment(body: ModifyPaymentDto) {
    const { id, purchased } = body;

    return this.payRepo.update({ id }, { purchased });
  }

  public async deletePayment(body: DeletePaymentDto) {
    return this.payRepo.delete({ id: body.id });
  }
}
