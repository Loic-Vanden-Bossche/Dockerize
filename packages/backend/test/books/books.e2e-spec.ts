import supertest, { Test, Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestHelpers } from '../helpers';
import { Book } from '../../src/books/book.model';

let testServer: INestApplication;
let testHelpers: TestHelpers;


describe('Books', () => {
  let randomBook: { profile: Book; token: string };
  beforeAll(async () => {
    testHelpers = new TestHelpers();
    testServer = await testHelpers.startServer();
  });
  afterAll(async () => {
    await testHelpers.stopServer();
  });

  describe('GET books/', () => {
    test('should return empty', async () => {
      const request: Test = supertest(testServer.getHttpServer()).get('/books');
      await request.expect(200);
    });
  });

  describe('POST books/', () => {
    test('should create a book', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: '9781896095448',
          title: 'The witcher',
          author: 'Joan Weir',
          picture: 'https://covers.openlibrary.org/b/isbn/9781896095448-L.jpg',
        });
      await request.expect(201);
    });
  });

  describe('GET books/', () => {
    test('should return 1 book', async () => {
      const request: Test = supertest(testServer.getHttpServer()).get('/books');
      await request.expect(200);
    });
  });

  describe('GET books/', () => {
    test('should return 1 book with specified isbn', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get('/books')
        .send({
          isbn: '9781896095448',
        });
      await request.expect(200);
    });
  });

  describe('PUT books/', () => {
    test('should return 1 book', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put('/books/9781896095448')
        .send({
          isbn: '9781896095448',
          title: 'The winter is coming',
        });
      await request.expect(200);
    });
  });

  describe('DELETE books/', () => {
    test('should delete 1 book with specified isbn', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .delete('/books/9781896095448');
      await request.expect(200);
    });
  });

  describe('GET books/', () => {
    test('should return 0 book', async () => {
      const request: Test = supertest(testServer.getHttpServer()).get('/books');
      await request.expect(200);
    });
  });
});
