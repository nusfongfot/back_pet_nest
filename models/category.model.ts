import { Column, Model, Table, PrimaryKey } from 'sequelize-typescript';
import { generateFixedLengthId } from 'services/genId';

@Table
export class Category extends Model {
  @PrimaryKey
  @Column({ defaultValue: generateFixedLengthId })
  id: string;

  @Column
  title: string;
}
