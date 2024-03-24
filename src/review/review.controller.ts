import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { ReviewDto } from './dto/review.dto';
import { Review } from 'models/review.model';
import { AuthService } from 'src/auth/auth.service';

@Controller('api/review')
export class ReviewController {
  constructor(private readonly authService: AuthService) {}

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

  @Get('user')
  async getReviewedOfUser(@Req() req: any) {
    try {
      const user = await this.authService.checkTokenEmailOfUser(req);
      const review = await Review.findAll({
        where: {
          name: user.data.name,
        },
      });
      return { review };
    } catch (error) {
      return error;
    }
  }
}
