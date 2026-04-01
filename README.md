# SS Traders – Document Management System

Internal document management portal for S S Traders.
Built with **Next.js 14**, **Neon PostgreSQL**, **Cloudflare R2**, deployed on **Vercel**.

---

## Tech Stack

| Layer       | Service              |
|-------------|----------------------|
| Frontend    | Next.js 14 App Router |
| Backend API | Next.js API Routes   |
| Database    | Neon PostgreSQL      |
| File Storage| Cloudflare R2        |
| Hosting     | Vercel               |
| Auth        | JWT + httpOnly cookies |

---

## Local Development Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ss-traders-dms.git
cd ss-traders-dms
npm install
```

### 2. Set up Neon Database
1. Go to https://neon.tech and create a free account
2. Create a new project → name it `ss-traders-dms`
3. Copy the **Connection String** (starts with `postgresql://...`)
4. Open the **SQL Editor** in Neon dashboard
5. Paste the contents of `scripts/schema.sql` and run it

### 3. Set up Cloudflare R2
1. Go to https://cloudflare.com and create a free account
2. In the dashboard → **R2 Object Storage** → Create Bucket
3. Name it `ss-traders-dms`
4. Go to **Manage R2 API Tokens** → Create API Token
   - Permissions: **Object Read & Write**
   - Scope: Your bucket
5. Copy: Account ID, Access Key ID, Secret Access Key

### 4. Configure environment variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and fill in all values:
- `DATABASE_URL` — from Neon
- `JWT_SECRET` — any random 64-char string (run: `openssl rand -base64 64`)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` — from Cloudflare
- `R2_BUCKET_NAME` — `ss-traders-dms`
- `R2_PUBLIC_URL` — from R2 bucket settings

### 5. Seed the admin user
```bash
npm run seed
```
This creates: `admin@sstraders.com` / `Admin@1234`
**Change this password after first login.**

### 6. Run locally
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploy to Vercel + GitHub

### Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: SS Traders DMS"
git remote add origin https://github.com/YOUR_USERNAME/ss-traders-dms.git
git push -u origin main
```

### Deploy on Vercel
1. Go to https://vercel.com → New Project → Import from GitHub
2. Select `ss-traders-dms`
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Click **Deploy**

---

## Features

- 🔐 Role-based auth (Admin / User)
- 🏗️ Works with Proprietor & Partnership types
- 📁 8 folder types per work (Quotation, Tender, Invoice, Bills, Drawings, Certificates, Correspondence, Misc)
- ☁️ Real file upload to Cloudflare R2 (drag & drop supported)
- ⬇️ Signed download URLs (secure, time-limited)
- 👥 User management with per-work access control
- 🗑️ Delete files and works (admin only for works)
