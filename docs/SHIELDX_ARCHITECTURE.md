# ShieldX — Detailed Architecture & Developer Documentation

**Version:** 2.0  
**Last Updated:** March 20, 2026  
**Author:** SecureCodeReviews Engineering  
**Audience:** Developers, Engineering Leads, DevSecOps Teams

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Module Architecture](#4-module-architecture)
   - 4.1 [Secrets Scanner](#41-secrets-scanner)
   - 4.2 [Dependency Scanner](#42-dependency-scanner)
   - 4.3 [API Security Scanner](#43-api-security-scanner)
   - 4.4 [Cloud Security Audit](#44-cloud-security-audit)
   - 4.5 [Threat Log Analyzer](#45-threat-log-analyzer)
   - 4.6 [CI/CD Pipeline Gate](#46-cicd-pipeline-gate)
   - 4.7 [Alert System](#47-alert-system)
   - 4.8 [Security Score](#48-security-score)
5. [API Reference](#5-api-reference)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Data Flow & Privacy](#7-data-flow--privacy)
8. [Billing & Plans](#8-billing--plans)
9. [External APIs & Data Sources](#9-external-apis--data-sources)
10. [Database Schema](#10-database-schema)
11. [Deployment Architecture](#11-deployment-architecture)
12. [CI/CD Integration Guide](#12-cicd-integration-guide)
13. [Security Hardening](#13-security-hardening)

---

## 1. System Overview

ShieldX is a multi-module application security platform built as part of the SecureCodeReviews.com (SCRs) Next.js application. It operates as a SaaS product with three plan tiers:

| Plan | Modules | Scan Limit | History | API Key | Team Seats | Price |
|------|---------|-----------|---------|---------|-----------|-------|
| **Free/Demo** | Secrets, Score (demo only) | 5 total | No | No | No | Free |
| **Pro** | All 8 modules | 1,000/month | Yes | Yes | No | Paid |
| **Enterprise** | All 8 modules | Unlimited | Yes | Yes | 25+ seats | Paid |

### Core Philosophy
- **Zero code storage** — All scans happen in memory, results returned to browser, nothing persisted on server
- **Developer-first** — 60-second scan workflow, no security team required
- **Real data** — Uses live vulnerability databases (OSV.dev), real HTTP requests for API scans
- **Privacy by design** — No telemetry, no code logging, no third-party data sharing

---

## 2. Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16.1.6** (App Router) | Full-stack React framework, server components, API routes |
| **TypeScript** | Type-safe development |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **shadcn/ui** | Accessible component library (Card, Badge, Button, Tabs, etc.) |
| **Framer Motion** | Animations and transitions |
| **lucide-react** | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Next.js API Routes** (Route Handlers) | REST API endpoints under `/api/shieldx/*` |
| **MongoDB / Mongoose** | User data, scan history, billing records, team management |
| **NextAuth.js** (JWT strategy) | Session-based authentication with CredentialsProvider |

### External Services
| Service | Purpose | API Key Required? |
|---------|---------|-------------------|
| **OSV.dev API** | Vulnerability database queries (Google) | No (free, open) |
| **Razorpay** | Payment processing (India/global) | Yes (server-side) |
| **MongoDB Atlas** | Database hosting | Yes (connection string) |
| **Vercel** | Hosting & deployment | Automatic via Git |

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ShieldX Workspace (/shieldx)                                   │
│  ├── Module Cards (8 modules)                                   │
│  ├── Scan Input Panel (textarea / URL input)                    │
│  ├── Results Display (findings, scores, charts)                 │
│  ├── History Tab (Pro+)                                         │
│  └── Overview Tab (plan info, stats, admin controls)            │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS (fetch API)
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS API ROUTES                            │
│                    (Serverless Functions)                        │
│                                                                 │
│  Scan Endpoints:                                                │
│  ├── POST /api/shieldx/scan-secrets    (Secrets Scanner)        │
│  ├── POST /api/shieldx/scan-deps       (Dependency Scanner)     │
│  ├── POST /api/shieldx/scan-api        (API Security Scanner)   │
│  ├── POST /api/shieldx/scan-cloud      (Cloud Security Audit)   │
│  └── POST /api/shieldx/ci-scan         (CI/CD Pipeline Gate)    │
│                                                                 │
│  Management Endpoints:                                          │
│  ├── GET  /api/shieldx/history          (Scan History)          │
│  ├── POST /api/shieldx/api-key          (Generate API Key)      │
│  ├── POST /api/shieldx/alerts           (Alert Config)          │
│  ├── POST /api/shieldx/alerts/test      (Test Alert)            │
│  ├── POST /api/shieldx/team             (Team Management)       │
│  ├── POST /api/shieldx/upgrade-plan     (Admin Plan Change)     │
│  └── POST /api/shieldx/demo-signup      (Demo Registration)     │
│                                                                 │
│  Billing Endpoints:                                             │
│  ├── POST /api/shieldx/billing/checkout     (Create Order)      │
│  ├── GET  /api/shieldx/billing/subscription (Get Plan Status)   │
│  ├── POST /api/shieldx/billing/cancel       (Cancel Sub)        │
│  └── POST /api/shieldx/billing/webhook      (Razorpay Webhook)  │
│                                                                 │
│  Auth Layer:                                                    │
│  ├── lib/shieldx-access.ts      (Session → User + Plan)        │
│  ├── lib/shieldx-route-auth.ts  (Route-level auth + RBAC)      │
│  └── lib/feature-flags.ts       (Plan → Feature mapping)       │
└────────────┬────────────────┬───────────────────────────────────┘
             │                │
     ┌───────▼───────┐  ┌────▼──────────────┐
     │   MongoDB     │  │  External APIs    │
     │   Atlas       │  │                   │
     │               │  │  ├── OSV.dev      │
     │  Collections: │  │  │   (CVE data)   │
     │  ├── users    │  │  │                │
     │  ├── scans    │  │  ├── Target URLs  │
     │  ├── alerts   │  │  │   (API scan)   │
     │  ├── teams    │  │  │                │
     │  └── billing  │  │  └── Razorpay     │
     └───────────────┘  │      (billing)    │
                        └───────────────────┘
```

---

## 4. Module Architecture

### 4.1 Secrets Scanner

**API Endpoint:** `POST /api/shieldx/scan-secrets`  
**File:** `app/api/shieldx/scan-secrets/route.ts`  
**Plan Access:** Free (limited), Pro, Enterprise  
**External APIs:** None (fully local)

#### How It Works

1. **Input:** User pastes source code, config files, or .env content into the textarea
2. **Pattern Matching:** Code is scanned against 20+ regex patterns:
   - AWS Access Keys (`AKIA[0-9A-Z]{16}`)
   - GitHub Tokens (`ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`, `github_pat_`)
   - Stripe Keys (`sk_live_`, `pk_live_`)
   - Slack Tokens (`xox[bpors]-`)
   - Google API Keys (`AIza[A-Za-z0-9_-]{35}`)
   - Private Keys (`-----BEGIN ... PRIVATE KEY-----`)
   - Database Connection Strings (`mongodb://`, `postgres://`)
   - JWT/Bearer Tokens
   - SendGrid, Twilio, Mailgun, npm, Docker tokens
   - Generic password/API key patterns
   - Internal IP addresses
3. **Entropy Analysis:** Shannon entropy is calculated for each match. Low-entropy generic patterns (< 3.0 bits) are filtered out to reduce false positives
4. **Placeholder Filtering:** Common test values (`test_`, `example_`, `changeme`, etc.) are auto-excluded
5. **Output:** Findings sorted by confidence (High → Medium → Low) with:
   - Pattern name and matched line/column
   - Masked preview of the secret
   - Entropy score
   - Specific remediation guidance

#### Request/Response

```typescript
// Request
POST /api/shieldx/scan-secrets
{
  "code": "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\n...",
  // OR for demo mode:
  "demo": true
}

// Response
{
  "mode": "paid" | "demo" | "free",
  "totalLines": 15,
  "findings": [
    {
      "id": "aws-access-key",
      "name": "AWS Access Key ID",
      "confidence": "high",
      "line": 2,
      "column": 19,
      "matchPreview": "AKIAIOSFODNN7EXA...MPLE",
      "entropy": 4.32,
      "remediation": "Use AWS IAM roles or environment variables..."
    }
  ],
  "stats": { "high": 3, "medium": 1, "low": 0, "total": 4 },
  "patternsChecked": 20,
  "timestamp": "2026-03-20T10:00:00.000Z"
}
```

#### Input Size Limits
- **Free:** 50,000 characters max
- **Pro/Enterprise:** 500,000 characters max

---

### 4.2 Dependency Scanner

**API Endpoint:** `POST /api/shieldx/scan-deps`  
**File:** `app/api/shieldx/scan-deps/route.ts`  
**Plan Access:** Demo (sample data), Pro, Enterprise  
**External APIs:** [OSV.dev API](https://osv.dev) (Google Open Source Vulnerabilities)

#### How It Works

1. **Input:** User pastes dependency manifest content (package.json, requirements.txt, build.gradle, go.mod)
2. **Ecosystem Detection:** Auto-detects the package ecosystem from content format
3. **Dependency Parsing:** Extracts package name + version pairs
4. **OSV.dev Query:** For each dependency, sends a POST request to:
   ```
   POST https://api.osv.dev/v1/query
   {
     "package": { "name": "express", "ecosystem": "npm" },
     "version": "4.17.1"
   }
   ```
5. **Batching:** Queries are batched in groups of 5 to respect API limits
6. **CVSS Mapping:** Severity scores mapped to categories:
   - ≥ 9.0 → Critical
   - ≥ 7.0 → High
   - ≥ 4.0 → Medium
   - < 4.0 → Low
7. **Output:** Vulnerability list with CVE IDs, summaries, fixed versions, references

#### Demo Mode
Uses a hardcoded fintech-app `package.json` with 7 known-vulnerable packages:
- express 4.17.1, lodash 4.17.20, axios 0.21.4, jsonwebtoken 8.5.1, moment 2.29.1, node-fetch 2.6.1, shell-quote 1.7.2

#### Rate Limiting
- **Demo:** 5 scans per hour per IP address (in-memory rate limiter)
- **Pro/Enterprise:** Enforced via `enforceShieldXScanLimit()` against user's plan limit

#### OSV.dev API Details
- **URL:** `https://api.osv.dev/v1/query`
- **Method:** POST
- **Rate Limit:** None (free API, no authentication required)
- **Data License:** CC-BY 4.0
- **Response includes:** CVE IDs, GHSA IDs, summaries, severity, affected ranges, fixed versions, references

---

### 4.3 API Security Scanner

**API Endpoint:** `POST /api/shieldx/scan-api`  
**File:** `app/api/shieldx/scan-api/route.ts`  
**Plan Access:** Demo (scans securecodereviews.com), Pro, Enterprise  
**External APIs:** Makes HTTP requests to the target URL

#### How It Works

1. **Input:** User provides a target URL (e.g., `https://api.example.com/v1/health`)
2. **SSRF Protection:** Blocks private/internal URLs:
   - `localhost`, `127.0.0.1`, `10.*`, `172.16-31.*`, `192.168.*`
   - AWS metadata endpoint (`169.254.169.254`)
   - Link-local addresses
3. **HTTP Requests:** Makes two requests to the target:
   - `GET {url}` — Main request with 8-second timeout
   - `OPTIONS {url}` — CORS preflight to detect allowed methods
4. **Security Header Analysis:** Checks 10+ response headers:
   - `Strict-Transport-Security` (HSTS)
   - `Content-Security-Policy` (CSP)
   - `X-Content-Type-Options`
   - `X-Frame-Options`
   - `Referrer-Policy`
   - `Permissions-Policy`
   - `X-XSS-Protection`
   - `Cache-Control`
   - `Set-Cookie` (Secure/HttpOnly/SameSite flags)
5. **OWASP API Top 10 2023 Checks:**
   - API1: Broken Object Level Authorization (BOLA)
   - API2: Broken Authentication
   - API3: Excessive Data Exposure
   - API4: Rate Limiting
   - API5: Broken Function Level Authorization
   - API6: Mass Assignment
   - API7: Security Misconfiguration
   - API8: Injection
   - API9: Improper Assets Management
   - API10: Insufficient Logging
6. **Scoring:** Weighted security score 0-10 based on severity of failures

#### SSRF Protection
The scanner blocks scanning of internal/private networks to prevent Server-Side Request Forgery:
```typescript
const BLOCKED_PATTERNS = [
  /^https?:\/\/localhost/i,
  /^https?:\/\/127\./,
  /^https?:\/\/10\./,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
  /^https?:\/\/192\.168\./,
  /^https?:\/\/169\.254\.169\.254/,  // AWS metadata
];
```

---

### 4.4 Cloud Security Audit

**API Endpoint:** `POST /api/shieldx/scan-cloud`  
**File:** `app/api/shieldx/scan-cloud/route.ts`  
**Plan Access:** Demo (sample Terraform), Pro, Enterprise  
**External APIs:** None (fully local, pattern-based analysis)

#### How It Works

1. **Input:** User pastes cloud infrastructure configuration (Terraform, CloudFormation, JSON/YAML/HCL)
2. **Pattern Analysis:** Runs 18 security checks across 6 categories:

| Category | Checks | Severity |
|----------|--------|----------|
| **IAM & Access** | Root access keys, Wildcard (*) permissions, MFA enforcement | Critical, Critical, High |
| **Encryption** | Encryption at rest, Encryption in transit, KMS key management | High, High, Medium |
| **Network** | Public access controls, Open sensitive ports, VPC flow logs | Critical, High, Medium |
| **Logging** | Audit logging (CloudTrail), Security alarms | High, Medium |
| **Storage** | Public S3/Blob buckets, Versioning | Critical, Medium |
| **Compute** | IMDSv2 enforcement, Auto-patching | High, Medium |
| **Credentials** | Hardcoded passwords/secrets in config | Critical |
| **Configuration** | Debug mode enabled | Medium |
| **Data Protection** | Backup & retention policy | Medium |

3. **Scoring:** Starts at 10, deducts based on severity:
   - Critical failure: -2.0 points
   - High failure: -1.5 points
   - Medium failure: -1.0 points
   - Warning: 40% of failure deduction
4. **Output:** Pass/Fail/Warn for each check with specific remediation detail

---

### 4.5 Threat Log Analyzer

**Status:** UI module available, scanning logic in workspace  
**Plan Access:** Pro, Enterprise

Analyzes pasted application/server logs for security threat patterns:
- Brute force attacks (multiple failed logins from same source)
- SQL injection patterns in request logs
- XSS payload detection
- Off-hours suspicious activity (00:00-05:59)
- Privilege escalation indicators
- Data exfiltration patterns (curl, wget to external IPs)
- Error rate spikes

---

### 4.6 CI/CD Pipeline Gate

**API Endpoint:** `POST /api/shieldx/ci-scan`  
**File:** `app/api/shieldx/ci-scan/route.ts`  
**Plan Access:** Enterprise  
**Authentication:** API Key (header: `x-shieldx-api-key`)

#### How It Works

Designed for automated pipeline integration. Accepts code via API key authentication and runs secrets + dependency scans in a single call.

```yaml
# GitHub Actions Example
name: ShieldX Security Gate
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run ShieldX Scan
        run: |
          RESULT=$(curl -s -X POST https://securecodereviews.com/api/shieldx/ci-scan \
            -H "Content-Type: application/json" \
            -H "x-shieldx-api-key: ${{ secrets.SHIELDX_API_KEY }}" \
            -d "{\"code\": \"$(cat package.json)\"}")
          SCORE=$(echo $RESULT | jq -r '.score // 0')
          if (( $(echo "$SCORE < 5" | bc -l) )); then
            echo "Security score too low: $SCORE"
            exit 1
          fi
```

---

### 4.7 Alert System

**API Endpoint:** `POST /api/shieldx/alerts`  
**File:** `app/api/shieldx/alerts/route.ts`  
**Plan Access:** Pro, Enterprise

Supports three notification channels:
- **Email:** Sends to user's registered email
- **Slack:** Webhook URL integration
- **Custom Webhook:** POST to any HTTPS endpoint

6 pre-configured alert rules:
1. Critical secrets detected
2. Critical CVEs in dependencies
3. Cloud security audit failures
4. Low API security score (< 5.0)
5. Injection attack patterns in logs
6. Brute force activity detected

---

### 4.8 Security Score

**Location:** Workspace tab (client-side calculation)  
**Plan Access:** Free (demo), Pro, Enterprise

Composite 0-10 score calculated from scan results across 5 dimensions:
- Secrets posture
- Dependency security
- Cloud compliance
- API hardening
- Log threat level

---

## 5. API Reference

### Authentication Methods

All scan APIs support two authentication methods:

1. **Session Token** (browser-based): Automatic via NextAuth.js JWT cookie
2. **API Key** (programmatic): Pass in request header `x-shieldx-api-key: <key>`

### Endpoints Summary

| Method | Endpoint | Auth | Plan | Purpose |
|--------|----------|------|------|---------|
| `POST` | `/api/shieldx/scan-secrets` | Session/Demo | Free+ | Secrets detection |
| `POST` | `/api/shieldx/scan-deps` | Session/API/Demo | Pro+ | Dependency CVE scan |
| `POST` | `/api/shieldx/scan-api` | Session/API/Demo | Pro+ | API security scan |
| `POST` | `/api/shieldx/scan-cloud` | Session/API/Demo | Pro+ | Cloud config audit |
| `POST` | `/api/shieldx/ci-scan` | API Key only | Enterprise | CI/CD pipeline scan |
| `GET` | `/api/shieldx/history` | Session | Pro+ | Scan history |
| `POST` | `/api/shieldx/api-key` | Session | Pro+ | Generate API key |
| `POST` | `/api/shieldx/alerts` | Session | Pro+ | Alert configuration |
| `POST` | `/api/shieldx/alerts/test` | Session | Pro+ | Test alert delivery |
| `POST` | `/api/shieldx/team` | Session | Enterprise | Team management |
| `POST` | `/api/shieldx/upgrade-plan` | Session (Admin) | Admin | Manual plan change |
| `POST` | `/api/shieldx/billing/checkout` | Session | Any | Create payment order |
| `GET` | `/api/shieldx/billing/subscription` | Session | Any | Get plan status |
| `POST` | `/api/shieldx/billing/cancel` | Session | Paid | Cancel subscription |
| `POST` | `/api/shieldx/billing/webhook` | Razorpay signature | N/A | Payment webhook |

### Error Response Format
```json
{
  "error": "Description of the error"
}
```

Common HTTP status codes:
- `400` — Invalid input
- `401` — Not authenticated
- `403` — Plan/feature access denied, scan limit exceeded
- `429` — Rate limit (demo mode)
- `500` — Server error

---

## 6. Authentication & Authorization

### Auth Flow

```
User Login → NextAuth.js → JWT Token (cookie) → API Route → Session Extraction → Plan Check → Scan
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | NextAuth configuration, JWT callbacks, session strategy |
| `lib/shieldx-access.ts` | Extract session user, plan checking, admin detection |
| `lib/shieldx-route-auth.ts` | Route-level authorization, feature gating, scan limits |
| `lib/feature-flags.ts` | Plan → feature mapping, scan limit lookup |
| `lib/shieldx-api-key.ts` | API key validation for programmatic access |

### Authorization Chain

```typescript
// 1. Extract session user from JWT
const sessionUser = await getShieldXSessionUser();

// 2. Check plan level (free=0, pro=1, enterprise=2)
hasShieldXAccess(user, "pro"); // returns true if user plan >= "pro"

// 3. Check specific feature access
enforceShieldXFeatureAccess(user, "dependency-audit"); // throws if not enabled

// 4. Enforce scan limits
enforceShieldXScanLimit(user, 1); // throws if limit exceeded
```

### Plan Feature Matrix

```typescript
const planFeatures = {
  free: ["basic-modules", "limited-scans", "demo", "secrets-scan"],
  pro: ["basic-modules", "api-security", "dependency-audit", "secrets-scan",
        "cloud-security", "log-analyzer", "alerts", "higher-scan-limit"],
  enterprise: ["all-modules", "unlimited-scans", "team-features",
               "advanced-reports", "cicd-integrations"]
};
```

### Scan Limits

| Plan | Monthly Limit |
|------|--------------|
| Demo | 2 scans |
| Free | 5 scans |
| Pro | 1,000 scans |
| Enterprise | Unlimited (9,999,999) |

---

## 7. Data Flow & Privacy

### Scan Data Flow

```
1. User pastes code in browser textarea
2. Browser sends code via HTTPS POST to API route
3. API route processes code in memory (Node.js runtime)
4. Results computed and returned as JSON response
5. Code is NEVER:
   - Written to disk
   - Stored in database
   - Logged to console/files
   - Sent to external services (except OSV.dev for package names only)
6. Only metadata is stored:
   - Scan type, timestamp, score, finding counts
   - NOT the source code or findings detail
```

### What Is Stored vs. Not Stored

| Data | Stored? | Where |
|------|---------|-------|
| User account (name, email, password hash) | Yes | MongoDB |
| Scan count per user | Yes | MongoDB (users.shieldxScanCount) |
| Scan history metadata (type, score, counts) | Yes | MongoDB (scans collection) |
| Source code / config content | **No** | Never persisted |
| Scan findings detail | **No** | Only returned to browser |
| Dependency names/versions | Transient | Sent to OSV.dev, not stored |
| API scan target URLs | Transient | Only during scan execution |

### OSV.dev Data Usage
- Only **package name** and **version** are sent to OSV.dev
- No source code, no user identity, no session data
- OSV.dev responses (vulnerability data) are CC-BY 4.0 licensed
- Data attribution: "Vulnerability data sourced from OSV.dev by Google"

---

## 8. Billing & Plans

### Payment Flow (Razorpay)

```
1. User clicks "Upgrade to Pro" → /shieldx/pricing
2. Frontend calls POST /api/shieldx/billing/checkout
3. Backend creates Razorpay order (amount, currency)
4. Razorpay checkout modal opens in browser
5. User completes payment
6. Razorpay sends webhook to POST /api/shieldx/billing/webhook
7. Webhook handler:
   a. Verifies signature using timingSafeEqual
   b. Updates user: shieldxPlan="pro", shieldxExpiry=+30 days
   c. Creates ShieldXBillingEvent record
8. User refreshes → session reflects new plan
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/razorpay.ts` | Razorpay client initialization, signature verification |
| `app/api/shieldx/billing/checkout/route.ts` | Create payment order |
| `app/api/shieldx/billing/webhook/route.ts` | Handle payment confirmation |
| `app/api/shieldx/billing/subscription/route.ts` | Get current plan status |
| `app/api/shieldx/billing/cancel/route.ts` | Cancel subscription |
| `models/ShieldXBillingEvent.ts` | Billing event audit log |

### Plan Sources

A user's plan can come from different sources:
- `free` — Default, no payment
- `admin` — Manually set by admin via upgrade-plan API
- `billing` — Set by Razorpay webhook after successful payment
- `team` — Inherited from enterprise team membership

### Plan Expiry Check

```typescript
function getEffectiveShieldXPlan(user) {
  const plan = user.shieldxPlan || "free";
  if (plan === "free" || !user.shieldxExpiry) return plan;
  const expiry = new Date(user.shieldxExpiry);
  if (expiry.getTime() > Date.now()) return plan;  // Not expired
  return "free";  // Expired → downgrade to free
}
```

---

## 9. External APIs & Data Sources

### OSV.dev (Google Open Source Vulnerabilities)

| Property | Value |
|----------|-------|
| **URL** | `https://api.osv.dev/v1/query` |
| **Method** | POST |
| **Auth** | None (free, open API) |
| **Rate Limit** | None documented (be respectful) |
| **Data License** | CC-BY 4.0 |
| **Coverage** | npm, PyPI, Go, Maven, Crates.io, NuGet, and more |
| **Used By** | Dependency Scanner (`scan-deps`) |

**Request example:**
```json
{
  "package": { "name": "lodash", "ecosystem": "npm" },
  "version": "4.17.20"
}
```

**Response includes:** Vulnerability ID, aliases (CVE-xxx), summary, severity (CVSS), affected version ranges, fixed versions, references.

### Razorpay (Payment Gateway)

| Property | Value |
|----------|-------|
| **URL** | `https://api.razorpay.com/v1/*` |
| **Auth** | Basic auth (key_id:key_secret) |
| **Webhook** | HMAC SHA256 signature verification |
| **Used By** | Billing checkout, webhook, subscription management |
| **Env Vars** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |

### No Other External APIs

The Secrets Scanner, Cloud Audit, Log Analyzer, Alert System, and Security Score modules are **fully local** — they use regex patterns, heuristic analysis, and client-side calculations with zero external API calls.

---

## 10. Database Schema

### Users Collection

```typescript
{
  name: String,              // Display name
  email: String,             // Unique, lowercase
  password: String,          // bcrypt hash (select: false)
  role: "user" | "admin",
  company: String | null,     // Optional company name
  
  // ShieldX Plan
  shieldxPlan: "free" | "pro" | "enterprise",
  shieldxPlanSource: "free" | "admin" | "billing" | "team",
  shieldxExpiry: Date | null,
  shieldxScanCount: Number,   // Tracks total scans for limit enforcement
  
  // Billing
  shieldxBillingProvider: "razorpay" | null,
  shieldxBillingStatus: String,
  shieldxSubscriptionId: String | null,
  shieldxPlanId: String | null,
  shieldxCustomerId: String | null,
  shieldxCancelAtPeriodEnd: Boolean,
  
  // API Key
  shieldxApiKeyHash: String | null,
  shieldxApiKeyPrefix: String | null,
  
  // Team
  shieldxTeamId: ObjectId | null,
  shieldxSeatRole: "owner" | "admin" | "member" | "viewer" | null,
  
  // Auth
  passwordResetRequired: Boolean,
  passwordResetToken: String | null,
  passwordResetExpiry: Date | null,
  
  timestamps: true  // createdAt, updatedAt
}
```

### ShieldXScan Collection (History)

```typescript
{
  userId: ObjectId,
  scanType: String,           // "secrets", "deps", "api", "cloud", "ci"
  title: String,              // Scan description
  overallScore: Number,       // 0-10
  counts: {
    critical: Number,
    high: Number,
    medium: Number,
    low: Number,
    findingsTotal: Number
  },
  status: String,             // "completed", "failed"
  
  // Input metadata (NOT the code itself)
  inputType: String,          // "code", "url", "config"
  inputSize: Number,          // Character count
  
  timestamps: true
}
```

### ShieldXTeam Collection

```typescript
{
  name: String,               // Workspace name
  ownerId: ObjectId,          // Enterprise account owner
  ownerName: String,
  companyName: String,
  maxSeats: Number,           // 25 default
  members: [{
    userId: ObjectId,
    email: String,
    role: "owner" | "admin" | "member" | "viewer",
    joinedAt: Date
  }],
  
  timestamps: true
}
```

### ShieldXAlertConfig Collection

```typescript
{
  userId: ObjectId,
  channels: {
    email: Boolean,
    slack: { enabled: Boolean, webhookUrl: String | null },
    webhook: { enabled: Boolean, url: String | null }
  },
  threshold: "critical" | "high" | "all",
  rules: [{
    id: String,
    name: String,
    enabled: Boolean,
    severity: String
  }],
  
  timestamps: true
}
```

---

## 11. Deployment Architecture

### Vercel (Production)

```
GitHub (hackwithabx/sccrs) → Vercel (auto-deploy on push to main)

Infrastructure:
├── Edge Network (CDN for static assets)
├── Serverless Functions (API routes, max 30s timeout)
├── Environment Variables:
│   ├── MONGODB_URI
│   ├── NEXTAUTH_SECRET
│   ├── NEXTAUTH_URL
│   ├── RAZORPAY_KEY_ID
│   ├── RAZORPAY_KEY_SECRET
│   ├── RAZORPAY_WEBHOOK_SECRET
│   ├── ADMIN_USERNAME
│   └── ADMIN_PASSWORD_HASH
└── Build: Next.js static + dynamic routes
```

### Rate Limiting

Current implementation uses **in-memory rate limiting** (per-function instance):
- Effective for single-instance or low-traffic scenarios
- Resets on cold starts (serverless limitation)
- For production scale: migrate to Redis/Upstash for distributed rate limiting

---

## 12. CI/CD Integration Guide

### GitHub Actions

```yaml
name: ShieldX Security Scan
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: ShieldX Dependency Scan
        run: |
          RESULT=$(curl -s -X POST https://securecodereviews.com/api/shieldx/scan-deps \
            -H "Content-Type: application/json" \
            -H "x-shieldx-api-key: ${{ secrets.SHIELDX_API_KEY }}" \
            -d "{\"input\": $(cat package.json | jq -Rs .)}")
          echo "Scan Result:"
          echo "$RESULT" | jq .
          CRITICAL=$(echo "$RESULT" | jq -r '.stats.critical // 0')
          if [ "$CRITICAL" -gt 0 ]; then
            echo "::error::Critical vulnerabilities found!"
            exit 1
          fi
      
      - name: ShieldX Secrets Scan
        run: |
          # Combine source files for scanning
          CODE=$(find src -name "*.ts" -o -name "*.js" | head -20 | xargs cat)
          RESULT=$(curl -s -X POST https://securecodereviews.com/api/shieldx/scan-secrets \
            -H "Content-Type: application/json" \
            -H "x-shieldx-api-key: ${{ secrets.SHIELDX_API_KEY }}" \
            -d "{\"code\": $(echo "$CODE" | jq -Rs .)}")
          HIGH=$(echo "$RESULT" | jq -r '.stats.high // 0')
          if [ "$HIGH" -gt 0 ]; then
            echo "::error::High-confidence secrets detected!"
            exit 1
          fi
```

### GitLab CI

```yaml
shieldx-scan:
  stage: test
  image: curlimages/curl:latest
  script:
    - |
      RESULT=$(curl -s -X POST https://securecodereviews.com/api/shieldx/scan-deps \
        -H "Content-Type: application/json" \
        -H "x-shieldx-api-key: ${SHIELDX_API_KEY}" \
        -d "{\"input\": $(cat package.json | jq -Rs .)}")
      CRITICAL=$(echo "$RESULT" | jq -r '.stats.critical // 0')
      if [ "$CRITICAL" -gt 0 ]; then exit 1; fi
```

### cURL (Any CI)

```bash
# Secrets scan
curl -s -X POST https://securecodereviews.com/api/shieldx/scan-secrets \
  -H "Content-Type: application/json" \
  -H "x-shieldx-api-key: YOUR_API_KEY" \
  -d '{"code": "your source code here..."}'

# Dependency scan
curl -s -X POST https://securecodereviews.com/api/shieldx/scan-deps \
  -H "Content-Type: application/json" \
  -H "x-shieldx-api-key: YOUR_API_KEY" \
  -d '{"input": "{\"dependencies\":{\"express\":\"4.17.1\"}}"}'

# API scan
curl -s -X POST https://securecodereviews.com/api/shieldx/scan-api \
  -H "Content-Type: application/json" \
  -H "x-shieldx-api-key: YOUR_API_KEY" \
  -d '{"url": "https://api.example.com"}'

# Cloud config audit
curl -s -X POST https://securecodereviews.com/api/shieldx/scan-cloud \
  -H "Content-Type: application/json" \
  -H "x-shieldx-api-key: YOUR_API_KEY" \
  -d '{"config": "resource aws_s3_bucket..."}'
```

---

## 13. Security Hardening

### Implemented Security Controls

| Control | Implementation |
|---------|---------------|
| **SSRF Protection** | API scanner blocks private IPs, metadata endpoints |
| **Input Validation** | Size limits, type checking on all endpoints |
| **Rate Limiting** | In-memory per-IP for demo, per-user for paid |
| **Auth Bypass Prevention** | Dual auth check (session + API key) |
| **Timing Attack Protection** | `timingSafeEqual` for webhook signature verification |
| **XSS Prevention** | React auto-escaping, no `dangerouslySetInnerHTML` |
| **CSRF Protection** | SameSite cookies, same-origin fetch |
| **SQL Injection** | N/A (MongoDB/Mongoose with parameterized queries) |
| **Password Policy** | 10 chars min, uppercase, lowercase, number, special char |
| **Password Storage** | bcrypt with salt rounds |
| **Session Security** | JWT with server-side validation, configurable expiry |

### Known Limitations (Planned Improvements)

1. **In-memory rate limiter** — Resets on serverless cold starts. Migrate to Redis/Upstash for production scale.
2. **Single admin password** — Currently shared. Needs per-user admin accounts with RBAC.
3. **CSP unsafe-inline** — Required by Next.js + Google Analytics. Working on nonce-based CSP.
4. **Team invite token** — Generated but not fully verified in accept flow. Needs crypto-verified invite links.

---

## File Directory Map

```
app/shieldx/
├── page.tsx              # Main workspace (scan UIs, module cards, results)
├── layout.tsx            # Layout wrapper
├── docs/
│   ├── page.tsx          # Product documentation page
│   └── layout.tsx        # Docs layout
└── pricing/
    └── page.tsx          # Pricing plans page

app/api/shieldx/
├── scan-secrets/route.ts     # Secrets scanner API
├── scan-deps/route.ts        # Dependency scanner API
├── scan-api/route.ts         # API security scanner API
├── scan-cloud/route.ts       # Cloud security audit API
├── ci-scan/route.ts          # CI/CD pipeline scan API
├── history/route.ts          # Scan history API
├── api-key/route.ts          # API key management
├── alerts/
│   ├── route.ts              # Alert configuration
│   └── test/route.ts         # Test alert delivery
├── team/route.ts             # Team management (Enterprise)
├── upgrade-plan/route.ts     # Admin plan change
├── demo-signup/route.ts      # Demo registration
└── billing/
    ├── checkout/route.ts     # Create payment order
    ├── subscription/route.ts # Get plan status
    ├── cancel/route.ts       # Cancel subscription
    └── webhook/route.ts      # Razorpay payment webhook

lib/
├── shieldx-access.ts         # Session user extraction, plan checks
├── shieldx-route-auth.ts     # Route-level auth, RBAC, scan limits
├── shieldx-api-key.ts        # API key generation and validation
├── shieldx-alerts.ts         # Alert delivery logic
├── shieldx-billing.ts        # Billing utilities
├── feature-flags.ts          # Plan → feature mapping
├── rate-limit.ts             # In-memory rate limiter
├── mongodb.ts                # Database connection
└── razorpay.ts               # Razorpay client & signature verification

models/
├── User.ts                   # User schema (includes ShieldX fields)
├── ShieldXScan.ts            # Scan history records
├── ShieldXTeam.ts            # Enterprise team management
├── ShieldXAlertConfig.ts     # Alert configuration
└── ShieldXBillingEvent.ts    # Billing audit log
```

---

*This document is maintained by the SecureCodeReviews engineering team. For questions, contact engineering@securecodereviews.com*
