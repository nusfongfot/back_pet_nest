import {
  Column,
  Model,
  Table,
  PrimaryKey,
  DataType,
  BelongsTo,
} from 'sequelize-typescript';
import { generateFixedLengthId } from 'services/genId';
import { Product } from './product.model';
import { User } from './user.model';
import { Address } from './address.model';

@Table
export class Order extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING(8), defaultValue: generateFixedLengthId })
  orderId: string;

  @Column
  productId: string;

  @Column
  userId: string;

  @Column
  addressId: string;

  @Column
  qty: string;

  @Column({ defaultValue: '' })
  slip: string;

  @Column
  payment: string;

  @Column
  status: string;

  @BelongsTo(() => Product, 'productId')
  product: object;

  @BelongsTo(() => User, 'userId')
  user: object;

  @BelongsTo(() => Address, 'addressId')
  address: object;
}
