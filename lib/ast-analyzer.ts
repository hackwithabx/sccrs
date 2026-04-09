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
  codeSnippet?: { lineNum: number; code: string; isHighlighted: boolean }[];
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
  // Express / Connect / Koa / Hapi — server-side request objects
  { pattern: ["req", "params"], label: "URL parameter" },
  { pattern: ["req", "query"], label: "query string" },
  { pattern: ["req", "body"], label: "request body" },
  { pattern: ["req", "headers"], label: "request header" },
  { pattern: ["req", "cookies"], label: "cookie" },
  { pattern: ["req", "files"], label: "uploaded file" },
  { pattern: ["req", "file"], label: "uploaded file" },
  { pattern: ["req", "hostname"], label: "request hostname" },
  { pattern: ["req", "ip"], label: "client IP" },
  { pattern: ["req", "path"], label: "request path" },
  { pattern: ["req", "url"], label: "request URL" },
  { pattern: ["req", "originalUrl"], label: "original URL" },
  { pattern: ["req", "baseUrl"], label: "base URL" },
  { pattern: ["req", "protocol"], label: "request protocol" },
  { pattern: ["req", "subdomains"], label: "subdomains" },
  { pattern: ["request", "params"], label: "URL parameter" },
  { pattern: ["request", "query"], label: "query string" },
  { pattern: ["request", "body"], label: "request body" },
  { pattern: ["request", "headers"], label: "request header" },
  { pattern: ["request", "nextUrl", "searchParams"], label: "search params" },
  { pattern: ["request", "url"], label: "request URL" },
  { pattern: ["request", "formData"], label: "form data" },
  { pattern: ["request", "json"], label: "request JSON body" },
  { pattern: ["request", "text"], label: "request text body" },
  // Event-driven / serverless
  { pattern: ["event", "body"], label: "event body" },
  { pattern: ["event", "queryStringParameters"], label: "event query params" },
  { pattern: ["event", "pathParameters"], label: "event path params" },
  { pattern: ["event", "headers"], label: "event headers" },
  { pattern: ["event", "data"], label: "event data (postMessage/WebSocket)" },
  // Koa
  { pattern: ["ctx", "params"], label: "context parameter" },
  { pattern: ["ctx", "query"], label: "context query" },
  { pattern: ["ctx", "request", "body"], label: "context request body" },
  { pattern: ["ctx", "headers"], label: "context headers" },
  // Environment (lower risk but still external)
  { pattern: ["process", "env"], label: "environment variable" },
  { pattern: ["process", "argv"], label: "command-line argument" },
  { pattern: ["process", "stdin"], label: "standard input" },
  // Client-side DOM APIs
  { pattern: ["window", "location"], label: "window.location" },
  { pattern: ["window", "name"], label: "window.name" },
  { pattern: ["document", "location"], label: "document.location" },
  { pattern: ["document", "URL"], label: "document.URL" },
  { pattern: ["document", "referrer"], label: "document.referrer" },
  { pattern: ["document", "cookie"], label: "document.cookie" },
  { pattern: ["document", "documentURI"], label: "document.documentURI" },
  { pattern: ["location", "hash"], label: "URL hash" },
  { pattern: ["location", "search"], label: "URL search" },
  { pattern: ["location", "href"], label: "location.href" },
  { pattern: ["location", "pathname"], label: "location.pathname" },
  // Web APIs
  { pattern: ["localStorage", "getItem"], label: "localStorage" },
  { pattern: ["sessionStorage", "getItem"], label: "sessionStorage" },
  // URLSearchParams
  { pattern: ["searchParams", "get"], label: "URL search param" },
  { pattern: ["searchParams", "getAll"], label: "URL search params" },
  // Next.js App Router sources
  { pattern: ["params"], label: "Next.js route parameter" },
  { pattern: ["searchParams"], label: "Next.js search params" },
  { pattern: ["cookies", "get"], label: "Next.js cookie" },
  { pattern: ["headers", "get"], label: "Next.js header" },
  { pattern: ["formData", "get"], label: "form data field" },
  { pattern: ["formData", "getAll"], label: "form data fields" },
  // GraphQL resolvers
  { pattern: ["args"], label: "GraphQL argument" },
  { pattern: ["input"], label: "GraphQL input" },
  { pattern: ["context", "req", "body"], label: "GraphQL context body" },
  // WebSocket
  { pattern: ["message", "data"], label: "WebSocket message data" },
  { pattern: ["ws", "on"], label: "WebSocket event" },
  // File/Stream sources
  { pattern: ["readStream", "on"], label: "read stream data" },
  { pattern: ["readable", "read"], label: "readable stream" },
];

/* ── Known Sanitizers — functions that neutralize tainted data ── */

interface SanitizerDef {
  /** Call patterns that identify the sanitizer (e.g., ["DOMPurify", "sanitize"]) */
  pattern: string[];
  /** Which vulnerability category(s) this sanitizer mitigates */
  mitigates: Set<string>;
}

const KNOWN_SANITIZERS: SanitizerDef[] = [
  // XSS sanitizers
  { pattern: ["DOMPurify", "sanitize"],  mitigates: new Set(["xss-reflected", "dangerous-innerhtml"]) },
  { pattern: ["sanitizeHtml"],           mitigates: new Set(["xss-reflected", "dangerous-innerhtml"]) },
  { pattern: ["he", "encode"],           mitigates: new Set(["xss-reflected"]) },
  { pattern: ["escapeHtml"],             mitigates: new Set(["xss-reflected"]) },
  { pattern: ["xss"],                    mitigates: new Set(["xss-reflected"]) },
  { pattern: ["validator", "escape"],    mitigates: new Set(["xss-reflected"]) },
  { pattern: ["encodeURIComponent"],     mitigates: new Set(["xss-reflected", "open-redirect", "log-injection"]) },
  { pattern: ["encodeURI"],              mitigates: new Set(["xss-reflected", "log-injection"]) },
  { pattern: ["htmlEncode"],             mitigates: new Set(["xss-reflected"]) },
  { pattern: ["Encode", "forHtml"],      mitigates: new Set(["xss-reflected"]) },
  { pattern: ["striptags"],             mitigates: new Set(["xss-reflected"]) },
  // SQL sanitizers
  { pattern: ["escape"],                 mitigates: new Set(["sql-injection", "nosql-injection"]) },
  { pattern: ["mysql", "escape"],        mitigates: new Set(["sql-injection"]) },
  { pattern: ["pg", "escapeLiteral"],    mitigates: new Set(["sql-injection"]) },
  { pattern: ["pg", "escapeIdentifier"], mitigates: new Set(["sql-injection"]) },
  { pattern: ["sanitize"],               mitigates: new Set(["xss-reflected", "sql-injection", "nosql-injection", "log-injection"]) },
  { pattern: ["mongoSanitize"],          mitigates: new Set(["nosql-injection"]) },
  { pattern: ["mongo", "sanitize"],      mitigates: new Set(["nosql-injection"]) },
  // Path sanitizers
  { pattern: ["path", "basename"],       mitigates: new Set(["path-traversal"]) },
  // Command sanitizers
  { pattern: ["shellEscape"],            mitigates: new Set(["command-injection"]) },
  { pattern: ["shellescape"],            mitigates: new Set(["command-injection"]) },
  { pattern: ["escapeshellarg"],         mitigates: new Set(["command-injection"]) },
  // Log sanitizers
  { pattern: ["stripAnsi"],              mitigates: new Set(["log-injection"]) },
  // General validation
  { pattern: ["parseInt"],               mitigates: new Set(["sql-injection", "command-injection", "xss-reflected"]) },
  { pattern: ["Number"],                 mitigates: new Set(["sql-injection", "command-injection", "xss-reflected"]) },
  { pattern: ["parseFloat"],             mitigates: new Set(["sql-injection", "command-injection", "xss-reflected"]) },
  { pattern: ["validator", "isEmail"],   mitigates: new Set(["sql-injection", "command-injection", "xss-reflected"]) },
  { pattern: ["validator", "isURL"],     mitigates: new Set(["ssrf", "open-redirect"]) },
  { pattern: ["validator", "isInt"],     mitigates: new Set(["sql-injection", "command-injection"]) },
  { pattern: ["validator", "isAlphanumeric"], mitigates: new Set(["sql-injection", "command-injection", "xss-reflected", "path-traversal"]) },
  // Additional sanitizers
  { pattern: ["createDOMPurify"], mitigates: new Set(["xss-reflected", "dangerous-innerhtml"]) },
  { pattern: ["dompurify", "sanitize"], mitigates: new Set(["xss-reflected", "dangerous-innerhtml"]) },
  { pattern: ["xssFilters", "inHTMLData"], mitigates: new Set(["xss-reflected"]) },
  { pattern: ["xssFilters", "inHTMLComment"], mitigates: new Set(["xss-reflected"]) },
  { pattern: ["crypto", "timingSafeEqual"], mitigates: new Set(["timing-attack"]) },
  { pattern: ["bcrypt", "compare"], mitigates: new Set(["timing-attack"]) },
  { pattern: ["bcrypt", "compareSync"], mitigates: new Set(["timing-attack"]) },
  { pattern: ["argon2", "verify"], mitigates: new Set(["timing-attack"]) },
  { pattern: ["validator", "whitelist"], mitigates: new Set(["sql-injection", "command-injection", "xss-reflected"]) },
  { pattern: ["validator", "blacklist"], mitigates: new Set(["sql-injection", "xss-reflected"]) },
  { pattern: ["validator", "normalizeEmail"], mitigates: new Set(["xss-reflected"]) },
  { pattern: ["validator", "stripLow"], mitigates: new Set(["log-injection", "xss-reflected"]) },
  { pattern: ["Joi", "validate"], mitigates: new Set(["sql-injection", "command-injection", "xss-reflected", "nosql-injection"]) },
  { pattern: ["zod", "parse"], mitigates: new Set(["sql-injection", "command-injection", "xss-reflected", "nosql-injection"]) },
  { pattern: ["yup", "validate"], mitigates: new Set(["sql-injection", "command-injection", "xss-reflected", "nosql-injection"]) },
  { pattern: ["path", "normalize"], mitigates: new Set(["path-traversal"]) },
  { pattern: ["path", "basename"], mitigates: new Set(["path-traversal"]) },
  { pattern: ["slugify"], mitigates: new Set(["sql-injection", "command-injection", "xss-reflected", "path-traversal"]) },
  { pattern: ["parameterize"], mitigates: new Set(["sql-injection"]) },
  { pattern: ["escape_string"], mitigates: new Set(["sql-injection"]) },
];

/** Known input-validation functions that reduce confidence when used as a guard */
const VALIDATION_FUNCTIONS = new Set([
  "isValid", "validate", "isAllowed", "isSafe", "checkPermission", "authorize",
  "isAuthenticated", "isAuthorized", "hasPermission", "canAccess", "isWhitelisted",
  "isAllowlisted", "sanitize", "clean", "verify", "check", "assert",
  "isValidUrl", "isValidPath", "isLocalUrl", "isInternalUrl",
  "isValidEmail", "isValidId", "isValidInput", "isValidParam",
  "startsWith", "endsWith", "includes", "match", "test",
  "isUUID", "isMongoId", "isIP", "isFQDN", "isJSON",
  "isLength", "isNumeric", "isAlpha", "isAlphanumeric",
  "hasOwnProperty", "indexOf", "lastIndexOf", "search",
  "every", "some", "find", "filter",
  "parseInt", "parseFloat", "Number", "isNaN", "isFinite",
  "checkSchema", "validateAsync", "safeParse",
]);

