import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ReviewDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  star: number;

  @IsString()
  @IsNotEmpty()
  detail: string;

  @IsBoolean()
  @IsNotEmpty()
  isReview: boolean;
}
