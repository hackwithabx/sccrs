"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import {
  Shield,
  Code,
  BarChart3,
  Wrench,
  FileText,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Lock,
  Eye,
  Zap,
  Users,
  Cloud,
  Brain,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";

const features = [
  {
    icon: BookOpen,
    title: "Security Blog",
    description: "Stay updated with the latest AppSec trends, OWASP guidelines, and security best practices.",
    href: "/blog",
  },
  {
    icon: Code,
    title: "Secure Code Examples",
    description: "Compare vulnerable vs. secure code patterns across multiple languages and frameworks.",
    href: "/secure-code",
  },
  {
    icon: BarChart3,
    title: "Vulnerability Visualization",
    description: "Interactive dashboards showing real-time vulnerability trends and severity distributions.",
    href: "/vulnerabilities",
  },
  {
    icon: Wrench,
    title: "Free Security Tools",
    description: "Header analyzers, CSP generators, JWT decoders, hash tools, and more — all free.",
    href: "/tools",
  },
  {
    icon: FileText,
    title: "Security Reports",
    description: "Generate comprehensive security assessment reports with PDF download and branding.",
    href: "/reports",
  },
  {
    icon: Shield,
    title: "Expert Services",
    description: "Professional code reviews, penetration testing, and security consulting from experts.",
    href: "/services",
  },
  {
    icon: Cloud,
    title: "Cloud Security",
    description: "In-depth guides for securing AWS, Azure, and GCP infrastructure.",
    href: "/cloud-security",
  },
  {
    icon: Brain,
    title: "AI/LLM Security",
    description: "OWASP Top 10 for AI, prompt injection defense, and LLM threat analysis.",
    href: "/owasp/top-10-ai",
  },
];

// Chart data
const vulnerabilityTrends = [
  { year: "2019", critical: 320, high: 580, medium: 1200, low: 2100 },
  { year: "2020", critical: 410, high: 720, medium: 1450, low: 2400 },
  { year: "2021", critical: 530, high: 890, medium: 1700, low: 2800 },
  { year: "2022", critical: 620, high: 1050, medium: 2000, low: 3200 },
  { year: "2023", critical: 780, high: 1300, medium: 2400, low: 3700 },
  { year: "2024", critical: 950, high: 1580, medium: 2900, low: 4200 },
];

const attackVectors = [
  { name: "Injection", value: 28, color: "#10b981" },
  { name: "Broken Auth", value: 22, color: "#3b82f6" },
  { name: "Misconfiguration", value: 18, color: "#f59e0b" },
  { name: "XSS", value: 14, color: "#8b5cf6" },
  { name: "SSRF", value: 10, color: "#ec4899" },
  { name: "Other", value: 8, color: "#6b7280" },
];

const breachCosts = [
  { industry: "Healthcare", cost: 9.77 },
  { industry: "Financial", cost: 6.08 },
  { industry: "Technology", cost: 5.45 },
  { industry: "Energy", cost: 5.29 },
  { industry: "Pharma", cost: 4.97 },
  { industry: "Average", cost: 4.88 },
];

const stats = [
  { value: "10K+", label: "Vulnerabilities Analyzed" },
  { value: "500+", label: "Code Reviews Completed" },
  { value: "50+", label: "Security Tools" },
  { value: "99.9%", label: "Client Satisfaction" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Lock className="h-4 w-4" />
              Application Security Platform
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Secure Your Code.
              <br />
              <span className="text-primary">Protect Your Users.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              The modern AppSec platform for developers. Expert code reviews, vulnerability
              analysis, free security tools, and comprehensive educational resources — all in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tools">
                <Button size="lg" className="gap-2 text-base px-8">
                  <Wrench className="h-5 w-5" />
                  Try Free Tools
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                  Explore Services
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Features"
            title="Everything You Need for Application Security"
            description="A comprehensive suite of tools, resources, and services to help you build and maintain secure applications."
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Link href={feature.href}>
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading
                badge="Why SCR"
                title="Security-First Development Made Simple"
                description="We bridge the gap between development speed and application security."
                align="left"
              />

              <div className="mt-8 space-y-4">
                {[
                  { icon: Eye, text: "Expert-curated vulnerability database with real-world examples" },
                  { icon: Zap, text: "Instant security analysis with our free online tools" },
                  { icon: CheckCircle2, text: "Battle-tested secure code patterns for modern frameworks" },
                  { icon: Users, text: "Community-driven security knowledge base" },
                ].map((item) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/about">
                  <Button variant="outline" className="gap-2">
                    Learn More About Us
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-mono">
                      <span className="text-muted-foreground">$</span>
                      <span className="text-primary">scr analyze</span>
                      <span>--deep-scan</span>
                    </div>
                    <div className="rounded-lg bg-muted p-4 font-mono text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Scanning 247 files...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Analyzing dependencies...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Checking for known CVEs...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-5" />
                        <span>Found 3 critical vulnerabilities</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-4" />
                        <span>Found 7 warnings</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-primary font-semibold">
                        <Shield className="h-4 w-4" />
                        <span>Report generated successfully</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Insights Charts */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Insights"
            title="Cybersecurity By The Numbers"
            description="Interactive data visualizations showing the evolving threat landscape and industry trends."
          />

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vulnerability Trends Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    CVE Vulnerability Trends (2019–2024)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={vulnerabilityTrends}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="year" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="critical" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Critical" />
                      <Area type="monotone" dataKey="high" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} name="High" />
                      <Area type="monotone" dataKey="medium" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} name="Medium" />
                      <Area type="monotone" dataKey="low" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Low" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Attack Vectors Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Top Attack Vectors (2024)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={attackVectors}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name} ${value}%`}
                      >
                        {attackVectors.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        formatter={(value) => `${value}%`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Breach Cost by Industry */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Average Data Breach Cost by Industry (2024, $M)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={breachCosts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis type="number" fontSize={12} tickFormatter={(v) => `$${v}M`} />
                      <YAxis type="category" dataKey="industry" fontSize={12} width={90} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        formatter={(value) => `$${value}M`}
                      />
                      <Bar dataKey="cost" fill="#10b981" radius={[0, 4, 4, 0]} name="Avg Cost ($M)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/vulnerabilities">
              <Button variant="outline" className="gap-2">
                Explore Full Vulnerability Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Secure Your Applications?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start with our free tools or get a professional security assessment from our team.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2 text-base px-8">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
