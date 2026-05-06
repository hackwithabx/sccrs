import { BlogPost } from "./blog-data";

export const trafficBatch6Articles: BlogPost[] = [
  {
    slug: "clickjacking-attack-explained-prevention-security-guide",
    title: "Clickjacking Attack Explained: Prevention, Examples, and Security Guide",
    excerpt:
      "Clickjacking is easy to dismiss because the payload is just a click, not an exploit string. This article focuses on where framing bugs still matter, why teams miss them, and how to shut them down cleanly with modern header policy.",
    content: `## Clickjacking Is Quiet, Which Is Why It Gets Missed

Clickjacking rarely looks dramatic in a backlog or security report. There is no shell, no SQL dump, no stack trace. The application is simply willing to be framed, and the attacker lets the victim do the rest.

That makes it easy for teams to underestimate. In practice, though, any authenticated page with meaningful one-click actions can become useful to an attacker if it can be embedded and visually manipulated.

Clickjacking is a UI redressing attack where a malicious page loads your site inside a hidden or disguised iframe and tricks the user into clicking something they never intended to click.

Typical outcomes include:

- Changing account settings
- Approving sensitive actions
- Starting payments or wire transfers
- Granting OAuth permissions
- Enabling camera or microphone access

| Attack Goal | Example Impact |
|---|---|
| Account takeover support | User approves security-setting changes |
| Payment fraud | User clicks a hidden transfer confirmation button |
| OAuth consent abuse | User authorizes a malicious third-party app |
| Internal tool abuse | Admin clicks destructive buttons in hidden panels |

> **Key point:** Clickjacking is not about stealing cookies directly. It abuses the browser's normal rendering behavior and the victim's valid session.

---

## How a Clickjacking Attack Works

The attacker hosts a page that looks harmless, such as a video player or giveaway form, then overlays or hides a live iframe from the target application behind bait content.

### Simplified Attack Pattern

\`\`\`html
<style>
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 800px;
    height: 600px;
    opacity: 0.01;
    z-index: 2;
  }

  .fake-button {
    position: absolute;
    top: 220px;
    left: 260px;
    z-index: 1;
  }
</style>

<button class="fake-button">Play Video</button>
<iframe src="https://target.example/account/delete"></iframe>
\`\`\`

The user thinks they are clicking the visible button. In reality, the click lands on the framed target page.

---

## Why Clickjacking Still Matters in 2026

Teams often assume modern SPAs are immune. They are not. If an authenticated page can be framed and exposes meaningful user actions, clickjacking still works.

Common high-risk targets:

- Billing pages
- Account recovery settings
- Admin dashboards
- OAuth consent screens
- One-click purchase flows
- Internal enterprise tools

---

## Vulnerability 1: Missing Frame Protections

If a page returns no frame restrictions, any origin may embed it.

### Vulnerable Express Example

\`\`\`javascript
app.get('/settings', (req, res) => {
  res.send(renderSettingsPage());
});
\`\`\`

### Safer Response Headers

\`\`\`javascript
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  next();
});
\`\`\`

Use both when practical. \`frame-ancestors\` is the modern control. \`X-Frame-Options\` provides older browser coverage.

---

## Vulnerability 2: Allowing Framing for Entire Applications

Some teams allow framing globally because one embedded widget or partner integration needs it.

That broad exception creates unnecessary exposure for:

- profile pages
- payment flows
- admin actions
- consent screens

### Better Approach

- Allow framing only on the exact pages that need it.
- Put embeddable widgets on separate origins or isolated routes.
- Deny framing everywhere else.

---

## Vulnerability 3: Relying Only on JavaScript Frame-Busting

Legacy code often tries this:

\`\`\`javascript
if (window.top !== window.self) {
  window.top.location = window.self.location;
}
\`\`\`

That is not a reliable defense. Browser behavior, sandboxing rules, and CSP interactions make client-side frame-busting weaker than response headers.

Treat JavaScript frame-busting as optional defense-in-depth, not the primary control.

---

## Realistic Attack Scenario: OAuth Consent Clickjacking

An attacker frames a legitimate OAuth authorization page and places a fake "Claim reward" button over the real "Allow" button.

If the user is already signed in to the identity provider, one click may grant a malicious app access to:

- profile data
- email address
- cloud storage
- calendar access

This is why identity flows also need frame protection.

---

## How to Prevent Clickjacking in Next.js

### Middleware Example

\`\`\`typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
  return response;
}
\`\`\`

If some routes must be embeddable, carve them out explicitly instead of weakening the policy for the whole site.

---

## Testing for Clickjacking

### 1. Manual Framing Test

Create a local HTML page that embeds the target route in an iframe. If the page renders, the route may be exposed.

### 2. Header Check

\`\`\`bash
curl -I https://target.example/settings
\`\`\`

Look for:

- \`X-Frame-Options: DENY\` or \`SAMEORIGIN\`
- \`Content-Security-Policy: frame-ancestors ...\`

### 3. High-Risk Route Review

Check all pages that:

- change state
- approve permissions
- manage money
- alter security settings

---

## Clickjacking Hardening Checklist

- [ ] Set \`Content-Security-Policy: frame-ancestors 'none'\` or a tight allowlist
- [ ] Add \`X-Frame-Options\` for legacy browser coverage
- [ ] Do not allow framing across the whole app for one integration
- [ ] Isolate embeddable widgets on separate routes or origins
- [ ] Review OAuth, billing, and admin pages first
- [ ] Test framing on sensitive routes during security reviews

## Final Takeaway

Clickjacking is one of the clearest examples of a "simple" bug with real operational impact. No exploit chain is required if the browser is willing to render the page and the user is already signed in. The cleanest defense is also the simplest one: decide which routes may be framed, and deny it everywhere else by default.`,
    date: "2026-05-03",
    author: "SCRs Team",
    category: "Application Security",
    tags: ["Clickjacking", "UI Redressing", "Security Headers", "X-Frame-Options", "CSP", "OAuth", "Next.js"],
    readTime: "11 min read",
  },
  {
    slug: "open-redirect-vulnerability-exploitation-prevention-guide",
    title: "Open Redirect Vulnerability: Exploitation, Examples, and Prevention Guide",
    excerpt:
      "Open redirects often get waved away as low severity, then show up later in phishing kits and broken OAuth flows. This article looks at the cases that actually matter in practice and the redirect validation patterns that hold up under testing.",
    content: `## The Problem With Open Redirects Is Context, Not Just Severity

Open redirects are a classic example of a bug that sounds minor when discussed in isolation. If all you picture is one page bouncing a user to another site, the risk seems limited.

That is not how attackers use them. They use them inside login flows, phishing chains, consent screens, and reputation-based trust decisions. The redirect itself is not the whole attack. It is the part that makes the rest of the attack believable.

An open redirect happens when an application redirects users to a destination controlled by user input without proper validation.

At first glance, it seems minor. In practice, open redirects are frequently chained into:

- phishing campaigns
- OAuth authorization code theft
- access control bypasses in legacy flows
- trust abuse on legitimate domains

| Abuse Case | Impact |
|---|---|
| Phishing | Victim trusts your domain, then gets redirected to attacker infrastructure |
| OAuth misuse | Weak \`redirect_uri\` validation can leak authorization codes |
| Login flow abuse | Post-login redirects can send users to hostile destinations |
| Internal app chaining | Redirects can bypass assumptions in downstream security logic |

---

## The Classic Vulnerable Pattern

\`\`\`javascript
app.get('/redirect', (req, res) => {
  return res.redirect(req.query.next);
});
\`\`\`

An attacker can send users to:

\`\`\`
https://target.example/redirect?next=https://evil.example/login
\`\`\`

The victim sees a legitimate domain first, clicks confidently, and lands on the attacker page.

---

## Why Open Redirects Work So Well in Phishing

Users trust the beginning of a URL more than the end of a redirect chain. Security teams also sometimes allow trusted domains in email filters, chat tools, or browser reputation systems.

That makes open redirects valuable for attackers because they borrow your domain reputation.

---

## Dangerous Validation Mistake 1: Checking Only the Prefix

### Vulnerable Code

\`\`\`javascript
function isSafe(url) {
  return url.startsWith('https://target.example');
}
\`\`\`

This is bypassable with inputs like:

- \`https://target.example.evil.example\`
- \`https://target.example@evil.example\`

### Better Approach

\`\`\`javascript
const allowedOrigins = new Set(['https://target.example']);

function isSafeRedirect(candidate) {
  try {
    const parsed = new URL(candidate, 'https://target.example');
    return allowedOrigins.has(parsed.origin);
  } catch {
    return false;
  }
}
\`\`\`

---

## Dangerous Validation Mistake 2: Trusting Relative-Looking Inputs

These often bypass weak filters:

- \`//evil.example\`
- \`/\\evil.example\`
- encoded or double-encoded variants

### Safer Strategy

Only allow:

- exact internal paths like \`/dashboard\`
- pre-registered internal destinations
- explicit allowlisted full URLs when absolutely necessary

---

## Dangerous Validation Mistake 3: Weak OAuth \`redirect_uri\` Matching

Many serious incidents begin here. If an authorization server validates only the domain and not the **exact callback URL**, attackers can steal authorization codes or tokens.

### Bad Policy

- Any path under \`https://app.example.com\`
- Wildcards for callback URLs
- Partial string matching on redirect URIs

### Safer Policy

- Register exact callback URLs per client
- Match scheme, host, port, and path exactly
- Do not allow wildcards for sensitive OAuth clients

---

## Secure Redirect Pattern in Next.js

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';

const allowedPaths = new Set([
  '/dashboard',
  '/settings',
  '/billing',
]);

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next') || '/dashboard';

  if (!allowedPaths.has(next)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
\`\`\`

This is safer because it validates against a fixed list of relative paths.

---

## How to Test for Open Redirects

### 1. Parameter Discovery

Look for parameters like:

- \`next\`
- \`returnTo\`
- \`redirect\`
- \`redirect_uri\`
- \`continue\`
- \`url\`

### 2. Input Probes

Try:

- \`https://evil.example\`
- \`//evil.example\`
- encoded variants
- same-domain userinfo tricks

### 3. OAuth Flow Review

Check authorization servers, login flows, logout flows, and SSO return URLs.

---

## Open Redirect Hardening Checklist

- [ ] Prefer relative internal paths over external URLs
- [ ] Validate against exact allowlists
- [ ] Normalize and parse URLs before validation
- [ ] Block protocol-relative URLs like \`//evil.example\`
- [ ] Match OAuth \`redirect_uri\` values exactly
- [ ] Review login, logout, and post-auth flows first

## Final Takeaway

The right question with open redirects is not "can this page send someone elsewhere?" It is "what trust or identity flow does this redirect sit inside?" Once you ask that, the risk becomes easier to evaluate. In most applications, the safest answer is still the boring one: keep redirects internal unless you have a strict, reviewed reason not to.`,
    date: "2026-05-03",
    author: "SCRs Team",
    category: "Authentication",
    tags: ["Open Redirect", "Phishing", "OAuth", "redirect_uri", "Authentication", "Next.js", "Access Control"],
    readTime: "11 min read",
  },
  {
    slug: "saml-security-vulnerabilities-misconfigurations-guide",
    title: "SAML Security Vulnerabilities: Signature Validation, Misconfigurations, and Hardening Guide",
    excerpt:
      "SAML is still core infrastructure for enterprise SSO, and small validation mistakes still lead to serious compromise. This article focuses on the failure modes that matter in real service-provider implementations, not just protocol theory.",
    content: `## SAML Fails Quietly Until It Fails Catastrophically

SAML tends to live in the part of the stack people are least eager to rewrite. It is business-critical, tied to enterprise customers, and usually hidden behind vendor libraries, XML handling, and admin-console configuration. That makes teams understandably cautious around it, but it also means bad assumptions can sit untouched for a long time.

When those assumptions are wrong, the blast radius is large because SAML sits directly on the identity boundary.

Security Assertion Markup Language (SAML) is still widely used for enterprise single sign-on. It sits directly in the authentication path, which means mistakes have outsized consequences.

If SAML validation is weak, attackers may be able to:

- impersonate users
- escalate to admin accounts
- bypass authentication entirely
- steal sessions through weak binding or relay-state abuse

| SAML Failure | Possible Impact |
|---|---|
| Broken signature validation | Forged assertions accepted |
| Signature wrapping | Signed element ignored, attacker-controlled element used |
| Weak certificate trust | Tokens from the wrong IdP accepted |
| RelayState misuse | Open redirect or flow abuse |
| XML parser insecurity | XXE or parser abuse in SSO processing |

---

## How a Basic SAML Flow Works

1. User tries to access a service provider (SP).
2. SP redirects the user to the identity provider (IdP).
3. IdP authenticates the user.
4. IdP sends a signed SAML assertion back to the SP.
5. SP validates the assertion and creates a session.

The security of the whole flow depends on the service provider validating the response precisely.

---

## Vulnerability 1: Signature Validation Mistakes

The most dangerous class of SAML bugs happens when applications parse assertions but do not validate signatures correctly, or validate the wrong XML element.

### Common Failures

- Accepting unsigned assertions
- Validating that a signature exists, but not validating what it covers
- Skipping issuer or audience checks
- Failing open on parsing or validation errors

### What Good Validation Must Check

- Signature is cryptographically valid
- Expected IdP certificate is used
- Signature applies to the assertion or response actually consumed
- Audience matches the service provider
- Recipient and destination are correct
- Assertion is within time bounds

---

## Vulnerability 2: XML Signature Wrapping

In signature wrapping attacks, the original signed assertion remains in the document, but the attacker adds a second malicious assertion and tricks the parser into consuming the unsigned one.

### Why This Happens

One part of the code verifies a signed XML node. Another part later selects a different node using a loose XPath or DOM lookup.

That mismatch breaks the trust model.

### Defensive Principle

After validation, use the exact validated node object. Do not re-select assertions from the document.

---

## Vulnerability 3: Weak Trust Configuration

SAML is often deployed through copied metadata files and admin console settings. Misconfiguration is common.

High-risk mistakes include:

- trusting multiple unexpected certificates
- not pinning the expected issuer
- not validating audience or ACS URL
- accepting assertions intended for a different application

If your service provider accepts an assertion not specifically meant for it, you have an authentication problem, not just a configuration problem.

---

## Vulnerability 4: RelayState Abuse

\`RelayState\` is commonly used to preserve post-login destination context. If not validated, it can introduce:

- open redirect issues
- login flow confusion
- attacker-controlled navigation after authentication

### Safer Pattern

- Map short internal state tokens to stored destinations on the server
- Do not trust arbitrary external RelayState values
- Expire state values quickly and bind them to the user flow

---

## Vulnerability 5: XXE and Parser-Level XML Risk

SAML is XML-based. If your parser is not hardened, SSO endpoints may inherit XML parser risks such as XXE.

That means the SAML stack should also:

- disable DTD processing
- disable external entities
- use hardened parser libraries

Identity flows are too sensitive to depend on insecure XML defaults.

---

## Implementation Guidance

### Prefer Mature Libraries

Do not hand-roll SAML signature validation. Use well-maintained, widely reviewed libraries and keep them updated.

### Pin Trust Strictly

Configure:

- exact issuer
- exact ACS URL
- expected audience
- expected signing certificate

### Enforce Time Checks

Validate:

- \`NotBefore\`
- \`NotOnOrAfter\`
- reasonable clock skew only

### Treat SAML Admin Configuration as Security-Critical

Console changes to certificates, callback URLs, or trust metadata should go through the same review standard as code changes.

---

## SAML Security Review Checklist

- [ ] Are signatures mandatory and validated correctly?
- [ ] Is the validated XML node the same one later consumed?
- [ ] Is the IdP issuer pinned exactly?
- [ ] Is the audience restricted to this SP only?
- [ ] Are ACS URL and destination checked exactly?
- [ ] Is RelayState restricted to safe internal destinations?
- [ ] Is the XML parser hardened against XXE?
- [ ] Are certificates rotated through controlled review?

## Final Takeaway

Most serious SAML issues are not caused by the protocol being mysterious. They happen because one small validation shortcut, parser default, or trust-setting exception undermines the rest of the flow. The teams that handle SAML well are the ones that treat every trust decision in the login path as security-critical and resist the urge to improvise around the library.`,
    date: "2026-05-03",
    author: "SCRs Team",
    category: "Authentication",
    tags: ["SAML", "SSO", "Identity", "Authentication", "XML Security", "Signature Validation", "RelayState"],
    readTime: "12 min read",
  },
];