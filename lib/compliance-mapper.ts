/**
 * ShieldX Compliance Mapper
 *
 * Maps all scan findings to industry compliance frameworks:
 * SOC 2, ISO 27001, PCI-DSS, HIPAA, NIST 800-53, CIS Benchmarks, GDPR
 *
 * This module enriches any scan result with compliance metadata and
 * generates per-framework compliance posture scores.
 */

/* ── Framework definitions ── */
export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  controlCount: number;
}

export const FRAMEWORKS: ComplianceFramework[] = [
  { id: "soc2", name: "SOC 2 Type II", version: "2022", description: "Service Organization Control 2 — Trust Services Criteria", controlCount: 64 },
  { id: "iso27001", name: "ISO 27001", version: "2022", description: "Information Security Management Systems", controlCount: 93 },
  { id: "pci-dss", name: "PCI DSS", version: "4.0", description: "Payment Card Industry Data Security Standard", controlCount: 64 },
  { id: "hipaa", name: "HIPAA", version: "2023", description: "Health Insurance Portability and Accountability Act", controlCount: 42 },
  { id: "nist", name: "NIST 800-53", version: "Rev 5", description: "Security and Privacy Controls for Information Systems", controlCount: 125 },
  { id: "cis", name: "CIS Benchmarks", version: "2.0", description: "Center for Internet Security best practices", controlCount: 50 },
  { id: "gdpr", name: "GDPR", version: "2018", description: "EU General Data Protection Regulation", controlCount: 32 },
  { id: "owasp", name: "OWASP Top 10", version: "2021", description: "Open Web Application Security Project Top 10", controlCount: 10 },
];

/* ── Control mapping by finding category ── */
interface ControlMapping {
  frameworkId: string;
  controlId: string;
  controlName: string;
  requirement: string;
}

