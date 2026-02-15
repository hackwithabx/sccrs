import { BlogPost } from "./blog-data";

export const owaspArticles: BlogPost[] = [
  {
    slug: "broken-access-control-owasp-number-one-risk",
    title: "Broken Access Control: Why It's the #1 OWASP Risk (With Real Exploits & Fixes)",
    excerpt:
      "Broken Access Control has been the #1 OWASP Top 10 risk since 2021. This deep dive covers IDOR, privilege escalation, forced browsing, and JWT flaws with real-world exploits, code examples, and enterprise-grade mitigations.",
    content: `## Why Broken Access Control Is #1

Broken Access Control (A01:2021) took the top spot in the OWASP Top 10 in 2021 and has remained there through 2025. According to OWASP's data, **94% of applications tested** had some form of broken access control, with a 3.81% incidence rate across 318,000+ CWEs mapped to this category.

> **What It Means:** Access control enforces policy such that users cannot act outside their intended permissions. When it fails, attackers can view other users' data, modify records, escalate privileges, or perform administrative actions — all common paths to full system compromise.

---

## Access Control Vulnerability Taxonomy

| Vulnerability Type | CWE | Description | CVSS Range |
|---|---|---|---|
| **IDOR** | CWE-639 | Accessing resources by manipulating identifiers | 5.3 - 8.6 |
| **Privilege Escalation** | CWE-269 | Gaining higher privileges than assigned | 7.5 - 9.8 |
| **Forced Browsing** | CWE-425 | Accessing unlinked pages/endpoints directly | 5.3 - 7.5 |
| **CORS Misconfiguration** | CWE-942 | Overly permissive cross-origin policies | 5.3 - 8.1 |
| **JWT Manipulation** | CWE-347 | Forging or tampering with auth tokens | 7.5 - 9.8 |
| **Path Traversal** | CWE-22 | Accessing files outside intended directory | 5.3 - 9.1 |
| **Missing Function-Level Control** | CWE-285 | API endpoints lacking authorization checks | 6.5 - 9.8 |
| **Metadata Manipulation** | CWE-639 | Tampering with hidden fields, cookies | 5.3 - 8.6 |

---

## IDOR (Insecure Direct Object References)

The most common and most exploited access control vulnerability. IDOR occurs when an application exposes internal object references (IDs, filenames, database keys) and fails to verify that the requesting user owns or has access to the referenced object.

### Real-World IDOR Exploits

**1. US Department of Defense (HackerOne, 2020)**
A researcher discovered that changing the \`user_id\` parameter on an internal DoD portal revealed service records, personal information, and documents for any military member over the past 70 years. Severity: Critical.

**2. Uber (2019)**
A bug allowed any driver to access trip receipts and personal details of any rider by iterating through trip IDs in the API endpoint \`/api/trips/{trip_id}/receipt\`.

### Vulnerable IDOR Code
\`\`\`javascript
// VULNERABLE — No authorization check
app.get("/api/orders/:orderId", async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  res.json(order); // Returns order regardless of who owns it
});
\`\`\`

### Secure IDOR Fix
\`\`\`javascript
// SECURE — Authorization check ensures ownership
app.get("/api/orders/:orderId", authenticate, async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // Verify the authenticated user owns this order
  if (order.userId.toString() !== req.user.id) {
    return res.status(403).json({ error: "Access denied" });
  }

  res.json(order);
});
\`\`\`

### Advanced IDOR Prevention
- **Use UUIDs instead of sequential IDs** — Makes enumeration impractical
- **Implement object-level authorization on every endpoint** — Never trust the client
- **Use indirect reference maps** — Map session-specific tokens to real IDs server-side
- **Rate limit API endpoints** — Detect and block enumeration attempts

---

## Privilege Escalation

### Vertical Privilege Escalation
A regular user gains admin capabilities:

\`\`\`javascript
// VULNERABLE — Role check only on frontend
// Backend API has no role verification
app.delete("/api/admin/users/:userId", authenticate, async (req, res) => {
  // Missing: if (req.user.role !== 'admin') return res.status(403)...
  await User.findByIdAndDelete(req.params.userId);
  res.json({ message: "User deleted" });
});
\`\`\`

\`\`\`javascript
// SECURE — Server-side role enforcement
app.delete("/api/admin/users/:userId", authenticate, authorize("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.userId);
  auditLog.record({
    action: "USER_DELETED",
    actor: req.user.id,
    target: req.params.userId,
    timestamp: new Date(),
  });
  res.json({ message: "User deleted" });
});

// Reusable authorization middleware
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      auditLog.record({
        action: "UNAUTHORIZED_ACCESS_ATTEMPT",
        actor: req.user.id,
        endpoint: req.originalUrl,
        timestamp: new Date(),
      });
      return res.status(403).json({ error: "Insufficient privileges" });
    }
    next();
  };
}
\`\`\`

### Horizontal Privilege Escalation
A user accesses another user's data at the same privilege level — this is essentially IDOR applied to peer resources.

---

## CORS Misconfigurations

### The #1 CORS Mistake
\`\`\`javascript
// VULNERABLE — Reflects any origin (defeats same-origin policy entirely)
app.use(cors({
  origin: (origin, callback) => callback(null, true), // allows ALL origins
  credentials: true,
}));
\`\`\`

### Secure CORS Configuration
\`\`\`javascript
// SECURE — Explicit allowlist
const ALLOWED_ORIGINS = [
  "https://securecodereviews.com",
  "https://app.securecodereviews.com",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
\`\`\`

---

## Access Control Architecture

### Defense-in-Depth Model

\`\`\`
Layer 1: API Gateway
├── Rate limiting
├── Authentication (JWT/OAuth validation)
└── Basic RBAC (admin vs user routes)

Layer 2: Service/Application
├── Object-level authorization (IDOR prevention)
├── Function-level authorization (role/permission checks)
├── Business logic authorization (ownership, team membership)
└── Input validation

Layer 3: Data
├── Row-level security (database policies)
├── Column-level encryption (sensitive fields)
└── Audit logging
\`\`\`

---

## Testing for Broken Access Control

| Test Type | Tools | What It Finds |
|---|---|---|
| **Manual IDOR testing** | Burp Suite, curl | Object-level access failures |
| **Automated scanning** | OWASP ZAP, Nuclei | Missing auth on endpoints |
| **Fuzzing IDs** | Custom scripts, Burp Intruder | Sequential ID enumeration |
| **Role matrix testing** | Manual / AuthMatrix Burp extension | Cross-role access violations |
| **JWT testing** | jwt.io, jwt_tool | Token manipulation, alg:none attack |
| **CORS testing** | curl, Burp | Overly permissive origin policies |

---

## Further Reading

- [OWASP Top 10 2025](/owasp/top-10-2025) — Full vulnerability framework
- [OWASP Access Control Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html) — Implementation guidelines
- [JWT Security Guide](/blog/jwt-security-vulnerabilities-best-practices) — Token security deep dive
- [Secure API Design Patterns](/blog/secure-api-design-patterns) — API security architecture`,
    date: "2026-02-11",
    author: "SCR Security Research Team",
    category: "OWASP",
    tags: ["Broken Access Control", "IDOR", "OWASP", "Privilege Escalation", "CORS", "Authorization", "Web Security"],
    readTime: "19 min read",
  },

  {
    slug: "security-misconfiguration-owasp-2025-guide",
    title: "Security Misconfiguration Jumped to #2 in OWASP 2025: Complete Prevention Guide",
    excerpt:
      "Security misconfiguration surged from #5 to #2 in the OWASP Top 10 2025. Cloud misconfigs, default credentials, verbose errors, and unnecessary features expose millions of applications. This guide covers the most exploited misconfigurations with fixes.",
    content: `## Why Misconfiguration Surged to #2

Security Misconfiguration (A05:2021 → A02:2025) made the biggest jump in the OWASP Top 10 2025 update, climbing from **#5 to #2**. This reflects a fundamental shift: as applications move to cloud-native architectures, the configuration surface area has exploded.

> **The Root Cause:** Modern applications aren't just code — they're **code + infrastructure + configuration + secrets + cloud resources + third-party services**, each with its own security settings. A single misconfigured S3 bucket, an exposed admin panel, or a default password can compromise an otherwise secure application.

| Year | OWASP Ranking | CWEs Mapped | Incidence Rate |
|---|---|---|---|
| 2017 | #6 | 89 | 4.2% |
| 2021 | #5 | 208 | 4.5% |
| 2025 | **#2** | 312 | **6.3%** |

---

## The 10 Most Exploited Misconfigurations

### 1. Cloud Storage Misconfigurations

**The Problem:** S3 buckets, Azure Blob containers, and GCS buckets are publicly accessible by default in many deployment scenarios.

**Real-World Breaches:**

| Company | Year | Data Exposed | Cause |
|---|---|---|---|
| Capital One | 2019 | 106M records | Misconfigured WAF + SSRF to metadata |
| Microsoft | 2023 | 2.4TB emails | Misconfigured Azure Blob SAS token |
| Toyota | 2023 | 260K customer records | Public cloud bucket for 10 years |
| Pentagon (USSOCOM) | 2023 | 3TB emails, files | Unauthenticated Azure server |

**Fix:**
\`\`\`bash
# AWS — Block all public access at the account level
aws s3control put-public-access-block \\
  --account-id 123456789012 \\
  --public-access-block-configuration \\
  BlockPublicAcls=true,IgnorePublicAcls=true,\\
  BlockPublicPolicy=true,RestrictPublicBuckets=true

# Verify
aws s3api get-bucket-policy-status --bucket my-bucket
\`\`\`

### 2. Default Credentials

**Still the #1 IoT and admin panel vulnerability.** Databases, admin consoles, network devices, and CI/CD tools ship with default credentials that are often never changed.

| Product | Default Credentials | Found In |
|---|---|---|
| Jenkins | No password (initial setup) | CI/CD pipelines |
| MongoDB | No auth (default config) | Databases |
| Kibana | elastic / changeme | Logging infrastructure |
| Router admin panels | admin / admin | Network devices |
| phpMyAdmin | root / (empty) | Database management |

> **Shodan Search Statistic:** At any given time, over **35,000 MongoDB instances** are publicly accessible with no authentication, exposing an estimated **12+ petabytes** of data (Comparitech, 2025).

### 3. Verbose Error Messages

Error messages that leak stack traces, database schemas, file paths, or version information give attackers a roadmap.

\`\`\`javascript
// VULNERABLE — Leaks internal details in production
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,            // Stack trace with file paths
    query: err.sql,              // SQL query that failed
    connectionString: err.host,  // Database host information
  });
});
\`\`\`

\`\`\`javascript
// SECURE — Generic errors in production, detailed logs internally
app.use((err, req, res, next) => {
  // Log full details for internal debugging
  logger.error({
    message: err.message,
    stack: err.stack,
    requestId: req.id,
    path: req.path,
    timestamp: new Date().toISOString(),
  });

  // Return generic message to client
  res.status(500).json({
    error: "An internal error occurred",
    requestId: req.id, // For support reference only
  });
});
\`\`\`

### 4. Unnecessary Features Enabled

| Feature | Risk | Fix |
|---|---|---|
| Directory listing | Exposes file structure | Disable in web server config |
| DEBUG mode in production | Verbose errors, debug endpoints | \`DEBUG=false\` in production |
| TRACE HTTP method | Cross-site tracing attacks | Disable in web server |
| Admin panels on public URLs | Unauthorized access | IP restriction + strong auth |
| GraphQL introspection in prod | Schema disclosure | Disable introspection |
| Swagger UI in production | API documentation exposure | Restrict to internal network |

### 5. Missing Security Headers

\`\`\`javascript
// Essential security headers for every web application
app.use((req, res, next) => {
  // Prevents clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevents MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Content Security Policy — adjust per application
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");

  // Force HTTPS
  res.setHeader("Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload");

  // Don't send Referer for cross-origin requests
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Opt out of tracking
  res.setHeader("Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()");

  next();
});
\`\`\`

### 6. Exposed Management Interfaces

### 7. Outdated/Unpatched Software

### 8. Missing TLS/SSL Configuration

### 9. Permissive Network Policies

### 10. Misconfigured CI/CD Pipelines (secrets in logs, no branch protection)

---

## Cloud-Specific Misconfiguration Checklist

### AWS
- [ ] S3 Block Public Access enabled at account level
- [ ] No IAM users with \`AdministratorAccess\` for daily operations
- [ ] CloudTrail enabled in all regions
- [ ] No security groups with 0.0.0.0/0 on SSH (port 22)
- [ ] IMDSv2 enforced on all EC2 instances (prevents SSRF to metadata)
- [ ] No root account access keys exist
- [ ] GuardDuty enabled

### Azure
- [ ] Storage accounts require private endpoints
- [ ] No Network Security Groups allowing all inbound traffic
- [ ] Azure Defender enabled for all resource types
- [ ] Managed identities used instead of service principal secrets
- [ ] Activity Log alerts configured

### GCP
- [ ] Uniform bucket-level access enabled
- [ ] No default service account used for workloads
- [ ] VPC Service Controls enabled for sensitive projects
- [ ] OS Login enabled for Compute Engine
- [ ] Cloud Audit Logs enabled

---

## Automated Misconfiguration Detection

| Tool | Type | What It Scans |
|---|---|---|
| **ScoutSuite** | Open Source | Multi-cloud misconfiguration (AWS, Azure, GCP) |
| **Prowler** | Open Source | AWS security best practices (300+ checks) |
| **Checkov** | Open Source | IaC misconfiguration (Terraform, CloudFormation, K8s) |
| **trivy** | Open Source | Container + IaC misconfiguration scanning |
| **tfsec** | Open Source | Terraform-specific security scanning |
| **CSPM** (commercial) | SaaS | Continuous cloud security posture management |

---

## Further Reading

- [OWASP Top 10 2025](/owasp/top-10-2025) — Full vulnerability ranking
- [Cloud Security Guide](/blog/cloud-security-aws-azure-gcp) — Multi-cloud security hardening
- [IaC Security for Terraform & Kubernetes](/blog/iac-security-terraform-docker-kubernetes) — Secure infrastructure as code
- CIS Benchmarks — [cisecurity.org](https://www.cisecurity.org/cis-benchmarks) — Industry-standard hardening guides`,
    date: "2026-02-10",
    author: "SCR Security Research Team",
    category: "OWASP",
    tags: ["Security Misconfiguration", "OWASP", "Cloud Security", "S3 Bucket", "Default Credentials", "Hardening"],
    readTime: "18 min read",
  },

  {
    slug: "software-supply-chain-security-owasp-a03-sbom",
    title: "Software Supply Chain Security: OWASP A03, SBOM, and the Fight Against Dependency Attacks",
    excerpt:
      "Supply chain attacks surged 742% since 2019 (Sonatype). This OWASP A03 deep dive covers dependency confusion, typosquatting, CI/CD poisoning, SBOMs, SLSA frameworks, and lockfile security with actionable prevention strategies.",
    content: `## The Supply Chain Crisis by the Numbers

Software supply chain attacks have exploded. Modern applications depend on hundreds to thousands of open-source packages, each one a potential attack vector.

| Metric | Value | Source |
|---|---|---|
| Supply chain attacks increase (2019-2025) | **742%** | Sonatype 2025 State of the Software Supply Chain |
| Avg npm packages per project | **683** | Synopsys Audit |
| Malicious packages found on npm (2024) | **18,000+** | Socket.dev |
| Avg time to detect compromised package | **43 days** | Snyk 2025 |
| Organizations hit by supply chain attack | **62%** | Gartner |

> **Why Supply Chain Is OWASP A03:** The OWASP Top 10 2025 merged "Vulnerable and Outdated Components" (A06:2021) with supply chain concerns and elevated it to A03. This reflects the severity: a single compromised dependency can affect millions of downstream applications simultaneously.

---

## Attack Taxonomy

### 1. Dependency Confusion (Namespace Hijacking)

First disclosed by Alex Birsan in 2021, dependency confusion exploits the way package managers resolve names. If an internal package \`@company/auth-utils\` exists, an attacker publishes a public package named \`auth-utils\` with a higher version number. Many build systems will prefer the public package.

**Companies Successfully Attacked (Birsan's Research):**
- Apple
- Microsoft
- PayPal
- Shopify
- Tesla
- Uber
- Yelp

**Prevention:**
\`\`\`json
// .npmrc — Force scoped packages to use private registry
@company:registry=https://npm.company.com/
//npm.company.com/:_authToken=\${NPM_TOKEN}
\`\`\`

### 2. Typosquatting

Attackers publish packages with names similar to popular ones:

| Legitimate Package | Typosquat | Downloads Before Removal |
|---|---|---|
| \`lodash\` | \`1odash\`, \`lodash4\` | 50,000+ |
| \`cross-env\` | \`crossenv\` | 700+ |
| \`event-stream\` | \`eveent-stream\` | 1,200+ |
| \`colors\` | \`colorsjs\` | 3,000+ |
| \`requests\` (Python) | \`request\` | 100,000+ |

### 3. Maintainer Account Takeover

The \`event-stream\` incident (2018) remains the canonical example: an attacker gained maintainer access to a package with 1.5M weekly downloads, injected a targeted payload that stole cryptocurrency from a specific wallet. The attack went undetected for months.

### 4. CI/CD Pipeline Poisoning

**GitHub Actions Supply Chain Attack (2025):** The \`tj-actions/changed-files\` action (used by 23,000+ repositories) was compromised. Attackers injected code that exfiltrated CI/CD secrets (API keys, cloud credentials) via modified action code.

\`\`\`yaml
# VULNERABLE — Uses mutable tag that can be compromised
- uses: tj-actions/changed-files@v39

# SECURE — Pin to immutable commit SHA
- uses: tj-actions/changed-files@1f4c18bab80b1e59e33d7c2e1fb8b14cfac52b76
\`\`\`

### 5. Protestware & Sabotage

| Package | Maintainer Action | Impact |
|---|---|---|
| \`colors\` / \`faker\` | Marak Squires injected infinite loop | Broke thousands of apps |
| \`node-ipc\` | Anti-war protestware deleted files on Russian IPs | Data destruction for targeted users |
| \`peacenotwar\` | Dependency of node-ipc with geopolitical payload | Supply chain collateral damage |

---

## SBOM: Software Bill of Materials

An SBOM is a formal, machine-readable inventory of all components, libraries, and dependencies in your software.

### Why SBOMs Are Now Mandatory

- **US Executive Order 14028 (2021)** — All software sold to the US government must include an SBOM
- **EU Cyber Resilience Act (2024)** — Manufacturers must provide SBOMs for products with digital elements
- **CISA SBOM Guidelines (2024)** — Minimum elements for SBOM defined

### SBOM Formats

| Format | Maintained By | Strengths |
|---|---|---|
| **CycloneDX** | OWASP | Security-focused, VEX support, lightweight |
| **SPDX** | Linux Foundation | License compliance, ISO standard (ISO/IEC 5962:2021) |
| **SWID Tags** | NIST | Software identification, asset management |

### Generating SBOMs

\`\`\`bash
# CycloneDX for Node.js projects
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# Syft (universal SBOM generator by Anchore)
syft packages dir:./my-project -o cyclonedx-json > sbom.json

# Trivy (also generates SBOMs)
trivy fs --format cyclonedx --output sbom.json ./my-project
\`\`\`

---

## SLSA Framework (Supply-chain Levels for Software Artifacts)

SLSA (pronounced "salsa") is a security framework that provides a checklist of standards to prevent tampering and improve integrity throughout the software supply chain.

| SLSA Level | Requirements | What It Prevents |
|---|---|---|
| **Level 0** | No guarantees | Nothing |
| **Level 1** | Build process documented, provenance generated | Ad-hoc builds with no traceability |
| **Level 2** | Hosted build service, authenticated provenance | Tampering after build |
| **Level 3** | Hardened build platform, non-falsifiable provenance | Insider threats on build systems |
| **Level 4** | Two-person review, hermetic builds | Unilateral code changes |

### Implementing SLSA in GitHub Actions

\`\`\`yaml
# Generate SLSA provenance for npm packages
name: SLSA Provenance
on:
  push:
    tags: ["v*"]

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      id-token: write # For provenance signing
      contents: read
      attestations: write

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4 
        with:
          node-version: 20
      - run: npm ci --ignore-scripts
      - run: npm run build
      - name: Generate SBOM
        run: npx @cyclonedx/cyclonedx-npm --output-file sbom.json
      - name: Attest provenance
        uses: actions/attest-build-provenance@v1
        with:
          subject-path: dist/**
\`\`\`

---

## Lockfile Security

Lockfiles (\`package-lock.json\`, \`yarn.lock\`, \`pnpm-lock.yaml\`) pin exact dependency versions and integrity hashes. They are critical for supply chain security.

**Lockfile Security Rules:**
1. **Always commit lockfiles** to version control
2. **Use \`npm ci\` in CI/CD** (not \`npm install\`) — installs exactly from lockfile
3. **Review lockfile changes in PRs** — unexpected dependency changes may indicate attack
4. **Enable integrity checking** — lockfiles contain SHA-512 hashes; verify on install

\`\`\`bash
# Audit dependencies for known vulnerabilities
npm audit
npm audit --audit-level=critical

# Check for deprecated or unmaintained packages
npx depcheck

# Socket.dev — Detect supply chain risks (typosquatting, protestware, etc.)
npx socket optimize
\`\`\`

---

## Dependency Management Best Practices

| Practice | Implementation |
|---|---|
| Pin exact versions | Use \`=\` not \`^\` or \`~\` in production |
| Auto-update with review | Dependabot/Renovate with human review |
| Minimal dependencies | Audit and remove unused packages regularly |
| Private registry | Mirror approved packages via Artifactory/Nexus |
| Vulnerability scanning | npm audit, Snyk, Socket in CI/CD |
| Provenance verification | \`npm audit signatures\` (npm v9+) |
| SBOM generation | CycloneDX or SPDX on every build |

---

## Further Reading

- [OWASP Top 10 2025](/owasp/top-10-2025) — A03: Injection includes supply chain
- Sonatype (2025), "State of the Software Supply Chain" — Annual analysis
- [SLSA Framework](https://slsa.dev/) — Supply chain integrity levels
- [Supply Chain Security Guide](/blog/supply-chain-security) — Foundational supply chain concepts
- Birsan, A. (2021), "Dependency Confusion: How I Hacked Apple, Microsoft, and Dozens of Other Companies"`,
    date: "2026-02-09",
    author: "SCR Security Research Team",
    category: "OWASP",
    tags: ["Supply Chain", "OWASP", "SBOM", "SLSA", "Dependency Confusion", "npm Security", "Software Composition"],
    readTime: "21 min read",
  },

  {
    slug: "owasp-proactive-controls-2026-secure-development",
    title: "OWASP Proactive Controls 2026: 10 Security Practices Every Developer Must Know",
    excerpt:
      "The OWASP Proactive Controls are the most important security practices for developers. This updated 2026 guide covers all 10 controls with modern examples for Next.js, Node.js, React, and cloud-native applications.",
    content: `## What Are the OWASP Proactive Controls?

While the OWASP Top 10 lists what can go wrong, the **OWASP Proactive Controls** (OPC) tell developers what to do right. They are the 10 most critical security techniques that every developer should build into their applications from the start.

> **Philosophy:** "It is far more cost-effective to design security into applications from the beginning than to fix vulnerabilities after deployment." — OWASP Proactive Controls documentation.

**Cost of fixing vulnerabilities by phase:**

| Phase | Cost Multiplier | Example |
|---|---|---|
| Design | 1x (baseline) | Threat modeling catches missing auth |
| Development | 6.5x | Code review finds SQL injection |
| Testing | 15x | Pen test discovers IDOR |
| Production | 100x | Data breach response |

*Source: NIST, IBM Security Cost of a Data Breach Report 2025*

---

## C1: Define Security Requirements

Before writing a single line of code, define what "secure" means for your application.

### Security Requirements by Application Type

| Requirement | Web App | API | Mobile | AI/ML |
|---|---|---|---|---|
| Authentication method | SSO/MFA | OAuth 2.0 | Biometric + PIN | API key + token |
| Session management | Server-side, 15min timeout | Stateless JWT, 5min exp | Secure enclave storage | Per-request auth |
| Input validation | All user inputs, CSRF tokens | Schema validation (OpenAPI) | All inputs + certificate pinning | Prompt validation + injection detection |
| Data encryption | TLS 1.3 + AES-256 at rest | mTLS + field-level encryption | App-level encryption | Training data encryption |
| Logging level | Actions + errors | Full request/response | Crash/security events | Inference requests + outputs |

### Practical Exercise: User Story Security Requirements
\`\`\`
User Story: "As a user, I can reset my password via email"

Security Requirements:
1. Reset tokens must be cryptographically random (min 128 bits)
2. Tokens expire after 15 minutes
3. Tokens are single-use (invalidated after use)
4. Rate limit: max 3 reset requests per hour per email
5. Don't reveal whether email exists ("If this email is registered...")
6. Log all reset attempts for audit
7. Notify user via email of successful password change
8. New password must meet complexity requirements
\`\`\`

---

## C2: Leverage Security Frameworks and Libraries

Don't build security primitives from scratch. Use battle-tested, actively maintained libraries.

### Recommended Libraries (2026)

| Function | Node.js/TypeScript | Python | Java |
|---|---|---|---|
| Authentication | NextAuth.js, Passport | Django Auth, Authlib | Spring Security |
| Password hashing | bcrypt, argon2 | passlib (argon2) | BCryptPasswordEncoder |
| Input validation | zod, joi, express-validator | pydantic, marshmallow | Bean Validation (JSR 380) |
| CSRF protection | csrf (npm), Next.js built-in | Django CSRF middleware | Spring CSRF |
| SQL injection prevention | Prisma, Drizzle (parameterized) | SQLAlchemy (parameterized) | JPA/Hibernate |
| XSS prevention | DOMPurify, React (auto-escapes) | bleach, MarkupSafe | OWASP Java Encoder |
| Cryptography | Node.js crypto (built-in) | cryptography (pyca) | Tink (by Google) |

---

## C3: Secure Database Access

Every database query must be parameterized. This is non-negotiable.

\`\`\`typescript
// VULNERABLE — String concatenation = SQL injection
const user = await db.query(
  \`SELECT * FROM users WHERE email = '\${email}' AND password = '\${password}'\`
);

// SECURE — Parameterized query (Prisma ORM)
const user = await prisma.user.findUnique({
  where: { email: email },
  select: { id: true, email: true, hashedPassword: true },
});
// Then verify password separately with bcrypt.compare()
\`\`\`

### Database Security Principles
1. **Use an ORM with parameterized queries** (Prisma, Drizzle, SQLAlchemy, Hibernate)
2. **Principle of least privilege** — Application DB user should only have SELECT/INSERT/UPDATE on required tables
3. **No database admin credentials in application code** — Ever
4. **Enable query logging in development** — Catch raw query construction early
5. **Encrypt sensitive columns** — PII, financial data, health records

---

## C4: Encode and Escape Data

All data that crosses a trust boundary must be encoded for the output context.

| Context | Encoding | Example |
|---|---|---|
| HTML body | HTML entity encoding | \`<script>\` → \`&lt;script&gt;\` |
| HTML attribute | Attribute encoding | \`" onmouseover="\` → \`&quot; onmouseover=&quot;\` |
| JavaScript | JavaScript encoding | Unicode escape sequences |
| URL | URL encoding | Spaces → \`%20\` |
| CSS | CSS encoding | Hex encoding |
| SQL | Parameterized queries | Not string encoding — use parameters |

> **React & Next.js:** React automatically escapes JSX expressions, making XSS via \`{variable}\` rare. The danger is \`dangerouslySetInnerHTML\` — avoid it, or use DOMPurify.

---

## C5: Validate All Inputs

Validate on the server. Client-side validation is a UX feature, not a security control.

\`\`\`typescript
import { z } from "zod";

// Define strict input schema
const ContactSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .regex(/^[a-zA-Z\\s'-]+$/, "Invalid characters in name"),

  email: z.string()
    .email("Invalid email address")
    .max(254, "Email too long"),

  message: z.string()
    .min(10, "Message too short")
    .max(5000, "Message too long")
    .transform(msg => msg.trim()),

  phone: z.string()
    .regex(/^\\+?[1-9]\\d{6,14}$/, "Invalid phone number")
    .optional(),
});

// Use in API route
export async function POST(req: Request) {
  const body = await req.json();
  const result = ContactSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }

  // result.data is now validated and typed
  await saveContact(result.data);
}
\`\`\`

---

## C6: Implement Digital Identity

### Modern Authentication Checklist
- Use established identity providers (NextAuth.js, Auth0, Firebase Auth, Keycloak)
- Implement MFA for all user accounts (TOTP, WebAuthn, passkeys)
- Hash passwords with Argon2id or bcrypt (cost factor ≥ 12)
- Use secure session management (HttpOnly, Secure, SameSite cookies)
- Implement account lockout after failed attempts (5 failures → 15min lockout)
- Provide password strength feedback in real-time

---

## C7: Enforce Access Controls

Deny by default. Every endpoint must verify both authentication and authorization.

---

## C8: Protect Data Everywhere

- **In transit:** TLS 1.3 (minimum TLS 1.2). No mixed content.
- **At rest:** AES-256 for databases, encrypted volumes for storage
- **In use:** Consider confidential computing for sensitive workloads
- **Key management:** Use cloud KMS (AWS KMS, Azure Key Vault, GCP Cloud KMS) — never store keys in code

---

## C9: Implement Security Logging and Monitoring

Log these events (at minimum):
- Authentication successes and failures
- Authorization failures
- Input validation failures
- Application errors
- Admin and privileged actions
- Data access patterns

---

## C10: Handle All Errors and Exceptions

- Never expose stack traces in production
- Log detailed errors internally, return generic messages externally
- Use global error handlers to catch unhandled exceptions
- Return consistent error response formats

---

## Further Reading

- [OWASP Proactive Controls](https://owasp.org/www-project-proactive-controls/) — Official documentation
- [OWASP Top 10 2025](/owasp/top-10-2025) — Vulnerability framework
- [Secure Code Review Checklist](/blog/secure-code-review-checklist) — Practical review guide
- [XSS Prevention Guide](/blog/xss-cross-site-scripting-prevention) — Output encoding deep dive
- [SQL Injection Prevention](/blog/sql-injection-prevention-guide) — Database security`,
    date: "2026-02-08",
    author: "SCR Security Research Team",
    category: "OWASP",
    tags: ["OWASP", "Proactive Controls", "Secure Development", "Input Validation", "Authentication", "Best Practices"],
    readTime: "19 min read",
  },
];
