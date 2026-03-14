import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | SecureCodeReviews",
  description:
    "Meet the SecureCodeReviews team — experienced application security professionals with 10+ years of expertise in secure code review, penetration testing, and DevSecOps.",
  keywords: [
    "about SecureCodeReviews",
    "application security team",
    "cybersecurity experts",
    "security consulting company",
    "AppSec professionals",
    "penetration testing team",
  ],
  openGraph: {
    title: "About Us | SecureCodeReviews",
    description:
      "Meet the team behind SecureCodeReviews — 10+ years of AppSec expertise protecting enterprises worldwide.",
    url: "https://securecodereviews.com/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | SecureCodeReviews",
    description:
      "Meet the team behind SecureCodeReviews — 10+ years of AppSec expertise.",
  },
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About SecureCodeReviews",
    description: "Meet the SecureCodeReviews team — experienced application security professionals with expertise in secure code review, penetration testing, and DevSecOps.",
    url: "https://securecodereviews.com/about",
    mainEntity: { "@type": "Organization", name: "SecureCodeReviews", url: "https://securecodereviews.com" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
