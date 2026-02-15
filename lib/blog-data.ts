// Blog post data for the platform
import { extendedBlogPosts } from "./blog-data-extended";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  readTime: string;
  image?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "owasp-top-10-2025",
    title: "OWASP Top 10 2025: What's Changed and How to Prepare",
    excerpt:
      "A comprehensive breakdown of the latest OWASP Top 10 vulnerabilities and actionable steps to secure your applications against them.",
    content: `## Introduction

The OWASP Top 10 remains the gold standard for web application security awareness. The 2025 update reflects evolving threat landscapes, increased API attack surfaces, and the growing complexity of modern applications.

## Key Changes

### 1. Broken Access Control (A01)
Still the #1 vulnerability. Over 94% of applications tested had some form of broken access control. Common issues include:
- IDOR (Insecure Direct Object References)
- Missing function-level access control
- CORS misconfiguration

### 2. Cryptographic Failures (A02)
Previously "Sensitive Data Exposure," this category focuses on failures related to cryptography that lead to data exposure. Key areas:
- Weak algorithms (MD5, SHA1 for passwords)
- Insufficient key management
- Cleartext data transmission

### 3. Injection (A03)
SQL, NoSQL, OS, and LDAP injection remain critical threats. Modern applications face new vectors:
- GraphQL injection
- Template injection (SSTI)
- Expression Language injection

## Mitigation Strategies

1. **Implement Zero Trust Architecture** - Never trust, always verify
2. **Shift Left Security** - Integrate security into CI/CD pipelines
3. **Regular Penetration Testing** - Automated + manual testing
4. **Security Training** - Continuous developer education

## Conclusion

Stay ahead of threats by making security a first-class citizen in your development process.`,
    date: "2025-12-15",
    author: "SCR Team",
    category: "Web Security",
    tags: ["OWASP", "Web Security", "Vulnerabilities"],
    readTime: "8 min read",
  },
  {
    slug: "secure-api-design-patterns",
    title: "Secure API Design Patterns: A Developer's Guide",
    excerpt:
      "Learn the essential security patterns every API developer should implement, from authentication to rate limiting.",
    content: `## Building Secure APIs

APIs are the backbone of modern applications, but they're also prime targets for attackers. This guide covers essential security patterns.

## Authentication Patterns

### JWT Best Practices
- Use short-lived access tokens (15 minutes)
- Implement refresh token rotation
- Store tokens securely (httpOnly cookies)
- Validate all claims

### API Key Management
- Never expose keys in client-side code
- Implement key rotation policies
- Use different keys per environment

## Authorization Patterns

### RBAC (Role-Based Access Control)
\`\`\`typescript
const checkPermission = (user: User, resource: string, action: string) => {
  const permissions = rolePermissions[user.role];
  return permissions?.includes(\`\${resource}:\${action}\`) ?? false;
};
\`\`\`

### ABAC (Attribute-Based Access Control)
More granular than RBAC, considering user attributes, resource attributes, and environmental conditions.

## Rate Limiting

Implement multi-tier rate limiting:
- Per-user limits
- Per-IP limits
- Global limits
- Endpoint-specific limits

## Input Validation

Always validate and sanitize input at the API boundary. Use schema validation libraries like Zod or Joi.

## Conclusion

Security is not a feature—it's a requirement. Build these patterns into your API from day one.`,
    date: "2025-11-28",
    author: "SCR Team",
    category: "API Security",
    tags: ["API", "Authentication", "Authorization", "Design Patterns"],
    readTime: "10 min read",
  },
  {
    slug: "supply-chain-security",
    title: "Software Supply Chain Security: Defending Against Modern Threats",
    excerpt:
      "How to protect your applications from supply chain attacks targeting dependencies, build pipelines, and deployment processes.",
    content: `## The Supply Chain Threat

Supply chain attacks have increased by 742% over the past three years. From SolarWinds to Log4Shell, these attacks demonstrate the devastating impact of compromised dependencies.

## Attack Vectors

### Dependency Confusion
Attackers publish malicious packages with names similar to internal packages on public registries.

### Compromised Maintainers
Social engineering attacks targeting package maintainers to inject malicious code.

### Build Pipeline Attacks
Compromising CI/CD infrastructure to inject malicious code during the build process.

## Defense Strategies

### 1. Dependency Management
- Use lockfiles (package-lock.json, yarn.lock)
- Pin dependency versions
- Regularly audit dependencies
- Use tools like Snyk, Dependabot

### 2. SBOM (Software Bill of Materials)
Generate and maintain SBOMs for all software:
\`\`\`bash
npx @cyclonedx/cyclonedx-npm --output-file sbom.json
\`\`\`

### 3. Code Signing
Sign all releases and verify signatures during deployment.

### 4. Build Reproducibility
Ensure builds are deterministic and reproducible across environments.

## Conclusion

Supply chain security requires a holistic approach combining tooling, processes, and culture.`,
    date: "2025-11-10",
    author: "SCR Team",
    category: "Supply Chain",
    tags: ["Supply Chain", "Dependencies", "DevSecOps"],
    readTime: "7 min read",
  },
  {
    slug: "zero-trust-architecture",
    title: "Implementing Zero Trust Architecture: A Practical Guide",
    excerpt:
      "Move beyond perimeter-based security with a practical implementation guide for Zero Trust Architecture in modern applications.",
    content: `## What is Zero Trust?

Zero Trust is a security model based on the principle "never trust, always verify." It eliminates implicit trust and continuously validates every stage of digital interaction.

## Core Principles

1. **Verify Explicitly** - Always authenticate and authorize based on all available data points
2. **Use Least Privilege Access** - Limit user access with just-in-time and just-enough-access
3. **Assume Breach** - Minimize blast radius and segment access

## Implementation Steps

### Identity Verification
- Multi-factor authentication (MFA)
- Conditional access policies
- Continuous authentication

### Network Segmentation
- Micro-segmentation
- Software-defined perimeters
- Encrypted communications

### Device Compliance
- Device health checks
- Endpoint detection and response
- Mobile device management

## Monitoring and Analytics

Deploy comprehensive logging and monitoring:
- User behavior analytics (UBA)
- Security Information and Event Management (SIEM)
- Automated incident response

## Conclusion

Zero Trust is a journey, not a destination. Start with identity, expand to network, and iterate continuously.`,
    date: "2025-10-25",
    author: "SCR Team",
    category: "Architecture",
    tags: ["Zero Trust", "Architecture", "Identity", "Network Security"],
    readTime: "9 min read",
  },
  {
    slug: "container-security-best-practices",
    title: "Container Security Best Practices for Production",
    excerpt:
      "Secure your containerized applications from image building to runtime with these battle-tested practices.",
    content: `## Container Security Lifecycle

Security must be addressed at every stage of the container lifecycle: build, ship, and run.

## Build Phase

### Minimal Base Images
Use minimal base images to reduce attack surface:
\`\`\`dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]
\`\`\`

### Image Scanning
Scan images for vulnerabilities before pushing:
\`\`\`bash
docker scout cves myimage:latest
trivy image myimage:latest
\`\`\`

## Ship Phase

- Sign container images
- Use private registries
- Implement image promotion policies

## Run Phase

- Read-only file systems
- No privileged containers
- Resource limits
- Network policies
- Runtime security monitoring

## Conclusion

Container security is a shared responsibility between development and operations teams.`,
    date: "2025-10-10",
    author: "SCR Team",
    category: "Container Security",
    tags: ["Docker", "Kubernetes", "Containers", "DevSecOps"],
    readTime: "6 min read",
  },
  {
    slug: "devsecops-complete-guide-2025",
    title: "DevSecOps: The Complete Guide 2025-2026",
    excerpt:
      "Master DevSecOps with comprehensive practices, automation strategies, real-world examples, and the latest trends shaping secure development in 2025.",
    content: `## What is DevSecOps?

DevSecOps integrates security practices throughout the entire software development lifecycle (SDLC). Rather than treating security as an afterthought, it becomes a shared responsibility from planning through production.

**Key Statistics:**
- 84% of organizations view DevSecOps as critical (Gartner, 2025)
- Companies implementing DevSecOps reduce time-to-remediate vulnerabilities by 60%
- Security bugs detected early cost 5-10x less to fix than in production

## The DevSecOps Pipeline Lifecycle

### Phase 1: Plan & Design
- Threat modeling (STRIDE, PASTA)
- Security requirements definition
- Risk assessment
- Architecture review

### Phase 2: Develop
- Secure coding practices
- IDE security plugins
- Pre-commit hooks
- Dependency scanning (SCA)

### Phase 3: Test
- SAST (Static Application Security Testing)
- DAST (Dynamic Application Security Testing)
- Container scanning
- API security testing

### Phase 4: Build & Deploy
- Image scanning
- SBOM generation
- Infrastructure-as-Code scanning
- Secrets management

### Phase 5: Operate & Monitor
- Runtime security monitoring
- Log aggregation & analysis
- Vulnerability management
- Incident response

---

## DevSecOps Implementation Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                    Development Pipeline                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Code Commit → SAST → SCA → Build → Container Scan → Registry   │
│                │         │         │         │                  │
│                └─ Security Checks ─────────────                 │
│                                                                   │
│  Deploy → DAST → WAF Rules → Runtime Monitoring → Alert → Action │
│            │         │            │                              │
│            └─────── Continuous Security ──────────────           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 1. Secure Coding & Shift-Left Security

### Principle
Move security testing to the earliest stages of development.

### Implementation Example

**Bad Practice:**
\`\`\`javascript
// Finding SQL injection vulnerability in production
const query = \`SELECT * FROM users WHERE id = \${userId}\`;
db.query(query);
\`\`\`

**Better Practice:**
\`\`\`javascript
// Pre-commit hook catches vulnerability
const query = \`SELECT * FROM users WHERE id = ?\`;
db.query(query, [userId]); // Parameterized query

// SonarQube catches before commit
// ESLint security plugin: eslint-plugin-security
\`\`\`

### Tools for Shift-Left:
- **Pre-commit hooks**: Husky + custom security checks
- **IDE plugins**: SonarLint, Checkmarx
- **SAST**: SonarQube, Snyk, Semgrep

---

## 2. Dependency & Supply Chain Security

**Challenge:** 77% of vulnerabilities come from third-party libraries (NIST)

### Implementation

\`\`\`yaml
# .github/workflows/dependency-check.yml
name: Dependency Security Check

on: [pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
          
      - name: Generate SBOM
        run: npm sbom --format cyclonedx > sbom.json
        
      - name: Check licenses
        run: npm audit --json > audit.json
\`\`\`

### Current Trend (2025)
- **Zero-trust supply chain**: Verify every artifact
- **SBOM adoption**: CycloneDX, SPDX standards mandatory
- **Software transparency**: OpenSSF Scorecard

---

## 3. Container & Infrastructure Security

### Dockerfile Best Practices

\`\`\`dockerfile
# Multi-stage build minimizes attack surface
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine
RUN apk add --no-cache dumb-init

# Non-root user
RUN addgroup -g 1001 -S nodegroup && \\
    adduser -S nodeuser -u 1001 -G nodegroup

COPY --from=builder --chown=nodeuser:nodegroup /app .

# Security hardening
RUN chmod -R 755 /app && \\
    echo "node:*:1001:1001::/app:/sbin/nologin" >> /etc/passwd

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \\
  CMD node healthcheck.js

USER nodeuser
EXPOSE 3000
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.js"]
\`\`\`

### Container Scanning Pipeline

\`\`\`bash
# Scan before registry push
trivy image --severity HIGH,CRITICAL myapp:latest

docker scout cves myapp:latest

syft myapp:latest > sbom.json
\`\`\`

### Kubernetes Security

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    fsReadOnlyRootFilesystem: true
  containers:
  - name: app
    image: myapp:latest
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop: ["ALL"]
    resources:
      limits:
        memory: "256Mi"
        cpu: "500m"
    livenessProbe:
      httpGet:
        path: /health
        port: 3000
    volumeMounts:
    - name: tmp
      mountPath: /tmp
  volumes:
  - name: tmp
    emptyDir: {}
  networkPolicy:
    backend-isolation: true
\`\`\`

---

## 4. CI/CD Pipeline Security

### Comprehensive GitHub Actions Workflow

\`\`\`yaml
name: Secure CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  security-checks:
    runs-on: ubuntu-latest
    steps:
      # 1. Code checkout
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      # 2. SAST - Static analysis
      - name: Run SonarQube
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
      
      # 3. Dependency scanning
      - name: Snyk dependency scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: \${{ secrets.SNYK_TOKEN }}
      
      # 4. Secret scanning
      - name: Detect secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: \${{ github.event.repository.default_branch }}
          head: HEAD
      
      # 5. SBOM generation
      - name: Generate SBOM
        run: npm sbom --format cyclonedx > sbom.json
      
      # 6. Lint security
      - name: Security lint
        run: npm run lint:security
  
  build-and-push:
    needs: security-checks
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      
      # 7. Build image
      - name: Build Docker image
        run: docker build -t \${{ env.IMAGE_NAME }}:latest .
      
      # 8. Scan image
      - name: Scan image with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: \${{ env.IMAGE_NAME }}:latest
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      # 9. Upload SARIF
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
      
      # 10. Push to registry (only on main)
      - name: Push image
        if: github.ref == 'refs/heads/main'
        run: docker push \${{ env.IMAGE_NAME }}:latest
  
  dast:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: OWASP ZAP scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'https://staging.example.com'
          rules_file_name: '.zap/rules.tsv'
          cmd_options: '-a'
\`\`\`

---

## 5. Secrets Management

### Implementation

\`\`\`bash
# Never commit secrets
git-secrets --install
echo 'providers:
  - type: File
    filename: .env' >> ~/.gitsecrets/patterns

# Use environment-based secrets
export API_KEY=\$(aws secretsmanager get-secret-value \\
  --secret-id prod/api-key \\
  --region us-east-1 \\
  --query SecretString \\
  --output text)

# Rotate secrets regularly
aws secretsmanager rotate-secret --secret-id prod/api-key
\`\`\`

### Tools
- AWS Secrets Manager
- HashiCorp Vault
- GitHub Secrets
- 1Password for Teams

---

## 6. Monitoring & Incident Response

### Real-time Security Monitoring

\`\`\`javascript
// Application security monitoring
const securityMonitoring = {
  trackFailedAuth: (username, ip) => {
    if (failureCount[ip] > 5) {
      rateLimit(ip);
      alertSecurityTeam(\`Brute force attempt from \${ip}\`);
    }
  },
  
  trackAnomalies: (event) => {
    if (event.severity > THRESHOLD) {
      createIncident(event);
      notifyOnCall();
    }
  },
  
  auditLog: {
    userAction: (userId, action, resource, timestamp) => {
      logToSIEM({
        user_id: userId,
        action,
        resource,
        ip: getClientIP(),
        timestamp,
        status: 'completed'
      });
    }
  }
};
\`\`\`

---

## Current Trends & Future Directions (2025-2026)

### 1. **AI-Powered Security**
- Automated vulnerability detection using ML
- Behavioral anomaly detection
- Intelligent threat prediction

### 2. **Zero Trust by Default**
- Remove trust boundaries
- Verify every request
- Least privilege access everywhere

### 3. **Software Supply Chain Security**
- SBOM as standard
- Artifact verification
- OpenSSF Scorecard adoption

### 4. **Cloud-Native Security**
- Runtime security (Falco, Tracee)
- eBPF-based monitoring
- Kubernetes security standards

### 5. **FinOps + SecOps**
- Cost of security incidents
- ROI-driven security investments
- Budget optimization

---

## Key DevSecOps Metrics

Track these metrics to measure DevSecOps maturity:

| Metric | Target | Industry Benchmark |
|--------|--------|-------------------|
| Mean Time to Remediate (MTTR) | < 30 days | 90 days |
| High Severity Vulnerabilities | 0 | 5-10 per app |
| Security Issues in Code Review | > 80% | 50% |
| Incident Response Time | < 1 hour | 4-6 hours |
| Security Training Completion | 100% | 60% |

---

## Getting Started: 5-Step Implementation Plan

### Month 1-2: Foundation
1. [ ] Establish security champions
2. [ ] Implement SAST in CI/CD
3. [ ] Set up dependency scanning
4. [ ] Create security guidelines

### Month 3-4: Automation
1. [ ] Add automated testing
2. [ ] Implement container scanning
3. [ ] Set up secret management
4. [ ] Enable security monitoring

### Month 5-6: Maturity
1. [ ] DAST integration
2. [ ] Threat modeling process
3. [ ] Incident response drills
4. [ ] Advanced SBOM/supply chain

---

## Conclusion

DevSecOps is not a tool or framework—it's a cultural shift that makes security everyone's responsibility. Start small, automate relentlessly, and iterate based on your organization's risk profile.

**Resources:**
- NIST Cyber Security Framework
- OWASP DevSecOps Top 10
- Cloud Security Alliance guidelines
- OpenSSF Best Practices`,
    date: "2026-02-15",
    author: "SCR Team",
    category: "DevSecOps",
    tags: ["DevSecOps", "CI/CD", "Security Automation", "Best Practices", "2025 Trends"],
    readTime: "15 min read",
  },
  {
    slug: "secure-code-review-checklist",
    title: "The Ultimate Secure Code Review Checklist",
    excerpt:
      "A comprehensive checklist for conducting effective secure code reviews that catch vulnerabilities before they reach production.",
    content: `## Why Secure Code Reviews Matter

Code reviews are your last line of defense before vulnerabilities reach production. A structured approach ensures consistency and thoroughness.

## The Checklist

### Input Validation
- [ ] All user inputs are validated
- [ ] Input length limits are enforced
- [ ] Special characters are properly handled
- [ ] File uploads are validated (type, size, content)

### Authentication
- [ ] Passwords are properly hashed (bcrypt, argon2)
- [ ] Session management is secure
- [ ] MFA is implemented where appropriate
- [ ] Account lockout is configured

### Authorization
- [ ] Access controls are enforced server-side
- [ ] IDOR vulnerabilities are addressed
- [ ] Principle of least privilege is followed
- [ ] Role-based access is properly implemented

### Data Protection
- [ ] Sensitive data is encrypted at rest
- [ ] TLS is enforced for data in transit
- [ ] PII handling follows regulations
- [ ] Secrets are not hardcoded

### Error Handling
- [ ] Errors don't expose sensitive information
- [ ] Stack traces are not shown to users
- [ ] Logging captures security events
- [ ] Error messages are user-friendly

### Dependencies
- [ ] Known vulnerabilities are addressed
- [ ] Dependencies are up to date
- [ ] Unused dependencies are removed
- [ ] License compliance is verified

## Conclusion

Use this checklist as a starting point and customize it for your organization's specific needs.`,
    date: "2025-09-20",
    author: "SCR Team",
    category: "Code Review",
    tags: ["Code Review", "Checklist", "Best Practices"],
    readTime: "5 min read",
  },
  // Add extended blog posts
  ...extendedBlogPosts,
];
