import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from 'models/product.model';
import { CartController } from './cart.controller';
import { Cart } from 'models/cart.model';

@Module({
  imports: [SequelizeModule.forFeature([Cart, Product]), AuthModule],
  controllers: [CartController],
  providers: [],
})
export class CartModule {}
