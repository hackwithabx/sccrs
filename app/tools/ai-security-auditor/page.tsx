"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleGauge,
  Download,
  FileDown,
  History,
  Lock,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  aiAuditorFaqs,
  analyzeAiSecurity,
  auditPresets,
  auditorCategories,
  defaultAuditorControls,
  type AuditInput,
  type AuditReport,
  type AuditorControls,
} from "@/lib/ai-security-auditor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type AuditMode = "prompt" | "output" | "full";
type AnalysisStrategy = "local" | "deep";

interface StoredAuditRecord {
  id: string;
  createdAt: string;
  mode: AuditMode;
  strategy: AnalysisStrategy;
  overall: number;
  critical: number;
  high: number;
  findings: number;
  title: string;
}

const controlsContent: Array<{
  key: keyof AuditorControls;
  title: string;
  description: string;
}> = [
  {
    key: "inputValidation",
    title: "Prompt validation",
    description: "Normalize untrusted content before it reaches the model.",
  },
  {
    key: "outputFiltering",
    title: "Output filtering",
    description: "Redact secrets, PII, markup, and commands before rendering.",
  },
  {
    key: "toolAllowlist",
    title: "Tool allowlist",
    description: "Restrict agents to approved and narrowly scoped actions.",
  },
  {
    key: "humanApproval",
    title: "Human approval",
    description: "Require review before high-impact external actions occur.",
  },
  {
    key: "authz",
    title: "Authorization",
    description: "Bind agent actions to user identity and least privilege.",
  },
  {
    key: "secretsIsolation",
    title: "Secrets isolation",
    description: "Keep secrets out of model-accessible context and tool responses.",
  },
  {
    key: "logging",
    title: "Audit logging",
    description: "Capture prompts, decisions, denials, and tool calls for monitoring.",
  },
];

const emptyForm: AuditInput = {
  systemPrompt: "",
  userPrompt: "",
  modelOutput: "",
  connectedTools: "",
  deploymentNotes: "",
  controls: defaultAuditorControls,
};

const sidebarItems = ["Overview", "New audit", "History", "OWASP for LLM", "Exports", "Billing"];

function buildHistoryKey(email?: string | null) {
  return `scr-ai-audits:${email || "guest"}`;
}

function buildAuditTitle(input: AuditInput) {
  const seed = input.userPrompt || input.systemPrompt || input.modelOutput || "AI security workflow review";
  const compact = seed.replace(/\s+/g, " ").trim();
  return compact.length > 72 ? `${compact.slice(0, 69).trim()}...` : compact;
}

function severityTone(severity: string) {
  if (severity === "Critical") return "bg-rose-100 text-rose-800";
  if (severity === "High") return "bg-amber-100 text-amber-800";
  if (severity === "Medium") return "bg-blue-100 text-blue-800";
  if (severity === "Low") return "bg-cyan-100 text-cyan-800";
  return "bg-emerald-100 text-emerald-800";
}

