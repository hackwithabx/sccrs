import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

const siteSans = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteMono = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-9959434931890692";

export const metadata: Metadata = {
  title: {
    default: "SecureCodeReviews | AI Security, LLM Security Audits & ShieldX",
    template: "%s | SecureCodeReviews",
  },
  description:
    "Secure AI systems before attackers find them. Audit LLM apps, agents, cloud infrastructure, and modern software delivery with the AI Security Auditor, ShieldX, and expert security reviews.",
  keywords: [
    "SecureCodeReviews",
    "Secure Code Reviews",
    "securecodereviews",
    "ShieldX",
    "AI security platform",
    "AI compliance",
    "SecureCodeReviews ShieldX",
    "application security",
    "AI security auditor",
    "LLM security",
    "prompt injection",
    "agent security",
    "application security platform",
    "application security services",
    "secure code review",
    "secure code review service",
    "penetration testing",
    "penetration testing service",
    "vulnerability assessment",
    "OWASP Top 10",
    "OWASP Top 10 AI",
    "OWASP Top 10 2025",
    "secure coding",
    "appsec",
    "code review services",
    "web application security",
    "cloud security",
    "cloud security assessment",
    "security tools",
    "SQL injection",
    "XSS prevention",
    "security consulting",
    "DevSecOps",
    "DevSecOps consulting",
    "API security",
    "cybersecurity",
    "free SAST scanner",
    "source code security scanner",
    "static code analysis",
    "secrets scanner",
    "dependency scanner",
    "CI/CD security",
    "container security",
    "infrastructure as code security",
  ],
  authors: [{ name: "SecureCodeReviews", url: "https://www.securecodereviews.com" }],
  creator: "SecureCodeReviews",
  publisher: "SecureCodeReviews",
  metadataBase: new URL("https://www.securecodereviews.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.securecodereviews.com",
    siteName: "SecureCodeReviews",
    title: "SecureCodeReviews | AI Security, LLM Security Audits & ShieldX",
    description:
      "Secure AI systems before attackers find them with LLM security audits, cloud security reviews, DevSecOps coverage, and premium AppSec workflows.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SecureCodeReviews - AI Security Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SecureCodeReviews | AI Security, LLM Security Audits & ShieldX",
    description:
      "Protect LLM applications from prompt injection, data leakage, insecure tool use, and cloud security gaps.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SecureCodeReviews",
    url: "https://www.securecodereviews.com",
    logo: "https://www.securecodereviews.com/logo.png",
    description:
      "AI security company behind the AI Security Auditor and ShieldX, offering prompt injection testing, LLM security audits, cloud security reviews, and broader AppSec guidance.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@securecodereviews.com",
      contactType: "customer service",
    },
    sameAs: [
      "https://twitter.com/securecodereviews",
      "https://linkedin.com/company/securecodereviews",
      "https://github.com/securecodereviews",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SecureCodeReviews",
    url: "https://www.securecodereviews.com",
    description: "AI security platform featuring the AI Security Auditor, ShieldX, LLM security reviews, cloud security assessments, and broader AppSec guidance.",
    publisher: { "@type": "Organization", name: "SecureCodeReviews" },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.securecodereviews.com/blog?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const navigationJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SecureCodeReviews Primary Navigation",
    itemListElement: [
      {
        "@type": "SiteNavigationElement",
        position: 1,
        name: "Home",
        url: "https://www.securecodereviews.com",
      },
      {
        "@type": "SiteNavigationElement",
        position: 2,
        name: "Services",
        url: "https://www.securecodereviews.com/services",
      },
      {
        "@type": "SiteNavigationElement",
        position: 3,
        name: "AI Security Auditor",
        url: "https://www.securecodereviews.com/products/ai-security-auditor",
      },
      {
        "@type": "SiteNavigationElement",
        position: 4,
        name: "ShieldX",
        url: "https://www.securecodereviews.com/products/shieldx",
      },
      {
        "@type": "SiteNavigationElement",
        position: 5,
        name: "Pricing",
        url: "https://www.securecodereviews.com/pricing",
      },
      {
        "@type": "SiteNavigationElement",
        position: 6,
        name: "Learn",
        url: "https://www.securecodereviews.com/learn",
      },
      {
        "@type": "SiteNavigationElement",
        position: 7,
        name: "Blog",
        url: "https://www.securecodereviews.com/blog",
      },
      {
        "@type": "SiteNavigationElement",
        position: 8,
        name: "Contact",
        url: "https://www.securecodereviews.com/contact",
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon - Multiple formats for browser compatibility */}
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="alternate" type="application/rss+xml" title="SecureCodeReviews Blog" href="/feed.xml" />
        <meta name="theme-color" content="#f8fbff" />
        <meta name="msapplication-TileColor" content="#f8fbff" />
        {ADSENSE_CLIENT_ID ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body
        className={`${siteSans.variable} ${siteMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationJsonLd) }}
        />
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </AuthProvider>
        <CookieConsent />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
