import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PassportModule } from '@nestjs/passport';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.model';
import { RolesModule } from '../roles/role.module';
import { RolesService } from '../roles/roles.service';

import { LoggerModule } from '../utils/logger';
import { PaginatorModule } from '../common/paginator/paginator.module';
import { PaginatorService } from '../common/paginator/paginator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RolesModule,

    PassportModule,
    LoggerModule,
    PaginatorModule,
  ],
  providers: [RolesService, UserService, PaginatorService],
  controllers: [UserController],
  exports: [TypeOrmModule],
})
export class UserModule {}
