import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { FILE_CATEGORIES } from '../upload.constants';

export class UploadFileDto {
  @ApiProperty({ 
    description: 'File category to upload', 
    example: 'images',
    enum: Object.values(FILE_CATEGORIES),
    required: false 
  })
  @IsOptional()
  @IsEnum(Object.values(FILE_CATEGORIES), { 
    message: 'Category must be one of: images, documents, videos, audio, archives, other' 
  })
  category?: string;

  @ApiProperty({ 
    description: 'Custom folder path within the category', 
    example: 'profile-pictures',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'Folder must be a string' })
  folder?: string;

  @ApiProperty({ 
    description: 'User ID who is uploading the file', 
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'User ID must be a number' })
  userId?: number;

  @ApiProperty({ 
    description: 'Generate thumbnail for images', 
    example: true,
    required: false 
  })
  @IsOptional()
  generateThumbnail?: boolean;

  @ApiProperty({ 
    description: 'Compress image files', 
    example: true,
    required: false 
  })
  @IsOptional()
  compress?: boolean;
}

export class UpdateUploadDto {
  @ApiProperty({ 
    description: 'New filename', 
    example: 'new-filename.jpg',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'Filename must be a string' })
  filename?: string;

  @ApiProperty({ 
    description: 'Move file to different folder', 
    example: 'new-folder',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'Folder must be a string' })
  folder?: string;

  @ApiProperty({ 
    description: 'File category', 
    example: 'documents',
    enum: Object.values(FILE_CATEGORIES),
    required: false 
  })
  @IsOptional()
  @IsEnum(Object.values(FILE_CATEGORIES), { 
    message: 'Category must be one of: images, documents, videos, audio, archives, other' 
  })
  category?: string;
}

export class UploadQueryDto {
  @ApiProperty({ 
    description: 'File category filter', 
    example: 'images',
    enum: Object.values(FILE_CATEGORIES),
    required: false 
  })
  @IsOptional()
  @IsEnum(Object.values(FILE_CATEGORIES), { 
    message: 'Category must be one of: images, documents, videos, audio, archives, other' 
  })
  category?: string;

  @ApiProperty({ 
    description: 'User ID filter', 
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'User ID must be a number' })
  userId?: number;

  @ApiProperty({ 
    description: 'Page number for pagination', 
    example: 1,
    minimum: 1,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiProperty({ 
    description: 'Number of items per page', 
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number;
}
