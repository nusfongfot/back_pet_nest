import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { ProductDto } from './dto/product.dto';
import { Product } from 'models/product.model';
import { Order } from 'models/order.model';
import { Review } from 'models/review.model';
import { Op, Sequelize } from 'sequelize';

@Controller('api/product')
export class ProductController {
  constructor() {}

  @Get('all')
  async getAllProducts() {
    try {
      const data = await Product.findAll({
        include: [
          {
            model: Review,
            attributes: ['name', 'star'],
            required: false,
          },
          {
            model: Order,
            attributes: ['orderId', 'productId'],
            where: {
              status: 'Successful delivery',
            },
            required: false,
          },
        ],
        where: {
          deleted: false,
        },
        order: [['createdAt', 'DESC']],
      });

      return { data };
    } catch (error) {
      return error;
    }
  }

  @Get('detail/:id')
  async getDetailProducts(@Param() params: any) {
    try {
      const data = await Product.findOne({
        include: [{ model: Review }],
        where: {
          productId: params.id,
          deleted: false,
        },
        order: [['createdAt', 'DESC']],
      });
      if (!data) {
        throw new BadRequestException('product not found');
      }
      const sumReview = data.reviews.reduce((acc, val) => {
        const total = acc + val.star;
        return total;
      }, 0);
      const totalRating = Math.abs(sumReview / data.reviews.length);
      return { totalRating, data };
    } catch (error) {
      return error;
    }
  }

  @Get('bestseller')
  async getProductBestSeller() {
    try {
      const data = await Order.findAll({
        where: {
          status: 'Successful delivery',
        },
        include: [
          { model: Product, attributes: ['title', 'price', 'qty', 'images'] },
        ],
        group: ['productId'],
        order: [['createdAt', 'DESC']],
        attributes: ['orderId', 'productId', 'qty'],
        limit: 4,
      });
      return { data };
    } catch (error) {
      return error;
    }
  }

  @Get('search')
  async searchProduct(@Query() query: any) {
    const q = query.keyword;
    const data = await Product.findAll({
      order: [['createdAt', 'DESC']],
      where: {
        [Op.or]: [
          Sequelize.literal(
            'LOWER(product.title) LIKE :query OR LOWER(product.brand) LIKE :query',
          ),
          {
            title: {
              [Op.substring]: q.toLowerCase(),
            },
          },
          {
            brand: {
              [Op.substring]: q.toLowerCase(),
            },
          },
        ],
      },
      replacements: { query: `%${q.toLowerCase()}%` },
    });
    return { data };
  }
  catch(error) {
    return error;
  }

  @UseGuards(AdminGuard)
  @Post('insert')
  async createProduct(@Body() product: ProductDto) {
    try {
      const data = await Product.create({
        title: product.title,
        price: product.price,
        qty: product.qty,
        category: product.category,
        description: product.description,
        brand: product.brand,
        images: product.images,
      });
      return { message: 'create product successfully', data };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AdminGuard)
  @Put('edit/:id')
  async editProduct(@Body() productDto: ProductDto, @Param() params: any) {
    try {
      const product = await Product.findOne({
        where: {
          productId: params.id,
          deleted: false,
        },
      });

      if (!product) {
        throw new BadRequestException('product not found');
      }

      await Product.update(
        {
          title: productDto.title,
          price: productDto.price,
          qty: productDto.qty,
          category: productDto.category,
          description: productDto.description,
          brand: productDto.brand,
          // images: productDto.images,
        },
        {
          where: {
            productId: params.id,
          },
        },
      );
      return { message: 'update product successfully' };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AdminGuard)
  @Delete('delete/:id')
  async deleteProduct(@Param() params: any) {
    try {
      await Product.update(
        {
          deleted: true,
        },
        {
          where: {
            productId: params.id,
          },
        },
      );
      return { message: 'delete product successfully' };
    } catch (error) {
      return error;
    }
  }
}
