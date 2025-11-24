import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { storage } from '../services/storage.service';
import { logger } from '../utils/logger';
import { CONSTANTS } from '../config/constants';

const prisma = new PrismaClient();

/**
 * Cleanup expired files from database and R2 storage
 */
export async function cleanupExpiredFiles() {
  try {
    logger.info('🧹 Starting cleanup job...');

    // Find all expired files that haven't been deleted
    const expiredUploads = await prisma.upload.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        isDeleted: false,
      },
    });

    logger.info(`Found ${expiredUploads.length} expired files`);

    let successCount = 0;
    let failCount = 0;

    // Delete each expired file
    for (const upload of expiredUploads) {
      try {
        // Delete from storage
        await storage.deleteFile(upload.encryptedBlob);

        // Mark as deleted in database
        await prisma.upload.update({
          where: { id: upload.id },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        });

        successCount++;
        logger.info(`Deleted expired file: ${upload.shareId}`);
      } catch (error) {
        failCount++;
        logger.error(`Failed to delete file ${upload.shareId}:`, error);
      }
    }

    // Update system metrics
    await prisma.systemMetrics.create({
      data: {
        expiredFilesDeleted: successCount,
        lastCleanupRun: new Date(),
        totalUploads: await prisma.upload.count(),
        activeUploads: await prisma.upload.count({
          where: { isDeleted: false },
        }),
      },
    });

    logger.info(`✅ Cleanup completed: ${successCount} deleted, ${failCount} failed`);
  } catch (error) {
    logger.error('Cleanup job error:', error);
  }
}

/**
 * Start the cleanup cron job
 */
export function startCleanupJob() {
  // Run every 6 hours
  cron.schedule(CONSTANTS.CLEANUP_CRON, async () => {
    await cleanupExpiredFiles();
  });

  logger.info(`Cleanup job scheduled: ${CONSTANTS.CLEANUP_CRON}`);
}
