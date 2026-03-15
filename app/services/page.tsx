"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import {
  Shield,
  Code,
  Search,
  FileCheck,
  GraduationCap,
  Brain,
  Cloud,
  Bug,
  Workflow,
  Globe,
  Zap,
  Lock,
  LineChart,
  Smartphone,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Server,
  ShoppingCart,
  LayoutDashboard,
  Database,
  Gauge,
  Palette,
} from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════
   CATEGORY 1 — SECURITY SERVICES
   ═══════════════════════════════════════════ */

const securityServices = [
  {
    icon: Code,
    title: "Secure Code Review",
    description:
      "Manual and automated code review by security experts. We analyze your codebase for vulnerabilities, logic flaws, and security anti-patterns across any language or framework.",
    features: [
      "Manual expert review (OWASP methodology)",
      "SAST tool integration & analysis",
      "Detailed remediation guidance with code fixes",
      "Follow-up verification & re-testing",
    ],
    badge: "Most Popular",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Search,
    title: "Penetration Testing",
    description:
      "Comprehensive penetration testing of web applications, APIs, and mobile apps. We simulate real-world attacks to find vulnerabilities before hackers do.",
    features: [
      "Black-box, gray-box & white-box testing",
      "API & business logic testing",
      "OWASP Top 10 coverage",
      "Executive summary + technical report",
    ],
    badge: null,
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Security Architecture Review",
    description:
      "Deep review of your application architecture, infrastructure, and security controls. We help design security into your system from the ground up.",
    features: [
      "Threat modeling (STRIDE / DREAD)",
      "Architecture assessment & diagrams",
      "Cloud security posture review",
      "Security roadmap & prioritization",
    ],
    badge: null,
    color: "from-purple-500 to-indigo-500",
  },
  {
    icon: Brain,
    title: "AI / LLM Security Audit",
    description:
      "Specialized security assessment for AI-powered applications. We test for prompt injection, data leakage, model vulnerabilities, and OWASP Top 10 for LLM compliance.",
    features: [
      "Prompt injection & jailbreak testing",
      "Data leakage & PII exposure assessment",
      "Model access control & API security",
      "OWASP LLM Top 10 compliance check",
    ],
    badge: "Exclusive",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Cloud,
    title: "Cloud Security Assessment",
    description:
      "Multi-cloud security posture assessment for AWS, Azure, and GCP. We identify misconfigurations, excessive permissions, and compliance gaps.",
    features: [
      "IAM & access policy review",
      "Network security & firewall audit",
      "Data encryption & key management validation",
      "CIS Benchmark compliance gap analysis",
    ],
    badge: "New",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Bug,
    title: "Bug Bounty Program Management",
    description:
      "Set up and manage a bug bounty program for your organization. We handle triage, validation, and responsible disclosure with top security researchers.",
    features: [
      "Program design & launch",
      "Vulnerability triage & validation",
      "Researcher management & payouts",
      "Remediation tracking & metrics",
    ],
    badge: null,
    color: "from-red-500 to-orange-500",
  },
  {
    icon: Workflow,
    title: "DevSecOps Implementation",
    description:
      "Integrate security into your CI/CD pipeline. We help you shift left with automated SAST, DAST, SCA, container scanning, and IaC security.",
    features: [
      "Pipeline security integration",
      "SAST / DAST / SCA automation",
      "Container & IaC scanning",
      "Security gates & policy enforcement",
    ],
    badge: null,
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: FileCheck,
    title: "Compliance Assessment",
    description:
      "Assess your application against industry standards including SOC 2, PCI DSS, HIPAA, ISO 27001, and GDPR. We help you get audit-ready.",
    features: [
      "Gap analysis & risk assessment",
      "Remediation planning & timeline",
      "Evidence collection & documentation",
      "Audit preparation & support",
    ],
    badge: null,
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: GraduationCap,
    title: "Security Training & Workshops",
    description:
      "Customized security training for development teams. Hands-on workshops covering secure coding, OWASP risks, threat modeling, and security tools.",
    features: [
      "Hands-on labs & exercises",
      "Custom curriculum per team skill level",
      "CTF (Capture The Flag) exercises",
      "Certification preparation guidance",
    ],
    badge: null,
    color: "from-indigo-500 to-blue-500",
  },
];

/* ═══════════════════════════════════════════
   CATEGORY 2 — WEB & APP DEVELOPMENT
   (Security-first, but a different service)
   ═══════════════════════════════════════════ */

