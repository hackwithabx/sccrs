# SecureCodeReviews.com — Complete Project Documentation

**Version:** 1.0  
**Date:** February 14, 2026  
**Author:** Abhishek Tiwari  
**Website:** https://securecodereviews.com  
**Repository:** https://github.com/hackwithabx/sccrs (Private)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Architecture](#3-project-architecture)
4. [Features & Pages](#4-features--pages)
5. [Directory Structure](#5-directory-structure)
6. [Environment Variables](#6-environment-variables)
7. [Database Setup (MongoDB Atlas)](#7-database-setup-mongodb-atlas)
8. [Authentication System](#8-authentication-system)
9. [Email Configuration (SMTP)](#9-email-configuration-smtp)
10. [Deployment on Vercel](#10-deployment-on-vercel)
11. [Domain & DNS Configuration](#11-domain--dns-configuration)
12. [Google Analytics](#12-google-analytics)
13. [How to Make Changes & Deploy Updates](#13-how-to-make-changes--deploy-updates)
14. [Content Management](#14-content-management)
15. [Security Features](#15-security-features)
16. [Troubleshooting](#16-troubleshooting)
17. [Credentials & Access](#17-credentials--access)
18. [Future Maintenance](#18-future-maintenance)

---

## 1. Project Overview

**SecureCodeReviews.com (SCRs)** is a modern Application Security (AppSec) education and services platform. It provides cybersecurity professionals and developers with:

- Security blog articles with in-depth research
- Secure vs. vulnerable code comparison examples
- OWASP Top 10 (Web, AI, 2025) interactive references
- Free security tools (Header Analyzer, CSP Generator, JWT Decoder, Hash Generator, etc.)
- Vulnerability visualization dashboards
- Security report generation with PDF export
- Cloud security guides (AWS, Azure, GCP)
- Professional services showcasing (VAPT, Code Review, API Security)
- User authentication (Register/Login)
- Admin dashboard
- Contact form with email notifications

The website replaces a previous WordPress site that was hosted on Hostinger.

---

## 2. Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 16.1.6 | React framework with App Router, server-side rendering, static generation |
| **TypeScript** | 5.9.3 | Type-safe JavaScript |
| **React** | 19.1.0 | UI component library |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework |
| **shadcn/ui** | (Radix-based) | Pre-built accessible UI components |
| **Framer Motion** | 12.x | Animations and transitions |
| **MongoDB** | Atlas (Cloud) | NoSQL database for users, contacts, etc. |
| **NextAuth.js** | 4.x | Authentication (JWT strategy) |
| **bcryptjs** | 3.x | Password hashing |
| **Nodemailer** | 6.x | Email sending via SMTP |
| **Recharts** | 2.x | Data visualization charts |
| **Lucide React** | — | Icon library |
| **jsPDF** | — | PDF report generation |

### Key Dependencies (from package.json)

- `@radix-ui/*` — Accessible UI primitives (Dialog, Dropdown, Select, Tabs, etc.)
- `next-auth` — Authentication
- `mongoose` — MongoDB ODM
- `framer-motion` — Animations
- `recharts` — Charts and graphs
- `jspdf` + `jspdf-autotable` — PDF generation
- `nodemailer` — SMTP email
- `prismjs` — Code syntax highlighting

---

## 3. Project Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER (Client)                  │
│  Next.js App Router → React Components + Tailwind   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│                  VERCEL (Hosting)                     │
│  ┌─────────────────────────────────────────────┐     │
│  │  Next.js Server (Serverless Functions)       │     │
│  │  - API Routes (/api/auth, /api/contact)      │     │
│  │  - Server-Side Rendering                     │     │
│  │  - Static Page Generation (38 pages)         │     │
│  └───────┬─────────────────────┬───────────────┘     │
│          │                     │                      │
└──────────┼─────────────────────┼──────────────────────┘
           │                     │
    ┌──────▼──────┐    ┌────────▼────────┐
    │ MongoDB     │    │ Hostinger SMTP  │
    │ Atlas       │    │ smtp.hostinger  │
    │ (Database)  │    │ .com:465        │
    └─────────────┘    └─────────────────┘
```

### Rendering Strategy

| Page Type | Strategy | Examples |
|-----------|----------|---------|
| Static (○) | Pre-rendered at build time | Home, About, Blog index, Tools, Services, OWASP pages |
| SSG (●) | Static with dynamic params | Individual blog posts (`/blog/[slug]`) |
| Dynamic (ƒ) | Server-rendered on demand | API routes (`/api/auth`, `/api/contact`) |

**Total Pages:** 38 (at build time)

---

## 4. Features & Pages

### Public Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — Hero, features, stats, vulnerability charts, CTA |
| `/about` | About page — Company story, team, mission |
| `/blog` | Blog listing — All security articles with search/filter |
| `/blog/[slug]` | Individual blog post (11 articles) |
| `/secure-code` | Secure code examples — Vulnerable vs. secure code comparisons |
| `/owasp` | OWASP overview page |
| `/owasp/top-10` | OWASP Top 10 2021 interactive reference |
| `/owasp/top-10-2025` | OWASP Top 10 2025 with changes |
| `/owasp/top-10-ai` | OWASP Top 10 for AI/LLM applications |
| `/owasp/history` | Historical OWASP Top 10 comparison (2004-2025) |
| `/vulnerabilities` | Vulnerability visualization dashboard |
| `/tools` | Free security tools suite |
| `/reports` | Security report generator with PDF export |
| `/services` | Professional services page |
| `/cloud-security` | Cloud security guides (AWS, Azure, GCP) |
| `/contact` | Contact form |
| `/privacy-policy` | Privacy policy |
| `/terms-of-service` | Terms of service |
| `/sitemap.xml` | Auto-generated sitemap for SEO |
| `/robots.txt` | Robots file for search engines |

### Authentication Pages

| Route | Description |
|-------|-------------|
| `/auth/login` | User login page |
| `/auth/register` | User registration page |

### Admin Pages

| Route | Description |
|-------|-------------|
| `/admin` | Admin dashboard (protected) |
| `/dashboard` | User dashboard (protected) |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js authentication endpoints |
| `/api/auth/register` | POST | User registration endpoint |
| `/api/contact` | POST | Contact form submission + email notification |

### Blog Articles (11 posts)

1. **OWASP Top 10 2025** — Complete analysis of 2025 updates
2. **Secure API Design Patterns** — REST API security best practices
3. **Supply Chain Security** — Software supply chain attack prevention
4. **Major Cyberattacks 2024-2025** — Real-world breach analysis
5. **DevSecOps Best Practices** — Security in CI/CD pipelines
6. **Web App Auth Vulnerabilities** — Authentication attack vectors
7. **Mobile App Security** — iOS/Android security testing
8. **Secure Code Review Methodology** — Professional review techniques
9. **Cloud Security AWS Azure GCP** — Multi-cloud security guide
10. **AI Red Teaming Guide** — Testing AI systems for vulnerabilities
11. **Securing RAG Pipelines** — Retrieval-Augmented Generation security

### Code Examples (12+ examples)

Categories include:
- SQL Injection Prevention
- XSS Prevention
- CSRF Protection
- Authentication Security
- Input Validation
- Prompt Injection Prevention (AI)
- PII Redaction for LLMs (AI)
- Secure LLM Tool Use (AI)
- AI Output Sanitization

### Free Security Tools

- HTTP Security Header Analyzer
- Content Security Policy (CSP) Generator
- JWT Token Decoder
- Hash Generator (MD5, SHA-1, SHA-256, SHA-512)
- Base64 Encoder/Decoder
- URL Encoder/Decoder
- Password Strength Checker
- SSL/TLS Certificate Checker

---

## 5. Directory Structure

```
x:\SCRs\
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (metadata, fonts, analytics)
│   ├── page.tsx                  # Homepage
│   ├── globals.css               # Global styles (Tailwind)
│   ├── about/page.tsx            # About page
│   ├── admin/page.tsx            # Admin dashboard
│   ├── auth/
│   │   ├── login/page.tsx        # Login page
│   │   └── register/page.tsx     # Registration page
│   ├── blog/
│   │   ├── page.tsx              # Blog listing
│   │   └── [slug]/page.tsx       # Dynamic blog post
│   ├── cloud-security/page.tsx   # Cloud security guide
│   ├── contact/page.tsx          # Contact form
│   ├── dashboard/page.tsx        # User dashboard
│   ├── owasp/
│   │   ├── page.tsx              # OWASP overview
│   │   ├── top-10/page.tsx       # OWASP Top 10 2021
│   │   ├── top-10-2025/page.tsx  # OWASP Top 10 2025
│   │   ├── top-10-ai/page.tsx    # OWASP Top 10 AI
│   │   └── history/page.tsx      # Historical comparison
│   ├── privacy-policy/page.tsx
│   ├── reports/page.tsx          # Report generator
│   ├── robots.txt/route.ts       # Dynamic robots.txt
│   ├── secure-code/page.tsx      # Code examples
│   ├── services/page.tsx         # Services page
│   ├── sitemap.xml/route.ts      # Dynamic sitemap
│   ├── terms-of-service/page.tsx
│   ├── tools/page.tsx            # Security tools
│   ├── vulnerabilities/page.tsx  # Vulnerability dashboard
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts  # NextAuth endpoints
│       │   └── register/route.ts       # Registration API
│       └── contact/route.ts            # Contact form API
│
├── components/                   # Reusable React components
│   ├── navbar.tsx                # Navigation bar
│   ├── footer.tsx                # Footer
│   ├── theme-provider.tsx        # Dark/light theme
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── tabs.tsx
│       └── ... (more UI components)
│
├── lib/                          # Utility libraries & data
│   ├── blog-data.ts              # Base blog post data
│   ├── blog-data-extended.ts     # Extended blog posts (AI security)
│   ├── code-examples.ts          # Base code examples
│   ├── code-examples-extended.ts # Extended code examples (AI)
│   ├── mongodb.ts                # MongoDB connection utility
│   ├── auth.ts                   # NextAuth configuration
│   └── utils.ts                  # Utility functions
│
├── models/                       # MongoDB/Mongoose models
│   └── User.ts                   # User model schema
│
├── public/                       # Static assets (images, icons)
│
├── package.json                  # Dependencies & scripts
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── postcss.config.mjs            # PostCSS config (Tailwind)
├── eslint.config.mjs             # ESLint configuration
├── server.js                     # Custom server (for self-hosting)
├── .env.local                    # Environment variables (NOT in git)
├── .env.local.example            # Environment variable template
├── .gitignore                    # Git ignore rules
└── README.md                     # Project readme
```

---

## 6. Environment Variables

The application requires the following environment variables. These are configured in **Vercel → Settings → Environment Variables**.

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `NEXTAUTH_SECRET` | Secret key for JWT token signing | Random 32+ char string |
| `NEXTAUTH_URL` | Production URL of the site | `https://securecodereviews.com` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics Measurement ID | `G-XXXXXXXXXX` |
| `SMTP_HOST` | SMTP server hostname | `smtp.hostinger.com` |
| `SMTP_PORT` | SMTP port | `465` |
| `SMTP_SECURE` | Use TLS/SSL | `true` |
| `SMTP_USER` | SMTP username (email) | `support@securecodereviews.com` |
| `SMTP_PASSWORD` | SMTP password | (your email password) |
| `ADMIN_EMAIL` | Admin email for notifications | `support@securecodereviews.com` |
| `ADMIN_PASSWORD` | Admin login password | (your admin password) |
| `NODE_ENV` | Environment mode | `production` |

### How to Update Environment Variables

1. Go to https://vercel.com → Your project → **Settings** → **Environment Variables**
2. Edit or add variables
3. **Redeploy** the project for changes to take effect

---

## 7. Database Setup (MongoDB Atlas)

### Overview

The application uses **MongoDB Atlas** (free tier) as its database.

- **Cloud Provider:** MongoDB Atlas (AWS)
- **Cluster Name:** Cluster0
- **Region:** Auto-selected
- **Database Name:** `scr` (auto-created on first connection)

### Collections

| Collection | Purpose |
|-----------|---------|
| `users` | Registered user accounts (email, hashed password, name) |
| `contacts` | Contact form submissions |

### How to Access MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Log in with your MongoDB Atlas credentials
3. Click on **Cluster0** → **Collections** to view data
4. Use **Database Access** to manage users
5. Use **Network Access** to manage IP whitelist (Vercel IPs are added via `0.0.0.0/0`)

### User Schema (Mongoose)

```typescript
{
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  role: String (default: "user"),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 8. Authentication System

### Technology

- **NextAuth.js** with **Credentials Provider**
- **JWT Strategy** (stateless, no session database needed)
- **bcryptjs** for password hashing

### Flow

1. **Registration** (`/auth/register`):
   - User submits name, email, password
   - API validates input
   - Password is hashed with bcrypt (10 salt rounds)
   - User is stored in MongoDB
   - Redirected to login

2. **Login** (`/auth/login`):
   - User submits email, password
   - NextAuth verifies credentials against MongoDB
   - JWT token is issued and stored in HTTP-only cookie
   - User is redirected to dashboard

3. **Protected Routes:**
   - `/dashboard` — Requires authenticated user
   - `/admin` — Requires admin role

### Admin Access

- Admin credentials are set via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- The admin dashboard allows viewing registered users and contact submissions

---

## 9. Email Configuration (SMTP)

### Setup

The contact form sends emails using **Hostinger's SMTP server**.

| Setting | Value |
|---------|-------|
| SMTP Host | `smtp.hostinger.com` |
| SMTP Port | `465` |
| Security | SSL/TLS |
| Username | `support@securecodereviews.com` |

### How It Works

1. User fills out the contact form at `/contact`
2. Form submits to `/api/contact` API route
3. Server validates input and saves to MongoDB
4. Nodemailer sends email notification to admin
5. Confirmation response sent to user

### Managing Email

- Email account is managed through **Hostinger hPanel** → **Emails**
- To change email password: hPanel → Email Accounts → Change Password
- Update `SMTP_PASSWORD` in Vercel environment variables if changed

---

## 10. Deployment on Vercel

### Why Vercel?

- **Free tier** for personal/hobby projects
- **Built for Next.js** (same company makes both)
- **Automatic deployments** on git push
- **Global CDN** with edge caching
- **Free SSL** certificates
- **Serverless functions** for API routes

### Current Deployment

| Setting | Value |
|---------|-------|
| **Platform** | Vercel (Free/Hobby Plan) |
| **Project Name** | sccrs |
| **Production URL** | https://securecodereviews.com |
| **Vercel URL** | https://sccrs.vercel.app |
| **GitHub Repo** | hackwithabx/sccrs (private) |
| **Branch** | main |
| **Framework** | Next.js (auto-detected) |
| **Build Command** | `next build` |
| **Node.js Version** | 20.x (recommended) |
| **Output** | Standalone |

### How Deployment Works

```
Local Code Change
       │
       ▼
  git add .
  git commit -m "message"
  git push
       │
       ▼
  GitHub (hackwithabx/sccrs)
       │
       ▼ (webhook)
  Vercel detects push
       │
       ▼
  Vercel runs: npm install → next build
       │
       ▼
  Build succeeds → deployed to production
       │
       ▼
  Live at securecodereviews.com (~1-2 min total)
```

### Vercel Dashboard

- **URL:** https://vercel.com
- **Account:** Signed in with GitHub (hackwithabx)
- **Project:** sccrs

---

## 11. Domain & DNS Configuration

### Domain Registrar

- **Domain:** securecodereviews.com
- **Registrar/DNS:** Hostinger
- **Managed in:** Hostinger hPanel → DNS Zone Editor

### DNS Records (Current)

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| **A** | `@` | `216.198.79.1` | Points root domain to Vercel |
| **CNAME** | `www` | `2e920e2671fff477.vercel-dns-017.com.` | Points www to Vercel |
| **MX** | `@` | `mx1.hostinger.com` (priority 10) | Email delivery |
| **MX** | `@` | `mx2.hostinger.com` (priority 20) | Email delivery (backup) |
| **TXT** | `@` | `v=spf1 include:_spf.mail.hostinger.com ~all` | Email SPF record |
| **TXT** | `_dmarc` | `v=DMARC1; p=none` | DMARC policy |
| **TXT** | `hostinger1._domainkey` | DKIM key | Email DKIM signing |
| **CAA** | `@` | Various issuers | SSL certificate authorities |

### Important Notes

- **DO NOT** delete MX, TXT (SPF/DKIM/DMARC) records — they are needed for email
- A and CNAME records point to Vercel for website hosting
- Hostinger still handles email hosting (support@securecodereviews.com)
- SSL certificate is auto-provisioned by Vercel (Let's Encrypt)

---

## 12. Google Analytics

### Setup

- **Measurement ID:** Configured via `NEXT_PUBLIC_GA_MEASUREMENT_ID` environment variable
- **Implementation:** Google Analytics 4 (GA4) script loaded in root layout
- **Dashboard:** https://analytics.google.com

### What's Tracked

- Page views across all routes
- User engagement metrics
- Traffic sources
- Geographic data
- Device/browser info

---

## 13. How to Make Changes & Deploy Updates

### Prerequisites

- **Node.js** 20+ installed locally
- **Git** installed
- **VS Code** (recommended editor)
- Access to the GitHub repository

### Step-by-Step Update Workflow

```bash
# 1. Navigate to project folder
cd x:\SCRs

# 2. Make your code changes in VS Code

# 3. Test locally (optional but recommended)
npm run dev
# Visit http://localhost:3000 to preview

# 4. Stage all changes
git add .

# 5. Commit with a descriptive message
git commit -m "Description of what changed"

# 6. Push to GitHub
git push

# 7. Vercel auto-deploys (wait ~1-2 minutes)
# Check https://vercel.com for build status
```

### Common Update Scenarios

#### Adding a New Blog Post

1. Open `lib/blog-data-extended.ts`
2. Add a new object to the `extendedBlogPosts` array following the existing format
3. Include: `slug`, `title`, `excerpt`, `content` (HTML string), `author`, `date`, `readTime`, `tags`, `category`
4. Push to GitHub

#### Adding a New Code Example

1. Open `lib/code-examples-extended.ts`
2. Add a new object with: `id`, `title`, `description`, `category`, `language`, `vulnerableCode`, `secureCode`, `explanation`
3. Push to GitHub

#### Modifying a Page

1. Find the page in `app/[page-name]/page.tsx`
2. Edit the React component
3. Test locally with `npm run dev`
4. Push to GitHub

#### Updating Environment Variables

1. Go to Vercel → Settings → Environment Variables
2. Edit the variable
3. Redeploy (Settings → Deployments → Redeploy latest)

---

## 14. Content Management

### Blog Content

Blog posts are defined in two files:
- `lib/blog-data.ts` — Original blog posts
- `lib/blog-data-extended.ts` — Extended posts (added later)

Each post is a TypeScript object with HTML content. To add/edit posts, modify these files directly.

### Code Examples

Code examples are defined in:
- `lib/code-examples.ts` — Original examples
- `lib/code-examples-extended.ts` — Extended examples (AI security)

### OWASP Data

OWASP data is embedded within the respective page components:
- `app/owasp/top-10/page.tsx`
- `app/owasp/top-10-2025/page.tsx`
- `app/owasp/top-10-ai/page.tsx`
- `app/owasp/history/page.tsx`

### Static Content

Other page content (Services, About, etc.) is directly in their respective `page.tsx` files.

---

## 15. Security Features

### HTTP Security Headers

Configured in `next.config.ts`:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Frame-Options | DENY | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer info |
| X-XSS-Protection | 1; mode=block | XSS filter |
| Permissions-Policy | camera=(), microphone=(), etc. | Restrict browser features |
| Strict-Transport-Security | max-age=63072000 | Force HTTPS |
| Content-Security-Policy | Restrictive policy | Prevent XSS, injection |

### Authentication Security

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with secure secret
- HTTP-only cookies for session
- CSRF protection via NextAuth

### Input Validation

- Server-side validation on all API routes
- Sanitized user inputs
- MongoDB injection prevention via Mongoose

---

## 16. Troubleshooting

### Build Fails on Vercel

- Check **Build Logs** in Vercel dashboard
- Ensure Node.js version is set to **20.x** (not 24.x)
- Verify all environment variables are set
- Test build locally: `npm run build`

### Site Not Loading

- Check Vercel deployment status (should say "Ready")
- Verify DNS records in Hostinger hPanel
- Try accessing via https://sccrs.vercel.app (direct Vercel URL)
- Clear browser cache or use incognito

### Database Connection Issues

- Verify `MONGODB_URI` in Vercel environment variables
- Check MongoDB Atlas → Network Access → ensure `0.0.0.0/0` is allowed
- Check MongoDB Atlas → Database Access → verify credentials

### Email Not Sending

- Verify SMTP credentials in Vercel environment variables
- Check Hostinger email account is active
- Test email login at https://mail.hostinger.com

### Authentication Not Working

- Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set
- `NEXTAUTH_URL` must match the production domain exactly
- After changing auth variables, redeploy

---

## 17. Credentials & Access

> ⚠️ **IMPORTANT:** Change all passwords after setup. The ones used during development should be rotated.

### Accounts Overview

| Service | URL | Purpose |
|---------|-----|---------|
| **Vercel** | https://vercel.com | Website hosting & deployment |
| **GitHub** | https://github.com/hackwithabx/sccrs | Source code repository |
| **MongoDB Atlas** | https://cloud.mongodb.com | Database |
| **Hostinger hPanel** | https://hpanel.hostinger.com | Domain DNS & email hosting |
| **Google Analytics** | https://analytics.google.com | Website analytics |
| **Hostinger Webmail** | https://mail.hostinger.com | Email access |

### What Each Service Does

- **Vercel** — Hosts and runs the website. Auto-deploys from GitHub.
- **GitHub** — Stores the source code. Push changes here to deploy.
- **MongoDB Atlas** — Cloud database storing user accounts and contact submissions.
- **Hostinger** — Manages the domain DNS records and email hosting (support@securecodereviews.com).
- **Google Analytics** — Tracks website traffic and user behavior.

---

## 18. Future Maintenance

### Regular Tasks

1. **Monitor Vercel** — Check deployment status and error logs
2. **Monitor MongoDB Atlas** — Check database size and connections
3. **Update dependencies** — Run `npm update` periodically and test
4. **Renew domain** — Ensure Hostinger domain doesn't expire
5. **Review analytics** — Check Google Analytics for traffic insights

### Scaling Considerations

- **Vercel Free Tier Limits:** 100GB bandwidth/month, 100 hours serverless function execution
- **MongoDB Atlas Free Tier:** 512MB storage, shared RAM
- **Upgrade paths:** Vercel Pro ($20/mo), MongoDB M10+ ($57/mo)

### Adding New Features

1. Create new page: `app/new-feature/page.tsx`
2. Add navigation link in `components/navbar.tsx`
3. Add footer link in `components/footer.tsx`
4. Test locally → push to GitHub → auto-deploys

### Backup Strategy

- **Code:** GitHub repository (version controlled)
- **Database:** MongoDB Atlas has automatic backups (free tier: daily snapshots)
- **Keep a local clone** of the repository as backup

---

## Appendix A: NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Create production build |
| `npm run start` | Start production server locally |
| `npm run lint` | Run ESLint code linting |

---

## Appendix B: Key Configuration Files

### next.config.ts
- Output mode: `standalone`
- Security headers configuration
- Image remote patterns
- CSP (Content Security Policy)

### tsconfig.json
- Strict TypeScript mode
- Path aliases: `@/*` maps to project root
- Bundler module resolution

### postcss.config.mjs
- Tailwind CSS v4 PostCSS plugin

---

*This document was created on February 14, 2026. For the latest information, refer to the source code repository and Vercel dashboard.*
