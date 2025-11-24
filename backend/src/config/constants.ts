export const CONSTANTS = {
  // File Upload Limits
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB in bytes
  MAX_EXPIRY_DAYS: 5,
  MIN_EXPIRY_MINUTES: 5,

  // Supported MIME Types (Comprehensive list including PDFs and documents)
  ALLOWED_MIME_TYPES: [
    // Text
    'text/plain',
    'text/html',
    'text/css',
    'text/javascript',
    'text/markdown',
    'text/csv',
    
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
    'audio/flac',
    
    // Documents - PDF
    'application/pdf',
    
    // Documents - Microsoft Office
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    
    // Documents - OpenOffice/LibreOffice
    'application/vnd.oasis.opendocument.text', // .odt
    'application/vnd.oasis.opendocument.spreadsheet', // .ods
    'application/vnd.oasis.opendocument.presentation', // .odp
    
    // Documents - Rich Text
    'application/rtf',
    
    // Archives
    'application/zip',
    'application/x-7z-compressed',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/gzip',
    
    // Code/Data
    'application/json',
    'application/xml',
    'text/xml',
    'application/x-yaml',
    
    // Other common types
    'application/octet-stream', // Generic binary
  ],

  // File Categories for UI display
  FILE_CATEGORIES: {
    text: ['text/plain', 'text/html', 'text/markdown', 'text/csv'],
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    video: ['video/mp4', 'video/mpeg', 'video/webm', 'video/quicktime'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.text',
      'application/rtf',
    ],
    archive: ['application/zip', 'application/x-7z-compressed', 'application/x-rar-compressed'],
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    UPLOAD_MAX_REQUESTS: 20, // Stricter for uploads
  },

  // Encryption
  ENCRYPTION: {
    ALGORITHM: 'AES-256-GCM',
    KEY_LENGTH: 256,
    IV_LENGTH: 12, // 96 bits for GCM
    TAG_LENGTH: 16, // 128 bits authentication tag
  },

  // Hashing
  HASH: {
    ARGON2_TIME_COST: 3,
    ARGON2_MEMORY_COST: 65536, // 64 MB
    ARGON2_PARALLELISM: 4,
    ARGON2_HASH_LENGTH: 32,
  },

  // Cleanup Job
  CLEANUP_CRON: '*/30 * * * *', // Every 30 minutes for faster cleanup

  // URLs
  SHARE_URL_BASE: process.env.FRONTEND_URL || 'http://localhost:3000',
} as const;
