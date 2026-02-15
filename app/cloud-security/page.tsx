import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import {
  Cloud,
  Shield,
  Lock,
  Eye,
  Key,
  Server,
  Globe,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cloud Security Guide — AWS, Azure, GCP Security Best Practices",
  description:
    "Comprehensive cloud security guide covering AWS, Azure, and GCP. IAM best practices, network security, data encryption, compliance, CSPM, and real-world breach case studies.",
  keywords: [
    "cloud security",
    "AWS security",
    "Azure security",
    "GCP security",
    "IAM",
    "cloud misconfiguration",
    "CSPM",
    "cloud compliance",
    "cloud data breach",
    "zero trust cloud",
  ],
  openGraph: {
    title: "Cloud Security Guide — AWS, Azure, GCP | SecureCodeReviews",
    description:
      "Comprehensive cloud security guide: IAM, network security, data encryption, compliance, and real-world breach case studies.",
    url: "https://securecodereviews.com/cloud-security",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloud Security Guide | SecureCodeReviews",
    description:
      "AWS, Azure, GCP security best practices — IAM, encryption, compliance, and CSPM.",
  },
  alternates: {
    canonical: "/cloud-security",
  },
};

const providers = [
  {
    name: "Amazon Web Services (AWS)",
    icon: Server,
    color: "text-orange-500",
    services: [
      "IAM — Identity & Access Management with MFA, Roles, SCP",
      "GuardDuty — Intelligent threat detection",
      "Security Hub — Centralized security findings",
      "Inspector — Automated vulnerability assessment",
      "Macie — Data classification & PII discovery",
      "KMS — Key Management Service",
      "CloudTrail — API activity logging & auditing",
      "WAF & Shield — Web application firewall & DDoS protection",
    ],
    bestPractices: [
      "Enable MFA on all IAM users, especially root",
      "Use IAM Roles instead of long-lived access keys",
      "Enable S3 Block Public Access at account level",
      "Turn on CloudTrail in all regions",
      "Use VPC with private subnets for databases",
      "Enable GuardDuty and Security Hub",
    ],
  },
  {
    name: "Microsoft Azure",
    icon: Cloud,
    color: "text-blue-500",
    services: [
      "Entra ID — Identity management with Conditional Access",
      "Defender for Cloud — CSPM and threat protection",
      "Sentinel — Cloud-native SIEM & SOAR",
      "Key Vault — Secrets, keys, and certificate management",
      "Azure Policy — Governance and compliance enforcement",
      "NSG & Azure Firewall — Network security controls",
      "DDoS Protection — Standard and advanced tiers",
      "Privileged Identity Management (PIM) — JIT access",
    ],
    bestPractices: [
      "Enforce Conditional Access with MFA",
      "Use Managed Identities instead of service principal secrets",
      "Enable Azure Defender for all resource types",
      "Deploy Private Endpoints for PaaS services",
      "Implement Azure Sentinel for threat monitoring",
      "Use Azure Policy to enforce compliance at scale",
    ],
  },
  {
    name: "Google Cloud Platform (GCP)",
    icon: Globe,
    color: "text-green-500",
    services: [
      "Cloud IAM — Fine-grained access control with organization policies",
      "Security Command Center — Security & risk management",
      "VPC Service Controls — Perimeter security for cloud resources",
      "Binary Authorization — Deploy-time container security",
      "Cloud KMS — Key management and HSMs",
      "Cloud Audit Logs — Admin activity and data access logs",
      "Workload Identity — Secure GKE pod-to-cloud auth",
      "Cloud Armor — DDoS, WAF, and bot management",
    ],
    bestPractices: [
      "Use Organization Policies to restrict resource creation",
      "Implement VPC Service Controls for sensitive data",
      "Enable Binary Authorization for GKE clusters",
      "Use Workload Identity instead of service account keys",
      "Enable Cloud Audit Logs everywhere",
      "Use Customer-Managed Encryption Keys (CMEK)",
    ],
  },
];

const breaches = [
  {
    company: "Capital One",
    year: "2019",
    impact: "106M customer records exposed",
    rootCause: "SSRF vulnerability + over-permissioned IAM role",
    lesson: "Enforce IMDSv2, least privilege IAM, network segmentation",
  },
  {
    company: "Toyota",
    year: "2023",
    impact: "2.15M customer vehicle records exposed for 10 years",
    rootCause: "Cloud storage bucket publicly accessible",
    lesson: "Automated misconfiguration detection (CSPM), regular audits",
  },
  {
    company: "Microsoft Power Apps",
    year: "2021",
    impact: "38M records from 47 organizations exposed",
    rootCause: "Default table permissions set to public access",
    lesson: "Never trust default configurations; audit all data endpoints",
  },
  {
    company: "Snowflake Customers",
    year: "2024",
    impact: "560M+ records across 165+ companies",
    rootCause: "Compromised credentials without MFA (infostealer malware)",
    lesson: "Enforce MFA on all SaaS platforms; monitor for infostealers",
  },
];

