"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Shield, Sparkles } from "lucide-react";

const footerLinks = {
  Products: [
    { href: "/products/ai-security-auditor", label: "AI Security Auditor" },
    { href: "/products/shieldx", label: "ShieldX" },
    { href: "/pricing", label: "Pricing" },
    { href: "/services", label: "Security Services" },
  ],
  Learn: [
    { href: "/learn", label: "Learn Hub" },
    { href: "/blog", label: "Research Blog" },
    { href: "/owasp/top-10-ai", label: "OWASP Top 10 for LLM Apps" },
    { href: "/secure-code", label: "Secure Code Examples" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/editorial-policy", label: "Editorial Policy" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-service", label: "Terms of Service" },
  ],
};

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/demos")) return null;

  return (
    <footer className="border-t border-slate-200/80 bg-[linear-gradient(180deg,rgba(250,252,255,0.94),rgba(241,247,255,0.96))] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="surface-card-strong mb-12 grid gap-8 rounded-[2rem] p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <div className="section-eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              AI Security for modern teams
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Secure AI systems before attackers find them.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Protect LLM applications from prompt injection, data leakage, insecure tool use, and cloud misconfiguration with one trusted security brand.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/contact?subject=Enterprise+AI+Security+Audit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_40px_-28px_rgba(15,23,42,0.7)] hover:bg-blue-700"
            >
              Talk to security team
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products/ai-security-auditor"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 hover:border-blue-200 hover:text-blue-700"
            >
              Explore AI Auditor
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-200 bg-white shadow-sm">
                <Shield className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight">SecureCodeReviews</div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">AI Security Platform</div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
              Premium AI security and AppSec workflows for teams shipping copilots, agents, APIs, cloud platforms, and enterprise software.
            </p>
            <a
              href="mailto:support@securecodereviews.com"
              className="mt-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-600"
            >
              support@securecodereviews.com
            </a>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-600 transition-colors hover:text-slate-950">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-200/80 pt-6 text-xs leading-6 text-slate-500">
          <p>
            OWASP is a registered trademark of the OWASP Foundation. This site is not affiliated with, endorsed by, or sponsored by the OWASP Foundation. All other trademarks are the property of their respective owners.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} SecureCodeReviews.com. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy-policy" className="hover:text-slate-700">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-slate-700">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-slate-700">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}