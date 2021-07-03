import { Module } from '@nestjs/common';

import { AdminModule } from './admin/admin.module';

@Module({
  exports: [AdminModule],
  imports: [AdminModule],
})
export class RbacModule {}
