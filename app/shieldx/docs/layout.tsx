import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ShieldX Documentation - Product Manual & User Guide",
  description:
    "Complete documentation for ShieldX security platform. Learn how to use all security modules - secrets scanner, dependency auditor, cloud security, API scanner, log analyzer, CI/CD integration, and security scoring.",
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
  alternates: {
    canonical: "/shieldx/docs",
  },
  openGraph: {
    title: "ShieldX Documentation | SecureCodeReviews",
    description:
      "Step-by-step docs for ShieldX modules, onboarding, CI/CD setup, paid workspace guidance, and product walkthroughs.",
    url: "https://securecodereviews.com/shieldx/docs",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShieldX Documentation | SecureCodeReviews",
    description:
      "Learn how to use ShieldX secrets, dependency, API, cloud, and CI/CD features.",
    images: ["/og-image.png"],
  },
};

export default function ShieldXDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
