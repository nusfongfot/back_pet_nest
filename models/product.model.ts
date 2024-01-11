import {
  Column,
  Model,
  Table,
  PrimaryKey,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { generateFixedLengthId } from 'services/genId';
import { Review } from './review.model';
import { Order } from './order.model';

@Table
export class Product extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING(8), defaultValue: generateFixedLengthId })
  productId: string;

  @Column
  title: string;

  @Column
  price: string;

  @Column
  qty: string;

  @Column
  category: string;

  @Column({ type: DataType.JSON })
  description: string;

  @Column
  brand: string;

  @Column({ type: DataType.JSON })
  images: string;

  @Column({ defaultValue: false })
  deleted: boolean;

  @HasMany(() => Review, 'productId')
  reviews: any[];

  @HasMany(() => Order, 'productId')
  orders: any[];
}
