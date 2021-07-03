import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GoodsEntity } from 'src/goods/entity/goods.entity';
import { AppUpdateEntity } from 'src/tools/app-update/entity/app-update.entity';
import { SplashNotificationEntity } from 'src/tools/splash-notificaiton/entity/splash-notification.entity';

@Entity('admin')
export class AdminEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('varchar', { unique: true })
  username: string;

  @Column('varchar', { select: false })
  password: string;

  // 无中间实体表的配置
  // @OneToMany(() => RoleEntity, (role) => role.admin, { cascade: true })
  // roles?: string[];

  @Column('text', { name: 'bilibili_cookie', default: null })
  bilibiliCookie?: string;

  @Column('varchar', { name: 'bilibili_uid', default: null })
  bilibiliUid?: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'create_time',
    comment: '创建时间',
  })
  createTime?: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'update_time',
    comment: '更新时间',
  })
  updateTime?: Date;

  @OneToMany(() => GoodsEntity, (goods) => goods.createBy, {
    cascade: true,
  })
  goods: GoodsEntity[];

  @OneToMany(() => AppUpdateEntity, (record) => record.releaseBy, {
    cascade: true,
  })
  updateRecords: AppUpdateEntity[];

  @OneToMany(() => SplashNotificationEntity, (record) => record.releaseBy, {
    cascade: true,
  })
  notifications: SplashNotificationEntity[];
}
