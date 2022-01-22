import fakerStatic from 'faker';
import { Role } from '../../src/roles/role.model';

export class RoleFactory {
  private testData: Role[];
  private nbRecords: number;
  private adminRole: Role;

  constructor(nbRecords?: number) {
    this.nbRecords = nbRecords || 100;
  }

  public setNbRecords = (nbRecords: number): void => {
    this.nbRecords = nbRecords;
  };

  public getTestData = (): Role[] => this.testData;

  public generateTestData = (): Role[] => {
    this.testData = [];
    this.testData.push(this.generateRole('admin'));

    for (let i = 0; i < this.nbRecords; i += 1) {
      this.testData.push(this.generateRole());
    }
    return this.testData;
  };

  public getRandomRole = (): Role => {
    return fakerStatic.random.arrayElement(this.testData);
  };

  public getNotAdminRole = (): Role => {
    return fakerStatic.random.arrayElement(
      this.testData.filter((role) => role.name !== 'admin'),
    );
  };

  public getAdminRole = (): Role => {
    return this.adminRole;
  };

  private generateRole = (roleName?: string): Role => {
    const role = new Role();
    role.name = roleName || fakerStatic.name.jobType();
    return role;
  };
}
