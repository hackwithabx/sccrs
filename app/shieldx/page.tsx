"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Key,
  Package,
  Cloud,
  Globe,
  Brain,
  GitBranch,
  Bell,
  BarChart3,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Crown,
  FileText,
  FileCode,
  Clock,
  TrendingUp,
  XCircle,
  Loader2,
  ChevronDown,
  Search,
  X,
  Upload,
  FolderOpen,
  Trash2,
  ExternalLink,
  Files,
  Download,
  ShieldCheck,
  Eye,
  Server,
  Code2,
  Activity,
  Plus,
  Edit,
  Power,
  BookOpen,
  Copy,
  Sparkles,
  Wand2,
  MessageSquareText,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

/* ── Chart Colors ── */
const SEV_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#3b82f6",
  info: "#6b7280",
};

function SeverityPieChart({ stats }: { stats: { critical?: number; high?: number; medium?: number; low?: number; total?: number } }) {
  const data = [
    { name: "Critical", value: stats.critical || 0, color: SEV_COLORS.critical },
    { name: "High", value: stats.high || 0, color: SEV_COLORS.high },
    { name: "Medium", value: stats.medium || 0, color: SEV_COLORS.medium },
    { name: "Low", value: stats.low || 0, color: SEV_COLORS.low },
  ].filter((d) => d.value > 0);
  if (data.length === 0) return null;
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-3 mt-1 flex-wrap justify-center">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreGauge({ score, label }: { score: number; label?: string }) {
  const color = score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444";
  const data = [{ value: score, fill: color }];
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={160} height={160}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} barSize={12} data={data}>
          <RadialBar background={{ fill: "hsl(var(--muted))" }} dataKey="value" cornerRadius={6} max={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="-mt-14 text-center">
        <div className="text-3xl font-bold" style={{ color }}>{score.toFixed(1)}</div>
        <div className="text-[10px] text-muted-foreground">{label || "out of 10"}</div>
      </div>
    </div>
  );
}

/* ── Types ── */

const SCANNABLE_EXTENSIONS = new Set([
  ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts",
  ".java", ".cpp", ".cc", ".cxx", ".c", ".h", ".hpp", ".cs",
]);

function isScannable(path: string): boolean {
  const ext = path.slice(path.lastIndexOf(".")).toLowerCase();
  return SCANNABLE_EXTENSIONS.has(ext);
}

async function extractZipFiles(file: File): Promise<{ path: string; content: string }[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(file);
  const results: { path: string; content: string }[] = [];

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;
    // Skip node_modules, .git, build artifacts, binary files
    if (
      relativePath.includes("node_modules/") ||
      relativePath.includes(".git/") ||
      relativePath.includes("dist/") ||
      relativePath.includes("build/") ||
      relativePath.includes("__pycache__/") ||
      relativePath.startsWith(".")
    ) continue;
    if (!isScannable(relativePath)) continue;

    try {
      const content = await zipEntry.async("string");
      if (content.length > 0 && content.length < 2_000_000) {
        results.push({ path: relativePath, content });
      }
    } catch {
      // Skip binary or unreadable files
    }
  }

  return results;
}

async function readFolderFiles(fileList: FileList): Promise<{ path: string; content: string }[]> {
  const results: { path: string; content: string }[] = [];
  const MAX_FILES = 500;

  for (let i = 0; i < Math.min(fileList.length, MAX_FILES); i++) {
    const file = fileList[i];
    const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;

    if (
      path.includes("node_modules/") ||
      path.includes(".git/") ||
      path.includes("dist/") ||
      path.includes("build/") ||
      path.includes("__pycache__/")
    ) continue;
    if (!isScannable(path)) continue;

    try {
      const content = await file.text();
      if (content.length > 0 && content.length < 2_000_000) {
        results.push({ path, content });
      }
    } catch {
      // skip
    }
  }

  return results;
}

type PlanTier = "free" | "pro" | "enterprise";

interface BillingState {
  plan: PlanTier;
  planSource: string;
  billingProvider: string | null;
  billingStatus: string;
  subscriptionId: string | null;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  teamManaged: boolean;
  teamContext: { ownerId: string; ownerName: string; companyName: string } | null;
}

interface ScanHistoryItem {
  _id: string;
  scanType: string;
  title: string;
  overallScore: number;
  counts: { critical: number; high: number; medium: number; low: number; findingsTotal: number };
  createdAt: string;
  status: string;
}

/* ── Module definitions ── */
const MODULES = [
  { id: "secrets", name: "Secrets Scanner", description: "Detect hardcoded API keys, tokens, and credentials using 20+ regex patterns and Shannon entropy analysis.", icon: Key, plans: ["free", "pro", "enterprise"], },
  { id: "deps", name: "Dependency Scanner", description: "Real-time vulnerability scanning for npm, pip, Go, and Gradle dependencies against a continuously updated CVE database.", icon: Package, plans: ["pro", "enterprise"] },
  { id: "api", name: "API Security Scanner", description: "OWASP API Top 10 2023 compliance checks — security headers, CORS, auth, and 15+ automated tests.", icon: Globe, plans: ["pro", "enterprise"] },
  { id: "cloud", name: "Cloud Security Audit", description: "18 cloud security checks for AWS, Azure, and GCP — IAM, encryption, logging, and network rules.", icon: Cloud, plans: ["pro", "enterprise"] },
  { id: "logs", name: "Threat Log Analyzer", description: "Pattern-based log analysis to detect brute-force attacks, injection attempts, privilege escalation, and anomalous traffic.", icon: Brain, plans: ["pro", "enterprise"] },
  { id: "sast", name: "SAST Code Analyzer", description: "Multi-file AST-based static analysis with cross-file taint tracking, exploit PoC generation, and downloadable reports. Detects SQL injection, XSS, SSRF, command injection, and 15+ vulnerability classes across JavaScript, TypeScript, Java, C++, and C#.", icon: FileCode, plans: ["pro", "enterprise"] },
  { id: "ai-review", name: "AI Security Review", description: "AI-powered deep security review that finds business logic flaws, authorization gaps, IDOR, race conditions, and vulnerabilities that no pattern-based SAST tool can detect. Powered by LLM analysis.", icon: Sparkles, plans: ["pro", "enterprise"] },
  { id: "cicd", name: "CI/CD Pipeline Gate", description: "Block insecure code from reaching production. Run secrets + dependency scans as a pipeline step in GitHub Actions, GitLab CI, or Jenkins.", icon: GitBranch, plans: ["enterprise"] },
  { id: "license", name: "License Compliance Scanner", description: "Scan open-source dependencies for license risks (GPL, AGPL, copyleft). Auto-detect license conflicts that could force source disclosure — critical for startups seeking funding or acquisition.", icon: FileText, plans: ["pro", "enterprise"] },
  { id: "score", name: "Security Score", description: "Composite 0–10 security score dashboard with real scan data, severity breakdown, and trend tracking.", icon: BarChart3, plans: ["free", "pro", "enterprise"], },
];

const POSITIONING = {
  headline: "Security scanning that developers can run in 60 seconds.",
  subline: "DevSecOps security for startups — no security team required.",
  valueProps: [
    "Find secrets, vulnerabilities, and misconfigurations before production.",
    "All-in-one security platform — no need for 5 different tools.",
    "Enterprise-grade security at startup-friendly pricing — no bloat, no lock-in.",
    "Centralized security insights with actionable remediation guidance.",
  ],
};

