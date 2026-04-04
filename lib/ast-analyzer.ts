/**
 * ShieldX AST-Based SAST Engine
 *
 * Uses acorn (pure JS parser) to build an Abstract Syntax Tree from JavaScript/TypeScript
 * code, then performs:
 *   1. Taint analysis  — tracks user-controlled data flowing to dangerous sinks
 *   2. Pattern matching — detects insecure code patterns at the structural level
 *   3. Dataflow tracing — follows variable assignments across scopes
 *
 * Key advantage over regex: understands code structure, variable flow, and function calls.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const acorn = require("acorn");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const acornJsx = require("acorn-jsx");

/* ── Types ── */

type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface ASTFinding {
  id: string;
  name: string;
  severity: Severity;
  confidence: "high" | "medium" | "low";
  line: number;
  column: number;
  endLine?: number;
  category: string;
  cwe: string;
  owasp: string;
  detail: string;
  evidence: string;
  dataflow?: DataflowStep[];
  remediation: string;
}

interface DataflowStep {
  line: number;
  label: string;
  code: string;
}

// AST Node type (simplified)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ASTNode = any;

/* ── Taint Sources — where user-controlled data enters ── */

const TAINT_SOURCES: { pattern: string[]; label: string }[] = [
  { pattern: ["req", "params"], label: "URL parameter" },
  { pattern: ["req", "query"], label: "query string" },
  { pattern: ["req", "body"], label: "request body" },
  { pattern: ["req", "headers"], label: "request header" },
  { pattern: ["req", "cookies"], label: "cookie" },
  { pattern: ["request", "params"], label: "URL parameter" },
  { pattern: ["request", "query"], label: "query string" },
  { pattern: ["request", "body"], label: "request body" },
  { pattern: ["request", "headers"], label: "request header" },
  { pattern: ["request", "nextUrl", "searchParams"], label: "search params" },
  { pattern: ["event", "body"], label: "event body" },
  { pattern: ["ctx", "params"], label: "context parameter" },
  { pattern: ["ctx", "query"], label: "context query" },
  { pattern: ["process", "env"], label: "environment variable" },
  { pattern: ["window", "location"], label: "window.location" },
  { pattern: ["document", "location"], label: "document.location" },
  { pattern: ["document", "URL"], label: "document.URL" },
  { pattern: ["document", "referrer"], label: "document.referrer" },
  { pattern: ["location", "hash"], label: "URL hash" },
  { pattern: ["location", "search"], label: "URL search" },
];

/* ── Dangerous Sinks — where tainted data becomes exploitable ── */

interface SinkDef {
  id: string;
  name: string;
  cwe: string;
  owasp: string;
  severity: Severity;
  category: string;
  /** Function call patterns that are dangerous */
  callPatterns: string[][];
  /** Which argument index is dangerous (0-based), -1 = any */
  argIndex: number;
  remediation: string;
}

