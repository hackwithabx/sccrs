export type Severity = "Critical" | "High" | "Medium" | "Low" | "Pass";
export type Confidence = "High" | "Medium" | "Low";

export interface AuditorControls {
  inputValidation: boolean;
  outputFiltering: boolean;
  toolAllowlist: boolean;
  humanApproval: boolean;
  authz: boolean;
  secretsIsolation: boolean;
  logging: boolean;
}

export interface AuditInput {
  systemPrompt: string;
  userPrompt: string;
  modelOutput: string;
  connectedTools: string;
  deploymentNotes: string;
  controls: AuditorControls;
}

export interface AuditFinding {
  id: string;
  category: string;
  severity: Severity;
  confidence: Confidence;
  finding: string;
  description: string;
  remediation: string;
  cvss?: string;
  evidence: string[];
  owasp: string[];
}

export interface CategoryScore {
  key: string;
  name: string;
  score: number;
  summary: string;
}

export interface SecurityScore {
  overall: number;
  narrative: string;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    pass: number;
  };
  categories: CategoryScore[];
}

export interface AuditReport {
  findings: AuditFinding[];
  score: SecurityScore;
}

interface OwaspCategory {
  key: string;
  title: string;
  description: string;
  cvss: string;
}

interface PhraseRule {
  id: string;
  category: string;
  severity: Exclude<Severity, "Pass">;
  confidence: Confidence;
  finding: string;
  description: string;
  remediation: string;
  cvss: string;
  patterns: string[];
  owasp: string[];
}

interface RegexRule {
  id: string;
  category: string;
  severity: Exclude<Severity, "Pass">;
  confidence: Confidence;
  finding: string;
  description: string;
  remediation: string;
  cvss: string;
  pattern: RegExp;
  owasp: string[];
  validator?: (value: string) => boolean;
}

const severityWeight: Record<Exclude<Severity, "Pass">, number> = {
  Critical: 18,
  High: 10,
  Medium: 5,
  Low: 2,
};

const confidenceWeight: Record<Confidence, number> = {
  High: 1,
  Medium: 0.75,
  Low: 0.5,
};

const severityRank: Record<Severity, number> = {
  Critical: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Pass: 1,
};

const confidenceRank: Record<Confidence, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export const defaultAuditorControls: AuditorControls = {
  inputValidation: false,
  outputFiltering: false,
  toolAllowlist: false,
  humanApproval: false,
  authz: false,
  secretsIsolation: false,
  logging: false,
};

export const auditorCategories: OwaspCategory[] = [
  {
    key: "prompt-injection",
    title: "Prompt Injection",
    description: "Direct or indirect prompt instructions that override intended model behavior.",
    cvss: "9.8",
  },
  {
    key: "sensitive-disclosure",
    title: "Sensitive Data Disclosure",
    description: "Leaks of secrets, PII, credentials, system prompts, or internal context.",
    cvss: "9.1",
  },
  {
    key: "excessive-agency",
    title: "Excessive Agency",
    description: "High-impact autonomous actions without sufficient human approval or scoping.",
    cvss: "8.8",
  },
  {
    key: "tooling-access",
    title: "Tooling & Permission Boundaries",
    description: "Overly broad filesystem, database, shell, browser, or secrets access.",
    cvss: "8.6",
  },
  {
    key: "insecure-output",
    title: "Insecure Output Handling",
    description: "Model output that can trigger execution, injection, or unsafe rendering downstream.",
    cvss: "8.1",
  },
  {
    key: "monitoring-controls",
    title: "Guardrails & Monitoring",
    description: "Missing validation, logging, authorization, and review controls around AI features.",
    cvss: "6.7",
  },
];

export const aiAuditorFaqs = [
  {
    question: "Does the AI Security Auditor send my prompts or outputs to a server?",
    answer:
      "No. This tool performs its analysis in the browser using deterministic heuristics. It is designed for quick triage without requiring a server-side upload step.",
  },
  {
    question: "What does this tool detect best?",
    answer:
      "It is strongest at spotting prompt injection payloads, unsafe agent/tool access patterns, sensitive output leakage, prompt disclosure, and risky output that could be rendered or executed downstream.",
  },
  {
    question: "Is this enough for a production AI security review?",
    answer:
      "No. Use it as a fast first-pass audit. Production AI systems still need manual threat modeling, permission reviews, integration testing, and adversarial validation against real workflows.",
  },
  {
    question: "Who should use the full audit mode?",
    answer:
      "Teams shipping copilots, RAG apps, AI chatbots, agent workflows, and AI features with filesystem, browser, database, webhook, or email actions benefit most from the full audit mode.",
  },
];

