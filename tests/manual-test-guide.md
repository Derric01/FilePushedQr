# 🧪 Manual Testing Guide for FilePushedQR

## Test Environment Setup

1. Open browser to http://localhost:3000 (development) or https://filepushedqr.onrender.com (production)
2. Open browser DevTools (F12) → Console tab to check for errors
3. Prepare test files in advance

---

## 📋 Test Cases

### ✅ Test 1: Text File Upload (.txt)

**Steps:**
1. Create a text file with content: "This is a test file for FilePushedQR"
2. Drag and drop the .txt file onto the upload zone
3. Verify file name appears correctly
4. Verify file size is displayed (should be very small, < 1KB)
5. Select expiry time (24h)
6. Click "ENCRYPT & UPLOAD"

**Expected Results:**
- ✅ Upload progress bar shows
- ✅ QR code generates
- ✅ Share link is displayed
- ✅ Console shows no errors
- ✅ File type shows as "text/plain"

**Test Download:**
1. Copy the share URL
2. Open in new incognito window
3. Click "DOWNLOAD FILE"
4. Verify downloaded file contains original text
5. Verify filename matches

---

### ✅ Test 2: Image Upload (.jpg, .png, .gif, .webp)

**Steps:**
1. Take a screenshot or use any image file (< 10MB for quick testing)
2. Upload via drag & drop or click to browse
3. Verify image preview/file name
4. Set expiry to 6 hours
5. Enable "Password Lock"
6. Enter password: `TestPass123!`
7. Upload

**Expected Results:**
- ✅ Upload completes successfully
- ✅ QR code generated
- ✅ Password protection indicator visible

**Test Download:**
1. Scan QR code with phone OR copy link to new browser
2. Verify password prompt appears
3. Enter wrong password → should show error
4. Enter correct password: `TestPass123!`
5. Download and verify image opens correctly

---

### ✅ Test 3: PDF Document Upload

**Steps:**
1. Create or download any PDF file
2. Upload file (up to 100MB supported)
3. Select expiry: 12 hours
4. No password protection
5. Upload

**Expected Results:**
- ✅ PDF uploads without errors
- ✅ File size displayed correctly
- ✅ QR code generates

**Test Download:**
1. Open share link
2. Download file
3. Open PDF in reader
4. Verify content is intact

---

### ✅ Test 4: Video Upload (.mp4, .mov, .avi)

**Steps:**
1. Use a short video file (< 50MB for testing, max 500MB supported)
2. Upload file
3. Set expiry: 72 hours (3 days)
4. Upload

**Expected Results:**
- ✅ Video uploads (may take longer depending on size)
- ✅ Progress bar shows percentage
- ✅ Share link generated

**Test Download:**
1. Open share link
2. Download video
3. Play video in media player
4. Verify video plays correctly with audio

---

### ✅ Test 5: Large File Upload (Testing Limits)

**Steps:**
1. Create or use a file close to 500MB
2. Upload file
3. Monitor progress bar

**Expected Results:**
- ✅ File uploads successfully
- ✅ Progress bar updates smoothly
- ✅ No browser freeze/crash
- ✅ Download works correctly

**Test Rejection:**
1. Try uploading a file > 500MB
2. Should show error: "File too large - Maximum file size is 500MB"

---

### ✅ Test 6: Multiple File Types in Sequence

**Test uploading these file types one after another:**
1. .txt (text file)
2. .pdf (document)
3. .jpg (image)
4. .mp3 (audio - if applicable)
5. .zip (compressed archive)
6. .docx (Word document)
7. .xlsx (Excel spreadsheet)

**Expected Results:**
- ✅ All file types upload successfully
- ✅ Downloads work correctly
- ✅ File integrity maintained

---

### ✅ Test 7: Auto-Delete Timer Verification

**Steps:**
1. Upload a small text file
2. Set expiry to 1 hour
3. Note the expiry time displayed
4. Wait 1 hour + 30 minutes (cleanup runs every 30 min)
5. Try to access the share link

**Expected Results:**
- ✅ After expiry time, file shows "File expired" or "File not found"
- ✅ Download button disabled or removed

---

### ✅ Test 8: Password Protection Edge Cases

**Test 8A: Special Characters in Password**
- Password: `P@ssw0rd!#$%^&*()`
- Upload file
- Verify download with correct password works
- Verify wrong password fails

**Test 8B: Empty Password**
- Enable password protection
- Leave password field empty
- Try to upload
- Should show error: "Password required"

**Test 8C: Very Long Password**
- Password: 50+ characters
- Upload file
- Verify download works

---

### ✅ Test 9: Mobile Responsiveness

**On Mobile Device or Chrome DevTools Mobile View:**

