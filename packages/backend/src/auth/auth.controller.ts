import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  InternalServerErrorException,
  Req,
  UnauthorizedException,
  HttpCode,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { compareSync } from 'bcrypt';
import { UserService } from '../user/user.service';
import { AuthDTO, authSchema } from './auth.dto';
import { AuthService } from './auth.service';
import { JoiValidationPipe } from '../utils/validation.pipe';
import { IAuthenticatedRequest } from './authenticated-request';
import { Logger } from '../utils/logger';
import { User } from '../user/user.model';

@Controller()
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext('auth');
  }

  @Post('login')
  @HttpCode(200)
  @UsePipes(new JoiValidationPipe(authSchema, 400))
  async login(
    @Body() authDTO: AuthDTO,
  ): Promise<{ user: User; token: string }> {
    this.logger.log('POST login/', 'access');
    const user = await this.userService
      .findByEmail(authDTO.email)
      .catch((e) => {
        this.logger.error(e);
        throw new InternalServerErrorException();
      });
    if (!user) {
      this.logger.log('Account does not exist', authDTO.email);
      throw new UnauthorizedException('Account does not exists');
    }
    if (!compareSync(authDTO.password, user.password)) {
      this.logger.log('Invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email };
    const token = this.authService.generateJWT(payload);
    return { user, token };
  }

  @Get('profile')
  @UseGuards(AuthGuard('bearer'))
  async getProfile(@Req() request: IAuthenticatedRequest): Promise<User> {
    this.logger.log('GET profile/', 'access');
    try {
      return await this.userService.findByEmail(request.user.email);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException();
    }
  }
}
