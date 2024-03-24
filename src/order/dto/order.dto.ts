import { IsNotEmpty, IsString } from 'class-validator';

export class OrderDto {
  // @IsString()
  // @IsNotEmpty()
  // productId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  addressId: string;

  // @IsString()
  // @IsNotEmpty()
  // qty: string;

  @IsString()
  slip: string;

  @IsString()
  @IsNotEmpty()
  payment: string;

  @IsString()
  details: string;

  @IsString()
  status: string;
}