const webDevServices = [
  {
    icon: Globe,
    title: "Custom Web Application Development",
    description:
      "Full-stack web applications built with modern frameworks. Responsive, performant, and designed for your exact business requirements.",
    features: [
      "Next.js / React / Vue / Angular",
      "Responsive & mobile-first design",
      "CMS integration (WordPress, Strapi, Sanity)",
      "Third-party API integrations",
      "SEO optimized & fast-loading",
      "Ongoing maintenance & support",
    ],
    badge: "Full-Stack",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce Development",
    description:
      "Secure online stores with payment processing, inventory management, and customer portals. PCI DSS-ready from day one.",
    features: [
      "Shopify / WooCommerce / Custom",
      "Secure payment processing (Stripe, PayPal)",
      "Inventory & order management",
      "Customer accounts & wishlists",
      "SSL, PCI compliance & fraud prevention",
      "Analytics & conversion tracking",
    ],
    badge: null,
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description:
      "Native and cross-platform mobile apps with secure authentication, encrypted data storage, and certificate pinning built in.",
    features: [
      "iOS & Android (Swift / Kotlin)",
      "Cross-platform (React Native / Flutter)",
      "Secure biometric authentication",
      "Encrypted local storage",
      "Push notifications & deep linking",
      "App Store & Play Store deployment",
    ],
    badge: null,
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: LayoutDashboard,
    title: "SaaS & Dashboard Development",
    description:
      "Multi-tenant SaaS platforms with role-based access, analytics dashboards, billing integration, and enterprise-grade data isolation.",
    features: [
      "Multi-tenant architecture",
      "Role-based access control (RBAC)",
      "Subscription billing (Stripe / Paddle)",
      "Real-time analytics dashboards",
      "API-first design for integrations",
      "SSO / OAuth2 authentication",
    ],
    badge: "High Demand",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Server,
    title: "API Development & Integration",
    description:
      "Robust REST and GraphQL APIs designed for scale. OAuth2, JWT, rate limiting, versioning, and comprehensive documentation included.",
    features: [
      "REST / GraphQL API design",
      "OAuth2 & JWT authentication",
      "Rate limiting & throttling",
      "API versioning & documentation (OpenAPI)",
      "Third-party service integrations",
      "Webhook & event-driven architecture",
    ],
    badge: null,
    color: "from-yellow-500 to-amber-500",
  },
  {
    icon: Palette,
    title: "UI/UX Design & Redesign",
    description:
      "Modern, accessible, and conversion-optimized interfaces. Whether you need a fresh design or a complete overhaul of an existing product.",
    features: [
      "Wireframing & prototyping (Figma)",
      "Design system creation",
      "Accessibility (WCAG 2.1 AA)",
      "Responsive & dark mode support",
      "User testing & iteration",
      "Brand consistency",
    ],
    badge: null,
    color: "from-fuchsia-500 to-pink-500",
  },
];

// Security add-ons that come with every dev project
const securityIncluded = [
  { icon: Shield, text: "OWASP Top 10 compliant architecture" },
  { icon: Lock, text: "HTTPS, CSP, HSTS & security headers" },
  { icon: Search, text: "Security testing at every development stage" },
  { icon: FileCheck, text: "Secure code review before deployment" },
  { icon: Database, text: "Encrypted data at rest & in transit" },
  { icon: Gauge, text: "Performance & security monitoring setup" },
];

/* ═══════════════════════════════════════════
   CATEGORY 3 — AI / ML SERVICES
   ═══════════════════════════════════════════ */

const aiServices = [
  {
    icon: Brain,
    title: "AI-Powered Security Tools",
    description:
      "Custom AI/ML tools for security automation: anomaly detection, threat prediction, log analysis, and vulnerability prioritization.",
    features: [
      "Anomaly detection systems",
      "Threat prediction models",
      "Security log analysis AI",
      "Vulnerability risk scoring",
      "Automated report generation",
    ],
    badge: "High Demand",
    color: "from-amber-500 to-yellow-500",
    price: "$5K–$18K",
  },
  {
    icon: Sparkles,
    title: "Generative AI Integration",
    description:
      "Integrate ChatGPT, Claude, Llama, or custom LLMs into your applications with proper security controls, guardrails, and data protection.",
    features: [
      "LLM API integration",
      "RAG (Retrieval Augmented Generation)",
      "Fine-tuned models",
      "Prompt engineering & guardrails",
      "Secure API implementation",
      "Rate limiting & abuse monitoring",
    ],
    badge: "Trending",
    color: "from-violet-500 to-fuchsia-500",
    price: "$4K–$15K",
  },
  {
    icon: LineChart,
    title: "Data Analytics & Dashboards",
    description:
      "Secure analytics platforms with real-time dashboards, ML-powered insights, and enterprise-grade BI tools.",
    features: [
      "Real-time dashboards",
      "Predictive analytics",
      "ML-based insights",
      "Data visualization",
      "Secure data pipelines",
      "Custom KPI tracking",
    ],
    badge: null,
    color: "from-blue-500 to-indigo-500",
    price: "$4K–$16K",
  },
];

