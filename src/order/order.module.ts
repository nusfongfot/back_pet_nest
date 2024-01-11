import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from 'models/order.model';
import { OrderController } from './order.controller';
import { Product } from 'models/product.model';
import { Address } from 'models/address.model';

@Module({
  imports: [SequelizeModule.forFeature([Order, Product, Address]), AuthModule],
  controllers: [OrderController],
  providers: [],
})
export class OrderModule {}
