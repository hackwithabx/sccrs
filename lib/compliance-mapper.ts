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
    { frameworkId: "iso27001", controlId: "A.8.2.3", controlName: "Handling of Assets", requirement: "Procedures for handling classified assets shall restrict unauthorized access." },
    { frameworkId: "pci-dss", controlId: "3.4", controlName: "Render PAN Unreadable", requirement: "Cryptographic keys and passwords must not be stored in plaintext." },
    { frameworkId: "pci-dss", controlId: "8.2.1", controlName: "Strong Cryptography", requirement: "Credentials must be rendered unreadable during transmission and storage." },
    { frameworkId: "hipaa", controlId: "164.312(a)(1)", controlName: "Access Control", requirement: "Implement technical policies for access to ePHI systems." },
    { frameworkId: "hipaa", controlId: "164.312(a)(2)(iv)", controlName: "Encryption and Decryption", requirement: "Implement mechanism to encrypt ePHI and credentials." },
    { frameworkId: "nist", controlId: "IA-5", controlName: "Authenticator Management", requirement: "Manage information system authenticators including passwords, tokens, and certificates." },
    { frameworkId: "nist", controlId: "SC-28", controlName: "Protection of Information at Rest", requirement: "Protect the confidentiality of information at rest including credentials." },
    { frameworkId: "cis", controlId: "5.2", controlName: "Use Unique Passwords", requirement: "Do not reuse or hardcode credentials." },
    { frameworkId: "gdpr", controlId: "Art.32", controlName: "Security of Processing", requirement: "Implement appropriate technical measures to ensure security." },
    { frameworkId: "gdpr", controlId: "Art.25", controlName: "Data Protection by Design", requirement: "Implement data protection by design and by default in all systems." },
    { frameworkId: "owasp", controlId: "A07:2021", controlName: "Identification & Auth Failures", requirement: "Do not ship credentials in source code repositories." },
    { frameworkId: "owasp", controlId: "A02:2021", controlName: "Cryptographic Failures", requirement: "Protect sensitive data with proper encryption; do not expose secrets." },
  ],

  // ── Dependencies / Vulnerable Components ──
  "deps": [
    { frameworkId: "soc2", controlId: "CC7.1", controlName: "System Component Inventory", requirement: "Maintain inventory of system components and manage vulnerabilities." },
    { frameworkId: "soc2", controlId: "CC8.1", controlName: "Change Management", requirement: "Changes including dependency updates are authorized, tested, and approved." },
    { frameworkId: "iso27001", controlId: "A.12.6.1", controlName: "Management of Technical Vulnerabilities", requirement: "Information about technical vulnerabilities shall be evaluated and addressed." },
    { frameworkId: "iso27001", controlId: "A.14.2.7", controlName: "Outsourced Development", requirement: "Organization shall supervise the activity of outsourced/third-party components." },
    { frameworkId: "pci-dss", controlId: "6.3.3", controlName: "Vulnerability Management", requirement: "Address commonly identified software vulnerabilities in development." },
    { frameworkId: "pci-dss", controlId: "6.2", controlName: "Security Patches", requirement: "Install critical security patches within one month of release." },
    { frameworkId: "hipaa", controlId: "164.308(a)(5)", controlName: "Security Awareness & Training", requirement: "Address security vulnerabilities in software used for ePHI." },
    { frameworkId: "hipaa", controlId: "164.306(a)(2)", controlName: "Protection Against Threats", requirement: "Protect against reasonably anticipated threats to information security." },
    { frameworkId: "nist", controlId: "SI-2", controlName: "Flaw Remediation", requirement: "Identify, report, and correct flaws in information systems." },
    { frameworkId: "nist", controlId: "RA-5", controlName: "Vulnerability Scanning", requirement: "Scan for vulnerabilities and remediate findings." },
    { frameworkId: "cis", controlId: "3.4", controlName: "Software Inventory", requirement: "Maintain list of all authorized software with known vulnerabilities tracked." },
    { frameworkId: "cis", controlId: "7.4", controlName: "Patch Management", requirement: "Ensure all software is patched and up to date." },
    { frameworkId: "gdpr", controlId: "Art.32", controlName: "Security of Processing", requirement: "Implement appropriate measures to ensure ongoing security of processing." },
    { frameworkId: "owasp", controlId: "A06:2021", controlName: "Vulnerable & Outdated Components", requirement: "Remove unused dependencies, unnecessary features, components, files, and documentation." },
  ],

  // ── API Security ──
  "api": [
    { frameworkId: "soc2", controlId: "CC6.1", controlName: "Logical Access Security", requirement: "Implement access controls on all API endpoints." },
    { frameworkId: "soc2", controlId: "CC6.6", controlName: "Security Boundaries", requirement: "Restrict API access to authorized consumers only." },
    { frameworkId: "iso27001", controlId: "A.13.1.1", controlName: "Network Controls", requirement: "Networks shall be managed and controlled to protect information." },
    { frameworkId: "iso27001", controlId: "A.9.4.1", controlName: "Information Access Restriction", requirement: "Access to information and application system functions shall be restricted." },
    { frameworkId: "pci-dss", controlId: "6.5.10", controlName: "Broken Authentication", requirement: "Implement strong authentication for all API access." },
    { frameworkId: "pci-dss", controlId: "6.5.4", controlName: "Insecure Communications", requirement: "Properly encrypt all authenticated and sensitive communications." },
    { frameworkId: "hipaa", controlId: "164.312(e)(1)", controlName: "Transmission Security", requirement: "Implement measures to guard against unauthorized access during electronic transmissions." },
    { frameworkId: "nist", controlId: "SC-8", controlName: "Transmission Confidentiality", requirement: "Protect the confidentiality of transmitted information." },
    { frameworkId: "nist", controlId: "AC-3", controlName: "Access Enforcement", requirement: "Enforce approved authorizations for logical access to information and system resources." },
    { frameworkId: "cis", controlId: "14.4", controlName: "Encrypt Sensitive Data in Transit", requirement: "Encrypt sensitive information in transit using TLS." },
    { frameworkId: "gdpr", controlId: "Art.32", controlName: "Security of Processing", requirement: "Implement appropriate technical measures including encryption of personal data in transit." },
    { frameworkId: "owasp", controlId: "A01:2021", controlName: "Broken Access Control", requirement: "Enforce access control and prevent unauthorized API access." },
    { frameworkId: "owasp", controlId: "A05:2021", controlName: "Security Misconfiguration", requirement: "Properly configure security headers and CORS policies." },
  ],

  // ── Cloud / Infrastructure Security ──
  "cloud": [
    { frameworkId: "soc2", controlId: "CC6.6", controlName: "Security Boundaries", requirement: "Implement network boundaries and access restrictions." },
    { frameworkId: "soc2", controlId: "CC6.3", controlName: "Role-Based Access", requirement: "Restrict access to infrastructure based on role definitions." },
    { frameworkId: "iso27001", controlId: "A.13.1.1", controlName: "Network Controls", requirement: "Networks shall be managed and controlled to protect information." },
    { frameworkId: "iso27001", controlId: "A.13.1.3", controlName: "Segregation in Networks", requirement: "Groups of information services shall be segregated on networks." },
    { frameworkId: "pci-dss", controlId: "1.3.4", controlName: "Firewall Configuration", requirement: "Restrict inbound and outbound traffic to what is necessary." },
    { frameworkId: "pci-dss", controlId: "2.2", controlName: "Configuration Standards", requirement: "Develop configuration standards for all system components." },
    { frameworkId: "hipaa", controlId: "164.312(e)(1)", controlName: "Transmission Security", requirement: "Implement technical security measures for ePHI transmission." },
    { frameworkId: "hipaa", controlId: "164.308(a)(4)", controlName: "Information Access Management", requirement: "Implement policies for authorizing access to ePHI systems." },
    { frameworkId: "nist", controlId: "AC-4", controlName: "Information Flow Enforcement", requirement: "Enforce approved authorizations for controlling the flow of information." },
    { frameworkId: "nist", controlId: "SC-7", controlName: "Boundary Protection", requirement: "Monitor and control communications at external boundaries." },
    { frameworkId: "cis", controlId: "4.1", controlName: "Network Protection", requirement: "Restrict open ports and unnecessary protocols." },
    { frameworkId: "cis", controlId: "12.1", controlName: "Network Infrastructure Management", requirement: "Maintain an up-to-date network infrastructure configuration." },
    { frameworkId: "gdpr", controlId: "Art.32", controlName: "Security of Processing", requirement: "Implement technical measures to protect data processing infrastructure." },
    { frameworkId: "owasp", controlId: "A05:2021", controlName: "Security Misconfiguration", requirement: "Properly configure all cloud services and infrastructure." },
  ],

  // ── SAST / Code Vulnerabilities ──
  "sast": [
    { frameworkId: "soc2", controlId: "CC6.1", controlName: "Logical Access Security", requirement: "Implement secure coding practices to prevent injection and access control flaws." },
    { frameworkId: "soc2", controlId: "CC8.1", controlName: "Change Management", requirement: "All code changes are reviewed and tested before deployment." },
    { frameworkId: "iso27001", controlId: "A.14.2.5", controlName: "Secure System Engineering", requirement: "Principles for engineering secure systems shall be established and applied." },
    { frameworkId: "iso27001", controlId: "A.14.2.1", controlName: "Secure Development Policy", requirement: "Rules for development of software shall be established and applied." },
    { frameworkId: "pci-dss", controlId: "6.5.1", controlName: "Injection Flaws", requirement: "Address injection flaws including SQL, OS, LDAP, XPath." },
    { frameworkId: "pci-dss", controlId: "6.5.7", controlName: "Cross-Site Scripting", requirement: "Address XSS vulnerabilities in custom application code." },
    { frameworkId: "pci-dss", controlId: "6.3.2", controlName: "Code Review", requirement: "Review custom code prior to release to identify coding vulnerabilities." },
    { frameworkId: "hipaa", controlId: "164.312(a)(1)", controlName: "Access Control", requirement: "Implement technical policies to prevent unauthorized access to ePHI." },
    { frameworkId: "hipaa", controlId: "164.312(c)(1)", controlName: "Integrity Controls", requirement: "Implement mechanisms to protect ePHI from improper alteration or destruction." },
    { frameworkId: "nist", controlId: "SA-11", controlName: "Developer Testing & Evaluation", requirement: "Require developers to perform security testing and code analysis." },
    { frameworkId: "nist", controlId: "SI-10", controlName: "Information Input Validation", requirement: "Check the validity of information inputs at the application level." },
    { frameworkId: "cis", controlId: "16.4", controlName: "Application Software Security", requirement: "Apply static code analysis tools in the development pipeline." },
    { frameworkId: "gdpr", controlId: "Art.25", controlName: "Data Protection by Design", requirement: "Implement secure coding practices as part of data protection by design." },
    { frameworkId: "gdpr", controlId: "Art.32", controlName: "Security of Processing", requirement: "Ensure the ongoing security of data processing systems." },
    { frameworkId: "owasp", controlId: "A03:2021", controlName: "Injection", requirement: "Validate, filter, and sanitize all user-supplied data." },
    { frameworkId: "owasp", controlId: "A08:2021", controlName: "Software & Data Integrity", requirement: "Ensure code and infrastructure do not rely on unverified sources." },
  ],

  // ── Log Analysis / Threat Detection ──
  "logs": [
    { frameworkId: "soc2", controlId: "CC7.2", controlName: "Monitoring Activities", requirement: "Monitor system components for anomalies and security events." },
    { frameworkId: "soc2", controlId: "CC7.3", controlName: "Security Incidents", requirement: "Evaluate security events to determine if they constitute incidents." },
    { frameworkId: "iso27001", controlId: "A.12.4.1", controlName: "Event Logging", requirement: "Event logs shall be produced, kept and regularly reviewed." },
    { frameworkId: "iso27001", controlId: "A.16.1.2", controlName: "Reporting Security Events", requirement: "Security events shall be reported through management channels." },
    { frameworkId: "pci-dss", controlId: "10.2", controlName: "Audit Trail", requirement: "Implement automated audit trails for all system components." },
    { frameworkId: "pci-dss", controlId: "10.6", controlName: "Log Review", requirement: "Review logs for all system components at least daily." },
    { frameworkId: "hipaa", controlId: "164.312(b)", controlName: "Audit Controls", requirement: "Hardware, software, and procedural mechanisms to record and examine activity." },
    { frameworkId: "nist", controlId: "AU-6", controlName: "Audit Record Review", requirement: "Review and analyze information system audit records for indications of inappropriate activity." },
    { frameworkId: "nist", controlId: "SI-4", controlName: "Information System Monitoring", requirement: "Monitor the information system to detect attacks and unauthorized activities." },
    { frameworkId: "cis", controlId: "8.5", controlName: "Centralized Log Management", requirement: "Collect and analyze audit logs from multiple sources." },
    { frameworkId: "gdpr", controlId: "Art.33", controlName: "Breach Notification", requirement: "Detect and report personal data breaches within 72 hours." },
    { frameworkId: "owasp", controlId: "A09:2021", controlName: "Security Logging & Monitoring", requirement: "Ensure all security-relevant activities are logged and monitored." },
  ],

  // ── AI Security Review ──
  "ai-review": [
    { frameworkId: "soc2", controlId: "CC6.1", controlName: "Logical Access Security", requirement: "Implement access controls to prevent business logic and authorization flaws." },
    { frameworkId: "soc2", controlId: "CC8.1", controlName: "Change Management", requirement: "All code changes are reviewed for security before deployment." },
    { frameworkId: "iso27001", controlId: "A.14.2.5", controlName: "Secure System Engineering", requirement: "Principles for engineering secure systems shall be established." },
    { frameworkId: "pci-dss", controlId: "6.3.2", controlName: "Code Review", requirement: "Review custom code to identify security vulnerabilities." },
    { frameworkId: "hipaa", controlId: "164.308(a)(1)", controlName: "Risk Analysis", requirement: "Conduct accurate assessments of potential risks to ePHI." },
    { frameworkId: "nist", controlId: "SA-11", controlName: "Developer Testing & Evaluation", requirement: "Perform security testing including dynamic and AI-assisted analysis." },
    { frameworkId: "owasp", controlId: "A01:2021", controlName: "Broken Access Control", requirement: "Enforce access control including IDOR and business logic validation." },
    { frameworkId: "owasp", controlId: "A04:2021", controlName: "Insecure Design", requirement: "Identify design-level flaws including race conditions and authorization gaps." },
  ],

  // ── CI/CD Pipeline ──
  "cicd": [
    { frameworkId: "soc2", controlId: "CC8.1", controlName: "Change Management", requirement: "Changes are authorized, designed, configured, tested, and approved before implementation." },
    { frameworkId: "soc2", controlId: "CC7.1", controlName: "Risk Detection", requirement: "Detect and address security risks in the deployment pipeline." },
    { frameworkId: "iso27001", controlId: "A.14.2.2", controlName: "System Change Control", requirement: "Changes to systems within the development lifecycle shall be controlled." },
    { frameworkId: "iso27001", controlId: "A.14.2.6", controlName: "Secure Development Environment", requirement: "Establish and protect secure development environments." },
    { frameworkId: "pci-dss", controlId: "6.4.5", controlName: "Change Control Procedures", requirement: "Separate development/test environments from production." },
    { frameworkId: "nist", controlId: "SA-10", controlName: "Developer Configuration Management", requirement: "Track, control, and audit configuration changes during development." },
    { frameworkId: "nist", controlId: "CM-3", controlName: "Configuration Change Control", requirement: "Control changes to the system through formal change control processes." },
    { frameworkId: "cis", controlId: "2.7", controlName: "Pipeline Security", requirement: "Apply security controls throughout the CI/CD pipeline." },
  ],

  // ── Container / Docker ──
  "docker": [
    { frameworkId: "soc2", controlId: "CC6.1", controlName: "Logical Access Security", requirement: "Container workloads must follow least-privilege principles." },
    { frameworkId: "soc2", controlId: "CC6.8", controlName: "Software & Infrastructure Security", requirement: "Monitor and protect container infrastructure from vulnerabilities." },
    { frameworkId: "iso27001", controlId: "A.14.2.5", controlName: "Secure System Engineering", requirement: "Container images must be hardened and minimized." },
    { frameworkId: "iso27001", controlId: "A.12.1.4", controlName: "Separation of Environments", requirement: "Use separate container environments for development and production." },
    { frameworkId: "pci-dss", controlId: "2.2", controlName: "Configuration Standards", requirement: "Develop configuration standards for all components including containers." },
    { frameworkId: "pci-dss", controlId: "6.5.3", controlName: "Insecure Storage", requirement: "Do not store secrets in container images or environment variables." },
    { frameworkId: "hipaa", controlId: "164.312(a)(1)", controlName: "Access Control", requirement: "Implement least-privilege access in container deployments." },
    { frameworkId: "nist", controlId: "CM-6", controlName: "Configuration Settings", requirement: "Establish mandatory configuration settings for IT systems including containers." },
    { frameworkId: "nist", controlId: "AC-6", controlName: "Least Privilege", requirement: "Employ the principle of least privilege for container execution." },
    { frameworkId: "cis", controlId: "5.7", controlName: "CIS Docker Benchmark", requirement: "Follow CIS Docker Benchmark for container hardening." },
    { frameworkId: "gdpr", controlId: "Art.32", controlName: "Security of Processing", requirement: "Harden containerized processing environments to protect personal data." },
    { frameworkId: "owasp", controlId: "A05:2021", controlName: "Security Misconfiguration", requirement: "Properly configure and harden all container deployments." },
  ],

  // ── IaC / Infrastructure Configuration ──
  "iac": [
    { frameworkId: "soc2", controlId: "CC6.6", controlName: "Security Boundaries", requirement: "Infrastructure must be configured with proper security boundaries." },
    { frameworkId: "soc2", controlId: "CC6.1", controlName: "Logical Access Security", requirement: "Apply least-privilege IAM policies in infrastructure definitions." },
    { frameworkId: "iso27001", controlId: "A.12.1.4", controlName: "Separation of Environments", requirement: "Development, testing, and operational environments shall be separated." },
    { frameworkId: "iso27001", controlId: "A.13.1.3", controlName: "Segregation in Networks", requirement: "Segregate groups of information services in network configurations." },
    { frameworkId: "pci-dss", controlId: "2.2", controlName: "Configuration Standards", requirement: "Develop configuration standards for all system components." },
    { frameworkId: "pci-dss", controlId: "1.3", controlName: "Network Access Controls", requirement: "Prohibit direct public access to any system component in the cardholder data environment." },
    { frameworkId: "hipaa", controlId: "164.312(a)(1)", controlName: "Access Control", requirement: "Implement technical access control policies in infrastructure." },
    { frameworkId: "hipaa", controlId: "164.310(a)(1)", controlName: "Facility Access Controls", requirement: "Implement policies to limit physical and logical access to electronic information systems." },
    { frameworkId: "nist", controlId: "CM-2", controlName: "Baseline Configuration", requirement: "Develop, document, and maintain baseline configurations." },
    { frameworkId: "nist", controlId: "AC-3", controlName: "Access Enforcement", requirement: "Enforce approved authorizations for all infrastructure access." },
    { frameworkId: "cis", controlId: "4.0", controlName: "Infrastructure Security", requirement: "Secure network infrastructure configuration." },
    { frameworkId: "cis", controlId: "3.3", controlName: "Data Protection Configuration", requirement: "Configure data protection settings in cloud infrastructure." },
    { frameworkId: "gdpr", controlId: "Art.32", controlName: "Security of Processing", requirement: "Implement infrastructure-level security measures for data protection." },
    { frameworkId: "owasp", controlId: "A05:2021", controlName: "Security Misconfiguration", requirement: "Apply proper security configurations to all infrastructure components." },
  ],

  // ── License Compliance ──
  "license": [
    { frameworkId: "soc2", controlId: "CC9.2", controlName: "Vendor Risk Management", requirement: "Manage risks associated with third-party components and licenses." },
    { frameworkId: "soc2", controlId: "CC3.2", controlName: "Risk Assessment", requirement: "Assess risks from third-party components including license obligations." },
    { frameworkId: "iso27001", controlId: "A.18.1.2", controlName: "Intellectual Property Rights", requirement: "Appropriate procedures shall be implemented to ensure compliance with IP requirements." },
    { frameworkId: "iso27001", controlId: "A.15.1.2", controlName: "Addressing Security in Supplier Agreements", requirement: "Ensure all relevant compliance requirements are established with suppliers." },
    { frameworkId: "pci-dss", controlId: "6.3", controlName: "Software Development", requirement: "Ensure third-party software components are properly licensed and compliant." },
    { frameworkId: "nist", controlId: "SR-3", controlName: "Supply Chain Controls", requirement: "Employ supply chain risk management practices for third-party components." },
    { frameworkId: "gdpr", controlId: "Art.28", controlName: "Processor Obligations", requirement: "Ensure third-party components comply with data processing agreements." },
    { frameworkId: "gdpr", controlId: "Art.5", controlName: "Lawfulness of Processing", requirement: "Ensure all processing is lawful including compliance with software licenses." },
    { frameworkId: "owasp", controlId: "A06:2021", controlName: "Vulnerable & Outdated Components", requirement: "Know the licenses and dependencies of all components used." },
  ],

  // ── SBOM ──
  "sbom": [
    { frameworkId: "nist", controlId: "SR-4", controlName: "Provenance", requirement: "Document the provenance of system components in the supply chain." },
    { frameworkId: "nist", controlId: "CM-8", controlName: "Information System Component Inventory", requirement: "Develop and maintain an inventory of all system components." },
    { frameworkId: "soc2", controlId: "CC7.1", controlName: "System Component Inventory", requirement: "Maintain a complete inventory of all software components." },
    { frameworkId: "soc2", controlId: "CC9.2", controlName: "Vendor Risk Management", requirement: "Identify and manage third-party component risks with SBOMs." },
    { frameworkId: "iso27001", controlId: "A.8.1.1", controlName: "Inventory of Assets", requirement: "Assets associated with information and facilities shall be identified." },
    { frameworkId: "iso27001", controlId: "A.12.6.1", controlName: "Management of Technical Vulnerabilities", requirement: "Maintain software inventory to facilitate vulnerability management." },
    { frameworkId: "pci-dss", controlId: "6.3", controlName: "Software Development", requirement: "Identify all custom and third-party software components." },
    { frameworkId: "pci-dss", controlId: "6.3.2", controlName: "Software Inventory", requirement: "Maintain an inventory of bespoke and custom software." },
    { frameworkId: "hipaa", controlId: "164.308(a)(1)", controlName: "Risk Analysis", requirement: "Maintain inventory to conduct accurate risk assessments of all software components." },
    { frameworkId: "cis", controlId: "2.1", controlName: "Software Inventory", requirement: "Maintain a detailed inventory of all authorized software." },
    { frameworkId: "gdpr", controlId: "Art.30", controlName: "Records of Processing", requirement: "Maintain records of processing activities including software components used." },
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
  category?: string;
  compliance?: string[];
  id?: string;
}

