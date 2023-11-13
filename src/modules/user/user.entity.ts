import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'User Entity' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isDeleted: boolean;
}
