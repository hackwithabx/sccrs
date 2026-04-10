import { BlogPost } from "./blog-data";

export const trafficBatch2Articles: BlogPost[] = [
  {
    slug: "rate-limiting-api-nodejs-express-guide",
    title: "Rate Limiting APIs: The Complete Node.js & Express Implementation Guide",
    excerpt:
      "Token buckets, sliding windows, Redis-backed limiters, and Cloudflare rules — every rate limiting strategy explained with production-ready code.",
    content: `## Why Rate Limiting Is Your First Line of Defense

Every API without rate limiting is a DDoS target, a credential stuffing playground, and a cost explosion waiting to happen.

| Attack | Without Rate Limiting | With Rate Limiting |
|--------|----------------------|-------------------|
| Credential stuffing | 100K attempts/minute | 5 attempts/minute |
| API scraping | Full database exfiltration | Partial data, slowed |
| DDoS | Service down | Graceful degradation |
| Brute force OTP | Cracked in seconds | Locked after 3 tries |
| Cloud cost attack | $50K surprise bill | Capped at normal usage |

---

## Strategy 1: Fixed Window Counter

Simplest approach — count requests per time window.

\`\`\`typescript
// Simple in-memory fixed window (single server only)
const windowMs = 60 * 1000; // 1 minute
const maxRequests = 100;
const clients = new Map<string, { count: number; resetAt: number }>();

function fixedWindowLimit(clientId: string): boolean {
  const now = Date.now();
  const client = clients.get(clientId);
  
  if (!client || now > client.resetAt) {
    clients.set(clientId, { count: 1, resetAt: now + windowMs });
    return true; // Allowed
  }
  
  if (client.count >= maxRequests) {
    return false; // Rate limited
  }
  
  client.count++;
  return true;
}
\`\`\`

**Flaw:** Burst at window boundary. A client can send 100 requests at 0:59 and 100 more at 1:00 — 200 requests in 2 seconds.

---

## Strategy 2: Sliding Window Log

Tracks exact timestamps of each request. More accurate, more memory.

\`\`\`typescript
function slidingWindowLog(clientId: string, window: number, max: number): boolean {
  const now = Date.now();
  const key = \\\`ratelimit:\${clientId}\\\`;
  
  // Get request timestamps for this client
  let timestamps = requestLogs.get(key) || [];
  
  // Remove expired timestamps
  timestamps = timestamps.filter(t => t > now - window);
  
  if (timestamps.length >= max) {
    return false;
  }
  
  timestamps.push(now);
  requestLogs.set(key, timestamps);
  return true;
}
\`\`\`

---

## Strategy 3: Token Bucket (Best for APIs)

Allows bursts while maintaining average rate — ideal for API rate limiting.

\`\`\`typescript
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  
  constructor(
    private maxTokens: number,
    private refillRate: number, // tokens per second
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }
  
  consume(count: number = 1): boolean {
    this.refill();
    
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    return false;
  }
  
  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(
      this.maxTokens,
      this.tokens + elapsed * this.refillRate
    );
    this.lastRefill = now;
  }
}
\`\`\`

---

## Production Setup: Redis-Backed Sliding Window

For multi-server deployments, use Redis:

\`\`\`typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function rateLimitRedis(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = \\\`rl:\${identifier}\\\`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  
  const pipeline = redis.pipeline();
  
  // Remove old entries
  pipeline.zremrangebyscore(key, 0, windowStart);
  // Add current request
  pipeline.zadd(key, now.toString(), \\\`\${now}-\${Math.random()}\\\`);
  // Count requests in window
  pipeline.zcard(key);
  // Set expiry
  pipeline.expire(key, windowSeconds);
  
  const results = await pipeline.exec();
  const requestCount = results![2][1] as number;
  
  return {
    allowed: requestCount <= limit,
    remaining: Math.max(0, limit - requestCount),
    resetIn: windowSeconds,
  };
}
\`\`\`

---

## Express Middleware Implementation

\`\`\`typescript
import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

function createRateLimiter(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = config.keyGenerator?.(req) 
      ?? req.ip 
      ?? req.headers['x-forwarded-for'] as string
      ?? 'unknown';
    
    const { allowed, remaining, resetIn } = await rateLimitRedis(
      key,
      config.max,
      config.windowMs / 1000
    );
    
    // Always set headers
    res.set({
      'X-RateLimit-Limit': config.max.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + resetIn).toString(),
      'Retry-After': resetIn.toString(),
    });
    
    if (!allowed) {
      return res.status(429).json({
        error: config.message || 'Too many requests',
        retryAfter: resetIn,
      });
    }
    
    next();
  };
}

// Usage
app.use('/api/', createRateLimiter({ windowMs: 60000, max: 100 }));
app.use('/api/auth/login', createRateLimiter({ 
  windowMs: 900000, max: 5,
  keyGenerator: (req) => \\\`login:\${req.body?.email || req.ip}\\\`,
  message: 'Too many login attempts. Try again in 15 minutes.',
}));
app.use('/api/auth/forgot-password', createRateLimiter({ windowMs: 3600000, max: 3 }));
\`\`\`

---

## Tiered Rate Limiting by Plan

\`\`\`typescript
const PLAN_LIMITS = {
  free:       { rpm: 20,   rpd: 1000 },
  starter:    { rpm: 100,  rpd: 10000 },
  pro:        { rpm: 500,  rpd: 100000 },
  enterprise: { rpm: 5000, rpd: 1000000 },
};

async function tieredRateLimit(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  const plan = await getPlanForKey(apiKey);
  const limits = PLAN_LIMITS[plan || 'free'];
  
  const [minuteResult, dayResult] = await Promise.all([
    rateLimitRedis(\\\`\${apiKey}:min\\\`, limits.rpm, 60),
    rateLimitRedis(\\\`\${apiKey}:day\\\`, limits.rpd, 86400),
  ]);
  
  if (!minuteResult.allowed || !dayResult.allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded', plan });
  }
  
  next();
}
\`\`\`

---

## Common Mistakes

1. **Rate limiting by IP only** — Shared IPs (offices, VPNs) block all users. Use API key + IP combo.
2. **Not rate limiting authenticated endpoints** — Stolen tokens can scrape everything.
3. **Returning different errors for valid/invalid usernames** — Enables enumeration even with rate limiting.
4. **Client-side rate limiting only** — Trivially bypassed with curl.
5. **Forgetting WebSocket endpoints** — Rate limit connection attempts and message frequency.`,
    date: "2026-03-25",
    author: "SCRs Team",
    category: "Application Security",
    tags: ["rate limiting", "api security", "nodejs", "express", "redis", "ddos protection", "token bucket"],
    readTime: "14 min read",
  },
  {
    slug: "docker-container-security-scanning-hardening-2026",
    title: "Docker Security: Container Scanning, Image Hardening & Runtime Protection",
    excerpt:
      "From base image selection to runtime security — a hands-on guide to securing Docker containers with Trivy, Falco, and production-ready Dockerfiles.",
    content: `## Why Docker Security Matters More Than Ever

**87% of organizations** run containers in production (CNCF 2025 Survey), but most container images have critical vulnerabilities that never get fixed.

| Finding | Stat |
|---------|------|
| Images with critical CVEs | 73% |
| Images running as root | 62% |
| Images with unnecessary packages | 89% |
| Containers with writable root filesystem | 54% |
| Teams scanning images in CI/CD | Only 34% |

---

## Step 1: Choose Secure Base Images

\`\`\`dockerfile
# ❌ Full OS image — 1.2GB, 400+ CVEs typical
FROM ubuntu:24.04

# ❌ Slim but still large — 200MB, 50+ CVEs
FROM node:20

# ✅ Alpine — 5MB, minimal attack surface
FROM node:20-alpine

# ✅ Distroless — no shell, no package manager, minimal CVEs
FROM gcr.io/distroless/nodejs20-debian12

# ✅ Scratch — literally empty, for static Go/Rust binaries
FROM scratch
\`\`\`

### Image Size vs. CVE Comparison

| Base Image | Size | Typical CVEs |
|-----------|------|-------------|
| ubuntu:24.04 | 78MB | 30-50 |
| node:20 | 1.1GB | 100-200 |
| node:20-slim | 200MB | 20-40 |
| node:20-alpine | 180MB | 5-15 |
| distroless/nodejs20 | 130MB | 0-5 |

---

## Step 2: Write Secure Dockerfiles

### ❌ Insecure Dockerfile

\`\`\`dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

Problems: runs as root, includes dev dependencies, no .dockerignore, layer caching broken.

### ✅ Hardened Dockerfile

\`\`\`dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

COPY src/ ./src/

# Production stage
FROM node:20-alpine AS production

# Security: Don't run as root
RUN addgroup -g 1001 appgroup && \\
    adduser -u 1001 -G appgroup -s /bin/sh -D appuser

WORKDIR /app

# Copy only production artifacts
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/src ./src
COPY --chown=appuser:appgroup package.json ./

# Security: Read-only filesystem
USER appuser

# Security: Drop all capabilities
# (Applied at runtime with docker run --cap-drop ALL)

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["node", "src/server.js"]
\`\`\`

---

## Step 3: Scan Images for Vulnerabilities

### Using Trivy (Recommended)

\`\`\`bash
# Scan a local image
trivy image myapp:latest

# Scan and fail on HIGH/CRITICAL
trivy image --severity HIGH,CRITICAL --exit-code 1 myapp:latest

# Scan a Dockerfile before building
trivy config Dockerfile

# Output as JSON for CI/CD integration
trivy image --format json --output results.json myapp:latest
\`\`\`

### CI/CD Integration (GitHub Actions)

\`\`\`yaml
- name: Build Docker image
  run: docker build -t myapp:\${{ github.sha }} .

- name: Scan for vulnerabilities
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: myapp:\${{ github.sha }}
    severity: CRITICAL,HIGH
    exit-code: 1
    format: sarif
    output: trivy-results.sarif

- name: Upload scan results
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: trivy-results.sarif
\`\`\`

---

## Step 4: Runtime Security

### Docker Compose with Security Options

\`\`\`yaml
services:
  app:
    image: myapp:latest
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only if needed for port < 1024
    read_only: true
    tmpfs:
      - /tmp:size=64M
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
\`\`\`

### Docker Secrets (Never Use ENV for Secrets)

\`\`\`yaml
services:
  app:
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    external: true
  api_key:
    external: true
\`\`\`

\`\`\`javascript
// Read secret from file, not environment variable
const dbPassword = fs.readFileSync('/run/secrets/db_password', 'utf8').trim();
\`\`\`

---

## Docker Security Checklist

- [ ] Use minimal base images (Alpine, Distroless, or Scratch)
- [ ] Multi-stage builds — no build tools in production image
- [ ] Run as non-root user (USER directive)
- [ ] \`.dockerignore\` excludes .git, node_modules, .env, secrets
- [ ] Pin base image versions (not \`latest\`)
- [ ] Scan images in CI/CD pipeline (Trivy, Grype, Snyk)
- [ ] Read-only root filesystem
- [ ] Drop all Linux capabilities, add back only what's needed
- [ ] Resource limits (CPU, memory)
- [ ] No secrets in environment variables — use Docker Secrets
- [ ] Health checks configured
- [ ] Regularly rebuild images to pick up base image patches`,
    date: "2026-03-22",
    author: "SCRs Team",
    category: "Cloud Security",
    tags: ["docker", "containers", "trivy", "security scanning", "devops", "kubernetes", "image hardening"],
    readTime: "15 min read",
  },
  {
    slug: "password-cracking-how-hackers-do-it-defense",
    title: "How Hackers Crack Passwords: Hashcat, Rainbow Tables & Why bcrypt Isn't Enough",
    excerpt:
      "Inside the toolbox of password crackers — dictionary attacks, rule-based mutations, GPU cracking speeds, and why your password policy probably doesn't work.",
    content: `## The Reality of Password Cracking in 2026

An NVIDIA RTX 5090 can compute **164 billion MD5 hashes per second**. That means every possible 8-character password using letters, numbers, and symbols can be cracked in under 3 hours.

### Cracking Speed by Hash Algorithm (RTX 5090)

| Algorithm | Speed | Time for 8-char password |
|-----------|-------|-------------------------|
| MD5 | 164B hashes/sec | ~2.5 hours |
| SHA-1 | 52B hashes/sec | ~8 hours |
| SHA-256 | 22B hashes/sec | ~19 hours |
| NTLM (Windows) | 280B hashes/sec | ~1.5 hours |
| bcrypt (cost 12) | 32K hashes/sec | ~2,800 years |
| Argon2id | 8K hashes/sec | ~11,200 years |

> **Key insight:** The hash algorithm matters more than password complexity. MD5 with a 20-character password is still weaker than bcrypt with a 10-character password.

---

## Attack Type 1: Dictionary Attack

The simplest and most effective attack. Uses wordlists of common passwords, leaked credentials, and language dictionaries.

\`\`\`bash
# Hashcat dictionary attack
hashcat -m 0 -a 0 hashes.txt rockyou.txt

# -m 0 = MD5
# -a 0 = Dictionary attack
# rockyou.txt = 14 million leaked passwords
\`\`\`

**Top 10 wordlists:**
1. **RockYou** — 14M passwords from 2009 breach
2. **SecLists** — Curated collection by Daniel Miessler  
3. **CrackStation** — 1.5B words from all major breaches
4. **Have I Been Pwned passwords** — 900M+ unique passwords
5. **Weakpass** — Multi-terabyte wordlists

---

## Attack Type 2: Rule-Based Mutations

Applies transformations to dictionary words — capitalizing, appending numbers, leetspeak substitutions.

\`\`\`bash
# Hashcat with rules
hashcat -m 0 -a 0 hashes.txt rockyou.txt -r rules/best64.rule

# Common rule transformations:
# password → Password (capitalize first)
# password → password123 (append numbers)
# password → p@ssw0rd (leetspeak)
# password → drowssap (reverse)
# password → Password! (capitalize + append symbol)
# password → PASSWORD (uppercase all)
\`\`\`

Popular rule files:
- **best64.rule** — 64 most effective rules
- **d3ad0ne.rule** — 35K rules, very thorough
- **OneRuleToRuleThemAll** — 52K expertly curated rules

---

## Attack Type 3: Mask/Brute Force

When you know the password pattern:

\`\`\`bash
# Try all 8-character combinations: uppercase + lowercase + digits
hashcat -m 0 -a 3 hashes.txt ?a?a?a?a?a?a?a?a

# Masks:
# ?l = lowercase  ?u = uppercase  ?d = digit  ?s = symbol
# ?a = all characters

# Common patterns people use:
hashcat -m 0 -a 3 hashes.txt ?u?l?l?l?l?l?d?d     # Word + 2 digits
hashcat -m 0 -a 3 hashes.txt ?u?l?l?l?l?l?l?s      # Word + symbol
hashcat -m 0 -a 3 hashes.txt ?d?d?d?d?d?d?d?d       # 8-digit PIN
\`\`\`

---

## Attack Type 4: Rainbow Tables

Pre-computed hash → password lookup tables. Instant cracking but requires massive storage.

| Charset | Length | Table Size | Lookup Time |
|---------|--------|-----------|-------------|
| a-z, 0-9 | 1-8 | 460GB | Instant |
| a-z, A-Z, 0-9 | 1-7 | 1.2TB | Instant |
| All printable | 1-7 | 3TB | Instant |

**Defense against rainbow tables: Salt every hash.**

\`\`\`javascript
// ❌ No salt — vulnerable to rainbow tables
const hash = crypto.createHash('sha256').update(password).digest('hex');

// ✅ Random salt — rainbow tables are useless
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
// Store both salt and hash

// ✅ Best: bcrypt includes salt automatically
const hash = await bcrypt.hash(password, 12); // Salt is embedded in the hash
\`\`\`

---

## Why bcrypt Alone Isn't Enough in 2026

bcrypt's max input is **72 bytes**. Longer passwords are silently truncated.

\`\`\`javascript
// These produce THE SAME hash:
await bcrypt.hash('A'.repeat(72), 12);
await bcrypt.hash('A'.repeat(72) + 'ANYTHING_ELSE', 12); // Truncated!
\`\`\`

**Solution: Pre-hash with SHA-256 before bcrypt (or use Argon2id)**

\`\`\`javascript
// ✅ Pre-hash to handle any length password
import { createHash } from 'crypto';
import bcrypt from 'bcrypt';

function secureHash(password: string): Promise<string> {
  // SHA-256 the password first (produces 64 hex chars, well under 72 bytes)
  const preHash = createHash('sha256').update(password).digest('hex');
  return bcrypt.hash(preHash, 12);
}

// ✅ Even better: Use Argon2id (no length limit, memory-hard)
import argon2 from 'argon2';

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64MB
  timeCost: 3,
  parallelism: 4,
});
\`\`\`

---

## What Actually Makes Passwords Secure

Forget complexity rules. **Length and randomness** are what matter:

| Password | Entropy | Time to Crack (bcrypt cost 12) |
|----------|---------|-------------------------------|
| P@ssw0rd | ~30 bits | In dictionary, instant |
| correct horse battery staple | ~44 bits | ~1 year |
| kj#8Fm2p$Lq9 | ~78 bits | Effectively never |
| 5 random words (diceware) | ~65 bits | ~10,000 years |

### Modern Password Policy Recommendations (NIST 800-63B)

- ✅ Minimum 8 characters (12+ recommended)
- ✅ Check against breached password lists (HaveIBeenPwned API)
- ✅ Allow all characters including spaces and Unicode
- ❌ **No forced complexity rules** (uppercase + number + symbol)
- ❌ **No forced rotation** (unless breach suspected)
- ❌ **No security questions** (easily researched)

\`\`\`typescript
// Modern password validation
import { pwnedPassword } from 'hibp';

async function validatePassword(password: string): Promise<string[]> {
  const errors: string[] = [];
  
  if (password.length < 12) errors.push('Password must be at least 12 characters');
  if (password.length > 128) errors.push('Password must be under 128 characters');
  
  // Check breached passwords
  const breachCount = await pwnedPassword(password);
  if (breachCount > 0) {
    errors.push(\\\`This password appeared in \${breachCount} data breaches. Choose a different one.\\\`);
  }
  
  return errors;
}
\`\`\`

The most important takeaway: **Use Argon2id, enforce minimum length, check breached lists, and stop requiring special characters.** That's it.`,
    date: "2026-03-19",
    author: "SCRs Team",
    category: "Application Security",
    tags: ["password cracking", "hashcat", "bcrypt", "argon2", "rainbow tables", "password security", "hashing"],
    readTime: "15 min read",
  },
  {
    slug: "aws-s3-bucket-misconfiguration-prevention-guide",
    title: "AWS S3 Bucket Misconfigurations: How Data Leaks Happen and How to Prevent Them",
    excerpt:
      "S3 misconfigurations caused 80% of cloud data breaches in 2025. Learn every mistake — public ACLs, policy errors, logging gaps — and how to detect them automatically.",
    content: `## S3 Misconfigurations: Still the #1 Cloud Security Risk

Despite years of warnings, **S3 bucket misconfigurations caused over 80% of cloud data breaches** in 2025 (Qualys Cloud Security Report). Billions of records — medical data, financial records, credentials — exposed because of simple configuration errors.

### High-Profile S3 Breaches

| Company | Records Exposed | Root Cause |
|---------|----------------|------------|
| Capital One | 106 million | SSRF + overpermissive IAM role |
| Twitch | Complete source code | Misconfigured S3 access |
| Hobby Lobby | 138GB customer data | Public bucket |
| Accenture | 40,000 passwords | Four public S3 buckets |
| U.S. Military | 1.8 billion social media posts | Unsecured S3 bucket |

---

## Misconfiguration #1: Public Access via ACLs

\`\`\`bash
# ❌ DANGEROUS: Making a bucket publicly readable
aws s3api put-bucket-acl --bucket my-data --acl public-read

# ❌ Even worse: Public write access
aws s3api put-bucket-acl --bucket my-data --acl public-read-write
\`\`\`

### Detection

\`\`\`bash
# Check if any buckets have public ACLs
aws s3api get-bucket-acl --bucket BUCKET_NAME \\
  | jq '.Grants[] | select(.Grantee.URI == "http://acs.amazonaws.com/groups/global/AllUsers")'
  
# List ALL public buckets in your account
for bucket in $(aws s3api list-buckets --query 'Buckets[].Name' --output text); do
  acl=$(aws s3api get-bucket-acl --bucket "$bucket" 2>/dev/null)
  if echo "$acl" | grep -q "AllUsers"; then
    echo "⚠️  PUBLIC: $bucket"
  fi
done
\`\`\`

### Fix: Block Public Access at Account Level

\`\`\`bash
# ✅ Block ALL public access for the entire AWS account
aws s3control put-public-access-block \\
  --account-id $(aws sts get-caller-identity --query Account --output text) \\
  --public-access-block-configuration \\
    BlockPublicAcls=true,\\
    IgnorePublicAcls=true,\\
    BlockPublicPolicy=true,\\
    RestrictPublicBuckets=true
\`\`\`

---

## Misconfiguration #2: Overly Permissive Bucket Policies

\`\`\`json
// ❌ This policy allows ANYONE to read ALL objects
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::my-bucket/*"
  }]
}
\`\`\`

\`\`\`json
// ✅ Restrict to specific IAM role only
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::123456789012:role/AppServerRole"
    },
    "Action": ["s3:GetObject"],
    "Resource": "arn:aws:s3:::my-bucket/public/*"
  }, {
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:*",
    "Resource": "arn:aws:s3:::my-bucket/*",
    "Condition": {
      "Bool": { "aws:SecureTransport": "false" }
    }
  }]
}
\`\`\`

---

## Misconfiguration #3: No Encryption

\`\`\`bash
# ❌ No server-side encryption — data at rest is unencrypted
aws s3 cp secret.txt s3://my-bucket/

# ✅ Enable default encryption with AWS-managed keys
aws s3api put-bucket-encryption --bucket my-bucket \\
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms",
        "KMSMasterKeyID": "alias/my-s3-key"
      },
      "BucketKeyEnabled": true
    }]
  }'
\`\`\`

---

## Misconfiguration #4: No Versioning or Logging

Without versioning, a single delete command wipes data permanently. Without logging, you can't detect unauthorized access.

\`\`\`bash
# ✅ Enable versioning
aws s3api put-bucket-versioning --bucket my-bucket \\
  --versioning-configuration Status=Enabled

# ✅ Enable server access logging
aws s3api put-bucket-logging --bucket my-bucket \\
  --bucket-logging-status '{
    "LoggingEnabled": {
      "TargetBucket": "my-access-logs-bucket",
      "TargetPrefix": "s3-logs/my-bucket/"
    }
  }'

# ✅ Enable CloudTrail data events for the bucket
aws cloudtrail put-event-selectors --trail-name my-trail \\
  --event-selectors '[{
    "ReadWriteType": "All",
    "DataResources": [{
      "Type": "AWS::S3::Object",
      "Values": ["arn:aws:s3:::my-bucket/"]
    }]
  }]'
\`\`\`

---

## Misconfiguration #5: CORS Allowing All Origins

\`\`\`json
// ❌ Allows any website to read your S3 objects
{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"]
  }]
}

// ✅ Restrict to your domains only
{
  "CORSRules": [{
    "AllowedOrigins": ["https://myapp.com", "https://staging.myapp.com"],
    "AllowedMethods": ["GET"],
    "AllowedHeaders": ["Authorization"],
    "MaxAgeSeconds": 3600
  }]
}
\`\`\`

---

## Automated Detection with Terraform

\`\`\`hcl
# Secure S3 bucket module
resource "aws_s3_bucket" "secure" {
  bucket = "my-secure-bucket"
}

resource "aws_s3_bucket_public_access_block" "secure" {
  bucket = aws_s3_bucket.secure.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "secure" {
  bucket = aws_s3_bucket.secure.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_versioning" "secure" {
  bucket = aws_s3_bucket.secure.id
  versioning_configuration { status = "Enabled" }
}
\`\`\`

---

## S3 Security Checklist

- [ ] Account-level public access block enabled
- [ ] No bucket ACLs granting public access
- [ ] Bucket policies follow least privilege
- [ ] Default encryption enabled (SSE-KMS preferred)
- [ ] Versioning enabled on all data buckets
- [ ] Server access logging or CloudTrail data events enabled
- [ ] CORS restricted to specific origins
- [ ] MFA Delete enabled for critical buckets
- [ ] Lifecycle policies to expire/transition old objects
- [ ] Regular audits with AWS Config rules or ScoutSuite`,
    date: "2026-03-16",
    author: "SCRs Team",
    category: "Cloud Security",
    tags: ["aws", "s3", "cloud security", "misconfiguration", "data breach", "bucket policy", "terraform"],
    readTime: "14 min read",
  },
  {
    slug: "burp-suite-tutorial-web-hacking-beginners-2026",
    title: "Burp Suite Tutorial: Web Application Hacking for Beginners (2026 Edition)",
    excerpt:
      "Step-by-step Burp Suite walkthrough — proxy setup, intercepting requests, scanning for vulnerabilities, and exploiting OWASP Top 10 flaws in practice.",
    content: `## Why Burp Suite Is the #1 Web Hacking Tool

Burp Suite is used by **over 70,000 security professionals** worldwide. It's the industry standard for web application penetration testing — combining an intercepting proxy, scanner, and manual testing tools in one platform.

| Edition | Price | Best For |
|---------|-------|----------|
| Community | Free | Learning, basic manual testing |
| Professional | $449/year | Professional pentesting |
| Enterprise | Custom | CI/CD integration, team scanning |

> You can follow this entire tutorial with the **free Community Edition**.

---

## Step 1: Installation & Browser Setup

### Install Burp Suite

\`\`\`bash
# Download from PortSwigger
# https://portswigger.net/burp/communitydownload

# macOS (via Homebrew)
brew install --cask burp-suite

# Linux (direct download)
chmod +x burpsuite_community_linux_*.sh
./burpsuite_community_linux_*.sh
\`\`\`

### Configure Browser Proxy

Burp intercepts traffic by acting as a proxy between your browser and the target.

1. **Open Burp Suite** → Start with default settings
2. **Proxy tab** → Note the proxy is on **127.0.0.1:8080**
3. **Browser setup:**

\`\`\`
Firefox (recommended):
  Settings → Network Settings → Manual Proxy → 127.0.0.1:8080

Chrome (use FoxyProxy extension):
  Install FoxyProxy → Add proxy: 127.0.0.1:8080 → Enable
\`\`\`

4. **Install Burp's CA certificate** (for HTTPS interception):
   - Browse to http://burp
   - Download CA Certificate
   - Import into browser's certificate store

---

## Step 2: Understanding the Interface

### Key Tabs

| Tab | Purpose |
|-----|---------|
| **Proxy** | Intercept, modify, and forward HTTP requests |
| **Target** | Site map and scope configuration |
| **Repeater** | Manually modify and resend requests |
| **Intruder** | Automated parameter fuzzing and brute-forcing |
| **Scanner** | Automated vulnerability scanning (Pro) |
| **Decoder** | Encode/decode data (Base64, URL, hex) |
| **Comparer** | Diff two responses to spot differences |

---

## Step 3: Intercepting and Modifying Requests

### Practice Target

Use a deliberately vulnerable app:

\`\`\`bash
# DVWA (Damn Vulnerable Web Application)
docker run -d -p 80:80 vulnerables/web-dvwa

# OWASP Juice Shop
docker run -d -p 3000:3000 bkimminich/juice-shop

# PortSwigger labs (browser-based)
# https://portswigger.net/web-security
\`\`\`

### Intercept a Login Request

1. Turn on interception: **Proxy → Intercept → Intercept is on**
2. Submit a login form on your target
3. Burp catches the request:

\`\`\`http
POST /login HTTP/2
Host: target.com
Content-Type: application/x-www-form-urlencoded

username=admin&password=test123
\`\`\`

4. **Modify the request** — change parameters, headers, cookies
5. Click **Forward** to send it, or **Drop** to cancel

---

## Step 4: Using Repeater for Manual Testing

Repeater lets you send the same request over and over with modifications — essential for testing injection attacks.

### Testing for SQL Injection

1. Capture a request with a parameter: \`?id=1\`
2. Send to Repeater (Ctrl+R)
3. Try injection payloads:

\`\`\`
Original:  ?id=1
Test 1:    ?id=1'              → Look for SQL error
Test 2:    ?id=1 OR 1=1        → Look for different response
Test 3:    ?id=1 UNION SELECT null,null,null → Determine column count
Test 4:    ?id=1 UNION SELECT username,password,null FROM users
\`\`\`

### Testing for XSS

\`\`\`
Original:  ?search=hello
Test 1:    ?search=<script>alert(1)</script>
Test 2:    ?search="><img src=x onerror=alert(1)>
Test 3:    ?search=javascript:alert(1)
Test 4:    ?search={{7*7}}      → Template injection check
\`\`\`

---

## Step 5: Using Intruder for Automated Attacks

### Brute-Forcing a Login

1. Capture a login request
2. Send to Intruder (Ctrl+I)
3. Set attack positions:

\`\`\`http
POST /login HTTP/2
Host: target.com

username=§admin§&password=§test§
\`\`\`

4. Set payloads:
   - Position 1: Usernames wordlist
   - Position 2: Passwords wordlist (rockyou-top-1000.txt)
5. Set attack type: **Cluster Bomb** (tests all combinations)
6. Start attack → Look for different response length/status code

### Parameter Fuzzing for IDOR

\`\`\`http
GET /api/users/§1§/profile HTTP/2
Host: target.com
Authorization: Bearer your-token-here
\`\`\`

Set payload: Numbers 1-1000. Look for 200 responses to IDs that aren't yours.

---

## Step 6: Useful Burp Extensions

Install from **Extender → BApp Store**:

| Extension | Purpose |
|-----------|---------|
| **Autorize** | Automatic authorization testing (IDOR detection) |
| **Logger++** | Enhanced request/response logging |
| **JSON Beautifier** | Format JSON in Proxy/Repeater |
| **Param Miner** | Discover hidden parameters |
| **Turbo Intruder** | Faster Intruder with Python scripting |
| **JWT Editor** | Decode, modify, and forge JWT tokens |
| **Hackvertor** | Advanced encoding/tag-based transformations |

---

## Step 7: OWASP Top 10 Testing with Burp

| Vulnerability | Burp Technique |
|--------------|----------------|
| Broken Access Control | Intruder IDOR fuzzing + Autorize extension |
| Injection (SQL/XSS) | Repeater with payloads + Scanner (Pro) |
| Auth Bypass | Repeater — modify JWT, session cookies |
| SSRF | Repeater — inject internal URLs in parameters |
| Security Misconfiguration | Check response headers, error pages |
| Sensitive Data Exposure | Search Proxy history for tokens, passwords |

---

## Quick Reference: Essential Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+R | Send to Repeater |
| Ctrl+I | Send to Intruder |
| Ctrl+Space | Forward intercepted request |
| Ctrl+Shift+D | Send to Decoder |
| Ctrl+F | Search in response |

The best way to learn Burp Suite is to practice. Start with PortSwigger Web Security Academy labs — they're free, browser-based, and cover every OWASP vulnerability with step-by-step solutions.`,
    date: "2026-03-13",
    author: "SCRs Team",
    category: "Application Security",
    tags: ["burp suite", "web hacking", "penetration testing", "proxy", "owasp", "tutorial", "beginners"],
    readTime: "16 min read",
  },
];
