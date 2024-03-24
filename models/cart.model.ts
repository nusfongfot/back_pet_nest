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

@Table
export class Cart extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING(8), defaultValue: generateFixedLengthId })
  cartId: string;

  @Column
  productId: string;

  @Column
  userId: string;

  @Column
  qty: number;

  @Column({ defaultValue: 'pending' })
  status: string;

  @BelongsTo(() => Product, 'productId')
  product: Product;
}
