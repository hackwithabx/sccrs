import type { Metadata } from "next";

export default function TermsOfServicePage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">
          Last updated: March 19, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using SecureCodeReviews.com (&quot;the Service&quot;), operated by SecureCodeReviews (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our Service. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              SecureCodeReviews.com provides application security services, educational resources, security analysis tools, vulnerability research, security reports, OWASP guidelines, cloud security guidance, and related content. Our services include but are not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Secure code review and analysis services</li>
              <li>Penetration testing and vulnerability assessment</li>
              <li>Free online security tools (header analysis, hash generation, encoding/decoding, password strength checking, CSP generation, JWT decoding, SQL injection pattern testing, AI security auditing)</li>
              <li>ShieldX — a proprietary SaaS security scanning platform with tiered subscription plans (Free, Pro, Enterprise)</li>
              <li>Security report generation with downloadable PDF reports</li>
              <li>Educational content including blog posts, OWASP guides, and secure coding examples</li>
              <li>Cloud security assessment and guidance</li>
              <li>Security consulting and training services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Using a strong, unique password for your account</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              We reserve the right to suspend or terminate accounts that violate these Terms or that we believe pose a security risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use our security tools to attack, probe, or scan systems without proper authorization</li>
              <li>Attempt to gain unauthorized access to our systems, other users&apos; accounts, or any computer network</li>
              <li>Upload or transmit malware, viruses, or other malicious code</li>
              <li>Use the Service for any illegal activity, including unauthorized penetration testing</li>
              <li>Scrape, crawl, or use automated means to access the Service beyond normal usage patterns</li>
              <li>Reproduce, duplicate, copy, sell, or exploit any portion of the Service without express permission</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Attempt to reverse engineer any aspect of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Security Tools Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our free security tools (including but not limited to HTTP Header Analyzer, Hash Generator, Encoder/Decoder, Password Strength Checker, CSP Generator, JWT Decoder, SSL Certificate Checker, and DNS Security Analyzer) are provided for educational and legitimate security assessment purposes only. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>These tools should only be used on systems you own or have explicit authorization to test</li>
              <li>Tool outputs are informational and should not be the sole basis for security decisions</li>
              <li>We are not responsible for any actions taken based on tool outputs</li>
              <li>Generated reports are for reference purposes and do not constitute a professional security audit</li>
              <li>All analysis is performed client-side where possible; we do not store your analysis data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service and its original content, features, and functionality are owned by SecureCodeReviews and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. Our content, including blog posts, guides about OWASP topics, code examples, and security research, is provided for educational use. You may share links to our content but may not reproduce substantial portions without attribution and permission. OWASP&reg; is a registered trademark of the OWASP Foundation. Our educational content about OWASP topics is independently authored and is not official OWASP material. OWASP materials referenced herein are available under the Creative Commons Attribution-ShareAlike 4.0 International License.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. ShieldX Subscription Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ShieldX is a proprietary security scanning platform offered as a Software-as-a-Service (SaaS) product. By subscribing to a ShieldX plan, you agree to the following:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>License Grant:</strong> We grant you a limited, non-exclusive, non-transferable, revocable license to access and use ShieldX during your active subscription period, solely for your internal security assessment purposes.</li>
              <li><strong>Proprietary Rights:</strong> ShieldX, including all scanning engines, detection rules, scoring algorithms, user interfaces, documentation, and associated intellectual property, is the exclusive property of SecureCodeReviews. You may not copy, modify, distribute, sell, sublicense, reverse engineer, decompile, or disassemble any part of ShieldX.</li>
              <li><strong>Plan Limitations:</strong> Each subscription tier (Free, Pro, Enterprise) has specific scan limits, module access, and feature availability. Your usage must remain within the limits of your current plan.</li>
              <li><strong>API Keys:</strong> API keys issued for CI/CD integration are for your use only and must not be shared with or transferred to third parties. You are responsible for all activity under your API key.</li>
              <li><strong>Team Seats:</strong> Enterprise plan team seats are for named individuals within your organization. Each seat may only be used by one person.</li>
              <li><strong>Billing &amp; Renewal:</strong> Paid subscriptions are billed on a recurring monthly or annual basis through our payment provider (Razorpay). Subscriptions renew automatically unless canceled before the next billing cycle.</li>
              <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No prorated refunds are provided for partial billing periods.</li>
              <li><strong>Data Retention:</strong> Scan results and history are retained while your subscription is active. Upon cancellation, scan history may be deleted after 90 days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Third-Party Data Sources &amp; Attribution</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ShieldX integrates with third-party vulnerability databases and services to provide accurate scanning results. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>OSV.dev:</strong> Dependency vulnerability data is sourced from Google&apos;s Open Source Vulnerabilities database (OSV.dev). Only package names and version numbers are sent to OSV.dev — no source code or proprietary data is transmitted. OSV.dev data is provided under the CC-BY 4.0 license.</li>
              <li><strong>OWASP&reg;:</strong> Security checks reference OWASP guidelines and standards. OWASP&reg; is a registered trademark of the OWASP Foundation. Our implementations are independently developed and are not endorsed by or affiliated with the OWASP Foundation.</li>
              <li><strong>Payment Processing:</strong> Payments are processed by Razorpay, a PCI DSS Level 1 certified payment processor. We do not store credit card details on our servers.</li>
              <li><strong>No Warranty on Third-Party Data:</strong> We do not warrant the completeness, accuracy, or timeliness of third-party vulnerability data. Vulnerability databases may not contain all known vulnerabilities and may have delays in reporting new issues.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Professional Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              For paid professional services (code reviews, penetration testing, consulting, training), separate engagement agreements will be executed. These Terms serve as the baseline and any service-specific agreements will supplement these Terms. In the event of conflict, the service-specific agreement takes precedence.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by applicable law, SecureCodeReviews shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from: (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) security analysis results or recommendations provided through our tools or services; (iv) unauthorized access, use, or alteration of your transmissions or content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance. We do not warrant that the Service will be uninterrupted, timely, secure, or error-free, or that security analysis results will be complete or accurate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to defend, indemnify, and hold harmless SecureCodeReviews and its officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from: (a) your use of and access to the Service; (b) your violation of any term of these Terms; (c) your use of security tools on systems without proper authorization; (d) any third-party claims arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed and construed in accordance with applicable laws, without regard to conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
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
  title: "Terms of Service",
  description: "SecureCodeReviews.com terms of service — the legal agreement governing the use of our platform and services.",
  keywords: ["terms of service", "legal agreement", "user agreement", "SecureCodeReviews"],
  openGraph: {
    title: "Terms of Service | SecureCodeReviews",
    description: "The legal agreement governing use of the SecureCodeReviews platform and services.",
    url: "https://securecodereviews.com/terms-of-service",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | SecureCodeReviews",
    description: "The legal agreement governing use of the SecureCodeReviews platform and services.",
  },
  alternates: {
    canonical: "/terms-of-service",
  },
};
