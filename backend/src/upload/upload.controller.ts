import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { UploadService } from './upload.service';
import { UploadFileDto, UpdateUploadDto, UploadQueryDto } from './dto/upload-file.dto';
import { UploadEntity, UploadResponse, MultipleUploadResponse } from './entities/upload.entity';
import { FileValidationGuard } from './guards/file-validation.guard';
import { UPLOAD_CONFIG } from './upload.constants';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        category: {
          type: 'string',
          description: 'File category (images, documents, videos, audio, archives, other)',
          example: 'images',
        },
        folder: {
          type: 'string',
          description: 'Custom folder path',
          example: 'profile-pictures',
        },
        userId: {
          type: 'number',
          description: 'User ID',
          example: 1,
        },
        generateThumbnail: {
          type: 'boolean',
          description: 'Generate thumbnail for images',
          example: true,
        },
        compress: {
          type: 'boolean',
          description: 'Compress image files',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: UploadResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or validation error',
  })
  @UseInterceptors(
    FileInterceptor('file', {
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
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadFileDto,
  ): Promise<UploadResponse> {
    return this.uploadService.uploadFile(file, uploadDto);
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Files to upload',
        },
        category: {
          type: 'string',
          description: 'File category (images, documents, videos, audio, archives, other)',
          example: 'images',
        },
        folder: {
          type: 'string',
          description: 'Custom folder path',
          example: 'gallery',
        },
        userId: {
          type: 'number',
          description: 'User ID',
          example: 1,
        },
        generateThumbnail: {
          type: 'boolean',
          description: 'Generate thumbnail for images',
          example: true,
        },
        compress: {
          type: 'boolean',
          description: 'Compress image files',
          example: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Files uploaded successfully',
    type: MultipleUploadResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid files or validation error',
  })
  @UseInterceptors(
    FilesInterceptor('files', UPLOAD_CONFIG.MAX_FILES_COUNT, {
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
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadFileDto,
  ): Promise<MultipleUploadResponse> {
    return this.uploadService.uploadMultipleFiles(files, uploadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all uploads with pagination and filters' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by file category' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Uploads retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        uploads: {
          type: 'array',
          items: { $ref: '#/components/schemas/UploadEntity' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getAllUploads(@Query() query: UploadQueryDto) {
    return this.uploadService.getAllUploads(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get upload by ID' })
  @ApiParam({ name: 'id', description: 'Upload ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Upload retrieved successfully',
    type: UploadEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Upload not found',
  })
  async getUploadById(@Param('id', ParseIntPipe) id: number): Promise<UploadEntity> {
    return this.uploadService.getUploadById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update upload information' })
  @ApiParam({ name: 'id', description: 'Upload ID', type: 'number' })
  @ApiBody({ type: UpdateUploadDto })
  @ApiResponse({
    status: 200,
    description: 'Upload updated successfully',
    type: UploadResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Upload not found',
  })
  async updateUpload(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUploadDto,
  ): Promise<UploadResponse> {
    return this.uploadService.updateUpload(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete upload' })
  @ApiParam({ name: 'id', description: 'Upload ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Upload deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Upload not found',
  })
  async deleteUpload(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this.uploadService.deleteUpload(id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate file before upload' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to validate',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File validation result',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        message: { type: 'string' },
        fileInfo: {
          type: 'object',
          properties: {
            originalName: { type: 'string' },
            size: { type: 'number' },
            mimetype: { type: 'string' },
            extension: { type: 'string' },
          },
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          const extension = extname(file.originalname);
          cb(null, `${randomName}${extension}`);
        },
      }),
    }),
  )
  async validateFile(@UploadedFile() file: Express.Multer.File) {
    // This endpoint can be used to validate files before actual upload
    const isValid = file && file.size <= UPLOAD_CONFIG.MAX_FILE_SIZE;
    
    return {
      isValid,
      message: isValid ? 'File is valid' : 'File validation failed',
      fileInfo: {
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        extension: extname(file.originalname),
      },
    };
  }
}
