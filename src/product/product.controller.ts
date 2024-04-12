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
import { Review } from 'models/review.model';
import { Op, Sequelize } from 'sequelize';
import { Cart } from 'models/cart.model';
import { AppService } from 'src/app.service';
@Controller('api/product')
export class ProductController {
  constructor(private appService: AppService) {}

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
            model: Cart,
            attributes: ['qty'],
            where: {
              status: 'Already ordered',
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

  @Get('all/cate/:category')
  async getAllProductsByCategory(@Param() params: any) {
    try {
      const data = await Product.findAll({
        include: [
          {
            model: Review,
            attributes: ['name', 'star'],
            required: false,
          },
          {
            model: Cart,
            attributes: ['qty'],
            where: {
              status: 'Already ordered',
            },
            required: false,
          },
        ],
        where: {
          category: params.category,
          deleted: false,
        },
        order: [['createdAt', 'DESC']],
      });

      return { data };
    } catch (error) {
      return error;
    }
  }

  @Get('all/brand/:name')
  async getAllProductsByBrand(@Param() params: any) {
    try {
      const data = await Product.findAll({
        include: [
          {
            model: Review,
            attributes: ['name', 'star'],
            required: false,
          },
          {
            model: Cart,
            attributes: ['qty'],
            where: {
              status: 'Already ordered',
            },
            required: false,
          },
        ],
        where: {
          brand: params.name,
          deleted: false,
        },
        order: [['createdAt', 'DESC']],
      });

      return { data };
    } catch (error) {
      return error;
    }
  }

  @Get('all/brand')
  async getAllProductsOfBrand() {
    try {
      const products = await Product.findAll({
        attributes: ['brand'],
        where: {
          deleted: false,
        },
        order: [['createdAt', 'DESC']],
      });
      const data = [...new Set(products.map((product) => product.brand))];
      return { data };
    } catch (error) {
      return error;
    }
  }

  @Get('all/recommend')
  async getAllProductsByRecommend() {
    try {
      const product = await Product.findAll({
        include: [
          {
            model: Review,
            attributes: ['name', 'star'],
            required: false,
          },
          {
            model: Cart,
            attributes: ['qty'],
            where: {
              status: 'Already ordered',
            },
            required: false,
          },
        ],
        where: {
          deleted: false,
        },
        limit: 5,
      });
      const data = this.appService.shuffleArray(product);

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
      const data = await Product.findAll({
        include: [
          {
            model: Review,
            attributes: ['name', 'star'],
            required: false,
          },
          {
            model: Cart,
            attributes: ['qty'],
            where: {
              status: 'Already ordered',
            },
            order: [['qty', 'DESC']],
            required: true,
          },
        ],
        where: {
          deleted: false,
        },
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
      include: [
        {
          model: Review,
          attributes: ['name', 'star'],
          required: false,
        },
        {
          model: Cart,
          attributes: ['qty'],
          where: {
            status: 'Already ordered',
          },
          required: false,
        },
      ],

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
        deleted: false,
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
