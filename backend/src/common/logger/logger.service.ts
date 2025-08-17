// src/common/logger/logger.service.ts
import {
  Inject,
  Injectable,
  LoggerService as NestLogger,
  Scope,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLogger {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: NestLogger,
  ) {}

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, context?: string, trace?: string) {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, context);
  }
}
