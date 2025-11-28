/**
 * Client-side AES-256-GCM encryption using Web Crypto API
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM

/**
 * Generate a random 256-bit encryption key
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Convert array buffer to URL-safe base64 string
 */
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Convert to base64 and make URL-safe
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Convert URL-safe base64 string to array buffer
 */
function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
  // Convert URL-safe base64 back to regular base64
  let base64 = base64Url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  // Add padding if needed
  while (base64.length % 4) {
    base64 += '=';
  }
  
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Export key to URL-safe base64 string (for URL fragment)
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64Url(exported);
}

/**
 * Import key from URL-safe base64 string
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
  try {
    const keyData = base64UrlToArrayBuffer(keyString);
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: ALGORITHM, length: KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    throw new Error('Invalid encryption key format. The link may be corrupted.');
  }
}

/**
 * Encrypt file using AES-256-GCM
 * @param file - File to encrypt
 * @param key - Encryption key
 * @returns Encrypted data with IV prepended
 */
export async function encryptFile(
  file: File,
  key: CryptoKey
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Read file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // Encrypt
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv: iv,
    },
    key,
    fileBuffer
  );

  return { encryptedData, iv };
}

/**
 * Decrypt file using AES-256-GCM
 * @param encryptedData - Encrypted data (without IV)
 * @param iv - Initialization vector
 * @param key - Decryption key
 * @returns Decrypted file data
 */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  iv: Uint8Array,
  key: CryptoKey
): Promise<ArrayBuffer> {
  try {
    return await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv,
      },
      key,
      encryptedData
    );
  } catch (error) {
    throw new Error('Decryption failed. Invalid key or corrupted data.');
  }
}

/**
 * Combine encrypted data and IV for storage
 */
export function combineIVAndData(iv: Uint8Array, data: ArrayBuffer): Uint8Array {
  const combined = new Uint8Array(iv.length + data.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(data), iv.length);
  return combined;
}

/**
 * Extract IV and data from combined buffer
 */
export function extractIVAndData(combined: Uint8Array): {
  iv: Uint8Array;
  data: ArrayBuffer;
} {
  const iv = combined.slice(0, IV_LENGTH);
  const data = combined.slice(IV_LENGTH);
  return { iv, data: data.buffer };
}

/**
 * Convert ArrayBuffer to Base64
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
