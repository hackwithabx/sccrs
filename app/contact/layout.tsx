import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Application Security Consulting | SecureCodeReviews",
  description:
    "Get in touch with SecureCodeReviews for application security services, secure code review, penetration testing, DevSecOps consulting, and security assessments. Free initial consultation available.",
  keywords: [
    "contact security consultant",
    "application security consulting",
    "hire penetration tester",
    "security assessment quote",
    "DevSecOps consulting contact",
    "secure code review service",
    "cybersecurity consultation",
  ],
  openGraph: {
    title: "Contact Us | SecureCodeReviews",
    description:
      "Reach out for application security services — code review, pen testing, DevSecOps consulting, and more.",
    url: "https://securecodereviews.com/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact SecureCodeReviews",
    description:
      "Get in touch for application security services and consulting.",
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
    description: "Get in touch with SecureCodeReviews for application security services, consulting, and assessments.",
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
