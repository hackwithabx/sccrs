import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | SecureCodeReviews",
  description: "SecureCodeReviews administration panel for managing content, users, and platform settings.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
