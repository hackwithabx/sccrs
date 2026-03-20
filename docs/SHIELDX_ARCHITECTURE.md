# ShieldX — Detailed Architecture & Developer Documentation

**Version:** 2.4  
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
   - 4.7 [Alert System (Hidden)](#47-alert-system-hidden)
   - 4.8 [Security Score](#48-security-score)
5. [API Reference](#5-api-reference)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Data Flow & Privacy](#7-data-flow--privacy)
8. [Billing & Plans (Hidden)](#8-billing--plans-hidden)
9. [External APIs & Data Sources](#9-external-apis--data-sources)
10. [Database Schema](#10-database-schema)
11. [Deployment Architecture](#11-deployment-architecture)
12. [CI/CD Integration Guide](#12-cicd-integration-guide)
13. [Security Hardening](#13-security-hardening)
14. [Known Limitations & Technical Boundaries](#14-known-limitations--technical-boundaries)

---

## 1. System Overview

ShieldX is a multi-module application security platform built as part of the SecureCodeReviews.com (SCRs) Next.js application. It operates as a SaaS product with plan tiers managed via admin provisioning.

> **Note (v2.1):** Billing (Razorpay) and Email Alerts are **hidden from the UI** but fully preserved in the backend. They can be re-enabled when the corresponding environment variables are configured. All pricing/upgrade links have been replaced with "Request Pro Access" flows.

| Plan | Active UI Modules | Scan Limit | History | API Key | Team Seats | Provisioning |
|------|-------------------|-----------|---------|---------|-----------|-------|
| **Free/Demo** | Secrets, Score (demo only) | 5 total | No | No | No | Default |
| **Pro** | 6 modules (all except CI/CD) | 1,000/month | Yes | Yes | No | Admin-assigned |
| **Enterprise** | All 7 active modules | Unlimited | Yes | Yes | 25+ seats | Admin-assigned |

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
| **Razorpay** | Payment processing (India/global) — *hidden from UI* | Yes (server-side) |
| **MongoDB Atlas** | Database hosting | Yes (connection string) |
| **Vercel** | Hosting & deployment | Automatic via Git |

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ShieldX Workspace (/shieldx)                                   │
│  ├── Module Cards (7 active — alerts hidden from UI)            │
│  ├── Scan Input Panel (textarea / URL / dual-input for CI/CD)   │
│  ├── Results Display (findings, scores, PASS/FAIL verdict)      │
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
│  ├── POST /api/shieldx/alerts           (Alert Config) [hidden] │
│  ├── POST /api/shieldx/alerts/test      (Test Alert)   [hidden] │
│  ├── POST /api/shieldx/team             (Team Management)       │
│  ├── POST /api/shieldx/upgrade-plan     (Admin Plan Change)     │
│  └── POST /api/shieldx/demo-signup      (Demo Registration)     │
│                                                                 │
│  Billing Endpoints (hidden from UI):                            │
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
     └───────────────┘  │    (hidden in UI) │
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

**API Endpoint:** `POST /api/shieldx/scan-logs`  
**File:** `app/api/shieldx/scan-logs/route.ts`  
**Plan Access:** Pro, Enterprise  
**Input Limit:** 1 MB  
**Demo:** Available (pre-loaded security-incident log sample)

#### How It Works

Analyzes pasted server/application/access logs against 11 threat detection patterns:

| # | Pattern | Severity | Detection Method |
|---|---------|----------|-----------------|
| 1 | Brute Force Attack | Critical | 5+ failed logins, IP clustering |
| 2 | SQL Injection Attempt | Critical | UNION SELECT, OR 1=1, SLEEP() |
| 3 | Command Injection | Critical | Shell metacharacters (;cat, \|whoami, backtick) |
| 4 | Privilege Escalation | Critical | sudo, role changes, setuid |
| 5 | XSS Attempt | High | `<script>`, javascript:, onerror= |
| 6 | Path Traversal | High | ../../etc/passwd, directory sequences |
| 7 | Data Exfiltration | High | mysqldump, curl\|sh, cloud uploads |
| 8 | Sensitive Data in Logs | High | Passwords, credit cards, bearer tokens |
| 9 | High-Frequency IP | Medium | IPs with >30% of total requests |
| 10 | Error Rate Spike | Medium | 500/502/503/504 errors >20% rate |
| 11 | Off-Hours Activity | Low | Activity between 00:00–05:59 |

#### Request / Response
```json
// Request
{ "logs": "2026-03-20 02:14:33 [INFO] ... POST /api/login - 401 Unauthorized ..." }

// Response
{
  "mode": "paid",
  "findings": [
    {
      "patternId": "brute-force",
      "name": "Brute Force Attack",
      "category": "Authentication",
      "severity": "critical",
      "evidence": ["192.168.1.105 - POST /api/login - 401 Unauthorized ..."],
      "count": 6,
      "detail": "6 failed login attempts from IP 192.168.1.105",
      "remediation": "Implement account lockout after 5 failed attempts..."
    }
  ],
  "stats": { "critical": 2, "high": 3, "medium": 1, "low": 0, "total": 6 },
  "totalLines": 35,
  "patternsChecked": 11
}
```

---

### 4.6 CI/CD Pipeline Gate

**API Endpoint:** `POST /api/shieldx/ci-scan`  
**File:** `app/api/shieldx/ci-scan/route.ts`  
**Plan Access:** Enterprise (API key), Pro+ (browser session)  
**Authentication:** API Key (header: `x-shieldx-api-key`) or NextAuth session  
**UI Status:** ✅ Full interactive UI in workspace (added v2.1)

#### How It Works

Runs secrets detection + dependency vulnerability scanning in a single combined scan. Available both as a browser-based interactive module and as a headless API for CI/CD pipeline integration.

**Scan Types:**

| Type | What It Does |
|------|-------------|
| `full` | Runs both secrets scan and dependency scan, merges results |
| `secrets` | Secrets detection only on submitted code |
| `dependencies` | Dependency CVE lookup only against OSV.dev |

#### Browser UI (Workspace)

1. **Module Selection:** User clicks the "CI/CD Pipeline Gate" card in the workspace
2. **Scan Type Selector:** Dropdown to choose Full Scan, Secrets Only, or Dependencies Only
3. **Dual Input Panel:**
   - **Code / Config** textarea — Source code to scan for secrets
   - **Dependencies (package.json)** textarea — Dependency manifest for CVE scanning
   - For secrets-only or deps-only scans, only the relevant input is required
4. **Execution:** Calls `POST /api/shieldx/ci-scan` with `{ code, dependencies, scanType }`
5. **Result Rendering:**
   - **PASS / FAIL verdict banner** (green/red) with exit code
   - **Secrets sub-results** — finding count with severity breakdown, individual findings with line/column, masked preview, remediation
   - **Dependency sub-results** — vulnerability count with severity breakdown, affected packages with CVE IDs, fixed versions, summaries
6. **Pipeline Snippet:** Collapsible GitHub Actions YAML snippet for CI/CD integration

#### API (Headless Pipeline Use)

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
            -d "{\"code\": \"$(cat src/**/*.ts)\", \"dependencies\": \"$(cat package.json)\", \"scanType\": \"full\"}")
          VERDICT=$(echo $RESULT | jq -r '.verdict')
          if [ "$VERDICT" = "FAIL" ]; then
            echo "::error::Security gate failed"
            exit 1
          fi
```

#### Request/Response

```typescript
// Request
POST /api/shieldx/ci-scan
{
  "code": "const key = 'AKIAIOSFODNN7EXAMPLE'...",
  "dependencies": "{\"dependencies\":{\"express\":\"4.17.1\"}}",
  "scanType": "full" | "secrets" | "dependencies"
}

// Response
{
  "verdict": "PASS" | "FAIL",
  "exitCode": 0 | 1,
  "secrets": {
    "findings": [...],
    "stats": { "high": 0, "medium": 0, "low": 0, "total": 0 }
  },
  "dependencies": {
    "vulnerabilities": [...],
    "stats": { "critical": 0, "high": 0, "medium": 0, "low": 0, "total": 0 }
  },
  "timestamp": "2026-03-20T10:00:00.000Z"
}
```

---

### 4.7 Alert System (Hidden)

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

**Location:** Workspace module panel (client-side aggregation of scan history)  
**Plan Access:** Free (locked view), Pro, Enterprise  
**UI Status:** ✅ Full interactive dashboard (added v2.1)

Interactive dashboard that computes a real composite security score from scan history data. No mock data — all metrics are derived from actual scan results.

#### Dashboard Components

1. **Composite Score** — Weighted average (0–10) across all historical scan results, displayed as a large score badge with color coding (green ≥7, amber ≥4, red <4)
2. **Severity Breakdown** — Aggregate counts of Critical, High, Medium, Low findings across all scans
3. **Per-Module Scores** — Individual latest and average scores for each scan module (Secrets, Dependencies, API, Cloud, Logs, CI/CD) with scan count and last scanned date
4. **Trend Indicator** — Compares newer half vs older half of scan scores to show if security posture is improving, declining, or stable (requires ≥4 scans)

#### Data Source

All data comes from the `scanHistory` state (loaded via `GET /api/shieldx/history`). No additional API calls are made — the score is computed entirely client-side from existing scan history records.

#### Free/Demo Users

Shows a locked view explaining that scan data from a paid plan is required. No fake scores or demo data are displayed.

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
| `POST` | `/api/shieldx/ci-scan` | Session/API Key | Enterprise | CI/CD pipeline scan (UI + API) |
| `GET` | `/api/shieldx/history` | Session | Pro+ | Scan history |
| `POST` | `/api/shieldx/api-key` | Session | Pro+ | Generate API key |
| `POST` | `/api/shieldx/alerts` | Session | Pro+ | Alert configuration *(hidden from UI)* |
| `POST` | `/api/shieldx/alerts/test` | Session | Pro+ | Test alert delivery *(hidden from UI)* |
| `POST` | `/api/shieldx/team` | Session | Enterprise | Team management |
| `POST` | `/api/shieldx/upgrade-plan` | Session (Admin) | Admin | Manual plan change |
| `POST` | `/api/shieldx/billing/checkout` | Session | Any | Create payment order *(hidden from UI)* |
| `GET` | `/api/shieldx/billing/subscription` | Session | Any | Get plan status *(hidden from UI)* |
| `POST` | `/api/shieldx/billing/cancel` | Session | Paid | Cancel subscription *(hidden from UI)* |
| `POST` | `/api/shieldx/billing/webhook` | Razorpay signature | N/A | Payment webhook *(hidden from UI)* |

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

### Auth Resilience (v2.2)

All scanner routes handle expired/invalid sessions gracefully:

| Scenario | Behavior |
|----------|----------|
| **Demo mode** (`demo: true`) | Auth call skipped entirely. Rate limited to 5/hr per IP. |
| **Valid session, paid plan** | Full scan with history tracking. |
| **Valid session, free plan** | Scan with reduced limits (secrets only). |
| **No session + no input** | Graceful fallback to demo results (secrets scanner). |
| **No session + input provided** | Returns "Session expired. Please sign in again." (401) |
| **Expired JWT** | Returns actionable error instead of generic "Authentication required". |

Auth call ordering (v2.2): Demo mode is checked **before** calling `getShieldXAuthorizedUser()` in all scanners, avoiding unnecessary auth overhead for demo users.

### Admin Access Control (v2.3)

The `/admin` portal is protected by **defense in depth** with two layers:

1. **Middleware (NextAuth role check):** Only users with `role: "admin"` in their NextAuth JWT can access `/admin` page routes. Non-admin users are silently redirected to the homepage. This prevents non-admin users from even seeing the admin login form.
2. **Admin Password (HMAC token):** Admin-role users must also enter the `ADMIN_PASSWORD` to authenticate. A signed `scr-admin-token` cookie is issued on success.

| Path | No Admin Token | Valid Admin Token |
|------|---------------|-------------------|
| `/admin` (page) | Check NextAuth role → redirect if not admin | Allow through |
| `/api/admin/*` (except auth) | 401 Unauthorized | Allow through |
| `/api/admin/auth` | Always allowed (login endpoint) | Always allowed |

**File:** `middleware.ts` — uses `getToken()` from `next-auth/jwt` to decode the NextAuth session.

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

## 8. Billing & Plans (Hidden)

> **Status (v2.1):** Billing UI (pricing page, upgrade links, plan comparison) is **hidden from the product UI**. All backend routes, models, and Razorpay integration code are fully preserved. Plans are currently provisioned via admin API (`POST /api/shieldx/upgrade-plan`). To re-enable self-service billing, uncomment the pricing links and billing UI components (search for `// Hidden`) and configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` environment variables.

### Payment Flow (Razorpay) — Currently Inactive in UI

```
1. User clicks "Request Pro Access" → contact flow (was: "Upgrade to Pro" → /shieldx/pricing)
2. Admin provisions plan via POST /api/shieldx/upgrade-plan
   — OR (when billing is re-enabled) —
3. Frontend calls POST /api/shieldx/billing/checkout
4. Backend creates Razorpay order (amount, currency)
5. Razorpay checkout modal opens in browser
6. User completes payment
7. Razorpay sends webhook to POST /api/shieldx/billing/webhook
8. Webhook handler:
   a. Verifies signature using timingSafeEqual
   b. Updates user: shieldxPlan="pro", shieldxExpiry=+30 days
   c. Creates ShieldXBillingEvent record
9. User refreshes → session reflects new plan
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

### Razorpay (Payment Gateway) — Hidden from UI

> Backend integration is intact but not exposed in the product UI. Re-enable by configuring env vars and uncommenting billing UI components.

| Property | Value |
|----------|-------|
| **URL** | `https://api.razorpay.com/v1/*` |
| **Auth** | Basic auth (key_id:key_secret) |
| **Webhook** | HMAC SHA256 signature verification |
| **Used By** | Billing checkout, webhook, subscription management |
| **Env Vars** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |
| **UI Status** | ❌ Hidden — pricing page exists but is unlinked |

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
├── layout.tsx            # Layout wrapper + SEO metadata
├── docs/
│   ├── page.tsx          # Product documentation (alerts section hidden)
│   └── layout.tsx        # Docs layout + metadata
└── pricing/
    ├── page.tsx          # Pricing plans page (exists but unlinked from nav)
    └── layout.tsx        # Pricing metadata

app/api/shieldx/
├── scan-secrets/route.ts     # Secrets scanner API
├── scan-deps/route.ts        # Dependency scanner API
├── scan-api/route.ts         # API security scanner API
├── scan-cloud/route.ts       # Cloud security audit API
├── scan-logs/route.ts        # Threat log analyzer API
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

## 14. Known Limitations & Technical Boundaries

ShieldX is a real, production-grade scanning platform. Below are honest technical boundaries that clients should be aware of.

### Scanning Methodology

| Module | Method | What This Means |
|--------|--------|----------------|
| Secrets Scanner | Regex matching + Shannon entropy | Detects patterns from a curated list of 20+ secret formats. May miss novel or custom credential formats not in the pattern set. Not AST/semantic analysis. |
| Dependency Scanner | Live API calls to OSV.dev | Real CVE database queries. Only detects vulnerabilities that exist in the OSV.dev database. Does not perform reachability analysis (cannot tell if a vulnerable function is actually called in your code). |
| API Security Scanner | Real HTTP GET + OPTIONS requests | Tests publicly accessible endpoints only. Cannot test authenticated endpoints requiring login. Cannot detect business logic flaws. |
| Cloud Security Audit | Pattern matching on config text | Analyzes Terraform/CloudFormation syntax. Does not connect to actual AWS/Azure/GCP APIs — cannot detect runtime misconfigurations not reflected in code. |
| Threat Log Analyzer | Regex pattern detection (11 patterns) | Detects common attack signatures in log text. Not a SIEM or ML-based anomaly detection system. May miss zero-day or novel attack patterns. |
| CI/CD Pipeline Gate | Runs secrets + deps scans on submitted code | Same limitations as individual scanners apply. |

### Infrastructure Boundaries

| Limitation | Details | Mitigation |
|-----------|---------|------------|
| **In-memory rate limiter** | Resets on serverless cold starts (Vercel) | Sufficient for current scale. Redis migration planned for higher volume. |
| **No distributed caching** | Scan results are not cached between requests | Each scan is fresh — ensures current results but adds latency. |
| **Alert delivery — no retry** | If email/Slack/webhook delivery fails, it is not retried | Configure multiple alert channels for redundancy. |
| **API key — no scopes** | API keys grant full access to all scan endpoints | Planned: per-endpoint scopes and read-only keys. |
| **Single API key per user** | Users can only have one active API key | Regenerate key to rotate. Multiple keys planned. |

### What ShieldX Is NOT

- **Not a SAST tool** — Does not perform static analysis on compiled code or parse abstract syntax trees
- **Not a DAST tool** — Does not crawl web applications or test for runtime vulnerabilities
- **Not a SIEM** — Log analyzer is pattern-based, not behavioral/ML-based
- **Not a compliance certifier** — Helps with OWASP/CIS alignment but does not issue compliance certificates
- **Not a WAF** — Detects issues but does not block traffic

---

## Changelog

### v2.4 (March 20, 2026)
- **Graceful Auth Fallback** — All 5 scanner routes now fall back to demo mode when server-side authentication fails, instead of returning "Session expired" errors. This handles the edge case where the client has a valid NextAuth session but the server-side JWT is invalid (e.g., `NEXTAUTH_SECRET` mismatch between environments, or token expired mid-session). User-provided code/config is still scanned in demo mode with rate limiting (5/hr per IP).
- **Files changed:** `scan-secrets/route.ts`, `scan-deps/route.ts`, `scan-api/route.ts`, `scan-cloud/route.ts`, `scan-logs/route.ts`

### v2.3 (March 20, 2026)
- **Admin Access Control Fix** — Critical security fix: `/admin` page routes now require NextAuth session with `role: "admin"`. Previously, any user could navigate to `/admin` and see the admin login form (broken access control, OWASP A01). Non-admin users are now silently redirected to the homepage. Defense in depth: admin users still require `ADMIN_PASSWORD` to authenticate.
- **File changed:** `middleware.ts`

### v2.2 (March 20, 2026)
- **Scanner Auth Flow Improvements** — All 5 scanner routes updated with resilient auth handling. Demo mode is now checked before auth calls (deps, api scanners reordered). Secrets scanner adds graceful demo fallback when session is expired and no code is provided. All scanners return actionable "Session expired or Pro plan required" messages instead of generic errors.
- **Files changed:** `scan-secrets/route.ts`, `scan-deps/route.ts`, `scan-api/route.ts`, `scan-cloud/route.ts`, `scan-logs/route.ts`

### v2.1 (March 20, 2026)
- **Security Score Dashboard** — Fully wired interactive dashboard showing real composite score from scan history. Includes severity breakdown, per-module scores (latest + average), and trend tracking. No mock data — all metrics from actual scan results.
- **Auto-scroll on module click** — Clicking any module card now smoothly scrolls to the scan panel.
- **CI/CD Pipeline Gate** — Full interactive UI added to the workspace. Users can select scan type (full/secrets/dependencies), provide dual inputs (code + dependencies), and see PASS/FAIL verdict with detailed sub-results. GitHub Actions snippet included in the panel.
- **Billing (Razorpay)** — Hidden from product UI. All backend routes, models, and Razorpay integration preserved. Plans now provisioned via admin API. "Upgrade to Pro" links replaced with "Request Pro Access" contact flows.
- **Email Alerts** — Hidden from product UI. Backend API routes and models preserved. Requires SMTP environment variables to re-enable.
- **Docs & Dashboard** — Updated to remove references to billing and alerts features. Pricing page exists but is unlinked from navigation.
- **Re-enable guide:** Search codebase for `// Hidden` comments to find all hidden UI sections.

### v2.0 (March 2026)
- Initial comprehensive architecture documentation
- Full module documentation for all 8 modules
- API reference, auth flow, data privacy, deployment architecture

---

*This document is maintained by the SecureCodeReviews engineering team. For questions, contact engineering@securecodereviews.com*
