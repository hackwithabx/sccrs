import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact SecureCodeReviews | AppSec Consulting, Code Review & ShieldX",
  description:
    "Contact SecureCodeReviews for application security consulting, secure code review, penetration testing, DevSecOps services, AI security audits, cloud security assessments, and ShieldX product inquiries.",
  keywords: [
    "SecureCodeReviews contact",
    "ShieldX contact",
    "contact security consultant",
    "application security consulting",
    "application security services contact",
    "hire penetration tester",
    "security assessment quote",
    "DevSecOps consulting contact",
    "secure code review service",
    "cybersecurity consultation",
  ],
  openGraph: {
    title: "Contact Us | SecureCodeReviews",
    description:
      "Reach out for code review, penetration testing, DevSecOps consulting, AI security audits, and ShieldX inquiries.",
    url: "https://securecodereviews.com/contact",
    type: "website",
    siteName: "SecureCodeReviews",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact SecureCodeReviews",
    description:
      "Get in touch for application security services, consulting, and ShieldX product questions.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact SecureCodeReviews",
    description: "Get in touch with SecureCodeReviews for application security consulting, product inquiries, and security assessments.",
    url: "https://securecodereviews.com/contact",
    mainEntity: {
      "@type": "Organization",
      name: "SecureCodeReviews",
      url: "https://securecodereviews.com",
      email: "support@securecodereviews.com",
      contactPoint: { "@type": "ContactPoint", contactType: "customer service", email: "support@securecodereviews.com" },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
