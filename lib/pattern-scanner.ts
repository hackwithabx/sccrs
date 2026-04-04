/**
 * ShieldX Multi-Language Pattern-Based SAST Scanner
 *
 * Scans Java, C++, and C# code for security vulnerabilities using
 * regex pattern matching with line-by-line taint tracking.
 *
 * For JavaScript/TypeScript, the AST-based analyzer in ast-analyzer.ts
 * is preferred. This scanner covers languages where we can't do full AST parsing
 * in a serverless environment without native dependencies.
 */

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Language = "java" | "cpp" | "csharp";

export interface PatternFinding {
  id: string;
  name: string;
  severity: Severity;
  confidence: "high" | "medium" | "low";
  line: number;
  column: number;
  category: string;
  cwe: string;
  owasp: string;
  detail: string;
  evidence: string;
  dataflow?: { line: number; label: string; code: string }[];
  remediation: string;
}

/* ── Rule Definition ── */

interface VulnRule {
  id: string;
  name: string;
  severity: Severity;
  category: string;
  cwe: string;
  owasp: string;
  /** Regex to match the vulnerable pattern */
  pattern: RegExp;
  /** Optional: only fire if a tainted variable is in the match */
  requiresTaint?: boolean;
  /** Strings that, if found on the same line, suppress this rule */
  suppressors?: string[];
  detail: string | ((match: RegExpExecArray, line: string) => string);
  remediation: string;
  confidence: "high" | "medium" | "low";
}

/* ── Taint sources by language ── */

