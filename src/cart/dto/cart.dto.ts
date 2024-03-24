import { IsNotEmpty, IsString } from 'class-validator';

export class CartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  qty: number;

  @IsString()
  status: string;
}
