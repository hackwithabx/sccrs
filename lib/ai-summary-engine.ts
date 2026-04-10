/**
 * ShieldX AI Scan Summary Engine
 *
 * After any scan, generates a plain-English executive summary:
 *   - What's the overall risk?
 *   - What should be fixed first and why?
 *   - What's the business impact?
 *
 * Designed for non-technical stakeholders (CTOs, PMs, compliance teams).
 */

import { generateAIText } from "./ai-provider";

export interface ScanSummaryRequest {
  /** Type of scan that was performed */
  scanType: string;
  /** Overall security score 0-10 */
  overallScore: number;
  /** Severity counts */
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    findingsTotal: number;
  };
  /** The findings array (simplified for the prompt) */
  findings: {
    name: string;
    severity: string;
    category: string;
    detail: string;
    line?: number;
    file?: string;
    cwe?: string;
  }[];
  /** Optional target (URL, repo, etc.) */
  target?: string;
}

export interface ScanSummaryResult {
  /** 2-4 sentence executive summary */
  executiveSummary: string;
  /** Overall risk classification */
  riskLevel: "critical" | "high" | "medium" | "low" | "minimal";
  /** Ordered list of what to fix first */
  prioritizedActions: {
    priority: number;
    action: string;
    reason: string;
    effort: "quick" | "moderate" | "significant";
  }[];
  /** Key takeaways for leadership */
  keyInsights: string[];
  /** One-liner suitable for a Slack notification */
  tldr: string;
  provider: string;
  model: string;
}

const SYSTEM_PROMPT = `You are ShieldX AI Summary — you translate security scan results into clear, actionable intelligence for engineering leads and non-technical stakeholders.

Rules:
1. Be direct and specific — not vague security jargon
2. Quantify risk: "3 critical SQL injection flaws in auth module" not "some security issues found"
3. Prioritize by business impact, not just severity
4. Suggest fix order based on: exploitability + blast radius + effort
5. Use plain English — a product manager should understand every word
6. The tldr should be <100 chars, suitable for a Slack alert

Respond in this EXACT JSON format (no markdown, no backticks around JSON):
{
  "executiveSummary": "Your authentication module has 3 critical SQL injection vulnerabilities that allow attackers to bypass login and access any account. The API endpoints also expose internal error details. Immediate action required on the auth layer — everything else can wait.",
  "riskLevel": "critical",
  "prioritizedActions": [
    {
      "priority": 1,
      "action": "Fix SQL injection in login endpoint (line 45)",
      "reason": "Allows complete authentication bypass — any attacker can log in as any user",
      "effort": "quick"
    }
  ],
  "keyInsights": [
    "Authentication is the weakest layer — 3 of 5 critical findings are in auth code",
    "No input validation on any user-facing endpoint"
  ],
  "tldr": "3 critical auth vulns — login bypass possible. Fix auth/login.ts first."
}`;

function buildUserPrompt(req: ScanSummaryRequest): string {
  const scanLabel: Record<string, string> = {
    secrets: "Secrets Scanner",
    deps: "Dependency Vulnerability Scanner",
    api: "API Security Scanner",
    cloud: "Cloud Security Audit",
    logs: "Threat Log Analyzer",
    sast: "SAST Code Analysis",
    cicd: "CI/CD Pipeline Gate",
    score: "Security Score",
  };

  let prompt = `## Scan Results
**Scanner:** ${scanLabel[req.scanType] || req.scanType}
**Overall Score:** ${req.overallScore}/10
**Total Findings:** ${req.counts.findingsTotal}
**Breakdown:** ${req.counts.critical} Critical, ${req.counts.high} High, ${req.counts.medium} Medium, ${req.counts.low} Low`;

  if (req.target) prompt += `\n**Target:** ${req.target}`;

  if (req.findings.length > 0) {
    prompt += `\n\n## Findings Detail`;
    // Send up to 20 findings to stay within token limits
    const subset = req.findings.slice(0, 20);
    for (const f of subset) {
      prompt += `\n- **[${f.severity.toUpperCase()}]** ${f.name} (${f.category})`;
      if (f.file) prompt += ` in ${f.file}`;
      if (f.line) prompt += ` line ${f.line}`;
      if (f.cwe) prompt += ` [${f.cwe}]`;
      prompt += `\n  ${f.detail.slice(0, 200)}`;
    }
    if (req.findings.length > 20) {
      prompt += `\n... and ${req.findings.length - 20} more findings`;
    }
  }

  prompt += `\n\nGenerate an executive summary and prioritized fix plan. Return JSON as specified.`;

  return prompt;
}

export async function generateScanSummary(req: ScanSummaryRequest): Promise<ScanSummaryResult> {
  // If there are no findings, return a quick positive report without calling AI
  if (req.counts.findingsTotal === 0) {
    return {
      executiveSummary: "No security vulnerabilities detected. The scanned code meets security standards with no actionable findings.",
      riskLevel: "minimal",
      prioritizedActions: [],
      keyInsights: ["Clean scan — no vulnerabilities detected", "Continue monitoring with regular scans"],
      tldr: "Clean scan — no vulnerabilities found.",
      provider: "none",
      model: "none",
    };
  }

  const userPrompt = buildUserPrompt(req);
  const response = await generateAIText(SYSTEM_PROMPT, userPrompt);

  let jsonStr = response.text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return {
      executiveSummary: `Scan found ${req.counts.findingsTotal} findings (${req.counts.critical} critical, ${req.counts.high} high). Review findings and prioritize critical issues.`,
      riskLevel: req.counts.critical > 0 ? "critical" : req.counts.high > 0 ? "high" : "medium",
      prioritizedActions: [],
      keyInsights: [],
      tldr: `${req.counts.findingsTotal} findings — ${req.counts.critical} critical. Review immediately.`,
      provider: response.provider,
      model: response.model,
    };
  }

  const validRisk = new Set(["critical", "high", "medium", "low", "minimal"]);
  const riskStr = String(parsed.riskLevel || "medium").toLowerCase();
  const validEffort = new Set(["quick", "moderate", "significant"]);

  const rawActions = Array.isArray(parsed.prioritizedActions) ? parsed.prioritizedActions : [];

  return {
    executiveSummary: String(parsed.executiveSummary || ""),
    riskLevel: (validRisk.has(riskStr) ? riskStr : "medium") as ScanSummaryResult["riskLevel"],
    prioritizedActions: rawActions.slice(0, 10).map((a: Record<string, unknown>, i: number) => {
      const effort = String(a.effort || "moderate").toLowerCase();
      return {
        priority: typeof a.priority === "number" ? a.priority : i + 1,
        action: String(a.action || ""),
        reason: String(a.reason || ""),
        effort: (validEffort.has(effort) ? effort : "moderate") as "quick" | "moderate" | "significant",
      };
    }),
    keyInsights: Array.isArray(parsed.keyInsights)
      ? parsed.keyInsights.slice(0, 5).map(String)
      : [],
    tldr: String(parsed.tldr || "").slice(0, 120),
    provider: response.provider,
    model: response.model,
  };
}
