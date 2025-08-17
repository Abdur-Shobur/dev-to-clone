import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { FileValidationGuard } from './guards/file-validation.guard';
import { UPLOAD_CONFIG } from './upload.constants';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    ConfigModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          const extension = extname(file.originalname);
          cb(null, `${randomName}${extension}`);
        },
      }),
      limits: {
        fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
        files: UPLOAD_CONFIG.MAX_FILES_COUNT,
      },
      fileFilter: (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        // Basic file type validation
        const allowedMimeTypes = [
          // Images
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          // Documents
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          // Videos
          'video/mp4',
          'video/webm',
          'video/ogg',
          'video/avi',
          'video/mov',
          // Audio
          'audio/mpeg',
          'audio/wav',
          'audio/ogg',
          'audio/mp4',
          // Archives
          'application/zip',
          'application/x-rar-compressed',
          'application/x-7z-compressed',
          'application/gzip',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type'), false);
        }
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, FileValidationGuard],
  exports: [UploadService],
})
export class UploadModule {}
