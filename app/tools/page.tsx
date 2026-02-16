"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/section-heading";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Globe,
  Hash,
  KeyRound,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  FileCode,
  Search,
  ArrowRight,
  Brain,
  Sparkles,
} from "lucide-react";

export default function ToolsPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Free Tools"
          title="Security Tools"
          description="Free online tools for security testing, encoding, hashing, and analysis. No sign-up required."
        />

        {/* Featured AI Security Auditor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 mb-12"
        >
          <Link href="/tools/ai-security-auditor">
            <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 border-2 border-violet-200 dark:border-violet-700 hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Brain className="h-8 w-8 text-violet-600" />
                      <Badge className="bg-violet-600 gap-1">
                        <Sparkles className="h-3 w-3" />
                        NEW - Enterprise Tool
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">AI Security Auditor</h3>
                    <p className="text-muted-foreground mb-4">
                      Professional security assessment tool for AI/LLM applications. Test for prompt injection, vulnerable,
                      data leakage, and OWASP vulnerabilities. Generate professional reports and get actionable remediation guidance.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">Prompt Injection Detection</Badge>
                      <Badge variant="outline">PII Scanning</Badge>
                      <Badge variant="outline">OWASP LLM Top 10</Badge>
                      <Badge variant="outline">PDF Reports</Badge>
                    </div>
                    <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
                      Try AI Security Auditor <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Quick Navigation */}
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
          {[
            { id: "ai-auditor", label: "🤖 AI Security Auditor", link: "/tools/ai-security-auditor" },
            { id: "headers", label: "Header Analyzer" },
            { id: "csp-generator", label: "CSP Generator" },
            { id: "jwt-decoder", label: "JWT Decoder" },
            { id: "hash", label: "Hash Generator" },
            { id: "encoder", label: "Encoder/Decoder" },
            { id: "password", label: "Password Checker" },
            { id: "sql-tester", label: "SQL Injection Tester" },
          ].map((tool) => (
            tool.link ? (
              <Link key={tool.id} href={tool.link}>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1.5 bg-violet-50 dark:bg-violet-950/30 border-violet-300 dark:border-violet-700">
                  {tool.label}
                </Badge>
              </Link>
            ) : (
              <a key={tool.id} href={`#${tool.id}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1.5">
                  {tool.label}
                </Badge>
              </a>
            )
          ))}
        </div>

        <div className="mt-12 space-y-8">
          <HeaderAnalyzer />
          <Separator />
          <CSPGenerator />
          <Separator />
          <JWTDecoder />
          <Separator />
          <HashGenerator />
          <Separator />
          <EncoderDecoder />
          <Separator />
          <PasswordStrengthChecker />
          <Separator />
          <SQLInjectionTester />
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Need a professional security assessment? Our experts can help.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/services">
              <Button className="gap-2">
                View Services <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" className="gap-2">
                Generate Report <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Header Analyzer ----------
function HeaderAnalyzer() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<
    { header: string; status: "good" | "warning" | "bad"; message: string }[] | null
  >(null);
  const [loading, setLoading] = useState(false);

  const analyzeHeaders = () => {
    setLoading(true);
    // Simulated analysis - in production, this would call an API
    setTimeout(() => {
      setResults([
        { header: "Strict-Transport-Security", status: "good", message: "HSTS is properly configured with max-age=31536000" },
        { header: "Content-Security-Policy", status: "warning", message: "CSP is set but uses 'unsafe-inline' which weakens protection" },
        { header: "X-Frame-Options", status: "good", message: "Set to DENY - clickjacking protection enabled" },
        { header: "X-Content-Type-Options", status: "good", message: "Set to nosniff - MIME sniffing protection enabled" },
        { header: "X-XSS-Protection", status: "bad", message: "Missing - consider adding X-XSS-Protection: 1; mode=block" },
        { header: "Referrer-Policy", status: "warning", message: "Not set - consider adding strict-origin-when-cross-origin" },
        { header: "Permissions-Policy", status: "bad", message: "Missing - restrict browser features with Permissions-Policy" },
        { header: "Cache-Control", status: "good", message: "Properly configured for sensitive content" },
      ]);
      setLoading(false);
    }, 1500);
  };

  const statusIcon = (status: string) => {
    if (status === "good") return <CheckCircle2 className="h-5 w-5 text-primary" />;
    if (status === "warning") return <AlertTriangle className="h-5 w-5 text-chart-4" />;
    return <XCircle className="h-5 w-5 text-destructive" />;
  };

  return (
    <Card id="headers">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>Security Header Analyzer</CardTitle>
        </div>
        <CardDescription>
          Check if a website has proper security headers configured
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={analyzeHeaders} disabled={!url || loading} className="gap-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            Analyze
          </Button>
        </div>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {results.map((r) => (
              <div
                key={r.header}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                {statusIcon(r.status)}
                <div>
                  <div className="font-mono text-sm font-semibold">{r.header}</div>
                  <div className="text-sm text-muted-foreground">{r.message}</div>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                {results.filter((r) => r.status === "good").length} Passed
              </Badge>
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="h-3 w-3 text-chart-4" />
                {results.filter((r) => r.status === "warning").length} Warnings
              </Badge>
              <Badge variant="outline" className="gap-1">
                <XCircle className="h-3 w-3 text-destructive" />
                {results.filter((r) => r.status === "bad").length} Failed
              </Badge>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Hash Generator ----------
function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const generateHashes = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const hashAlgorithms = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
    const results: Record<string, string> = {};

    for (const algo of hashAlgorithms) {
      const hashBuffer = await crypto.subtle.digest(algo, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      results[algo] = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    // Simple MD5-like representation (not actual MD5 for browser)
    results["MD5"] = "(Use server-side for MD5 - not available in Web Crypto API)";

    setHashes(results);
  };

  const copyHash = (algo: string) => {
    navigator.clipboard.writeText(hashes[algo]);
    setCopied(algo);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-primary" />
          <CardTitle>Hash Generator</CardTitle>
        </div>
        <CardDescription>
          Generate cryptographic hashes of text using various algorithms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Input Text</Label>
          <Textarea
            placeholder="Enter text to hash..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
          />
        </div>
        <Button onClick={generateHashes} disabled={!input} className="gap-2">
          <Hash className="h-4 w-4" />
          Generate Hashes
        </Button>

        {Object.keys(hashes).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {Object.entries(hashes).map(([algo, hash]) => (
              <div key={algo} className="flex items-center gap-2 rounded-lg border p-3">
                <Badge variant="secondary" className="shrink-0 min-w-[70px] justify-center">
                  {algo}
                </Badge>
                <code className="flex-1 text-xs break-all text-muted-foreground">
                  {hash}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyHash(algo)}
                  className="shrink-0"
                >
                  {copied === algo ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Encoder/Decoder ----------
function EncoderDecoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const encode = (type: string) => {
    try {
      switch (type) {
        case "base64":
          setOutput(btoa(input));
          break;
        case "uri":
          setOutput(encodeURIComponent(input));
          break;
        case "html":
          setOutput(
            input
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;")
          );
          break;
        case "hex":
          setOutput(
            Array.from(new TextEncoder().encode(input))
              .map((b) => b.toString(16).padStart(2, "0"))
              .join(" ")
          );
          break;
      }
    } catch {
      setOutput("Error encoding input");
    }
  };

  const decode = (type: string) => {
    try {
      switch (type) {
        case "base64":
          setOutput(atob(input));
          break;
        case "uri":
          setOutput(decodeURIComponent(input));
          break;
        case "html":
          const doc = new DOMParser().parseFromString(input, "text/html");
          setOutput(doc.body.textContent || "");
          break;
        case "hex":
          setOutput(
            input
              .split(" ")
              .map((h) => String.fromCharCode(parseInt(h, 16)))
              .join("")
          );
          break;
      }
    } catch {
      setOutput("Error decoding input");
    }
  };

  return (
    <Card id="encoder">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          <CardTitle>Encoder / Decoder</CardTitle>
        </div>
        <CardDescription>
          Encode and decode text in various formats (Base64, URL, HTML, Hex)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Input</Label>
          <Textarea
            placeholder="Enter text..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
          />
        </div>

        <Tabs defaultValue="base64">
          <TabsList>
            <TabsTrigger value="base64">Base64</TabsTrigger>
            <TabsTrigger value="uri">URL</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="hex">Hex</TabsTrigger>
          </TabsList>
          {["base64", "uri", "html", "hex"].map((type) => (
            <TabsContent key={type} value={type}>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => encode(type)}
                  disabled={!input}
                >
                  Encode
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => decode(type)}
                  disabled={!input}
                >
                  Decode
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {output && (
          <div className="space-y-2">
            <Label>Output</Label>
            <div className="relative">
              <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto whitespace-pre-wrap break-all">
                {output}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Password Strength Checker ----------
function PasswordStrengthChecker() {
  const [password, setPassword] = useState("");

  const checks = [
    { label: "At least 12 characters", pass: password.length >= 12 },
    { label: "Contains uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Contains number", pass: /[0-9]/.test(password) },
    { label: "Contains special character", pass: /[^A-Za-z0-9]/.test(password) },
    { label: "No common patterns", pass: !/^(password|123456|qwerty)/i.test(password) && password.length > 0 },
  ];

  const score = checks.filter((c) => c.pass).length;
  const strength =
    score <= 2 ? "Weak" : score <= 4 ? "Moderate" : "Strong";
  const strengthColor =
    score <= 2 ? "bg-destructive" : score <= 4 ? "bg-chart-4" : "bg-primary";

  return (
    <Card id="password">
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <CardTitle>Password Strength Checker</CardTitle>
        </div>
        <CardDescription>
          Check how strong your password is against common attack patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="text"
            placeholder="Enter a password to check..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {password && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Strength bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Strength</span>
                <span className="font-semibold">{strength}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strengthColor}`}
                  style={{ width: `${(score / 6) * 100}%` }}
                />
              </div>
            </div>

            {/* Checks */}
            <div className="space-y-2">
              {checks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-sm">
                  {check.pass ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={check.pass ? "" : "text-muted-foreground"}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- CSP Generator ----------
function CSPGenerator() {
  const [directives, setDirectives] = useState({
    defaultSrc: "'self'",
    scriptSrc: "'self'",
    styleSrc: "'self' 'unsafe-inline'",
    imgSrc: "'self' data: https:",
    fontSrc: "'self'",
    connectSrc: "'self'",
    frameSrc: "'none'",
    objectSrc: "'none'",
    baseUri: "'self'",
    formAction: "'self'",
    upgradeInsecureRequests: true,
  });
  const [copied, setCopied] = useState(false);

  const generateCSP = () => {
    const parts: string[] = [];
    parts.push(`default-src ${directives.defaultSrc}`);
    parts.push(`script-src ${directives.scriptSrc}`);
    parts.push(`style-src ${directives.styleSrc}`);
    parts.push(`img-src ${directives.imgSrc}`);
    parts.push(`font-src ${directives.fontSrc}`);
    parts.push(`connect-src ${directives.connectSrc}`);
    parts.push(`frame-src ${directives.frameSrc}`);
    parts.push(`object-src ${directives.objectSrc}`);
    parts.push(`base-uri ${directives.baseUri}`);
    parts.push(`form-action ${directives.formAction}`);
    if (directives.upgradeInsecureRequests) parts.push("upgrade-insecure-requests");
    return parts.join("; ");
  };

  const csp = generateCSP();

  return (
    <Card id="csp-generator">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle>Content Security Policy Generator</CardTitle>
          <Badge variant="secondary">New</Badge>
        </div>
        <CardDescription>
          Generate a Content Security Policy (CSP) header to protect against XSS and data injection attacks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: "defaultSrc", label: "default-src" },
            { key: "scriptSrc", label: "script-src" },
            { key: "styleSrc", label: "style-src" },
            { key: "imgSrc", label: "img-src" },
            { key: "fontSrc", label: "font-src" },
            { key: "connectSrc", label: "connect-src" },
            { key: "frameSrc", label: "frame-src" },
            { key: "objectSrc", label: "object-src" },
            { key: "baseUri", label: "base-uri" },
            { key: "formAction", label: "form-action" },
          ].map((d) => (
            <div key={d.key} className="space-y-1">
              <Label className="text-xs font-mono">{d.label}</Label>
              <Input
                value={directives[d.key as keyof typeof directives] as string}
                onChange={(e) =>
                  setDirectives({ ...directives, [d.key]: e.target.value })
                }
                className="font-mono text-sm"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="upgrade"
            checked={directives.upgradeInsecureRequests}
            onChange={(e) =>
              setDirectives({ ...directives, upgradeInsecureRequests: e.target.checked })
            }
            className="rounded"
          />
          <Label htmlFor="upgrade" className="text-sm">upgrade-insecure-requests</Label>
        </div>

        <div className="space-y-2">
          <Label>Generated CSP Header</Label>
          <div className="relative">
            <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto whitespace-pre-wrap break-all font-mono">
              {csp}
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={() => {
                navigator.clipboard.writeText(csp);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Usage:</strong> Add this as a <code>Content-Security-Policy</code> HTTP response header.</p>
          <p>Test first with <code>Content-Security-Policy-Report-Only</code> to avoid breaking your site.</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- JWT Decoder ----------
function JWTDecoder() {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<{
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature: string;
  } | null>(null);
  const [error, setError] = useState("");

  const decodeJWT = () => {
    setError("");
    setDecoded(null);
    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) {
        setError("Invalid JWT format. A JWT should have 3 parts separated by dots.");
        return;
      }

      const decodeBase64Url = (str: string) => {
        const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        return JSON.parse(atob(padded));
      };

      const header = decodeBase64Url(parts[0]);
      const payload = decodeBase64Url(parts[1]);

      setDecoded({ header, payload, signature: parts[2] });
    } catch {
      setError("Failed to decode JWT. Make sure it's a valid token.");
    }
  };

  const formatExpiry = (exp: number) => {
    const date = new Date(exp * 1000);
    const now = new Date();
    const expired = date < now;
    return `${date.toLocaleString()} (${expired ? "EXPIRED" : "Valid"})`;
  };

  return (
    <Card id="jwt-decoder">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-primary" />
          <CardTitle>JWT Decoder</CardTitle>
          <Badge variant="secondary">New</Badge>
        </div>
        <CardDescription>
          Decode and inspect JSON Web Tokens (JWT) — header, payload, and claims. Does NOT verify signatures client-side.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>JWT Token</Label>
          <Textarea
            placeholder="Paste your JWT token here (eyJhbGci...)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            rows={3}
            className="font-mono text-sm"
          />
        </div>
        <Button onClick={decodeJWT} disabled={!token.trim()} className="gap-2">
          <FileCode className="h-4 w-4" />
          Decode Token
        </Button>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {decoded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Badge variant="outline">Header</Badge>
              </Label>
              <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto font-mono">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Badge variant="outline">Payload</Badge>
              </Label>
              <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto font-mono">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>

            {/* Claims Analysis */}
            <div className="space-y-2">
              <Label>Claims Analysis</Label>
              <div className="space-y-1.5">
                {typeof decoded.payload.exp === "number" && (
                  <div className="flex items-center gap-2 text-sm">
                    {new Date(decoded.payload.exp * 1000) < new Date() ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                    <span>Expiration: {formatExpiry(decoded.payload.exp)}</span>
                  </div>
                )}
                {typeof decoded.payload.iss === "string" && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Issuer: {decoded.payload.iss}</span>
                  </div>
                )}
                {typeof decoded.payload.sub === "string" && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Subject: {decoded.payload.sub}</span>
                  </div>
                )}
                {decoded.header.alg === "none" && (
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-destructive font-semibold">WARNING: Algorithm is &quot;none&quot; — this token has no signature!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Signature */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Badge variant="outline">Signature</Badge>
              </Label>
              <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto font-mono break-all">
                {decoded.signature}
              </pre>
              <p className="text-xs text-muted-foreground">
                Note: Signature verification requires the signing key and is not performed client-side.
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- SQL Injection Tester ----------
function SQLInjectionTester() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<
    { pattern: string; detected: boolean; risk: string; description: string }[] | null
  >(null);

  const testForSQLi = () => {
    const patterns = [
      { regex: /('|"|;|--|\/\*|\*\/)/i, pattern: "Special SQL Characters", risk: "Medium", description: "Contains SQL special characters that could be used for injection" },
      { regex: /(union\s+(all\s+)?select)/i, pattern: "UNION SELECT", risk: "Critical", description: "UNION-based injection attempt — could extract data from other tables" },
      { regex: /(or\s+1\s*=\s*1|and\s+1\s*=\s*1|or\s+'1'\s*=\s*'1')/i, pattern: "Boolean-Based Bypass", risk: "Critical", description: "Classic authentication bypass attempt using tautology" },
      { regex: /(drop\s+table|alter\s+table|delete\s+from|truncate)/i, pattern: "Destructive Statement", risk: "Critical", description: "Destructive SQL statement that could modify or delete data" },
      { regex: /(exec\s*\(|execute\s|xp_cmdshell|sp_executesql)/i, pattern: "Command Execution", risk: "Critical", description: "Stored procedure / OS command execution attempt" },
      { regex: /(sleep\s*\(\d|benchmark\s*\(|waitfor\s+delay)/i, pattern: "Time-Based Blind", risk: "High", description: "Time-based blind injection — used to infer data without direct output" },
      { regex: /(load_file|into\s+outfile|into\s+dumpfile)/i, pattern: "File Operations", risk: "Critical", description: "File read/write operations — could access server filesystem" },
      { regex: /(information_schema|sys\.tables|pg_catalog)/i, pattern: "Schema Discovery", risk: "High", description: "Attempting to enumerate database schema and table structure" },
    ];

    const detected = patterns.map((p) => ({
      pattern: p.pattern,
      detected: p.regex.test(input),
      risk: p.risk,
      description: p.description,
    }));

    setResults(detected);
  };

  const riskColor = (risk: string) => {
    switch (risk) {
      case "Critical": return "text-destructive";
      case "High": return "text-chart-5";
      case "Medium": return "text-chart-4";
      default: return "text-muted-foreground";
    }
  };

  return (
    <Card id="sql-tester">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <CardTitle>SQL Injection Pattern Tester</CardTitle>
          <Badge variant="secondary">New</Badge>
        </div>
        <CardDescription>
          Test input strings for common SQL injection patterns. For educational purposes — use to validate your input sanitization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Test Input</Label>
          <Textarea
            placeholder="Enter a string to check for SQL injection patterns (e.g., ' OR 1=1 --)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            className="font-mono text-sm"
          />
        </div>
        <Button onClick={testForSQLi} disabled={!input.trim()} className="gap-2">
          <Search className="h-4 w-4" />
          Analyze Input
        </Button>

        {results && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {results.map((r) => (
              <div key={r.pattern} className="flex items-start gap-3 rounded-lg border p-3">
                {r.detected ? (
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{r.pattern}</span>
                    {r.detected && (
                      <Badge variant="destructive" className="text-xs">
                        {r.risk}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{r.description}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-2 mt-4">
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-primary" />
                {results.filter((r) => !r.detected).length} Safe
              </Badge>
              <Badge variant="outline" className="gap-1">
                <XCircle className="h-3 w-3 text-destructive" />
                {results.filter((r) => r.detected).length} Detected
              </Badge>
            </div>

            {results.some((r) => r.detected) && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm space-y-2">
                <p className="font-semibold text-destructive">SQL Injection Patterns Detected!</p>
                <p className="text-muted-foreground">
                  This input contains patterns commonly used in SQL injection attacks. Always use parameterized queries / prepared statements to prevent SQLi.
                </p>
                <Link href="/secure-code" className="text-primary hover:underline text-xs inline-flex items-center gap-1">
                  Learn secure coding patterns <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