/* ═══════════════════════════════════════════
   PORTFOLIO
   ═══════════════════════════════════════════ */

const portfolioProjects = [
  {
    name: "FinTech Platform",
    category: "Banking & Finance",
    description: "Secure payment processing platform with real-time transaction monitoring",
    features: ["Zero-trust architecture", "PCI DSS compliant", "Rate limiting", "Fraud detection"],
    image: "🏦",
    security: "Enterprise Grade",
  },
  {
    name: "Healthcare Dashboard",
    category: "Healthcare Tech",
    description: "HIPAA-compliant patient data management system with encrypted storage",
    features: ["End-to-end encryption", "HIPAA compliant", "Audit logging", "Role-based access"],
    image: "🏥",
    security: "Medical Grade",
  },
  {
    name: "E-Commerce Platform",
    category: "Retail & E-Commerce",
    description: "High-performance e-commerce platform with secure checkout and PCI compliance",
    features: ["PCI DSS level 1", "Tokenized payments", "SSL pinning", "DDoS protection"],
    image: "🛒",
    security: "PCI Compliant",
  },
  {
    name: "AI Analytics Suite",
    category: "Business Intelligence",
    description: "ML-powered analytics with secure data pipelines and interactive visualizations",
    features: ["Real-time ML", "Secure pipelines", "Advanced viz", "Predictive models"],
    image: "📊",
    security: "SOC 2 Type II",
  },
  {
    name: "SaaS Management Portal",
    category: "Enterprise Software",
    description: "Multi-tenant SaaS platform with customer isolation and compliance controls",
    features: ["Data isolation", "SSO/OAuth", "Audit trails", "Compliance ready"],
    image: "☁️",
    security: "SOC 2 Certified",
  },
  {
    name: "IoT Device Dashboard",
    category: "IoT & Monitoring",
    description: "Secure IoT device management platform with real-time monitoring and OTA updates",
    features: ["Device auth", "Wireless security", "OTA updates", "E2E encryption"],
    image: "🔌",
    security: "Blockchain Verified",
  },
];

/* ═══════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════ */

