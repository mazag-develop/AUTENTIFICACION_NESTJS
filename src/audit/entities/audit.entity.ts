import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit')
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  action: string; // ej: CREATE_USER, UPDATE_ROLE

  @Column()
  module: string; // ej: "users", "roles"

  @Column({ type: 'json', nullable: true })
  details?: any;

  @CreateDateColumn()
  createdAt: Date;
}