const DANGEROUS_SINKS: SinkDef[] = [
  // SQL Injection
  {
    id: "sql-injection", name: "SQL Injection", cwe: "CWE-89", owasp: "A03:2021",
    severity: "critical", category: "Injection",
    callPatterns: [["db", "query"], ["db", "exec"], ["db", "raw"], ["pool", "query"],
      ["connection", "query"], ["connection", "execute"], ["knex", "raw"],
      ["sequelize", "query"], ["prisma", "$queryRaw"], ["prisma", "$executeRaw"],
      ["mysql", "query"], ["pg", "query"], ["client", "query"]],
    argIndex: 0,
    remediation: "Use parameterized queries or prepared statements. Never concatenate user input into SQL strings.",
  },
  // Command Injection
  {
    id: "command-injection", name: "Command Injection", cwe: "CWE-78", owasp: "A03:2021",
    severity: "critical", category: "Injection",
    callPatterns: [["child_process", "exec"], ["child_process", "execSync"],
      ["child_process", "spawn"], ["child_process", "spawnSync"],
      ["exec"], ["execSync"], ["spawn"], ["spawnSync"]],
    argIndex: 0,
    remediation: "Use child_process.execFile() with arguments array instead of exec(). Never pass user input to shell commands.",
  },
  // XSS
  {
    id: "xss-reflected", name: "Cross-Site Scripting (XSS)", cwe: "CWE-79", owasp: "A03:2021",
    severity: "high", category: "Injection",
    callPatterns: [["res", "send"], ["res", "write"], ["res", "end"],
      ["res", "json"], ["response", "send"], ["response", "write"],
      ["document", "write"], ["document", "writeln"]],
    argIndex: 0,
    remediation: "Sanitize all user input before including in responses. Use DOMPurify for HTML, and rely on framework auto-escaping (React JSX, Handlebars).",
  },
  // Path Traversal
  {
    id: "path-traversal", name: "Path Traversal", cwe: "CWE-22", owasp: "A01:2021",
    severity: "high", category: "Access Control",
    callPatterns: [["fs", "readFile"], ["fs", "readFileSync"], ["fs", "writeFile"],
      ["fs", "writeFileSync"], ["fs", "createReadStream"], ["fs", "createWriteStream"],
      ["fs", "unlink"], ["fs", "unlinkSync"], ["fs", "access"], ["fs", "accessSync"],
      ["fs", "stat"], ["fs", "statSync"], ["fs", "readdir"], ["fs", "readdirSync"],
      ["path", "join"], ["path", "resolve"]],
    argIndex: 0,
    remediation: "Validate and sanitize file paths. Use path.resolve() and verify the resolved path stays within the allowed base directory.",
  },
  // SSRF
  {
    id: "ssrf", name: "Server-Side Request Forgery (SSRF)", cwe: "CWE-918", owasp: "A10:2021",
    severity: "high", category: "SSRF",
    callPatterns: [["fetch"], ["axios", "get"], ["axios", "post"], ["axios", "request"],
      ["http", "get"], ["http", "request"], ["https", "get"], ["https", "request"],
      ["got"], ["superagent", "get"], ["superagent", "post"], ["request"]],
    argIndex: 0,
    remediation: "Validate and allowlist URLs before making server-side requests. Block private IP ranges and cloud metadata endpoints.",
  },
  // Unsafe Deserialization
  {
    id: "unsafe-deserialization", name: "Unsafe Deserialization", cwe: "CWE-502", owasp: "A08:2021",
    severity: "high", category: "Deserialization",
    callPatterns: [["JSON", "parse"], ["yaml", "load"], ["yaml", "safeLoad"],
      ["unserialize"], ["deserialize"]],
    argIndex: 0,
    remediation: "Validate and schema-check deserialized data. Use JSON Schema validation after parsing. Avoid deserializing untrusted data with yaml.load() — use yaml.safeLoad().",
  },
  // Eval Injection
  {
    id: "eval-injection", name: "Code Injection via eval()", cwe: "CWE-95", owasp: "A03:2021",
    severity: "critical", category: "Injection",
    callPatterns: [["eval"], ["Function"], ["setTimeout"], ["setInterval"]],
    argIndex: 0,
    remediation: "Never pass user-controlled data to eval(), new Function(), setTimeout(string), or setInterval(string). Use safer alternatives.",
  },
  // NoSQL Injection
  {
    id: "nosql-injection", name: "NoSQL Injection", cwe: "CWE-943", owasp: "A03:2021",
    severity: "high", category: "Injection",
    callPatterns: [["find"], ["findOne"], ["findById"],
      ["updateOne"], ["updateMany"], ["deleteOne"], ["deleteMany"],
      ["aggregate"], ["countDocuments"]],
    argIndex: 0,
    remediation: "Sanitize user input before using in MongoDB queries. Use mongoose schema validation. Reject objects with $ operators from user input.",
  },
  // Log Injection
  {
    id: "log-injection", name: "Log Injection", cwe: "CWE-117", owasp: "A09:2021",
    severity: "medium", category: "Logging",
    callPatterns: [["console", "log"], ["console", "error"], ["console", "warn"],
      ["logger", "info"], ["logger", "warn"], ["logger", "error"],
      ["log", "info"], ["log", "warn"], ["log", "error"]],
    argIndex: -1,
    remediation: "Sanitize user input before logging. Strip newlines and control characters to prevent log forging.",
  },
  // Open Redirect
  {
    id: "open-redirect", name: "Open Redirect", cwe: "CWE-601", owasp: "A01:2021",
    severity: "medium", category: "Access Control",
    callPatterns: [["res", "redirect"], ["response", "redirect"],
      ["router", "push"], ["router", "replace"],
      ["window", "location", "assign"], ["window", "location", "replace"]],
    argIndex: 0,
    remediation: "Validate redirect URLs against an allowlist. Reject absolute URLs or URLs with different domains.",
  },
];

/* ── Insecure Pattern Checks (non-taint, structural) ── */

