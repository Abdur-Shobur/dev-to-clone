import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import {
  FollowListResponse,
  FollowResponse,
  FollowStats,
} from './entities/follow.entity';

@Injectable()
export class FollowService {
  constructor(private readonly prisma: PrismaService) {}

  async followUser(
    followerId: number,
    createFollowDto: CreateFollowDto,
  ): Promise<FollowResponse> {
    const { followingId } = createFollowDto;

    // Check if trying to follow self
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Check if user to follow exists
    const followingUser = await this.prisma.user.findUnique({
      where: { id: followingId },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        image: true,
      },
    });

    if (!followingUser) {
      throw new NotFoundException('User to follow not found');
    }

    // Check if already following
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    // Create follow relationship
    const follow = await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            image: true,
          },
        },
        following: {
          select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            image: true,
          },
        },
      },
    });

    return {
      id: follow.id,
      follower: follow.follower,
      following: follow.following,
      createdAt: follow.createdAt,
    };
  }

  async unfollowUser(
    followerId: number,
    followingId: number,
  ): Promise<{ message: string }> {
    // Check if follow relationship exists
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    // Delete follow relationship
    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<FollowListResponse> {
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get followers with pagination
    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              email: true,
              bio: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
    ]);

    // Check if current user is following each follower
    const followersWithFollowStatus = followers.map((follow) => ({
      ...follow.follower,
      isFollowing: false, // This would need to be calculated based on current user
    }));

    return {
      users: followersWithFollowStatus,
      total,
      page,
      limit,
    };
  }

  async getFollowing(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<FollowListResponse> {
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get following with pagination
    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        include: {
          following: {
            select: {
              id: true,
              username: true,
              email: true,
              bio: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    // Check if current user is following each following user
    const followingWithFollowStatus = following.map((follow) => ({
      ...follow.following,
      isFollowing: true, // User is following these people
    }));

    return {
      users: followingWithFollowStatus,
      total,
      page,
      limit,
    };
  }

  async getFollowStats(userId: number): Promise<FollowStats> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get followers and following counts
    const [followersCount, followingCount] = await Promise.all([
      this.prisma.follow.count({
        where: { followingId: userId },
      }),
      this.prisma.follow.count({
        where: { followerId: userId },
      }),
    ]);

    return {
      followersCount,
      followingCount,
    };
  }

  async isFollowing(
    followerId: number,
    followingId: number,
  ): Promise<{ isFollowing: boolean }> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return { isFollowing: !!follow };
  }

  async getMutualFollowers(
    userId1: number,
    userId2: number,
  ): Promise<FollowListResponse> {
    // Check if both users exist
    const [user1, user2] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId1 } }),
      this.prisma.user.findUnique({ where: { id: userId2 } }),
    ]);

    if (!user1 || !user2) {
      throw new NotFoundException('One or both users not found');
    }

    // Get mutual followers (users who follow both userId1 and userId2)
    const mutualFollowers = await this.prisma.user.findMany({
      where: {
        AND: [
          {
            follows: {
              some: {
                followingId: userId1,
              },
            },
          },
          {
            follows: {
              some: {
                followingId: userId2,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        image: true,
      },
    });

    return {
      users: mutualFollowers.map((user) => ({
        ...user,
        isFollowing: false, // This would need to be calculated based on current user
      })),
      total: mutualFollowers.length,
      page: 1,
      limit: mutualFollowers.length,
    };
  }
}