/** Check whether a CallExpression is a known sanitizer for a specific vulnerability */
function matchesSanitizer(callNode: ASTNode, vulnId: string): boolean {
  if (callNode.type !== "CallExpression") return false;
  const chain = resolveMemberChain(callNode.callee);
  if (chain.length === 0 && callNode.callee?.type === "Identifier") {
    chain.push(callNode.callee.name);
  }
  for (const san of KNOWN_SANITIZERS) {
    if (chain.length >= san.pattern.length) {
      const endSlice = chain.slice(chain.length - san.pattern.length);
      if (san.pattern.every((p, i) => endSlice[i] === p) && san.mitigates.has(vulnId)) {
        return true;
      }
    }
  }
  return false;
}

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
    callPatterns: [["eval"], ["Function"], ["setTimeout"], ["setInterval"],
      ["vm", "runInNewContext"], ["vm", "runInThisContext"], ["vm", "runInContext"],
      ["vm", "compileFunction"], ["vm", "createScript"]],
    argIndex: 0,
    remediation: "Never pass user-controlled data to eval(), new Function(), setTimeout(string), or setInterval(string). Use safer alternatives.",
  },
  // Template Injection
  {
    id: "template-injection", name: "Server-Side Template Injection (SSTI)", cwe: "CWE-1336", owasp: "A03:2021",
    severity: "critical", category: "Injection",
    callPatterns: [["ejs", "render"], ["ejs", "renderFile"], ["ejs", "compile"],
      ["pug", "render"], ["pug", "renderFile"], ["pug", "compile"], ["pug", "compileFile"],
      ["Handlebars", "compile"], ["Handlebars", "precompile"],
      ["nunjucks", "renderString"], ["nunjucks", "compile"],
      ["mustache", "render"], ["dot", "template"]],
    argIndex: 0,
    remediation: "Never pass user input directly to template engines. Sanitize and validate template data. Use auto-escaping and avoid rendering user-controlled template strings.",
  },
  // Dynamic require / import
  {
    id: "dynamic-require", name: "Dynamic Module Loading", cwe: "CWE-95", owasp: "A03:2021",
    severity: "high", category: "Injection",
    callPatterns: [["require"]],
    argIndex: 0,
    remediation: "Never pass user-controlled input to require() or dynamic import(). Use an allowlist of permitted modules.",
  },
  // NoSQL Injection
  {
    id: "nosql-injection", name: "NoSQL Injection", cwe: "CWE-943", owasp: "A03:2021",
    severity: "high", category: "Injection",
    callPatterns: [["find"], ["findOne"], ["findById"], ["findOneAndUpdate"], ["findOneAndDelete"], ["findOneAndReplace"],
      ["updateOne"], ["updateMany"], ["deleteOne"], ["deleteMany"],
      ["aggregate"], ["countDocuments"], ["distinct"],
      ["replaceOne"], ["insertOne"], ["insertMany"],
      ["collection", "find"], ["collection", "findOne"],
      ["collection", "aggregate"], ["collection", "updateOne"]],
    argIndex: 0,
    remediation: "Sanitize user input before using in MongoDB queries. Use mongoose schema validation. Reject objects with $ operators from user input.",
  },
  // LDAP Injection
  {
    id: "ldap-injection", name: "LDAP Injection", cwe: "CWE-90", owasp: "A03:2021",
    severity: "high", category: "Injection",
    callPatterns: [["ldap", "search"], ["ldapClient", "search"], ["client", "search"],
      ["ldap", "bind"], ["ldapClient", "bind"]],
    argIndex: 0,
    remediation: "Escape special LDAP characters (*, (, ), \\, NUL) in user input. Use parameterized LDAP queries.",
  },
  // Header Injection
  {
    id: "header-injection", name: "HTTP Header Injection", cwe: "CWE-113", owasp: "A03:2021",
    severity: "high", category: "Injection",
    callPatterns: [["res", "setHeader"], ["res", "set"], ["res", "header"],
      ["response", "setHeader"], ["response", "set"]],
    argIndex: 1,
    remediation: "Validate and sanitize header values. Strip newline characters (\\r\\n) to prevent header injection and response splitting.",
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
  // XPath Injection
  {
    id: "xpath-injection", name: "XPath Injection", cwe: "CWE-643", owasp: "A03:2021",
    severity: "high", category: "Injection",
    callPatterns: [["xpath", "select"], ["xpath", "select1"], ["xpath", "evaluate"],
      ["dom", "evaluate"], ["document", "evaluate"],
      ["xmldom", "evaluate"]],
    argIndex: 0,
    remediation: "Use parameterized XPath queries. Never concatenate user input into XPath expressions.",
  },
  // XML External Entity (XXE) via parser
  {
    id: "xxe-parser", name: "XML Parser XXE Risk", cwe: "CWE-611", owasp: "A05:2021",
    severity: "high", category: "Injection",
    callPatterns: [["xml2js", "parseString"], ["xml2js", "parseStringPromise"],
      ["DOMParser", "parseFromString"], ["xmldom", "parseFromString"],
      ["libxmljs", "parseXml"], ["libxmljs", "parseXmlString"],
      ["fast-xml-parser", "parse"], ["sax", "parser"]],
    argIndex: 0,
    remediation: "Disable external entities in XML parser configuration. Use { noent: false, dtdload: false } options.",
  },
  // GraphQL Injection
  {
    id: "graphql-injection", name: "Dynamic GraphQL Query Construction", cwe: "CWE-943", owasp: "A03:2021",
    severity: "high", category: "Injection",
    callPatterns: [["graphql"], ["graphqlHTTP"],
      ["client", "query"], ["client", "mutate"]],
    argIndex: 0,
    remediation: "Use parameterized GraphQL variables. Never concatenate user input into GraphQL query strings.",
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

function buildSnippet(lines: string[], targetLine: number, contextRadius = 3): { lineNum: number; code: string; isHighlighted: boolean }[] {
  const start = Math.max(0, targetLine - 1 - contextRadius);
  const end = Math.min(lines.length, targetLine - 1 + contextRadius + 1);
  const result: { lineNum: number; code: string; isHighlighted: boolean }[] = [];
  for (let i = start; i < end; i++) {
    result.push({ lineNum: i + 1, code: lines[i], isHighlighted: i + 1 === targetLine });
  }
  return result;
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
  // Insecure randomness
  {
    id: "insecure-random", name: "Insecure Randomness", cwe: "CWE-330", owasp: "A02:2021",
    severity: "medium", category: "Cryptography",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const obj = node.callee.object;
        const prop = node.callee.property;
        if (obj?.name === "Math" && (prop?.name === "random" || prop?.value === "random")) {
          const line = getNodeLine(node, code);
          const snippet = getCodeSnippet(lines, line);
          const securityWords = ["token", "secret", "key", "password", "session", "id", "uuid", "nonce", "salt", "otp", "code", "csrf", "random"];
          const isSecurityContext = securityWords.some(w => snippet.toLowerCase().includes(w));
          if (isSecurityContext) {
            return {
              line, column: getNodeColumn(node, code),
              evidence: snippet,
              detail: "Math.random() is not cryptographically secure. Using it for tokens, session IDs, or secrets makes them predictable.",
              confidence: "high",
            };
          }
          return {
            line, column: getNodeColumn(node, code),
            evidence: snippet,
            detail: "Math.random() is not cryptographically secure. If used for any security purpose, it is predictable.",
            confidence: "low",
          };
        }
      }
      return null;
    },
    remediation: "Use crypto.randomBytes(), crypto.randomUUID(), or crypto.getRandomValues() for security-sensitive random values.",
  },
  // Hardcoded credentials in variables
  {
    id: "hardcoded-credential", name: "Hardcoded Credential", cwe: "CWE-798", owasp: "A07:2021",
    severity: "high", category: "Secrets",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "VariableDeclarator" && node.init?.type === "Literal" && typeof node.init.value === "string") {
        const varName = node.id?.name?.toLowerCase() || "";
        const val = node.init.value;
        const secretNames = ["password", "passwd", "secret", "api_key", "apikey", "access_token", "accesstoken",
          "auth_token", "authtoken", "private_key", "privatekey", "db_password", "database_password",
          "mysql_password", "mongo_uri", "connection_string", "connectionstring", "jwt_secret", "jwtsecret",
          "encryption_key", "encryptionkey", "signing_key", "signingkey", "client_secret", "clientsecret",
          "aws_secret", "stripe_secret", "stripe_key", "sendgrid_key", "twilio_token", "slack_token",
          "github_token", "firebase_key", "database_url", "redis_url", "redis_password",
          "smtp_password", "mail_password", "ftp_password"];
        if (secretNames.some(s => varName.includes(s)) && val.length >= 4 && !val.includes("process.env") && val !== "undefined" && val !== "null" && val !== "") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: `Variable "${node.id.name}" contains a hardcoded credential. This secret can be extracted from source code or version control history.`,
            confidence: "high",
          };
        }
        // Detect API key patterns by value format, regardless of variable name
        const apiKeyPatterns = [
          { regex: /^sk[_-]live[_-]/i, label: "Stripe live secret key" },
          { regex: /^sk[_-]test[_-]/i, label: "Stripe test secret key" },
          { regex: /^pk[_-]live[_-]/i, label: "Stripe live publishable key" },
          { regex: /^rk[_-]live[_-]/i, label: "Stripe restricted key" },
          { regex: /^ghp_[a-zA-Z0-9]{36,}/, label: "GitHub personal access token" },
          { regex: /^gho_[a-zA-Z0-9]{36,}/, label: "GitHub OAuth token" },
          { regex: /^ghs_[a-zA-Z0-9]{36,}/, label: "GitHub app token" },
          { regex: /^github_pat_[a-zA-Z0-9_]{22,}/, label: "GitHub fine-grained token" },
          { regex: /^AKIA[0-9A-Z]{16}$/, label: "AWS Access Key ID" },
          { regex: /^ASIA[0-9A-Z]{16}$/, label: "AWS temporary access key" },
          { regex: /^xox[bpsa]-[0-9a-zA-Z-]+/, label: "Slack token" },
          { regex: /^SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}$/, label: "SendGrid API key" },
          { regex: /^sk-[a-zA-Z0-9]{20,}/, label: "OpenAI API key" },
          { regex: /^Bearer\s+[A-Za-z0-9\-._~+/]+=*$/i, label: "Bearer token" },
          { regex: /^eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}$/, label: "JWT token" },
          { regex: /^npm_[a-zA-Z0-9]{36,}/, label: "npm access token" },
          { regex: /^pypi-[a-zA-Z0-9_-]{50,}/, label: "PyPI API token" },
          { regex: /^AGE-SECRET-KEY-1[a-z0-9]{58}$/, label: "Age encryption key" },
          { regex: /^glpat-[a-zA-Z0-9\-_]{20,}/, label: "GitLab personal access token" },
          { regex: /^dop_v1_[a-f0-9]{64}/, label: "DigitalOcean personal access token" },
          { regex: /^-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/, label: "Private key" },
          { regex: /^[a-f0-9]{40}$/, label: "Potential hex-encoded secret (40 chars)" },
        ];
        for (const { regex, label } of apiKeyPatterns) {
          if (regex.test(val)) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: `Hardcoded ${label} detected in "${node.id?.name || "variable"}". Secrets in source code are exposed in version control.`,
              confidence: "high",
            };
          }
        }
      }
      // Also check property assignments: obj.secret = "value"
      if (node.type === "AssignmentExpression" && node.right?.type === "Literal" && typeof node.right.value === "string") {
        const propName = (node.left?.property?.name || node.left?.property?.value || "").toString().toLowerCase();
        const val = node.right.value;
        const secretProps = ["password", "secret", "apikey", "api_key", "token", "private_key", "auth"];
        if (secretProps.some(s => propName.includes(s)) && val.length >= 4 && val !== "undefined" && val !== "null") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: `Property "${propName}" assigned a hardcoded secret value. Extractable from source code.`,
            confidence: "medium",
          };
        }
      }
      return null;
    },
    remediation: "Store credentials in environment variables (process.env.*). Use a secrets manager (AWS Secrets Manager, HashiCorp Vault) for production.",
  },
  // XXE via DOMParser or xml2js
  {
    id: "xxe-vulnerability", name: "XML External Entity (XXE)", cwe: "CWE-611", owasp: "A05:2021",
    severity: "high", category: "Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "NewExpression") {
        const name = node.callee?.name;
        if (name === "DOMParser" || name === "XMLHttpRequest") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: `${name} can be vulnerable to XXE attacks if parsing untrusted XML. External entities may read local files or perform SSRF.`,
            confidence: "medium",
          };
        }
      }
      if (node.type === "CallExpression") {
        const callee = node.callee;
        if (callee?.type === "MemberExpression") {
          const objName = callee.object?.name || "";
          const propName = callee.property?.name || "";
          if ((objName === "xml2js" || objName === "parser" || objName === "xmlParser") && (propName === "parseString" || propName === "parse")) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "XML parsing without disabling external entities can lead to XXE attacks — file disclosure, SSRF, or denial of service.",
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Disable external entity processing. For xml2js, set { explicitRoot: true }. For DOMParser, sanitize input. Use libraries like fast-xml-parser with entity expansion disabled.",
  },
  // Information exposure via error details
  {
    id: "info-exposure", name: "Information Exposure via Error", cwe: "CWE-209", owasp: "A04:2021",
    severity: "medium", category: "Information Disclosure",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const obj = node.callee.object?.name || "";
        const prop = node.callee.property?.name || "";
        if ((obj === "res" || obj === "response") && (prop === "json" || prop === "send")) {
          for (const arg of node.arguments || []) {
            if (arg.type === "ObjectExpression") {
              for (const p of arg.properties || []) {
                const key = p.key?.name || p.key?.value || "";
                const keyLower = String(key).toLowerCase();
                if ((keyLower === "stack" || keyLower === "stacktrace" || keyLower === "trace") && p.value?.type === "MemberExpression") {
                  const line = getNodeLine(node, code);
                  return {
                    line, column: getNodeColumn(node, code),
                    evidence: getCodeSnippet(lines, line),
                    detail: "Sending stack traces to clients leaks internal paths, library versions, and code structure to attackers.",
                    confidence: "high",
                  };
                }
              }
            }
            // res.send(err.stack) or res.json(error.message + error.stack)
            if (arg.type === "MemberExpression") {
              const propName = arg.property?.name || "";
              if (propName === "stack" || propName === "stackTrace") {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: "Sending error stack traces to clients exposes internal implementation details.",
                  confidence: "high",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Never expose stack traces or internal error details to clients. Log them server-side and return a generic error message.",
  },
  // Unvalidated redirect
  {
    id: "unvalidated-redirect", name: "Unvalidated Redirect", cwe: "CWE-601", owasp: "A01:2021",
    severity: "medium", category: "Access Control",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "AssignmentExpression" && node.left?.type === "MemberExpression") {
        const chain = resolveIdentifierName(node.left);
        if (chain === "window.location.href" || chain === "window.location" || chain === "document.location" || chain === "document.location.href") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "Assigning user-controlled values to window.location can lead to open redirect or JavaScript injection (javascript: URLs).",
            confidence: "medium",
          };
        }
      }
      return null;
    },
    remediation: "Validate redirect URLs against an allowlist of trusted domains. Reject javascript: and data: URL schemes.",
  },
  // Disabled security (e.g., rejectUnauthorized: false)
  {
    id: "tls-verification-disabled", name: "TLS Certificate Verification Disabled", cwe: "CWE-295", owasp: "A07:2021",
    severity: "high", category: "Transport Security",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "Property" || node.type === "ObjectProperty") {
        const key = node.key?.name || node.key?.value;
        if (key === "rejectUnauthorized" && node.value?.value === false) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "TLS certificate verification is disabled (rejectUnauthorized: false). This allows man-in-the-middle attacks.",
            confidence: "high",
          };
        }
        if (key === "NODE_TLS_REJECT_UNAUTHORIZED" && node.value?.value === "0") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "NODE_TLS_REJECT_UNAUTHORIZED=0 disables ALL TLS verification globally — critically insecure in production.",
            confidence: "high",
          };
        }
      }
      return null;
    },
    remediation: "Never disable TLS verification in production. Fix certificate issues properly by updating CA bundles or using valid certificates.",
  },
  // JWT algorithm none
  {
    id: "jwt-alg-none", name: "JWT Algorithm 'none' Accepted", cwe: "CWE-327", owasp: "A02:2021",
    severity: "critical", category: "Authentication",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const prop = node.callee.property?.name;
        if ((prop === "sign" || prop === "verify" || prop === "decode") && node.arguments.length >= 3) {
          const opts = node.arguments[2];
          if (opts?.type === "ObjectExpression") {
            for (const p of opts.properties || []) {
              const key = p.key?.name || p.key?.value;
              if (key === "algorithms" && p.value?.type === "ArrayExpression") {
                for (const el of p.value.elements || []) {
                  if (el?.type === "Literal" && typeof el.value === "string" && el.value.toLowerCase() === "none") {
                    const line = getNodeLine(node, code);
                    return {
                      line, column: getNodeColumn(node, code),
                      evidence: getCodeSnippet(lines, line),
                      detail: "JWT configured to accept 'none' algorithm — allows unsigned tokens, bypassing authentication.",
                      confidence: "high",
                    };
                  }
                }
              }
              if (key === "algorithm" && p.value?.type === "Literal" && typeof p.value.value === "string" && p.value.value.toLowerCase() === "none") {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: "JWT configured to use 'none' algorithm — tokens will be unsigned, allowing forgery.",
                  confidence: "high",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Never accept algorithm 'none'. Specify allowed algorithms explicitly: { algorithms: ['RS256'] }. Use asymmetric keys in production.",
  },
  // Missing SameSite on cookies
  {
    id: "cookie-no-samesite", name: "Cookie Missing SameSite Attribute", cwe: "CWE-1275", owasp: "A01:2021",
    severity: "medium", category: "Session Management",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const prop = node.callee.property?.name;
        if (prop === "cookie" && node.arguments.length >= 3) {
          const opts = node.arguments[2];
          if (opts?.type === "ObjectExpression") {
            const hasSameSite = opts.properties?.some((p: ASTNode) => (p.key?.name || p.key?.value) === "sameSite");
            if (!hasSameSite) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: "Cookie set without SameSite attribute — vulnerable to Cross-Site Request Forgery (CSRF).",
                confidence: "medium",
              };
            }
            // Check for sameSite: "none" without secure: true
            const sameSiteProp = opts.properties?.find((p: ASTNode) => (p.key?.name || p.key?.value) === "sameSite");
            const secureProp = opts.properties?.find((p: ASTNode) => (p.key?.name || p.key?.value) === "secure");
            if (sameSiteProp?.value?.value?.toString().toLowerCase() === "none" && secureProp?.value?.value !== true) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: "Cookie with SameSite=None must also set Secure=true, otherwise browsers will reject it.",
                confidence: "high",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Set SameSite attribute on all cookies: { sameSite: 'strict' } or { sameSite: 'lax' }. Use 'none' only when cross-site is necessary (with Secure=true).",
  },
  // Weak bcrypt rounds
  {
    id: "weak-bcrypt", name: "Weak bcrypt Cost Factor", cwe: "CWE-916", owasp: "A02:2021",
    severity: "medium", category: "Cryptography",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const callee = node.callee;
        const name = callee?.property?.name || callee?.name || "";
        if ((name === "genSalt" || name === "genSaltSync") && node.arguments.length > 0) {
          const rounds = node.arguments[0];
          if (rounds?.type === "Literal" && typeof rounds.value === "number" && rounds.value < 10) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: `bcrypt salt rounds set to ${rounds.value}. OWASP recommends a minimum of 10 (12+ preferred). Low rounds make brute-force feasible.`,
              confidence: "high",
            };
          }
        }
        if ((name === "hash" || name === "hashSync") && callee?.object?.name === "bcrypt") {
          if (node.arguments.length >= 2) {
            const rounds = node.arguments[1];
            if (rounds?.type === "Literal" && typeof rounds.value === "number" && rounds.value < 10) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: `bcrypt cost factor set to ${rounds.value}. OWASP recommends a minimum of 10 (12+ preferred).`,
                confidence: "high",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Use bcrypt with at least 10 salt rounds: bcrypt.hash(password, 12). Consider Argon2id for new projects.",
  },
  // postMessage without origin check
  {
    id: "postmessage-origin", name: "postMessage Without Origin Validation", cwe: "CWE-346", owasp: "A07:2021",
    severity: "high", category: "Access Control",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      // window.postMessage(data, "*") — wildcard target origin
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const prop = node.callee.property?.name;
        if (prop === "postMessage" && node.arguments.length >= 2) {
          const origin = node.arguments[1];
          if (origin?.type === "Literal" && origin.value === "*") {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "postMessage() with '*' as target origin sends the message to any window — sensitive data may leak to untrusted origins.",
              confidence: "high",
            };
          }
        }
      }
      // addEventListener("message", handler) without origin check
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const prop = node.callee.property?.name;
        if (prop === "addEventListener" && node.arguments.length >= 2) {
          const evtType = node.arguments[0];
          if (evtType?.type === "Literal" && evtType.value === "message") {
            const handler = node.arguments[1];
            if (handler?.type === "ArrowFunctionExpression" || handler?.type === "FunctionExpression") {
              // Check if handler body references event.origin
              let checksOrigin = false;
              walkAST(handler.body, (n) => {
                if (n.type === "MemberExpression" && n.property?.name === "origin") checksOrigin = true;
              });
              if (!checksOrigin) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: "Message event handler does not validate event.origin — any page can send messages to this handler.",
                  confidence: "medium",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Always validate event.origin in message handlers: if (event.origin !== 'https://trusted.com') return; Use specific origin instead of '*' for postMessage.",
  },
  // Exposed GraphQL introspection
  {
    id: "graphql-introspection", name: "GraphQL Introspection Enabled", cwe: "CWE-200", owasp: "A04:2021",
    severity: "medium", category: "Information Disclosure",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "Property" || node.type === "ObjectProperty") {
        const key = node.key?.name || node.key?.value;
        if (key === "introspection" && node.value?.value === true) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "GraphQL introspection is enabled — exposes the entire API schema including hidden fields, mutations, and types.",
            confidence: "medium",
          };
        }
      }
      return null;
    },
    remediation: "Disable introspection in production: new ApolloServer({ introspection: false }). Use schema documentation for authorized consumers only.",
  },
  // Helmet disabled features
  {
    id: "helmet-misconfigured", name: "Security Headers Misconfigured", cwe: "CWE-693", owasp: "A05:2021",
    severity: "medium", category: "Configuration",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.name === "helmet") {
        const opts = node.arguments[0];
        if (opts?.type === "ObjectExpression") {
          for (const p of opts.properties || []) {
            const key = p.key?.name || p.key?.value;
            const criticalHeaders = ["contentSecurityPolicy", "frameguard", "xssFilter", "noSniff", "hsts"];
            if (criticalHeaders.includes(key) && p.value?.value === false) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: `helmet() with ${key}: false disables a critical security header. This weakens browser-side protections.`,
                confidence: "high",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Do not disable helmet security headers. Use helmet() with default settings, or customize CSP policy instead of disabling it entirely.",
  },
  // child_process.exec with template literal or concatenation (always dangerous)
  {
    id: "shell-injection-concat", name: "Shell Command via String Concatenation", cwe: "CWE-78", owasp: "A03:2021",
    severity: "critical", category: "Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const chain = resolveMemberChain(node.callee);
        const name = node.callee?.name || chain[chain.length - 1] || "";
        if (name === "exec" || name === "execSync") {
          const arg = node.arguments[0];
          if (arg?.type === "TemplateLiteral" && arg.expressions?.length > 0) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "exec() called with template literal containing interpolated values — shell metacharacters can inject commands.",
              confidence: "high",
            };
          }
          if (arg?.type === "BinaryExpression" && arg.operator === "+") {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "exec() called with string concatenation — any dynamic part can inject shell commands via ;, |, &&, etc.",
              confidence: "high",
            };
          }
        }
      }
      return null;
    },
    remediation: "Use child_process.execFile() with arguments array instead of exec() with string concatenation. Always avoid shell interpretation of user data.",
  },
  // Sensitive data in URL
  {
    id: "sensitive-data-url", name: "Sensitive Data in URL", cwe: "CWE-598", owasp: "A04:2021",
    severity: "medium", category: "Information Disclosure",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "TemplateLiteral" && node.quasis?.length > 0) {
        const rawTemplate = node.quasis.map((q: ASTNode) => q.value?.raw || "").join("...");
        const urlPattern = /https?:\/\/.*\?(.*password|.*secret|.*token|.*api_key|.*apikey)/i;
        if (urlPattern.test(rawTemplate)) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "Sensitive parameters (password, token, secret) passed in URL query string — visible in browser history, logs, and referer headers.",
            confidence: "medium",
          };
        }
      }
      return null;
    },
    remediation: "Send sensitive data in the request body (POST) or in HTTP headers (Authorization). Never include secrets in URLs.",
  },
  // Mass assignment / overfetching
  {
    id: "mass-assignment", name: "Mass Assignment Risk", cwe: "CWE-915", owasp: "A04:2021",
    severity: "medium", category: "Access Control",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const callee = node.callee;
        const prop = callee?.property?.name || "";
        const obj = callee?.object?.property?.name || callee?.object?.name || "";
        // Model.create(req.body) or User.update(req.body)
        if ((prop === "create" || prop === "update" || prop === "updateOne" || prop === "findOneAndUpdate") && node.arguments.length > 0) {
          const arg = node.arguments[0];
          if (arg?.type === "MemberExpression") {
            const argChain = resolveIdentifierName(arg);
            if (argChain === "req.body" || argChain === "request.body" || argChain === "ctx.request.body") {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: `${obj}.${prop}(req.body) passes the entire request body to the database — attackers can set admin privileges, email, or other sensitive fields.`,
                confidence: "medium",
              };
            }
          }
          // Object spread: Model.create({...req.body})
          if (arg?.type === "ObjectExpression") {
            for (const p of arg.properties || []) {
              if (p.type === "SpreadElement" && p.argument?.type === "MemberExpression") {
                const chainName = resolveIdentifierName(p.argument);
                if (chainName === "req.body" || chainName === "request.body") {
                  const line = getNodeLine(node, code);
                  return {
                    line, column: getNodeColumn(node, code),
                    evidence: getCodeSnippet(lines, line),
                    detail: "Spreading req.body into database operations allows mass assignment — attacker can inject unexpected fields.",
                    confidence: "medium",
                  };
                }
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Explicitly pick allowed fields: const { name, email } = req.body; Model.create({ name, email }). Use allowlists, never blocklists.",
  },
  // Hardcoded IP / cloud metadata
  {
    id: "cloud-metadata-ssrf", name: "Cloud Metadata URL Detected", cwe: "CWE-918", owasp: "A10:2021",
    severity: "high", category: "SSRF",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "Literal" && typeof node.value === "string") {
        const metadataUrls = ["169.254.169.254", "metadata.google.internal", "100.100.100.200", "fd00:ec2::254"];
        if (metadataUrls.some(u => node.value.includes(u))) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "Code references cloud metadata endpoint — if reachable from SSRF, leaks IAM credentials and instance metadata.",
            confidence: "medium",
          };
        }
      }
      return null;
    },
    remediation: "Block cloud metadata IPs in SSRF filters. Use IMDSv2 (token-required) on AWS. Apply network-level metadata endpoint restrictions.",
  },
  // outerHTML assignment
  {
    id: "outerhtml-xss", name: "DOM XSS via outerHTML", cwe: "CWE-79", owasp: "A03:2021",
    severity: "high", category: "XSS",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "AssignmentExpression" && node.left?.type === "MemberExpression") {
        const prop = node.left.property?.name || node.left.property?.value;
        if (prop === "outerHTML") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "Setting outerHTML directly replaces element markup — XSS if the value contains user-controlled data.",
            confidence: "high",
          };
        }
      }
      return null;
    },
    remediation: "Use textContent instead of outerHTML. If raw HTML is required, sanitize with DOMPurify.sanitize() first.",
  },
  // document.write
  {
    id: "document-write", name: "DOM XSS via document.write()", cwe: "CWE-79", owasp: "A03:2021",
    severity: "high", category: "XSS",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const obj = node.callee.object?.name;
        const prop = node.callee.property?.name;
        if (obj === "document" && (prop === "write" || prop === "writeln")) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "document.write() injects raw HTML into the page — XSS if any argument contains user-controlled data.",
            confidence: "high",
          };
        }
      }
      return null;
    },
    remediation: "Avoid document.write(). Use DOM APIs (textContent, createElement) or framework rendering. If needed, sanitize with DOMPurify first.",
  },
  // Insecure deserialization with node-serialize
  {
    id: "node-serialize", name: "Insecure Deserialization (node-serialize)", cwe: "CWE-502", owasp: "A08:2021",
    severity: "critical", category: "Deserialization",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const callee = node.callee;
        const name = callee?.property?.name || callee?.name || "";
        if (name === "unserialize") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "node-serialize unserialize() executes arbitrary code via IIFE functions in serialized data — guaranteed RCE.",
            confidence: "high",
          };
        }
      }
      return null;
    },
    remediation: "Remove node-serialize entirely. Use JSON.parse() for data deserialization. If custom serialization is needed, use safe-eval or a schema validator.",
  },
  // Disabled security headers: X-Powered-By leaking framework info
  {
    id: "x-powered-by", name: "X-Powered-By Header Exposure", cwe: "CWE-200", owasp: "A05:2021",
    severity: "low", category: "Information Disclosure",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const prop = node.callee.property?.name;
        if (prop === "setHeader" || prop === "set" || prop === "header") {
          const headerName = node.arguments[0];
          if (headerName?.type === "Literal" && typeof headerName.value === "string" && headerName.value.toLowerCase() === "x-powered-by") {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "Setting X-Powered-By header reveals the server framework — helps attackers select targeted exploits.",
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Remove X-Powered-By header: app.disable('x-powered-by'). Use helmet() which removes it by default.",
  },
  // CSV / Formula Injection
  {
    id: "csv-injection", name: "CSV / Formula Injection", cwe: "CWE-1236", owasp: "A03:2021",
    severity: "medium", category: "Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const callee = node.callee;
        const name = callee?.property?.name || callee?.name || "";
        if ((name === "createObjectCsvWriter" || name === "stringify" || name === "createCsvStringifier" || name === "writeToPath" || name === "unparse") && node.arguments.length > 0) {
          const line = getNodeLine(node, code);
          const snippet = getCodeSnippet(lines, line);
          if (/csv|export|download|spreadsheet/i.test(snippet)) {
            return {
              line, column: getNodeColumn(node, code),
              evidence: snippet,
              detail: "CSV export with user-controlled data. Cells starting with =, +, -, @ can execute formulas when opened in Excel/Sheets.",
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Prefix cell values with a single quote (') or tab character to prevent formula execution. Strip leading =, +, -, @, | characters from user data before CSV export.",
  },
  // Insecure WebSocket
  {
    id: "insecure-websocket", name: "Insecure WebSocket Connection", cwe: "CWE-319", owasp: "A02:2021",
    severity: "medium", category: "Transport Security",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "NewExpression" && node.callee?.name === "WebSocket" && node.arguments.length > 0) {
        const arg = node.arguments[0];
        if (arg?.type === "Literal" && typeof arg.value === "string" && arg.value.startsWith("ws://") && !arg.value.includes("localhost") && !arg.value.includes("127.0.0.1")) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "WebSocket connection uses ws:// (unencrypted). Data is sent in plaintext — vulnerable to eavesdropping and MITM attacks.",
            confidence: "high",
          };
        }
      }
      return null;
    },
    remediation: "Use wss:// (WebSocket Secure) for all WebSocket connections. Ensure TLS certificates are valid.",
  },
  // Unsafe Content-Security-Policy with unsafe-inline/unsafe-eval
  {
    id: "csp-unsafe", name: "Weak Content Security Policy", cwe: "CWE-693", owasp: "A05:2021",
    severity: "medium", category: "Configuration",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const prop = node.callee.property?.name;
        if (prop === "setHeader" || prop === "set" || prop === "header") {
          const headerName = node.arguments[0];
          const headerValue = node.arguments[1];
          if (headerName?.type === "Literal" && typeof headerName.value === "string" &&
              headerName.value.toLowerCase() === "content-security-policy" &&
              headerValue?.type === "Literal" && typeof headerValue.value === "string") {
            const csp = headerValue.value.toLowerCase();
            if (csp.includes("unsafe-inline") || csp.includes("unsafe-eval")) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: `CSP includes ${csp.includes("unsafe-inline") ? "'unsafe-inline'" : "'unsafe-eval'"} — significantly weakens XSS protection by allowing inline scripts/eval.`,
                confidence: "high",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Remove 'unsafe-inline' and 'unsafe-eval' from CSP. Use nonce-based or hash-based CSP for inline scripts. Refactor eval() usage.",
  },
  // Missing HSTS header
  {
    id: "missing-hsts", name: "Missing Strict-Transport-Security Header", cwe: "CWE-311", owasp: "A02:2021",
    severity: "medium", category: "Transport Security",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      // Detect app.listen() on port 443 or HTTPS server without HSTS
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const prop = node.callee.property?.name;
        if (prop === "createServer" && node.callee.object?.name === "https") {
          const line = getNodeLine(node, code);
          const snippet = getCodeSnippet(lines, line);
          // Check surrounding code for HSTS setting
          const surroundingLines = lines.slice(Math.max(0, line - 10), Math.min(lines.length, line + 10)).join("\n");
          if (!surroundingLines.includes("Strict-Transport-Security") && !surroundingLines.includes("hsts") && !surroundingLines.includes("helmet")) {
            return {
              line, column: getNodeColumn(node, code),
              evidence: snippet,
              detail: "HTTPS server without Strict-Transport-Security header. Browsers may still allow HTTP downgrade attacks.",
              confidence: "low",
            };
          }
        }
      }
      return null;
    },
    remediation: "Add HSTS header: res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains'). Or use helmet() which sets it automatically.",
  },
  // Directory listing enabled
  {
    id: "directory-listing", name: "Directory Listing Enabled", cwe: "CWE-548", owasp: "A01:2021",
    severity: "medium", category: "Information Disclosure",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const callee = node.callee;
        let isStaticServe = false;
        if (callee?.type === "MemberExpression") {
          const obj = callee.object?.name || "";
          const prop = callee.property?.name || "";
          if ((obj === "express" && prop === "static") || prop === "serveStatic") isStaticServe = true;
        }
        if (callee?.type === "Identifier" && (callee.name === "serveStatic" || callee.name === "serveIndex")) isStaticServe = true;
        if (isStaticServe) {
          const opts = node.arguments[1];
          if (!opts || opts.type !== "ObjectExpression") {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "Static file server without explicit options. Missing dotfiles:'deny' may expose .env, .git, and other hidden files.",
              confidence: "medium",
            };
          }
          if (opts.type === "ObjectExpression") {
            const hasDotfiles = opts.properties?.some((p: ASTNode) => (p.key?.name || p.key?.value) === "dotfiles");
            if (!hasDotfiles) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: "express.static() without dotfiles:'deny' — hidden files (.env, .git) may be accessible.",
                confidence: "medium",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Configure express.static with { dotfiles: 'deny', index: false } to block access to hidden files and directory listings.",
  },
  // Unhandled promise rejection
  {
    id: "unhandled-promise", name: "Unhandled Promise Rejection", cwe: "CWE-755", owasp: "A06:2021",
    severity: "low", category: "Error Handling",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name;
        if (method === "then" && node.arguments.length === 1) {
          // .then(cb) without .catch()
          const line = getNodeLine(node, code);
          const snippet = getCodeSnippet(lines, line);
          if (!snippet.includes(".catch")) {
            return {
              line, column: getNodeColumn(node, code),
              evidence: snippet,
              detail: ".then() without .catch() — unhandled promise rejections crash Node.js in subsequent versions and may leak error info.",
              confidence: "low",
            };
          }
        }
      }
      return null;
    },
    remediation: "Always chain .catch() after .then(), or use async/await with try/catch. Add process.on('unhandledRejection') as a safety net.",
  },
  // Missing auth middleware on sensitive routes
  {
    id: "missing-auth-middleware", name: "Sensitive Route Without Auth Middleware", cwe: "CWE-306", owasp: "A07:2021",
    severity: "high", category: "Authentication",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name;
        if ((method === "post" || method === "put" || method === "delete" || method === "patch") && node.arguments.length >= 2) {
          const pathArg = node.arguments[0];
          if (pathArg?.type === "Literal" && typeof pathArg.value === "string") {
            const path = pathArg.value.toLowerCase();
            const sensitivePatterns = ["/admin", "/user", "/account", "/settings", "/profile", "/billing", "/payment", "/transfer", "/withdraw", "/delete"];
            if (sensitivePatterns.some(p => path.includes(p))) {
              const handlers = node.arguments.slice(1);
              const hasAuthMiddleware = handlers.some((h: ASTNode) => {
                const name = h.name || h.callee?.name || "";
                return /auth|protect|guard|verify|middleware|jwt|session|passport|restrict|require/i.test(name);
              });
              if (!hasAuthMiddleware && handlers.length <= 1) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: `Sensitive endpoint "${pathArg.value}" has no visible authentication middleware — may be accessible without login.`,
                  confidence: "medium",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Add authentication middleware to sensitive routes: app.post('/admin/action', authMiddleware, handler). Use passport.js, express-jwt, or custom auth guards.",
  },
  // Session fixation: missing session regeneration after login
  {
    id: "session-fixation", name: "Potential Session Fixation", cwe: "CWE-384", owasp: "A07:2021",
    severity: "high", category: "Session Management",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name;
        if (method === "post" && node.arguments.length >= 2) {
          const pathArg = node.arguments[0];
          if (pathArg?.type === "Literal" && typeof pathArg.value === "string") {
            const path = pathArg.value.toLowerCase();
            if (path.includes("login") || path.includes("signin") || path.includes("authenticate")) {
              const handler = node.arguments[node.arguments.length - 1];
              if (handler?.type === "ArrowFunctionExpression" || handler?.type === "FunctionExpression") {
                let hasRegenerate = false;
                walkAST(handler.body, (n) => {
                  if (n.type === "CallExpression" && n.callee?.type === "MemberExpression") {
                    if (n.callee.property?.name === "regenerate" || n.callee.property?.name === "regenerateId") {
                      hasRegenerate = true;
                    }
                  }
                });
                if (!hasRegenerate) {
                  const line = getNodeLine(node, code);
                  return {
                    line, column: getNodeColumn(node, code),
                    evidence: getCodeSnippet(lines, line),
                    detail: `Login endpoint "${pathArg.value}" does not regenerate session ID — vulnerable to session fixation attacks.`,
                    confidence: "medium",
                  };
                }
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Regenerate session after login: req.session.regenerate((err) => { ... }). This prevents session fixation by issuing a new session ID.",
  },
  // Insecure iframe (missing sandbox)
  {
    id: "iframe-no-sandbox", name: "Iframe Without Sandbox Attribute", cwe: "CWE-1021", owasp: "A05:2021",
    severity: "medium", category: "Configuration",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "JSXOpeningElement" && node.name?.name === "iframe") {
        const attrs = node.attributes || [];
        const hasSandbox = attrs.some((a: ASTNode) => a.type === "JSXAttribute" && a.name?.name === "sandbox");
        if (!hasSandbox) {
          const srcAttr = attrs.find((a: ASTNode) => a.type === "JSXAttribute" && a.name?.name === "src");
          if (srcAttr) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "Iframe without sandbox attribute — embedded content can execute scripts, navigate the parent, and access plugins.",
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Add sandbox attribute to restrict iframe capabilities: <iframe sandbox=\"allow-scripts allow-same-origin\" src=\"...\">. Only grant minimum required permissions.",
  },
  // Unsafe file upload (no validation)
  {
    id: "unsafe-file-upload", name: "File Upload Without Validation", cwe: "CWE-434", owasp: "A04:2021",
    severity: "high", category: "Access Control",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const callee = node.callee;
        const name = callee?.name || callee?.property?.name || "";
        // multer without fileFilter, busboy, formidable
        if (name === "multer" && node.arguments.length > 0) {
          const opts = node.arguments[0];
          if (opts?.type === "ObjectExpression") {
            const hasFileFilter = opts.properties?.some((p: ASTNode) => (p.key?.name || p.key?.value) === "fileFilter");
            const hasLimits = opts.properties?.some((p: ASTNode) => (p.key?.name || p.key?.value) === "limits");
            if (!hasFileFilter) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: `multer() configured without fileFilter — accepts any file type including executables, scripts, and web shells.${!hasLimits ? " Also missing size limits." : ""}`,
                confidence: "high",
              };
            }
          }
        }
        // Direct fs.writeFile with req.file or req.files
        if ((name === "writeFile" || name === "writeFileSync") && node.arguments.length >= 2) {
          const line = getNodeLine(node, code);
          const snippet = getCodeSnippet(lines, line);
          if (/req\.file|req\.files|upload|formData/i.test(snippet)) {
            return {
              line, column: getNodeColumn(node, code),
              evidence: snippet,
              detail: "Writing uploaded file data directly without content-type or extension validation — allows arbitrary file upload.",
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Add fileFilter to validate MIME types and extensions. Set size limits. Store uploads outside webroot. Rename files with random names. Scan for malware.",
  },
  // HTTP parameter pollution
  {
    id: "http-param-pollution", name: "HTTP Parameter Pollution Risk", cwe: "CWE-235", owasp: "A03:2021",
    severity: "low", category: "Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name;
        if ((method === "get" || method === "post" || method === "put") && node.arguments.length >= 2) {
          const handler = node.arguments[node.arguments.length - 1];
          if (handler?.type === "ArrowFunctionExpression" || handler?.type === "FunctionExpression") {
            let usesQueryDirectly = false;
            walkAST(handler.body, (n) => {
              if (n.type === "MemberExpression") {
                const chain = resolveIdentifierName(n);
                if (chain === "req.query" && n.parent?.type !== "MemberExpression") usesQueryDirectly = true;
              }
            });
          }
        }
      }
      return null;
    },
    remediation: "Use hpp() middleware to prevent HTTP parameter pollution. Access specific param properties, not the whole req.query object.",
  },
  // Clickjacking: X-Frame-Options removal
  {
    id: "clickjacking", name: "Clickjacking Protection Disabled", cwe: "CWE-1021", owasp: "A05:2021",
    severity: "medium", category: "Configuration",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const obj = node.callee.object?.name || "";
        const method = node.callee.property?.name || "";
        if ((obj === "app" || obj === "server") && method === "disable" && node.arguments.length > 0) {
          const arg = node.arguments[0];
          if (arg?.type === "Literal" && typeof arg.value === "string" && arg.value === "x-frame-options") {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "X-Frame-Options protection explicitly disabled — page can be embedded in iframes for clickjacking attacks.",
              confidence: "high",
            };
          }
        }
      }
      return null;
    },
    remediation: "Do not disable X-Frame-Options. Use helmet() which sets it to DENY by default, or set 'SAMEORIGIN' to allow same-origin framing only.",
  },
  // Hardcoded IP / internal network references
  {
    id: "internal-ip-exposure", name: "Internal IP Address Exposure", cwe: "CWE-200", owasp: "A04:2021",
    severity: "low", category: "Information Disclosure",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "Literal" && typeof node.value === "string") {
        const val = node.value;
        const internalPatterns = [
          /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
          /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}/,
          /^192\.168\.\d{1,3}\.\d{1,3}/,
        ];
        if (internalPatterns.some(p => p.test(val)) && !val.includes("0.0.0.0")) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "Internal/private IP address hardcoded in source — reveals network topology and may assist in lateral movement attacks.",
            confidence: "low",
          };
        }
      }
      return null;
    },
    remediation: "Use environment variables or service discovery for internal endpoints. Remove hardcoded internal IPs from source code.",
  },
  // Unsafe child_process.execSync without error handling
  {
    id: "exec-no-timeout", name: "exec() Without Timeout", cwe: "CWE-400", owasp: "A06:2021",
    severity: "low", category: "Denial of Service",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const name = node.callee?.property?.name || node.callee?.name || "";
        if ((name === "exec" || name === "execSync") && node.arguments.length >= 1) {
          const opts = node.arguments.length >= 2 ? node.arguments[1] || node.arguments[node.arguments.length - 1] : null;
          if (!opts || opts.type !== "ObjectExpression") return null;
          if (opts.type === "ObjectExpression") {
            const hasTimeout = opts.properties?.some((p: ASTNode) => (p.key?.name || p.key?.value) === "timeout");
            if (!hasTimeout) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: "exec()/execSync() without timeout option — a slow or hanging command blocks the process/event loop indefinitely.",
                confidence: "low",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Add timeout option: exec(cmd, { timeout: 30000 }, callback). Use child_process.spawn for long-running processes.",
  },
  // Insecure CORS: dynamic origin reflection
  {
    id: "cors-origin-reflection", name: "CORS Origin Reflection", cwe: "CWE-942", owasp: "A05:2021",
    severity: "high", category: "Access Control",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.name === "cors" && node.arguments.length > 0) {
        const opts = node.arguments[0];
        if (opts?.type === "ObjectExpression") {
          for (const p of opts.properties || []) {
            const key = p.key?.name || p.key?.value;
            if (key === "origin" && (p.value?.type === "ArrowFunctionExpression" || p.value?.type === "FunctionExpression")) {
              // Dynamic origin callback — check if it reflects req.headers.origin
              let reflectsOrigin = false;
              walkAST(p.value.body, (n) => {
                if (n.type === "CallExpression" && n.arguments.length >= 2) {
                  const secondArg = n.arguments[1];
                  if (secondArg?.type === "Literal" && secondArg.value === true) {
                    // callback(null, true) — reflects all origins
                    reflectsOrigin = true;
                  }
                }
              });
              if (reflectsOrigin) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: "CORS origin callback always returns true — effectively reflects any origin, equivalent to wildcard.",
                  confidence: "medium",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Validate origins against an explicit allowlist in the CORS callback. Never blindly reflect the Origin header.",
  },
  // Express trust proxy misconfiguration
  {
    id: "trust-proxy-misconfigured", name: "Express trust proxy Misconfiguration", cwe: "CWE-346", owasp: "A05:2021",
    severity: "medium", category: "Configuration",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name;
        if (method === "set" && node.arguments.length >= 2) {
          const key = node.arguments[0];
          const value = node.arguments[1];
          if (key?.type === "Literal" && key.value === "trust proxy" && value?.type === "Literal" && value.value === true) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "trust proxy set to true trusts ALL proxies — IP spoofing via X-Forwarded-For header becomes trivial.",
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Set trust proxy to a specific hop count or IP: app.set('trust proxy', 1) or app.set('trust proxy', 'loopback'). Never use true in production.",
  },
  // Deprecated crypto methods
  {
    id: "deprecated-crypto", name: "Deprecated Crypto Method", cwe: "CWE-327", owasp: "A02:2021",
    severity: "medium", category: "Cryptography",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const obj = node.callee.object?.name || "";
        const prop = node.callee.property?.name || "";
        if (obj === "crypto" && prop === "createCipher") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "crypto.createCipher() is deprecated — uses weak key derivation (MD5 with 1 iteration). Vulnerable to brute-force key recovery.",
            confidence: "high",
          };
        }
        if (obj === "crypto" && prop === "createDecipher") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "crypto.createDecipher() is deprecated — uses weak key derivation internally. Data may be decryptable by attackers.",
            confidence: "high",
          };
        }
      }
      return null;
    },
    remediation: "Use crypto.createCipheriv() / crypto.createDecipheriv() with a properly derived key (PBKDF2/scrypt) and random IV.",
  },
  // Weak encryption algorithm: DES, RC4, ECB mode
  {
    id: "weak-cipher", name: "Weak Encryption Algorithm", cwe: "CWE-327", owasp: "A02:2021",
    severity: "high", category: "Cryptography",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const obj = node.callee.object?.name || "";
        const prop = node.callee.property?.name || "";
        if (obj === "crypto" && (prop === "createCipheriv" || prop === "createDecipheriv" || prop === "createCipher")) {
          const algoArg = node.arguments[0];
          if (algoArg?.type === "Literal" && typeof algoArg.value === "string") {
            const algo = algoArg.value.toLowerCase();
            if (algo.includes("des") || algo.includes("rc4") || algo.includes("rc2") || algo.includes("blowfish")) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: `Cipher "${algoArg.value}" is cryptographically weak. DES has 56-bit keys, RC4 has known biases, Blowfish has 64-bit blocks.`,
                confidence: "high",
              };
            }
            if (algo.includes("ecb")) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: "ECB mode encrypts identical blocks identically — reveals patterns in plaintext. Never use ECB for multi-block data.",
                confidence: "high",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Use AES-256-GCM or AES-256-CBC with HMAC. Avoid DES, 3DES, RC4, Blowfish, and ECB mode.",
  },
  // Sensitive data in localStorage
  {
    id: "sensitive-localstorage", name: "Sensitive Data in localStorage", cwe: "CWE-922", owasp: "A04:2021",
    severity: "medium", category: "Information Disclosure",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const obj = node.callee.object?.name || "";
        const prop = node.callee.property?.name || "";
        if ((obj === "localStorage" || obj === "sessionStorage") && prop === "setItem" && node.arguments.length >= 2) {
          const key = node.arguments[0];
          if (key?.type === "Literal" && typeof key.value === "string") {
            const sensitiveKeys = ["token", "jwt", "password", "secret", "apiKey", "api_key", "access_token", "refresh_token", "session", "auth", "credential"];
            if (sensitiveKeys.some(s => key.value.toLowerCase().includes(s))) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: `Storing "${key.value}" in ${obj} — accessible to any JavaScript on the page including XSS payloads. Unlike cookies, no HttpOnly protection.`,
                confidence: "medium",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Store sensitive tokens in HttpOnly cookies, not localStorage/sessionStorage. Use secure, HttpOnly, SameSite cookies for auth tokens.",
  },
  // Insufficient logging in catch blocks
  {
    id: "empty-catch", name: "Empty Catch Block", cwe: "CWE-390", owasp: "A09:2021",
    severity: "low", category: "Error Handling",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CatchClause" && node.body?.type === "BlockStatement") {
        const bodyStmts = node.body.body || [];
        if (bodyStmts.length === 0) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "Empty catch block silently swallows exceptions — security errors and critical failures go undetected.",
            confidence: "medium",
          };
        }
      }
      return null;
    },
    remediation: "Log the error in catch blocks: catch(err) { logger.error('Operation failed', err); }. Never use empty catch blocks.",
  },
  // Subprocess with shell: true
  {
    id: "shell-true", name: "Subprocess with shell: true", cwe: "CWE-78", owasp: "A03:2021",
    severity: "high", category: "Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const name = node.callee?.property?.name || node.callee?.name || "";
        if ((name === "spawn" || name === "spawnSync" || name === "execFile" || name === "execFileSync") && node.arguments.length >= 2) {
          const opts = node.arguments[node.arguments.length - 1];
          if (opts?.type === "ObjectExpression") {
            for (const p of opts.properties || []) {
              const key = p.key?.name || p.key?.value;
              if (key === "shell" && p.value?.value === true) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: `${name}() with shell: true passes arguments through /bin/sh — shell metacharacters (;, |, &&) in arguments become command injection vectors.`,
                  confidence: "high",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Remove shell: true from spawn/execFile options. Pass arguments as an array to avoid shell interpretation.",
  },
  // Debug/development mode in production
  {
    id: "debug-mode", name: "Debug Mode Enabled", cwe: "CWE-489", owasp: "A05:2021",
    severity: "medium", category: "Configuration",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "Property" || node.type === "ObjectProperty") {
        const key = node.key?.name || node.key?.value;
        if (key === "debug" && node.value?.value === true) {
          const line = getNodeLine(node, code);
          const snippet = getCodeSnippet(lines, line);
          if (/app|server|config|options|morgan|express/i.test(snippet)) {
            return {
              line, column: getNodeColumn(node, code),
              evidence: snippet,
              detail: "Debug mode enabled — may expose verbose errors, stack traces, and internal state to attackers.",
              confidence: "low",
            };
          }
        }
      }
      return null;
    },
    remediation: "Disable debug mode in production. Use NODE_ENV=production and conditional debug flags.",
  },
  // JWT without expiration
  {
    id: "jwt-no-expiry", name: "JWT Without Expiration", cwe: "CWE-613", owasp: "A07:2021",
    severity: "medium", category: "Authentication",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const prop = node.callee.property?.name;
        if (prop === "sign" && node.arguments.length >= 2) {
          // jwt.sign(payload, secret) without options or without expiresIn
          if (node.arguments.length === 2) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "JWT signed without expiration — compromised tokens remain valid indefinitely.",
              confidence: "medium",
            };
          }
          if (node.arguments.length >= 3) {
            const opts = node.arguments[2];
            if (opts?.type === "ObjectExpression") {
              const hasExpiry = opts.properties?.some((p: ASTNode) => {
                const key = p.key?.name || p.key?.value;
                return key === "expiresIn" || key === "exp";
              });
              if (!hasExpiry) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: "JWT signed without expiresIn option — tokens never expire, increasing risk from token theft.",
                  confidence: "medium",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Always set expiration: jwt.sign(payload, secret, { expiresIn: '1h' }). Use short-lived tokens with refresh token rotation.",
  },
  // MongoDB connection string exposure
  {
    id: "mongodb-no-auth", name: "MongoDB Connection Without Auth", cwe: "CWE-306", owasp: "A07:2021",
    severity: "high", category: "Authentication",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "Literal" && typeof node.value === "string") {
        const val = node.value;
        if (/^mongodb(\+srv)?:\/\/[^:@]+\//.test(val) && !val.includes("@") && !val.includes("localhost") && !val.includes("127.0.0.1")) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "MongoDB connection string without authentication credentials — database may be accessible without login.",
            confidence: "medium",
          };
        }
      }
      return null;
    },
    remediation: "Enable MongoDB authentication. Use connection strings with credentials from environment variables. Enable --auth flag on MongoDB server.",
  },
  // ES Module dynamic import with user input
  {
    id: "dynamic-import", name: "Dynamic import() with User Input", cwe: "CWE-95", owasp: "A03:2021",
    severity: "high", category: "Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "ImportExpression" && node.source) {
        if (node.source.type === "Identifier" || node.source.type === "TemplateLiteral" || node.source.type === "BinaryExpression") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "Dynamic import() with a variable source — if user-controlled, attacker can load arbitrary modules for code execution.",
            confidence: "medium",
          };
        }
      }
      return null;
    },
    remediation: "Use an allowlist of permitted module names. Never pass user input directly to import(). Map user selections to predefined allowed modules.",
  },
  // Insufficient password requirements
  {
    id: "weak-password-policy", name: "Weak Password Policy", cwe: "CWE-521", owasp: "A07:2021",
    severity: "medium", category: "Authentication",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "BinaryExpression" && (node.operator === "<" || node.operator === "<=" || node.operator === ">" || node.operator === ">=")) {
        const leftChain = resolveIdentifierName(node.left);
        const rightChain = resolveIdentifierName(node.right);
        const isLengthCheck = leftChain.includes("length") || rightChain.includes("length");
        const isPasswordRelated = leftChain.includes("password") || rightChain.includes("password") || leftChain.includes("passwd") || rightChain.includes("passwd");
        if (isLengthCheck && isPasswordRelated) {
          const threshold = node.left?.type === "Literal" ? node.left.value : node.right?.type === "Literal" ? node.right.value : null;
          if (typeof threshold === "number" && threshold < 8) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: `Password minimum length set to ${threshold} characters — OWASP recommends at least 8 (12+ preferred).`,
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Enforce minimum 8 character password (12+ recommended). Use bcrypt/argon2 for hashing. Check against breach databases (HaveIBeenPwned API).",
  },
  // ═══════════ SAST Engine v6 — 25+ NEW CHECKS ═══════════
  // Race Condition: async without mutex/lock
  {
    id: "race-condition-async", name: "Potential Race Condition", cwe: "CWE-362", owasp: "A04:2021",
    severity: "medium", category: "Concurrency",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "AssignmentExpression" && node.left?.type === "MemberExpression") {
        const prop = resolveIdentifierName(node.left);
        if (prop.includes("balance") || prop.includes("count") || prop.includes("quantity") || prop.includes("stock") || prop.includes("credits") || prop.includes("inventory")) {
          let parent = node;
          let isAsync = false;
          for (let i = 0; i < 20; i++) {
            parent = parent.parent;
            if (!parent) break;
            if (parent.async === true || parent.type === "AwaitExpression") { isAsync = true; break; }
          }
          if (isAsync) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: `Mutable shared state "${prop}" modified in async context without locking — concurrent requests can cause TOCTOU race conditions (e.g., double-spend).`,
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Use database transactions (BEGIN/COMMIT) or distributed locks (Redis SETNX) for atomic read-modify-write on shared mutable state.",
  },
  // setTimeout/setInterval with string argument (eval-like)
  {
    id: "settimeout-string", name: "setTimeout/setInterval with String", cwe: "CWE-95", owasp: "A03:2021",
    severity: "high", category: "Code Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const name = node.callee?.name || "";
        if ((name === "setTimeout" || name === "setInterval") && node.arguments.length >= 1) {
          const arg = node.arguments[0];
          if (arg?.type === "Literal" && typeof arg.value === "string") {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: `${name}() called with a string argument — this is equivalent to eval() and executes the string as code.`,
              confidence: "high",
            };
          }
          if (arg?.type === "TemplateLiteral" || arg?.type === "BinaryExpression") {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: `${name}() called with a dynamically constructed string — equivalent to eval(). If user-controlled, enables code injection.`,
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Always pass a function reference to setTimeout/setInterval: setTimeout(() => { ... }, 1000). Never pass strings.",
  },
  // Unsafe YAML load (yaml.load instead of yaml.safeLoad)
  {
    id: "unsafe-yaml-load", name: "Unsafe YAML Deserialization", cwe: "CWE-502", owasp: "A08:2021",
    severity: "critical", category: "Deserialization",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const obj = node.callee.object?.name || "";
        const method = node.callee.property?.name || "";
        if ((obj === "yaml" || obj === "YAML" || obj === "jsyaml") && method === "load") {
          // Check if schema option is provided (safe usage)
          if (node.arguments.length <= 1) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "yaml.load() without safe schema allows arbitrary object instantiation — attacker can execute commands via YAML tags (!!python/object, !!js/function).",
              confidence: "high",
            };
          }
          if (node.arguments.length >= 2) {
            const opts = node.arguments[1];
            if (opts?.type === "ObjectExpression") {
              const hasSchema = opts.properties?.some((p: ASTNode) => (p.key?.name || p.key?.value) === "schema");
              if (!hasSchema) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: "yaml.load() without explicit schema — defaults to DEFAULT_SCHEMA which may allow dangerous types.",
                  confidence: "medium",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Use yaml.load(data, { schema: yaml.SAFE_SCHEMA }) or yaml.safeLoad(). Never deserialize untrusted YAML with default schema.",
  },
  // Missing CSRF protection
  {
    id: "missing-csrf", name: "Missing CSRF Protection", cwe: "CWE-352", owasp: "A01:2021",
    severity: "high", category: "Access Control",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name || "";
        if ((method === "post" || method === "put" || method === "delete" || method === "patch") && node.arguments.length >= 2) {
          const pathArg = node.arguments[0];
          if (pathArg?.type === "Literal" && typeof pathArg.value === "string") {
            const path = pathArg.value.toLowerCase();
            const stateChanging = ["/transfer", "/payment", "/delete", "/update", "/change-password", "/change-email", "/withdraw"];
            if (stateChanging.some(p => path.includes(p))) {
              const handlers = node.arguments.slice(1);
              const hasCsrf = handlers.some((h: ASTNode) => {
                const name = h.name || h.callee?.name || "";
                return /csrf|xsrf|csurf|csrfProtection/i.test(name);
              });
              if (!hasCsrf) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: `State-changing endpoint "${pathArg.value}" has no CSRF middleware — vulnerable to cross-site request forgery.`,
                  confidence: "medium",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Add CSRF middleware: const csrf = require('csurf'); app.use(csrf()). Use Synchronizer Token or Double Submit Cookie pattern.",
  },
  // Zip Slip — path traversal in archive extraction
  {
    id: "zip-slip", name: "Zip Slip Vulnerability", cwe: "CWE-22", owasp: "A01:2021",
    severity: "critical", category: "Path Traversal",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const name = node.callee?.property?.name || node.callee?.name || "";
        if ((name === "extract" || name === "Extract" || name === "unzip" || name === "decompress") && node.arguments.length >= 1) {
          const line = getNodeLine(node, code);
          const snippet = getCodeSnippet(lines, line);
          if (/zip|tar|archive|gz|extract|decompress/i.test(snippet)) {
            return {
              line, column: getNodeColumn(node, code),
              evidence: snippet,
              detail: "Archive extraction without path validation — malicious archives can write files outside the target directory using ../../../ traversal in entry names.",
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Validate each entry path before extraction: reject entries containing '../'. Use path.resolve() and verify extracted path starts with target directory.",
  },
  // HTTP Response Splitting
  {
    id: "response-splitting", name: "HTTP Response Splitting", cwe: "CWE-113", owasp: "A03:2021",
    severity: "high", category: "Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name || "";
        if ((method === "setHeader" || method === "writeHead" || method === "set" || method === "header") && node.arguments.length >= 2) {
          const valueArg = node.arguments[node.arguments.length - 1];
          if (valueArg?.type === "TemplateLiteral" || valueArg?.type === "BinaryExpression") {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "HTTP header value constructed dynamically — if it includes CRLF (\\r\\n) from user input, attacker can inject additional headers or split the response.",
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Strip \\r and \\n from header values: value.replace(/[\\r\\n]/g, ''). Use a framework that auto-sanitizes headers.",
  },
  // Insecure TLS/SSL version
  {
    id: "insecure-tls-version", name: "Insecure TLS Version", cwe: "CWE-326", owasp: "A02:2021",
    severity: "high", category: "Cryptography",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "Property" || node.type === "ObjectProperty") {
        const key = node.key?.name || node.key?.value;
        if ((key === "secureProtocol" || key === "minVersion" || key === "maxVersion") && node.value?.type === "Literal" && typeof node.value.value === "string") {
          const val = node.value.value.toLowerCase();
          if (val.includes("sslv") || val.includes("tlsv1_method") || val.includes("tlsv1.0") || val === "tlsv1" || val.includes("tlsv1_1") || val.includes("tlsv1.1")) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: `Insecure TLS/SSL version "${node.value.value}" — SSLv3 and TLS 1.0/1.1 have known vulnerabilities (POODLE, BEAST, CRIME).`,
              confidence: "high",
            };
          }
        }
      }
      return null;
    },
    remediation: "Set minimum TLS version to 1.2: { minVersion: 'TLSv1.2' }. Prefer TLS 1.3 where possible.",
  },
  // Unsafe Reflection
  {
    id: "unsafe-reflection", name: "Unsafe Reflection / Bracket Property Access", cwe: "CWE-470", owasp: "A03:2021",
    severity: "medium", category: "Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "MemberExpression" && node.computed === true && node.property?.type !== "Literal") {
        const objName = resolveIdentifierName(node.object);
        if (objName === "global" || objName === "window" || objName === "globalThis" || objName === "this") {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: `Dynamic property access on ${objName} with user-controlled key — attacker can access any global function or property.`,
            confidence: "medium",
          };
        }
      }
      return null;
    },
    remediation: "Use an allowlist of permitted property names. Never use user input as a dynamic key on global/window objects.",
  },
  // Missing Input Length Validation
  {
    id: "missing-input-length", name: "Missing Input Length Validation", cwe: "CWE-400", owasp: "A06:2021",
    severity: "medium", category: "Denial of Service",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const name = node.callee?.name || node.callee?.property?.name || "";
        if ((name === "json" || name === "urlencoded" || name === "raw" || name === "text") && node.callee?.type === "MemberExpression") {
          const objName = node.callee.object?.name || "";
          if (objName === "express" || objName === "bodyParser" || objName === "app") {
            const opts = node.arguments[0];
            if (!opts || opts.type !== "ObjectExpression") {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: `${objName}.${name}() without limit option — accepts unlimited request body size, enabling memory exhaustion DoS attacks.`,
                confidence: "medium",
              };
            }
            if (opts?.type === "ObjectExpression") {
              const hasLimit = opts.properties?.some((p: ASTNode) => (p.key?.name || p.key?.value) === "limit");
              if (!hasLimit) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: `${objName}.${name}() without limit — default 100KB may be too large. Set explicit limits for your use case.`,
                  confidence: "low",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Set body size limits: app.use(express.json({ limit: '10kb' })). Adjust limit based on expected payload size.",
  },
  // Hardcoded Connection String
  {
    id: "hardcoded-connection-string", name: "Hardcoded Database Connection String", cwe: "CWE-798", owasp: "A07:2021",
    severity: "critical", category: "Secrets",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "Literal" && typeof node.value === "string") {
        const val = node.value;
        // PostgreSQL, MySQL, MSSQL, Redis connection strings with credentials
        if (/^(postgres|mysql|mssql|redis|amqp|mongodb\+srv):\/\/[^:]+:[^@]+@[^/]+/.test(val)) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "Hardcoded database connection string with credentials in source code — extractable by anyone with repo access.",
            confidence: "high",
          };
        }
      }
      return null;
    },
    remediation: "Store connection strings in environment variables: process.env.DATABASE_URL. Use a secrets manager (Vault, AWS Secrets Manager).",
  },
  // Missing Subresource Integrity (SRI)
  {
    id: "missing-sri", name: "External Script Without SRI", cwe: "CWE-353", owasp: "A08:2021",
    severity: "medium", category: "Supply Chain",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "JSXOpeningElement" && node.name?.name === "script") {
        const attrs = node.attributes || [];
        const srcAttr = attrs.find((a: ASTNode) => a.type === "JSXAttribute" && a.name?.name === "src");
        if (srcAttr) {
          const srcValue = srcAttr.value?.value || srcAttr.value?.expression?.value || "";
          if (typeof srcValue === "string" && (srcValue.startsWith("http://") || srcValue.startsWith("https://") || srcValue.startsWith("//"))) {
            const hasIntegrity = attrs.some((a: ASTNode) => a.type === "JSXAttribute" && a.name?.name === "integrity");
            if (!hasIntegrity) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: "External script loaded without integrity attribute — if the CDN is compromised, malicious code will execute in users' browsers.",
                confidence: "medium",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Add SRI hash: <script src=\"...\" integrity=\"sha384-...\" crossorigin=\"anonymous\">. Generate hashes using srihash.org.",
  },
  // Unvalidated URL redirect with string concat
  {
    id: "unsafe-redirect-concat", name: "Unsafe Redirect via Concatenation", cwe: "CWE-601", owasp: "A01:2021",
    severity: "high", category: "Access Control",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name || "";
        if (method === "redirect" && node.arguments.length >= 1) {
          const arg = node.arguments[node.arguments.length - 1];
          if (arg?.type === "BinaryExpression" && arg.operator === "+") {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "Redirect URL built via string concatenation — if user input is included, attacker can redirect to malicious sites (phishing).",
              confidence: "medium",
            };
          }
          if (arg?.type === "TemplateLiteral" && arg.expressions?.length > 0) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "Redirect URL built with template literal containing expressions — validate the final URL against an allowlist.",
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Validate redirect URLs: only allow relative paths or URLs matching your domain. Use a URL allowlist. Reject absolute URLs to external domains.",
  },
  // Sensitive data in error messages
  {
    id: "error-info-leak", name: "Sensitive Data in Error Response", cwe: "CWE-209", owasp: "A04:2021",
    severity: "medium", category: "Information Disclosure",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name || "";
        if ((method === "send" || method === "json") && node.arguments.length >= 1) {
          const arg = node.arguments[0];
          if (arg?.type === "ObjectExpression") {
            for (const p of arg.properties || []) {
              const key = p.key?.name || p.key?.value || "";
              if ((key === "error" || key === "message" || key === "detail") && p.value?.type === "MemberExpression") {
                const valName = resolveIdentifierName(p.value);
                if (valName.includes("stack") || valName.includes("message")) {
                  const line = getNodeLine(node, code);
                  const snippet = getCodeSnippet(lines, line);
                  if (/err|error|catch|exception/i.test(snippet)) {
                    return {
                      line, column: getNodeColumn(node, code),
                      evidence: snippet,
                      detail: `Error object property "${valName}" sent in response — may expose stack traces, file paths, or internal details to attackers.`,
                      confidence: "medium",
                    };
                  }
                }
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Send generic error messages to clients. Log detailed errors server-side. Never expose err.stack or internal error messages in responses.",
  },
  // Missing Content-Type validation
  {
    id: "missing-content-type-check", name: "Missing Content-Type Validation", cwe: "CWE-436", owasp: "A04:2021",
    severity: "low", category: "Input Validation",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name || "";
        if ((method === "post" || method === "put" || method === "patch") && node.arguments.length >= 2) {
          const handler = node.arguments[node.arguments.length - 1];
          if (handler?.type === "ArrowFunctionExpression" || handler?.type === "FunctionExpression") {
            let checksContentType = false;
            walkAST(handler.body, (n) => {
              if (n.type === "MemberExpression") {
                const chain = resolveIdentifierName(n);
                if (chain.includes("content-type") || chain.includes("Content-Type") || chain.includes("is(")) checksContentType = true;
              }
              if (n.type === "CallExpression" && n.callee?.property?.name === "is") checksContentType = true;
            });
          }
        }
      }
      return null;
    },
    remediation: "Validate Content-Type header for state-changing endpoints: if (!req.is('application/json')) return res.status(415).send('Unsupported Media Type').",
  },
  // Unsafe Object Spread to DOM (mass assignment in frontend)
  {
    id: "unsafe-spread-props", name: "Unsafe Object Spread to Component", cwe: "CWE-915", owasp: "A04:2021",
    severity: "medium", category: "Mass Assignment",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "JSXSpreadAttribute") {
        const arg = node.argument;
        if (arg?.type === "MemberExpression") {
          const name = resolveIdentifierName(arg);
          if (name.includes("props") || name.includes("query") || name.includes("params") || name.includes("body") || name.includes("data")) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: `Spreading "${name}" as JSX props — may pass unexpected/dangerous attributes (onClick, dangerouslySetInnerHTML, href) to DOM elements.`,
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Destructure and explicitly pass only required props: const { name, email } = data; <Component name={name} email={email} />.",
  },
  // Insecure File Permissions (fs.chmod/writeFile with 0o777)
  {
    id: "insecure-file-permissions", name: "Insecure File Permissions", cwe: "CWE-732", owasp: "A01:2021",
    severity: "high", category: "Access Control",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression") {
        const name = node.callee?.property?.name || node.callee?.name || "";
        if ((name === "chmod" || name === "chmodSync" || name === "writeFile" || name === "writeFileSync" || name === "mkdir" || name === "mkdirSync") && node.arguments.length >= 2) {
          for (const arg of node.arguments) {
            if (arg?.type === "Literal" && typeof arg.value === "number") {
              // Check for world-writable or world-readable permissions
              const mode = arg.value;
              if (mode === 0o777 || mode === 0o766 || mode === 0o666 || mode === 511 || mode === 438) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: `File permissions set to ${mode.toString(8)} (octal) — world-writable permissions allow any user on the system to read/modify the file.`,
                  confidence: "high",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Use restrictive permissions: 0o600 (owner read/write) for sensitive files, 0o644 for readable config. Never use 0o777.",
  },
  // Hardcoded CORS origin: true (allow all)
  {
    id: "cors-allow-all", name: "CORS Allows All Origins", cwe: "CWE-942", owasp: "A05:2021",
    severity: "high", category: "Access Control",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.name === "cors" && node.arguments.length > 0) {
        const opts = node.arguments[0];
        if (opts?.type === "ObjectExpression") {
          for (const p of opts.properties || []) {
            const key = p.key?.name || p.key?.value;
            // origin: true reflects all origins
            if (key === "origin" && p.value?.type === "Literal" && p.value.value === true) {
              // Check if credentials is also enabled
              const hasCreds = opts.properties?.some((cp: ASTNode) => (cp.key?.name || cp.key?.value) === "credentials" && cp.value?.value === true);
              if (hasCreds) {
                const line = getNodeLine(node, code);
                return {
                  line, column: getNodeColumn(node, code),
                  evidence: getCodeSnippet(lines, line),
                  detail: "CORS with origin: true + credentials: true reflects the requester's origin — equivalent to Access-Control-Allow-Origin: * with cookies, enabling credential theft.",
                  confidence: "high",
                };
              }
            }
          }
        }
      }
      return null;
    },
    remediation: "Set an explicit origin allowlist: cors({ origin: ['https://app.example.com'], credentials: true }).",
  },
  // Environment variable injection
  {
    id: "env-var-injection", name: "Environment Variable in Sensitive Context", cwe: "CWE-78", owasp: "A03:2021",
    severity: "medium", category: "Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "TemplateLiteral" && node.expressions?.length > 0) {
        for (const expr of node.expressions) {
          const name = resolveIdentifierName(expr);
          if (name.startsWith("process.env")) {
            const line = getNodeLine(node, code);
            const snippet = getCodeSnippet(lines, line);
            if (/exec|spawn|query|sql|eval|system|command/i.test(snippet)) {
              return {
                line, column: getNodeColumn(node, code),
                evidence: snippet,
                detail: `Environment variable "${name}" interpolated into a potentially dangerous context — if env vars are manipulated, this enables injection.`,
                confidence: "low",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Validate environment variables before use in sensitive contexts. Use parameterized queries/commands even for env vars.",
  },
  // Node.js unhandled rejection (crash DoS)
  {
    id: "unhandled-rejection-crash", name: "Missing unhandledRejection Handler", cwe: "CWE-755", owasp: "A06:2021",
    severity: "low", category: "Denial of Service",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const obj = resolveIdentifierName(node.callee.object);
        const method = node.callee.property?.name || "";
        if (obj === "app" && method === "listen" && node.arguments.length >= 1) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "Server starts without process.on('unhandledRejection') — unhandled promise rejections crash the process in Node.js 15+.",
            confidence: "low",
          };
        }
      }
      return null;
    },
    remediation: "Add: process.on('unhandledRejection', (err) => { logger.error(err); }). Consider using a process manager (PM2) for auto-restart.",
  },
  // Unsafe Regular Expression (ReDoS via user-controlled regex)
  {
    id: "user-controlled-regex", name: "User-Controlled Regular Expression", cwe: "CWE-1333", owasp: "A03:2021",
    severity: "high", category: "Denial of Service",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "NewExpression" && node.callee?.name === "RegExp" && node.arguments.length >= 1) {
        const arg = node.arguments[0];
        if (arg?.type === "Identifier" || arg?.type === "MemberExpression" || arg?.type === "TemplateLiteral" || arg?.type === "BinaryExpression") {
          const argName = resolveIdentifierName(arg);
          if (!argName.startsWith("process.env")) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "RegExp constructed from dynamic input — attacker can craft a catastrophic backtracking pattern (ReDoS) causing the event loop to hang.",
              confidence: "medium",
            };
          }
        }
      }
      return null;
    },
    remediation: "Use a safe regex library (re2, safe-regex). Validate regex complexity before compilation. Set timeout limits for regex execution.",
  },
  // Prototype assignment (__proto__)
  {
    id: "proto-assignment", name: "__proto__ Property Access", cwe: "CWE-1321", owasp: "A03:2021",
    severity: "high", category: "Injection",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "MemberExpression" && node.property?.type === "Literal" && node.property.value === "__proto__") {
        const line = getNodeLine(node, code);
        return {
          line, column: getNodeColumn(node, code),
          evidence: getCodeSnippet(lines, line),
          detail: "Direct __proto__ access — can be used for prototype pollution to inject properties into all objects.",
          confidence: "high",
        };
      }
      if (node.type === "MemberExpression" && node.property?.type === "Identifier" && node.property.name === "__proto__") {
        const line = getNodeLine(node, code);
        return {
          line, column: getNodeColumn(node, code),
          evidence: getCodeSnippet(lines, line),
          detail: "Direct __proto__ access — can lead to prototype pollution attacks.",
          confidence: "high",
        };
      }
      return null;
    },
    remediation: "Never access __proto__ directly. Use Object.getPrototypeOf/Object.setPrototypeOf if needed. Freeze Object.prototype in security-critical code.",
  },
  // Unsafe Object.keys iteration for authorization
  {
    id: "mass-assignment-express", name: "Mass Assignment via Object Spread", cwe: "CWE-915", owasp: "A04:2021",
    severity: "high", category: "Access Control",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "SpreadElement" && node.argument?.type === "MemberExpression") {
        const name = resolveIdentifierName(node.argument);
        if (name === "req.body" || name === "request.body" || name === "ctx.request.body") {
          // Check parent is an ObjectExpression used in DB operation context
          const line = getNodeLine(node, code);
          const snippet = getCodeSnippet(lines, line);
          if (/create|update|save|insert|findOneAndUpdate|set/i.test(snippet)) {
            return {
              line, column: getNodeColumn(node, code),
              evidence: snippet,
              detail: `Spreading ${name} directly into a database operation — attacker can inject unexpected fields (isAdmin, role, verified, etc.) to escalate privileges.`,
              confidence: "high",
            };
          }
        }
      }
      return null;
    },
    remediation: "Destructure only required fields: const { name, email } = req.body. Use allowlists for permitted fields in create/update operations.",
  },
  // Unsafe WebSocket connection (ws:// instead of wss://)
  {
    id: "insecure-websocket-url", name: "Insecure WebSocket Connection", cwe: "CWE-319", owasp: "A02:2021",
    severity: "medium", category: "Transport Security",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "NewExpression" && node.callee?.name === "WebSocket" && node.arguments.length >= 1) {
        const arg = node.arguments[0];
        if (arg?.type === "Literal" && typeof arg.value === "string" && arg.value.startsWith("ws://") && !arg.value.includes("localhost") && !arg.value.includes("127.0.0.1")) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "WebSocket connection over unencrypted ws:// — data including auth tokens is transmitted in cleartext.",
            confidence: "high",
          };
        }
      }
      return null;
    },
    remediation: "Use wss:// for WebSocket connections in production to encrypt data in transit.",
  },
  // Hardcoded encryption key/IV
  {
    id: "hardcoded-crypto-key", name: "Hardcoded Encryption Key/IV", cwe: "CWE-321", owasp: "A02:2021",
    severity: "critical", category: "Cryptography",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name || "";
        if ((method === "createCipheriv" || method === "createDecipheriv") && node.arguments.length >= 3) {
          const keyArg = node.arguments[1];
          const ivArg = node.arguments[2];
          if (keyArg?.type === "Literal" && typeof keyArg.value === "string") {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "Hardcoded encryption key in source code — anyone with repo access can decrypt encrypted data.",
              confidence: "high",
            };
          }
          if (ivArg?.type === "Literal" && typeof ivArg.value === "string") {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "Hardcoded initialization vector (IV) — reusing a static IV with the same key breaks cipher security. Use crypto.randomBytes(16).",
              confidence: "high",
            };
          }
        }
      }
      return null;
    },
    remediation: "Generate keys with crypto.randomBytes() and store in env vars/secrets manager. Always use random IVs: crypto.randomBytes(16).",
  },
  // Express trust proxy === false behind reverse proxy
  {
    id: "missing-helmet", name: "Missing Security Headers Middleware", cwe: "CWE-693", owasp: "A05:2021",
    severity: "medium", category: "Configuration",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const method = node.callee.property?.name || "";
        if (method === "listen" && node.arguments.length >= 1) {
          // This is app.listen() — check if helmet was used anywhere above
          const line = getNodeLine(node, code);
          const codeAbove = code.substring(0, node.start);
          if (!codeAbove.includes("helmet") && !codeAbove.includes("Helmet")) {
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: "Server starts without helmet() middleware — missing security headers (X-Frame-Options, CSP, HSTS, X-Content-Type-Options).",
              confidence: "low",
            };
          }
        }
      }
      return null;
    },
    remediation: "Install and use helmet: npm install helmet && app.use(helmet()). This sets 15+ security headers with sensible defaults.",
  },
  // Unvalidated JSON.parse
  {
    id: "unvalidated-json-parse", name: "JSON.parse Without Try-Catch", cwe: "CWE-20", owasp: "A06:2021",
    severity: "low", category: "Error Handling",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const obj = node.callee.object?.name || "";
        const method = node.callee.property?.name || "";
        if (obj === "JSON" && method === "parse") {
          let inTryCatch = false;
          let parent = node;
          for (let i = 0; i < 20; i++) {
            parent = parent.parent;
            if (!parent) break;
            if (parent.type === "TryStatement") { inTryCatch = true; break; }
          }
          if (!inTryCatch) {
            const arg = node.arguments[0];
            if (arg?.type === "Identifier" || arg?.type === "MemberExpression") {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: "JSON.parse() without try-catch — malformed input will throw an unhandled exception that could crash the server.",
                confidence: "low",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Wrap JSON.parse in try-catch: try { const data = JSON.parse(input); } catch(e) { return res.status(400).json({ error: 'Invalid JSON' }); }",
  },
  // Hardcoded AWS/Cloud credentials
  {
    id: "hardcoded-cloud-key", name: "Hardcoded Cloud Provider Credentials", cwe: "CWE-798", owasp: "A07:2021",
    severity: "critical", category: "Secrets",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "Property" || node.type === "ObjectProperty") {
        const key = (node.key?.name || node.key?.value || "").toLowerCase();
        if ((key === "accesskeyid" || key === "secretaccesskey" || key === "aws_access_key_id" || key === "aws_secret_access_key") &&
            node.value?.type === "Literal" && typeof node.value.value === "string" && node.value.value.length >= 16) {
          const val = node.value.value;
          if (!val.includes("process.env") && !val.startsWith("${")) {
            const line = getNodeLine(node, code);
            return {
              line, column: getNodeColumn(node, code),
              evidence: getCodeSnippet(lines, line),
              detail: `Hardcoded AWS credential "${key}" — grants direct access to cloud resources. Attackers mine public repos for these.`,
              confidence: "high",
            };
          }
        }
      }
      // Also check variable assignments
      if (node.type === "VariableDeclarator" && node.init?.type === "Literal" && typeof node.init.value === "string") {
        const varName = (node.id?.name || "").toLowerCase();
        const val = node.init.value;
        if (/^akia[0-9a-z]{16}$/i.test(val)) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: "AWS Access Key ID pattern detected (starts with AKIA) — this is a live AWS credential that should never be in source code.",
            confidence: "high",
          };
        }
        if ((varName.includes("secret") || varName.includes("api_key") || varName.includes("apikey")) && val.length >= 20 && !/^(process|env|config|undefined|null|true|false)/.test(val)) {
          const line = getNodeLine(node, code);
          return {
            line, column: getNodeColumn(node, code),
            evidence: getCodeSnippet(lines, line),
            detail: `Variable "${node.id?.name}" appears to contain a hardcoded secret (${val.length} chars) — should be in environment variables.`,
            confidence: "medium",
          };
        }
      }
      return null;
    },
    remediation: "Use AWS SDK default credential chain (env vars, IAM roles, ~/.aws/credentials). Never hardcode access keys in source code.",
  },
  // Server-side console.log of sensitive data
  {
    id: "sensitive-data-logging", name: "Sensitive Data in Console Log", cwe: "CWE-532", owasp: "A09:2021",
    severity: "medium", category: "Logging",
    detect: (node: ASTNode, code: string, lines: string[]) => {
      if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
        const obj = node.callee.object?.name || "";
        const method = node.callee.property?.name || "";
        if (obj === "console" && (method === "log" || method === "info" || method === "debug" || method === "warn")) {
          for (const arg of node.arguments) {
            const name = resolveIdentifierName(arg);
            if (/password|token|secret|apikey|api_key|credit.?card|ssn|authorization/i.test(name)) {
              const line = getNodeLine(node, code);
              return {
                line, column: getNodeColumn(node, code),
                evidence: getCodeSnippet(lines, line),
                detail: `Logging "${name}" — passwords, tokens, and secrets in logs are accessible to anyone with log access.`,
                confidence: "medium",
              };
            }
          }
        }
      }
      return null;
    },
    remediation: "Never log sensitive values. Mask or redact: logger.info('Auth', { token: '***' }). Use structured logging with sensitive field filters.",
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
  /** Variables that have been sanitized — maps varName → set of mitigated vuln IDs */
  private sanitizedVars = new Map<string, Set<string>>();

  markTainted(varName: string, info: TaintInfo) {
    this.taintedVars.set(varName, info);
    // If re-tainted, remove any previous sanitization
    this.sanitizedVars.delete(varName);
  }

  /** Mark a variable as sanitized for specific vulnerability types */
  markSanitized(varName: string, mitigatedVulns: Set<string>) {
    const existing = this.sanitizedVars.get(varName) || new Set();
    for (const v of mitigatedVulns) existing.add(v);
    this.sanitizedVars.set(varName, existing);
  }

  /** Check if a variable has been sanitized for a specific vulnerability */
  isSanitizedFor(node: ASTNode, vulnId: string): boolean {
    if (node.type === "Identifier") {
      const san = this.sanitizedVars.get(node.name);
      return san ? san.has(vulnId) : false;
    }
    if (node.type === "MemberExpression" && node.object?.type === "Identifier") {
      const san = this.sanitizedVars.get(node.object.name);
      return san ? san.has(vulnId) : false;
    }
    // If the entire expression is wrapped in a sanitizer call, it's clean
    return false;
  }

  /** Check if an argument node is wrapped in a sanitizer call for the given vuln */
  isArgSanitized(node: ASTNode, vulnId: string): boolean {
    // Direct sanitizer: sink(sanitize(tainted))
    if (node.type === "CallExpression" && matchesSanitizer(node, vulnId)) return true;
    // Check variable sanitization
    if (this.isSanitizedFor(node, vulnId)) return true;
    // If it's a numeric conversion: sink(Number(x)) or sink(parseInt(x))
    if (node.type === "CallExpression") {
      const callee = node.callee;
      if (callee?.type === "Identifier" && (callee.name === "parseInt" || callee.name === "parseFloat" || callee.name === "Number")) {
        return true;
      }
    }
    return false;
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
      // Computed property access: obj["prop"] or obj[variable]
      if (node.computed && root?.type === "Identifier" && this.taintedVars.has(root.name)) {
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
    // Conditional expression: x ? tainted : safe
    if (node.type === "ConditionalExpression") {
      return this.isTainted(node.consequent) || this.isTainted(node.alternate);
    }
    // Logical expression: tainted || default, tainted && other
    if (node.type === "LogicalExpression") {
      return this.isTainted(node.left) || this.isTainted(node.right);
    }
    // Object spread: { ...tainted }
    if (node.type === "ObjectExpression") {
      for (const prop of node.properties || []) {
        if (prop.type === "SpreadElement") {
          const t = this.isTainted(prop.argument);
          if (t) return t;
        }
      }
    }
    // Array spread: [...tainted]
    if (node.type === "ArrayExpression") {
      for (const el of node.elements || []) {
        if (el?.type === "SpreadElement") {
          const t = this.isTainted(el.argument);
          if (t) return t;
        }
      }
    }
    // Await expression: await tainted
    if (node.type === "AwaitExpression") {
      return this.isTainted(node.argument);
    }
    // Call expression: tainted.toString(), tainted.trim(), tainted.toLowerCase(), etc.
    if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
      const method = node.callee.property?.name || "";
      const preservesTaint = new Set([
        "toString", "trim", "trimStart", "trimEnd", "toLowerCase", "toUpperCase",
        "slice", "substring", "substr", "split", "replace", "replaceAll",
        "concat", "padStart", "padEnd", "repeat", "normalize",
        "match", "matchAll", "at", "charAt", "charCodeAt",
        "join", "flat", "flatMap", "reverse",
        "JSON.stringify",
      ]);
      if (preservesTaint.has(method)) {
        return this.isTainted(node.callee.object);
      }
      // Array methods that propagate taint: arr.map(x=>x), arr.filter(x=>x), etc.
      const arrayPropagateMethods = new Set(["map", "filter", "find", "some", "every", "reduce", "forEach", "flatMap"]);
      if (arrayPropagateMethods.has(method)) {
        return this.isTainted(node.callee.object);
      }
    }
    // Tagged template: tag`tainted ${expr}`
    if (node.type === "TaggedTemplateExpression") {
      return this.isTainted(node.quasi);
    }
    // Sequence expression: (a, b, tainted)
    if (node.type === "SequenceExpression" && node.expressions?.length > 0) {
      return this.isTainted(node.expressions[node.expressions.length - 1]);
    }
    // Assignment expression used as value: (x = tainted)
    if (node.type === "AssignmentExpression") {
      return this.isTainted(node.right);
    }
    return null;
  }

  // Propagate taint through assignments
  processAssignment(left: ASTNode, right: ASTNode, code: string, lines: string[]) {
    if (left.type !== "Identifier") return;
    // Check if right side is a sanitizer call wrapping tainted data
    if (right.type === "CallExpression") {
      const chain = resolveMemberChain(right.callee);
      if (chain.length === 0 && right.callee?.type === "Identifier") chain.push(right.callee.name);
      for (const san of KNOWN_SANITIZERS) {
        if (chain.length >= san.pattern.length) {
          const endSlice = chain.slice(chain.length - san.pattern.length);
          if (san.pattern.every((p, i) => endSlice[i] === p)) {
            // This is a sanitizer: x = sanitize(tainted)
            // Mark the var as sanitized for these categories
            this.markSanitized(left.name, san.mitigates);
            // Still propagate taint (it's sanitized, not untainted)
            const innerArg = right.arguments?.[0];
            if (innerArg) {
              const existing = this.isTainted(innerArg);
              if (existing) {
                this.taintedVars.set(left.name, existing);
              }
            }
            return;
          }
        }
      }
      // Taint-preserving method calls: const x = tainted.trim()
      if (right.callee?.type === "MemberExpression") {
        const method = right.callee.property?.name || "";
        const preserves = new Set([
          "toString", "trim", "trimStart", "trimEnd", "toLowerCase", "toUpperCase",
          "slice", "substring", "substr", "concat", "padStart", "padEnd", "replace", "replaceAll",
          "split", "join", "flat", "reverse", "normalize", "repeat",
        ]);
        if (preserves.has(method)) {
          const objTaint = this.isTainted(right.callee.object);
          if (objTaint) { this.markTainted(left.name, objTaint); return; }
        }
      }
      // JSON.stringify(tainted) — still tainted
      if (right.callee?.type === "MemberExpression") {
        const obj = right.callee.object?.name;
        const prop = right.callee.property?.name;
        if (obj === "JSON" && prop === "stringify" && right.arguments?.[0]) {
          const argTaint = this.isTainted(right.arguments[0]);
          if (argTaint) { this.markTainted(left.name, argTaint); return; }
        }
        // JSON.parse(tainted) — still tainted
        if (obj === "JSON" && prop === "parse" && right.arguments?.[0]) {
          const argTaint = this.isTainted(right.arguments[0]);
          if (argTaint) { this.markTainted(left.name, argTaint); return; }
        }
      }
      // Propagate from first tainted arg for non-sanitizer calls
      // e.g., const x = someFunction(tainted) — conservative propagation
      for (const arg of right.arguments || []) {
        const argTaint = this.isTainted(arg);
        if (argTaint) { this.markTainted(left.name, argTaint); return; }
      }
    }
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
    // Object spread: const x = { ...tainted }
    if (right.type === "ObjectExpression") {
      for (const prop of right.properties || []) {
        if (prop.type === "SpreadElement") {
          const spreadTaint = this.isTainted(prop.argument);
          if (spreadTaint) { this.markTainted(left.name, spreadTaint); return; }
        }
      }
    }
    // Array spread: const x = [...tainted]
    if (right.type === "ArrayExpression") {
      for (const el of right.elements || []) {
        if (el?.type === "SpreadElement") {
          const spreadTaint = this.isTainted(el.argument);
          if (spreadTaint) { this.markTainted(left.name, spreadTaint); return; }
        }
      }
    }
    // Await: const x = await tainted
    if (right.type === "AwaitExpression") {
      const awaitTaint = this.isTainted(right.argument);
      if (awaitTaint) { this.markTainted(left.name, awaitTaint); return; }
    }
    // Propagate existing taint
    const existing = this.isTainted(right);
    if (existing) {
      this.markTainted(left.name, existing);
    }
  }
}

