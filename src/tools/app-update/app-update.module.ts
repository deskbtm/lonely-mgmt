import { AdminEntity } from './../../dashboard/rbac/admin/entity/admin.entity';
import { GoodsModule } from 'src/goods/goods.module';
import { AdminModule } from './../../dashboard/rbac/admin/admin.module';
import { AppUpdateService } from './app-update.service';
import { AppUpdateEntity } from './entity/app-update.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUpdateController } from './app-update.controller';
import { GoodsEntity } from 'src/goods/entity/goods.entity';

@Module({
  imports: [
    AdminModule,
    GoodsModule,
    TypeOrmModule.forFeature([AppUpdateEntity, GoodsEntity, AdminEntity]),
  ],
  controllers: [AppUpdateController],
  providers: [AppUpdateService],
  exports: [AppUpdateService],
})
export class AppUpdateModule {}
