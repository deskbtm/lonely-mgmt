import { UserEntity } from 'src/client/user/entity/user.entity';
import { GoodsEntity } from 'src/goods/entity/goods.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('payment')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GoodsEntity, (g) => g.payments)
  goods: GoodsEntity;

  // @Column({ name: 'goods_name', length: 32, nullable: true })
  // goodsName: string;

  // @Column({ name: 'package_name', length: 32, nullable: true })
  // packageName: string;

  @CreateDateColumn({
    name: 'pay_timestamp',
  })
  payTimestamp: Date;

  @Column({ name: 'trade_no', type: 'varchar', length: 64, nullable: true })
  tradeNo: string;

  @Column({
    name: 'alipay_trade_no',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  alipayTradeNo: string;

  @Column({
    name: 'buyer_alipay_id',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  buyerAlipayId: string;

  @Column({ name: 'purchased', type: 'boolean', default: false })
  purchased: boolean;

  @Column({ name: 'pay_amount', type: 'double', nullable: true })
  payAmount: number;

  @Column({ type: 'double', default: 0 })
  discount: number;

  @Column({ type: 'json', nullable: true })
  json: object;

  @ManyToOne(() => UserEntity, (user) => user.payments)
  user?: UserEntity;
}