/** Maps a finding category + severity to applicable compliance controls */
const CONTROL_MAPPINGS: Record<string, ControlMapping[]> = {
  // ── Secrets / Credentials ──
  "secrets": [
    { frameworkId: "soc2", controlId: "CC6.1", controlName: "Logical Access Security", requirement: "Credentials must not be hardcoded in source code." },
    { frameworkId: "soc2", controlId: "CC6.7", controlName: "Encryption of Data", requirement: "Sensitive authentication data must be encrypted at rest." },
    { frameworkId: "iso27001", controlId: "A.9.4.3", controlName: "Password Management", requirement: "Secrets and passwords must be managed through secure storage mechanisms." },
    { frameworkId: "pci-dss", controlId: "3.4", controlName: "Render PAN Unreadable", requirement: "Cryptographic keys and passwords must not be stored in plaintext." },
    { frameworkId: "pci-dss", controlId: "8.2.1", controlName: "Strong Cryptography", requirement: "Credentials must be rendered unreadable during transmission and storage." },
    { frameworkId: "hipaa", controlId: "164.312(a)(1)", controlName: "Access Control", requirement: "Implement technical policies for access to ePHI systems." },
    { frameworkId: "nist", controlId: "IA-5", controlName: "Authenticator Management", requirement: "Manage information system authenticators including passwords, tokens, and certificates." },
    { frameworkId: "cis", controlId: "5.2", controlName: "Use Unique Passwords", requirement: "Do not reuse or hardcode credentials." },
    { frameworkId: "gdpr", controlId: "Art.32", controlName: "Security of Processing", requirement: "Implement appropriate technical measures to ensure security." },
    { frameworkId: "owasp", controlId: "A07:2021", controlName: "Identification & Auth Failures", requirement: "Do not ship credentials in source code repositories." },
  ],

  // ── Dependencies / Vulnerable Components ──
  "deps": [
    { frameworkId: "soc2", controlId: "CC7.1", controlName: "System Component Inventory", requirement: "Maintain inventory of system components and manage vulnerabilities." },
    { frameworkId: "iso27001", controlId: "A.12.6.1", controlName: "Management of Technical Vulnerabilities", requirement: "Information about technical vulnerabilities shall be evaluated and addressed." },
    { frameworkId: "pci-dss", controlId: "6.3.3", controlName: "Vulnerability Management", requirement: "Address commonly identified software vulnerabilities in development." },
    { frameworkId: "hipaa", controlId: "164.308(a)(5)", controlName: "Security Awareness & Training", requirement: "Address security vulnerabilities in software used for ePHI." },
    { frameworkId: "nist", controlId: "SI-2", controlName: "Flaw Remediation", requirement: "Identify, report, and correct flaws in information systems." },
    { frameworkId: "nist", controlId: "RA-5", controlName: "Vulnerability Scanning", requirement: "Scan for vulnerabilities and remediate findings." },
    { frameworkId: "cis", controlId: "3.4", controlName: "Software Inventory", requirement: "Maintain list of all authorized software with known vulnerabilities tracked." },
    { frameworkId: "owasp", controlId: "A06:2021", controlName: "Vulnerable & Outdated Components", requirement: "Remove unused dependencies, unnecessary features, components, files, and documentation." },
  ],

  // ── API Security ──
  "api": [
    { frameworkId: "soc2", controlId: "CC6.1", controlName: "Logical Access Security", requirement: "Implement access controls on all API endpoints." },
    { frameworkId: "iso27001", controlId: "A.13.1.1", controlName: "Network Controls", requirement: "Networks shall be managed and controlled to protect information." },
    { frameworkId: "pci-dss", controlId: "6.5.10", controlName: "Broken Authentication", requirement: "Implement strong authentication for all API access." },
    { frameworkId: "nist", controlId: "SC-8", controlName: "Transmission Confidentiality", requirement: "Protect the confidentiality of transmitted information." },
    { frameworkId: "owasp", controlId: "API1:2023", controlName: "Broken Object Level Auth", requirement: "Implement authorization checks for every API object action." },
  ],

  // ── Cloud / Infrastructure Security ──
  "cloud": [
    { frameworkId: "soc2", controlId: "CC6.6", controlName: "Security Boundaries", requirement: "Implement network boundaries and access restrictions." },
    { frameworkId: "iso27001", controlId: "A.13.1.1", controlName: "Network Controls", requirement: "Networks shall be managed and controlled to protect information." },
    { frameworkId: "pci-dss", controlId: "1.3.4", controlName: "Firewall Configuration", requirement: "Restrict inbound and outbound traffic to what is necessary." },
    { frameworkId: "hipaa", controlId: "164.312(e)(1)", controlName: "Transmission Security", requirement: "Implement technical security measures for ePHI transmission." },
    { frameworkId: "nist", controlId: "AC-4", controlName: "Information Flow Enforcement", requirement: "Enforce approved authorizations for controlling the flow of information." },
    { frameworkId: "cis", controlId: "4.1", controlName: "Network Protection", requirement: "Restrict open ports and unnecessary protocols." },
  ],

  // ── SAST / Code Vulnerabilities ──
  "sast": [
    { frameworkId: "soc2", controlId: "CC6.1", controlName: "Logical Access Security", requirement: "Implement secure coding practices to prevent injection and access control flaws." },
    { frameworkId: "iso27001", controlId: "A.14.2.5", controlName: "Secure System Engineering", requirement: "Principles for engineering secure systems shall be established and applied." },
    { frameworkId: "pci-dss", controlId: "6.5.1", controlName: "Injection Flaws", requirement: "Address injection flaws including SQL, OS, LDAP, XPath." },
    { frameworkId: "hipaa", controlId: "164.312(a)(1)", controlName: "Access Control", requirement: "Implement technical policies to prevent unauthorized access to ePHI." },
    { frameworkId: "nist", controlId: "SA-11", controlName: "Developer Testing & Evaluation", requirement: "Require developers to perform security testing and code analysis." },
    { frameworkId: "owasp", controlId: "A03:2021", controlName: "Injection", requirement: "Validate, filter, and sanitize all user-supplied data." },
  ],

  // ── Log Analysis / Threat Detection ──
  "logs": [
    { frameworkId: "soc2", controlId: "CC7.2", controlName: "Monitoring Activities", requirement: "Monitor system components for anomalies and security events." },
    { frameworkId: "iso27001", controlId: "A.12.4.1", controlName: "Event Logging", requirement: "Event logs shall be produced, kept and regularly reviewed." },
    { frameworkId: "pci-dss", controlId: "10.2", controlName: "Audit Trail", requirement: "Implement automated audit trails for all system components." },
    { frameworkId: "hipaa", controlId: "164.312(b)", controlName: "Audit Controls", requirement: "Hardware, software, and procedural mechanisms to record and examine activity." },
    { frameworkId: "nist", controlId: "AU-6", controlName: "Audit Record Review", requirement: "Review and analyze information system audit records for indications of inappropriate activity." },
  ],

  // ── Container / Docker ──
  "docker": [
    { frameworkId: "soc2", controlId: "CC6.1", controlName: "Logical Access Security", requirement: "Container workloads must follow least-privilege principles." },
    { frameworkId: "iso27001", controlId: "A.14.2.5", controlName: "Secure System Engineering", requirement: "Container images must be hardened and minimized." },
    { frameworkId: "nist", controlId: "CM-6", controlName: "Configuration Settings", requirement: "Establish mandatory configuration settings for IT systems including containers." },
    { frameworkId: "cis", controlId: "5.7", controlName: "CIS Docker Benchmark", requirement: "Follow CIS Docker Benchmark for container hardening." },
  ],

  // ── IaC / Infrastructure Configuration ──
  "iac": [
    { frameworkId: "soc2", controlId: "CC6.6", controlName: "Security Boundaries", requirement: "Infrastructure must be configured with proper security boundaries." },
    { frameworkId: "iso27001", controlId: "A.12.1.4", controlName: "Separation of Environments", requirement: "Development, testing, and operational environments shall be separated." },
    { frameworkId: "pci-dss", controlId: "2.2", controlName: "Configuration Standards", requirement: "Develop configuration standards for all system components." },
    { frameworkId: "nist", controlId: "CM-2", controlName: "Baseline Configuration", requirement: "Develop, document, and maintain baseline configurations." },
    { frameworkId: "cis", controlId: "4.0", controlName: "Infrastructure Security", requirement: "Secure network infrastructure configuration." },
  ],

  // ── License Compliance ──
  "license": [
    { frameworkId: "soc2", controlId: "CC9.2", controlName: "Vendor Risk Management", requirement: "Manage risks associated with third-party components and licenses." },
    { frameworkId: "iso27001", controlId: "A.18.1.2", controlName: "Intellectual Property Rights", requirement: "Appropriate procedures shall be implemented to ensure compliance with IP requirements." },
    { frameworkId: "gdpr", controlId: "Art.28", controlName: "Processor Obligations", requirement: "Ensure third-party components comply with data processing agreements." },
  ],

  // ── SBOM ──
  "sbom": [
    { frameworkId: "nist", controlId: "SR-4", controlName: "Provenance", requirement: "Document the provenance of system components in the supply chain." },
    { frameworkId: "soc2", controlId: "CC7.1", controlName: "System Component Inventory", requirement: "Maintain a complete inventory of all software components." },
    { frameworkId: "pci-dss", controlId: "6.3", controlName: "Software Development", requirement: "Identify all custom and third-party software components." },
  ],
};

