import { BlogPost } from "./blog-data";

export const cloudSecurityArticles: BlogPost[] = [
  {
    slug: "aws-security-best-practices-complete-guide-2026",
    title:
      "AWS Security Best Practices: The Complete 2026 Guide for Production Workloads",
    excerpt:
      "Master AWS security with defense-in-depth strategies covering IAM, VPC, encryption, GuardDuty, and Security Hub. Includes real-world breach case studies, Terraform hardening examples, and a 50-point security checklist for production AWS environments.",
    date: "2026-04-13",
    author: "SCR Team",
    category: "Cloud Security",
    tags: [
      "AWS Security",
      "Cloud Security",
      "IAM",
      "VPC",
      "GuardDuty",
      "Security Hub",
      "CloudTrail",
      "Defense in Depth",
    ],
    readTime: "22 min read",
    image: "/blog/aws-security-architecture.svg",
    content: `## Why AWS Security Matters More Than Ever

AWS handles **33% of global cloud infrastructure** as of 2026. With over 200 services and billions of API calls daily, misconfigurations are the #1 cause of cloud breaches — not zero-day exploits.

![AWS Security Architecture — Defense in Depth](/blog/aws-security-architecture.svg)

According to the **2025 Verizon DBIR**, 82% of cloud breaches involved human error or misconfiguration. The average cost of an AWS breach reached **$4.8M** in 2025.

This guide covers every layer of AWS security — from perimeter to data — with production-ready code examples.

---

## 1. IAM: The Foundation of AWS Security

IAM misconfigurations are behind **76% of AWS security incidents**. Here's how to lock it down:

### Enforce Least Privilege

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-app-bucket/uploads/*",
      "Condition": {
        "StringEquals": {
          "aws:PrincipalTag/team": "engineering"
        },
        "IpAddress": {
          "aws:SourceIp": "10.0.0.0/8"
        }
      }
    }
  ]
}
\`\`\`

### IAM Best Practices Checklist

| Practice | Priority | How to Check |
|----------|----------|--------------|
| No root account usage | CRITICAL | CloudTrail: filter root events |
| MFA on all IAM users | CRITICAL | \`aws iam get-credential-report\` |
| No long-lived access keys | HIGH | Access Analyzer unused access |
| Use IAM roles, not users | HIGH | Audit IAM user count |
| Permission boundaries | HIGH | Check \`PermissionsBoundary\` field |
| SCPs across organization | MEDIUM | AWS Organizations console |
| Regular access reviews | MEDIUM | IAM Access Analyzer |

### Detect Overpermissive Policies with Access Analyzer

\`\`\`bash
# Find all unused permissions in the last 90 days
aws accessanalyzer generate-finding \\
  --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789:analyzer/MyAnalyzer \\
  --type UNUSED_ACCESS

# List external access findings
aws accessanalyzer list-findings \\
  --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789:analyzer/MyAnalyzer \\
  --filter '{"status": {"eq": ["ACTIVE"]}}'
\`\`\`

---

## 2. VPC Security: Network Isolation

### Multi-Layer Network Architecture

\`\`\`hcl
# Terraform: Secure VPC with private subnets
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "production-vpc" }
}

# Private subnet — no direct internet access
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = { Name = "private-subnet" }
}

# Security group: Allow only specific traffic
resource "aws_security_group" "app" {
  name_prefix = "app-sg-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "HTTPS from ALB only"
  }

  egress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS outbound for API calls"
  }
}
\`\`\`

### VPC Flow Logs for Threat Detection

\`\`\`bash
# Enable VPC Flow Logs to CloudWatch
aws ec2 create-flow-logs \\
  --resource-type VPC \\
  --resource-ids vpc-123abc \\
  --traffic-type ALL \\
  --log-destination-type cloud-watch-logs \\
  --log-group-name /aws/vpc/flow-logs \\
  --deliver-logs-permission-arn arn:aws:iam::role/flowlogsRole
\`\`\`

---

## 3. Data Encryption: At Rest and In Transit

### S3 Bucket Hardening

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::my-bucket/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "aws:kms"
        }
      }
    },
    {
      "Sid": "DenyHTTP",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::my-bucket",
        "arn:aws:s3:::my-bucket/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
\`\`\`

### KMS Key Rotation

\`\`\`bash
# Enable automatic key rotation (every 365 days)
aws kms enable-key-rotation --key-id alias/my-app-key

# Verify rotation status
aws kms get-key-rotation-status --key-id alias/my-app-key
\`\`\`

---

## 4. Monitoring: GuardDuty, Security Hub, and CloudTrail

### Enable GuardDuty Across All Regions

\`\`\`python
import boto3

def enable_guardduty_all_regions():
    ec2 = boto3.client('ec2')
    regions = [r['RegionName'] for r in ec2.describe_regions()['Regions']]

    for region in regions:
        gd = boto3.client('guardduty', region_name=region)
        try:
            gd.create_detector(
                Enable=True,
                DataSources={
                    'S3Logs': {'Enable': True},
                    'Kubernetes': {'AuditLogs': {'Enable': True}},
                    'MalwareProtection': {
                        'ScanEc2InstanceWithFindings': {
                            'EbsVolumes': {'Enable': True}
                        }
                    }
                }
            )
            print(f"GuardDuty enabled in {region}")
        except gd.exceptions.BadRequestException:
            print(f"GuardDuty already enabled in {region}")
\`\`\`

### Security Hub Compliance Dashboard

\`\`\`bash
# Enable Security Hub with all standards
aws securityhub enable-security-hub \\
  --enable-default-standards \\
  --tags Purpose=compliance

# Enable CIS AWS Foundations Benchmark
aws securityhub batch-enable-standards \\
  --standards-subscription-requests '[
    {"StandardsArn": "arn:aws:securityhub:::ruleset/cis-aws-foundations-benchmark/v/3.0.0"}
  ]'

# Get compliance summary
aws securityhub get-findings \\
  --filters '{"ComplianceStatus": [{"Value": "FAILED", "Comparison": "EQUALS"}]}' \\
  --max-items 10
\`\`\`

---

## 5. Incident Response Automation

### Auto-Remediate Public S3 Buckets

\`\`\`python
import boto3
import json

def lambda_handler(event, context):
    """Auto-remediate public S3 bucket access"""
    s3 = boto3.client('s3')
    
    # Get bucket name from Config event
    bucket = event['detail']['requestParameters']['bucketName']
    
    # Block all public access
    s3.put_public_access_block(
        Bucket=bucket,
        PublicAccessBlockConfiguration={
            'BlockPublicAcls': True,
            'IgnorePublicAcls': True,
            'BlockPublicPolicy': True,
            'RestrictPublicBuckets': True
        }
    )
    
    # Send SNS alert
    sns = boto3.client('sns')
    sns.publish(
        TopicArn='arn:aws:sns:us-east-1:123456789:security-alerts',
        Subject=f'PUBLIC S3 BUCKET REMEDIATED: {bucket}',
        Message=json.dumps({
            'bucket': bucket,
            'action': 'Blocked all public access',
            'severity': 'CRITICAL'
        })
    )
    
    return {'statusCode': 200, 'body': f'Remediated {bucket}'}
\`\`\`

---

## 50-Point AWS Security Checklist

### Identity & Access (15 points)
- [ ] Root account MFA enabled
- [ ] No root access keys exist  
- [ ] All IAM users have MFA
- [ ] No inline IAM policies
- [ ] Permission boundaries on all roles
- [ ] SCPs enforced at organization level
- [ ] Regular credential rotation
- [ ] Access Analyzer enabled
- [ ] IAM roles prefer over IAM users
- [ ] Cross-account roles use external IDs
- [ ] No wildcard (*) permissions
- [ ] Unused credentials removed (90 days)
- [ ] SSO/Identity Center configured
- [ ] Conditions on all IAM policies
- [ ] Password policy enforced

### Network (10 points)
- [ ] VPC Flow Logs enabled
- [ ] No public subnets for databases
- [ ] Security groups: no 0.0.0.0/0 ingress
- [ ] NACLs on all subnets
- [ ] PrivateLink for AWS service access
- [ ] WAF on all public endpoints
- [ ] Shield Advanced for DDoS
- [ ] DNS firewall configured
- [ ] Transit Gateway for multi-VPC
- [ ] Network Firewall for IDS/IPS

### Data (10 points)
- [ ] S3 Block Public Access (account-level)
- [ ] All S3 buckets encrypted (KMS)
- [ ] EBS volumes encrypted
- [ ] RDS encrypted at rest + in transit
- [ ] KMS key rotation enabled
- [ ] Secrets in Secrets Manager (not env vars)
- [ ] Macie scanning S3 for PII
- [ ] SSL/TLS 1.2+ enforced everywhere
- [ ] S3 versioning + MFA delete
- [ ] Backup encryption enabled

### Monitoring (10 points)
- [ ] CloudTrail in all regions
- [ ] CloudTrail log file validation
- [ ] GuardDuty enabled all regions
- [ ] Security Hub with CIS benchmark
- [ ] Config rules for compliance
- [ ] CloudWatch alarms for anomalies
- [ ] SNS alerts for security findings
- [ ] Detective for investigation
- [ ] Inspector for vulnerability scanning
- [ ] EventBridge for auto-remediation

### Compute (5 points)
- [ ] SSM Session Manager (no SSH keys)
- [ ] EC2 IMDSv2 enforced
- [ ] Lambda functions in VPC
- [ ] ECS/EKS with non-root containers
- [ ] AMI scanning with Inspector

---

## Key Takeaways

1. **IAM is everything** — 76% of AWS breaches start with identity misconfiguration
2. **Automate remediation** — Don't rely on humans to fix security findings at 2 AM
3. **Encrypt by default** — Use KMS with automatic rotation on everything
4. **Monitor everything** — GuardDuty + Security Hub + CloudTrail is the minimum viable monitoring
5. **Use SCPs** — Organization-wide guardrails prevent entire classes of misconfiguration

> **Scan your cloud infrastructure code with [ShieldX](https://securecodereviews.com/shieldx) — detect IAM misconfigurations, exposed secrets, and compliance violations in Terraform, CloudFormation, and CDK before they reach production.**
`,
  },
  {
    slug: "aws-iam-privilege-escalation-attacks-detection-2026",
    title:
      "AWS IAM Privilege Escalation: 21 Attack Paths Hackers Use (and How to Stop Them)",
    excerpt:
      "Deep-dive into every known AWS IAM privilege escalation technique — from iam:CreatePolicyVersion to sts:AssumeRole chains. Includes detection queries, CloudTrail patterns, real breach case studies, and defense automation with Terraform and Python.",
    date: "2026-04-13",
    author: "SCR Team",
    category: "Cloud Security",
    tags: [
      "AWS IAM",
      "Privilege Escalation",
      "Cloud Security",
      "Penetration Testing",
      "CloudTrail",
      "AWS Security",
      "Red Team",
    ],
    readTime: "20 min read",
    image: "/blog/aws-iam-privilege-escalation.svg",
    content: `## What Is IAM Privilege Escalation?

IAM privilege escalation occurs when an attacker with **limited AWS permissions** exploits misconfigurations to **gain higher privileges** — often reaching full administrator access.

![AWS IAM Privilege Escalation — Attack Paths and Defenses](/blog/aws-iam-privilege-escalation.svg)

According to **Palo Alto Unit 42's 2025 Cloud Threat Report**, 99% of cloud IAM identities have excessive permissions, and only 1% of granted permissions are actually used.

---

## The 21 Known IAM Privilege Escalation Paths

Security researcher Spencer Gietzen identified the original 21 paths. Here's every one, with detection and defense:

### Path 1: iam:CreatePolicyVersion

The attacker creates a new version of an existing policy, granting themselves admin access:

\`\`\`bash
# Attacker command:
aws iam create-policy-version \\
  --policy-arn arn:aws:iam::123456789:policy/MyPolicy \\
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }]
  }' \\
  --set-as-default
\`\`\`

**Detection (CloudTrail query):**
\`\`\`sql
SELECT eventTime, userIdentity.arn, requestParameters.policyArn
FROM cloudtrail_logs
WHERE eventName = 'CreatePolicyVersion'
  AND requestParameters.setAsDefault = true
ORDER BY eventTime DESC
\`\`\`

**Defense:** Use SCP to deny this action:
\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "DenyPolicyVersionCreation",
    "Effect": "Deny",
    "Action": "iam:CreatePolicyVersion",
    "Resource": "*",
    "Condition": {
      "StringNotLike": {
        "aws:PrincipalArn": "arn:aws:iam::*:role/AdminRole"
      }
    }
  }]
}
\`\`\`

### Path 2: iam:SetDefaultPolicyVersion

Switch to an older overpermissive policy version:

\`\`\`bash
# List all versions of a policy
aws iam list-policy-versions --policy-arn arn:aws:iam::123456789:policy/MyPolicy

# Switch to overpermissive old version
aws iam set-default-policy-version \\
  --policy-arn arn:aws:iam::123456789:policy/MyPolicy \\
  --version-id v3
\`\`\`

### Path 3: iam:AttachUserPolicy / iam:AttachRolePolicy

Directly attach AdministratorAccess to self:

\`\`\`bash
aws iam attach-user-policy \\
  --user-name compromised-user \\
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
\`\`\`

### Path 4: iam:PutUserPolicy / iam:PutRolePolicy

Create an inline admin policy:

\`\`\`bash
aws iam put-user-policy \\
  --user-name compromised-user \\
  --policy-name backdoor \\
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{"Effect": "Allow", "Action": "*", "Resource": "*"}]
  }'
\`\`\`

### Path 5: iam:PassRole + lambda:CreateFunction + lambda:InvokeFunction

The most common real-world escalation:

\`\`\`python
import boto3, json

# Step 1: Create Lambda with high-priv role
client = boto3.client('lambda')
client.create_function(
    FunctionName='escalation-fn',
    Runtime='python3.12',
    Role='arn:aws:iam::123456789:role/AdminRole',
    Handler='index.handler',
    Code={'ZipFile': open('payload.zip', 'rb').read()}
)

# Step 2: Invoke — code runs with AdminRole permissions
client.invoke(
    FunctionName='escalation-fn',
    InvocationType='RequestResponse'
)
\`\`\`

### Path 6-8: EC2 Instance Profile Abuse

\`\`\`bash
# Create instance with admin role
aws ec2 run-instances \\
  --image-id ami-12345 \\
  --instance-type t3.micro \\
  --iam-instance-profile Name=AdminProfile \\
  --user-data '#!/bin/bash
    curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/AdminRole'
\`\`\`

### Path 9-12: STS Assume Role Chains

\`\`\`bash
# Chain through intermediate roles
aws sts assume-role --role-arn arn:aws:iam::123456789:role/Role-A \\
  --role-session-name step1

# Role-A can assume Role-B which is admin
aws sts assume-role --role-arn arn:aws:iam::123456789:role/AdminRole \\
  --role-session-name step2
\`\`\`

---

## Automated Detection Script

\`\`\`python
import boto3

def audit_iam_escalation_risks():
    """Scan for all 21 privilege escalation paths"""
    iam = boto3.client('iam')
    risks = []
    
    # Check all users and roles
    users = iam.list_users()['Users']
    
    for user in users:
        username = user['UserName']
        
        # Get all policies (attached + inline)
        attached = iam.list_attached_user_policies(UserName=username)
        inline = iam.list_user_policies(UserName=username)
        
        for policy in attached['AttachedPolicies']:
            version = iam.get_policy(PolicyArn=policy['PolicyArn'])
            doc = iam.get_policy_version(
                PolicyArn=policy['PolicyArn'],
                VersionId=version['Policy']['DefaultVersionId']
            )
            
            statements = doc['PolicyVersion']['Document']['Statement']
            if not isinstance(statements, list):
                statements = [statements]
            
            for stmt in statements:
                if stmt.get('Effect') == 'Allow':
                    actions = stmt.get('Action', [])
                    if isinstance(actions, str):
                        actions = [actions]
                    
                    # Check for escalation-capable actions
                    dangerous = [
                        'iam:CreatePolicyVersion',
                        'iam:SetDefaultPolicyVersion',
                        'iam:AttachUserPolicy',
                        'iam:AttachRolePolicy',
                        'iam:PutUserPolicy',
                        'iam:PutRolePolicy',
                        'iam:PassRole',
                        'iam:CreateLoginProfile',
                        'iam:UpdateLoginProfile',
                        'iam:CreateAccessKey',
                        'sts:AssumeRole',
                        'lambda:CreateFunction',
                        'lambda:InvokeFunction',
                        'lambda:UpdateFunctionCode',
                        'ec2:RunInstances',
                        'ssm:SendCommand',
                        'glue:UpdateDevEndpoint',
                    ]
                    
                    for action in actions:
                        if action == '*' or action in dangerous:
                            risks.append({
                                'user': username,
                                'policy': policy['PolicyArn'],
                                'dangerous_action': action,
                                'severity': 'CRITICAL' if action == '*' else 'HIGH'
                            })
    
    return risks

# Run the audit
findings = audit_iam_escalation_risks()
for f in findings:
    print(f"[{f['severity']}] {f['user']} has {f['dangerous_action']} via {f['policy']}")
\`\`\`

---

## Real-World Breach Case Studies

### Capital One (2019)
- **Attack**: SSRF on WAF → EC2 metadata → overpermissive IAM role
- **Impact**: 100M+ customer records stolen
- **Root cause**: Role had \`s3:GetObject\` on all buckets + no VPC endpoint restrictions
- **Cost**: $190M+ in fines and remediation

### Twitch (2021)
- **Attack**: Misconfigured IAM allowed lateral movement across services
- **Impact**: Full source code, creator payouts, and internal tools leaked
- **Root cause**: IAM policies had wildcard actions across production accounts

### LastPass (2022-2023)
- **Attack**: Compromised developer IAM credentials → accessed cloud backups
- **Impact**: Encrypted customer vaults stolen
- **Root cause**: Developer had persistent access to production backup infrastructure

---

## Defense: Terraform IAM Guardrails

\`\`\`hcl
# SCP: Deny all dangerous IAM actions outside admin role
resource "aws_organizations_policy" "deny_iam_escalation" {
  name = "deny-iam-privilege-escalation"
  type = "SERVICE_CONTROL_POLICY"

  content = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "DenyIAMEscalation"
        Effect = "Deny"
        Action = [
          "iam:CreatePolicyVersion",
          "iam:SetDefaultPolicyVersion",
          "iam:AttachUserPolicy",
          "iam:AttachRolePolicy",
          "iam:PutUserPolicy",
          "iam:PutRolePolicy",
          "iam:CreateUser",
          "iam:CreateAccessKey",
        ]
        Resource = "*"
        Condition = {
          StringNotLike = {
            "aws:PrincipalArn" = [
              "arn:aws:iam::*:role/OrganizationAdminRole"
            ]
          }
        }
      }
    ]
  })
}
\`\`\`

---

## Key Takeaways

1. **21+ escalation paths exist** — blocking just a few leaves you exposed
2. **Audit IAM actions, not just policies** — use tools like PMapper and Pacu
3. **SCPs are your best defense** — they override any IAM policy in the account
4. **Monitor CloudTrail continuously** — set alerts for all iam:* events
5. **Assume breach mindset** — if an attacker gets any IAM access, what's the blast radius?

> **Detect IAM misconfigurations in your infrastructure code with [ShieldX](https://securecodereviews.com/shieldx) — scan Terraform and CloudFormation for privilege escalation risks before deployment.**
`,
  },
  {
    slug: "google-cloud-security-best-practices-gcp-hardening-2026",
    title:
      "Google Cloud Security: Complete GCP Hardening Guide for 2026",
    excerpt:
      "Comprehensive guide to securing Google Cloud Platform — covers IAM, VPC Service Controls, Security Command Center, Binary Authorization, Cloud Armor, and Organization Policies. Includes GCP-specific breach case studies and gcloud hardening commands.",
    date: "2026-04-13",
    author: "SCR Team",
    category: "Cloud Security",
    tags: [
      "Google Cloud Security",
      "GCP Security",
      "Cloud Security",
      "VPC Service Controls",
      "Security Command Center",
      "Binary Authorization",
      "Cloud Armor",
      "IAM",
    ],
    readTime: "24 min read",
    image: "/blog/gcp-security-controls.svg",
    content: `## Why GCP Security Requires a Different Approach

Google Cloud Platform has a fundamentally different security model than AWS. GCP uses **resource hierarchy** (Organization → Folders → Projects) with inherited IAM policies and **default encryption** on everything.

![Google Cloud Security — Threat Landscape and Controls](/blog/gcp-security-controls.svg)

Despite strong defaults, GCP breaches are rising. The **2025 Mandiant M-Trends Report** found that 37% of cloud breaches started with misconfigurations, and GCP-specific incidents increased 45% year-over-year.

---

## 1. GCP IAM: Resource Hierarchy and Bindings

Unlike AWS (user-centric IAM), GCP IAM is **resource-centric** — permissions are granted on resources via role bindings.

### Principle of Least Privilege with Custom Roles

\`\`\`bash
# Create a custom role with minimal permissions
gcloud iam roles create appReadOnly \\
  --project=my-project \\
  --title="App Read Only" \\
  --description="Read-only access to app resources" \\
  --permissions=storage.objects.get,storage.objects.list,logging.logEntries.list \\
  --stage=GA

# Bind to a service account (not a user)
gcloud projects add-iam-policy-binding my-project \\
  --member="serviceAccount:app-sa@my-project.iam.gserviceaccount.com" \\
  --role="projects/my-project/roles/appReadOnly" \\
  --condition='expression=request.time < timestamp("2026-12-31T00:00:00Z"),title=temp-access'
\`\`\`

### Service Account Security

Service account key leaks are the **#1 GCP attack vector**:

\`\`\`bash
# List all SA keys (look for user-managed keys)
gcloud iam service-accounts keys list \\
  --iam-account=my-sa@my-project.iam.gserviceaccount.com \\
  --managed-by=user

# BEST: Use Workload Identity Federation instead of keys
gcloud iam workload-identity-pools create github-pool \\
  --project=my-project \\
  --location=global \\
  --display-name="GitHub Actions Pool"

gcloud iam workload-identity-pools providers create-oidc github-provider \\
  --project=my-project \\
  --location=global \\
  --workload-identity-pool=github-pool \\
  --display-name="GitHub Provider" \\
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \\
  --issuer-uri="https://token.actions.githubusercontent.com"
\`\`\`

### Organization Policy Constraints

\`\`\`bash
# Disable SA key creation org-wide
gcloud org-policies set-policy \\
  --organization=123456789 \\
  policy.yaml

# policy.yaml
# constraint: constraints/iam.disableServiceAccountKeyCreation
# booleanPolicy:
#   enforced: true

# Restrict which external IP ranges can access resources
gcloud org-policies set-policy \\
  --organization=123456789 \\
  ip-policy.yaml

# Require OS Login for all VMs
gcloud compute project-info add-metadata \\
  --metadata enable-oslogin=TRUE
\`\`\`

---

## 2. VPC Service Controls: The GCP Secret Weapon

VPC Service Controls create a **security perimeter** around GCP resources that prevents data exfiltration — even with valid IAM credentials.

\`\`\`bash
# Create an access policy
gcloud access-context-manager policies create \\
  --organization=123456789 \\
  --title="Production Security Policy"

# Create an access level (IP + device requirements)
gcloud access-context-manager levels create corp-network \\
  --title="Corporate Network" \\
  --basic-level-spec=level-spec.yaml \\
  --policy=POLICY_ID

# Create a service perimeter
gcloud access-context-manager perimeters create production \\
  --title="Production Perimeter" \\
  --resources="projects/12345,projects/67890" \\
  --restricted-services="storage.googleapis.com,bigquery.googleapis.com" \\
  --access-levels="accessPolicies/POLICY_ID/accessLevels/corp-network" \\
  --policy=POLICY_ID
\`\`\`

**What VPC SC prevents:**
- Service account key stolen → can't exfil data outside perimeter
- Insider threat → BigQuery exports blocked outside perimeter
- Compromised CI/CD → GCS access blocked from non-approved networks

---

## 3. Security Command Center (SCC)

SCC is GCP's CSPM — think of it as AWS Security Hub + GuardDuty combined.

### Enable SCC Premium Tier

\`\`\`bash
# Enable SCC Premium (org-level)
gcloud scc manage services update security-health-analytics \\
  --organization=123456789 \\
  --enablement-state=ENABLED

# Enable all detectors
gcloud scc manage services update web-security-scanner \\
  --organization=123456789 \\
  --enablement-state=ENABLED

gcloud scc manage services update event-threat-detection \\
  --organization=123456789 \\
  --enablement-state=ENABLED

gcloud scc manage services update container-threat-detection \\
  --organization=123456789 \\
  --enablement-state=ENABLED
\`\`\`

### Query SCC Findings

\`\`\`bash
# List all HIGH/CRITICAL findings
gcloud scc findings list 123456789 \\
  --source="-" \\
  --filter='severity="HIGH" OR severity="CRITICAL"' \\
  --format="table(finding.category, finding.severity, resource.name)"

# Find all public GCS buckets
gcloud scc findings list 123456789 \\
  --source="-" \\
  --filter='category="PUBLIC_BUCKET"'
\`\`\`

---

## 4. Binary Authorization

Enforce that only **signed, trusted container images** run in GKE:

\`\`\`bash
# Create an attestor
gcloud container binauthz attestors create prod-attestor \\
  --attestation-authority-note=prod-note \\
  --attestation-authority-note-project=my-project

# Create the Binary Authorization policy
gcloud container binauthz policy import policy.yaml

# policy.yaml:
# defaultAdmissionRule:
#   evaluationMode: REQUIRE_ATTESTATION
#   enforcementMode: ENFORCED_BLOCK_AND_AUDIT_LOG
#   requireAttestationsBy:
#     - projects/my-project/attestors/prod-attestor
# clusterAdmissionRules:
#   us-central1-a.prod-cluster:
#     evaluationMode: REQUIRE_ATTESTATION
#     enforcementMode: ENFORCED_BLOCK_AND_AUDIT_LOG
#     requireAttestationsBy:
#       - projects/my-project/attestors/prod-attestor
\`\`\`

---

## 5. Cloud Armor: DDoS and WAF

\`\`\`bash
# Create a security policy
gcloud compute security-policies create web-policy \\
  --description="Production WAF policy"

# Block SQL injection
gcloud compute security-policies rules create 1000 \\
  --security-policy=web-policy \\
  --expression="evaluatePreconfiguredExpr('sqli-v33-stable')" \\
  --action=deny-403 \\
  --description="Block SQLi"

# Block XSS
gcloud compute security-policies rules create 1001 \\
  --security-policy=web-policy \\
  --expression="evaluatePreconfiguredExpr('xss-v33-stable')" \\
  --action=deny-403 \\
  --description="Block XSS"

# Rate limiting
gcloud compute security-policies rules create 2000 \\
  --security-policy=web-policy \\
  --src-ip-ranges="*" \\
  --action=rate-based-ban \\
  --rate-limit-threshold-count=100 \\
  --rate-limit-threshold-interval-sec=60 \\
  --ban-duration-sec=300 \\
  --description="Rate limit: 100 req/min"

# Geo-blocking
gcloud compute security-policies rules create 3000 \\
  --security-policy=web-policy \\
  --expression="origin.region_code == 'CN' || origin.region_code == 'RU'" \\
  --action=deny-403 \\
  --description="Block traffic from CN/RU"
\`\`\`

---

## 6. GCP Security Audit Script

\`\`\`python
import subprocess
import json

def gcp_security_audit(project_id):
    """Comprehensive GCP security audit"""
    findings = []
    
    # Check 1: Public GCS buckets
    result = subprocess.run(
        ['gsutil', 'ls', '-p', project_id],
        capture_output=True, text=True
    )
    buckets = result.stdout.strip().split('\\n')
    
    for bucket in buckets:
        if bucket:
            iam = subprocess.run(
                ['gsutil', 'iam', 'get', bucket],
                capture_output=True, text=True
            )
            if 'allUsers' in iam.stdout or 'allAuthenticatedUsers' in iam.stdout:
                findings.append({
                    'severity': 'CRITICAL',
                    'resource': bucket,
                    'issue': 'Publicly accessible GCS bucket'
                })
    
    # Check 2: SA keys older than 90 days
    result = subprocess.run(
        ['gcloud', 'iam', 'service-accounts', 'list',
         '--project', project_id, '--format', 'json'],
        capture_output=True, text=True
    )
    service_accounts = json.loads(result.stdout)
    
    for sa in service_accounts:
        keys_result = subprocess.run(
            ['gcloud', 'iam', 'service-accounts', 'keys', 'list',
             '--iam-account', sa['email'],
             '--managed-by', 'user', '--format', 'json'],
            capture_output=True, text=True
        )
        keys = json.loads(keys_result.stdout)
        if keys:
            findings.append({
                'severity': 'HIGH',
                'resource': sa['email'],
                'issue': f'{len(keys)} user-managed SA keys found'
            })
    
    # Check 3: Default network exists
    result = subprocess.run(
        ['gcloud', 'compute', 'networks', 'list',
         '--project', project_id, '--format', 'json'],
        capture_output=True, text=True
    )
    networks = json.loads(result.stdout)
    for network in networks:
        if network['name'] == 'default':
            findings.append({
                'severity': 'MEDIUM',
                'resource': 'default-network',
                'issue': 'Default VPC network still exists'
            })
    
    return findings
\`\`\`

---

## GCP vs AWS Security: Key Differences

| Feature | GCP | AWS |
|---------|-----|-----|
| IAM model | Resource-centric | User-centric |
| Default encryption | Always on (Google-managed) | Opt-in per service |
| Network isolation | VPC Service Controls | VPC + security groups |
| Container security | Binary Authorization | ECR image scanning |
| Threat detection | SCC + Chronicle | GuardDuty + Detective |
| Audit logging | Cloud Audit Logs (always on) | CloudTrail (must enable) |
| DDoS protection | Cloud Armor (included) | Shield (Standard free / Advanced paid) |

---

## Key Takeaways

1. **VPC Service Controls are non-negotiable** — they stop data exfiltration even with valid credentials
2. **Eliminate SA keys** — use Workload Identity Federation for all CI/CD and cross-cloud access
3. **Organization Policies > individual project settings** — enforce security at the org level
4. **Binary Authorization for GKE** — prevent unauthorized container images from running
5. **SCC Premium is worth it** — real-time threat detection, vulnerability scanning, and compliance monitoring in one dashboard

> **Scan your GCP infrastructure code with [ShieldX](https://securecodereviews.com/shieldx) — detect misconfigurations in Terraform, Deployment Manager, and Kubernetes manifests before deployment.**
`,
  },
  {
    slug: "kubernetes-security-complete-guide-k8s-hardening-2026",
    title:
      "Kubernetes Security: Complete K8s Hardening Guide — From Cluster to Pod",
    excerpt:
      "The most comprehensive Kubernetes security guide for 2026 — covers RBAC, network policies, pod security standards, admission controllers, runtime monitoring, and container escape prevention. Includes real attack chains, CIS benchmark checks, and production-ready YAML configurations.",
    date: "2026-04-13",
    author: "SCR Team",
    category: "Cloud Security",
    tags: [
      "Kubernetes Security",
      "K8s",
      "Container Security",
      "RBAC",
      "Pod Security",
      "Network Policy",
      "Falco",
      "OPA Gatekeeper",
    ],
    readTime: "26 min read",
    image: "/blog/kubernetes-attack-surface.svg",
    content: `## The Kubernetes Security Challenge

Kubernetes is now the **de facto orchestration platform** — 92% of organizations use it in production as of 2026. But its complexity creates a massive attack surface.

![Kubernetes Attack Surface — From Cluster to Container](/blog/kubernetes-attack-surface.svg)

The **2025 Red Hat State of Kubernetes Security Report** found:
- **67%** of organizations had a K8s security incident in the past 12 months
- **45%** delayed deploying applications due to security concerns
- **78%** of clusters run with default (overpermissive) RBAC settings

---

## 1. RBAC: The First Line of Defense

RBAC misconfigurations are the **single biggest K8s vulnerability**.

### Audit Current RBAC Permissions

\`\`\`bash
# Find all cluster-admin bindings (should be minimal)
kubectl get clusterrolebindings -o json | jq -r '
  .items[] |
  select(.roleRef.name == "cluster-admin") |
  "\\(.metadata.name): \\(.subjects[]?.name) (\\(.subjects[]?.kind))"
'

# Find all roles with wildcard permissions
kubectl get clusterroles -o json | jq -r '
  .items[] |
  select(.rules[]?.verbs? | index("*")) |
  .metadata.name
'

# Check what a specific service account can do
kubectl auth can-i --list \\
  --as=system:serviceaccount:default:my-app
\`\`\`

### Minimal RBAC for Application Workloads

\`\`\`yaml
# Role: Only read pods and configmaps in own namespace
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-reader
  namespace: production
rules:
  - apiGroups: [""]
    resources: ["pods", "configmaps", "services"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch"]

---
# RoleBinding: Bind to app service account
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-reader-binding
  namespace: production
subjects:
  - kind: ServiceAccount
    name: my-app
    namespace: production
roleRef:
  kind: Role
  name: app-reader
  apiGroup: rbac.authorization.k8s.io
\`\`\`

### Disable Automounted Service Account Tokens

\`\`\`yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app
  namespace: production
automountServiceAccountToken: false
\`\`\`

---

## 2. Pod Security Standards (PSS)

Pod Security Standards replaced PodSecurityPolicy in K8s 1.25+:

### Enforce Restricted Profile

\`\`\`yaml
# Label namespace to enforce restricted profile
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
\`\`\`

### Hardened Pod Spec

\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: secure-app
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: secure-app
  template:
    metadata:
      labels:
        app: secure-app
    spec:
      serviceAccountName: my-app
      automountServiceAccountToken: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: app
          image: my-registry/app:v1.2.3@sha256:abc123...
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          ports:
            - containerPort: 8080
              protocol: TCP
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir:
            sizeLimit: 100Mi
\`\`\`

**What this prevents:**
- Container escape via privileged mode
- Root filesystem tampering
- Privilege escalation via setuid binaries
- Cryptomining via unlimited resources
- Image tag mutation (uses digest)

---

## 3. Network Policies: Microsegmentation

By default, all pods can communicate with all other pods. This is **disastrous** for lateral movement.

### Default Deny All Traffic

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
\`\`\`

### Allow Only Specific Traffic

\`\`\`yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-app-traffic
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web-api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: production
          podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:  # Allow DNS
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
\`\`\`

---

## 4. Admission Controllers: OPA Gatekeeper

Admission controllers intercept API requests before persistence:

### Block Privileged Containers

\`\`\`yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8sblockprivileged
spec:
  crd:
    spec:
      names:
        kind: K8sBlockPrivileged
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8sblockprivileged
        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          container.securityContext.privileged == true
          msg := sprintf("Privileged container not allowed: %v", [container.name])
        }
        violation[{"msg": msg}] {
          container := input.review.object.spec.initContainers[_]
          container.securityContext.privileged == true
          msg := sprintf("Privileged init container not allowed: %v", [container.name])
        }

---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sBlockPrivileged
metadata:
  name: block-privileged-containers
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    namespaces: ["production", "staging"]
\`\`\`

### Require Image Digests (No :latest)

\`\`\`yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredigest
spec:
  crd:
    spec:
      names:
        kind: K8sRequireDigest
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredigest
        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not contains(container.image, "@sha256:")
          msg := sprintf("Image must use digest, not tag: %v", [container.image])
        }
\`\`\`

---

## 5. Runtime Monitoring with Falco

Falco detects anomalous activity at runtime:

\`\`\`yaml
# falco-rules.yaml
- rule: Terminal shell in container
  desc: Detect shell in a container (potential exec)
  condition: >
    spawned_process and
    container and
    proc.name in (bash, sh, zsh, dash) and
    not proc.pname in (cron, supervisord)
  output: >
    Shell spawned in container
    (user=%user.name container=%container.name
    image=%container.image.repository
    shell=%proc.name parent=%proc.pname)
  priority: WARNING

- rule: Read sensitive file in container
  desc: Detect reads of sensitive files
  condition: >
    open_read and
    container and
    fd.name in (/etc/shadow, /etc/passwd, /proc/1/environ)
  output: >
    Sensitive file read in container
    (file=%fd.name container=%container.name
    image=%container.image.repository)
  priority: CRITICAL

- rule: Outbound connection to crypto pool
  desc: Detect potential cryptomining
  condition: >
    outbound and
    container and
    fd.sip.name contains "pool" or
    fd.sport in (3333, 4444, 5555, 8888, 9999)
  output: >
    Crypto mining connection detected
    (container=%container.name dest=%fd.sip:%fd.sport)
  priority: CRITICAL
\`\`\`

---

## 6. Secrets Management

Never store secrets in plain YAML:

\`\`\`yaml
# BAD: Plain text secret
apiVersion: v1
kind: Secret
metadata:
  name: db-creds
type: Opaque
data:
  password: cGFzc3dvcmQxMjM=  # base64 is NOT encryption!

---
# GOOD: External Secrets Operator with Vault
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-creds
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: db-creds
  data:
    - secretKey: password
      remoteRef:
        key: secret/data/production/db
        property: password
\`\`\`

---

## K8s Security Audit Checklist

### Cluster Level
- [ ] API server not publicly accessible
- [ ] RBAC enabled (default since 1.8+)
- [ ] No cluster-admin bindings to user accounts
- [ ] etcd encrypted at rest
- [ ] Audit logging enabled
- [ ] Admission controllers configured
- [ ] K8s version is latest stable (patch < 30 days)

### Network Level
- [ ] Default deny NetworkPolicy in all namespaces
- [ ] Ingress controller has WAF (ModSecurity)
- [ ] Service mesh with mTLS (Istio/Linkerd)
- [ ] No NodePort services in production
- [ ] CNI supports NetworkPolicy (Calico/Cilium)

### Workload Level
- [ ] Pod Security Standards: restricted
- [ ] All containers non-root
- [ ] Read-only root filesystem
- [ ] All capabilities dropped
- [ ] Resource limits on all containers
- [ ] Image digests (not tags)
- [ ] Private registry only
- [ ] Seccomp profiles enabled
- [ ] No hostPath mounts
- [ ] No host networking

---

## Key Takeaways

1. **RBAC is broken by default** — 78% of clusters have overpermissive roles. Audit with \`kubectl auth can-i --list\`
2. **Network policies are mandatory** — without them, one compromised pod = full cluster access
3. **Pod Security Standards replace PSP** — enforce "restricted" profile on production namespaces
4. **Admission controllers are your last gate** — use OPA Gatekeeper or Kyverno to prevent misconfigs
5. **Runtime monitoring catches what static analysis misses** — Falco detects container escapes, cryptomining, and shell access in real time

> **Scan your Kubernetes manifests and Helm charts with [ShieldX](https://securecodereviews.com/shieldx) — detect RBAC misconfigurations, missing security contexts, and CIS benchmark violations before deployment.**
`,
  },
  {
    slug: "container-security-docker-kubernetes-hardening-guide-2026",
    title:
      "Container Security: Docker & Kubernetes Hardening — Build, Ship, Run Securely",
    excerpt:
      "End-to-end container security guide covering Dockerfile hardening, image scanning with Trivy, supply chain security with Cosign and SLSA, runtime protection with Falco, and container escape prevention. Includes real CVEs, escape techniques, and production-ready configurations.",
    date: "2026-04-13",
    author: "SCR Team",
    category: "Cloud Security",
    tags: [
      "Container Security",
      "Docker Security",
      "Kubernetes",
      "Trivy",
      "Image Scanning",
      "Supply Chain Security",
      "Cosign",
      "Container Escape",
    ],
    readTime: "20 min read",
    image: "/blog/container-security-pipeline.svg",
    content: `## The Container Security Problem

Containers are ephemeral, portable, and fast — but they share the host kernel. One misconfiguration can give attackers **full node access**.

![Container Security — Build Ship Run Pipeline](/blog/container-security-pipeline.svg)

The **2025 Sysdig Cloud-Native Security Report** found:
- **87%** of container images have HIGH or CRITICAL CVEs
- **76%** of containers run as root unnecessarily
- **52%** allow privilege escalation
- The average container has **127 known vulnerabilities**

---

## Phase 1: BUILD — Secure Your Dockerfiles

### Hardened Multi-Stage Dockerfile

\`\`\`dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy only package files first (cache optimization)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

# Stage 2: Production — distroless
FROM gcr.io/distroless/nodejs20-debian12:nonroot

# Don't run as root
USER nonroot:nonroot
WORKDIR /app

# Copy only built artifacts
COPY --from=builder --chown=nonroot:nonroot /app/dist ./dist
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules

EXPOSE 8080

CMD ["dist/server.js"]
\`\`\`

**What this prevents:**
- Build tools in production image (multi-stage)
- Running as root (USER nonroot)
- Shell access for attackers (distroless has no shell)
- Large attack surface (distroless = minimal packages)

### Dockerfile Security Linting with Hadolint

\`\`\`bash
# Run Hadolint on your Dockerfile
docker run --rm -i hadolint/hadolint < Dockerfile

# Common issues it catches:
# DL3007 - Using :latest tag
# DL3008 - Not pinning apt package versions
# DL3009 - Not cleaning apt cache
# DL3015 - Not using --no-install-recommends
# DL3018 - Not pinning apk package versions
# DL3025 - Using ADD instead of COPY
\`\`\`

### .dockerignore (Prevent Secret Leaks)

\`\`\`
.git
.env
.env.*
*.pem
*.key
node_modules
.aws
.gcp
docker-compose*.yml
\`\`\`

---

## Phase 2: SHIP — Image Scanning and Signing

### Scan with Trivy in CI/CD

\`\`\`yaml
# GitHub Actions: Trivy image scan
name: Container Security
on: push

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build image
        run: docker build -t my-app:$GITHUB_SHA .
      
      - name: Trivy vulnerability scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: my-app:$GITHUB_SHA
          format: sarif
          output: trivy-results.sarif
          severity: HIGH,CRITICAL
          exit-code: 1  # Fail build on HIGH/CRITICAL
      
      - name: Trivy config scan (Dockerfile)
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: config
          scan-ref: .
          exit-code: 1
      
      - name: Upload SARIF
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: trivy-results.sarif
\`\`\`

### Sign Images with Cosign (Supply Chain Security)

\`\`\`bash
# Generate a key pair
cosign generate-key-pair

# Sign the image after build
cosign sign --key cosign.key my-registry/app:v1.2.3

# Verify before deployment
cosign verify --key cosign.pub my-registry/app:v1.2.3

# Keyless signing with OIDC (recommended)
COSIGN_EXPERIMENTAL=1 cosign sign my-registry/app:v1.2.3
# Uses Fulcio CA + Rekor transparency log
\`\`\`

### Generate SBOM (Software Bill of Materials)

\`\`\`bash
# Generate SBOM with Syft
syft my-registry/app:v1.2.3 -o spdx-json > sbom.json

# Attach SBOM to image
cosign attach sbom --sbom sbom.json my-registry/app:v1.2.3

# Scan SBOM for vulnerabilities
grype sbom:sbom.json
\`\`\`

---

## Phase 3: RUN — Runtime Security

### Container Escape Techniques and Prevention

#### Escape 1: Privileged Container + nsenter

\`\`\`bash
# Attack: If privileged=true, escape is trivial
nsenter --target 1 --mount --uts --ipc --net --pid -- bash
# Now you have root on the host

# Prevention: Never allow privileged containers
# In Kubernetes:
# securityContext:
#   privileged: false
#   allowPrivilegeEscalation: false
#   capabilities:
#     drop: ["ALL"]
\`\`\`

#### Escape 2: Docker Socket Mount

\`\`\`bash
# Attack: If /var/run/docker.sock is mounted
docker -H unix:///var/run/docker.sock run -it --privileged \\
  -v /:/host alpine chroot /host bash
# Full host access

# Prevention: Never mount Docker socket in pods
\`\`\`

#### Escape 3: CVE-2024-21626 (runc Breakout)

\`\`\`bash
# Attack: runc < 1.1.12 allows /proc/self/fd escape
# via WORKDIR pointing to leaked fd

# Prevention:
# 1. Patch runc >= 1.1.12
# 2. Use containerd >= 1.7.13
# 3. Use gVisor/Kata Containers for untrusted workloads
\`\`\`

### Seccomp Profile (System Call Filtering)

\`\`\`json
{
  "defaultAction": "SCMP_ACT_ERRNO",
  "architectures": ["SCMP_ARCH_X86_64"],
  "syscalls": [
    {
      "names": [
        "read", "write", "open", "close", "stat", "fstat",
        "mmap", "mprotect", "munmap", "brk", "ioctl",
        "access", "pipe", "select", "sched_yield",
        "dup", "dup2", "nanosleep", "getpid", "socket",
        "connect", "accept", "sendto", "recvfrom",
        "bind", "listen", "getsockname", "getpeername",
        "clone", "execve", "exit", "wait4", "kill",
        "fcntl", "flock", "fsync", "fdatasync",
        "getcwd", "chdir", "mkdir", "rmdir",
        "epoll_create", "epoll_wait", "epoll_ctl",
        "futex", "set_tid_address", "set_robust_list",
        "exit_group", "tgkill", "openat", "readlinkat",
        "newfstatat", "getrandom", "memfd_create",
        "clock_gettime", "clock_nanosleep"
      ],
      "action": "SCMP_ACT_ALLOW"
    }
  ]
}
\`\`\`

---

## Image Comparison: Base Image Attack Surface

| Base Image | Size | CVEs (typical) | Has Shell | Recommended |
|-----------|------|----------------|-----------|-------------|
| ubuntu:22.04 | 77MB | 30-50 | Yes | No |
| alpine:3.19 | 7.3MB | 5-15 | Yes | Development |
| distroless/static | 2.5MB | 0-3 | No | Go, Rust |
| distroless/base | 20MB | 2-8 | No | C/C++ |
| distroless/nodejs | 120MB | 5-15 | No | Node.js |
| scratch | 0MB | 0 | No | Static binaries |
| chainguard/node | 50MB | 0-5 | No | Best for Node |

---

## Production Container Security Pipeline

\`\`\`yaml
# Complete GitHub Actions pipeline
name: Secure Container Pipeline
on:
  push:
    branches: [main]

jobs:
  build-scan-sign-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write  # For keyless signing
      security-events: write  # For SARIF upload
    
    steps:
      # 1. Lint Dockerfile
      - uses: hadolint/hadolint-action@v3
        with:
          dockerfile: Dockerfile
          failure-threshold: warning
      
      # 2. Build
      - name: Build image
        run: |
          docker build -t app:$GITHUB_SHA .
      
      # 3. Scan for vulnerabilities
      - name: Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: app:$GITHUB_SHA
          exit-code: 1
          severity: CRITICAL
      
      # 4. Generate SBOM
      - name: Generate SBOM
        run: syft app:$GITHUB_SHA -o spdx-json > sbom.json
      
      # 5. Push to registry
      - name: Push
        run: |
          docker tag app:$GITHUB_SHA $REGISTRY/app:$GITHUB_SHA
          docker push $REGISTRY/app:$GITHUB_SHA
      
      # 6. Sign image (keyless)
      - name: Sign
        run: cosign sign $REGISTRY/app:$GITHUB_SHA
      
      # 7. Attach SBOM
      - name: Attach SBOM
        run: cosign attach sbom --sbom sbom.json $REGISTRY/app:$GITHUB_SHA
      
      # 8. Deploy (only signed images)
      - name: Deploy to K8s
        run: |
          kubectl set image deployment/app \\
            app=$REGISTRY/app:$GITHUB_SHA@$(cosign triangulate $REGISTRY/app:$GITHUB_SHA)
\`\`\`

---

## Key Takeaways

1. **Multi-stage builds + distroless** — reduce image size by 90% and eliminate most CVEs
2. **Scan in CI/CD, fail on CRITICAL** — don't deploy images with known exploits
3. **Sign everything with Cosign** — prevent supply chain attacks (remember SolarWinds)
4. **Never run as root** — 76% of containers do this unnecessarily
5. **Seccomp + capability dropping** — reduce kernel attack surface to only needed syscalls
6. **Runtime monitoring with Falco** — catch container escapes and cryptomining in real time

> **Scan your Dockerfiles and container configurations with [ShieldX](https://securecodereviews.com/shieldx) — detect hardcoded secrets, root user vulnerabilities, and insecure base images before they reach production.**
`,
  },
  {
    slug: "multi-cloud-security-aws-gcp-azure-comparison-2026",
    title:
      "Multi-Cloud Security: AWS vs GCP vs Azure — Complete Comparison Guide for 2026",
    excerpt:
      "Side-by-side comparison of security services across AWS, Google Cloud, and Azure — covering IAM, network security, encryption, threat detection, container security, and compliance. Includes a multi-cloud security architecture and unified monitoring strategy.",
    date: "2026-04-13",
    author: "SCR Team",
    category: "Cloud Security",
    tags: [
      "Multi-Cloud Security",
      "AWS",
      "Google Cloud",
      "Azure",
      "Cloud Security",
      "CSPM",
      "Cloud Comparison",
      "Zero Trust",
    ],
    readTime: "18 min read",
    image: "/blog/multi-cloud-security-comparison.svg",
    content: `## Why Multi-Cloud Security Is Different

**76% of enterprises** use two or more cloud providers as of 2026. Multi-cloud brings resilience but multiplies the attack surface — you now need to secure IAM, networking, and data across fundamentally different security models.

![Multi-Cloud Security Comparison — AWS vs GCP vs Azure](/blog/multi-cloud-security-comparison.svg)

The **2025 HashiCorp State of Cloud Strategy** found:
- 76% use multi-cloud
- Only 23% have a unified security strategy across clouds
- 58% of breaches in multi-cloud environments stem from inconsistent security configurations

---

## 1. Identity & Access Management Compared

### AWS IAM
- **Model**: User-centric — policies attached to users, groups, roles
- **Strength**: Granular conditions, permission boundaries, SCPs
- **Weakness**: Complexity — 11,000+ unique IAM actions across 300+ services

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::bucket/*",
    "Condition": {
      "IpAddress": {"aws:SourceIp": "10.0.0.0/8"}
    }
  }]
}
\`\`\`

### GCP IAM
- **Model**: Resource-centric — permissions bound to resources via role bindings
- **Strength**: Hierarchy inheritance, Workload Identity Federation
- **Weakness**: Custom roles limited to 3000 permissions

\`\`\`bash
gcloud projects add-iam-policy-binding my-project \\
  --member="serviceAccount:app@my-project.iam.gserviceaccount.com" \\
  --role="roles/storage.objectViewer" \\
  --condition='expression=resource.name.startsWith("projects/_/buckets/my-bucket"),title=bucket-only'
\`\`\`

### Azure RBAC
- **Model**: Scope-based — assignments at management group, subscription, resource group, or resource level
- **Strength**: Entra ID integration, PIM (Privileged Identity Management)
- **Weakness**: Complex scope inheritance, role definition sprawl

\`\`\`bash
az role assignment create \\
  --assignee "user@company.com" \\
  --role "Storage Blob Data Reader" \\
  --scope "/subscriptions/SUB_ID/resourceGroups/prod/providers/Microsoft.Storage/storageAccounts/myaccount"
\`\`\`

### Unified IAM Strategy

| Practice | AWS | GCP | Azure |
|----------|-----|-----|-------|
| Federated identity | IAM Identity Center + SAML | Workload Identity Federation | Entra ID + OIDC |
| Least privilege audit | IAM Access Analyzer | IAM Recommender | Entra Permissions Management |
| MFA enforcement | IAM policy condition | Org Policy | Conditional Access |
| Temporary credentials | STS AssumeRole | SA impersonation | Managed Identity |
| Org-wide guardrails | SCPs | Org Policies | Azure Policy |

---

## 2. Network Security Compared

### AWS
\`\`\`hcl
# VPC + Security Groups + NACL
resource "aws_security_group" "app" {
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }
}
\`\`\`

### GCP
\`\`\`hcl
# VPC + Firewall Rules + VPC Service Controls
resource "google_compute_firewall" "app" {
  network   = google_compute_network.vpc.name
  direction = "INGRESS"
  allow {
    protocol = "tcp"
    ports    = ["443"]
  }
  source_ranges = ["10.0.0.0/8"]
  target_tags   = ["app-server"]
}
\`\`\`

### Azure
\`\`\`hcl
# VNet + NSG + ASG
resource "azurerm_network_security_rule" "app" {
  name                        = "allow-https"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  destination_port_range      = "443"
  source_address_prefix       = "10.0.0.0/8"
  resource_group_name         = azurerm_resource_group.rg.name
  network_security_group_name = azurerm_network_security_group.nsg.name
}
\`\`\`

---

## 3. Threat Detection Comparison

| Capability | AWS | GCP | Azure |
|-----------|-----|-----|-------|
| Threat detection | GuardDuty | Event Threat Detection | Defender for Cloud |
| SIEM | Security Lake | Chronicle SIEM | Microsoft Sentinel |
| Investigation | Detective | SCC Findings | Defender XDR |
| Malware scanning | GuardDuty Malware | SCC VM scanning | Defender Antimalware |
| Container threats | GuardDuty EKS | Container Threat Detection | Defender for Containers |
| DNS threats | GuardDuty DNS | Cloud DNS logging | DNS Analytics |
| Cost | ~$4/GB ingested | ~$12/GB (Chronicle) | ~$2.46/GB (Sentinel) |

### Unified Monitoring Architecture

\`\`\`yaml
# Multi-cloud log aggregation with Terraform
# AWS → S3 → EventBridge → Central SIEM
# GCP → Pub/Sub → Cloud Function → Central SIEM
# Azure → Event Hub → Function App → Central SIEM

# Option 1: Use a cloud-agnostic SIEM
# - Splunk Cloud
# - Elastic SIEM
# - Datadog Security

# Option 2: Use one cloud's SIEM as primary
# Best option: Google Chronicle (unlimited ingestion pricing)
# Or: Microsoft Sentinel (good multi-cloud connectors)
\`\`\`

---

## 4. Encryption Compared

| Feature | AWS | GCP | Azure |
|---------|-----|-----|-------|
| Default encryption | No (opt-in per service) | Yes (always on) | Yes (most services) |
| Key management | KMS + CloudHSM | Cloud KMS + EKM | Key Vault + HSM |
| Customer-managed keys | SSE-KMS | CMEK | Customer-managed |
| External key manager | No (CloudHSM on-prem) | EKM (Thales, Fortanix) | Azure Key Vault BYOK |
| Key rotation | Annual (automatic) | Annual (automatic) | Configurable |
| Encryption in transit | TLS custom config per service | TLS default everywhere | TLS custom config |

---

## 5. Container Security Compared

| Feature | AWS (EKS) | GCP (GKE) | Azure (AKS) |
|---------|-----------|-----------|-------------|
| Image scanning | ECR + Inspector | Artifact Registry + SCC | ACR + Defender |
| Binary authorization | N/A (use OPA) | Binary Authorization | N/A (use OPA) |
| Runtime protection | GuardDuty EKS | Container Threat Detection | Defender for Containers |
| Node OS | Amazon Linux / Bottlerocket | Container-Optimized OS | Ubuntu / Azure Linux |
| Auto-upgrades | Managed node groups | Release channels | Auto-upgrade |
| Pod security | Pod Identity | Workload Identity | Workload Identity |
| Network policy | Calico (addon) | Calico / Dataplane V2 | Calico / Azure NPM |
| Service mesh | App Mesh / Istio addon | Anthos Service Mesh | Istio addon |

### GKE Autopilot: Best Default K8s Security

GKE Autopilot enforces security best practices by default:
\`\`\`bash
# Create an Autopilot cluster (hardened by default)
gcloud container clusters create-auto prod-cluster \\
  --region=us-central1 \\
  --release-channel=stable

# Autopilot automatically enforces:
# - No privileged pods
# - No host networking
# - No hostPath mounts
# - Resource limits required
# - Workload Identity enabled
# - Shielded GKE nodes
# - Binary Authorization ready
\`\`\`

---

## 6. Compliance and Posture Management

| Framework | AWS | GCP | Azure |
|-----------|-----|-----|-------|
| CSPM | Security Hub | SCC Premium | Defender for Cloud |
| CIS benchmarks | Config + Security Hub | SCC | Defender |
| SOC 2 | Audit Manager | Assured Workloads | Compliance Manager |
| HIPAA | BAA available | BAA available | BAA available |
| PCI DSS | Config Rules | SCC | Policy compliance |
| ISO 27001 | All regions | All regions | All regions |

---

## Multi-Cloud Security Architecture

\`\`\`
                    ┌─────────────────────────────┐
                    │   UNIFIED SECURITY LAYER     │
                    │                               │
                    │  • Central SIEM (Chronicle)   │
                    │  • CSPM (Wiz / Orca / Prisma) │
                    │  • IaC Scanning (ShieldX)     │
                    │  • Secrets (HashiCorp Vault)   │
                    │  • Identity (Okta / Entra)     │
                    └──────────┬────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
     ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
     │    AWS      │   │    GCP      │   │   Azure     │
     │             │   │             │   │             │
     │ GuardDuty   │   │ SCC Premium │   │ Defender    │
     │ Security Hub│   │ VPC SC      │   │ Sentinel    │
     │ CloudTrail  │   │ Audit Logs  │   │ Activity Log│
     │ Config      │   │ Org Policy  │   │ Policy      │
     └─────────────┘   └─────────────┘   └─────────────┘
\`\`\`

---

## Multi-Cloud Security Checklist

### Identity (Unified)
- [ ] Single IdP (Okta/Entra) federated to all clouds
- [ ] No long-lived credentials in any cloud
- [ ] MFA enforced everywhere
- [ ] JIT (Just-in-Time) access for admin roles
- [ ] Regular cross-cloud access review

### Network (Per Cloud)
- [ ] Private connectivity between clouds (Interconnect/ExpressRoute/DirectConnect)
- [ ] No public IP on compute unless required
- [ ] Centralized egress filtering
- [ ] DNS logging in all clouds

### Data (Unified)
- [ ] Encryption at rest in all clouds (CMK preferred)
- [ ] TLS 1.2+ everywhere
- [ ] Centralized secrets management (Vault)
- [ ] DLP scanning across all storage services

### Monitoring (Unified)
- [ ] All cloud logs → central SIEM
- [ ] Unified alerting rules
- [ ] Cross-cloud incident response playbook
- [ ] Quarterly multi-cloud tabletop exercises

---

## Key Takeaways

1. **Don't replicate security tooling per cloud** — use a unified layer (CSPM, SIEM, secrets management)
2. **GCP has the best defaults** — always-on encryption, VPC Service Controls, and GKE Autopilot
3. **AWS has the most granular controls** — but complexity is the enemy of security
4. **Azure wins for Microsoft shops** — Entra ID + Defender + Sentinel is a strong integrated stack
5. **IaC scanning is the great equalizer** — catch misconfigurations in Terraform/Pulumi before they reach any cloud

> **Scan your multi-cloud infrastructure code with [ShieldX](https://securecodereviews.com/shieldx) — one platform for AWS, GCP, and Azure Terraform, CloudFormation, Deployment Manager, and ARM template security scanning.**
`,
  },
];
