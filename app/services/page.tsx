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
} from "lucide-react";
import Link from "next/link";

// Main Security Services
const securityServices = [
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
    color: "from-blue-500 to-cyan-500",
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
    color: "from-red-500 to-pink-500",
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
    color: "from-purple-500 to-indigo-500",
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
    color: "from-yellow-500 to-orange-500",
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
    color: "from-cyan-500 to-blue-500",
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
      "SAST/DAST automation",
      "Container & IaC scanning",
      "Security gates & policies",
    ],
    badge: null,
    color: "from-green-500 to-emerald-500",
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
    color: "from-violet-500 to-purple-500",
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
    color: "from-indigo-500 to-blue-500",
  },
];

// Secure Web Development Services
const webDevServices = [
  {
    icon: Globe,
    title: "Secure Web Application Development",
    description:
      "Custom web applications built with security as a first-class citizen. We use secure coding practices, OWASP guidelines, and security testing at every stage.",
    features: [
      "Next.js, React, Vue frameworks",
      "Security-first architecture",
      "HTTPS, CSP, and security headers",
      "Automated security testing",
      "Secure API design",
      "Ongoing security monitoring",
    ],
    badge: "Most Secure",
    color: "from-emerald-500 to-teal-500",
    price: "Custom",
  },
  {
    icon: Smartphone,
    title: "Mobile App Security Development",
    description:
      "Native and cross-platform mobile apps with built-in security controls. We protect against mobile-specific threats and implement secure authentication.",
    features: [
      "iOS & Android native apps",
      "React Native / Flutter",
      "Secure data storage",
      "Certificate pinning",
      "Secure auth & biometrics",
      "Encrypted communication",
    ],
    badge: null,
    color: "from-pink-500 to-rose-500",
    price: "Custom",
  },
];

// AI Services
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
    price: "$5K-$18K",
  },
  {
    icon: Sparkles,
    title: "Generative AI Integration",
    description:
      "Integrate ChatGPT, Claude, Llama, or custom LLMs into your applications with proper security controls and data protection.",
    features: [
      "LLM API integration",
      "RAG (Retrieval Augmented Generation)",
      "Fine-tuned models",
      "Prompt engineering",
      "Secure API implementation",
      "Rate limiting & monitoring",
    ],
    badge: "Trending",
    color: "from-violet-500 to-fuchsia-500",
    price: "$4K-$15K",
  },
  {
    icon: LineChart,
    title: "Data Analytics & Dashboards",
    description:
      "Build secure analytics platforms with real-time dashboards, ML-powered insights, and enterprise-grade BI tools.",
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
    price: "$4K-$16K",
  },
];

// Portfolio Projects
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
    features: ["PCI DSS level 1", "Tokenized payments", "SSL certificate pinning", "DDoS protection"],
    image: "🛒",
    security: "PCI Compliant",
  },
  {
    name: "AI Analytics Suite",
    category: "Business Intelligence",
    description: "ML-powered analytics with secure data pipelines and interactive visualizations",
    features: ["Real-time ML processing", "Secure data pipelines", "Advanced visualizations", "Predictive models"],
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
    description: "Secure IoT device management platform with real-time monitoring and updates",
    features: ["Device authentication", "Wireless security", "OTA updates", "End-to-end encryption"],
    image: "🔌",
    security: "Blockchain Verified",
  },
];

// Additional Services
const additionalServices = [
  {
    icon: Zap,
    title: "API Security & Integration",
    description: "Secure API development, authentication (OAuth2, JWT), rate limiting, and third-party integrations with security best practices.",
    features: [
      "REST/GraphQL APIs",
      "OAuth2 & JWT",
      "Rate limiting & throttling",
      "API versioning",
      "OpenAPI documentation",
    ],
    color: "from-yellow-500 to-amber-500",
    price: "$3K-$12K",
  },
  {
    icon: Lock,
    title: "Database & Data Security",
    description: "Secure database design, encryption, backup strategies, and data privacy implementation for regulatory compliance.",
    features: [
      "Encryption at rest",
      "Field-level encryption",
      "Automated backups",
      "Data retention policies",
      "PII protection",
    ],
    color: "from-slate-500 to-gray-500",
    price: "$3K-$10K",
  },
  {
    icon: Smartphone,
    title: "Progressive Web Apps (PWA)",
    description: "App-like web experiences with offline capability, push notifications, and installation. Built with security as a priority.",
    features: [
      "Service workers",
      "Offline functionality",
      "Push notifications",
      "Fast loading",
      "Mobile-optimized",
    ],
    color: "from-orange-500 to-red-500",
    price: "$4K-$14K",
  },
  {
    icon: LineChart,
    title: "Performance & SEO Optimization",
    description: "Optimize your applications for speed, scalability, and search engine visibility while maintaining security.",
    features: [
      "Core Web Vitals",
      "Image optimization",
      "CDN implementation",
      "SEO setup",
      "Performance monitoring",
    ],
    color: "from-teal-500 to-cyan-500",
    price: "$2K-$8K",
  },
];

