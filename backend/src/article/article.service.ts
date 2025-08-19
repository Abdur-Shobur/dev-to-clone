import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ArticleQueryDto } from './dto/article-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import {
  ArticleListResponse,
  ArticleResponse,
  ArticleStats,
  CreateArticleResponse,
  DeleteArticleResponse,
  UpdateArticleResponse,
} from './entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  private async ensureUniqueSlug(
    slug: string,
    excludeId?: number,
  ): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existingArticle = await this.prisma.article.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existingArticle || existingArticle.id === excludeId) {
        break;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  async create(
    authorId: number,
    createArticleDto: CreateArticleDto,
  ): Promise<CreateArticleResponse> {
    const {
      title,
      description,
      body,
      published = false,
      tags = [],
    } = createArticleDto;

    // Generate unique slug
    const baseSlug = this.generateSlug(title);
    const slug = await this.ensureUniqueSlug(baseSlug);

    // Create article with tags
    const article = await this.prisma.article.create({
      data: {
        title,
        slug,
        description,
        body,
        published,
        authorId,
        tags: {
          connectOrCreate: tags.map((tagName) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        },
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
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return {
      message: 'Article created successfully',
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        description: article.description,
        body: article.body,
        published: article.published,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        author: article.author,
        tags: article.tags,
        _count: article._count,
      },
    };
  }

  async findAll(
    query: ArticleQueryDto,
    userId?: number,
  ): Promise<ArticleListResponse> {
    const {
      search,
      author,
      tag,
      published,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (published !== undefined) {
      where.published = published;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (author) {
      where.author = {
        username: { contains: author, mode: 'insensitive' },
      };
    }

    if (tag) {
      where.tags = {
        some: {
          name: { contains: tag, mode: 'insensitive' },
        },
      };
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
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
          tags: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.article.count({ where }),
    ]);

    // Check if current user liked each article
    const articlesWithLikeStatus = await Promise.all(
      articles.map(async (article) => {
        let isLiked = false;
        if (userId) {
          const like = await this.prisma.like.findUnique({
            where: {
              articleId_userId: {
                articleId: article.id,
                userId,
              },
            },
          });
          isLiked = !!like;
        }

        return {
          ...article,
          isLiked,
        };
      }),
    );

    return {
      articles: articlesWithLikeStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, userId?: number): Promise<ArticleResponse> {
    const article = await this.prisma.article.findUnique({
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
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if current user liked the article
    let isLiked = false;
    if (userId) {
      const like = await this.prisma.like.findUnique({
        where: {
          articleId_userId: {
            articleId: article.id,
            userId,
          },
        },
      });
      isLiked = !!like;
    }

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      description: article.description,
      body: article.body,
      published: article.published,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      author: article.author,
      tags: article.tags,
      _count: article._count,
      isLiked,
    };
  }

  async findBySlug(slug: string, userId?: number): Promise<ArticleResponse> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
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
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if current user liked the article
    let isLiked = false;
    if (userId) {
      const like = await this.prisma.like.findUnique({
        where: {
          articleId_userId: {
            articleId: article.id,
            userId,
          },
        },
      });
      isLiked = !!like;
    }

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      description: article.description,
      body: article.body,
      published: article.published,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      author: article.author,
      tags: article.tags,
      _count: article._count,
      isLiked,
    };
  }

  async findByAuthor(
    authorId: number,
    userId?: number,
  ): Promise<ArticleListResponse> {
    const articles = await this.prisma.article.findMany({
      where: { authorId },
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
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check if current user liked each article
    const articlesWithLikeStatus = await Promise.all(
      articles.map(async (article) => {
        let isLiked = false;
        if (userId) {
          const like = await this.prisma.like.findUnique({
            where: {
              articleId_userId: {
                articleId: article.id,
                userId,
              },
            },
          });
          isLiked = !!like;
        }

        return {
          ...article,
          isLiked,
        };
      }),
    );

    return {
      articles: articlesWithLikeStatus,
      total: articles.length,
      page: 1,
      limit: articles.length,
      totalPages: 1,
    };
  }

  async update(
    id: number,
    authorId: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<UpdateArticleResponse> {
    const { title, description, body, published, tags } = updateArticleDto;

    // Check if article exists and user is the author
    const existingArticle = await this.prisma.article.findUnique({
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
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!existingArticle) {
      throw new NotFoundException('Article not found');
    }

    if (existingArticle.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own articles');
    }

    // Generate new slug if title changed
    let slug = existingArticle.slug;
    if (title && title !== existingArticle.title) {
      const baseSlug = this.generateSlug(title);
      slug = await this.ensureUniqueSlug(baseSlug, id);
    }

    // Update article
    const updatedArticle = await this.prisma.article.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(body && { body }),
        ...(published !== undefined && { published }),
        ...(tags && {
          tags: {
            set: [],
            connectOrCreate: tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
        }),
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
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return {
      message: 'Article updated successfully',
      article: {
        id: updatedArticle.id,
        title: updatedArticle.title,
        slug: updatedArticle.slug,
        description: updatedArticle.description,
        body: updatedArticle.body,
        published: updatedArticle.published,
        createdAt: updatedArticle.createdAt,
        updatedAt: updatedArticle.updatedAt,
        author: updatedArticle.author,
        tags: updatedArticle.tags,
        _count: updatedArticle._count,
      },
    };
  }

  async remove(id: number, authorId: number): Promise<DeleteArticleResponse> {
    // Check if article exists and user is the author
    const article = await this.prisma.article.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    if (article.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own articles');
    }

    // Delete article (cascade will handle related records)
    await this.prisma.article.delete({
      where: { id },
    });

    return { message: 'Article deleted successfully' };
  }

  async getStats(authorId?: number): Promise<ArticleStats> {
    const where = authorId ? { authorId } : {};

    const [totalArticles, publishedArticles, draftArticles] = await Promise.all(
      [
        this.prisma.article.count({ where }),
        this.prisma.article.count({ where: { ...where, published: true } }),
        this.prisma.article.count({ where: { ...where, published: false } }),
      ],
    );

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
    };
  }

  async getPopularArticles(
    limit: number = 10,
    userId?: number,
  ): Promise<ArticleListResponse> {
    const articles = await this.prisma.article.findMany({
      where: { published: true },
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
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: [
        { likes: { _count: 'desc' } },
        { comments: { _count: 'desc' } },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    // Check if current user liked each article
    const articlesWithLikeStatus = await Promise.all(
      articles.map(async (article) => {
        let isLiked = false;
        if (userId) {
          const like = await this.prisma.like.findUnique({
            where: {
              articleId_userId: {
                articleId: article.id,
                userId,
              },
            },
          });
          isLiked = !!like;
        }

        return {
          ...article,
          isLiked,
        };
      }),
    );

    return {
      articles: articlesWithLikeStatus,
      total: articles.length,
      page: 1,
      limit: articles.length,
      totalPages: 1,
    };
  }
}
