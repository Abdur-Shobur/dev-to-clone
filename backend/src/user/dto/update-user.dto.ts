import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateUserWithFileDto {
  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
    required: false,
  })
  username?: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer',
    required: false,
  })
  bio?: string;

  @ApiProperty({
    description: 'User profile image file',
    type: 'string',
    format: 'binary',
    required: false,
  })
  image?: Express.Multer.File;

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
