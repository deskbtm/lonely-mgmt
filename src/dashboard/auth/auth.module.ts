import { AdminModule } from '../rbac/admin/admin.module';
import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminAuthService } from './auth.service';
import { AdminJwtStrategy } from './jwt.strategy';
import { AdminLocalStrategy } from './local.strategy';

@Module({
  imports: [
    PassportModule,
    forwardRef(() => AdminModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: '10000d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AdminAuthService, AdminLocalStrategy, AdminJwtStrategy],
  exports: [AdminAuthService, AdminLocalStrategy, AdminJwtStrategy],
})
export class AdminAuthModule {}
