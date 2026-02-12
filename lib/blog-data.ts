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
