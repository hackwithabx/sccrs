"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface HistoricalVersion {
  year: string;
  subtitle: string;
  color: string;
  link?: string;
  items: { rank: string; title: string; description: string }[];
  highlights: string[];
}

const owaspHistory: HistoricalVersion[] = [
  {
    year: "2025",
    subtitle: "AI & Cloud-Native Era",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    link: "/owasp/top-10-2025",
    items: [
      { rank: "A01", title: "Broken Access Control", description: "API-first architectures, multi-tenant isolation, GraphQL authorization failures." },
      { rank: "A02", title: "Cryptographic Failures", description: "Post-quantum preparedness, AI model encryption, secrets management in CI/CD." },
      { rank: "A03", title: "Injection", description: "SQL/NoSQL + Prompt Injection targeting LLM-powered features." },
      { rank: "A04", title: "Insecure Design", description: "Business logic abuse, AI model design flaws, missing threat modeling." },
      { rank: "A05", title: "Security Misconfiguration", description: "Kubernetes, serverless, cloud storage misconfigs dominate." },
      { rank: "A06", title: "Vulnerable & Outdated Components", description: "Supply chain attacks, typosquatting, XZ Utils-style backdoors." },
      { rank: "A07", title: "Identification & Authentication Failures", description: "Passkey adoption issues, OAuth/OIDC misconfig, AI-enhanced credential stuffing." },
      { rank: "A08", title: "Software & Data Integrity Failures", description: "CI/CD pipeline compromise, unsigned artifacts, SRI." },
      { rank: "A09", title: "Security Logging & Monitoring Failures", description: "194-day average breach detection, log injection, missing SIEM." },
      { rank: "A10", title: "Server-Side Request Forgery (SSRF)", description: "Cloud metadata attacks, Kubernetes service abuse, webhook SSRF." },
    ],
    highlights: [
      "Prompt injection added to injection category",
      "Post-quantum cryptography preparedness emphasized",
      "Supply chain attacks (XZ Utils) drive component security focus",
      "Cloud-native and Kubernetes misconfigurations prominent",
    ],
  },
  {
    year: "2021",
    subtitle: "Modern Web Security",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    link: "/owasp/top-10",
    items: [
      { rank: "A01", title: "Broken Access Control", description: "Moved from #5 to #1. 94% of apps tested had some form of broken access control." },
      { rank: "A02", title: "Cryptographic Failures", description: "Renamed from 'Sensitive Data Exposure' to focus on root cause — crypto failures." },
      { rank: "A03", title: "Injection", description: "Dropped from #1. Cross-Site Scripting now merged into this category." },
      { rank: "A04", title: "Insecure Design", description: "NEW category. Design flaws vs implementation bugs." },
      { rank: "A05", title: "Security Misconfiguration", description: "Moved up. XML External Entities (XXE) merged into this category." },
      { rank: "A06", title: "Vulnerable & Outdated Components", description: "Previously 'Using Components with Known Vulnerabilities'. Ranked up." },
      { rank: "A07", title: "Identification & Authentication Failures", description: "Renamed from 'Broken Authentication'. Broader scope." },
      { rank: "A08", title: "Software & Data Integrity Failures", description: "NEW category. Includes insecure deserialization + CI/CD integrity." },
      { rank: "A09", title: "Security Logging & Monitoring Failures", description: "Renamed from 'Insufficient Logging & Monitoring'. Expanded scope." },
      { rank: "A10", title: "Server-Side Request Forgery (SSRF)", description: "NEW entry. Cloud adoption made SSRF critical." },
    ],
    highlights: [
      "3 new categories: Insecure Design, Integrity Failures, SSRF",
      "XSS merged into Injection category",
      "XXE merged into Security Misconfiguration",
      "Access Control became the #1 risk (was #5 in 2017)",
    ],
  },
  {
    year: "2017",
    subtitle: "API & SPA Growth",
    color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    items: [
      { rank: "A1", title: "Injection", description: "SQL, NoSQL, OS, LDAP injection. Still #1 after a decade." },
      { rank: "A2", title: "Broken Authentication", description: "Session management flaws, credential stuffing, poor password storage." },
      { rank: "A3", title: "Sensitive Data Exposure", description: "Weak crypto, cleartext transmission, PII/financial data exposure." },
      { rank: "A4", title: "XML External Entities (XXE)", description: "NEW. Attacks on XML parsers — file disclosure, SSRF, DoS." },
      { rank: "A5", title: "Broken Access Control", description: "Merged from 'Insecure Direct Object References' and 'Missing Function Level Access Control'." },
      { rank: "A6", title: "Security Misconfiguration", description: "Default configs, open cloud storage, verbose errors, missing headers." },
      { rank: "A7", title: "Cross-Site Scripting (XSS)", description: "Reflected, Stored, and DOM-based XSS. Affects 2/3 of apps." },
      { rank: "A8", title: "Insecure Deserialization", description: "NEW. Remote code execution via crafted serialized objects." },
      { rank: "A9", title: "Using Components with Known Vulnerabilities", description: "Libraries, frameworks, and modules with known CVEs." },
      { rank: "A10", title: "Insufficient Logging & Monitoring", description: "NEW. Lack of detection enables attackers to persist, pivot, and extract data." },
    ],
    highlights: [
      "3 new entries: XXE, Insecure Deserialization, Insufficient Logging",
      "Merged IDOR and Missing Function Level Access Control → Broken Access Control",
      "Community-driven selection of new entries",
      "Cross-Site Request Forgery (CSRF) dropped off the list",
    ],
  },
  {
    year: "2013",
    subtitle: "Mobile & Cloud Emergence",
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    items: [
      { rank: "A1", title: "Injection", description: "SQL, OS, LDAP injection. Remained the top risk." },
      { rank: "A2", title: "Broken Authentication and Session Management", description: "Session hijacking, credential management, session fixation." },
      { rank: "A3", title: "Cross-Site Scripting (XSS)", description: "Reflected, Stored, DOM XSS. Second most prevalent flaw." },
      { rank: "A4", title: "Insecure Direct Object References", description: "Direct exposure of internal implementation objects via URL/form parameter." },
      { rank: "A5", title: "Security Misconfiguration", description: "Default configs, unnecessary services, unpatched flaws." },
      { rank: "A6", title: "Sensitive Data Exposure", description: "NEW. Many apps don't adequately protect sensitive data." },
      { rank: "A7", title: "Missing Function Level Access Control", description: "Renamed from 'Failure to Restrict URL Access'. Broader scope." },
      { rank: "A8", title: "Cross-Site Request Forgery (CSRF)", description: "Forged HTTP requests from a victim's authenticated browser." },
      { rank: "A9", title: "Using Components with Known Vulnerabilities", description: "NEW. Replaced 'Failure to Restrict URL Access' approach." },
      { rank: "A10", title: "Unvalidated Redirects and Forwards", description: "Open redirects used for phishing and access control bypass." },
    ],
    highlights: [
      "Sensitive Data Exposure added as separate category",
      "Using Components with Known Vulnerabilities introduced",
      "Focus shifted toward data protection and supply chain",
      "CSRF still on the list (removed in 2017)",
    ],
  },
  {
    year: "2010",
    subtitle: "Web 2.0 Security",
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    items: [
      { rank: "A1", title: "Injection", description: "SQL, OS, LDAP injection flaws. Moved to #1 from #2 in 2007." },
      { rank: "A2", title: "Cross-Site Scripting (XSS)", description: "Stored, Reflected, DOM. Dropped from #1 in 2007." },
      { rank: "A3", title: "Broken Authentication and Session Management", description: "Session hijacking, credential management weaknesses." },
      { rank: "A4", title: "Insecure Direct Object References", description: "Accessing unauthorized resources by changing parameter values." },
      { rank: "A5", title: "Cross-Site Request Forgery (CSRF)", description: "Forces authenticated users to submit forged requests." },
      { rank: "A6", title: "Security Misconfiguration", description: "NEW. Secure configurations across all layers of the stack." },
      { rank: "A7", title: "Insecure Cryptographic Storage", description: "Failing to encrypt sensitive data or using weak algorithms." },
      { rank: "A8", title: "Failure to Restrict URL Access", description: "Links/navigation hidden but no server-side enforcement." },
      { rank: "A9", title: "Insufficient Transport Layer Protection", description: "Failing to encrypt network traffic (missing SSL/TLS)." },
      { rank: "A10", title: "Unvalidated Redirects and Forwards", description: "NEW. Redirecting users to untrusted destinations." },
    ],
    highlights: [
      "Injection moved to #1 position",
      "Security Misconfiguration introduced",
      "Unvalidated Redirects and Forwards was new",
      "Malicious File Execution and Information Leakage dropped off",
    ],
  },
  {
    year: "2007",
    subtitle: "The First Modern List",
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    items: [
      { rank: "A1", title: "Cross-Site Scripting (XSS)", description: "The #1 web vulnerability at the time. Pervasive in web applications." },
      { rank: "A2", title: "Injection Flaws", description: "SQL injection, command injection. Not yet ranked #1." },
      { rank: "A3", title: "Malicious File Execution", description: "Remote file inclusion (RFI). Common in PHP applications." },
      { rank: "A4", title: "Insecure Direct Object Reference", description: "Accessing other users' data via parameter manipulation." },
      { rank: "A5", title: "Cross-Site Request Forgery (CSRF)", description: "Forging authenticated requests. Newly added." },
      { rank: "A6", title: "Information Leakage and Improper Error Handling", description: "Stack traces, error messages revealing internal details." },
      { rank: "A7", title: "Broken Authentication and Session Management", description: "Credential and session management weaknesses." },
      { rank: "A8", title: "Insecure Cryptographic Storage", description: "Not encrypting sensitive data, using homegrown crypto." },
      { rank: "A9", title: "Insecure Communications", description: "Not using SSL for pages handling sensitive data." },
      { rank: "A10", title: "Failure to Restrict URL Access", description: "Security through obscurity — hiding pages instead of protecting them." },
    ],
    highlights: [
      "First version using the modern A1-A10 format",
      "XSS was the #1 risk (injection wasn't yet #1)",
      "Malicious File Execution reflected the PHP era",
      "CSRF introduced for the first time",
    ],
  },
];

