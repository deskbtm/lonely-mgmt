import { GoodsModule } from './goods/goods.module';
import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { resolve } from 'path';
import configure from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';
import { RateLimitMiddleware } from './middleware/rateLimit.middleware';
import { ClientModule } from './client/client.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ToolsModule } from './tools/toots.module';
import { PaymentModule } from './payment/payment.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    DashboardModule,
    ClientModule,
    ToolsModule,
    PaymentModule,
    GoodsModule,
    ConfigModule.forRoot({
      envFilePath: resolve(__dirname, `../.env.${process.env.NODE_ENV}`),
      isGlobal: true,
      load: configure,
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (config) => config.get('mysql'),
    //   inject: [ConfigService],
    // }),
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get('redis'),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          transport: {
            port: config.get('mailer.port'),
            ignoreTLS: false,
            secure: true,
            service: '163',
            auth: {
              user: config.get('mailer.user'),
              pass: config.get('mailer.pwd'),
            },
          },
          defaults: {
            from: config.get('mailer.user'),
          },
          preview: true,
          template: {
            dir: resolve(__dirname, '../public/mail-template/'),
            adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes({
      path: '/',
      method: RequestMethod.ALL,
    });
  }
}
