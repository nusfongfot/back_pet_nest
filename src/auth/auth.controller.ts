import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { User } from '../../models/user.model';
import { AuthDto } from './dto';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google.guard';
import { AuthenGuard } from './guards/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.CLIENT_GOOGLE_ID,
  process.env.CLIENT_GOOGLE_SECRET,
);

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('google/login')
  async handleGoogleLogin(@Body('token') token) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_GOOGLE_ID,
      });
      // console.log('ticker', ticket.getPayload());
      const options = { expiresIn: '30d' };
      const user = await User.findOne({
        where: { email: ticket.getPayload().email },
      });

      if (user) {
        const payload = {
          email: user?.email,
          level: user?.level,
        };
        const token = this.jwtService.sign(payload, options);

        return { data: user, token };
      } else {
        const newUser = await User.create({
          email: ticket.getPayload().email,
          name: ticket.getPayload().name,
          picture: ticket.getPayload().picture,
        });
        const payload = {
          email: user?.email,
          level: user?.level,
        };
        const token = this.jwtService.sign(payload, options);
        return { data: newUser, token };
      }
    } catch (error) {
      return error;
    }
  }

  // @UseGuards(GoogleAuthGuard)
  @Post('login')
  async login(@Body() authDto: AuthDto) {
    try {
      const data = await User.findOne({
        where: {
          email: authDto.email,
        },
        attributes: { exclude: ['password'] },
      });
      if (data) {
        const payload = {
          email: data.email,
          level: data.level,
        };
        const token = await this.authService.getnToken(payload);
        return { token, data };
      } else {
        throw new UnauthorizedException('email or password is invalid');
      }
    } catch (error) {
      return { message: error.message };
    }
  }

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async handleGoogleRedirect() {}

  @Get('status')
  @UseGuards(AuthenGuard)
  user() {
    return { msg: 'Authenticated' };
  }
}