/* ── Inter-procedural Analysis: Function Definition Tracker ── */

interface FuncDef {
  name: string;
  params: string[];
  body: ASTNode;
  node: ASTNode;
}

class FunctionCollector {
  private funcs = new Map<string, FuncDef>();

  collect(ast: ASTNode) {
    walkAST(ast, (node) => {
      // function foo(x, y) { ... }
      if (node.type === "FunctionDeclaration" && node.id?.name) {
        this.funcs.set(node.id.name, {
          name: node.id.name,
          params: (node.params || []).map((p: ASTNode) => p.name || p.argument?.name || "").filter(Boolean),
          body: node.body,
          node,
        });
      }
      // const foo = function(x, y) { ... }  OR  const foo = (x) => { ... }
      if (node.type === "VariableDeclarator" && node.id?.type === "Identifier" && node.init) {
        const init = node.init;
        if (init.type === "FunctionExpression" || init.type === "ArrowFunctionExpression") {
          this.funcs.set(node.id.name, {
            name: node.id.name,
            params: (init.params || []).map((p: ASTNode) => p.name || p.argument?.name || "").filter(Boolean),
            body: init.body,
            node: init,
          });
        }
      }
      // Object method: { foo(x) { ... } }
      if (node.type === "MethodDefinition" && node.key?.name && node.value) {
        this.funcs.set(node.key.name, {
          name: node.key.name,
          params: (node.value.params || []).map((p: ASTNode) => p.name || p.argument?.name || "").filter(Boolean),
          body: node.value.body,
          node: node.value,
        });
      }
    });
  }

