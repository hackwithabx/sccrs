"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Clock,
  BarChart3,
} from "lucide-react";
import { generateSecurityReportPDF } from "@/lib/pdf-generator";

interface ReportItem {
  category: string;
  status: "pass" | "warning" | "fail";
  finding: string;
  recommendation: string;
  severity?: "Critical" | "High" | "Medium" | "Low" | "Info";
}

export default function ReportsPage() {
  const [appName, setAppName] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const reportItems: ReportItem[] = [
    {
      category: "Transport Security",
      status: "pass",
      severity: "Info",
      finding: "HTTPS is properly configured with TLS 1.3 and HSTS enabled",
      recommendation: "Continue monitoring certificate expiration dates and ensure HSTS preload list inclusion",
    },
    {
      category: "Security Headers",
      status: "warning",
      severity: "Medium",
      finding: "Content-Security-Policy is present but uses 'unsafe-inline' and 'unsafe-eval' directives",
      recommendation: "Implement nonce-based CSP with 'strict-dynamic' to prevent XSS attacks. Remove unsafe-inline and unsafe-eval.",
    },
    {
      category: "Authentication",
      status: "pass",
      severity: "Info",
      finding: "Authentication mechanism uses bcrypt password hashing with proper salt rounds",
      recommendation: "Consider enforcing MFA for admin accounts and implementing account lockout after failed attempts",
    },
    {
      category: "Session Mgmt",
      status: "warning",
      severity: "Medium",
      finding: "JWT session tokens have a 24-hour expiry window which may be excessive",
      recommendation: "Reduce session timeout to 4 hours for standard users and 30 minutes for admin operations",
    },
    {
      category: "Input Validation",
      status: "fail",
      severity: "High",
      finding: "Several API endpoints lack comprehensive input sanitization — risk of SQL/NoSQL injection",
      recommendation: "Implement server-side validation using Zod schema library. Sanitize all user inputs before database queries.",
    },
    {
      category: "Error Handling",
      status: "warning",
      severity: "Medium",
      finding: "Some API error responses include internal error messages that could aid attackers",
      recommendation: "Implement a global error handler that returns generic messages to clients while logging details server-side",
    },
    {
      category: "Dependencies",
      status: "fail",
      severity: "Critical",
      finding: "3 npm dependencies have known CVEs with CVSS scores above 7.0",
      recommendation: "Run npm audit fix immediately. Update vulnerable packages and implement automated dependency scanning in CI/CD.",
    },
    {
      category: "Access Control",
      status: "pass",
      severity: "Info",
      finding: "Role-based access control is properly implemented with middleware protection",
      recommendation: "Add audit logging for privilege escalation attempts and implement principle of least privilege",
    },
    {
      category: "Data Protection",
      status: "pass",
      severity: "Low",
      finding: "Sensitive data is encrypted at rest via MongoDB Atlas encryption and in transit via TLS",
      recommendation: "Implement field-level encryption for PII data and ensure encryption keys are rotated regularly",
    },
    {
      category: "API Security",
      status: "warning",
      severity: "Medium",
      finding: "Rate limiting is partially configured but not enforced on all endpoints",
      recommendation: "Implement rate limiting on all API endpoints: 5 req/min for auth, 20 req/min for contact forms, 100 req/min for reads",
    },
    {
      category: "CORS Policy",
      status: "pass",
      severity: "Info",
      finding: "CORS headers are properly configured with restrictive origin policy",
      recommendation: "Regularly audit allowed origins and ensure no wildcard (*) patterns in production",
    },
    {
      category: "Cookie Security",
      status: "pass",
      severity: "Low",
      finding: "Authentication cookies use HttpOnly, Secure, and SameSite=Strict attributes",
      recommendation: "Consider implementing cookie prefixes (__Host- or __Secure-) for additional protection",
    },
  ];

  const generateReport = () => {
    setLoading(true);
    setTimeout(() => {
      setGenerated(true);
      setLoading(false);
    }, 2000);
  };

  const passCount = reportItems.filter((r) => r.status === "pass").length;
  const warnCount = reportItems.filter((r) => r.status === "warning").length;
  const failCount = reportItems.filter((r) => r.status === "fail").length;
  const overallScore = Math.round(
    ((passCount * 10 + warnCount * 5) / (reportItems.length * 10)) * 100
  );

  const statusIcon = (status: string) => {
    if (status === "pass") return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
    if (status === "warning")
      return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
  };

  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Reports"
          title="Security Assessment Reports"
          description="Generate comprehensive security assessment reports for your applications. Get actionable insights and remediation guidance."
        />

        {!generated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Generate Security Report
                </CardTitle>
                <CardDescription>
                  Enter your application details to generate a sample security assessment report
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Application Name</Label>
                  <Input
                    placeholder="My Application"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Application URL</Label>
                  <Input
                    placeholder="https://myapp.com"
                    value={appUrl}
                    onChange={(e) => setAppUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    placeholder="Any specific areas of concern..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={generateReport}
                  disabled={!appName || loading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Shield className="h-5 w-5 animate-pulse" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-8"
          >
            {/* Report Header */}
            <Card className="bg-card border-primary/20">
              <CardContent className="py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-foreground">
                      Security Assessment Report
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {appName} — {appUrl || "N/A"}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground justify-center md:justify-start">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date().toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        SCR Platform
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-5xl font-bold ${
                        overallScore >= 80
                          ? "text-green-600 dark:text-green-400"
                          : overallScore >= 60
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Security Score
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-6 flex items-center gap-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">{passCount}</div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6 flex items-center gap-4">
                  <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">{warnCount}</div>
                    <div className="text-sm text-muted-foreground">Warnings</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-6 flex items-center gap-4">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">{failCount}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Findings */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Detailed Findings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportItems.map((item, i) => (
                  <motion.div
                    key={item.category}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-lg border border-border bg-card p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {statusIcon(item.status)}
                        <span className="font-semibold text-foreground">{item.category}</span>
                      </div>
                      <Badge
                        variant={
                          item.status === "pass"
                            ? "default"
                            : item.status === "warning"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground pl-8">
                      <strong className="text-foreground">Finding:</strong> <span className="text-muted-foreground">{item.finding}</span>
                    </p>
                    <p className="text-sm text-foreground pl-8">
                      <strong className="text-foreground">Recommendation:</strong> <span className="text-muted-foreground">{item.recommendation}</span>
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="gap-2" onClick={() => setGenerated(false)}>
                Generate New Report
              </Button>
              <Button className="gap-2" onClick={() => generateSecurityReportPDF({
                appName,
                appUrl,
                notes,
                score: overallScore,
                passCount,
                warnCount,
                failCount,
                items: reportItems,
              })}>
                <Download className="h-4 w-4" />
                Download PDF Report
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
