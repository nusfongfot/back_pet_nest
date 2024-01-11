import {
  Column,
  Model,
  Table,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';
import { generateFixedLengthId } from 'services/genId';

@Table
export class Admin extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING(8),
    defaultValue: generateFixedLengthId,
  })
  adminId: string;

  @Column
  name: string;

  @Column({ unique: true })
  email: string;

  @Column
  phone: string;

  @Column
  password: string;

  @Column({ defaultValue: 'admin' })
  level: string;

  @Column
  picture: string;
}
