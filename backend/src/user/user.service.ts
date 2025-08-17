import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HashingService } from '../common/hashing/hashing.service';
import { PasswordValidator } from '../common/hashing/password.validator';
import { PrismaService } from '../common/prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateUserDto, CreateUserWithFileDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserWithFileDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly passwordValidator: PasswordValidator,
    private readonly uploadService: UploadService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, username, password, bio, image } = createUserDto;

    // Validate password strength
    const passwordValidation =
      this.passwordValidator.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password validation failed',
        errors: passwordValidation.errors,
        strength: this.passwordValidator.getPasswordStrength(
          passwordValidation.score,
        ),
        suggestion: this.passwordValidator.generatePasswordSuggestion(),
      });
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    // Hash the password
    const hashedPassword = await this.hashingService.hash(password);

    // Create the user
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        bio,
        image,
      },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async createWithFile(createUserDto: CreateUserWithFileDto) {
    const {
      email,
      username,
      password,
      bio,
      image,
      generateThumbnail,
      compress,
    } = createUserDto;

    // Validate password strength
    const passwordValidation =
      this.passwordValidator.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'Password validation failed',
        errors: passwordValidation.errors,
        strength: this.passwordValidator.getPasswordStrength(
          passwordValidation.score,
        ),
        suggestion: this.passwordValidator.generatePasswordSuggestion(),
      });
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    // Hash the password
    const hashedPassword = await this.hashingService.hash(password);

    let imageUrl: string | undefined;

    // Handle image upload if provided
    if (image) {
      const uploadDto = {
        category: 'images',
        folder: 'profile-pictures',
        generateThumbnail: generateThumbnail || true,
        compress: compress || true,
      };

      const uploadResult = await this.uploadService.uploadFile(
        image,
        uploadDto,
      );
      imageUrl = uploadResult.file.url;
    }

    // Create the user
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        bio,
        image: imageUrl,
      },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return users;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Validate password if it's being updated
    if (updateUserDto.password) {
      const passwordValidation = this.passwordValidator.validatePassword(
        updateUserDto.password,
      );
      if (!passwordValidation.isValid) {
        throw new BadRequestException({
          message: 'Password validation failed',
          errors: passwordValidation.errors,
          strength: this.passwordValidator.getPasswordStrength(
            passwordValidation.score,
          ),
          suggestion: this.passwordValidator.generatePasswordSuggestion(),
        });
      }
    }

    // Check for unique constraints if email or username is being updated
    if (updateUserDto.email || updateUserDto.username) {
      const duplicateUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(updateUserDto.email ? [{ email: updateUserDto.email }] : []),
            ...(updateUserDto.username
              ? [{ username: updateUserDto.username }]
              : []),
          ],
          NOT: { id },
        },
      });

      if (duplicateUser) {
        throw new ConflictException('Email or username already exists');
      }
    }

    // Hash password if it's being updated
    let hashedPassword: string | undefined;
    if (updateUserDto.password) {
      hashedPassword = await this.hashingService.hash(updateUserDto.password);
    }

    // Update the user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async updateWithFile(id: number, updateUserDto: UpdateUserWithFileDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check for unique constraints if email or username is being updated
    if (updateUserDto.email || updateUserDto.username) {
      const duplicateUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(updateUserDto.email ? [{ email: updateUserDto.email }] : []),
            ...(updateUserDto.username
              ? [{ username: updateUserDto.username }]
              : []),
          ],
          NOT: { id },
        },
      });

      if (duplicateUser) {
        throw new ConflictException('Email or username already exists');
      }
    }

    let imageUrl: string | undefined;

    // Handle image upload if provided
    if (updateUserDto.image) {
      const uploadDto = {
        category: 'images',
        folder: 'profile-pictures',
        userId: id,
        generateThumbnail: updateUserDto.generateThumbnail || true,
        compress: updateUserDto.compress || true,
      };

      const uploadResult = await this.uploadService.uploadFile(
        updateUserDto.image,
        uploadDto,
      );
      imageUrl = uploadResult.file.url;
    }

    // Update the user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(updateUserDto.email && { email: updateUserDto.email }),
        ...(updateUserDto.username && { username: updateUserDto.username }),
        ...(updateUserDto.bio && { bio: updateUserDto.bio }),
        ...(imageUrl && { image: imageUrl }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async remove(id: number) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Delete the user
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  /**
   * Verify user password
   */
  async verifyPassword(userId: number, password: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return false;
    }

    return await this.hashingService.compare(password, user.password);
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    // Verify current password
    const isCurrentPasswordValid = await this.verifyPassword(
      userId,
      currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Validate new password
    const passwordValidation =
      this.passwordValidator.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: 'New password validation failed',
        errors: passwordValidation.errors,
        strength: this.passwordValidator.getPasswordStrength(
          passwordValidation.score,
        ),
        suggestion: this.passwordValidator.generatePasswordSuggestion(),
      });
    }

    // Hash new password
    const hashedNewPassword = await this.hashingService.hash(newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Upload user profile image
   */
  async uploadProfileImage(
    userId: number,
    image: Express.Multer.File,
    generateThumbnail?: boolean,
    compress?: boolean,
  ) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Upload the image
    const uploadDto = {
      category: 'images',
      folder: 'profile-pictures',
      userId,
      generateThumbnail: generateThumbnail || true,
      compress: compress || true,
    };

    const uploadResult = await this.uploadService.uploadFile(image, uploadDto);

    // Update user with new image URL
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { image: uploadResult.file.url },
      select: {
        id: true,
        email: true,
        username: true,
        bio: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Profile image uploaded successfully',
      imageUrl: uploadResult.file.url,
      thumbnailUrl: uploadResult.file.thumbnailUrl,
      user: updatedUser,
    };
  }
}
