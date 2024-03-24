import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthenGuard } from 'src/auth/guards/auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { Address } from 'models/address.model';
import { User } from 'models/user.model';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthenGuard)
  @Get('my-profile')
  async getProfile(@Req() req: any) {
    try {
      const user = await this.authService.checkTokenEmailOfUser(req);
      return { data: user };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AdminGuard)
  @Get('all')
  async getAllUsers() {
    try {
      const data = await User.findAll({
        include: [
          {
            model: Address,
            attributes: ['province'],
            where: {
              isDefault: true,
            },
          },
        ],
        attributes: { exclude: ['password'] },
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }

  // @Post('insert')
  // async createUser(@Body() createUserDto: UserDto) {
  //   const hashed = await this.authService.hashedPassword(
  //     createUserDto.password,
  //   );
  //   try {
  //     const data = await User.create({
  //       name: createUserDto.name,
  //       user: createUserDto.user,
  //       password: hashed,
  //       level: createUserDto.level,
  //       email: createUserDto.email,
  //       phone: createUserDto.phone,
  //     });
  //     return { message: 'create user successfully', data };
  //   } catch (error) {
  //     const arr = error?.errors?.map((item: any) => item.message);
  //     throw new HttpException({ message: arr }, HttpStatus.BAD_REQUEST);
  //   }
  // }
}
