import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from './utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: new Logger });
  const port = Number(process.env.BACKEND_PORT) || 4000;
  await app.listen(port);
}
bootstrap();
