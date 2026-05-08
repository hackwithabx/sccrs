"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/section-heading";
import {
  Shield,
  Award,
  Users,
  Target,
  Code,
  BookOpen,
  Globe,
  CheckCircle2,
  Briefcase,
  Lock,
  Eye,
  Zap,
  ArrowRight,
  TrendingUp,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const stats = [
  { value: "10+", label: "Years of Expertise", icon: Award },
  { value: "500+", label: "Security Assessments", icon: Target },
];

const values = [
  {
    icon: Shield,
    title: "Security First",
    description:
      "Every recommendation we make is rooted in real-world attack scenarios. We think like adversaries to build defenses that actually work.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Sharing",
    description:
      "We believe security knowledge should be accessible. Our free tools, blogs, and OWASP guides reflect our commitment to elevating the global security posture.",
  },
  {
    icon: Code,
    title: "Developer-Centric",
    description:
      "We bridge the gap between security and development. Our secure code examples and reviews integrate seamlessly into existing developer workflows.",
  },
  {
    icon: Heart,
    title: "Transparency & Trust",
    description:
      "We provide honest, actionable findings — no inflated risk scores, no unnecessary alarm. Our reports are clear, prioritized, and business-aware.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Improvement",
    description:
      "The threat landscape evolves daily. We stay ahead through continuous research and hands-on testing of emerging attack techniques.",
  },
  {
    icon: Globe,
    title: "Community Driven",
    description:
      "We actively contribute to open-source security projects, OWASP chapters, and industry conferences. Security improves when the community grows stronger.",
  },
];

const expertise = [
  "Secure Code Review (Manual & SAST-Assisted)",
  "Web & Mobile Application Penetration Testing",
  "API Security Assessment (REST, GraphQL, gRPC)",
  "Cloud Security Architecture (AWS, Azure, GCP)",
  "DevSecOps Pipeline Integration",
  "OWASP Top 10 & SANS CWE Top 25 Compliance",
  "Threat Modeling & Security Architecture Review",
  "AI/LLM Application Security Audits",
  "Bug Bounty Program Management & Triage",
  "Incident Response & Forensic Analysis",
  "Regulatory Compliance (PCI DSS, SOC 2, HIPAA, ISO 27001)",
  "Enterprise Security Training & Awareness",
];


const teamMembers = [
  {
    name: "Security Research Team",
    role: "Vulnerability Research & CVE Discovery",
    description:
      "Dedicated researchers who discover zero-day vulnerabilities, analyze emerging threats, and publish security advisories that protect the global developer community.",
    yearsExp: "12+",
  },
  {
    name: "Application Security Engineers",
    role: "Code Review & Penetration Testing",
    description:
      "Hands-on engineers who have reviewed millions of lines of code across every major framework. They find what automated tools miss — logic flaws, race conditions, and business-specific vulnerabilities.",
    yearsExp: "10+",
  },
  {
    name: "Cloud & Infrastructure Team",
    role: "Cloud Security & DevSecOps",
    description:
      "Multi-cloud experts who architect secure environments across AWS, Azure, and GCP. They design and implement CI/CD security pipelines that shift security left without slowing delivery.",
    yearsExp: "8+",
  },
  {
    name: "Content & Training Team",
    role: "Security Education & Documentation",
    description:
      "Technical writers and trainers who translate complex security concepts into actionable guidance. They create the blogs, OWASP guides, and secure code examples that make our platform a go-to resource.",
    yearsExp: "10+",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              About SecureCodeReviews
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              A Team of{" "}
              <span className="text-primary">Security Veterans</span>{" "}
              Protecting Your Code
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              With over <span className="text-primary font-semibold">10 years of combined expertise</span> in
              application security, our team has secured hundreds of applications for
              startups, enterprises, and Fortune 500 companies across every major industry.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              badge="Our Story"
              title="Why SecureCodeReviews Exists"
              description="Born from a frustration with the gap between security findings and developer action."
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 space-y-6 text-muted-foreground leading-relaxed"
            >
              <p>
                SecureCodeReviews was founded by application security professionals who spent
                years watching the same cycle repeat: security teams find vulnerabilities,
                write lengthy reports, and hand them off — only to see the same issues
                reappear months later. The problem was never a lack of findings. It was a lack
                of developer-friendly guidance.
              </p>
              <p>
                We built SecureCodeReviews to change that. Our platform combines{" "}
                <span className="text-foreground font-medium">
                  expert manual code review
                </span>{" "}
                with{" "}
                <span className="text-foreground font-medium">
                  actionable, copy-paste secure code patterns
                </span>
                ,{" "}
                <span className="text-foreground font-medium">
                  free security tools
                </span>
                , and{" "}
                <span className="text-foreground font-medium">
                  comprehensive OWASP guides
                </span>{" "}
                — all designed for developers, not just security teams.
              </p>
              <p>
                Today, we serve hundreds of organizations, from seed-stage startups to global
                enterprises. Every member of our team brings real-world offensive security
                experience — bug bounty hunters, penetration testers, red teamers, and
                security architects who have operated in the trenches, not just read about
                them.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <SectionHeading
            badge="Our Team"
            title="Meet the Experts"
            description="Seasoned professionals with decade-long track records in offensive and defensive security."
          />
          <div className="mt-12 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                custom={i}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-card border border-border rounded-2xl p-8 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    <p className="text-sm text-primary">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {member.description}
                </p>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                  <Award className="w-3.5 h-3.5" />
                  {member.yearsExp} years experience
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <SectionHeading
              badge="Expertise"
              title="What We Do Best"
              description="Comprehensive application security services backed by deep domain expertise."
            />
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {expertise.map((item, i) => (
                <motion.div
                  key={item}
                  custom={i}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-start gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            badge="Our Values"
            title="What Drives Us"
            description="The principles that guide every code review, assessment, and recommendation."
          />
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                custom={i}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              badge="Why Us"
              title="Why Choose SecureCodeReviews"
              description="What sets us apart from automated scanners and generic security firms."
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 space-y-6"
            >
              {[
                {
                  icon: Eye,
                  title: "Manual + Automated Analysis",
                  desc: "Automated tools find <30% of real vulnerabilities. Our experts manually review business logic, authentication flows, and authorization patterns that scanners simply cannot understand.",
                },
                {
                  icon: Lock,
                  title: "Attacker-Mindset Reviews",
                  desc: "Every reviewer has offensive security experience (pentesting, bug bounties, red teaming). We don't just check boxes — we think like attackers to find what matters.",
                },
                {
                  icon: Code,
                  title: "Developer-Ready Remediation",
                  desc: "No vague descriptions. Every finding includes exact line references, working secure code fixes, and clear explanations tailored to the project's stack.",
                },
                {
                  icon: Zap,
                  title: "Fast Turnaround",
                  desc: "Most assessments completed in 5-10 business days. We prioritize critical findings for immediate developer action while the full report is prepared.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  custom={i}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex gap-4 bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Secure Your Application?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get a comprehensive security assessment from our expert team. Start with a free
              consultation to understand your security posture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="gap-2">
                  Get a Free Consultation
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="gap-2">
                  <Briefcase className="w-4 h-4" />
                  View Our Services
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
