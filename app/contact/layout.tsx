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
  return children;
}
