import {
  Column,
  Model,
  Table,
  PrimaryKey,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { generateFixedLengthId } from 'services/genId';
import { Address } from './address.model';

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

  @HasMany(() => Address, 'userId')
  address: Address;
}
