/**
 * ShieldX Infrastructure-as-Code (IaC) Scanner
 *
 * Scans Terraform, CloudFormation (YAML/JSON), and Kubernetes manifests
 * for security misconfigurations. Based on CIS Benchmarks and cloud
 * provider security best practices.
 */

import { generateFix, type Severity } from "@/lib/fix-engine";

/* ── Types ── */
export interface IaCFinding {
  id: string;
  name: string;
  severity: Severity;
  confidence: "high" | "medium" | "low";
  line: number;
  resource: string;
  detail: string;
  recommendation: string;
  fix: string;
  fixCommand: string | null;
  codeExample: string | null;
  effort: "low" | "medium" | "high";
  compliance: string[];
  riskScore: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
  provider: string;
}

export interface IaCScanResult {
  findings: IaCFinding[];
  stats: { critical: number; high: number; medium: number; low: number; total: number };
  score: number;
  linesAnalyzed: number;
  checksPerformed: number;
  format: string;
  providers: string[];
  resourceCount: number;
  timestamp: string;
}

/* ── Format detection ── */
type IaCFormat = "terraform" | "cloudformation" | "kubernetes" | "unknown";

function detectFormat(input: string): IaCFormat {
  const trimmed = input.trim();
  // Terraform
  if (/\bresource\s+"[^"]+"\s+"[^"]+"/.test(trimmed) || /\bprovider\s+"/.test(trimmed) || /\bvariable\s+"/.test(trimmed)) {
    return "terraform";
  }
  // CloudFormation
  if (trimmed.includes("AWSTemplateFormatVersion") || trimmed.includes("Resources:") || trimmed.includes('"Resources"')) {
    return "cloudformation";
  }
  // Kubernetes
  if (/apiVersion:\s/.test(trimmed) && /kind:\s/.test(trimmed)) {
    return "kubernetes";
  }
  // Fallback — try Terraform-like patterns
  if (trimmed.includes("resource ") || trimmed.includes("module ")) return "terraform";
  return "unknown";
}

/* ── Pattern-based checks ── */
interface IaCCheck {
  id: string;
  name: string;
  category: string;
  severity: Severity;
  provider: string;
  formats: IaCFormat[];
  patterns: RegExp[];
  antiPatterns?: RegExp[]; // If these match, the check passes (no finding)
  detail: string;
  recommendation: string;
}