export default function ShieldXWorkspacePage() {
  const { data: session, status } = useSession();

  const [billingState, setBillingState] = useState<BillingState | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* ── Scan UI state ── */
  const scanPanelRef = useRef<HTMLDivElement>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState("");
  const [cicdDepsInput, setCicdDepsInput] = useState("");
  const [cicdScanType, setCicdScanType] = useState<"full" | "secrets" | "dependencies">("full");
  const [sastLanguage, setSastLanguage] = useState<"javascript" | "typescript" | "java" | "cpp" | "csharp">("javascript");
  const [sastMode, setSastMode] = useState<"single" | "multi">("single");
  const [multiFiles, setMultiFiles] = useState<{ path: string; content: string }[]>([]);
  const [multiFileLoading, setMultiFileLoading] = useState(false);
  const [selectedFileIdx, setSelectedFileIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scanResults, setScanResults] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [expandedPoC, setExpandedPoC] = useState<Set<number>>(new Set());
  const [sessionScans, setSessionScans] = useState<ScanHistoryItem[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [suppressedFindings, setSuppressedFindings] = useState<Set<string>>(new Set());

  /* ── AI feature state ── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiFixResults, setAiFixResults] = useState<Record<number, any>>({});
  const [aiFixLoading, setAiFixLoading] = useState<Record<number, boolean>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiReviewLanguage, setAiReviewLanguage] = useState<string>("javascript");

  /* ── Admin plan upgrade ── */
  const [upgradingPlan, setUpgradingPlan] = useState(false);
  const [planMessage, setPlanMessage] = useState<string | null>(null);
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  /* ── Multi-file handlers ── */
  const handleZipUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMultiFileLoading(true);
    try {
      const files = await extractZipFiles(file);
      if (files.length === 0) {
        setScanError("No scannable source files found in ZIP. Supported: .js, .ts, .java, .cpp, .cs and related extensions.");
      } else {
        setMultiFiles(files);
        setSelectedFileIdx(0);
        setScanError(null);
      }
    } catch {
      setScanError("Failed to read ZIP file. Please ensure it is a valid ZIP archive.");
    } finally {
      setMultiFileLoading(false);
      if (e.target) e.target.value = "";
    }
  }, []);

  const handleFolderUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setMultiFileLoading(true);
    try {
      const files = await readFolderFiles(fileList);
      if (files.length === 0) {
        setScanError("No scannable source files found in folder.");
      } else {
        setMultiFiles(files);
        setSelectedFileIdx(0);
        setScanError(null);
      }
    } catch {
      setScanError("Failed to read folder contents.");
    } finally {
      setMultiFileLoading(false);
      if (e.target) e.target.value = "";
    }
  }, []);

  const multiFileTotalSize = multiFiles.reduce((s, f) => s + f.content.length, 0);
  const multiFileTotalLines = multiFiles.reduce((s, f) => s + f.content.split("\n").length, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateSASTReport = useCallback((results: any) => {
    const now = new Date();
    const sevColor: Record<string, string> = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#3b82f6", info: "#6b7280" };
    const findings = results.findings || [];
    const stats = results.stats || { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
    const isMulti = results.multiFile;
    const esc = (s: string) => s?.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") || "";

    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>SAST Security Report - SecureCodeReviews</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#1e293b;line-height:1.5;padding:32px}
  .container{max-width:900px;margin:0 auto}
  .header{background:linear-gradient(135deg,#1e40af,#3b82f6);color:#fff;padding:32px;border-radius:12px;margin-bottom:24px}
  .header h1{font-size:22px;margin-bottom:4px}.header p{opacity:.85;font-size:13px}
  .header .logo{display:flex;align-items:center;gap:10px;margin-bottom:12px}.header .logo svg{width:32px;height:32px}
  .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:24px}
  .stat{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px;text-align:center}
  .stat .num{font-size:28px;font-weight:700}.stat .label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.5px}
  .stat.critical .num{color:#ef4444}.stat.high .num{color:#f97316}.stat.medium .num{color:#eab308}.stat.low .num{color:#3b82f6}
  .section{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:16px}
  .section h3{font-size:14px;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:6px}
  .finding{border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;border-left:3px solid}
  .finding.critical{border-left-color:#ef4444}.finding.high{border-left-color:#f97316}.finding.medium{border-left-color:#eab308}.finding.low{border-left-color:#3b82f6}
  .badge{display:inline-block;padding:1px 8px;border-radius:4px;font-size:10px;font-weight:600;text-transform:uppercase;color:#fff;margin-right:6px}
  .code-block{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;padding:8px 12px;font-family:'JetBrains Mono',Consolas,monospace;font-size:11px;overflow-x:auto;margin:8px 0;white-space:pre}
  .fix{background:#ecfdf5;border:1px solid #a7f3d0;border-radius:6px;padding:12px;margin-top:8px}
  .fix h4{color:#059669;font-size:12px;margin-bottom:4px}.fix p{font-size:11px;color:#065f46}
  .dataflow{background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px 12px;margin:8px 0;font-size:11px}
  .meta{display:flex;gap:8px;margin-bottom:6px;flex-wrap:wrap;align-items:center}
  .meta span{font-size:10px;padding:2px 6px;border:1px solid #e2e8f0;border-radius:3px;color:#64748b}
  .breakdown table{width:100%;border-collapse:collapse;font-size:12px}
  .breakdown th,.breakdown td{padding:8px 12px;text-align:left;border-bottom:1px solid #e2e8f0}
  .breakdown th{background:#f8fafc;font-weight:600;color:#475569;font-size:11px;text-transform:uppercase}
  .footer{text-align:center;padding:20px;color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;margin-top:24px}
  .diff-banner{background:linear-gradient(135deg,#f0f9ff,#eff6ff);border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:16px}
  .diff-item{display:flex;gap:8px;margin-bottom:6px;font-size:12px}.diff-item strong{color:#1e40af;min-width:120px}
</style></head><body><div class="container">`;

    html += `<div class="header">
      <div class="logo">
        <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="256" height="256" rx="48" fill="rgba(255,255,255,0.15)"/><path d="M128 28L48 68v60c0 52.8 34.1 102.2 80 114 45.9-11.8 80-61.2 80-114V68l-80-40z" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="6"/><text x="128" y="155" text-anchor="middle" fill="white" font-family="monospace" font-size="64" font-weight="bold">&lt;/&gt;</text></svg>
        <div>
          <strong style="font-size:20px;letter-spacing:1px">SCRS</strong>
          <span style="font-size:13px;opacity:.9;margin-left:6px">SecureCodeReviews</span>
          <br><span style="font-size:11px;opacity:.7">ShieldX SAST Engine — Automated Static Analysis</span>
        </div>
      </div>
      <h1>SAST Security Analysis Report</h1>
      <p style="margin-top:8px">
        <strong>Date:</strong> ${now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        &nbsp;&nbsp;|&nbsp;&nbsp;<strong>Time:</strong> ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
      </p>
      <p>${isMulti ? `Project Scan: ${results.fileCount} files, ${results.totalLines?.toLocaleString()} lines analyzed` : `Single File Analysis: ${results.linesAnalyzed || 0} lines analyzed`}</p>
      <p style="font-size:11px;opacity:.6;margin-top:6px">Report ID: SCRS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}</p>
    </div>`;

    html += `<div class="stats">
      <div class="stat"><div class="num">${stats.total}</div><div class="label">Total</div></div>
      <div class="stat critical"><div class="num">${stats.critical}</div><div class="label">Critical</div></div>
      <div class="stat high"><div class="num">${stats.high}</div><div class="label">High</div></div>
      <div class="stat medium"><div class="num">${stats.medium}</div><div class="label">Medium</div></div>
      <div class="stat low"><div class="num">${stats.low}</div><div class="label">Low</div></div>
    </div>`;

    if (isMulti && results.fileBreakdown?.length > 0) {
      html += `<div class="section breakdown"><h3>File Breakdown</h3><table>
        <tr><th>File</th><th>Language</th><th>Lines</th><th>Findings</th><th>Critical</th><th>High</th></tr>`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results.fileBreakdown.forEach((fb: any) => {
        html += `<tr><td style="font-family:monospace;font-size:11px">${esc(fb.file)}</td><td>${esc(fb.language)}</td><td>${fb.lines}</td><td>${fb.findings}</td><td style="color:#ef4444;font-weight:600">${fb.critical}</td><td style="color:#f97316;font-weight:600">${fb.high}</td></tr>`;
      });
      html += `</table></div>`;
    }

    if (findings.length > 0) {
      html += `<div class="section"><h3>Vulnerability Findings (${findings.length})</h3>`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      findings.forEach((f: any, i: number) => {
        html += `<div class="finding ${f.severity}">
          <div class="meta">
            <span class="badge" style="background:${sevColor[f.severity] || "#6b7280"}">${f.severity}</span>
            ${f.file ? `<span style="font-family:monospace">${esc(f.file)}</span>` : ""}
            <span>Line ${f.line}</span>
            ${f.cwe ? `<span>${esc(f.cwe)}</span>` : ""}
            ${f.owasp ? `<span>${esc(f.owasp)}</span>` : ""}
            <span>${esc(f.category)}</span>
          </div>
          <p style="font-size:13px;font-weight:600;margin:8px 0 4px">#${i + 1}: ${esc(f.name)}</p>
          <p style="font-size:12px;color:#475569">${esc(f.detail)}</p>`;

        if (f.codeSnippet?.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          html += `<div class="code-block">${f.codeSnippet.map((sl: any) => `<span style="color:#94a3b8;margin-right:12px">${sl.lineNum}</span>${sl.isHighlighted ? `<strong style="color:#ef4444">${esc(sl.code)}</strong>` : esc(sl.code)}`).join("\n")}</div>`;
        }

        if (f.dataflow?.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          html += `<div class="dataflow"><strong>Attack Vector Flow:</strong><br>${f.dataflow.map((s: any) => `L${s.line}: ${esc(s.label)} ${s.code ? `- <code>${esc(s.code)}</code>` : ""}`).join(" -> ")}</div>`;
        }

        if (f.crossFileDataflow?.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          html += `<div class="dataflow"><strong>Cross-File Dataflow:</strong><br>${f.crossFileDataflow.map((s: any) => `${esc(s.file)}:L${s.line} - ${esc(s.label)}`).join("<br>")}</div>`;
        }

        if (f.exploitPoC) {
          html += `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:12px;margin-top:8px">
            <p style="font-size:12px;font-weight:600;color:#dc2626;margin-bottom:6px">⚠️ Exploit PoC: ${esc(f.exploitPoC.title)}</p>
            <p style="font-size:11px;color:#991b1b;margin-bottom:6px"><strong>Impact:</strong> ${esc(f.exploitPoC.impact)}</p>
            <p style="font-size:10px;font-weight:600;color:#991b1b;margin-bottom:4px">Attack Steps:</p>
            <ol style="font-size:11px;color:#7f1d1d;padding-left:16px;margin-bottom:8px">${f.exploitPoC.steps.map((s: string) => `<li>${esc(s)}</li>`).join("")}</ol>
            <div class="code-block" style="background:#1e1e1e;color:#d4d4d4;border:none">${esc(f.exploitPoC.payload)}</div>
            <p style="font-size:10px;color:#059669;margin-top:6px"><strong>Verify Fix:</strong> ${esc(f.exploitPoC.verifyFix)}</p>
          </div>`;
        }

        if (f.fix) {
          html += `<div class="fix"><h4>Fix: ${esc(f.fix.title || "")}</h4><p>${esc(f.fix.fix || f.remediation || "")}</p>`;
          if (f.fix.codeExample) html += `<div class="code-block">${esc(f.fix.codeExample)}</div>`;
          if (f.fix.effort) html += `<span style="font-size:10px;color:#059669">Effort: ${f.fix.effort}</span>`;
          html += `</div>`;
        }
        html += `</div>`;
      });
      html += `</div>`;
    } else {
      html += `<div class="section" style="background:#ecfdf5;border-color:#a7f3d0"><h3 style="color:#059669">No Vulnerabilities Detected</h3><p style="font-size:13px;color:#065f46">Your code passed all security checks.</p></div>`;
    }

    html += `<div class="diff-banner">
      <h3 style="font-size:13px;font-weight:600;margin-bottom:8px">How This Scan Differs From Other Tools</h3>
      <div class="diff-item"><strong>vs Competitors:</strong> Zero code storage. Your source code never touches a database or disk. Analyzed in memory and immediately discarded.</div>
      <div class="diff-item"><strong>vs Competitors:</strong> Full taint tracking with visualized dataflow. Traces data from user input through assignments and calls to dangerous sinks.</div>
      <div class="diff-item"><strong>vs Competitors:</strong> Cross-file analysis with CWE/OWASP references and auto-generated fix code with effort estimates.</div>
    </div>`;

    html += `<div class="footer">
      <p style="font-size:14px;font-weight:700;letter-spacing:1px;margin-bottom:4px">SCRS — SecureCodeReviews</p>
      <p>Generated by <strong>ShieldX</strong> SAST Engine</p>
      <p style="margin-top:4px">securecodereviews.com | Zero code storage | Client-first security</p>
      <p style="margin-top:8px;font-size:10px;opacity:.6">This report is confidential. Distribution is restricted to authorized personnel only.</p>
    </div></div></body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SCRS-SAST-Report-${now.toISOString().slice(0, 10)}-${now.toISOString().slice(11, 16).replace(":", "")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exportSASTJSON = useCallback((results: any) => {
    const exportData = {
      meta: {
        tool: "ShieldX SAST Engine",
        vendor: "SecureCodeReviews",
        generatedAt: new Date().toISOString(),
        version: "4.1",
      },
      summary: {
        totalFindings: results.stats?.total || 0,
        critical: results.stats?.critical || 0,
        high: results.stats?.high || 0,
        medium: results.stats?.medium || 0,
        low: results.stats?.low || 0,
        linesAnalyzed: results.multiFile ? results.totalLines : results.linesAnalyzed,
        filesScanned: results.multiFile ? results.fileCount : 1,
        scanDurationMs: results.scanDurationMs || null,
      },
      findings: (results.findings || []).map((f: Record<string, unknown>) => ({
        id: f.id,
        name: f.name,
        severity: f.severity,
        confidence: f.confidence,
        category: f.category,
        cwe: f.cwe,
        owasp: f.owasp,
        line: f.line,
        column: f.column,
        file: f.file || null,
        detail: f.detail,
        evidence: f.evidence,
        remediation: f.remediation,
        fix: f.fix || null,
        dataflow: f.dataflow || null,
        references: f.references || null,
      })),
      fileBreakdown: results.fileBreakdown || null,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SCRS-SAST-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exportSASTCSV = useCallback((results: any) => {
    const findings = results.findings || [];
    const headers = ["#", "Severity", "Name", "Category", "CWE", "OWASP", "File", "Line", "Confidence", "Detail", "Remediation"];
    const rows = findings.map((f: Record<string, unknown>, i: number) => [
      i + 1,
      f.severity,
      f.name,
      f.category,
      f.cwe || "",
      f.owasp || "",
      f.file || "",
      f.line,
      f.confidence || "",
      String(f.detail || "").replace(/"/g, '""'),
      String(f.remediation || (f.fix as Record<string, unknown>)?.fix || "").replace(/"/g, '""'),
    ]);
    const csv = [headers.join(","), ...rows.map((r: (string | number)[]) => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SCRS-SAST-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const userPlan: PlanTier = isAdmin
    ? "enterprise"
    : (billingState?.plan as PlanTier) ||
      ((session?.user as { shieldxPlan?: PlanTier } | undefined)?.shieldxPlan) ||
      "free";

  const isPaid = isAdmin || userPlan === "pro" || userPlan === "enterprise";

  const loadBillingState = useCallback(async () => {
    if (!session) { setLoadingBilling(false); return; }
    try {
      const res = await fetch("/api/shieldx/billing/subscription");
      const data = await res.json();
      if (res.ok) setBillingState(data.subscription || null);
    } catch { /* silent */ } finally { setLoadingBilling(false); }
  }, [session]);

  const loadScanHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/shieldx/history?limit=10");
      const data = await res.json();
      if (res.ok && data.scans) setScanHistory(data.scans);
    } catch { /* silent */ } finally { setLoadingHistory(false); }
  }, []);

  useEffect(() => { void loadBillingState(); }, [loadBillingState]);
  useEffect(() => { void loadScanHistory(); }, [loadScanHistory]);

  /* ── Admin plan upgrade ── */
  const adminUpgradePlan = async (plan: PlanTier) => {
    setUpgradingPlan(true);
    setPlanMessage(null);
    try {
      const res = await fetch("/api/shieldx/upgrade-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upgrade failed");
      setPlanMessage(`Plan updated to ${plan}. Reload the page to see changes.`);
      // Refresh billing state
      void loadBillingState();
    } catch (err) {
      setPlanMessage(err instanceof Error ? err.message : "Upgrade failed");
    } finally {
      setUpgradingPlan(false);
    }
  };

  /* ── Scan execution ── */
  const openModule = (moduleId: string) => {
    if (activeModule === moduleId) { setActiveModule(null); return; }
    setActiveModule(moduleId);
    setScanInput("");
    setCicdDepsInput("");
    setCicdScanType("full");
    setScanResults(null);
    setScanError(null);
    // Scroll to the scan panel after state update + animation start
    setTimeout(() => {
      scanPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const runScan = async () => {
    if (!activeModule) return;
    setScanning(true);
    setScanResults(null);
    setScanError(null);

    const isDemo = !isPaid;
    const mod = MODULES.find((m) => m.id === activeModule);
    if (!mod) return;

    try {
      let endpoint = "";
      let payload: Record<string, unknown> = {};

      switch (activeModule) {
        case "secrets":
          endpoint = "/api/shieldx/scan-secrets";
          payload = isDemo ? { demo: true } : { code: scanInput };
          break;
        case "deps":
          endpoint = "/api/shieldx/scan-deps";
          payload = isDemo ? { demo: true } : { input: scanInput };
          break;
        case "api":
          endpoint = "/api/shieldx/scan-api";
          payload = isDemo ? { demo: true } : { url: scanInput };
          break;
        case "cloud":
          endpoint = "/api/shieldx/scan-cloud";
          payload = isDemo ? { demo: true } : { config: scanInput };
          break;
        case "logs":
          endpoint = "/api/shieldx/scan-logs";
          payload = isDemo ? { demo: true } : { logs: scanInput };
          break;
        case "sast":
          endpoint = "/api/shieldx/scan-sast";
          if (sastMode === "multi" && multiFiles.length > 0) {
            payload = isDemo
              ? { demo: true, files: multiFiles }
              : { files: multiFiles, language: sastLanguage };
          } else {
            payload = isDemo ? { demo: true, language: sastLanguage } : { code: scanInput, language: sastLanguage };
          }
          break;
        case "ai-review":
          endpoint = "/api/shieldx/ai-review";
          payload = { code: scanInput, language: aiReviewLanguage };
          break;
        case "cicd":
          endpoint = "/api/shieldx/ci-scan";
          payload = {
            scanType: cicdScanType,
            ...(cicdScanType !== "dependencies" && { code: scanInput }),
            ...(cicdScanType !== "secrets" && { dependencies: cicdDepsInput }),
            projectName: "ShieldX UI Scan",
          };
          break;
        default:
          setScanError(`The ${mod.name} module is coming soon.`);
          setScanning(false);
          return;
      }

      if (!isDemo && activeModule !== "cicd") {
        const isMultiSast = activeModule === "sast" && sastMode === "multi";
        if (isMultiSast && multiFiles.length === 0) {
          setScanError("Please upload project files to scan.");
          setScanning(false);
          return;
        }
        if (!isMultiSast && !scanInput.trim()) {
          setScanError("Please enter input to scan.");
          setScanning(false);
          return;
        }
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setScanResults(data);

      // Track scan in current session for Security Score (works for all users)
      const historyPayload = buildHistoryPayload(activeModule, data, scanInput);
      let sessionItemId: string | null = null;
      if (historyPayload) {
        const sessionItem: ScanHistoryItem = {
          _id: `session-${Date.now()}`,
          scanType: historyPayload.scanType,
          title: historyPayload.title,
          overallScore: historyPayload.overallScore,
          counts: historyPayload.counts,
          createdAt: new Date().toISOString(),
          status: historyPayload.status,
        };
        sessionItemId = sessionItem._id;
        setSessionScans((prev) => [sessionItem, ...prev]);
      }

      // Auto-save to history for paid plans
      if (isPaid && data && !isDemo) {
        try {
          if (historyPayload) {
            const saveRes = await fetch("/api/shieldx/history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(historyPayload),
            });
            if (saveRes.ok) {
              // Remove the session scan to avoid duplicate with DB record
              if (sessionItemId) {
                setSessionScans((prev) => prev.filter((s) => s._id !== sessionItemId));
              }
              void loadScanHistory();
            }
          }
        } catch { /* silent — don't block UI */ }
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildHistoryPayload = (scanType: string, data: any, input: string) => {
    const target = scanType === "api" ? input : `${scanType} scan`;
    const title = `${MODULES.find(m => m.id === scanType)?.name || scanType} — ${new Date().toLocaleString()}`;

    switch (scanType) {
      case "secrets": {
        const findings = (data.findings || []).map((f: any) => ({
          category: "Secrets", status: f.confidence === "high" ? "fail" : "warn",
          finding: `${f.name} at line ${f.line}`, recommendation: f.remediation, severity: f.confidence === "high" ? "high" : "medium",
        }));
        return {
          scanType: "secrets", title, source: "manual", status: "completed", target,
          overallScore: Math.max(0, 10 - (data.stats?.high || 0) * 2 - (data.stats?.medium || 0)),
          summary: `Found ${data.stats?.total || 0} secrets across ${data.totalLines || 0} lines`,
          counts: { critical: 0, high: data.stats?.high || 0, medium: data.stats?.medium || 0, low: data.stats?.low || 0, findingsTotal: data.stats?.total || 0 },
          findings,
        };
      }
      case "deps": {
        const findings = (data.vulnerabilities || []).map((v: any) => ({
          category: "Dependencies", status: v.severity === "critical" || v.severity === "high" ? "fail" : "warn",
          finding: `${v.package}@${v.version}: ${v.summary}`, recommendation: v.fixedIn ? `Upgrade to ${v.fixedIn}` : "Check advisory", severity: v.severity,
        }));
        return {
          scanType: "deps", title, source: "manual", status: "completed", target,
          overallScore: Math.max(0, 10 - (data.stats?.critical || 0) * 3 - (data.stats?.high || 0) * 2 - (data.stats?.medium || 0)),
          summary: `Scanned ${data.totalDeps || data.totalDependencies || 0} dependencies, found ${data.vulnerabilities?.length || 0} vulnerabilities`,
          counts: { critical: data.stats?.critical || 0, high: data.stats?.high || 0, medium: data.stats?.medium || 0, low: data.stats?.low || 0, findingsTotal: data.vulnerabilities?.length || 0 },
          findings,
        };
      }
      case "api": {
        const allChecks = [...(data.headers || data.headerResults || []), ...(data.apiChecks || [])];
        const findings = allChecks.filter((c: any) => c.status !== "pass").map((c: any) => ({
          category: "API Security", status: c.status === "fail" ? "fail" : "warn",
          finding: `${c.name}: ${c.message || c.detail}`, recommendation: c.recommendation || "Review security configuration",
          severity: c.status === "fail" ? "high" : "medium",
        }));
        const failCount = findings.filter((f: any) => f.status === "fail").length;
        return {
          scanType: "api", title, source: "manual", status: "completed", target: input,
          overallScore: data.score || data.securityScore || 0,
          summary: `API security score: ${(data.score || data.securityScore || 0).toFixed(1)}/10. ${allChecks.length} checks performed.`,
          counts: { critical: 0, high: failCount, medium: findings.length - failCount, low: 0, findingsTotal: findings.length },
          findings,
        };
      }
      case "cloud": {
        const findings = (data.checks || []).filter((c: any) => c.status !== "pass").map((c: any) => ({
          category: c.category || "Cloud", status: c.status,
          finding: `${c.name}: ${c.detail}`, recommendation: c.recommendation || "Review cloud configuration",
          severity: c.severity || "medium",
        }));
        return {
          scanType: "cloud", title, source: "manual", status: "completed", target,
          overallScore: data.score || 0,
          summary: `Cloud security score: ${data.score?.toFixed(1)}/10. ${data.checksPerformed || 0} checks.`,
          counts: { critical: (data.checks||[]).filter((c:any)=>c.severity==="critical"&&c.status==="fail").length, high: (data.checks||[]).filter((c:any)=>c.severity==="high"&&c.status==="fail").length, medium: (data.checks||[]).filter((c:any)=>c.severity==="medium"&&c.status!=="pass").length, low: 0, findingsTotal: findings.length },
          findings,
        };
      }
      case "logs": {
        const findings = (data.findings || []).map((f: any) => ({
          category: f.category || "Logs", status: f.severity === "critical" || f.severity === "high" ? "fail" : "warn",
          finding: `${f.name}: ${f.detail}`, recommendation: f.remediation,
          severity: f.severity,
        }));
        return {
          scanType: "logs", title, source: "manual", status: "completed", target,
          overallScore: Math.max(0, 10 - (data.stats?.critical || 0) * 3 - (data.stats?.high || 0) * 2 - (data.stats?.medium || 0)),
          summary: `Analyzed ${data.totalLines || 0} log lines. ${data.stats?.total || 0} threats detected.`,
          counts: { critical: data.stats?.critical || 0, high: data.stats?.high || 0, medium: data.stats?.medium || 0, low: data.stats?.low || 0, findingsTotal: data.stats?.total || 0 },
          findings,
        };
      }
      case "sast": {
        const findings = (data.findings || []).map((f: any) => ({
          category: f.category || "SAST", status: f.severity === "critical" || f.severity === "high" ? "fail" : "warn",
          finding: `${f.name}: ${f.detail}`, recommendation: f.remediation,
          severity: f.severity,
        }));
        const linesInfo = data.multiFile ? `${data.fileCount} files, ${data.totalLines?.toLocaleString()} lines` : `${data.linesAnalyzed || 0} lines`;
        const checksInfo = data.multiFile ? `${data.totalChecks?.toLocaleString()} checks` : `${data.checksPerformed || 0} checks`;
        return {
          scanType: "sast", title, source: "manual", status: "completed", target,
          overallScore: Math.max(0, 10 - (data.stats?.critical || 0) * 3 - (data.stats?.high || 0) * 2 - (data.stats?.medium || 0)),
          summary: `${data.multiFile ? "Multi-file project" : "AST"} analysis of ${linesInfo}. ${data.stats?.total || 0} vulnerabilities found via ${checksInfo}.${data.crossFileFindings ? ` ${data.crossFileFindings} cross-file findings.` : ""}`,
          counts: { critical: data.stats?.critical || 0, high: data.stats?.high || 0, medium: data.stats?.medium || 0, low: data.stats?.low || 0, findingsTotal: data.stats?.total || 0 },
          findings,
        };
      }
      case "cicd": {
        const secretsFindings = (data.secrets?.findings || []).map((f: any) => ({
          category: "Secrets", status: f.severity === "critical" ? "fail" : "warn",
          finding: `${f.pattern} at line ${f.line}`, recommendation: "Remove or rotate this credential",
          severity: f.severity,
        }));
        const depFindings = (data.dependencies?.vulnerabilities || []).map((v: any) => ({
          category: "Dependencies", status: v.severity === "critical" || v.severity === "high" ? "fail" : "warn",
          finding: `${v.package}@${v.version}: ${v.summary}`, recommendation: v.fixedIn ? `Upgrade to ${v.fixedIn}` : "Check advisory",
          severity: v.severity,
        }));
        const allFindings = [...secretsFindings, ...depFindings];
        const critical = (data.secrets?.critical || 0) + (data.dependencies?.stats?.critical || 0);
        const high = (data.secrets?.high || 0) + (data.dependencies?.stats?.high || 0);
        return {
          scanType: "cicd", title, source: "manual", status: "completed", target: data.projectName || "CI/CD scan",
          overallScore: data.verdict === "PASS" ? 10 : Math.max(0, 10 - critical * 3 - high * 2),
          summary: `Pipeline gate: ${data.verdict}. ${allFindings.length} issues found across ${data.scanType} scan.`,
          counts: { critical, high, medium: allFindings.length - critical - high, low: 0, findingsTotal: allFindings.length },
          findings: allFindings,
        };
      }
      default: return null;
    }
  };

  const getInputConfig = (moduleId: string) => {
    switch (moduleId) {
      case "secrets":
        return { placeholder: "Paste your source code, config files, .env content, or any text here...", label: "Source Code / Config", type: "textarea" as const };
      case "deps":
        return { placeholder: "Paste your package.json, requirements.txt, build.gradle, or go.mod content...", label: "Dependency File Content", type: "textarea" as const };
      case "api":
        return { placeholder: "https://api.example.com/v1/health", label: "Target URL", type: "url" as const };
      case "cloud":
        return { placeholder: "Paste your Terraform, CloudFormation, or cloud config (JSON/YAML/HCL)...", label: "Cloud Configuration", type: "textarea" as const };
      case "logs":
        return { placeholder: "Paste your server logs, access logs, application logs, or audit logs here...\n\nExample:\n2026-03-20 02:14:33 [INFO] 192.168.1.105 - POST /api/login - 401 Unauthorized - Invalid credentials", label: "Log Data", type: "textarea" as const };
      case "sast": {
        const langLabels: Record<string, string> = { javascript: "JavaScript", typescript: "TypeScript", java: "Java", cpp: "C++", csharp: "C#" };
        const langPlaceholders: Record<string, string> = {
          javascript: "Paste JavaScript code for AST-based security analysis...\n\nThe engine parses your code into an Abstract Syntax Tree, tracks data flow from user inputs (req.body, req.query) to dangerous sinks (db.query, exec, eval), and detects SQL injection, XSS, command injection, SSRF, and 15+ vulnerability classes.",
          typescript: "Paste TypeScript code for security analysis...\n\nType annotations are stripped automatically before AST parsing.",
          java: "Paste Java code for security analysis...\n\nDetects SQL injection, command injection, XSS, XXE, insecure deserialization, weak crypto, path traversal, SSRF, LDAP injection, CSRF misconfig, hardcoded secrets, and more.",
          cpp: "Paste C/C++ code for security analysis...\n\nDetects buffer overflows (strcpy, sprintf, gets), format string vulnerabilities, command injection (system, popen), use-after-free, integer overflow, weak crypto, memory leaks, race conditions, and more.",
          csharp: "Paste C# code for security analysis...\n\nDetects SQL injection, command injection, XSS, insecure deserialization (BinaryFormatter), XXE, weak crypto, path traversal, SSRF, open redirect, CSRF bypass, insecure cookies, and more.",
        };
        return { placeholder: langPlaceholders[sastLanguage] || langPlaceholders.javascript, label: `${langLabels[sastLanguage] || "JavaScript"} Code`, type: "textarea" as const };
      }
      case "ai-review":
        return { placeholder: "Paste your code here for AI-powered deep security review...\n\nUnlike pattern-based SAST, AI Review finds:\n• Missing authorization checks\n• Broken access control (IDOR)\n• Business logic flaws (payment bypass, race conditions)\n• Mass assignment vulnerabilities\n• State management issues\n\nWorks with any language — JavaScript, Python, Go, Rust, Java, etc.", label: "Code for AI Review", type: "textarea" as const };
      default:
        return { placeholder: "", label: "Input", type: "textarea" as const };
    }
  };

  /* ── Unauthenticated landing ── */
  if (status === "unauthenticated") {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <Badge className="mb-4 gap-1.5 border-primary/20 bg-primary/10 px-3 py-1 text-primary">
              <Shield className="h-3.5 w-3.5" /> ShieldX Security Platform
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {POSITIONING.headline}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
              {POSITIONING.subline}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2"><Zap className="h-5 w-5" /> Start Free Demo</Button>
              </Link>
              {/* Pricing link hidden until billing is live */}
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-16">
            {POSITIONING.valueProps.map((prop, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <Card className="h-full">
                  <CardContent className="p-5 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm">{prop}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Why ShieldX Is Different</h2>
            <p className="text-muted-foreground mt-2">All-in-one security. Developer-first. Fast scanning. Low false positives.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
            {MODULES.map((mod, i) => (
              <motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <mod.icon className="h-6 w-6 text-primary" />
                      {mod.plans.includes("free") ? (
                        <Badge variant="secondary" className="text-[10px]">{mod.id === "score" ? "Dashboard" : "Demo"}</Badge>
                      ) : (
                        <Badge className="bg-primary/10 text-primary text-[10px]">
                          {mod.plans.includes("pro") ? "Pro+" : "Enterprise"}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base mt-2">{mod.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{mod.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* ── Plan Comparison — visible without login ── */}
          <div className="text-center mb-8 mt-4">
            <h2 className="text-2xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground mt-2">Choose a plan that fits your security needs. No hidden fees.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-16">
            {/* Free */}
            <Card className="relative overflow-hidden hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3">
                <p className="text-sm font-medium text-muted-foreground">Free</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-muted-foreground text-sm">/ forever</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 text-sm">
                <p className="text-muted-foreground">Demo workspace with basic modules.</p>
                <ul className="space-y-2">
                  {["Secrets Scanner (demo)", "Security Score Dashboard", "AI Security Auditor", "Free Tools (JWT, CSP, Hash, etc.)", "OWASP Guides & Resources", "2 demo scans"].map((f) => (
                    <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link href="/auth/register" className="block pt-2">
                  <Button variant="outline" className="w-full">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="relative overflow-hidden border-primary/40 shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Pro</p>
                  <Badge className="bg-primary/10 text-primary text-[10px]">Most Popular</Badge>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold">$29</span>
                  <span className="text-muted-foreground text-sm">/ month</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 text-sm">
                <p className="text-muted-foreground">Full security for individual developers and startups.</p>
                <ul className="space-y-2">
                  {["Everything in Free", "SAST Code Analyzer (multi-file, 200MB)", "Dependency Scanner (CVE database)", "API Security Scanner", "Cloud Security Audit", "Threat Log Analyzer", "License Compliance Scanner", "Unlimited scans", "Downloadable reports & charts", "Scan history & trends"].map((f) => (
                    <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link href="/auth/register" className="block pt-2">
                  <Button className="w-full gap-1"><Crown className="h-4 w-4" /> Start Pro</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="relative overflow-hidden hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Enterprise</p>
                  <Badge variant="secondary" className="text-[10px]">Built for Teams</Badge>
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold">$99</span>
                  <span className="text-muted-foreground text-sm">/ month</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3 text-sm">
                <p className="text-muted-foreground">Team collaboration with CI/CD and priority support.</p>
                <ul className="space-y-2">
                  {["Everything in Pro", "CI/CD Pipeline Gate", "25 team seats", "Team management & roles", "Priority support & onboarding", "Custom integrations", "Exploit PoC Generator"].map((f) => (
                    <li key={f} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link href="/auth/register" className="block pt-2">
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to secure your code?</h2>
              <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">
                Register for a free demo account. Run up to 2 scans on basic modules — no credit card required.
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-violet-700 hover:bg-gray-100 gap-2 font-semibold">
                  <Shield className="h-5 w-5" /> Create Free Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "loading" || loadingBilling) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ── Merged scan data (DB history + in-memory session scans) ── */
  const dbIds = new Set(scanHistory.map((s) => s._id));
  const mergedHistory = [...scanHistory, ...sessionScans.filter((s) => !dbIds.has(s._id))];

  /* ── Authenticated workspace ── */
  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" /> ShieldX Workspace
              </h1>
              <p className="text-muted-foreground mt-1">
                {isPaid ? POSITIONING.headline : "Demo workspace — limited module access."}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Badge variant={isPaid ? "default" : "secondary"} className="capitalize text-sm py-1 px-3">
                {isPaid && <Crown className="h-3 w-3 mr-1" />}
                {userPlan} Plan
              </Badge>
              {/* Billing hidden — upgrade buttons removed until payment integration is live */}
            </div>
          </div>
        </motion.div>

        {!isPaid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Demo Mode — Limited Access</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have access to demo scans on basic modules only. No full reports, no API access, no scan history.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="history">
              History {mergedHistory.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{mergedHistory.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="custom-rules">Custom Rules</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {MODULES.map((mod, i) => {
                const isAvailable = mod.plans.includes(userPlan);
                const isDemoOnly = mod.plans.includes("free") && !isPaid;
                const isActive = activeModule === mod.id;
                const hasScanUI = ["secrets", "deps", "api", "cloud", "logs", "sast", "ai-review", "cicd", "score", "license"].includes(mod.id);
                return (
                  <motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                    <Card className={`h-full flex flex-col transition-colors cursor-pointer ${isActive ? "border-primary ring-2 ring-primary/20" : !isAvailable ? "opacity-60" : "hover:border-primary/30"}`}
                      onClick={() => { if (isAvailable && hasScanUI) openModule(mod.id); }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <mod.icon className={`h-6 w-6 ${isActive ? "text-primary" : isAvailable ? "text-primary" : "text-muted-foreground"}`} />
                          {!isAvailable ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : isDemoOnly ? (
                            <Badge variant="secondary" className="text-[10px]">Demo</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">Active</Badge>
                          )}
                        </div>
                        <CardTitle className="text-base mt-2">{mod.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 flex-1 flex flex-col">
                        <p className="text-sm text-muted-foreground flex-1">{mod.description}</p>
                        <div className="mt-4">
                          {isAvailable && hasScanUI ? (
                            <Button size="sm" variant={isActive ? "default" : "outline"} className="w-full gap-1.5"
                              onClick={(e) => { e.stopPropagation(); openModule(mod.id); }}>
                              {isActive ? <>Close Scanner <X className="h-3.5 w-3.5" /></> : <>{isDemoOnly ? "Open Demo Scanner" : mod.id === "score" ? "View Score Dashboard" : mod.id === "license" ? "Check Licenses" : "Open Scanner"} <ChevronDown className="h-3.5 w-3.5" /></>}
                            </Button>
                          ) : isAvailable ? (
                            <Button size="sm" variant="outline" className="w-full gap-1.5" disabled>
                              Coming Soon
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="w-full gap-1.5" disabled>
                              <Lock className="h-3.5 w-3.5" /> Not Available
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Scan Panel ── */}
            <div ref={scanPanelRef} />
            <AnimatePresence>
              {activeModule && ["secrets", "deps", "api", "cloud", "logs", "sast", "ai-review", "cicd", "score", "license"].includes(activeModule) && (() => {
                const mod = MODULES.find((m) => m.id === activeModule)!;
                const isDemoOnly = mod.plans.includes("free") && !isPaid;
                const inputCfg = getInputConfig(activeModule);
                return (
                  <motion.div key={activeModule} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-6">
                    <Card className="border-primary/20">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <mod.icon className="h-5 w-5 text-primary" /> {mod.name}
                          </CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => setActiveModule(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {isDemoOnly && (
                          <p className="text-sm text-amber-600 mt-1">Demo mode — click &quot;Run Demo Scan&quot; to see sample results.</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* CI/CD Pipeline Gate — custom input */}
                        {activeModule === "cicd" && (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Scan Type</label>
                              <div className="flex gap-2 flex-wrap">
                                {([["full", "Full Scan (Secrets + Dependencies)"], ["secrets", "Secrets Only"], ["dependencies", "Dependencies Only"]] as const).map(([val, label]) => (
                                  <Button key={val} size="sm" variant={cicdScanType === val ? "default" : "outline"} onClick={() => setCicdScanType(val)} className="text-xs">
                                    {label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            {cicdScanType !== "dependencies" && (
                              <div>
                                <label className="text-sm font-medium mb-2 block">Source Code (for Secrets Scan)</label>
                                <textarea
                                  className="w-full min-h-[150px] rounded-lg border bg-muted/30 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                                  placeholder="Paste your source code, .env files, or config files to scan for hardcoded secrets..."
                                  value={scanInput}
                                  onChange={(e) => setScanInput(e.target.value)}
                                />
                              </div>
                            )}
                            {cicdScanType !== "secrets" && (
                              <div>
                                <label className="text-sm font-medium mb-2 block">Dependency Manifest (for CVE Scan)</label>
                                <textarea
                                  className="w-full min-h-[150px] rounded-lg border bg-muted/30 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                                  placeholder="Paste your package.json, requirements.txt, build.gradle, or go.mod content..."
                                  value={cicdDepsInput}
                                  onChange={(e) => setCicdDepsInput(e.target.value)}
                                />
                              </div>
                            )}
                            <Card className="border-blue-500/20 bg-blue-500/5">
                              <CardContent className="p-4">
                                <p className="text-sm font-medium mb-2 flex items-center gap-2"><GitBranch className="h-4 w-4 text-blue-500" /> CI/CD Integration Snippet</p>
                                <p className="text-xs text-muted-foreground mb-3">Add this to your pipeline to run ShieldX as an automated gate. Failed scans return exit code 1 to break your build.</p>
                                <pre className="text-[11px] bg-muted/80 rounded-lg p-3 font-mono overflow-x-auto whitespace-pre">{`# GitHub Actions
- name: ShieldX Security Gate
  run: |
    RESULT=$(curl -s -X POST https://securecodereviews.com/api/shieldx/ci-scan \\
      -H "Content-Type: application/json" \\
      -H "x-shieldx-api-key: \${{ secrets.SHIELDX_API_KEY }}" \\
      -d '{"scanType":"full","code":"...","dependencies":"..."}'
    )
    echo "$RESULT" | jq .verdict
    exit $(echo "$RESULT" | jq -r '.exitCode')`}</pre>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* SAST Language Selector + Mode Toggle */}
                        {activeModule === "sast" && (
                          <div className="space-y-3">
                            {/* Mode Toggle: Single File vs Project Scan */}
                            <div>
                              <label className="text-sm font-medium mb-2 block">Scan Mode</label>
                              <div className="flex gap-2">
                                <Button size="sm" variant={sastMode === "single" ? "default" : "outline"} onClick={() => { setSastMode("single"); setMultiFiles([]); setSelectedFileIdx(null); setScanResults(null); setScanError(null); }} className="text-xs gap-1.5">
                                  <FileCode className="h-3.5 w-3.5" /> Single File
                                </Button>
                                <Button size="sm" variant={sastMode === "multi" ? "default" : "outline"} onClick={() => { setSastMode("multi"); setScanInput(""); setScanResults(null); setScanError(null); }} className="text-xs gap-1.5">
                                  <Files className="h-3.5 w-3.5" /> Project Scan
                                  <Badge variant="secondary" className="text-[8px] ml-1">NEW</Badge>
                                </Button>
                              </div>
                            </div>

                            {/* Language selector for single-file */}
                            {sastMode === "single" && (
                              <div>
                                <label className="text-sm font-medium mb-2 block">Language</label>
                                <div className="flex gap-2 flex-wrap">
                                  {(["javascript", "typescript", "java", "cpp", "csharp"] as const).map((lang) => {
                                    const labels: Record<string, string> = { javascript: "JavaScript", typescript: "TypeScript", java: "Java", cpp: "C / C++", csharp: "C#" };
                                    return (
                                      <Button key={lang} size="sm" variant={sastLanguage === lang ? "default" : "outline"} onClick={() => { setSastLanguage(lang); setScanInput(""); }} className="text-xs">
                                        {labels[lang]}
                                      </Button>
                                    );
                                  })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1.5">
                                  {sastLanguage === "javascript" || sastLanguage === "typescript"
                                    ? "Full AST parsing with taint tracking and dataflow analysis"
                                    : "Pattern-based analysis with line-by-line taint tracking"}
                                </p>
                              </div>
                            )}

                            {/* Multi-file upload area */}
                            {sastMode === "multi" && (
                              <div className="space-y-3">
                                <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <div>
                                        <p className="text-sm font-medium flex items-center gap-2"><Upload className="h-4 w-4 text-primary" /> Upload Project Files</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">Upload a ZIP archive or select a folder. Code is analyzed in-memory — never stored.</p>
                                      </div>
                                      {multiFiles.length > 0 && (
                                        <Button variant="ghost" size="sm" onClick={() => { setMultiFiles([]); setSelectedFileIdx(null); setScanResults(null); }} className="text-xs gap-1">
                                          <Trash2 className="h-3 w-3" /> Clear
                                        </Button>
                                      )}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                      <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={multiFileLoading} className="gap-1.5 text-xs">
                                        <Upload className="h-3.5 w-3.5" /> Upload ZIP
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => folderInputRef.current?.click()} disabled={multiFileLoading} className="gap-1.5 text-xs">
                                        <FolderOpen className="h-3.5 w-3.5" /> Select Folder
                                      </Button>
                                      {multiFileLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                                    </div>
                                    {/* Hidden file inputs */}
                                    <input ref={fileInputRef} type="file" accept=".zip" className="hidden" onChange={handleZipUpload} />
                                    {/* @ts-expect-error webkitdirectory is a non-standard attribute */}
                                    <input ref={folderInputRef} type="file" webkitdirectory="" multiple className="hidden" onChange={handleFolderUpload} />
                                  </CardContent>
                                </Card>

                                {/* File tree */}
                                {multiFiles.length > 0 && (
                                  <Card>
                                    <CardContent className="p-3">
                                      <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-medium text-muted-foreground">{multiFiles.length} files • {multiFileTotalLines.toLocaleString()} lines • {(multiFileTotalSize / 1024).toFixed(0)}KB</p>
                                        <Badge variant="secondary" className="text-[9px]">Auto-detected languages</Badge>
                                      </div>
                                      <div className="max-h-[200px] overflow-y-auto space-y-0.5">
                                        {multiFiles.map((f, idx) => {
                                          const ext = f.path.slice(f.path.lastIndexOf("."));
                                          const langLabel: Record<string, string> = { ".js": "JS", ".jsx": "JSX", ".ts": "TS", ".tsx": "TSX", ".java": "Java", ".cpp": "C++", ".c": "C", ".h": "H", ".cs": "C#", ".cc": "C++", ".hpp": "H++" };
                                          return (
                                            <div
                                              key={idx}
                                              className={`flex items-center gap-2 text-xs py-1 px-2 rounded cursor-pointer hover:bg-muted/50 ${selectedFileIdx === idx ? "bg-primary/10 border border-primary/20" : ""}`}
                                              onClick={() => setSelectedFileIdx(idx)}
                                            >
                                              <FileCode className="h-3 w-3 text-muted-foreground shrink-0" />
                                              <span className="truncate flex-1 font-mono">{f.path}</span>
                                              <Badge variant="outline" className="text-[8px] shrink-0">{langLabel[ext] || ext}</Badge>
                                              <span className="text-[10px] text-muted-foreground shrink-0">{f.content.split("\n").length} lines</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {/* Selected file preview */}
                                {selectedFileIdx !== null && multiFiles[selectedFileIdx] && (
                                  <div className="relative flex rounded-lg border bg-muted/30 min-h-[120px] max-h-[250px] overflow-auto">
                                    <div className="select-none text-right pr-3 pl-3 pt-3 pb-3 font-mono text-xs text-muted-foreground/60 border-r bg-muted/40 shrink-0 leading-[1.625]" aria-hidden="true">
                                      {multiFiles[selectedFileIdx].content.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
                                    </div>
                                    <pre className="w-full p-3 font-mono text-[11px] whitespace-pre overflow-x-auto leading-[1.625]">{multiFiles[selectedFileIdx].content}</pre>
                                  </div>
                                )}

                                <Card className="border-blue-500/20 bg-blue-500/5">
                                  <CardContent className="p-3">
                                    <p className="text-[11px] text-blue-700 dark:text-blue-400 flex items-start gap-1.5">
                                      <Lock className="h-3 w-3 shrink-0 mt-0.5" />
                                      <span><strong>Zero Storage Guarantee:</strong> Your code is transmitted over HTTPS, analyzed in server memory, and immediately discarded. Nothing is saved to disk, database, or logs. We never see or store your source code.</span>
                                    </p>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </div>
                        )}

                        {/* AI Security Review Language Selector */}
                        {activeModule === "ai-review" && (
                          <div className="space-y-3">
                            <Card className="border-primary/20 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                              <CardContent className="p-4 flex items-start gap-3">
                                <Sparkles className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold">AI-Powered Deep Security Review</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Goes beyond pattern matching. Finds business logic flaws, missing auth checks, IDOR, race conditions, and vulnerabilities that SAST tools cannot detect.
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Language</label>
                              <div className="flex gap-2 flex-wrap">
                                {["javascript", "typescript", "python", "java", "go", "rust", "csharp", "cpp"].map((lang) => {
                                  const labels: Record<string, string> = { javascript: "JavaScript", typescript: "TypeScript", python: "Python", java: "Java", go: "Go", rust: "Rust", csharp: "C#", cpp: "C++" };
                                  return (
                                    <Button key={lang} size="sm" variant={aiReviewLanguage === lang ? "default" : "outline"} onClick={() => setAiReviewLanguage(lang)} className="text-xs">
                                      {labels[lang] || lang}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Standard module input area */}
                        {activeModule !== "cicd" && activeModule !== "score" && !isDemoOnly && !(activeModule === "sast" && sastMode === "multi") && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">{inputCfg.label}</label>
                            {inputCfg.type === "textarea" ? (
                              activeModule === "sast" ? (
                                <div className="relative flex rounded-lg border bg-muted/30 focus-within:ring-2 focus-within:ring-primary/40 min-h-[200px] max-h-[500px] overflow-auto resize-y">
                                  {/* Line numbers gutter */}
                                  <div
                                    className="select-none text-right pr-3 pl-3 pt-4 pb-4 font-mono text-xs text-muted-foreground/60 border-r bg-muted/40 shrink-0 leading-[1.625]"
                                    aria-hidden="true"
                                  >
                                    {(scanInput || "\n").split("\n").map((_, i) => (
                                      <div key={i}>{i + 1}</div>
                                    ))}
                                  </div>
                                  {/* Code textarea */}
                                  <textarea
                                    className="w-full min-h-[200px] bg-transparent p-4 font-mono text-sm focus:outline-none resize-none leading-[1.625]"
                                    placeholder={inputCfg.placeholder}
                                    value={scanInput}
                                    onChange={(e) => setScanInput(e.target.value)}
                                    spellCheck={false}
                                  />
                                </div>
                              ) : (
                              <textarea
                                className="w-full min-h-[200px] rounded-lg border bg-muted/30 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                                placeholder={inputCfg.placeholder}
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                              />
                              )
                            ) : (
                              <input
                                type="url"
                                className="w-full rounded-lg border bg-muted/30 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                placeholder={inputCfg.placeholder}
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                              />
                            )}
                          </div>
                        )}

                        {/* Security Score Dashboard */}
                        {activeModule === "score" && (() => {
                          // Merge DB history + session scans, deduplicate by _id
                          const moduleTypes = ["secrets", "deps", "api", "cloud", "logs", "sast", "ai-review", "cicd"];
                          const byModule = moduleTypes.map((type) => {
                            const scans = mergedHistory.filter((s) => s.scanType === type);
                            const latest = scans[0]; // already sorted by date desc
                            const avg = scans.length > 0 ? scans.reduce((a, s) => a + s.overallScore, 0) / scans.length : null;
                            return { type, name: MODULES.find((m) => m.id === type)?.name || type, scans: scans.length, latest, avg };
                          }).filter((m) => m.scans > 0);

                          const allScores = mergedHistory.map((s) => s.overallScore);
                          const compositeScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null;
                          const totalFindings = mergedHistory.reduce((a, s) => a + s.counts.findingsTotal, 0);
                          const totalCritical = mergedHistory.reduce((a, s) => a + s.counts.critical, 0);
                          const totalHigh = mergedHistory.reduce((a, s) => a + s.counts.high, 0);
                          const totalMedium = mergedHistory.reduce((a, s) => a + s.counts.medium, 0);
                          const totalLow = mergedHistory.reduce((a, s) => a + s.counts.low, 0);

                          // Trend: compare first half vs second half of scans
                          let trend: "improving" | "declining" | "stable" | "none" = "none";
                          if (allScores.length >= 4) {
                            const mid = Math.floor(allScores.length / 2);
                            const olderAvg = allScores.slice(mid).reduce((a, b) => a + b, 0) / (allScores.length - mid);
                            const newerAvg = allScores.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
                            if (newerAvg - olderAvg > 0.5) trend = "improving";
                            else if (olderAvg - newerAvg > 0.5) trend = "declining";
                            else trend = "stable";
                          }

                          const scoreColor = (s: number) => s >= 7 ? "text-emerald-500" : s >= 4 ? "text-amber-500" : "text-red-500";
                          const scoreBg = (s: number) => s >= 7 ? "border-emerald-500/20 bg-emerald-500/5" : s >= 4 ? "border-amber-500/20 bg-amber-500/5" : "border-red-500/20 bg-red-500/5";

                          if (mergedHistory.length === 0) {
                            return (
                              <div className="text-center py-8">
                                <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm font-medium">No scan data yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Run your first scan using any module above. Your security score will be calculated from real scan results.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-6">
                              {/* Composite Score */}
                              <div className="flex items-center gap-6">
                                <div className={`rounded-2xl border-2 p-6 text-center min-w-[120px] ${scoreBg(compositeScore!)}`}>
                                  <div className={`text-4xl font-extrabold ${scoreColor(compositeScore!)}`}>{compositeScore!.toFixed(1)}</div>
                                  <div className="text-xs text-muted-foreground mt-1 font-medium">out of 10</div>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <h3 className="text-lg font-semibold">Composite Security Score</h3>
                                  <p className="text-sm text-muted-foreground">Weighted average across {mergedHistory.length} scan{mergedHistory.length !== 1 ? "s" : ""} from {byModule.length} module{byModule.length !== 1 ? "s" : ""}.</p>
                                  {trend !== "none" && (
                                    <div className={`flex items-center gap-1.5 text-sm ${trend === "improving" ? "text-emerald-600" : trend === "declining" ? "text-red-600" : "text-muted-foreground"}`}>
                                      <TrendingUp className={`h-4 w-4 ${trend === "declining" ? "rotate-180" : ""}`} />
                                      {trend === "improving" ? "Score is improving" : trend === "declining" ? "Score is declining" : "Score is stable"}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Severity Breakdown */}
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <div className="rounded-lg border p-3 text-center">
                                  <div className="text-2xl font-bold">{totalFindings}</div>
                                  <div className="text-xs text-muted-foreground">Total Findings</div>
                                </div>
                                <div className="rounded-lg border p-3 text-center border-red-500/20">
                                  <div className="text-2xl font-bold text-red-500">{totalCritical}</div>
                                  <div className="text-xs text-muted-foreground">Critical</div>
                                </div>
                                <div className="rounded-lg border p-3 text-center border-orange-500/20">
                                  <div className="text-2xl font-bold text-orange-500">{totalHigh}</div>
                                  <div className="text-xs text-muted-foreground">High</div>
                                </div>
                                <div className="rounded-lg border p-3 text-center border-amber-500/20">
                                  <div className="text-2xl font-bold text-amber-500">{totalMedium}</div>
                                  <div className="text-xs text-muted-foreground">Medium</div>
                                </div>
                                <div className="rounded-lg border p-3 text-center border-blue-500/20">
                                  <div className="text-2xl font-bold text-blue-500">{totalLow}</div>
                                  <div className="text-xs text-muted-foreground">Low</div>
                                </div>
                              </div>

                              {/* Per-Module Breakdown */}
                              <div>
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Score by Module</h4>
                                <div className="space-y-2">
                                  {byModule.map((m) => {
                                    const ModIcon = MODULES.find((mod) => mod.id === m.type)?.icon || Shield;
                                    return (
                                      <div key={m.type} className="flex items-center justify-between border rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <ModIcon className="h-4 w-4 text-primary shrink-0" />
                                          <div className="min-w-0">
                                            <span className="text-sm font-medium block">{m.name}</span>
                                            <span className="text-xs text-muted-foreground">{m.scans} scan{m.scans !== 1 ? "s" : ""} • Last: {m.latest ? new Date(m.latest.createdAt).toLocaleDateString() : "—"}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                          {m.latest && (
                                            <div className="text-right">
                                              <div className={`text-sm font-bold ${scoreColor(m.latest.overallScore)}`}>{m.latest.overallScore.toFixed(1)}</div>
                                              <div className="text-[10px] text-muted-foreground">latest</div>
                                            </div>
                                          )}
                                          {m.avg !== null && m.scans > 1 && (
                                            <div className="text-right">
                                              <div className="text-sm font-medium text-muted-foreground">{m.avg.toFixed(1)}</div>
                                              <div className="text-[10px] text-muted-foreground">avg</div>
                                            </div>
                                          )}
                                          {m.latest && m.latest.counts.findingsTotal > 0 && (
                                            <Badge variant={m.latest.counts.critical > 0 ? "destructive" : "secondary"} className="text-[10px]">
                                              {m.latest.counts.findingsTotal} findings
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground">Score is calculated from real scan history data. Run more scans across modules for a comprehensive assessment.</p>
                            </div>
                          );
                        })()}

                        {/* License Compliance Scanner UI */}
                        {activeModule === "license" && (
                          <div className="space-y-5">
                            <Card className="border-primary/20 bg-primary/5">
                              <CardContent className="p-6 text-center space-y-3">
                                <FileText className="h-8 w-8 text-primary mx-auto" />
                                <h4 className="text-lg font-semibold">License Compliance Scanner</h4>
                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                  Paste your <code>package.json</code> or <code>requirements.txt</code> below. We detect copyleft licenses (GPL, AGPL, LGPL) and dual-license ambiguity that can block acquisitions or open-source compliance audits.
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        <div className="flex gap-3">
                          {activeModule !== "score" && (
                          <Button onClick={runScan} disabled={scanning || (activeModule === "cicd" ? (cicdScanType !== "dependencies" && !scanInput.trim() && cicdScanType !== "secrets") || (cicdScanType !== "secrets" && !cicdDepsInput.trim() && cicdScanType !== "dependencies") : (!isDemoOnly && !scanInput.trim() && !(activeModule === "sast" && sastMode === "multi" && multiFiles.length > 0)))} className="gap-2">
                            {scanning ? <><Loader2 className="h-4 w-4 animate-spin" /> Scanning...</> : <><Search className="h-4 w-4" /> {isDemoOnly ? "Run Demo Scan" : activeModule === "cicd" ? "Run Pipeline Gate" : activeModule === "license" ? "Check Licenses" : "Run Scan"}</>}
                          </Button>
                          )}
                          {scanResults && (
                            <Button variant="outline" onClick={() => { setScanResults(null); setScanError(null); setAiFixResults({}); setAiSummary(null); }} className="gap-1.5">
                              Clear Results
                            </Button>
                          )}
                        </div>

                        {scanError && (
                          <Card className="border-red-500/30 bg-red-500/5">
                            <CardContent className="p-4 flex items-start gap-3">
                              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                              <p className="text-sm text-red-600">{scanError}</p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Results */}
                        {scanResults && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Scan tracked — view in <strong>History</strong> & <strong>Overview</strong> tabs</span>
                            </div>
                            {/* Secrets results */}
                            {activeModule === "secrets" && (
                              <>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                                    <div className="rounded-lg border p-3 text-center">
                                      <div className="text-2xl font-bold">{scanResults.stats?.total || 0}</div>
                                      <div className="text-xs text-muted-foreground">Total Findings</div>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center border-red-500/20">
                                      <div className="text-2xl font-bold text-red-500">{scanResults.stats?.high || 0}</div>
                                      <div className="text-xs text-muted-foreground">High</div>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center border-amber-500/20">
                                      <div className="text-2xl font-bold text-amber-500">{scanResults.stats?.medium || 0}</div>
                                      <div className="text-xs text-muted-foreground">Medium</div>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center">
                                      <div className="text-2xl font-bold text-blue-500">{scanResults.stats?.low || 0}</div>
                                      <div className="text-xs text-muted-foreground">Low</div>
                                    </div>
                                  </div>
                                  {(scanResults.stats?.total || 0) > 0 && (
                                    <Card className="p-3 shrink-0">
                                      <SeverityPieChart stats={{ ...scanResults.stats, critical: 0 }} />
                                    </Card>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{scanResults.patternsChecked} patterns checked across {scanResults.totalLines} lines • {scanResults.mode} mode</p>
                                {scanResults.findings?.length > 0 ? (
                                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {scanResults.findings.map((f: any, idx: number) => (
                                      <Card key={idx} className={`${f.confidence === "high" ? "border-red-500/30" : f.confidence === "medium" ? "border-amber-500/30" : "border-blue-500/30"}`}>
                                        <CardContent className="p-4">
                                          <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <Badge variant={f.confidence === "high" ? "destructive" : "secondary"} className="text-[10px] capitalize">{f.confidence}</Badge>
                                              {f.priority && <Badge variant="outline" className={`text-[9px] ${f.priority === "CRITICAL" ? "border-red-500 text-red-500" : f.priority === "HIGH" ? "border-orange-500 text-orange-500" : f.priority === "MEDIUM" ? "border-amber-500 text-amber-500" : "border-blue-500 text-blue-500"}`}>{f.priority}</Badge>}
                                              <span className="font-medium text-sm">{f.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                              {f.riskScore > 0 && <span className="text-[10px] text-muted-foreground">Risk: {f.riskScore}/100</span>}
                                              <span className="text-xs text-muted-foreground">Line {f.line}, Col {f.column}</span>
                                            </div>
                                          </div>
                                          <code className="block text-xs bg-muted/50 rounded p-2 font-mono break-all">{f.matchPreview}</code>
                                          {f.fix && (
                                            <div className="mt-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                                              <p className="text-xs font-medium text-emerald-700 mb-1">🔧 Fix:</p>
                                              <p className="text-xs text-emerald-600">{f.fix}</p>
                                              {f.fixCommand && <code className="block text-xs font-mono bg-muted/50 rounded px-2 py-1 mt-1 break-all">{f.fixCommand}</code>}
                                              {f.codeExample && <pre className="text-xs font-mono bg-muted/50 rounded px-2 py-1 mt-1 overflow-x-auto whitespace-pre-wrap">{f.codeExample}</pre>}
                                              <div className="flex items-center gap-2 mt-1">
                                                {f.effort && <Badge variant="secondary" className={`text-[9px] ${f.effort === "low" ? "bg-emerald-100 text-emerald-700" : f.effort === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>Effort: {f.effort}</Badge>}
                                              </div>
                                            </div>
                                          )}
                                          {!f.fix && <p className="text-xs text-emerald-600 mt-2 flex items-start gap-1"><CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" /> {f.remediation}</p>}
                                          {f.compliance?.length > 0 && (
                                            <div className="flex gap-1 mt-2 flex-wrap">
                                              {f.compliance.map((c: string, ci: number) => (
                                                <Badge key={ci} variant="outline" className="text-[8px] font-normal">{c}</Badge>
                                              ))}
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                                    <CardContent className="p-4 flex items-center gap-3">
                                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                      <p className="text-sm font-medium text-emerald-700">No secrets detected — your code looks clean!</p>
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            )}

                            {/* Dependency results */}
                            {activeModule === "deps" && (
                              <>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1">
                                    <div className="rounded-lg border p-3 text-center">
                                      <div className="text-2xl font-bold">{scanResults.totalDeps || 0}</div>
                                      <div className="text-xs text-muted-foreground">Dependencies</div>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center border-red-500/20">
                                      <div className="text-2xl font-bold text-red-500">{scanResults.stats?.critical || 0}</div>
                                      <div className="text-xs text-muted-foreground">Critical</div>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center border-orange-500/20">
                                      <div className="text-2xl font-bold text-orange-500">{scanResults.stats?.high || 0}</div>
                                      <div className="text-xs text-muted-foreground">High</div>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center border-amber-500/20">
                                      <div className="text-2xl font-bold text-amber-500">{scanResults.stats?.medium || 0}</div>
                                      <div className="text-xs text-muted-foreground">Medium</div>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center">
                                      <div className="text-2xl font-bold text-blue-500">{scanResults.stats?.low || 0}</div>
                                      <div className="text-xs text-muted-foreground">Low</div>
                                    </div>
                                  </div>
                                  {((scanResults.stats?.critical || 0) + (scanResults.stats?.high || 0) + (scanResults.stats?.medium || 0) + (scanResults.stats?.low || 0)) > 0 && (
                                    <Card className="p-3 shrink-0">
                                      <SeverityPieChart stats={scanResults.stats} />
                                    </Card>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">Ecosystem: {scanResults.ecosystem || "npm"} • {scanResults.mode} mode</p>
                                {scanResults.scanWarning && (
                                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                                    <p className="text-[11px] text-amber-700 dark:text-amber-400">⚠️ {scanResults.scanWarning}</p>
                                  </div>
                                )}
                                {scanResults.vulnerabilities?.length > 0 ? (
                                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {/* Consolidated upgrade recommendations */}
                                    {scanResults.recommendedUpgrades?.length > 0 && (
                                      <Card className="border-blue-500/30 bg-blue-500/5">
                                        <CardContent className="p-4">
                                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">📦 Recommended Upgrades (covers all CVEs per package)</p>
                                          <div className="space-y-1.5">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {scanResults.recommendedUpgrades.map((u: any, ui: number) => (
                                              <div key={ui} className="flex items-center justify-between text-xs">
                                                <span className="font-mono">{u.package}@{u.currentVersion} → <span className="text-emerald-600 font-semibold">{u.upgradeToAtLeast}</span></span>
                                                <span className="text-muted-foreground">{u.coversVulnerabilities} CVE{u.coversVulnerabilities > 1 ? "s" : ""}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {scanResults.vulnerabilities.map((v: any, idx: number) => (
                                      <Card key={idx} className={`${v.severity === "critical" ? "border-red-500/30" : v.severity === "high" ? "border-orange-500/30" : "border-amber-500/30"}`}>
                                        <CardContent className="p-4">
                                          <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <Badge variant={v.severity === "critical" ? "destructive" : "secondary"} className="text-[10px] capitalize">{v.severity}</Badge>
                                              {v.priority && <Badge variant="outline" className={`text-[9px] ${v.priority === "CRITICAL" ? "border-red-500 text-red-500" : v.priority === "HIGH" ? "border-orange-500 text-orange-500" : "border-amber-500 text-amber-500"}`}>{v.priority}</Badge>}
                                              <span className="font-medium text-sm">{v.package}@{v.version}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                              {v.riskScore > 0 && <span className="text-[10px] text-muted-foreground">Risk: {v.riskScore}/100</span>}
                                              <span className="text-xs font-mono text-muted-foreground">{v.id}</span>
                                            </div>
                                          </div>
                                          <p className="text-sm text-muted-foreground">{v.summary}</p>
                                          {v.fixedIn && (
                                            <div className="mt-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2.5">
                                              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">🔧 Fix Available</p>
                                              {v.fixCommand && (
                                                <code className="block text-xs font-mono bg-muted/50 rounded px-2 py-1 mb-1 break-all">{v.fixCommand}</code>
                                              )}
                                              <p className="text-xs text-emerald-600">Upgrade to {v.fixedIn}</p>
                                              {v.effort && (
                                                <Badge variant="secondary" className={`text-[9px] mt-1 ${v.effort === "low" ? "bg-emerald-100 text-emerald-700" : v.effort === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                                                  Effort: {v.effort}
                                                </Badge>
                                              )}
                                            </div>
                                          )}
                                          {!v.fixedIn && v.fix && (
                                            <div className="mt-2 rounded-md bg-amber-500/10 border border-amber-500/20 p-2.5">
                                              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ No Fix Version</p>
                                              <p className="text-xs text-amber-600">{v.fix}</p>
                                            </div>
                                          )}
                                          {!v.fixedIn && !v.fix && (
                                            <p className="text-xs text-amber-600 mt-2 flex items-start gap-1">
                                              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" /> No fix version available — check advisory for workarounds
                                            </p>
                                          )}
                                          {v.compliance?.length > 0 && (
                                            <div className="flex gap-1 mt-2 flex-wrap">
                                              {v.compliance.map((c: string, ci: number) => (
                                                <Badge key={ci} variant="outline" className="text-[8px] font-normal">{c}</Badge>
                                              ))}
                                            </div>
                                          )}
                                          {v.references?.length > 0 && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                              {v.references.slice(0, 2).map((ref: string, ri: number) => (
                                                <a key={ri} href={ref} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Reference →</a>
                                              ))}
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <Card className={`${scanResults.errors?.length > 0 ? "border-amber-500/30 bg-amber-500/5" : "border-emerald-500/30 bg-emerald-500/5"}`}>
                                    <CardContent className="p-4">
                                      {scanResults.errors?.length > 0 ? (
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                                            <p className="text-sm font-medium text-amber-700">No vulnerabilities found, but {scanResults.errors.length} package(s) could not be checked due to API errors.</p>
                                          </div>
                                          <p className="text-xs text-amber-600 ml-8">Packages that failed to scan may still have vulnerabilities. Try scanning again later.</p>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-3">
                                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                          <p className="text-sm font-medium text-emerald-700">No known vulnerabilities found in your dependencies!</p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            )}

                            {/* API Security results */}
                            {activeModule === "api" && (
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className={`text-2xl font-bold ${(scanResults.score || 0) >= 7 ? "text-emerald-500" : (scanResults.score || 0) >= 4 ? "text-amber-500" : "text-red-500"}`}>
                                      {scanResults.score?.toFixed(1) || "—"}/10
                                    </div>
                                    <div className="text-xs text-muted-foreground">Security Score</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className="text-2xl font-bold">{scanResults.status || "—"}</div>
                                    <div className="text-xs text-muted-foreground">HTTP Status</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className="text-2xl font-bold">{scanResults.owaspCoverage?.length || 0}</div>
                                    <div className="text-xs text-muted-foreground">OWASP Checks</div>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">URL: {scanResults.url} • {scanResults.mode} mode</p>
                                {scanResults.headers?.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">Security Headers</h4>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                      {scanResults.headers.map((h: any, idx: number) => (
                                        <div key={idx} className="text-sm border rounded-lg px-3 py-2">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              {h.status === "pass" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : h.status === "warn" ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                              <span className="font-mono text-xs">{h.name}</span>
                                              {h.priority && <Badge variant="outline" className={`text-[8px] ${h.priority === "CRITICAL" ? "border-red-500 text-red-500" : h.priority === "HIGH" ? "border-orange-500 text-orange-500" : "border-amber-500 text-amber-500"}`}>{h.priority}</Badge>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {h.riskScore > 0 && <span className="text-[10px] text-muted-foreground">Risk: {h.riskScore}/100</span>}
                                              <span className="text-xs text-muted-foreground max-w-[200px] truncate">{h.message}</span>
                                            </div>
                                          </div>
                                          {h.fix && (
                                            <div className="mt-2 ml-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2">
                                              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">🔧 Fix:</p>
                                              {h.fixCommand && <code className="block text-[11px] font-mono bg-muted/50 rounded px-2 py-1 mt-0.5 break-all">{h.fixCommand}</code>}
                                              {h.codeExample && <pre className="text-[11px] font-mono bg-muted/50 rounded px-2 py-1 mt-1 overflow-x-auto whitespace-pre-wrap">{h.codeExample}</pre>}
                                              {!h.fixCommand && !h.codeExample && <code className="block text-[11px] font-mono break-all mt-0.5">{h.fix}</code>}
                                              {h.effort && <Badge variant="secondary" className={`text-[8px] mt-1 ${h.effort === "low" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>Effort: {h.effort}</Badge>}
                                            </div>
                                          )}
                                          {h.compliance?.length > 0 && (
                                            <div className="flex gap-1 mt-1.5 ml-6 flex-wrap">
                                              {h.compliance.map((c: string, ci: number) => (
                                                <Badge key={ci} variant="outline" className="text-[8px] font-normal">{c}</Badge>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {scanResults.apiChecks?.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">OWASP API Top 10 Checks</h4>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                      {scanResults.apiChecks.map((c: any, idx: number) => (
                                        <div key={idx} className="text-sm border rounded-lg px-3 py-2">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                              {c.status === "pass" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : c.status === "warn" ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                              <span className="text-xs">{c.name}</span>
                                              {c.owasp && <Badge variant="secondary" className="text-[8px]">{c.owasp}</Badge>}
                                              {c.priority && <Badge variant="outline" className={`text-[8px] ${c.priority === "CRITICAL" ? "border-red-500 text-red-500" : c.priority === "HIGH" ? "border-orange-500 text-orange-500" : "border-amber-500 text-amber-500"}`}>{c.priority}</Badge>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {c.riskScore > 0 && <span className="text-[10px] text-muted-foreground">Risk: {c.riskScore}/100</span>}
                                              <span className="text-xs text-muted-foreground max-w-[200px] truncate">{c.detail}</span>
                                            </div>
                                          </div>
                                          {c.fix && (
                                            <div className="mt-2 ml-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2">
                                              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">🔧 Fix:</p>
                                              {c.fixCommand && <code className="block text-[11px] font-mono bg-muted/50 rounded px-2 py-1 mt-0.5 break-all">{c.fixCommand}</code>}
                                              {c.codeExample && <pre className="text-[11px] font-mono bg-muted/50 rounded px-2 py-1 mt-1 overflow-x-auto whitespace-pre-wrap">{c.codeExample}</pre>}
                                              {!c.fixCommand && !c.codeExample && <p className="text-[11px] break-all mt-0.5">{c.fix}</p>}
                                              {c.effort && <Badge variant="secondary" className={`text-[8px] mt-1 ${c.effort === "low" ? "bg-emerald-100 text-emerald-700" : c.effort === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>Effort: {c.effort}</Badge>}
                                            </div>
                                          )}
                                          {c.compliance?.length > 0 && (
                                            <div className="flex gap-1 mt-1.5 ml-6 flex-wrap">
                                              {c.compliance.map((comp: string, ci: number) => (
                                                <Badge key={ci} variant="outline" className="text-[8px] font-normal">{comp}</Badge>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Logs Analyzer results */}
                            {activeModule === "logs" && (
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className="text-2xl font-bold">{scanResults.stats?.total || 0}</div>
                                    <div className="text-xs text-muted-foreground">Threats Found</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-red-500/20">
                                    <div className="text-2xl font-bold text-red-500">{scanResults.stats?.critical || 0}</div>
                                    <div className="text-xs text-muted-foreground">Critical</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-orange-500/20">
                                    <div className="text-2xl font-bold text-orange-500">{scanResults.stats?.high || 0}</div>
                                    <div className="text-xs text-muted-foreground">High</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-amber-500/20">
                                    <div className="text-2xl font-bold text-amber-500">{scanResults.stats?.medium || 0}</div>
                                    <div className="text-xs text-muted-foreground">Medium</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-500">{scanResults.stats?.low || 0}</div>
                                    <div className="text-xs text-muted-foreground">Low</div>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{scanResults.patternsChecked} threat patterns checked across {scanResults.totalLines} log lines • {scanResults.mode} mode</p>
                                {scanResults.findings?.length > 0 ? (
                                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {scanResults.findings.map((f: any, idx: number) => (
                                      <Card key={idx} className={`${f.severity === "critical" ? "border-red-500/30" : f.severity === "high" ? "border-orange-500/30" : f.severity === "medium" ? "border-amber-500/30" : "border-blue-500/30"}`}>
                                        <CardContent className="p-4">
                                          <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <Badge variant={f.severity === "critical" ? "destructive" : "secondary"} className="text-[10px] capitalize">{f.severity}</Badge>
                                              {f.priority && <Badge variant="outline" className={`text-[9px] ${f.priority === "CRITICAL" ? "border-red-500 text-red-500" : f.priority === "HIGH" ? "border-orange-500 text-orange-500" : "border-amber-500 text-amber-500"}`}>{f.priority}</Badge>}
                                              <span className="font-medium text-sm">{f.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                              {f.riskScore > 0 && <span className="text-[10px] text-muted-foreground">Risk: {f.riskScore}/100</span>}
                                              <Badge variant="secondary" className="text-[10px]">{f.category}</Badge>
                                            </div>
                                          </div>
                                          <p className="text-sm text-muted-foreground mb-2">{f.detail}</p>
                                          <div className="text-xs text-muted-foreground mb-2">{f.count} occurrence(s)</div>
                                          {f.evidence?.length > 0 && (
                                            <div className="bg-muted/50 rounded p-2 space-y-1 max-h-[120px] overflow-y-auto">
                                              {f.evidence.slice(0, 3).map((e: string, ei: number) => (
                                                <code key={ei} className="block text-[11px] font-mono break-all">{e}</code>
                                              ))}
                                            </div>
                                          )}
                                          {f.fix ? (
                                            <div className="mt-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                                              <p className="text-xs font-medium text-emerald-700 mb-1">🔧 Fix:</p>
                                              <p className="text-xs text-emerald-600">{f.fix}</p>
                                              {f.fixCommand && <code className="block text-xs font-mono bg-muted/50 rounded px-2 py-1 mt-1 break-all">{f.fixCommand}</code>}
                                              {f.codeExample && <pre className="text-xs font-mono bg-muted/50 rounded px-2 py-1 mt-1 overflow-x-auto whitespace-pre-wrap">{f.codeExample}</pre>}
                                              {f.effort && <Badge variant="secondary" className={`text-[9px] mt-1 ${f.effort === "low" ? "bg-emerald-100 text-emerald-700" : f.effort === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>Effort: {f.effort}</Badge>}
                                            </div>
                                          ) : (
                                            <p className="text-xs text-emerald-600 mt-2 flex items-start gap-1"><CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" /> {f.remediation}</p>
                                          )}
                                          {f.compliance?.length > 0 && (
                                            <div className="flex gap-1 mt-2 flex-wrap">
                                              {f.compliance.map((c: string, ci: number) => (
                                                <Badge key={ci} variant="outline" className="text-[8px] font-normal">{c}</Badge>
                                              ))}
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                                    <CardContent className="p-4 flex items-center gap-3">
                                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                      <p className="text-sm font-medium text-emerald-700">No threats detected — your logs look clean!</p>
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            )}

                            {/* Cloud Security results */}
                            {activeModule === "cloud" && (
                              <>
                                {/* Analysis Note */}
                                {scanResults.summary?.analysisNote && (
                                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
                                    <p className="text-[11px] text-blue-700 dark:text-blue-400">ℹ️ {scanResults.summary.analysisNote}</p>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className={`text-2xl font-bold ${(scanResults.score || 0) >= 7 ? "text-emerald-500" : (scanResults.score || 0) >= 4 ? "text-amber-500" : "text-red-500"}`}>
                                      {scanResults.score?.toFixed(1) || "—"}/10
                                    </div>
                                    <div className="text-xs text-muted-foreground">Security Score</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-emerald-500/20">
                                    <div className="text-2xl font-bold text-emerald-500">{scanResults.stats?.passed || 0}</div>
                                    <div className="text-xs text-muted-foreground">Passed</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-red-500/20">
                                    <div className="text-2xl font-bold text-red-500">{scanResults.stats?.failed || 0}</div>
                                    <div className="text-xs text-muted-foreground">Confirmed Issues</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-amber-500/20">
                                    <div className="text-2xl font-bold text-amber-500">{scanResults.stats?.warnings || 0}</div>
                                    <div className="text-xs text-muted-foreground">Unverified</div>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{scanResults.checksPerformed} checks performed • {scanResults.mode} mode</p>

                                {/* Fix First — prioritized critical summary */}
                                {scanResults.summary?.fixFirst?.length > 0 && (
                                  <div className="rounded-lg border-2 border-red-500/30 bg-red-500/5 p-3 space-y-2">
                                    <h4 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">🚨 Fix These First ({scanResults.summary.fixFirst.length} confirmed issue{scanResults.summary.fixFirst.length > 1 ? "s" : ""})</h4>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {scanResults.summary.fixFirst.map((f: any, idx: number) => (
                                      <div key={idx} className="text-sm border border-red-500/20 rounded-md px-3 py-2 bg-background">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium">{f.name}</span>
                                          <div className="flex gap-1.5">
                                            <Badge variant="secondary" className="text-[8px]">{f.category}</Badge>
                                            <Badge variant="destructive" className="text-[8px] capitalize">{f.severity}</Badge>
                                          </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{f.detail}</p>
                                        {f.fix && (
                                          <div className="mt-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 p-2">
                                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">⚡ Quick Fix:</p>
                                            <code className="block text-[11px] font-mono break-all mt-0.5">{f.fix}</code>
                                            {f.effort && <Badge variant="secondary" className={`text-[8px] mt-1 ${f.effort === "low" ? "bg-emerald-100 text-emerald-700" : f.effort === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>Effort: {f.effort}</Badge>}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {scanResults.checks?.length > 0 && (
                                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {scanResults.checks.map((c: any, idx: number) => (
                                      <div key={idx} className={`text-sm border rounded-lg px-3 py-2 ${c.status === "fail" ? "border-red-500/20 bg-red-500/5" : c.status === "warn" ? "border-amber-500/20 bg-amber-500/5" : ""}`}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2 min-w-0">
                                            {c.status === "pass" ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : c.status === "warn" ? <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                                            <div className="min-w-0">
                                              <span className="text-xs font-medium block">{c.name}</span>
                                              <span className="text-xs text-muted-foreground block truncate">{c.detail}</span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            {c.confidence && <Badge variant="outline" className={`text-[8px] ${c.confidence === "high" ? "border-emerald-500 text-emerald-600" : c.confidence === "low" ? "border-slate-400 text-slate-500" : "border-amber-500 text-amber-600"}`}>{c.confidence} conf.</Badge>}
                                            {c.riskScore > 0 && <span className="text-[10px] text-muted-foreground">Risk: {c.riskScore}/100</span>}
                                            {c.priority && <Badge variant="outline" className={`text-[8px] ${c.priority === "CRITICAL" ? "border-red-500 text-red-500" : c.priority === "HIGH" ? "border-orange-500 text-orange-500" : "border-amber-500 text-amber-500"}`}>{c.priority}</Badge>}
                                            <Badge variant="secondary" className="text-[8px]">{c.category}</Badge>
                                            <Badge variant={c.severity === "critical" ? "destructive" : "secondary"} className="text-[8px] capitalize">{c.severity}</Badge>
                                          </div>
                                        </div>
                                        {c.fix && (
                                          <div className="mt-2 ml-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2">
                                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">⚡ Quick Fix:</p>
                                            <code className="block text-[11px] font-mono break-all mt-0.5">{c.fix}</code>
                                            {c.effort && <Badge variant="secondary" className={`text-[8px] mt-1 ${c.effort === "low" ? "bg-emerald-100 text-emerald-700" : c.effort === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>Effort: {c.effort}</Badge>}
                                          </div>
                                        )}
                                        {c.compliance?.length > 0 && (
                                          <div className="flex gap-1 mt-1.5 ml-6 flex-wrap">
                                            {c.compliance.map((comp: string, ci: number) => (
                                              <Badge key={ci} variant="outline" className="text-[8px] font-normal">{comp}</Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}

                            {/* SAST Code Analysis results */}
                            {activeModule === "sast" && (
                              <>
                                {/* Differentiator banner */}
                                <Card className="border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
                                  <CardContent className="p-4">
                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                                      <ShieldCheck className="h-3.5 w-3.5" /> How ShieldX Differs From Other SAST Tools
                                    </p>
                                    <div className="grid sm:grid-cols-4 gap-3">
                                      <div className="flex items-start gap-2">
                                        <Eye className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-[11px] font-semibold">vs Checkmarx</p>
                                          <p className="text-[10px] text-muted-foreground">Zero code storage — analyzed in memory and immediately discarded. Your code never hits a database.</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Code2 className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-[11px] font-semibold">vs Semgrep</p>
                                          <p className="text-[10px] text-muted-foreground">Full taint tracking with visual dataflow — traces data from input to sink, not just pattern matching.</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <Server className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-[11px] font-semibold">vs SonarQube</p>
                                          <p className="text-[10px] text-muted-foreground">Cross-file analysis with CWE/OWASP references and auto-generated fix code with effort estimates.</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-[11px] font-semibold">Exploit PoC Generator</p>
                                          <p className="text-[10px] text-muted-foreground">Generates real exploit payloads showing exactly how attackers would exploit each vuln. No other SAST does this.</p>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Stats grid — Enhanced Executive Summary */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 flex-1">
                                    <div className="rounded-lg border p-3 text-center bg-gradient-to-b from-background to-muted/20">
                                      <div className="text-2xl font-bold">{scanResults.stats?.total || 0}</div>
                                      <div className="text-xs text-muted-foreground">Total Findings</div>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent">
                                      <div className="text-2xl font-bold text-red-500">{scanResults.stats?.critical || 0}</div>
                                      <div className="text-xs text-muted-foreground">Critical</div>
                                      {(scanResults.stats?.critical || 0) > 0 && <div className="text-[9px] text-red-500 font-medium mt-0.5">Fix immediately</div>}
                                    </div>
                                    <div className="rounded-lg border p-3 text-center border-orange-500/20 bg-gradient-to-b from-orange-500/5 to-transparent">
                                      <div className="text-2xl font-bold text-orange-500">{scanResults.stats?.high || 0}</div>
                                      <div className="text-xs text-muted-foreground">High</div>
                                      {(scanResults.stats?.high || 0) > 0 && <div className="text-[9px] text-orange-500 font-medium mt-0.5">Fix this sprint</div>}
                                    </div>
                                    <div className="rounded-lg border p-3 text-center border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent">
                                      <div className="text-2xl font-bold text-amber-500">{scanResults.stats?.medium || 0}</div>
                                      <div className="text-xs text-muted-foreground">Medium</div>
                                    </div>
                                    <div className="rounded-lg border p-3 text-center border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-transparent">
                                      <div className="text-2xl font-bold text-blue-500">{scanResults.stats?.low || 0}</div>
                                      <div className="text-xs text-muted-foreground">Low</div>
                                    </div>
                                  </div>
                                  {(scanResults.stats?.total || 0) > 0 && (
                                    <Card className="p-3 shrink-0">
                                      <SeverityPieChart stats={scanResults.stats} />
                                    </Card>
                                  )}
                                </div>

                                {/* Scan metadata */}
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                    {scanResults.multiFile ? (
                                      <>
                                        <span className="flex items-center gap-1"><Files className="h-3 w-3" /> {scanResults.fileCount} files • {scanResults.totalLines?.toLocaleString()} lines • {scanResults.totalChecks?.toLocaleString()} checks</span>
                                        {scanResults.crossFileFindings > 0 && <Badge variant="secondary" className="text-[9px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">Cross-file: {scanResults.crossFileFindings}</Badge>}
                                        {scanResults.scanDurationMs && <span>{scanResults.scanDurationMs}ms</span>}
                                      </>
                                    ) : (
                                      <>
                                        <span>{scanResults.checksPerformed || 0} AST checks across {scanResults.linesAnalyzed || 0} lines</span>
                                        <Badge variant={scanResults.astParsed ? "secondary" : scanResults.patternBased ? "secondary" : "destructive"} className="text-[9px]">{scanResults.astParsed ? "AST parsed" : scanResults.patternBased ? "Token analysis" : "Parse failed"}</Badge>
                                        {scanResults.language && <Badge variant="outline" className="text-[9px] capitalize">{scanResults.language}</Badge>}
                                        <span>{scanResults.mode} mode</span>
                                      </>
                                    )}
                                  </div>
                                  <Button size="sm" variant="outline" onClick={() => generateSASTReport(scanResults)} className="text-xs gap-1.5 shrink-0">
                                    <Download className="h-3.5 w-3.5" /> HTML Report
                                  </Button>
                                  {isPaid && (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => exportSASTJSON(scanResults)} className="text-xs gap-1.5 shrink-0">
                                        <Download className="h-3.5 w-3.5" /> JSON
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => exportSASTCSV(scanResults)} className="text-xs gap-1.5 shrink-0">
                                        <Download className="h-3.5 w-3.5" /> CSV
                                      </Button>
                                    </>
                                  )}
                                </div>

                                {/* Multi-file breakdown table */}
                                {scanResults.multiFile && scanResults.fileBreakdown?.length > 0 && (
                                  <Card>
                                    <CardContent className="p-3">
                                      <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                                        <Files className="h-3.5 w-3.5 text-primary" /> File Breakdown
                                      </p>
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-[11px]">
                                          <thead>
                                            <tr className="border-b text-muted-foreground">
                                              <th className="text-left py-1.5 px-2 font-medium">File</th>
                                              <th className="text-left py-1.5 px-2 font-medium">Lang</th>
                                              <th className="text-center py-1.5 px-2 font-medium">Lines</th>
                                              <th className="text-center py-1.5 px-2 font-medium">Findings</th>
                                              <th className="text-center py-1.5 px-2 font-medium">Crit</th>
                                              <th className="text-center py-1.5 px-2 font-medium">High</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {scanResults.fileBreakdown.map((fb: any, fi: number) => (
                                              <tr key={fi} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="py-1.5 px-2 font-mono truncate max-w-[200px]">{fb.file}</td>
                                                <td className="py-1.5 px-2">{fb.language}</td>
                                                <td className="py-1.5 px-2 text-center">{fb.lines}</td>
                                                <td className="py-1.5 px-2 text-center font-semibold">{fb.findings}</td>
                                                <td className="py-1.5 px-2 text-center text-red-500 font-semibold">{fb.critical || 0}</td>
                                                <td className="py-1.5 px-2 text-center text-orange-500 font-semibold">{fb.high || 0}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}

                                {scanResults.findings?.length > 0 ? (
                                  <div className="space-y-3">
                                    {/* Category breakdown summary */}
                                    {(() => {
                                      const cats: Record<string, { count: number; critical: number; high: number }> = {};
                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                      scanResults.findings.forEach((f: any) => {
                                        if (!cats[f.category]) cats[f.category] = { count: 0, critical: 0, high: 0 };
                                        cats[f.category].count++;
                                        if (f.severity === "critical") cats[f.category].critical++;
                                        if (f.severity === "high") cats[f.category].high++;
                                      });
                                      const sorted = Object.entries(cats).sort((a, b) => (b[1].critical * 10 + b[1].high * 5 + b[1].count) - (a[1].critical * 10 + a[1].high * 5 + a[1].count));
                                      return (
                                        <Card className="border-primary/10">
                                          <CardContent className="p-3">
                                            <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                                              <BarChart3 className="h-3.5 w-3.5 text-primary" /> Vulnerability Categories ({sorted.length})
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                              {sorted.map(([cat, info]) => (
                                                <div key={cat} className={`inline-flex items-center gap-1.5 text-[10px] rounded-full px-2.5 py-1 border ${info.critical > 0 ? "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400" : info.high > 0 ? "border-orange-500/30 bg-orange-500/5 text-orange-700 dark:text-orange-400" : "border-border bg-muted/30 text-muted-foreground"}`}>
                                                  <span className="font-medium">{cat}</span>
                                                  <span className="font-bold">{info.count}</span>
                                                  {info.critical > 0 && <span className="text-red-500">({info.critical} crit)</span>}
                                                </div>
                                              ))}
                                            </div>
                                          </CardContent>
                                        </Card>
                                      );
                                    })()}

                                    {/* Severity filter bar */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs text-muted-foreground">Filter:</span>
                                      {["all", "critical", "high", "medium", "low"].map((sev) => (
                                        <Button key={sev} size="sm" variant={severityFilter === sev ? "default" : "outline"} className="text-[10px] h-6 px-2 capitalize" onClick={() => setSeverityFilter(sev)}>
                                          {sev === "all" ? `All (${scanResults.findings.length})` : `${sev} (${scanResults.findings.filter((f: Record<string, unknown>) => f.severity === sev).length})`}
                                        </Button>
                                      ))}
                                      {suppressedFindings.size > 0 && (
                                        <span className="text-[10px] text-muted-foreground ml-auto">{suppressedFindings.size} suppressed</span>
                                      )}
                                    </div>
                                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {scanResults.findings.filter((f: any) => (severityFilter === "all" || f.severity === severityFilter) && !suppressedFindings.has(`${f.id}:${f.line}:${f.file || ""}`)).map((f: any, idx: number) => (
                                      <Card key={idx} className={`transition-all ${f.severity === "critical" ? "border-red-500/30 bg-red-500/[0.02] border-l-4 border-l-red-500" : f.severity === "high" ? "border-orange-500/30 bg-orange-500/[0.02] border-l-4 border-l-orange-500" : f.severity === "medium" ? "border-amber-500/30 border-l-4 border-l-amber-500" : "border-blue-500/30 border-l-4 border-l-blue-500"}`}>
                                        <CardContent className="p-4">
                                          {/* Finding header with severity indicator */}
                                          <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <div className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${f.severity === "critical" ? "bg-red-500/15 text-red-600 dark:text-red-400" : f.severity === "high" ? "bg-orange-500/15 text-orange-600 dark:text-orange-400" : f.severity === "medium" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-blue-500/15 text-blue-600 dark:text-blue-400"}`}>
                                                {f.severity === "critical" && <AlertTriangle className="h-3 w-3" />}
                                                {f.severity}
                                              </div>
                                              <Badge variant="outline" className={`text-[9px] ${f.confidence === "high" ? "border-emerald-500 text-emerald-600" : "border-amber-500 text-amber-600"}`}>{f.confidence} conf.</Badge>
                                              <span className="font-semibold text-sm">{f.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                              {isPaid && (
                                                <Button size="sm" variant="ghost" className="text-[9px] h-5 px-1.5 text-muted-foreground hover:text-red-500" onClick={() => setSuppressedFindings(prev => { const next = new Set(prev); next.add(`${f.id}:${f.line}:${f.file || ""}`); return next; })} title="Suppress (mark as false positive)">
                                                  ✕ Suppress
                                                </Button>
                                              )}
                                              {f.fix?.riskScore > 0 && <span className="text-[10px] text-muted-foreground">Risk: {f.fix.riskScore}/100</span>}
                                            </div>
                                          </div>

                                          {/* Location + Category badges */}
                                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                            <Badge variant="outline" className="text-[9px] bg-muted/30">{f.category}</Badge>
                                            {f.file && <Badge variant="outline" className="text-[9px] font-mono bg-muted/30">{f.file.length > 30 ? `...${f.file.slice(-27)}` : f.file}</Badge>}
                                            <span className="text-[10px] text-muted-foreground font-mono">Line {f.line}{f.column ? `:${f.column}` : ""}</span>
                                          </div>

                                          {/* What it means — explanation */}
                                          <div className="mb-3 p-2 rounded-md bg-muted/30 border border-border/50">
                                            <p className="text-[10px] font-semibold text-muted-foreground mb-0.5 uppercase tracking-wide">What This Means</p>
                                            <p className="text-xs text-foreground/80">{f.detail}</p>
                                          </div>

                                          {/* Code Snippet with line numbers */}
                                          {f.codeSnippet?.length > 0 ? (
                                            <div className="mb-3 rounded-lg overflow-hidden border border-muted shadow-sm">
                                              <div className="bg-zinc-900 dark:bg-zinc-950 px-3 py-1.5 flex items-center justify-between">
                                                <span className="text-[10px] font-semibold text-zinc-400">{f.file ? `📄 ${f.file}` : "📄 Code"} — Vulnerability at Line {f.line}</span>
                                                <span className="text-[10px] text-zinc-500">Col {f.column}</span>
                                              </div>
                                              <div className="overflow-x-auto bg-zinc-950">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {f.codeSnippet.map((sl: any, si: number) => (
                                                  <div key={si} className={`flex text-[11px] font-mono ${sl.isHighlighted ? "bg-red-500/15 border-l-2 border-red-500" : "border-l-2 border-transparent"}`}>
                                                    <span className={`select-none shrink-0 w-10 text-right pr-3 py-0.5 ${sl.isHighlighted ? "text-red-400 font-bold" : "text-zinc-600"}`}>{sl.lineNum}</span>
                                                    <pre className="py-0.5 pl-2 pr-3 whitespace-pre overflow-x-auto flex-1 text-zinc-300">{sl.code || " "}</pre>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          ) : (
                                            f.evidence && <code className="block text-xs bg-zinc-900 dark:bg-zinc-950 text-zinc-300 rounded-lg p-2.5 font-mono break-all mb-3">{f.evidence}</code>
                                          )}
                                          {/* Attack Vector / Dataflow trace */}
                                          {f.dataflow?.length > 0 && (
                                            <div className="mb-3 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                              <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 mb-1.5">🔗 Attack Vector Flow</p>
                                              <div className="space-y-0">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {f.dataflow.map((step: any, si: number) => (
                                                  <div key={si} className="flex items-start gap-2 text-[11px] relative">
                                                    <div className="flex flex-col items-center shrink-0">
                                                      <div className={`w-2 h-2 rounded-full mt-1 ${si === 0 ? "bg-amber-500" : si === f.dataflow.length - 1 ? "bg-red-500" : "bg-blue-400"}`} />
                                                      {si < f.dataflow.length - 1 && <div className="w-px h-4 bg-blue-300 dark:bg-blue-600" />}
                                                    </div>
                                                    <div className="flex items-baseline gap-2 min-w-0 pb-1">
                                                      <span className="text-blue-600 dark:text-blue-400 font-mono font-bold shrink-0">L{step.line}</span>
                                                      <span className={`text-[10px] shrink-0 ${si === 0 ? "text-amber-600 dark:text-amber-400 font-semibold" : si === f.dataflow.length - 1 ? "text-red-600 dark:text-red-400 font-semibold" : "text-muted-foreground"}`}>{step.label}</span>
                                                      {step.code && <code className="font-mono text-[10px] bg-muted/50 rounded px-1 py-0.5 truncate max-w-[300px]">{step.code}</code>}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {/* Cross-file dataflow */}
                                          {f.crossFileDataflow?.length > 0 && (
                                            <div className="mb-2 p-2.5 rounded bg-purple-500/5 border border-purple-500/20">
                                              <p className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 mb-1.5">🔀 Cross-File Dataflow</p>
                                              <div className="space-y-0">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {f.crossFileDataflow.map((step: any, si: number) => (
                                                  <div key={si} className="flex items-start gap-2 text-[11px] relative">
                                                    <div className="flex flex-col items-center shrink-0">
                                                      <div className={`w-2 h-2 rounded-full mt-1 ${si === 0 ? "bg-amber-500" : si === f.crossFileDataflow.length - 1 ? "bg-red-500" : "bg-purple-400"}`} />
                                                      {si < f.crossFileDataflow.length - 1 && <div className="w-px h-4 bg-purple-300 dark:bg-purple-600" />}
                                                    </div>
                                                    <div className="flex items-baseline gap-2 min-w-0 pb-1">
                                                      <Badge variant="outline" className="text-[8px] font-mono shrink-0">{step.file}</Badge>
                                                      <span className="text-purple-600 dark:text-purple-400 font-mono font-bold shrink-0">L{step.line}</span>
                                                      <span className="text-[10px] text-muted-foreground">{step.label}</span>
                                                      {step.code && <code className="font-mono text-[10px] bg-muted/50 rounded px-1 py-0.5 truncate max-w-[250px]">{step.code}</code>}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {/* CWE/OWASP badges + references */}
                                          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                            {f.cwe && <Badge variant="outline" className="text-[8px] font-normal">{f.cwe}</Badge>}
                                            {f.owasp && <Badge variant="outline" className="text-[8px] font-normal">{f.owasp}</Badge>}
                                            {f.fix?.priority && <Badge variant="outline" className={`text-[8px] ${f.fix.priority === "CRITICAL" ? "border-red-500 text-red-500" : f.fix.priority === "HIGH" ? "border-orange-500 text-orange-500" : "border-amber-500 text-amber-500"}`}>{f.fix.priority}</Badge>}
                                            {f.references?.map((ref: { title: string; url: string; type: string }, ri: number) => (
                                              <a key={ri} href={ref.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[8px] text-blue-600 dark:text-blue-400 hover:underline">
                                                <ExternalLink className="h-2.5 w-2.5" /> {ref.title}
                                              </a>
                                            ))}
                                          </div>
                                          {/* Exploit PoC section */}
                                          {f.exploitPoC && (
                                            <div className="mb-2">
                                              <button
                                                onClick={() => setExpandedPoC((prev) => { const next = new Set(prev); next.has(idx) ? next.delete(idx) : next.add(idx); return next; })}
                                                className="w-full flex items-center justify-between gap-2 p-2 rounded bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors text-left"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                                  <span className="text-[11px] font-semibold text-red-700 dark:text-red-400">Exploit PoC: {f.exploitPoC.title}</span>
                                                  <Badge variant="outline" className={`text-[8px] ${f.exploitPoC.attackComplexity === "low" ? "border-red-500 text-red-500" : f.exploitPoC.attackComplexity === "medium" ? "border-orange-500 text-orange-500" : "border-amber-500 text-amber-500"}`}>
                                                    {f.exploitPoC.attackComplexity} complexity
                                                  </Badge>
                                                  {f.exploitPoC.remoteExploitable && <Badge variant="destructive" className="text-[8px]">Remote</Badge>}
                                                </div>
                                                <ChevronDown className={`h-3.5 w-3.5 text-red-500 transition-transform ${expandedPoC.has(idx) ? "rotate-180" : ""}`} />
                                              </button>
                                              {expandedPoC.has(idx) && (
                                                <div className="mt-1 p-3 rounded-b border border-t-0 border-red-500/20 bg-red-500/5 space-y-2.5">
                                                  <p className="text-[11px] text-red-700 dark:text-red-400"><strong>Impact:</strong> {f.exploitPoC.impact}</p>
                                                  <div>
                                                    <p className="text-[10px] font-semibold text-red-700 dark:text-red-400 mb-1">Attack Steps:</p>
                                                    <ol className="list-decimal list-inside space-y-0.5">
                                                      {f.exploitPoC.steps.map((step: string, si: number) => (
                                                        <li key={si} className="text-[11px] text-muted-foreground">{step}</li>
                                                      ))}
                                                    </ol>
                                                  </div>
                                                  <div>
                                                    <p className="text-[10px] font-semibold text-red-700 dark:text-red-400 mb-1">Exploit Payload:</p>
                                                    <pre className="text-[10px] font-mono bg-zinc-900 text-zinc-100 dark:bg-zinc-950 rounded p-2.5 overflow-x-auto whitespace-pre max-h-[250px] overflow-y-auto">{f.exploitPoC.payload}</pre>
                                                  </div>
                                                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-start gap-1">
                                                    <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" />
                                                    <span><strong>Verify Fix:</strong> {f.exploitPoC.verifyFix}</span>
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                          {/* Fix guidance */}
                                          {f.fix && (
                                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> How To Fix
                                              </p>
                                              <p className="text-xs text-emerald-600 dark:text-emerald-300">{f.fix.fix || f.remediation}</p>
                                              {f.fix.codeExample && (
                                                <pre className="text-[11px] font-mono bg-zinc-900 text-emerald-300 dark:bg-zinc-950 rounded-md px-3 py-2 mt-2 overflow-x-auto whitespace-pre-wrap">{f.fix.codeExample}</pre>
                                              )}
                                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                {f.fix.effort && <Badge variant="secondary" className={`text-[9px] ${f.fix.effort === "low" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : f.fix.effort === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>Effort: {f.fix.effort}</Badge>}
                                                {f.fix.compliance?.map((c: string, ci: number) => (
                                                  <Badge key={ci} variant="outline" className="text-[8px] font-normal">{c}</Badge>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {!f.fix && f.remediation && (
                                            <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                                              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-1.5">
                                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                                <span><strong>Fix:</strong> {f.remediation}</span>
                                              </p>
                                            </div>
                                          )}

                                          {/* AI Fix Button */}
                                          {isPaid && (
                                            <div className="mt-2">
                                              {aiFixResults[idx] ? (
                                                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 space-y-2">
                                                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                                                    <Sparkles className="h-3.5 w-3.5" /> AI-Generated Fix
                                                    <Badge variant="secondary" className="text-[8px] ml-1">{aiFixResults[idx].provider}/{aiFixResults[idx].model}</Badge>
                                                    {aiFixResults[idx].isDropInFix && <Badge variant="outline" className="text-[8px] border-emerald-500 text-emerald-500">Drop-in</Badge>}
                                                  </p>
                                                  <p className="text-xs text-purple-600 dark:text-purple-300">{aiFixResults[idx].explanation}</p>
                                                  {aiFixResults[idx].changes?.length > 0 && (
                                                    <ul className="text-[10px] text-muted-foreground space-y-0.5 ml-4 list-disc">
                                                      {aiFixResults[idx].changes.map((c: string, ci: number) => <li key={ci}>{c}</li>)}
                                                    </ul>
                                                  )}
                                                  <pre className="text-[11px] font-mono bg-zinc-900 text-purple-300 dark:bg-zinc-950 rounded-md px-3 py-2 overflow-x-auto whitespace-pre-wrap max-h-[300px] overflow-y-auto">{aiFixResults[idx].fixedCode}</pre>
                                                  {aiFixResults[idx].importsAdded?.length > 0 && (
                                                    <p className="text-[10px] text-muted-foreground">
                                                      <strong>New imports:</strong> {aiFixResults[idx].importsAdded.join(", ")}
                                                    </p>
                                                  )}
                                                </div>
                                              ) : (
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  disabled={aiFixLoading[idx]}
                                                  onClick={async () => {
                                                    setAiFixLoading(prev => ({ ...prev, [idx]: true }));
                                                    try {
                                                      const codeSnippet = f.codeSnippet?.map((s: { code: string }) => s.code).join("\n") || f.evidence || "";
                                                      const res = await fetch("/api/shieldx/ai-fix", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                          name: f.name, category: f.category, severity: f.severity,
                                                          detail: f.detail, vulnerableCode: codeSnippet,
                                                          language: scanResults.language || "javascript",
                                                          cwe: f.cwe, owasp: f.owasp, fileName: f.file,
                                                          line: f.line, evidence: f.evidence,
                                                          dataflow: f.dataflow,
                                                        }),
                                                      });
                                                      const data = await res.json();
                                                      if (res.ok && data.fix) {
                                                        setAiFixResults(prev => ({ ...prev, [idx]: data.fix }));
                                                      }
                                                    } catch { /* silent */ }
                                                    setAiFixLoading(prev => ({ ...prev, [idx]: false }));
                                                  }}
                                                  className="text-xs gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                                                >
                                                  {aiFixLoading[idx] ? <><Loader2 className="h-3 w-3 animate-spin" /> Generating AI Fix...</> : <><Wand2 className="h-3 w-3" /> AI Fix</>}
                                                </Button>
                                              )}
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                  </div>
                                ) : (
                                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                                    <CardContent className="p-4 flex items-center gap-3">
                                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">No vulnerabilities detected — your code looks secure!</p>
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            )}

                            {/* CI/CD Pipeline Gate results */}
                            {activeModule === "ai-review" && (
                              <>
                                {/* AI Review Summary Banner */}
                                <Card className={`border-l-4 ${scanResults.riskLevel === "critical" ? "border-l-red-500 border-red-500/30 bg-red-500/5" : scanResults.riskLevel === "high" ? "border-l-orange-500 border-orange-500/30 bg-orange-500/5" : scanResults.riskLevel === "secure" ? "border-l-emerald-500 border-emerald-500/30 bg-emerald-500/5" : "border-l-amber-500 border-amber-500/30 bg-amber-500/5"}`}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                      <Sparkles className={`h-5 w-5 shrink-0 mt-0.5 ${scanResults.riskLevel === "critical" ? "text-red-500" : scanResults.riskLevel === "high" ? "text-orange-500" : scanResults.riskLevel === "secure" ? "text-emerald-500" : "text-amber-500"}`} />
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="text-sm font-semibold">AI Security Review</p>
                                          <Badge variant="outline" className={`text-[9px] uppercase ${scanResults.riskLevel === "critical" ? "border-red-500 text-red-500" : scanResults.riskLevel === "high" ? "border-orange-500 text-orange-500" : scanResults.riskLevel === "secure" ? "border-emerald-500 text-emerald-500" : "border-amber-500 text-amber-500"}`}>
                                            {scanResults.riskLevel} risk
                                          </Badge>
                                          <Badge variant="secondary" className="text-[8px]">{scanResults.provider}/{scanResults.model}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{scanResults.summary}</p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {scanResults.findings?.length > 0 ? (
                                  <div className="space-y-3">
                                    <p className="text-xs text-muted-foreground">{scanResults.findingsCount} business logic / authorization issues found</p>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {scanResults.findings.map((f: any, idx: number) => (
                                      <Card key={idx} className={`border-l-4 ${f.severity === "critical" ? "border-l-red-500 border-red-500/30" : f.severity === "high" ? "border-l-orange-500 border-orange-500/30" : f.severity === "medium" ? "border-l-amber-500 border-amber-500/30" : "border-l-blue-500 border-blue-500/30"}`}>
                                        <CardContent className="p-4 space-y-2">
                                          <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <Badge className={`text-[9px] uppercase ${f.severity === "critical" ? "bg-red-500/15 text-red-600" : f.severity === "high" ? "bg-orange-500/15 text-orange-600" : f.severity === "medium" ? "bg-amber-500/15 text-amber-600" : "bg-blue-500/15 text-blue-600"}`}>
                                                {f.severity}
                                              </Badge>
                                              <Badge variant="outline" className="text-[9px]">{f.confidence} conf.</Badge>
                                              <span className="text-sm font-semibold">{f.name}</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-mono shrink-0">Line {f.line}</span>
                                          </div>

                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <Badge variant="outline" className="text-[9px] bg-purple-500/5">{f.category}</Badge>
                                            {f.cwe && <Badge variant="outline" className="text-[8px]">{f.cwe}</Badge>}
                                            {f.owasp && <Badge variant="outline" className="text-[8px]">{f.owasp}</Badge>}
                                          </div>

                                          <div className="p-2.5 rounded-md bg-muted/30 border border-border/50">
                                            <p className="text-[10px] font-semibold text-muted-foreground mb-0.5 uppercase tracking-wide">What This Means</p>
                                            <p className="text-xs">{f.detail}</p>
                                          </div>

                                          {f.evidence && (
                                            <code className="block text-[11px] bg-zinc-900 text-zinc-300 dark:bg-zinc-950 rounded-lg p-2.5 font-mono break-all">{f.evidence}</code>
                                          )}

                                          {f.businessImpact && (
                                            <div className="p-2 rounded bg-red-500/5 border border-red-500/20">
                                              <p className="text-[10px] font-semibold text-red-700 dark:text-red-400 mb-0.5">Business Impact</p>
                                              <p className="text-xs text-red-600 dark:text-red-300">{f.businessImpact}</p>
                                            </div>
                                          )}

                                          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                                              <CheckCircle2 className="h-3.5 w-3.5" /> Recommendation
                                            </p>
                                            <p className="text-xs text-emerald-600 dark:text-emerald-300">{f.recommendation}</p>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                                    <CardContent className="p-4 flex items-center gap-3">
                                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">AI review found no business logic vulnerabilities — nice work!</p>
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            )}

                            {/* CI/CD Pipeline Gate results */}
                            {activeModule === "cicd" && (
                              <>
                                {/* Verdict Banner */}
                                <Card className={`${scanResults.verdict === "PASS" ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                                  <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {scanResults.verdict === "PASS" ? <CheckCircle2 className="h-8 w-8 text-emerald-500" /> : <XCircle className="h-8 w-8 text-red-500" />}
                                      <div>
                                        <p className={`text-xl font-bold ${scanResults.verdict === "PASS" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                                          Pipeline Gate: {scanResults.verdict}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Exit code {scanResults.exitCode} — {scanResults.verdict === "PASS" ? "safe to deploy" : "deployment should be blocked"}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant={scanResults.verdict === "PASS" ? "secondary" : "destructive"} className="text-sm px-3 py-1">
                                      {scanResults.scanType === "full" ? "Full Scan" : scanResults.scanType === "secrets" ? "Secrets" : "Dependencies"}
                                    </Badge>
                                  </CardContent>
                                </Card>

                                <p className="text-xs text-muted-foreground">Project: {scanResults.projectName} • Scanner: {scanResults.scanner} • {new Date(scanResults.timestamp).toLocaleString()}</p>

                                {/* Secrets Results */}
                                {scanResults.secrets && (
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> Secrets Scan</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      <div className="rounded-lg border p-3 text-center">
                                        <div className="text-xl font-bold">{scanResults.secrets.total}</div>
                                        <div className="text-xs text-muted-foreground">Findings</div>
                                      </div>
                                      <div className="rounded-lg border p-3 text-center border-red-500/20">
                                        <div className="text-xl font-bold text-red-500">{scanResults.secrets.critical}</div>
                                        <div className="text-xs text-muted-foreground">Critical</div>
                                      </div>
                                      <div className="rounded-lg border p-3 text-center border-orange-500/20">
                                        <div className="text-xl font-bold text-orange-500">{scanResults.secrets.high}</div>
                                        <div className="text-xs text-muted-foreground">High</div>
                                      </div>
                                      <div className={`rounded-lg border p-3 text-center ${scanResults.secrets.passed ? "border-emerald-500/20" : "border-red-500/20"}`}>
                                        <div className={`text-xl font-bold ${scanResults.secrets.passed ? "text-emerald-500" : "text-red-500"}`}>
                                          {scanResults.secrets.passed ? "PASS" : "FAIL"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Verdict</div>
                                      </div>
                                    </div>
                                    {scanResults.secrets.findings?.length > 0 && (
                                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {scanResults.secrets.findings.map((f: any, idx: number) => (
                                          <div key={idx} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2 border-red-500/20 bg-red-500/5">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                                              <span className="text-xs font-medium">{f.pattern}</span>
                                              <span className="text-xs text-muted-foreground">Line {f.line}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                              <Badge variant={f.severity === "critical" ? "destructive" : "secondary"} className="text-[8px] capitalize">{f.severity}</Badge>
                                              <Badge variant="secondary" className="text-[8px]">{f.confidence}</Badge>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {scanResults.secrets.passed && (
                                      <p className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> No secrets detected in source code.</p>
                                    )}
                                  </div>
                                )}

                                {/* Dependencies Results */}
                                {scanResults.dependencies && !scanResults.dependencies.error && (
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Dependency Scan</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      <div className="rounded-lg border p-3 text-center">
                                        <div className="text-xl font-bold">{scanResults.dependencies.totalDeps || 0}</div>
                                        <div className="text-xs text-muted-foreground">Packages</div>
                                      </div>
                                      <div className="rounded-lg border p-3 text-center border-red-500/20">
                                        <div className="text-xl font-bold text-red-500">{scanResults.dependencies.vulnerabilities?.length || 0}</div>
                                        <div className="text-xs text-muted-foreground">Vulnerable</div>
                                      </div>
                                      <div className="rounded-lg border p-3 text-center">
                                        <div className="text-xl font-bold">{scanResults.dependencies.ecosystem || "—"}</div>
                                        <div className="text-xs text-muted-foreground">Ecosystem</div>
                                      </div>
                                      <div className={`rounded-lg border p-3 text-center ${scanResults.dependencies.passed ? "border-emerald-500/20" : "border-red-500/20"}`}>
                                        <div className={`text-xl font-bold ${scanResults.dependencies.passed ? "text-emerald-500" : "text-red-500"}`}>
                                          {scanResults.dependencies.passed ? "PASS" : "FAIL"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Verdict</div>
                                      </div>
                                    </div>
                                    {scanResults.dependencies.vulnerabilities?.length > 0 && (
                                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {scanResults.dependencies.vulnerabilities.map((v: any, idx: number) => (
                                          <div key={idx} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2 border-orange-500/20">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                                              <span className="text-xs font-medium">{v.package}@{v.version}</span>
                                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{v.summary}</span>
                                            </div>
                                            <Badge variant={v.severity === "critical" ? "destructive" : "secondary"} className="text-[8px] capitalize shrink-0">{v.severity}</Badge>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {scanResults.dependencies.passed && (
                                      <p className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> No known CVEs found in dependencies.</p>
                                    )}
                                  </div>
                                )}
                                {scanResults.dependencies?.error && (
                                  <Card className="border-amber-500/20 bg-amber-500/5">
                                    <CardContent className="p-3 flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                                      <p className="text-sm text-amber-600">Dependency scan: {scanResults.dependencies.error}</p>
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            )}

                            {/* AI Summary Section — available for all scan types */}
                            {isPaid && activeModule !== "score" && (
                              <div className="mt-4 pt-4 border-t">
                                {aiSummary ? (
                                  <Card className={`border-l-4 ${aiSummary.riskLevel === "critical" ? "border-l-red-500" : aiSummary.riskLevel === "high" ? "border-l-orange-500" : aiSummary.riskLevel === "minimal" ? "border-l-emerald-500" : "border-l-amber-500"}`}>
                                    <CardContent className="p-4 space-y-3">
                                      <div className="flex items-center gap-2">
                                        <MessageSquareText className="h-4 w-4 text-purple-500" />
                                        <p className="text-sm font-semibold">AI Executive Summary</p>
                                        <Badge variant="outline" className={`text-[9px] uppercase ${aiSummary.riskLevel === "critical" ? "border-red-500 text-red-500" : aiSummary.riskLevel === "high" ? "border-orange-500 text-orange-500" : aiSummary.riskLevel === "minimal" ? "border-emerald-500 text-emerald-500" : "border-amber-500 text-amber-500"}`}>
                                          {aiSummary.riskLevel} risk
                                        </Badge>
                                        <Badge variant="secondary" className="text-[8px]">{aiSummary.provider}/{aiSummary.model}</Badge>
                                      </div>
                                      <p className="text-sm">{aiSummary.executiveSummary}</p>
                                      {aiSummary.tldr && (
                                        <p className="text-xs text-muted-foreground italic">{aiSummary.tldr}</p>
                                      )}
                                      {aiSummary.prioritizedActions?.length > 0 && (
                                        <div>
                                          <p className="text-xs font-semibold mb-1.5">Priority Fix Order:</p>
                                          <div className="space-y-1.5">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {aiSummary.prioritizedActions.map((a: any, ai: number) => (
                                              <div key={ai} className="flex items-start gap-2 text-xs">
                                                <Badge variant="outline" className={`text-[8px] shrink-0 ${a.effort === "quick" ? "border-emerald-500 text-emerald-500" : a.effort === "moderate" ? "border-amber-500 text-amber-500" : "border-red-500 text-red-500"}`}>
                                                  #{a.priority} {a.effort}
                                                </Badge>
                                                <div>
                                                  <p className="font-medium">{a.action}</p>
                                                  <p className="text-muted-foreground">{a.reason}</p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {aiSummary.keyInsights?.length > 0 && (
                                        <div>
                                          <p className="text-xs font-semibold mb-1">Key Insights:</p>
                                          <ul className="list-disc ml-4 space-y-0.5">
                                            {aiSummary.keyInsights.map((insight: string, ii: number) => (
                                              <li key={ii} className="text-xs text-muted-foreground">{insight}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={aiSummaryLoading}
                                    onClick={async () => {
                                      setAiSummaryLoading(true);
                                      try {
                                        const findings = (scanResults.findings || []).map((f: Record<string, unknown>) => ({
                                          name: f.name || f.pattern || f.finding || "",
                                          severity: f.severity || "medium",
                                          category: f.category || activeModule,
                                          detail: f.detail || f.finding || f.description || "",
                                          line: f.line,
                                          file: f.file,
                                          cwe: f.cwe,
                                        }));
                                        const counts = scanResults.stats ? {
                                          critical: scanResults.stats.critical || 0,
                                          high: scanResults.stats.high || 0,
                                          medium: scanResults.stats.medium || 0,
                                          low: scanResults.stats.low || 0,
                                          findingsTotal: scanResults.stats.total || findings.length,
                                        } : { critical: 0, high: 0, medium: 0, low: 0, findingsTotal: findings.length };
                                        const res = await fetch("/api/shieldx/ai-summary", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            scanType: activeModule,
                                            overallScore: scanResults.overallScore ?? 5,
                                            counts,
                                            findings,
                                          }),
                                        });
                                        const data = await res.json();
                                        if (res.ok) setAiSummary(data);
                                      } catch { /* silent */ }
                                      setAiSummaryLoading(false);
                                    }}
                                    className="text-xs gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                                  >
                                    {aiSummaryLoading ? <><Loader2 className="h-3 w-3 animate-spin" /> Generating Summary...</> : <><MessageSquareText className="h-3 w-3" /> AI Executive Summary</>}
                                  </Button>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="history">
            {loadingHistory ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : mergedHistory.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="font-medium">No scan history yet</p>
                  <p className="text-sm mt-1">Run your first scan from the Modules tab to see results here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {mergedHistory.map((scan) => (
                  <Card key={scan._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`rounded-full p-2 shrink-0 ${scan.overallScore >= 7 ? "bg-emerald-500/10" : scan.overallScore >= 4 ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                            {scan.overallScore >= 7 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : scan.overallScore >= 4 ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{scan.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                              <Badge variant="secondary" className="text-[10px] capitalize">{scan.scanType}</Badge>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(scan.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium">{scan.overallScore.toFixed(1)}/10</div>
                            <div className="text-xs text-muted-foreground">{scan.counts.findingsTotal} findings</div>
                          </div>
                          <div className="flex gap-1.5">
                            {scan.counts.critical > 0 && <Badge variant="destructive" className="text-[10px]">{scan.counts.critical} Critical</Badge>}
                            {scan.counts.high > 0 && <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px]">{scan.counts.high} High</Badge>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Your Plan</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Plan</span>
                    <Badge className="capitalize">{userPlan}</Badge>
                  </div>
                  <div className="pt-3 flex gap-2">
                    <Link href="/shieldx/docs">
                      <Button size="sm" variant="ghost" className="gap-1.5">Documentation <ArrowRight className="h-3.5 w-3.5" /></Button>
                    </Link>
                  </div>
                  {isAdmin && (
                    <div className="pt-4 border-t mt-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Admin: Change Plan</p>
                      <div className="flex gap-2 flex-wrap">
                        {(["free", "pro", "enterprise"] as PlanTier[]).map((p) => (
                          <Button key={p} size="sm" variant={userPlan === p ? "default" : "outline"} disabled={upgradingPlan || userPlan === p}
                            onClick={() => adminUpgradePlan(p)} className="capitalize text-xs">
                            {upgradingPlan ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}{p}
                          </Button>
                        ))}
                      </div>
                      {planMessage && <p className="text-xs mt-2 text-emerald-600">{planMessage}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Workspace Stats</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border bg-muted/20 p-4 text-center">
                      <div className="text-2xl font-bold">{mergedHistory.length}</div>
                      <div className="text-xs text-muted-foreground mt-1">Total Scans</div>
                    </div>
                    <div className="rounded-xl border bg-muted/20 p-4 text-center">
                      <div className="text-2xl font-bold">
                        {mergedHistory.length > 0 ? (mergedHistory.reduce((a, s) => a + s.overallScore, 0) / mergedHistory.length).toFixed(1) : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Avg Score</div>
                    </div>
                    <div className="rounded-xl border bg-muted/20 p-4 text-center">
                      <div className="text-2xl font-bold text-red-500">{mergedHistory.reduce((a, s) => a + s.counts.critical, 0)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Critical Issues</div>
                    </div>
                    <div className="rounded-xl border bg-muted/20 p-4 text-center">
                      <div className="text-2xl font-bold text-orange-500">{mergedHistory.reduce((a, s) => a + s.counts.high, 0)}</div>
                      <div className="text-xs text-muted-foreground mt-1">High Issues</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            {mergedHistory.length > 0 && (
              <div className="grid gap-6 md:grid-cols-3 mt-6">
                {/* Average Security Score Gauge */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Security Score</CardTitle></CardHeader>
                  <CardContent className="flex justify-center pt-2">
                    <ScoreGauge score={mergedHistory.reduce((a, s) => a + s.overallScore, 0) / mergedHistory.length} label="avg score" />
                  </CardContent>
                </Card>

                {/* Severity Distribution Pie */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-primary" /> Severity Distribution</CardTitle></CardHeader>
                  <CardContent className="flex justify-center pt-2">
                    <SeverityPieChart stats={{
                      critical: mergedHistory.reduce((a, s) => a + s.counts.critical, 0),
                      high: mergedHistory.reduce((a, s) => a + s.counts.high, 0),
                      medium: mergedHistory.reduce((a, s) => a + s.counts.medium, 0),
                      low: mergedHistory.reduce((a, s) => a + s.counts.low, 0),
                    }} />
                  </CardContent>
                </Card>

                {/* Scan Type Breakdown Bar Chart */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Scans by Module</CardTitle></CardHeader>
                  <CardContent className="pt-2">
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={(() => {
                        const counts: Record<string, number> = {};
                        mergedHistory.forEach((s) => { counts[s.scanType] = (counts[s.scanType] || 0) + 1; });
                        return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Score Trend Area Chart */}
            {mergedHistory.length > 1 && (
              <Card className="mt-6">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Security Score Trend</CardTitle></CardHeader>
                <CardContent className="pt-2">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={[...mergedHistory].reverse().map((s, i) => ({
                      scan: `#${i + 1}`,
                      score: s.overallScore,
                      findings: s.counts.findingsTotal,
                    }))}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="scan" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#scoreGrad)" strokeWidth={2} dot={{ r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
