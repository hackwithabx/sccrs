import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-9959434931890692";

export const metadata: Metadata = {
  title: {
    default: "SecureCodeReviews — Application Security Services & ShieldX Free SAST Scanner",
    template: "%s | SecureCodeReviews",
  },
  description:
    "SecureCodeReviews provides application security services, secure code review, penetration testing, DevSecOps consulting, cloud security assessments, and ShieldX — a free SAST scanner and application security platform for modern engineering teams.",
  keywords: [
    "SecureCodeReviews",
    "Secure Code Reviews",
    "securecodereviews",
    "ShieldX",
    "SecureCodeReviews ShieldX",
    "application security",
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
  authors: [{ name: "SecureCodeReviews", url: "https://securecodereviews.com" }],
  creator: "SecureCodeReviews",
  publisher: "SecureCodeReviews",
  metadataBase: new URL("https://securecodereviews.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://securecodereviews.com",
    siteName: "SecureCodeReviews",
    title: "SecureCodeReviews — Application Security Services & ShieldX Free SAST Scanner",
    description:
      "Application security services and platform for secure code review, penetration testing, DevSecOps consulting, cloud security assessments, and ShieldX free SAST scanning.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SecureCodeReviews — Application Security Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SecureCodeReviews — AppSec Services & ShieldX Free SAST Scanner",
    description:
      "Application security services, expert code review, penetration testing, DevSecOps consulting, and ShieldX free SAST scanning.",
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
    url: "https://securecodereviews.com",
    logo: "https://securecodereviews.com/logo.png",
    description:
      "Expert application security platform featuring ShieldX — a free SAST scanner with 14 modules. Offering secure code reviews, penetration testing, OWASP guides, and DevSecOps tools.",
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
    url: "https://securecodereviews.com",
    description: "Application security services and platform featuring ShieldX free SAST scanner, secure code review, penetration testing, DevSecOps consulting, and cloud security guidance.",
    publisher: { "@type": "Organization", name: "SecureCodeReviews" },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://securecodereviews.com/blog?q={search_term_string}",
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
        url: "https://securecodereviews.com",
      },
      {
        "@type": "SiteNavigationElement",
        position: 2,
        name: "Services",
        url: "https://securecodereviews.com/services",
      },
      {
        "@type": "SiteNavigationElement",
        position: 3,
        name: "ShieldX",
        url: "https://securecodereviews.com/shieldx",
      },
      {
        "@type": "SiteNavigationElement",
        position: 4,
        name: "Blog",
        url: "https://securecodereviews.com/blog",
      },
      {
        "@type": "SiteNavigationElement",
        position: 5,
        name: "Cloud Security",
        url: "https://securecodereviews.com/cloud-security",
      },
      {
        "@type": "SiteNavigationElement",
        position: 6,
        name: "Contact",
        url: "https://securecodereviews.com/contact",
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
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="msapplication-TileColor" content="#1e3a8a" />
        {ADSENSE_CLIENT_ID ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        ) : null}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
            defaultTheme="dark"
            enableSystem
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
