import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './entity/payment.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoodsModule } from 'src/goods/goods.module';
import { RbacModule } from 'src/dashboard/rbac/rbac.module';
import { UserModule } from 'src/client/user/user.module';

@Module({
  imports: [
    RbacModule,
    GoodsModule,
    UserModule,
    TypeOrmModule.forFeature([PaymentEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: '10000d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
