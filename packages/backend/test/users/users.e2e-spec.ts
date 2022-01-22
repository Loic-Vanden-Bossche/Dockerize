import supertest, { Test, Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestHelpers } from '../helpers';
import { Repository } from 'typeorm';
import { User } from '../../src/user/user.model';
import { Role } from '../../src/roles/role.model';

let testServer: INestApplication;
let testHelpers: TestHelpers;

const numberOfUsers = 12;

let randomUser: { profile: User; token: string };
let randomAdmin: { profile: User; token: string };

const ONE_MINUTE = 60 * 1000;
jest.setTimeout(ONE_MINUTE);

describe('Users entity', () => {
  let testData: { users: User[]; roles: Role[] };
  beforeAll(async () => {
    testHelpers = new TestHelpers();
    testServer = await testHelpers.startServer();
    testData = await testHelpers.recreateData({
      users: numberOfUsers,
      roles: 5,
    });
  });
  afterAll(async () => {
    await testHelpers.stopServer();
  });
  beforeEach(async () => {
    randomUser = await testHelpers.getUser();
    randomAdmin = await testHelpers.getAdmin();
  });

  describe('GET users/', () => {
    test('should return unauthorized if token is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer()).get('/users');
      await request.expect(401);
    });
    test('should return unauthorized if token is invalid', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get('/users')
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        );
      await request.expect(401);
    });
    test('should return forbidden if a simple user make the request', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${randomUser.token}`);
      await request.expect(403);
    });
    test('should return all users if an admin make the request without pagination parameters', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(numberOfUsers);
      expect(response.body.metadata.nextKey).toBe(null);
      expect(response.body.metadata.limit).toBe(null);
      expect(response.body.metadata.sortedBy).toEqual({});
      expect(response.body.metadata.filteredBy).toEqual({
        fields: null,
        query: null,
      });
    });
    test('should fetch only the selected fields', async () => {
      const sorted = testData.users.sort((u1, u2) =>
        u1.email.localeCompare(u2.email),
      );
      const request: Test = supertest(testServer.getHttpServer())
        .get('/users?fields[]=username&fields[]=email')
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(response.body.data.length).toBe(sorted.length);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toEqual(
        sorted.map((u) =>
          Object({
            username: u.username,
            email: u.email,
          }),
        ),
      );
    });
    test('should fetch first page of given size (no sort options => sorted by email (primary key))', async () => {
      const sorted = testData.users.sort((u1, u2) =>
        u1.email.localeCompare(u2.email),
      );
      const request: Test = supertest(testServer.getHttpServer())
        .get('/users?perPage=10')
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.map((u: User) => u.email)).toEqual(
        sorted.slice(0, 10).map((u) => u.email),
      );
      expect(response.body.data.length).toBe(10);
      expect(response.body.metadata.nextKey).toEqual({
        email: sorted[9].email,
      });
      expect(response.body.metadata.limit).toBe(10);
    });
    test('should fetch first page of given size (sorted by date given in options)', async () => {
      const sorted = testData.users.sort(
        (u1, u2) => u2.createdAt.getTime() - u1.createdAt.getTime(),
      );
      const request: Test = supertest(testServer.getHttpServer())
        .get(
          `/users?perPage=5&sortBy[][key]=createdAt&sortBy[][sortDirection]=DESC`,
        )
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(5);
      expect(response.body.data.map((u: User) => u.email)).toEqual(
        sorted.slice(0, 5).map((u) => u.email),
      );
      expect(response.body.metadata.nextKey).toEqual({
        createdAt: sorted[4].createdAt.toISOString(),
        email: sorted[4].email,
      });
      expect(response.body.metadata.limit).toBe(5);
      expect(response.body.metadata.sortedBy).toEqual({
        createdAt: 'DESC',
        email: 'ASC',
      });
    });
    test('should fetch first result (sorted by date given in options)', async () => {
      const sorted = testData.users.sort(
        (u1, u2) => u2.createdAt.getTime() - u1.createdAt.getTime(),
      );
      const request: Test = supertest(testServer.getHttpServer())
        .get(`/users?perPage=1&sortBy=createdAt&sortDirection=DESC`)
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data.map((u: User) => u.email)).toEqual(
        sorted.slice(0, 1).map((u) => u.email),
      );
      expect(response.body.metadata.nextKey).toEqual({
        email: sorted[0].email,
        createdAt: sorted[0].createdAt.toISOString(),
      });
      expect(response.body.metadata.limit).toBe(1);
      expect(response.body.metadata.sortedBy).toEqual({
        createdAt: 'DESC',
        email: 'ASC',
      });
    });
    test('should fetch a page from a given key (ordered by default by primaryKey (email))', async () => {
      const sorted = testData.users.sort((u1, u2) =>
        u1.email.localeCompare(u2.email),
      );
      const expectedResult = sorted.slice(3, 8).map((u) => u.email);
      const request: Test = supertest(testServer.getHttpServer())
        .get(`/users?perPage=5&from[email]=${sorted[2].email}`)
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(5);
      expect(response.body.data.map((u: User) => u.email)).toEqual(
        expectedResult,
      );
      expect(response.body.metadata.limit).toBe(5);
    });
    test('should fetch a page from a given key (ordered by descendent email)', async () => {
      const sorted = testData.users.sort(
        (u1, u2) => -1 * u1.email.localeCompare(u2.email),
      );
      const expectedResult = sorted
        .slice(3, 8)
        .filter((u) => u.email.localeCompare(sorted[2].email))
        .map((u) => u.email);
      const request: Test = supertest(testServer.getHttpServer())
        .get(
          `/users?perPage=5&from[email]=${sorted[2].email}&sortBy[0][key]=email&sortBy[0][sortDirection]=DESC`,
        )
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(5);
      expect(response.body.data.map((u: User) => u.email)).toEqual(
        expectedResult,
      );
      expect(response.body.metadata.limit).toBe(5);
    });
    test('should fetch a page from a given key (ordered by default by email)', async () => {
      const sorted = testData.users.sort((u1, u2) =>
        u1.email.localeCompare(u2.email),
      );
      const expectedResult = sorted.slice(3, 8).map((u) => u.email);
      const request: Test = supertest(testServer.getHttpServer())
        .get(
          `/users?perPage=5&from[email]=${sorted[2].email}&sortDirection=DESC`,
        )
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(5);
      expect(response.body.data.map((u: User) => u.email)).toEqual(
        expectedResult,
      );
      expect(response.body.metadata.limit).toBe(5);
    });
    test('should fetch first page of given size (sorted by date and email given in options)', async () => {
      const sorted = testData.users.sort(
        (u1, u2) =>
          u2.createdAt.getTime() -
          u1.createdAt.getTime() * u1.email.localeCompare(u2.email),
      );
      const request: Test = supertest(testServer.getHttpServer())
        .get(
          `/users?perPage=5&sortBy[0][key]=createdAt&sortBy[0][sortDirection]=DESC&sortBy[1][key]=email&sortBy[1][sortDirection]=DESC`,
        )
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(5);
      expect(response.body.data.map((u: User) => u.email)).toEqual(
        sorted.slice(0, 5).map((u) => u.email),
      );
      expect(response.body.metadata.nextKey).toEqual({
        email: sorted[4].email,
        createdAt: sorted[4].createdAt.toISOString(),
      });
      expect(response.body.metadata.limit).toBe(5);
      expect(response.body.metadata.sortedBy).toEqual({
        createdAt: 'DESC',
        email: 'DESC',
      });
    });
    test('should return a bad request exception (wrong key given in options)', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get(`/users?perPage=5&sortBy=wrongKey`)
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(400);
      expect(
        response.body.message.includes('column entity.wrongkey does not exist'),
      );
    });
    test('should return a bad request exception (wrong var type given in sortDirection)', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get(`/users?sortBy=createdAt&sortDirection=Wrong`)
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      await request.expect(400);
    });
    test('should return a bad request exception (wrong var type given in perPage)', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get(`/users?perPage=er`)
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      await request.expect(400);
    });
    test('should return one user (filter by email)', async () => {
      const sorted = testData.users.sort((u1, u2) =>
        u1.email.localeCompare(u2.email),
      );
      const user = sorted[1];
      const request: Test = supertest(testServer.getHttpServer())
        .get(`/users?filterBy[]=email&filterQuery=${user.email}`)
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.map((u: User) => u.email)).toEqual([
        user.email,
      ]);
      expect(response.body.metadata.filteredBy).toEqual({
        fields: [`email`],
        query: `${user.email}`,
      });
      expect(response.body.data.length).toBe(1);
    });
    test('should return one user (only filterQuery given in options)', async () => {
      const sorted = testData.users.sort((u1, u2) =>
        u1.email.localeCompare(u2.email),
      );
      const user = sorted[1];
      const request: Test = supertest(testServer.getHttpServer())
        .get(`/users?filterQuery=${user.email}`)
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data.map((u: User) => u.email)).toEqual([
        user.email,
      ]);
      expect(response.body.metadata.filteredBy).toEqual({
        fields: [`email`],
        query: `${user.email}`,
      });
    });
    test('should return users with a username and email containing the letter e and ordered by username', async () => {
      const sorted = testData.users.sort((u1, u2) =>
        u1.username.localeCompare(u2.username),
      );
      const expectedResult = sorted
        .filter((u) => u.email.includes('e') || u.username.includes('e'))
        .map((u) => u.email);
      const request: Test = supertest(testServer.getHttpServer())
        .get(
          `/users?sortBy=username&sortDirection=ASC&filterBy[]=username&filterBy[]=email&filterQuery=e`,
        )
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(expectedResult.length);
      expect(response.body.data.map((u: User) => u.email)).toEqual(
        expectedResult,
      );
      expect(response.body.metadata.filteredBy).toEqual({
        fields: ['username', 'email'],
        query: 'e',
      });
    });
    test('should return users from a given set of keys oredered by ascendent createdAt (and by default by asc email)', async () => {
      const sorted = testData.users
        .sort((u1, u2) => u2.createdAt.getTime() - u1.createdAt.getTime())
        .sort((u1, u2) => {
          const d1 = u1.createdAt.getTime();
          const d2 = u2.createdAt.getTime();
          if (u1.email.localeCompare(u2.email)) {
            return d1 < d2 ? -1 : 1;
          }

          return d1 - d2;
        });
      const cursorUser = sorted[0];

      const expectedResult = sorted.filter((u) => {
        if (cursorUser.createdAt.getTime() - u.createdAt.getTime() > 0) {
          return false;
        }
        if (
          u.email.localeCompare(cursorUser.email) < 0 ||
          u.email.localeCompare(cursorUser.email) === 0
        ) {
          return false;
        }
        return true;
      });
      const request: Test = supertest(testServer.getHttpServer())
        .get(
          `/users?from[createdAt]=${cursorUser.createdAt.toISOString()}&from[email]=${
            cursorUser.email
          }&sortBy=createdAt&sortDirection=ASC`,
        )
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(expectedResult.length);
      expect(response.body.data.map((u: User) => u.email)).toEqual(
        expectedResult.map((u) => u.email),
      );
    });
  });
  describe('GET users/:id', () => {
    test('should return an error if the id given is not a valid ID', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get('/users/12de')
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      await request.expect(400);
    });
    test('should return unauthorized if token is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer()).get(
        `/users/${randomUser.profile.email}`,
      );
      await request.expect(401);
    });
    test('should return unauthorized if token is invalid', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get(`/users/${randomUser.profile.email}`)
        .set('Authorization', 'Bearer invalidtoken');
      await request.expect(401);
    });
    test('should return user data if a simple user request user data for his own id', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get(`/users/${randomUser.profile.email}`)
        .set('Authorization', `Bearer ${randomUser.token}`);
      const response: Response = await request.expect(200);
      expect(response.body.email).toBe(randomUser.profile.email);
    });
    test('should return forbidden if a simple user request user data for another id', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get(`/users/${randomAdmin.profile.email}`)
        .set('Authorization', `Bearer ${randomUser.token}`);
      await request.expect(403);
    });
    test('should return users data if an admin make the request', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get(`/users/${randomUser.profile.email}`)
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      const response: Response = await request.expect(200);
      expect(response.body.email).toBe(randomUser.profile.email);
    });
    test('should return not found if user does not exist', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .get('/users/idontexist@random.io')
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      await request.expect(404);
    });
    test('should return internal server error if the database call fails', async () => {
      const mock = await jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValueOnce(randomAdmin.profile)
        .mockRejectedValueOnce(new Error('Database failure'));
      const request: Test = supertest(testServer.getHttpServer())
        .get(`/users/${randomUser.profile.email}`)
        .set('Authorization', `Bearer ${randomAdmin.token}`);
      await request.expect(500);
      mock.mockRestore();
    });
  });

  describe('POST users/', () => {
    test('should return unauthorized if token is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer()).post(
        '/users',
      );
      await request.expect(401);
    });
    test('should return unauthorized if token is invalid', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/users')
        .set('Authorization', 'Bearer invalidtoken');
      await request.expect(401);
    });
    test('should return unauthorized if a simple user request user creation', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${randomUser.token}`);
      await request.expect(403);
    });
    test('should return unprocessable if email field is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          username: 'john',
          password: 'topsecret',
          roles: [],
        });
      await request.expect(422);
    });
    test('should return unprocessable if name field is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          email: 'john@doe.com',
          password: 'topsecret',
          roles: ['admin'],
        });
      await request.expect(422);
    });
    test('should return unprocessable if password field is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          username: 'john',
          email: 'john@doe.com',
        });
      await request.expect(422);
    });
    test('should return unprocessable if password field is less than 8 characters', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          username: 'john',
          email: 'john@doe.com',
          password: 'secret',
        });
      await request.expect(422);
    });
    test('should return bad request if email is already used', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          username: 'john',
          email: randomUser.profile.email,
          password: 'topsecret',
        });
      await request.expect(400);
    });
    test('should create the user if an admin make the request and payload is valid', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          username: 'john',
          email: 'john@doe.com',
          password: 'topsecret',
        });
      await request.expect(201);
    });
  });

  describe('PUT users/:id', () => {
    test('should return unauthorized if token is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer()).put(
        `/users/${randomUser.profile.email}`,
      );
      await request.expect(401);
    });
    test('should return unauthorized if token is invalid', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put(`/users/${randomUser.profile.email}`)
        .set('Authorization', 'Bearer invalidtoken');
      await request.expect(401);
    });
    test('should return forbidden if a normal user make the requests with another id', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put(`/users/${randomAdmin.profile.email}`)
        .set('Authorization', `Bearer ${randomUser.token}`);
      await request.expect(403);
    });
    test('should return an error if the id given is not a valid ID', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put('/users/12de')
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          username: 'john doe',
          email: 'john@doe.com',
          password: 'topsecret',
        });
      await request.expect(400);
    });
    test('should return unprocessable if email field is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put(`/users/${randomUser.profile.email}`)
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          username: 'john',
          password: 'topsecret',
          roles: [],
        });
      await request.expect(422);
    });
    test('should return unprocessable if name field is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put(`/users/${randomUser.profile.email}`)
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          email: 'john@doe.com',
          password: 'topsecret',
          roles: ['admin'],
        });
      await request.expect(422);
    });
    test('should return unprocessable if password field is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put(`/users/${randomUser.profile.email}`)
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          username: 'john',
          email: 'john@doe.com',
        });
      await request.expect(422);
    });
    test('should return unprocessable if password field is less than 8 characters', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put(`/users/${randomUser.profile.email}`)
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          username: 'john',
          email: 'john@doe.com',
          password: 'secret',
        });
      await request.expect(422);
    });
    test('should return not found if user does not exist', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put('/users/idontexist@random.io')
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          username: 'john doe',
          email: 'john@doe.com',
          password: 'topsecret',
        });
      await request.expect(404);
    });
    test('should update user if a normal user make the requests with his own id', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put(`/users/${randomUser.profile.email}`)
        .set('Authorization', `Bearer ${randomUser.token}`)
        .send({
          username: 'john',
          email: 'john@doe.com',
          password: 'topsecret',
        });
      const response: Response = await request.expect(200);
      expect(response.body.email).toBe('john@doe.com');
    });
    test('should update the user if an admin make the request', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .put(`/users/${randomUser.profile.email}`)
        .set('Authorization', `Bearer ${randomAdmin.token}`)
        .send({
          username: 'john doe',
          email: 'john@doe.com',
          password: 'topsecret',
        });
      const response: Response = await request.expect(200);
      expect(response.body.email).toBe('john@doe.com');
    });
  });

  describe('DELETE users/:id', () => {
    let admin: User;
    let user1: User;
    let user2: User;
    let user3: User;
    beforeAll(async () => {
      // FIXME: Ensure there is at least 3 non-admin users by updating test data generation helpers
      const testData = await testHelpers.recreateData({ users: 24, roles: 2 });
      const admins = testData.users.filter((u) =>
        u.roles.some((r) => r.name === 'admin'),
      );
      const users = testData.users.filter(
        (u) => !u.roles.some((r) => r.name === 'admin'),
      );
      admin = admins[0];
      user1 = users[0];
      user2 = users[1];
      user3 = users[2];
    });
    test('should return an error if the id given is not a valid ID', async () => {
      const token = await testHelpers.getToken(admin);
      const request: Test = supertest(testServer.getHttpServer())
        .delete('/users/12de')
        .set('Authorization', `Bearer ${token}`);
      await request.expect(400);
    });
    test('should return unauthorized if token is missing', async () => {
      const request: Test = supertest(testServer.getHttpServer()).delete(
        `/users/${randomUser.profile.email}}`,
      );
      await request.expect(401);
    });
    test('should return unauthorized if token is invalid', async () => {
      const request: Test = supertest(testServer.getHttpServer())
        .delete(`/users/${randomUser.profile.email}}`)
        .set(
          'Authorization',
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        );
      await request.expect(401);
    });
    test('should return user data if a simple user request user data for his own id', async () => {
      const token = await testHelpers.getToken(user1);
      const request: Test = supertest(testServer.getHttpServer())
        .delete(`/users/${user1.email}`)
        .set('Authorization', `Bearer ${token}`);
      const response: Response = await request.expect(200);
      expect(response.body.email).toBe(user1.email);
      testHelpers.removeUser(user1);
    });
    test('should return forbidden if a simple user request user data for another id', async () => {
      const token = await testHelpers.getToken(user2);
      const request: Test = supertest(testServer.getHttpServer())
        .delete(`/users/${admin.email}}`)
        .set('Authorization', `Bearer ${token}`);
      await request.expect(403);
    });
    test('should return users data if an admin make the request', async () => {
      const token = await testHelpers.getToken(admin);
      const request: Test = supertest(testServer.getHttpServer())
        .delete(`/users/${user3.email}`)
        .set('Authorization', `Bearer ${token}`);
      const response: Response = await request.expect(200);
      expect(response.body.email).toBe(user3.email);
      testHelpers.removeUser(user3);
    });
    test('should return not found if user does not exist', async () => {
      const token = await testHelpers.getToken(admin);
      const request: Test = supertest(testServer.getHttpServer())
        .delete('/users/idontexist@random.io')
        .set('Authorization', `Bearer ${token}`);
      await request.expect(404);
    });
  });
});
