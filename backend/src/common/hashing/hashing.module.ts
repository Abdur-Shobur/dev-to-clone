import { Module } from '@nestjs/common';
import { Argon2Service } from './argon2.service';
import { HashingService } from './hashing.service';
import { PasswordValidator } from './password.validator';

@Module({
  providers: [
    {
      provide: HashingService,
      useClass: Argon2Service,
    },
    PasswordValidator,
  ],
  exports: [HashingService, PasswordValidator],
})
export class HashingModule {}
