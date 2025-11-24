import { logger } from '../utils/logger';
import { LocalStorage } from './local-storage.service';

/**
 * Storage interface for local filesystem storage
 * Optimized for Render deployment with persistent disk
 */
export interface IStorage {
  uploadFile(key: string, data: Buffer, contentType: string): Promise<void>;
  downloadFile(key: string): Promise<Buffer>;
  deleteFile(key: string): Promise<void>;
  fileExists(key: string): Promise<boolean>;
  getPresignedUrl(key: string, expiresIn?: number): Promise<string>;
}

// Use local storage (works perfectly on Render with persistent disk)
const localStorage = new LocalStorage();

/**
 * Export storage instance - uses local filesystem
 * Perfect for Render deployment!
 */
export const storage: IStorage = localStorage;

// Log storage type on initialization
logger.info('Using local filesystem storage (optimized for Render)');
