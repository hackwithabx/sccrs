/**
 * ShieldX Central Remediation / Fix Engine
 *
 * Every finding from every scanner passes through this engine to produce
 * a standardised fix object. No scanner should return a finding without
 * fix guidance — this is the single source of truth.
 */

/* ── Types ── */
export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Confidence = "high" | "medium" | "low";
export type Effort = "low" | "medium" | "high";

export interface FixResult {
  title: string;
  severity: Severity;
  confidence: Confidence;
  description: string;
  fix: string;
  fixCommand: string | null;
  codeExample: string | null;
  effort: Effort;
  compliance: string[];
  riskScore: number; // 0-100
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface FindingInput {
  scanType: "secrets" | "deps" | "api" | "cloud" | "logs" | "cicd" | "sast" | "docker" | "iac";
  id: string;
  title: string;
  severity: Severity;
  confidence?: Confidence;
  description: string;
  // Scanner-specific
  packageName?: string;
  packageVersion?: string;
  fixedVersion?: string;
  ecosystem?: string;
  patternId?: string;
  owasp?: string;
  category?: string;
  headerName?: string;
  status?: "pass" | "fail" | "warn";
}

/* ── Compliance Mapping ── */
const COMPLIANCE_MAP: Record<string, string[]> = {
  // Secrets
  "aws-access-key": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3", "CIS 1.4"],
  "github-token": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3"],
  "stripe-key": ["OWASP A07:2021", "SOC2 CC6.1", "PCI-DSS 3.4"],
  "private-key": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.10.1.2"],
  "jwt-token": ["OWASP A07:2021", "SOC2 CC6.1"],
  "database-url": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3"],
  "generic-api-key": ["OWASP A07:2021", "SOC2 CC6.1"],
  "google-api-key": ["OWASP A07:2021", "SOC2 CC6.1"],
  "slack-token": ["OWASP A07:2021", "SOC2 CC6.1"],
  "sendgrid-key": ["OWASP A07:2021", "SOC2 CC6.1"],
  "twilio-key": ["OWASP A07:2021", "SOC2 CC6.1"],
  "azure-key": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3"],
  "hardcoded-password": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3", "CIS 5.2"],
  "bearer-token": ["OWASP A07:2021", "SOC2 CC6.1"],
  "basic-auth": ["OWASP A07:2021", "SOC2 CC6.1"],
  "high-entropy-hex": ["OWASP A07:2021", "SOC2 CC6.1"],
  "high-entropy-base64": ["OWASP A07:2021", "SOC2 CC6.1"],
  // Aliases for scanner pattern IDs
  "db-connection-string": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3"],
  "generic-password": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3", "CIS 5.2"],
  "bearer-header": ["OWASP A07:2021", "SOC2 CC6.1"],
  "github-fine-grained": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3"],
  "slack-webhook": ["OWASP A07:2021", "SOC2 CC6.1"],
  "npm-token": ["OWASP A07:2021", "SOC2 CC6.1"],
  "docker-token": ["OWASP A07:2021", "SOC2 CC6.1"],
  "mailgun-key": ["OWASP A07:2021", "SOC2 CC6.1"],
  "aws-secret-key": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3", "CIS 1.4"],
  "internal-ip": ["OWASP A07:2021"],

  // Dependencies
  "dep-critical": ["OWASP A06:2021", "SOC2 CC7.1", "ISO27001 A.12.6.1"],
  "dep-high": ["OWASP A06:2021", "SOC2 CC7.1", "ISO27001 A.12.6.1"],
  "dep-medium": ["OWASP A06:2021", "SOC2 CC7.1"],
  "dep-low": ["OWASP A06:2021"],

  // API Security
  "API1:2023": ["OWASP API1:2023", "SOC2 CC6.1", "ISO27001 A.9.4.1"],
  "API2:2023": ["OWASP API2:2023", "SOC2 CC6.1", "ISO27001 A.9.4.2"],
  "API3:2023": ["OWASP API3:2023", "SOC2 CC6.3", "ISO27001 A.9.4.1"],
  "API4:2023": ["OWASP API4:2023", "SOC2 CC6.1"],
  "API5:2023": ["OWASP API5:2023", "SOC2 CC6.1", "ISO27001 A.9.4.1"],
  "API6:2023": ["OWASP API6:2023", "SOC2 CC6.1"],
  "API7:2023": ["OWASP API7:2023", "SOC2 CC6.1", "ISO27001 A.13.1.1"],
  "API8:2023": ["OWASP API8:2023", "SOC2 CC6.1", "ISO27001 A.14.1.2"],
  "API9:2023": ["OWASP API9:2023", "SOC2 CC7.1"],
  "API10:2023": ["OWASP API10:2023", "SOC2 CC6.1"],

  // API Headers
  "hsts-missing": ["OWASP A05:2021", "SOC2 CC6.7", "ISO27001 A.13.1.1"],
  "csp-missing": ["OWASP A05:2021", "SOC2 CC6.7"],
  "cors-wildcard": ["OWASP A05:2021", "SOC2 CC6.1"],
  "cookie-insecure": ["OWASP A05:2021", "SOC2 CC6.1", "ISO27001 A.14.1.3"],

  // Cloud Security
  "iam-root-access": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.2.3", "CIS 1.1"],
  "iam-wildcard": ["OWASP A01:2021", "SOC2 CC6.1", "ISO27001 A.9.2.3", "CIS 1.16"],
  "iam-mfa": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.2", "CIS 1.2"],
  "enc-at-rest": ["OWASP A02:2021", "SOC2 CC6.7", "ISO27001 A.10.1.1", "PCI-DSS 3.4"],
  "enc-in-transit": ["OWASP A02:2021", "SOC2 CC6.7", "ISO27001 A.10.1.1"],
  "net-public-access": ["OWASP A01:2021", "SOC2 CC6.6", "ISO27001 A.13.1.1", "CIS 4.1"],
  "net-sg-open": ["OWASP A01:2021", "SOC2 CC6.6", "ISO27001 A.13.1.1", "CIS 4.2"],
  "stor-bucket-public": ["OWASP A01:2021", "SOC2 CC6.1", "ISO27001 A.8.2.3", "CIS 2.1.2"],
  "misc-hardcoded-creds": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3"],
  "log-cloudtrail": ["OWASP A09:2021", "SOC2 CC7.2", "ISO27001 A.12.4.1", "CIS 2.1"],

  // SAST — AST-based code analysis
  "sql-injection-sast": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5", "PCI-DSS 6.5.1"],
  "command-injection-sast": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "xss-reflected-sast": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "path-traversal-sast": ["OWASP A01:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "ssrf-sast": ["OWASP A10:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "eval-injection-sast": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "eval-usage": ["OWASP A03:2021", "SOC2 CC6.1"],
  "weak-crypto": ["OWASP A02:2021", "SOC2 CC6.7", "ISO27001 A.10.1.1"],
  "hardcoded-jwt-secret": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3"],
  "prototype-pollution": ["OWASP A03:2021", "SOC2 CC6.1"],
  "dangerous-innerhtml": ["OWASP A03:2021", "SOC2 CC6.1"],
  "insecure-cookie": ["OWASP A05:2021", "SOC2 CC6.1", "ISO27001 A.14.1.3"],
  "timing-attack": ["OWASP A02:2021", "SOC2 CC6.1"],
  "no-rate-limit": ["OWASP A07:2021", "SOC2 CC6.1"],
  "regex-dos": ["OWASP A06:2021", "SOC2 CC7.1"],
  "cors-misconfiguration": ["OWASP A05:2021", "SOC2 CC6.1"],
  "nosql-injection": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "unsafe-deserialization": ["OWASP A08:2021", "SOC2 CC6.1"],
  "log-injection": ["OWASP A09:2021", "SOC2 CC7.2"],
  "open-redirect": ["OWASP A01:2021", "SOC2 CC6.1"],

  // SAST — Java
  "java-command-injection": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "java-command-injection-pb": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "java-sql-injection": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5", "PCI-DSS 6.5.1"],
  "java-sql-concat": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5", "PCI-DSS 6.5.1"],
  "java-path-traversal": ["OWASP A01:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "java-xss": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "java-ssrf": ["OWASP A10:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "java-deserialization": ["OWASP A08:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "java-xxe": ["OWASP A05:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "java-ldap-injection": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "java-open-redirect": ["OWASP A01:2021", "SOC2 CC6.1"],
  "java-log-injection": ["OWASP A09:2021", "SOC2 CC7.2"],
  "java-weak-crypto": ["OWASP A02:2021", "SOC2 CC6.7", "ISO27001 A.10.1.1"],
  "java-insecure-random": ["OWASP A02:2021", "SOC2 CC6.7"],
  "java-hardcoded-secret": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3"],

  // SAST — C++
  "cpp-command-injection": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-command-injection-exec": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-format-string": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-path-traversal": ["OWASP A01:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-sql-injection": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5", "PCI-DSS 6.5.1"],
  "cpp-buffer-overflow-strcpy": ["OWASP A06:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-buffer-overflow-strcat": ["OWASP A06:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-buffer-overflow-sprintf": ["OWASP A06:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-buffer-overflow-gets": ["OWASP A06:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-buffer-overflow-wcscpy": ["OWASP A06:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-buffer-overflow-wcscat": ["OWASP A06:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-unsafe-scanf": ["OWASP A06:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-weak-crypto": ["OWASP A02:2021", "SOC2 CC6.7", "ISO27001 A.10.1.1"],
  "cpp-insecure-random": ["OWASP A02:2021", "SOC2 CC6.7"],
  "cpp-hardcoded-secret": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3"],
  "cpp-use-after-free": ["OWASP A06:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-double-free": ["OWASP A06:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "cpp-integer-overflow": ["OWASP A06:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],

  // SAST — C#
  "csharp-command-injection": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "csharp-sql-injection": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5", "PCI-DSS 6.5.1"],
  "csharp-sql-concat": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5", "PCI-DSS 6.5.1"],
  "csharp-xss": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "csharp-path-traversal": ["OWASP A01:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "csharp-ssrf": ["OWASP A10:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "csharp-open-redirect": ["OWASP A01:2021", "SOC2 CC6.1"],
  "csharp-deserialization": ["OWASP A08:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "csharp-json-deserialization": ["OWASP A08:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "csharp-xxe": ["OWASP A05:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "csharp-log-injection": ["OWASP A09:2021", "SOC2 CC7.2"],
  "csharp-weak-crypto": ["OWASP A02:2021", "SOC2 CC6.7", "ISO27001 A.10.1.1"],
  "csharp-insecure-random": ["OWASP A02:2021", "SOC2 CC6.7"],
  "csharp-hardcoded-secret": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3"],
  "csharp-csrf-disabled": ["OWASP A05:2021", "SOC2 CC6.1"],
  "csharp-insecure-cookie": ["OWASP A05:2021", "SOC2 CC6.1", "ISO27001 A.14.1.3"],
  "csharp-devpage": ["OWASP A05:2021", "SOC2 CC6.1"],

  // Log Threats
  "brute-force": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.2"],
  "sql-injection": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5", "PCI-DSS 6.5.1"],
  "xss-attempt": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "path-traversal": ["OWASP A01:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "command-injection": ["OWASP A03:2021", "SOC2 CC6.1", "ISO27001 A.14.2.5"],
  "privilege-escalation": ["OWASP A01:2021", "SOC2 CC6.1", "ISO27001 A.9.2.3"],
  "data-exfiltration": ["OWASP A01:2021", "SOC2 CC6.1", "ISO27001 A.13.2.1"],
  "high-frequency-ip": ["OWASP A07:2021", "SOC2 CC7.2"],
  "off-hours-activity": ["OWASP A07:2021", "SOC2 CC7.2"],
  "error-spike": ["OWASP A09:2021", "SOC2 CC7.2"],
  "sensitive-data-exposure": ["OWASP A02:2021", "SOC2 CC6.1", "ISO27001 A.8.2.3", "PCI-DSS 3.4"],

  // Docker / Container Security
  "docker-no-user": ["CIS Docker 4.1", "SOC2 CC6.1", "NIST AC-6"],
  "docker-latest-tag": ["CIS Docker 4.7", "SOC2 CC7.1"],
  "docker-secret-in-env": ["OWASP A07:2021", "SOC2 CC6.1", "CIS Docker 4.5", "PCI-DSS 3.4"],
  "docker-secret-in-arg": ["OWASP A07:2021", "SOC2 CC6.1", "CIS Docker 4.5"],
  "docker-curl-bash": ["CIS Docker 4.9", "SOC2 CC7.1", "NIST SI-7"],
  "docker-chmod-777": ["CIS Docker 4.8", "SOC2 CC6.1", "NIST AC-6"],
  "docker-expose-wide": ["CIS Docker 4.4", "SOC2 CC6.6", "ISO27001 A.13.1.1"],
  "docker-copy-all": ["CIS Docker 4.10", "SOC2 CC6.1"],
  "docker-no-healthcheck": ["CIS Docker 4.6"],
  "docker-add-instead-copy": ["CIS Docker 4.9"],
  "docker-no-version-pin": ["CIS Docker 4.7", "SOC2 CC7.1"],
  "docker-apt-no-clean": ["CIS Docker 4.2"],
  "docker-sudo-usage": ["CIS Docker 4.1", "NIST AC-6"],
  "docker-large-base": ["CIS Docker 4.2", "NIST CM-7"],
  "docker-no-workdir": ["CIS Docker 4.3"],

  // IaC — Terraform / CloudFormation / Kubernetes
  "iac-s3-public": ["CIS AWS 2.1.2", "SOC2 CC6.1", "ISO27001 A.8.2.3", "PCI-DSS 3.4"],
  "iac-s3-no-encryption": ["CIS AWS 2.1.1", "SOC2 CC6.7", "ISO27001 A.10.1.1", "PCI-DSS 3.4"],
  "iac-sg-open-ingress": ["CIS AWS 4.1", "SOC2 CC6.6", "ISO27001 A.13.1.1"],
  "iac-sg-open-ssh": ["CIS AWS 4.2", "SOC2 CC6.6", "ISO27001 A.13.1.1"],
  "iac-rds-public": ["CIS AWS 2.3.1", "SOC2 CC6.6", "ISO27001 A.13.1.1", "PCI-DSS 1.3.4"],
  "iac-rds-no-encryption": ["CIS AWS 2.3.2", "SOC2 CC6.7", "ISO27001 A.10.1.1", "PCI-DSS 3.4"],
  "iac-iam-wildcard": ["CIS AWS 1.16", "SOC2 CC6.1", "ISO27001 A.9.2.3", "NIST AC-6"],
  "iac-iam-admin-access": ["CIS AWS 1.22", "SOC2 CC6.1", "ISO27001 A.9.2.3", "NIST AC-6"],
  "iac-cloudtrail-disabled": ["CIS AWS 2.1", "SOC2 CC7.2", "ISO27001 A.12.4.1"],
  "iac-ebs-no-encryption": ["CIS AWS 2.2.1", "SOC2 CC6.7", "ISO27001 A.10.1.1"],
  "iac-hardcoded-secret": ["OWASP A07:2021", "SOC2 CC6.1", "ISO27001 A.9.4.3", "PCI-DSS 3.4"],
  "iac-http-not-https": ["SOC2 CC6.7", "ISO27001 A.10.1.1"],
  "iac-k8s-privileged": ["CIS K8s 5.2.1", "SOC2 CC6.1", "NIST AC-6"],
  "iac-k8s-run-as-root": ["CIS K8s 5.2.6", "SOC2 CC6.1", "NIST AC-6"],
  "iac-k8s-host-network": ["CIS K8s 5.2.4", "SOC2 CC6.6"],
  "iac-k8s-host-pid": ["CIS K8s 5.2.2", "SOC2 CC6.1"],
  "iac-k8s-no-limits": ["CIS K8s 5.4.1"],
  "iac-k8s-latest-image": ["CIS K8s 5.4.2", "SOC2 CC7.1"],
  "iac-k8s-no-readonly-root": ["CIS K8s 5.2.3", "SOC2 CC6.1"],
  "iac-k8s-default-namespace": ["CIS K8s 5.7.1"],
  "iac-cloudwatch-no-logs": ["CIS AWS 2.4", "SOC2 CC7.2"],
};

/* ── Secret Fix Templates ── */
const SECRET_FIXES: Record<string, { fix: string; fixCommand: string | null; codeExample: string | null; effort: Effort }> = {
  "aws-access-key": {
    fix: "Rotate AWS access key immediately. Use IAM roles or environment variables instead.",
    fixCommand: "aws iam create-access-key --user-name USER && aws iam delete-access-key --access-key-id OLD_KEY_ID --user-name USER",
    codeExample: `// Use AWS SDK with IAM roles (no hardcoded keys)
const { S3Client } = require('@aws-sdk/client-s3');
const client = new S3Client({ region: 'us-east-1' }); // Uses IAM role automatically`,
    effort: "low",
  },
  "github-token": {
    fix: "Revoke the GitHub token immediately at github.com/settings/tokens and generate a new one with minimum required permissions.",
    fixCommand: "# Revoke at: https://github.com/settings/tokens\n# Or via API: gh api -X DELETE /applications/{client_id}/token",
    codeExample: `// Use GITHUB_TOKEN environment variable
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN not set');`,
    effort: "low",
  },
  "stripe-key": {
    fix: "Roll the Stripe API key from the Stripe dashboard. Use restricted keys with minimal permissions.",
    fixCommand: null,
    codeExample: `// Load Stripe key from environment
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);`,
    effort: "low",
  },
  "private-key": {
    fix: "Remove the private key from source code. Store in a secrets manager (AWS Secrets Manager, HashiCorp Vault, or .env file).",
    fixCommand: "openssl genpkey -algorithm RSA -out new_private.pem -pkeyopt rsa_keygen_bits:4096",
    codeExample: `// Load from file system or secrets manager
const fs = require('fs');
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');`,
    effort: "medium",
  },
  "jwt-token": {
    fix: "Remove hardcoded JWT. Use short-lived tokens generated at runtime with a rotated secret.",
    fixCommand: null,
    codeExample: `// Generate JWT at runtime
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });`,
    effort: "low",
  },
  "database-url": {
    fix: "Remove database connection string from code. Use environment variables or a secrets manager.",
    fixCommand: null,
    codeExample: `// Use environment variable
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL not configured');
mongoose.connect(dbUrl);`,
    effort: "low",
  },
  "generic-api-key": {
    fix: "Rotate the API key and store it in environment variables or a secrets manager.",
    fixCommand: null,
    codeExample: `// Load from environment
const apiKey = process.env.API_KEY;
fetch(url, { headers: { 'Authorization': \`Bearer \${apiKey}\` } });`,
    effort: "low",
  },
  "hardcoded-password": {
    fix: "Remove hardcoded password. Use environment variables, secrets manager, or credential vaults.",
    fixCommand: null,
    codeExample: `// Load from environment
const password = process.env.DB_PASSWORD;
if (!password) throw new Error('DB_PASSWORD not configured');`,
    effort: "low",
  },
  "basic-auth": {
    fix: "Remove hardcoded Basic Auth credentials. Use OAuth2 or API keys loaded from environment.",
    fixCommand: null,
    codeExample: `// Use environment-based auth
const user = process.env.AUTH_USER;
const pass = process.env.AUTH_PASS;
const auth = Buffer.from(\`\${user}:\${pass}\`).toString('base64');`,
    effort: "low",
  },
  // Aliases — match scanner pattern IDs to fix templates
  "db-connection-string": {
    fix: "Remove database connection string from code. Use environment variables or a secrets manager.",
    fixCommand: null,
    codeExample: `// Use environment variable
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error('DATABASE_URL not configured');
mongoose.connect(dbUrl);`,
    effort: "low",
  },
  "generic-password": {
    fix: "Remove hardcoded password. Use environment variables, secrets manager, or credential vaults.",
    fixCommand: null,
    codeExample: `// Load from environment
const password = process.env.DB_PASSWORD;
if (!password) throw new Error('DB_PASSWORD not configured');`,
    effort: "low",
  },
  "bearer-header": {
    fix: "Remove hardcoded authorization headers. Use session tokens or OAuth2 flows with runtime credential injection.",
    fixCommand: null,
    codeExample: `// Load token from environment or session
const token = process.env.API_TOKEN || req.session?.token;
fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });`,
    effort: "low",
  },
  "github-fine-grained": {
    fix: "Revoke the fine-grained token at github.com/settings/tokens and regenerate with minimal permissions.",
    fixCommand: "# Revoke at: https://github.com/settings/tokens?type=beta",
    codeExample: `// Use GITHUB_TOKEN environment variable
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN not set');`,
    effort: "low",
  },
  "slack-webhook": {
    fix: "Regenerate the webhook URL in Slack channel settings. Store the URL in environment variables.",
    fixCommand: null,
    codeExample: `// Use environment variable
const webhookUrl = process.env.SLACK_WEBHOOK_URL;
await fetch(webhookUrl, { method: 'POST', body: JSON.stringify({ text: message }) });`,
    effort: "low",
  },
  "npm-token": {
    fix: "Revoke the npm token immediately. Use scoped tokens with minimal permissions stored in CI/CD secrets.",
    fixCommand: "npm token revoke TOKEN_ID",
    codeExample: `// Use .npmrc with env variable
//registry.npmjs.org/:_authToken=\${NPM_TOKEN}`,
    effort: "low",
  },
  "docker-token": {
    fix: "Regenerate the Docker Hub token. Store credentials in CI/CD secrets, never in source code.",
    fixCommand: null,
    codeExample: `// In CI: echo $DOCKER_TOKEN | docker login -u $DOCKER_USER --password-stdin`,
    effort: "low",
  },
  "mailgun-key": {
    fix: "Rotate the Mailgun API key in the Mailgun dashboard. Use environment variables for key storage.",
    fixCommand: null,
    codeExample: `// Use environment variable
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });`,
    effort: "low",
  },
  "aws-secret-key": {
    fix: "Rotate the AWS secret key immediately via IAM console. Use IAM roles or AWS Secrets Manager.",
    fixCommand: "aws iam create-access-key --user-name USER && aws iam delete-access-key --access-key-id OLD_KEY_ID --user-name USER",
    codeExample: `// Use AWS SDK with IAM roles (no hardcoded keys)
const { S3Client } = require('@aws-sdk/client-s3');
const client = new S3Client({ region: 'us-east-1' }); // Uses IAM role automatically`,
    effort: "low",
  },
  "internal-ip": {
    fix: "Avoid hardcoding internal IP addresses. Use DNS names, service discovery, or configuration variables.",
    fixCommand: null,
    codeExample: `// Use environment variable for service endpoints
const serviceUrl = process.env.BACKEND_SERVICE_URL || 'http://backend.internal:8080';`,
    effort: "low",
  },
};

/* ── API Fix Templates ── */
const API_HEADER_FIXES: Record<string, { fix: string; fixCommand: string | null; codeExample: string | null; effort: Effort }> = {
  "Strict-Transport-Security": {
    fix: "Add HSTS header with a minimum max-age of 1 year to prevent protocol downgrade attacks.",
    fixCommand: null,
    codeExample: `// Express.js middleware
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

// Nginx
// add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;`,
    effort: "low",
  },
  "Content-Security-Policy": {
    fix: "Configure Content Security Policy to restrict resource loading and prevent XSS attacks.",
    fixCommand: null,
    codeExample: `// Express.js — helmet
const helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"],
    connectSrc: ["'self'"],
  }
}));`,
    effort: "medium",
  },
  "X-Content-Type-Options": {
    fix: "Add X-Content-Type-Options: nosniff to prevent MIME sniffing.",
    fixCommand: null,
    codeExample: `// Express.js
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});`,
    effort: "low",
  },
  "X-Frame-Options": {
    fix: "Add X-Frame-Options: DENY to prevent clickjacking attacks.",
    fixCommand: null,
    codeExample: `res.setHeader('X-Frame-Options', 'DENY');
// Or use CSP: frame-ancestors 'none'`,
    effort: "low",
  },
  "Access-Control-Allow-Origin": {
    fix: "Replace wildcard (*) CORS with specific allowed origins. Never allow credentials with wildcard.",
    fixCommand: null,
    codeExample: `// Express.js CORS
const cors = require('cors');
app.use(cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));`,
    effort: "medium",
  },
};

/* ── Log Threat Fixes ── */
const LOG_FIXES: Record<string, { fix: string; fixCommand: string | null; codeExample: string | null; effort: Effort }> = {
  "high-frequency-ip": {
    fix: "Investigate the source IP for malicious activity. Consider rate limiting or blocking if confirmed hostile.",
    fixCommand: "# Block IP via firewall\niptables -A INPUT -s SUSPICIOUS_IP -j DROP",
    codeExample: `// Rate limit by IP\nconst rateLimit = require('express-rate-limit');\nconst limiter = rateLimit({ windowMs: 60000, max: 100 });\napp.use(limiter);`,
    effort: "low",
  },
  "off-hours-activity": {
    fix: "Review off-hours access for legitimacy. Alert the account owner and check for compromised credentials.",
    fixCommand: null,
    codeExample: `// Log and alert on off-hours access\nif (hour < 6 || hour > 22) {\n  alertSecurityTeam({ event: 'off-hours-access', user, timestamp });\n}`,
    effort: "medium",
  },
  "error-spike": {
    fix: "Investigate the error spike root cause — may indicate automated attack, misconfiguration, or service degradation.",
    fixCommand: null,
    codeExample: `// Monitor error rates\nconst errorRate = errors / totalRequests;\nif (errorRate > 0.1) alertOps({ message: 'Error rate spike', rate: errorRate });`,
    effort: "medium",
  },
  "sensitive-data-exposure": {
    fix: "Remove sensitive data from log output. Mask PII fields before logging. Implement structured logging with data classification.",
    fixCommand: "npm install pino pino-pretty",
    codeExample: `// Mask sensitive fields before logging\nfunction maskSensitive(data) {\n  const masked = { ...data };\n  ['password', 'ssn', 'creditCard'].forEach(f => {\n    if (masked[f]) masked[f] = '***REDACTED***';\n  });\n  return masked;\n}\nlogger.info(maskSensitive(userData));`,
    effort: "medium",
  },
  "brute-force": {
    fix: "Implement account lockout, rate limiting, and CAPTCHA after multiple failed attempts.",
    fixCommand: "npm install express-rate-limit",
    codeExample: `// Rate limit login endpoint
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts. Try again in 15 minutes.',
});
app.post('/api/login', loginLimiter, loginHandler);`,
    effort: "low",
  },
  "sql-injection": {
    fix: "Use parameterized queries or prepared statements. Never concatenate user input into SQL.",
    fixCommand: null,
    codeExample: `// SAFE — parameterized query
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// UNSAFE — never do this
// const result = await db.query(\`SELECT * FROM users WHERE id = \${userId}\`);`,
    effort: "low",
  },
  "xss-attempt": {
    fix: "Sanitize all user input. Use output encoding. Implement Content Security Policy.",
    fixCommand: "npm install dompurify",
    codeExample: `// Server-side sanitization
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const DOMPurify = createDOMPurify(new JSDOM('').window);
const clean = DOMPurify.sanitize(userInput);

// React — JSX auto-escapes, but avoid dangerouslySetInnerHTML`,
    effort: "low",
  },
  "path-traversal": {
    fix: "Validate and sanitize file paths. Use path.resolve() and verify the result stays within allowed directories.",
    fixCommand: null,
    codeExample: `const path = require('path');

function safePath(userInput) {
  const resolved = path.resolve('/safe/base/dir', userInput);
  if (!resolved.startsWith('/safe/base/dir')) {
    throw new Error('Path traversal attempt blocked');
  }
  return resolved;
}`,
    effort: "low",
  },
  "command-injection": {
    fix: "Never pass user input to shell commands. Use parameterized APIs or child_process.execFile with arguments array.",
    fixCommand: null,
    codeExample: `const { execFile } = require('child_process');

// SAFE — arguments as array, not shell string
execFile('ls', ['-la', sanitizedPath], (err, stdout) => {
  // handle result
});

// UNSAFE — never do this
// exec(\`ls -la \${userInput}\`);`,
    effort: "medium",
  },
  "privilege-escalation": {
    fix: "Implement strict role-based access control. Log and alert on privilege changes. Require MFA for admin actions.",
    fixCommand: null,
    codeExample: `// Middleware: enforce role
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
app.delete('/api/users/:id', requireRole('admin'), deleteUser);`,
    effort: "medium",
  },
  "data-exfiltration": {
    fix: "Implement DLP rules. Monitor outbound data volume. Alert on unusual data transfer patterns.",
    fixCommand: null,
    codeExample: `// Monitor response size
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(body) {
    if (body && body.length > 1_000_000) {
      logger.warn('Large response detected', { path: req.path, size: body.length, user: req.user?.id });
    }
    return originalSend.call(this, body);
  };
  next();
});`,
    effort: "high",
  },
};

/* ── Risk Scoring ── */

/* ── SAST Fix Templates ── */
const SAST_FIXES: Record<string, { fix: string; fixCommand: string | null; codeExample: string | null; effort: Effort }> = {
  // ─── JS/TS (AST analyzer) ───
  "sql-injection": {
    fix: "Use parameterized queries or prepared statements. Never concatenate user input into SQL strings.",
    fixCommand: null,
    codeExample: `// SAFE — parameterized query
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// UNSAFE — SQL injection
// const result = await db.query("SELECT * FROM users WHERE id = " + userId);`,
    effort: "low",
  },
  "command-injection": {
    fix: "Use child_process.execFile() with an arguments array. Never pass user input to shell commands via exec().",
    fixCommand: null,
    codeExample: `const { execFile } = require('child_process');

// SAFE — arguments as array, no shell interpretation
execFile('ping', ['-c', '1', sanitizedHost], (err, stdout) => {
  // handle result
});

// UNSAFE — shell injection
// exec("ping -c 1 " + host);`,
    effort: "medium",
  },
  "xss-reflected": {
    fix: "Sanitize all user input before including in HTML responses. Use a templating engine with auto-escaping or DOMPurify.",
    fixCommand: "npm install dompurify",
    codeExample: `// Server-side: use a template engine with auto-escaping
res.render('search', { query: sanitize(req.query.q) });

// Or sanitize with DOMPurify
const DOMPurify = require('dompurify');
const clean = DOMPurify.sanitize(userInput);
res.send(\`<h1>Results for: \${clean}</h1>\`);`,
    effort: "low",
  },
  "path-traversal": {
    fix: "Validate and sanitize file paths. Use path.resolve() and verify the resolved path stays within the allowed base directory.",
    fixCommand: null,
    codeExample: `const path = require('path');
const BASE_DIR = '/uploads';

function safePath(userInput) {
  const resolved = path.resolve(BASE_DIR, userInput);
  if (!resolved.startsWith(BASE_DIR)) {
    throw new Error('Path traversal attempt blocked');
  }
  return resolved;
}`,
    effort: "low",
  },
  "ssrf": {
    fix: "Validate and allowlist URLs before making server-side requests. Block private IP ranges and cloud metadata endpoints.",
    fixCommand: null,
    codeExample: `// Validate URL before fetching
const ALLOWED_HOSTS = ['api.example.com', 'cdn.example.com'];

function safeFetch(url) {
  const parsed = new URL(url);
  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    throw new Error('Blocked: disallowed host');
  }
  // Block private IPs
  if (/^(10\\.|172\\.(1[6-9]|2|3[01])\\.|192\\.168\\.|127\\.|0\\.)/.test(parsed.hostname)) {
    throw new Error('Blocked: private IP');
  }
  return fetch(url);
}`,
    effort: "medium",
  },
  "eval-injection": {
    fix: "Never pass user-controlled data to eval(), new Function(), setTimeout(string), or setInterval(string).",
    fixCommand: null,
    codeExample: `// SAFE — use JSON.parse for data
const data = JSON.parse(userInput);

// SAFE — for math expressions, use a safe evaluator
const { evaluate } = require('mathjs');
const result = evaluate(expression); // safe, sandboxed

// UNSAFE
// const result = eval(userInput);`,
    effort: "medium",
  },
  "eval-usage": {
    fix: "Remove eval(). Use JSON.parse() for data, safe expression evaluators for math, or sandboxed VMs if dynamic code is truly needed.",
    fixCommand: null,
    codeExample: `// Instead of eval(jsonString)
const data = JSON.parse(jsonString);

// Instead of eval(mathExpr)
const { evaluate } = require('mathjs');
const result = evaluate(mathExpr);`,
    effort: "medium",
  },
  "weak-crypto": {
    fix: "Use SHA-256 or SHA-3 for hashing. For passwords, use bcrypt, scrypt, or Argon2. Never use MD5 or SHA-1 for security.",
    fixCommand: "npm install bcrypt",
    codeExample: `const crypto = require('crypto');

// SAFE — SHA-256 for hashing
const hash = crypto.createHash('sha256').update(data).digest('hex');

// For passwords — use bcrypt
const bcrypt = require('bcrypt');
const hashed = await bcrypt.hash(password, 12);
const valid = await bcrypt.compare(password, hashed);`,
    effort: "low",
  },
  "hardcoded-jwt-secret": {
    fix: "Store JWT secrets in environment variables. Rotate secrets periodically. Use asymmetric keys (RS256) for production.",
    fixCommand: null,
    codeExample: `// SAFE — load from environment
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET not configured');
const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

// Even better — use asymmetric keys
const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH);
const token = jwt.sign({ userId }, privateKey, { algorithm: 'RS256', expiresIn: '1h' });`,
    effort: "low",
  },
  "prototype-pollution": {
    fix: "Use Object.create(null) as base objects. Validate input keys — reject __proto__, constructor, prototype.",
    fixCommand: null,
    codeExample: `// SAFE — sanitize keys before merging
function safeMerge(target, source) {
  const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);
  for (const key of Object.keys(source)) {
    if (BLOCKED.has(key)) continue;
    target[key] = source[key];
  }
  return target;
}

// Or use a safe merge library
const deepmerge = require('deepmerge');`,
    effort: "medium",
  },
  "dangerous-innerhtml": {
    fix: "Use textContent instead of innerHTML. In React, use JSX auto-escaping. If raw HTML is required, sanitize with DOMPurify.",
    fixCommand: "npm install dompurify",
    codeExample: `// React — SAFE: JSX auto-escapes
return <div>{userContent}</div>;

// If raw HTML is needed, sanitize first
import DOMPurify from 'dompurify';
return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;

// Vanilla JS — use textContent
element.textContent = userInput; // SAFE — no HTML parsing`,
    effort: "low",
  },
  "insecure-cookie": {
    fix: "Set cookies with: { secure: true, httpOnly: true, sameSite: 'strict' }.",
    fixCommand: null,
    codeExample: `res.cookie('session', token, {
  httpOnly: true,  // Prevents XSS-based theft
  secure: true,    // HTTPS only
  sameSite: 'strict', // CSRF protection
  maxAge: 3600000, // 1 hour
});`,
    effort: "low",
  },
  "timing-attack": {
    fix: "Use crypto.timingSafeEqual() for comparing secrets, tokens, HMACs, and API keys.",
    fixCommand: null,
    codeExample: `const crypto = require('crypto');

// SAFE — constant-time comparison
function safeCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

if (safeCompare(providedToken, storedToken)) {
  // Authenticated
}`,
    effort: "low",
  },
  "no-rate-limit": {
    fix: "Add rate limiting middleware to authentication endpoints to prevent brute-force attacks.",
    fixCommand: "npm install express-rate-limit",
    codeExample: `const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts. Try again later.',
});

app.post('/login', loginLimiter, loginHandler);`,
    effort: "low",
  },
  "regex-dos": {
    fix: "Never create RegExp from user input. Use a safe regex library like 're2' (linear-time engine).",
    fixCommand: "npm install re2",
    codeExample: `// SAFE — use RE2 for user-provided patterns
const RE2 = require('re2');

function safeRegex(pattern) {
  try {
    return new RE2(pattern);
  } catch {
    throw new Error('Invalid regex pattern');
  }
}`,
    effort: "medium",
  },
  "cors-misconfiguration": {
    fix: "Configure CORS with specific trusted origins. Never use wildcard with credentials.",
    fixCommand: null,
    codeExample: `const cors = require('cors');

app.use(cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));`,
    effort: "low",
  },
  "nosql-injection": {
    fix: "Sanitize user input before using in MongoDB queries. Use schema validation. Reject objects with $ operators.",
    fixCommand: "npm install mongo-sanitize",
    codeExample: `const sanitize = require('mongo-sanitize');

// Sanitize input — strips $ operators
const cleanFilter = sanitize(req.query.filter);
const user = await User.findOne(cleanFilter);

// Or validate explicitly
if (typeof filter !== 'string') {
  return res.status(400).json({ error: 'Invalid filter' });
}`,
    effort: "low",
  },
  "unsafe-deserialization": {
    fix: "Validate and schema-check deserialized data. Use JSON Schema validation. Avoid yaml.load() on untrusted input.",
    fixCommand: null,
    codeExample: `// Validate after parsing
const Ajv = require('ajv');
const ajv = new Ajv();
const schema = { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] };
const data = JSON.parse(userInput);
if (!ajv.validate(schema, data)) {
  throw new Error('Invalid data format');
}`,
    effort: "medium",
  },
  "log-injection": {
    fix: "Sanitize user input before logging. Strip newlines and control characters to prevent log forging.",
    fixCommand: null,
    codeExample: `// Sanitize before logging
function safeLog(input) {
  return String(input).replace(/[\\r\\n\\t]/g, ' ').slice(0, 500);
}

console.log('User search:', safeLog(req.query.q));`,
    effort: "low",
  },
  "open-redirect": {
    fix: "Validate redirect URLs against an allowlist. Reject absolute URLs with different domains.",
    fixCommand: null,
    codeExample: `// SAFE — validate redirect URL
function safeRedirect(res, url) {
  // Only allow relative paths
  if (url.startsWith('/') && !url.startsWith('//')) {
    return res.redirect(url);
  }
  // Or check against allowlist
  const allowed = ['https://yourdomain.com'];
  const parsed = new URL(url, 'https://yourdomain.com');
  if (allowed.includes(parsed.origin)) {
    return res.redirect(url);
  }
  return res.redirect('/');
}`,
    effort: "low",
  },

  // ─── JAVA ───
  "java-command-injection": {
    fix: "Do not pass user input to Runtime.exec() as a single concatenated string. Use ProcessBuilder with an explicit argument list so each argument is separate and cannot break out of its intended position.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// Runtime.getRuntime().exec("ping -c 1 " + userInput);

// SAFE — use ProcessBuilder with argument list
ProcessBuilder pb = new ProcessBuilder("ping", "-c", "1", sanitizedHost);
pb.redirectErrorStream(true);
Process p = pb.start();

// Always validate input against allowlist
if (!host.matches("^[a-zA-Z0-9.-]+$")) {
    throw new SecurityException("Invalid hostname");
}`,
    effort: "medium",
  },
  "java-command-injection-pb": {
    fix: "Do not pass user-controlled values to ProcessBuilder arguments without validation. Allowlist permitted commands and sanitize all arguments to reject shell metacharacters.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// new ProcessBuilder("sh", "-c", userInput).start();

// SAFE — fixed command, validated arguments, no shell
private static final Set<String> ALLOWED = Set.of("ping", "nslookup");
String cmd = request.getParameter("cmd");
if (!ALLOWED.contains(cmd)) throw new SecurityException("Blocked");

ProcessBuilder pb = new ProcessBuilder(cmd, "-c", "1", validatedArg);
pb.redirectErrorStream(true);
Process p = pb.start();`,
    effort: "medium",
  },
  "java-sql-injection": {
    fix: "Replace dynamic SQL built with string concatenation with PreparedStatement and bind parameters (? placeholders). This ensures user input is always treated as data, never as SQL syntax.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// stmt.executeQuery("SELECT * FROM users WHERE id = " + userId);

// SAFE — PreparedStatement with bind parameter
String sql = "SELECT * FROM users WHERE id = ?";
PreparedStatement ps = conn.prepareStatement(sql);
ps.setString(1, userId);
ResultSet rs = ps.executeQuery();

// For JPA/Hibernate — use named parameters
Query q = em.createQuery("SELECT u FROM User u WHERE u.id = :id");
q.setParameter("id", userId);`,
    effort: "low",
  },
  "java-sql-concat": {
    fix: "SQL queries built via string concatenation are vulnerable to injection even if the variables appear safe. Always use PreparedStatement with ? placeholders so the database driver handles escaping.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// stmt.executeQuery("SELECT * FROM users WHERE name = '" + name + "'");

// SAFE — PreparedStatement
PreparedStatement ps = conn.prepareStatement(
    "SELECT * FROM users WHERE name = ?");
ps.setString(1, name);
ResultSet rs = ps.executeQuery();`,
    effort: "low",
  },
  "java-path-traversal": {
    fix: "Canonicalize the user-supplied path and verify the resolved absolute path falls within the intended base directory. Reject paths containing .. segments or absolute path references.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// new FileInputStream("/uploads/" + userInput);

// SAFE — canonicalize and validate
Path base = Paths.get("/uploads").toRealPath();
Path resolved = base.resolve(userInput).normalize().toRealPath();
if (!resolved.startsWith(base)) {
    throw new SecurityException("Path traversal blocked");
}
FileInputStream fis = new FileInputStream(resolved.toFile());`,
    effort: "low",
  },
  "java-xss": {
    fix: "HTML-encode all user-controlled data before writing it to the HTTP response body. Use OWASP Java Encoder or your framework's auto-escaping template engine.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// response.getWriter().print("<h1>" + userInput + "</h1>");

// SAFE — OWASP Java Encoder
import org.owasp.encoder.Encode;
response.getWriter().print("<h1>" + Encode.forHtml(userInput) + "</h1>");

// Or use JSP/Thymeleaf with auto-escaping
// Thymeleaf: <span th:text="\${userInput}"></span>  (auto-escaped)
// JSP:       <c:out value="\${param.name}" />        (auto-escaped)`,
    effort: "low",
  },
  "java-ssrf": {
    fix: "Validate user-supplied URLs against an allowlist of trusted hosts. Block requests to private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.169.254) and use network-level egress filtering.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// URL url = new URL(userInput); url.openStream();

// SAFE — validate host against allowlist
private static final Set<String> ALLOWED_HOSTS = Set.of("api.example.com");

URL url = new URL(userInput);
InetAddress addr = InetAddress.getByName(url.getHost());
if (addr.isLoopbackAddress() || addr.isSiteLocalAddress() || addr.isLinkLocalAddress()) {
    throw new SecurityException("Blocked: private address");
}
if (!ALLOWED_HOSTS.contains(url.getHost())) {
    throw new SecurityException("Blocked: untrusted host");
}`,
    effort: "medium",
  },
  "java-deserialization": {
    fix: "Never deserialize untrusted data with ObjectInputStream. Migrate to JSON (Jackson/Gson) or Protocol Buffers. If Java serialization is unavoidable, configure an ObjectInputFilter to strictly allowlist expected classes.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// ObjectInputStream ois = new ObjectInputStream(stream);
// Object obj = ois.readObject();

// SAFE — use JSON instead
import com.fasterxml.jackson.databind.ObjectMapper;
ObjectMapper mapper = new ObjectMapper();
MyDto dto = mapper.readValue(inputStream, MyDto.class);

// If ObjectInputStream is required — set a filter
ObjectInputFilter filter = ObjectInputFilter.Config
    .createFilter("com.myapp.model.*;!*");
ois.setObjectInputFilter(filter);`,
    effort: "medium",
  },
  "java-xxe": {
    fix: "Disable external entity processing and DTD loading on all XML parsers (DocumentBuilderFactory, SAXParserFactory, XMLInputFactory). This prevents attackers from reading local files or triggering SSRF via XXE payloads.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// DocumentBuilderFactory f = DocumentBuilderFactory.newInstance();
// f.newDocumentBuilder().parse(input);

// SAFE — disable DTDs and external entities
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
factory.setXIncludeAware(false);
factory.setExpandEntityReferences(false);
DocumentBuilder builder = factory.newDocumentBuilder();`,
    effort: "low",
  },
  "java-ldap-injection": {
    fix: "Use parameterized LDAP search filters with SearchControls, or escape special LDAP characters (*, (, ), \\, NUL) in user input before inserting into filter strings.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// ctx.search("ou=users", "(uid=" + userInput + ")", controls);

// SAFE — escape LDAP special characters
public static String escapeLdap(String input) {
    return input.replace("\\\\", "\\\\5c").replace("*", "\\\\2a")
                .replace("(", "\\\\28").replace(")", "\\\\29")
                .replace("\\0", "\\\\00");
}
String filter = "(uid=" + escapeLdap(userInput) + ")";
ctx.search("ou=users", filter, controls);`,
    effort: "low",
  },
  "java-open-redirect": {
    fix: "Validate redirect URLs server-side. Allow only relative paths (starting with / but not //) or trusted domains from a hardcoded allowlist. Never redirect to user-supplied absolute URLs.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// response.sendRedirect(request.getParameter("returnUrl"));

// SAFE — validate is a relative path within your site
String url = request.getParameter("returnUrl");
if (url == null || !url.startsWith("/") || url.startsWith("//")) {
    url = "/dashboard"; // fallback to safe default
}
response.sendRedirect(url);`,
    effort: "low",
  },
  "java-log-injection": {
    fix: "Strip CRLF characters (\\r, \\n) and ANSI escape sequences from user input before passing it to log methods. Use structured logging frameworks (SLF4J + Logback) with parameterized messages instead of string concatenation.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// logger.info("Login attempt for user: " + username);

// SAFE — parameterized logging (SLF4J)
logger.info("Login attempt for user: {}", sanitize(username));

private static String sanitize(String input) {
    if (input == null) return "null";
    return input.replaceAll("[\\\\r\\\\n\\\\t]", "_")
                .replaceAll("\\\\x1b\\\\[[0-9;]*m", ""); // strip ANSI
}`,
    effort: "low",
  },
  "java-weak-crypto": {
    fix: "Replace MD5/SHA-1 with SHA-256 or SHA-3 for integrity checks. For password storage, use bcrypt, scrypt, or Argon2 — never bare hash functions, even strong ones.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// MessageDigest.getInstance("MD5");

// SAFE — SHA-256 for data integrity
MessageDigest md = MessageDigest.getInstance("SHA-256");
byte[] hash = md.digest(data.getBytes(StandardCharsets.UTF_8));

// For passwords — use bcrypt
import org.mindrot.jbcrypt.BCrypt;
String hashed = BCrypt.hashpw(password, BCrypt.gensalt(12));
boolean valid = BCrypt.checkpw(password, hashed);`,
    effort: "low",
  },
  "java-insecure-random": {
    fix: "Replace java.util.Random with java.security.SecureRandom for any value used in a security context (tokens, nonces, session IDs, passwords, OTPs, CSRF tokens).",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// Random rng = new Random();
// int token = rng.nextInt(999999);

// SAFE — SecureRandom
SecureRandom sr = SecureRandom.getInstanceStrong();
byte[] tokenBytes = new byte[32];
sr.nextBytes(tokenBytes);
String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);`,
    effort: "low",
  },
  "java-hardcoded-secret": {
    fix: "Remove hardcoded credentials from source code. Load secrets from environment variables, a .env file processed at build time, or a secrets manager (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault).",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// private String apiKey = "sk-live-abc123def456";

// SAFE — load from environment
String apiKey = System.getenv("API_KEY");
if (apiKey == null || apiKey.isBlank()) {
    throw new IllegalStateException("API_KEY env var is not set");
}

// Or use Spring @Value
@Value("\${api.key}")
private String apiKey;`,
    effort: "low",
  },

  // ─── C++ ───
  "cpp-command-injection": {
    fix: "Never pass user input to system() or popen(). Use fork()/execvp() with an explicit argument array so the shell is not invoked and metacharacters have no effect.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// system(("ping -c 1 " + host).c_str());

// SAFE — execvp with argument array, no shell
pid_t pid = fork();
if (pid == 0) {
    const char* args[] = {"ping", "-c", "1", sanitized_host, nullptr};
    execvp("ping", (char* const*)args);
    _exit(127);
}
int status;
waitpid(pid, &status, 0);`,
    effort: "medium",
  },
  "cpp-command-injection-exec": {
    fix: "Validate all arguments passed to exec-family functions against an allowlist. Never pass user-controlled data as the command name or as arguments without strict validation.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// execlp("sh", "sh", "-c", user_cmd, nullptr);

// SAFE — fixed command, validated argument
static const std::set<std::string> ALLOWED = {"ping", "nslookup", "dig"};
if (ALLOWED.find(cmd) == ALLOWED.end()) {
    throw std::runtime_error("Command not allowed");
}
execlp(cmd.c_str(), cmd.c_str(), validated_arg.c_str(), nullptr);`,
    effort: "medium",
  },
  "cpp-format-string": {
    fix: "Never pass user-controlled data as the format string argument to printf/fprintf/sprintf/syslog. Always use a fixed format string with \"%s\" to print user data.",
    fixCommand: null,
    codeExample: `// VULNERABLE — attacker can read/write memory:
// printf(user_input);

// SAFE — fixed format string
printf("%s", user_input);

// SAFE — snprintf with fixed format
snprintf(buf, sizeof(buf), "User said: %s", user_input);`,
    effort: "low",
  },
  "cpp-path-traversal": {
    fix: "Canonicalize user-supplied file paths with realpath() and verify the resulting absolute path starts with the intended base directory. Reject input containing .. or absolute path prefixes.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// fopen(user_path, "r");

// SAFE — resolve and validate
const char* BASE = "/var/app/uploads";
char resolved[PATH_MAX];
if (realpath(user_path, resolved) == nullptr) {
    perror("Invalid path"); return;
}
if (strncmp(resolved, BASE, strlen(BASE)) != 0) {
    fprintf(stderr, "Path traversal blocked\\n"); return;
}
FILE* f = fopen(resolved, "r");`,
    effort: "low",
  },
  "cpp-sql-injection": {
    fix: "Use parameterized queries / prepared statements provided by your database library. Never concatenate user input into SQL strings.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// snprintf(query, sizeof(query), "SELECT * FROM users WHERE id='%s'", user_id);
// mysql_query(conn, query);

// SAFE — MySQL prepared statement
MYSQL_STMT* stmt = mysql_stmt_init(conn);
const char* sql = "SELECT * FROM users WHERE id = ?";
mysql_stmt_prepare(stmt, sql, strlen(sql));
MYSQL_BIND bind[1] = {};
bind[0].buffer_type = MYSQL_TYPE_STRING;
bind[0].buffer = (char*)user_id;
bind[0].buffer_length = strlen(user_id);
mysql_stmt_bind_param(stmt, bind);
mysql_stmt_execute(stmt);`,
    effort: "low",
  },
  "cpp-buffer-overflow-strcpy": {
    fix: "Replace strcpy() with strncpy() or strlcpy() specifying the destination buffer size, or use std::string which manages its own memory. strcpy performs no bounds checking and will overwrite adjacent memory if the source exceeds the destination.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// char buf[64]; strcpy(buf, input);

// SAFE — strncpy with explicit length
char buf[64];
strncpy(buf, input, sizeof(buf) - 1);
buf[sizeof(buf) - 1] = '\\0';

// BETTER — use std::string
std::string safe = input; // automatic memory management`,
    effort: "low",
  },
  "cpp-buffer-overflow-strcat": {
    fix: "Replace strcat() with strncat() specifying the remaining space in the destination buffer, or use std::string::append(). strcat performs no bounds checking.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// char path[128]; strcpy(path, dir); strcat(path, file);

// SAFE — strncat with remaining space
char path[128];
strncpy(path, dir, sizeof(path) - 1);
path[sizeof(path) - 1] = '\\0';
size_t remaining = sizeof(path) - strlen(path) - 1;
strncat(path, file, remaining);

// BETTER — std::string
std::string path = std::string(dir) + "/" + file;`,
    effort: "low",
  },
  "cpp-buffer-overflow-sprintf": {
    fix: "Replace sprintf() with snprintf() which takes a buffer size parameter and will never write beyond it. Better yet, use std::ostringstream or std::format (C++20).",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// char buf[256]; sprintf(buf, "User %s: %s", user, msg);

// SAFE — snprintf with size limit
char buf[256];
snprintf(buf, sizeof(buf), "User %s: %s", user, msg);

// BETTER — std::ostringstream
std::ostringstream oss;
oss << "User " << user << ": " << msg;
std::string result = oss.str();`,
    effort: "low",
  },
  "cpp-buffer-overflow-gets": {
    fix: "gets() was removed from the C11 standard because it is fundamentally unsafe — it reads unlimited input with no bounds check. Replace with fgets() specifying the buffer size.",
    fixCommand: null,
    codeExample: `// VULNERABLE (removed from C11):
// char line[100]; gets(line);

// SAFE — fgets with buffer size
char line[100];
if (fgets(line, sizeof(line), stdin) != NULL) {
    // Remove trailing newline if present
    line[strcspn(line, "\\n")] = '\\0';
    puts(line);
}`,
    effort: "low",
  },
  "cpp-buffer-overflow-wcscpy": {
    fix: "Replace wcscpy() with wcsncpy() specifying the destination buffer size, or use std::wstring. wcscpy performs no bounds checking on wide character strings.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// wchar_t buf[64]; wcscpy(buf, input);

// SAFE — wcsncpy with explicit length
wchar_t buf[64];
wcsncpy(buf, input, 63);
buf[63] = L'\\0';

// BETTER — std::wstring
std::wstring safe = input;`,
    effort: "low",
  },
  "cpp-buffer-overflow-wcscat": {
    fix: "Replace wcscat() with wcsncat() specifying the remaining space in the destination buffer, or use std::wstring. wcscat performs no bounds checking on wide character strings.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// wcscat(buf, user_input);

// SAFE — wcsncat with remaining space
size_t remaining = sizeof(buf)/sizeof(wchar_t) - wcslen(buf) - 1;
wcsncat(buf, user_input, remaining);

// BETTER — std::wstring
std::wstring result = base + user_input;`,
    effort: "low",
  },
  "cpp-unsafe-scanf": {
    fix: "Add a width specifier to the %s format to limit reads: scanf(\"%99s\", buf) for a 100-byte buffer. Better yet, use fgets() followed by sscanf() or std::cin with std::string.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// char buf[100]; scanf("%s", buf);

// SAFE — width specifier
char buf[100];
scanf("%99s", buf); // reads at most 99 chars + null

// BETTER — fgets
char buf[100];
fgets(buf, sizeof(buf), stdin);

// BEST (C++) — std::string
std::string input;
std::cin >> input; // no overflow possible`,
    effort: "low",
  },
  "cpp-weak-crypto": {
    fix: "Replace MD5/SHA-1 with SHA-256 or SHA-3. Use OpenSSL EVP API (EVP_sha256()) for hashing. For password storage, use Argon2 or bcrypt.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// MD5_Init(&ctx); MD5_Update(&ctx, data, len); MD5_Final(hash, &ctx);

// SAFE — OpenSSL EVP SHA-256
#include <openssl/evp.h>
EVP_MD_CTX* ctx = EVP_MD_CTX_new();
EVP_DigestInit_ex(ctx, EVP_sha256(), NULL);
EVP_DigestUpdate(ctx, data, data_len);
unsigned char hash[EVP_MAX_MD_SIZE];
unsigned int hash_len;
EVP_DigestFinal_ex(ctx, hash, &hash_len);
EVP_MD_CTX_free(ctx);`,
    effort: "low",
  },
  "cpp-insecure-random": {
    fix: "Replace rand()/srand() with a cryptographically secure random number generator. Use /dev/urandom on Linux, CryptGenRandom on Windows, or std::random_device from C++11.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// srand(time(0)); int token = rand();

// SAFE (C++11) — std::random_device
#include <random>
std::random_device rd;
uint32_t token = rd();

// SAFE (POSIX) — /dev/urandom
unsigned char buf[32];
FILE* f = fopen("/dev/urandom", "rb");
fread(buf, 1, sizeof(buf), f);
fclose(f);`,
    effort: "low",
  },
  "cpp-hardcoded-secret": {
    fix: "Remove hardcoded credentials from source code. Load them from environment variables at runtime or from a secure configuration file with restricted file permissions.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// const char* password = "SuperSecret123!";

// SAFE — environment variable
const char* password = getenv("DB_PASSWORD");
if (!password) {
    fprintf(stderr, "DB_PASSWORD not set\\n");
    exit(1);
}`,
    effort: "low",
  },
  "cpp-use-after-free": {
    fix: "Set pointers to nullptr immediately after freeing. Better yet, use RAII with smart pointers (std::unique_ptr, std::shared_ptr) which automatically manage memory lifecycle and prevent use-after-free bugs.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// free(ptr); printf("%s", ptr);

// SAFE — null after free
free(ptr);
ptr = NULL;

// BEST — smart pointers (C++)
#include <memory>
auto ptr = std::make_unique<char[]>(100);
// ptr is automatically freed when it goes out of scope
// Cannot be used after move: auto p2 = std::move(ptr); // ptr is now null`,
    effort: "medium",
  },
  "cpp-double-free": {
    fix: "Set pointers to nullptr immediately after free() to prevent double-free. Use smart pointers (std::unique_ptr) which enforce single ownership and prevent double-free by design.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// free(ptr); ... free(ptr); // heap corruption

// SAFE — null after free prevents double-free
free(ptr);
ptr = NULL; // second free(NULL) is a harmless no-op

// BEST — unique_ptr (C++)
auto ptr = std::make_unique<int[]>(100);
// Cannot be freed twice — unique_ptr destructor runs exactly once`,
    effort: "medium",
  },
  "cpp-integer-overflow": {
    fix: "Replace atoi()/atol() with strtol()/strtoll() and check errno and the range before using the converted value. In C++, use std::stoi/stol inside a try-catch block.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// int val = atoi(user_input); // no error/range check

// SAFE — strtol with validation
errno = 0;
char* end;
long val = strtol(user_input, &end, 10);
if (errno == ERANGE || *end != '\\0' || val > INT_MAX || val < INT_MIN) {
    fprintf(stderr, "Invalid or out-of-range integer\\n");
    return -1;
}
int safe_val = (int)val;

// SAFE (C++) — std::stoi with exception handling
try {
    int val = std::stoi(user_input);
} catch (const std::out_of_range&) {
    // handle overflow
}`,
    effort: "low",
  },

  // ─── C# ───
  "csharp-command-injection": {
    fix: "Set UseShellExecute = false, specify FileName and Arguments separately, and validate command arguments against an allowlist. Never pass user input directly to cmd.exe or /bin/sh.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// Process.Start("cmd.exe", "/c ping " + userInput);

// SAFE — no shell, separate arguments
var psi = new ProcessStartInfo {
    FileName = "ping",
    Arguments = $"-n 1 {validatedHost}", // validate first!
    UseShellExecute = false,
    RedirectStandardOutput = true,
    CreateNoWindow = true
};
// Validate input
if (!Regex.IsMatch(host, @"^[a-zA-Z0-9.-]+$"))
    throw new SecurityException("Invalid hostname");
using var process = Process.Start(psi);`,
    effort: "medium",
  },
  "csharp-sql-injection": {
    fix: "Use parameterized queries with SqlParameter objects. Never concatenate user input into SQL strings. For EF Core, use LINQ or FromSqlInterpolated() which auto-parameterizes.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// cmd.ExecuteReader($"SELECT * FROM Users WHERE Id = {id}");

// SAFE — SqlParameter
var cmd = new SqlCommand("SELECT * FROM Users WHERE Id = @id", conn);
cmd.Parameters.AddWithValue("@id", userId);
var reader = cmd.ExecuteReader();

// SAFE — EF Core
var user = await db.Users
    .FromSqlInterpolated($"SELECT * FROM Users WHERE Id = {userId}")
    .FirstOrDefaultAsync();

// BEST — LINQ (no raw SQL)
var user = await db.Users.FindAsync(userId);`,
    effort: "low",
  },
  "csharp-sql-concat": {
    fix: "SQL queries built via string concatenation are always vulnerable to injection. Use parameter placeholders (@param) and SqlParameter / AddWithValue() to safely bind user values.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// new SqlCommand("SELECT * FROM Users WHERE Id = " + id, conn);

// SAFE — parameterized
var cmd = new SqlCommand("SELECT * FROM Users WHERE Id = @id", conn);
cmd.Parameters.AddWithValue("@id", id);
var reader = cmd.ExecuteReader();`,
    effort: "low",
  },
  "csharp-xss": {
    fix: "Use Razor's default HTML encoding (@Model.Property). If Html.Raw() is required for rich content, sanitize the input with HtmlSanitizer first. Never output user data without encoding.",
    fixCommand: "dotnet add package HtmlSanitizer",
    codeExample: `// VULNERABLE:
// @Html.Raw(userInput)

// SAFE — Razor auto-encodes by default
<p>Welcome, @Model.Username</p>  @* Auto HTML-encoded *@

// If raw HTML is needed, sanitize first
@using Ganss.Xss;
@{
    var sanitizer = new HtmlSanitizer();
    var clean = sanitizer.Sanitize(Model.Bio);
}
@Html.Raw(clean)`,
    effort: "low",
  },
  "csharp-path-traversal": {
    fix: "Canonicalize user-supplied paths with Path.GetFullPath() and verify the result starts with the intended base directory. Reject paths containing .. or absolute path references.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// File.ReadAllBytes("/uploads/" + userFile);

// SAFE — canonicalize and validate
string basePath = Path.GetFullPath("/uploads");
string fullPath = Path.GetFullPath(Path.Combine(basePath, userFile));
if (!fullPath.StartsWith(basePath + Path.DirectorySeparatorChar)) {
    throw new SecurityException("Path traversal blocked");
}
byte[] data = File.ReadAllBytes(fullPath);`,
    effort: "low",
  },
  "csharp-ssrf": {
    fix: "Validate user-supplied URLs against a strict allowlist of trusted hosts. Block requests to private IP ranges (10.x, 172.16-31.x, 192.168.x, 127.x, 169.254.169.254). Use HttpClientHandler with custom socket-level validation.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// await httpClient.GetAsync(userUrl);

// SAFE — validate against allowlist
var allowed = new HashSet<string> { "api.example.com" };
var uri = new Uri(userUrl);
if (!allowed.Contains(uri.Host))
    throw new SecurityException("Untrusted host");

// Block private IPs
var ip = (await Dns.GetHostAddressesAsync(uri.Host)).FirstOrDefault();
if (IPAddress.IsLoopback(ip) || ip.IsPrivate())
    throw new SecurityException("Private IP blocked");

var result = await httpClient.GetAsync(uri);`,
    effort: "medium",
  },
  "csharp-open-redirect": {
    fix: "Use Url.IsLocalUrl() or LocalRedirect() to ensure redirects stay within your application. Never redirect to user-supplied absolute URLs without validation.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// return Redirect(returnUrl);

// SAFE — LocalRedirect (throws on external URLs)
return LocalRedirect(returnUrl);

// Or validate manually
if (!Url.IsLocalUrl(returnUrl)) {
    returnUrl = "/dashboard";
}
return Redirect(returnUrl);`,
    effort: "low",
  },
  "csharp-deserialization": {
    fix: "Never use BinaryFormatter, SoapFormatter, or NetDataContractSerializer — they are inherently unsafe and enable remote code execution. Use System.Text.Json or Newtonsoft.Json (without TypeNameHandling) for serialization.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// var formatter = new BinaryFormatter();
// var obj = formatter.Deserialize(stream);

// SAFE — System.Text.Json
using System.Text.Json;
var obj = await JsonSerializer.DeserializeAsync<MyDto>(stream);

// Or Newtonsoft.Json (safe defaults)
var obj = JsonConvert.DeserializeObject<MyDto>(json);
// NEVER: TypeNameHandling = TypeNameHandling.All`,
    effort: "medium",
  },
  "csharp-json-deserialization": {
    fix: "Set TypeNameHandling = TypeNameHandling.None (Newtonsoft.Json default). TypeNameHandling.All/Auto/Objects lets attackers instantiate arbitrary types, leading to remote code execution.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// var settings = new JsonSerializerSettings {
//     TypeNameHandling = TypeNameHandling.All  // RCE!
// };

// SAFE — None (default)
var settings = new JsonSerializerSettings {
    TypeNameHandling = TypeNameHandling.None
};
var obj = JsonConvert.DeserializeObject<MyDto>(json, settings);

// If type info is needed, use a custom SerializationBinder
settings.SerializationBinder = new KnownTypesBinder(typeof(MyDto));`,
    effort: "low",
  },
  "csharp-xxe": {
    fix: "Set XmlResolver = null on XmlDocument before loading any XML. Or use XmlReader.Create() with DtdProcessing = DtdProcessing.Prohibit. This prevents attackers from including external entities that read local files or trigger SSRF.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// var doc = new XmlDocument();
// doc.Load(stream);

// SAFE — disable resolver
var doc = new XmlDocument();
doc.XmlResolver = null; // blocks external entities
doc.Load(stream);

// Or use XmlReader with strict settings
var settings = new XmlReaderSettings {
    DtdProcessing = DtdProcessing.Prohibit,
    XmlResolver = null
};
using var reader = XmlReader.Create(stream, settings);`,
    effort: "low",
  },
  "csharp-weak-crypto": {
    fix: "Replace MD5/SHA1 with SHA256 or SHA512 for integrity hashing. For password storage, use BCrypt, Argon2, or PBKDF2 with at least 100,000 iterations — never bare hash functions.",
    fixCommand: "dotnet add package BCrypt.Net-Next",
    codeExample: `// VULNERABLE:
// var hash = MD5.Create().ComputeHash(data);

// SAFE — SHA256 for data integrity
using var sha = SHA256.Create();
byte[] hash = sha.ComputeHash(data);

// For passwords — use BCrypt
using BCrypt.Net;
string hashed = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
bool valid = BCrypt.Net.BCrypt.Verify(password, hashed);`,
    effort: "low",
  },
  "csharp-insecure-random": {
    fix: "Replace System.Random with System.Security.Cryptography.RandomNumberGenerator for tokens, session IDs, OTPs, CSRF tokens, and any security-sensitive random values.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// var rng = new Random();
// int otp = rng.Next(100000, 999999);

// SAFE — cryptographic RNG
using System.Security.Cryptography;
byte[] tokenBytes = RandomNumberGenerator.GetBytes(32);
string token = Convert.ToBase64String(tokenBytes);

// For integer range
int otp = RandomNumberGenerator.GetInt32(100000, 999999);`,
    effort: "low",
  },
  "csharp-hardcoded-secret": {
    fix: "Remove hardcoded credentials from source code. Use IConfiguration with user-secrets for development and environment variables or Azure Key Vault for production.",
    fixCommand: "dotnet user-secrets set \"ApiKey\" \"your-key-here\"",
    codeExample: `// VULNERABLE:
// private string apiKey = "sk-live-abc123";

// SAFE — IConfiguration
public class MyService {
    private readonly string _apiKey;
    public MyService(IConfiguration config) {
        _apiKey = config["ApiKey"]
            ?? throw new InvalidOperationException("ApiKey not configured");
    }
}

// Or Azure Key Vault
builder.Configuration.AddAzureKeyVault(
    new Uri("https://myvault.vault.azure.net/"),
    new DefaultAzureCredential());`,
    effort: "low",
  },
  "csharp-csrf-disabled": {
    fix: "Remove [IgnoreAntiforgeryToken]. All state-changing POST/PUT/DELETE actions must have CSRF protection via [ValidateAntiForgeryToken] or the global AutoValidateAntiforgeryToken filter.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// [IgnoreAntiforgeryToken]
// [HttpPost]
// public IActionResult TransferFunds(...) { }

// SAFE — validate token
[ValidateAntiForgeryToken]
[HttpPost]
public IActionResult TransferFunds(decimal amount, string to) {
    // CSRF token will be validated automatically
    return Ok();
}

// Or enable globally in Startup.cs
services.AddControllersWithViews(options => {
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
});`,
    effort: "low",
  },
  "csharp-insecure-cookie": {
    fix: "Set Secure = true (HTTPS only) and HttpOnly = true (blocks JavaScript access) on all session and authentication cookies. Add SameSite = SameSiteMode.Strict for CSRF protection.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// new CookieOptions { Secure = false, HttpOnly = false };

// SAFE — secure cookie settings
Response.Cookies.Append("session", token, new CookieOptions {
    Secure = true,       // Only sent over HTTPS
    HttpOnly = true,     // Not accessible via JavaScript
    SameSite = SameSiteMode.Strict, // CSRF protection
    Expires = DateTimeOffset.UtcNow.AddHours(1),
    IsEssential = true
});`,
    effort: "low",
  },
  "csharp-devpage": {
    fix: "Only enable UseDeveloperExceptionPage() inside an if (env.IsDevelopment()) block. In production it exposes stack traces, source code, and environment variables to attackers.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// app.UseDeveloperExceptionPage(); // in all environments!

// SAFE — only in development
if (app.Environment.IsDevelopment()) {
    app.UseDeveloperExceptionPage();
} else {
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}`,
    effort: "low",
  },
  "csharp-log-injection": {
    fix: "Use structured logging with message templates and named placeholders. Never concatenate user input into log strings — this enables log forging and CRLF injection.",
    fixCommand: null,
    codeExample: `// VULNERABLE:
// _logger.LogInformation("User logged in: " + username);

// SAFE — structured logging with placeholder
_logger.LogInformation("User logged in: {Username}", username);

// Serilog example
Log.Information("Login for {User} from {IP}", username, ip);`,
    effort: "low",
  },
};

/* ── Risk Scoring ── */
const SEVERITY_SCORES: Record<Severity, number> = {
  critical: 40,
  high: 30,
  medium: 20,
  low: 10,
  info: 0,
};

const CONFIDENCE_SCORES: Record<Confidence, number> = {
  high: 30,
  medium: 20,
  low: 10,
};

// Exposure: is it internet-facing or internal?
const SCAN_EXPOSURE: Record<string, number> = {
  secrets: 30,   // Secrets in code = highly exploitable
  api: 30,       // API = internet-exposed
  deps: 15,      // Dependencies = priority should track CVSS severity
  cloud: 25,     // Cloud misconfig = broad exposure
  logs: 20,      // Log findings = attacks in progress
  cicd: 20,      // CI/CD = pipeline risk
  sast: 30,      // SAST = code-level vulnerabilities, highly exploitable
};

function calculateRiskScore(severity: Severity, confidence: Confidence, scanType: string): number {
  const s = SEVERITY_SCORES[severity] || 0;
  const c = CONFIDENCE_SCORES[confidence] || 0;
  const e = SCAN_EXPOSURE[scanType] || 15;
  return Math.min(100, s + c + e);
}

function riskToPriority(score: number): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}

/* ── Main Fix Engine ── */

export function generateFix(input: FindingInput): FixResult {
  const confidence: Confidence = input.confidence || "medium";
  const riskScore = calculateRiskScore(input.severity, confidence, input.scanType);
  const priority = riskToPriority(riskScore);

  // Determine compliance tags
  let complianceKey = input.patternId || input.owasp || input.id;
  if (input.scanType === "deps") {
    complianceKey = `dep-${input.severity}`;
  }
  const compliance = COMPLIANCE_MAP[complianceKey] || getDefaultCompliance(input.scanType, input.severity);

  // Get fix template based on scan type
  const fixTemplate = getFixTemplate(input);

  return {
    title: input.title,
    severity: input.severity,
    confidence,
    description: input.description,
    fix: fixTemplate.fix,
    fixCommand: fixTemplate.fixCommand,
    codeExample: fixTemplate.codeExample,
    effort: fixTemplate.effort,
    compliance,
    riskScore,
    priority,
  };
}

function getFixTemplate(input: FindingInput): { fix: string; fixCommand: string | null; codeExample: string | null; effort: Effort } {
  switch (input.scanType) {
    case "secrets": {
      const template = SECRET_FIXES[input.patternId || ""] || SECRET_FIXES["generic-api-key"];
      return template || {
        fix: "Remove the secret from source code. Store in environment variables or a secrets manager.",
        fixCommand: null,
        codeExample: `const secret = process.env.SECRET_NAME;\nif (!secret) throw new Error('Secret not configured');`,
        effort: "low",
      };
    }

    case "deps": {
      const fixCmd = buildDepFixCommand(input.ecosystem || "npm", input.packageName || "", input.fixedVersion || null);
      return {
        fix: input.fixedVersion
          ? `Upgrade ${input.packageName} from ${input.packageVersion} to ${input.fixedVersion} to resolve this vulnerability.`
          : `No fix version available for ${input.packageName}@${input.packageVersion}. Check the advisory for workarounds or consider replacing this dependency.`,
        fixCommand: fixCmd,
        codeExample: input.fixedVersion
          ? `// Updated dependency\n"${input.packageName}": "${input.fixedVersion}"`
          : null,
        effort: input.fixedVersion ? "low" : "high",
      };
    }

    case "api": {
      if (input.headerName) {
        const template = API_HEADER_FIXES[input.headerName];
        if (template) return template;
      }
      return {
        fix: input.description || "Review and fix the API security configuration.",
        fixCommand: null,
        codeExample: null,
        effort: input.severity === "critical" ? "medium" : "low",
      };
    }

    case "cloud": {
      // Cloud fixes are already embedded in the scanner via CLOUD_REMEDIATION
      return {
        fix: input.description || "Review cloud security configuration.",
        fixCommand: null,
        codeExample: null,
        effort: input.severity === "critical" ? "medium" : "low",
      };
    }

    case "logs": {
      const template = LOG_FIXES[input.patternId || ""];
      if (template) return template;
      return {
        fix: "Investigate the detected threat pattern. Implement appropriate countermeasures.",
        fixCommand: null,
        codeExample: null,
        effort: "medium",
      };
    }

    case "cicd": {
      return {
        fix: "Fix the underlying secret or dependency issue before deploying.",
        fixCommand: null,
        codeExample: null,
        effort: "low",
      };
    }

    case "sast": {
      const template = SAST_FIXES[input.patternId || ""];
      if (template) return template;
      return {
        fix: input.description || "Review and fix the security vulnerability identified by AST analysis.",
        fixCommand: null,
        codeExample: null,
        effort: input.severity === "critical" ? "medium" : "low",
      };
    }

    default:
      return {
        fix: "Review the finding and apply appropriate remediation.",
        fixCommand: null,
        codeExample: null,
        effort: "medium",
      };
  }
}

function buildDepFixCommand(ecosystem: string, pkg: string, fixedVersion: string | null): string | null {
  if (!fixedVersion) return null;
  switch (ecosystem.toLowerCase()) {
    case "npm": return `npm install ${pkg}@${fixedVersion}`;
    case "pypi": return `pip install ${pkg}>=${fixedVersion}`;
    case "go": return `go get ${pkg}@v${fixedVersion}`;
    case "maven": return `<!-- Update in pom.xml -->\n<dependency>\n  <groupId>...</groupId>\n  <artifactId>${pkg}</artifactId>\n  <version>${fixedVersion}</version>\n</dependency>`;
    case "gradle": return `// Update in build.gradle\nimplementation '...${pkg}:${fixedVersion}'`;
    default: return `Upgrade ${pkg} to version ${fixedVersion}`;
  }
}

function getDefaultCompliance(scanType: string, severity: Severity): string[] {
  const base: string[] = [];
  if (severity === "critical" || severity === "high") {
    base.push("SOC2 CC6.1");
  }
  switch (scanType) {
    case "secrets":
      base.push("OWASP A07:2021");
      break;
    case "deps":
      base.push("OWASP A06:2021");
      break;
    case "api":
      base.push("OWASP A05:2021");
      break;
    case "cloud":
      base.push("OWASP A05:2021");
      if (severity === "critical") base.push("CIS Benchmark");
      break;
    case "logs":
      base.push("OWASP A09:2021");
      break;
    case "sast":
      base.push("OWASP A03:2021");
      if (severity === "critical") base.push("PCI-DSS 6.5.1");
      break;
  }
  return base;
}

/* ── Batch processing ── */
export function generateFixBatch(inputs: FindingInput[]): FixResult[] {
  return inputs.map(generateFix);
}

/* ── Fingerprint for false positive suppression ── */
export function generateFindingFingerprint(input: FindingInput): string {
  const parts = [input.scanType, input.id, input.title, input.severity];
  if (input.packageName) parts.push(input.packageName);
  if (input.patternId) parts.push(input.patternId);
  // Stable hash using simple djb2
  const str = parts.join("|").toLowerCase();
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return `shieldx-fp-${Math.abs(hash).toString(16)}`;
}
