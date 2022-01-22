import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { sign, verify } from 'jsonwebtoken';
import { User } from '../user/user.model';
import { Logger } from '../utils/logger';

interface IToken {
  user: ITokenPayload;
  iat: number;
  exp: number;
  iss: string;
}

interface ITokenPayload {
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: Logger,
    private readonly usersService: UserService,
  ) {
    // this.logger.setContext('auth');
  }

  async validateUser(token: string): Promise<User> {
    let payload: IToken;
    if (!token) {
      return null;
    }
    try {
      payload = this.decipherToken(token);
    } catch (err) {
      this.logger.error(err.message, err.trace);
      return null;
    }
    const user = await this.usersService.findByEmail(payload.user.email);
    if (user && user.email === payload.user.email) {
      return user;
    }
    return null;
  }

  generateJWT = (payload: ITokenPayload): string => {
    const privateKey = process.env.JWT_PRIVATE_KEY;
    const token = sign({ user: payload }, privateKey, {
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_TTL,
      algorithm: 'RS256',
    });
    return token;
  };

  private decipherToken = (token: string): IToken => {
    const publicKey = process.env.JWT_PUBLIC_KEY;
    const payload: unknown = verify(token, publicKey, {
      issuer: process.env.JWT_ISSUER,
      algorithms: ['RS256'],
    });
    return payload as IToken;
  };
}
