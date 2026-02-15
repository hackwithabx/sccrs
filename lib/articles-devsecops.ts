import { BlogPost } from "./blog-data";

export const devsecopsArticles: BlogPost[] = [
  {
    slug: "shift-left-security-reducing-vulnerabilities-2026",
    title: "Shift-Left Security: How to Catch 85% of Vulnerabilities Before Production",
    excerpt:
      "Shift-left security moves security testing earlier in the SDLC — from production firefighting to design-time prevention. This guide shows how to implement security in requirements, design, coding, and CI/CD with measurable results.",
    content: `## What Is Shift-Left Security?

Shift-left security is the practice of integrating security activities as early as possible in the software development lifecycle (SDLC). Instead of testing for vulnerabilities after code is written and deployed, you embed security into every phase — from requirements gathering through design, coding, building, and testing.

> **The Data Behind Shift-Left:** IBM's 2025 Cost of a Data Breach Report found that organizations with DevSecOps practices — a key indicator of shift-left maturity — identified and contained breaches **252 days faster** and saved **$1.68 million** more per breach than those without.

### The Cost of Finding Bugs Late

| Phase Where Bug is Found | Cost to Fix (Relative) | Example |
|---|---|---|
| Requirements/Design | **1x** (baseline) | Threat model catches missing auth requirement |
| Development | **6.5x** | Code review finds SQL injection |
| Testing/QA | **15x** | Pen test discovers IDOR vulnerability |
| Production | **30-100x** | Data breach with legal, PR, remediation costs |

*Source: NIST Special Publication 800-160, Capers Jones "Applied Software Measurement"*

---

## The Shift-Left Security Framework

### Phase 1: Requirements (Security by Design)

Before any code is written, define security requirements:

**Security Requirements Checklist:**
- Authentication requirements (MFA, SSO, passwordless)
- Authorization model (RBAC, ABAC, ownership-based)
- Data classification (public, internal, confidential, restricted)
- Encryption requirements (in transit, at rest, in use)
- Compliance constraints (GDPR, HIPAA, PCI-DSS, SOC 2)
- API security requirements (rate limiting, authentication method)
- Logging and audit requirements
- Incident response requirements

### Phase 2: Design (Threat Modeling)

Use STRIDE or PASTA to identify threats before writing a single line of code.

**STRIDE Threat Model for a User Login System:**

| Threat | Category | Example | Mitigation |
|---|---|---|---|
| **S**poofing | Identity | Attacker impersonates a user | MFA, strong password policy |
| **T**ampering | Data integrity | Session token modified | Signed JWTs, HMAC validation |
| **R**epudiation | Non-repudiation | User denies performing action | Comprehensive audit logging |
| **I**nformation Disclosure | Confidentiality | Password hashes leaked | Argon2id hashing, encrypted storage |
| **D**enial of Service | Availability | Login endpoint DDoS | Rate limiting, CAPTCHA after 3 failures |
| **E**levation of Privilege | Authorization | Regular user accesses admin panel | Server-side role enforcement on every request |

### Phase 3: Development (Secure Coding)

**IDE Security Plugins — Catch Vulnerabilities While Typing:**

| Tool | Languages | What It Finds | IDE Support |
|---|---|---|---|
| **Semgrep** | 30+ languages | OWASP Top 10, custom rules | VS Code, IntelliJ |
| **SonarLint** | Java, JS/TS, Python, C# | Bugs, code smells, vulns | VS Code, IntelliJ |
| **Snyk Code** | 10+ languages | Real-time SAST in IDE | VS Code, IntelliJ |
| **ESLint (security plugins)** | JavaScript/TypeScript | Insecure patterns | VS Code |
| **Checkov** | Terraform, K8s, Docker | IaC misconfigurations | VS Code |

**Pre-Commit Hooks:**
\`\`\`bash
# .pre-commit-config.yaml
repos:
  # Prevent secrets from being committed
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks

  # Run Semgrep for common vulnerabilities
  - repo: https://github.com/semgrep/semgrep
    rev: v1.60.0
    hooks:
      - id: semgrep
        args: ['--config', 'auto', '--error']

  # Check for hardcoded credentials
  - repo: https://github.com/zricethezav/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
\`\`\`

### Phase 4: Build/CI (Automated Security Gates)

**CI/CD Security Pipeline:**
\`\`\`yaml
# GitHub Actions — Security pipeline
name: Security Gates
on: [pull_request]

jobs:
  sast:
    name: Static Analysis (SAST)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Semgrep
        uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/owasp-top-ten
            p/nodejs
            p/typescript
          generateSarif: "1"

  sca:
    name: Dependency Scanning (SCA)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm audit --audit-level=high
      - name: Snyk SCA
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}

  secrets:
    name: Secrets Detection
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

  iac:
    name: IaC Security
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Checkov
        uses: bridgecrewio/checkov-action@master
        with:
          directory: ./infrastructure
          framework: terraform

  container:
    name: Container Scanning
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t app:test .
      - name: Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: app:test
          severity: CRITICAL,HIGH
          exit-code: 1
\`\`\`

### Phase 5: Test (Security Testing)

| Test Type | When | What It Finds | Example Tools |
|---|---|---|---|
| **SAST** | On every PR | Source code vulnerabilities | Semgrep, CodeQL, SonarQube |
| **SCA** | On every build | Vulnerable dependencies | Snyk, npm audit, Dependabot |
| **DAST** | Nightly / staging | Runtime vulnerabilities | OWASP ZAP, Burp Suite |
| **IAST** | During integration tests | Real-time app behavior | Contrast Security |
| **Pen Testing** | Quarterly | Business logic, complex chains | Manual + Burp Suite |
| **Fuzz Testing** | Weekly | Edge cases, crashes | OSS-Fuzz, AFL |

---

## Measuring Shift-Left Success

| KPI | Before Shift-Left | After Shift-Left (Target) |
|---|---|---|
| Vulns found in production | 60% | < 15% |
| Mean time to remediate | 120 days | 14 days |
| Security findings per release | 45 | < 5 |
| Dev time spent on security rework | 25% | < 5% |
| Security review coverage | 20% of PRs | 100% (automated) |
| Cost per vulnerability fix | $15,000 | $500 |

---

## Common Shift-Left Mistakes

| Mistake | Why It Fails | Better Approach |
|---|---|---|
| Adding too many security gates at once | Developers revolt; productivity drops | Start with secrets detection + SCA, add gradually |
| Blocking all builds on any finding | False positives create alert fatigue | Block on critical/high only; warn on medium |
| Security team owns everything | Doesn't scale; creates bottleneck | Security champions in each dev team |
| No developer training | Devs can't fix what they don't understand | Quarterly secure coding workshops |
| Ignoring false positives | Tool credibility erodes | Tune rules; maintain suppress lists |

---

## Further Reading

- [DevSecOps Complete Guide](/blog/devsecops-complete-guide-2025) — Comprehensive DevSecOps implementation
- [IaC Security Guide](/blog/iac-security-terraform-docker-kubernetes) — Infrastructure security in CI/CD
- [Secrets Management Guide](/blog/secrets-management-devsecops-vault-rotation) — Preventing credential leaks
- [OWASP Proactive Controls](/blog/owasp-proactive-controls-2026-secure-development) — Developer security practices`,
    date: "2026-02-02",
    author: "SCR Security Research Team",
    category: "DevSecOps",
    tags: ["Shift-Left", "DevSecOps", "SAST", "SCA", "CI/CD", "Security Testing", "SDLC"],
    readTime: "20 min read",
  },

  {
    slug: "iac-security-terraform-docker-kubernetes",
    title: "IaC Security: Securing Terraform, Docker & Kubernetes Before Deployment",
    excerpt:
      "67% of IaC templates contain at least one misconfiguration. This guide covers Terraform security scanning, Docker hardening, Kubernetes RBAC, OPA policies, and automated IaC security in CI/CD pipelines.",
    content: `## Infrastructure as Code Is Infrastructure as Vulnerability

Infrastructure as Code (IaC) transformed how we deploy systems — but it also codified our misconfigurations. According to Bridgecrew's 2025 State of IaC Security Report:

| Finding | Value |
|---|---|
| IaC templates with at least one misconfiguration | **67%** |
| Average misconfigurations per template | **12.7** |
| Most common: overly permissive IAM policies | **38%** of all misconfigs |
| Second: unencrypted data storage | **29%** |
| Third: excessive network exposure | **22%** |

> **The Advantage:** Unlike manual infrastructure, IaC misconfigurations can be found and fixed **before deployment**. This is the power of shift-left for infrastructure — scan the code, not the running system.

---

## Terraform Security

### The 10 Most Common Terraform Misconfigurations

| # | Misconfiguration | Risk | Fix |
|---|---|---|---|
| 1 | S3 bucket public access | Data exposure | \`block_public_access = true\` |
| 2 | Security group 0.0.0.0/0 on SSH | Unauthorized access | Restrict to known CIDRs |
| 3 | No encryption at rest | Data exposure | Enable encryption on all storage |
| 4 | IAM \`*\` permissions | Privilege escalation | Least-privilege policies |
| 5 | No CloudTrail logging | No audit trail | Enable multi-region CloudTrail |
| 6 | Default VPC usage | Shared network risk | Create custom VPC |
| 7 | No MFA delete on S3 | Accidental/malicious deletion | Enable MFA delete |
| 8 | RDS publicly accessible | Database exposure | \`publicly_accessible = false\` |
| 9 | No lifecycle policies | Cost + stale resources | Set TTLs and rotation |
| 10 | Hardcoded secrets | Credential exposure | Use \`aws_secretsmanager_secret\` |

### Secure Terraform Patterns

\`\`\`hcl
# SECURE — S3 bucket with full security hardening
resource "aws_s3_bucket" "data" {
  bucket = "company-data-prod"
}

resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data" {
  bucket = aws_s3_bucket.data.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.s3.arn
    }
  }
}

resource "aws_s3_bucket_versioning" "data" {
  bucket = aws_s3_bucket.data.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_logging" "data" {
  bucket        = aws_s3_bucket.data.id
  target_bucket = aws_s3_bucket.logs.id
  target_prefix = "s3-access-logs/"
}
\`\`\`

### Terraform Security Scanning Tools

| Tool | Checks | Integration |
|---|---|---|
| **Checkov** | 2,500+ rules across AWS/Azure/GCP | CLI, CI/CD, IDE |
| **tfsec** | Terraform-specific security rules | CLI, GitHub Actions |
| **Terrascan** | Multi-IaC (Terraform, K8s, Helm) | CLI, CI/CD |
| **Sentinel** | HashiCorp policy-as-code | Terraform Cloud/Enterprise |
| **OPA/Conftest** | General purpose policy engine | Any IaC format |

---

## Docker Security

### Docker Security Hardening Checklist

\`\`\`dockerfile
# SECURE — Production-ready Dockerfile

# 1. Use specific, minimal base image (not 'latest')
FROM node:20-alpine AS builder

# 2. Create non-root user
RUN addgroup -g 1001 -S appgroup && \\
    adduser -S appuser -u 1001 -G appgroup

# 3. Set working directory
WORKDIR /app

# 4. Copy package files first (layer caching)
COPY package.json package-lock.json ./

# 5. Install dependencies (production only, ignore scripts)
RUN npm ci --only=production --ignore-scripts

# 6. Copy application code
COPY --chown=appuser:appgroup . .

# 7. Build application
RUN npm run build

# 8. Multi-stage build — production image
FROM node:20-alpine AS production

# 9. Install security updates
RUN apk update && apk upgrade --no-cache

# 10. Create non-root user in production image
RUN addgroup -g 1001 -S appgroup && \\
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# 11. Copy only production artifacts
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules

# 12. Drop all capabilities, run as non-root
USER appuser

# 13. Set read-only filesystem where possible
# (configure at runtime with --read-only flag)

# 14. Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget -qO- http://localhost:3000/health || exit 1

# 15. Expose only required port
EXPOSE 3000

CMD ["node", "dist/server.js"]
\`\`\`

### Container Scanning

\`\`\`bash
# Scan Docker image for vulnerabilities
trivy image myapp:latest --severity HIGH,CRITICAL

# Scan and fail on critical findings (CI/CD integration)
trivy image myapp:latest --severity CRITICAL --exit-code 1

# Scan Dockerfile for misconfigurations
trivy config ./Dockerfile
\`\`\`

---

## Kubernetes Security

### K8s Security Fundamentals

| Area | Risk | Control |
|---|---|---|
| **RBAC** | Over-privileged service accounts | Least-privilege ClusterRoles |
| **Pod Security** | Containers running as root | Pod Security Standards (restricted) |
| **Network** | Unrestricted pod-to-pod traffic | Network Policies |
| **Secrets** | Secrets in etcd unencrypted | External secrets management |
| **Images** | Pulling untrusted images | Image allowlists, signing |
| **Runtime** | Container escape | Seccomp, AppArmor, read-only FS |

### Secure Pod Configuration

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  # Don't use default service account
  serviceAccountName: app-specific-sa
  automountServiceAccountToken: false

  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    fsGroup: 1001
    seccompProfile:
      type: RuntimeDefault

  containers:
    - name: app
      image: myregistry.com/app:v1.2.3@sha256:abc123...
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop: ["ALL"]
      resources:
        limits:
          cpu: "500m"
          memory: "256Mi"
        requests:
          cpu: "100m"
          memory: "128Mi"
      livenessProbe:
        httpGet:
          path: /health
          port: 3000
        initialDelaySeconds: 10
      volumeMounts:
        - name: tmp
          mountPath: /tmp

  volumes:
    - name: tmp
      emptyDir: {}
\`\`\`

### Kubernetes Network Policy (Zero-Trust Networking)
\`\`\`yaml
# Default deny all traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress

---
# Allow only specific traffic
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-api
spec:
  podSelector:
    matchLabels:
      app: api-server
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - port: 3000
          protocol: TCP
\`\`\`

---

## IaC Security in CI/CD

### Automated IaC Security Pipeline
\`\`\`yaml
# Combined IaC security scanning
name: IaC Security
on: [pull_request]

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Checkov Terraform scan
        uses: bridgecrewio/checkov-action@master
        with:
          directory: ./terraform
          framework: terraform
          soft_fail: false  # Block PR on failures

  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Hadolint Dockerfile lint
        uses: hadolint/hadolint-action@v3.1.0
        with:
          dockerfile: Dockerfile
      - name: Build and scan
        run: |
          docker build -t test:latest .
          trivy image test:latest --exit-code 1 --severity HIGH,CRITICAL

  kubernetes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: KubeSec scan
        run: |
          kubesec scan k8s/*.yaml
      - name: Checkov K8s scan
        uses: bridgecrewio/checkov-action@master
        with:
          directory: ./k8s
          framework: kubernetes
\`\`\`

---

## Further Reading

- [Container Security Best Practices](/blog/container-security-best-practices) — Docker and container runtime security
- [Shift-Left Security](/blog/shift-left-security-reducing-vulnerabilities-2026) — Integrating security into the SDLC
- [DevSecOps Complete Guide](/blog/devsecops-complete-guide-2025) — Full DevSecOps implementation
- [Cloud Security Guide](/blog/cloud-security-aws-azure-gcp) — Multi-cloud security hardening`,
    date: "2026-02-01",
    author: "SCR Security Research Team",
    category: "DevSecOps",
    tags: ["IaC", "Terraform", "Docker", "Kubernetes", "DevSecOps", "Checkov", "Container Security"],
    readTime: "21 min read",
  },

  {
    slug: "secrets-management-devsecops-vault-rotation",
    title: "Secrets Management in DevSecOps: Vault, Rotation & Zero Hardcoded Credentials",
    excerpt:
      "Hardcoded secrets appear in 1 of every 400 git commits. This guide covers secrets detection, HashiCorp Vault, AWS Secrets Manager, automated rotation, CI/CD secrets security, and achieving zero hardcoded credentials.",
    content: `## The Hardcoded Secrets Epidemic

Secrets — API keys, database passwords, tokens, private keys, certificates — are the keys to your kingdom. And they're everywhere they shouldn't be.

> **GitGuardian 2025 State of Secrets Sprawl:** Analyzed 1.5 billion git commits and found **12.8 million new secret occurrences** in public repositories in 2024 alone — a 28% increase over 2023. One in every 400 commits contains at least one hardcoded secret.

| Metric | Value | Source |
|---|---|---|
| New secrets found in public repos (2024) | **12.8 million** | GitGuardian 2025 |
| Commits containing a secret | **1 in 400** | GitGuardian 2025 |
| Avg time a leaked secret stays valid | **5+ years** | GitGuardian |
| Orgs with secrets in their codebase | **73%** | CyberArk 2025 |
| Breaches involving stolen credentials | **49%** | Verizon DBIR 2025 |
| Most common leaked secret type | **Cloud provider keys** (AWS, GCP, Azure) | GitGuardian |

---

## Types of Secrets and Where They Leak

| Secret Type | Common Leak Locations | Impact if Exposed |
|---|---|---|
| AWS Access Keys | Git repos, .env files, CI/CD logs | Full AWS account access |
| Database passwords | Docker configs, config files | Complete data breach |
| API keys (Stripe, SendGrid) | Client-side JS, mobile apps | Financial fraud, spam |
| JWT signing keys | Source code, config files | Token forgery, auth bypass |
| SSH private keys | Git repos, shared folders | Server access |
| TLS private keys | Docker images, config repos | Traffic interception |
| OAuth client secrets | Frontend code, public repos | Account takeover |
| Encryption keys | Environment variables, code | Data decryption |

---

## Secrets Detection

### Pre-Commit Detection (Prevent Leaks)
\`\`\`bash
# Install gitleaks as pre-commit hook
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks

# Alternatively, install gitleaks globally
brew install gitleaks

# Scan entire repository history
gitleaks detect --source . --verbose

# Scan only staged changes (fast, for pre-commit)
gitleaks protect --staged --verbose
\`\`\`

### CI/CD Detection (Catch What Slipped Through)
\`\`\`yaml
# GitHub Actions — Block PRs with secrets
name: Secrets Detection
on: [pull_request]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
\`\`\`

### Secrets Detection Tools Comparison

| Tool | Type | Speed | Custom Rules | Best For |
|---|---|---|---|---|
| **Gitleaks** | Pre-commit + CI | Fast | Yes (TOML) | General-purpose |
| **TruffleHog** | Git history + live | Medium | Yes | Deep historical scanning |
| **GitGuardian** | SaaS + CI | Fast | Yes | Enterprise, remediation tracking |
| **detect-secrets** (Yelp) | Pre-commit | Fast | Yes (plugins) | Minimal false positives |
| **Semgrep** | SAST + secrets | Medium | Yes (YAML) | Combined code + secrets scanning |

---

## Secrets Management Solutions

### HashiCorp Vault

\`\`\`typescript
// Node.js — Fetching secrets from HashiCorp Vault
import Vault from "node-vault";

const vault = Vault({
  apiVersion: "v1",
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN, // Use AppRole in production
});

async function getDatabaseCredentials() {
  // Dynamic secret — Vault generates temporary credentials
  const result = await vault.read("database/creds/myapp-readonly");

  return {
    username: result.data.username,    // Temporary username
    password: result.data.password,    // Temporary password
    ttl: result.lease_duration,         // Expires in seconds
    leaseId: result.lease_id,          // For renewal/revocation
  };
}
\`\`\`

### AWS Secrets Manager
\`\`\`typescript
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

async function getSecret(secretName: string): Promise<Record<string, string>> {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);

  if (response.SecretString) {
    return JSON.parse(response.SecretString);
  }
  throw new Error("Secret not found");
}

// Usage
const dbConfig = await getSecret("prod/database/credentials");
// dbConfig = { host: "...", username: "...", password: "..." }
\`\`\`

### Solution Comparison

| Feature | HashiCorp Vault | AWS Secrets Manager | Azure Key Vault | GCP Secret Manager |
|---|---|---|---|---|
| Dynamic secrets | Yes (databases, cloud, PKI) | No | No | No |
| Auto-rotation | Yes | Yes (Lambda) | Yes | Yes (Cloud Functions) |
| Transit encryption | Yes (built-in) | Via KMS | Via HSM | Via Cloud KMS |
| Multi-cloud | Yes | AWS only | Azure only | GCP only |
| Open source | Yes (OSS version) | No | No | No |
| Price | Free (OSS) / Enterprise | $0.40/secret/month | $0.03/10K operations | $0.06/10K operations |

---

## Automated Secret Rotation

### Why Rotation Matters
- **Limits blast radius** — If a secret is leaked, it's only valid until the next rotation
- **Compliance requirement** — PCI-DSS, SOC 2, HIPAA all require credential rotation
- **Reduces insider risk** — Former employees' knowledge of secrets becomes useless

### Rotation Schedules

| Secret Type | Rotation Frequency | Method |
|---|---|---|
| Database passwords | 24 hours (dynamic) or 30 days | Vault dynamic secrets or AWS rotation Lambda |
| API keys | 90 days | Automated key regeneration |
| TLS certificates | 30-90 days | cert-manager / Let's Encrypt auto-renewal |
| SSH keys | 90 days or per-session | Vault SSH Secrets Engine |
| JWT signing keys | 7 days (with key versioning) | Custom rotation with backward compatibility |
| Cloud access keys | Never (use IAM roles instead) | Eliminate static cloud keys entirely |

---

## CI/CD Secrets Security

| Rule | Implementation |
|---|---|
| Never echo secrets in logs | \`set +x\` in bash; mask in CI config |
| Use CI-native secret storage | GitHub Actions secrets, GitLab CI/CD variables |
| Rotate CI/CD secrets quarterly | Automated key rotation workflow |
| Limit secret scope | Repo-level, not org-level secrets |
| Audit secret access | Review who/what accessed which secrets |
| No secrets in Docker build args | Use multi-stage builds + runtime injection |
| Least-privilege tokens | Scoped to specific repos/environments |

---

## Zero Hardcoded Credentials Maturity Model

| Level | Description | Controls |
|---|---|---|
| **Level 0: Wild West** | Secrets in source code, shared plaintext files | No controls |
| **Level 1: Awareness** | Secrets moved to environment variables | .env files, CI secrets |
| **Level 2: Managed** | Centralized secrets management | Vault/AWS SM, rotation |
| **Level 3: Dynamic** | Short-lived, auto-rotating credentials | Dynamic secrets, certificate management |
| **Level 4: Zero Standing** | No persistent credentials exist | Just-in-time access, identity-based auth |

---

## Further Reading

- [DevSecOps Complete Guide](/blog/devsecops-complete-guide-2025) — Comprehensive DevSecOps implementation
- [Shift-Left Security](/blog/shift-left-security-reducing-vulnerabilities-2026) — Security in the SDLC
- GitGuardian (2025), "State of Secrets Sprawl" — Secrets leak statistics
- [HashiCorp Vault Documentation](https://developer.hashicorp.com/vault) — Vault reference
- Verizon (2025), "Data Breach Investigations Report (DBIR)" — Credential breach statistics`,
    date: "2026-01-31",
    author: "SCR Security Research Team",
    category: "DevSecOps",
    tags: ["Secrets Management", "HashiCorp Vault", "DevSecOps", "Credential Rotation", "CI/CD Security", "Gitleaks"],
    readTime: "20 min read",
  },

  {
    slug: "sast-dast-sca-comparison-security-testing",
    title: "SAST vs DAST vs SCA: Choosing the Right Security Testing Tools for Your Pipeline",
    excerpt:
      "SAST, DAST, and SCA each find different vulnerability classes. This guide compares all three approaches, covers tool selection for every language, and shows how to integrate them into a unified CI/CD security pipeline.",
    content: `## The Three Pillars of Application Security Testing

No single security testing approach catches everything. SAST, DAST, and SCA are complementary — each finds vulnerabilities the others miss.

| Dimension | SAST | DAST | SCA |
|---|---|---|---|
| **Full Name** | Static Application Security Testing | Dynamic Application Security Testing | Software Composition Analysis |
| **What It Tests** | Source code, binaries | Running application | Third-party dependencies |
| **When It Runs** | During development / CI | Against deployed app | During build / on commit |
| **Finds** | Code-level vulnerabilities | Runtime vulnerabilities | Known CVEs in dependencies |
| **Misses** | Runtime issues, config problems | Source code flaws, business logic | Custom code vulnerabilities |
| **False Positive Rate** | High (15-40%) | Low (5-15%) | Very Low (< 5%) |
| **Requires** | Source code access | Running application URL | Package manifests |
| **Speed** | Minutes (scales with codebase) | Minutes to hours | Seconds |

> **Best Practice:** Use all three. SAST catches code-level flaws early. SCA catches vulnerable dependencies instantly. DAST catches runtime and configuration issues. Together, they cover 80-85% of common vulnerability classes.

---

## SAST: Static Application Security Testing

### What SAST Finds

SAST analyzes source code (or compiled bytecode) without executing it. It traces data flows from user inputs (sources) to dangerous operations (sinks) to find vulnerabilities.

**Vulnerability Classes SAST Excels At:**
- SQL Injection (data flow from request to query)
- Cross-Site Scripting (data flow from request to HTML output)
- Path Traversal (data flow from request to file operation)
- Command Injection (data flow from request to exec/system call)
- Hardcoded secrets (pattern matching)
- Buffer overflows (C/C++ — bounds analysis)
- Insecure cryptographic usage (weak algorithms, small key sizes)

### Top SAST Tools (2026)

| Tool | Languages | Open Source | Best For |
|---|---|---|---|
| **Semgrep** | 30+ | Yes (OSS rules) | Custom rules, fast, low false positives |
| **CodeQL** | 10+ | Yes (GitHub) | Deep semantic analysis, GitHub integration |
| **SonarQube** | 30+ | Community Edition | Code quality + security |
| **Checkmarx** | 30+ | No (commercial) | Enterprise, compliance |
| **Snyk Code** | 10+ | No (freemium) | IDE integration, real-time |
| **Fortify** | 27+ | No (commercial) | Enterprise, regulatory |

### Semgrep Example — Custom Rule
\`\`\`yaml
# Custom Semgrep rule: Detect unparameterized MongoDB queries
rules:
  - id: mongodb-nosql-injection
    pattern: |
      collection.find({ ..., $KEY: req.$PARAM, ... })
    message: >
      Potential NoSQL injection: user input directly in MongoDB query.
      Use input validation or sanitization.
    severity: ERROR
    languages: [javascript, typescript]
    metadata:
      cwe: CWE-943
      owasp: A03:2021
\`\`\`

---

## DAST: Dynamic Application Security Testing

### What DAST Finds

DAST tests a running application by sending crafted requests and analyzing responses. It acts like an automated attacker.

**Vulnerability Classes DAST Excels At:**
- Server misconfiguration (missing headers, verbose errors, directory listing)
- Authentication issues (session management, cookie flags)
- CORS misconfigurations
- TLS/SSL issues (weak ciphers, expired certificates)
- HTTP response splitting
- Clickjacking
- Runtime injection (SQLi, XSS that actually executes)

### Top DAST Tools (2026)

| Tool | Open Source | API Scanning | Authentication | Best For |
|---|---|---|---|---|
| **OWASP ZAP** | Yes | Yes (OpenAPI) | Yes | Free, comprehensive |
| **Burp Suite Pro** | No | Yes | Yes | Professional pen testing |
| **Nuclei** | Yes | Templates | Basic | Fast, community templates |
| **Nikto** | Yes | Limited | No | Quick server assessment |
| **StackHawk** | No (freemium) | Yes | Yes | CI/CD integration |

### DAST in CI/CD
\`\`\`yaml
# OWASP ZAP automated scan in GitHub Actions
name: DAST Scan
on:
  schedule:
    - cron: '0 2 * * 1' # Weekly Monday 2 AM

jobs:
  dast:
    runs-on: ubuntu-latest
    steps:
      - name: ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.12.0
        with:
          target: 'https://staging.securecodereviews.com'
          rules_file_name: 'zap-rules.tsv'
          cmd_options: '-a -j'
\`\`\`

---

## SCA: Software Composition Analysis

### What SCA Finds

SCA scans your dependency manifests (package.json, requirements.txt, pom.xml) against vulnerability databases (NVD, GitHub Advisory Database, Snyk DB) to find known CVEs.

**Why SCA Is Critical:**
- **77%** of codebases are open-source code (Synopsys OSSRA 2025)
- Average Node.js app has **683 dependencies** (direct + transitive)
- **84%** of codebases contain at least one known vulnerability in dependencies

### Top SCA Tools (2026)

| Tool | Open Source | Languages | Unique Features |
|---|---|---|---|
| **npm audit** | Built-in | Node.js | Native, zero config |
| **Snyk** | Freemium | 10+ | Fix PRs, license compliance |
| **Dependabot** | Free (GitHub) | 10+ | Auto-update PRs |
| **Socket.dev** | Freemium | Node.js, Python | Supply chain risk detection |
| **Renovate** | Yes | 10+ | Highly configurable auto-updates |
| **OWASP Dependency-Check** | Yes | Java, .NET, Node | NVD integration |
| **Trivy** | Yes | Many | Multi-scanner (SCA + container + IaC) |

### Beyond CVE Scanning — Supply Chain Risk

Modern SCA goes beyond CVE detection:

| Signal | What It Detects | Example Tool |
|---|---|---|
| Typosquatting | Packages with names similar to popular ones | Socket.dev |
| Protestware | Packages with intentionally destructive code | Socket.dev |
| Install scripts | Packages that run code on install | Socket, npm audit |
| Excessive permissions | Packages requesting unnecessary network/filesystem access | Socket.dev |
| Maintainer changes | New maintainer added to critical package | GitHub alerts |
| Deprecated packages | Packages no longer maintained | npm outdated, Snyk |

---

## The Unified Security Pipeline

\`\`\`
Developer writes code
       │
       ▼
[Pre-Commit Hooks] ─── Secrets detection (Gitleaks)
       │                SAST quick scan (Semgrep)
       ▼
[Pull Request] ─────── SAST full scan (CodeQL / Semgrep)
       │                SCA scan (npm audit / Snyk)
       │                IaC scan (Checkov)
       │                License compliance
       ▼
[Build/CI] ─────────── Container scan (Trivy)
       │                SBOM generation (CycloneDX)
       │                Dependency signature verification
       ▼
[Staging Deploy] ───── DAST scan (OWASP ZAP)
       │                API security scan
       │                SSL/TLS verification
       ▼
[Production] ────────── Runtime protection (RASP)
       │                Continuous monitoring
       │                Log analysis
       │                Dependency monitoring (new CVEs)
\`\`\`

---

## Choosing Tools for Your Stack

| Stack | SAST | DAST | SCA |
|---|---|---|---|
| **Node.js / TypeScript** | Semgrep + ESLint security | OWASP ZAP | npm audit + Socket.dev |
| **Python** | Semgrep + Bandit | OWASP ZAP | pip-audit + Snyk |
| **Java** | CodeQL + SpotBugs | Burp Suite | OWASP Dependency-Check |
| **Go** | Semgrep + gosec | OWASP ZAP | govulncheck |
| **.NET** | CodeQL + Security Code Scan | OWASP ZAP | dotnet list --vulnerable |
| **React / Next.js** | Semgrep + ESLint | ZAP + Lighthouse | npm audit + Dependabot |

---

## Further Reading

- [Shift-Left Security](/blog/shift-left-security-reducing-vulnerabilities-2026) — Integrating testing into the SDLC
- [DevSecOps Complete Guide](/blog/devsecops-complete-guide-2025) — Full DevSecOps implementation
- [Supply Chain Security](/blog/software-supply-chain-security-owasp-a03-sbom) — SBOM and dependency security
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/) — Comprehensive testing methodology`,
    date: "2026-01-30",
    author: "SCR Security Research Team",
    category: "DevSecOps",
    tags: ["SAST", "DAST", "SCA", "Security Testing", "DevSecOps", "CI/CD", "Semgrep", "OWASP ZAP"],
    readTime: "21 min read",
  },
];
