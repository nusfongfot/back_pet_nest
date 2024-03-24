import {
  Column,
  Model,
  Table,
  PrimaryKey,
  DataType,
} from 'sequelize-typescript';
import { generateFixedLengthId } from 'services/genId';

@Table
export class Address extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING(8), defaultValue: generateFixedLengthId })
  addressId: string;

  @Column
  userId: string;

  @Column
  phone: string;

  @Column
  houseNo: string;

  @Column
  road: string;

  @Column
  province: string;

  @Column
  amphoe: string;

  @Column
  tambon: string;

  @Column
  zipcode: string;

  @Column
  detail: string;

  @Column({ defaultValue: false })
  isDefault: boolean;

  @Column({ defaultValue: false })
  deleted: boolean;
}
