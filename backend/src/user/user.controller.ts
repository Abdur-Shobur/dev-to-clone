import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { CreateUserDto, CreateUserWithFileDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserWithFileDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('with-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          const extension = extname(file.originalname);
          cb(null, `${randomName}${extension}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB for profile images
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async createWithImage(@Body() createUserDto: CreateUserWithFileDto) {
    return this.userService.createWithFile(createUserDto);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get('search')
  async search(
    @Query('email') email?: string,
    @Query('username') username?: string,
  ) {
    if (email) {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        return { message: 'User not found' };
      }
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }

    if (username) {
      const user = await this.userService.findByUsername(username);
      if (!user) {
        return { message: 'User not found' };
      }
      return user;
    }

    return { message: 'Please provide email or username parameter' };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/with-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          const extension = extname(file.originalname);
          cb(null, `${randomName}${extension}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB for profile images
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  async updateWithImage(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserWithFileDto,
  ) {
    return this.userService.updateWithFile(id, updateUserDto);
  }

  @Post(':id/change-password')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.userService.changePassword(
      id,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Post(':id/verify-password')
  async verifyPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { password: string },
  ) {
    const isValid = await this.userService.verifyPassword(id, body.password);
    return { isValid };
  }

  @Post(':id/profile-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          const extension = extname(file.originalname);
          cb(null, `${randomName}${extension}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB for profile images
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  async uploadProfileImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() image: Express.Multer.File,
    @Body() body: { generateThumbnail?: boolean; compress?: boolean },
  ) {
    return this.userService.uploadProfileImage(
      id,
      image,
      body.generateThumbnail,
      body.compress,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