function VersionCard({
  version,
  index,
}: {
  version: HistoricalVersion;
  index: number;
}) {
  const [expanded, setExpanded] = useState(version.year === "2025");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="scroll-mt-24"
      id={`year-${version.year}`}
    >
      <div
        className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${
          expanded
            ? "border-primary/30 shadow-lg"
            : "border-border hover:border-primary/20"
        }`}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-6 md:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-extrabold text-primary">
                  {version.year.slice(-2)}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold">
                    OWASP Top 10 — {version.year}
                  </h2>
                  {version.year === "2025" && (
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      Latest
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {version.subtitle}
                </p>
              </div>
            </div>
            {expanded ? (
              <ChevronUp className="w-6 h-6 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="w-6 h-6 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 md:px-8 pb-8 space-y-6">
                <hr className="border-border" />

                {/* Items Table */}
                <div className="space-y-3">
                  {version.items.map((item) => (
                    <div
                      key={item.rank}
                      className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl"
                    >
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                        {item.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Changes */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Key Changes & Highlights
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {version.highlights.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-primary/5 rounded-lg"
                      >
                        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {h}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Link to detailed page if available */}
                {version.link && (
                  <Link
                    href={version.link}
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                  >
                    View full detailed guide with code examples
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function OwaspHistoryPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <Link
              href="/owasp"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to OWASP
            </Link>

            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />
              Historical Archive
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              OWASP Top 10{" "}
              <span className="text-primary">Through the Years</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
              From 2007 to 2025 — explore how web application security risks
              have evolved over nearly two decades. See which vulnerabilities
              persisted, which were added, and how the threat landscape shifted
              with new technologies.
            </p>

            {/* Quick Navigation */}
            <div className="flex flex-wrap gap-2">
              {owaspHistory.map((v) => (
                <a
                  key={v.year}
                  href={`#year-${v.year}`}
                  className="px-4 py-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary text-sm font-medium transition-colors"
                >
                  {v.year}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Evolution Timeline */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold mb-6 text-center">
              The Evolution of #1 Risk
            </h2>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { year: "2007", risk: "XSS", color: "text-rose-500" },
                { year: "2010", risk: "Injection", color: "text-cyan-500" },
                { year: "2013", risk: "Injection", color: "text-purple-500" },
                { year: "2017", risk: "Injection", color: "text-orange-500" },
                {
                  year: "2021",
                  risk: "Access Control",
                  color: "text-blue-500",
                },
                {
                  year: "2025",
                  risk: "Access Control",
                  color: "text-emerald-500",
                },
              ].map((item, i, arr) => (
                <div key={item.year} className="flex items-center gap-2">
                  <div className="text-center">
                    <div
                      className={`text-xs font-bold ${item.color} mb-1`}
                    >
                      {item.year}
                    </div>
                    <div className="px-3 py-1.5 bg-card border rounded-lg text-xs font-medium">
                      {item.risk}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Version Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl space-y-8">
          {owaspHistory.map((version, index) => (
            <VersionCard key={version.year} version={version} index={index} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">
            Start with the Latest Version
          </h2>
          <p className="text-muted-foreground mb-6">
            The 2025 edition includes comprehensive code examples, real-world
            breach case studies, and actionable prevention strategies.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/owasp/top-10-2025"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              OWASP Top 10 — 2025
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/owasp/top-10-ai"
              className="inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-xl hover:bg-primary/10 hover:text-primary transition-colors text-sm font-medium"
            >
              Top 10 for AI/LLM
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
