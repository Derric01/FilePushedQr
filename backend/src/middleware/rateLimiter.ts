import rateLimit from 'express-rate-limit';
import { CONSTANTS } from '../config/constants';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT.MAX_REQUESTS,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for upload endpoint
 */
export const uploadLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT.UPLOAD_MAX_REQUESTS,
  message: 'Upload limit exceeded, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter for view endpoint (more lenient)
 */
export const viewLimiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT.WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT.MAX_REQUESTS * 2, // Allow more views
  message: 'Too many view requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
