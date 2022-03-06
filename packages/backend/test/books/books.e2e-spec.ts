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
    test('should return an error because no isbn', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          title: 'The witcher',
          author: 'Joan Weir',
          picture: 'https://covers.openlibrary.org/b/isbn/9781896095448-L.jpg',
        });
      await request.expect(422);
    });
    test('should return an error because isbn is not a string', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: 978189609544,
          title: 'The witcher',
          author: 'Joan Weir',
          picture: 'https://covers.openlibrary.org/b/isbn/9781896095448-L.jpg',
        });
      await request.expect(422);
    });
    test('should return an error because isbn < 13', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: '978189609544',
          title: 'The witcher',
          author: 'Joan Weir',
          picture: 'https://covers.openlibrary.org/b/isbn/9781896095448-L.jpg',
        });
      await request.expect(422);
    });
    test('should return an error because isbn > 13', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: '97818960954489',
          title: 'The witcher',
          author: 'Joan Weir',
          picture: 'https://covers.openlibrary.org/b/isbn/9781896095448-L.jpg',
        });
      await request.expect(422);
    });
    test('should return an error because isbn can not be null', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: null,
          title: 'The witcher',
          author: 'Joan Weir',
          picture: 'https://covers.openlibrary.org/b/isbn/9781896095448-L.jpg',
        });
      await request.expect(422);
    });
    test('should return an error because no title', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: '9781896095448',
          author: 'Joan Weir',
          picture: 'https://covers.openlibrary.org/b/isbn/9781896095448-L.jpg',
        });
      await request.expect(422);
    });
    test('should return an error because title is not a string', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: '978189609544',
          title: 2,
          author: 'Joan Weir',
          picture: 'https://covers.openlibrary.org/b/isbn/9781896095448-L.jpg',
        });
      await request.expect(422);
    });
    test('should return an error because title can not be null', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: '978189609544',
          title: null,
          author: 'Joan Weir',
          picture: 'https://covers.openlibrary.org/b/isbn/9781896095448-L.jpg',
        });
      await request.expect(422);
    });
    test('should return an error because no author', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: '9781896095448',
          title: 'The witcher',
          picture: 'https://covers.openlibrary.org/b/isbn/9781896095448-L.jpg',
        });
      await request.expect(422);
    });
    test('should return an error because author is not a string', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: '978189609544',
          title: 'The witcher',
          author: 3,
          picture: 'https://covers.openlibrary.org/b/isbn/9781896095448-L.jpg',
        });
      await request.expect(422);
    });
    test('should return an error because no picture', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: '9781896095448',
          title: 'The witcher',
          author: 'Joan Weir',
        });
      await request.expect(422);
    });
    test('should return an error because picture is not a string', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: '978189609544',
          title: 'The witcher',
          author: 'Joan Weir',
          picture: 5,
        });
      await request.expect(422);
    });
    test('should create a book success to create a book', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: '9781896095448',
          title: 'The witcher',
          author: null,
          picture: null,
        });
      await request.expect(201);
    });
    test('should return already created', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/books')
        .send({
          isbn: '9781896095448',
          title: 'The witcher',
          author: 'Joan Weir',
          picture: 'https://covers.openlibrary.org/b/isbn/9781896095448-L.jpg',
        });
      await request.expect(400);
    });
  });

  describe('GET books/', () => {
    test('should return 1 book', async () => {
      const request: Test = supertest(testServer.getHttpServer()).get('/books');
      await request.expect(200);
    });
  });

  describe('GET books/:isbn', () => {
    test('should return 1 book with specified isbn', async () => {
      const request: Test = supertest(testServer.getHttpServer()).get(
        '/books/9781896095448',
      );
      await request.expect(200);
    });
    test('should return book not found', async () => {
      const request: Test = supertest(testServer.getHttpServer()).get(
        '/books/9781896095447',
      );
      await request.expect(404);
    });
  });

  describe('PUT books/:isbn', () => {
    test('Should not update book bcs no read_count', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put('/books/9781896095448')
        .send({
          isbn: '9781896095448',
          title: 'The winter is coming',
        });
      await request.expect(422);
    });
    test('Should return an error because no read_count', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put('/books/9781896095448')
        .send({
          title: 'test',
        });
      await request.expect(422);
    });
    test('Should return an error because of an extra-field', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put('/books/9781896095448')
        .send({
          title: 'test',
          read_count: '1',
        });
      await request.expect(422);
    });
    test('Should return an error because read_count is not a number', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put('/books/9781896095448')
        .send({
          read_count: 'number',
        });
      await request.expect(422);
    });
    test('Should return an error because read_count < 1>', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put('/books/9781896095448')
        .send({
          read_count: 0,
        });
      await request.expect(422);
    });
    test('Should return not found', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put('/books/9781896095447')
        .send({
          read_count: 5,
        });
      await request.expect(404);
    });
  });

  describe('DELETE books/:isbn', () => {
    test('should delete 1 book with specified isbn', async () => {
      const request: Test = supertest(testServer.getHttpServer()).delete(
        '/books/9781896095448',
      );
      await request.expect(200);
    });
    test('should return not found', async () => {
      const request: Test = supertest(testServer.getHttpServer()).delete(
        '/books/9781896095448',
      );
      await request.expect(404);
    });
  });

  describe('GET books/', () => {
    test('should return 0 book', async () => {
      const request: Test = supertest(testServer.getHttpServer()).get('/books');
      await request.expect(200);
    });
  });
});
