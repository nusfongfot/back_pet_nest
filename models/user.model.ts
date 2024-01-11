import {
  Column,
  Model,
  Table,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';
import { generateFixedLengthId } from 'services/genId';

@Table
export class User extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING(8),
    defaultValue: generateFixedLengthId,
  })
  userId: string;

  @Column
  name: string;

  @Column({ unique: true })
  email: string;

  @Column
  picture: string;

  @Column({ defaultValue: 'user' })
  level: string;
}
