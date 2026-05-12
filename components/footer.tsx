"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Shield } from "lucide-react";

const footerLinks = {
  Platform: [
    { href: "/shieldx", label: "ShieldX" },
    { href: "/tools", label: "Free Security Tools" },
    { href: "/tools/ai-security-auditor", label: "AI Security Auditor" },
    { href: "/services", label: "Services" },
  ],
  Learn: [
    { href: "/blog", label: "Blog" },
    { href: "/owasp", label: "OWASP Guides" },
    { href: "/owasp/top-10-ai", label: "OWASP Top 10 AI" },
    { href: "/secure-code", label: "Secure Code Examples" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-service", label: "Terms of Service" },
  ],
};

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/demos")) return null;

  return (
    <footer className="border-t border-white/10 bg-[#040b14] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-12 grid gap-8 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_24%),linear-gradient(135deg,_rgba(7,17,29,1),_rgba(8,21,34,0.96))] p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                <Shield className="h-5 w-5" />
              </div>
              <div className="text-lg font-semibold tracking-tight">
                Secure<span className="text-cyan-300">Code</span>Reviews
              </div>
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              Platform, tooling, AI workflow review, and expert AppSec help from one brand.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Use ShieldX and our free tools when you want speed. Bring in the SCR team when a release, audit, or customer requirement needs deeper assurance.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100"
            >
              Contact SCRs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/shieldx"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Open ShieldX
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <p className="max-w-sm text-sm leading-7 text-slate-400">
              Your trusted partner in application security for modern engineering teams building cloud-native products, internal tooling, and AI-driven workflows.
            </p>
            <a
              href="mailto:support@securecodereviews.com"
              className="mt-4 inline-flex text-sm font-medium text-cyan-200 hover:text-cyan-100"
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
                    <Link href={link.href} className="text-sm text-slate-300 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs leading-6 text-slate-500">
          <p>
            OWASP® is a registered trademark of the OWASP Foundation. This site is not affiliated with, endorsed by, or sponsored by the OWASP Foundation. All other trademarks are the property of their respective owners.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} SecureCodeReviews.com. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy-policy" className="hover:text-slate-300">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-slate-300">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-slate-300">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
