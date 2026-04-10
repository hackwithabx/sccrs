/**
 * ShieldX AI Fix Generator
 *
 * Takes a SAST finding with code context and generates the ACTUAL fixed code.
 * Not generic advice — the real patched code that developers can copy-paste.
 *
 * This is the #1 unsolved problem in application security:
 * every tool finds vulnerabilities, but none generate the actual fix.
 */

import { generateAIText } from "./ai-provider";

export interface AIFixRequest {
  /** The finding name, e.g. "SQL Injection" */
  name: string;
  /** Vulnerability category, e.g. "Injection" */
  category: string;
  /** Severity: critical, high, medium, low */
  severity: string;
  /** CWE ID, e.g. "CWE-89" */
  cwe?: string;
  /** OWASP mapping, e.g. "A03:2021" */
  owasp?: string;
  /** Human explanation of the vulnerability */
  detail: string;
  /** The vulnerable code snippet */
  vulnerableCode: string;
  /** Programming language */
  language: string;
  /** File name for context */
  fileName?: string;
  /** Line number of the vulnerability */
  line?: number;
  /** Dataflow chain if available */
  dataflow?: { line: number; label: string; code?: string }[];
  /** Evidence string */
  evidence?: string;
}

export interface AIFixResult {
  /** The complete fixed code */
  fixedCode: string;
  /** What was changed and why */
  explanation: string;
  /** Diff summary — what lines changed */
  changes: string[];
  /** Security libraries/imports added (if any) */
  importsAdded: string[];
  /** Whether the fix is a drop-in replacement */
  isDropInFix: boolean;
  /** AI provider and model used */
  provider: string;
  model: string;
}

const SYSTEM_PROMPT = `You are ShieldX AI Fix — a security-focused code repair engine.

Your job: take vulnerable code and return the FIXED version. Not advice. The actual patched code.

Rules:
1. Return ONLY valid, working code — no explanation in the code block
2. Fix the specific vulnerability identified — don't refactor unrelated code
3. Use the SAME language, framework, and style as the original
4. Prefer well-known security libraries (e.g. parameterized queries, DOMPurify, helmet)
5. Add necessary imports at the top if new libraries are needed
6. Keep the code readable — don't over-engineer the fix
7. If the fix requires a new dependency, mention it

Respond in this EXACT JSON format (no markdown, no backticks around JSON):
{
  "fixedCode": "the complete fixed code here",
  "explanation": "1-3 sentence explanation of what was changed and why",
  "changes": ["line X: replaced string concat with parameterized query", "line Y: added input validation"],
  "importsAdded": ["import { escape } from 'html-escaper'"],
  "isDropInFix": true
}`;

function buildUserPrompt(req: AIFixRequest): string {
  let prompt = `## Vulnerability Found
**Type:** ${req.name} (${req.category})
**Severity:** ${req.severity}
**Language:** ${req.language}`;

  if (req.cwe) prompt += `\n**CWE:** ${req.cwe}`;
  if (req.owasp) prompt += `\n**OWASP:** ${req.owasp}`;
  if (req.fileName) prompt += `\n**File:** ${req.fileName}`;
  if (req.line) prompt += `\n**Line:** ${req.line}`;

  prompt += `\n**Detail:** ${req.detail}`;

  if (req.evidence) {
    prompt += `\n\n## Evidence\n\`\`\`\n${req.evidence}\n\`\`\``;
  }

  if (req.dataflow && req.dataflow.length > 0) {
    prompt += `\n\n## Taint Flow (source → sink)`;
    for (const step of req.dataflow) {
      prompt += `\n- Line ${step.line}: ${step.label}${step.code ? ` → \`${step.code}\`` : ""}`;
    }
  }

  prompt += `\n\n## Vulnerable Code\n\`\`\`${req.language}\n${req.vulnerableCode}\n\`\`\``;

  prompt += `\n\nGenerate the fixed version of this code. Fix ONLY the ${req.name} vulnerability. Return JSON as specified.`;

  return prompt;
}

export async function generateAIFix(req: AIFixRequest): Promise<AIFixResult> {
  const userPrompt = buildUserPrompt(req);
  const response = await generateAIText(SYSTEM_PROMPT, userPrompt);

  // Parse JSON from the response (handle potential markdown wrapping)
  let jsonStr = response.text.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // If JSON parsing fails, try to extract the fixed code from the raw response
    return {
      fixedCode: response.text,
      explanation: "AI generated a fix but the response was not in the expected format.",
      changes: [],
      importsAdded: [],
      isDropInFix: false,
      provider: response.provider,
      model: response.model,
    };
  }

  return {
    fixedCode: String(parsed.fixedCode || ""),
    explanation: String(parsed.explanation || ""),
    changes: Array.isArray(parsed.changes) ? parsed.changes.map(String) : [],
    importsAdded: Array.isArray(parsed.importsAdded) ? parsed.importsAdded.map(String) : [],
    isDropInFix: Boolean(parsed.isDropInFix),
    provider: response.provider,
    model: response.model,
  };
}
