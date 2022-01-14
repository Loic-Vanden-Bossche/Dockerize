#!/usr/bin/env ts-node
import { prompt, QuestionCollection } from 'inquirer';
import { Role } from '../../src/roles/role.model';
import { createConnection, getRepository } from 'typeorm';
import { User } from '../../src/users/user.model';
import { hashSync } from 'bcrypt';
/* tslint:disable:no-console */

let password: string;
const questions: QuestionCollection = [
  {
    type: 'input',
    name: 'username',
    message: 'username:',
    default: 'admin',
    validate: (input: string) => {
      return new Promise((resolve) => {
        if (!input || typeof input !== 'string') {
          resolve('Please provide a valid username');
        }
        resolve(true);
      });
    },
  },
  {
    type: 'input',
    name: 'email',
    message: 'email:',
    default: 'admin@yourdomain.com',
    validate: (input: string) => {
      return new Promise((resolve) => {
        // tslint:disable-next-line
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!input || !input.match(emailPattern)) {
          resolve('Please provide a valid email-adress');
        }
        resolve(true);
      });
    },
  },
  {
    type: 'password',
    mask: '*',
    name: 'password',
    message: 'password:',
    validate: (input: string) => {
      password = input;
      return new Promise((resolve) => {
        if (!input || input.length < 8) {
          resolve('Password length must be >= 8');
        }
        resolve(true);
      });
    },
  },
  {
    type: 'password',
    mask: '*',
    name: 'confirm',
    message: 'confirm password:',
    validate: (input: string) => {
      return new Promise((resolve) => {
        if (!input || input.length < 8) {
          resolve('Password length must be >= 8');
        } else if (input !== password) {
          resolve('Confirmation and password don\'t match');
        }
        resolve(true);
      });
    },
  },
];

const exec = async() => {
  // Connect DB
  const connection = await createConnection().catch(() => {
    console.error('Database connection failed');
    process.exit(1);
  });
  // Creating base role
  console.log('Creating base roles...');
  const admin = new Role();
  admin.name = 'admin';
  const user = new Role();
  user.name = 'user';
  const rolesRepository = getRepository(Role);
  const savedRoles: Role[] = await rolesRepository.save([admin, user]).catch((e) => {
    console.error('Error creating base roles');
    console.error(e);
    process.exit(1);
  }) as Role[];
  console.log('Done.');

  console.log('Creating root user...');
  // Creating root user
  const answers = await prompt(questions);
  const rootUser = new User();
  rootUser.username = answers.username;
  rootUser.email = answers.email;
  rootUser.password = hashSync(answers.password, 10);
  rootUser.roles = savedRoles;
  const usersRepository = getRepository(User);
  await usersRepository.save(rootUser).catch((e) => {
    console.error('Error creating root user');
    console.error(e);
    process.exit(1);
  });
  console.log('Root user successfully created');
  process.exit(0);
};

exec();
