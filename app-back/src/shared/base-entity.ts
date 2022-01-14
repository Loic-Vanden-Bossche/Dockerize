import { UpdateDateColumn, CreateDateColumn, DeleteDateColumn } from 'typeorm';

export class BaseEntity {
  static readonly PRIMARY_KEY?: string;

  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deleteAt: Date;
}
