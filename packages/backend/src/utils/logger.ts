import { Module } from '@nestjs/common';
import { Injectable, Scope, Logger as BaseLogger } from '@nestjs/common';

export const silent = (): boolean =>
  process.env.NODE_ENV === 'test' && process.env.VERBOSE_TESTS !== 'true';

@Injectable({ scope: Scope.TRANSIENT })
export class Logger extends BaseLogger {
  private static _log(
    level: string,
    message: unknown,
    ctx?: string,
    trace?: string,
  ): void {
    try {
      if (!silent()) {
        BaseLogger[level](message, trace ? trace : ctx, trace ? ctx : null);
      }
    } catch (e) {
      BaseLogger.error(e.message, e.trace, 'logger');
    }
  }

  log(message: unknown, ctx?: string): void {
    Logger._log('log', message, ctx);
  }
  error(message: unknown, trace?: string, ctx?: string): void {
    Logger._log('error', message, ctx, trace);
  }
  warn(message: unknown, ctx?: string): void {
    Logger._log('warn', message, ctx);
  }
  debug(message: unknown, ctx?: string): void {
    Logger._log('debug', message, ctx);
  }
  verbose(message: unknown, ctx?: string): void {
    Logger._log('verbose', message, ctx);
  }
}

@Module({
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {}
