import { ApiProperty } from '@nestjs/swagger';

export class UploadEntity {
  @ApiProperty({ description: 'Upload ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Original filename', example: 'image.jpg' })
  originalName: string;

  @ApiProperty({ description: 'Generated filename', example: 'abc123-def456.jpg' })
  filename: string;

  @ApiProperty({ description: 'File path relative to upload directory', example: '2024/01/15/abc123-def456.jpg' })
  path: string;

  @ApiProperty({ description: 'Full file URL', example: 'http://localhost:3000/uploads/2024/01/15/abc123-def456.jpg' })
  url: string;

  @ApiProperty({ description: 'File MIME type', example: 'image/jpeg' })
  mimetype: string;

  @ApiProperty({ description: 'File size in bytes', example: 1024000 })
  size: number;

  @ApiProperty({ description: 'File category', example: 'images' })
  category: string;

  @ApiProperty({ description: 'File extension', example: '.jpg' })
  extension: string;

  @ApiProperty({ description: 'Thumbnail URL if available', example: 'http://localhost:3000/uploads/thumbnails/abc123-def456.jpg', required: false })
  thumbnailUrl?: string;

  @ApiProperty({ description: 'User ID who uploaded the file', example: 1, required: false })
  userId?: number;

  @ApiProperty({ description: 'Upload creation date', example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Upload last update date', example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class UploadResponse {
  @ApiProperty({ description: 'Success message', example: 'File uploaded successfully' })
  message: string;

  @ApiProperty({ description: 'Uploaded file data', type: UploadEntity })
  file: UploadEntity;
}

export class MultipleUploadResponse {
  @ApiProperty({ description: 'Success message', example: 'Files uploaded successfully' })
  message: string;

  @ApiProperty({ description: 'Uploaded files data', type: [UploadEntity] })
  files: UploadEntity[];

  @ApiProperty({ description: 'Number of files uploaded', example: 3 })
  count: number;
}
