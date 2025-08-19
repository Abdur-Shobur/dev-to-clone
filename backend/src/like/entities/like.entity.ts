import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateLikeDto {
  @IsNumber()
  @IsNotEmpty()
  articleId: number;
}

export class UpdateLikeDto extends PartialType(CreateLikeDto) {}

export class Like {
  id: number;
  articleId: number;
  userId: number;
  createdAt: Date;
}

export class LikeResponse {
  id: number;
  createdAt: Date;
  user: {
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

export class LikeListResponse {
  likes: LikeResponse[];
  total: number;
  page: number;
  limit: number;
}

export class CreateLikeResponse {
  message: string;
  like: LikeResponse;
}

export class DeleteLikeResponse {
  message: string;
}

export class LikeStats {
  likesCount: number;
  isLiked: boolean;
}
