import { User } from '../../src/user/user.model';
import { faker } from '@faker-js/faker';
import { hashSync } from 'bcrypt';
import { Role } from '../../src/roles/role.model';

export class UserFactory {
  private testData: User[];
  private nbRecords: number;
  private unhashedPasswords: Map<string, string>;

  constructor(nbRecords?: number) {
    this.nbRecords = nbRecords || 100;
    this.unhashedPasswords = new Map();
  }

  public setNbRecords = (nbRecords: number): void => {
    this.nbRecords = nbRecords;
  };

  public getTestData = (): User[] => this.testData;

  public generateTestData = (roles: Role[]): User[] => {
    this.testData = [];
    for (let i = 0; i < this.nbRecords; i += 1) {
      this.testData.push(this.generateUser(roles));
    }
    return this.testData;
  };

  public getRandomUser = (): User => {
    return faker.random.arrayElement(
      this.testData.filter(
        (user) =>
          user.roles && !user.roles.map((r) => r.name).includes('admin'),
      ),
    );
  };

  public getRandomAdmin = (): User => {
    return faker.random.arrayElement(
      this.testData.filter(
        (user) => user.roles && user.roles.map((r) => r.name).includes('admin'),
      ),
    );
  };

  public removeUser = (user: User): void => {
    this.testData = this.testData.filter((u) => u.email !== user.email);
  };

  public getUnhashedPassword = (email: string): string =>
    this.unhashedPasswords.get(email);

  private generateUser = (roles: Role[]): User => {
    const isAdmin = faker.random.arrayElement([false, true]);
    const nbRoles =
      Math.floor(faker.datatype.number(roles.length - 1)) +
      1 -
      (isAdmin ? 1 : 0);
    const user = new User();
    const password = faker.internet.password(9);
    user.createdAt = faker.date.past();
    user.deleteAt = null;
    user.username = faker.name.findName().slice(0, 24);
    user.email = faker.internet.email();
    user.password = hashSync(password, 10);
    const userRoles: Role[] = [];
    const adminRole = roles.find((r) => r.name === 'admin');
    const otherRoles = new Set(roles.filter((r) => r.name !== 'admin'));
    if (isAdmin && adminRole) {
      userRoles.push(adminRole);
    }
    for (let i = 0; i < nbRoles; i += 1) {
      const randomRole = [...otherRoles][
        Math.floor(Math.random() * otherRoles.size)
      ];
      userRoles.push(randomRole);
      otherRoles.delete(randomRole);
    }
    user.roles = userRoles.filter((r) => r != null);
    this.unhashedPasswords.set(user.email, password);
    return user;
  };
}
