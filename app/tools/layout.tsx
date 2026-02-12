import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Security Tools — Header Analyzer, CSP Generator, JWT Decoder & More",
  description:
    "Free online application security tools: Security Header Analyzer, CSP Generator, JWT Decoder, Hash Generator, Encoder/Decoder, Password Strength Checker, SQL Injection Tester. No sign-up required.",
  keywords: [
    "security tools",
    "header analyzer",
    "CSP generator",
    "JWT decoder",
    "hash generator",
    "password checker",
    "SQL injection tester",
    "free security tools",
    "online security testing",
  ],
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
