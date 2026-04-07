/**
 * ShieldX Multi-Language SAST Engine v2
 *
 * A proper token-based static analysis engine for Java, C++, and C#.
 *
 * Architecture:
 *   1. Tokenizer     — language-aware lexer; never matches inside strings/comments
 *   2. Taint analysis — tracks user-controlled data through variables and expressions
 *   3. Sink detection — finds dangerous calls with tainted arguments
 *   4. Structural checks — detects insecure patterns without taint (weak crypto, etc.)
 *
 * Key advantages over a regex-per-line scanner:
 *   - Understands code structure: strings, comments, identifiers are distinct
 *   - Follows data through variable assignments (x = args[0]; exec(x))
 *   - Detects string concatenation with tainted data ("cmd " + userVar)
 *   - Inter-procedural taint for annotated parameters (@RequestParam, etc.)
 *   - Resolves method call chains (Runtime.getRuntime().exec())
 */

// ═══════════════════════════════════════════════════
//  SECTION 1 — TYPES & EXPORTS
// ═══════════════════════════════════════════════════

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
  codeSnippet?: { lineNum: number; code: string; isHighlighted: boolean }[];
  dataflow?: { line: number; label: string; code: string }[];
  remediation: string;
}

interface TaintInfo {
  label: string;
  sourceLine: number;
  sourceCode: string;
  chain?: { line: number; code: string; label: string }[];
}

/** Build a code snippet window around a target line with ±contextRadius lines */
function buildSnippet(lines: string[], targetLine: number, contextRadius = 3): { lineNum: number; code: string; isHighlighted: boolean }[] {
  const start = Math.max(0, targetLine - 1 - contextRadius);
  const end = Math.min(lines.length, targetLine - 1 + contextRadius + 1);
  const result: { lineNum: number; code: string; isHighlighted: boolean }[] = [];
  for (let i = start; i < end; i++) {
    result.push({ lineNum: i + 1, code: lines[i], isHighlighted: i + 1 === targetLine });
  }
  return result;
}

// ═══════════════════════════════════════════════════
//  SECTION 2 — TOKENIZER
// ═══════════════════════════════════════════════════

const enum TT {
  Ident, Keyword, String, Number, Char,
  Dot, Arrow, Scope, Star, Amp,
  LParen, RParen, LBrace, RBrace, LBracket, RBracket,
  Semi, Comma, Colon, Question, At,
  Assign, PlusAssign, MinusAssign,
  Plus, Minus, Slash, Percent,
  Eq, Neq, Lt, Gt, Le, Ge, Shr,
  And, Or, Not, BitOr, BitXor,
  Hash, Eof
}

interface Token { t: TT; v: string; ln: number; col: number; }

const JAVA_KW = new Set([
  "abstract","assert","boolean","break","byte","case","catch","char","class","const",
  "continue","default","do","double","else","enum","extends","final","finally","float",
  "for","goto","if","implements","import","instanceof","int","interface","long","native",
  "new","package","private","protected","public","return","short","static","strictfp",
  "super","switch","synchronized","this","throw","throws","transient","try","var","void",
  "volatile","while",
]);
const CPP_KW = new Set([
  "alignas","alignof","auto","bool","break","case","catch","char","class","const",
  "constexpr","continue","decltype","default","delete","do","double","dynamic_cast",
  "else","enum","explicit","extern","false","float","for","friend","goto","if","inline",
  "int","long","mutable","namespace","new","noexcept","nullptr","operator","private",
  "protected","public","register","reinterpret_cast","return","short","signed","sizeof",
  "static","static_assert","static_cast","struct","switch","template","this","throw",
  "true","try","typedef","typeid","typename","union","unsigned","using","virtual","void",
  "volatile","wchar_t","while",
]);
const CS_KW = new Set([
  "abstract","as","base","bool","break","byte","case","catch","char","checked","class",
  "const","continue","decimal","default","delegate","do","double","else","enum","event",
  "explicit","extern","false","finally","fixed","float","for","foreach","goto","if",
  "implicit","in","int","interface","internal","is","lock","long","namespace","new","null",
  "object","operator","out","override","params","private","protected","public","readonly",
  "ref","return","sbyte","sealed","short","sizeof","stackalloc","static","string","struct",
  "switch","this","throw","true","try","typeof","uint","ulong","unchecked","unsafe",
  "ushort","using","var","virtual","void","volatile","while","async","await","dynamic",
  "nameof","record","with",
]);

function tokenize(code: string, lang: Language): Token[] {
  const tokens: Token[] = [];
  const len = code.length;
  let i = 0, ln = 1, ls = 0;

  const col = () => i - ls + 1;
  const pk = (off = 0) => (i + off < len ? code[i + off] : "\0");
  const push = (t: TT, v: string, l?: number, c?: number) => {
    tokens.push({ t, v, ln: l ?? ln, col: c ?? col() });
  };

  const kwSet = lang === "java" ? JAVA_KW : lang === "cpp" ? CPP_KW : CS_KW;

  while (i < len) {
    const ch = code[i];
    const c = col();

    // ── newlines ──
    if (ch === "\n") { ln++; ls = i + 1; i++; continue; }
    if (ch === "\r") { if (pk(1) === "\n") i++; ln++; ls = i + 1; i++; continue; }

    // ── whitespace ──
    if (ch === " " || ch === "\t" || ch === "\f") { i++; continue; }

    // ── comments ──
    if (ch === "/" && pk(1) === "/") { while (i < len && code[i] !== "\n") i++; continue; }
    if (ch === "/" && pk(1) === "*") {
      i += 2;
      while (i < len - 1) {
        if (code[i] === "\n") { ln++; ls = i + 1; }
        if (code[i] === "*" && code[i + 1] === "/") { i += 2; break; }
        i++;
      }
      continue;
    }

    // ── preprocessor (C++) ──
    if (ch === "#" && lang === "cpp") {
      const hc = c;
      while (i < len && code[i] !== "\n") {
        if (code[i] === "\\" && i + 1 < len && code[i + 1] === "\n") { i++; ln++; ls = i + 1; }
        i++;
      }
      // still push Hash so we know an #include existed
      push(TT.Hash, "#", ln, hc);
      continue;
    }

    // ── string literals ──
    if (ch === "\"") {
      // Java text block """
      if (lang === "java" && pk(1) === "\"" && pk(2) === "\"") {
        i += 3; let val = ""; const sl = ln;
        while (i < len - 2) {
          if (code[i] === "\n") { ln++; ls = i + 1; }
          if (code[i] === "\"" && code[i + 1] === "\"" && code[i + 2] === "\"") { i += 3; break; }
          val += code[i]; i++;
        }
        push(TT.String, val, sl, c); continue;
      }
      // regular string
      i++; let val = "";
      while (i < len && code[i] !== "\"" && code[i] !== "\n") {
        if (code[i] === "\\") { val += code[i] + (code[i + 1] || ""); i += 2; continue; }
        val += code[i]; i++;
      }
      if (i < len && code[i] === "\"") i++;
      push(TT.String, val, ln, c); continue;
    }
    // C# verbatim string @"..."
    if (ch === "@" && pk(1) === "\"" && lang === "csharp") {
      i += 2; let val = ""; const sl = ln;
      while (i < len) {
        if (code[i] === "\"") { if (pk(1) === "\"") { val += "\""; i += 2; continue; } i++; break; }
        if (code[i] === "\n") { ln++; ls = i + 1; }
        val += code[i]; i++;
      }
      push(TT.String, val, sl, c); continue;
    }
    // C# interpolated $"..."  or $@"..."
    if (ch === "$" && (pk(1) === "\"" || (pk(1) === "@" && pk(2) === "\"")) && lang === "csharp") {
      const verbatim = pk(1) === "@";
      i += verbatim ? 3 : 2;
      let val = ""; let depth = 0; const sl = ln;
      while (i < len) {
        if (!verbatim && code[i] === "\\" && depth === 0) { val += code[i] + (code[i + 1] || ""); i += 2; continue; }
        if (code[i] === "{") { if (pk(1) === "{") { val += "{{"; i += 2; continue; } depth++; val += code[i]; i++; continue; }
        if (code[i] === "}" && depth > 0) { depth--; val += code[i]; i++; continue; }
        if (depth === 0 && code[i] === "\"") {
          if (verbatim && pk(1) === "\"") { val += "\""; i += 2; continue; }
          i++; break;
        }
        if (code[i] === "\n") { ln++; ls = i + 1; }
        val += code[i]; i++;
      }
      push(TT.String, val, sl, c); continue;
    }
    // C++ raw string R"delim(...)delim"
    if (ch === "R" && pk(1) === "\"" && lang === "cpp") {
      i += 2; let delim = "";
      while (i < len && code[i] !== "(") { delim += code[i]; i++; }
      i++; // skip (
      const closer = ")" + delim + "\"";
      let val = ""; const sl = ln;
      while (i < len) {
        if (code[i] === "\n") { ln++; ls = i + 1; }
        if (code.startsWith(closer, i)) { i += closer.length; break; }
        val += code[i]; i++;
      }
      push(TT.String, val, sl, c); continue;
    }

    // ── char literal ──
    if (ch === "'") {
      i++; let val = "";
      if (i < len && code[i] === "\\") { val = code[i] + (code[i + 1] || ""); i += 2; }
      else if (i < len && code[i] !== "'") { val = code[i]; i++; }
      if (i < len && code[i] === "'") i++;
      push(TT.Char, val, ln, c); continue;
    }

    // ── numbers ──
    if (ch >= "0" && ch <= "9") {
      let num = "";
      if (ch === "0" && (pk(1) === "x" || pk(1) === "X")) {
        num = "0x"; i += 2;
        while (i < len && /[0-9a-fA-F_]/.test(code[i])) { num += code[i]; i++; }
      } else {
        while (i < len && /[0-9._eEfFlLdDuU]/.test(code[i])) { num += code[i]; i++; }
      }
      push(TT.Number, num, ln, c); continue;
    }

    // ── identifiers / keywords ──
    if (/[a-zA-Z_$]/.test(ch)) {
      let id = "";
      while (i < len && /[a-zA-Z0-9_$]/.test(code[i])) { id += code[i]; i++; }
      push(kwSet.has(id) ? TT.Keyword : TT.Ident, id, ln, c);
      continue;
    }

    // ── operators & punctuation ──
    switch (ch) {
      case ".": push(TT.Dot, "."); i++; break;
      case "(": push(TT.LParen, "("); i++; break;
      case ")": push(TT.RParen, ")"); i++; break;
      case "{": push(TT.LBrace, "{"); i++; break;
      case "}": push(TT.RBrace, "}"); i++; break;
      case "[": push(TT.LBracket, "["); i++; break;
      case "]": push(TT.RBracket, "]"); i++; break;
      case ";": push(TT.Semi, ";"); i++; break;
      case ",": push(TT.Comma, ","); i++; break;
      case "?": push(TT.Question, "?"); i++; break;
      case ":":
        if (pk(1) === ":") { push(TT.Scope, "::"); i += 2; }
        else { push(TT.Colon, ":"); i++; }
        break;
      case "@": {
        i++; let ann = "@";
        while (i < len && /[a-zA-Z0-9_.]/.test(code[i])) { ann += code[i]; i++; }
        push(TT.At, ann, ln, c); break;
      }
      case "=":
        if (pk(1) === "=") { push(TT.Eq, "=="); i += 2; }
        else { push(TT.Assign, "="); i++; }
        break;
      case "+":
        if (pk(1) === "=") { push(TT.PlusAssign, "+="); i += 2; }
        else if (pk(1) === "+") { i += 2; } // ++ skip
        else { push(TT.Plus, "+"); i++; }
        break;
      case "-":
        if (pk(1) === "=") { push(TT.MinusAssign, "-="); i += 2; }
        else if (pk(1) === "-") { i += 2; } // -- skip
        else if (pk(1) === ">") { push(TT.Arrow, "->"); i += 2; }
        else { push(TT.Minus, "-"); i++; }
        break;
      case "*": push(TT.Star, "*"); i++; break;
      case "/": push(TT.Slash, "/"); i++; break;
      case "%": push(TT.Percent, "%"); i++; break;
      case "<":
        if (pk(1) === "=") { push(TT.Le, "<="); i += 2; }
        else if (pk(1) === "<") { i += 2; } // << skip
        else { push(TT.Lt, "<"); i++; }
        break;
      case ">":
        if (pk(1) === ">" && pk(2) === "=") { i += 3; } // >>= skip
        else if (pk(1) === ">") { push(TT.Shr, ">>"); i += 2; }
        else if (pk(1) === "=") { push(TT.Ge, ">="); i += 2; }
        else { push(TT.Gt, ">"); i++; }
        break;
      case "!":
        if (pk(1) === "=") { push(TT.Neq, "!="); i += 2; }
        else { push(TT.Not, "!"); i++; }
        break;
      case "&":
        if (pk(1) === "&") { push(TT.And, "&&"); i += 2; }
        else { push(TT.Amp, "&"); i++; }
        break;
      case "|":
        if (pk(1) === "|") { push(TT.Or, "||"); i += 2; }
        else { push(TT.BitOr, "|"); i++; }
        break;
      case "^": push(TT.BitXor, "^"); i++; break;
      case "~": push(TT.Not, "~"); i++; break;
      default: i++; break;
    }
  }

  push(TT.Eof, "");
  return tokens;
}

// ═══════════════════════════════════════════════════
//  SECTION 3 — TAINT ANALYSIS
// ═══════════════════════════════════════════════════

/**
 * Check whether a token sub-sequence [start, end) contains a taint source.
 * Returns the taint label, or null.
 */
