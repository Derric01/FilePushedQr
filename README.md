# 🔐 FilePushedQR - Secure File Sharing

> **Military-grade encryption. Anonymous. Untraceable. Unbreakable.**

Share files securely with client-side AES-256-GCM encryption. Zero-knowledge architecture means your files are encrypted in the browser before upload—the server never sees your data.

**🌐 Live Demo:** [https://filepushedqr.onrender.com](https://filepushedqr.onrender.com)

---

## 📸 Screenshots

### Homepage
![FilePushedQR Homepage](https://github.com/user-attachments/assets/homepage.png)

### Upload Complete with QR Code
![Upload Complete](https://github.com/user-attachments/assets/upload-complete.png)

### Features Overview
![Features](https://github.com/user-attachments/assets/features.png)

---

## ✨ Features

- 🔒 **AES-256-GCM Encryption** - Client-side encryption before upload
- 🕵️ **Zero-Knowledge** - Server never sees unencrypted data
- 📱 **QR Code Sharing** - Instant mobile sharing
- ⏰ **Auto-Destruct** - Files expire after 1-7 days
- 🔐 **Password Protection** - Optional Argon2id hashing
- 📦 **500MB File Support** - PDFs, images, videos, documents
- 🚫 **No Registration** - Completely anonymous
- 🎨 **Modern UI** - Dark theme with neon accents

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + shadcn/ui components
- **Web Crypto API** for client-side encryption
- **qrcode.react** for QR generation

### Backend
- **Express** REST API
- **Prisma ORM** with PostgreSQL
- **Argon2id** password hashing
- **node-cron** for automated cleanup

### Security
- **AES-256-GCM** encryption
- **Helmet** CSP headers
- **Rate limiting** (100 req/15min)
- **CORS** protection

### Deployment
- **Render.com** (single monorepo service)
- **Neon.tech** PostgreSQL database
- **Ephemeral storage** (free tier)

---

## 📄 License

MIT License

---

**Built with ❤️ for secure, anonymous file sharing**
