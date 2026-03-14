"use client";

import { motion } from "framer-motion";
import { Shield, Brain, ArrowRight, AlertTriangle, BookOpen, ExternalLink, Sparkles, Calendar } from "lucide-react";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function OwaspPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              OWASP Security Standards
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              OWASP{" "}
              <span className="text-primary">Top 10</span>{" "}
              Security Risks
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Comprehensive guides to the most critical web application and AI security risks, 
              with detailed descriptions, real-world examples, vulnerable vs. secure code, 
              and actionable prevention strategies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured — OWASP Top 10 2025 */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div
            custom={0}
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Link href="/owasp/top-10-2025" className="group block">
              <div className="relative bg-card border-2 border-primary/30 rounded-2xl p-8 md:p-10 hover:border-primary/60 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full" />
                <div className="relative z-10 md:flex md:items-start md:gap-10">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-4">
                      <Sparkles className="w-3.5 h-3.5" />
                      Latest — 2025 Edition
                    </div>
                    <h2 className="text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                      OWASP Top 10 — 2025
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-2xl">
                      The newest edition covering AI-era threats, cloud-native misconfigurations,
                      supply chain attacks, post-quantum cryptography, and modern authentication
                      failures — with comprehensive code examples and prevention strategies.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2 mb-6">
                      {[
                        "A01 — Broken Access Control",
                        "A02 — Cryptographic Failures",
                        "A03 — Injection (+ Prompt Injection)",
                        "A04 — Insecure Design",
                        "A05 — Security Misconfiguration",
                        "A06 — Vulnerable Components",
                        "A07 — Auth Failures",
                        "A08 — Integrity Failures",
                        "A09 — Logging & Monitoring",
                        "A10 — SSRF",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-primary font-medium">
                      Explore the 2025 Edition
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Secondary Cards — 2021, AI, History */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* 2021 Card */}
            <motion.div custom={1} variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Link href="/owasp/top-10" className="group block h-full">
                <div className="relative bg-card border border-border rounded-2xl p-6 h-full hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    OWASP Top 10 — 2021
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The previous edition — still widely referenced. Introduced Insecure Design,
                    Software Integrity Failures, and SSRF as new categories.
                  </p>
                  <div className="space-y-1.5 mb-4">
                    {["Broken Access Control", "Cryptographic Failures", "Injection", "Insecure Design", "Security Misconfiguration"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertTriangle className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                    <div className="text-xs text-muted-foreground pl-5">... and 5 more</div>
                  </div>
                  <div className="flex items-center gap-2 text-primary text-sm font-medium">
                    View 2021 Guide
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* AI/LLM Card */}
            <motion.div custom={2} variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Link href="/owasp/top-10-ai" className="group block h-full">
                <div className="relative bg-card border border-border rounded-2xl p-6 h-full hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">
                    OWASP Top 10 for AI
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Security risks for LLM and AI systems — Prompt Injection,
                    Model Poisoning, Excessive Agency, and more.
                  </p>
                  <div className="space-y-1.5 mb-4">
                    {["Prompt Injection", "Sensitive Info Disclosure", "Supply Chain", "Data & Model Poisoning", "Improper Output Handling"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Brain className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                    <div className="text-xs text-muted-foreground pl-5">... and 5 more</div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 text-sm font-medium">
                    View AI/LLM Guide
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Historical Versions Card */}
            <motion.div custom={3} variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Link href="/owasp/history" className="group block h-full">
                <div className="relative bg-card border border-border rounded-2xl p-6 h-full hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-amber-500 transition-colors">
                    Historical Versions
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Explore every OWASP Top 10 edition from 2007 to 2025 and see
                    how security risks evolved over nearly two decades.
                  </p>
                  <div className="space-y-1.5 mb-4">
                    {["2025 — AI & Cloud-Native Era", "2021 — Modern Web Security", "2017 — API & SPA Growth", "2013 — Mobile & Cloud Emergence", "2010 & 2007 — Early Editions"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-amber-500 text-sm font-medium">
                    Explore Timeline
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About OWASP Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="About OWASP"
              description="The Open Worldwide Application Security Project"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6 mt-12"
            >
              {[
                {
                  icon: BookOpen,
                  title: "Open Source",
                  description:
                    "OWASP is a nonprofit foundation focused on improving software security. All materials, tools, and documentation are free and open source.",
                },
                {
                  icon: Shield,
                  title: "Industry Standard",
                  description:
                    "The OWASP Top 10 is the de facto standard for web application security awareness, referenced by PCI DSS, NIST, and regulatory frameworks worldwide.",
                },
                {
                  icon: AlertTriangle,
                  title: "Data-Driven",
                  description:
                    "Rankings are based on analysis of real vulnerability data from hundreds of organizations, covering millions of applications and thousands of CVEs.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  custom={i}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  <item.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 text-center"
            >
              <a
                href="https://owasp.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Visit owasp.org
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="mt-4 text-xs text-muted-foreground/70 max-w-2xl mx-auto">
                OWASP&reg; is a registered trademark of the OWASP Foundation. Our educational content is inspired by OWASP materials, which are available under the{" "}
                <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
                This site is independently operated and is not affiliated with or endorsed by the OWASP Foundation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
