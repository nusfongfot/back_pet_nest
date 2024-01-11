import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AddressDto } from './dto/address.dto';
import { Address } from 'models/address.model';
import { AuthenGuard } from 'src/auth/guards/auth.guard';

@Controller('api/address')
export class AddressController {
  constructor() {}

  @UseGuards(AuthenGuard)
  @Get('user')
  async getAddressOfUserId(@Query() query) {
    try {
      const data = await Address.findAll({
        where: {
          userId: query.userId,
          deleted: false,
        },
        order: [['createdAt', 'DESC']],
      });
      return { data };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthenGuard)
  @Get('user/selected')
  async getSelectedAddressOfUser(@Query() query) {
    try {
      const data = await Address.findAll({
        where: {
          userId: query.userId,
          deleted: false,
          isDefault: true,
        },
        order: [['createdAt', 'DESC']],
      });
      return { data };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthenGuard)
  @Get('edit/selected')
  async updateSeletedAddress(@Query() query: any) {
    try {
      await Address.update(
        {
          isDefault: false,
        },
        {
          where: {
            userId: query.userId,
            deleted: false,
          },
        },
      );
      await Address.update(
        {
          isDefault: true,
        },
        {
          where: {
            addressId: query.addressId,
            deleted: false,
          },
        },
      );
      return { message: 'set default address successfully' };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthenGuard)
  @Post('insert')
  async createAddress(@Body() address: AddressDto) {
    try {
      const data = await Address.create({
        userId: address.userId,
        phone: address.phone,
        houseNo: address.houseNo,
        road: address.road,
        province: address.province,
        amphoe: address.amphoe,
        tambon: address.tambon,
        zipcode: address.zipcode,
        detail: address.detail,
      });
      return { message: 'create address successfully', data };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthenGuard)
  @Put('edit')
  async editAddress(@Body() address: AddressDto, @Query() query: any) {
    try {
      const data = await Address.findOne({
        where: {
          addressId: query.addressId,
          deleted: false,
        },
      });

      if (!data) {
        throw new BadRequestException('address not found');
      }
      await Address.update(
        {
          userId: address.userId,
          phone: address.phone,
          houseNo: address.houseNo,
          road: address.road,
          province: address.province,
          amphoe: address.amphoe,
          tambon: address.tambon,
          zipcode: address.zipcode,
          detail: address.detail,
        },
        {
          where: {
            addressId: query.addressId,
          },
        },
      );

      return { message: 'update address successfully' };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthenGuard)
  @Delete('delete')
  async deleteAddress(@Query() query: any) {
    try {
      const data = await Address.findOne({
        where: {
          addressId: query.addressId,
          deleted: false,
        },
      });

      if (!data) {
        throw new BadRequestException('address not found');
      }
      await Address.update(
        {
          deleted: true,
        },
        {
          where: {
            addressId: query.addressId,
          },
        },
      );
      return { message: 'delete address successfully' };
    } catch (error) {
      return error;
    }
  }
}
