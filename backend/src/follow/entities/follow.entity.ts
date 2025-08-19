import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFollowDto {
  @IsNumber()
  @IsNotEmpty()
  followingId: number;
}

export class UpdateFollowDto extends PartialType(CreateFollowDto) {}

export class Follow {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: Date;
}

export class FollowResponse {
  id: number;
  follower: {
    id: number;
    username: string;
    email: string;
    bio?: string;
    image?: string;
  };
  following: {
    id: number;
    username: string;
    email: string;
    bio?: string;
    image?: string;
  };
  createdAt: Date;
}

export class FollowStats {
  followersCount: number;
  followingCount: number;
}

export class FollowListResponse {
  users: Array<{
    id: number;
    username: string;
    email: string;
    bio?: string;
    image?: string;
    isFollowing: boolean;
  }>;
  total: number;
  page: number;
  limit: number;
}
