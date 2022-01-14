import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesService } from './roles.service';
import { Role } from './role.model';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [TypeOrmModule.forFeature([Role]), PassportModule],
  providers: [RolesService],
  exports: [TypeOrmModule],
})
export class RolesModule {}
