import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatorService } from '../common/paginator/paginator.service';
import { IPageOptions } from '../common/paginator/dto/page-options.interface';
import { Page } from '../common/paginator/dto/page.dto';
import { Book } from './book.model';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly paginatorService: PaginatorService,
  ) {}

  async findAll(options?: IPageOptions<Book>): Promise<Page<Book>> {
    return this.paginatorService.findPage(
      Book.PRIMARY_KEY,
      options,
      this.bookRepository,
    );
  }

  async findByIsbn(isbn: string): Promise<Book> {
    return this.bookRepository.findOne(isbn);
  }

  async isbnExists(isbn: string): Promise<boolean> {
    const found = await this.findByIsbn(isbn);
    return found != null;
  }

  async save(book: Book): Promise<Book> {
    return this.bookRepository.save(book);
  }

  async delete(book: Book): Promise<Book> {
    return this.bookRepository.remove(book);
  }
}