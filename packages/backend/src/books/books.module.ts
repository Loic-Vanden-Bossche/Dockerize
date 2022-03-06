import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../utils/logger';
import { PaginatorModule } from '../common/paginator/paginator.module';
import { PaginatorService } from '../common/paginator/paginator.service';
import { Book } from './book.model';
import {HttpModule} from "@nestjs/axios";

@Module({
  providers: [BooksService],
  controllers: [BooksController]
})

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
    LoggerModule,
    PaginatorModule,
    HttpModule
  ],
  providers: [BooksService, PaginatorService],
  controllers: [BooksController],
  exports: [TypeOrmModule],
})
export class BooksModule {}
