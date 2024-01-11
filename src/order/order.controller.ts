import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderDto } from './dto/order.dto';
import { Order } from 'models/order.model';
import { AuthenGuard } from 'src/auth/guards/auth.guard';
import { Product } from 'models/product.model';
import { User } from 'models/user.model';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { Request } from 'express';
import { Address } from 'models/address.model';

@Controller('api/order')
export class OrderController {
  constructor() {}

  @Get('check-status')
  async getStatusOrder(@Query() query: any) {
    try {
      const data = await Order.findOne({
        where: {
          orderId: query.orderId,
        },
      });

      if (!data) {
        throw new BadRequestException('order not found');
      }
      return { data };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthenGuard)
  @Get('all')
  async getAllOrder() {
    try {
      const data = await Order.findAll({
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Product,
            attributes: ['title', 'price', 'qty', 'images'],
          },
          {
            model: User,
            attributes: ['name'],
          },
          {
            model: Address,
            attributes: [
              'phone',
              'houseNo',
              'road',
              'province',
              'amphoe',
              'tambon',
              'zipcode',
              'detail',
            ],
          },
        ],
      });
      return { data };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthenGuard)
  @Post('insert')
  async createOrder(@Body() order: OrderDto) {
    try {
      const findOrder = await Order.findOne({
        where: {
          productId: order.productId,
        },
      });

      if (findOrder) {
        throw new BadRequestException('This product is in your cart');
      }

      const product = await Product.findOne({
        where: {
          productId: order.productId,
          deleted: false,
        },
      });

      if (!product) {
        throw new BadRequestException('product not found');
      }
      const updatedQty = Number(product.qty) - Number(order.qty);

      await Product.update(
        {
          qty: updatedQty,
        },
        {
          where: {
            productId: order.productId,
          },
        },
      );

      const data = await Order.create({
        productId: order.productId,
        userId: order.userId,
        addressId: order.addressId,
        slip: order.slip,
        qty: order.qty,
        status: order.status,
        payment: order.payment,
      });

      return { message: 'create order successfully', data };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthenGuard)
  @Delete('delete')
  async deleteOrder(@Query() query: any) {
    try {
      const data = await Order.findOne({
        where: {
          orderId: query.orderId,
        },
      });
      if (!data) {
        throw new BadRequestException('this product is already delete!');
      }
      await Order.destroy({
        where: {
          orderId: query.orderId,
        },
      });
      return { message: 'delete order successfully' };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AdminGuard)
  @Put('edit-status')
  async updateStatusOrder(@Req() req: Request, @Query() query: any) {
    try {
      const { status } = req.body;
      await Order.update(
        {
          status: status,
        },
        {
          where: {
            orderId: query.orderId,
          },
        },
      );

      return { message: 'update status successfully' };
    } catch (error) {
      return error;
    }
  }
}
