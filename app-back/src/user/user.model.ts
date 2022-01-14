import { Entity, Column, ManyToMany, JoinTable, PrimaryColumn } from 'typeorm';
import { Role } from '../roles/role.model';
import { BaseEntity } from '../shared/base-entity';

@Entity('users')
export class User extends BaseEntity {
  static readonly PRIMARY_KEY = 'email';

  @PrimaryColumn('varchar', { length: 254 })
  email: string;

  @Column('varchar', { length: 100 })
  username: string;

  @Column()
  password: string;

  @ManyToMany(() => Role, { eager: true })
  @JoinTable()
  roles: Role[];

  removePassword(): User {
    delete this.password;
    return this;
  }
}
