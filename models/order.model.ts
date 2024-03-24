import {
  Column,
  Model,
  Table,
  PrimaryKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { generateFixedLengthId } from 'services/genId';
import { User } from './user.model';
import { Address } from './address.model';

@Table
export class Order extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING(8), defaultValue: generateFixedLengthId })
  orderId: string;

  @Column
  userId: string;

  @Column
  addressId: string;

  @Column({ defaultValue: '' })
  slip: string;

  @Column
  payment: string;

  @Column
  status: string;

  @Column({ type: DataType.JSON })
  details: JSON;

  @BelongsTo(() => User, 'userId')
  user: User;

  @BelongsTo(() => Address, 'addressId')
  address: Address;
}
