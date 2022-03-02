import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatorService } from '../common/paginator/paginator.service';
import { IPageOptions } from '../common/paginator/dto/page-options.interface';
import { Page } from '../common/paginator/dto/page.dto';
import { Book } from './book.model';
import { firstValueFrom } from "rxjs";

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly paginatorService: PaginatorService,
    private readonly http: HttpService
  ) {}

  async findAll(options?: IPageOptions<Book>): Promise<Page<Book>> {
    return this.paginatorService.findPage(
      Book.PRIMARY_KEY,
      options,
      this.bookRepository,
    );
  }

  async search(query) {

    const checkArray = (arr) => Array.isArray(arr) && arr?.length;

    return firstValueFrom(this.http.get(`http://openlibrary.org/search.json?title=${query}`)).then(res => {
      return res.data.docs.filter(book => checkArray(book.isbn) && checkArray(book.author_name)).map(book => ({
        isbn: book.isbn.filter(isbn => isbn.length === 13)[0],
        title: book.title,
        author: book.author_name[0]
      })).map(book => ({...book, picture: `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`}))
    })
  }

  async getOverviewFromIsbn(isbn: string) {
    return firstValueFrom(this.http.get(`https://openlibrary.org/isbn/${isbn}.json`))
      .then(book => book.data.works[0].key.split('/')[2])
      .then(key => firstValueFrom(this.http.get(`https://openlibrary.org/works/${key}.json`)))
      .then(data => data.data.description?.value.slice(0, 1500))
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
