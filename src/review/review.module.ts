import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ReviewController } from './review.controller';
import { Review } from 'models/review.model';
import { Product } from 'models/product.model';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([Review, Product]), AuthModule],
  controllers: [ReviewController],
  providers: [],
})
export class ReviewModule {}
