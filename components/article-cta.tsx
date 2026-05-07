import Link from "next/link";
import { ArrowRight, Brain, Cloud, Code, Search, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ArticleCtaProps {
  category: string;
  tags: string[];
  title: string;
}

type CtaConfig = {
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  Icon: typeof Shield;
};

function buildContactHref(subject: string, message: string) {
  const params = new URLSearchParams({ subject, message });
  return `/contact?${params.toString()}`;
}

function getArticleCta(category: string, tags: string[], title: string): CtaConfig {
  const text = `${category} ${tags.join(" ")} ${title}`.toLowerCase();

  if (category === "AI Security" || /(ai|llm|prompt|agent|rag|model|mcp)/.test(text)) {
    return {
      badge: "AI Security Audit",
      title: "Planning an AI feature launch or security review?",
      description:
        "We assess prompt injection paths, data leakage, tool use, access control, and unsafe AI workflows before they become production problems.",
      bullets: [
        "Manual review for agent, prompt, and retrieval attack paths",
        "Actionable remediation guidance for your AI stack",
        "Coverage for LLM apps, MCP integrations, and internal AI tools",
      ],
      primaryLabel: "Request AI Security Audit",
      primaryHref: buildContactHref(
        "AI Security Audit Request",
        [
          "I want an AI / LLM security assessment.",
          "",
          "App or product:",
          "Models / providers used:",
          "Key AI features (agents, RAG, MCP, tools, chat, etc.):",
          "Target timeline:",
        ].join("\n")
      ),
      secondaryLabel: "Explore Services",
      secondaryHref: "/services",
      Icon: Brain,
    };
  }

  if (category === "Cloud Security" || /(cloud|aws|azure|gcp|kubernetes|docker|terraform|iac)/.test(text)) {
    return {
      badge: "Cloud Assessment",
      title: "Need a cloud security review before rollout?",
      description:
        "We review IAM, network exposure, storage security, deployment posture, and the misconfigurations that usually get missed in fast-moving teams.",
      bullets: [
        "AWS, Azure, and GCP posture reviews",
        "IAM, storage, network, and encryption validation",
        "Clear findings with prioritized fixes for engineering teams",
      ],
      primaryLabel: "Request Cloud Assessment",
      primaryHref: buildContactHref(
        "Cloud Security Assessment Request",
        [
          "I want a cloud security assessment.",
          "",
          "Cloud platforms in scope:",
          "Environment type (prod / staging / dev):",
          "Main concern areas:",
          "Target timeline:",
        ].join("\n")
      ),
      secondaryLabel: "View Services",
      secondaryHref: "/services",
      Icon: Cloud,
    };
  }

  if (category === "API Security" || /(api|graphql|oauth|jwt|rest|grpc)/.test(text)) {
    return {
      badge: "API Security Review",
      title: "Shipping an API that needs a hard security pass?",
      description:
        "We review authentication, authorization, business logic abuse, rate limiting, and the edge cases automated scanners usually miss.",
      bullets: [
        "OWASP API risk coverage and business logic testing",
        "Auth and access control review with practical fixes",
        "Clear technical findings your team can act on fast",
      ],
      primaryLabel: "Request API Security Review",
      primaryHref: buildContactHref(
        "API Security Review Request",
        [
          "I want an API security review.",
          "",
          "API type (REST / GraphQL / gRPC):",
          "Authentication method:",
          "Production or pre-release:",
          "Target timeline:",
        ].join("\n")
      ),
      secondaryLabel: "Explore Services",
      secondaryHref: "/services",
      Icon: Search,
    };
  }

  return {
    badge: "Secure Code Review",
    title: "Want an expert review before this issue reaches production?",
    description:
      "We combine manual code review with AppSec tooling to find vulnerabilities, logic flaws, and insecure patterns before release or audit deadlines.",
    bullets: [
      "Manual secure code review for real exploitable issues",
      "Remediation guidance with clear engineering next steps",
      "Useful for launch reviews, client audits, and security hardening",
    ],
    primaryLabel: "Request Code Review",
    primaryHref: buildContactHref(
      "Secure Code Review Request",
      [
        "I want a secure code review.",
        "",
        "App or repository:",
        "Tech stack:",
        "Main concern areas:",
        "Target timeline:",
      ].join("\n")
    ),
    secondaryLabel: "View Services",
    secondaryHref: "/services",
    Icon: Code,
  };
}

export default function ArticleCta({ category, tags, title }: ArticleCtaProps) {
  const cta = getArticleCta(category, tags, title);

  return (
    <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <Badge className="w-fit">{cta.badge}</Badge>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight">{cta.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                {cta.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {cta.bullets.map((bullet) => (
                <div key={bullet} className="rounded-xl border bg-background/80 p-3 text-sm text-muted-foreground">
                  {bullet}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm rounded-2xl border bg-background/90 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <cta.Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Talk to SecureCodeReviews</p>
                <p className="text-xs text-muted-foreground">Get a scoped review path fast</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link href={cta.primaryHref}>
                <Button className="w-full gap-2">
                  {cta.primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={cta.secondaryHref}>
                <Button variant="outline" className="w-full">
                  {cta.secondaryLabel}
                </Button>
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="rounded-lg bg-muted/60 px-3 py-2">Manual review</div>
              <div className="rounded-lg bg-muted/60 px-3 py-2">Actionable fixes</div>
              <div className="rounded-lg bg-muted/60 px-3 py-2">Fast turnaround</div>
              <div className="rounded-lg bg-muted/60 px-3 py-2">Security-focused</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}