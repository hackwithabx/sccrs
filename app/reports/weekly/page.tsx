"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { weeklyReports, type WeeklyReport } from "@/lib/weekly-reports-data";
import {
  Shield, AlertTriangle, TrendingUp, ExternalLink, ChevronDown,
  ChevronUp, Calendar, BarChart3, Bug, Flame, CheckCircle2,
  FileText, Globe, Newspaper, Eye, ShieldAlert, BookOpen,
} from "lucide-react";

const severityColor: Record<string, string> = {
  Critical: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  High: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  Medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  Low: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Info: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ReportCard({ report, defaultExpanded }: { report: WeeklyReport; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/50 overflow-hidden">
        {/* Header */}
        <CardHeader
          className="cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  W{report.weekNumber} {report.year}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(report.dateRange.start)} — {formatDate(report.dateRange.end)}
                </span>
              </div>
              <CardTitle className="text-xl leading-tight">{report.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">{report.summary}</p>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0">
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>

          {/* Quick stats bar */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-1 text-xs">
              <Bug className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold">{report.stats.totalCVEs}</span>
              <span className="text-muted-foreground">CVEs</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <span className="font-semibold text-red-500">{report.stats.criticalCVEs}</span>
              <span className="text-muted-foreground">Critical</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="font-semibold text-orange-500">{report.stats.highCVEs}</span>
              <span className="text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Shield className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-semibold">{report.majorBreaches.length}</span>
              <span className="text-muted-foreground">Breaches</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-violet-500" />
              <span className="font-semibold">{report.trendingThreats.length}</span>
              <span className="text-muted-foreground">Threats</span>
            </div>
          </div>
        </CardHeader>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0 space-y-8">
                {/* Key Highlights */}
                <section>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" /> Key Vulnerabilities
                  </h3>
                  <div className="space-y-3">
                    {report.highlights.map((h) => (
                      <div key={h.title} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                          <h4 className="font-semibold">{h.title}</h4>
                          <div className="flex items-center gap-2">
                            {h.cveId && (
                              <Badge variant="outline" className="text-xs">{h.cveId}</Badge>
                            )}
                            <Badge className={`text-xs ${severityColor[h.severity]}`}>{h.severity}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{h.description}</p>
                        {h.affectedProducts && h.affectedProducts.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-xs text-muted-foreground">Affected:</span>
                            {h.affectedProducts.map((p) => (
                              <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                            ))}
                          </div>
                        )}
                        <a
                          href={h.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          {h.source} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </section>

                {/* CVE Stats */}
                <section>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" /> CVE Breakdown
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: "Critical", value: report.stats.criticalCVEs, color: "text-red-500 bg-red-500/10" },
                      { label: "High", value: report.stats.highCVEs, color: "text-orange-500 bg-orange-500/10" },
                      { label: "Medium", value: report.stats.mediumCVEs, color: "text-yellow-500 bg-yellow-500/10" },
                      { label: "Low", value: report.stats.lowCVEs, color: "text-blue-500 bg-blue-500/10" },
                      { label: "Total", value: report.stats.totalCVEs, color: "text-foreground bg-muted" },
                    ].map((s) => (
                      <div key={s.label} className={`rounded-lg p-3 text-center ${s.color}`}>
                        <div className="text-2xl font-bold">{s.value}</div>
                        <div className="text-xs font-medium">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Top Vendors */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5" /> Top Vendors
                      </h4>
                      <div className="space-y-2">
                        {report.stats.topVendors.map((v) => (
                          <div key={v.vendor} className="flex items-center justify-between text-sm">
                            <span>{v.vendor}</span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 rounded-full bg-primary/20 w-24">
                                <div
                                  className="h-full rounded-full bg-primary"
                                  style={{ width: `${(v.count / report.stats.topVendors[0].count) * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">{v.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5" /> Top CWEs
                      </h4>
                      <div className="space-y-2">
                        {report.stats.topCWEs.map((c) => (
                          <div key={c.cweId} className="flex items-center justify-between text-sm">
                            <span className="truncate max-w-[200px]">{c.cweId}: {c.name}</span>
                            <span className="text-xs text-muted-foreground">{c.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Major Breaches */}
                {report.majorBreaches.length > 0 && (
                  <section>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Flame className="h-5 w-5 text-orange-500" /> Major Breaches
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.majorBreaches.map((b) => (
                        <div key={b.organization} className="rounded-lg border border-orange-500/10 bg-orange-500/5 p-4">
                          <h4 className="font-semibold">{b.organization}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{b.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs">
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                              {b.recordsAffected} records
                            </Badge>
                            <span className="text-muted-foreground">{b.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Trending Threats */}
                {report.trendingThreats.length > 0 && (
                  <section>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-violet-500" /> Trending Threats
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {report.trendingThreats.map((t) => (
                        <div key={t.name} className="rounded-lg border p-4">
                          <Badge variant="secondary" className="text-xs mb-2">{t.category}</Badge>
                          <h4 className="font-semibold text-sm">{t.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Recommendations */}
                <section>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Recommendations
                  </h3>
                  <div className="space-y-2">
                    {report.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </div>
                        <span className="text-muted-foreground">{rec}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Sources */}
                <section>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" /> Sources
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {report.sources.map((s) => (
                      <a
                        key={s.name}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {s.name} <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </section>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default function WeeklyReportsPage() {
  const sorted = [...weeklyReports].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.weekNumber - a.weekNumber;
  });

  // Aggregate stats
  const totalCVEs = sorted.reduce((sum, r) => sum + r.stats.totalCVEs, 0);
  const totalCritical = sorted.reduce((sum, r) => sum + r.stats.criticalCVEs, 0);
  const totalBreaches = sorted.reduce((sum, r) => sum + r.majorBreaches.length, 0);

  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 gap-1.5 bg-primary/10 text-primary border-primary/20 px-3 py-1">
            <Newspaper className="h-3.5 w-3.5" /> Threat Intelligence
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Weekly Security{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Reports
            </span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Curated intelligence from NVD, GitHub Advisories, CISA, and top security researchers. Updated every Monday.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Reports", value: sorted.length, icon: FileText, color: "text-primary" },
            { label: "Total CVEs", value: totalCVEs.toLocaleString(), icon: Bug, color: "text-red-500" },
            { label: "Critical CVEs", value: totalCritical, icon: AlertTriangle, color: "text-orange-500" },
            { label: "Breaches Tracked", value: totalBreaches, icon: Flame, color: "text-amber-500" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reports list */}
        <div className="space-y-6">
          {sorted.map((report, index) => (
            <ReportCard key={report.id} report={report} defaultExpanded={index === 0} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Card className="border-0 bg-gradient-to-r from-primary/5 to-blue-500/5">
            <CardContent className="py-10">
              <h2 className="text-xl font-bold mb-2">Stay Ahead of Threats</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Protect your applications with ShieldX — automated security scanning for startups.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/shieldx">
                  <Button className="gap-2"><Shield className="h-4 w-4" /> Try ShieldX Free</Button>
                </Link>
                <Link href="/blog">
                  <Button variant="outline" className="gap-2"><BookOpen className="h-4 w-4" /> Read Blog</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
