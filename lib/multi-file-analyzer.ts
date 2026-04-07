/**
 * ShieldX Multi-File SAST Analyzer
 *
 * Orchestrates cross-file taint tracking and vulnerability detection across
 * a project's source files. Code is processed entirely in-memory — nothing
 * is stored.
 *
 * Designed for:
 *   1. ZIP / folder upload (frontend unzips client-side, sends JSON map)
 *   2. GitHub integration (fetch files via API, stream to analyzer)
 *   3. CLI tool (read fs, POST to API)
 *
 * Architecture:
 *   Phase 1 — Per-file scan: run existing AST/pattern engines on each file
 *   Phase 2 — Cross-file analysis: build an import/export graph, track
 *             exports of tainted data, sinks that consume imports
 *   Phase 3 — Merge & deduplicate findings, add cross-file dataflow paths
 */

import { analyzeCode, type ASTFinding } from "./ast-analyzer";
import { scanCode, type PatternFinding, type Language } from "./pattern-scanner";

/* ── Types ── */

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface MultiFileFinding extends ASTFinding {
  /** The file this finding originates from */
  file: string;
  /** For cross-file findings: the full cross-file dataflow chain */
  crossFileDataflow?: CrossFileStep[];
  /** Reference links for this vulnerability class */
  references?: VulnReference[];
}

export interface CrossFileStep {
  file: string;
  line: number;
  label: string;
  code: string;
}

export interface VulnReference {
  title: string;
  url: string;
  type: "cwe" | "owasp" | "blog" | "docs" | "cve";
}

export interface FileEntry {
  path: string;
  content: string;
  language?: string;
}

export interface MultiFileResult {
  findings: MultiFileFinding[];
  stats: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  fileCount: number;
  totalLines: number;
  totalChecks: number;
  crossFileFindings: number;
  fileBreakdown: FileBreakdown[];
  scanDurationMs: number;
}

