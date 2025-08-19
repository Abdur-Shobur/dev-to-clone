import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsNumber()
  @IsNotEmpty()
  articleId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1, { message: 'Comment body cannot be empty' })
  body: string;
}
