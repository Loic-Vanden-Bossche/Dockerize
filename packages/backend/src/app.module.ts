import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from './user/user.module';

import { RolesModule } from './roles/role.module';

import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: ["dist/**/*.model{.ts,.js}"],
        synchronize: true,
      })
    }),
    RolesModule,
    ConfigModule.forRoot({
      envFilePath: '../../.env'
    }),
    UserModule,
    AuthModule,
    PassportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
