import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Server, Eye, Trash2, Globe, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Zero Code Storage Policy — ShieldX | SecureCodeReviews",
  description: "ShieldX never stores, logs, or retains your source code. Learn about our zero code storage architecture and privacy-first approach to security scanning.",
  keywords: ["zero code storage", "code privacy", "ShieldX privacy", "no data retention", "secure scanning", "privacy-first security"],
};

export default function NoCodeStoragePage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 text-sm font-medium mb-4">
            <Lock className="h-4 w-4" /> Privacy Commitment
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Zero Code Storage Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            ShieldX is built on a fundamental principle: <strong className="text-foreground">your code is yours alone</strong>. We never store, log, cache, or retain any source code you submit for analysis.
          </p>
        </div>

        {/* Architecture Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Server className="h-6 w-6 text-primary" /> How It Works
          </h2>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              When you submit code to any ShieldX scanner, the following process occurs:
            </p>
            <div className="space-y-4">
              {[
                { step: 1, title: "Submission", desc: "Your code is transmitted to our servers via HTTPS (TLS 1.2+). The encrypted payload never touches disk — it goes directly into memory." },
                { step: 2, title: "In-Memory Analysis", desc: "Our scanning engines process your code entirely in RAM. Pattern matching, entropy analysis, and vulnerability detection all happen in volatile memory." },
                { step: 3, title: "Results Generation", desc: "Scan findings (vulnerability types, line numbers, severity ratings) are compiled into a results object. This object contains NO source code — only metadata about findings." },
                { step: 4, title: "Immediate Disposal", desc: "Once results are returned to your browser, the in-memory code buffer is zeroed out and released. No code is written to disk, database, log file, or any persistent storage." },
                { step: 5, title: "Session Delivery", desc: "Results are delivered directly to your browser session via HTTPS. We do not retain copies of scan results on our servers." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Don't Do */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-destructive" /> What We Never Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Store your source code in any database",
              "Write code to disk or persistent storage",
              "Log code snippets in server logs",
              "Cache code for future analysis",
              "Share code with any third party",
              "Train AI/ML models on your code",
              "Create backups containing user code",
              "Retain scan results on our servers",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-lg border border-destructive/10 bg-destructive/5">
                <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center text-destructive text-xs font-bold">✕</div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" /> What We Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Encrypt all data in transit via TLS 1.2+",
              "Process code exclusively in volatile memory",
              "Zero-out memory buffers after analysis",
              "Return only metadata findings (no code)",
              "Enforce HSTS with 1-year minimum max-age",
              "Implement SOC 2 Type II security controls",
              "Regular third-party security audits",
              "GDPR-compliant data handling practices",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Dependency Scanner Note */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Globe className="h-6 w-6 text-violet-500" /> Third-Party API Calls
          </h2>
          <div className="rounded-xl border p-8 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              The ShieldX <strong className="text-foreground">Dependency Scanner</strong> queries the Google OSV.dev API to check for known vulnerabilities. Here&apos;s what&apos;s shared:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span><strong className="text-foreground">Only package names and version numbers</strong> are sent to OSV.dev — never your source code</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>OSV.dev is a public, open-source vulnerability database maintained by Google</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>No authentication tokens, API keys, or proprietary data is included in the request</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              The API Scanner sends standard HTTP requests to URLs <strong className="text-foreground">you explicitly provide</strong> and analyzes the response headers. It does not access any endpoints you have not specifically submitted.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-muted-foreground" /> Common Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: "Can I use ShieldX with proprietary/classified code?", a: "Yes. Since no code is stored or transmitted beyond our secure analysis environment, ShieldX is safe for proprietary, classified, and sensitive source code." },
              { q: "What happens if your server crashes during a scan?", a: "In the unlikely event of a server crash, all in-memory data (including your code) is lost. Since code is never written to disk, there is nothing to recover or leak." },
              { q: "Do you have access to my code during the scan?", a: "The scanning is fully automated. No human has access to your code at any point. Your code exists only in an isolated memory space during the scan." },
              { q: "Can law enforcement or governments request my code?", a: "Since we do not store your code, we have nothing to provide in response to any legal request. We cannot produce what we do not have." },
              { q: "How can I verify this policy?", a: "We welcome security researchers to audit our infrastructure. Contact us for details about our third-party audit reports and security certifications." },
            ].map((faq) => (
              <div key={faq.q} className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center rounded-xl border-0 bg-gradient-to-r from-emerald-500/5 to-primary/5 p-12">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Your Code Stays Yours</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start scanning with confidence. ShieldX gives you enterprise-grade security analysis without compromising your intellectual property.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shieldx" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <Shield className="h-4 w-4" /> Open ShieldX
            </Link>
            <Link href="/privacy-policy" className="inline-flex items-center gap-2 px-6 py-2.5 border rounded-lg font-medium hover:bg-muted transition-colors">
              Full Privacy Policy <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
