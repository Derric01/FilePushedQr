# 🔐 FilePushedQR - Secure Anonymous File Sharing

[![Production Ready](https://img.shields.io/badge/status-production--ready-green.svg)](https://github.com/Derric01/FilePushedQr)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

> **Enterprise-grade secure file sharing with client-side AES-256-GCM encryption, zero-knowledge architecture, and QR code generation**

Share files anonymously with military-grade encryption. Files are encrypted client-side before upload, ensuring true zero-knowledge security.

---

## ✨ Features

- 🔒 **End-to-End Encryption**: AES-256-GCM client-side encryption
- 🕵️ **Zero-Knowledge**: Server never sees unencrypted data
- 📱 **QR Code Sharing**: Instant shareable QR codes
- ⏰ **Auto-Deletion**: Files expire after 1-5 days (cleanup every 30 mins)
- 🔐 **Password Protection**: Optional Argon2 password hashing
- 📦 **Universal Files**: PDFs, images, videos, documents - up to 500MB
- 🚫 **No Signup**: Completely anonymous - no accounts
- 🌐 **Unlimited Views**: Share with unlimited recipients
- 🎨 **Dark Theme**: Modern UI with neon accents and animations

---

## 🚀 Deploy to Render.com (Single Service - FREE TIER)

### Prerequisites
- GitHub account with repo: `https://github.com/Derric01/FilePushedQr.git`
- [Neon.tech](https://neon.tech) PostgreSQL database (free tier)
- [Render.com](https://render.com) account (free tier)

### Step 1: Setup Database
1. Create free PostgreSQL database at [Neon.tech](https://neon.tech)
2. Copy connection string: `postgresql://user:pass@host/db?sslmode=require`

### Step 2: Deploy on Render (Single Service)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect GitHub repo: `Derric01/FilePushedQr`
4. Configure:
   ```
   Name: filepushedqr
   Language: Node
   Branch: main
   Build Command: npm install && next build && tsc -p backend/tsconfig.json && npx prisma generate && npx prisma migrate deploy
   Start Command: node backend/dist/server.js
   ```

5. **Add Environment Variables:**
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_xxx@ep-xxx.neon.tech/neondb?sslmode=require
   STORAGE_TYPE=local
   LOCAL_STORAGE_PATH=./uploads
   NODE_ENV=production
   PORT=10000
   MAX_FILE_SIZE_MB=500
   MAX_EXPIRY_DAYS=5
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=info
   ```

6. Select **Instance Type: Free**

7. Click **"Deploy Web Service"**

### Step 3: Test Your Deployment
- Visit: `https://filepushedqr.onrender.com`
- Health check: `https://filepushedqr.onrender.com/api/health`
- Upload a file, get QR code, test download

---

## ⚠️ Important Notes for FREE TIER

### File Storage Limitations
**Files are NOT persistent on free tier!** 

- ❌ Uploaded files **delete on every restart**
- ❌ Service spins down after **15 minutes** of inactivity
- ❌ Files lost on **every redeploy**
- ✅ Perfect for **demo/testing purposes**

**Why?** Free tier doesn't support persistent disks. Files are stored in ephemeral filesystem at `./uploads` which is wiped on restart.

### Production Deployment (Persistent Storage)
For production with file persistence, upgrade to **Starter plan ($7/month)**:
1. Select **Instance Type: Starter** instead of Free
2. Add **Persistent Disk**:
   - Name: `uploads`
   - Mount Path: `/opt/render/project/uploads`
   - Size: 1 GB
3. Update environment variable:
   ```env
   LOCAL_STORAGE_PATH=/opt/render/project/uploads
   ```

### Auto-Deletion Still Works
Files still auto-delete after expiration (cleanup runs every 30 mins), but on free tier they'll also be lost on:
- Service spin-down (15 min inactivity)
- Redeployments
- Service restarts

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - App Router, TypeScript
- **Tailwind CSS** + shadcn/ui
- **Web Crypto API** - Client-side encryption
- **qrcode.react** - QR generation

### Backend
- **Node.js + Express** - REST API
- **Prisma ORM** - PostgreSQL
- **Argon2** - Password hashing
- **node-cron** - Cleanup every 30 mins

### Security
- **AES-256-GCM** - Client encryption
- **Rate Limiting** - 100 req/15min
- **CORS** - Restricted origins
- **Auto-Deletion** - 30-min cleanup

---

## 📁 Project Structure

```
FilePushedQr/ (Monorepo)
├── app/                    # Next.js frontend
│   ├── page.tsx           # Landing
│   └── view/[shareId]/    # Download
├── backend/src/
│   ├── server.ts          # Express
│   ├── routes/            # API
│   ├── services/          # Storage
│   └── jobs/              # Cleanup
├── components/            # React UI
├── prisma/schema.prisma   # Database
├── uploads/               # Local storage
└── render.yaml            # Deployment
```

---

## 🧪 Local Development

### Setup
```bash
git clone https://github.com/Derric01/FilePushedQr.git
cd FilePushedQr
npm install
```

### Configure `.env`
```env
DATABASE_URL="postgresql://localhost:5432/filepushedqr"
STORAGE_TYPE="local"
LOCAL_STORAGE_PATH="./uploads"
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001"
MAX_FILE_SIZE_MB=500
MAX_EXPIRY_DAYS=5
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL="info"
```

### Run
```bash
npx prisma migrate dev
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Network Access (LAN)
```bash
# Get IP: ipconfig (Windows) or ifconfig (Mac/Linux)
# Update .env with your IP (e.g., 192.168.1.8)
FRONTEND_URL="http://192.168.1.8:3000"
NEXT_PUBLIC_API_URL="http://192.168.1.8:3001"

# Windows Firewall
New-NetFirewallRule -DisplayName "FilePushedQR - Next.js" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "FilePushedQR - Backend" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
```

---

## 📖 API Endpoints

### Upload
```http
POST /api/upload
Content-Type: multipart/form-data
file, expiresIn, password?

Response: { shareId, managementToken, expiresAt }
```

### View
```http
GET /api/view/:shareId
Response: { originalName, mimeType, size, hasPassword, expiresAt }
```

### Download
```http
POST /api/view/:shareId
Body: { password? }
Response: <encrypted file binary>
```

### Delete
```http
DELETE /api/delete/:shareId
Body: { managementToken }
Response: { success }
```

### Health
```http
GET /api/health
Response: { status: "ok", timestamp }
```

---

## 🔐 Security

### Client-Side Encryption
- **AES-256-GCM** with random IVs
- Key generated in browser, never sent to server
- Server stores only encrypted blobs

### Password Protection
- **Argon2id** hashing
- Memory: 65536 KB, Time: 2, Parallelism: 1

### Rate Limiting
- 100 requests per 15 minutes per IP

### Auto-Deletion
- Cron runs every 30 minutes
- Files deleted immediately after expiration

---

## 🐛 Troubleshooting

### Upload Fails
- Check disk space (1 GB limit on Render)
- Verify file size under 500MB
- Check backend logs for errors

### CORS Errors
- Verify `FRONTEND_URL` matches frontend domain exactly
- Ensure `NEXT_PUBLIC_API_URL` matches backend URL
- Check both services are deployed

### Files Not Deleting
- Wait 30-60 mins for cleanup cycle
- Check logs: "Cleanup job scheduled: */30 * * * *"
- Verify database connection

### Database Issues
- Confirm `DATABASE_URL` is correct
- Check Neon.tech database is active
- Run `npx prisma migrate deploy`

---

## 📄 License

MIT License

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

---

## 🔗 Links

- **Repo**: https://github.com/Derric01/FilePushedQr
- **Render**: https://render.com
- **Neon**: https://neon.tech

---

**Built with ❤️ for secure, anonymous file sharing**

| Field | Type | Description |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| fileName | String | Original filename |
| fileType | String | MIME type |
| fileSize | BigInt | Size in bytes |
| encryptedBlob | String | R2 storage key |
| shareId | String | Public share identifier |
| ownerToken | String | Hashed owner token |
| passwordHash | String? | Argon2 hash (optional) |
| expiresAt | DateTime | Expiration timestamp |
| viewCount | Int | Number of views |
| isDeleted | Boolean | Soft delete flag |

See `prisma/schema.prisma` for complete schema.

## 🛡️ Threat Model & Mitigations

| Threat | Mitigation |
|--------|-----------|
| **Server compromise** | Zero-knowledge: server can't decrypt files |
| **MITM attacks** | HTTPS enforced + key in URL fragment |
| **Brute force** | Argon2 for passwords, rate limiting |
| **DoS attacks** | Rate limiting, file size caps, cleanup jobs |
| **Data leaks** | Anonymous logging (hashed IPs), no PII stored |
| **Replay attacks** | Random IVs per encryption, expiring tokens |

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📧 Contact

For security issues, please email: security@yourdomain.com

## 🌟 Interview Showcase

This project demonstrates:

- ✅ **Security-first architecture** with client-side encryption
- ✅ **Production-grade patterns** (error handling, logging, validation)
- ✅ **Modern TypeScript** usage throughout
- ✅ **Cloud-native design** with Cloudflare R2 integration
- ✅ **Scalable backend** with Express + Prisma ORM
- ✅ **Professional frontend** using Next.js 14 + shadcn/ui
- ✅ **Zero-knowledge principles** in practice
- ✅ **Clean code** with clear separation of concerns
- ✅ **Comprehensive documentation** for maintainability

---

**Built with 💜 by Senior Full-Stack Engineers | Secure by Design | Privacy-First Architecture**