function detectTaintInExpr(
  tokens: Token[], start: number, end: number,
  lang: Language, tainted: Map<string, TaintInfo>,
): TaintInfo | null {
  for (let i = start; i < end; i++) {
    const tok = tokens[i];

    // ── already-tainted variable reference ──
    if (tok.t === TT.Ident && tainted.has(tok.v)) {
      return tainted.get(tok.v)!;
    }

    // ── direct taint sources ──

    // args[...] / argv[...]   (Java, C#, C++)
    if (tok.t === TT.Ident && (tok.v === "args" || tok.v === "argv") &&
        i + 1 < end && tokens[i + 1].t === TT.LBracket) {
      return { label: "command-line argument", sourceLine: tok.ln, sourceCode: lineAt(tok.ln) };
    }

    // ── Java ──
    if (lang === "java") {
      // request.getParameter(...), etc.
      if (tok.t === TT.Ident && i + 2 < end && tokens[i + 1].t === TT.Dot && tokens[i + 2].t === TT.Ident) {
        const m = tokens[i + 2].v;
        if (JAVA_HTTP_METHODS.has(m)) return { label: `HTTP ${m}()`, sourceLine: tok.ln, sourceCode: lineAt(tok.ln) };
        if (tok.v === "System" && (m === "getenv" || m === "getProperty"))
          return { label: m === "getenv" ? "environment variable" : "system property", sourceLine: tok.ln, sourceCode: lineAt(tok.ln) };
      }
      // nextLine(), readLine(), next() — Scanner / BufferedReader
      if (tok.t === TT.Ident && JAVA_READER_METHODS.has(tok.v) && i + 1 < end && tokens[i + 1].t === TT.LParen) {
        return { label: "user input (stdin)", sourceLine: tok.ln, sourceCode: lineAt(tok.ln) };
      }
    }

    // ── C++ ──
    if (lang === "cpp") {
      // cin >> var  (>> is TT.Shr)
      if (tok.t === TT.Ident && tok.v === "cin") return { label: "standard input (cin)", sourceLine: tok.ln, sourceCode: lineAt(tok.ln) };
      // getenv(...)
      if (tok.t === TT.Ident && tok.v === "getenv" && i + 1 < end && tokens[i + 1].t === TT.LParen)
        return { label: "environment variable", sourceLine: tok.ln, sourceCode: lineAt(tok.ln) };
      // scanf, gets, fgets
      if (tok.t === TT.Ident && (tok.v === "scanf" || tok.v === "gets" || tok.v === "fgets" || tok.v === "getline") && i + 1 < end && tokens[i + 1].t === TT.LParen)
        return { label: "user input (stdin)", sourceLine: tok.ln, sourceCode: lineAt(tok.ln) };
      // recv, recvfrom
      if (tok.t === TT.Ident && (tok.v === "recv" || tok.v === "recvfrom") && i + 1 < end && tokens[i + 1].t === TT.LParen)
        return { label: "network input", sourceLine: tok.ln, sourceCode: lineAt(tok.ln) };
    }

    // ── C# ──
    if (lang === "csharp") {
      // Request.Query[...], Request.Form[...], ...
      if (tok.t === TT.Ident && tok.v === "Request" && i + 2 < end && tokens[i + 1].t === TT.Dot && tokens[i + 2].t === TT.Ident) {
        const prop = tokens[i + 2].v;
        if (CS_REQUEST_PROPS.has(prop)) return { label: `HTTP Request.${prop}`, sourceLine: tok.ln, sourceCode: lineAt(tok.ln) };
      }
      // Console.ReadLine()
      if (tok.t === TT.Ident && tok.v === "ReadLine" && i + 1 < end && tokens[i + 1].t === TT.LParen)
        return { label: "console input", sourceLine: tok.ln, sourceCode: lineAt(tok.ln) };
      if (tok.t === TT.Ident && tok.v === "GetEnvironmentVariable" && i + 1 < end && tokens[i + 1].t === TT.LParen)
        return { label: "environment variable", sourceLine: tok.ln, sourceCode: lineAt(tok.ln) };
      // HttpContext.Request
      if (tok.t === TT.Ident && tok.v === "HttpContext" && i + 2 < end && tokens[i + 1].t === TT.Dot && tokens[i + 2].v === "Request")
        return { label: "HTTP request", sourceLine: tok.ln, sourceCode: lineAt(tok.ln) };
    }
  }
  return null;

  function lineAt(_ln: number) { return ""; } // placeholder; real line filled by caller
}

const JAVA_HTTP_METHODS = new Set([
  "getParameter","getQueryString","getHeader","getCookies","getInputStream","getReader",
  "getPathInfo","getRequestURI","getRequestURL","getPart","getAttribute","getRemoteAddr",
  "getRemoteHost","getParameterValues","getParameterMap","getParameterNames",
  "getHeaderNames","getContentType","getScheme","getServerName","getServletPath",
  "getContextPath","getAuthType","getRemoteUser","getUserPrincipal","getSession",
  "getRequestedSessionId","getRealPath","getLocalAddr","getLocalName",
]);
const JAVA_READER_METHODS = new Set(["nextLine","next","nextInt","nextDouble","nextFloat","nextLong","readLine","read","readAll","readAllBytes"]);
const CS_REQUEST_PROPS = new Set(["Query","Form","Headers","Cookies","Body","Path","QueryString","RouteValues","Method","Host","ContentType","Protocol","Scheme","PathBase","HasFormContentType"]);

// ═══════════════════════════════════════════════════
//  SECTION 3b — SANITIZER DEFINITIONS & CONTROL FLOW
// ═══════════════════════════════════════════════════

/**
 * Known sanitization functions per language.
 * If a tainted variable is passed through one of these, it should not
 * trigger findings for the mitigated vulnerability categories.
 */
interface LangSanitizer { method: string; chain?: string[]; mitigates: Set<string>; }

const JAVA_SANITIZERS: LangSanitizer[] = [
  { method: "forHtml",        chain: ["Encode"],            mitigates: new Set(["java-xss"]) },
  { method: "forJavaScript",  chain: ["Encode"],            mitigates: new Set(["java-xss"]) },
  { method: "encodeForHTML",  chain: ["encoder()"],         mitigates: new Set(["java-xss"]) },
  { method: "escapeHtml4",                                  mitigates: new Set(["java-xss"]) },
  { method: "escapeXml",                                    mitigates: new Set(["java-xss"]) },
  { method: "prepareStatement",                             mitigates: new Set(["java-sql-injection", "java-sql-concat"]) },
  { method: "setParameter",                                 mitigates: new Set(["java-sql-injection"]) },
  { method: "setString",                                    mitigates: new Set(["java-sql-injection"]) },
  { method: "parseInt",       chain: ["Integer"],           mitigates: new Set(["java-sql-injection", "java-command-injection", "java-xss"]) },
  { method: "valueOf",        chain: ["Integer"],           mitigates: new Set(["java-sql-injection", "java-command-injection", "java-xss"]) },
  { method: "matches",                                      mitigates: new Set(["java-command-injection", "java-sql-injection", "java-path-traversal", "java-xss"]) },
  { method: "toRealPath",                                   mitigates: new Set(["java-path-traversal"]) },
  { method: "normalize",                                    mitigates: new Set(["java-path-traversal"]) },
  { method: "getCanonicalPath",                             mitigates: new Set(["java-path-traversal"]) },
  { method: "escapeLdap",                                   mitigates: new Set(["java-ldap-injection"]) },
  { method: "replaceAll",                                   mitigates: new Set(["java-log-injection"]) },
];

const CPP_SANITIZERS: LangSanitizer[] = [
  { method: "strncpy",   mitigates: new Set(["cpp-buffer-overflow-strcpy"]) },
  { method: "strlcpy",   mitigates: new Set(["cpp-buffer-overflow-strcpy"]) },
  { method: "strncat",   mitigates: new Set(["cpp-buffer-overflow-strcat"]) },
  { method: "strlcat",   mitigates: new Set(["cpp-buffer-overflow-strcat"]) },
  { method: "snprintf",  mitigates: new Set(["cpp-buffer-overflow-sprintf", "cpp-format-string"]) },
  { method: "fgets",     mitigates: new Set(["cpp-buffer-overflow-gets"]) },
  { method: "wcsncpy",   mitigates: new Set(["cpp-buffer-overflow-wcscpy"]) },
  { method: "wcsncat",   mitigates: new Set(["cpp-buffer-overflow-wcscat"]) },
  { method: "strtol",    mitigates: new Set(["cpp-integer-overflow"]) },
  { method: "strtoll",   mitigates: new Set(["cpp-integer-overflow"]) },
  { method: "stoi",      mitigates: new Set(["cpp-integer-overflow"]) },
  { method: "realpath",  mitigates: new Set(["cpp-path-traversal"]) },
  { method: "execFile",  mitigates: new Set(["cpp-command-injection"]) },
];

const CS_SANITIZERS: LangSanitizer[] = [
  { method: "HtmlEncode",     chain: ["WebUtility"],       mitigates: new Set(["csharp-xss"]) },
  { method: "Encode",         chain: ["HtmlEncoder"],      mitigates: new Set(["csharp-xss"]) },
  { method: "AddWithValue",                                mitigates: new Set(["csharp-sql-injection", "csharp-sql-concat"]) },
  { method: "Add",            chain: ["Parameters"],       mitigates: new Set(["csharp-sql-injection", "csharp-sql-concat"]) },
  { method: "GetFullPath",    chain: ["Path"],             mitigates: new Set(["csharp-path-traversal"]) },
  { method: "IsLocalUrl",     chain: ["Url"],              mitigates: new Set(["csharp-open-redirect"]) },
  { method: "LocalRedirect",                               mitigates: new Set(["csharp-open-redirect"]) },
  { method: "Parse",          chain: ["Int32"],            mitigates: new Set(["csharp-sql-injection", "csharp-command-injection", "csharp-xss"]) },
  { method: "TryParse",       chain: ["Int32"],            mitigates: new Set(["csharp-sql-injection", "csharp-command-injection", "csharp-xss"]) },
  { method: "Sanitize",                                    mitigates: new Set(["csharp-xss"]) },
  { method: "IsMatch",        chain: ["Regex"],            mitigates: new Set(["csharp-command-injection", "csharp-sql-injection", "csharp-xss"]) },
];

function getSanitizersForLanguage(lang: Language): LangSanitizer[] {
  switch (lang) { case "java": return JAVA_SANITIZERS; case "cpp": return CPP_SANITIZERS; case "csharp": return CS_SANITIZERS; }
}

/**
 * Build a set of sanitized variables.
 * Scans for patterns like: sanitized = sanitizerFunction(tainted)
 * and for method calls: tainted.matches("^[a-zA-Z]+$")
 */
function buildSanitizedMap(tokens: Token[], lang: Language, tainted: Map<string, TaintInfo>, lines: string[]): Map<string, Set<string>> {
  const sanitized = new Map<string, Set<string>>();
  const sanitizers = getSanitizersForLanguage(lang);

  for (let i = 0; i < tokens.length; i++) {
    // Pattern: varName = SanitizerCall(...)
    const asgn = detectAssignment(tokens, i);
    if (asgn) {
      for (let k = asgn.valueStart; k < asgn.valueEnd; k++) {
        if (tokens[k].t !== TT.Ident || tokens[k + 1]?.t !== TT.LParen) continue;
        const methodName = tokens[k].v;
        for (const san of sanitizers) {
          if (san.method !== methodName) continue;
          if (san.chain) {
            const chain = resolveChain(tokens, k);
            if (!san.chain.some(hint => chain.some(p => p.startsWith(hint)))) continue;
          }
          // This assignment goes through a sanitizer
          const existing = sanitized.get(asgn.varName) || new Set<string>();
          for (const m of san.mitigates) existing.add(m);
          sanitized.set(asgn.varName, existing);
        }
      }
    }

    // Pattern: taintedVar.sanitizerMethod(...) — in-place validation pattern
    if (tokens[i].t === TT.Ident && tainted.has(tokens[i].v) && tokens[i + 1]?.t === TT.Dot && tokens[i + 2]?.t === TT.Ident) {
      const methodName = tokens[i + 2].v;
      for (const san of sanitizers) {
        if (san.method === methodName) {
          const existing = sanitized.get(tokens[i].v) || new Set<string>();
          for (const m of san.mitigates) existing.add(m);
          sanitized.set(tokens[i].v, existing);
        }
      }
    }
  }

  return sanitized;
}

/** Known validation patterns — functions that when called as guards should reduce confidence */
const VALIDATION_METHODS = new Set([
  "matches", "startsWith", "endsWith", "contains", "isEmpty", "isBlank",
  "IsNullOrEmpty", "IsNullOrWhiteSpace", "isValid", "validate", "check",
  "isMatch", "TryParse", "equalsIgnoreCase", "contentEquals",
  "isDigit", "isAlpha", "isAlphanumeric", "isLetterOrDigit",
]);

/**
 * Check if a tainted variable has a validation guard before the sink line.
 * Looks for if-statements where the condition calls a validation method on the variable.
 */
function hasValidationGuardToken(tokens: Token[], varName: string, sinkLine: number, lang: Language): boolean {
  // Search backwards from the sink for an if-statement testing the variable
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].ln >= sinkLine) break;
    if (tokens[i].t !== TT.Keyword || tokens[i].v !== "if") continue;
    if (tokens[i + 1]?.t !== TT.LParen) continue;

    // Scan the condition (between parentheses) for validation of varName
    let depth = 1;
    let j = i + 2;
    while (j < tokens.length && depth > 0) {
      if (tokens[j].t === TT.LParen) depth++;
      if (tokens[j].t === TT.RParen) depth--;
      if (depth > 0) {
        // Check: varName.validationMethod(...)
        if (tokens[j].t === TT.Ident && tokens[j].v === varName &&
            tokens[j + 1]?.t === TT.Dot && tokens[j + 2]?.t === TT.Ident &&
            VALIDATION_METHODS.has(tokens[j + 2].v)) {
          return true;
        }
        // Check: ValidationClass.method(varName, ...)
        if (tokens[j].t === TT.Ident && VALIDATION_METHODS.has(tokens[j].v) && tokens[j + 1]?.t === TT.LParen) {
          const { args } = extractArgs(tokens, j + 1);
          for (const arg of args) {
            if (arg.some(t => t.t === TT.Ident && t.v === varName)) return true;
          }
        }
      }
      j++;
    }
  }
  return false;
}

// ═══════════════════════════════════════════════════
//  SECTION 3c — INTER-PROCEDURAL ANALYSIS
// ═══════════════════════════════════════════════════

interface MethodDef {
  name: string;
  params: string[];
  bodyStart: number;  // token index of opening {
  bodyEnd: number;    // token index of closing }
  startLine: number;
}

/**
 * Collect method/function definitions from the token stream.
 */
