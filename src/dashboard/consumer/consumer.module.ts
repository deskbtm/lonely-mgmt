import { AdminModule } from '../rbac/admin/admin.module';
import { UserModule } from 'src/client/user/user.module';
import { UserEntity } from 'src/client/user/entity/user.entity';
import { ConsumerController } from './consumer.controller';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminAuthModule } from '../auth/auth.module';
import { ConsumerService } from './consumer.service';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([UserEntity]),
    AdminAuthModule,
    AdminModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: '10000d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ConsumerController],
  providers: [ConsumerService],
  exports: [ConsumerService],
})
export class ConsumerModule {}
