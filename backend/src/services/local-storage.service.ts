import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

/**
 * Local filesystem storage service
 * 100% FREE - No cloud costs
 * Perfect for development, demos, and portfolio projects
 */
export class LocalStorage {
  private storageDir: string;

  constructor() {
    // Store uploads in a local directory
    this.storageDir = process.env.LOCAL_STORAGE_PATH || path.join(process.cwd(), 'uploads');
    this.ensureStorageDirectory();
  }

  /**
   * Ensure storage directory exists
   */
  private async ensureStorageDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      logger.info(`Local storage directory ready: ${this.storageDir}`);
    } catch (error) {
      logger.error('Failed to create storage directory:', error);
      throw error;
    }
  }

  /**
   * Upload encrypted file to local storage
   * @param key - Unique storage key (e.g., shareId)
   * @param data - Encrypted file buffer
   * @param contentType - MIME type
   */
  async uploadFile(key: string, data: Buffer, contentType: string): Promise<void> {
    try {
      const filePath = path.join(this.storageDir, key);
      const metadataPath = `${filePath}.meta.json`;

      // Save encrypted file
      await fs.writeFile(filePath, data);

      // Save metadata
      await fs.writeFile(
        metadataPath,
        JSON.stringify({
          contentType,
          encrypted: true,
          uploadedAt: new Date().toISOString(),
          size: data.length,
        })
      );

      logger.info(`File uploaded locally: ${key} (${data.length} bytes)`);
    } catch (error) {
      logger.error('Local storage upload error:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  /**
   * Download encrypted file from local storage
   * @param key - Storage key
   * @returns Encrypted file buffer
   */
  async downloadFile(key: string): Promise<Buffer> {
    try {
      const filePath = path.join(this.storageDir, key);
      const data = await fs.readFile(filePath);
      logger.info(`File downloaded locally: ${key}`);
      return data;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error('File not found');
      }
      logger.error('Local storage download error:', error);
      throw new Error('Failed to download file from storage');
    }
  }

  /**
   * Delete file from local storage
   * @param key - Storage key
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const filePath = path.join(this.storageDir, key);
      const metadataPath = `${filePath}.meta.json`;

      // Delete file and metadata
      await Promise.all([
        fs.unlink(filePath).catch(() => {}),
        fs.unlink(metadataPath).catch(() => {}),
      ]);

      logger.info(`File deleted locally: ${key}`);
    } catch (error) {
      logger.error('Local storage deletion error:', error);
      throw new Error('Failed to delete file from storage');
    }
  }

  /**
   * Check if file exists
   * @param key - Storage key
   * @returns true if file exists
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.storageDir, key);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get presigned URL (not applicable for local storage)
   * Returns local path for debugging
   */
  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const filePath = path.join(this.storageDir, key);
    return `file://${filePath}`;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{ totalFiles: number; totalSize: number }> {
    try {
      const files = await fs.readdir(this.storageDir);
      const dataFiles = files.filter(f => !f.endsWith('.meta.json'));
      
      let totalSize = 0;
      for (const file of dataFiles) {
        const stats = await fs.stat(path.join(this.storageDir, file));
        totalSize += stats.size;
      }

      return {
        totalFiles: dataFiles.length,
        totalSize,
      };
    } catch (error) {
      logger.error('Failed to get storage stats:', error);
      return { totalFiles: 0, totalSize: 0 };
    }
  }
}

// Export singleton instance
export const localStorage = new LocalStorage();