function downloadFile(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function AiSecurityAuditorPage() {
  const { data: session } = useSession();
  const [activeMode, setActiveMode] = useState<AuditMode>("full");
  const [analysisStrategy, setAnalysisStrategy] = useState<AnalysisStrategy>("local");
  const [form, setForm] = useState<AuditInput>(emptyForm);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [history, setHistory] = useState<StoredAuditRecord[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [activeStep, setActiveStep] = useState<"scope" | "controls" | "results">("scope");

  const historyKey = useMemo(() => buildHistoryKey(session?.user?.email), [session?.user?.email]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(historyKey);
    if (!raw) {
      setHistory([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredAuditRecord[];
      setHistory(Array.isArray(parsed) ? parsed : []);
    } catch {
      setHistory([]);
    }
  }, [historyKey]);

  const enabledControls = Object.values(form.controls).filter(Boolean).length;
  const latestHistory = history.slice(0, 5);

  function updateField(field: keyof Omit<AuditInput, "controls">, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateControl(control: keyof AuditorControls, enabled: boolean) {
    setForm((current) => ({
      ...current,
      controls: {
        ...current.controls,
        [control]: enabled,
      },
    }));
  }

  function applyPreset(presetId: string) {
    const preset = auditPresets.find((item) => item.id === presetId);
    if (!preset) return;
    setForm(preset.input);
    setActiveMode(preset.mode);
    setActiveStep("scope");
    setAuditError("");
  }

  function resetForm() {
    setForm(emptyForm);
    setReport(null);
    setAuditError("");
    setActiveMode("full");
    setActiveStep("scope");
  }

  async function runAudit() {
    setAuditError("");
    setIsRunning(true);

    try {
      let nextReport: AuditReport;

      if (analysisStrategy === "deep") {
        const response = await fetch("/api/tools/ai-security-auditor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: activeMode, input: form }),
        });

        const payload = (await response.json()) as { report?: AuditReport; error?: string };
        if (!response.ok || !payload.report) {
          throw new Error(payload.error || "Deep AI analysis failed.");
        }

        nextReport = payload.report;
      } else {
        nextReport = analyzeAiSecurity(form);
      }

      const record: StoredAuditRecord = {
        id: `${Date.now()}`,
        createdAt: new Date().toISOString(),
        mode: activeMode,
        strategy: analysisStrategy,
        overall: nextReport.score.overall,
        critical: nextReport.score.summary.critical,
        high: nextReport.score.summary.high,
        findings: nextReport.findings.length,
        title: buildAuditTitle(form),
      };

      const nextHistory = [record, ...history].slice(0, 12);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(historyKey, JSON.stringify(nextHistory));
      }

      setHistory(nextHistory);
      setReport(nextReport);
      setActiveStep("results");
    } catch (error) {
      setAuditError(error instanceof Error ? error.message : "Audit failed.");
    } finally {
      setIsRunning(false);
    }
  }

  function exportJson() {
    if (!report) return;
    downloadFile(
      JSON.stringify({ generatedAt: new Date().toISOString(), mode: activeMode, strategy: analysisStrategy, form, report }, null, 2),
      "application/json;charset=utf-8",
      `scr-ai-security-audit-${Date.now()}.json`
    );
  }

  function exportCsv() {
    if (!report) return;
    const rows = [
      ["severity", "category", "finding", "confidence", "owasp", "evidence"],
      ...report.findings.map((finding) => [
        finding.severity,
        finding.category,
        finding.finding,
        finding.confidence,
        finding.owasp.join(" | "),
        finding.evidence.join(" | "),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell);
            return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
          })
          .join(",")
      )
      .join("\n");

    downloadFile(csv, "text/csv;charset=utf-8", `scr-ai-security-audit-${Date.now()}.csv`);
  }

  function exportPdf() {
    if (!report) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(24);
    doc.text("SecureCodeReviews AI Security Audit", 40, 48);
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 68);
    doc.text(`Mode: ${activeMode} | Strategy: ${analysisStrategy}`, 40, 84);

    autoTable(doc, {
      startY: 110,
      head: [["Metric", "Value"]],
      body: [
        ["Overall score", `${report.score.overall}/100`],
        ["Critical findings", String(report.score.summary.critical)],
        ["High findings", String(report.score.summary.high)],
        ["Enabled controls", String(enabledControls)],
      ],
      headStyles: { fillColor: [15, 23, 42] },
    });

    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
        ? ((doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 150) + 24
        : 220,
      head: [["Severity", "Finding", "Category", "OWASP"]],
      body: report.findings.map((finding) => [
        finding.severity,
        finding.finding,
        finding.category,
        finding.owasp.join(", "),
      ]),
      headStyles: { fillColor: [20, 101, 255] },
      styles: { fontSize: 9 },
    });

    doc.save(`scr-ai-security-audit-${Date.now()}.pdf`);
  }

  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="space-y-4">
          <Card className="surface-card-strong rounded-[1.75rem] border-0">
            <CardContent className="p-5">
              <div className="section-eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                AI Security Auditor
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                A guided security workflow for prompt injection, data leakage, output handling, and AI tool-risk reviews.
              </p>
              <div className="mt-5 space-y-2">
                {sidebarItems.map((item, index) => (
                  <div
                    key={item}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium ${index === 1 ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[1.4rem] bg-white p-4 shadow-sm">
                <div className="text-sm font-semibold text-slate-950">
                  {session ? "Signed in workspace" : "Guest workspace"}
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {session
                    ? "Your local audit history is attached to this signed-in account in the browser."
                    : "Sign in or create an account to pair the product experience with the main dashboard and upgrade path."}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {!session ? (
                    <>
                      <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
                        <Link href="/auth/login">Sign in</Link>
                      </Button>
                      <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                        <Link href="/auth/register">Create account</Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                      <Link href="/dashboard">Open dashboard</Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="surface-card rounded-[1.75rem] border-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <History className="h-4 w-4 text-blue-700" />
                Audit history
              </div>
              <div className="mt-4 space-y-3">
                {latestHistory.length > 0 ? (
                  latestHistory.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <div className="text-sm font-medium text-slate-950">{item.title}</div>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{item.mode}</span>
                        <span>{item.overall}/100</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-500 shadow-sm">
                    No saved runs yet. Use a preset or start from scratch.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="space-y-6">
          <Card className="surface-card-strong rounded-[2rem] border-0">
            <CardContent className="p-8">
              <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
                <div>
                  <div className="section-eyebrow">Modern AI security workflow</div>
                  <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    Audit AI systems before attackers find the weak points.
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                    Step through prompts, outputs, tools, and deployment assumptions in a cleaner SaaS-style experience that works for engineers, founders, and non-technical stakeholders.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      "Prompt injection testing",
                      "Data leakage and output review",
                      "OWASP Top 10 for LLM apps mapping",
                    ].map((item) => (
                      <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                        <CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dashboard-tile rounded-[1.75rem] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">Workflow status</div>
                      <div className="text-xs text-slate-500">Designed like a modern product dashboard</div>
                    </div>
                    <Badge className="border-0 bg-blue-100 text-blue-700 hover:bg-blue-100">Step-by-step</Badge>
                  </div>
                  <div className="mt-5 space-y-3">
                    {[
                      ["1. Scope the workflow", activeStep === "scope"],
                      ["2. Mark active controls", activeStep === "controls"],
                      ["3. Review score and export", activeStep === "results"],
                    ].map(([label, isActive]) => (
                      <div
                        key={String(label)}
                        className={`rounded-2xl px-4 py-3 text-sm font-medium ${isActive ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
            <Card className="surface-card rounded-[2rem] border-0">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="text-2xl text-slate-950">New audit</CardTitle>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Choose an audit mode, paste realistic workflow context, then run either a fast local review or a deeper AI-backed analysis.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={resetForm} className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                      Reset
                    </Button>
                    <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                      <Link href="/pricing">View plans</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-[1.6rem] bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">Onboarding presets</div>
                      <div className="mt-1 text-sm text-slate-500">Use a realistic attack pattern to populate the workflow quickly.</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {auditPresets.map((preset) => (
                        <Button
                          key={preset.id}
                          variant="outline"
                          onClick={() => applyPreset(preset.id)}
                          className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        >
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.6rem] bg-blue-50 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-blue-700">Analysis mode</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        onClick={() => setAnalysisStrategy("local")}
                        className={`rounded-full ${analysisStrategy === "local" ? "bg-slate-950 text-white hover:bg-slate-900" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                      >
                        Fast local
                      </Button>
                      <Button
                        onClick={() => setAnalysisStrategy("deep")}
                        className={`rounded-full ${analysisStrategy === "deep" ? "bg-slate-950 text-white hover:bg-slate-900" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                      >
                        Deep AI
                      </Button>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      Fast local runs entirely in the browser. Deep AI mode adds server-backed reasoning for harder workflow analysis.
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] bg-emerald-50 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-emerald-700">Current controls</div>
                    <div className="mt-4 text-4xl font-semibold text-slate-950">{enabledControls}</div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      Mark real controls already in place so the risk score reflects defensive depth, not only raw findings.
                    </p>
                  </div>
                </div>

                {auditError ? (
                  <div className="rounded-[1.5rem] bg-rose-50 px-4 py-4 text-sm text-rose-800">
                    {auditError}
                  </div>
                ) : null}

                <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as AuditMode)}>
                  <TabsList className="grid h-auto w-full grid-cols-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-1">
                    <TabsTrigger value="prompt" className="rounded-[1rem] py-2.5">Prompt audit</TabsTrigger>
                    <TabsTrigger value="output" className="rounded-[1rem] py-2.5">Output audit</TabsTrigger>
                    <TabsTrigger value="full" className="rounded-[1rem] py-2.5">Full workflow</TabsTrigger>
                  </TabsList>

                  <TabsContent value="prompt" className="space-y-5 pt-5">
                    <div className="space-y-2">
                      <Label htmlFor="system-prompt">System prompt or policy</Label>
                      <Textarea
                        id="system-prompt"
                        value={form.systemPrompt}
                        onChange={(event) => updateField("systemPrompt", event.target.value)}
                        className="min-h-[150px] rounded-[1.25rem] border-slate-200 bg-white"
                        placeholder="Paste your system prompt, assistant policy, or routing instructions."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="user-prompt">User prompt or retrieved content</Label>
                      <Textarea
                        id="user-prompt"
                        value={form.userPrompt}
                        onChange={(event) => updateField("userPrompt", event.target.value)}
                        className="min-h-[180px] rounded-[1.25rem] border-slate-200 bg-white"
                        placeholder="Paste the prompt, injected content, or adversarial test input."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="output" className="space-y-5 pt-5">
                    <div className="space-y-2">
                      <Label htmlFor="model-output">Model output or rendered response</Label>
                      <Textarea
                        id="model-output"
                        value={form.modelOutput}
                        onChange={(event) => updateField("modelOutput", event.target.value)}
                        className="min-h-[220px] rounded-[1.25rem] border-slate-200 bg-white"
                        placeholder="Paste model output, HTML, code, tool traces, or leaked context."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deployment-notes-output">Rendering or downstream handling notes</Label>
                      <Textarea
                        id="deployment-notes-output"
                        value={form.deploymentNotes}
                        onChange={(event) => updateField("deploymentNotes", event.target.value)}
                        className="min-h-[130px] rounded-[1.25rem] border-slate-200 bg-white"
                        placeholder="Describe where this output gets rendered, logged, executed, or forwarded."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="full" className="space-y-5 pt-5">
                    <div className="grid gap-5 lg:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full-system-prompt">System prompt or policy</Label>
                        <Textarea
                          id="full-system-prompt"
                          value={form.systemPrompt}
                          onChange={(event) => updateField("systemPrompt", event.target.value)}
                          className="min-h-[160px] rounded-[1.25rem] border-slate-200 bg-white"
                          placeholder="Assistant policy, orchestration logic, or guardrail instructions."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="full-user-prompt">User prompt or attack sample</Label>
                        <Textarea
                          id="full-user-prompt"
                          value={form.userPrompt}
                          onChange={(event) => updateField("userPrompt", event.target.value)}
                          className="min-h-[160px] rounded-[1.25rem] border-slate-200 bg-white"
                          placeholder="Adversarial prompt, retrieved content, or hidden instruction payload."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="full-output">Model output</Label>
                        <Textarea
                          id="full-output"
                          value={form.modelOutput}
                          onChange={(event) => updateField("modelOutput", event.target.value)}
                          className="min-h-[160px] rounded-[1.25rem] border-slate-200 bg-white"
                          placeholder="Generated answer, HTML, code, leaked trace, or action output."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="connected-tools">Connected tools and permissions</Label>
                        <Textarea
                          id="connected-tools"
                          value={form.connectedTools}
                          onChange={(event) => updateField("connectedTools", event.target.value)}
                          className="min-h-[160px] rounded-[1.25rem] border-slate-200 bg-white"
                          placeholder="Describe shell, filesystem, email, database, browser, or webhook permissions."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deployment-notes">Deployment notes</Label>
                      <Textarea
                        id="deployment-notes"
                        value={form.deploymentNotes}
                        onChange={(event) => updateField("deploymentNotes", event.target.value)}
                        className="min-h-[140px] rounded-[1.25rem] border-slate-200 bg-white"
                        placeholder="Explain approvals, data access, RAG behavior, tenant boundaries, and rollout assumptions."
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="rounded-[1.6rem] bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">Active controls</div>
                      <div className="mt-1 text-sm text-slate-500">Mark the safeguards you actually enforce today.</div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setActiveStep("controls")}
                      className="rounded-full border-slate-200 bg-white hover:bg-slate-50"
                    >
                      Review controls
                    </Button>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {controlsContent.map((control) => (
                      <label key={control.key} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={form.controls[control.key]}
                            onChange={(event) => updateControl(control.key, event.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-slate-950">{control.title}</span>
                            <span className="mt-1 block text-sm leading-6 text-slate-600">{control.description}</span>
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button onClick={runAudit} disabled={isRunning} className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
                    <WandSparkles className="mr-2 h-4 w-4" />
                    {isRunning ? "Running audit..." : `Run ${analysisStrategy === "deep" ? "deep" : "local"} audit`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep("results")}
                    className="rounded-full border-slate-200 bg-white hover:bg-slate-50"
                  >
                    Jump to results
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="surface-card rounded-[2rem] border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-slate-950">Risk and reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report ? (
                    <>
                      <div className="rounded-[1.6rem] bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-950">Overall security score</div>
                            <p className="mt-2 text-sm leading-7 text-slate-600">{report.score.narrative}</p>
                          </div>
                          <div className="flex items-end gap-3">
                            <CircleGauge className="h-10 w-10 text-blue-700" />
                            <div className="text-5xl font-semibold text-slate-950">{report.score.overall}</div>
                          </div>
                        </div>
                        <div className="mt-5 grid gap-3 grid-cols-2">
                          <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">Critical: {report.score.summary.critical}</div>
                          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">High: {report.score.summary.high}</div>
                          <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800">Medium: {report.score.summary.medium}</div>
                          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Pass: {report.score.summary.pass}</div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <Button onClick={exportPdf} className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
                          <FileDown className="mr-2 h-4 w-4" />
                          PDF report
                        </Button>
                        <Button onClick={exportJson} variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                          <Download className="mr-2 h-4 w-4" />
                          JSON export
                        </Button>
                        <Button onClick={exportCsv} variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                          <Download className="mr-2 h-4 w-4" />
                          CSV export
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {report.score.categories.map((category) => (
                          <div key={category.key} className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-slate-950">{category.name}</div>
                                <div className="mt-1 text-sm text-slate-600">{category.summary}</div>
                              </div>
                              <div className="text-2xl font-semibold text-slate-950">{category.score}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="rounded-[1.6rem] bg-white px-5 py-8 text-center shadow-sm">
                      <Bot className="mx-auto h-10 w-10 text-blue-700" />
                      <div className="mt-4 text-lg font-semibold text-slate-950">No audit results yet</div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        Fill in the workflow, run an audit, and this panel will show the score, report exports, and category-level findings.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="surface-card rounded-[2rem] border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-slate-950">OWASP for LLM coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {auditorCategories.map((category) => (
                    <div key={category.key} className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-950">{category.title}</div>
                        <Badge className="border-0 bg-slate-100 text-slate-700 hover:bg-slate-100">CVSS {category.cvss}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{category.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="surface-card rounded-[2rem] border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-slate-950">Findings and remediation</CardTitle>
            </CardHeader>
            <CardContent>
              {report ? (
                <div className="space-y-4">
                  {report.findings.map((finding) => (
                    <div key={finding.id} className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severityTone(finding.severity)}`}>
                              {finding.severity}
                            </span>
                            <Badge className="border-0 bg-slate-100 text-slate-700 hover:bg-slate-100">{finding.category}</Badge>
                            <Badge className="border-0 bg-slate-100 text-slate-700 hover:bg-slate-100">Confidence {finding.confidence}</Badge>
                          </div>
                          <div className="mt-4 text-xl font-semibold text-slate-950">{finding.finding}</div>
                          <p className="mt-3 text-sm leading-7 text-slate-600">{finding.description}</p>
                        </div>
                        <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3 text-xs text-slate-500">
                          {finding.source === "llm" ? "Deep AI" : "Heuristic"}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-5 lg:grid-cols-2">
                        <div>
                          <div className="text-sm font-semibold text-slate-950">Evidence</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {finding.evidence.map((item) => (
                              <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-950">Recommended fix</div>
                          <p className="mt-3 text-sm leading-7 text-slate-600">{finding.remediation}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {finding.owasp.map((item) => (
                          <Badge key={item} className="border-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.6rem] bg-white px-5 py-8 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-1 h-5 w-5 text-amber-600" />
                    <div>
                      <div className="text-lg font-semibold text-slate-950">Run an audit to populate the report</div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        The redesigned results view supports PDF export, saved history, risk visualization, and a cleaner remediation flow for technical and non-technical users.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card className="surface-card rounded-[2rem] border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-slate-950">How to use the workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
                <div className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                  Include both system prompts and untrusted content when testing prompt injection and hidden instruction abuse.
                </div>
                <div className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                  Add tool and permission context so the score reflects excessive agency and blast radius, not just prompt content.
                </div>
                <div className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                  Mark real safeguards already deployed. That keeps the workflow useful for product and compliance conversations, not just raw detection.
                </div>
              </CardContent>
            </Card>

            <Card className="surface-card rounded-[2rem] border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-slate-950">FAQ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiAuditorFaqs.map((faq) => (
                  <div key={faq.question} className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                    <div className="text-sm font-semibold text-slate-950">{faq.question}</div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="surface-card-strong rounded-[2rem] border-0">
            <CardContent className="flex flex-col gap-4 p-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="section-eyebrow">Upgrade path</div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  Start free, then expand into saved history, exports, analytics, and ShieldX.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                  The AI auditor now fits a SaaS subscription model cleanly: starter access for evaluation, Pro for ongoing audits, and Enterprise for teams, APIs, and compliance workflows.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
                  <Link href="/pricing">
                    Compare plans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                  <Link href="/contact?subject=AI+Security+Audit+Request">
                    <Lock className="mr-2 h-4 w-4" />
                    Talk to security team
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}