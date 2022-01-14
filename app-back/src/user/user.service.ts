import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.model';
import { PaginatorService } from '../common/paginator/paginator.service';
import { IPageOptions } from '../common/paginator/dto/page-options.interface';
import { Page } from '../common/paginator/dto/page.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paginatorService: PaginatorService,
  ) {}

  async findAll(options?: IPageOptions<User>): Promise<Page<User>> {
    return this.paginatorService.findPage(
      User.PRIMARY_KEY,
      options,
      this.userRepository,
    );
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne(email);
  }

  async emailExists(email: string): Promise<boolean> {
    const found = await this.findByEmail(email);
    return found != null;
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async delete(user: User): Promise<User> {
    return this.userRepository.remove(user);
  }
}
