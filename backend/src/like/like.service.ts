import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateLikeDto } from './dto/create-like.dto';
import {
  CreateLikeResponse,
  DeleteLikeResponse,
  LikeListResponse,
  LikeStats,
} from './entities/like.entity';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}

  async likeArticle(
    userId: number,
    createLikeDto: CreateLikeDto,
  ): Promise<CreateLikeResponse> {
    const { articleId } = createLikeDto;

    // Check if article exists
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, title: true, slug: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if already liked
    const existingLike = await this.prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    if (existingLike) {
      throw new ConflictException('Article already liked');
    }

    // Create like
    const like = await this.prisma.like.create({
      data: {
        articleId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            bio: true,
            image: true,
          },
        },
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return {
      message: 'Article liked successfully',
      like: {
        id: like.id,
        createdAt: like.createdAt,
        user: like.user,
        article: like.article,
      },
    };
  }

  async unlikeArticle(
    userId: number,
    articleId: number,
  ): Promise<DeleteLikeResponse> {
    // Check if like exists
    const like = await this.prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    // Delete like
    await this.prisma.like.delete({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    return { message: 'Article unliked successfully' };
  }

  async getArticleLikes(
    articleId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<LikeListResponse> {
    const skip = (page - 1) * limit;

    // Check if article exists
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const [likes, total] = await Promise.all([
      this.prisma.like.findMany({
        where: { articleId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              bio: true,
              image: true,
            },
          },
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.like.count({ where: { articleId } }),
    ]);

    return {
      likes: likes.map((like) => ({
        id: like.id,
        createdAt: like.createdAt,
        user: like.user,
        article: like.article,
      })),
      total,
      page,
      limit,
    };
  }

  async getUserLikes(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<LikeListResponse> {
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [likes, total] = await Promise.all([
      this.prisma.like.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              bio: true,
              image: true,
            },
          },
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.like.count({ where: { userId } }),
    ]);

    return {
      likes: likes.map((like) => ({
        id: like.id,
        createdAt: like.createdAt,
        user: like.user,
        article: like.article,
      })),
      total,
      page,
      limit,
    };
  }

  async getLikeStats(articleId: number, userId?: number): Promise<LikeStats> {
    // Check if article exists
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const [likesCount, isLiked] = await Promise.all([
      this.prisma.like.count({ where: { articleId } }),
      userId
        ? this.prisma.like
            .findUnique({
              where: {
                articleId_userId: {
                  articleId,
                  userId,
                },
              },
            })
            .then((like) => !!like)
        : Promise.resolve(false),
    ]);

    return {
      likesCount,
      isLiked,
    };
  }

  async isLiked(
    userId: number,
    articleId: number,
  ): Promise<{ isLiked: boolean }> {
    const like = await this.prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    return { isLiked: !!like };
  }

  async toggleLike(
    userId: number,
    articleId: number,
  ): Promise<{ message: string; isLiked: boolean }> {
    // Check if article exists
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if already liked
    const existingLike = await this.prisma.like.findUnique({
      where: {
        articleId_userId: {
          articleId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await this.prisma.like.delete({
        where: {
          articleId_userId: {
            articleId,
            userId,
          },
        },
      });
      return { message: 'Article unliked successfully', isLiked: false };
    } else {
      // Like
      await this.prisma.like.create({
        data: {
          articleId,
          userId,
        },
      });
      return { message: 'Article liked successfully', isLiked: true };
    }
  }

  async getLikedArticles(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<LikeListResponse> {
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [likes, total] = await Promise.all([
      this.prisma.like.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              bio: true,
              image: true,
            },
          },
          article: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.like.count({ where: { userId } }),
    ]);

    return {
      likes: likes.map((like) => ({
        id: like.id,
        createdAt: like.createdAt,
        user: like.user,
        article: like.article,
      })),
      total,
      page,
      limit,
    };
  }
}
