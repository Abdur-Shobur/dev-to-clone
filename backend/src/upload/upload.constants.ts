export const UPLOAD_CONFIG = {
  // File size limits (in bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_COUNT: 10,
  
  // Upload directory
  UPLOAD_DIR: 'uploads',
  
  // File organization
  ORGANIZE_BY: 'date', // 'date' | 'type' | 'user'
  
  // Thumbnail settings
  THUMBNAIL_ENABLED: true,
  THUMBNAIL_SIZE: { width: 200, height: 200 },
  
  // Compression settings
  COMPRESSION_ENABLED: true,
  COMPRESSION_QUALITY: 80,
} as const;

export const ALLOWED_FILE_TYPES = {
  // Images
  IMAGES: {
    'image/jpeg': '.jpg,.jpeg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
  },
  
  // Documents
  DOCUMENTS: {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/plain': '.txt',
  },
  
  // Videos
  VIDEOS: {
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogv',
    'video/avi': '.avi',
    'video/mov': '.mov',
  },
  
  // Audio
  AUDIO: {
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'audio/mp4': '.m4a',
  },
  
  // Archives
  ARCHIVES: {
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z',
    'application/gzip': '.gz',
  },
} as const;

export const FILE_CATEGORIES = {
  IMAGES: 'images',
  DOCUMENTS: 'documents',
  VIDEOS: 'videos',
  AUDIO: 'audio',
  ARCHIVES: 'archives',
  OTHER: 'other',
} as const;

export const UPLOAD_ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size',
  INVALID_FILE_TYPE: 'File type is not allowed',
  TOO_MANY_FILES: 'Too many files uploaded at once',
  UPLOAD_FAILED: 'File upload failed',
  FILE_NOT_FOUND: 'File not found',
  DELETE_FAILED: 'File deletion failed',
  UPDATE_FAILED: 'File update failed',
} as const;

export const UPLOAD_SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: 'File uploaded successfully',
  DELETE_SUCCESS: 'File deleted successfully',
  UPDATE_SUCCESS: 'File updated successfully',
} as const;
