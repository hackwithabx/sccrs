import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Security Reports — CVE Roundups & Threat Intelligence | SecureCodeReviews",
  description: "Weekly security intelligence reports covering new CVEs, major breaches, trending threats, and actionable recommendations for development teams.",
  keywords: ["weekly security report", "CVE roundup", "threat intelligence", "security briefing", "vulnerability report", "breach report"],
};

export default function WeeklyReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
