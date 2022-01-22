import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  UsePipes,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDTO, userSchema } from './user.dto';
import { hashSync } from 'bcrypt';
import { UserService } from './user.service';
import { User } from './user.model';
import { RolesService } from '../roles/roles.service';
import { Role } from '../roles/role.model';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SelfGuard } from '../auth/guards/self.guard';
import { JoiValidationPipe } from '../utils/validation.pipe';
import { Logger } from '../utils/logger';
import * as Joi from 'joi';
import { IPageOptions } from '../common/paginator/dto/page-options.interface';
import { Page } from '../common/paginator/dto/page.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly logger: Logger,
    private readonly userService: UserService,
    private readonly roleService: RolesService,
  ) {
    this.logger.setContext('users');
  }

  private static sanitizeId(rawEmail: string): string {
    const { error, value } = Joi.string().email().required().validate(rawEmail);
    if (error) {
      throw new BadRequestException('Invalid ID requested');
    }
    return value;
  }

  @Post()
  @UsePipes(new JoiValidationPipe(userSchema))
  @UseGuards(AuthGuard('bearer'), new RolesGuard(['admin']))
  async create(@Body() userDTO: CreateUserDTO): Promise<User> {
    this.logger.log('POST users/', 'access');
    const user = new User();
    user.email = userDTO.email;
    user.username = userDTO.username;
    user.roles = await this.getUserRoles(userDTO);
    user.password = hashSync(userDTO.password, 10);
    const doesUserAlreadyExists = await this.userService.emailExists(
      userDTO.email,
    );
    if (doesUserAlreadyExists) {
      throw new BadRequestException('Email address already taken');
    }
    const savedUser = this.userService.save(user).catch((err) => {
      this.logger.error(err);
      throw new InternalServerErrorException();
    });
    return savedUser;
  }

  @Get()
  @UseGuards(AuthGuard('bearer'), new RolesGuard(['admin']))
  findAll(@Query() page: IPageOptions<User>): Promise<Page<User>> {
    this.logger.log('GET users/', 'access');
    return this.userService.findAll(page);
  }

  @Get(':id')
  @UseGuards(AuthGuard('bearer'), new SelfGuard('id'))
  async findOne(@Param('id') id: string): Promise<User> {
    this.logger.log('GET users/' + id, 'access');

    const email = UserController.sanitizeId(id);
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    return user;
  }

  @Put(':id')
  @UseGuards(AuthGuard('bearer'), new SelfGuard('id'))
  async update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(userSchema)) userDTO: CreateUserDTO,
  ): Promise<User> {
    this.logger.log('PUT users/' + id, 'access');

    const email = UserController.sanitizeId(id);
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException();
    }
    user.email = userDTO.email;

    user.username = userDTO.username;
    user.roles = await this.getUserRoles(userDTO);

    user.password = hashSync(userDTO.password, 10);
    try {
      const savedUser = this.userService.save(user);
      return savedUser;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('bearer'), new SelfGuard('id'))
  async remove(@Param('id') id: string): Promise<Partial<User>> {
    this.logger.log('DELETE users/' + id, 'access');

    const email = UserController.sanitizeId(id);
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException();
    }
    try {
      const deletedUser = { ...user };
      await this.userService.delete(user);
      return deletedUser;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  private async getUserRoles(userDTO: CreateUserDTO): Promise<Role[]> {
    if (Array.isArray(userDTO.roles) && userDTO.roles.length > 0) {
      return Promise.all(
        userDTO.roles.map(async (roleId: number) => {
          const role = await this.roleService.findById(roleId);
          if (!role) {
            throw new BadRequestException('Trying to assign not existing role');
          }
          return role;
        }),
      );
    }
    return [];
  }
}
