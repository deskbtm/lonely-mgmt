import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PermissionEnum {
  all = 0,
  write = 1,
  read = 2,
}

@Entity('permission')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  pid: number;

  @Column()
  code: string;

  @Column()
  name: string;

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

  // @ManyToMany(type => RoleEntity, role => role.permissions)
  // roles?: RoleEntity[];
}
