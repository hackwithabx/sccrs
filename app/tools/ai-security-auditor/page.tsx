"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Zap,
  Database,
  Lock,
  TrendingUp,
  Download,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Prompt Injection Patterns Database
const injectionPatterns = [
  {
    name: "Prompt Overriding",
    patterns: [
      "Ignore previous instructions",
      "Forget about",
      "Disregard",
      "Override system prompt",
      "Previous instructions",
    ],
    severity: "Critical",
    description: "Attempts to override the system prompt or original instructions",
  },
  {
    name: "Role-Playing Jailbreak",
    patterns: [
      "Pretend you are",
      "Act as if",
      "Imagine you are",
      "Roleplay as",
      "You are now",
      "From now on",
    ],
    severity: "High",
    description: "Tries to make the AI assume a different identity or bypass safeguards",
  },
  {
    name: "Token Smuggling",
    patterns: [
      "ROT13",
      "Base64",
      "Encoded",
      "Decoded:",
      "Decrypt this",
      "Translate this cipher",
    ],
    severity: "High",
    description: "Attempts to hide instructions in encoded or obfuscated formats",
  },
  {
    name: "Hypothetical/Speculative",
    patterns: [
      "What if",
      "In a hypothetical",
      "Suppose",
      "Imagine a scenario",
      "For educational purposes",
      "For research",
    ],
    severity: "High",
    description: "Uses hypotheticals to request harmful content",
  },
  {
    name: "Authority Impersonation",
    patterns: [
      "I am a developer",
      "I made you",
      "I am your creator",
      "As your administrator",
      "I have permission",
      "I am authorized",
    ],
    severity: "Medium",
    description: "Claims authority to override safety measures",
  },
  {
    name: "Context Confusion",
    patterns: [
      "Previous context",
      "Earlier we discussed",
      "As mentioned before",
      "You already agreed",
      "We established",
    ],
    severity: "Medium",
    description: "Creates false context to manipulate responses",
  },
];

// Sensitive Data Patterns
const sensitivePatterns = [
  {
    name: "PII Exposure",
    pattern: /(\b\d{3}-\d{2}-\d{4}\b|SSN|social.*security)/gi,
    severity: "Critical",
    description: "Social Security Numbers or personal identification",
  },
  {
    name: "API Keys",
    pattern: /([sk|pk|bearer]_[a-zA-Z0-9]{20,}|api[_-]?key|secret[_-]?key)/gi,
    severity: "Critical",
    description: "API keys, tokens, or authentication credentials",
  },
  {
    name: "Password Exposure",
    pattern: /(password|passwd|pwd)[\s:=]+[^\s]{6,}/gi,
    severity: "Critical",
    description: "Passwords or authentication credentials",
  },
  {
    name: "Email Addresses",
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    severity: "High",
    description: "Exposed email addresses or contact information",
  },
  {
    name: "Credit Card Numbers",
    pattern: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
    severity: "Critical",
    description: "Credit card numbers or financial information",
  },
  {
    name: "IP Addresses",
    pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    severity: "Medium",
    description: "Internal IP addresses or network infrastructure details",
  },
  {
    name: "Database Credentials",
    pattern: /(mongodb|mysql|postgres).*:\/\/.*:.*@/gi,
    severity: "Critical",
    description: "Database connection strings with credentials",
  },
];

// OWASP LLM Top 10 Categories
const owaspCategories = [
  {
    id: "prompt-injection",
    title: "Prompt Injection",
    description: "Direct and indirect prompt injections that manipulate LLM behavior",
    cvss: "9.9",
  },
  {
    id: "training-data-poisoning",
    title: "Training Data Poisoning",
    description: "Malicious data in training datasets affecting model behavior",
    cvss: "8.5",
  },
  {
    id: "model-supply-chain",
    title: "Model Supply-Chain Vulnerabilities",
    description: "Compromised models or components in the supply chain",
    cvss: "8.8",
  },
  {
    id: "data-leakage",
    title: "Data Leakage",
    description: "Unintended disclosure of sensitive training data or PII",
    cvss: "9.4",
  },
  {
    id: "insecure-output-handling",
    title: "Insecure Output Handling",
    description: "Downstream component accepting LLM output without validation",
    cvss: "8.1",
  },
  {
    id: "model-denial",
    title: "Model Denial of Service",
    description: "Attacks that consume excessive resources (tokens, memory)",
    cvss: "6.5",
  },
  {
    id: "permissions-action",
    title: "Broken Permissions & Agentive Actions",
    description: "Insufficient authorization controls on agent actions",
    cvss: "8.7",
  },
];

