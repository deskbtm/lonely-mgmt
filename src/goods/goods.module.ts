import { AdminEntity } from '../dashboard/rbac/admin/entity/admin.entity';
import { RbacModule } from '../dashboard/rbac/rbac.module';
import { GoodsService } from './goods.service';
import { GoodsEntity } from './entity/goods.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoodsController } from './goods.controller';
import { AdminJwtStrategy } from '../dashboard/auth/jwt.strategy';

@Module({
  imports: [
    RbacModule,
    TypeOrmModule.forFeature([GoodsEntity, AdminEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: '3d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [GoodsController],
  providers: [AdminJwtStrategy, GoodsService],
  exports: [GoodsService],
})
export class GoodsModule {}