const TAINT_SOURCES_JAVA: RegExp[] = [
  /(?:getParameter|getQueryString|getHeader|getCookies|getInputStream|getReader|getPart|getPathInfo|getRequestURI|getRequestURL)\s*\(/,
  /request\.get(?:Parameter|Header|QueryString|Attribute|InputStream|Reader)\s*\(/,
  /\@RequestParam|@PathVariable|@RequestBody|@RequestHeader|@CookieValue/,
  /Scanner\s*\(\s*System\.in\s*\)/,
  /BufferedReader.*InputStreamReader.*System\.in/,
];

const TAINT_SOURCES_CPP: RegExp[] = [
  /std::cin\s*>>/,
  /scanf\s*\(/,
  /gets\s*\(/,
  /fgets\s*\(.+stdin/,
  /getenv\s*\(/,
  /argv\s*\[/,
  /getline\s*\(\s*(?:std::)?cin/,
  /read\s*\(\s*(?:STDIN_FILENO|0)\s*,/,
];

const TAINT_SOURCES_CSHARP: RegExp[] = [
  /Request\.(?:Query|Form|Headers|Cookies|Body|Path|QueryString)\s*\[/,
  /Request\.(?:Query|Form|Headers|Cookies|Body|Path|QueryString)(?:\.|$)/,
  /\[FromQuery\]|\[FromBody\]|\[FromRoute\]|\[FromHeader\]|\[FromForm\]/,
  /HttpContext\.Request/,
  /Console\.ReadLine\s*\(/,
  /Environment\.GetEnvironmentVariable\s*\(/,
];

/* ══════════════════════════════════════════════
   JAVA RULES
   ══════════════════════════════════════════════ */

const JAVA_RULES: VulnRule[] = [
  // SQL injection
  {
    id: "java-sql-injection", name: "SQL Injection", severity: "critical",
    category: "Injection", cwe: "CWE-89", owasp: "A03:2021",
    pattern: /(?:executeQuery|executeUpdate|execute|prepareStatement|createQuery|createNativeQuery)\s*\(\s*(?:"[^"]*"\s*\+|.*\+\s*")/,
    suppressors: ["PreparedStatement", "setString", "setInt", "setLong", "?"],
    detail: "SQL query built via string concatenation with potential user input. This enables SQL injection.",
    remediation: "Use PreparedStatement with parameterized queries: PreparedStatement ps = conn.prepareStatement(\"SELECT * FROM users WHERE id = ?\"); ps.setString(1, userId);",
    confidence: "high",
  },
  {
    id: "java-sql-injection-string-format", name: "SQL Injection via String.format", severity: "critical",
    category: "Injection", cwe: "CWE-89", owasp: "A03:2021",
    pattern: /(?:executeQuery|executeUpdate|execute)\s*\(\s*String\.format\s*\(/,
    detail: "SQL query built via String.format() — equivalent to string concatenation for injection purposes.",
    remediation: "Use PreparedStatement with placeholder parameters instead of String.format for SQL queries.",
    confidence: "high",
  },
  // Command injection
  {
    id: "java-command-injection", name: "Command Injection", severity: "critical",
    category: "Injection", cwe: "CWE-78", owasp: "A03:2021",
    pattern: /Runtime\.getRuntime\s*\(\s*\)\s*\.exec\s*\(/,
    requiresTaint: true,
    detail: "Runtime.exec() with potentially user-controlled input enables OS command injection.",
    remediation: "Use ProcessBuilder with a String array (not a single string). Validate and allowlist commands. Never pass user input to shell commands.",
    confidence: "high",
  },
  {
    id: "java-processbuilder-injection", name: "Command Injection via ProcessBuilder", severity: "high",
    category: "Injection", cwe: "CWE-78", owasp: "A03:2021",
    pattern: /new\s+ProcessBuilder\s*\(\s*(?:Arrays\.asList\s*\()?\s*(?:"(?:cmd|\/bin\/sh|\/bin\/bash|bash|sh|powershell)"|"cmd\.exe")/,
    detail: "ProcessBuilder invokes a shell interpreter — if arguments include user input, this is command injection.",
    remediation: "Avoid invoking shell interpreters. Use ProcessBuilder with explicit command + args array without shell wrapping.",
    confidence: "high",
  },
  // Path traversal
  {
    id: "java-path-traversal", name: "Path Traversal", severity: "high",
    category: "Access Control", cwe: "CWE-22", owasp: "A01:2021",
    pattern: /new\s+File\s*\(\s*(?:[^)]*\+|.*request\.get)/,
    detail: "File path constructed with user input without validation — allows reading/writing arbitrary files (../../etc/passwd).",
    remediation: "Use Path.normalize() and verify the canonical path stays within the allowed base directory. Reject paths containing '..'.",
    confidence: "medium",
  },
  // XSS
  {
    id: "java-xss", name: "Cross-Site Scripting (XSS)", severity: "high",
    category: "Injection", cwe: "CWE-79", owasp: "A03:2021",
    pattern: /(?:getWriter|getOutputStream)\s*\(\s*\)\s*\.(?:print|println|write|append)\s*\(/,
    requiresTaint: true,
    detail: "User input written directly to HTTP response without encoding — reflected XSS vulnerability.",
    remediation: "Use output encoding: ESAPI.encoder().encodeForHTML(input) or use a template engine with auto-escaping (Thymeleaf, FreeMarker).",
    confidence: "medium",
  },
  // Insecure deserialization
  {
    id: "java-insecure-deserialization", name: "Insecure Deserialization", severity: "critical",
    category: "Deserialization", cwe: "CWE-502", owasp: "A08:2021",
    pattern: /(?:ObjectInputStream|XMLDecoder)\s*\(|\.readObject\s*\(\s*\)|\.readUnshared\s*\(\s*\)/,
    detail: "Java deserialization of untrusted data can lead to remote code execution. ObjectInputStream.readObject() is inherently dangerous.",
    remediation: "Never deserialize untrusted data. Use ObjectInputFilter (JEP 290) to allowlist safe classes. Prefer JSON/protobuf for data exchange.",
    confidence: "high",
  },
  // XXE
  {
    id: "java-xxe", name: "XML External Entity (XXE)", severity: "high",
    category: "Injection", cwe: "CWE-611", owasp: "A05:2021",
    pattern: /(?:DocumentBuilderFactory|SAXParserFactory|XMLInputFactory|TransformerFactory|SchemaFactory|XMLReader)\.new(?:Instance|Factory)\s*\(/,
    suppressors: ["setFeature", "FEATURE_SECURE_PROCESSING", "DISALLOW_DOCTYPE_DECL", "EXTERNAL_GENERAL_ENTITIES"],
    detail: "XML parser created without disabling external entities — vulnerable to XXE attacks (file disclosure, SSRF, DoS).",
    remediation: "Disable external entities: factory.setFeature(\"http://apache.org/xml/features/disallow-doctype-decl\", true); or use setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true).",
    confidence: "medium",
  },
  // Weak crypto
  {
    id: "java-weak-crypto", name: "Weak Cryptographic Algorithm", severity: "high",
    category: "Cryptography", cwe: "CWE-327", owasp: "A02:2021",
    pattern: /(?:MessageDigest|Cipher|SecretKeySpec|Mac)\.getInstance\s*\(\s*"(MD5|SHA-?1|DES|RC4|RC2|DESede|Blowfish)"/i,
    detail: (match) => `${match[1]} is cryptographically broken or deprecated. Collisions/breaks are practical.`,
    remediation: "Use SHA-256/SHA-3 for hashing, AES-256-GCM for encryption. For passwords, use BCrypt, SCrypt, or Argon2.",
    confidence: "high",
  },
  // Hardcoded secrets
  {
    id: "java-hardcoded-secret", name: "Hardcoded Secret", severity: "high",
    category: "Secrets", cwe: "CWE-798", owasp: "A07:2021",
    pattern: /(?:private|public|protected|static|final)*\s*String\s+(?:password|passwd|secret|apiKey|api_key|accessToken|access_token|privateKey|private_key|secretKey|secret_key|authToken|connectionString)\s*=\s*"[^"]{4,}"/i,
    detail: (match) => `Hardcoded credential found. Secrets in source code can be extracted from version control.`,
    remediation: "Store secrets in environment variables or a secrets manager (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault).",
    confidence: "high",
  },
  // Insecure random
  {
    id: "java-insecure-random", name: "Insecure Randomness", severity: "medium",
    category: "Cryptography", cwe: "CWE-330", owasp: "A02:2021",
    pattern: /new\s+(?:java\.util\.)?Random\s*\(/,
    suppressors: ["SecureRandom"],
    detail: "java.util.Random is predictable (linear congruential). Tokens, session IDs, or OTPs generated with it are guessable.",
    remediation: "Use java.security.SecureRandom for all security-sensitive random values.",
    confidence: "medium",
  },
  // SSRF
  {
    id: "java-ssrf", name: "Server-Side Request Forgery (SSRF)", severity: "high",
    category: "SSRF", cwe: "CWE-918", owasp: "A10:2021",
    pattern: /new\s+URL\s*\(\s*[^")]+\)\.(?:openConnection|openStream)|HttpClient.*\.send\s*\(|RestTemplate.*\.(?:getForObject|postForObject|exchange)\s*\(/,
    requiresTaint: true,
    detail: "HTTP request made with user-controlled URL — attacker can reach internal services, cloud metadata, or private networks.",
    remediation: "Validate URLs against an allowlist. Block private IP ranges (10.x, 172.16-31.x, 192.168.x, 169.254.169.254). Use URL parsing to verify scheme and host.",
    confidence: "medium",
  },
  // LDAP injection
  {
    id: "java-ldap-injection", name: "LDAP Injection", severity: "high",
    category: "Injection", cwe: "CWE-90", owasp: "A03:2021",
    pattern: /\.search\s*\(\s*(?:[^)]*\+|.*String\.format)/,
    detail: "LDAP query constructed with string concatenation — enables LDAP injection to bypass authentication or extract data.",
    remediation: "Use parameterized LDAP queries or escape special characters (*, (, ), \\, NUL) with LdapEncoder.",
    confidence: "low",
  },
  // Log injection
  {
    id: "java-log-injection", name: "Log Injection", severity: "medium",
    category: "Logging", cwe: "CWE-117", owasp: "A09:2021",
    pattern: /(?:logger|log|LOG)\s*\.(?:info|warn|error|debug|trace|fatal)\s*\(\s*(?:[^)]*\+|.*request\.get)/,
    suppressors: ["sanitize", "encode", "escape", "replace"],
    detail: "User input logged without sanitization. Attackers can forge log entries with newlines or inject ANSI escape codes.",
    remediation: "Sanitize user input before logging: strip newlines, control characters, and ANSI codes. Use structured logging (JSON).",
    confidence: "medium",
  },
  // Missing CSRF protection (Spring)
  {
    id: "java-csrf-disabled", name: "CSRF Protection Disabled", severity: "high",
    category: "Session Management", cwe: "CWE-352", owasp: "A01:2021",
    pattern: /\.csrf\s*\(\s*\)\s*\.disable\s*\(\s*\)|csrf\.disable/,
    detail: "CSRF protection explicitly disabled in Spring Security configuration. State-changing requests can be forged from malicious sites.",
    remediation: "Enable CSRF protection for browser-based applications. For APIs with token auth (JWT/Bearer), CSRF is less relevant but disable explicitly only for API routes.",
    confidence: "high",
  },
  // Open redirect
  {
    id: "java-open-redirect", name: "Open Redirect", severity: "medium",
    category: "Access Control", cwe: "CWE-601", owasp: "A01:2021",
    pattern: /(?:sendRedirect|setHeader\s*\(\s*"Location")\s*\(\s*(?:request\.get|[^")\s]+\+)/,
    detail: "Redirect URL built from user input without validation — enables phishing via open redirect.",
    remediation: "Validate redirect URLs against a domain allowlist. Only allow relative paths or same-domain URLs.",
    confidence: "medium",
  },
  // SQL injection via Spring JPA
  {
    id: "java-jpa-injection", name: "SQL Injection via JPA", severity: "critical",
    category: "Injection", cwe: "CWE-89", owasp: "A03:2021",
    pattern: /@Query\s*\(\s*(?:value\s*=\s*)?"[^"]*"\s*\+|@Query\s*\(\s*(?:value\s*=\s*)?nativeQuery\s*=\s*true[^)]*\+/,
    detail: "JPA @Query with string concatenation enables SQL injection even in Spring Data repositories.",
    remediation: "Use named parameters in @Query: @Query(\"SELECT u FROM User u WHERE u.name = :name\") and bind with @Param(\"name\").",
    confidence: "high",
  },
];

/* ══════════════════════════════════════════════
   C++ RULES
   ══════════════════════════════════════════════ */

const CPP_RULES: VulnRule[] = [
  // Buffer overflow — strcpy, strcat, sprintf, gets
  {
    id: "cpp-buffer-overflow-strcpy", name: "Buffer Overflow — strcpy/strcat", severity: "critical",
    category: "Memory Safety", cwe: "CWE-120", owasp: "A06:2021",
    pattern: /\b(?:strcpy|strcat|wcscpy|wcscat)\s*\(/,
    detail: "strcpy/strcat perform unbounded copies — if the source is larger than the destination buffer, this causes a stack/heap buffer overflow.",
    remediation: "Use strncpy/strncat (with explicit size limit), or prefer std::string in C++. Use strlcpy/strlcat on BSD systems.",
    confidence: "high",
  },
  {
    id: "cpp-buffer-overflow-sprintf", name: "Buffer Overflow — sprintf", severity: "critical",
    category: "Memory Safety", cwe: "CWE-120", owasp: "A06:2021",
    pattern: /\b(?:sprintf|vsprintf|swprintf)\s*\(/,
    suppressors: ["snprintf", "vsnprintf"],
    detail: "sprintf writes to a buffer without bounds checking — input longer than the buffer causes overflow.",
    remediation: "Use snprintf(buf, sizeof(buf), fmt, ...) which enforces a size limit.",
    confidence: "high",
  },
  {
    id: "cpp-gets", name: "Buffer Overflow — gets()", severity: "critical",
    category: "Memory Safety", cwe: "CWE-242", owasp: "A06:2021",
    pattern: /\bgets\s*\(/,
    detail: "gets() reads input without any bounds — removed in C11 because it is impossible to use safely.",
    remediation: "Use fgets(buf, sizeof(buf), stdin) instead of gets().",
    confidence: "high",
  },
  // Format string
  {
    id: "cpp-format-string", name: "Format String Vulnerability", severity: "critical",
    category: "Injection", cwe: "CWE-134", owasp: "A03:2021",
    pattern: /\b(?:printf|fprintf|sprintf|snprintf|syslog|err|warn)\s*\(\s*(?!")[a-zA-Z_]\w*\s*\)/,
    detail: "Format function called with a variable as the format string — if user-controlled, attacker can read/write memory via %x, %n, etc.",
    remediation: "Always use a literal format string: printf(\"%s\", userInput) instead of printf(userInput).",
    confidence: "high",
  },
  // Command injection
  {
    id: "cpp-command-injection", name: "Command Injection", severity: "critical",
    category: "Injection", cwe: "CWE-78", owasp: "A03:2021",
    pattern: /\b(?:system|popen|exec[lv]?p?e?)\s*\(/,
    requiresTaint: true,
    detail: "Shell command execution with potentially user-controlled input enables arbitrary command execution.",
    remediation: "Use execve/execvp with explicit argument arrays instead of system()/popen(). Validate and sanitize all input.",
    confidence: "high",
  },
  {
    id: "cpp-system-call", name: "Dangerous system() Call", severity: "high",
    category: "Injection", cwe: "CWE-78", owasp: "A03:2021",
    pattern: /\bsystem\s*\(\s*(?!")/,
    detail: "system() passes commands through the shell — even without direct user input, shell metacharacters in variables can be exploited.",
    remediation: "Avoid system(). Use fork()/exec() with explicit argument arrays for safe process spawning.",
    confidence: "medium",
  },
  // Use after free / double free patterns
  {
    id: "cpp-use-after-free", name: "Potential Use-After-Free", severity: "critical",
    category: "Memory Safety", cwe: "CWE-416", owasp: "A06:2021",
    pattern: /\bdelete\b.*;\s*\n[^}]*\b\w+\s*(?:->|\.)\w+/,
    detail: "Object used after delete — dereferencing freed memory leads to undefined behavior, crashes, or code execution.",
    remediation: "Set pointers to nullptr after delete. Use smart pointers (std::unique_ptr, std::shared_ptr) to manage lifetimes automatically.",
    confidence: "low",
  },
  // Unsafe scanf
  {
    id: "cpp-unsafe-scanf", name: "Unsafe scanf() Usage", severity: "high",
    category: "Memory Safety", cwe: "CWE-120", owasp: "A06:2021",
    pattern: /\bscanf\s*\(\s*"%s"/,
    detail: "scanf(\"%s\") reads input without a width limit — any input longer than the buffer causes overflow.",
    remediation: "Use scanf(\"%255s\", buf) with explicit width, or use fgets() + sscanf(). In C++, prefer std::cin >> std::string.",
    confidence: "high",
  },
  // Integer overflow
  {
    id: "cpp-integer-overflow", name: "Potential Integer Overflow", severity: "high",
    category: "Memory Safety", cwe: "CWE-190", owasp: "A06:2021",
    pattern: /\bmalloc\s*\(\s*[^)]*\*[^)]*\)|(?:size_t|int|unsigned)\s+\w+\s*=\s*[^;]*\*[^;]*;/,
    suppressors: ["checked_", "safe_", "SIZE_MAX"],
    detail: "Multiplication used in size calculation without overflow check — can allocate a tiny buffer then write past it.",
    remediation: "Check for overflow before multiplication: if (a > SIZE_MAX / b) { error(); }. Use safe integer libraries.",
    confidence: "low",
  },
  // Memory leak patterns
  {
    id: "cpp-memory-leak", name: "Potential Memory Leak", severity: "medium",
    category: "Resource Management", cwe: "CWE-401", owasp: "A06:2021",
    pattern: /\b(?:malloc|calloc|realloc|new\s+\w+(?:\[.*?\])?)\b(?!.*(?:unique_ptr|shared_ptr|auto_ptr|RAII|free|delete))/,
    detail: "Manual memory allocation without visible deallocation in the same scope — potential memory leak.",
    remediation: "Use RAII with smart pointers (std::unique_ptr, std::shared_ptr). If raw allocation is necessary, ensure free/delete in all code paths including error paths.",
    confidence: "low",
  },
  // Weak crypto
  {
    id: "cpp-weak-crypto", name: "Weak Cryptographic Algorithm", severity: "high",
    category: "Cryptography", cwe: "CWE-327", owasp: "A02:2021",
    pattern: /\b(?:MD5_Init|MD5_Update|SHA1_Init|SHA1_Update|DES_set_key|DES_ecb_encrypt|RC4_set_key|EVP_md5|EVP_sha1|EVP_des_)\b/,
    detail: "Weak/broken cryptographic algorithm in use. MD5, SHA-1, DES, and RC4 have known practical attacks.",
    remediation: "Use SHA-256/SHA-3 for hashing, AES-256-GCM for encryption. Use EVP_sha256() or EVP_aes_256_gcm() with OpenSSL.",
    confidence: "high",
  },
  // Insecure random
  {
    id: "cpp-insecure-random", name: "Insecure Randomness", severity: "medium",
    category: "Cryptography", cwe: "CWE-330", owasp: "A02:2021",
    pattern: /\b(?:rand|srand|random)\s*\(/,
    suppressors: ["RAND_bytes", "SecureRandom", "getrandom", "arc4random"],
    detail: "rand()/random() use a predictable PRNG. Tokens, keys, or nonces generated with them are guessable.",
    remediation: "Use RAND_bytes() (OpenSSL), getrandom() (Linux), arc4random() (BSD), or std::random_device for cryptographic randomness.",
    confidence: "medium",
  },
  // Race condition — TOCTOU
  {
    id: "cpp-toctou", name: "TOCTOU Race Condition", severity: "medium",
    category: "Race Condition", cwe: "CWE-367", owasp: "A04:2021",
    pattern: /\baccess\s*\(.*\)\s*(?:.*\n){0,3}.*\b(?:open|fopen|unlink|rename|chmod|chown)\s*\(/,
    detail: "Time-of-check/time-of-use race: file is checked then operated on — an attacker can replace the file between check and use.",
    remediation: "Open the file first with O_CREAT|O_EXCL, then check permissions on the file descriptor — not the path.",
    confidence: "medium",
  },
  // Hardcoded credentials
  {
    id: "cpp-hardcoded-secret", name: "Hardcoded Secret", severity: "high",
    category: "Secrets", cwe: "CWE-798", owasp: "A07:2021",
    pattern: /(?:const\s+)?(?:char|std::string|string)\s*\*?\s*(?:password|passwd|secret|apiKey|api_key|accessToken|private_key|auth_token)\s*(?:\[\])?\s*=\s*"[^"]{4,}"/i,
    detail: "Hardcoded credential in source code. Can be extracted from binaries or version control.",
    remediation: "Load secrets from environment variables or a secure configuration file with restricted permissions.",
    confidence: "high",
  },
  // Path traversal
  {
    id: "cpp-path-traversal", name: "Path Traversal", severity: "high",
    category: "Access Control", cwe: "CWE-22", owasp: "A01:2021",
    pattern: /\bfopen\s*\(\s*(?:[^")]*\+|.*argv|.*cin|.*getenv)/,
    detail: "File opened with user-controlled path — attacker can traverse directories with ../../ sequences.",
    remediation: "Canonicalize the path with realpath() and verify it starts with the allowed base directory.",
    confidence: "medium",
  },
];

/* ══════════════════════════════════════════════
   C# RULES
   ══════════════════════════════════════════════ */

const CSHARP_RULES: VulnRule[] = [
  // SQL injection
  {
    id: "csharp-sql-injection", name: "SQL Injection", severity: "critical",
    category: "Injection", cwe: "CWE-89", owasp: "A03:2021",
    pattern: /(?:SqlCommand|SqlDataAdapter|OleDbCommand|OdbcCommand|NpgsqlCommand|MySqlCommand)\s*\(\s*(?:"[^"]*"\s*\+|\$"|.*\+\s*")/,
    suppressors: ["Parameters.Add", "Parameters.AddWithValue", "@"],
    detail: "SQL query built with string concatenation — enables SQL injection attacks.",
    remediation: "Use parameterized queries: var cmd = new SqlCommand(\"SELECT * FROM Users WHERE Id = @id\", conn); cmd.Parameters.AddWithValue(\"@id\", userId);",
    confidence: "high",
  },
  {
    id: "csharp-sql-injection-interpolation", name: "SQL Injection via String Interpolation", severity: "critical",
    category: "Injection", cwe: "CWE-89", owasp: "A03:2021",
    pattern: /(?:ExecuteSql|FromSqlRaw|ExecuteCommand)\s*\(\s*\$"/,
    detail: "SQL query using C# string interpolation ($\"\") — the interpolated values are concatenated, not parameterized.",
    remediation: "Use FromSqlInterpolated() or pass FormattableString to let EF Core parameterize automatically.",
    confidence: "high",
  },
  // Command injection
  {
    id: "csharp-command-injection", name: "Command Injection", severity: "critical",
    category: "Injection", cwe: "CWE-78", owasp: "A03:2021",
    pattern: /Process\.Start\s*\(\s*(?:new\s+ProcessStartInfo\s*\{[^}]*(?:FileName|Arguments)\s*=\s*(?:[^"}]*\+|\$")|"(?:cmd|powershell|bash|sh)")/,
    detail: "Process spawned with potentially user-controlled arguments — enables command injection.",
    remediation: "Set UseShellExecute = false. Use Process.Start with explicit FileName and Arguments (not shell). Validate and allowlist commands.",
    confidence: "high",
  },
  // XSS
  {
    id: "csharp-xss", name: "Cross-Site Scripting (XSS)", severity: "high",
    category: "Injection", cwe: "CWE-79", owasp: "A03:2021",
    pattern: /(?:Response\.Write|@Html\.Raw)\s*\(/,
    requiresTaint: true,
    detail: "User input rendered in HTML without encoding — enables XSS attacks.",
    remediation: "Use Razor's automatic encoding (@Model.Value) instead of @Html.Raw(). For Response.Write, use HttpUtility.HtmlEncode().",
    confidence: "medium",
  },
  // Path traversal
  {
    id: "csharp-path-traversal", name: "Path Traversal", severity: "high",
    category: "Access Control", cwe: "CWE-22", owasp: "A01:2021",
    pattern: /(?:File\.(?:ReadAll|WriteAll|Open|Delete|Copy|Move|Exists|Create)|Directory\.(?:Delete|Create|Exists)|Path\.Combine)\s*\(\s*(?:[^")]*\+|\$")/,
    detail: "File operation with user-controlled path — directory traversal (../../) can access any file on the system.",
    remediation: "Use Path.GetFullPath() and verify the resolved path starts with the allowed base directory. Reject paths containing '..'.",
    confidence: "medium",
  },
  // Insecure deserialization
  {
    id: "csharp-insecure-deserialization", name: "Insecure Deserialization", severity: "critical",
    category: "Deserialization", cwe: "CWE-502", owasp: "A08:2021",
    pattern: /\b(?:BinaryFormatter|SoapFormatter|NetDataContractSerializer|LosFormatter|ObjectStateFormatter|JavaScriptSerializer)\b/,
    detail: "Insecure .NET deserializer — BinaryFormatter and related types can execute arbitrary code during deserialization.",
    remediation: "Use System.Text.Json or Newtonsoft.Json instead. BinaryFormatter is deprecated in .NET 5+ for security reasons. Set TypeNameHandling.None in Newtonsoft.",
    confidence: "high",
  },
  {
    id: "csharp-json-typenamehandling", name: "Insecure JSON Deserialization", severity: "high",
    category: "Deserialization", cwe: "CWE-502", owasp: "A08:2021",
    pattern: /TypeNameHandling\s*=\s*TypeNameHandling\.(?:All|Auto|Objects|Arrays)/,
    detail: "Newtonsoft.Json TypeNameHandling enables type-based deserialization — attackers can inject malicious types for RCE.",
    remediation: "Use TypeNameHandling.None (default) and define explicit DTOs. If type handling is required, use a custom SerializationBinder.",
    confidence: "high",
  },
  // XXE
  {
    id: "csharp-xxe", name: "XML External Entity (XXE)", severity: "high",
    category: "Injection", cwe: "CWE-611", owasp: "A05:2021",
    pattern: /new\s+XmlDocument\s*\(\s*\)|XmlReader\.Create\s*\(/,
    suppressors: ["DtdProcessing.Prohibit", "XmlResolver = null", "DtdProcessing = DtdProcessing.Prohibit"],
    detail: "XML parser created without disabling DTD processing — vulnerable to XXE (file disclosure, SSRF, DoS).",
    remediation: "Set XmlReaderSettings.DtdProcessing = DtdProcessing.Prohibit and XmlResolver = null.",
    confidence: "medium",
  },
  // Weak crypto
  {
    id: "csharp-weak-crypto", name: "Weak Cryptographic Algorithm", severity: "high",
    category: "Cryptography", cwe: "CWE-327", owasp: "A02:2021",
    pattern: /\b(?:MD5|SHA1|DES|RC2|TripleDES)(?:CryptoServiceProvider|Managed|Cng)?\s*(?:\.Create\s*\(\s*\)|\.ComputeHash|new\s)/,
    detail: "Weak/deprecated cryptographic algorithm. MD5, SHA-1, DES, and RC2 have known practical attacks.",
    remediation: "Use SHA256, SHA512, or SHA3 for hashing. Use Aes with a 256-bit key for encryption. For passwords, use BCrypt or Argon2.",
    confidence: "high",
  },
  // Hardcoded secrets
  {
    id: "csharp-hardcoded-secret", name: "Hardcoded Secret", severity: "high",
    category: "Secrets", cwe: "CWE-798", owasp: "A07:2021",
    pattern: /(?:string|var|const)\s+(?:password|passwd|secret|apiKey|api_key|accessToken|connectionString|connString|authToken|privateKey)\s*=\s*"[^"]{4,}"/i,
    detail: "Hardcoded credential in source code — extractable from compiled assemblies and version control.",
    remediation: "Use IConfiguration, Azure Key Vault, AWS Secrets Manager, or User Secrets for development. Never commit secrets.",
    confidence: "high",
  },
  // SSRF
  {
    id: "csharp-ssrf", name: "Server-Side Request Forgery (SSRF)", severity: "high",
    category: "SSRF", cwe: "CWE-918", owasp: "A10:2021",
    pattern: /(?:HttpClient|WebClient|WebRequest|HttpWebRequest).*(?:GetAsync|PostAsync|SendAsync|GetStringAsync|DownloadString|GetResponse)\s*\(/,
    requiresTaint: true,
    detail: "HTTP request with potentially user-controlled URL — attacker can reach internal services or cloud metadata.",
    remediation: "Validate URLs against an allowlist. Block private IP ranges and metadata endpoints (169.254.169.254).",
    confidence: "medium",
  },
  // Open redirect
  {
    id: "csharp-open-redirect", name: "Open Redirect", severity: "medium",
    category: "Access Control", cwe: "CWE-601", owasp: "A01:2021",
    pattern: /(?:Redirect|RedirectPermanent|RedirectToAction|LocalRedirect)\s*\(\s*(?:[^")]*\+|\$"|.*Request)/,
    suppressors: ["Url.IsLocalUrl", "LocalRedirect"],
    detail: "Redirect with user-controlled URL enables phishing attacks via open redirect.",
    remediation: "Use Url.IsLocalUrl() to validate or use RedirectToLocal(). Only allow relative paths.",
    confidence: "medium",
  },
  // CSRF disabled
  {
    id: "csharp-csrf-disabled", name: "CSRF Protection Disabled", severity: "high",
    category: "Session Management", cwe: "CWE-352", owasp: "A01:2021",
    pattern: /\[IgnoreAntiforgeryToken\]|options\.Filters\.(?:Remove|Clear).*AntiForgeryToken|ValidateAntiForgeryToken.*=.*false/,
    detail: "Anti-forgery token validation disabled — state-changing requests can be forged from malicious sites.",
    remediation: "Apply [ValidateAntiForgeryToken] on all POST/PUT/DELETE actions. Use @Html.AntiForgeryToken() in forms.",
    confidence: "high",
  },
  // Insecure cookie
  {
    id: "csharp-insecure-cookie", name: "Insecure Cookie Configuration", severity: "medium",
    category: "Session Management", cwe: "CWE-614", owasp: "A05:2021",
    pattern: /(?:Cookie|CookieOptions)\s*(?:\{[^}]*)?(?:Secure\s*=\s*false|HttpOnly\s*=\s*false)/,
    detail: "Cookie with Secure=false (sent over HTTP) or HttpOnly=false (accessible to JavaScript).",
    remediation: "Set Secure = true, HttpOnly = true, SameSite = SameSiteMode.Strict on all authentication cookies.",
    confidence: "high",
  },
  // Insecure random
  {
    id: "csharp-insecure-random", name: "Insecure Randomness", severity: "medium",
    category: "Cryptography", cwe: "CWE-330", owasp: "A02:2021",
    pattern: /new\s+Random\s*\(/,
    suppressors: ["RandomNumberGenerator", "RNGCryptoServiceProvider"],
    detail: "System.Random is not cryptographically secure — tokens or session IDs generated with it are predictable.",
    remediation: "Use System.Security.Cryptography.RandomNumberGenerator.GetBytes() for secure random values.",
    confidence: "medium",
  },
  // Log injection
  {
    id: "csharp-log-injection", name: "Log Injection", severity: "medium",
    category: "Logging", cwe: "CWE-117", owasp: "A09:2021",
    pattern: /(?:_logger|Logger|ILogger|Log)\s*\.(?:Log(?:Information|Warning|Error|Critical|Debug)|Info|Warn|Error|Debug)\s*\(\s*(?:\$"|.*\+)/,
    suppressors: ["sanitize", "encode", "replace"],
    detail: "User input in log message via interpolation/concatenation — enables log forging and injection of fake entries.",
    remediation: "Use structured logging with placeholders: _logger.LogInformation(\"User {UserId} logged in\", userId); not string interpolation.",
    confidence: "medium",
  },
  // Information exposure
  {
    id: "csharp-info-exposure", name: "Detailed Error Exposure", severity: "medium",
    category: "Information Disclosure", cwe: "CWE-209", owasp: "A04:2021",
    pattern: /(?:DeveloperExceptionPage|UseDeveloperExceptionPage|app\.UseDeveloperExceptionPage)|(?:customErrors\s+mode\s*=\s*"Off")/,
    detail: "Developer exception page enabled — shows full stack traces, source code, and environment details to users.",
    remediation: "Only enable DeveloperExceptionPage in Development environment. Use UseExceptionHandler(\"/Error\") in production.",
    confidence: "high",
  },
];

/* ══════════════════════════════════════════════
   LINE-BY-LINE TAINT TRACKER
   ══════════════════════════════════════════════ */

interface LineTaintInfo {
  varName: string;
  sourceLabel: string;
  sourceLine: number;
  sourceCode: string;
}

function buildTaintMap(lines: string[], taintSources: RegExp[]): Map<string, LineTaintInfo> {
  const taintMap = new Map<string, LineTaintInfo>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("//") || line.startsWith("/*") || line.startsWith("*")) continue;

    // Check if this line reads from a taint source
    let isTainted = false;
    let sourceLabel = "";
    for (const src of taintSources) {
      if (src.test(line)) {
        isTainted = true;
        const match = line.match(src);
        sourceLabel = match ? match[0].replace(/\s*\($/, "") : "user input";
        break;
      }
    }

    if (isTainted) {
      // Try to extract the variable being assigned
      // Patterns: Type varName = ..., var varName = ..., varName = ..., auto varName = ...
      const assignMatch = line.match(/(?:(?:final\s+|const\s+|var\s+|auto\s+|let\s+|string\s+|String\s+|int\s+|long\s+|char\s*\*?\s+|std::string\s+)?(\w+)\s*=)/);
      if (assignMatch) {
        const varName = assignMatch[1];
        taintMap.set(varName, {
          varName,
          sourceLabel,
          sourceLine: i + 1,
          sourceCode: line,
        });
      }
    }

    // Propagate taint through assignments: varB = varA
    if (!isTainted) {
      const simpleAssign = line.match(/(?:(?:final\s+|const\s+|var\s+|auto\s+|let\s+|string\s+|String\s+|int\s+|long\s+)?(\w+)\s*=\s*(\w+))/);
      if (simpleAssign) {
        const [, lhs, rhs] = simpleAssign;
        if (taintMap.has(rhs)) {
          taintMap.set(lhs, taintMap.get(rhs)!);
        }
      }
    }
  }

  return taintMap;
}

/* ══════════════════════════════════════════════
   MAIN SCANNER
   ══════════════════════════════════════════════ */

function getRulesForLanguage(lang: Language): VulnRule[] {
  switch (lang) {
    case "java": return JAVA_RULES;
    case "cpp": return CPP_RULES;
    case "csharp": return CSHARP_RULES;
  }
}

function getTaintSourcesForLanguage(lang: Language): RegExp[] {
  switch (lang) {
    case "java": return TAINT_SOURCES_JAVA;
    case "cpp": return TAINT_SOURCES_CPP;
    case "csharp": return TAINT_SOURCES_CSHARP;
  }
}

export function scanCode(code: string, language: Language): {
  findings: PatternFinding[];
  stats: { critical: number; high: number; medium: number; low: number; total: number };
  linesAnalyzed: number;
  checksPerformed: number;
  language: Language;
} {
  const lines = code.split("\n");
  const rules = getRulesForLanguage(language);
  const taintSources = getTaintSourcesForLanguage(language);
  const taintMap = buildTaintMap(lines, taintSources);
  const findings: PatternFinding[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("#")) continue;

    // Build a context window (current line + 2 lines before + 2 after) for suppressor checks
    const contextStart = Math.max(0, i - 2);
    const contextEnd = Math.min(lines.length, i + 3);
    const context = lines.slice(contextStart, contextEnd).join("\n");

    for (const rule of rules) {
      // Reset regex lastIndex for global regexes
      rule.pattern.lastIndex = 0;
      const match = rule.pattern.exec(trimmed);
      if (!match) continue;

      // Check suppressors in context window
      if (rule.suppressors?.some(s => context.includes(s))) continue;

      // If rule requires taint, check if any tainted variable appears in the line
      let taintInfo: LineTaintInfo | undefined;
      if (rule.requiresTaint) {
        for (const [varName, info] of taintMap) {
          if (trimmed.includes(varName)) {
            taintInfo = info;
            break;
          }
        }
        // Also check for inline taint sources
        if (!taintInfo) {
          const hasInlineSource = taintSources.some(src => src.test(trimmed));
          if (!hasInlineSource) continue; // Skip — no tainted data
          taintInfo = { varName: "<inline>", sourceLabel: "user input", sourceLine: i + 1, sourceCode: trimmed };
        }
      }

      const key = `${rule.id}:${i + 1}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const detail = typeof rule.detail === "function" ? rule.detail(match, trimmed) : rule.detail;

      const finding: PatternFinding = {
        id: rule.id,
        name: rule.name,
        severity: rule.severity,
        confidence: rule.confidence,
        line: i + 1,
        column: match.index + 1,
        category: rule.category,
        cwe: rule.cwe,
        owasp: rule.owasp,
        detail,
        evidence: trimmed,
        remediation: rule.remediation,
      };

      // Add dataflow if taint was tracked
      if (taintInfo && taintInfo.sourceLine !== i + 1) {
        finding.dataflow = [
          { line: taintInfo.sourceLine, label: `Source: ${taintInfo.sourceLabel}`, code: taintInfo.sourceCode },
          { line: i + 1, label: `Sink: ${rule.name}`, code: trimmed },
        ];
      }

      findings.push(finding);
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
    linesAnalyzed: lines.length,
    checksPerformed: rules.length,
    language,
  };
}

/* ══════════════════════════════════════════════
   DEMO CODE SNIPPETS
   ══════════════════════════════════════════════ */

export const JAVA_DEMO_CODE = `import java.sql.*;
import java.io.*;
import java.security.*;
import javax.servlet.http.*;
import javax.xml.parsers.*;
import org.apache.commons.io.IOUtils;

public class VulnerableApp extends HttpServlet {

    private static final String DB_PASSWORD = "SuperSecretPass123!";
    private static final String API_KEY = "sk-live-abc123def456ghi789";

    // SQL Injection — string concatenation
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String userId = request.getParameter("id");
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/db", "root", DB_PASSWORD);
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id = " + userId);

        // XSS — reflected
        response.getWriter().println("<h1>User: " + userId + "</h1>");
    }

    // Command Injection
    public String runDiagnostic(HttpServletRequest request) throws Exception {
        String host = request.getParameter("host");
        Process p = Runtime.getRuntime().exec("ping -c 1 " + host);
        return IOUtils.toString(p.getInputStream());
    }

    // Insecure Deserialization
    public Object loadSession(InputStream input) throws Exception {
        ObjectInputStream ois = new ObjectInputStream(input);
        return ois.readObject();
    }

    // XXE  
    public void parseXML(InputStream xmlInput) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        builder.parse(xmlInput);
    }

    // Weak Crypto
    public String hashPassword(String password) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hash = md.digest(password.getBytes());
        return new String(hash);
    }

    // Path Traversal
    public byte[] readFile(HttpServletRequest request) throws Exception {
        String filename = request.getParameter("file");
        return java.nio.file.Files.readAllBytes(new File("/uploads/" + filename).toPath());
    }

    // Insecure Random
    public String generateToken() {
        Random rand = new Random();
        return String.valueOf(rand.nextLong());
    }

    // Log Injection
    public void loginAttempt(HttpServletRequest request) {
        String username = request.getParameter("username");
        logger.info("Login attempt for user: " + username);
    }

    // CSRF disabled
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .authorizeRequests()
            .anyRequest().authenticated();
    }

    // SSRF
    public String fetchUrl(HttpServletRequest request) throws Exception {
        String url = request.getParameter("url");
        return IOUtils.toString(new URL(url).openStream());
    }
}
`;

export const CPP_DEMO_CODE = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <openssl/md5.h>

// Hardcoded credentials
const char* password = "admin123!secret";
const char* api_key = "sk_live_abc123xyz789";

// Buffer Overflow — strcpy
void processInput(const char* input) {
    char buffer[64];
    strcpy(buffer, input);  // No bounds check
    printf("Processed: %s\\n", buffer);
}

// Buffer Overflow — sprintf  
void formatMessage(const char* user, int code) {
    char msg[128];
    sprintf(msg, "User %s received error code %d", user, code);
    printf("%s\\n", msg);
}

// Buffer Overflow — gets
void readUserInput() {
    char name[32];
    printf("Enter name: ");
    gets(name);  // Removed in C11 — impossible to use safely
    printf("Hello %s\\n", name);
}

// Format String Vulnerability
void logMessage(char* userMsg) {
    printf(userMsg);  // User controls format string
}

// Command Injection
void pingHost(const char* host) {
    char cmd[256];
    sprintf(cmd, "ping -c 1 %s", host);
    system(cmd);  // Shell injection
}

// Unsafe scanf  
void readId() {
    char id[16];
    scanf("%s", id);  // No width limit
}

// Weak Crypto
void hashData(const unsigned char* data, size_t len) {
    unsigned char hash[MD5_DIGEST_LENGTH];
    MD5_Init(&md5ctx);
    MD5_Update(&md5ctx, data, len);
    printf("Hashed with MD5\\n");
}

// Insecure Random
int generateToken() {
    srand(time(NULL));
    return rand();  // Predictable
}

// Integer Overflow in malloc
void allocateBuffer(size_t count, size_t size) {
    char* buf = (char*)malloc(count * size);  // Can overflow
    if (buf) memset(buf, 0, count * size);
}

// Memory Leak
void processData(int n) {
    int* data = new int[n];
    // ... process ...
    // Missing: delete[] data;
}

// Path Traversal
void readConfig(const char* filename) {
    FILE* f = fopen(filename, "r");  // No path validation
    if (f) {
        char buf[1024];
        fgets(buf, sizeof(buf), f);
        fclose(f);
    }
}

// TOCTOU Race Condition
void safeWrite(const char* path) {
    if (access(path, W_OK) == 0) {
        // Race window — file can be replaced here
        FILE* f = fopen(path, "w");
        if (f) {
            fprintf(f, "data\\n");
            fclose(f);
        }
    }
}
`;

export const CSHARP_DEMO_CODE = `using System;
using System.Data.SqlClient;
using System.IO;
using System.Security.Cryptography;
using System.Runtime.Serialization.Formatters.Binary;
using System.Xml;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace VulnerableApp.Controllers
{
    public class UserController : Controller
    {
        private string connectionString = "Server=db;Password=SuperSecret123!";
        private string apiKey = "sk-live-abc123def456";

        // SQL Injection — string concatenation
        [HttpGet]
        public IActionResult GetUser(string id)
        {
            var cmd = new SqlCommand("SELECT * FROM Users WHERE Id = " + id, connection);
            var reader = cmd.ExecuteReader();
            return Ok(reader);
        }

        // SQL Injection — string interpolation in EF Core
        [HttpGet]
        public IActionResult Search(string term)
        {
            var results = db.Users.FromSqlRaw($"SELECT * FROM Users WHERE Name LIKE '%{term}%'");
            return Ok(results);
        }

        // XSS — Html.Raw
        [HttpGet]
        public IActionResult Profile()
        {
            var bio = Request.Query["bio"];
            ViewBag.Bio = bio;
            return View(); // View uses @Html.Raw(ViewBag.Bio)
        }

        // Insecure Deserialization — BinaryFormatter
        [HttpPost]
        public IActionResult LoadState()
        {
            var formatter = new BinaryFormatter();
            var obj = formatter.Deserialize(Request.Body);
            return Ok(obj);
        }

        // XXE
        [HttpPost]
        public IActionResult ParseXml()
        {
            var doc = new XmlDocument();
            doc.Load(Request.Body);
            return Ok(doc.InnerXml);
        }

        // Weak Crypto
        public string HashPassword(string password)
        {
            var md5 = MD5.Create();
            var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hash);
        }

        // Path Traversal
        [HttpGet]
        public IActionResult Download(string file)
        {
            var content = File.ReadAllBytes("/uploads/" + file);
            return File(content, "application/octet-stream");
        }

        // Insecure Random
        public string GenerateToken()
        {
            var rng = new Random();
            return rng.Next(100000, 999999).ToString();
        }

        // Open Redirect
        [HttpGet]
        public IActionResult Login(string returnUrl)
        {
            // After auth...
            return Redirect(returnUrl);
        }

        // Insecure Cookie  
        [HttpPost]
        public IActionResult SetSession()
        {
            Response.Cookies.Append("session", token, new CookieOptions
            {
                Secure = false,
                HttpOnly = false
            });
            return Ok();
        }

        // JSON Deserialization with TypeNameHandling
        [HttpPost]
        public IActionResult Import(string json)
        {
            var settings = new JsonSerializerSettings
            {
                TypeNameHandling = TypeNameHandling.All
            };
            var obj = JsonConvert.DeserializeObject(json, settings);
            return Ok(obj);
        }

        // Developer Exception Page in production
        public void Configure(IApplicationBuilder app)
        {
            app.UseDeveloperExceptionPage();
        }

        // CSRF disabled
        [IgnoreAntiforgeryToken]
        [HttpPost]
        public IActionResult TransferFunds(decimal amount, string to)
        {
            // ... transfer logic ...
            return Ok();
        }

        // Log Injection
        public void AuditLogin(string username)
        {
            _logger.LogInformation($"User logged in: {username}");
        }
    }
}`;