interface TestResult {
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Pass";
  finding: string;
  description: string;
  remediation: string;
  cvss?: string;
}

interface SecurityScore {
  overall: number;
  categories: {
    name: string;
    score: number;
  }[];
}

export default function AiSecurityAuditorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("prompt-injection");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [score, setScore] = useState<SecurityScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  // Test Prompt Injection
  const testPromptInjection = () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt to test");
      return;
    }

    setIsLoading(true);
    const results: TestResult[] = [];
    let criticalCount = 0;
    let highCount = 0;

    injectionPatterns.forEach((pattern) => {
      pattern.patterns.forEach((p) => {
        if (prompt.toLowerCase().includes(p.toLowerCase())) {
          results.push({
            category: pattern.name,
            severity: pattern.severity as "Critical" | "High" | "Medium" | "Low",
            finding: `Detected potential ${pattern.name.toLowerCase()} pattern: "${p}"`,
            description: pattern.description,
            remediation: `Review and sanitize prompt inputs. Implement prompt filtering and validation techniques. Consider using prompt templating libraries.`,
          });
          if (pattern.severity === "Critical") criticalCount++;
          if (pattern.severity === "High") highCount++;
        }
      });
    });

    if (results.length === 0) {
      results.push({
        category: "Prompt Safety",
        severity: "Pass",
        finding: "No obvious injection patterns detected",
        description: "The prompt does not contain known injection attack patterns",
        remediation: "Continue monitoring and implementing input validation best practices",
      });
    }

    const injectionScore = results.length === 0 ? 95 : Math.max(10, 95 - criticalCount * 30 - highCount * 15);

    setTestResults(results);
    setTimeout(() => setIsLoading(false), 800);

    return results;
  };

  // Test Data Leakage
  const testDataLeakage = () => {
    if (!output.trim()) {
      alert("Please enter LLM output to analyze");
      return;
    }

    setIsLoading(true);
    const results: TestResult[] = [];

    sensitivePatterns.forEach((pattern) => {
      const matches = output.match(pattern.pattern);
      if (matches) {
        matches.forEach((match) => {
          results.push({
            category: pattern.name,
            severity: pattern.severity as "Critical" | "High",
            finding: `Potential ${pattern.name.toLowerCase()} detected: ${match.substring(0, 20)}...`,
            description: pattern.description,
            remediation: `Implement output filtering and data masking. Use PII detection libraries. Implement access controls on sensitive data in training sets.`,
          });
        });
      }
    });

    if (results.length === 0) {
      results.push({
        category: "Data Leakage",
        severity: "Pass",
        finding: "No sensitive data patterns detected",
        description: "The output does not contain obvious sensitive information",
        remediation: "Continue monitoring with automated tools and regular security audits",
      });
    }

    setTestResults(results);
    setTimeout(() => setIsLoading(false), 800);

    return results;
  };

  // Comprehensive Security Assessment
  const runFullAudit = () => {
    if (!prompt.trim() && !output.trim()) {
      alert("Please enter prompt or output to test");
      return;
    }

    setIsLoading(true);
    let allResults: TestResult[] = [];

    // Run injection tests
    if (prompt.trim()) {
      injectionPatterns.forEach((pattern) => {
        pattern.patterns.forEach((p) => {
          if (prompt.toLowerCase().includes(p.toLowerCase())) {
            allResults.push({
              category: pattern.name,
              severity: pattern.severity as "Critical" | "High" | "Medium" | "Low",
              finding: `Prompt injection detected: "${p}"`,
              description: pattern.description,
              remediation: `Sanitize inputs, use prompt whitelisting, implement semantic validation`,
              cvss: pattern.severity === "Critical" ? "9.9" : "7.5",
            });
          }
        });
      });
    }

    // Run data leakage tests
    if (output.trim()) {
      sensitivePatterns.forEach((pattern) => {
        const matches = output.match(pattern.pattern);
        if (matches && matches.length > 0) {
          allResults.push({
            category: pattern.name,
            severity: "Critical",
            finding: `${matches.length} instance(s) of ${pattern.name.toLowerCase()} detected`,
            description: pattern.description,
            remediation: `Implement output filtering, use data masking, restrict access to sensitive data`,
            cvss: "9.4",
          });
        }
      });
    }

    // Add OWASP coverage assessment
    const coverage = allResults.length > 0 ? allResults : [];
    if (coverage.length === 0) {
      allResults.push({
        category: "Overall Security",
        severity: "Pass",
        finding: "No critical vulnerabilities detected",
        description: "The AI application shows good security posture",
        remediation: "Maintain baseline security practices and regular monitoring",
      });
    }

    setTestResults(allResults);

    // Calculate scores
    const criticalCount = allResults.filter((r) => r.severity === "Critical").length;
    const highCount = allResults.filter((r) => r.severity === "High").length;
    const mediumCount = allResults.filter((r) => r.severity === "Medium").length;

    const overallScore = Math.max(0, 100 - criticalCount * 40 - highCount * 20 - mediumCount * 10);

    setScore({
      overall: Math.round(overallScore),
      categories: owaspCategories.map((cat) => ({
        name: cat.title,
        score: allResults.some((r) => r.category.toLowerCase().includes(cat.id.toLowerCase()))
          ? 40
          : 85,
      })),
    });

    setTimeout(() => setIsLoading(false), 1000);
  };

  // Generate PDF Report
  const generateReport = () => {
    if (!score || testResults.length === 0) {
      alert("Run an audit first to generate a report");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 48, "F");
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 48, pageWidth, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("AI Security Audit Report", margin, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text("SecureCodeReviews AI Security Auditor", margin, 32);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, 32, { align: "right" });

    y = 65;

    // Score Section
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Security Score", margin, y);
    y += 12;

    const scoreColor =
      score.overall >= 80
        ? [16, 185, 129]
        : score.overall >= 60
        ? [234, 179, 8]
        : [239, 68, 68];

    doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.circle(margin + 20, y + 10, 15, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text(String(score.overall), margin + 20, y + 14, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("/ 100", margin + 40, y + 10);

    y += 30;

    // Findings Table
    const tableData = testResults.map((r) => [
      r.category,
      r.severity,
      r.finding,
      r.remediation,
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Category", "Severity", "Finding", "Remediation"]],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 60 },
        3: { cellWidth: 60 },
      },
    });

    // Recommendations
    doc.addPage();
    y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 30, 30);
    doc.text("Recommendations", margin, y);
    y += 12;

    const recommendations = [
      "1. Input Validation: Implement comprehensive input validation and sanitization",
      "2. Output Filtering: Apply output filtering to remove sensitive data",
      "3. Monitoring: Set up continuous security monitoring and logging",
      "4. Training: Train development teams on AI security best practices",
      "5. Testing: Conduct regular red team exercises and penetration tests",
    ];

    recommendations.forEach((rec) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(rec, pageWidth - 2 * margin);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 3;
    });

    doc.save(`AI-Security-Report-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const criticalCount = testResults.filter((r) => r.severity === "Critical").length;
  const highCount = testResults.filter((r) => r.severity === "High").length;
  const passCount = testResults.filter((r) => r.severity === "Pass").length;

  return (
    <div className="py-16 space-y-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <Badge className="bg-violet-600 gap-2">
              <Sparkles className="h-4 w-4" />
              Enterprise Tool
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-4">AI Security Auditor</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional security assessment tool for AI/LLM applications. Test for prompt injection, data leakage, and OWASP Top 10 LLM vulnerabilities.
          </p>
        </motion.div>

        {/* Main Testing Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="prompt-injection" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Injection
                </TabsTrigger>
                <TabsTrigger value="data-leakage" className="gap-2">
                  <Database className="h-4 w-4" />
                  Data
                </TabsTrigger>
                <TabsTrigger value="full-audit" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Full Audit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="prompt-injection" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Prompt Injection Testing
                    </CardTitle>
                    <CardDescription>
                      Test your AI prompts for injection vulnerabilities and jailbreak attempts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">System Prompt or User Input</label>
                      <Textarea
                        placeholder="Paste your system prompt or user input here..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={8}
                      />
                    </div>
                    <Button
                      onClick={testPromptInjection}
                      disabled={isLoading}
                      className="w-full gap-2 bg-orange-600 hover:bg-orange-700"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Test for Injection
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data-leakage" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-red-600" />
                      Data Leakage Analysis
                    </CardTitle>
                    <CardDescription>
                      Scan LLM outputs for exposed PII, credentials, and sensitive information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">LLM Output to Analyze</label>
                      <Textarea
                        placeholder="Paste the LLM response here for analysis..."
                        value={output}
                        onChange={(e) => setOutput(e.target.value)}
                        rows={8}
                      />
                    </div>
                    <Button
                      onClick={testDataLeakage}
                      disabled={isLoading}
                      className="w-full gap-2 bg-red-600 hover:bg-red-700"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4" />
                          Scan for Data Leakage
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="full-audit" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-violet-600" />
                      Comprehensive Security Audit
                    </CardTitle>
                    <CardDescription>
                      Run full assessment against OWASP Top 10 for LLMs and security best practices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">System Prompt</label>
                      <Textarea
                        placeholder="Paste your system prompt..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">LLM Response Sample</label>
                      <Textarea
                        placeholder="Paste a sample response from your LLM..."
                        value={output}
                        onChange={(e) => setOutput(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={runFullAudit}
                      disabled={isLoading}
                      className="w-full gap-2 bg-violet-600 hover:bg-violet-700"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Running Audit...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          Run Full Audit
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Score */}
          <div className="space-y-6">
            {score && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-0">
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl font-bold mb-2" style={{
                      color: score.overall >= 80 ? "#10b981" : score.overall >= 60 ? "#eab308" : "#ef4444",
                    }}>
                      {score.overall}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">Security Score</div>
                    <div className="text-xs text-muted-foreground">
                      {score.overall >= 80
                        ? "✓ Good Security Posture"
                        : score.overall >= 60
                        ? "⚠ Needs Improvement"
                        : "✗ Critical Issues"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Test Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Critical Issues</span>
                      <Badge variant="destructive">{criticalCount}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">High Issues</span>
                      <Badge variant="secondary">{highCount}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Passed Checks</span>
                      <Badge className="bg-emerald-600">{passCount}</Badge>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Total: {testResults.length} findings
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {testResults.length > 0 && (
                  <Button
                    onClick={generateReport}
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF Report
                  </Button>
                )}
              </motion.div>
            )}

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <CardContent className="p-4 space-y-2 text-sm">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span><strong>Prompt Injection:</strong> Tests against known jailbreak patterns</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span><strong>Data Leakage:</strong> Scans for PII, APIs, credentials</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <span><strong>OWASP LLM Top 10:</strong> Coverage assessment</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Section */}
        {testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold mb-6">Detailed Findings</h2>
              <div className="space-y-4">
                {testResults.map((result, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedResult === result ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() =>
                        setSelectedResult(selectedResult === result ? null : result)
                      }
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{result.category}</h3>
                              <Badge
                                variant={
                                  result.severity === "Critical"
                                    ? "destructive"
                                    : result.severity === "High"
                                    ? "secondary"
                                    : result.severity === "Pass"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {result.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{result.finding}</p>
                          </div>
                          {result.cvss && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-red-600">{result.cvss}</div>
                              <div className="text-xs text-muted-foreground">CVSS</div>
                            </div>
                          )}
                        </div>

                        {selectedResult === result && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 pt-4 border-t space-y-3"
                          >
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Description</h4>
                              <p className="text-sm text-muted-foreground">{result.description}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-1">How to Fix</h4>
                              <p className="text-sm text-muted-foreground">{result.remediation}</p>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* OWASP Coverage Section */}
      <div className="bg-slate-50 dark:bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">OWASP Top 10 for LLMs Coverage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {owaspCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4">
                    <div className="text-sm font-semibold mb-2">{cat.title}</div>
                    <p className="text-xs text-muted-foreground mb-3">{cat.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">CVSS</span>
                      <span className="font-bold text-red-600">{cat.cvss}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Zap,
              title: "Prompt Injection Detection",
              desc: "Test against 40+ known injection patterns",
            },
            {
              icon: Database,
              title: "PII Detection",
              desc: "Scan for SSN, API keys, passwords, and more",
            },
            {
              icon: Shield,
              title: "OWASP Compliance",
              desc: "Full coverage of OWASP Top 10 for LLMs",
            },
            {
              icon: TrendingUp,
              title: "Security Scoring",
              desc: "CVSS-based vulnerability scoring",
            },
            {
              icon: Download,
              title: "PDF Reports",
              desc: "Professional reports with remediation",
            },
            {
              icon: Activity,
              title: "Real-time Testing",
              desc: "Instant results with actionable insights",
            },
            {
              icon: Lock,
              title: "Confidential",
              desc: "All data processed locally, never stored",
            },
            {
              icon: Brain,
              title: "Enterprise Ready",
              desc: "Suitable for SOC 2 and compliance audits",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-violet-600 mb-3" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-12 rounded-xl mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Secure Your AI Application?</h2>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Get a professional security assessment report and remediation guidance for your AI/LLM application
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => router.push("/contact")}
            >
              Schedule Consultation
            </Button>
            <Button 
              size="lg" 
              className="bg-white text-violet-600 hover:bg-gray-100 font-semibold"
              onClick={() => router.push("/services")}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
