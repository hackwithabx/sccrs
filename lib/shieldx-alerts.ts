import nodemailer from "nodemailer";
import ShieldXAlertConfig from "@/models/ShieldXAlertConfig";

type AlertThreshold = "critical" | "high" | "all";
type FindingSeverity = "Critical" | "High" | "Medium" | "Low" | "Info";

interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: "critical" | "high" | "medium";
  enabled: boolean;
}

interface AlertConfigLike {
  email?: string;
  slackWebhook?: string;
  customWebhook?: string;
  threshold?: AlertThreshold;
  rules?: AlertRule[];
  lastTestedAt?: Date | null;
  save?: () => Promise<unknown>;
}

interface AlertFinding {
  category: string;
  status: "pass" | "warning" | "fail";
  finding: string;
  recommendation: string;
  severity: FindingSeverity;
}

interface AlertScanPayload {
  userId: string;
  userEmail: string;
  userName: string;
  scanType: string;
  title: string;
  target: string;
  overallScore: number;
  summary: string;
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    findingsTotal: number;
  };
  findings: AlertFinding[];
}

interface AlertDeliveryResult {
  channel: "email" | "slack" | "webhook";
  ok: boolean;
  message: string;
}

const DEFAULT_RULES: AlertRule[] = [
  {
    id: "critical-secrets",
    name: "Critical Secrets Detected",
    description: "Alert when high-confidence secrets are found during scanning",
    severity: "critical",
    enabled: true,
  },
  {
    id: "critical-cve",
    name: "Critical Dependency Vulnerabilities",
    description: "Alert when dependency scans find critical CVEs",
    severity: "critical",
    enabled: true,
  },
  {
    id: "cloud-failures",
    name: "Cloud Security Failures",
    description: "Alert when cloud configuration checks fail",
    severity: "high",
    enabled: true,
  },
  {
    id: "api-low-score",
    name: "Low API Security Score",
    description: "Alert when API endpoint scores below 5/10",
    severity: "high",
    enabled: true,
  },
  {
    id: "injection-detected",
    name: "Injection Attacks in Logs",
    description: "Alert when SQL injection or XSS patterns are detected in logs",
    severity: "critical",
    enabled: true,
  },
  {
    id: "brute-force",
    name: "Brute Force Attempts",
    description: "Alert when brute force login patterns are detected",
    severity: "high",
    enabled: false,
  },
];

function severityRank(severity: string): number {
  const normalized = severity.toLowerCase();
  if (normalized === "critical") return 4;
  if (normalized === "high") return 3;
  if (normalized === "medium") return 2;
  if (normalized === "low") return 1;
  return 0;
}

function meetsThreshold(severity: string, threshold: AlertThreshold): boolean {
  if (threshold === "all") {
    return severityRank(severity) >= 1;
  }

  if (threshold === "high") {
    return severityRank(severity) >= 3;
  }

  return severityRank(severity) >= 4;
}

function getHighestSeverity(scan: AlertScanPayload): FindingSeverity {
  if (scan.counts.critical > 0) return "Critical";
  if (scan.counts.high > 0) return "High";
  if (scan.counts.medium > 0) return "Medium";
  if (scan.counts.low > 0) return "Low";
  return "Info";
}

function getEnabledRules(config: AlertConfigLike): AlertRule[] {
  const rules =
    Array.isArray(config.rules) && config.rules.length > 0
      ? config.rules
      : DEFAULT_RULES;
  return rules.filter((rule) => rule.enabled);
}

