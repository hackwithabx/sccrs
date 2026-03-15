import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShieldX Documentation — Product Manual & User Guide",
  description:
    "Complete documentation for ShieldX security platform. Learn how to use all 8 security modules — secrets scanner, dependency auditor, cloud security, API scanner, log analyzer, CI/CD integration, alerts, and security scoring.",
  keywords: [
    "ShieldX documentation",
    "ShieldX manual",
    "security scanner documentation",
    "ShieldX user guide",
    "secrets scanner guide",
    "dependency scanner guide",
    "cloud security checklist",
    "API security testing",
  ],
};

export default function ShieldXDocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
