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
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {
  CommentListResponse,
  CommentResponse,
  CreateCommentResponse,
  DeleteCommentResponse,
  UpdateCommentResponse,
} from './entities/comment.entity';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CreateCommentResponse> {
    return this.commentService.create(req.user.id, createCommentDto);
  }

  @Get()
  async findAll(
    @Query('articleId') articleId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<CommentListResponse> {
    return this.commentService.findAll(
      articleId ? +articleId : undefined,
      +page,
      +limit,
    );
  }

  @Get('article/:articleId')
  async findByArticle(
    @Param('articleId') articleId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<CommentListResponse> {
    return this.commentService.findByArticle(+articleId, +page, +limit);
  }

  @Get('user/:authorId')
  async getUserComments(
    @Param('authorId') authorId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<CommentListResponse> {
    return this.commentService.getUserComments(+authorId, +page, +limit);
  }

  @Get('count/:articleId')
  async getCommentCount(
    @Param('articleId') articleId: string,
  ): Promise<{ count: number }> {
    return this.commentService.getCommentCount(+articleId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CommentResponse> {
    return this.commentService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<UpdateCommentResponse> {
    return this.commentService.update(+id, req.user.id, updateCommentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Req() req: any,
    @Param('id') id: string,
  ): Promise<DeleteCommentResponse> {
    return this.commentService.remove(+id, req.user.id);
  }
}
