"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import {
  Shield,
  Code,
  FileText,
  Wrench,
  BookOpen,
  BarChart3,
  ShieldAlert,
  Cloud,
  ArrowRight,
  LogOut,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Briefcase,
  Star,
  TrendingUp,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const quickLinks = [
  {
    icon: Code,
    title: "Secure Code Examples",
    description: "18 vulnerability patterns with secure fixes",
    href: "/secure-code",
    badge: "18 Examples",
    color: "text-emerald-500",
  },
  {
    icon: Wrench,
    title: "Free Security Tools",
    description: "CSP Generator, JWT Decoder, SQL Tester & more",
    href: "/tools",
    badge: "7 Tools",
    color: "text-blue-500",
  },
  {
    icon: ShieldAlert,
    title: "OWASP Top 10",
    description: "All versions: 2025, 2021, 2017, 2013 + AI",
    href: "/owasp",
    badge: "Complete Guide",
    color: "text-orange-500",
  },
  {
    icon: FileText,
    title: "Security Reports",
    description: "Generate branded PDF assessment reports",
    href: "/reports",
    badge: "PDF Export",
    color: "text-purple-500",
  },
  {
    icon: BarChart3,
    title: "Vulnerability Database",
    description: "Severity explorer with real-world examples",
    href: "/vulnerabilities",
    badge: "Interactive",
    color: "text-red-500",
  },
  {
    icon: Cloud,
    title: "Cloud Security",
    description: "AWS, Azure, GCP hardening guides",
    href: "/cloud-security",
    badge: "Multi-Cloud",
    color: "text-cyan-500",
  },
];

const recentActivity = [
  {
    icon: CheckCircle2,
    text: "OWASP Top 10 2025 guide published",
    time: "2 hours ago",
    color: "text-emerald-500",
  },
  {
    icon: AlertTriangle,
    text: "New secure code pattern: Prototype Pollution",
    time: "5 hours ago",
    color: "text-orange-500",
  },
  {
    icon: Zap,
    text: "CSP Generator tool updated with nonce support",
    time: "1 day ago",
    color: "text-blue-500",
  },
  {
    icon: FileText,
    text: "Blog: Major Cyberattacks 2024-2025 published",
    time: "2 days ago",
    color: "text-purple-500",
  },
  {
    icon: Shield,
    text: "Cloud Security guide: AWS IAM deep dive",
    time: "3 days ago",
    color: "text-cyan-500",
  },
];

const securityTips = [
  "Always use parameterized queries — SQL injection is still the #1 injection attack in 2025.",
  "Implement Content-Security-Policy headers to mitigate XSS attacks effectively.",
  "Use bcrypt or Argon2 for password hashing — never MD5 or SHA1.",
  "Rotate API keys and secrets every 90 days. Use a secrets manager.",
  "Enable MFA/2FA for all privileged accounts — it stops 99.9% of credential attacks.",
  "Review your dependencies weekly — supply chain attacks are on the rise.",
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const randomTip =
    securityTips[Math.floor(Math.random() * securityTips.length)];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Welcome back,{" "}
                    <span className="text-primary">
                      {session.user?.name || session.user?.email?.split("@")[0]}
                    </span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* Security Tip Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 bg-primary/5 border border-primary/20 rounded-xl p-5"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary mb-1">
                Security Tip of the Day
              </p>
              <p className="text-sm text-muted-foreground">{randomTip}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Code Patterns",
              value: "18",
              icon: Code,
              color: "text-emerald-500",
            },
            {
              label: "Free Tools",
              value: "7",
              icon: Wrench,
              color: "text-blue-500",
            },
            {
              label: "OWASP Guides",
              value: "5",
              icon: ShieldAlert,
              color: "text-orange-500",
            },
            {
              label: "Blog Posts",
              value: "9+",
              icon: BookOpen,
              color: "text-purple-500",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Access Grid */}
        <SectionHeading
          title="Quick Access"
          description="Jump into your most-used security resources and tools."
        />
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {quickLinks.map((link, i) => (
            <motion.div
              key={link.href}
              custom={i}
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Link href={link.href} className="group block">
                <Card className="h-full hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <link.icon className={`w-8 h-8 ${link.color}`} />
                      <Badge variant="secondary" className="text-xs">
                        {link.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {link.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {link.description}
                    </p>
                    <div className="flex items-center text-sm text-primary font-medium">
                      Explore
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Two Column: Activity + Services */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Platform Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <item.icon
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.color}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{item.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Professional Services CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Professional Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Need expert help? Our team offers comprehensive security
                  services tailored to your application.
                </p>
                {[
                  "Manual Secure Code Review",
                  "Penetration Testing",
                  "AI/LLM Security Audit",
                  "Cloud Security Assessment",
                  "DevSecOps Implementation",
                ].map((service) => (
                  <div key={service} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{service}</span>
                  </div>
                ))}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link href="/services">
                    <Button className="gap-2 w-full sm:w-auto">
                      <Briefcase className="w-4 h-4" />
                      View Services
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="gap-2 w-full sm:w-auto"
                    >
                      Contact Us
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Learning Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Recommended Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    step: "1",
                    title: "OWASP Top 10 2025",
                    desc: "Understand the latest web security risks",
                    href: "/owasp/top-10-2025",
                  },
                  {
                    step: "2",
                    title: "Secure Code Patterns",
                    desc: "Learn vulnerable vs. secure code",
                    href: "/secure-code",
                  },
                  {
                    step: "3",
                    title: "Use Security Tools",
                    desc: "Practice with CSP, JWT, SQL tools",
                    href: "/tools",
                  },
                  {
                    step: "4",
                    title: "Generate a Report",
                    desc: "Create a PDF security assessment",
                    href: "/reports",
                  },
                ].map((item) => (
                  <Link key={item.step} href={item.href} className="group">
                    <div className="border rounded-xl p-4 hover:border-primary/40 transition-colors h-full">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm mb-3">
                        {item.step}
                      </div>
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