function collectMethodDefs(tokens: Token[], lang: Language): MethodDef[] {
  const methods: MethodDef[] = [];

  for (let i = 0; i < tokens.length; i++) {
    // Java/C#: [modifiers] ReturnType methodName ( params ) { body }
    // C++: ReturnType functionName ( params ) { body }
    if (tokens[i].t === TT.Ident && tokens[i + 1]?.t === TT.LParen) {
      const methodName = tokens[i].v;

      // Skip if it looks like a keyword or known function call (not a definition)
      // Heuristic: a definition has a return type or modifier before the name
      let isDefinition = false;
      if (i > 0) {
        const prev = tokens[i - 1];
        // Check if preceded by a type (Ident, keyword like void/int/string/boolean/etc.)
        if (prev.t === TT.Ident || (prev.t === TT.Keyword && ["void", "int", "long", "double", "float", "char", "boolean", "string", "bool", "short", "byte", "var", "auto", "static", "public", "private", "protected", "override", "virtual", "abstract", "async"].includes(prev.v))) {
          isDefinition = true;
        }
        // Also check 2 back: "public static void methodName"
        if (i > 1 && tokens[i - 2].t === TT.Keyword) isDefinition = true;
        // C/C++: ReturnType* methodName(
        if (prev.t === TT.Star) isDefinition = true;
        // main is always a definition
        if (methodName === "main" || methodName === "Main") isDefinition = true;
      }
      if (!isDefinition) continue;

      // Extract parameters
      const params: string[] = [];
      let j = i + 2; // skip name and (
      while (j < tokens.length && tokens[j].t !== TT.RParen && tokens[j].t !== TT.Eof) {
        if (tokens[j].t === TT.Ident && (tokens[j + 1]?.t === TT.Comma || tokens[j + 1]?.t === TT.RParen)) {
          params.push(tokens[j].v);
        }
        j++;
      }
      j++; // skip )

      // Skip optional throws/const/override
      while (j < tokens.length && tokens[j].t !== TT.LBrace && tokens[j].t !== TT.Semi && tokens[j].t !== TT.Eof) j++;

      if (tokens[j]?.t !== TT.LBrace) continue;
      const bodyStart = j;

      // Find matching }
      let depth = 1; j++;
      while (j < tokens.length && depth > 0) {
        if (tokens[j].t === TT.LBrace) depth++;
        if (tokens[j].t === TT.RBrace) depth--;
        j++;
      }
      const bodyEnd = j - 1;

      methods.push({ name: methodName, params, bodyStart, bodyEnd, startLine: tokens[i].ln });
    }
  }

  return methods;
}

/**
 * Inter-procedural taint: when a function is called with tainted args,
 * check if those args flow to sinks inside the function body.
 */
function checkInterProcedural(
  tokens: Token[], methods: MethodDef[], tainted: Map<string, TaintInfo>,
  sanitized: Map<string, Set<string>>, sinks: SinkDef[], lines: string[], lang: Language,
  addFinding: (f: PatternFinding) => void
) {
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].t !== TT.Ident || tokens[i + 1]?.t !== TT.LParen) continue;
    const callName = tokens[i].v;

    // Find matching method definition
    const method = methods.find(m => m.name === callName);
    if (!method) continue;

    // Check if any call argument is tainted
    const { args } = extractArgs(tokens, i + 1);
    const taintedParams = new Map<string, TaintInfo>();

    for (let ai = 0; ai < args.length; ai++) {
      const ti = argTaint(args[ai], tainted);
      if (ti && ai < method.params.length) {
        taintedParams.set(method.params[ai], ti);
      }
    }

    if (taintedParams.size === 0) continue;

    // Scan the method body for sinks using the tainted params
    for (let j = method.bodyStart; j <= method.bodyEnd; j++) {
      if (tokens[j].t !== TT.Ident || tokens[j + 1]?.t !== TT.LParen) continue;
      const innerMethod = tokens[j].v;

      for (const sink of sinks) {
        if (!sink.methods.includes(innerMethod)) continue;
        if (sink.chainHint) {
          const chain = resolveChain(tokens, j);
          if (!sink.chainHint.some(hint => chain.some(p => p.startsWith(hint)))) continue;
        }

        const { args: innerArgs } = extractArgs(tokens, j + 1);
        const argsToCheck = sink.argIdx === -1 ? innerArgs : (innerArgs[sink.argIdx] ? [innerArgs[sink.argIdx]] : []);

        for (const innerArg of argsToCheck) {
          const ti = argTaint(innerArg, taintedParams);
          if (!ti) continue;

          const callLine = tokens[i].ln;
          const sinkLine = tokens[j].ln;
          const dataflow = [
            { line: ti.sourceLine, label: `Source: ${ti.label}`, code: ti.sourceCode },
            { line: callLine, label: `Call: ${callName}() with tainted arg`, code: lines[callLine - 1]?.trim() || "" },
            { line: sinkLine, label: `Sink: ${innerMethod}() inside ${callName}()`, code: lines[sinkLine - 1]?.trim() || "" },
          ];

          addFinding({
            id: sink.id,
            name: `${sink.name} (via ${callName}())`,
            severity: sink.severity,
            confidence: "medium",
            line: callLine,
            column: tokens[i].col,
            category: sink.category,
            cwe: sink.cwe,
            owasp: sink.owasp,
            detail: `Tainted data (${ti.label}) flows into ${callName}(), which passes it to ${innerMethod}() without sanitization.`,
            evidence: lines[callLine - 1]?.trim() || "",
            codeSnippet: buildSnippet(lines, callLine),
            dataflow,
            remediation: sink.remediation,
          });
        }
      }
    }
  }
}

/**
 * Build a map of tainted variables by scanning the token stream.
 *
 * Pass 1: Detect tainted function parameters (main args, annotated params, cin >>)
 * Pass 2: Walk assignments/declarations and propagate taint
 * Pass 3: Re-propagate for chained assignments (a = args[0]; b = a; c = b;)
 */
function buildTaintMap(tokens: Token[], lang: Language, lines: string[]): Map<string, TaintInfo> {
  const tainted = new Map<string, TaintInfo>();

  const lineOf = (ln: number) => (ln > 0 && ln <= lines.length ? lines[ln - 1].trim() : "");

  // Wrap detectTaintInExpr to fill in real source code
  const detectTaint = (start: number, end: number): TaintInfo | null => {
    const raw = detectTaintInExpr(tokens, start, end, lang, tainted);
    if (raw && !raw.sourceCode) raw.sourceCode = lineOf(raw.sourceLine);
    return raw;
  };

  // ── Pass 1: Function parameters ──
  for (let i = 0; i < tokens.length; i++) {
    // Java: main(String[] args)
    if (lang === "java" && tokens[i].t === TT.Ident && tokens[i].v === "main" && tokens[i + 1]?.t === TT.LParen) {
      let j = i + 2;
      while (j < tokens.length && tokens[j].t !== TT.RParen && tokens[j].t !== TT.Eof) {
        if (tokens[j].t === TT.Ident && tokens[j].v === "args") {
          tainted.set("args", { label: "command-line argument", sourceLine: tokens[j].ln, sourceCode: lineOf(tokens[j].ln) });
        }
        j++;
      }
    }
    // C++: main(int argc, char** argv)
    if (lang === "cpp" && tokens[i].t === TT.Ident && tokens[i].v === "main" && tokens[i + 1]?.t === TT.LParen) {
      let j = i + 2;
      while (j < tokens.length && tokens[j].t !== TT.RParen && tokens[j].t !== TT.Eof) {
        if (tokens[j].t === TT.Ident && (tokens[j].v === "argv" || tokens[j].v === "argc"))
          tainted.set(tokens[j].v, { label: "command-line argument", sourceLine: tokens[j].ln, sourceCode: lineOf(tokens[j].ln) });
        j++;
      }
    }
    // C#: Main(string[] args) or top-level args
    if (lang === "csharp" && tokens[i].t === TT.Ident && tokens[i].v === "Main" && tokens[i + 1]?.t === TT.LParen) {
      let j = i + 2;
      while (j < tokens.length && tokens[j].t !== TT.RParen && tokens[j].t !== TT.Eof) {
        if (tokens[j].t === TT.Ident && tokens[j].v === "args")
          tainted.set("args", { label: "command-line argument", sourceLine: tokens[j].ln, sourceCode: lineOf(tokens[j].ln) });
        j++;
      }
    }

    // Annotated parameters (Java: @RequestParam, C#: [FromQuery] etc.)
    if (tokens[i].t === TT.At) {
      const ann = tokens[i].v;
      const TAINT_ANNOTATIONS: Record<string, string> = {
        "@RequestParam": "HTTP query parameter", "@PathVariable": "URL path variable",
        "@RequestBody": "HTTP request body", "@RequestHeader": "HTTP header",
        "@CookieValue": "cookie value", "@ModelAttribute": "model attribute",
      };
      if (TAINT_ANNOTATIONS[ann]) {
        // Find the parameter name: skip optional (...) then type tokens, take next IDENT before , or )
        let j = i + 1;
        if (j < tokens.length && tokens[j].t === TT.LParen) { j = skipParen(tokens, j); j++; }
        // skip type
        while (j < tokens.length && (tokens[j].t === TT.Ident || tokens[j].t === TT.Keyword || tokens[j].t === TT.Lt || tokens[j].t === TT.Gt || tokens[j].t === TT.LBracket || tokens[j].t === TT.RBracket || tokens[j].t === TT.Star || tokens[j].t === TT.Amp || tokens[j].t === TT.Dot || tokens[j].t === TT.At)) {
          if (tokens[j].t === TT.Ident && j + 1 < tokens.length && (tokens[j + 1].t === TT.Comma || tokens[j + 1].t === TT.RParen || tokens[j + 1].t === TT.Assign)) {
            tainted.set(tokens[j].v, { label: TAINT_ANNOTATIONS[ann], sourceLine: tokens[j].ln, sourceCode: lineOf(tokens[j].ln) });
            break;
          }
          j++;
        }
      }
    }
    // C# attribute-style [FromQuery], [FromBody], etc.
    if (lang === "csharp" && tokens[i].t === TT.LBracket && tokens[i + 1]?.t === TT.Ident) {
      const attr = tokens[i + 1].v;
      const CS_TAINT_ATTRS: Record<string, string> = {
        "FromQuery": "HTTP query parameter", "FromBody": "HTTP request body",
        "FromRoute": "URL route parameter", "FromHeader": "HTTP header", "FromForm": "form data",
      };
      if (CS_TAINT_ATTRS[attr]) {
        // find closing ] then the parameter
        let j = i + 2;
        while (j < tokens.length && tokens[j].t !== TT.RBracket) j++;
        j++; // skip ]
        // skip type
        while (j < tokens.length && (tokens[j].t === TT.Ident || tokens[j].t === TT.Keyword || tokens[j].t === TT.Lt || tokens[j].t === TT.Gt || tokens[j].t === TT.LBracket || tokens[j].t === TT.RBracket || tokens[j].t === TT.Star || tokens[j].t === TT.Question || tokens[j].t === TT.Dot)) {
          if (tokens[j].t === TT.Ident && j + 1 < tokens.length && (tokens[j + 1].t === TT.Comma || tokens[j + 1].t === TT.RParen || tokens[j + 1].t === TT.Assign)) {
            tainted.set(tokens[j].v, { label: CS_TAINT_ATTRS[attr], sourceLine: tokens[j].ln, sourceCode: lineOf(tokens[j].ln) });
            break;
          }
          j++;
        }
      }
    }

    // C++: cin >> var — var becomes tainted
    if (lang === "cpp" && tokens[i].t === TT.Ident && tokens[i].v === "cin") {
      let j = i + 1;
      while (j < tokens.length && (tokens[j].t === TT.Shr || tokens[j].t === TT.Gt)) {
        j++;
        if (j < tokens.length && tokens[j].t === TT.Ident) {
          tainted.set(tokens[j].v, { label: "standard input (cin)", sourceLine: tokens[j].ln, sourceCode: lineOf(tokens[j].ln) });
          j++;
        }
      }
    }
  }

  // ── Pass 2 & 3: Assignments and taint propagation (run twice for chains) ──
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < tokens.length; i++) {
      const asgn = detectAssignment(tokens, i);
      if (!asgn) continue;
      const { varName, valueStart, valueEnd, line } = asgn;
      if (tainted.has(varName) && pass > 0) continue; // already tainted

      const ti = detectTaint(valueStart, valueEnd);
      if (ti) {
        // Build chain: inherit from upstream taint + add this propagation step
        const prevChain = ti.chain || [{ line: ti.sourceLine, code: ti.sourceCode, label: `Source: ${ti.label}` }];
        const thisCode = lineOf(line);
        const chain = [...prevChain];
        // Only add if this is a new line (not the source itself)
        if (line !== ti.sourceLine) {
          chain.push({ line, code: thisCode, label: `${varName} = tainted value` });
        }
        tainted.set(varName, { label: ti.label, sourceLine: ti.sourceLine, sourceCode: ti.sourceCode, chain });
      }
    }
  }

  return tainted;
}

/**
 * Detect a variable declaration or assignment at position `pos`.
 *   Pattern A: [modifiers] Type varName = expr ;
 *   Pattern B: varName = expr ;
 */
function detectAssignment(tokens: Token[], pos: number): { varName: string; valueStart: number; valueEnd: number; line: number } | null {
  const tok = tokens[pos];
  if (!tok || tok.t === TT.Eof) return null;

  // Pattern B: ident = expr ;   (simplest)
  if (tok.t === TT.Ident && tokens[pos + 1]?.t === TT.Assign) {
    // must NOT be preceded by DOT, ARROW, SCOPE (that would be obj.field = ...)
    if (pos > 0 && (tokens[pos - 1].t === TT.Dot || tokens[pos - 1].t === TT.Arrow || tokens[pos - 1].t === TT.Scope)) return null;
    const valueStart = pos + 2;
    const valueEnd = findSemiOrEnd(tokens, valueStart);
    if (valueEnd > valueStart) return { varName: tok.v, valueStart, valueEnd, line: tok.ln };
  }

  // Pattern A: Type varName = expr ;
  // We look for a sequence: (keywords/idents that look like a type), then IDENT, then =
  if (tok.t === TT.Ident || tok.t === TT.Keyword) {
    let j = pos;
    // skip modifiers: public, static, final, const, unsigned, signed, volatile, etc.
    while (j < tokens.length && tokens[j].t === TT.Keyword && TYPE_MODIFIERS.has(tokens[j].v)) j++;
    if (j >= tokens.length) return null;
    // expect a type name (Ident or keyword like int, char, string, etc.)
    if (tokens[j].t !== TT.Ident && tokens[j].t !== TT.Keyword) return null;
    const typeStart = j;
    j++;
    // skip generic params <...>
    if (j < tokens.length && tokens[j].t === TT.Lt) {
      let depth = 1; j++;
      while (j < tokens.length && depth > 0) {
        if (tokens[j].t === TT.Lt) depth++;
        if (tokens[j].t === TT.Gt) depth--;
        j++;
      }
    }
    // skip namespace qualifiers Type::Sub or Type.Sub
    while (j + 1 < tokens.length && (tokens[j].t === TT.Scope || tokens[j].t === TT.Dot) && tokens[j + 1].t === TT.Ident) {
      j += 2;
    }
    // skip array [] / pointer * / reference &
    while (j < tokens.length && (tokens[j].t === TT.LBracket || tokens[j].t === TT.Star || tokens[j].t === TT.Amp)) {
      if (tokens[j].t === TT.LBracket) { j++; if (j < tokens.length && tokens[j].t === TT.RBracket) j++; }
      else j++;
    }
    // Now expect: IDENT = expr ;
    if (j < tokens.length && tokens[j].t === TT.Ident && j + 1 < tokens.length && tokens[j + 1].t === TT.Assign) {
      // Ensure this is NOT the same token as typeStart (i.e. we actually consumed a type)
      if (j > typeStart) {
        const varName = tokens[j].v;
        const valueStart = j + 2;
        const valueEnd = findSemiOrEnd(tokens, valueStart);
        if (valueEnd > valueStart) return { varName, valueStart, valueEnd, line: tokens[j].ln };
      }
    }
  }

  return null;
}

