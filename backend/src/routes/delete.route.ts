import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { storage } from '../services/storage.service';
import { hashSHA256, anonymizeIP } from '../utils/crypto';
import { validateOwnerToken } from '../middleware';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * DELETE /api/delete/:token
 * Delete upload before expiration using owner token
 */
router.delete('/:token', validateOwnerToken, async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const hashedToken = hashSHA256(token);

    // Find upload by hashed owner token
    const upload = await prisma.upload.findUnique({
      where: { ownerToken: hashedToken },
    });

    if (!upload || upload.isDeleted) {
      return res.status(404).json({ error: 'File not found or already deleted' });
    }

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

    // Log deletion
    await prisma.accessLog.create({
      data: {
        uploadId: upload.id,
        hashedIP: anonymizeIP(req.ip || 'unknown'),
        userAgent: req.get('user-agent'),
        action: 'DELETE',
        success: true,
      },
    });

    logger.info(`File deleted by owner: ${upload.shareId}`);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    logger.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

/**
 * GET /api/delete/:token/info
 * Get upload info using owner token (for management UI)
 */
router.get('/:token/info', validateOwnerToken, async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const hashedToken = hashSHA256(token);

    const upload = await prisma.upload.findUnique({
      where: { ownerToken: hashedToken },
      select: {
        shareId: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        expiresAt: true,
        viewCount: true,
        createdAt: true,
        isDeleted: true,
        passwordHash: true,
      },
    });

    if (!upload) {
      return res.status(404).json({ error: 'File not found' });
    }

    const shareUrl = `${process.env.FRONTEND_URL}/view/${upload.shareId}`;

    res.status(200).json({
      success: true,
      shareId: upload.shareId,
      shareUrl,
      fileName: upload.fileName,
      fileType: upload.fileType,
      fileSize: upload.fileSize.toString(),
      expiresAt: upload.expiresAt.toISOString(),
      createdAt: upload.createdAt.toISOString(),
      viewCount: upload.viewCount,
      isDeleted: upload.isDeleted,
      passwordProtected: !!upload.passwordHash,
    });
  } catch (error) {
    logger.error('Info error:', error);
    res.status(500).json({ error: 'Failed to retrieve info' });
  }
});

export default router;
