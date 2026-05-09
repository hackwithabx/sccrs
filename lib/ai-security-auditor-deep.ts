import { generateAIText } from "./ai-provider";
import {
  analyzeAiSecurity,
  buildAuditReport,
  type AuditFinding,
  type AuditInput,
  type AuditReport,
  type Confidence,
  type Severity,
} from "./ai-security-auditor";

export type DeepAuditMode = "prompt" | "output" | "full";

export const deepAuditRulePacks = [
  "prompt-injection-and-jailbreaks",
  "rag-and-indirect-injection",
  "agent-tool-permissions",
  "sensitive-data-disclosure",
  "unsafe-output-execution",
  "tenant-and-authorization-boundaries",
  "guardrails-and-observability",
];

interface DeepAuditRequest {
  mode: DeepAuditMode;
  input: AuditInput;
}

interface ParsedDeepAudit {
  summary: string;
  findings: AuditFinding[];
}

const SYSTEM_PROMPT = `You are SecureCodeReviews Deep AI Security Auditor.

Your job is to review AI application workflows, prompts, outputs, connected tools, and deployment notes to identify security risks that deterministic pattern checks may miss.

Focus especially on:
- indirect prompt injection and retrieved-content poisoning
- prompt disclosure and hidden instruction exfiltration
- unsafe agent autonomy and missing approval gates
- overbroad tool permissions and broken trust boundaries
- insecure output that may be executed or rendered downstream
- sensitive data exposure, multi-tenant boundary failures, and missing operational controls

You will receive a baseline heuristic report. Use it as context, but do not simply repeat it. Add higher-value workflow findings, threat-model issues, and context-aware risks.

Respond in EXACT JSON only. No markdown. No prose outside JSON.

Schema:
{
  "summary": "2-4 sentence assessment of the overall AI security posture",
  "findings": [
    {
      "title": "Short finding title",
      "category": "Prompt Security | Sensitive Data Exposure | Agent Permissions | Output Handling | Guardrails | Authorization",
      "severity": "Critical | High | Medium | Low",
      "confidence": "High | Medium | Low",
      "description": "What is risky and why it matters in this workflow",
      "remediation": "Concrete remediation guidance",
      "evidence": ["short evidence string", "short evidence string"],
      "owasp": ["prompt-injection", "tooling-access"],
      "cvss": "8.6"
    }
  ]
}

Rules:
- Maximum 8 findings
- Only include findings that are supported by the provided content
- Use OWASP keys from this set only: prompt-injection, sensitive-disclosure, excessive-agency, tooling-access, insecure-output, monitoring-controls
- Do not invent specific secrets, endpoints, or code that are not present
- If baseline findings already cover a point, only include it if you are adding materially better context or remediation`;

function sanitizeSeverity(value: string): Severity {
  const normalized = value.trim().toLowerCase();
  if (normalized === "critical") return "Critical";
  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  if (normalized === "low") return "Low";
  return "Medium";
}

function sanitizeConfidence(value: string): Confidence {
  const normalized = value.trim().toLowerCase();
  if (normalized === "high") return "High";
  if (normalized === "low") return "Low";
  return "Medium";
}

function sanitizeOwasp(values: unknown): string[] {
  const allowed = new Set([
    "prompt-injection",
    "sensitive-disclosure",
    "excessive-agency",
    "tooling-access",
    "insecure-output",
    "monitoring-controls",
  ]);

  if (!Array.isArray(values)) return ["monitoring-controls"];
  const sanitized = values
    .map((value) => String(value || "").trim())
    .filter((value) => allowed.has(value));

  return sanitized.length > 0 ? [...new Set(sanitized)] : ["monitoring-controls"];
}

function buildScopedInput(mode: DeepAuditMode, input: AuditInput): AuditInput {
  if (mode === "prompt") {
    return {
      ...input,
      modelOutput: "",
      connectedTools: "",
      deploymentNotes: "",
    };
  }

  if (mode === "output") {
    return {
      ...input,
      systemPrompt: "",
      userPrompt: "",
      connectedTools: "",
    };
  }

  return input;
}

function dedupeFindings(findings: AuditFinding[]): AuditFinding[] {
  const seen = new Set<string>();
  return findings.filter((finding) => {
    const key = [finding.category, finding.finding, ...finding.owasp].join("|").toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildUserPrompt(mode: DeepAuditMode, input: AuditInput, baseline: AuditReport): string {
  return JSON.stringify(
    {
      mode,
      rulePacks: deepAuditRulePacks,
      workflow: {
        systemPrompt: input.systemPrompt || null,
        userPrompt: input.userPrompt || null,
        modelOutput: input.modelOutput || null,
        connectedTools: input.connectedTools || null,
        deploymentNotes: input.deploymentNotes || null,
        controls: input.controls,
      },
      baselineSummary: baseline.score.narrative,
      baselineFindings: baseline.findings.map((finding) => ({
        category: finding.category,
        severity: finding.severity,
        finding: finding.finding,
        evidence: finding.evidence,
        owasp: finding.owasp,
      })),
    },
    null,
    2
  );
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return trimmed;
}

function parseDeepResponse(raw: string): ParsedDeepAudit {
  const parsed = JSON.parse(extractJson(raw)) as {
    summary?: unknown;
    findings?: Array<Record<string, unknown>>;
  };

  const summary = String(parsed.summary || "Deep analysis completed.");
  const findings = Array.isArray(parsed.findings)
    ? parsed.findings.slice(0, 8).map((finding, index) => ({
        id: `deep-ai-${index + 1}`,
        category: String(finding.category || "AI Workflow Risk"),
        severity: sanitizeSeverity(String(finding.severity || "Medium")),
        confidence: sanitizeConfidence(String(finding.confidence || "Medium")),
        source: "llm" as const,
        finding: String(finding.title || `Deep analysis finding ${index + 1}`),
        description: String(finding.description || ""),
        remediation: String(finding.remediation || ""),
        cvss: finding.cvss ? String(finding.cvss) : undefined,
        evidence: Array.isArray(finding.evidence)
          ? finding.evidence.map((value) => String(value || "")).filter(Boolean).slice(0, 5)
          : [],
        owasp: sanitizeOwasp(finding.owasp),
      }))
    : [];

  return {
    summary,
    findings: findings.filter((finding) => finding.description && finding.remediation),
  };
}

export async function performDeepAiSecurityAudit({ mode, input }: DeepAuditRequest): Promise<AuditReport> {
  const scopedInput = buildScopedInput(mode, input);
  const baseline = analyzeAiSecurity(scopedInput);
  const response = await generateAIText(SYSTEM_PROMPT, buildUserPrompt(mode, scopedInput, baseline));
  const parsed = parseDeepResponse(response.text);

  const mergedFindings = dedupeFindings([...baseline.findings, ...parsed.findings]);
  const report = buildAuditReport(mergedFindings, scopedInput.controls, {
    analysisType: "deep",
    provider: response.provider,
    model: response.model,
    rulePacks: deepAuditRulePacks,
  });

  if (parsed.summary) {
    report.score.narrative = parsed.summary;
  }

  return report;
}