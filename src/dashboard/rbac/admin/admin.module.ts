import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminEntity } from './entity/admin.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminEntity]),
    AdminAuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: '10000d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
