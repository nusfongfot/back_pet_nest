import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductController } from './product.controller';
import { Product } from 'models/product.model';
import { Review } from 'models/review.model';
import { AppService } from 'src/app.service';

@Module({
  imports: [SequelizeModule.forFeature([Product, Review]), AuthModule],
  controllers: [ProductController],
  providers: [AppService],
})
export class ProductModule {}
