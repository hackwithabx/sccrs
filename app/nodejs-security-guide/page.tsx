

import React from "react";

export const metadata = {
  title: "Node.js Security Guide | SecureCodeReviews.com",
  description:
    "Comprehensive Node.js security best practices, common vulnerabilities, and secure coding techniques for developers. Learn how to protect your Node.js applications from attacks.",
};

export default function NodeJsSecurityGuidePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 prose prose-neutral dark:prose-invert">
      <h1>Node.js Security Guide</h1>
      <p>
        Node.js is a powerful platform for building scalable web applications, but its flexibility can expose apps to a wide range of security risks. This guide covers essential Node.js security best practices, common vulnerabilities, and actionable steps to secure your applications.
      </p>

      <h2>1. Keep Dependencies Up to Date</h2>
      <ul>
        <li>Use <code>npm audit</code> and <code>npm outdated</code> to identify vulnerable packages.</li>
        <li>Regularly update dependencies and remove unused packages.</li>
        <li>Prefer well-maintained libraries with active security support.</li>
      </ul>

      <h2>2. Validate and Sanitize User Input</h2>
      <ul>
        <li>Always validate input on the server side using libraries like <code>joi</code> or <code>zod</code>.</li>
        <li>Sanitize input to prevent injection attacks (SQL, NoSQL, command, etc.).</li>
        <li>Use allow-lists (not block-lists) for input validation.</li>
      </ul>

      <h2>3. Prevent Injection Attacks</h2>
      <ul>
        <li>Use parameterized queries for SQL/NoSQL databases (e.g., Mongoose, Sequelize).</li>
        <li>Never construct database queries or shell commands from untrusted input.</li>
        <li>Escape user input where necessary.</li>
      </ul>

      <h2>4. Secure Authentication & Authorization</h2>
      <ul>
        <li>Use strong password hashing (e.g., <code>bcrypt</code>).</li>
        <li>Implement multi-factor authentication (MFA) for sensitive actions.</li>
        <li>Use secure, signed JWTs or session cookies with <code>httpOnly</code> and <code>secure</code> flags.</li>
        <li>Enforce role-based access control (RBAC) for APIs and admin routes.</li>
      </ul>

      <h2>5. Protect Against Cross-Site Scripting (XSS)</h2>
      <ul>
        <li>Escape output in templates and APIs.</li>
        <li>Use libraries like <code>DOMPurify</code> for sanitizing HTML.</li>
        <li>Set Content Security Policy (CSP) headers.</li>
      </ul>

      <h2>6. Prevent Cross-Site Request Forgery (CSRF)</h2>
      <ul>
        <li>Use CSRF tokens for state-changing requests (e.g., <code>csurf</code> middleware).</li>
        <li>Set <code>SameSite</code> cookies where possible.</li>
      </ul>

      <h2>7. Secure HTTP Headers</h2>
      <ul>
        <li>Set security headers: <code>Strict-Transport-Security</code>, <code>X-Frame-Options</code>, <code>X-Content-Type-Options</code>, <code>Referrer-Policy</code>, <code>Permissions-Policy</code>, <code>Content-Security-Policy</code>.</li>
        <li>Use libraries like <code>helmet</code> to automate header management.</li>
      </ul>

      <h2>8. Handle Errors Securely</h2>
      <ul>
        <li>Never expose stack traces or internal error details to users.</li>
        <li>Log errors securely and monitor for suspicious activity.</li>
      </ul>

      <h2>9. Secure File Uploads</h2>
      <ul>
        <li>Validate file type, size, and content.</li>
        <li>Store uploads outside the web root and scan for malware.</li>
        <li>Rename files to avoid path traversal and overwrites.</li>
      </ul>

      <h2>10. Use HTTPS Everywhere</h2>
      <ul>
        <li>Enforce HTTPS using HSTS headers.</li>
        <li>Redirect all HTTP traffic to HTTPS.</li>
        <li>Never transmit sensitive data over plain HTTP.</li>
      </ul>

      <h2>11. Environment Variables & Secrets</h2>
      <ul>
        <li>Never commit secrets or credentials to source control.</li>
        <li>Use environment variables for configuration and secrets.</li>
        <li>Rotate secrets regularly and restrict access.</li>
      </ul>

      <h2>12. Monitor & Audit</h2>
      <ul>
        <li>Enable logging and monitor for anomalies.</li>
        <li>Use tools like <code>winston</code> or <code>pino</code> for structured logging.</li>
        <li>Set up alerting for suspicious activity.</li>
      </ul>

      <h2>13. Common Node.js Vulnerabilities</h2>
      <ul>
        <li>Prototype Pollution</li>
        <li>Denial of Service (DoS)</li>
        <li>Insecure Deserialization</li>
        <li>Directory Traversal</li>
        <li>Untrusted Code Execution (eval, Function)</li>
        <li>Insecure Regular Expressions (ReDoS)</li>
      </ul>

      <h2>14. Recommended Security Tools</h2>
      <ul>
        <li><a href="https://www.npmjs.com/package/helmet" target="_blank" rel="noopener noreferrer">helmet</a> — Secure HTTP headers</li>
        <li><a href="https://www.npmjs.com/package/csurf" target="_blank" rel="noopener noreferrer">csurf</a> — CSRF protection</li>
        <li><a href="https://www.npmjs.com/package/joi" target="_blank" rel="noopener noreferrer">joi</a> — Input validation</li>
        <li><a href="https://www.npmjs.com/package/zod" target="_blank" rel="noopener noreferrer">zod</a> — Input validation</li>
        <li><a href="https://www.npmjs.com/package/npm-audit" target="_blank" rel="noopener noreferrer">npm audit</a> — Dependency vulnerability scanner</li>
        <li><a href="https://www.npmjs.com/package/winston" target="_blank" rel="noopener noreferrer">winston</a> — Logging</li>
        <li><a href="https://www.npmjs.com/package/pino" target="_blank" rel="noopener noreferrer">pino</a> — Logging</li>
        <li><a href="https://snyk.io/" target="_blank" rel="noopener noreferrer">Snyk</a> — Vulnerability scanning</li>
      </ul>

      <h2>15. Further Reading</h2>
      <ul>
        <li><a href="https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html" target="_blank" rel="noopener noreferrer">OWASP Node.js Security Cheat Sheet</a></li>
        <li><a href="https://nodejs.org/en/docs/guides/security/" target="_blank" rel="noopener noreferrer">Node.js Official Security Docs</a></li>
        <li><a href="https://blog.sqreen.com/nodejs-security-best-practices/" target="_blank" rel="noopener noreferrer">Node.js Security Best Practices (Sqreen)</a></li>
      </ul>

      <hr />
      <p>
        <strong>Need a professional Node.js security review?</strong> <a href="/contact">Contact our team</a> for a detailed assessment and secure code audit.
      </p>
    </main>
  );
}
