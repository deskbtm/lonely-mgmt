import { resolve } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UserModule } from '../client/user/user.module';

import { INestApplication } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { readJsonSync, writeJsonSync, ensureDirSync } from 'fs-extra';
import { PaymentModule } from 'src/payment/payment.module';

const pkg = readJsonSync(resolve(__dirname, '../../package.json'));

const saveApiDocPath = (name) => {
  const dir = resolve(`./docs/api/${pkg.name}-${pkg.version}`);
  ensureDirSync(dir);
  return resolve(dir, `${name}.json`);
};

export class Log {
  static get swagger() {
    this.bind(this);
    return {
      error(
        msg?: string,
        trace?: string,
        context?: string,
        isTimeDiffEnabled?: boolean,
      ) {
        Logger.error(
          `Swagger Error: ${msg}`,
          trace,
          context,
          isTimeDiffEnabled,
        );
      },
    };
  }
}

export const setupSwagger = (app: INestApplication) =>
  new Promise((resolve) => {
    try {
      const payOptions = new DocumentBuilder()
        .setTitle('支付 Api')
        .setDescription('支付 Api')
        .setVersion(pkg.version)
        .addTag('pay')
        .build();
      const payDoc = SwaggerModule.createDocument(app, payOptions, {
        include: [PaymentModule],
      });

      writeJsonSync(saveApiDocPath('pay'), payDoc);
      SwaggerModule.setup('api/pay', app, payDoc);

      const userOptions = new DocumentBuilder()
        .setTitle('用户 Api')
        .setDescription('用户')
        .setVersion(pkg.version)
        .addTag('user')
        .build();
      const userDoc = SwaggerModule.createDocument(app, userOptions, {
        include: [UserModule],
      });
      writeJsonSync(saveApiDocPath('user'), userDoc);
      SwaggerModule.setup('api/user', app, userDoc);
    } catch (e) {
      Log.swagger.error('api');
      console.log(e);
    } finally {
      resolve(null);
    }
  });
