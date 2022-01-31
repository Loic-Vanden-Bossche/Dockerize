import { Entity, Column, ManyToMany, JoinTable, PrimaryColumn } from 'typeorm';
import { Role } from '../roles/role.model';
import { BaseEntity } from '../shared/base-entity';

@Entity('books')
export class Book extends BaseEntity {
  static readonly PRIMARY_KEY = 'isbn';

  @PrimaryColumn('varchar', { length: 13 })
  isbn: string;

  @Column('varchar', { length: 200 })
  title: string;

  @Column('varchar', { length: 150 })
  author: string;

  @Column('varchar', { length: 1500, nullable: true })
  overview: string;

  @Column('integer', { default: 1, nullable: true})
  read_count: number;

  @Column('bytea', { nullable: true})
  picture: any;

}
