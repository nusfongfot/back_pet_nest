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
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'models/user.model';
import { Address } from 'models/address.model';
import { Cart } from 'models/cart.model';
import { Product } from 'models/product.model';
import * as dayjs from 'dayjs';
import * as weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

@Controller('api/order')
export class OrderController {
  constructor(private readonly authService: AuthService) {}

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
  async getAllOrderByAdmin() {
    try {
      const data = await Order.findAll({
        order: [['createdAt', 'DESC']],
        include: [{ model: User, attributes: ['name'] }, { model: Address }],
      });
      return { data };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthenGuard)
  @Get('all/user')
  async getAllOrderOfUser(@Req() req: any) {
    const user = await this.authService.checkTokenEmailOfUser(req);
    const order = await Order.findAll({
      where: {
        userId: user.data.userId,
      },
      order: [['createdAt', 'DESC']],
    });
    return { data: order };
  }

  @UseGuards(AuthenGuard)
  @Post('insert')
  async createOrder(@Body() order: OrderDto, @Req() req: any) {
    try {
      const user = await this.authService.checkTokenEmailOfUser(req);

      const data = await Order.create({
        userId: order.userId,
        addressId: order.addressId,
        slip: order.slip,
        status: order.status,
        payment: order.payment,
        details: order.details,
      });

      if (data.payment == 'cod') {
        const cartItem = await Cart.findAll({
          where: {
            status: 'pending',
            userId: user.data.userId,
          },
        });
        cartItem.forEach(async (item) => {
          const findProduct = await Product.findOne({
            where: {
              productId: item.productId,
            },
          });
          const oldQty = Number(findProduct.qty);

          await Product.update(
            {
              qty: oldQty - item.qty,
            },
            {
              where: {
                productId: item.productId,
              },
            },
          );
        });
      }

      await Cart.update(
        { status: 'Already ordered' },
        {
          where: { userId: user.data.userId },
        },
      );

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

      if (status == 'Already ordered') {
        const dataArr = [];
        const findOrder = await Order.findOne({
          where: {
            orderId: query.orderId,
          },
        });

        const detailOrder = JSON.stringify(findOrder.details);
        const detailOrder1 = JSON.parse(detailOrder);
        dataArr.push(detailOrder1);
        const parsedDataArray = JSON.parse(dataArr[0]);
        parsedDataArray.map(async (item) => {
          const findProduct = await Product.findOne({
            where: {
              productId: item.productId,
            },
          });
          const oldQty = Number(findProduct.qty);
          await Product.update(
            {
              qty: oldQty - item.qty,
            },
            {
              where: {
                productId: item.productId,
              },
            },
          );
        });

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
      }

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

  @UseGuards(AuthenGuard)
  @Get('revenue/week')
  async getRevenueCurrentWeek() {
    try {
      const orders = await Order.findAll({
        attributes: ['details', 'createdAt'],
      });

      const weeklyRevenue = {};
      for (let day = 0; day < 7; day++) {
        weeklyRevenue[day] = 0;
      }

      orders.forEach((item) => {
        const dataCurrentDay = new Date(item.createdAt).getDay();

        const details = JSON.parse(item.details as any);
        if (!weeklyRevenue[dataCurrentDay]) {
          weeklyRevenue[dataCurrentDay] = 0;
        }

        const filterDataCurrentWeek = details.filter(() => {
          const currentWeek = dayjs().week();
          const weekOfData = dayjs(item.createdAt).week();
          return currentWeek == weekOfData;
        });

        const totalPrice = filterDataCurrentWeek.reduce((acc, val) => {
          const total = val.qty * val.product.price;
          return acc + total;
        }, 0);

        weeklyRevenue[dataCurrentDay] += totalPrice;
      });

      const values = Object.values(weeklyRevenue);
      return { data: values };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AuthenGuard)
  @Get('revenue/all')
  async getTotalRevenue() {
    try {
      const orders = await Order.findAll({
        attributes: ['details', 'createdAt'],
      });

      const dataForCalculate = orders.map((item) => {
        const details = JSON.parse(item.details as any);
        const totalPrice = details.reduce((acc, val) => {
          const total = val.qty * val.product.price;
          return acc + total;
        }, 0);
        return totalPrice;
      });
      const data = dataForCalculate.reduce((acc, val) => acc + val, 0);

      return { data };
    } catch (error) {
      return error;
    }
  }
  @UseGuards(AuthenGuard)
  @Get('revenue/month')
  async getRevenueOfMonth() {
    try {
      const orders = await Order.findAll({
        attributes: ['details', 'createdAt'],
      });
      const monthlyRevenue = {};

      for (let month = 1; month <= 12; month++) {
        monthlyRevenue[month] = 0;
      }

      orders.forEach((item) => {
        const currentYear = new Date().getFullYear();
        const details = JSON.parse(item.details as any);
        const currentMonth = new Date(item.createdAt).getMonth() + 1; // 3
        const orderYear = new Date(item.createdAt).getFullYear();

        const totalPrice = details.reduce((acc, val) => {
          const total = val.qty * val.product.price;
          return acc + total;
        }, 0);

        if (!monthlyRevenue[currentMonth]) {
          monthlyRevenue[currentMonth] = 0;
        }

        if (orderYear !== currentYear) {
          details.filter((item) => {
            const data = new Date(item.createdAt).getFullYear();
            return data == currentYear;
          });
          monthlyRevenue[currentMonth] += totalPrice;
        }
        monthlyRevenue[currentMonth] += totalPrice;
      });
      const revenueArray = Object.values(monthlyRevenue);
      return { data: revenueArray };
    } catch (error) {
      return error;
    }
  }
}
