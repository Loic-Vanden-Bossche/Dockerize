import supertest, { Test, Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestHelpers } from '../helpers';
import { User } from '../../src/user/user.model';

let testHelpers: TestHelpers;
let testServer: INestApplication;

const numberOfUsers = 12;

describe('Authentication', () => {
  let randomUser: { profile: User; token: string };
  beforeAll(async () => {
    testHelpers = new TestHelpers();
    testServer = await testHelpers.startServer();
    await testHelpers.recreateData({ users: numberOfUsers, roles: 5 });
    randomUser = await testHelpers.getUser();
  });
  afterAll(async () => {
    await testHelpers.stopServer();
  });
  describe('POST login/', () => {
    test('should return 400 if email is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/login')
        .send({
          email: 'unknown@user.xzy',
        });
      await request.expect(400);
    });
    test('should return 400 if password is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/login')
        .send({
          password: 'secret',
        });
      await request.expect(400);
    });
    test('should return 401 if user does not exist', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/login')
        .send({
          email: 'unknown@user.io',
          password: 'topsecret!',
        });
      await request.expect(401);
    });
    test('should return 401 if user password is incorrect', async () => {
      const user = testHelpers.userFactory.getRandomUser();
      const request: Test = supertest(testServer.getHttpServer())
        .post('/login')
        .send({
          email: user.email,
          password: 'wrongpassword',
        });
      await request.expect(401);
    });
    test('should return user token if user credentials are valid', async () => {
      const user = testHelpers.userFactory.getRandomUser();
      const request: Test = supertest(testServer.getHttpServer())
        .post('/login')
        .send({
          email: user.email,
          password: testHelpers.userFactory.getUnhashedPassword(user.email),
        });
      const response: Response = await request.expect(200);
      expect(response.body.token).toBeTruthy();
    });
  });

  describe('GET profile/', () => {
    test('should return unauthorized if token is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer()).get(
        '/profile',
      );
      await request.expect(401);
    });
    test('should return unauthorized if token is invalid', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get('/profile')
        .set('Authorization', 'Bearer invalidtoken');
      await request.expect(401);
    });
    test('should return user profile if a valid token is provided', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${randomUser.token}`);
      const response: Response = await request.expect(200);
      expect(response.body.email).toBe(randomUser.profile.email);
      expect(response.body.email).toBe(randomUser.profile.email);
      expect(response.body.username).toBe(randomUser.profile.username);
    });
  });
});
