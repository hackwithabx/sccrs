import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | SecureCodeReviews",
  description:
    "Your SecureCodeReviews dashboard — access security tools, reports, recent assessments, and resources.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