const checklist = [
  { section: "Identity & Access", items: [
    "MFA enforced for all users",
    "Service accounts use least privilege",
    "Access keys rotated every 90 days",
    "Privileged access is time-bounded (JIT/PIM)",
    "Service account keys are avoided (use roles/managed identities)",
  ]},
  { section: "Network Security", items: [
    "Default deny network policies",
    "Private subnets for sensitive workloads",
    "VPN/PrivateLink for management access",
    "DDoS protection enabled",
    "WAF deployed for web applications",
  ]},
  { section: "Data Protection", items: [
    "Encryption at rest enabled (all storage)",
    "TLS 1.2+ enforced for data in transit",
    "Backup and disaster recovery tested",
    "Data classification applied",
    "Key management with regular rotation",
  ]},
  { section: "Monitoring & Logging", items: [
    "Cloud audit logs enabled in all regions",
    "Alerting on suspicious activity",
    "SIEM/SOAR deployed and configured",
    "Regular penetration testing",
    "Compliance scanning automated (CSPM)",
  ]},
];

export default function CloudSecurityPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Cloud Security"
          title="Cloud Security Guide"
          description="Comprehensive security best practices for AWS, Azure, and GCP. Protect your cloud infrastructure with proven strategies."
        />

        {/* Key Statistics */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "$4.88M", label: "Avg Cloud Breach Cost" },
            { value: "82%", label: "Breaches Involve Cloud" },
            { value: "68%", label: "Caused by Misconfiguration" },
            { value: "277 days", label: "Avg Time to Contain" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5 text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cloud Providers */}
        <div className="mt-16 space-y-12">
          {providers.map((provider) => (
            <Card key={provider.name} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <provider.icon className={`h-6 w-6 ${provider.color}`} />
                  {provider.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-primary" />
                      Key Security Services
                    </h4>
                    <ul className="space-y-2">
                      {provider.services.map((service) => (
                        <li key={service} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-primary" />
                      Best Practices
                    </h4>
                    <ul className="space-y-2">
                      {provider.bestPractices.map((practice) => (
                        <li key={practice} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Key className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Real-World Breaches */}
        <div className="mt-16">
          <SectionHeading
            badge="Case Studies"
            title="Real-World Cloud Security Breaches"
            description="Learn from major cloud security incidents to prevent similar issues in your organization."
          />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {breaches.map((breach) => (
              <Card key={breach.company} className="border-l-4 border-l-destructive/50">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg">{breach.company}</h4>
                    <Badge variant="outline">{breach.year}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-destructive">Impact:</span> {breach.impact}</p>
                    <p><span className="font-semibold text-amber-500">Root Cause:</span> {breach.rootCause}</p>
                    <p><span className="font-semibold text-primary">Lesson:</span> {breach.lesson}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security Checklist */}
        <div className="mt-16">
          <SectionHeading
            badge="Checklist"
            title="Cloud Security Checklist"
            description="Use this checklist to audit your cloud security posture across all providers."
          />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {checklist.map((section) => (
              <Card key={section.section}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    {section.section}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="mt-0.5 h-4 w-4 rounded border border-muted-foreground/30 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Related Resources & CTAs */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/blog/cloud-security-aws-azure-gcp" className="block">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Detailed Cloud Security Blog</h3>
                <p className="text-sm text-muted-foreground">18-minute deep dive with code examples</p>
                <Badge variant="outline" className="gap-1">
                  Read Article <ArrowRight className="h-3 w-3" />
                </Badge>
              </CardContent>
            </Card>
          </Link>
          <Link href="/tools" className="block">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <Eye className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Free Security Tools</h3>
                <p className="text-sm text-muted-foreground">Header analyzer, CSP generator, and more</p>
                <Badge variant="outline" className="gap-1">
                  Try Tools <ArrowRight className="h-3 w-3" />
                </Badge>
              </CardContent>
            </Card>
          </Link>
          <Link href="/services" className="block">
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <h3 className="font-semibold">Cloud Security Assessment</h3>
                <p className="text-sm text-muted-foreground">Professional review of your cloud setup</p>
                <Badge variant="outline" className="gap-1">
                  Get Started <ArrowRight className="h-3 w-3" />
                </Badge>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
