import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser, enforceShieldXFeatureAccess, enforceShieldXScanLimit } from "@/lib/shieldx-route-auth";
import { rateLimit } from "@/lib/rate-limit";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { generateFix, type Severity } from "@/lib/fix-engine";

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

// Structured remediation for each cloud check
const CLOUD_REMEDIATION: Record<string, { fix: string; effort: "low" | "medium" | "high" }> = {
  "iam-root-access": { fix: "Delete root access keys via AWS Console > Security Credentials. Create IAM users with specific policies instead. Enable MFA on root account.", effort: "medium" },
  "iam-wildcard": { fix: "Replace Action: \"*\" with specific actions needed. Use AWS IAM Access Analyzer to identify minimum required permissions. Apply the principle of least privilege.", effort: "high" },
  "iam-mfa": { fix: "Enable MFA: aws iam enable-mfa-device --user-name USER --serial-number ARN --authentication-code1 CODE1 --authentication-code2 CODE2. Enforce via IAM policy condition: aws:MultiFactorAuthPresent.", effort: "low" },
  "enc-at-rest": { fix: "Enable encryption: aws s3api put-bucket-encryption --bucket BUCKET --server-side-encryption-configuration '{\"Rules\":[{\"ApplyServerSideEncryptionByDefault\":{\"SSEAlgorithm\":\"AES256\"}}]}'", effort: "low" },
  "enc-in-transit": { fix: "Replace all http:// URLs with https://. Configure TLS certificates. Add aws:SecureTransport condition to S3 bucket policies.", effort: "medium" },
  "enc-kms": { fix: "Create a KMS key: aws kms create-key --description 'App encryption key'. Use for S3 SSE-KMS, RDS encryption, and EBS volume encryption.", effort: "medium" },
  "net-public-access": { fix: "Replace 0.0.0.0/0 CIDR with specific IP ranges. Use VPN or AWS PrivateLink for internal access. Enable S3 Block Public Access.", effort: "medium" },
  "net-sg-open": { fix: "Restrict security group ingress rules: aws ec2 revoke-security-group-ingress --group-id SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0. Allow only known IPs or VPN CIDR.", effort: "low" },
  "net-vpc-flow": { fix: "Enable VPC Flow Logs: aws ec2 create-flow-logs --resource-type VPC --resource-ids VPC_ID --traffic-type ALL --log-destination-type cloud-watch-logs", effort: "low" },
  "log-cloudtrail": { fix: "Create trail: aws cloudtrail create-trail --name my-trail --s3-bucket-name my-trail-bucket --is-multi-region-trail. Enable for all regions.", effort: "low" },
  "log-alarm": { fix: "Create CloudWatch alarm: aws cloudwatch put-metric-alarm --alarm-name SecurityAlert --metric-name UnauthorizedAPICalls --threshold 1 --comparison-operator GreaterThanThreshold", effort: "medium" },
  "stor-bucket-public": { fix: "Block public access: aws s3api put-public-access-block --bucket BUCKET --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true", effort: "low" },
  "stor-versioning": { fix: "Enable versioning: aws s3api put-bucket-versioning --bucket BUCKET --versioning-configuration Status=Enabled", effort: "low" },
  "comp-imds-v2": { fix: "Enforce IMDSv2: aws ec2 modify-instance-metadata-options --instance-id INSTANCE_ID --http-tokens required --http-endpoint enabled", effort: "low" },
  "comp-auto-update": { fix: "Configure SSM Patch Manager: Create a patch baseline and maintenance window. Or use AWS Systems Manager for automated patching.", effort: "medium" },
  "misc-hardcoded-creds": { fix: "Move secrets to AWS Secrets Manager or SSM Parameter Store. Reference via: aws secretsmanager get-secret-value --secret-id my-secret. Update code to use SDK.", effort: "medium" },
  "misc-debug-mode": { fix: "Set NODE_ENV=production in deployment. Remove debug: true from all config files. Ensure environment variables are properly set in CI/CD.", effort: "low" },
  "misc-backup-retention": { fix: "Enable automated backups: aws rds modify-db-instance --db-instance-identifier mydb --backup-retention-period 7. Configure S3 lifecycle rules for backup retention.", effort: "medium" },
};

function runCloudAudit(config: string) {
  const results = CLOUD_CHECKS.map((check) => {
    const result = check.evaluate(config);
    const remediation = CLOUD_REMEDIATION[check.id];
    const fixEngine = result.status !== "pass" ? generateFix({
      scanType: "cloud",
      id: check.id,
      title: check.name,
      severity: check.severity as Severity,
      confidence: result.status === "fail" ? "high" : "medium",
      description: result.detail,
      category: check.category,
    }) : null;
    return {
      id: check.id,
      category: check.category,
      name: check.name,
      severity: check.severity,
      ...result,
      fix: result.status !== "pass" && remediation ? remediation.fix : null,
      effort: result.status !== "pass" && remediation ? remediation.effort : null,
      compliance: fixEngine?.compliance || [],
      riskScore: fixEngine?.riskScore || 0,
      priority: fixEngine?.priority || "LOW",
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
      const rl = await rateLimit(`scan-cloud-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
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
      // Auth failed — fall back to demo mode
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const rl = await rateLimit(`scan-cloud-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!rl.allowed) {
        return NextResponse.json(
          { error: "Demo rate limit reached (5 scans/hour). Sign in for unlimited access." },
          { status: 429 }
        );
      }
      const config = body?.config;
      const configToScan = (config && typeof config === "string" && config.trim().length >= 10) ? config : DEMO_CONFIG;
      const audit = runCloudAudit(configToScan);
      return NextResponse.json({
        mode: "demo",
        ...audit,
        checksPerformed: CLOUD_CHECKS.length,
        timestamp: new Date().toISOString(),
      });
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

    // Enforce feature access and scan limits for paid users
    try {
      enforceShieldXFeatureAccess(user, "cloud-security");
      enforceShieldXScanLimit(user, 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Access denied";
      return NextResponse.json({ error: message }, { status: 403 });
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