const promptRules: PhraseRule[] = [
  {
    id: "direct-override",
    category: "Prompt Override Attempt",
    severity: "Critical",
    confidence: "High",
    finding: "Direct instruction override phrases detected",
    description: "The prompt contains phrases commonly used to bypass or replace system and developer instructions.",
    remediation: "Reject or heavily sanitize user content containing instruction override language. Keep system prompts separate from user text and enforce policy-aware validation before model execution.",
    cvss: "9.8",
    patterns: [
      "ignore previous instructions",
      "ignore all prior instructions",
      "disregard previous instructions",
      "forget previous instructions",
      "override system prompt",
      "bypass safety",
    ],
    owasp: ["prompt-injection"],
  },
  {
    id: "role-jailbreak",
    category: "Role & Policy Jailbreak",
    severity: "High",
    confidence: "High",
    finding: "Role-play or unrestricted-mode jailbreak language detected",
    description: "The prompt attempts to coerce the model into a different persona or policy regime in order to bypass controls.",
    remediation: "Use intent classifiers or prompt shields that detect role-play jailbreaks. Keep tool execution and sensitive actions isolated from raw model output.",
    cvss: "8.7",
    patterns: [
      "pretend you are",
      "act as if you are",
      "you are now",
      "developer mode",
      "dan mode",
      "unrestricted mode",
      "roleplay as",
    ],
    owasp: ["prompt-injection"],
  },
  {
    id: "prompt-disclosure",
    category: "Prompt & Memory Exfiltration",
    severity: "Critical",
    confidence: "High",
    finding: "The input asks the model to reveal hidden instructions or internal memory",
    description: "Prompts that request system prompts, developer messages, chain-of-thought, or conversation memory are classic disclosure attempts.",
    remediation: "Block disclosure requests at the application layer and scrub system prompts or hidden context from logs, debug panels, and user-visible traces.",
    cvss: "9.1",
    patterns: [
      "show me your system prompt",
      "reveal your system prompt",
      "print your hidden instructions",
      "developer message",
      "chain of thought",
      "conversation memory",
    ],
    owasp: ["prompt-injection", "sensitive-disclosure"],
  },
  {
    id: "encoded-instructions",
    category: "Encoded Instruction Smuggling",
    severity: "High",
    confidence: "Medium",
    finding: "Encoded or obfuscated instruction language detected",
    description: "The prompt references encoded payloads or translation steps often used to hide malicious instructions from naive filters.",
    remediation: "Normalize user input before inspection, decode or reject suspicious encodings, and scan both raw and transformed content before execution.",
    cvss: "8.2",
    patterns: ["base64", "rot13", "hex encoded", "decode this", "decrypt this", "translate this cipher"],
    owasp: ["prompt-injection"],
  },
  {
    id: "indirect-injection",
    category: "Indirect Prompt Injection",
    severity: "High",
    confidence: "Medium",
    finding: "Hidden or retrieved-content instruction markers detected",
    description: "The prompt references comments, metadata, HTML fragments, or retrieved documents that can smuggle instructions into model context.",
    remediation: "Strip markup comments, hidden fields, and tool metadata before retrieval augmentation. Apply content provenance and instruction isolation for retrieved documents.",
    cvss: "8.4",
    patterns: ["<!--", "hidden instructions", "inside the document", "retrieved context", "metadata says", "tool result says"],
    owasp: ["prompt-injection"],
  },
  {
    id: "action-coercion",
    category: "Unsafe Action Coercion",
    severity: "High",
    confidence: "High",
    finding: "The prompt is attempting to trigger high-impact agent actions",
    description: "The input explicitly asks the model or agent to execute tools, read secrets, change state, or perform risky external actions.",
    remediation: "Require policy checks before any tool call, block direct action requests from untrusted inputs, and gate state-changing operations behind approval and authorization.",
    cvss: "8.8",
    patterns: [
      "run this command",
      "execute shell",
      "read /etc/passwd",
      "send this to",
      "delete the record",
      "drop the table",
      "transfer the funds",
    ],
    owasp: ["excessive-agency", "tooling-access"],
  },
];

