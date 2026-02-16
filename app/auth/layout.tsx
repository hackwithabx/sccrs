import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | SecureCodeReviews",
    default: "Authentication | SecureCodeReviews",
  },
  description: "Sign in or create an account on SecureCodeReviews to access security tools, reports, and dashboards.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
