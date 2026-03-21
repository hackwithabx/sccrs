import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShieldXAlertConfig from "@/models/ShieldXAlertConfig";
import {
  getShieldXSessionUser,
  hasShieldXAccess,
} from "@/lib/shieldx-access";

export const dynamic = "force-dynamic";

const DEFAULT_ALERT_RULES = [
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

function normalizeRules(input: unknown) {
  if (!Array.isArray(input)) {
    return DEFAULT_ALERT_RULES;
  }

  const rules = input
    .map((item) => {
      const raw = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const severity = String(raw.severity || "");
      if (!["critical", "high", "medium"].includes(severity)) {
        return null;
      }

      return {
        id: String(raw.id || "").slice(0, 80),
        name: String(raw.name || "").slice(0, 120),
        description: String(raw.description || "").slice(0, 240),
        severity,
        enabled: Boolean(raw.enabled),
      };
    })
    .filter(
      (
        rule
      ): rule is {
        id: string;
        name: string;
        description: string;
        severity: "critical" | "high" | "medium";
        enabled: boolean;
      } => Boolean(rule?.id && rule?.name)
    );

  return rules.length > 0 ? rules : DEFAULT_ALERT_RULES;
}

export async function GET(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasShieldXAccess(sessionUser, "pro")) {
    return NextResponse.json(
      { error: "ShieldX Pro or Enterprise is required" },
      { status: 403 }
    );
  }

  try {
    await dbConnect();

    const existingConfig = await ShieldXAlertConfig.findOne({
      userId: sessionUser.id,
    }).lean();

    return NextResponse.json({
      config: existingConfig || {
        email: sessionUser.email,
        slackWebhook: "",
        customWebhook: "",
        threshold: "critical",
        rules: DEFAULT_ALERT_RULES,
        lastTestedAt: null,
      },
    });
  } catch (error) {
    console.error("Failed to load ShieldX alerts:", error);
    return NextResponse.json(
      { error: "Failed to load alert configuration" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasShieldXAccess(sessionUser, "pro")) {
    return NextResponse.json(
      { error: "ShieldX Pro or Enterprise is required" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const slackWebhook = String(body?.slackWebhook || "").trim();
    const customWebhook = String(body?.customWebhook || "").trim();
    const threshold = String(body?.threshold || "critical");

    if (!["critical", "high", "all"].includes(threshold)) {
      return NextResponse.json(
        { error: "Invalid alert threshold" },
        { status: 400 }
      );
    }

    // Validate webhook URLs (SSRF prevention)
    for (const [label, url] of [["Slack webhook", slackWebhook], ["Custom webhook", customWebhook]] as const) {
      if (!url) continue;
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:") {
          return NextResponse.json({ error: `${label} must use HTTPS` }, { status: 400 });
        }
        const hostname = parsed.hostname.toLowerCase();
        const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1", "169.254.169.254", "metadata.google.internal"];
        const blockedPrefixes = ["10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31.", "169.254."];
        if (blocked.includes(hostname) || blockedPrefixes.some((p) => hostname.startsWith(p))) {
          return NextResponse.json({ error: `${label} URL points to a blocked address` }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: `${label} URL is invalid` }, { status: 400 });
      }
    }

    await dbConnect();

    const config = await ShieldXAlertConfig.findOneAndUpdate(
      { userId: sessionUser.id },
      {
        userId: sessionUser.id,
        email,
        slackWebhook,
        customWebhook,
        threshold,
        rules: normalizeRules(body?.rules),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Failed to save ShieldX alerts:", error);
    return NextResponse.json(
      { error: "Failed to save alert configuration" },
      { status: 500 }
    );
  }
}

