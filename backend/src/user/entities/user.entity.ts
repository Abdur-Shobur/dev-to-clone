import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ description: 'User ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username: string;

  @ApiProperty({ description: 'Hashed password' })
  password: string;

  @ApiProperty({
    description: 'User bio',
    example: 'Software developer',
    required: false,
  })
  bio: string | null;

  @ApiProperty({
    description: 'User profile image URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  image: string | null;

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
