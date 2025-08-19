import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Tag name cannot be empty' })
  @MaxLength(50, { message: 'Tag name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z0-9\s-]+$/, {
    message: 'Tag name can only contain letters, numbers, spaces, and hyphens',
  })
  name: string;
}
