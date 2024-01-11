import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { Category } from 'models/category.model';

@Controller('api/category')
export class CategoryController {
  constructor() {}

  @Get('all')
  async getAllCategory() {
    try {
      const data = await Category.findAll({ attributes: ['title'] });
      return { data };
    } catch (error) {
      return error;
    }
  }

  @Post('insert')
  async createCategory(@Body('title') title: string) {
    try {
      if (!title) {
        throw new BadRequestException('title is required!');
      }

      const data = await Category.create({
        title: title,
      });
      return { data };
    } catch (error) {
      return error;
    }
  }
}
