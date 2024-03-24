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
      const curr = new Date();
      const startDayofWeek = new Date(
        curr.setDate(curr.getDate() - curr.getDay()),
      );
      const getDateOfStartDay = startDayofWeek.getDate();

      const lastDayofWeek = new Date(
        curr.setDate(curr.getDate() - curr.getDay() + 6),
      );
      const getDateOfEndtDay = lastDayofWeek.getDate();

      const filteredData = orders.filter((item) => {
        const createdAt = new Date(item.createdAt);
        const getDateOfCreatedAt = createdAt.getDate();
        return (
          getDateOfCreatedAt >= getDateOfStartDay &&
          getDateOfCreatedAt <= getDateOfEndtDay
        );
      });
      const data = filteredData.map((item) => {
        const details = JSON.parse(item.details as any);
        const totalPrice = details.reduce((acc, val) => {
          const total = val.qty * val.product.price;
          return acc + total;
        }, 0);
        return totalPrice;
      });

      return { data };
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
      const currentYear = new Date().getFullYear();

      orders.forEach((item) => {
        const details = JSON.parse(item.details as any);
        const currentMonth = new Date(item.createdAt).getMonth() + 1; // 3
        const orderYear = new Date(item.createdAt).getFullYear();

        // prevent null value
        if (!monthlyRevenue[currentMonth] && orderYear != currentYear) {
          monthlyRevenue[currentMonth] = 0;
        }

        const totalPrice = details.reduce((acc, val) => {
          const total = val.qty * val.product.price;
          return acc + total;
        }, 0);
        monthlyRevenue[currentMonth] += totalPrice;
      });
      const revenueArray = Object.values(monthlyRevenue);
      return { data: revenueArray };
    } catch (error) {
      return error;
    }
  }
}