export interface FileBreakdown {
  file: string;
  language: string;
  lines: number;
  findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

/* ── Language Detection ── */

const EXT_TO_LANG: Record<string, string> = {
  ".js": "javascript",
  ".jsx": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".ts": "typescript",
  ".tsx": "typescript",
  ".mts": "typescript",
  ".java": "java",
  ".cpp": "cpp",
  ".cc": "cpp",
  ".cxx": "cpp",
  ".c": "cpp",
  ".h": "cpp",
  ".hpp": "cpp",
  ".cs": "csharp",
};

function detectLanguage(filePath: string): string | null {
  const ext = filePath.slice(filePath.lastIndexOf(".")).toLowerCase();
  return EXT_TO_LANG[ext] || null;
}

/* ── Vulnerability Reference Database ── */

const VULN_REFERENCES: Record<string, VulnReference[]> = {
  // SQL Injection
  "sql-injection": [
    { title: "CWE-89: SQL Injection", url: "https://cwe.mitre.org/data/definitions/89.html", type: "cwe" },
    { title: "OWASP SQL Injection", url: "https://owasp.org/www-community/attacks/SQL_Injection", type: "owasp" },
    { title: "OWASP Testing Guide: SQL Injection", url: "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection", type: "docs" },
  ],
  "java-sql-injection": [
    { title: "CWE-89: SQL Injection", url: "https://cwe.mitre.org/data/definitions/89.html", type: "cwe" },
    { title: "OWASP SQL Injection Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html", type: "owasp" },
    { title: "Java PreparedStatement Tutorial", url: "https://docs.oracle.com/javase/tutorial/jdbc/basics/prepared.html", type: "docs" },
  ],
  "cs-sql-injection": [
    { title: "CWE-89: SQL Injection", url: "https://cwe.mitre.org/data/definitions/89.html", type: "cwe" },
    { title: "SqlParameter Class (Microsoft Docs)", url: "https://learn.microsoft.com/en-us/dotnet/api/system.data.sqlclient.sqlparameter", type: "docs" },
  ],

  // XSS
  "xss-reflected": [
    { title: "CWE-79: Cross-site Scripting (XSS)", url: "https://cwe.mitre.org/data/definitions/79.html", type: "cwe" },
    { title: "OWASP XSS Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html", type: "owasp" },
    { title: "OWASP Testing Guide: Reflected XSS", url: "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/01-Testing_for_Reflected_Cross_Site_Scripting", type: "docs" },
  ],
  "xss-dom": [
    { title: "CWE-79: Cross-site Scripting (XSS)", url: "https://cwe.mitre.org/data/definitions/79.html", type: "cwe" },
    { title: "OWASP DOM-Based XSS Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html", type: "owasp" },
  ],
  "java-xss": [
    { title: "CWE-79: Cross-site Scripting (XSS)", url: "https://cwe.mitre.org/data/definitions/79.html", type: "cwe" },
    { title: "OWASP Java Encoder Project", url: "https://owasp.org/www-project-java-encoder/", type: "owasp" },
  ],
  "cs-xss": [
    { title: "CWE-79: Cross-site Scripting (XSS)", url: "https://cwe.mitre.org/data/definitions/79.html", type: "cwe" },
    { title: "Prevent XSS in ASP.NET Core", url: "https://learn.microsoft.com/en-us/aspnet/core/security/cross-site-scripting", type: "docs" },
  ],

  // Command Injection
  "command-injection": [
    { title: "CWE-78: OS Command Injection", url: "https://cwe.mitre.org/data/definitions/78.html", type: "cwe" },
    { title: "OWASP Command Injection", url: "https://owasp.org/www-community/attacks/Command_Injection", type: "owasp" },
    { title: "Node.js child_process Security", url: "https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback", type: "docs" },
  ],
  "java-command-injection": [
    { title: "CWE-78: OS Command Injection", url: "https://cwe.mitre.org/data/definitions/78.html", type: "cwe" },
    { title: "OWASP OS Command Injection Defense", url: "https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html", type: "owasp" },
  ],
  "cpp-command-injection": [
    { title: "CWE-78: OS Command Injection", url: "https://cwe.mitre.org/data/definitions/78.html", type: "cwe" },
    { title: "CERT C: ENV33-C", url: "https://wiki.sei.cmu.edu/confluence/display/c/ENV33-C.+Do+not+call+system()", type: "docs" },
  ],

  // Path Traversal
  "path-traversal": [
    { title: "CWE-22: Path Traversal", url: "https://cwe.mitre.org/data/definitions/22.html", type: "cwe" },
    { title: "OWASP Path Traversal", url: "https://owasp.org/www-community/attacks/Path_Traversal", type: "owasp" },
  ],
  "java-path-traversal": [
    { title: "CWE-22: Path Traversal", url: "https://cwe.mitre.org/data/definitions/22.html", type: "cwe" },
    { title: "Java Path.normalize()", url: "https://docs.oracle.com/javase/8/docs/api/java/nio/file/Path.html#normalize--", type: "docs" },
  ],

  // SSRF
  "ssrf": [
    { title: "CWE-918: Server-Side Request Forgery", url: "https://cwe.mitre.org/data/definitions/918.html", type: "cwe" },
    { title: "OWASP SSRF Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html", type: "owasp" },
  ],
  "java-ssrf": [
    { title: "CWE-918: Server-Side Request Forgery", url: "https://cwe.mitre.org/data/definitions/918.html", type: "cwe" },
    { title: "OWASP SSRF Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html", type: "owasp" },
  ],

  // NoSQL Injection
  "nosql-injection": [
    { title: "CWE-943: NoSQL Injection", url: "https://cwe.mitre.org/data/definitions/943.html", type: "cwe" },
    { title: "OWASP NoSQL Injection", url: "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection", type: "owasp" },
  ],

  // Code Injection
  "code-injection": [
    { title: "CWE-94: Code Injection", url: "https://cwe.mitre.org/data/definitions/94.html", type: "cwe" },
    { title: "OWASP Code Injection", url: "https://owasp.org/www-community/attacks/Code_Injection", type: "owasp" },
  ],

  // Prototype Pollution
  "prototype-pollution": [
    { title: "CWE-1321: Prototype Pollution", url: "https://cwe.mitre.org/data/definitions/1321.html", type: "cwe" },
    { title: "Prototype Pollution Deep Dive", url: "https://owasp.org/www-community/vulnerabilities/Prototype_Pollution", type: "blog" },
  ],

  // Weak Crypto
  "weak-crypto": [
    { title: "CWE-327: Broken Cryptographic Algorithm", url: "https://cwe.mitre.org/data/definitions/327.html", type: "cwe" },
    { title: "OWASP Cryptographic Failures", url: "https://owasp.org/Top10/A02_2021-Cryptographic_Failures/", type: "owasp" },
  ],
  "java-weak-crypto": [
    { title: "CWE-327: Broken Cryptographic Algorithm", url: "https://cwe.mitre.org/data/definitions/327.html", type: "cwe" },
    { title: "Java Cryptography Architecture Guide", url: "https://docs.oracle.com/javase/8/docs/technotes/guides/security/crypto/CryptoSpec.html", type: "docs" },
  ],

  // Buffer Overflow
  "cpp-buffer-overflow": [
    { title: "CWE-120: Buffer Overflow", url: "https://cwe.mitre.org/data/definitions/120.html", type: "cwe" },
    { title: "CERT C: STR31-C", url: "https://wiki.sei.cmu.edu/confluence/display/c/STR31-C.+Guarantee+that+storage+for+strings+has+sufficient+space+for+character+data+and+the+null+terminator", type: "docs" },
  ],

  // Format String
  "cpp-format-string": [
    { title: "CWE-134: Format String Vulnerability", url: "https://cwe.mitre.org/data/definitions/134.html", type: "cwe" },
    { title: "OWASP Format String Attack", url: "https://owasp.org/www-community/attacks/Format_string_attack", type: "owasp" },
  ],

  // XXE
  "java-xxe": [
    { title: "CWE-611: XXE Processing", url: "https://cwe.mitre.org/data/definitions/611.html", type: "cwe" },
    { title: "OWASP XXE Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html", type: "owasp" },
  ],
  "cs-xxe": [
    { title: "CWE-611: XXE Processing", url: "https://cwe.mitre.org/data/definitions/611.html", type: "cwe" },
    { title: "OWASP XXE Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html", type: "owasp" },
  ],

  // Insecure Deserialization
  "java-deserialization": [
    { title: "CWE-502: Deserialization of Untrusted Data", url: "https://cwe.mitre.org/data/definitions/502.html", type: "cwe" },
    { title: "OWASP Deserialization Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Deserialization_Cheat_Sheet.html", type: "owasp" },
  ],
  "cs-insecure-deserialization": [
    { title: "CWE-502: Deserialization of Untrusted Data", url: "https://cwe.mitre.org/data/definitions/502.html", type: "cwe" },
    { title: "Microsoft: Deserialization risks", url: "https://learn.microsoft.com/en-us/dotnet/standard/serialization/binaryformatter-security-guide", type: "docs" },
  ],

  // LDAP Injection
  "java-ldap-injection": [
    { title: "CWE-90: LDAP Injection", url: "https://cwe.mitre.org/data/definitions/90.html", type: "cwe" },
    { title: "OWASP LDAP Injection Prevention", url: "https://cheatsheetseries.owasp.org/cheatsheets/LDAP_Injection_Prevention_Cheat_Sheet.html", type: "owasp" },
  ],

  // Open Redirect
  "open-redirect": [
    { title: "CWE-601: Open Redirect", url: "https://cwe.mitre.org/data/definitions/601.html", type: "cwe" },
    { title: "OWASP Unvalidated Redirects", url: "https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html", type: "owasp" },
  ],
  "cs-open-redirect": [
    { title: "CWE-601: Open Redirect", url: "https://cwe.mitre.org/data/definitions/601.html", type: "cwe" },
    { title: "ASP.NET Core: Prevent open redirect attacks", url: "https://learn.microsoft.com/en-us/aspnet/core/security/preventing-open-redirects", type: "docs" },
  ],

  // CSRF
  "cs-csrf-disabled": [
    { title: "CWE-352: Cross-Site Request Forgery", url: "https://cwe.mitre.org/data/definitions/352.html", type: "cwe" },
    { title: "OWASP CSRF Prevention Cheat Sheet", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html", type: "owasp" },
  ],

  // Hardcoded Secrets / Credentials
  "java-hardcoded-secret": [
    { title: "CWE-798: Hard-coded Credentials", url: "https://cwe.mitre.org/data/definitions/798.html", type: "cwe" },
    { title: "OWASP: Hard-coded password", url: "https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password", type: "owasp" },
  ],
  "cs-hardcoded-secret": [
    { title: "CWE-798: Hard-coded Credentials", url: "https://cwe.mitre.org/data/definitions/798.html", type: "cwe" },
    { title: "Azure Key Vault for .NET", url: "https://learn.microsoft.com/en-us/azure/key-vault/general/overview", type: "docs" },
  ],
  "hardcoded-secret": [
    { title: "CWE-798: Hard-coded Credentials", url: "https://cwe.mitre.org/data/definitions/798.html", type: "cwe" },
    { title: "OWASP: Hard-coded password", url: "https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password", type: "owasp" },
  ],

  // CORS
  "cors-misconfig": [
    { title: "CWE-942: Permissive CORS Policy", url: "https://cwe.mitre.org/data/definitions/942.html", type: "cwe" },
    { title: "OWASP CORS Misconfiguration", url: "https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/07-Testing_Cross_Origin_Resource_Sharing", type: "owasp" },
  ],

  // Timing Attack
  "timing-attack": [
    { title: "CWE-208: Observable Timing Discrepancy", url: "https://cwe.mitre.org/data/definitions/208.html", type: "cwe" },
    { title: "Node.js crypto.timingSafeEqual", url: "https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b", type: "docs" },
  ],

  // Log Injection
  "log-injection": [
    { title: "CWE-117: Log Injection", url: "https://cwe.mitre.org/data/definitions/117.html", type: "cwe" },
    { title: "OWASP Log Injection", url: "https://owasp.org/www-community/attacks/Log_Injection", type: "owasp" },
  ],
  "java-log-injection": [
    { title: "CWE-117: Log Injection", url: "https://cwe.mitre.org/data/definitions/117.html", type: "cwe" },
    { title: "OWASP Log Injection", url: "https://owasp.org/www-community/attacks/Log_Injection", type: "owasp" },
  ],
  "cs-log-injection": [
    { title: "CWE-117: Log Injection", url: "https://cwe.mitre.org/data/definitions/117.html", type: "cwe" },
    { title: "OWASP Log Injection", url: "https://owasp.org/www-community/attacks/Log_Injection", type: "owasp" },
  ],

  // ReDoS
  "redos": [
    { title: "CWE-1333: ReDoS", url: "https://cwe.mitre.org/data/definitions/1333.html", type: "cwe" },
    { title: "OWASP ReDoS", url: "https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS", type: "owasp" },
  ],

  // Insecure Cookie
  "cs-insecure-cookie": [
    { title: "CWE-614: Sensitive Cookie Without 'Secure' Flag", url: "https://cwe.mitre.org/data/definitions/614.html", type: "cwe" },
    { title: "OWASP Secure Cookie Attribute", url: "https://owasp.org/www-community/controls/SecureCookieAttribute", type: "owasp" },
  ],

  // Race Condition
  "cpp-race-condition": [
    { title: "CWE-362: Race Condition", url: "https://cwe.mitre.org/data/definitions/362.html", type: "cwe" },
    { title: "CERT C: CON33-C", url: "https://wiki.sei.cmu.edu/confluence/display/c/CON33-C.+Avoid+race+conditions+when+using+library+functions", type: "docs" },
  ],

  // Use After Free
  "cpp-use-after-free": [
    { title: "CWE-416: Use After Free", url: "https://cwe.mitre.org/data/definitions/416.html", type: "cwe" },
    { title: "CERT C: MEM30-C", url: "https://wiki.sei.cmu.edu/confluence/display/c/MEM30-C.+Do+not+access+freed+memory", type: "docs" },
  ],

  // Integer Overflow
  "cpp-integer-overflow": [
    { title: "CWE-190: Integer Overflow", url: "https://cwe.mitre.org/data/definitions/190.html", type: "cwe" },
    { title: "CERT C: INT32-C", url: "https://wiki.sei.cmu.edu/confluence/display/c/INT32-C.+Ensure+that+operations+on+signed+integers+do+not+result+in+overflow", type: "docs" },
  ],

  // Developer Exception Page
  "cs-dev-exception-page": [
    { title: "CWE-209: Information Exposure Through Error Message", url: "https://cwe.mitre.org/data/definitions/209.html", type: "cwe" },
    { title: "ASP.NET Core: Error handling", url: "https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling", type: "docs" },
  ],
};

/** Get references for a finding ID, with fallback to generic CWE lookup */
export function getReferences(findingId: string): VulnReference[] {
  if (VULN_REFERENCES[findingId]) return VULN_REFERENCES[findingId];

  // Try generic prefix: "java-sql-injection" → try "sql-injection"
  const parts = findingId.split("-");
  if (parts.length > 2) {
    const generic = parts.slice(1).join("-");
    if (VULN_REFERENCES[generic]) return VULN_REFERENCES[generic];
  }

  return [];
}

/* ── Cross-File Import/Export Analysis ── */

interface ExportedSymbol {
  file: string;
  name: string;
  isTainted: boolean;
  taintSource?: string;
  line: number;
}

interface ImportedSymbol {
  file: string;
  fromFile: string;
  localName: string;
  importedName: string;
  line: number;
}

// JS/TS import patterns
const JS_IMPORT_RE = /(?:import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]|const\s+(?:{([^}]+)}|(\w+))\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
const JS_EXPORT_RE = /(?:export\s+(?:default\s+)?(?:function|const|let|var|class)\s+(\w+)|module\.exports\s*(?:\.\w+)?\s*=\s*(?:function\s+)?(\w+|{[^}]+}))/g;

