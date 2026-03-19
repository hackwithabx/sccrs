import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser } from "@/lib/shieldx-route-auth";
import { rateLimit } from "@/lib/rate-limit";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const maxDuration = 15;
export const dynamic = "force-dynamic";

/* ── Cloud security checks ── */
interface CloudCheck {
  id: string;
  category: string;
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  evaluate: (config: string) => { status: "pass" | "fail" | "warn"; detail: string };
}

const CLOUD_CHECKS: CloudCheck[] = [
  // IAM & Access
  {
    id: "iam-root-access",
    category: "IAM & Access",
    name: "Root Account Access Keys",
    severity: "critical",
    evaluate: (c) =>
      /root.*access.?key|aws_root|root.?credentials/i.test(c)
        ? { status: "fail", detail: "Root account access keys detected. Remove root keys and use IAM users/roles." }
        : { status: "pass", detail: "No root account access keys found." },
  },
  {
    id: "iam-wildcard",
    category: "IAM & Access",
    name: "Overly Permissive IAM (Wildcard *)",
    severity: "critical",
    evaluate: (c) =>
      /["']?\*["']?\s*[,\]}]|Action.*\*|Resource.*\*/i.test(c) && /iam|policy|role|permission/i.test(c)
        ? { status: "fail", detail: "Wildcard (*) permissions detected in IAM policy. Apply least-privilege principle." }
        : { status: "pass", detail: "No overly permissive wildcard IAM policies detected." },
  },
  {
    id: "iam-mfa",
    category: "IAM & Access",
    name: "MFA Enforcement",
    severity: "high",
    evaluate: (c) =>
      /mfa|multi.?factor|two.?factor|2fa/i.test(c)
        ? { status: "pass", detail: "MFA configuration references found." }
        : { status: "warn", detail: "No MFA configuration detected. Enable MFA for all IAM users." },
  },
  // Encryption
  {
    id: "enc-at-rest",
    category: "Encryption",
    name: "Encryption at Rest",
    severity: "high",
    evaluate: (c) =>
      /encrypt.*false|Encrypted.*false|sse.*disabled|encryption.*disabled/i.test(c)
        ? { status: "fail", detail: "Encryption at rest is explicitly disabled. Enable SSE-S3, SSE-KMS, or equivalent." }
        : /encrypt|kms|sse-s3|sse-kms|aes-256|server.?side.?encryption/i.test(c)
          ? { status: "pass", detail: "Encryption at rest references found." }
          : { status: "warn", detail: "No encryption at rest configuration detected. Verify encryption settings." },
  },
  {
    id: "enc-in-transit",
    category: "Encryption",
    name: "Encryption in Transit (TLS/HTTPS)",
    severity: "high",
    evaluate: (c) =>
      /http:\/\/(?!localhost|127\.0\.0\.1)/i.test(c)
        ? { status: "fail", detail: "Non-HTTPS URLs found (not localhost). Enforce TLS/HTTPS for all connections." }
        : { status: "pass", detail: "No insecure HTTP URLs detected." },
  },
  {
    id: "enc-kms",
    category: "Encryption",
    name: "KMS Key Management",
    severity: "medium",
    evaluate: (c) =>
      /kms|key.?management|cmk|customer.?managed.?key/i.test(c)
        ? { status: "pass", detail: "KMS / customer-managed key configuration detected." }
        : { status: "warn", detail: "No KMS key management configuration. Use AWS KMS, Azure Key Vault, or GCP KMS." },
  },
  // Network
  {
    id: "net-public-access",
    category: "Network",
    name: "Public Access Controls",
    severity: "critical",
    evaluate: (c) =>
      /public.?access.*true|publicly.?accessible.*true|0\.0\.0\.0\/0.*(ingress|inbound|allow)/i.test(c)
        ? { status: "fail", detail: "Resources publicly accessible (0.0.0.0/0). Restrict to specific CIDR ranges." }
        : { status: "pass", detail: "No overly permissive public access rules detected." },
  },
  {
    id: "net-sg-open",
    category: "Network",
    name: "Security Group Open Ports",
    severity: "high",
    evaluate: (c) =>
      /0\.0\.0\.0\/0.*(?:22|3389|3306|5432|27017|6379)/i.test(c) || /(?:ssh|rdp|mysql|postgres|mongo|redis).*0\.0\.0\.0/i.test(c)
        ? { status: "fail", detail: "Sensitive ports (SSH/RDP/DB) open to 0.0.0.0/0. Restrict to known IPs or VPN." }
        : { status: "pass", detail: "No sensitive ports open to the internet." },
  },
  {
    id: "net-vpc-flow",
    category: "Network",
    name: "VPC Flow Logs",
    severity: "medium",
    evaluate: (c) =>
      /flow.?log|vpc.?log|network.?log/i.test(c)
        ? { status: "pass", detail: "VPC flow logging configuration detected." }
        : { status: "warn", detail: "No VPC flow log configuration found. Enable for network traffic visibility." },
  },
  // Logging & Monitoring
  {
    id: "log-cloudtrail",
    category: "Logging & Monitoring",
    name: "Audit Logging (CloudTrail/Activity Log)",
    severity: "high",
    evaluate: (c) =>
      /cloudtrail|activity.?log|audit.?log|cloud.?audit/i.test(c)
        ? { status: "pass", detail: "Audit logging configuration detected." }
        : { status: "warn", detail: "No audit logging configuration found. Enable CloudTrail or equivalent." },
  },
  {
    id: "log-alarm",
    category: "Logging & Monitoring",
    name: "Security Alarms/Alerts",
    severity: "medium",
    evaluate: (c) =>
      /alarm|alert|notification|sns|cloudwatch|monitor/i.test(c)
        ? { status: "pass", detail: "Security alerting/monitoring configuration detected." }
        : { status: "warn", detail: "No alarm/alert configuration found. Set up CloudWatch alarms or similar." },
  },
  // Storage
  {
    id: "stor-bucket-public",
    category: "Storage",
    name: "Public S3/Blob/GCS Buckets",
    severity: "critical",
    evaluate: (c) =>
      /public-read|public-read-write|acl.*public|BlockPublicAccess.*false|allow.?public.?access/i.test(c)
        ? { status: "fail", detail: "Public bucket access detected. Block public access and review bucket policies." }
        : { status: "pass", detail: "No public bucket configurations detected." },
  },
  {
    id: "stor-versioning",
    category: "Storage",
    name: "Storage Versioning",
    severity: "medium",
    evaluate: (c) =>
      /versioning.*enabled|version.*true|object.?versioning/i.test(c)
        ? { status: "pass", detail: "Object versioning enabled." }
        : /versioning.*disabled|versioning.*false/i.test(c)
          ? { status: "fail", detail: "Object versioning is disabled. Enable for data recovery." }
          : { status: "warn", detail: "No versioning configuration detected. Enable for data protection." },
  },
  // Compute
  {
    id: "comp-imds-v2",
    category: "Compute",
    name: "Instance Metadata Service (IMDSv2)",
    severity: "high",
    evaluate: (c) =>
      /HttpTokens.*required|imdsv2|metadata.*v2/i.test(c)
        ? { status: "pass", detail: "IMDSv2 enforced." }
        : /HttpTokens.*optional|imdsv1|IMDSv1/i.test(c)
          ? { status: "fail", detail: "IMDSv1 is still allowed. Enforce IMDSv2 to prevent SSRF metadata attacks." }
          : { status: "warn", detail: "No IMDS configuration found. Enforce IMDSv2 on all EC2 instances." },
  },
  {
    id: "comp-auto-update",
    category: "Compute",
    name: "Auto-Patching / Updates",
    severity: "medium",
    evaluate: (c) =>
      /auto.?update|patch.?management|ssm.?patch|systems.?manager/i.test(c)
        ? { status: "pass", detail: "Auto-patching / update management configured." }
        : { status: "warn", detail: "No auto-patching configuration. Use SSM Patch Manager, Azure Update, or equivalent." },
  },
  // Misc
  {
    id: "misc-hardcoded-creds",
    category: "Credentials",
    name: "Hardcoded Credentials in Config",
    severity: "critical",
    evaluate: (c) =>
      /password\s*[:=]\s*['"][^'"]{4,}['"]|secret\s*[:=]\s*['"][^'"]{6,}['"]/i.test(c) && !/example|changeme|placeholder|your_/i.test(c)
        ? { status: "fail", detail: "Hardcoded passwords/secrets detected in config. Use a secrets manager." }
        : { status: "pass", detail: "No hardcoded credentials detected." },
  },
  {
    id: "misc-debug-mode",
    category: "Configuration",
    name: "Debug Mode Enabled",
    severity: "medium",
    evaluate: (c) =>
      /debug\s*[:=]\s*true|DEBUG_MODE\s*[:=]\s*1|NODE_ENV\s*[:=]\s*['"]?development/i.test(c)
        ? { status: "warn", detail: "Debug/development mode appears enabled. Disable in production." }
        : { status: "pass", detail: "No debug/development mode flags detected." },
  },
  {
    id: "misc-backup-retention",
    category: "Data Protection",
    name: "Backup & Retention Policy",
    severity: "medium",
    evaluate: (c) =>
      /backup|retention|disaster.?recovery|snapshot/i.test(c)
        ? { status: "pass", detail: "Backup/retention policy references found." }
        : { status: "warn", detail: "No backup or retention policy detected. Configure regular backups." },
  },
];

/* ── Demo cloud config ── */
const DEMO_CONFIG = `# terraform main.tf - Production AWS Infrastructure

resource "aws_s3_bucket" "app_data" {
  bucket = "myapp-production-data"
  acl    = "public-read"  # WARNING: public bucket
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app_data" {
  bucket = aws_s3_bucket.app_data.id
  rule {
    apply_server_side_encryption_configuration {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_security_group" "web_sg" {
  name = "web-server-sg"
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # SSH open to world
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
  metadata_options {
    http_tokens = "optional"  # IMDSv1 still allowed
  }
}

resource "aws_iam_policy" "admin_policy" {
  name = "admin-full-access"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "*"
      Resource = "*"
    }]
  })
}

variable "db_config" {
  default = {
    host     = "db.internal.myapp.com"
    port     = 5432
    username = "admin"
    password = "Pr0dDB_P@ss2024!"
    endpoint = "http://api.analytics.internal:9200"
  }
}
`;

function runCloudAudit(config: string) {
  const results = CLOUD_CHECKS.map((check) => {
    const result = check.evaluate(config);
    return {
      id: check.id,
      category: check.category,
      name: check.name,
      severity: check.severity,
      ...result,
    };
  });

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const warnings = results.filter((r) => r.status === "warn").length;

  // Score: start at 10, deduct for failures/warnings
  const deductions = results.reduce((sum, r) => {
    if (r.status === "pass") return sum;
    const weight = { critical: 2.0, high: 1.5, medium: 1.0, low: 0.5 }[r.severity];
    return sum + (r.status === "fail" ? weight : weight * 0.4);
  }, 0);
  const score = Math.max(0, Math.min(10, 10 - deductions));

  return {
    checks: results,
    stats: { total: results.length, passed, failed, warnings },
    score: parseFloat(score.toFixed(1)),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isDemo = body?.demo === true;

    if (isDemo) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const rl = rateLimit(`scan-cloud-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!rl.allowed) {
        return NextResponse.json(
          { error: "Demo rate limit reached (5 scans/hour). Sign up for Pro access." },
          { status: 429 }
        );
      }

      const audit = runCloudAudit(DEMO_CONFIG);
      return NextResponse.json({
        mode: "demo",
        ...audit,
        checksPerformed: CLOUD_CHECKS.length,
        timestamp: new Date().toISOString(),
      });
    }

    // Authenticated scan
    const user = await getShieldXAuthorizedUser(request, "pro", { allowApiKey: true });
    if (!user) {
      return NextResponse.json({ error: "Pro or Enterprise plan required for cloud security audit." }, { status: 403 });
    }

    const config = body?.config;
    if (!config || typeof config !== "string" || config.trim().length < 10) {
      return NextResponse.json(
        { error: "Provide cloud configuration text to audit (minimum 10 characters)." },
        { status: 400 }
      );
    }
    if (config.length > 500_000) {
      return NextResponse.json({ error: "Input too large. Maximum 500,000 characters." }, { status: 400 });
    }

    const audit = runCloudAudit(config);

    await dbConnect();
    await User.findByIdAndUpdate(user.id, { $inc: { shieldxScanCount: 1 } });

    return NextResponse.json({
      mode: "paid",
      ...audit,
      checksPerformed: CLOUD_CHECKS.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Cloud audit failed";
    const status = msg.includes("limit") || msg.includes("Access denied") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