const toolRules: PhraseRule[] = [
  {
    id: "shell-access",
    category: "Command Execution Access",
    severity: "Critical",
    confidence: "High",
    finding: "Shell or terminal execution access is described in the agent context",
    description: "Shell access dramatically increases blast radius when prompt injection or authorization failures exist.",
    remediation: "Remove shell access from public-facing agents, use a minimal allowlist of operations, and require strong approval gates before any command execution.",
    cvss: "9.3",
    patterns: ["shell access", "bash", "terminal", "command execution", "powershell", "exec("],
    owasp: ["excessive-agency", "tooling-access"],
  },
  {
    id: "filesystem-access",
    category: "Overbroad Filesystem Access",
    severity: "High",
    confidence: "High",
    finding: "The agent appears to have broad filesystem access",
    description: "Filesystem tools with wide scopes can expose secrets, source code, customer data, and deployment artifacts.",
    remediation: "Scope filesystem tools to narrow directories, block dotfiles and secrets, and avoid mounting entire workspaces or root paths into agent tools.",
    cvss: "8.6",
    patterns: ["filesystem", "read file", "write file", "local disk", "/", "workspace root"],
    owasp: ["tooling-access"],
  },
  {
    id: "database-privilege",
    category: "Database Write or Admin Access",
    severity: "Critical",
    confidence: "High",
    finding: "The deployment notes mention database access with potential write or admin scope",
    description: "AI agents with broad database privileges can cause destructive actions or exfiltrate regulated data.",
    remediation: "Use read-only roles where possible, isolate production data, and require separate privileged workflows for write operations.",
    cvss: "9.1",
    patterns: ["database", "postgres", "mysql", "mongodb", "write access", "admin role", "production db"],
    owasp: ["tooling-access", "sensitive-disclosure"],
  },
  {
    id: "browser-webhook-actions",
    category: "External Action Surface",
    severity: "High",
    confidence: "Medium",
    finding: "The agent can interact with browsers, webhooks, or external messaging systems",
    description: "Browser, webhook, email, or payment actions expand abuse paths and should be tightly controlled.",
    remediation: "Separate read-only observation from write-capable actions, validate destinations, and maintain policy checks for outbound requests and notifications.",
    cvss: "8.1",
    patterns: ["browser", "webhook", "send email", "slack", "payment", "click button", "external request"],
    owasp: ["excessive-agency", "tooling-access"],
  },
  {
    id: "secret-env-access",
    category: "Secrets & Environment Exposure",
    severity: "Critical",
    confidence: "High",
    finding: "The context suggests access to environment variables, secrets, or service credentials",
    description: "If an agent can read environment variables, tokens, or service account credentials, a prompt or tool misuse can quickly become credential theft.",
    remediation: "Keep secrets outside model-accessible context, proxy sensitive actions through narrowly scoped backends, and prevent direct secret reads by tools.",
    cvss: "9.0",
    patterns: ["environment variables", "env vars", "service account", "api token", "secret key", "access key"],
    owasp: ["sensitive-disclosure", "tooling-access"],
  },
  {
    id: "autonomous-actions",
    category: "No Human Approval Path",
    severity: "High",
    confidence: "Medium",
    finding: "The notes imply autonomous execution without explicit human review",
    description: "AI systems performing high-impact actions without human approval increase the risk of prompt injection, business logic abuse, and accidental harmful actions.",
    remediation: "Introduce approval gates for state-changing actions, especially those involving external side effects, spending, deletion, or customer communications.",
    cvss: "8.4",
    patterns: ["automatically execute", "no approval", "auto approve", "fully autonomous", "without review"],
    owasp: ["excessive-agency", "monitoring-controls"],
  },
];

