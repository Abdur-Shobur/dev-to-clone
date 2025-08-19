import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  CommentListResponse,
  CommentResponse,
  CreateCommentResponse,
  DeleteCommentResponse,
  UpdateCommentResponse,
} from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    authorId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<CreateCommentResponse> {
    const { articleId, body } = createCommentDto;

    // Check if article exists
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, title: true, slug: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Create comment
    const comment = await this.prisma.comment.create({
      data: {
        body,
        articleId,
        authorId,
      },
      include: {
        author: {
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
      message: 'Comment created successfully',
      comment: {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author,
        article: comment.article,
      },
    };
  }

  async findAll(
    articleId?: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<CommentListResponse> {
    const skip = (page - 1) * limit;

    const where = articleId ? { articleId } : {};

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        include: {
          author: {
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
      this.prisma.comment.count({ where }),
    ]);

    return {
      comments: comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author,
        article: comment.article,
      })),
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<CommentResponse> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
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

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author,
      article: comment.article,
    };
  }

  async findByArticle(
    articleId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<CommentListResponse> {
    // Check if article exists
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.findAll(articleId, page, limit);
  }

  async update(
    id: number,
    authorId: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<UpdateCommentResponse> {
    const { body } = updateCommentDto;

    // Check if comment exists
    const existingComment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
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

    if (!existingComment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is the author of the comment
    if (existingComment.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    // Update comment
    const updatedComment = await this.prisma.comment.update({
      where: { id },
      data: { body },
      include: {
        author: {
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
      message: 'Comment updated successfully',
      comment: {
        id: updatedComment.id,
        body: updatedComment.body,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
        author: updatedComment.author,
        article: updatedComment.article,
      },
    };
  }

  async remove(id: number, authorId: number): Promise<DeleteCommentResponse> {
    // Check if comment exists
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is the author of the comment
    if (comment.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // Delete comment
    await this.prisma.comment.delete({
      where: { id },
    });

    return { message: 'Comment deleted successfully' };
  }

  async getUserComments(
    authorId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<CommentListResponse> {
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { authorId },
        skip,
        take: limit,
        include: {
          author: {
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
      this.prisma.comment.count({ where: { authorId } }),
    ]);

    return {
      comments: comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author,
        article: comment.article,
      })),
      total,
      page,
      limit,
    };
  }

  async getCommentCount(articleId: number): Promise<{ count: number }> {
    // Check if article exists
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const count = await this.prisma.comment.count({
      where: { articleId },
    });

    return { count };
  }
}
