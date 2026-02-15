import { BlogPost } from "./blog-data";

export const tier2ArticlesPart2: BlogPost[] = [
  {
    slug: "serverless-security-aws-lambda-azure-functions",
    title: "Serverless Security: Securing AWS Lambda, Azure Functions & Cloud Functions",
    excerpt:
      "Serverless eliminates infrastructure management but introduces new attack surfaces — injection via event sources, over-privileged IAM roles, cold start timing attacks, and insecure dependencies. This guide covers serverless-specific security patterns.",
    content: `## The Serverless Security Paradox

Serverless computing eliminates the patching burden — no servers to manage, no OS to update. But it doesn't eliminate security. It shifts the responsibility from infrastructure security to **application and configuration security**.

> **Key Shift:** In serverless, **you don't manage the server, but you still own the code, the configuration, the IAM permissions, and the data flow.** These are where 90% of serverless vulnerabilities live.

---

## Serverless Threat Model

| Threat | Description | Traditional Risk | Serverless Risk |
|---|---|---|---|
| OS/Kernel exploits | Attacking the server operating system | High | **Minimal** (provider manages) |
| Injection attacks | SQLi, NoSQLi, command injection | High | **High** (your code, your problem) |
| Over-privileged IAM | Function has more permissions than needed | High | **Very High** (most common issue) |
| Event injection | Malicious payloads via event sources | N/A | **High** (new attack vector) |
| Dependency vulnerabilities | Vulnerable libraries in function | High | **High** (still your deps) |
| Data exposure | Sensitive data in environment vars | Medium | **High** (common anti-pattern) |
| Denial of wallet | Attacker triggers massive invocations | N/A | **High** (pay-per-invocation) |

---

## The #1 Serverless Vulnerability: Over-Privileged IAM

Most Lambda functions are deployed with far more permissions than they need:

\`\`\`json
// BAD — Overly permissive policy (common anti-pattern)
{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*"
}

// GOOD — Minimum required permissions
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:GetItem",
    "dynamodb:PutItem"
  ],
  "Resource": "arn:aws:dynamodb:us-east-1:123456789:table/UserProfiles"
}
\`\`\`

**IAM Least-Privilege Rules for Serverless:**
1. One IAM role per function (not shared across functions)
2. Specify exact actions (not \`dynamodb:*\`)
3. Specify exact resource ARNs (not \`*\`)
4. Use conditions (time-based, IP-based, MFA-required where applicable)
5. Audit permissions quarterly with IAM Access Analyzer

---

## Event Injection Attacks

Serverless functions are triggered by events from many sources — each one is an input that must be validated:

| Event Source | Injection Risk | Example Attack |
|---|---|---|
| API Gateway | SQL/NoSQL injection, XSS | Malicious query parameters |
| S3 Bucket | Path traversal, code execution | Malicious filename in event |
| SNS/SQS | Deserialization, injection | Poisoned message payload |
| DynamoDB Streams | Data manipulation | Modified record triggers bad logic |
| CloudWatch Events | None (trusted source) | Minimal risk |

\`\`\`typescript
// VULNERABLE — Trusting S3 event data without validation
export const handler = async (event: S3Event) => {
  const key = event.Records[0].s3.object.key;
  const command = \`convert /tmp/\${key} /tmp/output.png\`;
  exec(command);  // If key = "file; rm -rf /", command injection!
};

// SECURE — Validate and sanitize event data
export const handler = async (event: S3Event) => {
  const key = event.Records[0].s3.object.key;

  // Validate the key matches expected pattern
  if (!/^uploads\\/[a-zA-Z0-9_-]+\\.(jpg|png|gif)$/.test(key)) {
    throw new Error("Invalid file key");
  }

  // Use safe API instead of shell command
  await sharp(\`/tmp/\${path.basename(key)}\`)
    .resize(800, 600)
    .toFile("/tmp/output.png");
};
\`\`\`

---

## Serverless Security Best Practices

| Practice | Implementation |
|---|---|
| **Least-privilege IAM** | One role per function, exact actions + resources |
| **Input validation** | Validate ALL event source data (API, S3, SQS, etc.) |
| **Environment variables** | Use Secrets Manager, not plaintext env vars for secrets |
| **Dependency security** | npm audit / Snyk in CI/CD, minimize dependencies |
| **Function timeout** | Set minimum timeout (prevent infinite loops) |
| **Concurrency limits** | Set per-function concurrency to prevent denial-of-wallet |
| **VPC isolation** | Place functions accessing sensitive data in VPC |
| **Monitoring** | CloudWatch + X-Ray for full invocation tracing |

---

## Denial-of-Wallet Attacks

Unlike traditional DDoS (denial of service), serverless enables denial-of-wallet — attackers trigger massive function invocations to run up your cloud bill.

**Prevention:**
- Set concurrent execution limits per function
- Set AWS account-level concurrency limits
- Implement budget alerts and auto-shutdown at cost thresholds
- Use WAF with rate limiting on API Gateway
- Monitor invocation anomalies (> 10x baseline = alert)

---

## Further Reading

- [OWASP Serverless Top 10](https://owasp.org/www-project-serverless-top-10/) — Serverless-specific risks
- [Cloud Security Guide](/blog/cloud-security-aws-azure-gcp) — Multi-cloud security
- [IaC Security](/blog/iac-security-terraform-docker-kubernetes) — Securing serverless infrastructure as code
- [Secrets Management](/blog/secrets-management-devsecops-vault-rotation) — Don't hardcode secrets in Lambda`,
    date: "2026-01-21",
    author: "SCR Security Research Team",
    category: "Cloud Security",
    tags: ["Serverless", "AWS Lambda", "Azure Functions", "Cloud Security", "IAM", "FaaS"],
    readTime: "17 min read",
  },

  {
    slug: "soc-2-compliance-startup-guide",
    title: "SOC 2 Compliance for Startups: The No-Nonsense Implementation Guide",
    excerpt:
      "SOC 2 is the most requested compliance certification for SaaS companies. This guide covers the 5 Trust Service Criteria, audit preparation, evidence collection, tool recommendations, and timeline for achieving SOC 2 Type II.",
    content: `## Why SOC 2 Matters for Startups

If you sell software to businesses, you will be asked for SOC 2 compliance. It's the table-stakes security certification for SaaS companies.

> **Business Reality:** 84% of enterprise procurement processes require SOC 2 compliance from SaaS vendors (Drata 2025). Startups without SOC 2 lose an estimated **35% of enterprise deals** during security review.

---

## SOC 2 Fundamentals

### What SOC 2 Is (and Isn't)

| What SOC 2 IS | What SOC 2 ISN'T |
|---|---|---|
| An audit of your security controls | A checklist you can complete and forget |
| Based on 5 Trust Service Criteria | A one-time certification |
| Performed by a licensed CPA firm | Something you self-certify |
| Evaluated against YOUR stated controls | A fixed set of requirements |
| A continuous process (Type II) | A point-in-time snapshot (that's Type I) |

### SOC 2 Type I vs Type II

| Aspect | Type I | Type II |
|---|---|---|
| What it evaluates | Control design at a point in time | Control effectiveness over a period |
| Observation period | Single date | 3-12 months |
| Customer confidence | Lower (controls exist but untested) | Higher (controls work consistently) |
| Time to achieve | 2-3 months | 6-12 months |
| Cost | $15-30K | $30-75K |
| Recommendation | Good starting point | Required for enterprise sales |

---

## The 5 Trust Service Criteria

| # | Criteria | Required? | What It Covers |
|---|---|---|---|
| 1 | **Security** (Common Criteria) | **Always** | Protection against unauthorized access |
| 2 | **Availability** | Optional | System uptime and performance |
| 3 | **Processing Integrity** | Optional | Data processing accuracy |
| 4 | **Confidentiality** | Optional | Protection of confidential info |
| 5 | **Privacy** | Optional | PII handling and privacy |

> **Start with Security.** Every SOC 2 report includes the Security criteria. Add Availability and Confidentiality if you're a SaaS company. Add Privacy if you handle PII.

---

## Implementation Timeline (Type II)

| Phase | Duration | Activities |
|---|---|---|
| **1. Readiness** | Month 1-2 | Gap assessment, policy writing, tool selection |
| **2. Implementation** | Month 2-4 | Deploy controls, configure monitoring, train team |
| **3. Observation (Type I)** | Month 4-5 | Auditor evaluates control design |
| **4. Observation (Type II)** | Month 5-11 | 6-month observation period — controls running |
| **5. Audit** | Month 11-12 | Auditor evaluates evidence, writes report |
| **Total** | **~12 months** | From start to Type II report |

---

## Key Controls Checklist

### Access Control
- [ ] Unique user accounts (no shared accounts)
- [ ] MFA enforced for all production access
- [ ] Role-based access control (RBAC)
- [ ] Quarterly access reviews
- [ ] Background checks for employees
- [ ] Onboarding/offboarding procedures documented

### Change Management
- [ ] All code changes via pull requests
- [ ] Code review required before merge
- [ ] CI/CD pipeline with automated testing
- [ ] Change approval documentation
- [ ] Separate dev/staging/production environments
- [ ] Rollback procedures documented

### Risk Assessment
- [ ] Annual risk assessment documented
- [ ] Vendor risk management program
- [ ] Business continuity plan
- [ ] Disaster recovery plan (with RTO/RPO)

### Monitoring & Logging
- [ ] Centralized log management
- [ ] Security event alerting
- [ ] Infrastructure monitoring
- [ ] Incident response procedures
- [ ] Annual penetration testing

### Data Protection
- [ ] Encryption in transit (TLS 1.2+)
- [ ] Encryption at rest
- [ ] Data classification policy
- [ ] Data retention and disposal policies
- [ ] Backup procedures with tested restoration

---

## Top SOC 2 Automation Platforms

| Platform | Price Range | Best For | Key Features |
|---|---|---|---|
| **Vanta** | $10-50K/yr | Startups, mid-market | Automated evidence, 20+ integrations |
| **Drata** | $10-40K/yr | Startups, SaaS | Continuous monitoring, trust center |
| **Secureframe** | $8-30K/yr | Early-stage startups | Fast implementation, compliance AI |
| **Laika** | $15-40K/yr | Mid-market | Multi-framework support |

---

## Further Reading

- [AICPA Trust Services Criteria](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/trustservices.html) — Official SOC 2 criteria
- [PCI DSS 4.0 Guide](/blog/pci-dss-4-0-compliance-guide-developers) — Payment compliance
- [GDPR & CCPA Guide](/blog/gdpr-ccpa-compliance-developers-guide-2026) — Privacy compliance`,
    date: "2026-01-20",
    author: "SCR Security Research Team",
    category: "Compliance",
    tags: ["SOC 2", "Compliance", "Startup Security", "Audit", "SaaS Security", "Trust Service Criteria"],
    readTime: "17 min read",
  },

  {
    slug: "threat-modeling-guide-stride-pasta-dread",
    title: "Threat Modeling for Developers: STRIDE, PASTA & DREAD with Practical Examples",
    excerpt:
      "Threat modeling is the most cost-effective security activity — finding design flaws before writing code. This guide covers STRIDE, PASTA, and DREAD methodologies with real-world examples for web, API, and cloud applications.",
    content: `## What Is Threat Modeling?

Threat modeling is the structured process of identifying security threats, understanding attack surfaces, and designing mitigations — **before writing code**. It's where you answer: "What can go wrong?"

> **Microsoft's Data:** Internal Microsoft research found that threat modeling at the design phase prevented **64% of security bugs** that would otherwise have been found (expensively) during penetration testing or post-release.

---

## When to Threat Model

| Trigger | Example |
|---|---|
| New feature design | Adding payment processing |
| Architecture change | Migrating to microservices |
| New integration | Adding third-party API |
| Security incident | Post-breach analysis |
| Compliance requirement | GDPR data processing assessment |
| Periodic review | Quarterly or per-release |

---

## STRIDE: The Most Popular Framework

STRIDE was developed by Microsoft and categorizes threats into 6 types:

| Category | Threat | Question | Typical Mitigation |
|---|---|---|---|
| **S**poofing | Identity falsification | Can someone pretend to be someone else? | Strong authentication, MFA |
| **T**ampering | Data modification | Can data be changed in transit or at rest? | Digital signatures, checksums, HTTPS |
| **R**epudiation | Denying actions | Can a user deny performing an action? | Audit logging, digital signatures |
| **I**nformation Disclosure | Data leakage | Can unauthorized users see data? | Encryption, access controls |
| **D**enial of Service | System disruption | Can the system be made unavailable? | Rate limiting, redundancy, CDN |
| **E**levation of Privilege | Gaining unauthorized access | Can a user escalate their permissions? | RBAC, input validation, sandboxing |

### STRIDE Applied: User Authentication System

\`\`\`
System: Login page → API → Database → Session management

Spoofing:
  Threat: Attacker uses stolen credentials
  Mitigation: MFA, rate limiting, impossible travel detection

Tampering:
  Threat: Session token modified to change user ID
  Mitigation: Signed JWTs, server-side session validation

Repudiation:
  Threat: User denies making a purchase
  Mitigation: Immutable audit log with timestamps and IP

Information Disclosure:
  Threat: Password hashes exposed via API
  Mitigation: Never return password fields, use Argon2id

Denial of Service:
  Threat: Credential stuffing overwhelms login endpoint
  Mitigation: Rate limiting (5/min), CAPTCHA after 3 failures

Elevation of Privilege:
  Threat: Regular user accesses admin panel
  Mitigation: Server-side role checks on every request
\`\`\`

---

## PASTA: Process for Attack Simulation and Threat Analysis

PASTA is a risk-centric methodology with 7 stages:

| Stage | Activity | Output |
|---|---|---|
| 1. Define Objectives | Business objectives, compliance requirements | Security objectives document |
| 2. Define Technical Scope | Architecture diagrams, data flows | Technical scope document |
| 3. Application Decomposition | DFDs, trust boundaries, entry points | Decomposition diagram |
| 4. Threat Analysis | Threat intelligence, attack patterns | Threat library |
| 5. Vulnerability Analysis | CVEs, weaknesses, scan results | Vulnerability list |
| 6. Attack Modeling | Attack trees, abuse cases | Attack scenarios |
| 7. Risk Analysis & Management | Risk rating, mitigation priorities | Risk treatment plan |

---

## DREAD: Threat Scoring

DREAD scores each threat on 5 dimensions (1-10 scale):

| Dimension | Question | Score Guide |
|---|---|---|
| **D**amage | How severe is the impact? | 10 = complete system compromise |
| **R**eproducibility | How easy to reproduce? | 10 = every time, no special conditions |
| **E**xploitability | How easy to exploit? | 10 = automated tool, no skill required |
| **A**ffected Users | How many users impacted? | 10 = all users |
| **D**iscoverability | How easy to discover? | 10 = publicly known, Google-findable |

**Score Interpretation:**
- **40-50:** Critical — Fix immediately
- **30-39:** High — Fix this sprint
- **20-29:** Medium — Plan for next cycle
- **10-19:** Low — Backlog

---

## Data Flow Diagram Template

\`\`\`
┌──────────────┐         HTTPS          ┌──────────────────┐
│   Browser    │ ─────────────────────► │   API Gateway     │
│  (External)  │ ◄───────────────────── │   (Trust boundary) │
└──────────────┘                        └────────┬─────────┘
                                                 │
                                    ┌────────────┴────────────┐
                                    │                         │
                              ┌─────▼──────┐          ┌──────▼──────┐
                              │  Auth       │          │  Business   │
                              │  Service    │          │  Logic      │
                              │ (Internal)  │          │  (Internal) │
                              └─────┬──────┘          └──────┬──────┘
                                    │                         │
                              ┌─────▼──────┐          ┌──────▼──────┐
                              │  User DB   │          │  Data Store │
                              │ (Secrets)  │          │ (PII)       │
                              └────────────┘          └─────────────┘
\`\`\`

Trust boundaries to analyze:
- Browser ↔ API Gateway (public internet)
- API Gateway ↔ Internal services (network boundary)
- Services ↔ Databases (data access boundary)

---

## Threat Modeling Checklist

- [ ] Identify all entry points (APIs, webhooks, file uploads, event sources)
- [ ] Map data flows (where does sensitive data travel?)
- [ ] Define trust boundaries (where do security contexts change?)
- [ ] Apply STRIDE to each component and data flow
- [ ] Score threats using DREAD
- [ ] Identify mitigations for high-risk threats
- [ ] Document accepted risks with justification
- [ ] Review threat model when architecture changes

---

## Further Reading

- [OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling) — Methodology guide
- Microsoft (2024), "Threat Modeling Tool" — Free threat modeling application
- [Shift-Left Security](/blog/shift-left-security-reducing-vulnerabilities-2026) — Security at design time
- [OWASP Proactive Controls](/blog/owasp-proactive-controls-2026-secure-development) — Developer security practices`,
    date: "2026-01-19",
    author: "SCR Security Research Team",
    category: "Application Security",
    tags: ["Threat Modeling", "STRIDE", "PASTA", "DREAD", "Security Design", "Application Security"],
    readTime: "18 min read",
  },

  {
    slug: "security-champions-program-building-guide",
    title: "Building a Security Champions Program: Scaling Security Across Dev Teams",
    excerpt:
      "Security teams can't review every line of code. Security Champions embed security expertise in every development team. This guide covers program design, champion selection, training, metrics, and sustaining engagement.",
    content: `## Why Security Champions?

The security-to-developer ratio in most organizations is approximately **1:100**. Central security teams are a bottleneck — they can't review every pull request, participate in every design discussion, or answer every security question.

> **The Solution:** Security Champions are developers (or testers, architects, SREs) who volunteer to be the security point person for their team. They're not full-time security professionals — they're developers who have security as a force-multiplier skill.

| Model | Security Team Only | Security Champions |
|---|---|---|
| Security review coverage | 10-20% of PRs | **80-100%** (first-pass) |
| Time to get security answer | 2-5 days (backlog) | **Same day** (champion on team) |
| Security culture | "Security's problem" | **"Everyone's responsibility"** |
| SDLC integration | End-of-cycle gatekeeping | **Throughout development** |
| Developer friction | High (external team) | Low (peer on same team) |

---

## Program Structure

### Champion Selection
- **Volunteer-based** — Champions should want the role, not be assigned
- **One per team** — Every development team has at least one champion
- **Technical credibility** — Champions should be respected developers on their team
- **Time commitment** — 10-20% of work time dedicated to security activities
- **Manager support** — Manager must approve and protect the time allocation

### Champion Responsibilities

| Activity | Frequency | Time Investment |
|---|---|---|
| Security-focused code review | Per sprint | 3-4 hours/week |
| Threat modeling for new features | Per feature | 1-2 hours/feature |
| Security training for team | Monthly | 1 hour/month |
| Triage security scanner findings | Per sprint | 1-2 hours/week |
| Security stand-up / community meeting | Bi-weekly | 1 hour |
| Stay current on security trends | Ongoing | 1-2 hours/week |

### Training Program

| Phase | Topic | Duration |
|---|---|---|
| **Onboarding** | OWASP Top 10, secure coding basics | 2-day workshop |
| **Month 1-3** | SAST/DAST tools, code review for security | Hands-on labs |
| **Month 3-6** | Threat modeling, API security, cloud security | Workshops |
| **Month 6-12** | Advanced: pen testing basics, incident response | Mentorship |
| **Ongoing** | CTF challenges, conference talks, certifications | Self-directed |

---

## Metrics for Success

| Metric | Baseline | 6-Month Target | 12-Month Target |
|---|---|---|---|
| Security findings per release | 45 | 25 | < 10 |
| Mean time to fix (SAST findings) | 45 days | 14 days | 7 days |
| PR security review coverage | 15% | 60% | > 90% |
| Threat models completed | 0 | 50% of major features | 90% of features |
| Security training completion | 20% | 80% | > 95% |
| Vulnerabilities found in production | 60% | 30% | < 15% |
| Champion satisfaction (NPS) | N/A | > 30 | > 50 |

---

## Sustaining Engagement

| Strategy | Implementation |
|---|---|
| **Recognition** | Quarterly awards, internal blog features |
| **Career growth** | Security skills on promotion criteria |
| **Exclusive access** | Early access to security tools and training |
| **Community** | Bi-weekly champion meetups, Slack channel |
| **Budget** | Conference attendance, certification funding |
| **Executive sponsorship** | CISO presents at champion events |

---

## Further Reading

- [Shift-Left Security](/blog/shift-left-security-reducing-vulnerabilities-2026) — Champions as shift-left enablers
- [OWASP Security Champions Guide](https://owasp.org/www-project-security-champions-guidebook/) — OWASP playbook
- [DevSecOps Complete Guide](/blog/devsecops-complete-guide-2025) — Organizational security culture`,
    date: "2026-01-18",
    author: "SCR Security Research Team",
    category: "Application Security",
    tags: ["Security Champions", "Security Culture", "DevSecOps", "Training", "AppSec", "Shift Left"],
    readTime: "15 min read",
  },

  {
    slug: "encryption-best-practices-tls-aes-2026",
    title: "Encryption Best Practices 2026: TLS 1.3, AES-256, Argon2 & Post-Quantum Readiness",
    excerpt:
      "This guide covers modern encryption standards — TLS 1.3 configuration, AES-256-GCM for data at rest, Argon2id for password hashing, and preparing for post-quantum cryptography with ML-KEM and ML-DSA.",
    content: `## Modern Cryptography Standards (2026)

| Use Case | Recommended Algorithm | Key Size | Status |
|---|---|---|---|
| Data in transit | **TLS 1.3** | N/A (protocol) | Current standard |
| Symmetric encryption | **AES-256-GCM** | 256-bit | Current standard |
| Password hashing | **Argon2id** | N/A (hash) | OWASP recommended |
| Digital signatures | **Ed25519** or **ECDSA P-256** | 256-bit | Current standard |
| Key exchange | **X25519** | 255-bit | Current standard |
| Hashing | **SHA-256** or **SHA-3** | 256-bit | Current standard |
| Post-quantum KEM | **ML-KEM-768** (Kyber) | 768-bit | NIST finalized 2024 |
| Post-quantum signatures | **ML-DSA-65** (Dilithium) | Level 3 | NIST finalized 2024 |

---

## TLS 1.3 Configuration

### What Changed in TLS 1.3

| Feature | TLS 1.2 | TLS 1.3 |
|---|---|---|
| Handshake | 2 round trips | **1 round trip** (0-RTT available) |
| Cipher suites | 37+ options | **5 secure options** only |
| Key exchange | RSA or ECDHE | **ECDHE only** (forward secrecy mandatory) |
| Removed features | Static RSA, RC4, SHA-1, CBC mode, compression | All removed |
| 0-RTT resumption | Not available | Available (with replay protections) |

### Nginx TLS 1.3 Configuration
\`\`\`nginx
server {
    listen 443 ssl http2;
    server_name securecodereviews.com;

    ssl_certificate /etc/letsencrypt/live/securecodereviews.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/securecodereviews.com/privkey.pem;

    # TLS 1.2 minimum (TLS 1.3 preferred)
    ssl_protocols TLSv1.2 TLSv1.3;

    # Cipher suites (TLS 1.3 uses its own, TLS 1.2 uses these)
    ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS (2 years with preload)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
}
\`\`\`

---

## Data Encryption at Rest

### AES-256-GCM (Authenticated Encryption)
\`\`\`typescript
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// AES-256-GCM — Provides both encryption AND integrity verification
function encrypt(plaintext: string, key: Buffer): EncryptedData {
  const iv = randomBytes(12);  // 96-bit IV for GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return {
    ciphertext,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

function decrypt(data: EncryptedData, key: Buffer): string {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(data.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(data.authTag, "hex"));

  let plaintext = decipher.update(data.ciphertext, "hex", "utf8");
  plaintext += decipher.final("utf8");
  return plaintext;
}
\`\`\`

**Critical Rules:**
- Never reuse an IV with the same key (GCM catastrophically fails)
- Use authenticated encryption (GCM, ChaCha20-Poly1305) — not CBC
- Store encryption keys in KMS (AWS KMS, Azure Key Vault), never in code

---

## Password Hashing

### Argon2id (Recommended)
\`\`\`typescript
import argon2 from "argon2";

// Hash password with Argon2id
async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,   // 64 MB
    timeCost: 3,          // 3 iterations
    parallelism: 4,       // 4 threads
  });
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
\`\`\`

### Hashing Algorithm Comparison

| Algorithm | Status | Memory Hardness | GPU Resistance |
|---|---|---|---|
| MD5 | **BROKEN** — Never use | No | No |
| SHA-1 | **BROKEN** — Never use | No | No |
| SHA-256 | OK for hashing, NOT for passwords | No | No |
| bcrypt | Good (legacy) | Fixed (4KB) | Moderate |
| scrypt | Good | Configurable | Good |
| **Argon2id** | **Best** | Configurable | **Excellent** |

---

## Post-Quantum Cryptography

### Why Post-Quantum Matters Now

Quantum computers that can break RSA and ECC are estimated to arrive between 2030-2035. But:
- **Harvest Now, Decrypt Later:** Adversaries are collecting encrypted data today to decrypt when quantum computers arrive
- **Migration takes years:** Transitioning cryptographic infrastructure is a 3-5 year project
- **NIST finalized standards in 2024:** ML-KEM and ML-DSA are production-ready

### Recommended Post-Quantum Algorithms

| Purpose | Algorithm | NIST Standard | Status |
|---|---|---|---|
| Key Encapsulation | **ML-KEM-768** (Kyber) | FIPS 203 | Finalized 2024 |
| Digital Signatures | **ML-DSA-65** (Dilithium) | FIPS 204 | Finalized 2024 |
| Hash-based Signatures | **SLH-DSA** (SPHINCS+) | FIPS 205 | Finalized 2024 |

### Hybrid TLS (Classical + Post-Quantum)

Chrome and Cloudflare already support hybrid key exchange using X25519 + ML-KEM-768, protecting against both classical and quantum attacks.

---

## Common Cryptographic Mistakes

| Mistake | Risk | Fix |
|---|---|---|
| Rolling your own crypto | Subtle bugs = complete failure | Use established libraries |
| ECB mode | Pattern leakage | Use GCM or CTR mode |
| Reusing IVs/nonces | Key recovery in GCM, predictability | Generate random IV per encryption |
| Hardcoded keys | Key exposure in source code | KMS or Vault |
| SHA-256 for passwords | No brute-force protection | Argon2id or bcrypt |
| RSA-1024 | Breakable with current computing | RSA-2048 minimum (RSA-4096 preferred) |

---

## Further Reading

- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography) — PQC standards
- [Password Security Guide](/blog/password-security-hashing-bcrypt-argon2) — Password hashing deep dive
- [PCI DSS 4.0 Compliance](/blog/pci-dss-4-0-compliance-guide-developers) — Encryption requirements
- [OWASP Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/) — A02 vulnerability guide`,
    date: "2026-01-17",
    author: "SCR Security Research Team",
    category: "Cryptography",
    tags: ["Encryption", "TLS", "AES", "Argon2", "Post-Quantum", "Cryptography", "Password Hashing"],
    readTime: "20 min read",
  },
];
