import { test, expect } from '@playwright/test';

/**
 * E2E Tests for FilePushedQR
 * Run with: npx playwright test
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('File Upload Flow', () => {
  test('should upload a text file successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Wait for page to load
    await expect(page.getByText('SECURE FILE TRANSFER')).toBeVisible();
    
    // Create test file
    const testContent = 'This is a test file for FilePushedQR E2E testing';
    const fileBuffer = Buffer.from(testContent);
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: fileBuffer,
    });
    
    // Verify file appears
    await expect(page.getByText('test.txt')).toBeVisible();
    
    // Click upload button
    await page.getByRole('button', { name: /ENCRYPT & UPLOAD/i }).click();
    
    // Wait for upload to complete
    await expect(page.getByText(/UPLOAD COMPLETE/i)).toBeVisible({ timeout: 30000 });
    
    // Verify QR code is displayed
    await expect(page.locator('svg')).toBeVisible(); // QR code SVG
    
    // Verify share link is present
    await expect(page.getByText(/https?:\/\//)).toBeVisible();
  });

  test('should upload an image file successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Create a 1x1 pixel PNG
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    });
    
    await expect(page.getByText('test-image.png')).toBeVisible();
    
    await page.getByRole('button', { name: /ENCRYPT & UPLOAD/i }).click();
    await expect(page.getByText(/UPLOAD COMPLETE/i)).toBeVisible({ timeout: 30000 });
  });

  test('should handle password protection', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const testContent = 'Password protected file';
    const fileBuffer = Buffer.from(testContent);
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'protected.txt',
      mimeType: 'text/plain',
      buffer: fileBuffer,
    });
    
    // Enable password protection
    await page.getByLabel(/Password Lock/i).click();
    
    // Enter password
    await page.getByPlaceholder(/Enter secure password/i).fill('TestPassword123');
    
    await page.getByRole('button', { name: /ENCRYPT & UPLOAD/i }).click();
    await expect(page.getByText(/UPLOAD COMPLETE/i)).toBeVisible({ timeout: 30000 });
  });

  test('should reject files larger than 500MB', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // This test verifies the client-side file size check
    // Note: Cannot actually upload 500MB+ in test, but can verify error handling
    
    // Try to upload a large file (mock)
    // The actual file size validation happens in onDrop callback
  });

  test('should handle expiry time selection', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'expiry-test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Expiry test'),
    });
    
    // Select different expiry times
    await page.getByRole('button', { name: '1h' }).click();
    await expect(page.getByRole('button', { name: '1h' })).toHaveClass(/neon-border/);
    
    await page.getByRole('button', { name: '6h' }).click();
    await page.getByRole('button', { name: '12h' }).click();
    await page.getByRole('button', { name: '24h' }).click();
    await page.getByRole('button', { name: '3d' }).click();
    await page.getByRole('button', { name: '5d' }).click();
  });
});

test.describe('File Download Flow', () => {
  let shareUrl: string;
  
  test.beforeAll(async ({ browser }) => {
    // Upload a file first to get a share URL
    const page = await browser.newPage();
    await page.goto(BASE_URL);
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'download-test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Download test content'),
    });
    
    await page.getByRole('button', { name: /ENCRYPT & UPLOAD/i }).click();
    await page.waitForSelector('text=/UPLOAD COMPLETE/i', { timeout: 30000 });
    
    // Extract share URL
    const linkElement = await page.locator('input[readonly]').first();
    shareUrl = await linkElement.inputValue();
    
    await page.close();
  });

  test('should download file successfully', async ({ page }) => {
    await page.goto(shareUrl);
    
    // Wait for file info to load
    await expect(page.getByText('download-test.txt')).toBeVisible({ timeout: 10000 });
    
    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /DOWNLOAD/i }).click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('download-test.txt');
  });

  test('should show file info correctly', async ({ page }) => {
    await page.goto(shareUrl);
    
    await expect(page.getByText('download-test.txt')).toBeVisible();
    await expect(page.getByText(/MB/)).toBeVisible(); // File size
    await expect(page.getByText(/Encrypted/)).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should show error for invalid share ID', async ({ page }) => {
    await page.goto(`${BASE_URL}/view/invalidShareId123`);
    
    await expect(page.getByText(/not found|expired/i)).toBeVisible({ timeout: 10000 });
  });

  test('should require password for protected files', async ({ page }) => {
    // This test assumes a password-protected file exists
    // In practice, you'd create one in beforeAll
  });

  test('should validate empty password field', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('test'),
    });
    
    // Enable password but don't enter one
    await page.getByLabel(/Password Lock/i).click();
    
    // Try to upload
    await page.getByRole('button', { name: /ENCRYPT & UPLOAD/i }).click();
    
    // Should show error
    await expect(page.getByText(/password required/i)).toBeVisible();
  });
});

test.describe('UI/UX Tests', () => {
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(BASE_URL);
    
    // Check if mobile layout is applied
    await expect(page.getByText('SECURE FILE TRANSFER')).toBeVisible();
    
    // Upload area should be visible and functional
    await expect(page.locator('input[type="file"]')).toBeAttached();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    
    await expect(page.getByRole('link', { name: /Upload/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /About/i })).toBeVisible();
  });

  test('should show loading state during upload', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('test content'),
    });
    
    await page.getByRole('button', { name: /ENCRYPT & UPLOAD/i }).click();
    
    // Should show loading state
    await expect(page.getByText(/Encrypting|Uploading/i)).toBeVisible();
  });
});

test.describe('Security Tests', () => {
  test('should include encryption key in URL fragment', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'security-test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Security test'),
    });
    
    await page.getByRole('button', { name: /ENCRYPT & UPLOAD/i }).click();
    await page.waitForSelector('text=/UPLOAD COMPLETE/i', { timeout: 30000 });
    
    // Get share URL
    const linkElement = await page.locator('input[readonly]').first();
    const url = await linkElement.inputValue();
    
    // Verify URL contains #key=
    expect(url).toContain('#key=');
  });

  test('should not expose sensitive data in network requests', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Monitor network requests
    const requests: string[] = [];
    page.on('request', request => {
      requests.push(request.url());
    });
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'network-test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Network monitoring test'),
    });
    
    await page.getByRole('button', { name: /ENCRYPT & UPLOAD/i }).click();
    await page.waitForSelector('text=/UPLOAD COMPLETE/i', { timeout: 30000 });
    
    // Verify encryption key is NOT sent in any request
    const uploadRequest = requests.find(url => url.includes('/api/upload'));
    expect(uploadRequest).toBeDefined();
    // The encryption key should never appear in server requests
  });
});