// Java import patterns
const JAVA_IMPORT_RE = /import\s+([\w.]+(?:\.\*)?)\s*;/g;

// C# using patterns
const CS_USING_RE = /using\s+(?:static\s+)?([\w.]+)\s*;/g;

// C++ include patterns
const CPP_INCLUDE_RE = /#include\s*["<]([^">]+)[">]/g;

function extractJSImports(code: string, filePath: string): ImportedSymbol[] {
  const imports: ImportedSymbol[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(JS_IMPORT_RE.source, "g");

  const lines = code.split("\n");

  while ((m = re.exec(code)) !== null) {
    const lineNum = code.substring(0, m.index).split("\n").length;
    const namedImports = m[1] || m[4]; // { a, b } destructured
    const defaultImport = m[2] || m[5]; // import X or const X
    const fromPath = m[3] || m[6];

    if (!fromPath || !fromPath.startsWith(".")) continue; // Only local imports

    if (namedImports) {
      for (const part of namedImports.split(",")) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const [imported, ...rest] = trimmed.split(/\s+as\s+/);
        const local = rest[0] || imported;
        imports.push({
          file: filePath,
          fromFile: fromPath.trim(),
          localName: local.trim(),
          importedName: imported.trim(),
          line: lineNum,
        });
      }
    }

    if (defaultImport) {
      imports.push({
        file: filePath,
        fromFile: fromPath.trim(),
        localName: defaultImport.trim(),
        importedName: "default",
        line: lineNum,
      });
    }
  }

  return imports;
}

