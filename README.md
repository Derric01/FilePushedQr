# 🔐 FilePushedQR - Secure File Sharing

> **Military-grade encryption. Anonymous. Untraceable. Unbreakable.**

Share files securely with client-side encryption. Zero-knowledge architecture means your files are encrypted in the browser before upload—the server never sees your data.

**🌐 Live Demo:** [https://filepushedqr.onrender.com](https://filepushedqr.onrender.com)

---

## ✨ Features

- 🔒 **Military-Grade Encryption** - Client-side encryption before upload
- 🕵️ **Zero-Knowledge** - Server never sees unencrypted data
- 📱 **QR Code Sharing** - Instant mobile sharing
- ⏰ **Auto-Destruct** - Files expire after 1-7 days
- 🔐 **Password Protection** - Optional password hashing
- 📦 **500MB File Support** - Text, PDFs, images, videos, all formats
- 🚫 **No Registration** - Completely anonymous
- 📱 **Mobile Optimized** - Responsive design with touch-friendly UI

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
- **Secure password hashing**
- **node-cron** for automated cleanup

### Security
- **Military-grade encryption**
- **Helmet** CSP headers
- **Rate limiting** (100 req/15min)
- **CORS** protection

### Deployment
- **Render.com** (single monorepo service)
- **Neon.tech** PostgreSQL database
- **Node.js 22** runtime

---

## 📄 License

MIT License

---

**Built with ❤️ for secure, anonymous file sharing**
