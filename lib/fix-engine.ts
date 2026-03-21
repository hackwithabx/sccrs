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
  scanType: "secrets" | "deps" | "api" | "cloud" | "logs" | "cicd";
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
