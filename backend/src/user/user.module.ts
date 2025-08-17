import { HashingModule } from '@/common/hashing';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [PrismaModule, HashingModule, UploadModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
