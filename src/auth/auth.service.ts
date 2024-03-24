import { Injectable, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDto } from 'src/users/dto';
import { User } from 'models/user.model';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser(details: UserDto) {
    const options = { expiresIn: '30d' };
    const user = await User.findOne({ where: { email: details.email } });

    if (user) {
      const payload = {
        email: user?.email,
        level: user?.level,
      };
      const token = this.jwtService.sign(payload, options);
      return { data: user, token };
    } else {
      const newUser = await User.create(details as any);
      const payload = {
        email: user?.email,
        level: user?.level,
      };
      const token = this.jwtService.sign(payload, options);
      console.log('token', token);
      return { data: newUser, token };
    }
  }

  validateToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
  }

  async getnToken(payload: object) {
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async checkTokenEmailOfUser(@Req() req: any) {
    const { authorization } = req.headers;
    const token = authorization.split(' ')[1];
    const emailUser = await this.validateToken(token);
    const user = await User.findOne({
      where: {
        email: emailUser.email,
      },
    });

    return { data: user };
  }

  async hashedPassword(password: string) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(12, (err, salt) => {
        if (err) return reject(err);
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) return reject(err);
          resolve(hash);
        });
      });
    });
  }

  async comparePassword(password: string, hashed: string) {
    return bcrypt.compare(password, hashed);
  }
}
