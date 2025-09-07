import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: false })
  redirectUrl: string;

  @ManyToMany(() => User, (user) => user.applications)
  users: User[];

  @OneToMany(() => Permission, (permission) => permission.app)
  permissions: Permission[];
}