const TYPE_MODIFIERS = new Set([
  "public","private","protected","static","final","const","constexpr","volatile","mutable",
  "abstract","virtual","override","sealed","readonly","extern","inline","register",
  "signed","unsigned","explicit","internal","async","new","transient","native","strictfp",
]);

function findSemiOrEnd(tokens: Token[], start: number): number {
  let depth = 0;
  let j = start;
  while (j < tokens.length) {
    const t = tokens[j].t;
    if (t === TT.LParen || t === TT.LBracket || t === TT.LBrace) depth++;
    else if (t === TT.RParen || t === TT.RBracket || t === TT.RBrace) { depth--; if (depth < 0) return j; }
    if (depth === 0 && t === TT.Semi) return j;
    if (t === TT.Eof) return j;
    j++;
  }
  return j;
}

function skipParen(tokens: Token[], openPos: number): number {
  let depth = 1, j = openPos + 1;
  while (j < tokens.length && depth > 0) {
    if (tokens[j].t === TT.LParen) depth++;
    if (tokens[j].t === TT.RParen) depth--;
    j++;
  }
  return j - 1;
}

// ═══════════════════════════════════════════════════
//  SECTION 4 — METHOD CALL EXTRACTION & ARGUMENT ANALYSIS
// ═══════════════════════════════════════════════════

function extractArgs(tokens: Token[], openParen: number): { args: Token[][]; endParen: number } {
  const args: Token[][] = [[]];
  let depth = 1, j = openParen + 1;
  while (j < tokens.length && depth > 0) {
    const t = tokens[j].t;
    if (t === TT.LParen || t === TT.LBracket || t === TT.LBrace) depth++;
    else if (t === TT.RParen || t === TT.RBracket || t === TT.RBrace) { depth--; if (depth === 0) break; }
    if (t === TT.Comma && depth === 1) args.push([]);
    else args[args.length - 1].push(tokens[j]);
    j++;
  }
  return { args: args.filter(a => a.length > 0), endParen: j };
}

/** Check if argument tokens contain a tainted variable (direct or via concatenation). */
function argTaint(argTokens: Token[], tainted: Map<string, TaintInfo>): TaintInfo | null {
  for (const tok of argTokens) {
    if (tok.t === TT.Ident && tainted.has(tok.v)) return tainted.get(tok.v)!;
  }
  return null;
}

/** Resolve the object chain before a method call. E.g. Runtime.getRuntime().exec → ["Runtime","getRuntime()","exec"] */
function resolveChain(tokens: Token[], methodPos: number): string[] {
  const parts: string[] = [tokens[methodPos].v];
  let i = methodPos - 1;
  while (i >= 0) {
    if (tokens[i].t === TT.Dot || tokens[i].t === TT.Arrow || tokens[i].t === TT.Scope) {
      i--;
      if (i < 0) break;
      if (tokens[i].t === TT.RParen) {
        // chained call: something().method()
        let depth = 1; i--;
        while (i >= 0 && depth > 0) { if (tokens[i].t === TT.RParen) depth++; if (tokens[i].t === TT.LParen) depth--; i--; }
        if (i >= 0 && tokens[i].t === TT.Ident) { parts.unshift(tokens[i].v + "()"); i--; continue; }
      } else if (tokens[i].t === TT.RBracket) {
        let depth = 1; i--;
        while (i >= 0 && depth > 0) { if (tokens[i].t === TT.RBracket) depth++; if (tokens[i].t === TT.LBracket) depth--; i--; }
        if (i >= 0 && tokens[i].t === TT.Ident) { parts.unshift(tokens[i].v + "[]"); i--; continue; }
      } else if (tokens[i].t === TT.Ident) { parts.unshift(tokens[i].v); i--; continue; }
    }
    break;
  }
  return parts;
}

// ═══════════════════════════════════════════════════
//  SECTION 5 — SINK DEFINITIONS
// ═══════════════════════════════════════════════════

interface SinkDef {
  id: string; name: string; severity: Severity; category: string; cwe: string; owasp: string;
  methods: string[];
  /** If set, chain must contain at least one of these strings */
  chainHint?: string[];
  /** 0-based arg index that is dangerous, -1 = any */
  argIdx: number;
  requiresTaint: boolean;
  detail: string;
  remediation: string;
  confidence: "high" | "medium" | "low";
}

const JAVA_SINKS: SinkDef[] = [
  { id: "java-command-injection", name: "Command Injection", severity: "critical", category: "Injection", cwe: "CWE-78", owasp: "A03:2021",
    methods: ["exec"], chainHint: ["Runtime","getRuntime()"], argIdx: 0, requiresTaint: true,
    detail: "Runtime.exec() with user-controlled input enables OS command injection.",
    remediation: "Use ProcessBuilder with a String array (not a single string). Validate and allowlist commands.", confidence: "high" },
  { id: "java-command-injection-pb", name: "Command Injection (ProcessBuilder)", severity: "critical", category: "Injection", cwe: "CWE-78", owasp: "A03:2021",
    methods: ["start"], chainHint: ["ProcessBuilder"], argIdx: -1, requiresTaint: true,
    detail: "ProcessBuilder.start() with user-controlled arguments enables command injection.",
    remediation: "Never pass user input directly to ProcessBuilder. Validate commands against an allowlist.", confidence: "high" },
  { id: "java-sql-injection", name: "SQL Injection", severity: "critical", category: "Injection", cwe: "CWE-89", owasp: "A03:2021",
    methods: ["executeQuery","executeUpdate","execute","createQuery","createNativeQuery","nativeQuery"], argIdx: 0, requiresTaint: true,
    detail: "SQL query executed with user-controlled data enables SQL injection.",
    remediation: "Use PreparedStatement with parameterized queries: ps = conn.prepareStatement(\"SELECT * FROM t WHERE id=?\"); ps.setString(1, id);", confidence: "high" },
  { id: "java-path-traversal", name: "Path Traversal", severity: "high", category: "Access Control", cwe: "CWE-22", owasp: "A01:2021",
    methods: ["FileInputStream","FileOutputStream","FileReader","FileWriter","RandomAccessFile"], argIdx: 0, requiresTaint: true,
    detail: "File path constructed from user input enables path traversal (../../etc/passwd).",
    remediation: "Validate and canonicalize file paths. Ensure they stay within an allowed base directory.", confidence: "high" },
  { id: "java-xss", name: "Cross-Site Scripting (XSS)", severity: "high", category: "Injection", cwe: "CWE-79", owasp: "A03:2021",
    methods: ["print","println","write"], chainHint: ["getWriter()","getOutputStream()"], argIdx: 0, requiresTaint: true,
    detail: "User input written to HTTP response without encoding enables XSS.",
    remediation: "HTML-encode all user input before writing to response. Use OWASP Java Encoder.", confidence: "medium" },
  { id: "java-ssrf", name: "Server-Side Request Forgery", severity: "high", category: "SSRF", cwe: "CWE-918", owasp: "A10:2021",
    methods: ["openConnection","openStream"], chainHint: ["URL"], argIdx: -1, requiresTaint: true,
    detail: "URL created from user input enables SSRF — attacker can reach internal services.",
    remediation: "Validate URLs against an allowlist. Block private IP ranges and cloud metadata endpoints.", confidence: "medium" },
  { id: "java-deserialization", name: "Insecure Deserialization", severity: "critical", category: "Deserialization", cwe: "CWE-502", owasp: "A08:2021",
    methods: ["readObject","readUnshared"], chainHint: ["ObjectInputStream"], argIdx: -1, requiresTaint: false,
    detail: "ObjectInputStream.readObject() deserializes arbitrary objects — enables remote code execution.",
    remediation: "Avoid Java serialization. Use JSON/protobuf. If required, use ObjectInputFilter to allowlist classes.", confidence: "high" },
  { id: "java-xxe", name: "XML External Entity (XXE)", severity: "high", category: "Injection", cwe: "CWE-611", owasp: "A05:2021",
    methods: ["parse","newDocumentBuilder"], chainHint: ["DocumentBuilderFactory","SAXParserFactory","DocumentBuilder"], argIdx: -1, requiresTaint: false,
    detail: "XML parser without disabled external entities — enables file disclosure and SSRF via XXE.",
    remediation: "factory.setFeature(\"http://apache.org/xml/features/disallow-doctype-decl\", true); factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);", confidence: "medium" },
  { id: "java-ldap-injection", name: "LDAP Injection", severity: "high", category: "Injection", cwe: "CWE-90", owasp: "A03:2021",
    methods: ["search"], chainHint: ["DirContext","InitialDirContext","LdapContext"], argIdx: -1, requiresTaint: true,
    detail: "LDAP search with user-controlled filter enables LDAP injection.",
    remediation: "Use parameterized LDAP search filters. Escape special LDAP characters in user input.", confidence: "medium" },
  { id: "java-open-redirect", name: "Open Redirect", severity: "medium", category: "Access Control", cwe: "CWE-601", owasp: "A01:2021",
    methods: ["sendRedirect"], argIdx: 0, requiresTaint: true,
    detail: "HTTP redirect to user-controlled URL enables phishing via open redirect.",
    remediation: "Validate redirect URLs against an allowlist. Only allow relative paths or trusted domains.", confidence: "medium" },
  { id: "java-log-injection", name: "Log Injection", severity: "medium", category: "Logging", cwe: "CWE-117", owasp: "A09:2021",
    methods: ["info","warn","error","debug","trace","log"], chainHint: ["logger","Logger","LOG","log"], argIdx: -1, requiresTaint: true,
    detail: "Unsanitized user input in log messages enables log forging and log injection.",
    remediation: "Sanitize user input before logging. Strip newlines, carriage returns, and ANSI escape codes.", confidence: "low" },
  // New Java sinks
  { id: "java-reflection-rce", name: "Reflection-Based Code Execution", severity: "critical", category: "Injection", cwe: "CWE-470", owasp: "A03:2021",
    methods: ["forName","loadClass"], chainHint: ["Class","ClassLoader","URLClassLoader","Thread"], argIdx: 0, requiresTaint: true,
    detail: "Class.forName() with user-controlled input enables arbitrary class loading — remote code execution risk.",
    remediation: "Never pass user input to Class.forName(). Use an allowlist of permitted class names.", confidence: "high" },
  { id: "java-reflection-invoke", name: "Unsafe Reflection Invocation", severity: "critical", category: "Injection", cwe: "CWE-470", owasp: "A03:2021",
    methods: ["invoke"], chainHint: ["Method"], argIdx: -1, requiresTaint: true,
    detail: "Method.invoke() with user-controlled target enables arbitrary method execution.",
    remediation: "Validate method names against an allowlist. Never allow user input to control reflection targets.", confidence: "medium" },
  { id: "java-jndi-injection", name: "JNDI Injection", severity: "critical", category: "Injection", cwe: "CWE-074", owasp: "A03:2021",
    methods: ["lookup","lookupLink"], chainHint: ["InitialContext","Context","NamingManager"], argIdx: 0, requiresTaint: true,
    detail: "JNDI lookup with user-controlled name enables remote code execution (similar to Log4Shell).",
    remediation: "Never pass user input to JNDI lookups. Set com.sun.jndi.ldap.object.trustURLCodebase=false.", confidence: "high" },
  { id: "java-xpath-injection", name: "XPath Injection", severity: "high", category: "Injection", cwe: "CWE-643", owasp: "A03:2021",
    methods: ["evaluate","compile"], chainHint: ["XPath","XPathFactory"], argIdx: 0, requiresTaint: true,
    detail: "XPath query with user input enables extraction of XML data or authentication bypass.",
    remediation: "Use parameterized XPath queries with XPathVariableResolver. Never concatenate user input.", confidence: "medium" },
  { id: "java-el-injection", name: "Expression Language Injection", severity: "critical", category: "Injection", cwe: "CWE-917", owasp: "A03:2021",
    methods: ["createValueExpression","createMethodExpression"], chainHint: ["ExpressionFactory"], argIdx: 0, requiresTaint: true,
    detail: "Evaluating user-controlled Expression Language (EL) enables remote code execution.",
    remediation: "Never pass user input to EL expressions. Use parameterized templates.", confidence: "high" },
  { id: "java-header-injection", name: "HTTP Response Splitting", severity: "high", category: "Injection", cwe: "CWE-113", owasp: "A03:2021",
    methods: ["setHeader","addHeader","addCookie"], argIdx: -1, requiresTaint: true,
    detail: "User input in HTTP headers enables response splitting and header injection.",
    remediation: "Validate header values — strip CR/LF characters. Use framework response methods that auto-sanitize.", confidence: "medium" },
  { id: "java-spring-sqli", name: "SQL Injection (Spring JdbcTemplate)", severity: "critical", category: "Injection", cwe: "CWE-89", owasp: "A03:2021",
    methods: ["queryForObject","queryForList","queryForMap","update","batchUpdate"], chainHint: ["jdbcTemplate","JdbcTemplate","namedParameterJdbcTemplate"], argIdx: 0, requiresTaint: true,
    detail: "JdbcTemplate query with string concatenation enables SQL injection.",
    remediation: "Use parameterized queries: jdbcTemplate.queryForObject(\"SELECT * FROM t WHERE id=?\", new Object[]{id}, RowMapper);", confidence: "high" },
];

