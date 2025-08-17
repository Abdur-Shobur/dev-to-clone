import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsUrl,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, underscores, and hyphens',
  })
  username: string;

  @ApiProperty({ 
    description: 'User password (must be at least 8 characters with uppercase, lowercase, number, and special character)', 
    example: 'Password123!' 
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;

  @ApiProperty({
    description: 'User profile image URL (if not uploading a file)',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  @IsUrl({}, { message: 'Please provide a valid image URL' })
  @Matches(/^https?:\/\/.+/, {
    message: 'Image URL must be a valid HTTP/HTTPS URL',
  })
  image?: string;
}

export class CreateUserWithFileDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, underscores, and hyphens',
  })
  username: string;

  @ApiProperty({ 
    description: 'User password (must be at least 8 characters with uppercase, lowercase, number, and special character)', 
    example: 'Password123!' 
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;

  @ApiProperty({
    description: 'User profile image file',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({
    description: 'Generate thumbnail for the image',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  generateThumbnail?: boolean;

  @ApiProperty({
    description: 'Compress the image',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  compress?: boolean;
}
