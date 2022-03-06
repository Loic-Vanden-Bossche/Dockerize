import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Logger } from '../utils/logger';
import { IPageOptions } from '../common/paginator/dto/page-options.interface';
import { Page } from '../common/paginator/dto/page.dto';
import { BooksService } from './books.service';
import { Book } from './book.model';
import {
  CreateBookDTO,
  createBookSchema,
  UpdateBookDTO,
  updateBookSchema,
} from './book.dto';
import { JoiValidationPipe } from '../utils/validation.pipe';

@Controller('books')
export class BooksController {
  constructor(
    private readonly logger: Logger,
    private readonly bookService: BooksService,
  ) {
    this.logger.setContext('books');
  }

  @Post()
  async create(
    @Body(new JoiValidationPipe(createBookSchema)) book: CreateBookDTO,
  ): Promise<Book> {
    this.logger.log('POST books/', 'access');
    const newBook = Object.assign(new Book(), book);
    const doesBookAlreadyExists = await this.bookService.isbnExists(book.isbn);

    newBook.overview = await this.bookService.getOverviewFromIsbn(book.isbn);

    if (doesBookAlreadyExists) {
      throw new BadRequestException('Isbn already taken');
    }
    return this.bookService.save(newBook).catch((err) => {
      this.logger.error(err);
      throw new InternalServerErrorException();
    });
  }

  @Get()
  findAll(@Query() page: IPageOptions<Book>): Promise<Page<Book>> {
    this.logger.log('GET books/', 'access');
    return this.bookService.findAll(page);
  }

  @Get('search/:query')
  search(@Param('query') query: string) {
    this.logger.log('GET books/' + query, 'access');
    return this.bookService.search(query);
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
    @Body(new JoiValidationPipe(updateBookSchema)) updateBookDTO: UpdateBookDTO,
  ): Promise<Book> {
    this.logger.log('PUT books/' + id, 'access');
    const book = await this.bookService.findByIsbn(id);

    if (!book) {
      throw new NotFoundException();
    }
    book.read_count = updateBookDTO.read_count;

    try {
      return this.bookService.save(book);
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