/**
 * Normalize the scanType from a finding.
 * Findings may come with category instead of scanType, or with
 * IDs that include a prefix like "docker-no-user" or "iac-s3-public".
 */
function resolveCategory(f: ScanFinding): string {
  if (f.scanType && f.scanType !== "unknown") return f.scanType;
  if (f.category && f.category !== "unknown") return f.category;
  // Try to infer from id prefix
  const id = (f.id || "").toLowerCase();
  if (id.startsWith("docker-")) return "docker";
  if (id.startsWith("iac-")) return "iac";
  if (id.startsWith("secret") || id.startsWith("credential")) return "secrets";
  if (id.startsWith("dep-") || id.startsWith("cve-")) return "deps";
  if (id.startsWith("api-") || id.startsWith("header-")) return "api";
  if (id.startsWith("cloud-") || id.startsWith("aws-") || id.startsWith("gcp-") || id.startsWith("azure-")) return "cloud";
  if (id.startsWith("sast-") || id.startsWith("xss") || id.startsWith("sqli") || id.startsWith("injection")) return "sast";
  if (id.startsWith("log-") || id.startsWith("brute") || id.startsWith("threat")) return "logs";
  if (id.startsWith("license")) return "license";
  if (id.startsWith("sbom")) return "sbom";
  return f.scanType || "unknown";
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

  // Count findings by scan type (with normalization)
  const findingsByCategory: Record<string, number> = {};
  for (const f of findings) {
    const cat = resolveCategory(f);
    findingsByCategory[cat] = (findingsByCategory[cat] || 0) + 1;
  }

  // Build severity-weighted finding counts per category for scoring
  const severityWeights: Record<string, number> = { critical: 1.0, high: 0.75, medium: 0.4, low: 0.15, info: 0.05 };
  const weightedByCategory: Record<string, number> = {};
  for (const f of findings) {
    const cat = resolveCategory(f);
    const w = severityWeights[(f.severity || "medium").toLowerCase()] ?? 0.4;
    weightedByCategory[cat] = (weightedByCategory[cat] || 0) + w;
  }

  const frameworkReports: FrameworkReport[] = frameworksToCheck.map(framework => {
    // Collect all controls relevant to the findings we have
    const relevantControls = new Map<string, { controlName: string; requirement: string; affectedFindings: number; weightedSeverity: number }>();

    for (const [category, mappings] of Object.entries(CONTROL_MAPPINGS)) {
      const categoryFindings = findingsByCategory[category] || 0;
      if (categoryFindings === 0) continue;

      for (const mapping of mappings) {
        if (mapping.frameworkId !== framework.id) continue;

        const existing = relevantControls.get(mapping.controlId);
        if (existing) {
          existing.affectedFindings += categoryFindings;
          existing.weightedSeverity += weightedByCategory[category] || 0;
        } else {
          relevantControls.set(mapping.controlId, {
            controlName: mapping.controlName,
            requirement: mapping.requirement,
            affectedFindings: categoryFindings,
            weightedSeverity: weightedByCategory[category] || 0,
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

    // Severity-weighted scoring: heavier penalty for critical/high findings on a control
    let complianceScore: number;
    if (findings.length === 0) {
      complianceScore = 100;
    } else {
      // Each failed control reduces score, but severity-proportioned
      const totalWeight = Array.from(relevantControls.values()).reduce((s, v) => s + v.weightedSeverity, 0);
      const maxPossible = controlsChecked * 1.0; // 1.0 = max weight per control
      const penalty = Math.min(totalWeight / Math.max(maxPossible, 1), 1);
      complianceScore = Math.round((1 - penalty) * 100);
    }

    const controlsPassed = controlsChecked - failedControls.length;

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
  if (findingsByCategory["ai-review"]) recommendations.push("Address business logic flaws and authorization gaps identified by AI review. Implement IDOR protection and race condition safeguards.");
  if (findingsByCategory.cicd) recommendations.push("Enforce security gates in CI/CD pipeline. Ensure all deployments pass SAST, dependency, and secrets scans.");
  if (findingsByCategory.api) recommendations.push("Implement missing security headers (CSP, HSTS, X-Frame-Options). Strengthen API authentication and rate limiting.");
  if (findingsByCategory.sbom) recommendations.push("Review SBOM for unlicensed or unknown components. Ensure all third-party components are tracked and inventoried.");

  return {
    timestamp: new Date().toISOString(),
    overallScore,
    frameworks: frameworkReports,
    totalFindings: findings.length,
    findingsByCategory,
    recommendations,
  };
}
