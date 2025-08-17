import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  UpdateUploadDto,
  UploadFileDto,
  UploadQueryDto,
} from './dto/upload-file.dto';
import {
  MultipleUploadResponse,
  UploadEntity,
  UploadResponse,
} from './entities/upload.entity';
import {
  ALLOWED_FILE_TYPES,
  FILE_CATEGORIES,
  UPLOAD_CONFIG,
  UPLOAD_ERROR_MESSAGES,
  UPLOAD_SUCCESS_MESSAGES,
} from './upload.constants';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), UPLOAD_CONFIG.UPLOAD_DIR);
    this.ensureUploadDirectory();
  }

  /**
   * Upload a single file
   */
  async uploadFile(
    file: Express.Multer.File,
    uploadDto: UploadFileDto,
  ): Promise<UploadResponse> {
    try {
      const fileInfo = await this.processFile(file, uploadDto);

      this.logger.log(`File uploaded successfully: ${fileInfo.filename}`);

      return {
        message: UPLOAD_SUCCESS_MESSAGES.UPLOAD_SUCCESS,
        file: fileInfo,
      };
    } catch (error) {
      this.logger.error(
        `File upload failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException(UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: Express.Multer.File[],
    uploadDto: UploadFileDto,
  ): Promise<MultipleUploadResponse> {
    try {
      const uploadedFiles: UploadEntity[] = [];

      for (const file of files) {
        const fileInfo = await this.processFile(file, uploadDto);
        uploadedFiles.push(fileInfo);
      }

      this.logger.log(`${uploadedFiles.length} files uploaded successfully`);

      return {
        message: UPLOAD_SUCCESS_MESSAGES.UPLOAD_SUCCESS,
        files: uploadedFiles,
        count: uploadedFiles.length,
      };
    } catch (error) {
      this.logger.error(
        `Multiple files upload failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException(UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED);
    }
  }

  /**
   * Get all uploads with pagination and filters
   */
  async getAllUploads(query: UploadQueryDto): Promise<{
    uploads: UploadEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const { category, userId, page = 1, limit = 10 } = query;
      const skip = (page - 1) * limit;

      // In a real application, this would query the database
      // For now, we'll simulate with file system operations
      const uploads = await this.getUploadsFromDirectory();

      let filteredUploads = uploads;

      if (category) {
        filteredUploads = filteredUploads.filter(
          (upload) => upload.category === category,
        );
      }

      if (userId) {
        filteredUploads = filteredUploads.filter(
          (upload) => upload.userId === userId,
        );
      }

      const total = filteredUploads.length;
      const paginatedUploads = filteredUploads.slice(skip, skip + limit);

      return {
        uploads: paginatedUploads,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get uploads: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to retrieve uploads');
    }
  }

  /**
   * Get upload by ID
   */
  async getUploadById(id: number): Promise<UploadEntity> {
    try {
      // In a real application, this would query the database
      // For now, we'll simulate
      const uploads = await this.getUploadsFromDirectory();
      const upload = uploads.find((u) => u.id === id);

      if (!upload) {
        throw new NotFoundException(UPLOAD_ERROR_MESSAGES.FILE_NOT_FOUND);
      }

      return upload;
    } catch (error) {
      this.logger.error(
        `Failed to get upload ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Update upload information
   */
  async updateUpload(
    id: number,
    updateDto: UpdateUploadDto,
  ): Promise<UploadResponse> {
    try {
      const upload = await this.getUploadById(id);

      if (updateDto.filename) {
        await this.renameFile(upload, updateDto.filename);
      }

      if (updateDto.folder || updateDto.category) {
        await this.moveFile(upload, updateDto.folder, updateDto.category);
      }

      const updatedUpload = await this.getUploadById(id);

      return {
        message: UPLOAD_SUCCESS_MESSAGES.UPDATE_SUCCESS,
        file: updatedUpload,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update upload ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException(UPLOAD_ERROR_MESSAGES.UPDATE_FAILED);
    }
  }

  /**
   * Delete upload
   */
  async deleteUpload(id: number): Promise<{ message: string }> {
    try {
      const upload = await this.getUploadById(id);

      // Delete the file from filesystem
      const filePath = path.join(this.uploadDir, upload.path);
      await fs.unlink(filePath);

      // Delete thumbnail if exists
      if (upload.thumbnailUrl) {
        const thumbnailPath = path.join(
          this.uploadDir,
          'thumbnails',
          path.basename(upload.path),
        );
        try {
          await fs.unlink(thumbnailPath);
        } catch (error) {
          this.logger.warn(
            `Failed to delete thumbnail: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      // In a real application, delete from database
      this.logger.log(`Upload deleted successfully: ${upload.filename}`);

      return { message: UPLOAD_SUCCESS_MESSAGES.DELETE_SUCCESS };
    } catch (error) {
      this.logger.error(
        `Failed to delete upload ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException(UPLOAD_ERROR_MESSAGES.DELETE_FAILED);
    }
  }

  /**
   * Process uploaded file
   */
  private async processFile(
    file: Express.Multer.File,
    uploadDto: UploadFileDto,
  ): Promise<UploadEntity> {
    const category = this.determineFileCategory(file.mimetype);
    const extension = path.extname(file.originalname);
    const filename = this.generateFilename(extension);
    const folderPath = this.generateFolderPath(category, uploadDto.folder);
    const filePath = path.join(folderPath, filename);

    // Ensure directory exists
    await this.ensureDirectoryExists(folderPath);

    // Move file to destination
    await fs.rename(file.path, filePath);

    // Generate thumbnail if requested and file is image
    let thumbnailUrl: string | undefined;
    if (uploadDto.generateThumbnail && category === FILE_CATEGORIES.IMAGES) {
      thumbnailUrl = await this.generateThumbnail(filePath, filename);
    }

    // Compress image if requested
    if (uploadDto.compress && category === FILE_CATEGORIES.IMAGES) {
      await this.compressImage(filePath);
    }

    const uploadEntity: UploadEntity = {
      id: Date.now(), // In real app, this would be from database
      originalName: file.originalname,
      filename,
      path: path.relative(this.uploadDir, filePath),
      url: this.generateFileUrl(path.relative(this.uploadDir, filePath)),
      mimetype: file.mimetype,
      size: file.size,
      category,
      extension,
      thumbnailUrl,
      userId: uploadDto.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return uploadEntity;
  }

  /**
   * Determine file category based on MIME type
   */
  private determineFileCategory(mimetype: string): string {
    for (const [category, types] of Object.entries(ALLOWED_FILE_TYPES)) {
      if (Object.keys(types).includes(mimetype)) {
        return category.toLowerCase();
      }
    }
    return FILE_CATEGORIES.OTHER;
  }

  /**
   * Generate unique filename
   */
  private generateFilename(extension: string): string {
    const uuid = uuidv4();
    const timestamp = Date.now();
    return `${uuid}-${timestamp}${extension}`;
  }

  /**
   * Generate folder path based on organization strategy
   */
  private generateFolderPath(category: string, customFolder?: string): string {
    const basePath = path.join(this.uploadDir, category);

    if (customFolder) {
      return path.join(basePath, customFolder);
    }

    // Organize by date
    if (UPLOAD_CONFIG.ORGANIZE_BY === 'date') {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return path.join(basePath, String(year), month, day);
    }

    return basePath;
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadDir}`);
    }
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Generate file URL
   */
  private generateFileUrl(filePath: string): string {
    const baseUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    return `${baseUrl}/${UPLOAD_CONFIG.UPLOAD_DIR}/${filePath}`;
  }

  /**
   * Generate thumbnail for image
   */
  private async generateThumbnail(
    filePath: string,
    filename: string,
  ): Promise<string> {
    // In a real implementation, you would use a library like sharp or jimp
    // For now, we'll just return a placeholder
    const thumbnailDir = path.join(this.uploadDir, 'thumbnails');
    await this.ensureDirectoryExists(thumbnailDir);

    // Simulate thumbnail generation
    const thumbnailPath = path.join(thumbnailDir, `thumb_${filename}`);
    await fs.copyFile(filePath, thumbnailPath);

    return this.generateFileUrl(path.relative(this.uploadDir, thumbnailPath));
  }

  /**
   * Compress image
   */
  private async compressImage(filePath: string): Promise<void> {
    // In a real implementation, you would use a library like sharp or jimp
    // For now, we'll just log the action
    this.logger.log(`Compressing image: ${filePath}`);
  }

  /**
   * Rename file
   */
  private async renameFile(
    upload: UploadEntity,
    newFilename: string,
  ): Promise<void> {
    const oldPath = path.join(this.uploadDir, upload.path);
    const newPath = path.join(
      this.uploadDir,
      upload.path.replace(upload.filename, newFilename),
    );

    await fs.rename(oldPath, newPath);
  }

  /**
   * Move file to different folder/category
   */
  private async moveFile(
    upload: UploadEntity,
    newFolder?: string,
    newCategory?: string,
  ): Promise<void> {
    const oldPath = path.join(this.uploadDir, upload.path);
    const category = newCategory || upload.category;
    const folderPath = this.generateFolderPath(category, newFolder);
    const newPath = path.join(folderPath, upload.filename);

    await this.ensureDirectoryExists(folderPath);
    await fs.rename(oldPath, newPath);
  }

  /**
   * Get uploads from directory (simulation for demo)
   */
  private async getUploadsFromDirectory(): Promise<UploadEntity[]> {
    // This is a simulation - in a real app, you'd query the database
    return [];
  }
}