export default function ServicesPage() {
  return (
    <div className="py-16 space-y-0">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
        <SectionHeading
          badge="Services"
          title="Security & Development Expertise"
          description="Two service lines — Security Services to protect what you have, and Development Services to build secure applications from scratch. All powered by ShieldX technology."
        />

        {/* ShieldX promotion */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 max-w-3xl mx-auto"
        >
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="py-4 px-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Looking for automated security scanning?</p>
                  <p className="text-xs text-muted-foreground">ShieldX offers 8 security modules — secrets, dependencies, cloud, API, and more.</p>
                </div>
              </div>
              <Link href="/shieldx">
                <Button size="sm" className="gap-1">
                  Try ShieldX <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Jump-to navigation */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            { label: "🛡️ Security Services", href: "#security-services" },
            { label: "💻 Web & App Development", href: "#development-services" },
            { label: "🤖 AI / ML Services", href: "#ai-services" },
            { label: "📂 Portfolio", href: "#portfolio" },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full">
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          SECTION 1 — SECURITY SERVICES
          ───────────────────────────────────────────── */}
      <section id="security-services" className="scroll-mt-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge className="bg-red-600 text-white mb-4 text-sm px-3 py-1">Security Services</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Protect Your Applications & Infrastructure
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Offensive and defensive security services to find vulnerabilities, harden your systems, and achieve compliance.
              <strong className="text-foreground"> No development work — pure security expertise.</strong>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityServices.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="h-full relative border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                  {service.badge && (
                    <div className="absolute -top-3 right-4">
                      <Badge className={`bg-gradient-to-r ${service.color} text-white shadow-sm`}>{service.badge}</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className={`mb-2 inline-flex rounded-xl bg-gradient-to-br ${service.color} p-3 text-white w-fit shadow-lg shadow-black/10`}>
                      <service.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA for security services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link href="/contact?subject=Security+Services+Inquiry">
              <Button size="lg" className="gap-2 bg-red-600 hover:bg-red-700">
                <Shield className="h-5 w-5" />
                Request a Security Assessment
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Visual divider */}
      <div className="relative py-8 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center px-8"><div className="w-full border-t border-border" /></div>
        <div className="relative bg-background px-6 py-2 rounded-full border text-sm font-medium text-muted-foreground">
          Different service — different team
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          SECTION 2 — WEB & APP DEVELOPMENT
          ───────────────────────────────────────────── */}
      <section id="development-services" className="scroll-mt-20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <Badge className="bg-emerald-600 text-white mb-4 text-sm px-3 py-1">Development Services</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Build Secure Web & Mobile Applications
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Full-stack development with security baked in from day one.
              <strong className="text-foreground"> We build it. We secure it. You ship it.</strong>
            </p>
          </motion.div>

          {/* Security-included banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14"
          >
            <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/50">
              <CardContent className="py-5 px-6">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security included with every development project:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {securityIncluded.map((item) => (
                    <div key={item.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <item.icon className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      {item.text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webDevServices.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="h-full relative border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                  {service.badge && (
                    <div className="absolute -top-3 right-4">
                      <Badge className={`bg-gradient-to-r ${service.color} text-white shadow-sm`}>{service.badge}</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className={`mb-2 inline-flex rounded-xl bg-gradient-to-br ${service.color} p-3 text-white w-fit shadow-lg shadow-black/10`}>
                      <service.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* CTA for dev services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link href="/contact?subject=Development+Project+Inquiry">
              <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Globe className="h-5 w-5" />
                Start Your Project
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          SECTION 3 — AI / ML SERVICES
          ───────────────────────────────────────────── */}
      <section id="ai-services" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge className="bg-violet-600 text-white mb-4 text-sm px-3 py-1">AI / ML Services</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">AI & Machine Learning Solutions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Production-ready AI implementations — from chatbots and RAG pipelines to custom ML models. Every solution built with security guardrails.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiServices.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className={`mb-2 inline-flex rounded-xl bg-gradient-to-br ${service.color} p-3 text-white w-fit shadow-lg shadow-black/10`}>
                      <service.icon className="h-6 w-6" />
                    </div>
                    {service.badge && (
                      <Badge className={`bg-gradient-to-r ${service.color} text-white w-fit mt-2`}>{service.badge}</Badge>
                    )}
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">Estimated:</span>
                      <span className="text-lg font-bold text-violet-600">{service.price}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          PORTFOLIO
          ───────────────────────────────────────────── */}
      <section id="portfolio" className="scroll-mt-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Portfolio</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enterprise-grade applications we&apos;ve built with security, scalability, and performance at their core
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioProjects.map((project, i) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-8 text-center">
                    <div className="text-5xl mb-2">{project.image}</div>
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-600">{project.security}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          WHY CHOOSE US
          ───────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12"
          >
            <h2 className="text-3xl font-bold text-white mb-6">Why Choose SecureCodeReviews?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield, title: "Security First", desc: "Every project built with OWASP guidelines and security best practices" },
                { icon: Zap, title: "Fast Delivery", desc: "Agile methodology with rapid iterations and clear milestones" },
                { icon: Code, title: "Expert Team", desc: "Certified security engineers, pentesters & full-stack developers" },
                { icon: LineChart, title: "Scalable", desc: "Built to grow with your business — from MVP to enterprise" },
              ].map((item, i) => (
                <div key={i} className="text-white">
                  <item.icon className="h-8 w-8 mb-3" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm opacity-90">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          FINAL CTA
          ───────────────────────────────────────────── */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="py-12 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-4">Not Sure Which Service You Need?</h3>
                <p className="text-muted-foreground mb-6 max-w-xl">
                  Tell us about your project or security concerns — we&apos;ll recommend the right service and give you a free consultation.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Link href="/contact">
                    <Button size="lg" className="gap-2">
                      Get Free Consultation <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/tools">
                    <Button size="lg" variant="outline" className="gap-2">
                      Try Free Security Tools <ExternalLink className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
