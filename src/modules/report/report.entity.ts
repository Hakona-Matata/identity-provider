import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Type } from 'class-transformer';

@Entity({ name: 'reports' })
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;

  @Column()
  manufacture: string;

  @Column()
  model: string;

  @Column()
  creationYear: number;

  @Column()
  lng: number;

  @Column()
  lat: number;

  @Column()
  milage: number;

  @Column({ default: false })
  isApproved: boolean;

  @ManyToOne(
    () => User,
    (user) => {
      user.reports;
    },
  )
  user: User;
}
