import { AdminModule } from './../../dashboard/rbac/admin/admin.module';
import { Module } from '@nestjs/common';
import { TinyToolController } from './tiny-tool.controller';
import { TinyToolService } from './tiny-tool.service';

@Module({
  imports: [AdminModule],
  controllers: [TinyToolController],
  providers: [TinyToolService],
})
export class TinyToolModule {}