**Test 9A: Upload**
1. Open site on mobile
2. Tap upload area
3. Select file from device
4. Verify UI is touch-friendly
5. Buttons are large enough (44px min)
6. Text is readable

**Test 9B: QR Code Scanning**
1. Upload file on desktop
2. Scan QR code with phone camera
3. Verify link opens correctly
4. Download works on mobile

**Test 9C: Touch Interactions**
- All buttons respond to touch
- No accidental double-taps
- Forms are easy to fill

---

### ✅ Test 10: Browser Compatibility

**Test on Different Browsers:**
1. Chrome/Edge (Chromium)
2. Firefox
3. Safari (Mac/iOS)
4. Mobile browsers (Chrome Mobile, Safari iOS)

**For Each Browser:**
- Upload a file
- Download a file
- Verify encryption/decryption works
- Check console for errors

---

### ✅ Test 11: Network Conditions

**Test 11A: Slow Connection**
1. Chrome DevTools → Network tab → Throttle to "Slow 3G"
2. Upload a 10MB file
3. Verify progress bar works
4. Verify upload completes eventually

**Test 11B: Connection Interruption**
1. Start uploading a large file
2. Disconnect internet midway
3. Verify error handling
4. Reconnect and retry upload

---

### ✅ Test 12: Security & Privacy

**Test 12A: Encryption Key in URL**
1. Upload file
2. Copy share URL
3. Check URL format: `/view/[shareId]#key=[encryptionKey]`
4. Verify key is after `#` (fragment - not sent to server)

**Test 12B: Server-Side Verification**
1. Open browser Network tab
2. Upload a file
3. Check the `/api/upload` request payload
4. Verify file content is encrypted (gibberish, not readable)

**Test 12C: Password Verification**
1. Upload with password
2. Try downloading without password → should fail
3. Try downloading with wrong password → should fail
4. Try downloading with correct password → should work

---

### ✅ Test 13: Error Handling

**Test 13A: Invalid Share Link**
- Visit `/view/invalidShareId123`
- Should show "File not found" error

**Test 13B: Expired File**
- Upload file with 1-hour expiry
- Wait for expiry
- Try to access
- Should show "File expired" error

**Test 13C: Deleted File**
- (If delete functionality exists)
- Delete file using management token
- Try to access share link
- Should show "File not found"

---

### ✅ Test 14: Rate Limiting

**Steps:**
1. Upload 10 files rapidly
2. Continue uploading more files
3. After 100 requests in 15 minutes, should hit rate limit

**Expected Results:**
- ✅ After limit, should show error
- ✅ Wait 15 minutes, uploads work again

---

### ✅ Test 15: UI/UX Verification

**Checklist:**
- [ ] All text is readable (good contrast)
- [ ] Buttons have hover states
- [ ] Loading states show for async operations
- [ ] Error messages are clear and helpful
- [ ] Success messages confirm actions
- [ ] QR code is scannable
- [ ] Copy buttons work (share link, QR download)
- [ ] Animations are smooth (no jank)
- [ ] Dark theme is consistent throughout

---

## 📊 Test Results Template

```
Date: __________
Tester: __________
Environment: [ ] Local  [ ] Production

| Test Case | Status | Notes |
|-----------|--------|-------|
| Text Upload | ✅/❌ | |
| Image Upload | ✅/❌ | |
| PDF Upload | ✅/❌ | |
| Video Upload | ✅/❌ | |
| Large File | ✅/❌ | |
| Multiple Types | ✅/❌ | |
| Auto-Delete | ✅/❌ | |
| Password Protection | ✅/❌ | |
| Mobile Responsive | ✅/❌ | |
| Browser Compatibility | ✅/❌ | |
| Network Conditions | ✅/❌ | |
| Security | ✅/❌ | |
| Error Handling | ✅/❌ | |
| Rate Limiting | ✅/❌ | |
| UI/UX | ✅/❌ | |

Overall Status: ✅ PASS / ❌ FAIL
Critical Issues: __________
Minor Issues: __________
```

---

## 🚨 Critical Issues to Watch For

1. **File Corruption** - Downloaded file differs from uploaded
2. **Encryption Failure** - File not encrypted before upload
3. **Memory Leaks** - Browser crashes on large files
4. **Security Bypass** - Password protection can be bypassed
5. **Data Loss** - File deleted before expiry time
6. **UI Freeze** - Browser becomes unresponsive

---

## ✅ Success Criteria

- All 15 test cases pass
- No critical security issues
- Works on Chrome, Firefox, Safari
- Mobile responsive and functional
- No console errors during normal operation
- Files maintain integrity (upload → download → verify)

---

**Happy Testing! 🎉**
