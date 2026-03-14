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
                      Professional security assessment tool for AI/LLM applications. Test for prompt injection, vulnerabilities,
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
    { header: string; value: string | null; status: "good" | "warning" | "bad" | "info"; message: string }[] | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ url: string; statusCode: number; server: string; scannedAt: string } | null>(null);

  const analyzeHeaders = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setMeta(null);

    try {
      const res = await fetch("/api/analyze-headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to analyze headers");
        return;
      }

      setResults(data.results);
      setMeta({ url: data.url, statusCode: data.statusCode, server: data.server, scannedAt: data.scannedAt });
    } catch {
      setError("Network error — please check your connection and try again");
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === "good") return <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />;
    if (status === "warning") return <AlertTriangle className="h-5 w-5 text-chart-4 shrink-0" />;
    if (status === "info") return <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0" />;
    return <XCircle className="h-5 w-5 text-destructive shrink-0" />;
  };

  return (
    <Card id="headers">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle>Security Header Analyzer</CardTitle>
        </div>
        <CardDescription>
          Performs a real HTTP request to check security headers on any public URL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && url && !loading) analyzeHeaders(); }}
            className="flex-1"
          />
          <Button onClick={analyzeHeaders} disabled={!url || loading} className="gap-2">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Analyze
          </Button>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </motion.div>
        )}

        {meta && results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Scan metadata */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground border-b pb-3">
              <span><strong>URL:</strong> {meta.url}</span>
              <span><strong>HTTP Status:</strong> {meta.statusCode}</span>
              <span><strong>Server:</strong> {meta.server}</span>
              <span><strong>Scanned:</strong> {new Date(meta.scannedAt).toLocaleString()}</span>
            </div>

            {/* Results */}
            {results.map((r) => (
              <div
                key={r.header}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                {statusIcon(r.status)}
                <div className="min-w-0">
                  <div className="font-mono text-sm font-semibold">{r.header}</div>
                  {r.value && (
                    <div className="text-xs font-mono text-muted-foreground truncate" title={r.value}>
                      {r.value.length > 120 ? r.value.slice(0, 120) + "…" : r.value}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground mt-0.5">{r.message}</div>
                </div>
              </div>
            ))}

            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 mt-4">
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
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="h-3 w-3 text-blue-500" />
                {results.filter((r) => r.status === "info").length} Info
              </Badge>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- MD5 implementation (RFC 1321) ----------
function md5(input: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);  d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);   b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);   d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);  b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);   d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);      b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);  d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);   d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);   b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);   d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);  b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);   b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);  d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);   b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);      d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);  b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);  d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);   b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);   d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);   b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);   d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);   b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);   d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);  d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);   d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);  b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);   d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }
  function md5blk(s: number[]) {
    const md5blks: number[] = [];
    for (let i = 0; i < 64; i += 4)
      md5blks[i >> 2] = s[i] + (s[i + 1] << 8) + (s[i + 2] << 16) + (s[i + 3] << 24);
    return md5blks;
  }
  const bytes = Array.from(new TextEncoder().encode(input));
  const n = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  bytes.push(n * 8 & 0xff, (n * 8 >> 8) & 0xff, (n * 8 >> 16) & 0xff, (n * 8 >> 24) & 0xff);
  bytes.push(0, 0, 0, 0);
  const state = [1732584193, -271733879, -1732584194, 271733878];
  for (let i = 0; i < bytes.length; i += 64)
    md5cycle(state, md5blk(bytes.slice(i, i + 64)));
  const hex = (n: number) =>
    Array.from({ length: 4 }, (_, i) => ((n >> (i * 8)) & 0xff).toString(16).padStart(2, "0")).join("");
  return state.map(hex).join("");
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

    // MD5 — pure JS implementation
    results["MD5"] = md5(input);

    for (const algo of hashAlgorithms) {
      const hashBuffer = await crypto.subtle.digest(algo, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      results[algo] = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    setHashes(results);
  };

  const copyHash = (algo: string) => {
    navigator.clipboard.writeText(hashes[algo]);
    setCopied(algo);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card id="hash">
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

// ---------- Common passwords list (top 200) ----------
const COMMON_PASSWORDS = new Set([
  "password","123456","12345678","qwerty","abc123","monkey","1234567","letmein",
  "trustno1","dragon","baseball","iloveyou","master","sunshine","ashley","michael",
  "shadow","123123","654321","superman","qazwsx","michael","football","password1",
  "password123","batman","login","admin","princess","starwars","welcome","hello",
  "charlie","donald","loveme","zaq1zaq1","qwerty123","passw0rd","1q2w3e4r",
  "1qaz2wsx","access","master","flower","hottie","mustang","121212","111111",
  "000000","696969","cheese","garcia","pepper","1234","12345","123456789",
  "1234567890","summer","love","winner","maggie","computer","internet",
  "asshole","daniel","hunter","thomas","joshua","jesus","secret","soccer",
  "killer","george","yankees","andrew","abcdef","buster","jordan","harley",
  "robert","matthew","taylor","william","tigger","austin","thunder","melissa",
  "chicken","ginger","hammer","silver","orange","cookie","samantha","corvette",
  "merlin","brandy","purple","diamond","dakota","hannah","nicole","falcon",
  "scooter","camaro","ranger","iceman","qwert","test","root","toor","changeme",
  "letmein1","welcome1","p@ssw0rd","p@ssword","pass@123","admin123","test123",
  "guest","default","temp","temp123","public","private","nothing","winter",
  "spring","autumn","baseball1","football1","soccer1","hockey","compaq",
  "whatever","jennifer","amanda","jessica","trustme","aaaaaa","qqqqqq",
  "security","freedom","money","starwars1","dallas","yankee","jordan23",
  "arsenal","liverpool","chelsea","barcelona","juventus","samsung","apple",
  "google","matrix","987654321","11111111","00000000","88888888","1111",
  "0000","asdfgh","zxcvbn","asdf","qwer","abcd","abcd1234","asdfghjkl",
  "asd123","zxcvbnm","aaaa","pass","god","fuck","shit","pussy","sexy",
]);

function calcEntropy(password: string): number {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^A-Za-z0-9]/.test(password)) charsetSize += 33;
  if (charsetSize === 0) return 0;
  return password.length * Math.log2(charsetSize);
}

