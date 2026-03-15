// Weekly Security Reports — curated from major security sources
// These serve as static seed data; the database stores additional reports over time

export interface WeeklyReport {
  id: string;
  weekNumber: number;
  year: number;
  title: string;
  summary: string;
  dateRange: { start: string; end: string };
  highlights: {
    title: string;
    description: string;
    severity: "Critical" | "High" | "Medium" | "Low" | "Info";
    source: string;
    sourceUrl: string;
    cveId?: string;
    affectedProducts?: string[];
  }[];
  stats: {
    totalCVEs: number;
    criticalCVEs: number;
    highCVEs: number;
    mediumCVEs: number;
    lowCVEs: number;
    topVendors: { vendor: string; count: number }[];
    topCWEs: { cweId: string; name: string; count: number }[];
  };
  majorBreaches: {
    organization: string;
    description: string;
    recordsAffected: string;
    source: string;
  }[];
  trendingThreats: {
    name: string;
    description: string;
    category: string;
  }[];
  recommendations: string[];
  sources: { name: string; url: string }[];
}

export const weeklyReports: WeeklyReport[] = [
  {
    id: "2026-w11",
    weekNumber: 11,
    year: 2026,
    title: "Critical Supply Chain Attacks & Major CVEs — Week 11",
    summary:
      "A high-impact week with 847 new CVEs published, including critical vulnerabilities in popular open-source libraries, a major supply chain attack targeting npm packages, and continued exploitation of edge device firmware.",
    dateRange: { start: "2026-03-09", end: "2026-03-15" },
    highlights: [
      {
        title: "Critical RCE in Popular Node.js ORM Library",
        description:
          "A critical remote code execution vulnerability (CVSS 9.8) was discovered in a widely-used Node.js ORM library affecting over 2.3 million weekly downloads. The flaw allows unauthenticated attackers to execute arbitrary code via crafted query parameters. Immediate patching is required.",
        severity: "Critical",
        source: "NVD / NIST",
        sourceUrl: "https://nvd.nist.gov",
        cveId: "CVE-2026-1847",
        affectedProducts: ["Node.js ORM v8.x", "Node.js ORM v9.0-9.2"],
      },
      {
        title: "Supply Chain Attack on npm Registry — 14 Packages Compromised",
        description:
          "Threat actors compromised maintainer accounts of 14 popular npm packages, injecting credential-stealing malware into post-install scripts. The packages collectively had 8M+ weekly downloads. GitHub has revoked affected tokens.",
        severity: "Critical",
        source: "GitHub Advisory Database",
        sourceUrl: "https://github.com/advisories",
        affectedProducts: ["Various npm packages"],
      },
      {
        title: "Cisco IOS XE Authentication Bypass",
        description:
          "Cisco disclosed a critical authentication bypass in IOS XE web UI (CVSS 9.1). Attackers can gain admin access to affected network devices without valid credentials. Active exploitation observed in the wild.",
        severity: "Critical",
        source: "Cisco Security Advisory",
        sourceUrl: "https://sec.cloudapps.cisco.com/security/center",
        cveId: "CVE-2026-1792",
        affectedProducts: ["Cisco IOS XE 17.x"],
      },
      {
        title: "WordPress Plugin Stored XSS Affects 4M Sites",
        description:
          "A stored cross-site scripting vulnerability in a major WordPress SEO plugin allows attackers to inject malicious scripts via meta description fields, executing in admin browsers.",
        severity: "High",
        source: "WPScan",
        sourceUrl: "https://wpscan.com",
        cveId: "CVE-2026-1903",
        affectedProducts: ["WordPress SEO Plugin v7.x"],
      },
      {
        title: "Linux Kernel Privilege Escalation — io_uring Subsystem",
        description:
          "A local privilege escalation vulnerability in the Linux kernel's io_uring subsystem allows unprivileged users to gain root access on affected systems. Kernel versions 6.1-6.8 are vulnerable.",
        severity: "High",
        source: "kernel.org security",
        sourceUrl: "https://kernel.org",
        cveId: "CVE-2026-1856",
        affectedProducts: ["Linux Kernel 6.1-6.8"],
      },
    ],
    stats: {
      totalCVEs: 847,
      criticalCVEs: 42,
      highCVEs: 186,
      mediumCVEs: 394,
      lowCVEs: 225,
      topVendors: [
        { vendor: "Microsoft", count: 78 },
        { vendor: "Google", count: 54 },
        { vendor: "Apache", count: 41 },
        { vendor: "Linux", count: 38 },
        { vendor: "Cisco", count: 35 },
        { vendor: "WordPress", count: 29 },
        { vendor: "Oracle", count: 24 },
      ],
      topCWEs: [
        { cweId: "CWE-79", name: "Cross-site Scripting", count: 112 },
        { cweId: "CWE-89", name: "SQL Injection", count: 87 },
        { cweId: "CWE-287", name: "Improper Authentication", count: 64 },
        { cweId: "CWE-862", name: "Missing Authorization", count: 53 },
        { cweId: "CWE-22", name: "Path Traversal", count: 41 },
      ],
    },
    majorBreaches: [
      {
        organization: "Global Healthcare Network",
        description:
          "Ransomware group breached healthcare provider, exfiltrating patient records including diagnoses and insurance data. Double extortion tactics used.",
        recordsAffected: "2.1 million",
        source: "HaveIBeenPwned / BleepingComputer",
      },
      {
        organization: "Eastern European Fintech",
        description:
          "API vulnerability exploited to access customer financial transaction data. Unauthorized access persisted for 3 weeks before detection.",
        recordsAffected: "890,000",
        source: "Reuters / DataBreaches.net",
      },
    ],
    trendingThreats: [
      {
        name: "AI-Powered Phishing Campaigns",
        description:
          "Threat actors increasingly using LLMs to generate highly convincing phishing emails that bypass traditional NLP-based email security filters.",
        category: "Social Engineering",
      },
      {
        name: "Edge Device Exploitation",
        description:
          "Continued targeting of VPN appliances, firewalls, and load balancers by APT groups. Focus on Cisco, Fortinet, and Palo Alto devices.",
        category: "Network Security",
      },
      {
        name: "Container Escape Techniques",
        description:
          "New kernel-level container escape techniques demonstrated, affecting both Docker and Kubernetes environments with default configurations.",
        category: "Cloud Security",
      },
    ],
    recommendations: [
      "Immediately audit npm dependencies for compromised packages — run `npm audit` and check GitHub advisories",
      "Patch Cisco IOS XE devices if running version 17.x — apply emergency update",
      "Update Linux kernels on affected systems (6.1-6.8) to latest stable release",
      "Implement strict Content Security Policy headers to mitigate stored XSS attacks",
      "Enable MFA on all developer accounts, especially npm/PyPI/GitHub maintainer accounts",
      "Review API rate limiting and input validation for public-facing endpoints",
    ],
    sources: [
      { name: "NVD / NIST", url: "https://nvd.nist.gov" },
      { name: "GitHub Advisory Database", url: "https://github.com/advisories" },
      { name: "CISA Known Exploited Vulnerabilities", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
      { name: "BleepingComputer", url: "https://www.bleepingcomputer.com" },
      { name: "The Hacker News", url: "https://thehackernews.com" },
      { name: "Krebs on Security", url: "https://krebsonsecurity.com" },
    ],
  },
  {
    id: "2026-w10",
    weekNumber: 10,
    year: 2026,
    title: "Zero-Day Exploits & Cloud Service Vulnerabilities — Week 10",
    summary:
      "Week dominated by zero-day disclosures in browser engines, critical cloud service misconfigurations leading to data exposure, and a new ransomware variant targeting industrial control systems.",
    dateRange: { start: "2026-03-02", end: "2026-03-08" },
    highlights: [
      {
        title: "Chrome V8 Zero-Day Actively Exploited",
        description:
          "Google released an emergency patch for a type confusion vulnerability in V8 JavaScript engine. The flaw was being actively exploited in targeted attacks via malicious websites.",
        severity: "Critical",
        source: "Google Chrome Blog",
        sourceUrl: "https://chromereleases.googleblog.com",
        cveId: "CVE-2026-1723",
        affectedProducts: ["Google Chrome < 133.0.6943.127"],
      },
      {
        title: "Azure AD Conditional Access Policy Bypass",
        description:
          "Researchers discovered a method to bypass Azure AD Conditional Access policies using modified authentication tokens, potentially granting unauthorized access to protected resources.",
        severity: "High",
        source: "Microsoft Security Response Center",
        sourceUrl: "https://msrc.microsoft.com",
        cveId: "CVE-2026-1688",
        affectedProducts: ["Microsoft Azure AD", "Microsoft Entra ID"],
      },
      {
        title: "Apache Kafka Deserialization RCE",
        description:
          "Critical deserialization vulnerability in Apache Kafka Connect allows remote attackers to execute arbitrary code by sending specially crafted connector configurations.",
        severity: "Critical",
        source: "Apache Security",
        sourceUrl: "https://security.apache.org",
        cveId: "CVE-2026-1756",
        affectedProducts: ["Apache Kafka 3.x"],
      },
      {
        title: "Industrial Ransomware Variant 'VoltStorm'",
        description:
          "New ransomware variant specifically targets SCADA systems and PLCs in manufacturing environments. Uses legitimate remote management tools for lateral movement.",
        severity: "Critical",
        source: "Mandiant Threat Intelligence",
        sourceUrl: "https://www.mandiant.com",
      },
      {
        title: "Python Package Index Typosquatting Campaign",
        description:
          "Over 200 malicious packages discovered on PyPI mimicking popular libraries. Packages contained data exfiltration scripts and cryptocurrency miners.",
        severity: "High",
        source: "Phylum Research",
        sourceUrl: "https://blog.phylum.io",
      },
    ],
    stats: {
      totalCVEs: 792,
      criticalCVEs: 38,
      highCVEs: 167,
      mediumCVEs: 371,
      lowCVEs: 216,
      topVendors: [
        { vendor: "Google", count: 65 },
        { vendor: "Microsoft", count: 61 },
        { vendor: "Apache", count: 44 },
        { vendor: "Red Hat", count: 32 },
        { vendor: "Adobe", count: 28 },
        { vendor: "SAP", count: 22 },
        { vendor: "VMware", count: 19 },
      ],
      topCWEs: [
        { cweId: "CWE-79", name: "Cross-site Scripting", count: 98 },
        { cweId: "CWE-502", name: "Deserialization of Untrusted Data", count: 72 },
        { cweId: "CWE-918", name: "Server-Side Request Forgery", count: 58 },
        { cweId: "CWE-94", name: "Code Injection", count: 45 },
        { cweId: "CWE-269", name: "Improper Privilege Management", count: 39 },
      ],
    },
    majorBreaches: [
      {
        organization: "Major Cloud Provider Customer Data",
        description:
          "Misconfigured S3 buckets exposed customer backup data for a major SaaS provider. Data included encrypted passwords and API keys.",
        recordsAffected: "3.4 million",
        source: "TechCrunch / SecurityWeek",
      },
    ],
    trendingThreats: [
      {
        name: "Browser Zero-Days in Targeted Attacks",
        description:
          "Increased use of browser zero-days by state-sponsored groups targeting journalists and dissidents.",
        category: "Advanced Persistent Threats",
      },
      {
        name: "Cloud-Native Cryptojacking",
        description:
          "Attackers exploiting misconfigured Kubernetes clusters to deploy cryptocurrency miners using legitimate orchestration tools.",
        category: "Cloud Security",
      },
    ],
    recommendations: [
      "Update Google Chrome immediately — zero-day actively exploited (CVE-2026-1723)",
      "Review Azure AD Conditional Access policies and enable Continuous Access Evaluation",
      "Audit Apache Kafka Connect configurations and restrict connector management",
      "Implement strict network segmentation for ICS/SCADA environments",
      "Verify PyPI dependencies against known-good hashes — use pip-audit",
      "Enable cloud storage access logging and set up alerts for public bucket creation",
    ],
    sources: [
      { name: "NVD / NIST", url: "https://nvd.nist.gov" },
      { name: "Google Chrome Releases", url: "https://chromereleases.googleblog.com" },
      { name: "MSRC", url: "https://msrc.microsoft.com" },
      { name: "CISA Alerts", url: "https://www.cisa.gov/news-events/cybersecurity-advisories" },
      { name: "BleepingComputer", url: "https://www.bleepingcomputer.com" },
      { name: "SecurityWeek", url: "https://www.securityweek.com" },
    ],
  },
  {
    id: "2026-w09",
    weekNumber: 9,
    year: 2026,
    title: "API Security Incidents & Firmware Vulnerabilities — Week 9",
    summary:
      "Major API security incidents dominated this week with two high-profile breaches attributed to broken authentication. Critical firmware vulnerabilities in IoT devices and a new wave of SEO poisoning campaigns were also reported.",
    dateRange: { start: "2026-02-23", end: "2026-03-01" },
    highlights: [
      {
        title: "BOLA Vulnerability Exposes Million Financial Records",
        description:
          "Broken Object Level Authorization (BOLA) flaw in a banking API allowed authenticated users to access any customer's account details by modifying the account ID parameter.",
        severity: "Critical",
        source: "HackerOne / Bug Bounty Disclosure",
        sourceUrl: "https://hackerone.com",
        cveId: "CVE-2026-1641",
        affectedProducts: ["FinServ API Platform v4.x"],
      },
      {
        title: "Router Firmware Zero-Day Affects 12 Manufacturers",
        description:
          "A shared vulnerable SDK used in router firmware across 12 manufacturers allows unauthenticated remote code execution. Over 5 million devices estimated to be affected worldwide.",
        severity: "Critical",
        source: "CERT/CC",
        sourceUrl: "https://www.kb.cert.org",
        cveId: "CVE-2026-1598",
        affectedProducts: ["Multiple IoT routers using Realtek SDK"],
      },
      {
        title: "GitLab Critical Path Traversal",
        description:
          "Critical path traversal vulnerability in GitLab CE/EE allows authenticated users to read arbitrary files on the server, potentially exposing secrets and configuration.",
        severity: "High",
        source: "GitLab Security Release",
        sourceUrl: "https://about.gitlab.com/releases/categories/releases/",
        cveId: "CVE-2026-1577",
        affectedProducts: ["GitLab CE/EE 16.x-17.x"],
      },
    ],
    stats: {
      totalCVEs: 715,
      criticalCVEs: 31,
      highCVEs: 142,
      mediumCVEs: 348,
      lowCVEs: 194,
      topVendors: [
        { vendor: "Microsoft", count: 52 },
        { vendor: "Google", count: 47 },
        { vendor: "Linux", count: 39 },
        { vendor: "Apple", count: 34 },
        { vendor: "Fortinet", count: 27 },
        { vendor: "GitLab", count: 18 },
        { vendor: "Realtek", count: 15 },
      ],
      topCWEs: [
        { cweId: "CWE-639", name: "Authorization Bypass (IDOR)", count: 89 },
        { cweId: "CWE-22", name: "Path Traversal", count: 67 },
        { cweId: "CWE-78", name: "OS Command Injection", count: 52 },
        { cweId: "CWE-434", name: "Unrestricted File Upload", count: 44 },
        { cweId: "CWE-120", name: "Buffer Overflow", count: 38 },
      ],
    },
    majorBreaches: [
      {
        organization: "Regional Telecom Provider",
        description:
          "API vulnerability exploited to dump customer billing records, call logs, and personal information over a 6-week period.",
        recordsAffected: "1.7 million",
        source: "DataBreaches.net",
      },
    ],
    trendingThreats: [
      {
        name: "SEO Poisoning for Malware Distribution",
        description:
          "Threat actors using SEO poisoning to rank malicious sites for popular software downloads, distributing info-stealers via fake installers.",
        category: "Malware",
      },
      {
        name: "API-first Attacks",
        description:
          "Dramatic increase in automated API attacks using tools like ffuf and nuclei templates targeting BOLA, BFLA, and mass assignment flaws.",
        category: "API Security",
      },
    ],
    recommendations: [
      "Implement object-level authorization checks on ALL API endpoints",
      "Update router firmware across all network infrastructure — check vendor advisories",
      "Patch GitLab instances immediately if running CE/EE 16.x or 17.x",
      "Deploy API gateway with request validation and anomaly detection",
      "Use verified download sources only — verify cryptographic signatures for software",
      "Conduct quarterly API security assessments focusing on OWASP API Top 10",
    ],
    sources: [
      { name: "NVD / NIST", url: "https://nvd.nist.gov" },
      { name: "CERT/CC", url: "https://www.kb.cert.org" },
      { name: "CISA Known Exploited Vulnerabilities", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" },
      { name: "The Hacker News", url: "https://thehackernews.com" },
      { name: "Krebs on Security", url: "https://krebsonsecurity.com" },
    ],
  },
  {
    id: "2026-w08",
    weekNumber: 8,
    year: 2026,
    title: "Patch Tuesday Mega-Release & AI Model Attacks — Week 8",
    summary:
      "Microsoft's Patch Tuesday addressed 127 vulnerabilities including 4 zero-days. New adversarial attacks against AI/ML models demonstrated. Major open-source project compromise detected via commit signing bypass.",
    dateRange: { start: "2026-02-16", end: "2026-02-22" },
    highlights: [
      {
        title: "Microsoft Patch Tuesday — 127 Vulnerabilities, 4 Zero-Days",
        description:
          "Microsoft released patches for 127 vulnerabilities, including 4 actively exploited zero-days in Windows kernel, Exchange Server, and Office. 11 are rated Critical.",
        severity: "Critical",
        source: "Microsoft Security Update Guide",
        sourceUrl: "https://msrc.microsoft.com/update-guide",
        affectedProducts: ["Windows 10/11", "Windows Server", "Exchange Server", "Microsoft Office"],
      },
      {
        title: "AI Model Poisoning Attack on Public Dataset",
        description:
          "Researchers demonstrated successful data poisoning attack on a widely-used public ML training dataset, causing models trained on it to produce biased or dangerous outputs.",
        severity: "High",
        source: "arXiv / AI Security Research",
        sourceUrl: "https://arxiv.org",
      },
      {
        title: "OpenSSH Pre-Auth RCE Variant",
        description:
          "New variant of the regreSSHion vulnerability discovered affecting specific configurations of OpenSSH with glibc-based systems. Allows remote code execution before authentication.",
        severity: "Critical",
        source: "Qualys Threat Research",
        sourceUrl: "https://www.qualys.com/research/security-advisories",
        cveId: "CVE-2026-1489",
        affectedProducts: ["OpenSSH 9.x with specific glibc versions"],
      },
    ],
    stats: {
      totalCVEs: 923,
      criticalCVEs: 56,
      highCVEs: 201,
      mediumCVEs: 412,
      lowCVEs: 254,
      topVendors: [
        { vendor: "Microsoft", count: 127 },
        { vendor: "Google", count: 42 },
        { vendor: "Adobe", count: 38 },
        { vendor: "Apple", count: 31 },
        { vendor: "SAP", count: 24 },
        { vendor: "Fortinet", count: 19 },
        { vendor: "VMware", count: 16 },
      ],
      topCWEs: [
        { cweId: "CWE-416", name: "Use After Free", count: 84 },
        { cweId: "CWE-787", name: "Out-of-bounds Write", count: 71 },
        { cweId: "CWE-79", name: "Cross-site Scripting", count: 63 },
        { cweId: "CWE-200", name: "Exposure of Sensitive Information", count: 58 },
        { cweId: "CWE-20", name: "Improper Input Validation", count: 52 },
      ],
    },
    majorBreaches: [
      {
        organization: "Major E-Commerce Platform",
        description:
          "SQL injection in legacy payment processing module led to exposure of partial credit card data and shipping addresses.",
        recordsAffected: "4.8 million",
        source: "BleepingComputer / PCI DSS reports",
      },
      {
        organization: "Educational Technology Company",
        description:
          "Misconfigured Firebase database exposed student records including grades, disciplinary actions, and parent contact information.",
        recordsAffected: "720,000 students",
        source: "Cybersecurity researcher disclosure",
      },
    ],
    trendingThreats: [
      {
        name: "AI/ML Supply Chain Attacks",
        description:
          "Growing trend of attacks targeting AI training data, model weights, and ML pipeline infrastructure.",
        category: "AI Security",
      },
      {
        name: "Commit Signing Bypass in CI/CD",
        description:
          "Techniques to inject malicious code into repositories while appearing to have valid commit signatures.",
        category: "Supply Chain",
      },
    ],
    recommendations: [
      "Apply Microsoft Patch Tuesday updates immediately — 4 zero-days under active exploitation",
      "Verify OpenSSH configurations and update to latest version",
      "Audit AI/ML training data sources and implement data validation pipelines",
      "Enforce commit signing verification in CI/CD pipelines with hardware-backed keys",
      "Review Firebase/cloud database security rules — ensure no public read access",
      "Implement WAF rules for SQL injection patterns on legacy systems",
    ],
    sources: [
      { name: "Microsoft Security Update Guide", url: "https://msrc.microsoft.com/update-guide" },
      { name: "NVD / NIST", url: "https://nvd.nist.gov" },
      { name: "CISA", url: "https://www.cisa.gov" },
      { name: "Qualys", url: "https://www.qualys.com" },
      { name: "BleepingComputer", url: "https://www.bleepingcomputer.com" },
    ],
  },
];
