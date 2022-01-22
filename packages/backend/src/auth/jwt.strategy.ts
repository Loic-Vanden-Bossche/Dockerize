import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../user/user.model';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(token: string): Promise<User> {
    const user = await this.authService.validateUser(token);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
