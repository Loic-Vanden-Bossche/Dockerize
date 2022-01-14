import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadEnvironmentVariables } from './utils/env';
import { Logger } from './utils/logger';

loadEnvironmentVariables();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(new Logger());
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}
bootstrap();
