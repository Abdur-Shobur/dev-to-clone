import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLikeDto } from './dto/create-like.dto';
import {
  CreateLikeResponse,
  DeleteLikeResponse,
  LikeListResponse,
  LikeStats,
} from './entities/like.entity';
import { LikeService } from './like.service';

@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async likeArticle(
    @Req() req: any,
    @Body() createLikeDto: CreateLikeDto,
  ): Promise<CreateLikeResponse> {
    return this.likeService.likeArticle(req.user.id, createLikeDto);
  }

  @Post('toggle/:articleId')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Req() req: any,
    @Param('articleId') articleId: string,
  ): Promise<{ message: string; isLiked: boolean }> {
    return this.likeService.toggleLike(req.user.id, +articleId);
  }

  @Delete(':articleId')
  @UseGuards(JwtAuthGuard)
  async unlikeArticle(
    @Req() req: any,
    @Param('articleId') articleId: string,
  ): Promise<DeleteLikeResponse> {
    return this.likeService.unlikeArticle(req.user.id, +articleId);
  }

  @Get('article/:articleId')
  async getArticleLikes(
    @Param('articleId') articleId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<LikeListResponse> {
    return this.likeService.getArticleLikes(+articleId, +page, +limit);
  }

  @Get('user/:userId')
  async getUserLikes(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<LikeListResponse> {
    return this.likeService.getUserLikes(+userId, +page, +limit);
  }

  @Get('stats/:articleId')
  async getLikeStats(
    @Param('articleId') articleId: string,
    @Req() req: any,
  ): Promise<LikeStats> {
    const userId = req.user?.id;
    return this.likeService.getLikeStats(+articleId, userId);
  }

  @Get('check/:articleId')
  @UseGuards(JwtAuthGuard)
  async isLiked(
    @Req() req: any,
    @Param('articleId') articleId: string,
  ): Promise<{ isLiked: boolean }> {
    return this.likeService.isLiked(req.user.id, +articleId);
  }

  @Get('my-likes')
  @UseGuards(JwtAuthGuard)
  async getMyLikedArticles(
    @Req() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<LikeListResponse> {
    return this.likeService.getLikedArticles(req.user.id, +page, +limit);
  }
}
