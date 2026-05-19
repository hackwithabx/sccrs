import type { Metadata } from "next";
import { buildBlogIndexMeta } from "@/lib/blog-seo";

const blogIndexMeta = buildBlogIndexMeta();

export const metadata: Metadata = {
  title: {
    absolute: blogIndexMeta.title,
  },
  description: blogIndexMeta.description,
  keywords: blogIndexMeta.keywords,
  openGraph: {
    title: blogIndexMeta.title,
    description: blogIndexMeta.description,
    url: blogIndexMeta.url,
    type: "website",
    siteName: "SecureCodeReviews",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: blogIndexMeta.title,
    description: blogIndexMeta.description,
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Application Security Blog",
    description: blogIndexMeta.description,
    url: "https://securecodereviews.com/blog",
    isPartOf: { "@type": "WebSite", name: "SecureCodeReviews", url: "https://securecodereviews.com" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