const CPP_SINKS: SinkDef[] = [
  { id: "cpp-command-injection", name: "Command Injection", severity: "critical", category: "Injection", cwe: "CWE-78", owasp: "A03:2021",
    methods: ["system","popen","_popen","_wsystem","_wpopen"], argIdx: 0, requiresTaint: true,
    detail: "Shell command execution with user-controlled input enables arbitrary command execution.",
    remediation: "Avoid system(). Use fork()/exec() with explicit argument arrays. Validate and allowlist commands.", confidence: "high" },
  { id: "cpp-command-injection-exec", name: "Command Injection (exec family)", severity: "critical", category: "Injection", cwe: "CWE-78", owasp: "A03:2021",
    methods: ["execlp","execvp","execl","execv","execle","execve","execvpe"], argIdx: -1, requiresTaint: true,
    detail: "Process execution with user-controlled arguments enables command injection.",
    remediation: "Validate commands and arguments against an allowlist. Never pass user input to shell.", confidence: "high" },
  { id: "cpp-format-string", name: "Format String Vulnerability", severity: "critical", category: "Injection", cwe: "CWE-134", owasp: "A03:2021",
    methods: ["printf","fprintf","sprintf","snprintf","syslog","wprintf","fwprintf","swprintf","vprintf","vfprintf","vsprintf","vsnprintf"], argIdx: 0, requiresTaint: true,
    detail: "User-controlled format string enables reading/writing arbitrary memory.",
    remediation: "Always use a fixed format string: printf(\"%s\", userInput), never printf(userInput).", confidence: "high" },
  { id: "cpp-path-traversal", name: "Path Traversal", severity: "high", category: "Access Control", cwe: "CWE-22", owasp: "A01:2021",
    methods: ["fopen","open","stat","access","remove","rename","unlink","mkdir","rmdir","opendir","freopen","_wfopen","_wopen"], argIdx: 0, requiresTaint: true,
    detail: "File operation with user-controlled path enables path traversal.",
    remediation: "Validate and canonicalize paths. Use realpath() and verify result is within allowed directory.", confidence: "medium" },
  { id: "cpp-sql-injection", name: "SQL Injection", severity: "critical", category: "Injection", cwe: "CWE-89", owasp: "A03:2021",
    methods: ["mysql_query","mysql_real_query","sqlite3_exec","PQexec","PQexecParams"], argIdx: -1, requiresTaint: true,
    detail: "SQL query with user-controlled input enables SQL injection.",
    remediation: "Use parameterized queries (prepared statements). Never concatenate user input into SQL.", confidence: "high" },
  // New C++ sinks
  { id: "cpp-memcpy-overflow", name: "Buffer Overflow (memcpy)", severity: "critical", category: "Memory Safety", cwe: "CWE-120", owasp: "A06:2021",
    methods: ["memcpy","memmove","bcopy","wmemcpy","wmemmove"], argIdx: -1, requiresTaint: true,
    detail: "Memory copy with user-controlled size or source can cause buffer overflow.",
    remediation: "Validate sizes before memcpy. Use std::copy or container-based operations.", confidence: "medium" },
  { id: "cpp-tmpfile-race", name: "Insecure Temporary File", severity: "high", category: "Race Condition", cwe: "CWE-377", owasp: "A06:2021",
    methods: ["tmpnam","tempnam","mktemp","mktemp_s","_tempnam"], argIdx: -1, requiresTaint: false,
    detail: "Insecure temporary file creation — race condition between name generation and file creation (TOCTOU).",
    remediation: "Use mkstemp() or tmpfile() which atomically create unique files. Or use std::filesystem::temp_directory_path().", confidence: "high" },
  { id: "cpp-alloca-overflow", name: "Stack Buffer Overflow (alloca)", severity: "high", category: "Memory Safety", cwe: "CWE-770", owasp: "A06:2021",
    methods: ["alloca","_alloca"], argIdx: 0, requiresTaint: true,
    detail: "alloca() with user-controlled size can cause stack overflow — no bounds checking possible.",
    remediation: "Use heap allocation (malloc/new) with bounds checking instead of alloca().", confidence: "medium" },
];

const CS_SINKS: SinkDef[] = [
  { id: "csharp-command-injection", name: "Command Injection", severity: "critical", category: "Injection", cwe: "CWE-78", owasp: "A03:2021",
    methods: ["Start"], chainHint: ["Process"], argIdx: -1, requiresTaint: true,
    detail: "Process spawned with user-controlled arguments enables command injection.",
    remediation: "Set UseShellExecute=false. Use explicit FileName and Arguments (not shell). Validate and allowlist.", confidence: "high" },
  { id: "csharp-sql-injection", name: "SQL Injection", severity: "critical", category: "Injection", cwe: "CWE-89", owasp: "A03:2021",
    methods: ["ExecuteReader","ExecuteNonQuery","ExecuteScalar","ExecuteSql","FromSqlRaw","ExecuteCommand","SqlQuery","ExecuteSqlCommand","ExecuteSqlRaw"], argIdx: -1, requiresTaint: true,
    detail: "SQL query with user-controlled input enables SQL injection.",
    remediation: "Use parameterized queries: cmd.Parameters.AddWithValue(\"@id\", userId);", confidence: "high" },
  { id: "csharp-xss", name: "Cross-Site Scripting (XSS)", severity: "high", category: "Injection", cwe: "CWE-79", owasp: "A03:2021",
    methods: ["Raw"], chainHint: ["Html"], argIdx: 0, requiresTaint: true,
    detail: "Unencoded user input rendered in HTML via Html.Raw enables XSS.",
    remediation: "Use Razor auto-encoding (@Model.Property). If Html.Raw is needed, sanitize via HtmlSanitizer.", confidence: "high" },
  { id: "csharp-xss-write", name: "Cross-Site Scripting (Response.Write)", severity: "high", category: "Injection", cwe: "CWE-79", owasp: "A03:2021",
    methods: ["Write"], chainHint: ["Response"], argIdx: 0, requiresTaint: true,
    detail: "Response.Write() with user input enables XSS — no encoding applied.",
    remediation: "Use HttpUtility.HtmlEncode() before writing to response. Prefer Razor views with auto-encoding.", confidence: "high" },
  { id: "csharp-path-traversal", name: "Path Traversal", severity: "high", category: "Access Control", cwe: "CWE-22", owasp: "A01:2021",
    methods: ["ReadAllBytes","ReadAllText","ReadAllLines","Open","Delete","Copy","Move","WriteAllText","WriteAllBytes","OpenRead","OpenWrite","Create","CreateText"], chainHint: ["File","Directory","FileInfo","DirectoryInfo"], argIdx: 0, requiresTaint: true,
    detail: "File operation with user-controlled path enables path traversal.",
    remediation: "Validate and canonicalize paths. Use Path.GetFullPath() and verify within base directory.", confidence: "high" },
  { id: "csharp-ssrf", name: "Server-Side Request Forgery", severity: "high", category: "SSRF", cwe: "CWE-918", owasp: "A10:2021",
    methods: ["GetAsync","PostAsync","SendAsync","GetStringAsync","DownloadString","DownloadData","GetStreamAsync","PutAsync","DeleteAsync","PatchAsync"], argIdx: 0, requiresTaint: true,
    detail: "HTTP request to user-controlled URL enables SSRF.",
    remediation: "Validate URLs against an allowlist. Block private IPs and cloud metadata endpoints.", confidence: "medium" },
  { id: "csharp-open-redirect", name: "Open Redirect", severity: "medium", category: "Access Control", cwe: "CWE-601", owasp: "A01:2021",
    methods: ["Redirect","RedirectPermanent","RedirectToAction","RedirectToRoute"], argIdx: 0, requiresTaint: true,
    detail: "Redirect to user-controlled URL enables phishing.",
    remediation: "Use LocalRedirect() or Url.IsLocalUrl() to validate. Never redirect to user-controlled absolute URLs.", confidence: "medium" },
  { id: "csharp-deserialization", name: "Insecure Deserialization", severity: "critical", category: "Deserialization", cwe: "CWE-502", owasp: "A08:2021",
    methods: ["Deserialize"], chainHint: ["BinaryFormatter","SoapFormatter","NetDataContractSerializer","LosFormatter","ObjectStateFormatter"], argIdx: -1, requiresTaint: false,
    detail: "BinaryFormatter deserialization enables remote code execution via crafted payloads.",
    remediation: "Do NOT use BinaryFormatter. Use System.Text.Json or JSON.NET without TypeNameHandling.", confidence: "high" },
  { id: "csharp-xxe", name: "XML External Entity (XXE)", severity: "high", category: "Injection", cwe: "CWE-611", owasp: "A05:2021",
    methods: ["Load","LoadXml"], chainHint: ["XmlDocument","XmlTextReader"], argIdx: -1, requiresTaint: false,
    detail: "XmlDocument.Load() without disabling DTD processing enables XXE attacks.",
    remediation: "Set doc.XmlResolver = null before loading. Or use XmlReader.Create with DtdProcessing.Prohibit.", confidence: "medium" },
  { id: "csharp-log-injection", name: "Log Injection", severity: "medium", category: "Logging", cwe: "CWE-117", owasp: "A09:2021",
    methods: ["LogInformation","LogWarning","LogError","LogCritical","LogDebug","LogTrace"], chainHint: ["_logger","Logger","logger"], argIdx: -1, requiresTaint: true,
    detail: "Unsanitized user input in log messages enables log forging.",
    remediation: "Use structured logging with placeholders: _logger.LogInformation(\"User: {User}\", username);", confidence: "low" },
  // New C# sinks
  { id: "csharp-ldap-injection", name: "LDAP Injection", severity: "high", category: "Injection", cwe: "CWE-90", owasp: "A03:2021",
    methods: ["FindAll","FindOne"], chainHint: ["DirectorySearcher"], argIdx: -1, requiresTaint: true,
    detail: "LDAP search with user-controlled filter enables LDAP injection.",
    remediation: "Escape LDAP special characters. Use parameterized filters.", confidence: "medium" },
  { id: "csharp-regex-dos", name: "Regex Denial of Service", severity: "medium", category: "Denial of Service", cwe: "CWE-1333", owasp: "A06:2021",
    methods: ["Match","Matches","Replace","Split","IsMatch"], chainHint: ["Regex"], argIdx: 0, requiresTaint: true,
    detail: "User-controlled regex pattern can cause catastrophic backtracking (ReDoS).",
    remediation: "Never use user input as regex pattern. If needed, set Regex timeout: new Regex(pattern, RegexOptions.None, TimeSpan.FromSeconds(1)).", confidence: "medium" },
  { id: "csharp-assembly-load", name: "Unsafe Assembly Loading", severity: "critical", category: "Injection", cwe: "CWE-470", owasp: "A03:2021",
    methods: ["LoadFrom","LoadFile","Load","UnsafeLoadFrom"], chainHint: ["Assembly"], argIdx: 0, requiresTaint: true,
    detail: "Loading assemblies from user-controlled paths enables arbitrary code execution.",
    remediation: "Never load assemblies from user input. Use a strict allowlist of trusted assemblies.", confidence: "high" },
  { id: "csharp-server-transfer", name: "Server-Side Request Forgery (Server.Transfer)", severity: "high", category: "SSRF", cwe: "CWE-918", owasp: "A10:2021",
    methods: ["Transfer","Execute"], chainHint: ["Server"], argIdx: 0, requiresTaint: true,
    detail: "Server.Transfer() with user-controlled path enables server-side request forgery.",
    remediation: "Validate paths against an allowlist. Use Response.Redirect with validated URLs instead.", confidence: "medium" },
];

function getSinksForLanguage(lang: Language): SinkDef[] {
  switch (lang) {
    case "java": return JAVA_SINKS;
    case "cpp": return CPP_SINKS;
    case "csharp": return CS_SINKS;
  }
}

// ═══════════════════════════════════════════════════
//  SECTION 6 — STRUCTURAL CHECKS (no taint needed)
// ═══════════════════════════════════════════════════

interface StructHit { id: string; name: string; severity: Severity; category: string; cwe: string; owasp: string; line: number; col: number; evidence: string; detail: string; remediation: string; confidence: "high" | "medium" | "low"; }

