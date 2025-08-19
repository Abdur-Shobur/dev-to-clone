import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import {
  CreateTagResponse,
  DeleteTagResponse,
  TagListResponse,
  TagResponse,
  TagStats,
  TagWithArticlesResponse,
  UpdateTagResponse,
} from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeTagName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9\s-]/g, '');
  }

  async create(createTagDto: CreateTagDto): Promise<CreateTagResponse> {
    const { name } = createTagDto;
    const normalizedName = this.normalizeTagName(name);

    const existingTag = await this.prisma.tag.findUnique({
      where: { name: normalizedName },
    });

    if (existingTag) {
      throw new ConflictException('Tag already exists');
    }

    const tag = await this.prisma.tag.create({
      data: { name: normalizedName },
    });

    return {
      message: 'Tag created successfully',
      tag: {
        id: tag.id,
        name: tag.name,
        articleCount: 0,
      },
    };
  }

  async findAll(query: TagQueryDto): Promise<TagListResponse> {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const tags = await this.prisma.tag.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: { select: { articles: true } },
      },
      orderBy:
        sortBy === 'articleCount'
          ? { articles: { _count: sortOrder } }
          : { [sortBy]: sortOrder },
    });

    const total = await this.prisma.tag.count({ where });

    return {
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        articleCount: tag._count.articles,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<TagResponse> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return {
      id: tag.id,
      name: tag.name,
      articleCount: tag._count.articles,
    };
  }

  async findByName(name: string): Promise<TagResponse> {
    const normalizedName = this.normalizeTagName(name);

    const tag = await this.prisma.tag.findUnique({
      where: { name: normalizedName },
      include: { _count: { select: { articles: true } } },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return {
      id: tag.id,
      name: tag.name,
      articleCount: tag._count.articles,
    };
  }

  async getArticlesByTag(
    tagName: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<TagWithArticlesResponse> {
    const normalizedName = this.normalizeTagName(tagName);
    const skip = (page - 1) * limit;

    const tag = await this.prisma.tag.findUnique({
      where: { name: normalizedName },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        where: {
          tags: { some: { name: normalizedName } },
          published: true,
        },
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
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.article.count({
        where: { tags: { some: { name: normalizedName } }, published: true },
      }),
    ]);

    return {
      id: tag.id,
      name: tag.name,
      articles: articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        description: a.description,
        author: a.author,
        createdAt: a.createdAt,
        _count: a._count,
      })),
      total,
      page,
      limit,
    };
  }

  async update(
    id: number,
    updateTagDto: UpdateTagDto,
  ): Promise<UpdateTagResponse> {
    const { name } = updateTagDto;

    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });

    if (!existingTag) {
      throw new NotFoundException('Tag not found');
    }

    if (name) {
      const normalizedName = this.normalizeTagName(name);
      const conflict = await this.prisma.tag.findUnique({
        where: { name: normalizedName },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException('Tag name already exists');
      }
    }

    const updated = await this.prisma.tag.update({
      where: { id },
      data: name ? { name: this.normalizeTagName(name) } : {},
      include: { _count: { select: { articles: true } } },
    });

    return {
      message: 'Tag updated successfully',
      tag: {
        id: updated.id,
        name: updated.name,
        articleCount: updated._count.articles,
      },
    };
  }

  async remove(id: number): Promise<DeleteTagResponse> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag._count.articles > 0) {
      throw new BadRequestException(
        `Cannot delete tag "${tag.name}" because it is used by ${tag._count.articles} article(s)`,
      );
    }

    await this.prisma.tag.delete({ where: { id } });

    return { message: 'Tag deleted successfully' };
  }

  async getPopularTags(limit: number = 10): Promise<TagResponse[]> {
    const tags = await this.prisma.tag.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: [{ articles: { _count: 'desc' } }, { name: 'asc' }],
      take: limit,
    });

    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      articleCount: t._count.articles,
    }));
  }

  async getStats(): Promise<TagStats> {
    const [totalTags, mostUsedTags] = await Promise.all([
      this.prisma.tag.count(),
      this.prisma.tag.findMany({
        include: { _count: { select: { articles: true } } },
        orderBy: { articles: { _count: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalTags,
      mostUsedTags: mostUsedTags.map((t) => ({
        name: t.name,
        articleCount: t._count.articles,
      })),
    };
  }

  async searchTags(
    searchTerm: string,
    limit: number = 10,
  ): Promise<TagResponse[]> {
    const tags = await this.prisma.tag.findMany({
      where: {
        name: {
          contains: searchTerm,
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: { articles: true },
        },
      },
      orderBy: [{ articles: { _count: 'desc' } }, { name: 'asc' }],
      take: limit,
    });

    return tags.map((t) => ({
      id: t.id,
      name: t.name,
      articleCount: t._count.articles,
    }));
  }

  async getTagsByArticle(articleId: number): Promise<TagResponse[]> {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        tags: { include: { _count: { select: { articles: true } } } },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article.tags.map((t) => ({
      id: t.id,
      name: t.name,
      articleCount: t._count.articles,
    }));
  }
}
