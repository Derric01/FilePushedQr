import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CONSTANTS } from '../config/constants';

/**
 * Validate file upload request
 */
export const validateUploadRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uploadSchema = z.object({
    fileName: z.string().min(1).max(255),
    fileType: z.string().refine(
      (type) => CONSTANTS.ALLOWED_MIME_TYPES.includes(type as any),
      { message: 'Unsupported file type' }
    ),
    fileSize: z.string().transform(Number).pipe(z.number().positive().max(CONSTANTS.MAX_FILE_SIZE)),
    expiresIn: z.string().transform(Number).pipe(z.number()
      .min(CONSTANTS.MIN_EXPIRY_MINUTES)
      .max(CONSTANTS.MAX_EXPIRY_DAYS * 24 * 60)), // in minutes
    password: z.string().optional(),
  });

  try {
    const validated = uploadSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
    next(error);
  }
};

/**
 * Validate view request with optional password
 */
export const validateViewRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const viewSchema = z.object({
    password: z.string().optional(),
  });

  try {
    const validated = viewSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors,
      });
    }
    next(error);
  }
};

/**
 * Validate share ID parameter
 */
export const validateShareId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { shareId } = req.params;

  if (!shareId || shareId.length < 10) {
    return res.status(400).json({
      error: 'Invalid share ID',
    });
  }

  next();
};

/**
 * Validate owner token
 */
export const validateOwnerToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.params;

  if (!token || token.length < 20) {
    return res.status(400).json({
      error: 'Invalid owner token',
    });
  }

  next();
};
