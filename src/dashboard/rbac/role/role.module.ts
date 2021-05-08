import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModule } from '../admin/admin.module';
import { RoleService } from './role.service';

@Module({
  imports: [
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
  controllers: [],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
