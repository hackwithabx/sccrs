/**
 * ShieldX AI Security Review Engine
 *
 * Goes BEYOND pattern-based SAST. Uses AI to find business logic flaws
 * that no static analysis tool catches:
 *   - Missing authorization checks
 *   - Broken access control
 *   - Payment/billing logic bypasses
 *   - Race conditions
 *   - IDOR (Insecure Direct Object References)
 *   - Business logic abuse
 *   - Improper error handling that leaks info
 *
 * This is what security consultants charge $300/hr for — automated.
 */

import { generateAIText } from "./ai-provider";

export interface AIReviewRequest {
  /** Source code to review */
  code: string;
  /** Programming language */
  language: string;
  /** Optional filename for context */
  fileName?: string;
  /** Optional description of what the code does */
  context?: string;
}

export interface AIReviewFinding {
  id: string;
  name: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  confidence: "high" | "medium" | "low";
  category: string;
  line: number;
  endLine?: number;
  detail: string;
  evidence: string;
  cwe?: string;
  owasp?: string;
  recommendation: string;
  businessImpact: string;
}

export interface AIReviewResult {
  findings: AIReviewFinding[];
  summary: string;
  riskLevel: "critical" | "high" | "medium" | "low" | "secure";
  provider: string;
  model: string;
}

const SYSTEM_PROMPT = `You are ShieldX AI Reviewer — an expert application security auditor.

Your specialty: finding BUSINESS LOGIC vulnerabilities that automated SAST tools CANNOT detect.

Focus on these vulnerability classes that pattern-based scanners miss:
1. **Missing Authorization** — endpoints/functions that don't verify user permissions
2. **Broken Access Control** — users can access/modify other users' data (IDOR)
3. **Business Logic Flaws** — payment bypasses, coupon abuse, negative quantities, race conditions
4. **Authentication Weaknesses** — weak session handling, improper token validation, timing attacks
5. **Mass Assignment** — accepting unvalidated object properties from user input
6. **Race Conditions** — TOCTOU bugs, concurrent request abuse
7. **Information Disclosure** — error messages leaking internals, debug data in production
8. **Insecure Direct Object References** — predictable IDs without ownership checks
9. **Improper Input Validation** — type confusion, negative numbers where only positive expected
10. **State Management Issues** — assumptions about execution order, missing state checks

DO NOT report:
- XSS, SQL injection, or other issues that pattern-based SAST already catches
- Code style or formatting issues
- Performance issues (unless they enable DoS)
- Issues that require source code modification to exploit

Respond in this EXACT JSON format (no markdown, no backticks around JSON):
{
  "findings": [
    {
      "id": "ai-review-1",
      "name": "Missing Admin Authorization Check",
      "severity": "critical",
      "confidence": "high",
      "category": "Broken Access Control",
      "line": 45,
      "endLine": 52,
      "detail": "The deleteUser endpoint accepts any authenticated user's request without verifying admin role. Any logged-in user can delete other accounts.",
      "evidence": "router.delete('/user/:id', authMiddleware, async (req, res) => { ... })",
      "cwe": "CWE-862",
      "owasp": "A01:2021",
      "recommendation": "Add role-based authorization check: if (req.user.role !== 'admin') return res.status(403).json({error: 'Forbidden'});",
      "businessImpact": "Any authenticated user can delete any other user's account, leading to complete data loss and service disruption."
    }
  ],
  "summary": "1-3 sentence summary of the overall security posture",
  "riskLevel": "critical"
}

IMPORTANT:
- Only report REAL findings with specific line numbers
- Each finding must have a concrete exploit scenario
- If the code is secure, return empty findings array with riskLevel "secure"
- Maximum 15 findings per review
- Number IDs sequentially: ai-review-1, ai-review-2, etc.`;

function buildUserPrompt(req: AIReviewRequest): string {
  let prompt = `## Code to Review\n**Language:** ${req.language}`;
  if (req.fileName) prompt += `\n**File:** ${req.fileName}`;
  if (req.context) prompt += `\n**Context:** ${req.context}`;

  prompt += `\n\n\`\`\`${req.language}\n${req.code}\n\`\`\``;

  prompt += `\n\nPerform a deep security review focusing on business logic flaws, authorization issues, and vulnerabilities that pattern-based SAST tools cannot detect. Return JSON as specified.`;

  return prompt;
}

export async function performAIReview(req: AIReviewRequest): Promise<AIReviewResult> {
  // Truncate code to prevent token overflow (roughly 4 chars per token, keep under 8k tokens)
  const maxChars = 30000;
  const code = req.code.length > maxChars ? req.code.slice(0, maxChars) + "\n// ... (truncated)" : req.code;

  const userPrompt = buildUserPrompt({ ...req, code });
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
      findings: [],
      summary: "AI review completed but response parsing failed. Please try again.",
      riskLevel: "low",
      provider: response.provider,
      model: response.model,
    };
  }

  const validSeverities = new Set(["critical", "high", "medium", "low", "info"]);
  const validConfidence = new Set(["high", "medium", "low"]);
  const rawFindings = Array.isArray(parsed.findings) ? parsed.findings : [];

  const findings: AIReviewFinding[] = rawFindings
    .slice(0, 15)
    .map((f: Record<string, unknown>, idx: number) => {
      const severity = String(f.severity || "medium").toLowerCase();
      const confidence = String(f.confidence || "medium").toLowerCase();

      return {
        id: `ai-review-${idx + 1}`,
        name: String(f.name || "Security Issue"),
        severity: (validSeverities.has(severity) ? severity : "medium") as AIReviewFinding["severity"],
        confidence: (validConfidence.has(confidence) ? confidence : "medium") as AIReviewFinding["confidence"],
        category: String(f.category || "AI Review"),
        line: typeof f.line === "number" ? f.line : 1,
        endLine: typeof f.endLine === "number" ? f.endLine : undefined,
        detail: String(f.detail || ""),
        evidence: String(f.evidence || ""),
        cwe: f.cwe ? String(f.cwe) : undefined,
        owasp: f.owasp ? String(f.owasp) : undefined,
        recommendation: String(f.recommendation || ""),
        businessImpact: String(f.businessImpact || ""),
      };
    })
    .filter((f) => f.detail && f.name);

  const riskStr = String(parsed.riskLevel || "low").toLowerCase();
  const validRisk = new Set(["critical", "high", "medium", "low", "secure"]);

  return {
    findings,
    summary: String(parsed.summary || "Review complete."),
    riskLevel: (validRisk.has(riskStr) ? riskStr : "medium") as AIReviewResult["riskLevel"],
    provider: response.provider,
    model: response.model,
  };
}
