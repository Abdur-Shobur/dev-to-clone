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
import { CreateFollowDto } from './dto/create-follow.dto';
import {
  FollowListResponse,
  FollowResponse,
  FollowStats,
} from './entities/follow.entity';
import { FollowService } from './follow.service';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  async followUser(
    @Req() req: any,
    @Body() createFollowDto: CreateFollowDto,
  ): Promise<FollowResponse> {
    return this.followService.followUser(req.user.id, createFollowDto);
  }

  @Delete(':followingId')
  async unfollowUser(
    @Req() req: any,
    @Param('followingId') followingId: string,
  ): Promise<{ message: string }> {
    return this.followService.unfollowUser(req.user.id, +followingId);
  }

  @Get('followers/:userId')
  async getFollowers(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<FollowListResponse> {
    return this.followService.getFollowers(+userId, +page, +limit);
  }

  @Get('following/:userId')
  async getFollowing(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<FollowListResponse> {
    return this.followService.getFollowing(+userId, +page, +limit);
  }

  @Get('stats/:userId')
  async getFollowStats(@Param('userId') userId: string): Promise<FollowStats> {
    return this.followService.getFollowStats(+userId);
  }

  @Get('check/:followingId')
  async isFollowing(
    @Req() req: any,
    @Param('followingId') followingId: string,
  ): Promise<{ isFollowing: boolean }> {
    return this.followService.isFollowing(req.user.id, +followingId);
  }

  @Get('mutual/:userId')
  async getMutualFollowers(
    @Req() req: any,
    @Param('userId') userId: string,
  ): Promise<FollowListResponse> {
    return this.followService.getMutualFollowers(req.user.id, +userId);
  }
}
