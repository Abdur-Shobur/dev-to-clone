import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ArticleService } from './article.service';
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

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: any,
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<CreateArticleResponse> {
    return this.articleService.create(req.user.id, createArticleDto);
  }

  @Get()
  async findAll(
    @Query() query: ArticleQueryDto,
    @Req() req: any,
  ): Promise<ArticleListResponse> {
    const userId = req.user?.id;
    return this.articleService.findAll(query, userId);
  }

  @Get('popular')
  async getPopularArticles(
    @Query('limit') limit: string = '10',
    @Req() req: any,
  ): Promise<ArticleListResponse> {
    const userId = req.user?.id;
    return this.articleService.getPopularArticles(+limit, userId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Req() req: any): Promise<ArticleStats> {
    return this.articleService.getStats(req.user.id);
  }

  @Get('my-articles')
  @UseGuards(JwtAuthGuard)
  async getMyArticles(@Req() req: any): Promise<ArticleListResponse> {
    return this.articleService.findByAuthor(req.user.id, req.user.id);
  }

  @Get('author/:authorId')
  async getAuthorArticles(
    @Param('authorId') authorId: string,
    @Req() req: any,
  ): Promise<ArticleListResponse> {
    const userId = req.user?.id;
    return this.articleService.findByAuthor(+authorId, userId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<ArticleResponse> {
    const userId = req.user?.id;
    return this.articleService.findOne(+id, userId);
  }

  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Req() req: any,
  ): Promise<ArticleResponse> {
    const userId = req.user?.id;
    return this.articleService.findBySlug(slug, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<UpdateArticleResponse> {
    return this.articleService.update(+id, req.user.id, updateArticleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<DeleteArticleResponse> {
    return this.articleService.remove(+id, req.user.id);
  }
}
