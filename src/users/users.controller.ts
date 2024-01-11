import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '../../models/user.model';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthenGuard } from 'src/auth/guards/auth.guard';

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
      const { authorization } = req.headers;
      const token = authorization.split(' ')[1];
      const emailUser = await this.authService.validateToken(token);
      const user = await User.findOne({
        where: {
          email: emailUser.email,
        },
      });

      return { data: user };
    } catch (error) {
      return error;
    }
  }

  @Get('all')
  async getAllUsers() {
    const data = await User.findAll({
      attributes: { exclude: ['password'] },
    });
    return { data };
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
