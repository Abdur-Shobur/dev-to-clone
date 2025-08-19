import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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
import { TagService } from './tag.service';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  async create(@Body() createTagDto: CreateTagDto): Promise<CreateTagResponse> {
    return this.tagService.create(createTagDto);
  }

  @Get()
  async findAll(@Query() query: TagQueryDto): Promise<TagListResponse> {
    return this.tagService.findAll(query);
  }

  @Get('popular')
  async getPopularTags(
    @Query('limit') limit: string = '10',
  ): Promise<TagResponse[]> {
    return this.tagService.getPopularTags(+limit);
  }

  @Get('stats')
  async getStats(): Promise<TagStats> {
    return this.tagService.getStats();
  }

  @Get('search')
  async searchTags(
    @Query('q') searchTerm: string,
    @Query('limit') limit: string = '10',
  ): Promise<TagResponse[]> {
    return this.tagService.searchTags(searchTerm, +limit);
  }

  @Get('article/:articleId')
  async getTagsByArticle(
    @Param('articleId') articleId: string,
  ): Promise<TagResponse[]> {
    return this.tagService.getTagsByArticle(+articleId);
  }

  @Get('articles/:tagName')
  async getArticlesByTag(
    @Param('tagName') tagName: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<TagWithArticlesResponse> {
    return this.tagService.getArticlesByTag(tagName, +page, +limit);
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string): Promise<TagResponse> {
    return this.tagService.findByName(name);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TagResponse> {
    return this.tagService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<UpdateTagResponse> {
    return this.tagService.update(+id, updateTagDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<DeleteTagResponse> {
    return this.tagService.remove(+id);
  }
}
