import { User } from '../src/user/user.model';
import { UserFactory } from './factories/users.factory';
import supertest from 'supertest';

import { RoleFactory } from './factories/roles.factory';
import {
  Repository,
  Connection,
  createConnection,
  getConnection,
} from 'typeorm';
import { Role } from '../src/roles/role.model';

import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../src/roles/role.module';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../src/auth/auth.module';
import { UserModule } from '../src/user/user.module';
import { loadEnvironmentVariables } from '../src/utils/env';

export class TestHelpers {
  public roleFactory: RoleFactory;
  public userFactory: UserFactory;

  private testServer: INestApplication;
  private usersRepository: Repository<User>;
  private rolesRepository: Repository<Role>;
  private connection: Connection;

  constructor() {
    this.userFactory = new UserFactory(10);
    this.roleFactory = new RoleFactory(5);
  }
  public startServer = async (): Promise<INestApplication> => {
    loadEnvironmentVariables();

    const module = await Test.createTestingModule({
      imports: [
        RolesModule,
        TypeOrmModule.forRoot({
          keepConnectionAlive: true,
          migrationsRun: true,
        }),
        TypeOrmModule.forFeature([User, Role]),

        UserModule,
        AuthModule,
        PassportModule,
      ],
    }).compile();
    const app = module.createNestApplication();
    await app.init();

    try {
      this.connection = await createConnection();
    } catch (e) {
      this.connection = getConnection();
    }
    this.usersRepository = this.connection.getRepository(User);
    this.rolesRepository = this.connection.getRepository(Role);

    this.testServer = app;
    return app;
  };

  public stopServer = async (): Promise<void> => {
    if (this.connection.isConnected) {
      await this.connection.close();
    }

    await this.testServer.close();
  };

  public resetDatabase = async (): Promise<void> => {
    try {
      await this.connection.dropDatabase();
      await this.connection.runMigrations();
    } catch (e) {
      // console.error('Cannot reset test database', e);
      throw Error(e);
    }
  };

  public recreateData = async (options: {
    users: number;
    roles: number;
  }): Promise<{ users: User[]; roles: Role[] }> => {
    try {
      // console.time('recreate_data');
      await this.resetDatabase();
      this.roleFactory.setNbRecords(options.roles);
      this.userFactory.setNbRecords(options.users);
      const roles = this.roleFactory.generateTestData();
      const savedRoles = await this.rolesRepository.save(roles);
      const users = this.userFactory.generateTestData(savedRoles);
      await this.usersRepository.save(users);
      // console.timeEnd('recreate_data');
      return { users, roles };
    } catch (e) {
      // console.error('Cannot recreate test data', e);
      throw Error(e);
    }
  };

  public getUserFromDB = async (): Promise<User> => {
    return this.usersRepository.findOne();
  };

  public getUser = async (): Promise<{ token: string; profile: User }> => {
    const user = this.userFactory.getRandomUser();
    const token = await this.getToken(user);
    return { token, profile: user };
  };

  public getAdmin = async (): Promise<{ token: string; profile: User }> => {
    const admin = this.userFactory.getRandomAdmin();
    const token = await this.getToken(admin);
    return { token, profile: admin };
  };

  public removeUser = (user: User): void => {
    this.userFactory.removeUser(user);
  };

  public getToken = async (user: User): Promise<string> => {
    const response = await supertest(this.testServer.getHttpServer())
      .post('/login')
      .send({
        email: user.email,
        password: this.userFactory.getUnhashedPassword(user.email),
      });
    if (response.status === 401) {
      // console.error('Token couldn\'t be fetched', JSON.stringify(response.body));
      throw new Error("Token couldn't be fetched");
    }
    return response.body.token;
  };
}

// InnoDB engines crop the milliseconds part when stored in DB
// Result is rounded to closest second (mySQL) or floored (MariaDB)
// So we expect a response ending with .000Z rounded to tthe nearest second
export const roundToNearestSecond = (
  date: Date,
  mode: 'round' | 'floor' = 'round',
): Date => {
  const _date = new Date(date.getTime());
  const ms = _date.getMilliseconds();
  const shouldBeRoundToUpper = ms >= 500;
  _date.setMilliseconds(0);
  if (shouldBeRoundToUpper && mode === 'round') {
    _date.setSeconds(date.getSeconds() + 1);
  }
  return _date;
};