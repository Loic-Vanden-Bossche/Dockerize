import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JWTStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { LoggerModule } from '../utils/logger';
import { PaginatorService } from '../common/paginator/paginator.service';

@Module({
  imports: [PassportModule, UserModule, LoggerModule],
  providers: [AuthService, JWTStrategy, UserService, PaginatorService],
  controllers: [AuthController],
})
export class AuthModule {}
