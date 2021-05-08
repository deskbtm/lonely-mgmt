import { AdminEntity } from './../../../dashboard/rbac/admin/entity/admin.entity';
import { GoodsEntity } from '../../../goods/entity/goods.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('app-update')
export class AppUpdateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GoodsEntity, (goods) => goods.updateRecords)
  @JoinColumn()
  goods: GoodsEntity;

  @CreateDateColumn({
    name: 'release_timestamp',
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

  @Column({
    name: 'semver',
    unique: true,
  })
  semver: string;

  @ManyToOne(() => AdminEntity, (admin) => admin.updateRecords)
  releaseBy: AdminEntity;

  @Column({
    name: 'force_update',
    type: 'boolean',
    default: false,
  })
  forceUpdate: boolean;
}
