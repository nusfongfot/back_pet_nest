import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReviewController } from './review.controller';
import { Review } from 'models/review.model';
import { Product } from 'models/product.model';

@Module({
  imports: [SequelizeModule.forFeature([Review, Product])],
  controllers: [ReviewController],
  providers: [],
})
export class ReviewModule {}
