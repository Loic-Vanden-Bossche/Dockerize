import {
  BadRequestException,
  Body,
  Controller, Delete, Get,
  InternalServerErrorException, NotFoundException, Param,
  Post, Put, Query,
} from '@nestjs/common';
import { Logger } from '../utils/logger';
import { IPageOptions } from '../common/paginator/dto/page-options.interface';
import { Page } from '../common/paginator/dto/page.dto';
import { BooksService } from './books.service';
import { Book } from './book.model';

@Controller('books')
export class BooksController {
  constructor(
    private readonly logger: Logger,
    private readonly bookService: BooksService,
  ) {
    this.logger.setContext('books');
  }

  @Post()
  async create(@Body() book: Book): Promise<Book> {
    this.logger.log('POST books/', 'access');

    const doesBookAlreadyExists = await this.bookService.isbnExists(
      book.isbn,
    );
    if (doesBookAlreadyExists) {
      throw new BadRequestException('Isbn already taken');
    }
    const savedBook = this.bookService.save(book).catch((err) => {
      this.logger.error(err);
      throw new InternalServerErrorException();
    });
    return savedBook;
  }

  @Get()
  findAll(@Query() page: IPageOptions<Book>): Promise<Page<Book>> {
    this.logger.log('GET books/', 'access');
    return this.bookService.findAll(page);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Book> {
    this.logger.log('GET books/' + id, 'access');

    const book = await this.bookService.findByIsbn(id);

    if (!book) {
      throw new NotFoundException('Book does not exist');
    }
    return book;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() partialBook: Partial<Book>,
  ): Promise<Book> {
    this.logger.log('PUT books/' + id, 'access');
    const book = await this.bookService.findByIsbn(id);

    if (!book) {
      throw new NotFoundException();
    }
    book.title = partialBook.title;
    book.author = partialBook.author;
    book.overview = partialBook.overview;
    book.picture = partialBook.picture;
    book.read_count = partialBook.read_count;

    try {
      const savedBook = this.bookService.save(book);
      return savedBook;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Partial<Book>> {
    this.logger.log('DELETE books/' + id, 'access');


    const book = await this.bookService.findByIsbn(id);

    if (!book) {
      throw new NotFoundException();
    }
    try {
      const deletedBook = { ...book };
      await this.bookService.delete(book);
      return deletedBook;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