interface PatternCheck {
  id: string;
  name: string;
  cwe: string;
  owasp: string;
  severity: Severity;
  category: string;
  detect: (node: ASTNode, code: string, lines: string[]) => PatternMatch | null;
  remediation: string;
}

interface PatternMatch {
  line: number;
  column: number;
  evidence: string;
  detail: string;
  confidence: "high" | "medium" | "low";
}

function getNodeLine(node: ASTNode, code: string): number {
  if (!node || node.start == null) return 0;
  return code.substring(0, node.start).split("\n").length;
}

function getNodeColumn(node: ASTNode, code: string): number {
  if (!node || node.start == null) return 0;
  const before = code.substring(0, node.start);
  const lastNewline = before.lastIndexOf("\n");
  return node.start - lastNewline;
}

function getCodeSnippet(lines: string[], line: number): string {
  if (line <= 0 || line > lines.length) return "";
  return lines[line - 1].trim();
}

const PATTERN_CHECKS: PatternCheck[] = [
  // Eval usage
  {
    id: "eval-usage", name: "eval() Usage Detected", cwe: "CWE-95", owasp: "A03:2021",
    severity: "high", category: "Code Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const callee = node.callee;
        if (callee.type === "Identifier" && callee.name === "eval") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "eval() executes arbitrary code. If any argument is user-controlled, this creates a code injection vulnerability.",
            confidence: "high",
          };
        }
        // new Function(...)
        if (callee.type === "Identifier" && callee.name === "Function" && node.arguments.length > 0) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "new Function() constructor compiles and executes code from a string — equivalent to eval().",
            confidence: "high",
          };
        }
      }
      return null;
    },
    remediation: "Remove eval(). Use JSON.parse() for data, or safe alternatives. If dynamic code is truly needed, use a sandboxed VM.",
  },
  // Weak crypto
  {
    id: "weak-crypto", name: "Weak Cryptographic Algorithm", cwe: "CWE-327", owasp: "A02:2021",
    severity: "high", category: "Cryptography",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee.type === "MemberExpression") {
        const obj = node.callee.object;
        const prop = node.callee.property;
        if (obj.name === "crypto" && (prop.name === "createHash" || prop.value === "createHash")) {
          const arg = node.arguments[0];
          if (arg && arg.type === "Literal" && typeof arg.value === "string") {
            const algo = arg.value.toLowerCase();
            if (algo === "md5" || algo === "sha1") {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: `${arg.value.toUpperCase()} is cryptographically broken. Collisions are practical for MD5, and SHA-1 is deprecated for security purposes.`,
                confidence: "high",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Use SHA-256 or SHA-3 for hashing. For passwords, use bcrypt, scrypt, or Argon2. Never use MD5 or SHA-1 for security.",
  },
  // Hardcoded JWT secret
  {
    id: "hardcoded-jwt-secret", name: "Hardcoded JWT Secret", cwe: "CWE-798", owasp: "A07:2021",
    severity: "critical", category: "Secrets",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee.type === "MemberExpression") {
        const prop = node.callee.property;
        if (prop.name === "sign" || prop.name === "verify") {
          // jwt.sign(payload, SECRET, options) — check if SECRET is a string literal
          const secretArg = node.arguments[1];
          if (secretArg && secretArg.type === "Literal" && typeof secretArg.value === "string" && secretArg.value.length >= 4) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: `JWT signing/verification uses a hardcoded secret "${secretArg.value.slice(0, 4)}...". This key can be extracted from source code.`,
              confidence: "high",
            };
          }
        }
      }
      return null;
    },
    remediation: "Store JWT secrets in environment variables (process.env.JWT_SECRET). Rotate secrets periodically. Use asymmetric keys (RS256) for production.",
  },
  // prototype pollution
  {
    id: "prototype-pollution", name: "Potential Prototype Pollution", cwe: "CWE-1321", owasp: "A03:2021",
    severity: "high", category: "Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      // Detect Object.assign({}, userInput) or _.merge({}, userInput)
      if (node.type === "CallExpression") {
        const callee = node.callee;
        if (callee.type === "MemberExpression") {
          const obj = callee.object;
          const prop = callee.property;
          // Object.assign
          if (obj.name === "Object" && (prop.name === "assign" || prop.value === "assign")) {
            if (node.arguments.length >= 2) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: "Object.assign() with external input can allow prototype pollution. An attacker can inject __proto__ or constructor.prototype properties.",
                confidence: "medium",
              };
            }
          }
          // _.merge, _.defaultsDeep, lodash merge
          if ((prop.name === "merge" || prop.name === "defaultsDeep" || prop.name === "extend") &&
              (obj.name === "_" || obj.name === "lodash" || obj.name === "underscore")) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: `${obj.name}.${prop.name}() performs deep recursive merge which is vulnerable to prototype pollution.`,
              confidence: "high",
            };
          }
        }
      }
      return null;
    },
    remediation: "Use Object.create(null) as base objects. Validate input keys — reject __proto__, constructor, prototype. Use libraries with prototype pollution protection.",
  },
  // dangerouslySetInnerHTML
  {
    id: "dangerous-innerhtml", name: "dangerouslySetInnerHTML / innerHTML", cwe: "CWE-79", owasp: "A03:2021",
    severity: "high", category: "XSS",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      // React: dangerouslySetInnerHTML
      if (node.type === "JSXAttribute" || node.type === "Property") {
        const key = node.name?.name || node.key?.name || node.key?.value;
        if (key === "dangerouslySetInnerHTML") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "dangerouslySetInnerHTML bypasses React's XSS protection. If the HTML contains user input, it creates a stored/reflected XSS vulnerability.",
            confidence: "high",
          };
        }
      }
      // .innerHTML assignment
      if (node.type === "AssignmentExpression" && node.left?.type === "MemberExpression") {
        const prop = node.left.property;
        if (prop?.name === "innerHTML" || prop?.value === "innerHTML") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "Setting innerHTML directly can introduce XSS if the value contains user-controlled data.",
            confidence: "high",
          };
        }
      }
      return null;
    },
    remediation: "Use textContent instead of innerHTML. In React, use JSX automatic escaping. If raw HTML is required, sanitize with DOMPurify first.",
  },
  // Insecure cookie
  {
    id: "insecure-cookie", name: "Insecure Cookie Configuration", cwe: "CWE-614", owasp: "A05:2021",
    severity: "medium", category: "Session Management",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      // res.cookie("name", value, { secure: false }) or missing httpOnly
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const prop = node.callee.property;
        if (prop?.name === "cookie" && node.arguments.length >= 3) {
          const options = node.arguments[2];
          if (options?.type === "ObjectExpression") {
            for (const p of options.properties || []) {
              const key = p.key?.name || p.key?.value;
              if (key === "secure" && p.value?.value === false) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: "Cookie set with secure: false — will be sent over unencrypted HTTP connections.",
                  confidence: "high",
                };
              }
              if (key === "httpOnly" && p.value?.value === false) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: "Cookie set with httpOnly: false — accessible to JavaScript, vulnerable to XSS-based session theft.",
                  confidence: "high",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Set cookies with: { secure: true, httpOnly: true, sameSite: 'strict' }. Use express-session or next-auth for session management.",
  },
  // Timing-safe comparison
  {
    id: "timing-attack", name: "Timing-Unsafe Comparison", cwe: "CWE-208", owasp: "A02:2021",
    severity: "medium", category: "Cryptography",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      // if (token === secret) or if (apiKey == storedKey)
      if (node.type === "BinaryExpression" && (node.operator === "===" || node.operator === "==")) {
        const leftName = resolveIdentifierName(node.left);
        const rightName = resolveIdentifierName(node.right);
        const secretWords = ["token", "secret", "key", "password", "hash", "apikey", "api_key", "signature", "hmac", "digest"];
        const leftMatch = secretWords.some(w => leftName.toLowerCase().includes(w));
        const rightMatch = secretWords.some(w => rightName.toLowerCase().includes(w));
        if (leftMatch || rightMatch) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: `String comparison of "${leftMatch ? leftName : rightName}" with === is vulnerable to timing attacks. The comparison short-circuits on first differing byte.`,
            confidence: "medium",
          };
        }
      }
      return null;
    },
    remediation: "Use crypto.timingSafeEqual() for comparing secrets, tokens, HMACs, and API keys. This ensures constant-time comparison.",
  },
  // Missing rate limiting on auth
  {
    id: "no-rate-limit", name: "Authentication Without Rate Limiting", cwe: "CWE-307", owasp: "A07:2021",
    severity: "medium", category: "Authentication",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      // Look for login/auth endpoints: app.post("/login", ...) or router.post("/auth", ...)
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name;
        if (method === "post" && node.arguments.length >= 2) {
          const pathArg = node.arguments[0];
          if (pathArg?.type === "Literal" && typeof pathArg.value === "string") {
            const path = pathArg.value.toLowerCase();
            if (path.includes("login") || path.includes("auth") || path.includes("signin") || path.includes("sign-in")) {
              // Check handler chain for rate limiter
              const handlers = node.arguments.slice(1);
              const hasRateLimiter = handlers.some((h: ASTNode) => {
                const name = h.name || h.callee?.name || "";
                return name.toLowerCase().includes("ratelimit") || name.toLowerCase().includes("limiter") || name.toLowerCase().includes("throttle");
              });
              if (!hasRateLimiter) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: `Authentication endpoint "${pathArg.value}" has no visible rate limiting middleware — vulnerable to brute-force attacks.`,
                  confidence: "medium",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Add rate limiting middleware: const limiter = rateLimit({ windowMs: 15*60*1000, max: 5 }); app.post('/login', limiter, handler);",
  },
  // Regex DoS
  {
    id: "regex-dos", name: "Potential ReDoS (Regex DoS)", cwe: "CWE-1333", owasp: "A06:2021",
    severity: "medium", category: "Denial of Service",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      // new RegExp(userInput) — dynamic regex from user input
      if (node.type === "NewExpression" && node.callee?.name === "RegExp" && node.arguments.length > 0) {
        const arg = node.arguments[0];
        if (arg.type === "Identifier") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: `new RegExp(${arg.name}) — if "${arg.name}" is user-controlled, an attacker can provide a catastrophic backtracking pattern that freezes the event loop.`,
            confidence: "medium",
          };
        }
      }
      return null;
    },
    remediation: "Never create RegExp from user input. If dynamic regex is needed, use a safe regex library like 'safe-regex' or 're2' (linear-time engine).",
  },
  // CORS wildcard with credentials
  {
    id: "cors-misconfiguration", name: "CORS Misconfiguration", cwe: "CWE-942", owasp: "A05:2021",
    severity: "high", category: "Access Control",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      // cors({ origin: "*", credentials: true }) or cors({ origin: true })
      if (node.type === "CallExpression") {
        const callee = node.callee;
        if (callee.type === "Identifier" && callee.name === "cors" && node.arguments.length > 0) {
          const opts = node.arguments[0];
          if (opts?.type === "ObjectExpression") {
            let originValue: string | boolean | null = null;
            let credentialsValue: boolean | null = null;
            for (const p of opts.properties || []) {
              const key = p.key?.name || p.key?.value;
              if (key === "origin") {
                if (p.value?.type === "Literal") originValue = p.value.value;
              }
              if (key === "credentials") {
                if (p.value?.type === "Literal") credentialsValue = p.value.value;
              }
            }
            if (originValue === "*" || originValue === true) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: credentialsValue
                  ? "CORS allows all origins with credentials — critically insecure. Any website can make authenticated requests."
                  : "CORS allows all origins (*). Restrict to specific trusted domains.",
                confidence: credentialsValue ? "high" : "medium",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Configure CORS with specific origins: cors({ origin: ['https://yourdomain.com'], credentials: true }). Never use wildcard with credentials.",
  },
];

/* ── AST Helpers ── */

function resolveIdentifierName(node: ASTNode): string {
  if (!node) return "";
  if (node.type === "Identifier") return node.name;
  if (node.type === "MemberExpression") {
    const obj = resolveIdentifierName(node.object);
    const prop = node.property?.name || node.property?.value || "";
    return obj ? `${obj}.${prop}` : String(prop);
  }
  return "";
}

function resolveMemberChain(node: ASTNode): string[] {
  const parts: string[] = [];
  let current = node;
  while (current) {
    if (current.type === "Identifier") {
      parts.unshift(current.name);
      break;
    }
    if (current.type === "MemberExpression") {
      const prop = current.property?.name || current.property?.value;
      if (prop) parts.unshift(String(prop));
      current = current.object;
    } else {
      break;
    }
  }
  return parts;
}

// Check if a node is user-controlled based on taint sources
function isTaintSource(node: ASTNode): { tainted: boolean; label: string } {
  const chain = resolveMemberChain(node);
  if (chain.length === 0) return { tainted: false, label: "" };

  for (const source of TAINT_SOURCES) {
    if (chain.length >= source.pattern.length) {
      const matches = source.pattern.every((part, i) => chain[i] === part);
      if (matches) return { tainted: true, label: source.label };
    }
  }
  return { tainted: false, label: "" };
}

// Check if a call expression matches a dangerous sink
function matchesSink(callNode: ASTNode): SinkDef | null {
  if (callNode.type !== "CallExpression") return null;
  const chain = resolveMemberChain(callNode.callee);
  if (chain.length === 0) return null;

  for (const sink of DANGEROUS_SINKS) {
    for (const pattern of sink.callPatterns) {
      if (chain.length >= pattern.length) {
        const endSlice = chain.slice(chain.length - pattern.length);
        if (pattern.every((p, i) => endSlice[i] === p)) {
          return sink;
        }
      }
    }
  }
  return null;
}

/* ── Taint Tracker ── */

interface TaintInfo {
  label: string;
  sourceLine: number;
  sourceCode: string;
}

class TaintTracker {
  private taintedVars = new Map<string, TaintInfo>();

  markTainted(varName: string, info: TaintInfo) {
    this.taintedVars.set(varName, info);
  }

  isTainted(node: ASTNode): TaintInfo | null {
    if (node.type === "Identifier") {
      return this.taintedVars.get(node.name) || null;
    }
    if (node.type === "MemberExpression") {
      // Check full chain first
      const fullName = resolveIdentifierName(node);
      if (this.taintedVars.has(fullName)) return this.taintedVars.get(fullName)!;
      // Check root object
      const root = node.object;
      if (root?.type === "Identifier" && this.taintedVars.has(root.name)) {
        return this.taintedVars.get(root.name)!;
      }
    }
    // Template literal with tainted expressions
    if (node.type === "TemplateLiteral") {
      for (const expr of node.expressions || []) {
        const t = this.isTainted(expr);
        if (t) return t;
      }
    }
    // Binary expression (string concatenation)
    if (node.type === "BinaryExpression" && node.operator === "+") {
      return this.isTainted(node.left) || this.isTainted(node.right);
    }
    // Conditional expression
    if (node.type === "ConditionalExpression") {
      return this.isTainted(node.consequent) || this.isTainted(node.alternate);
    }
    return null;
  }

  // Propagate taint through assignments
  processAssignment(left: ASTNode, right: ASTNode, code: string, lines: string[]) {
    if (left.type !== "Identifier") return;
    // Check direct taint source
    const source = isTaintSource(right);
    if (source.tainted) {
      const line = getNodeLine(left, code);
      this.markTainted(left.name, {
        label: source.label,
        sourceLine: line,
        sourceCode: getCodeSnippet(lines, line),
      });
      return;
    }
    // Propagate existing taint
    const existing = this.isTainted(right);
    if (existing) {
      this.markTainted(left.name, existing);
    }
  }
}

/* ── AST Walker ── */

function walkAST(node: ASTNode, visitor: (n: ASTNode) => void) {
  if (!node || typeof node !== "object") return;
  visitor(node);

  for (const key of Object.keys(node)) {
    if (key === "start" || key === "end" || key === "type") continue;
    const child = node[key];
    if (Array.isArray(child)) {
      for (const c of child) {
        if (c && typeof c === "object" && c.type) walkAST(c, visitor);
      }
    } else if (child && typeof child === "object" && child.type) {
      walkAST(child, visitor);
    }
  }
}

/* ── Parse Code ── */

function parseCode(code: string): ASTNode | null {
  // Strip TypeScript type annotations (basic) so acorn can parse
  const cleaned = stripTypeAnnotations(code);

  const parser = acorn.Parser.extend(acornJsx());

  try {
    return parser.parse(cleaned, {
      ecmaVersion: "latest",
      sourceType: "module",
      allowImportExportEverywhere: true,
      allowAwaitOutsideFunction: true,
      allowReturnOutsideFunction: true,
      allowHashBang: true,
      locations: false,
    });
  } catch {
    // Try as script
    try {
      return parser.parse(cleaned, {
        ecmaVersion: "latest",
        sourceType: "script",
        allowImportExportEverywhere: true,
        allowAwaitOutsideFunction: true,
        allowReturnOutsideFunction: true,
        allowHashBang: true,
      });
    } catch {
      return null;
    }
  }
}

/**
 * Minimally strip TypeScript syntax that acorn can't handle.
 * Preserves line numbers so findings map back to the original code.
 */
function stripTypeAnnotations(code: string): string {
  let result = code;

  // Remove: variable: Type, param: Type
  result = result.replace(/:\s*(?:string|number|boolean|any|void|never|unknown|null|undefined|object|symbol|bigint)(?:\[\])?(?:\s*\|[^=,)}\n]+)?/g, "");

  // Remove interface/type blocks (replace with same number of newlines)
  result = result.replace(/(?:export\s+)?(?:interface|type)\s+\w+(?:<[^>]*>)?\s*(?:extends\s+[^{]+)?\{[\s\S]*?\}/g,
    (match) => "\n".repeat((match.match(/\n/g) || []).length));

  // Remove generic type params: <T>, <T extends X>
  result = result.replace(/<(?:[A-Z]\w*(?:\s+extends\s+[^>]+)?)(?:,\s*[A-Z]\w*(?:\s+extends\s+[^>]+)?)*>/g, "");

  // Remove "as Type" casts
  result = result.replace(/\s+as\s+\w+(?:\[\])?/g, "");

  // Remove non-null assertion: foo!.bar -> foo.bar
  result = result.replace(/!(\.|;|\s|\)|\]|\,)/g, "$1");

  // Remove access modifiers
  result = result.replace(/\b(private|protected|public|readonly|abstract|declare|override)\s+/g, "");

  // Remove enum blocks
  result = result.replace(/(?:export\s+)?(?:const\s+)?enum\s+\w+\s*\{[\s\S]*?\}/g,
    (match) => "\n".repeat((match.match(/\n/g) || []).length));

  return result;
}

