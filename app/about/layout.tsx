import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | SecureCodeReviews",
  description:
    "Meet the SecureCodeReviews team — experienced application security professionals with 10+ years of expertise in secure code review, penetration testing, and DevSecOps.",
  openGraph: {
    title: "About Us | SecureCodeReviews",
    description:
      "Meet the team behind SecureCodeReviews — 10+ years of AppSec expertise protecting enterprises worldwide.",
    url: "https://securecodereviews.com/about",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
