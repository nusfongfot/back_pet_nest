import { IsNotEmpty, IsString } from 'class-validator';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  houseNo: string;

  @IsString()
  @IsNotEmpty()
  road: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsNotEmpty()
  amphoe: string;

  @IsString()
  @IsNotEmpty()
  tambon: string;

  @IsString()
  @IsNotEmpty()
  zipcode: string;

  @IsString()
  detail: string;
}
