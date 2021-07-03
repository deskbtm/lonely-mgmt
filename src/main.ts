import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { readFileSync } from 'fs';
import { HttpExceptionFilter } from './common';
import { resolve } from 'path';

const ENV = process.env.NODE_ENV;

console.log(
  `--------------------------------${ENV}----------------------------------`,
);

async function bootstrap() {
  process.env.ALIPAY_APP_PRIVATE_KEY = readFileSync(
    resolve(__dirname, '../key/alipay_app_private.pem'),
    'utf-8',
  );

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions: {
      key: readFileSync(resolve(__dirname, `../key/${process.env.HTTPS_KEY}`)),
      cert: readFileSync(
        resolve(__dirname, `../key/${process.env.HTTPS_CERT}`),
      ),
    },
    cors: true,
    bodyParser: true,
  });

  // 配置swagger
  // isProd || setupSwagger(app);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('v1');

  // web漏洞
  // app.use(helmet());
  app.useStaticAssets(resolve(__dirname, '../assets/'), {
    prefix: '/assets',
  });

  await app.listen(process.env.PORT || 1031);
}

bootstrap();