function extractJSExports(code: string, filePath: string): ExportedSymbol[] {
  const exports: ExportedSymbol[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(JS_EXPORT_RE.source, "g");

  while ((m = re.exec(code)) !== null) {
    const lineNum = code.substring(0, m.index).split("\n").length;
    const name = m[1] || m[2];
    if (name && !name.startsWith("{")) {
      exports.push({ file: filePath, name: name.trim(), isTainted: false, line: lineNum });
    }
  }

  return exports;
}

/** Resolve a relative import path against the importing file's directory */
function resolveImportPath(importingFile: string, importPath: string, availableFiles: string[]): string | null {
  // Normalize the importing file directory
  const dir = importingFile.substring(0, importingFile.lastIndexOf("/") + 1);
  let resolved = dir + importPath;

  // Normalize ".." and "."
  const parts = resolved.split("/").filter(Boolean);
  const stack: string[] = [];
  for (const p of parts) {
    if (p === "..") stack.pop();
    else if (p !== ".") stack.push(p);
  }
  resolved = stack.join("/");

  // Try exact match, then with extensions
  const extensions = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".java", ".cs", ".cpp", ".h"];
  for (const ext of extensions) {
    const candidate = resolved + ext;
    if (availableFiles.includes(candidate)) return candidate;
  }

  // Try /index.* pattern
  for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
    const candidate = resolved + "/index" + ext;
    if (availableFiles.includes(candidate)) return candidate;
  }

  return null;
}