function getTriggeredRules(config: AlertConfigLike, scan: AlertScanPayload) {
  const findingsText = scan.findings.map((finding) => finding.finding).join("\n");
  return getEnabledRules(config).filter((rule) => {
    switch (rule.id) {
      case "critical-secrets":
        return scan.scanType === "secrets" && scan.counts.critical > 0;
      case "critical-cve":
        return scan.scanType === "deps" && scan.counts.critical > 0;
      case "cloud-failures":
        return scan.scanType === "cloud" && scan.counts.findingsTotal > 3;
      case "api-low-score":
        return scan.scanType === "api" && scan.overallScore < 5;
      case "injection-detected":
        return (
          scan.scanType === "logs" &&
          /sql injection|xss|command injection|injection/i.test(findingsText)
        );
      case "brute-force":
        return (
          scan.scanType === "logs" &&
          /brute force|failed login|authentication failed/i.test(findingsText)
        );
      default:
        return false;
    }
  });
}

async function sendEmailAlert(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<AlertDeliveryResult> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || process.env.ADMIN_EMAIL || user;

  if (!host || !port || !user || !pass || !from) {
    return {
      channel: "email",
      ok: false,
      message: "SMTP is not fully configured for ShieldX email alerts.",
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  return {
    channel: "email",
    ok: true,
    message: `Email alert sent to ${input.to}.`,
  };
}

async function sendJsonWebhook(input: {
  channel: "slack" | "webhook";
  url: string;
  payload: Record<string, unknown>;
}): Promise<AlertDeliveryResult> {
  // Validate webhook URL to prevent SSRF
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(input.url);
  } catch {
    return { channel: input.channel, ok: false, message: `Invalid ${input.channel} URL.` };
  }

  if (!["https:"].includes(parsedUrl.protocol)) {
    return { channel: input.channel, ok: false, message: `${input.channel} URL must use HTTPS.` };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const blockedHosts = [
    "localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1",
    "169.254.169.254", "metadata.google.internal", "metadata.goog",
  ];
  const blockedPrefixes = ["10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31.", "169.254."];
  if (blockedHosts.includes(hostname) || blockedPrefixes.some((p) => hostname.startsWith(p))) {
    return { channel: input.channel, ok: false, message: `${input.channel} URL points to a blocked host.` };
  }

  const response = await fetch(input.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input.payload),
  });

  if (!response.ok) {
    return {
      channel: input.channel,
      ok: false,
      message: `${input.channel} endpoint returned ${response.status}.`,
    };
  }

  return {
    channel: input.channel,
    ok: true,
    message: `${input.channel} alert delivered.`,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml(input: {
  title: string;
  summary: string;
  highestSeverity: FindingSeverity;
  triggeredRules: AlertRule[];
  findings: AlertFinding[];
  target: string;
  overallScore: number;
}) {
  const findingsHtml =
    input.findings.length > 0
      ? `<ul>${input.findings
          .slice(0, 5)
          .map(
            (finding) =>
              `<li><strong>${escapeHtml(finding.severity)}:</strong> ${escapeHtml(finding.finding)}</li>`
          )
          .join("")}</ul>`
      : "<p>No detailed findings were stored with this alert.</p>";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 8px;">ShieldX Alert: ${escapeHtml(input.title)}</h2>
      <p style="margin: 0 0 12px;"><strong>Severity:</strong> ${escapeHtml(input.highestSeverity)}</p>
      <p style="margin: 0 0 12px;"><strong>Score:</strong> ${input.overallScore}/10</p>
      <p style="margin: 0 0 12px;"><strong>Target:</strong> ${escapeHtml(input.target || "ShieldX workspace")}</p>
      <p style="margin: 0 0 16px;">${escapeHtml(input.summary)}</p>
      <p style="margin: 0 0 8px;"><strong>Triggered rules:</strong> ${
        input.triggeredRules.length > 0
          ? input.triggeredRules.map((rule) => escapeHtml(rule.name)).join(", ")
          : "Threshold alert"
      }</p>
      ${findingsHtml}
    </div>
  `;
}

async function deliverAlert(input: {
  config: AlertConfigLike;
  title: string;
  summary: string;
  highestSeverity: FindingSeverity;
  triggeredRules: AlertRule[];
  findings: AlertFinding[];
  target: string;
  overallScore: number;
  extraPayload?: Record<string, unknown>;
}) {
  const results: AlertDeliveryResult[] = [];
  const payload = {
    title: input.title,
    summary: input.summary,
    highestSeverity: input.highestSeverity,
    overallScore: input.overallScore,
    target: input.target,
    triggeredRules: input.triggeredRules.map((rule) => rule.name),
    findings: input.findings.slice(0, 10),
    ...input.extraPayload,
  };

  if (input.config.email) {
    try {
      results.push(
        await sendEmailAlert({
          to: input.config.email,
          subject: `ShieldX Alert: ${input.title}`,
          html: buildEmailHtml(input),
        })
      );
    } catch (error) {
      results.push({
        channel: "email",
        ok: false,
        message:
          error instanceof Error ? error.message : "Email alert delivery failed.",
      });
    }
  }

  if (input.config.slackWebhook) {
    try {
      results.push(
        await sendJsonWebhook({
          channel: "slack",
          url: input.config.slackWebhook,
          payload: {
            text: `ShieldX Alert: ${input.title}\nSeverity: ${input.highestSeverity}\nScore: ${input.overallScore}/10\n${input.summary}`,
            shieldx: payload,
          },
        })
      );
    } catch (error) {
      results.push({
        channel: "slack",
        ok: false,
        message:
          error instanceof Error ? error.message : "Slack delivery failed.",
      });
    }
  }

  if (input.config.customWebhook) {
    try {
      results.push(
        await sendJsonWebhook({
          channel: "webhook",
          url: input.config.customWebhook,
          payload: {
            event: "shieldx.alert",
            shieldx: payload,
          },
        })
      );
    } catch (error) {
      results.push({
        channel: "webhook",
        ok: false,
        message:
          error instanceof Error ? error.message : "Webhook delivery failed.",
      });
    }
  }

  return results;
}

export async function sendShieldXTestAlert(input: {
  config: AlertConfigLike;
  userEmail: string;
}) {
  const triggeredRules: AlertRule[] = [];
  const results = await deliverAlert({
    config: input.config,
    title: "ShieldX test alert",
    summary:
      "This is a live outbound test notification from your ShieldX workspace.",
    highestSeverity: "High",
    triggeredRules,
    findings: [
      {
        category: "Alerts",
        status: "warning",
        finding: "Test alert generated from the ShieldX dashboard.",
        recommendation:
          "Confirm the message reached your inbox, Slack channel, or webhook destination.",
        severity: "High",
      },
    ],
    target: "ShieldX paid workspace",
    overallScore: 8,
    extraPayload: {
      type: "test",
      userEmail: input.userEmail,
    },
  });

  if (typeof input.config.save === "function") {
    input.config.lastTestedAt = new Date();
    await input.config.save();
  }

  return results;
}

export async function sendShieldXScanAlerts(scan: AlertScanPayload) {
  const config = await ShieldXAlertConfig.findOne({ userId: scan.userId });
  if (!config) {
    return { sent: false, reason: "No alert config found", results: [] };
  }

  const highestSeverity = getHighestSeverity(scan);
  const triggeredRules = getTriggeredRules(config, scan);

  if (
    triggeredRules.length === 0 &&
    !meetsThreshold(highestSeverity, config.threshold || "critical")
  ) {
    return {
      sent: false,
      reason: "No rules or thresholds triggered",
      results: [],
    };
  }

  const results = await deliverAlert({
    config,
    title: scan.title,
    summary: scan.summary,
    highestSeverity,
    triggeredRules,
    findings: scan.findings,
    target: scan.target,
    overallScore: scan.overallScore,
    extraPayload: {
      type: "scan",
      scanType: scan.scanType,
      userEmail: scan.userEmail,
      userName: scan.userName,
    },
  });

  return {
    sent: results.some((result) => result.ok),
    reason:
      results.length > 0
        ? "Alert delivery attempted"
        : "No configured delivery channels",
    results,
  };
}
