import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AdminDto } from './dto/admin';
import { AuthService } from 'src/auth/auth.service';
import { Admin } from 'models/admin.model';
import { AuthAdminDto } from './dto/auth';

@Controller('api/admin/auth')
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() auth: AuthAdminDto) {
    try {
      const admin = await Admin.findOne({
        where: {
          email: auth.email,
        },
      });
      if (!admin) {
        throw new BadRequestException('email or password is invalid');
      }
      const comparePassword = await this.authService.comparePassword(
        auth.password,
        admin.password,
      );
      if (!comparePassword) {
        throw new BadRequestException('email or password is invalid');
      }

      const data = await Admin.findOne({
        where: {
          email: auth.email,
        },
        attributes: { exclude: ['password'] },
      });
      const payload = {
        email: data.email,
        level: data.level,
      };
      const { access_token } = await this.authService.getnToken(payload);

      return { data, token: access_token };
    } catch (error) {
      return { message: error.message };
    }
  }

  @Post('register')
  async createUser(@Body() createAdminDto: AdminDto) {
    try {
      if (createAdminDto.password !== createAdminDto.confirm_password) {
        throw new BadRequestException('password not match');
      }

      const hashed = await this.authService.hashedPassword(
        createAdminDto.password,
      );

      const data = await Admin.create({
        name: createAdminDto.name,
        password: hashed,
        email: createAdminDto.email,
        phone: createAdminDto.phone,
      });
      return { message: 'register successfully', data };
    } catch (error) {
      const arr = error?.errors?.map((item: any) => item.message);
      throw new HttpException({ message: arr }, HttpStatus.BAD_REQUEST);
    }
  }
}
