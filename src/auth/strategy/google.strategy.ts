import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.CLIENT_GOOGLE_ID,
      clientSecret: process.env.CLIENT_GOOGLE_SECRET,
      callbackURL: process.env.CLIENT_GOOGLE_REDIRECT_URL,
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    const picture = profile.photos[0].value;
    // console.log('token', accessToken);
    // console.log(refreshToken);
    // console.log(profile);
    const user = await this.authService.validateUser({
      email,
      name,
      picture,
    });

    return { data: user } || null;
  }
}
