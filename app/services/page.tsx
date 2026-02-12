"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import {
  Shield,
  Code,
  Search,
  FileCheck,
  GraduationCap,
  HeadphonesIcon,
  ArrowRight,
  CheckCircle2,
  Brain,
  Cloud,
  Bug,
  Workflow,
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Code,
    title: "Secure Code Review",
    description:
      "Manual and automated code review by security experts. We analyze your codebase for vulnerabilities, logic flaws, and security anti-patterns.",
    features: [
      "Manual expert review",
      "SAST tool integration",
      "Detailed remediation guidance",
      "Follow-up verification",
    ],
    badge: "Most Popular",
  },
  {
    icon: Search,
    title: "Penetration Testing",
    description:
      "Comprehensive penetration testing of web applications, APIs, and mobile apps. We simulate real-world attacks to find vulnerabilities.",
    features: [
      "OWASP methodology",
      "API security testing",
      "Business logic testing",
      "Executive summary report",
    ],
    badge: null,
  },
  {
    icon: Shield,
    title: "Security Architecture Review",
    description:
      "Review of your application architecture, infrastructure, and security controls. We help design security into your system from the ground up.",
    features: [
      "Threat modeling",
      "Architecture assessment",
      "Cloud security review",
      "Security roadmap",
    ],
    badge: null,
  },
  {
    icon: Brain,
    title: "AI/LLM Security Audit",
    description:
      "Specialized security assessment for AI-powered applications. We test for prompt injection, data leakage, model vulnerabilities, and OWASP Top 10 for LLM compliance.",
    features: [
      "Prompt injection testing",
      "Data leakage assessment",
      "Model access control review",
      "OWASP LLM Top 10 compliance",
    ],
    badge: "Exclusive",
  },
  {
    icon: Cloud,
    title: "Cloud Security Assessment",
    description:
      "Multi-cloud security posture assessment for AWS, Azure, and GCP. We identify misconfigurations, excessive permissions, and compliance gaps.",
    features: [
      "IAM & access review",
      "Network security audit",
      "Data encryption validation",
      "Compliance gap analysis",
    ],
    badge: "New",
  },
  {
    icon: Bug,
    title: "Bug Bounty Program Management",
    description:
      "Set up and manage a bug bounty program for your organization. We handle triage, validation, and responsible disclosure with top security researchers.",
    features: [
      "Program design & launch",
      "Vulnerability triage",
      "Researcher management",
      "Remediation tracking",
    ],
    badge: "Exclusive",
  },
  {
    icon: Workflow,
    title: "DevSecOps Implementation",
    description:
      "Integrate security into your CI/CD pipeline. We help you shift left with automated SAST, DAST, SCA, container scanning, and IaC security.",
    features: [
      "Pipeline security integration",
      "SAST/DAST automation",
      "Container & IaC scanning",
      "Security gates & policies",
    ],
    badge: "New",
  },
  {
    icon: FileCheck,
    title: "Compliance Assessment",
    description:
      "Assess your application against industry standards and regulations including SOC 2, PCI DSS, HIPAA, and GDPR.",
    features: [
      "Gap analysis",
      "Remediation planning",
      "Evidence collection",
      "Compliance documentation",
    ],
    badge: null,
  },
  {
    icon: GraduationCap,
    title: "Security Training",
    description:
      "Customized security training for development teams. Hands-on workshops covering secure coding, OWASP risks, and security tools.",
    features: [
      "Hands-on labs",
      "Custom curriculum",
      "CTF exercises",
      "Certification prep",
    ],
    badge: null,
  },
];

export default function ServicesPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Services"
          title="Professional Security Services"
          description="From code reviews to compliance assessments, our team of security experts helps you build and maintain secure applications."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full relative">
                {service.badge && (
                  <div className="absolute -top-3 right-4">
                    <Badge>{service.badge}</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-3 text-primary w-fit">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4">Need a Custom Solution?</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Every organization has unique security needs. Contact us to discuss a
                tailored security program for your team.
              </p>
              <Link href="/contact">
                <Button size="lg" className="gap-2">
                  Get in Touch
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