function runStructuralChecks(tokens: Token[], lines: string[], lang: Language): StructHit[] {
  const hits: StructHit[] = [];
  const seen = new Set<string>();
  const ev = (ln: number) => (ln > 0 && ln <= lines.length ? lines[ln - 1].trim() : "");

  const add = (h: Omit<StructHit, "evidence"> & { evidence?: string }) => {
    const key = `${h.id}:${h.line}`;
    if (seen.has(key)) return;
    seen.add(key);
    hits.push({ ...h, evidence: h.evidence || ev(h.line) } as StructHit);
  };

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    // ── Weak Crypto ──
    if (lang === "java") {
      // MessageDigest.getInstance("MD5") / ("SHA-1")
      if (tok.t === TT.Ident && tok.v === "getInstance" && tokens[i + 1]?.t === TT.LParen && tokens[i + 2]?.t === TT.String) {
        const algo = tokens[i + 2].v.toUpperCase();
        if (algo === "MD5" || algo === "SHA-1" || algo === "SHA1") {
          add({ id: "java-weak-crypto", name: "Weak Cryptographic Algorithm", severity: "high", category: "Cryptography", cwe: "CWE-327", owasp: "A02:2021",
            line: tok.ln, col: tok.col, detail: `${algo} is cryptographically broken. Use SHA-256 or SHA-3.`, remediation: "Replace with MessageDigest.getInstance(\"SHA-256\"). For passwords use bcrypt/Argon2.", confidence: "high" });
        }
      }
      // new Random() (not SecureRandom)
      if (tok.t === TT.Keyword && tok.v === "new" && tokens[i + 1]?.t === TT.Ident && tokens[i + 1].v === "Random" && tokens[i + 2]?.t === TT.LParen) {
        add({ id: "java-insecure-random", name: "Insecure Randomness", severity: "medium", category: "Cryptography", cwe: "CWE-330", owasp: "A02:2021",
          line: tok.ln, col: tok.col, detail: "java.util.Random is predictable. Use SecureRandom for security-sensitive values.", remediation: "Replace with new SecureRandom() or SecureRandom.getInstanceStrong().", confidence: "high" });
      }
      // Hardcoded secrets in String assignments
      if (tok.t === TT.Ident && JAVA_SECRET_NAMES.has(tok.v.toLowerCase()) && tokens[i + 1]?.t === TT.Assign && tokens[i + 2]?.t === TT.String && tokens[i + 2].v.length >= 4) {
        add({ id: "java-hardcoded-secret", name: "Hardcoded Secret", severity: "high", category: "Secrets", cwe: "CWE-798", owasp: "A07:2021",
          line: tok.ln, col: tok.col, detail: `Variable "${tok.v}" contains a hardcoded secret. Extractable from source code.`, remediation: "Store secrets in environment variables or a secrets manager (AWS Secrets Manager, Vault).", confidence: "high" });
      }
      // SQL concat in stmt.execute("SELECT" + x)
      if (tok.t === TT.Ident && (tok.v === "executeQuery" || tok.v === "executeUpdate" || tok.v === "execute" || tok.v === "prepareStatement" || tok.v === "createQuery" || tok.v === "createNativeQuery") && tokens[i + 1]?.t === TT.LParen) {
        const { args } = extractArgs(tokens, i + 1);
        if (args[0]) {
          const hasConcatWithString = args[0].some((t, idx) => t.t === TT.Plus && args[0][idx - 1]?.t === TT.String);
          if (hasConcatWithString) {
            add({ id: "java-sql-concat", name: "SQL Injection (String Concatenation)", severity: "critical", category: "Injection", cwe: "CWE-89", owasp: "A03:2021",
              line: tok.ln, col: tok.col, detail: "SQL query built via string concatenation. Vulnerable to SQL injection even without tracked taint.", remediation: "Use PreparedStatement with ? placeholders.", confidence: "high" });
          }
        }
      }
      // new ObjectInputStream(x) — insecure deserialization
      if (tok.t === TT.Keyword && tok.v === "new" && tokens[i + 1]?.t === TT.Ident && tokens[i + 1].v === "ObjectInputStream") {
        add({ id: "java-deserialization", name: "Insecure Deserialization", severity: "critical", category: "Deserialization", cwe: "CWE-502", owasp: "A08:2021",
          line: tok.ln, col: tok.col, detail: "ObjectInputStream deserializes arbitrary objects — enables remote code execution if attacker controls the stream.", remediation: "Avoid Java serialization. Use JSON/protobuf. If required, implement ObjectInputFilter to allowlist classes.", confidence: "high" });
      }
      // DocumentBuilderFactory.newInstance() — XXE if not configured
      if (tok.t === TT.Ident && tok.v === "newInstance" && i >= 2 && tokens[i - 1]?.t === TT.Dot && tokens[i - 2]?.t === TT.Ident &&
          (tokens[i - 2].v === "DocumentBuilderFactory" || tokens[i - 2].v === "SAXParserFactory" || tokens[i - 2].v === "XMLInputFactory")) {
        // check if setFeature("...disallow-doctype-decl...", true) appears nearby
        let safe = false;
        for (let k = i; k < Math.min(tokens.length, i + 50); k++) {
          if (tokens[k].t === TT.Ident && tokens[k].v === "setFeature" && tokens[k + 1]?.t === TT.LParen && tokens[k + 2]?.t === TT.String && tokens[k + 2].v.includes("disallow-doctype")) {
            safe = true; break;
          }
        }
        if (!safe) {
          add({ id: "java-xxe", name: "XML External Entity (XXE)", severity: "high", category: "Injection", cwe: "CWE-611", owasp: "A05:2021",
            line: tok.ln, col: tok.col, detail: `${tokens[i - 2].v} without disabling external entities enables XXE — file disclosure and SSRF.`, remediation: "factory.setFeature(\"http://apache.org/xml/features/disallow-doctype-decl\", true);", confidence: "medium" });
        }
      }
      // Spring @CrossOrigin("*") — CORS misconfiguration
      if (tok.t === TT.At && tokens[i + 1]?.t === TT.Ident && tokens[i + 1].v === "CrossOrigin" && tokens[i + 2]?.t === TT.LParen) {
        const { args } = extractArgs(tokens, i + 2);
        if (args[0]?.some(t => t.t === TT.String && t.v === "*")) {
          add({ id: "java-cors-wildcard", name: "CORS Wildcard Origin", severity: "high", category: "Access Control", cwe: "CWE-942", owasp: "A05:2021",
            line: tok.ln, col: tok.col, detail: "@CrossOrigin(\"*\") allows any origin to make authenticated requests.", remediation: "Specify exact trusted origins: @CrossOrigin(origins = \"https://trusted.com\").", confidence: "high" });
        }
      }
      // Java hardcoded API key patterns in string literals
      if (tok.t === TT.String && tok.v.length >= 20) {
        const val = tok.v;
        const keyPatterns = [
          { regex: /^AKIA[0-9A-Z]{16}$/, label: "AWS Access Key ID" },
          { regex: /^sk[_-]live[_-]/i, label: "Stripe live secret key" },
          { regex: /^ghp_[a-zA-Z0-9]{36,}/, label: "GitHub personal access token" },
          { regex: /^xox[bpsa]-[0-9a-zA-Z-]+/, label: "Slack token" },
          { regex: /^-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/, label: "Private key" },
        ];
        for (const { regex, label } of keyPatterns) {
          if (regex.test(val)) {
            add({ id: "java-hardcoded-apikey", name: `Hardcoded ${label}`, severity: "critical", category: "Secrets", cwe: "CWE-798", owasp: "A07:2021",
              line: tok.ln, col: tok.col, detail: `Hardcoded ${label} found in string literal. Rotate immediately.`, remediation: "Store API keys in environment variables or a secrets manager.", confidence: "high" });
            break;
          }
        }
      }
      // Empty catch block — swallowing exceptions
      if (tok.t === TT.Keyword && tok.v === "catch" && tokens[i + 1]?.t === TT.LParen) {
        const closeParen = skipParen(tokens, i + 1);
        if (tokens[closeParen + 1]?.t === TT.LBrace && tokens[closeParen + 2]?.t === TT.RBrace) {
          add({ id: "java-empty-catch", name: "Empty Catch Block", severity: "low", category: "Error Handling", cwe: "CWE-390", owasp: "A04:2021",
            line: tok.ln, col: tok.col, detail: "Empty catch block silently swallows exceptions — errors may go unnoticed, hiding security issues.", remediation: "Log the exception at minimum: catch (Exception e) { logger.error(\"Error\", e); }", confidence: "medium" });
        }
      }
      // Unsafe Spring Actuator exposure
      if (tok.t === TT.String && (tok.v.includes("/actuator") || tok.v.includes("management.endpoints.web.exposure.include=*"))) {
        add({ id: "java-actuator-exposed", name: "Spring Actuator Exposed", severity: "high", category: "Information Disclosure", cwe: "CWE-200", owasp: "A04:2021",
          line: tok.ln, col: tok.col, detail: "Spring Actuator endpoints exposed — may leak env vars, heap dumps, and configuration.", remediation: "Restrict actuator exposure: management.endpoints.web.exposure.include=health,info. Secure with authentication.", confidence: "medium" });
      }
    }

    if (lang === "cpp") {
      // Buffer overflow: strcpy, strcat, sprintf, gets
      if (tok.t === TT.Ident && CPP_UNSAFE_FUNCS.has(tok.v) && tokens[i + 1]?.t === TT.LParen) {
        const info = CPP_UNSAFE_FUNCS.get(tok.v)!;
        add({ id: `cpp-${info.id}`, name: info.name, severity: info.severity as Severity, category: info.category, cwe: info.cwe, owasp: "A06:2021",
          line: tok.ln, col: tok.col, detail: info.detail, remediation: info.remediation, confidence: "high" });
      }
      // rand() instead of platform secure random
      if (tok.t === TT.Ident && tok.v === "rand" && tokens[i + 1]?.t === TT.LParen) {
        add({ id: "cpp-insecure-random", name: "Insecure Randomness", severity: "medium", category: "Cryptography", cwe: "CWE-330", owasp: "A02:2021",
          line: tok.ln, col: tok.col, detail: "rand() is predictable. Use platform-specific CSPRNG (/dev/urandom, CryptGenRandom).", remediation: "Use std::random_device, or read from /dev/urandom for cryptographic randomness.", confidence: "high" });
      }
      // Weak crypto: MD5_Init, MD5_Update, SHA1, SHA_Init
      if (tok.t === TT.Ident && /^(?:MD5_Init|MD5_Update|MD5_Final|MD5|SHA1_Init|SHA1_Update|SHA1_Final|SHA1)$/.test(tok.v)) {
        add({ id: "cpp-weak-crypto", name: "Weak Cryptographic Algorithm", severity: "high", category: "Cryptography", cwe: "CWE-327", owasp: "A02:2021",
          line: tok.ln, col: tok.col, detail: `${tok.v} uses a broken hash algorithm. Collisions are practical.`, remediation: "Use SHA-256 or SHA-3 via OpenSSL: EVP_sha256().", confidence: "high" });
      }
      // Hardcoded secrets
      if (tok.t === TT.Ident && CPP_SECRET_NAMES.has(tok.v.toLowerCase()) && tokens[i + 1]?.t === TT.Assign && tokens[i + 2]?.t === TT.String && tokens[i + 2].v.length >= 4) {
        add({ id: "cpp-hardcoded-secret", name: "Hardcoded Secret", severity: "high", category: "Secrets", cwe: "CWE-798", owasp: "A07:2021",
          line: tok.ln, col: tok.col, detail: `Variable "${tok.v}" contains a hardcoded secret.`, remediation: "Load secrets from environment or a secrets manager.", confidence: "high" });
      }
      // Use-after-free / double-free detection (basic)
      if (tok.t === TT.Ident && (tok.v === "free" || tok.v === "delete") && tokens[i + 1]?.t === TT.LParen) {
        // look ahead for same variable being used again
        const { args } = extractArgs(tokens, i + 1);
        if (args[0]?.[0]?.t === TT.Ident) {
          const freed = args[0][0].v;
          // Scan ahead for usage of the freed variable before reassignment
          for (let k = i + 3; k < Math.min(tokens.length, i + 50); k++) {
            if (tokens[k].t === TT.Ident && tokens[k].v === freed) {
              if (tokens[k + 1]?.t === TT.Assign) break; // reassigned — safe
              if (tokens[k - 1]?.t === TT.Dot || tokens[k - 1]?.t === TT.Arrow) {
                add({ id: "cpp-use-after-free", name: "Use After Free", severity: "critical", category: "Memory Safety", cwe: "CWE-416", owasp: "A06:2021",
                  line: tokens[k].ln, col: tokens[k].col, detail: `Variable "${freed}" used after being freed. Memory corruption risk.`,
                  remediation: "Set pointers to nullptr after free. Use smart pointers (unique_ptr, shared_ptr).", confidence: "medium" });
                break;
              }
              if (tokens[k + 1]?.t === TT.LParen && (tokens[k - 1]?.v === "free" || tokens[k - 1]?.v === "delete")) {
                add({ id: "cpp-double-free", name: "Double Free", severity: "critical", category: "Memory Safety", cwe: "CWE-415", owasp: "A06:2021",
                  line: tokens[k].ln, col: tokens[k].col, detail: `Variable "${freed}" freed twice. Heap corruption risk.`,
                  remediation: "Set pointer to nullptr after free. Use smart pointers.", confidence: "medium" });
                break;
              }
            }
          }
        }
      }
      // Integer overflow check: atoi, atol without bounds check
      if (tok.t === TT.Ident && (tok.v === "atoi" || tok.v === "atol" || tok.v === "atoll") && tokens[i + 1]?.t === TT.LParen) {
        add({ id: "cpp-integer-overflow", name: "Integer Overflow Risk", severity: "medium", category: "Memory Safety", cwe: "CWE-190", owasp: "A06:2021",
          line: tok.ln, col: tok.col, detail: `${tok.v}() does not validate input range and can cause integer overflow.`, remediation: "Use strtol/strtoll with range checking, or std::stoi with try/catch.", confidence: "medium" });
      }
      // strtok — not thread-safe, modifies input
      if (tok.t === TT.Ident && tok.v === "strtok" && tokens[i + 1]?.t === TT.LParen) {
        add({ id: "cpp-strtok-unsafe", name: "Unsafe strtok() Usage", severity: "medium", category: "Memory Safety", cwe: "CWE-676", owasp: "A06:2021",
          line: tok.ln, col: tok.col, detail: "strtok() is not thread-safe and modifies the input string. Concurrent use causes data corruption.", remediation: "Use strtok_r() (POSIX) or strtok_s() (Windows) for thread-safe tokenization. Or use std::string methods.", confidence: "medium" });
      }
      // Signed/unsigned comparison
      if (tok.t === TT.Keyword && (tok.v === "unsigned") && tokens[i + 1]?.t === TT.Ident) {
        // Check for later comparison with signed
        // This is best-effort since we can't do full type analysis
      }
      // Null pointer dereference after malloc without check
      if (tok.t === TT.Ident && (tok.v === "malloc" || tok.v === "calloc" || tok.v === "realloc") && tokens[i + 1]?.t === TT.LParen) {
        // Look backwards for variable = malloc(...)
        if (i >= 2 && tokens[i - 1]?.t === TT.Assign && tokens[i - 2]?.t === TT.Ident) {
          const varName = tokens[i - 2].v;
          // Check if NULL check follows within 10 tokens
          let hasNullCheck = false;
          const closeParen = skipParen(tokens, i + 1);
          for (let k = closeParen; k < Math.min(tokens.length, closeParen + 15); k++) {
            if (tokens[k].t === TT.Keyword && tokens[k].v === "if" && tokens[k + 1]?.t === TT.LParen) {
              // Check if null check inside: if (ptr == NULL) or if (!ptr) or if (ptr)
              for (let m = k + 2; m < Math.min(tokens.length, k + 10); m++) {
                if (tokens[m].t === TT.Ident && tokens[m].v === varName) { hasNullCheck = true; break; }
              }
              break;
            }
          }
          if (!hasNullCheck) {
            add({ id: "cpp-null-deref", name: "Potential Null Pointer Dereference", severity: "high", category: "Memory Safety", cwe: "CWE-476", owasp: "A06:2021",
              line: tok.ln, col: tok.col, detail: `${tok.v}() return value not checked for NULL. Dereference of NULL pointer causes segfault.`, remediation: `Always check: ${varName} = ${tok.v}(...); if (${varName} == NULL) { /* handle error */ }`, confidence: "medium" });
          }
        }
      }
    }

    if (lang === "csharp") {
      // Weak crypto: MD5.Create(), SHA1.Create()
      if (tok.t === TT.Ident && (tok.v === "MD5" || tok.v === "SHA1") && tokens[i + 1]?.t === TT.Dot && tokens[i + 2]?.v === "Create") {
        add({ id: "csharp-weak-crypto", name: "Weak Cryptographic Algorithm", severity: "high", category: "Cryptography", cwe: "CWE-327", owasp: "A02:2021",
          line: tok.ln, col: tok.col, detail: `${tok.v} is cryptographically broken. Use SHA256 or SHA512.`, remediation: "Replace with SHA256.Create() or SHA512.Create(). For passwords use BCrypt or Argon2.", confidence: "high" });
      }
      // new Random() instead of RandomNumberGenerator
      if (tok.t === TT.Keyword && tok.v === "new" && tokens[i + 1]?.t === TT.Ident && tokens[i + 1].v === "Random" && tokens[i + 2]?.t === TT.LParen) {
        add({ id: "csharp-insecure-random", name: "Insecure Randomness", severity: "medium", category: "Cryptography", cwe: "CWE-330", owasp: "A02:2021",
          line: tok.ln, col: tok.col, detail: "System.Random is predictable. Use RandomNumberGenerator for security-sensitive values.", remediation: "Replace with RandomNumberGenerator.GetBytes() or RandomNumberGenerator.GetInt32().", confidence: "high" });
      }
      // Hardcoded secrets
      if (tok.t === TT.Ident && CS_SECRET_NAMES.has(tok.v.toLowerCase()) && tokens[i + 1]?.t === TT.Assign && tokens[i + 2]?.t === TT.String && tokens[i + 2].v.length >= 4) {
        add({ id: "csharp-hardcoded-secret", name: "Hardcoded Secret", severity: "high", category: "Secrets", cwe: "CWE-798", owasp: "A07:2021",
          line: tok.ln, col: tok.col, detail: `Variable "${tok.v}" contains a hardcoded secret.`, remediation: "Use IConfiguration, Azure Key Vault, or environment variables.", confidence: "high" });
      }
      // TypeNameHandling.All/.Auto/.Objects
      if (tok.t === TT.Ident && tok.v === "TypeNameHandling" && tokens[i + 1]?.t === TT.Dot && tokens[i + 2]?.t === TT.Ident) {
        const val = tokens[i + 2].v;
        if (val === "All" || val === "Auto" || val === "Objects" || val === "Arrays") {
          add({ id: "csharp-json-deserialization", name: "Insecure JSON Deserialization", severity: "critical", category: "Deserialization", cwe: "CWE-502", owasp: "A08:2021",
            line: tok.ln, col: tok.col, detail: `TypeNameHandling.${val} enables arbitrary type instantiation — remote code execution.`, remediation: "Use TypeNameHandling.None (default). If needed, use a custom SerializationBinder.", confidence: "high" });
        }
      }
      // IgnoreAntiforgeryToken
      if (tok.t === TT.LBracket && tokens[i + 1]?.t === TT.Ident && tokens[i + 1].v === "IgnoreAntiforgeryToken") {
        add({ id: "csharp-csrf-disabled", name: "CSRF Protection Disabled", severity: "high", category: "Session Management", cwe: "CWE-352", owasp: "A01:2021",
          line: tok.ln, col: tok.col, detail: "[IgnoreAntiforgeryToken] disables CSRF protection on this action.", remediation: "Remove [IgnoreAntiforgeryToken]. Use [ValidateAntiForgeryToken] on state-changing actions.", confidence: "high" });
      }
      // Insecure cookie: Secure = false, HttpOnly = false
      if (tok.t === TT.Ident && (tok.v === "Secure" || tok.v === "HttpOnly") && tokens[i + 1]?.t === TT.Assign && tokens[i + 2]?.t === TT.Keyword && tokens[i + 2].v === "false") {
        add({ id: "csharp-insecure-cookie", name: "Insecure Cookie", severity: "medium", category: "Session Management", cwe: tok.v === "Secure" ? "CWE-614" : "CWE-1004", owasp: "A05:2021",
          line: tok.ln, col: tok.col, detail: `Cookie ${tok.v} = false — ${ tok.v === "Secure" ? "sent over HTTP" : "accessible to JavaScript"}.`, remediation: "Set Secure=true and HttpOnly=true for session cookies.", confidence: "high" });
      }
      // UseDeveloperExceptionPage
      if (tok.t === TT.Ident && tok.v === "UseDeveloperExceptionPage") {
        add({ id: "csharp-devpage", name: "Developer Exception Page in Production", severity: "medium", category: "Information Disclosure", cwe: "CWE-209", owasp: "A04:2021",
          line: tok.ln, col: tok.col, detail: "Developer exception page exposes stack traces, source code, and environment details.",
          remediation: "Only enable in Development: if (env.IsDevelopment()) app.UseDeveloperExceptionPage();", confidence: "medium" });
      }
      // SQL concat: new SqlCommand("SELECT" + var)
      if (tok.t === TT.Keyword && tok.v === "new" && tokens[i + 1]?.t === TT.Ident &&
          (tokens[i + 1].v === "SqlCommand" || tokens[i + 1].v === "OleDbCommand" || tokens[i + 1].v === "OdbcCommand") && tokens[i + 2]?.t === TT.LParen) {
        const { args } = extractArgs(tokens, i + 2);
        if (args[0]) {
          const hasConcatWithString = args[0].some((t, idx) => t.t === TT.Plus && args[0][idx - 1]?.t === TT.String);
          if (hasConcatWithString) {
            add({ id: "csharp-sql-concat", name: "SQL Injection (String Concatenation)", severity: "critical", category: "Injection", cwe: "CWE-89", owasp: "A03:2021",
              line: tok.ln, col: tok.col, detail: "SQL query built via string concatenation in SqlCommand constructor.", remediation: "Use parameterized queries: cmd.Parameters.AddWithValue(\"@id\", userId);", confidence: "high" });
          }
        }
      }
      // new BinaryFormatter() — always insecure
      if (tok.t === TT.Keyword && tok.v === "new" && tokens[i + 1]?.t === TT.Ident &&
          (tokens[i + 1].v === "BinaryFormatter" || tokens[i + 1].v === "SoapFormatter" || tokens[i + 1].v === "NetDataContractSerializer" || tokens[i + 1].v === "LosFormatter")) {
        add({ id: "csharp-deserialization", name: "Insecure Deserialization (" + tokens[i + 1].v + ")", severity: "critical", category: "Deserialization", cwe: "CWE-502", owasp: "A08:2021",
          line: tok.ln, col: tok.col, detail: `${tokens[i + 1].v} enables remote code execution via crafted payloads. DO NOT use in production.`, remediation: "Use System.Text.Json or JSON.NET without TypeNameHandling. Never use BinaryFormatter.", confidence: "high" });
      }
      // new XmlDocument() without XmlResolver = null
      if (tok.t === TT.Keyword && tok.v === "new" && tokens[i + 1]?.t === TT.Ident && tokens[i + 1].v === "XmlDocument") {
        // check if XmlResolver = null appears nearby (within 10 tokens)
        let hasResolver = false;
        for (let k = i; k < Math.min(tokens.length, i + 30); k++) {
          if (tokens[k].t === TT.Ident && tokens[k].v === "XmlResolver" && tokens[k + 1]?.t === TT.Assign && tokens[k + 2]?.t === TT.Keyword && tokens[k + 2]?.v === "null") {
            hasResolver = true; break;
          }
        }
        if (!hasResolver) {
          add({ id: "csharp-xxe", name: "XML External Entity (XXE)", severity: "high", category: "Injection", cwe: "CWE-611", owasp: "A05:2021",
            line: tok.ln, col: tok.col, detail: "XmlDocument without XmlResolver=null enables XXE — file disclosure and SSRF.", remediation: "Set doc.XmlResolver = null before loading XML. Or use XmlReader with DtdProcessing.Prohibit.", confidence: "medium" });
        }
      }
      // C# hardcoded connection strings
      if (tok.t === TT.Ident && tok.v.toLowerCase() === "connectionstring" && tokens[i + 1]?.t === TT.Assign && tokens[i + 2]?.t === TT.String && tokens[i + 2].v.length >= 8) {
        add({ id: "csharp-hardcoded-secret", name: "Hardcoded Connection String", severity: "high", category: "Secrets", cwe: "CWE-798", owasp: "A07:2021",
          line: tok.ln, col: tok.col, detail: "Connection string with credentials hardcoded in source code.", remediation: "Use IConfiguration, user-secrets, Azure Key Vault, or environment variables.", confidence: "high" });
      }
      // C# ViewBag/ViewData XSS — data from ViewBag rendered without encoding
      if (tok.t === TT.Ident && (tok.v === "ViewBag" || tok.v === "ViewData" || tok.v === "TempData") && tokens[i + 1]?.t === TT.LBracket) {
        // Check if the line contains Html.Raw
        const lineText = ev(tok.ln);
        if (lineText.includes("Html.Raw")) {
          add({ id: "csharp-viewbag-xss", name: "XSS via ViewBag in Html.Raw", severity: "high", category: "Injection", cwe: "CWE-79", owasp: "A03:2021",
            line: tok.ln, col: tok.col, detail: "ViewBag/ViewData content rendered via Html.Raw bypasses Razor encoding — XSS if data contains user input.", remediation: "Use @Model.Property for auto-encoding. If Html.Raw is needed, sanitize with HtmlSanitizer first.", confidence: "medium" });
        }
      }
      // C# AllowAnonymous on sensitive endpoints
      if (tok.t === TT.LBracket && tokens[i + 1]?.t === TT.Ident && tokens[i + 1].v === "AllowAnonymous") {
        add({ id: "csharp-allow-anonymous", name: "Allow Anonymous Access", severity: "low", category: "Authentication", cwe: "CWE-306", owasp: "A07:2021",
          line: tok.ln, col: tok.col, detail: "[AllowAnonymous] bypasses authentication requirements on this endpoint. Verify this is intentional.", remediation: "Only use [AllowAnonymous] on public endpoints (login, registration, health check). Audit all usages.", confidence: "low" });
      }
      // C# HttpGet/HttpPost with ValidateAntiForgeryToken check — look for POST without validation
      if (tok.t === TT.LBracket && tokens[i + 1]?.t === TT.Ident && (tokens[i + 1].v === "HttpPost" || tokens[i + 1].v === "HttpPut" || tokens[i + 1].v === "HttpDelete" || tokens[i + 1].v === "HttpPatch")) {
        // Look backwards and forwards for [ValidateAntiForgeryToken]
        let hasValidation = false;
        for (let k = Math.max(0, i - 20); k < Math.min(tokens.length, i + 20); k++) {
          if (tokens[k].t === TT.Ident && (tokens[k].v === "ValidateAntiForgeryToken" || tokens[k].v === "AutoValidateAntiforgeryToken")) {
            hasValidation = true; break;
          }
        }
        if (!hasValidation) {
          add({ id: "csharp-missing-csrf", name: "Missing Anti-Forgery Token", severity: "medium", category: "Session Management", cwe: "CWE-352", owasp: "A01:2021",
            line: tok.ln, col: tok.col, detail: `[${tokens[i + 1].v}] endpoint without [ValidateAntiForgeryToken] — vulnerable to CSRF attacks.`, remediation: "Add [ValidateAntiForgeryToken] attribute, or use AddControllersWithViews(o => o.Filters.Add(new AutoValidateAntiforgeryTokenAttribute()));", confidence: "medium" });
        }
      }
      // C# hardcoded API key patterns
      if (tok.t === TT.String && tok.v.length >= 20) {
        const val = tok.v;
        const keyPatterns = [
          { regex: /^AKIA[0-9A-Z]{16}$/, label: "AWS Access Key ID" },
          { regex: /^sk[_-]live[_-]/i, label: "Stripe live secret key" },
          { regex: /^-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/, label: "Private key" },
        ];
        for (const { regex, label } of keyPatterns) {
          if (regex.test(val)) {
            add({ id: "csharp-hardcoded-apikey", name: `Hardcoded ${label}`, severity: "critical", category: "Secrets", cwe: "CWE-798", owasp: "A07:2021",
              line: tok.ln, col: tok.col, detail: `Hardcoded ${label} found in string literal. Rotate immediately.`, remediation: "Store API keys in IConfiguration, Azure Key Vault, or environment variables.", confidence: "high" });
            break;
          }
        }
      }
    }
  }

  return hits;
}

