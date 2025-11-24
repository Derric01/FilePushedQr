import crypto from 'crypto';
import argon2 from 'argon2';
import { CONSTANTS } from '../config/constants';

/**
 * Hash sensitive data using SHA-256
 * Used for: IP addresses, owner tokens
 */
export function hashSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Hash passwords using Argon2id (memory-hard, secure)
 * Used for: Optional password protection
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: CONSTANTS.HASH.ARGON2_MEMORY_COST,
    timeCost: CONSTANTS.HASH.ARGON2_TIME_COST,
    parallelism: CONSTANTS.HASH.ARGON2_PARALLELISM,
    hashLength: CONSTANTS.HASH.ARGON2_HASH_LENGTH,
  });
}

/**
 * Verify password against Argon2 hash
 */
export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Generate cryptographically secure random token
 * Used for: owner tokens, share IDs
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Generate a unique share ID (shorter, URL-friendly)
 */
export function generateShareId(): string {
  return crypto.randomBytes(12).toString('base64url'); // ~16 chars
}

/**
 * Generate owner management token (longer, more secure)
 */
export function generateOwnerToken(): string {
  return crypto.randomBytes(32).toString('base64url'); // ~43 chars
}

/**
 * Anonymize IP address for logging
 * Hashes the IP to maintain privacy while allowing duplicate detection
 */
export function anonymizeIP(ip: string): string {
  return hashSHA256(ip + process.env.IP_SALT || 'filepushedqr-salt');
}

/**
 * Generate encryption key metadata (for validation)
 * The actual encryption happens client-side
 */
export function generateKeyMetadata() {
  return {
    algorithm: CONSTANTS.ENCRYPTION.ALGORITHM,
    keyLength: CONSTANTS.ENCRYPTION.KEY_LENGTH,
    ivLength: CONSTANTS.ENCRYPTION.IV_LENGTH,
    tagLength: CONSTANTS.ENCRYPTION.TAG_LENGTH,
  };
}
