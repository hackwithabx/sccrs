"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Platform: [
    { href: "/blog", label: "Blog" },
    { href: "/services", label: "Services" },
    { href: "/secure-code", label: "Secure Code Examples" },
    { href: "/vulnerabilities", label: "Vulnerability Dashboard" },
    { href: "/cloud-security", label: "Cloud Security" },
  ],
  Tools: [
    { href: "/tools", label: "Free Security Tools" },
    { href: "/tools/ai-security-auditor", label: "Free AI Security Auditor" },
    { href: "/tools#csp-generator", label: "CSP Generator" },
    { href: "/tools#jwt-decoder", label: "JWT Decoder" },
  ],
  Resources: [
    { href: "/owasp/top-10", label: "OWASP Top 10" },
    { href: "/owasp/top-10-2025", label: "OWASP Top 10 (2025)" },
    { href: "/owasp/top-10-ai", label: "OWASP Top 10 AI" },
    { href: "/nodejs-security-guide", label: "Node.js Security Guide" },
    { href: "/blog/cloud-security-aws-azure-gcp", label: "Cloud Security Guide" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-service", label: "Terms of Service" },
  ],
};

export function Footer() {
  const pathname = usePathname();

  // Hide main footer on demo template pages
  if (pathname.startsWith("/demos")) return null;

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Shield className="h-6 w-6 text-primary" />
              <span>
                Secure<span className="text-primary">Code</span>Reviews
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted partner in application security. We help developers build
              secure software through expert code reviews, security tools, and educational resources.
            </p>
            <a
              href="mailto:support@securecodereviews.com"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              support@securecodereviews.com
            </a>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <p className="text-xs text-muted-foreground/70 text-center mb-4">
          OWASP&reg; is a registered trademark of the OWASP Foundation. This site is not affiliated with, endorsed by, or sponsored by the OWASP Foundation. All other trademarks are the property of their respective owners.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SecureCodeReviews.com. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