/* ── Compliance report ── */
export interface FrameworkReport {
  framework: ComplianceFramework;
  controlsChecked: number;
  controlsPassed: number;
  controlsFailed: number;
  complianceScore: number; // 0-100%
  failedControls: { controlId: string; controlName: string; requirement: string; affectedFindings: number }[];
}

export interface ComplianceReport {
  timestamp: string;
  overallScore: number; // 0-100%
  frameworks: FrameworkReport[];
  totalFindings: number;
  findingsByCategory: Record<string, number>;
  recommendations: string[];
}

interface ScanFinding {
  scanType: string;
  severity?: string;
  compliance?: string[];
}

/**
 * Generate a compliance report from scan findings.
 * Accepts findings from any combination of ShieldX scanners.
 */
export function generateComplianceReport(
  findings: ScanFinding[],
  activeFrameworks?: string[]
): ComplianceReport {
  const frameworksToCheck = activeFrameworks
    ? FRAMEWORKS.filter(f => activeFrameworks.includes(f.id))
    : FRAMEWORKS;

  // Count findings by scan type
  const findingsByCategory: Record<string, number> = {};
  for (const f of findings) {
    const cat = f.scanType || "unknown";
    findingsByCategory[cat] = (findingsByCategory[cat] || 0) + 1;
  }

  const frameworkReports: FrameworkReport[] = frameworksToCheck.map(framework => {
    // Collect all controls relevant to the findings we have
    const relevantControls = new Map<string, { controlName: string; requirement: string; affectedFindings: number }>();

    for (const [category, mappings] of Object.entries(CONTROL_MAPPINGS)) {
      const categoryFindings = findings.filter(f => f.scanType === category).length;
      if (categoryFindings === 0) continue;

      for (const mapping of mappings) {
        if (mapping.frameworkId !== framework.id) continue;

        const existing = relevantControls.get(mapping.controlId);
        if (existing) {
          existing.affectedFindings += categoryFindings;
        } else {
          relevantControls.set(mapping.controlId, {
            controlName: mapping.controlName,
            requirement: mapping.requirement,
            affectedFindings: categoryFindings,
          });
        }
      }
    }

    const controlsChecked = Math.max(relevantControls.size, 1);
    const failedControls = Array.from(relevantControls.entries())
      .filter(([, v]) => v.affectedFindings > 0)
      .map(([controlId, v]) => ({
        controlId,
        controlName: v.controlName,
        requirement: v.requirement,
        affectedFindings: v.affectedFindings,
      }));

    const controlsPassed = controlsChecked - failedControls.length;
    const complianceScore = findings.length === 0 ? 100 : Math.round((controlsPassed / controlsChecked) * 100);

    return {
      framework,
      controlsChecked,
      controlsPassed,
      controlsFailed: failedControls.length,
      complianceScore,
      failedControls,
    };
  });

  // Overall score (average of all framework scores)
  const overallScore = Math.round(
    frameworkReports.reduce((sum, r) => sum + r.complianceScore, 0) / frameworkReports.length
  );

  // Generate actionable recommendations
  const recommendations: string[] = [];
  if (findingsByCategory.secrets) recommendations.push("Rotate all exposed credentials and implement a secrets management solution (HashiCorp Vault, AWS Secrets Manager).");
  if (findingsByCategory.deps) recommendations.push("Prioritize updating dependencies with critical/high CVEs. Enable automated dependency scanning in CI/CD.");
  if (findingsByCategory.sast) recommendations.push("Address injection vulnerabilities (SQLi, XSS, command injection) before deployment. Implement input validation at all boundaries.");
  if (findingsByCategory.cloud) recommendations.push("Review cloud IAM policies for least-privilege compliance. Enable encryption at rest and in transit for all data stores.");
  if (findingsByCategory.docker) recommendations.push("Run containers as non-root users. Use minimal base images and implement health checks.");
  if (findingsByCategory.iac) recommendations.push("Apply infrastructure hardening before deployment. Block public access to databases and storage buckets.");
  if (findingsByCategory.logs) recommendations.push("Investigate detected attack patterns. Implement rate limiting and WAF rules for observed attack vectors.");
  if (findingsByCategory.license) recommendations.push("Review copyleft license obligations. Ensure license compliance before distribution or commercial use.");

  return {
    timestamp: new Date().toISOString(),
    overallScore,
    frameworks: frameworkReports,
    totalFindings: findings.length,
    findingsByCategory,
    recommendations,
  };
}
