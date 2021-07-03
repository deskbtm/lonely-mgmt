import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { DeviceEntity } from './device.entity';
import { PaymentEntity } from 'src/payment/entity/payment.entity';
import { GoodsEntity } from 'src/goods/entity/goods.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true })
  username: string;

  @Column('varchar', { select: false })
  password: string;

  @Column('boolean', { comment: '用户状态', default: false })
  forbidden?: boolean;

  @Column('boolean', { default: false })
  followedBilibili?: boolean;

  @Column('varchar', { default: null })
  bilibiliUid?: string;

  // // 无中间实体表的配置
  // @ManyToMany((type) => RoleEntity, (role) => role.users, { cascade: true })
  // @JoinTable({
  //   name: 'user_role',
  //   joinColumns: [{ name: 'user_id' }],
  //   inverseJoinColumns: [{ name: 'role_id' }],
  // })
  // roles?: RoleEntity[];

  @OneToMany(() => UserEntity, (g) => g.inviteBy)
  invitations: UserEntity[];

  @OneToMany(() => UserEntity, (g) => g.invitations)
  inviteBy: UserEntity;

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

  @OneToOne(() => DeviceEntity, (device) => device.user, { cascade: true })
  @JoinColumn({ name: 'device_id' })
  device?: DeviceEntity;

  @OneToMany(() => GoodsEntity, (goods) => goods.user, { cascade: true })
  goods?: GoodsEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.user, { cascade: true })
  payments?: PaymentEntity[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 12);
  }
}