/* ── Taint Source Detection (per-file quick check) ── */

const TAINT_INDICATORS = [
  "req.query", "req.body", "req.params", "req.headers", "req.cookies",
  "request.getParameter", "request.getHeader", "request.getCookies",
  "Request.Query", "Request.Form", "Request.Headers",
  "process.env", "args[", "argv[",
  "window.location", "document.URL", "location.hash",
];

function codeContainsTaintSource(code: string): boolean {
  const lower = code.toLowerCase();
  return TAINT_INDICATORS.some(t => lower.includes(t.toLowerCase()));
}

/* ── Main Multi-File Analyzer ── */

export function analyzeMultipleFiles(files: FileEntry[]): MultiFileResult {
  const start = Date.now();
  const allFindings: MultiFileFinding[] = [];
  const fileBreakdown: FileBreakdown[] = [];
  let totalLines = 0;
  let totalChecks = 0;
  let crossFileCount = 0;

  // Filter to scannable files only
  const scannableFiles = files.filter(f => detectLanguage(f.path) !== null);

  if (scannableFiles.length === 0) {
    return {
      findings: [],
      stats: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
      fileCount: 0,
      totalLines: 0,
      totalChecks: 0,
      crossFileFindings: 0,
      fileBreakdown: [],
      scanDurationMs: Date.now() - start,
    };
  }

  const fileMap = new Map<string, FileEntry>();
  for (const f of scannableFiles) {
    fileMap.set(f.path, f);
  }
  const allPaths = Array.from(fileMap.keys());

  // ── Phase 1: Per-file scanning ──
  const perFileFindings = new Map<string, MultiFileFinding[]>();
  const perFileTaintedExports = new Map<string, Set<string>>(); // file → set of exported tainted names

  for (const file of scannableFiles) {
    const lang = file.language || detectLanguage(file.path)!;
    const lines = file.content.split("\n").length;
    totalLines += lines;

    let findings: (ASTFinding | PatternFinding)[] = [];
    let checks = 0;

    try {
      if (lang === "javascript" || lang === "typescript") {
        const result = analyzeCode(file.content);
        findings = result.findings;
        checks = result.checksPerformed;
      } else if (lang === "java" || lang === "cpp" || lang === "csharp") {
        const result = scanCode(file.content, lang as Language);
        findings = result.findings;
        checks = result.checksPerformed;
      }
    } catch {
      // Skip files that fail to parse
    }

    totalChecks += checks;

    const multiFindings: MultiFileFinding[] = findings.map(f => ({
      ...f,
      file: file.path,
      references: getReferences(f.id),
    }));

    perFileFindings.set(file.path, multiFindings);
    allFindings.push(...multiFindings);

    // Track tainted exports for cross-file analysis
    if (lang === "javascript" || lang === "typescript") {
      const exports = extractJSExports(file.content, file.path);
      const hasTaint = codeContainsTaintSource(file.content);

      if (hasTaint) {
        const taintedNames = new Set<string>();
        for (const exp of exports) {
          // If the file has taint sources, mark exported functions/vars as potentially tainted
          taintedNames.add(exp.name);
        }
        perFileTaintedExports.set(file.path, taintedNames);
      }
    }

    const bd: FileBreakdown = {
      file: file.path,
      language: lang,
      lines,
      findings: multiFindings.length,
      critical: multiFindings.filter(f => f.severity === "critical").length,
      high: multiFindings.filter(f => f.severity === "high").length,
      medium: multiFindings.filter(f => f.severity === "medium").length,
      low: multiFindings.filter(f => f.severity === "low").length,
    };
    fileBreakdown.push(bd);
  }

  // ── Phase 2: Cross-file analysis (JS/TS only for now) ──
  const jsFiles = scannableFiles.filter(f => {
    const lang = f.language || detectLanguage(f.path);
    return lang === "javascript" || lang === "typescript";
  });

  for (const file of jsFiles) {
    const imports = extractJSImports(file.content, file.path);

    for (const imp of imports) {
      const resolvedFrom = resolveImportPath(file.path, imp.fromFile, allPaths);
      if (!resolvedFrom) continue;

      const taintedExports = perFileTaintedExports.get(resolvedFrom);
      if (!taintedExports) continue;

      // Check if this import name matches a tainted export
      const isTainted = imp.importedName === "default"
        ? taintedExports.size > 0  // default export from tainted file
        : taintedExports.has(imp.importedName);

      if (!isTainted) continue;

      // Now check if the local name is used in any sink in the current file's findings
      const fileFindings = perFileFindings.get(file.path) || [];

      // Also re-scan looking for the imported name being used in sinks
      // Check if local name appears in evidence/code of existing findings
      for (const finding of fileFindings) {
        if (finding.evidence?.includes(imp.localName) || finding.detail?.includes(imp.localName)) {
          // Enhance this finding with cross-file dataflow
          finding.crossFileDataflow = [
            {
              file: resolvedFrom,
              line: 0,
              label: `Taint source in ${resolvedFrom}`,
              code: "User input processed and exported",
            },
            {
              file: file.path,
              line: imp.line,
              label: `Imported as ${imp.localName}`,
              code: `import { ${imp.importedName} } from '${imp.fromFile}'`,
            },
            {
              file: file.path,
              line: finding.line,
              label: `Sink: ${finding.name}`,
              code: finding.evidence || "",
            },
          ];
          finding.confidence = "high"; // Cross-file taint confirmation = high confidence
          crossFileCount++;
        }
      }

      // Check for tainted data flowing through imported functions that are called
      // with user input from the current file
      const currentFileTainted = codeContainsTaintSource(file.content);
      if (currentFileTainted) {
        // Look for calls to the imported function with taint data
        const callPattern = new RegExp(
          `${imp.localName}\\s*\\(`,
          "g"
        );
        const lines = file.content.split("\n");
        let match: RegExpExecArray | null;

        while ((match = callPattern.exec(file.content)) !== null) {
          const callLine = file.content.substring(0, match.index).split("\n").length;
          const lineText = lines[callLine - 1]?.trim() || "";

          // Check if the call line context contains tainted variables
          const hasTaintedArg = TAINT_INDICATORS.some(t =>
            lineText.toLowerCase().includes(t.toLowerCase())
          );

          if (hasTaintedArg) {
            // Check if there's already a finding on this line
            const existingOnLine = allFindings.find(
              f => f.file === file.path && f.line === callLine
            );
            if (existingOnLine) {
              existingOnLine.crossFileDataflow = [
                {
                  file: file.path,
                  line: callLine,
                  label: "Tainted argument passed to imported function",
                  code: lineText,
                },
                {
                  file: resolvedFrom,
                  line: 0,
                  label: `Function ${imp.importedName}() processes tainted data`,
                  code: `Sinks inside ${resolvedFrom} may be vulnerable`,
                },
              ];
              crossFileCount++;
            }
          }
        }
      }
    }
  }

  // ── Phase 3: Deduplicate and sort ──
  const seen = new Set<string>();
  const deduped = allFindings.filter(f => {
    const key = `${f.file}:${f.line}:${f.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort: critical first, then by file, then by line
  const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  deduped.sort((a, b) =>
    (order[a.severity] ?? 4) - (order[b.severity] ?? 4) ||
    a.file.localeCompare(b.file) ||
    a.line - b.line
  );

  const stats = {
    critical: deduped.filter(f => f.severity === "critical").length,
    high: deduped.filter(f => f.severity === "high").length,
    medium: deduped.filter(f => f.severity === "medium").length,
    low: deduped.filter(f => f.severity === "low").length,
    total: deduped.length,
  };

  return {
    findings: deduped,
    stats,
    fileCount: scannableFiles.length,
    totalLines,
    totalChecks,
    crossFileFindings: crossFileCount,
    fileBreakdown: fileBreakdown.sort((a, b) => b.findings - a.findings),
    scanDurationMs: Date.now() - start,
  };
}
