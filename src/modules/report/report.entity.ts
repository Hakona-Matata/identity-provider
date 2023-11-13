import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'The Report Entity' })
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: number;
}
