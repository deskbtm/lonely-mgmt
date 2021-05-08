import { TinyToolModule } from './tiny/tiny-tool.module';
import { AppUpdateModule } from './app-update/app-update.module';

import { Module } from '@nestjs/common';
import { SplashNotificationModule } from './splash-notificaiton/splash-notification.module';
import { MySqlBakService } from './tasks/mysql-bak.service';

@Module({
  imports: [
    AppUpdateModule,
    SplashNotificationModule,
    TinyToolModule,
    MySqlBakService,
  ],
  exports: [AppUpdateModule, SplashNotificationModule, TinyToolModule],
})
export class ToolsModule {}
