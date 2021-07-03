import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from 'src/dashboard/rbac/admin/admin.module';
import { AdminEntity } from 'src/dashboard/rbac/admin/entity/admin.entity';
import { GoodsEntity } from 'src/goods/entity/goods.entity';
import { GoodsModule } from 'src/goods/goods.module';
import { SplashNotificationEntity } from './entity/splash-notification.entity';
import { SplashNotificationController } from './splash-notification.controller';
import { SplashNotificationService } from './splash-notification.service';

@Module({
  imports: [
    AdminModule,
    GoodsModule,
    TypeOrmModule.forFeature([
      GoodsEntity,
      AdminEntity,
      SplashNotificationEntity,
    ]),
  ],
  controllers: [SplashNotificationController],
  providers: [SplashNotificationService],
})
export class SplashNotificationModule {}