const IAC_CHECKS: IaCCheck[] = [
  // ── AWS / Terraform ──
  {
    id: "iac-s3-public",
    name: "S3 Bucket Public Access",
    category: "Storage",
    severity: "critical",
    provider: "AWS",
    formats: ["terraform", "cloudformation"],
    patterns: [/acl\s*=\s*"public-read"/i, /acl\s*=\s*"public-read-write"/i, /PublicAccessBlockConfiguration/],
    detail: "S3 bucket configured with public ACL. Data could be accessed by anyone on the internet.",
    recommendation: "Set acl = \"private\" and enable S3 Block Public Access. Use IAM policies for access control.",
  },
  {
    id: "iac-s3-no-encryption",
    name: "S3 Bucket Without Encryption",
    category: "Encryption",
    severity: "high",
    provider: "AWS",
    formats: ["terraform"],
    patterns: [/resource\s+"aws_s3_bucket"\s+/],
    antiPatterns: [/server_side_encryption_configuration/, /aws_s3_bucket_server_side_encryption/],
    detail: "S3 bucket has no server-side encryption configured. Data at rest is unencrypted.",
    recommendation: "Add server_side_encryption_configuration with AES256 or aws:kms algorithm.",
  },
  {
    id: "iac-sg-open-ingress",
    name: "Security Group Open to 0.0.0.0/0",
    category: "Network",
    severity: "critical",
    provider: "AWS",
    formats: ["terraform", "cloudformation"],
    patterns: [/cidr_blocks\s*=\s*\["0\.0\.0\.0\/0"\]/, /CidrIp:\s*['"]?0\.0\.0\.0\/0/],
    detail: "Security group allows inbound traffic from any IP address. The entire internet can reach this resource.",
    recommendation: "Restrict ingress to specific CIDR ranges or security groups. Use VPN/bastion for management access.",
  },
  {
    id: "iac-sg-open-ssh",
    name: "SSH Port Open to Internet",
    category: "Network",
    severity: "critical",
    provider: "AWS",
    formats: ["terraform", "cloudformation"],
    patterns: [/from_port\s*=\s*22[\s\S]*?cidr_blocks\s*=\s*\["0\.0\.0\.0\/0"\]/, /FromPort:\s*22[\s\S]*?CidrIp.*0\.0\.0\.0/],
    detail: "SSH (port 22) is open to the entire internet. Brute-force attacks are inevitable.",
    recommendation: "Restrict SSH access to VPN CIDR or specific bastion host IPs. Use AWS SSM Session Manager instead.",
  },
  {
    id: "iac-rds-public",
    name: "RDS Instance Publicly Accessible",
    category: "Database",
    severity: "critical",
    provider: "AWS",
    formats: ["terraform", "cloudformation"],
    patterns: [/publicly_accessible\s*=\s*true/, /PubliclyAccessible:\s*true/i],
    detail: "RDS database is publicly accessible. Any IP can attempt to connect to the database.",
    recommendation: "Set publicly_accessible = false. Access the database through a VPC, VPN, or bastion host.",
  },
  {
    id: "iac-rds-no-encryption",
    name: "RDS Instance Not Encrypted",
    category: "Encryption",
    severity: "high",
    provider: "AWS",
    formats: ["terraform"],
    patterns: [/resource\s+"aws_db_instance"\s+/],
    antiPatterns: [/storage_encrypted\s*=\s*true/],
    detail: "RDS instance does not have encryption at rest enabled.",
    recommendation: "Set storage_encrypted = true and specify a KMS key with kms_key_id.",
  },
  {
    id: "iac-iam-wildcard",
    name: "IAM Policy with Wildcard Actions",
    category: "IAM",
    severity: "critical",
    provider: "AWS",
    formats: ["terraform", "cloudformation"],
    patterns: [/"Action"\s*:\s*(?:\[\s*)?"?\*"?/, /actions\s*=\s*\["?\*"?\]/i],
    detail: "IAM policy grants wildcard (*) permissions. This violates the principle of least privilege.",
    recommendation: "Specify exact actions needed (e.g., 's3:GetObject', 'ec2:DescribeInstances'). Never use '*' in production.",
  },
  {
    id: "iac-iam-admin-access",
    name: "IAM Full Admin Access Attached",
    category: "IAM",
    severity: "critical",
    provider: "AWS",
    formats: ["terraform", "cloudformation"],
    patterns: [/AdministratorAccess/, /arn:aws:iam::aws:policy\/AdministratorAccess/],
    detail: "AdministratorAccess policy attached — grants full access to every AWS service and resource.",
    recommendation: "Create custom policies with only necessary permissions. Use AWS Access Analyzer to right-size.",
  },
  {
    id: "iac-cloudwatch-no-logs",
    name: "No CloudWatch Log Group for Lambda/ECS",
    category: "Logging",
    severity: "medium",
    provider: "AWS",
    formats: ["terraform"],
    patterns: [/resource\s+"aws_lambda_function"\s+/],
    antiPatterns: [/aws_cloudwatch_log_group/],
    detail: "Lambda function has no explicit CloudWatch log group. Logs may be unmonitored or lack retention policies.",
    recommendation: "Create an aws_cloudwatch_log_group resource with a retention_in_days setting.",
  },
  {
    id: "iac-cloudtrail-disabled",
    name: "CloudTrail Not Enabled",
    category: "Logging",
    severity: "high",
    provider: "AWS",
    formats: ["terraform"],
    patterns: [/resource\s+"aws_/],
    antiPatterns: [/aws_cloudtrail/],
    detail: "No CloudTrail configuration found. API calls and security events are not being logged.",
    recommendation: "Create an aws_cloudtrail resource with multi-region enabled and log file validation.",
  },
  {
    id: "iac-ebs-no-encryption",
    name: "EBS Volume Not Encrypted",
    category: "Encryption",
    severity: "high",
    provider: "AWS",
    formats: ["terraform"],
    patterns: [/resource\s+"aws_ebs_volume"\s+/],
    antiPatterns: [/encrypted\s*=\s*true/],
    detail: "EBS volume created without encryption. Data on the volume is stored in plaintext.",
    recommendation: "Set encrypted = true on all EBS volumes. Enable default EBS encryption for the account.",
  },

  // ── Kubernetes ──
  {
    id: "iac-k8s-privileged",
    name: "Privileged Container",
    category: "Privilege",
    severity: "critical",
    provider: "Kubernetes",
    formats: ["kubernetes"],
    patterns: [/privileged:\s*true/],
    detail: "Container runs in privileged mode with full host access. A container escape gives root on the host.",
    recommendation: "Set securityContext.privileged: false. Use specific Linux capabilities instead.",
  },
  {
    id: "iac-k8s-run-as-root",
    name: "Kubernetes Container Runs as Root",
    category: "Privilege",
    severity: "high",
    provider: "Kubernetes",
    formats: ["kubernetes"],
    patterns: [/runAsUser:\s*0/, /runAsNonRoot:\s*false/],
    detail: "Container runs as root user (UID 0). If compromised, the attacker has root privileges.",
    recommendation: "Set runAsNonRoot: true and runAsUser: 1000 (or another non-root UID) in securityContext.",
  },
  {
    id: "iac-k8s-host-network",
    name: "Host Network Enabled",
    category: "Network",
    severity: "high",
    provider: "Kubernetes",
    formats: ["kubernetes"],
    patterns: [/hostNetwork:\s*true/],
    detail: "Pod uses host networking. Container can access all network interfaces and services on the node.",
    recommendation: "Set hostNetwork: false. Use Kubernetes Services and NetworkPolicies for communication.",
  },
  {
    id: "iac-k8s-host-pid",
    name: "Host PID Namespace Shared",
    category: "Privilege",
    severity: "high",
    provider: "Kubernetes",
    formats: ["kubernetes"],
    patterns: [/hostPID:\s*true/],
    detail: "Pod shares the host PID namespace. Container can see and signal all host processes.",
    recommendation: "Set hostPID: false unless specifically needed for monitoring agents.",
  },
  {
    id: "iac-k8s-no-limits",
    name: "No Resource Limits Set",
    category: "Reliability",
    severity: "medium",
    provider: "Kubernetes",
    formats: ["kubernetes"],
    patterns: [/containers:/],
    antiPatterns: [/resources:\s*\n\s*limits:/],
    detail: "Container has no resource limits. A runaway process could consume all node resources (CPU/memory).",
    recommendation: "Set resources.limits.cpu and resources.limits.memory for all containers.",
  },
  {
    id: "iac-k8s-latest-image",
    name: "Using :latest Image Tag",
    category: "Reproducibility",
    severity: "medium",
    provider: "Kubernetes",
    formats: ["kubernetes"],
    patterns: [/image:\s*\S+:latest/, /image:\s*[a-z]+\/[a-z]+\s*$/m],
    detail: "Container uses :latest tag. Deployments are not reproducible and rollbacks may fail.",
    recommendation: "Pin container images to specific digest or version tag. Use image digest for immutability.",
  },
  {
    id: "iac-k8s-no-readonly-root",
    name: "Root Filesystem Not Read-Only",
    category: "Hardening",
    severity: "medium",
    provider: "Kubernetes",
    formats: ["kubernetes"],
    patterns: [/containers:/],
    antiPatterns: [/readOnlyRootFilesystem:\s*true/],
    detail: "Container root filesystem is writable. An attacker could write malicious files to the container.",
    recommendation: "Set securityContext.readOnlyRootFilesystem: true. Use emptyDir volumes for writable paths.",
  },
  {
    id: "iac-k8s-default-namespace",
    name: "Deployed to Default Namespace",
    category: "Isolation",
    severity: "low",
    provider: "Kubernetes",
    formats: ["kubernetes"],
    patterns: [/namespace:\s*default/, /namespace:\s*['"]default['"]/],
    detail: "Resource deployed to the 'default' namespace. This lacks isolation and makes RBAC harder to manage.",
    recommendation: "Create dedicated namespaces per application/team. Apply NetworkPolicies per namespace.",
  },

  // ── GCP / General ──
  {
    id: "iac-hardcoded-secret",
    name: "Hardcoded Secret in IaC",
    category: "Secrets",
    severity: "critical",
    provider: "Any",
    formats: ["terraform", "cloudformation", "kubernetes"],
    patterns: [
      /(?:password|secret_key|api_key|access_key)\s*=\s*"[^"]{8,}"/i,
      /(?:password|secret|apiKey|accessKey):\s*['"][^'"]{8,}['"]/i,
    ],
    detail: "Secret value is hardcoded in infrastructure code. Anyone with repo access can see it.",
    recommendation: "Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, Kubernetes Secrets with encryption).",
  },
  {
    id: "iac-http-not-https",
    name: "HTTP Used Instead of HTTPS",
    category: "Encryption",
    severity: "high",
    provider: "Any",
    formats: ["terraform", "cloudformation", "kubernetes"],
    patterns: [/http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)/],
    detail: "Plain HTTP endpoint detected. Data transmitted in cleartext can be intercepted.",
    recommendation: "Use HTTPS for all external-facing endpoints. Enforce TLS 1.2+ minimum.",
  },
];

/* ── Main scanner ── */
export function scanIaC(input: string): IaCScanResult {
  const format = detectFormat(input);
  const lines = input.split("\n");
  const findings: IaCFinding[] = [];

  // Count resources (rough estimate)
  let resourceCount = 0;
  if (format === "terraform") {
    resourceCount = (input.match(/resource\s+"[^"]+"\s+"[^"]+"/g) || []).length;
  } else if (format === "kubernetes") {
    resourceCount = (input.match(/kind:\s/g) || []).length;
  } else if (format === "cloudformation") {
    resourceCount = (input.match(/Type:\s*['"]?AWS::/g) || []).length || (input.match(/"Type"\s*:\s*"AWS::/g) || []).length;
  }

  const applicableChecks = IAC_CHECKS.filter(c => c.formats.includes(format) || format === "unknown");

  for (const check of applicableChecks) {
    // Check if any pattern matches
    const matched = check.patterns.some(p => p.test(input));
    if (!matched) continue;

    // Check anti-patterns (if all anti-patterns match, skip)
    if (check.antiPatterns && check.antiPatterns.every(p => p.test(input))) continue;

    // Find the line number of the first match
    let matchLine = 1;
    for (const pattern of check.patterns) {
      const match = pattern.exec(input);
      if (match) {
        const beforeMatch = input.substring(0, match.index);
        matchLine = beforeMatch.split("\n").length;
        break;
      }
      // Reset regex state
      pattern.lastIndex = 0;
    }
    // Reset all regex states
    for (const p of check.patterns) p.lastIndex = 0;

    // Find the resource name near the match
    let resource = "unknown";
    for (let i = matchLine - 1; i >= 0; i--) {
      const line = lines[i];
      const tfMatch = line?.match(/resource\s+"([^"]+)"\s+"([^"]+)"/);
      if (tfMatch) { resource = `${tfMatch[1]}.${tfMatch[2]}`; break; }
      const k8sMatch = line?.match(/name:\s*(\S+)/);
      if (k8sMatch && i < matchLine - 1) { resource = k8sMatch[1]; break; }
    }

    const fixResult = generateFix({
      scanType: "cloud",
      id: check.id,
      title: check.name,
      severity: check.severity,
      confidence: "high",
      description: check.recommendation,
    });

    findings.push({
      id: check.id,
      name: check.name,
      severity: check.severity,
      confidence: "high",
      line: matchLine,
      resource,
      detail: check.detail,
      recommendation: check.recommendation,
      category: check.category,
      provider: check.provider,
      fix: fixResult.fix,
      fixCommand: fixResult.fixCommand,
      codeExample: fixResult.codeExample,
      effort: fixResult.effort,
      compliance: fixResult.compliance,
      riskScore: fixResult.riskScore,
      priority: fixResult.priority,
    });
  }

  // Sort by severity
  const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  findings.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity] || a.line - b.line);

  const stats = {
    critical: findings.filter(f => f.severity === "critical").length,
    high: findings.filter(f => f.severity === "high").length,
    medium: findings.filter(f => f.severity === "medium").length,
    low: findings.filter(f => f.severity === "low").length,
    total: findings.length,
  };

  const score = Math.max(0, Math.min(10,
    10 - stats.critical * 3 - stats.high * 2 - stats.medium * 1 - stats.low * 0.3
  ));

  const providers = [...new Set(findings.map(f => f.provider))];

  return {
    findings,
    stats,
    score: parseFloat(score.toFixed(1)),
    linesAnalyzed: lines.length,
    checksPerformed: applicableChecks.length,
    format: format === "unknown" ? "auto-detected" : format,
    providers: providers.length > 0 ? providers : ["AWS"],
    resourceCount,
    timestamp: new Date().toISOString(),
  };
}

/* ── Demo data (insecure Terraform) ── */
export const IAC_DEMO_INPUT = `# Main Terraform configuration

provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "app_data" {
  bucket = "my-app-data-bucket"
  acl    = "public-read"
}

resource "aws_security_group" "web" {
  name = "web-sg"

  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "main" {
  engine            = "mysql"
  instance_class    = "db.t3.micro"
  publicly_accessible = true
  password          = "SuperSecretPass123!"
  username          = "admin"
}

resource "aws_iam_policy" "deploy" {
  name = "deploy-policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "*"
      Resource = "*"
    }]
  })
}

resource "aws_ebs_volume" "data" {
  availability_zone = "us-east-1a"
  size              = 100
}

resource "aws_lambda_function" "processor" {
  function_name = "data-processor"
  runtime       = "nodejs18.x"
  handler       = "index.handler"
  filename      = "lambda.zip"
}`;
