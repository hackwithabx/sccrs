import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "Learn how SecureCodeReviews creates original AI security and cybersecurity content, handles updates, and approaches advertising and product recommendations.",
};

const sections = [
  {
    title: "Original content and expert review",
    content:
      "SecureCodeReviews publishes original content focused on AI security, LLM application security, cloud security, DevSecOps, secure coding, and broader application security topics. Articles are written or reviewed with technical accuracy in mind and are designed to provide practical value beyond headlines or product marketing.",
  },
  {
    title: "Product references and transparency",
    content:
      "This site references products built by SecureCodeReviews, including the AI Security Auditor and ShieldX. When product pages or articles mention these offerings, they do so as part of the company’s public software and service catalog. Educational content is written to remain useful on its own and is not intended to function as thin promotional copy.",
  },
  {
    title: "Advertising and monetization",
    content:
      "SecureCodeReviews may use advertising, analytics, and product calls to action on certain pages. Advertising does not change our editorial standards. We aim to keep navigation clear, identify sponsored placements where relevant, and avoid misleading layouts or content that exists only to serve ads.",
  },
  {
    title: "Updates and corrections",
    content:
      "Security content changes quickly. We update important pages when major guidance shifts, product capabilities change, or material inaccuracies are identified. If a correction is required, we prefer updating the page directly and reflecting the latest review date where appropriate.",
  },
  {
    title: "User trust and policy pages",
    content:
      "We maintain public policy and company pages so visitors can understand who operates the site, how contact requests are handled, and how data and subscriptions work. These pages are part of our commitment to creating a complete, trustworthy experience for both readers and enterprise buyers.",
  },
];

export default function EditorialPolicyPage() {
  return (
    <div className="site-shell mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="surface-card-strong rounded-[2rem] p-8">
        <div className="section-eyebrow">Editorial Policy</div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          How SecureCodeReviews approaches original content, product references, and user trust.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
          This page explains how we publish cybersecurity and AI security content, how we handle product mentions and monetization, and how we aim to keep the website useful, original, and easy to evaluate.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {sections.map((section) => (
          <Card key={section.title} className="surface-card rounded-[1.8rem] border-0">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{section.title}</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">{section.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="surface-card mt-8 rounded-[1.8rem] border-0 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Questions or corrections</h2>
        <p className="mt-4 text-base leading-8 text-slate-600">
          If you believe a page needs correction or clarification, contact us through the <Link href="/contact" className="font-medium text-blue-700 hover:text-blue-600">contact page</Link>. For privacy and legal details, see the <Link href="/privacy-policy" className="font-medium text-blue-700 hover:text-blue-600">privacy policy</Link> and <Link href="/terms-of-service" className="font-medium text-blue-700 hover:text-blue-600">terms of service</Link>.
        </p>
      </div>
    </div>
  );
}