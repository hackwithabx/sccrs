import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Code Examples — Vulnerable vs. Secure Code Patterns",
  description:
    "Learn secure coding with real-world vulnerable vs. secure code examples in JavaScript, TypeScript, Python, Java, and Node.js. Copy-paste secure implementations for SQL injection, XSS, CSRF, authentication, and more.",
  keywords: [
    "secure code examples",
    "vulnerable code patterns",
    "secure coding practices",
    "SQL injection prevention",
    "XSS prevention",
    "CSRF protection",
    "secure authentication code",
    "OWASP secure coding",
    "application security code review",
    "secure JavaScript code",
  ],
  openGraph: {
    title: "Secure Code Examples — Vulnerable vs. Secure Patterns",
    description:
      "Real-world vulnerable vs. secure code examples. Copy-paste secure implementations for common web application vulnerabilities.",
    url: "https://securecodereviews.com/secure-code",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Secure Code Examples | SecureCodeReviews",
    description:
      "Learn secure coding with side-by-side vulnerable vs. secure code comparisons.",
  },
  alternates: {
    canonical: "/secure-code",
  },
};

export default function SecureCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
