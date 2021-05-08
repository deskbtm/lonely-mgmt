import { GoodsModule } from '../goods/goods.module';
import { Module } from '@nestjs/common';
import { RbacModule } from './rbac/rbac.module';
import { ConsumerModule } from './consumer/consumer.module';

@Module({
  imports: [GoodsModule, RbacModule, ConsumerModule],
  exports: [GoodsModule, RbacModule, ConsumerModule],
})
export class DashboardModule {}
