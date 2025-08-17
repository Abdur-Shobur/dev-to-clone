import { ApiProperty } from '@nestjs/swagger';

export class UserSchema {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    description: 'User profile image file or URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  image?: string;

  @ApiProperty({
    description: 'User creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class CreateUserSchema {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  password: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    description: 'User profile image file (multipart/form-data) or URL',
    type: 'string',
    format: 'binary',
    required: false,
  })
  image?: Express.Multer.File | string;
}

export class UpdateUserSchema {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({ description: 'Username', example: 'johndoe', required: false })
  username?: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    description: 'User profile image file (multipart/form-data) or URL',
    type: 'string',
    format: 'binary',
    required: false,
  })
  image?: Express.Multer.File | string;
}

export class UploadUserImageSchema {
  @ApiProperty({
    description: 'User profile image file',
    type: 'string',
    format: 'binary',
  })
  image: Express.Multer.File;

  @ApiProperty({
    description: 'Generate thumbnail for the image',
    example: true,
    required: false,
  })
  generateThumbnail?: boolean;

  @ApiProperty({
    description: 'Compress the image',
    example: true,
    required: false,
  })
  compress?: boolean;
}

export class UserImageResponseSchema {
  @ApiProperty({
    description: 'Success message',
    example: 'Image uploaded successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User profile image URL',
    example:
      'http://localhost:3000/uploads/images/profile-pictures/abc123-def456.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Thumbnail URL if generated',
    example: 'http://localhost:3000/uploads/thumbnails/thumb_abc123-def456.jpg',
    required: false,
  })
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Updated user data',
    type: UserSchema,
  })
  user: UserSchema;
}
