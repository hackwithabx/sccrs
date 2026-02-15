import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from "@/components/google-analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SecureCodeReviews — Application Security Platform | Code Review, Pen Testing, OWASP",
    template: "%s | SecureCodeReviews",
  },
  description:
    "Expert application security platform offering secure code reviews, penetration testing, OWASP Top 10 guides, free security tools, vulnerability analysis, cloud security, and educational resources for developers and enterprises.",
  keywords: [
    "application security",
    "secure code review",
    "penetration testing",
    "vulnerability assessment",
    "OWASP Top 10",
    "OWASP Top 10 AI",
    "secure coding",
    "appsec",
    "code review services",
    "web application security",
    "cloud security",
    "security tools",
    "SQL injection",
    "XSS prevention",
    "security consulting",
    "DevSecOps",
    "API security",
    "cybersecurity",
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
    title: "SecureCodeReviews — Application Security Platform",
    description:
      "Expert application security platform with free security tools, OWASP guides, vulnerability research, code review services, and cloud security resources.",
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
    title: "SecureCodeReviews — Application Security Platform",
    description:
      "Free security tools, OWASP Top 10 guides, vulnerability research, and expert code review services.",
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
      "Expert application security platform offering secure code reviews, penetration testing, OWASP guides, free security tools, and educational resources.",
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
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="msapplication-TileColor" content="#1e3a8a" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
        <GoogleAnalytics />
      </body>
    </html>
  );
}
