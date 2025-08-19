import { PartialType } from '@nestjs/swagger';
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

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}

export class Comment {
  id: number;
  body: string;
  articleId: number;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CommentResponse {
  id: number;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    username: string;
    email: string;
    bio?: string;
    image?: string;
  };
  article: {
    id: number;
    title: string;
    slug: string;
  };
}

export class CommentListResponse {
  comments: CommentResponse[];
  total: number;
  page: number;
  limit: number;
}

export class CreateCommentResponse {
  message: string;
  comment: CommentResponse;
}

export class UpdateCommentResponse {
  message: string;
  comment: CommentResponse;
}

export class DeleteCommentResponse {
  message: string;
}