  get(name: string): FuncDef | undefined { return this.funcs.get(name); }
  has(name: string): boolean { return this.funcs.has(name); }
  all(): Map<string, FuncDef> { return this.funcs; }
}

/* ── Control-Flow Sensitivity: check if a sink is guarded by validation ── */

/**
 * Check if the sink node is inside an if-block whose condition involves
 * a validation or sanitization check on the tainted variable.
 * Returns true if a validation guard is detected (reduce confidence).
 */
function hasValidationGuard(sinkNode: ASTNode, taintedVarName: string, ast: ASTNode): boolean {
  // Walk ancestors: find if we're inside an IfStatement whose test validates the var
  let guardFound = false;

  walkAST(ast, (node) => {
    if (guardFound) return;
    if (node.type !== "IfStatement") return;

    // Check if the if-test involves a validation function on the tainted variable
    const test = node.test;
    if (!test) return;

    // Check if the sink is inside this if's consequent
    const consequent = node.consequent;
    if (!consequent) return;
    if (!nodeContainsPosition(consequent, sinkNode.start, sinkNode.end)) return;

    // Now check if the test involves validation
    if (testInvolvesValidation(test, taintedVarName)) {
      guardFound = true;
    }
  });

  return guardFound;
}

function nodeContainsPosition(node: ASTNode, start: number, end: number): boolean {
  if (!node || node.start == null || node.end == null) return false;
  return node.start <= start && node.end >= end;
}

