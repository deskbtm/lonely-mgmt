import { PaymentEntity } from './../../payment/entity/payment.entity';
import { GoodsEntity } from 'src/goods/entity/goods.entity';
import { AdminEntity } from 'src/dashboard/rbac/admin/entity/admin.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserEntity } from './entity/user.entity';

import { DeviceEntity } from './entity/device.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientAuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      DeviceEntity,
      AdminEntity,
      GoodsEntity,
      PaymentEntity,
    ]),
    ClientAuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: '10000d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
