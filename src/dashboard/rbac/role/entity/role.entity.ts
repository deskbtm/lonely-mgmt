import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('role')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('varchar')
  name: string;

  @Column('varchar', { nullable: true })
  desc: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'create_time',
  })
  createTime?: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'update_time',
  })
  updateTime?: Date;

  // @ManyToOne(() => AdminEntity, (admin) => admin.roles)
  // admin: AdminEntity;

  // @ManyToMany((type) => PermissionEntity, (perm) => perm.roles)
  // @JoinTable({
  //   name: 'role_permission',
  //   joinColumns: [{ name: 'role_id' }],
  //   inverseJoinColumns: [{ name: 'permission_id' }],
  // })
  // permissions: PermissionEntity[];
}
