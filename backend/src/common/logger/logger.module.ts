// src/common/logger/logger.module.ts
import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerOptions } from './winston.logger';

@Global()
@Module({
  imports: [WinstonModule.forRoot(winstonLoggerOptions)],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}

/* USE IN SERVICE
// src/some/other.service.ts
 
export class OtherService {
  constructor(private readonly logger: LoggerService) {}

  doWork() {
    this.logger.log('Doing work in OtherService', 'OtherService');
  }
}

*/
