"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
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
  Crosshair,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { owaspTop10AI } from "@/lib/owasp-top10-ai-data";
import type { OwaspAIItem } from "@/lib/owasp-top10-ai-data";

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

function AIItemCard({ item, index }: { item: OwaspAIItem; index: number }) {
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
          expanded ? "border-blue-500/30 shadow-lg shadow-blue-500/5" : "border-border hover:border-blue-500/20"
        }`}
      >
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-6 md:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 font-bold text-sm">
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
                    <BookOpen className="w-5 h-5 text-blue-500" />
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

                {/* Attack Scenario */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Crosshair className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-semibold">Attack Scenario</h3>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm font-semibold text-red-500 uppercase tracking-wider">
                        How the Attack Works
                      </span>
                    </div>
                    <CodeBlock code={item.attackScenario} language={item.codeLanguage} />
                  </div>
                </div>

                {/* Mitigation Code */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Code className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">Mitigation Code</h3>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm font-semibold text-green-500 uppercase tracking-wider">
                        Defense Implementation
                      </span>
                    </div>
                    <CodeBlock code={item.mitigationCode} language={item.codeLanguage} />
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

                {/* References */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2">References</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.references.map((ref) => (
                      <a
                        key={ref.url}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-xs hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
                      >
                        {ref.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
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

export default function OwaspTop10AIPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <Link
              href="/owasp"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to OWASP
            </Link>

            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Brain className="w-4 h-4" />
              AI / LLM Security
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              OWASP Top 10 for{" "}
              <span className="text-blue-500">LLM Applications</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4 max-w-3xl">
              The definitive guide to security risks in Large Language Model applications. 
              As AI systems become integrated into critical business workflows, understanding 
              and mitigating LLM-specific vulnerabilities is essential.
            </p>
            <p className="text-muted-foreground mb-8 max-w-3xl">
              Each category includes detailed descriptions, real-world attack examples, 
              attack scenario code, defense implementations, and actionable prevention strategies.
            </p>

            {/* Quick Navigation */}
            <div className="flex flex-wrap gap-2">
              {owaspTop10AI.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-blue-500/10 hover:text-blue-500 text-sm transition-colors"
                >
                  {item.rank}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-500 mb-2">
                    Why AI Security Matters
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    LLM applications introduce fundamentally new attack surfaces that traditional security 
                    frameworks don&apos;t address. Prompt injection, training data poisoning, and excessive 
                    agency are unique to AI systems. As organizations deploy AI agents with access to tools, 
                    databases, and APIs, understanding these risks becomes critical to preventing data breaches, 
                    unauthorized actions, and financial losses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Items */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {owaspTop10AI.map((item, index) => (
              <AIItemCard key={item.id} item={item} index={index} />
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
            <h2 className="text-2xl font-bold mb-4">Also explore Web Application Security Risks</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Review the classic OWASP Top 10 for web applications — covering injection, 
              broken access control, cryptographic failures, and more with real-world code examples.
            </p>
            <Link
              href="/owasp/top-10"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <Shield className="w-4 h-4" />
              OWASP Top 10 (Web)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