export default function ServicesPage() {
  return (
    <div className="py-16 space-y-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Services"
          title="Professional Security & Development Services"
          description="From secure web development to AI integration and compliance — we build applications that are not only beautiful and performant, but also secure by design."
        />
      </div>

      {/* Web Development Hero */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-emerald-600">Web Development</Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Secure Web Development
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Beautiful, fast, and secure web applications. We don't just build good-looking websites — we build 
                <span className="font-semibold text-emerald-600"> secure applications that protect your users and business</span>.
              </p>
              <div className="space-y-3">
                {[
                  "OWASP-compliant architecture",
                  "Security testing at every stage",
                  "Performance optimized",
                  "Mobile responsive",
                  "Scalable infrastructure",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/contact" className="mt-8 inline-block">
                <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                  Start Your Secure Project <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {webDevServices.map((service) => (
                <Card key={service.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`inline-flex rounded-lg bg-gradient-to-br ${service.color} p-3 text-white w-fit`}>
                      <service.icon className="h-5 w-5" />
                    </div>
                    {service.badge && <Badge className="mt-2 w-fit">{service.badge}</Badge>}
                    <CardTitle className="text-sm">{service.title}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Portfolio Showcase */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Our Portfolio</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enterprise-grade applications we've built with security, scalability, and performance as core priorities
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioProjects.map((project, i) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
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

      {/* Core Security Services */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Security Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive security expertise from code review to infrastructure assessment
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityServices.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="h-full relative border-0 shadow-md hover:shadow-lg transition-shadow">
                  {service.badge && (
                    <div className="absolute -top-3 right-4">
                      <Badge className={`bg-gradient-to-r ${service.color}`}>{service.badge}</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-br ${service.color} p-3 text-white w-fit`}>
                      <service.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* AI & ML Services */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <Badge className="bg-violet-600">AI/ML Services</Badge>
          </div>
          <h2 className="text-3xl font-bold mb-4">AI & Machine Learning Services</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            High-demand AI services we can build rapidly. Secure, production-ready implementations of trending AI technologies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {aiServices.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-br ${service.color} p-3 text-white w-fit`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  {service.badge && (
                    <Badge className={`bg-gradient-to-r ${service.color} w-fit mt-2`}>{service.badge}</Badge>
                  )}
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-violet-600 shrink-0" />
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

      {/* Additional Services */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Specialized Solutions</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Additional services tailored to modern development needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {additionalServices.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-br ${service.color} p-3 text-white w-fit`}>
                      <service.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t">
                      <span className="text-sm font-semibold text-muted-foreground">Budget: </span>
                      <span className="text-lg font-bold text-primary">
                        {service.price}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8 md:p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Why Choose SecureCodeReviews?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Security First", desc: "Every project built with OWASP guidelines" },
              { icon: Zap, title: "Fast Delivery", desc: "Agile methodology with rapid iterations" },
              { icon: Code, title: "Expert Team", desc: "Certified security engineers & developers" },
              { icon: LineChart, title: "Scalable", desc: "Built to grow with your business" },
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

      {/* CTA */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4">Ready to Build Something Secure?</h3>
              <p className="text-muted-foreground mb-6 max-w-xl">
                Every organization has unique security and development needs. Contact us today to discuss your project and receive a custom quote.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button size="lg" className="gap-2">
                    Get in Touch <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/tools">
                  <Button size="lg" variant="outline" className="gap-2">
                    Explore Free Tools <ExternalLink className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
