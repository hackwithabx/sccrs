import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SCR ShieldX — Automated Security Scanning for Startups",
  description:
    "Continuous security scanning for source code, APIs, cloud infrastructure, dependencies, and secrets. Get a Security Score + Fix Guidance. Built for startups.",
  keywords: [
    "security scanning",
    "startup security",
    "vulnerability scanner",
    "secrets detection",
    "dependency scanning",
    "cloud security scanner",
    "API security",
    "DevSecOps",
    "security score",
    "ShieldX",
  ],
  openGraph: {
    title: "SCR ShieldX — Automated Security Scanning for Startups",
    description:
      "Continuous security monitoring for code, APIs, cloud, dependencies & secrets. Security Score + AI-powered fix guidance.",
    url: "https://securecodereviews.com/shieldx",
  },
};

export default function ShieldXLayout({ children }: { children: React.ReactNode }) {
  return children;
}
