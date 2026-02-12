"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Code,
  ShieldAlert,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { owaspTop10 } from "@/lib/owasp-top10-data";
import type { OwaspItem } from "@/lib/owasp-top10-data";

const severityColors: Record<string, string> = {
  Critical: "bg-red-500/10 text-red-500 border-red-500/20",
  High: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
};

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-background/80 border border-border hover:bg-muted transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
      <div className="absolute top-3 left-3 z-10">
        <span className="px-2 py-1 rounded text-xs font-mono bg-background/80 text-muted-foreground border border-border">
          {language}
        </span>
      </div>
      <pre className="bg-zinc-950 text-zinc-200 rounded-xl p-4 pt-12 overflow-x-auto text-sm leading-relaxed border border-zinc-800">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function OwaspItemCard({ item, index }: { item: OwaspItem; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      id={item.id}
      className="scroll-mt-24"
    >
      <div
        className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${
          expanded ? "border-primary/30 shadow-lg shadow-primary/5" : "border-border hover:border-primary/20"
        }`}
      >
        {/* Header — always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-6 md:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-lg">
                  {item.rank}
                </span>
                <h2 className="text-xl md:text-2xl font-bold">{item.title}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${severityColors[item.severity]}`}
                >
                  {item.severity}
                </span>
              </div>
              <p className="text-muted-foreground">{item.shortDescription}</p>
            </div>
            <div className="flex-shrink-0 mt-1">
              {expanded ? (
                <ChevronUp className="w-6 h-6 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 md:px-8 pb-8 space-y-8">
                <hr className="border-border" />

                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Description</h3>
                  </div>
                  <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {item.description}
                  </div>
                </div>

                {/* Impact */}
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <h3 className="text-lg font-semibold text-red-500">Impact</h3>
                  </div>
                  <p className="text-muted-foreground">{item.impact}</p>
                </div>

                {/* Real-World Example */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <h3 className="text-lg font-semibold">Real-World Examples</h3>
                  </div>
                  <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-6 text-muted-foreground whitespace-pre-line leading-relaxed">
                    {item.realWorldExample}
                  </div>
                </div>

                {/* Code Examples */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Code className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Code Examples</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm font-semibold text-red-500 uppercase tracking-wider">
                          Vulnerable Code
                        </span>
                      </div>
                      <CodeBlock code={item.vulnerableCode} language={item.codeLanguage} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm font-semibold text-green-500 uppercase tracking-wider">
                          Secure Code
                        </span>
                      </div>
                      <CodeBlock code={item.secureCode} language={item.codeLanguage} />
                    </div>
                  </div>
                </div>

                {/* Prevention Steps */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-green-500" />
                    <h3 className="text-lg font-semibold">How to Prevent</h3>
                  </div>
                  <div className="grid gap-3">
                    {item.preventionSteps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 bg-green-500/5 border border-green-500/10 rounded-lg p-4"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-sm text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CWE IDs & References */}
                <div className="flex flex-wrap gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Related CWEs</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.cweIds.map((cwe) => (
                        <a
                          key={cwe}
                          href={`https://cwe.mitre.org/data/definitions/${cwe.replace("CWE-", "")}.html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-xs font-mono hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {cwe}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">References</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.references.map((ref) => (
                        <a
                          key={ref.url}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-xs hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {ref.label}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function OwaspTop10Page() {
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
              <Shield className="w-4 h-4" />
              Web Application Security
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              OWASP Top 10{" "}
              <span className="text-primary">2021</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
              The most critical security risks to web applications, based on broad consensus from security experts 
              worldwide. Each category includes detailed descriptions, real-world breach examples, 
              vulnerable vs. secure code comparisons, and actionable prevention strategies.
            </p>

            {/* Quick Navigation */}
            <div className="flex flex-wrap gap-2">
              {owaspTop10.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary text-sm transition-colors"
                >
                  {item.rank}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* All Items */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {owaspTop10.map((item, index) => (
              <OwaspItemCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-4">Also explore AI Security Risks</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Discover the OWASP Top 10 for Large Language Model Applications — the essential guide 
              to securing AI-powered systems against prompt injection, data poisoning, and more.
            </p>
            <Link
              href="/owasp/top-10-ai"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              OWASP Top 10 for AI
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