const outputRules: RegexRule[] = [
  {
    id: "aws-access-key",
    category: "Credential Exposure",
    severity: "Critical",
    confidence: "High",
    finding: "AWS-style access keys detected in model output",
    description: "Access keys in model output indicate serious data handling and secrets management issues.",
    remediation: "Scrub secrets before prompts reach the model, add output redaction, and rotate any exposed keys immediately.",
    cvss: "9.5",
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g,
    owasp: ["sensitive-disclosure"],
  },
  {
    id: "openai-key",
    category: "Credential Exposure",
    severity: "Critical",
    confidence: "High",
    finding: "API keys or platform secrets detected in output",
    description: "The output contains token formats commonly associated with production credentials.",
    remediation: "Add redaction for secrets, prevent direct secret retrieval, and rotate any leaked credentials.",
    cvss: "9.4",
    pattern: /\b(?:sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/g,
    owasp: ["sensitive-disclosure"],
  },
  {
    id: "private-key",
    category: "Private Key Disclosure",
    severity: "Critical",
    confidence: "High",
    finding: "Private key material detected in output",
    description: "The model output includes private key blocks or cryptographic material that should never be disclosed.",
    remediation: "Block key material from prompts, redact output, and rotate affected keys or certificates immediately.",
    cvss: "9.7",
    pattern: /-----BEGIN (?:RSA|OPENSSH|EC|DSA|PGP) PRIVATE KEY-----/g,
    owasp: ["sensitive-disclosure"],
  },
  {
    id: "password-assignment",
    category: "Password Exposure",
    severity: "Critical",
    confidence: "High",
    finding: "Password-like assignments detected in model output",
    description: "The output appears to disclose raw passwords or password fields with values.",
    remediation: "Strip credentials before model access, redact responses, and never allow models to echo raw credential material.",
    cvss: "9.3",
    pattern: /\b(?:password|passwd|pwd)\b\s*[:=]\s*[^\s"']{6,}/gi,
    owasp: ["sensitive-disclosure"],
  },
  {
    id: "database-uri",
    category: "Database Credential Disclosure",
    severity: "Critical",
    confidence: "High",
    finding: "Database connection strings with credentials detected",
    description: "The output contains connection strings that likely embed usernames or passwords for live services.",
    remediation: "Replace raw connection strings with placeholders, proxy database access through backends, and rotate exposed credentials.",
    cvss: "9.2",
    pattern: /\b(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql):\/\/[^\s]+:[^\s]+@[^\s]+/gi,
    owasp: ["sensitive-disclosure", "tooling-access"],
  },
  {
    id: "jwt-token",
    category: "Token Disclosure",
    severity: "High",
    confidence: "Medium",
    finding: "JWT- or bearer-like tokens detected in output",
    description: "The output contains long token formats that may represent active session or API credentials.",
    remediation: "Mask tokens in logs and outputs, and avoid exposing authorization material to models unless strictly necessary and ephemeral.",
    cvss: "8.5",
    pattern: /\b(?:Bearer\s+[A-Za-z0-9._-]{20,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9._-]{10,}\.[A-Za-z0-9._-]{10,})\b/g,
    owasp: ["sensitive-disclosure"],
  },
  {
    id: "pii-email",
    category: "Email Address Disclosure",
    severity: "Medium",
    confidence: "Low",
    finding: "Email addresses detected in output",
    description: "Email addresses are not always sensitive, but they should be reviewed when the output is intended to avoid PII disclosure.",
    remediation: "Mask customer emails when not required, and apply output filtering for regulated or internal datasets.",
    cvss: "4.8",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    owasp: ["sensitive-disclosure"],
  },
  {
    id: "credit-card",
    category: "Payment Data Disclosure",
    severity: "Critical",
    confidence: "Medium",
    finding: "Potential payment card numbers detected in output",
    description: "The output contains number sequences that resemble card data and should be validated immediately.",
    remediation: "Apply DLP and PCI-aware filtering before output is shown or logged, and remove any card data from prompts and training traces.",
    cvss: "9.0",
    pattern: /\b(?:\d[ -]*?){13,19}\b/g,
    validator: (value) => luhnCheck(value),
    owasp: ["sensitive-disclosure"],
  },
  {
    id: "private-ip",
    category: "Internal Infrastructure Disclosure",
    severity: "Medium",
    confidence: "Medium",
    finding: "Private or internal IP addresses detected in output",
    description: "Internal addressing can expose infrastructure layout and should be minimized in user-visible model responses.",
    remediation: "Mask private network details in outputs and limit the model's exposure to internal infrastructure metadata.",
    cvss: "5.2",
    pattern: /\b(?:(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(?:172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})|(?:192\.168\.\d{1,3}\.\d{1,3})|(?:127\.0\.0\.1)|(?:localhost))\b/gi,
    owasp: ["sensitive-disclosure"],
  },
  {
    id: "system-prompt-leak",
    category: "System Prompt Disclosure",
    severity: "High",
    confidence: "Medium",
    finding: "The output appears to reveal hidden instructions or internal policy text",
    description: "The response includes markers associated with system prompts, hidden rules, or internal policy content that should not be user-visible.",
    remediation: "Block prompt disclosure requests, strip system text from traces, and isolate hidden instructions from user-visible channels.",
    cvss: "8.0",
    pattern: /\b(?:system prompt|developer instructions|hidden instructions|internal policy|do not reveal|chain of thought)\b/gi,
    owasp: ["prompt-injection", "sensitive-disclosure"],
  },
  {
    id: "executable-markup",
    category: "Executable Markup in Output",
    severity: "High",
    confidence: "High",
    finding: "The model output contains executable markup or script-like payloads",
    description: "If this output is rendered directly into HTML, chat widgets, or downstream applications, it can enable XSS or unsafe execution.",
    remediation: "Escape model output before rendering, disallow raw HTML from untrusted outputs, and validate content before downstream execution.",
    cvss: "8.2",
    pattern: /(?:<script\b|javascript:|onerror\s*=|onload\s*=|<iframe\b|<img\b[^>]+onerror)/gi,
    owasp: ["insecure-output"],
  },
  {
    id: "unsafe-command-output",
    category: "Unsafe Command or Query Output",
    severity: "Medium",
    confidence: "Medium",
    finding: "The output includes commands or queries that could be dangerous if executed automatically",
    description: "Generated shell or SQL snippets are risky when copied into automation or executed without review.",
    remediation: "Require human review for generated commands, block direct execution of model output, and add allowlists for permitted operations.",
    cvss: "6.8",
    pattern: /(?:rm\s+-rf|curl\s+[^\n]+\|\s*(?:bash|sh)|DROP\s+TABLE|DELETE\s+FROM|chmod\s+777|Invoke-Expression)/gi,
    owasp: ["insecure-output", "excessive-agency"],
  },
];

function luhnCheck(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number.parseInt(digits[index], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function uniqueEvidence(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, 5);
}

function collectPhraseEvidence(text: string, phrases: string[]): string[] {
  const normalized = normalizeText(text);
  return uniqueEvidence(
    phrases.filter((phrase) => normalized.includes(phrase.toLowerCase()))
  );
}

function collectRegexEvidence(text: string, pattern: RegExp, validator?: (value: string) => boolean): string[] {
  const matches = [...text.matchAll(new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`))]
    .map((match) => match[0])
    .filter((value) => (validator ? validator(value) : true));

  return uniqueEvidence(matches);
}

function mergeFinding(existing: AuditFinding | undefined, incoming: AuditFinding): AuditFinding {
  if (!existing) return incoming;

  return {
    ...existing,
    severity: severityRank[incoming.severity] > severityRank[existing.severity] ? incoming.severity : existing.severity,
    confidence:
      confidenceRank[incoming.confidence] > confidenceRank[existing.confidence]
        ? incoming.confidence
        : existing.confidence,
    evidence: uniqueEvidence([...existing.evidence, ...incoming.evidence]),
    owasp: [...new Set([...existing.owasp, ...incoming.owasp])],
  };
}

function addFinding(store: Map<string, AuditFinding>, finding: AuditFinding) {
  store.set(finding.id, mergeFinding(store.get(finding.id), finding));
}

function buildFinding(rule: PhraseRule | RegexRule, evidence: string[]): AuditFinding {
  return {
    id: rule.id,
    category: rule.category,
    severity: rule.severity,
    confidence: rule.confidence,
    finding: rule.finding,
    description: rule.description,
    remediation: rule.remediation,
    cvss: rule.cvss,
    evidence,
    owasp: rule.owasp,
  };
}

function scanPromptContent(store: Map<string, AuditFinding>, input: AuditInput) {
  const promptText = [input.systemPrompt, input.userPrompt].filter(Boolean).join("\n\n");
  if (!promptText.trim()) return;

  for (const rule of promptRules) {
    const evidence = collectPhraseEvidence(promptText, rule.patterns);
    if (evidence.length > 0) addFinding(store, buildFinding(rule, evidence));
  }

  if (promptText.length > 8000) {
    addFinding(store, {
      id: "prompt-size",
      category: "Oversized Prompt Payload",
      severity: "Medium",
      confidence: "Medium",
      finding: "Very large prompt content detected",
      description: "Large prompts can increase cost, latency, and denial-of-service exposure while also making malicious instructions harder to review.",
      remediation: "Cap prompt size, summarize retrieved content before model use, and reject unusually large untrusted payloads.",
      cvss: "5.9",
      evidence: [`Prompt length: ${promptText.length} characters`],
      owasp: ["prompt-injection", "monitoring-controls"],
    });
  }
}

function scanToolingContext(store: Map<string, AuditFinding>, input: AuditInput) {
  const toolText = [input.connectedTools, input.deploymentNotes, input.systemPrompt]
    .filter(Boolean)
    .join("\n\n");
  if (!toolText.trim()) return;

  for (const rule of toolRules) {
    const evidence = collectPhraseEvidence(toolText, rule.patterns);
    if (evidence.length > 0) addFinding(store, buildFinding(rule, evidence));
  }
}

function scanModelOutput(store: Map<string, AuditFinding>, input: AuditInput) {
  const outputText = input.modelOutput;
  if (!outputText.trim()) return;

  for (const rule of outputRules) {
    const evidence = collectRegexEvidence(outputText, rule.pattern, rule.validator);
    if (evidence.length > 0) addFinding(store, buildFinding(rule, evidence));
  }
}

function addControlFindings(store: Map<string, AuditFinding>, input: AuditInput) {
  const findings = [...store.values()];
  const hasPromptRisk = findings.some((finding) => finding.owasp.includes("prompt-injection"));
  const hasToolRisk = findings.some((finding) => finding.owasp.includes("tooling-access") || finding.owasp.includes("excessive-agency"));
  const hasLeakRisk = findings.some((finding) => finding.owasp.includes("sensitive-disclosure"));
  const hasOutputRisk = findings.some((finding) => finding.owasp.includes("insecure-output"));

  if ((hasPromptRisk || input.userPrompt || input.systemPrompt) && !input.controls.inputValidation) {
    addFinding(store, {
      id: "missing-input-validation",
      category: "Missing Prompt Validation Control",
      severity: hasPromptRisk ? "High" : "Medium",
      confidence: "High",
      finding: "Prompt validation and sanitization controls are not marked as enabled",
      description: "Without pre-execution validation, prompt attacks can reach the model and any connected tools more directly.",
      remediation: "Add prompt validation, context separation, content normalization, and policy-aware filtering before requests reach the model.",
      cvss: hasPromptRisk ? "8.0" : "6.0",
      evidence: ["Input validation control is disabled"],
      owasp: ["monitoring-controls", "prompt-injection"],
    });
  }

  if ((hasLeakRisk || hasOutputRisk || input.modelOutput) && !input.controls.outputFiltering) {
    addFinding(store, {
      id: "missing-output-filtering",
      category: "Missing Output Filtering Control",
      severity: hasLeakRisk ? "High" : "Medium",
      confidence: "High",
      finding: "Output filtering or redaction is not marked as enabled",
      description: "Unfiltered output increases the chance that secrets, PII, executable markup, or dangerous commands are shown to users or downstream systems.",
      remediation: "Apply response redaction, HTML escaping, DLP checks, and allowlist-based validation before output is rendered or executed.",
      cvss: hasLeakRisk ? "8.2" : "6.4",
      evidence: ["Output filtering control is disabled"],
      owasp: ["monitoring-controls", "insecure-output", "sensitive-disclosure"],
    });
  }

  if (hasToolRisk && !input.controls.toolAllowlist) {
    addFinding(store, {
      id: "missing-tool-allowlist",
      category: "Missing Tool Allowlist",
      severity: "High",
      confidence: "High",
      finding: "Connected tools are present but scoped allowlists are not enabled",
      description: "Tool access without explicit capability scoping makes prompt injection and workflow abuse materially more dangerous.",
      remediation: "Limit each tool to the minimum viable action set and enforce deny-by-default policies for tool invocation.",
      cvss: "8.1",
      evidence: ["Tool allowlist control is disabled"],
      owasp: ["tooling-access", "monitoring-controls"],
    });
  }

  if (hasToolRisk && !input.controls.humanApproval) {
    addFinding(store, {
      id: "missing-human-approval",
      category: "Missing Human Approval Gate",
      severity: "High",
      confidence: "Medium",
      finding: "High-impact agent workflows are not marked as requiring human approval",
      description: "State-changing agent actions are significantly riskier when they run end-to-end without human review.",
      remediation: "Require human approval for external side effects such as file writes, purchases, emails, tickets, deletions, or production changes.",
      cvss: "7.9",
      evidence: ["Human approval control is disabled"],
      owasp: ["excessive-agency", "monitoring-controls"],
    });
  }

  if (hasToolRisk && !input.controls.authz) {
    addFinding(store, {
      id: "missing-authz",
      category: "Missing Authorization Guard",
      severity: "High",
      confidence: "High",
      finding: "Authorization enforcement is not marked as enabled for agent or tool actions",
      description: "Authorization checks are essential when models can trigger side effects or access differentiated data scopes.",
      remediation: "Enforce per-action authorization, user-to-tool identity binding, and least-privilege execution for every tool call.",
      cvss: "8.3",
      evidence: ["Authorization control is disabled"],
      owasp: ["tooling-access", "monitoring-controls", "excessive-agency"],
    });
  }

  if (hasLeakRisk && !input.controls.secretsIsolation) {
    addFinding(store, {
      id: "missing-secrets-isolation",
      category: "Missing Secrets Isolation",
      severity: "High",
      confidence: "High",
      finding: "Secrets isolation is not marked as enabled despite sensitive access risk",
      description: "Secrets and credentials should not be directly accessible to prompts, agent tools, or raw model context.",
      remediation: "Keep secrets in server-side vault-backed services and expose only narrow actions, not raw secret material, to the model.",
      cvss: "8.4",
      evidence: ["Secrets isolation control is disabled"],
      owasp: ["sensitive-disclosure", "monitoring-controls", "tooling-access"],
    });
  }

  if ((hasPromptRisk || hasToolRisk || hasLeakRisk) && !input.controls.logging) {
    addFinding(store, {
      id: "missing-logging",
      category: "Insufficient Monitoring & Auditability",
      severity: "Medium",
      confidence: "High",
      finding: "Logging and security monitoring are not marked as enabled",
      description: "Without logs and alerting, incident response, abuse detection, and root-cause analysis become much harder for AI workloads.",
      remediation: "Log prompt sources, model decisions, tool calls, denials, and policy outcomes with privacy-aware retention and alerting.",
      cvss: "6.4",
      evidence: ["Logging control is disabled"],
      owasp: ["monitoring-controls"],
    });
  }
}

function buildNarrative(summary: SecurityScore["summary"], controlCount: number): string {
  if (summary.critical > 0) {
    return `Critical issues were detected. Treat this workflow as unsafe for production until prompt handling, tool permissions, and output controls are tightened. ${controlCount} defensive controls are currently marked as enabled.`;
  }

  if (summary.high > 0) {
    return `The workflow shows material risk that could lead to prompt abuse, data leakage, or unsafe actions. Prioritize control gaps and high-severity findings before wider rollout. ${controlCount} defensive controls are currently marked as enabled.`;
  }

  if (summary.medium > 0 || summary.low > 0) {
    return `No critical issues were found, but the audit still surfaced weaknesses worth addressing before production scaling. ${controlCount} defensive controls are currently marked as enabled.`;
  }

  return `No obvious high-risk patterns were detected in the provided material. This is a good first-pass result, but production AI systems still require manual review and adversarial testing. ${controlCount} defensive controls are currently marked as enabled.`;
}

function buildCategoryScores(findings: AuditFinding[], controls: AuditorControls): CategoryScore[] {
  return auditorCategories.map((category) => {
    const related = findings.filter((finding) => finding.owasp.includes(category.key));
    const penalty = related.reduce((sum, finding) => {
      if (finding.severity === "Pass") return sum;
      return sum + severityWeight[finding.severity] * confidenceWeight[finding.confidence];
    }, 0);

    let controlBonus = 0;
    if (category.key === "monitoring-controls") {
      controlBonus =
        Number(controls.logging) * 4 +
        Number(controls.inputValidation) * 3 +
        Number(controls.outputFiltering) * 3;
    } else if (category.key === "tooling-access") {
      controlBonus =
        Number(controls.toolAllowlist) * 4 +
        Number(controls.authz) * 4 +
        Number(controls.secretsIsolation) * 2;
    } else if (category.key === "excessive-agency") {
      controlBonus = Number(controls.humanApproval) * 6 + Number(controls.authz) * 3;
    } else if (category.key === "sensitive-disclosure") {
      controlBonus = Number(controls.outputFiltering) * 4 + Number(controls.secretsIsolation) * 4;
    } else if (category.key === "prompt-injection") {
      controlBonus = Number(controls.inputValidation) * 5;
    } else if (category.key === "insecure-output") {
      controlBonus = Number(controls.outputFiltering) * 5;
    }

    const score = Math.max(18, Math.min(96, Math.round(94 - penalty + controlBonus)));
    const summary =
      related.length === 0
        ? "No direct findings from the submitted sample."
        : `${related.length} finding${related.length === 1 ? "" : "s"} mapped to this category.`;

    return {
      key: category.key,
      name: category.title,
      score,
      summary,
    };
  });
}

export function analyzeAiSecurity(input: AuditInput): AuditReport {
  const store = new Map<string, AuditFinding>();

  scanPromptContent(store, input);
  scanToolingContext(store, input);
  scanModelOutput(store, input);
  addControlFindings(store, input);

  const findings = [...store.values()].sort((left, right) => {
    if (severityRank[left.severity] !== severityRank[right.severity]) {
      return severityRank[right.severity] - severityRank[left.severity];
    }
    return confidenceRank[right.confidence] - confidenceRank[left.confidence];
  });

  if (findings.length === 0) {
    findings.push({
      id: "baseline-pass",
      category: "Baseline Security Review",
      severity: "Pass",
      confidence: "Medium",
      finding: "No obvious high-risk indicators were detected in the submitted material",
      description: "The provided prompts, outputs, and workflow notes do not show common prompt injection or data leakage indicators based on this heuristic audit.",
      remediation: "Keep validating prompts, scope tool permissions, and run deeper manual security testing before production launch.",
      evidence: ["No matching risky phrases or output patterns were found"],
      owasp: ["monitoring-controls"],
    });
  }

  const summary = {
    critical: findings.filter((finding) => finding.severity === "Critical").length,
    high: findings.filter((finding) => finding.severity === "High").length,
    medium: findings.filter((finding) => finding.severity === "Medium").length,
    low: findings.filter((finding) => finding.severity === "Low").length,
    pass: findings.filter((finding) => finding.severity === "Pass").length,
  };

  const rawPenalty = findings.reduce((sum, finding) => {
    if (finding.severity === "Pass") return sum;
    return sum + severityWeight[finding.severity] * confidenceWeight[finding.confidence];
  }, 0);

  const enabledControls = Object.values(input.controls).filter(Boolean).length;
  const controlCredit = Math.min(12, enabledControls * 1.5);
  const overall = Math.max(10, Math.min(100, Math.round(100 - rawPenalty + controlCredit)));

  return {
    findings,
    score: {
      overall,
      summary,
      narrative: buildNarrative(summary, enabledControls),
      categories: buildCategoryScores(findings, input.controls),
    },
  };
}