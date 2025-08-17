# Upload Module

A comprehensive file upload module for NestJS with support for single/multiple file uploads, organized storage, and configurable file types.

## Features

- ✅ **Single & Multiple File Uploads**: Support for both single and multiple file uploads
- ✅ **Configurable File Types**: Easily configurable allowed file types and extensions
- ✅ **Organized Storage**: Files organized by date, category, or custom folders
- ✅ **File Validation**: Comprehensive file type, size, and extension validation
- ✅ **Thumbnail Generation**: Automatic thumbnail generation for images
- ✅ **Image Compression**: Optional image compression for better performance
- ✅ **File Management**: Rename, move, and delete files with organized cleanup
- ✅ **Pagination & Filtering**: Get uploads with pagination and category/user filters
- ✅ **Swagger Documentation**: Complete API documentation
- ✅ **Error Handling**: Comprehensive error handling and logging

## Structure

```
src/upload/
├── dto/                    # Data Transfer Objects
│   └── upload-file.dto.ts
├── entities/               # Entity definitions
│   └── upload.entity.ts
├── guards/                 # Validation guards
│   └── file-validation.guard.ts
├── schemas/                # Schema definitions (if needed)
├── interceptors/           # Custom interceptors (if needed)
├── upload.constants.ts     # Configuration constants
├── upload.service.ts       # Business logic
├── upload.controller.ts    # API endpoints
├── upload.module.ts        # Module configuration
├── index.ts               # Module exports
└── README.md              # This file
```

## Configuration

### File Types Supported

- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, TXT
- **Videos**: MP4, WebM, OGG, AVI, MOV
- **Audio**: MP3, WAV, OGG, M4A
- **Archives**: ZIP, RAR, 7Z, GZ

### File Size Limits

- **Max File Size**: 10MB (configurable)
- **Max Files Count**: 10 files per upload (configurable)

### Storage Organization

Files are organized in the following structure:

```
uploads/
├── images/
│   ├── 2024/
│   │   ├── 01/
│   │   │   ├── 15/
│   │   │   │   ├── uuid-timestamp.jpg
│   │   │   │   └── uuid-timestamp.png
│   │   │   └── 16/
│   │   └── 02/
│   └── profile-pictures/
├── documents/
├── videos/
├── audio/
├── archives/
└── thumbnails/
```

## API Endpoints

### Upload Files

#### Single File Upload

```http
POST /uploads/single
Content-Type: multipart/form-data

file: [binary]
category: images (optional)
folder: profile-pictures (optional)
userId: 1 (optional)
generateThumbnail: true (optional)
compress: true (optional)
```

#### Multiple Files Upload

```http
POST /uploads/multiple
Content-Type: multipart/form-data

files: [binary, binary, ...]
category: images (optional)
folder: gallery (optional)
userId: 1 (optional)
generateThumbnail: true (optional)
compress: true (optional)
```

### File Management

#### Get All Uploads

```http
GET /uploads?category=images&userId=1&page=1&limit=10
```

#### Get Upload by ID

```http
GET /uploads/:id
```

#### Update Upload

```http
PUT /uploads/:id
Content-Type: application/json

{
  "filename": "new-filename.jpg",
  "folder": "new-folder",
  "category": "documents"
}
```

#### Delete Upload

```http
DELETE /uploads/:id
```

#### Validate File

```http
POST /uploads/validate
Content-Type: multipart/form-data

file: [binary]
```

## Usage Examples

### Upload a Profile Picture

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('category', 'images');
formData.append('folder', 'profile-pictures');
formData.append('userId', '1');
formData.append('generateThumbnail', 'true');
formData.append('compress', 'true');

const response = await fetch('/uploads/single', {
  method: 'POST',
  body: formData,
});
```

### Upload Multiple Images

```typescript
const formData = new FormData();
files.forEach((file) => {
  formData.append('files', file);
});
formData.append('category', 'images');
formData.append('folder', 'gallery');
formData.append('generateThumbnail', 'true');

const response = await fetch('/uploads/multiple', {
  method: 'POST',
  body: formData,
});
```

### Get User's Images

```typescript
const response = await fetch(
  '/uploads?category=images&userId=1&page=1&limit=20',
);
const data = await response.json();
```

## Response Format

### Single Upload Response

```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "originalName": "profile.jpg",
    "filename": "abc123-def456.jpg",
    "path": "images/2024/01/15/abc123-def456.jpg",
    "url": "http://localhost:3000/uploads/images/2024/01/15/abc123-def456.jpg",
    "mimetype": "image/jpeg",
    "size": 1024000,
    "category": "images",
    "extension": ".jpg",
    "thumbnailUrl": "http://localhost:3000/uploads/thumbnails/thumb_abc123-def456.jpg",
    "userId": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Multiple Upload Response

```json
{
  "message": "Files uploaded successfully",
  "files": [...],
  "count": 3
}
```

## Configuration Options

### Environment Variables

```env
# App URL for generating file URLs
APP_URL=http://localhost:3000

# Upload directory (optional, defaults to 'uploads')
UPLOAD_DIR=uploads

# Max file size in bytes (optional, defaults to 10MB)
MAX_FILE_SIZE=10485760

# Max files count (optional, defaults to 10)
MAX_FILES_COUNT=10
```

### Custom Configuration

You can modify the `upload.constants.ts` file to customize:

- Allowed file types and extensions
- File size limits
- Storage organization strategy
- Thumbnail settings
- Compression settings

## Dependencies

- `@nestjs/common` - Core NestJS functionality
- `@nestjs/platform-express` - Express platform support
- `@nestjs/swagger` - API documentation
- `multer` - File upload handling
- `uuid` - Unique filename generation
- `class-validator` - Input validation

## Installation

1. Install required dependencies:

```bash
npm install multer uuid
npm install -D @types/multer @types/uuid
```

2. Import the UploadModule in your AppModule:

```typescript
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // ... other imports
    UploadModule,
  ],
})
export class AppModule {}
```

3. Create the uploads directory:

```bash
mkdir uploads
mkdir temp
```

## Security Considerations

- File type validation prevents malicious file uploads
- File size limits prevent DoS attacks
- Unique filenames prevent file overwrites
- Organized storage prevents directory traversal attacks
- Proper error handling prevents information disclosure

## Performance Tips

- Use image compression for large images
- Generate thumbnails for better loading times
- Implement CDN for static file serving
- Use database indexing for upload queries
- Implement file cleanup for temporary files
