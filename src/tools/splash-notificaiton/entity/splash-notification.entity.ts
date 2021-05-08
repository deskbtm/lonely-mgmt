import { AdminEntity } from '../../../dashboard/rbac/admin/entity/admin.entity';
import { GoodsEntity } from '../../../goods/entity/goods.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('splash-notification')
export class SplashNotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GoodsEntity, (goods) => goods.notifications)
  goods: GoodsEntity;

  @CreateDateColumn({
    name: 'timestamp',
  })
  releaseTimestamp: Date;

  @Column('varchar')
  title: string;

  @Column({
    name: 'description',
    type: 'text',
  })
  description: string;

  @Column({
    name: 'description_html',
    type: 'text',
  })
  descriptionHtml: string;

  @ManyToOne(() => AdminEntity, (admin) => admin.updateRecords)
  releaseBy: AdminEntity;

  @Column({
    name: 'force_display',
    type: 'boolean',
    comment: '否强制展示',
  })
  forceDisplay: boolean;

  @Column({
    name: 'display',
    type: 'boolean',
    comment: '是否展示',
  })
  display: boolean;

  @Column({
    name: 'buttons',
    type: 'json',
    default: null,
  })
  buttons: object;
}
