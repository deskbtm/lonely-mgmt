import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('device')
export class DeviceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('varchar', { nullable: true })
  uniqueId?: string;

  // Android: "Android"; iOS: "iOS" or "iPadOS"; web: "iOS", "Android", "Windows"
  @Column('varchar', { nullable: true })
  os?: string;

  // Android: "4.0.3"; iOS: "12.3.1"; web: "11.0", "8.1.0"
  @Column('varchar', { nullable: true })
  osVersion?: string;

  // Android: "google", "xiaomi"; iOS: "Apple"; web: null
  @Column('varchar', { nullable: true })
  brand?: string;

  @Column('bigint', { nullable: true })
  totalMemory;

  // Android: "Pixel 2"; iOS: "iPhone XS Max"; web: "iPhone", null
  @Column('varchar', { nullable: true })
  modelName?: string;

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

  @OneToOne(() => UserEntity, (user) => user.device)
  user?: UserEntity;
}