const JAVA_SECRET_NAMES = new Set(["password","passwd","secret","apikey","api_key","accesstoken","access_token","authtoken","auth_token","privatekey","private_key","connectionstring","dbpassword","secretkey","secret_key","jwtkey","jwt_secret","encryptionkey"]);
const CPP_SECRET_NAMES = new Set(["password","passwd","secret","api_key","apikey","token","auth_token","private_key","encryption_key","db_password","connection_string"]);
const CS_SECRET_NAMES = new Set(["password","passwd","secret","apiKey","api_key","accessToken","access_token","authToken","auth_token","privateKey","private_key","connectionString","dbPassword","secretKey","secret_key","jwtKey","encryptionKey"]);

const CPP_UNSAFE_FUNCS = new Map<string, { id: string; name: string; severity: string; category: string; cwe: string; detail: string; remediation: string }>([
  ["strcpy",  { id: "buffer-overflow-strcpy",  name: "Buffer Overflow (strcpy)",  severity: "critical", category: "Memory Safety", cwe: "CWE-120", detail: "strcpy() copies without bounds checking — buffer overflow if source exceeds destination.", remediation: "Use strncpy() or strlcpy() with explicit length, or std::string." }],
  ["strcat",  { id: "buffer-overflow-strcat",  name: "Buffer Overflow (strcat)",  severity: "critical", category: "Memory Safety", cwe: "CWE-120", detail: "strcat() concatenates without bounds checking — buffer overflow risk.", remediation: "Use strncat() or strlcat() with explicit length, or std::string." }],
  ["sprintf", { id: "buffer-overflow-sprintf", name: "Buffer Overflow (sprintf)", severity: "critical", category: "Memory Safety", cwe: "CWE-120", detail: "sprintf() writes without bounds checking. Use snprintf() instead.", remediation: "Replace with snprintf(buf, sizeof(buf), fmt, ...) for bounds-checked formatting." }],
  ["gets",    { id: "buffer-overflow-gets",    name: "Buffer Overflow (gets)",    severity: "critical", category: "Memory Safety", cwe: "CWE-120", detail: "gets() reads unlimited input — removed in C11 due to being fundamentally unsafe.", remediation: "Use fgets(buf, sizeof(buf), stdin) for bounded input reading." }],
  ["scanf",   { id: "unsafe-scanf",            name: "Unsafe scanf()",            severity: "high",     category: "Memory Safety", cwe: "CWE-120", detail: "scanf(\"%s\") reads without length limit — buffer overflow risk.", remediation: "Use scanf(\"%99s\") with width specifier, or fgets() + sscanf()." }],
  ["wcscpy",  { id: "buffer-overflow-wcscpy",  name: "Buffer Overflow (wcscpy)",  severity: "critical", category: "Memory Safety", cwe: "CWE-120", detail: "wcscpy() copies wide strings without bounds checking.", remediation: "Use wcsncpy() with explicit length, or std::wstring." }],
  ["wcscat",  { id: "buffer-overflow-wcscat",  name: "Buffer Overflow (wcscat)",  severity: "critical", category: "Memory Safety", cwe: "CWE-120", detail: "wcscat() concatenates wide strings without bounds checking.", remediation: "Use wcsncat() with explicit length, or std::wstring." }],
]);

// ═══════════════════════════════════════════════════
//  SECTION 7 — MAIN SCANNER
// ═══════════════════════════════════════════════════