function testInvolvesValidation(testNode: ASTNode, varName: string): boolean {
  let found = false;
  walkAST(testNode, (node) => {
    if (found) return;
    // Call to a validation function with varName as arg
    if (node.type === "CallExpression") {
      const calleeName = node.callee?.name || node.callee?.property?.name || "";
      if (VALIDATION_FUNCTIONS.has(calleeName)) {
        // Check if any argument references the tainted var
        for (const arg of node.arguments || []) {
          if (argReferencesVar(arg, varName)) { found = true; return; }
        }
      }
      // method call: taintedVar.match(), taintedVar.startsWith(), etc.
      if (node.callee?.type === "MemberExpression" && node.callee?.object?.name === varName) {
        const method = node.callee.property?.name || "";
        if (VALIDATION_FUNCTIONS.has(method)) { found = true; return; }
      }
    }
    // typeof check: typeof x === "string"
    if (node.type === "UnaryExpression" && node.operator === "typeof" && node.argument?.name === varName) {
      found = true;
    }
    // Comparison: x === constant, x !== undefined
    if (node.type === "BinaryExpression" && (node.operator === "===" || node.operator === "==" || node.operator === "!==" || node.operator === "!=")) {
      if ((node.left?.name === varName && node.right?.type === "Literal") ||
          (node.right?.name === varName && node.left?.type === "Literal")) {
        found = true;
      }
    }
  });
  return found;
}