/* ── Main Analysis Function ── */

export function analyzeCode(code: string): {
  findings: ASTFinding[];
  stats: { critical: number; high: number; medium: number; low: number; total: number };
  astParsed: boolean;
  linesAnalyzed: number;
  checksPerformed: number;
} {
  const lines = code.split("\n");
  const findings: ASTFinding[] = [];
  const ast = parseCode(code);

  if (!ast) {
    // AST parsing failed — return minimal info
    return {
      findings: [],
      stats: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
      astParsed: false,
      linesAnalyzed: lines.length,
      checksPerformed: 0,
    };
  }

  const tracker = new TaintTracker();
  const seenFindings = new Set<string>();

  function addFinding(f: ASTFinding) {
    const key = `${f.id}:${f.line}`;
    if (seenFindings.has(key)) return;
    seenFindings.add(key);
    findings.push(f);
  }

  // Phase 1: Walk AST to build taint map
  walkAST(ast, (node) => {
    // Variable declarations: const x = req.body.name
    if (node.type === "VariableDeclarator" && node.init) {
      if (node.id?.type === "Identifier") {
        tracker.processAssignment(node.id, node.init, code, lines);
      }
      // Destructuring: const { name } = req.body
      if (node.id?.type === "ObjectPattern" && node.init) {
        const initTaint = isTaintSource(node.init);
        const existingTaint = tracker.isTainted(node.init);
        if (initTaint.tainted || existingTaint) {
          for (const prop of node.id.properties || []) {
            const key = prop.value?.name || prop.key?.name;
            if (key) {
              tracker.markTainted(key, existingTaint || {
                label: initTaint.label,
                sourceLine: getNodeLine(node, code),
                sourceCode: getCodeSnippet(lines, getNodeLine(node, code)),
              });
            }
          }
        }
      }
    }

    // Assignments: x = req.query.id
    if (node.type === "AssignmentExpression") {
      tracker.processAssignment(node.left, node.right, code, lines);
    }

    // Function params that are destructured from taint: function handler(req, res)
    if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") {
      for (const param of node.params || []) {
        if (param.type === "Identifier") {
          const name = param.name;
          if (name === "req" || name === "request" || name === "ctx" || name === "event") {
            // Mark the param as a taint root
            tracker.markTainted(name, {
              label: `${name} parameter`,
              sourceLine: getNodeLine(param, code),
              sourceCode: getCodeSnippet(lines, getNodeLine(param, code)),
            });
          }
        }
      }
    }
  });

  // Phase 2: Walk AST to detect tainted data flowing to sinks
  walkAST(ast, (node) => {
    if (node.type !== "CallExpression") return;

    const sink = matchesSink(node);
    if (!sink) return;

    const argsToCheck = sink.argIndex === -1
      ? node.arguments
      : node.arguments[sink.argIndex] ? [node.arguments[sink.argIndex]] : [];

    for (const arg of argsToCheck) {
      // Check direct taint source
      const directTaint = isTaintSource(arg);
      // Check tracked taint
      const trackedTaint = tracker.isTainted(arg);
      const taintInfo = directTaint.tainted
        ? { label: directTaint.label, sourceLine: getNodeLine(arg, code), sourceCode: getCodeSnippet(lines, getNodeLine(arg, code)) }
        : trackedTaint;

      if (taintInfo) {
        const sinkLine = getNodeLine(node, code);
        const sinkCode = getCodeSnippet(lines, sinkLine);
        const callName = resolveIdentifierName(node.callee);

        const dataflow: DataflowStep[] = [
          { line: taintInfo.sourceLine, label: `Source: ${taintInfo.label}`, code: taintInfo.sourceCode },
        ];
        if (sinkLine !== taintInfo.sourceLine) {
          dataflow.push({ line: sinkLine, label: `Sink: ${callName}()`, code: sinkCode });
        }

        addFinding({
          id: sink.id,
          name: sink.name,
          severity: sink.severity,
          confidence: directTaint.tainted ? "high" : "medium",
          line: sinkLine,
          column: getNodeColumn(node, code),
          category: sink.category,
          cwe: sink.cwe,
          owasp: sink.owasp,
          detail: `User-controlled data (${taintInfo.label}) flows to ${callName}() without sanitization.`,
          evidence: sinkCode,
          dataflow,
          remediation: sink.remediation,
        });
      }
    }
  });

  // Phase 3: Pattern-based checks
  walkAST(ast, (node) => {
    for (const check of PATTERN_CHECKS) {
      const match = check.detect(node, code, lines);
      if (match) {
        addFinding({
          id: check.id,
          name: check.name,
          severity: check.severity,
          confidence: match.confidence,
          line: match.line,
          column: match.column,
          category: check.category,
          cwe: check.cwe,
          owasp: check.owasp,
          detail: match.detail,
          evidence: match.evidence,
          remediation: check.remediation,
        });
      }
    }
  });

  // Sort by severity
  const order: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  findings.sort((a, b) => order[a.severity] - order[b.severity] || a.line - b.line);

  const stats = {
    critical: findings.filter(f => f.severity === "critical").length,
    high: findings.filter(f => f.severity === "high").length,
    medium: findings.filter(f => f.severity === "medium").length,
    low: findings.filter(f => f.severity === "low").length,
    total: findings.length,
  };

  return {
    findings,
    stats,
    astParsed: true,
    linesAnalyzed: lines.length,
    checksPerformed: DANGEROUS_SINKS.length + PATTERN_CHECKS.length,
  };
}

