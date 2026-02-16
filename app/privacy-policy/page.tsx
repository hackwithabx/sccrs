import type { Metadata } from "next";

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">
          Last updated: February 12, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              SecureCodeReviews.com (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at{" "}
              <a href="https://securecodereviews.com" className="text-primary hover:underline">
                https://securecodereviews.com
              </a>{" "}
              and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-medium mb-2 mt-6">2.1 Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Register for an account on our platform</li>
              <li>Submit a contact form or support request</li>
              <li>Subscribe to our newsletter or blog updates</li>
              <li>Use our security tools or generate reports</li>
              <li>Request a consultation or service engagement</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              This information may include: name, email address, company name, job title, phone number, and any other information you choose to provide.
            </p>

            <h3 className="text-lg font-medium mb-2 mt-6">2.2 Automatically Collected Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you access our website, we automatically collect certain information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>IP address and approximate geolocation</li>
              <li>Browser type, version, and language preferences</li>
              <li>Operating system and device information</li>
              <li>Pages visited, time spent, and navigation paths</li>
              <li>Referring URLs and exit pages</li>
              <li>Date and time of access</li>
            </ul>

            <h3 className="text-lg font-medium mb-2 mt-6">2.3 Cookies and Tracking Technologies</h3>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies, web beacons, and similar technologies to enhance your experience, analyze usage patterns, and deliver relevant content. You can control cookie preferences through your browser settings. We use Google Analytics for website analytics — see Google&apos;s privacy policy for details on how they process data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To provide, operate, and maintain our website and services</li>
              <li>To process and respond to your inquiries, support requests, and service engagements</li>
              <li>To send you security advisories, blog updates, and educational content (with your consent)</li>
              <li>To improve our website, services, and user experience</li>
              <li>To detect, prevent, and address technical issues and security threats</li>
              <li>To comply with legal obligations and enforce our terms of service</li>
              <li>To analyze usage patterns and optimize our content and tools</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist in operating our website and services (e.g., hosting, email delivery, analytics), subject to confidentiality obligations</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law, court order, or governmental regulation</li>
              <li><strong>Protection of Rights:</strong> We may share information to protect our rights, privacy, safety, or property, or that of our users or the public</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption in transit (TLS/HTTPS), secure password hashing (bcrypt), access controls, regular security assessments, and secure hosting infrastructure. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When your information is no longer needed, we will securely delete or anonymize it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your personal data (subject to legal obligations)</li>
              <li><strong>Restriction:</strong> Request restriction of processing of your personal data</li>
              <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
              <li><strong>Objection:</strong> Object to processing of your personal data for certain purposes</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:support@securecodereviews.com" className="text-primary hover:underline">
                support@securecodereviews.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. GDPR Compliance (European Users)</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are a resident of the European Economic Area (EEA), we process your personal data under lawful bases including consent, contractual necessity, legitimate interests, and legal obligations. You have the right to lodge a complaint with your local data protection authority if you believe your rights have been violated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. CCPA Compliance (California Residents)</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are a California resident, you have the right to know what personal information we collect, request deletion of your data, opt out of the sale of your data (we do not sell data), and not be discriminated against for exercising your privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Third-Party Links</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our website may contain links to third-party websites and services. We are not responsible for the privacy practices or content of those third-party sites. We encourage you to read the privacy policies of any website you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 bg-card border border-border rounded-xl p-6">
              <p className="font-semibold">SecureCodeReviews.com</p>
              <p className="text-muted-foreground">
                Email:{" "}
                <a href="mailto:support@securecodereviews.com" className="text-primary hover:underline">
                  support@securecodereviews.com
                </a>
              </p>
              <p className="text-muted-foreground">
                Website:{" "}
                <a href="https://securecodereviews.com" className="text-primary hover:underline">
                  https://securecodereviews.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "SecureCodeReviews.com privacy policy — how we collect, use, and protect your personal information.",
  keywords: ["privacy policy", "data protection", "personal information", "SecureCodeReviews"],
  openGraph: {
    title: "Privacy Policy | SecureCodeReviews",
    description: "How SecureCodeReviews collects, uses, and protects your personal information.",
    url: "https://securecodereviews.com/privacy-policy",
  },
  alternates: {
    canonical: "/privacy-policy",
  },
};