export function scanCode(code: string, language: Language): {
  findings: PatternFinding[];
  stats: { critical: number; high: number; medium: number; low: number; total: number };
  linesAnalyzed: number;
  checksPerformed: number;
  language: Language;
} {
  const lines = code.split("\n");
  const tokens = tokenize(code, language);
  const tainted = buildTaintMap(tokens, language, lines);
  const sanitized = buildSanitizedMap(tokens, language, tainted, lines);
  const methods = collectMethodDefs(tokens, language);
  const sinks = getSinksForLanguage(language);
  const findings: PatternFinding[] = [];
  const seen = new Set<string>();

  // Build a variable-type map: varName -> className (from `new ClassName(...)` assignments)
  const varTypes = new Map<string, string>();
  for (let i = 0; i < tokens.length; i++) {
    const asgn = detectAssignment(tokens, i);
    if (asgn) {
      // Look for `new ClassName(` in the value
      for (let k = asgn.valueStart; k < asgn.valueEnd - 1; k++) {
        if (tokens[k].t === TT.Keyword && tokens[k].v === "new" && tokens[k + 1]?.t === TT.Ident) {
          varTypes.set(asgn.varName, tokens[k + 1].v);
          break;
        }
      }
    }
  }

  const addFinding = (f: PatternFinding) => {
    const key = `${f.id}:${f.line}`;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push(f);
  };

  // ── Taint-based sink detection ──
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].t !== TT.Ident || tokens[i + 1]?.t !== TT.LParen) continue;
    const methodName = tokens[i].v;

    for (const sink of sinks) {
      if (!sink.methods.includes(methodName)) continue;

      // Check chain hint (also resolve variable types)
      if (sink.chainHint) {
        const chain = resolveChain(tokens, i);
        // Resolve variable types in chain: if chain[0] is a var with a known type, substitute it
        const resolvedChain = chain.map(part => {
          const baseName = part.replace(/[\[\]()]/g, "");
          return varTypes.has(baseName) ? varTypes.get(baseName)! : part;
        });
        if (!sink.chainHint.some(hint => resolvedChain.some(part => part.startsWith(hint)) || chain.some(part => part.startsWith(hint)))) continue;
      }

      const { args } = extractArgs(tokens, i + 1);

      if (sink.requiresTaint) {
        const argsToCheck = sink.argIdx === -1 ? args : (args[sink.argIdx] ? [args[sink.argIdx]] : []);
        let taintInfo: TaintInfo | null = null;
        let taintedVarName = "";

        for (const arg of argsToCheck) {
          taintInfo = argTaint(arg, tainted);
          if (taintInfo) {
            // Find the tainted variable name
            for (const t of arg) { if (t.t === TT.Ident && tainted.has(t.v)) { taintedVarName = t.v; break; } }
            break;
          }
          // Check taint via concatenation: "string" + taintedVar
          for (let k = 0; k < arg.length; k++) {
            if (arg[k].t === TT.Plus) {
              // check both sides of +
              for (let d = -1; d <= 1; d += 2) {
                const adj = arg[k + d];
                if (adj?.t === TT.Ident && tainted.has(adj.v)) { taintInfo = tainted.get(adj.v)!; taintedVarName = adj.v; break; }
              }
              if (taintInfo) break;
            }
          }
          if (taintInfo) break;
          // Check if the arg expression itself is a taint source (inline)
          taintInfo = detectTaintInExpr(tokens, i + 2, i + 2 + arg.length, language, tainted);
          if (taintInfo) {
            taintInfo.sourceCode = taintInfo.sourceCode || (taintInfo.sourceLine > 0 && taintInfo.sourceLine <= lines.length ? lines[taintInfo.sourceLine - 1].trim() : "");
            break;
          }
        }

        if (!taintInfo) continue;

        // ── Sanitizer check: skip if the tainted variable was sanitized for this vuln ──
        if (taintedVarName && sanitized.has(taintedVarName)) {
          const sanSet = sanitized.get(taintedVarName)!;
          if (sanSet.has(sink.id)) continue;
        }

        // ── Check if any argument is wrapped in a sanitizer call ──
        let argSanitized = false;
        const langSanitizers = getSanitizersForLanguage(language);
        for (const arg of argsToCheck) {
          for (const t of arg) {
            if (t.t === TT.Ident && t.v !== taintedVarName) {
              for (const san of langSanitizers) {
                if (san.method === t.v && san.mitigates.has(sink.id)) { argSanitized = true; break; }
              }
            }
            if (argSanitized) break;
          }
          if (argSanitized) break;
        }
        if (argSanitized) continue;

        const sinkLine = tokens[i].ln;

        // ── Control-flow sensitivity: reduce confidence if guarded ──
        let confidence = sink.confidence;
        if (taintedVarName && hasValidationGuardToken(tokens, taintedVarName, sinkLine, language)) {
          confidence = confidence === "high" ? "medium" : "low";
        }

        // Build full dataflow from taint chain
        const dataflow: { line: number; label: string; code: string }[] = [];
        if (taintInfo.chain && taintInfo.chain.length > 0) {
          dataflow.push(...taintInfo.chain);
        } else {
          dataflow.push({ line: taintInfo.sourceLine, label: `Source: ${taintInfo.label}`, code: taintInfo.sourceCode });
        }
        if (sinkLine !== (dataflow[dataflow.length - 1]?.line ?? -1)) {
          dataflow.push({ line: sinkLine, label: `Sink: ${methodName}()`, code: lines[sinkLine - 1]?.trim() || "" });
        }

        addFinding({
          id: sink.id, name: sink.name, severity: sink.severity, confidence,
          line: sinkLine, column: tokens[i].col, category: sink.category, cwe: sink.cwe, owasp: sink.owasp,
          detail: sink.detail, evidence: lines[sinkLine - 1]?.trim() || "",
          codeSnippet: buildSnippet(lines, sinkLine),
          dataflow, remediation: sink.remediation,
        });
      } else {
        // Structural sink — fires without taint
        addFinding({
          id: sink.id, name: sink.name, severity: sink.severity, confidence: sink.confidence,
          line: tokens[i].ln, column: tokens[i].col, category: sink.category, cwe: sink.cwe, owasp: sink.owasp,
          detail: sink.detail, evidence: lines[tokens[i].ln - 1]?.trim() || "",
          codeSnippet: buildSnippet(lines, tokens[i].ln),
          remediation: sink.remediation,
        });
      }
      break; // one finding per call site
    }
  }

  // ── Structural checks ──
  const structHits = runStructuralChecks(tokens, lines, language);
  for (const h of structHits) {
    addFinding({
      id: h.id, name: h.name, severity: h.severity, confidence: h.confidence,
      line: h.line, column: h.col, category: h.category, cwe: h.cwe, owasp: h.owasp,
      detail: h.detail, evidence: h.evidence,
      codeSnippet: buildSnippet(lines, h.line),
      remediation: h.remediation,
    });
  }

  // ── Also check for new ClassName(taintedArg) patterns (Java: new File, new URL, etc.) ──
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].t !== TT.Keyword || tokens[i].v !== "new") continue;
    if (tokens[i + 1]?.t !== TT.Ident || tokens[i + 2]?.t !== TT.LParen) continue;
    const className = tokens[i + 1].v;
    const { args } = extractArgs(tokens, i + 2);

    if (language === "java") {
      if ((className === "File" || className === "FileInputStream" || className === "FileOutputStream" || className === "FileReader" || className === "FileWriter") && args[0]) {
        const ti = argTaint(args[0], tainted);
        if (ti) {
          const dataflow: { line: number; label: string; code: string }[] = [];
          if (ti.chain && ti.chain.length > 0) { dataflow.push(...ti.chain); }
          else { dataflow.push({ line: ti.sourceLine, label: `Source: ${ti.label}`, code: ti.sourceCode }); }
          dataflow.push({ line: tokens[i].ln, label: `Sink: new ${className}()`, code: lines[tokens[i].ln - 1]?.trim() || "" });
          addFinding({ id: "java-path-traversal", name: "Path Traversal", severity: "high", confidence: "high",
            line: tokens[i].ln, column: tokens[i].col, category: "Access Control", cwe: "CWE-22", owasp: "A01:2021",
            detail: "File path constructed from user input. Attacker can use ../../etc/passwd to access arbitrary files.",
            evidence: lines[tokens[i].ln - 1]?.trim() || "",
            codeSnippet: buildSnippet(lines, tokens[i].ln),
            dataflow,
            remediation: "Canonicalize paths with Paths.get(base).resolve(userInput).normalize() and verify they're under the base directory.",
          });
        }
      }
      if (className === "URL" && args[0]) {
        const ti = argTaint(args[0], tainted);
        if (ti) {
          const dataflow: { line: number; label: string; code: string }[] = [];
          if (ti.chain && ti.chain.length > 0) { dataflow.push(...ti.chain); }
          else { dataflow.push({ line: ti.sourceLine, label: `Source: ${ti.label}`, code: ti.sourceCode }); }
          dataflow.push({ line: tokens[i].ln, label: "Sink: new URL()", code: lines[tokens[i].ln - 1]?.trim() || "" });
          addFinding({ id: "java-ssrf", name: "Server-Side Request Forgery", severity: "high", confidence: "medium",
            line: tokens[i].ln, column: tokens[i].col, category: "SSRF", cwe: "CWE-918", owasp: "A10:2021",
            detail: "URL created from user input enables SSRF.",
            evidence: lines[tokens[i].ln - 1]?.trim() || "",
            codeSnippet: buildSnippet(lines, tokens[i].ln),
            dataflow,
            remediation: "Validate URLs against an allowlist. Block private IP ranges and cloud metadata endpoints.",
          });
        }
      }
    }
  }

  // ── Inter-procedural analysis: track taint across function/method calls ──
  checkInterProcedural(tokens, methods, tainted, sanitized, sinks, lines, language, addFinding);

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
    findings, stats,
    linesAnalyzed: lines.length,
    checksPerformed: sinks.length + structHits.length,
    language,
  };
}

// ═══════════════════════════════════════════════════
//  SECTION 8 — DEMO CODE
// ═══════════════════════════════════════════════════

export const JAVA_DEMO_CODE = `import java.sql.*;
import java.io.*;
import java.security.MessageDigest;
import java.util.Random;
import javax.servlet.http.*;
import javax.xml.parsers.*;

public class VulnerableApp extends HttpServlet {
    private String dbPassword = "SuperSecret123!";
    private String apiKey = "sk-live-abc123def456ghi";

    // SQL Injection — string concatenation
    protected void searchUser(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String userId = request.getParameter("id");
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/db");
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id = " + userId);
        response.getWriter().print(rs.getString("name"));
    }

    // Command Injection via Runtime.exec
    protected void pingHost(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String host = request.getParameter("host");
        Process p = Runtime.getRuntime().exec("ping -c 1 " + host);
        BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
        response.getWriter().println(br.readLine());
    }

    // Command Injection via args
    public static void main(String[] args) throws Exception {
        String userInput = args[0];
        Runtime.getRuntime().exec("nslookup " + userInput);
    }

    // Path Traversal
    protected void downloadFile(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String filename = request.getParameter("file");
        FileInputStream fis = new FileInputStream("/uploads/" + filename);
        byte[] data = fis.readAllBytes();
        response.getOutputStream().write(data);
    }

    // XXE via DocumentBuilderFactory
    protected void parseXML(HttpServletRequest request, HttpServletResponse response) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        builder.parse(request.getInputStream());
    }

    // Insecure Deserialization
    protected void loadObject(HttpServletRequest request, HttpServletResponse response) throws Exception {
        ObjectInputStream ois = new ObjectInputStream(request.getInputStream());
        Object obj = ois.readObject();
        response.getWriter().println(obj);
    }

    // Weak Crypto
    public String hashPassword(String password) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hash = md.digest(password.getBytes());
        return new String(hash);
    }

    // Insecure Random
    public int generateToken() {
        Random random = new Random();
        return random.nextInt(999999);
    }

    // XSS — reflected
    protected void showProfile(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String name = request.getParameter("name");
        response.getWriter().print("<h1>Welcome, " + name + "</h1>");
    }

    // SSRF
    protected void fetchUrl(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String url = request.getParameter("url");
        java.net.URL target = new java.net.URL(url);
        InputStream is = target.openStream();
        response.getOutputStream().write(is.readAllBytes());
    }

    // Open Redirect
    protected void login(HttpServletRequest request, HttpServletResponse response) throws Exception {
        String returnUrl = request.getParameter("returnUrl");
        response.sendRedirect(returnUrl);
    }
}
`;

export const CPP_DEMO_CODE = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <mysql/mysql.h>

char* db_password = "SuperSecret123!";
char* api_key = "sk-live-abc123def456ghi";

// Buffer overflow — strcpy without bounds check
void greetUser(const char* name) {
    char buffer[64];
    strcpy(buffer, name);
    printf("Hello, %s\\n", buffer);
}

// Buffer overflow — strcat
void buildPath(const char* dir, const char* file) {
    char path[128];
    strcpy(path, dir);
    strcat(path, "/");
    strcat(path, file);
    printf("Path: %s\\n", path);
}

// Buffer overflow — sprintf
void formatMessage(const char* user, const char* msg) {
    char buffer[256];
    sprintf(buffer, "User %s said: %s", user, msg);
    puts(buffer);
}

// Buffer overflow — gets (removed in C11)
void readInput() {
    char line[100];
    gets(line);
    puts(line);
}

// Format string vulnerability
void logMessage(const char* msg) {
    printf(msg);  // should be printf("%s", msg)
}

// Command injection — system()
void pingHost(const char* host) {
    char cmd[256];
    snprintf(cmd, sizeof(cmd), "ping -c 1 %s", host);
    system(cmd);
}

// Command injection via command-line args
int main(int argc, char** argv) {
    if (argc < 2) return 1;

    // argv is user-controlled
    char command[512];
    snprintf(command, sizeof(command), "nslookup %s", argv[1]);
    system(command);

    // stdin input
    char userInput[256];
    scanf("%s", userInput);
    system(userInput);

    // Buffer overflows in main
    greetUser(argv[1]);

    // Use-after-free
    char* ptr = (char*)malloc(100);
    strcpy(ptr, argv[1]);
    free(ptr);
    printf("Freed: %s\\n", ptr);

    // Insecure random
    int token = rand();
    printf("Token: %d\\n", token);

    // Weak crypto
    // MD5_Init(&ctx);

    // Path traversal via file open
    FILE* f = fopen(argv[2], "r");
    if (f) fclose(f);

    // SQL injection
    MYSQL* conn = mysql_init(NULL);
    char query[512];
    snprintf(query, sizeof(query), "SELECT * FROM users WHERE id = '%s'", argv[1]);
    mysql_query(conn, query);

    return 0;
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

        // SQL Injection — string concat in SqlCommand
        [HttpGet]
        public IActionResult GetUser(string id)
        {
            var conn = new SqlConnection(connectionString);
            var cmd = new SqlCommand("SELECT * FROM Users WHERE Id = " + id, conn);
            var reader = cmd.ExecuteReader();
            return Ok(reader);
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
            Response.Cookies.Append("session", "token", new CookieOptions
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
            return Ok();
        }

        // Hardcoded secret
        private string secretKey = "my-super-secret-encryption-key-2024";

        // C# Main with args
        public static void Main(string[] args)
        {
            var userInput = args[0];
            Console.WriteLine("Processing: " + userInput);
        }

        // Log Injection
        public void AuditLogin(string username)
        {
            _logger.LogInformation("User logged in: " + username);
        }
    }
}
`;
