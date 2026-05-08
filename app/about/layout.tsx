import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About SecureCodeReviews | Application Security Company & ShieldX Team",
  description:
    "Learn about SecureCodeReviews, the application security company behind ShieldX. Meet the team focused on secure code review, penetration testing, DevSecOps, cloud security, and AI security guidance.",
  keywords: [
    "about SecureCodeReviews",
    "SecureCodeReviews company",
    "application security company",
    "application security team",
    "cybersecurity experts",
    "security consulting company",
    "AppSec professionals",
    "ShieldX team",
    "penetration testing team",
  ],
  openGraph: {
    title: "About Us | SecureCodeReviews",
    description:
      "Meet the team behind SecureCodeReviews and ShieldX — focused on code review, penetration testing, DevSecOps, and application security.",
    url: "https://securecodereviews.com/about",
    type: "website",
    siteName: "SecureCodeReviews",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | SecureCodeReviews",
    description:
      "Meet the SecureCodeReviews team behind our application security services and ShieldX platform.",
    images: ["/og-image.png"],
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
    description: "About SecureCodeReviews, the application security company behind ShieldX and a range of secure code review, penetration testing, DevSecOps, and cloud security services.",
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