// ---------- Password Strength Checker ----------
function PasswordStrengthChecker() {
  const [password, setPassword] = useState("");

  const lower = password.toLowerCase();
  const isCommon = COMMON_PASSWORDS.has(lower);
  const entropy = calcEntropy(password);

  // Detect keyboard walks like qwerty, asdfgh, zxcvbn
  const keyboardPatterns = /qwerty|asdfgh|zxcvbn|qazwsx|1qaz|zaq1|wsxedc|qwer|asdf/i;
  const hasKeyboardWalk = keyboardPatterns.test(password);

  // Detect sequential chars: abc, 123, 321, cba
  let hasSequential = false;
  for (let i = 0; i < password.length - 2; i++) {
    const a = password.charCodeAt(i), b = password.charCodeAt(i + 1), c = password.charCodeAt(i + 2);
    if ((b - a === 1 && c - b === 1) || (a - b === 1 && b - c === 1)) { hasSequential = true; break; }
  }

  // Detect repeated characters: aaa, 111
  const hasRepeated = /(.)\1{2,}/.test(password);

  // Detect date-like patterns
  const hasDatePattern = /(?:19|20)\d{2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/.test(password);

  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "At least 12 characters (recommended)", pass: password.length >= 12 },
    { label: "At least 16 characters (strong)", pass: password.length >= 16 },
    { label: "Contains uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Contains number", pass: /[0-9]/.test(password) },
    { label: "Contains special character (!@#$...)", pass: /[^A-Za-z0-9]/.test(password) },
    { label: "Not a known common password", pass: !isCommon && password.length > 0 },
    { label: "No keyboard walk patterns (qwerty, asdf...)", pass: !hasKeyboardWalk && password.length > 0 },
    { label: "No sequential characters (abc, 123...)", pass: !hasSequential && password.length > 0 },
    { label: "No repeated characters (aaa, 111...)", pass: !hasRepeated && password.length > 0 },
    { label: "No date patterns (2024, 01/01...)", pass: !hasDatePattern && password.length > 0 },
  ];

  const passedCount = checks.filter((c) => c.pass).length;

  // Score: combine check pass count + entropy
  let strengthLabel: string;
  let strengthColor: string;
  let strengthPercent: number;

  if (password.length === 0) {
    strengthLabel = "";
    strengthColor = "bg-muted";
    strengthPercent = 0;
  } else if (isCommon) {
    strengthLabel = "Very Weak — Common Password";
    strengthColor = "bg-destructive";
    strengthPercent = 5;
  } else if (entropy < 28 || password.length < 6) {
    strengthLabel = "Very Weak";
    strengthColor = "bg-destructive";
    strengthPercent = 10;
  } else if (entropy < 36 || passedCount <= 4) {
    strengthLabel = "Weak";
    strengthColor = "bg-destructive";
    strengthPercent = 25;
  } else if (entropy < 60 || passedCount <= 7) {
    strengthLabel = "Moderate";
    strengthColor = "bg-chart-4";
    strengthPercent = 50;
  } else if (entropy < 80 || passedCount <= 10) {
    strengthLabel = "Strong";
    strengthColor = "bg-primary";
    strengthPercent = 75;
  } else {
    strengthLabel = "Very Strong";
    strengthColor = "bg-primary";
    strengthPercent = 100;
  }

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
                <span className="font-semibold">{strengthLabel}</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strengthColor}`}
                  style={{ width: `${strengthPercent}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Entropy: <span className="font-mono font-semibold">{entropy.toFixed(1)} bits</span>
                {entropy < 36 && " — easily brute-forced"}
                {entropy >= 36 && entropy < 60 && " — resistant to online attacks"}
                {entropy >= 60 && entropy < 80 && " — resistant to offline attacks"}
                {entropy >= 80 && " — very strong, resistant to all known attacks"}
              </div>
            </div>

            {/* Time to crack estimate */}
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <span className="text-muted-foreground">Estimated crack time (offline, 10B guesses/s): </span>
              <span className="font-semibold">
                {(() => {
                  if (isCommon) return "Instant";
                  const combos = Math.pow(2, entropy);
                  const seconds = combos / 10_000_000_000;
                  if (seconds < 1) return "< 1 second";
                  if (seconds < 60) return `${Math.round(seconds)} seconds`;
                  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
                  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
                  if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} days`;
                  if (seconds < 86400 * 365 * 1000) return `${Math.round(seconds / (86400 * 365))} years`;
                  if (seconds < 86400 * 365 * 1e6) return `${(seconds / (86400 * 365 * 1000)).toFixed(0)}K years`;
                  if (seconds < 86400 * 365 * 1e9) return `${(seconds / (86400 * 365 * 1e6)).toFixed(0)}M years`;
                  return "Billions+ years";
                })()}
              </span>
            </div>

            {/* Checks */}
            <div className="space-y-2">
              {checks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-sm">
                  {check.pass ? (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
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
