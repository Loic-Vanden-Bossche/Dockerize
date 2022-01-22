import { Module } from '@nestjs/common';
import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';

export const silent = (): boolean =>
  process.env.NODE_ENV === 'test' && process.env.VERBOSE_TESTS !== 'true';

@Injectable({ scope: Scope.TRANSIENT })
export class Logger extends ConsoleLogger {}

@Module({
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {}
