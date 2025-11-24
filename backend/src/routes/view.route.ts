import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { storage } from '../services/storage.service';
import { verifyPassword, anonymizeIP } from '../utils/crypto';
import { validateShareId, validateViewRequest, viewLimiter } from '../middleware';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/view/:shareId
 * Retrieve encrypted file for viewing/downloading
 */
router.post('/:shareId', viewLimiter, validateShareId, validateViewRequest, async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;
    const { password } = req.body;

    // Find upload in database
    const upload = await prisma.upload.findUnique({
      where: { shareId },
    });

    if (!upload || upload.isDeleted) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check expiration
    if (new Date() > upload.expiresAt) {
      return res.status(410).json({ error: 'File has expired' });
    }

    // Verify password if required
    if (upload.passwordHash) {
      if (!password) {
        return res.status(401).json({ 
          error: 'Password required',
          passwordProtected: true 
        });
      }

      const isValidPassword = await verifyPassword(upload.passwordHash, password);
      if (!isValidPassword) {
        // Log failed attempt
        await prisma.accessLog.create({
          data: {
            uploadId: upload.id,
            hashedIP: anonymizeIP(req.ip || 'unknown'),
            userAgent: req.get('user-agent'),
            action: 'VIEW',
            success: false,
            errorMessage: 'Invalid password',
          },
        });

        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    // Download encrypted file from storage
    const encryptedData = await storage.downloadFile(upload.encryptedBlob);

    // Update view count and timestamp
    await prisma.upload.update({
      where: { id: upload.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    // Log successful view
    await prisma.accessLog.create({
      data: {
        uploadId: upload.id,
        hashedIP: anonymizeIP(req.ip || 'unknown'),
        userAgent: req.get('user-agent'),
        action: 'VIEW',
        success: true,
      },
    });

    logger.info(`File viewed: ${shareId}`);

    // Return encrypted data and metadata
    res.status(200).json({
      success: true,
      fileName: upload.fileName,
      fileType: upload.fileType,
      fileSize: upload.fileSize.toString(),
      encryptedData: encryptedData.toString('base64'),
      viewCount: upload.viewCount,
      expiresAt: upload.expiresAt.toISOString(),
    });
  } catch (error) {
    logger.error('View error:', error);
    res.status(500).json({ error: 'Failed to retrieve file' });
  }
});

/**
 * GET /api/view/:shareId/info
 * Get file metadata without downloading
 */
router.get('/:shareId/info', viewLimiter, validateShareId, async (req: Request, res: Response) => {
  try {
    const { shareId } = req.params;

    const upload = await prisma.upload.findUnique({
      where: { shareId },
      select: {
        fileName: true,
        fileType: true,
        fileSize: true,
        expiresAt: true,
        viewCount: true,
        passwordHash: true,
        isDeleted: true,
      },
    });

    if (!upload || upload.isDeleted) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (new Date() > upload.expiresAt) {
      return res.status(410).json({ error: 'File has expired' });
    }

    res.status(200).json({
      success: true,
      fileName: upload.fileName,
      fileType: upload.fileType,
      fileSize: upload.fileSize.toString(),
      expiresAt: upload.expiresAt.toISOString(),
      viewCount: upload.viewCount,
      passwordProtected: !!upload.passwordHash,
    });
  } catch (error) {
    logger.error('Info error:', error);
    res.status(500).json({ error: 'Failed to retrieve info' });
  }
});

export default router;
