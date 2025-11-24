import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { storage } from '../services/storage.service';
import { 
  generateShareId, 
  generateOwnerToken, 
  hashSHA256, 
  hashPassword,
  anonymizeIP 
} from '../utils/crypto';
import { validateUploadRequest, uploadLimiter } from '../middleware';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/upload
 * Upload encrypted file and create share link
 */
router.post('/', uploadLimiter, validateUploadRequest, async (req: Request, res: Response) => {
  try {
    const { fileName, fileType, fileSize, expiresIn, password } = req.body;
    
    // Get encrypted file from request
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Generate unique identifiers
    const shareId = generateShareId();
    const ownerToken = generateOwnerToken();
    const hashedOwnerToken = hashSHA256(ownerToken);

    // Calculate expiry
    const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);

    // Hash password if provided
    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    // Upload encrypted blob to storage
    await storage.uploadFile(shareId, req.file.buffer, fileType);

    // Store metadata in database
    const upload = await prisma.upload.create({
      data: {
        fileName,
        fileType,
        fileSize: BigInt(fileSize),
        encryptedBlob: shareId, // R2 key
        shareId,
        ownerToken: hashedOwnerToken,
        passwordHash,
        expiresAt,
      },
    });

    // Log upload event (anonymized)
    await prisma.accessLog.create({
      data: {
        uploadId: upload.id,
        hashedIP: anonymizeIP(req.ip || 'unknown'),
        userAgent: req.get('user-agent'),
        action: 'UPLOAD',
        success: true,
      },
    });

    logger.info(`File uploaded: ${shareId}`);

    // Return share URL and owner token
    const shareUrl = `${process.env.FRONTEND_URL}/view/${shareId}`;
    const manageUrl = `${process.env.FRONTEND_URL}/manage/${ownerToken}`;

    res.status(201).json({
      success: true,
      shareId,
      shareUrl,
      ownerToken, // Send plaintext token to user (only once)
      manageUrl,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