function argReferencesVar(node: ASTNode, varName: string): boolean {
  if (!node) return false;
  if (node.type === "Identifier" && node.name === varName) return true;
  if (node.type === "MemberExpression") return argReferencesVar(node.object, varName);
  return false;
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

  // Remove `import type` and `export type {…}` statements (preserve newlines)
  result = result.replace(/(?:import|export)\s+type\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s*(?:from\s*['"][^'"]*['"])?;?/g,
    (m) => "\n".repeat((m.match(/\n/g) || []).length));

  // Remove `declare` blocks: declare module/namespace/global/function/const/var/let/class
  result = result.replace(/(?:export\s+)?declare\s+(?:module|namespace|global|function|const|var|let|class|interface|type|enum|abstract)\b[^;{]*(?:\{[\s\S]*?\}|;)/g,
    (m) => "\n".repeat((m.match(/\n/g) || []).length));

  // Remove interface/type blocks (replace with same number of newlines)
  result = result.replace(/(?:export\s+)?(?:interface|type)\s+\w+(?:<[^>]*>)?\s*(?:extends\s+[^{]+?)?\s*(?:=\s*[^;]+;|\{[\s\S]*?\})/g,
    (m) => "\n".repeat((m.match(/\n/g) || []).length));

  // Remove enum blocks
  result = result.replace(/(?:export\s+)?(?:const\s+)?enum\s+\w+\s*\{[\s\S]*?\}/g,
    (m) => "\n".repeat((m.match(/\n/g) || []).length));

  // Remove namespace blocks
  result = result.replace(/(?:export\s+)?namespace\s+\w+\s*\{[\s\S]*?\}/g,
    (m) => "\n".repeat((m.match(/\n/g) || []).length));

  // Remove decorators: @Something, @Something(), @Something({…})
  result = result.replace(/@\w+(?:\.\w+)*(?:\([^)]*\))?/g, "");

  // Remove access modifiers / keywords that acorn doesn't know
  result = result.replace(/\b(private|protected|public|readonly|abstract|declare|override)\s+/g, "");

  // Remove `satisfies Type`
  result = result.replace(/\s+satisfies\s+[A-Z]\w*(?:<[^>]*>)?/g, "");

  // Remove return-type annotations on functions/arrows: ): Type {  or ): Type =>
  result = result.replace(/\):\s*[^=>{,)]+(?=\s*[{=])/g, ")");

  // Remove complex type annotations after `:` — handles unions, intersections, generics, arrays, tuples, template literals
  result = result.replace(/:\s*(?:readonly\s+)?(?:(?:[\w$.]+(?:<(?:[^<>]|<[^<>]*>)*>)?(?:\[\])?)(?:\s*[|&]\s*(?:[\w$.]+(?:<(?:[^<>]|<[^<>]*>)*>)?(?:\[\])?))*)/g, (m, offset) => {
    // Only strip if this looks like a type annotation (after identifier, param, destructure)
    const before = result.charAt(offset - 1);
    if (before && /[\w)\]?!]/.test(before)) return "";
    return m;
  });

  // Remove: variable: primitiveType, param: primitiveType (catch remaining simple ones)
  result = result.replace(/:\s*(?:string|number|boolean|any|void|never|unknown|null|undefined|object|symbol|bigint|Function|Record|Map|Set|Array|Promise|Partial|Required|Omit|Pick|Exclude|Extract|ReturnType|Parameters|Awaited)(?:<[^>]*>)?(?:\[\])?(?:\s*\|[^=,)}\n]+)?/g, "");

  // Remove generic type params: <T>, <T extends X>, <T, K extends keyof T>
  result = result.replace(/<(?:[A-Z_]\w*(?:\s+extends\s+(?:[^>]|(?:<[^>]*>))+)?)(?:,\s*[A-Z_]\w*(?:\s+extends\s+(?:[^>]|(?:<[^>]*>))+)?)*>/g, "");

  // Remove "as Type" and "as const" casts
  result = result.replace(/\s+as\s+(?:const|(?:[\w$.]+(?:<[^>]*>)?(?:\[\])?))/g, "");

  // Remove non-null assertion: foo!.bar -> foo.bar, foo! -> foo
  result = result.replace(/!(\.|;|\s|\)|\]|\,)/g, "$1");

  // Remove angle-bracket type assertions: <Type>expr (but not JSX)
  result = result.replace(/(?<=[\s(=,;!])(<(?:string|number|boolean|any|void|unknown|object|Record|Partial|Array|Map|Set)(?:<[^>]*>)?>)(?=\w|\()/g, "");

  // Remove `implements X, Y` from class declarations
  result = result.replace(/\s+implements\s+[\w,\s<>.]+(?=\s*\{)/g, "");

  // Remove method overload signatures (lines ending with `;` that look like function signatures)
  result = result.replace(/^\s*(?:export\s+)?(?:async\s+)?(?:function\s+)?\w+\s*(?:<[^>]*>)?\s*\([^)]*\)\s*:\s*[^{;]+;$/gm,
    (m) => "\n".repeat((m.match(/\n/g) || []).length));

  return result;
}

/**
 * Fallback regex-based scanner for when AST parsing fails.
 * Catches critical/high vulnerabilities using pattern matching on raw code.
 * Lower confidence than AST analysis but ensures no file is silently skipped.
 */
function fallbackRegexScan(code: string): ASTFinding[] {
  const lines = code.split("\n");
  const findings: ASTFinding[] = [];
  const seen = new Set<string>();

  function add(f: ASTFinding) {
    const key = `${f.id}:${f.line}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (!f.codeSnippet && f.line > 0) f.codeSnippet = buildSnippet(lines, f.line);
    findings.push(f);
  }

  const checks: {
    id: string; name: string; severity: Severity; category: string;
    cwe: string; owasp: string; pattern: RegExp; detail: string; remediation: string;
  }[] = [
    // SQL Injection
    {
      id: "sql-injection", name: "SQL Injection", severity: "critical", category: "Injection",
      cwe: "CWE-89", owasp: "A03:2021",
      pattern: /(?:query|execute|exec|raw|prepare)\s*\(\s*(?:["'`](?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|TRUNCATE)\b[^"'`]*["'`]\s*\+|["'`](?:SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|TRUNCATE)\b[^"'`]*\$\{)/gi,
      detail: "String concatenation or template literal in SQL query allows injection",
      remediation: "Use parameterized queries or prepared statements",
    },
    // Command Injection
    {
      id: "command-injection", name: "Command Injection", severity: "critical", category: "Injection",
      cwe: "CWE-78", owasp: "A03:2021",
      pattern: /(?:exec|execSync|spawn|spawnSync|execFile|execFileSync)\s*\(\s*(?:[^,)]*\+\s*(?:req\.|params\.|query\.|body\.|input|user|arg|data)|`[^`]*\$\{)/gi,
      detail: "User input in shell command execution enables command injection",
      remediation: "Use parameterized commands or allowlist-based input validation",
    },
    // Path Traversal
    {
      id: "path-traversal", name: "Path Traversal", severity: "high", category: "Injection",
      cwe: "CWE-22", owasp: "A01:2021",
      pattern: /(?:readFileSync|readFile|createReadStream|writeFileSync|writeFile|unlink|unlinkSync|access|accessSync|stat|statSync|open|openSync)\s*\(\s*(?:[^,)]*\+\s*(?:req\.|params\.|query\.|body\.|input|user|filename|filepath|name)|`[^`]*\$\{[^}]*(?:req\.|params\.|query\.|body\.|name|path|file))/gi,
      detail: "User input in file path allows directory traversal",
      remediation: "Validate and sanitize file paths; use path.resolve with a base directory check",
    },
    // XSS
    {
      id: "xss-reflected", name: "Cross-Site Scripting (Reflected)", severity: "high", category: "XSS",
      cwe: "CWE-79", owasp: "A03:2021",
      pattern: /(?:res\.send|res\.write|res\.end|innerHTML|outerHTML|document\.write)\s*\(\s*(?:[^)]*(?:req\.|params\.|query\.|body\.|input|user))/gi,
      detail: "User input reflected in response without encoding",
      remediation: "Encode all user input before including in HTML responses",
    },
    // Hardcoded Secrets
    {
      id: "hardcoded-secret", name: "Hardcoded Secret", severity: "high", category: "Secrets",
      cwe: "CWE-798", owasp: "A07:2021",
      pattern: /(?:(?:password|secret|api_?key|apikey|token|auth|credential|private_?key)\s*[:=]\s*["'][^"']{8,}["']|(?:AWS|AKIA|sk-|ghp_|gho_|github_pat_|xox[bpas]-|eyJ)[A-Za-z0-9+/=_-]{20,})/gi,
      detail: "Sensitive value appears to be hardcoded in source code",
      remediation: "Use environment variables or a secrets manager",
    },
    // Eval Usage
    {
      id: "code-injection", name: "Code Injection (eval)", severity: "critical", category: "Injection",
      cwe: "CWE-94", owasp: "A03:2021",
      pattern: /\b(?:eval|Function)\s*\(\s*(?:[^)]*(?:req\.|params\.|query\.|body\.|input|user|data)|[^"')]+\+)/gi,
      detail: "Dynamic code evaluation with potentially untrusted input",
      remediation: "Avoid eval/Function constructor; use safe alternatives",
    },
    // SSRF
    {
      id: "ssrf", name: "Server-Side Request Forgery", severity: "high", category: "SSRF",
      cwe: "CWE-918", owasp: "A10:2021",
      pattern: /(?:fetch|axios|http\.get|https\.get|request|got|node-fetch|urllib)\s*\(\s*(?:[^)]*(?:req\.|params\.|query\.|body\.|input|user|url)|`[^`]*\$\{[^}]*(?:req\.|url|host|endpoint))/gi,
      detail: "User-controlled URL in outbound HTTP request",
      remediation: "Validate and allowlist target URLs/hosts",
    },
    // Insecure Deserialization
    {
      id: "insecure-deserialization", name: "Insecure Deserialization", severity: "critical", category: "Injection",
      cwe: "CWE-502", owasp: "A08:2021",
      pattern: /\b(?:serialize|unserialize|node-serialize|js-yaml\.load\s*\(|deserialize)\b/gi,
      detail: "Unsafe deserialization may allow remote code execution",
      remediation: "Use safe deserialization methods (e.g., js-yaml.safeLoad)",
    },
    // Weak Crypto
    {
      id: "weak-crypto", name: "Weak Cryptographic Algorithm", severity: "medium", category: "Cryptography",
      cwe: "CWE-327", owasp: "A02:2021",
      pattern: /createHash\s*\(\s*["'](?:md5|sha1|md4|ripemd)["']\)/gi,
      detail: "Using a weak hash algorithm; vulnerable to collision attacks",
      remediation: "Use SHA-256 or stronger: crypto.createHash('sha256')",
    },
    // Prototype Pollution
    {
      id: "prototype-pollution", name: "Prototype Pollution", severity: "high", category: "Injection",
      cwe: "CWE-1321", owasp: "A03:2021",
      pattern: /(?:_\.merge|_\.defaultsDeep|_\.set|Object\.assign)\s*\(\s*(?:\{\}|[^,]+),\s*(?:req\.|params\.|query\.|body\.|input|user|data)/gi,
      detail: "Deep merge of user input can pollute Object prototype",
      remediation: "Validate input keys; avoid deep-merging untrusted data into objects",
    },
    // CORS Misconfiguration
    {
      id: "cors-misconfiguration", name: "CORS Misconfiguration", severity: "medium", category: "Security Misconfiguration",
      cwe: "CWE-942", owasp: "A05:2021",
      pattern: /(?:cors\(\s*\{[^}]*origin\s*:\s*(?:["']\*["']|true)|Access-Control-Allow-Origin['"]\s*,\s*['"]\*['"])/gi,
      detail: "Wildcard or overly permissive CORS configuration",
      remediation: "Restrict CORS origin to known, trusted domains",
    },
    // JWT Hardcoded Secret
    {
      id: "jwt-hardcoded", name: "Hardcoded JWT Secret", severity: "critical", category: "Secrets",
      cwe: "CWE-798", owasp: "A07:2021",
      pattern: /jwt\.sign\s*\([^,]+,\s*["'][^"']+["']/gi,
      detail: "JWT signed with a hardcoded secret key",
      remediation: "Load JWT secret from environment variables or a secrets manager",
    },
    // NoSQL Injection
    {
      id: "nosql-injection", name: "NoSQL Injection", severity: "critical", category: "Injection",
      cwe: "CWE-943", owasp: "A03:2021",
      pattern: /(?:find|findOne|findOneAndUpdate|updateOne|updateMany|deleteOne|deleteMany|aggregate)\s*\(\s*(?:req\.|params\.|query\.|body\.)/gi,
      detail: "User input passed directly to NoSQL query operator",
      remediation: "Validate and sanitize input; use explicit field extraction instead of passing raw objects",
    },
    // Insecure Randomness
    {
      id: "insecure-random", name: "Insecure Randomness", severity: "medium", category: "Cryptography",
      cwe: "CWE-330", owasp: "A02:2021",
      pattern: /Math\.random\s*\(\s*\).*(?:token|secret|password|key|session|nonce|csrf|salt|iv)/gi,
      detail: "Math.random() used for security-sensitive value (not cryptographically secure)",
      remediation: "Use crypto.randomBytes() or crypto.randomUUID() for security-sensitive randomness",
    },
    // Missing Helmet / Security Headers
    {
      id: "no-security-headers", name: "Missing Security Headers", severity: "medium", category: "Security Misconfiguration",
      cwe: "CWE-693", owasp: "A05:2021",
      pattern: /(?:express\s*\(\s*\)[\s\S]{0,500}(?:app\.listen|module\.exports))(?![\s\S]*helmet)/gi,
      detail: "Express app appears to be missing helmet or security header middleware",
      remediation: "Add helmet middleware: app.use(helmet())",
    },
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    // Also build multi-line context (current + next 2 lines) for patterns that span lines
    const context = lines.slice(i, Math.min(i + 3, lines.length)).join("\n");

    for (const check of checks) {
      check.pattern.lastIndex = 0; // reset regex state
      if (check.pattern.test(line) || (context.includes("\n") && (check.pattern.lastIndex = 0, check.pattern.test(context) && i === Math.min(...[i])))) {
        add({
          id: check.id,
          name: check.name,
          severity: check.severity,
          confidence: "medium" as const,
          line: lineNum,
          column: 0,
          category: check.category,
          cwe: check.cwe,
          owasp: check.owasp,
          detail: check.detail,
          evidence: line.trim(),
          remediation: check.remediation,
        });
      }
    }
  }

  return findings;
}

/* ── Custom Rules Interface ── */

export interface CustomRule {
  id: string;
  name: string;
  ruleType: "false-positive" | "false-negative" | "custom-check";
  findingId?: string;
  pattern?: string;
  patternFlags?: string;
  severity: Severity;
  cwe?: string;
  owasp?: string;
  category?: string;
  message: string;
  remediation?: string;
  confidence?: "high" | "medium" | "low";
  suppressPattern?: string;
}

/* ── Main Analysis Function ── */

export function analyzeCode(code: string, customRules?: CustomRule[]): {
  findings: ASTFinding[];
  stats: { critical: number; high: number; medium: number; low: number; total: number };
  astParsed: boolean;
  linesAnalyzed: number;
  checksPerformed: number;
  customRuleMatches: number;
} {
  const lines = code.split("\n");
  const findings: ASTFinding[] = [];
  const ast = parseCode(code);

  if (!ast) {
    // AST parsing failed — run fallback regex scanner to still catch critical/high vulns
    const fallbackFindings = fallbackRegexScan(code);
    const stats = {
      critical: fallbackFindings.filter(f => f.severity === "critical").length,
      high: fallbackFindings.filter(f => f.severity === "high").length,
      medium: fallbackFindings.filter(f => f.severity === "medium").length,
      low: fallbackFindings.filter(f => f.severity === "low").length,
      total: fallbackFindings.length,
    };
    return {
      findings: fallbackFindings,
      stats,
      astParsed: false,
      linesAnalyzed: lines.length,
      checksPerformed: 15,
      customRuleMatches: 0,
    };
  }

  const tracker = new TaintTracker();
  const funcCollector = new FunctionCollector();
  const seenFindings = new Set<string>();

  function addFinding(f: ASTFinding) {
    const key = `${f.id}:${f.line}`;
    if (seenFindings.has(key)) return;
    seenFindings.add(key);
    // Auto-attach code snippet if not already provided
    if (!f.codeSnippet && f.line > 0) {
      f.codeSnippet = buildSnippet(lines, f.line);
    }
    findings.push(f);
  }

  // Pre-pass: Collect all function definitions for inter-procedural analysis
  funcCollector.collect(ast);

  // Phase 1: Walk AST to build taint map (+ sanitizer awareness)
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
        // Destructured params: function handler({ body, query })
        if (param.type === "ObjectPattern") {
          for (const prop of param.properties || []) {
            const key = prop.value?.name || prop.key?.name;
            if (key && ["body", "query", "params", "headers", "cookies"].includes(key)) {
              tracker.markTainted(key, {
                label: `destructured ${key}`,
                sourceLine: getNodeLine(param, code),
                sourceCode: getCodeSnippet(lines, getNodeLine(param, code)),
              });
            }
          }
        }
      }
    }

    // Array destructuring: const [first, ...rest] = taintedArray
    if (node.type === "VariableDeclarator" && node.id?.type === "ArrayPattern" && node.init) {
      const initTaint = tracker.isTainted(node.init) || (isTaintSource(node.init).tainted ? {
        label: isTaintSource(node.init).label,
        sourceLine: getNodeLine(node, code),
        sourceCode: getCodeSnippet(lines, getNodeLine(node, code)),
      } : null);
      if (initTaint) {
        for (const el of node.id.elements || []) {
          if (el?.type === "Identifier") {
            tracker.markTainted(el.name, initTaint);
          } else if (el?.type === "RestElement" && el.argument?.type === "Identifier") {
            tracker.markTainted(el.argument.name, initTaint);
          }
        }
      }
    }

    // For-in / for-of loops: for (const key in taintedObj) or for (const item of taintedArr)
    if (node.type === "ForInStatement" || node.type === "ForOfStatement") {
      const rightTaint = tracker.isTainted(node.right);
      if (rightTaint && node.left?.type === "VariableDeclaration") {
        const decl = node.left.declarations?.[0];
        if (decl?.id?.type === "Identifier") {
          tracker.markTainted(decl.id.name, rightTaint);
        }
      }
    }

    // Callback parameters from tainted array methods: taintedArr.forEach(item => ...)
    // taintedArr.map(item => ...), Promise.then(result => ...)
    if (node.type === "CallExpression" && node.callee?.type === "MemberExpression") {
      const method = node.callee.property?.name || "";
      const objTaint = tracker.isTainted(node.callee.object);
      const propagateMethods = new Set(["forEach", "map", "filter", "find", "some", "every", "reduce", "flatMap", "then", "catch"]);
      if (objTaint && propagateMethods.has(method) && node.arguments.length > 0) {
        const callback = node.arguments[0];
        if (callback?.type === "ArrowFunctionExpression" || callback?.type === "FunctionExpression") {
          if (callback.params?.[0]?.type === "Identifier") {
            tracker.markTainted(callback.params[0].name, objTaint);
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
      // Skip if the arg is wrapped in a sanitizer call for this vuln type
      if (tracker.isArgSanitized(arg, sink.id)) continue;

      // Check direct taint source
      const directTaint = isTaintSource(arg);
      // Check tracked taint
      const trackedTaint = tracker.isTainted(arg);
      const taintInfo = directTaint.tainted
        ? { label: directTaint.label, sourceLine: getNodeLine(arg, code), sourceCode: getCodeSnippet(lines, getNodeLine(arg, code)) }
        : trackedTaint;

      if (taintInfo) {
        // Check if the tainted variable has been sanitized for this specific vuln
        const taintedVarName = arg.type === "Identifier" ? arg.name : (arg.object?.name || "");
        if (taintedVarName && tracker.isSanitizedFor(arg, sink.id)) continue;

        const sinkLine = getNodeLine(node, code);
        const sinkCode = getCodeSnippet(lines, sinkLine);
        const callName = resolveIdentifierName(node.callee);

        // Control-flow sensitivity: reduce confidence if guarded by validation
        let confidence: "high" | "medium" | "low" = directTaint.tainted ? "high" : "medium";
        if (taintedVarName && hasValidationGuard(node, taintedVarName, ast)) {
          confidence = confidence === "high" ? "medium" : "low";
        }

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
          confidence,
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

  // Phase 2b: Inter-procedural analysis — check calls to user-defined functions
  walkAST(ast, (node) => {
    if (node.type !== "CallExpression") return;
    const calleeName = node.callee?.name;
    if (!calleeName || !funcCollector.has(calleeName)) return;

    // Check if any argument to this call is tainted
    const taintedArgs: { index: number; info: TaintInfo }[] = [];
    for (let ai = 0; ai < (node.arguments || []).length; ai++) {
      const arg = node.arguments[ai];
      const directTaint = isTaintSource(arg);
      const trackedTaint = tracker.isTainted(arg);
      const info = directTaint.tainted
        ? { label: directTaint.label, sourceLine: getNodeLine(arg, code), sourceCode: getCodeSnippet(lines, getNodeLine(arg, code)) }
        : trackedTaint;
      if (info) taintedArgs.push({ index: ai, info });
    }

    if (taintedArgs.length === 0) return;

    // Get the function definition
    const funcDef = funcCollector.get(calleeName)!;

    // Create a temporary taint tracker for the function body
    const funcTracker = new TaintTracker();
    for (const ta of taintedArgs) {
      if (ta.index < funcDef.params.length) {
        funcTracker.markTainted(funcDef.params[ta.index], ta.info);
      }
    }

    // Walk the function body looking for sinks using the tainted params
    walkAST(funcDef.body, (innerNode) => {
      if (innerNode.type !== "CallExpression") return;

      const sink = matchesSink(innerNode);
      if (!sink) return;

      const innerArgs = sink.argIndex === -1
        ? innerNode.arguments
        : innerNode.arguments[sink.argIndex] ? [innerNode.arguments[sink.argIndex]] : [];

      for (const innerArg of innerArgs) {
        if (funcTracker.isArgSanitized(innerArg, sink.id)) continue;
        const innerTaint = funcTracker.isTainted(innerArg);
        if (innerTaint) {
          const callLine = getNodeLine(node, code);
          const sinkLine = getNodeLine(innerNode, code);

          const dataflow: DataflowStep[] = [
            { line: innerTaint.sourceLine, label: `Source: ${innerTaint.label}`, code: innerTaint.sourceCode },
            { line: callLine, label: `Call: ${calleeName}() with tainted arg`, code: getCodeSnippet(lines, callLine) },
          ];
          if (sinkLine !== callLine) {
            dataflow.push({ line: sinkLine, label: `Sink: ${resolveIdentifierName(innerNode.callee)}() inside ${calleeName}()`, code: getCodeSnippet(lines, sinkLine) });
          }

          addFinding({
            id: sink.id,
            name: `${sink.name} (via ${calleeName}())`,
            severity: sink.severity,
            confidence: "medium",
            line: callLine,
            column: getNodeColumn(node, code),
            category: sink.category,
            cwe: sink.cwe,
            owasp: sink.owasp,
            detail: `Tainted data (${innerTaint.label}) flows into ${calleeName}(), which passes it to ${resolveIdentifierName(innerNode.callee)}() without sanitization.`,
            evidence: getCodeSnippet(lines, callLine),
            dataflow,
            remediation: sink.remediation,
          });
        }
      }
    });
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

  // Phase 4: Custom rules (user-defined false-positive suppressions, false-negative detectors, custom checks)
  let customRuleMatches = 0;
  if (customRules && customRules.length > 0) {
    // Separate rule types
    const fpRules = customRules.filter(r => r.ruleType === "false-positive");
    const fnRules = customRules.filter(r => r.ruleType === "false-negative");
    const ccRules = customRules.filter(r => r.ruleType === "custom-check");

    // Apply false-positive suppressions: remove findings matching the suppressed findingId + optional pattern
    if (fpRules.length > 0) {
      const suppressIds = new Set(fpRules.map(r => r.findingId).filter(Boolean));
      const suppressPatterns = fpRules
        .filter(r => r.suppressPattern)
        .map(r => ({ findingId: r.findingId, pattern: new RegExp(r.suppressPattern!, r.patternFlags || "gi") }));

      for (let i = findings.length - 1; i >= 0; i--) {
        const f = findings[i];
        // Simple ID-based suppression
        if (suppressIds.has(f.id)) {
          // If a suppress pattern is specified, only suppress when the code at that line matches
          const hasPatternRule = suppressPatterns.find(sp => sp.findingId === f.id);
          if (hasPatternRule) {
            const lineCode = f.line > 0 && f.line <= lines.length ? lines[f.line - 1] : "";
            if (hasPatternRule.pattern.test(lineCode)) {
              findings.splice(i, 1);
              customRuleMatches++;
            }
          } else {
            findings.splice(i, 1);
            customRuleMatches++;
          }
        }
      }
    }

    // Apply false-negative detectors: regex patterns that scan for missed vulnerabilities
    for (const rule of fnRules) {
      if (!rule.pattern) continue;
      try {
        const regex = new RegExp(rule.pattern, rule.patternFlags || "gi");
        for (let i = 0; i < lines.length; i++) {
          regex.lastIndex = 0;
          if (regex.test(lines[i])) {
            // Check this finding isn't already reported at this line
            const key = `${rule.id}:${i + 1}`;
            if (!seenFindings.has(key)) {
              seenFindings.add(key);
              customRuleMatches++;
              addFinding({
                id: rule.id,
                name: rule.name,
                severity: rule.severity,
                confidence: rule.confidence || "medium",
                line: i + 1,
                column: 0,
                category: rule.category || "Custom Rule",
                cwe: rule.cwe || "",
                owasp: rule.owasp || "",
                detail: rule.message,
                evidence: lines[i].trim(),
                remediation: rule.remediation || "",
              });
            }
          }
        }
      } catch {
        // Invalid regex — skip silently
      }
    }

    // Apply custom checks: same as false-negative but categorized differently
    for (const rule of ccRules) {
      if (!rule.pattern) continue;
      try {
        const regex = new RegExp(rule.pattern, rule.patternFlags || "gi");
        for (let i = 0; i < lines.length; i++) {
          regex.lastIndex = 0;
          if (regex.test(lines[i])) {
            const key = `${rule.id}:${i + 1}`;
            if (!seenFindings.has(key)) {
              seenFindings.add(key);
              customRuleMatches++;
              addFinding({
                id: rule.id,
                name: rule.name,
                severity: rule.severity,
                confidence: rule.confidence || "medium",
                line: i + 1,
                column: 0,
                category: rule.category || "Custom Check",
                cwe: rule.cwe || "",
                owasp: rule.owasp || "",
                detail: rule.message,
                evidence: lines[i].trim(),
                remediation: rule.remediation || "",
              });
            }
          }
        }
      } catch {
        // Invalid regex — skip silently
      }
    }
  }

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
    checksPerformed: DANGEROUS_SINKS.length + PATTERN_CHECKS.length + (customRules?.length || 0),
    customRuleMatches,
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
const yaml = require("js-yaml");

const app = express();
const pool = new Pool();

// CORS: wildcard with credentials
app.use(cors({ origin: "*", credentials: true }));

// No body size limit
app.use(express.json());

// No rate limiter on login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  // Timing-unsafe comparison
  const storedHash = await getHash(username);
  if (password === storedHash) {
    // Hardcoded JWT secret, no expiry
    const token = jwt.sign({ user: username }, "my-super-secret-key-123");
    // Sensitive data logging
    console.log("User token:", token);
    res.json({ token });
  } else {
    // Error info leak
    res.json({ error: storedHash.message, stack: storedHash.stack });
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

// Hardcoded encryption key
const cipher = crypto.createCipheriv("aes-256-cbc", "hardcoded-secret-key-32bytes!!", "static-iv-16byte");

// Insecure TLS
const httpsOptions = { secureProtocol: "TLSv1_method" };

// Prototype Pollution
app.post("/api/settings", (req, res) => {
  const userSettings = req.body;
  const config = _.merge({}, defaultConfig, userSettings);
  res.json(config);
});

// Mass assignment
app.post("/api/profile", async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.user.id },
    { ...req.body }
  );
  res.json(user);
});

// Regex DoS with user-controlled RegExp
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

// setTimeout with string (eval-like)
setTimeout("processQueue()", 1000);

// Unsafe YAML deserialization
app.post("/api/import", (req, res) => {
  const data = yaml.load(req.body.yamlContent);
  res.json(data);
});

// Missing CSRF on state-changing endpoint
app.post("/api/transfer", async (req, res) => {
  const { to, amount } = req.body;
  await transferFunds(req.user.id, to, amount);
  res.json({ success: true });
});

// Weak password policy
if (password.length < 4) {
  return res.status(400).json({ error: "Too short" });
}

// NoSQL Injection
app.get("/api/profile", async (req, res) => {
  const filter = req.query.filter;
  const user = await User.findOne(filter);
  res.json(user);
});

// Insecure file permissions
fs.writeFileSync("/tmp/config.json", data, { mode: 0o777 });

// Unsafe redirect
app.get("/api/go", (req, res) => {
  res.redirect(req.query.url);
});

// Missing Helmet — server starts without security headers
app.listen(3000);
`;
