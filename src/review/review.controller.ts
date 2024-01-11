import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { ReviewDto } from './dto/review.dto';
import { Review } from 'models/review.model';

@Controller('api/review')
export class ReviewController {
  constructor() {}

  @Get('all')
  async getReviewOfProduct() {
    return 'getReviewAll';
  }
  @Post('insert')
  async createReview(@Body() reviewDto: ReviewDto) {
    try {
      const review = await Review.findOne({
        where: {
          name: reviewDto.name,
          productId: reviewDto.productId,
        },
      });
      if (review) {
        throw new BadRequestException('this product is reviewed');
      }
      const data = await Review.create({
        productId: reviewDto.productId,
        name: reviewDto.name,
        star: reviewDto.star,
        detail: reviewDto.detail,
        isReview: reviewDto.isReview,
      });
      return { data, message: 'review successfully' };
    } catch (error) {
      return error;
    }
  }
}
