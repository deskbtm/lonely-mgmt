import { UserEntity } from 'src/client/user/entity/user.entity';
import { SplashNotificationEntity } from './../../tools/splash-notificaiton/entity/splash-notification.entity';
import { AdminEntity } from '../../dashboard/rbac/admin/entity/admin.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AppUpdateEntity } from 'src/tools/app-update/entity/app-update.entity';
import { PaymentEntity } from 'src/payment/entity/payment.entity';

@Entity('goods')
export class GoodsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'goods_name', length: 32, unique: true })
  goodsName: string;

  @Column({ name: 'package_name', length: 64, type: 'varchar', unique: true })
  packageName: string;

  @Column({ type: 'double' })
  price: number;

  @Column({ type: 'double', default: 0 })
  discount: number;

  @ManyToOne(() => AdminEntity, (admin) => admin.goods)
  createBy: AdminEntity;

  @Column({ type: 'boolean', default: false })
  disabled: boolean;

  @Column({ type: 'varchar', default: null })
  shareUrl: string;

  // 支付宝回调
  @Column({ name: 'alipay_callback', type: 'varchar' })
  alipayCallback: string;

  @Column({ name: 'alipay_gateway', type: 'varchar' })
  alipayGateway: string;

  @Column({ name: 'alipay_desc', type: 'text' })
  alipayDesc: string;

  @OneToMany(() => AppUpdateEntity, (record) => record.goods, {
    cascade: true,
  })
  updateRecords: AppUpdateEntity[];

  @OneToMany(() => SplashNotificationEntity, (n) => n.goods, {
    cascade: true,
  })
  notifications: SplashNotificationEntity[];

  @OneToMany(() => PaymentEntity, (n) => n.goods, {
    cascade: true,
  })
  payments: PaymentEntity[];

  @Column('boolean', { default: false })
  accomplishShareTask: boolean;

  @ManyToOne(() => UserEntity, (u) => u.goods)
  user: UserEntity;
}
