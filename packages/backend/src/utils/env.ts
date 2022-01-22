import * as dotenv from 'dotenv';
import * as path from 'path';

import { Logger } from '@nestjs/common';
import { silent } from './logger';

const dotEnvPath = (): string => {
  switch (process.env.NODE_ENV) {
    case 'test':
      return path.join(__dirname, '..', '..', '.env.test');
    case 'prod':
      return path.join(__dirname, '..', '..', '.env.prod');
    default:
      return path.join(__dirname, '..', '..', '.env');
  }
};

export const loadEnvironmentVariables = (): void => {
  const envPath = dotEnvPath();

  if (!silent()) {
    Logger.log('Loading env from :' + path.resolve(__dirname, envPath), 'env');
  }

  dotenv.config({ path: path.resolve(__dirname, envPath) });

  if (!silent()) {
    Logger.log('Using database configuration', 'env');
    Object.keys(process.env)
      .filter((k) => k.startsWith('TYPEORM'))
      .forEach((k) => Logger.log(`${k}=${process.env[k]}`, 'env'));
  }
};
