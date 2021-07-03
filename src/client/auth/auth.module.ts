import { Module, forwardRef } from '@nestjs/common';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from 'src/client/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientAuthService } from './auth.service';
import { ClientLocalStrategy } from './local.strategy';
import { ClientJwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    forwardRef(() => UserModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: '10000d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ClientAuthService, ClientLocalStrategy, ClientJwtStrategy],
  exports: [ClientAuthService, ClientLocalStrategy, ClientJwtStrategy],
})
export class ClientAuthModule {}
