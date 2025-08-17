import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ALLOWED_FILE_TYPES, UPLOAD_CONFIG, UPLOAD_ERROR_MESSAGES } from '../upload.constants';

@Injectable()
export class FileValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const files = request.files || request.file;
    
    if (!files) {
      throw new BadRequestException('No files provided');
    }

    const fileArray = Array.isArray(files) ? files : [files];
    
    // Check file count
    if (fileArray.length > UPLOAD_CONFIG.MAX_FILES_COUNT) {
      throw new BadRequestException(UPLOAD_ERROR_MESSAGES.TOO_MANY_FILES);
    }

    // Validate each file
    fileArray.forEach((file: Express.Multer.File, index: number) => {
      this.validateFile(file, index);
    });

    return true;
  }

  private validateFile(file: Express.Multer.File, index: number): void {
    // Check file size
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `${UPLOAD_ERROR_MESSAGES.FILE_TOO_LARGE} (${file.originalname})`
      );
    }

    // Check file type
    const allowedTypes = this.getAllowedMimeTypes();
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `${UPLOAD_ERROR_MESSAGES.INVALID_FILE_TYPE} (${file.originalname}): ${file.mimetype}`
      );
    }

    // Check file extension
    const extension = this.getFileExtension(file.originalname);
    const allowedExtensions = this.getAllowedExtensions();
    if (!allowedExtensions.includes(extension.toLowerCase())) {
      throw new BadRequestException(
        `${UPLOAD_ERROR_MESSAGES.INVALID_FILE_TYPE} (${file.originalname}): ${extension}`
      );
    }
  }

  private getAllowedMimeTypes(): string[] {
    const types: string[] = [];
    Object.values(ALLOWED_FILE_TYPES).forEach(category => {
      Object.keys(category).forEach(mimeType => {
        types.push(mimeType);
      });
    });
    return types;
  }

  private getAllowedExtensions(): string[] {
    const extensions: string[] = [];
    Object.values(ALLOWED_FILE_TYPES).forEach(category => {
      Object.values(category).forEach(extList => {
        const extArray = extList.split(',');
        extArray.forEach(ext => {
          extensions.push(ext.trim());
        });
      });
    });
    return extensions;
  }

  private getFileExtension(filename: string): string {
    return filename.substring(filename.lastIndexOf('.'));
  }
}
