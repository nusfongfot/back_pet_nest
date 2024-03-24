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
import { AuthService } from 'src/auth/auth.service';
import { AuthenGuard } from 'src/auth/guards/auth.guard';
import { CartDto } from './dto/cart.dto';
import { Cart } from 'models/cart.model';
import { Product } from 'models/product.model';
import { Op } from 'sequelize';

@UseGuards(AuthenGuard)
@Controller('api/cart')
export class CartController {
  constructor(private readonly authService: AuthService) {}

  @Get('history')
  async getHistoryCarts(@Req() req: any) {
    try {
      const user = await this.authService.checkTokenEmailOfUser(req);
      const data = await Cart.findAll({
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Product,
            attributes: ['title', 'price', 'images'],
            where: {
              deleted: false,
            },
          },
        ],
        where: {
          userId: user.data.userId,
          status: {
            [Op.ne]: 'pending',
          },
        },
      });
      return { data };
    } catch (error) {
      return error;
    }
  }

  @Get('all')
  async getAllCarts(@Req() req: any) {
    try {
      const user = await this.authService.checkTokenEmailOfUser(req);
      const data = await Cart.findAll({
        include: [
          {
            model: Product,
            attributes: ['title', 'price', 'images'],
            where: { deleted: false },
          },
        ],
        where: {
          status: 'pending',
          userId: user.data.userId,
        },
        order: [['createdAt', 'DESC']],
      });
      return { data };
    } catch (error) {
      return error;
    }
  }

  @Post('insert')
  async createCart(@Body() cart: CartDto) {
    try {
      const product = await Cart.findOne({
        where: {
          productId: cart.productId,
          status: 'pending',
        },
      });

      if (product) {
        throw new BadRequestException('This product is in your cart');
      }

      const data = await Cart.create({
        productId: cart.productId,
        userId: cart.userId,
        qty: cart.qty,
      });

      return { data, message: 'add to cart successfully' };
    } catch (error) {
      return error;
    }
  }

  @Delete('delete')
  async deleteCart(@Query() query: any) {
    try {
      await Cart.destroy({
        where: {
          cartId: query.cartId,
        },
      });
      return { message: 'delete successfully' };
    } catch (error) {
      return error;
    }
  }

  @Put('edit')
  async updateStatus(@Query() query: any, @Body('status') status: string) {
    try {
      await Cart.update(
        {
          status: status,
        },
        {
          where: {
            cartId: query.cartId,
          },
        },
      );
      return { message: 'update status successfully' };
    } catch (error) {
      return error;
    }
  }
}
