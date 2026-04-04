# SecureCodeReviews.com (SCRs) - Project Context

## Project Overview
SecureCodeReviews.com (SCRs) is a modern AppSec platform offering:
- Blog with 50+ SEO-optimized security articles (XSS, IDOR, DevSecOps, OWASP, etc.)
- ShieldX — proprietary security scanning platform (6 scanners + fix engine)
- Secure code examples (multi-language)
- Vulnerability visualization and OWASP Top 10 guides
- Free security tools for developers
- Weekly security reports
- Cloud security guides

## Tech Stack
- **Framework:** Next.js 16+ (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Animation:** Framer Motion
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Auth:** NextAuth.js v4
- **Hosting:** Vercel (auto-deploys from `main` branch)
- **Email:** Nodemailer via Hostinger SMTP
- **Payments:** Razorpay
- **Rate Limiting:** Upstash Redis (optional)

## Key Architecture

### ShieldX Scanners (app/api/shieldx/)
6 proprietary scanners that analyze code/config for security issues:
1. **Secrets Scanner** — Detects hardcoded API keys, passwords, tokens
2. **Dependency Scanner** — Checks for vulnerable npm packages via OSV.dev API
3. **API Scanner** — Finds API security issues (auth, injection, CORS, rate limiting)
4. **Cloud Scanner** — Detects cloud misconfigurations (AWS, Azure, GCP, Docker, K8s)
5. **Log Scanner** — Finds sensitive data in logs and logging misconfigurations
6. **CI/CD Gate** — Evaluates pipeline security posture

### Fix Engine (lib/fix-engine.ts)
Generates remediation guidance with:
- Compliance mapping (OWASP, CWE, NIST, PCI-DSS, SOC2, HIPAA, ISO27001)
- CVSS v3.1 risk scoring
- Code fix templates for each vulnerability type

### Content System
- `lib/blog-data.ts` — Core blog articles
- `lib/articles-*.ts` — Extended article collections (devsecops, vulnerability deep-dives, API security, OWASP, trending, AI security)
- `lib/code-examples-*.ts` — Secure code examples
- `lib/owasp-top10-*.ts` — OWASP Top 10 data (2021, 2025, AI)
- `lib/vulnerability-data.ts` — Vulnerability visualization data
- `lib/weekly-reports-data.ts` — Weekly security reports

### Models (MongoDB — models/)
User, BlogPost, Contact, Report, SecurityReport, ShieldXScan, ShieldXTeam, ShieldXAlertConfig, ShieldXBillingEvent, DemoLead

## Development Commands
- `npm run dev` — Start dev server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `git push` — Auto-deploys to Vercel

## Coding Conventions
- Use TypeScript strict mode
- Use shadcn/ui components from `components/ui/`
- Use Tailwind CSS for styling (no CSS modules)
- Use App Router (app/ directory) for all pages
- Server components by default; add "use client" only when needed
- All API routes in `app/api/`
- Environment variables in `.env.local` (never commit secrets)
