import {
  Column,
  Model,
  Table,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';

function generateFixedLengthId(): string {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

@Table
export class Review extends Model {
  @PrimaryKey
  @Column({
    type: DataType.STRING(8),
    defaultValue: generateFixedLengthId,
  })
  reviewId: string;

  @Column
  productId: string;

  @Column
  name: string;

  @Column
  star: number;

  @Column
  detail: string;

  @Column({ defaultValue: false })
  isReview: boolean;
}
