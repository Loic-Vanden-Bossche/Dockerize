import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from './user/user.module';

import { RolesModule } from './roles/role.module';

import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ["dist/**/*.model{.ts,.js}"],
      synchronize: true,
    }),
    RolesModule,

    UserModule,
    AuthModule,
    PassportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