/* ── Demo Code ── */

export const SAST_DEMO_CODE = `const express = require("express");
const { Pool } = require("pg");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { exec } = require("child_process");
const fs = require("fs");
const _ = require("lodash");
const cors = require("cors");

const app = express();
const pool = new Pool();

// CORS: wildcard with credentials
app.use(cors({ origin: "*", credentials: true }));

// No rate limiter on login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  // Timing-unsafe comparison
  const storedHash = await getHash(username);
  if (password === storedHash) {
    // Hardcoded JWT secret
    const token = jwt.sign({ user: username }, "my-super-secret-key-123");
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid" });
  }
});

// SQL Injection
app.get("/api/users", async (req, res) => {
  const userId = req.query.id;
  const result = await pool.query("SELECT * FROM users WHERE id = " + userId);
  res.json(result.rows);
});

// Command Injection
app.get("/api/ping", (req, res) => {
  const host = req.query.host;
  exec("ping -c 1 " + host, (err, stdout) => {
    res.send(stdout);
  });
});

// Path Traversal
app.get("/api/files", (req, res) => {
  const filename = req.query.name;
  const content = fs.readFileSync("/uploads/" + filename, "utf8");
  res.send(content);
});

// SSRF
app.get("/api/proxy", async (req, res) => {
  const url = req.query.url;
  const data = await fetch(url);
  res.json(await data.json());
});

// XSS - reflected
app.get("/api/search", (req, res) => {
  const query = req.query.q;
  res.send("<h1>Results for: " + query + "</h1>");
});

// Weak crypto
function hashPassword(pwd) {
  return crypto.createHash("md5").update(pwd).digest("hex");
}

// Prototype Pollution
app.post("/api/settings", (req, res) => {
  const userSettings = req.body;
  const config = _.merge({}, defaultConfig, userSettings);
  res.json(config);
});

// Regex DoS
app.get("/api/search-advanced", (req, res) => {
  const pattern = req.query.regex;
  const re = new RegExp(pattern);
  const results = data.filter(item => re.test(item));
  res.json(results);
});

// eval with user input
app.post("/api/calc", (req, res) => {
  const expr = req.body.expression;
  const result = eval(expr);
  res.json({ result });
});

// NoSQL Injection
app.get("/api/profile", async (req, res) => {
  const filter = req.query.filter;
  const user = await User.findOne(filter);
  res.json(user);
});

app.listen(3000);
`;
