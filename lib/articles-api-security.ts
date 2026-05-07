import { BlogPost } from "./blog-data";

export const apiSecurityArticles: BlogPost[] = [
  {
    slug: "api-security-trends-2026-graphql-grpc-rest",
    title: "API Security Trends 2026: Protecting REST, GraphQL & gRPC in an AI-Driven World",
    excerpt:
      "APIs now account for 83% of web traffic. This guide covers the most critical API security trends for 2026 — AI-generated API abuse, GraphQL-specific attacks, gRPC security, API gateways, and runtime protection strategies.",
    content: `## APIs Are the New Attack Surface

APIs have become the backbone of digital infrastructure. According to Cloudflare's 2025 API Security Report, **83% of all web traffic is now API calls** — up from 60% in 2022. Every mobile app, SaaS integration, microservice, and AI agent communicates via APIs.

> **Key Statistic:** Gartner predicted that APIs would become the #1 attack vector by 2024. They were right. Akamai's 2025 State of the Internet report recorded a **109% year-over-year increase in API attacks**, with 150 billion API-targeted attacks observed in 12 months.

| Metric | Value | Source |
|---|---|---|
| Web traffic that is API traffic | **83%** | Cloudflare 2025 |
| YoY increase in API attacks | **109%** | Akamai 2025 |
| APIs per enterprise | **15,600 avg** | Salt Security 2025 |
| API attacks leading to breach | **27%** | IBM X-Force 2025 |
| Mean time to detect API attack | **212 days** | Salt Security 2025 |

---

## The 2026 API Threat Landscape

### Trend 1: AI-Generated API Abuse

AI agents and LLMs interact with APIs at machine speed. A single AI agent can probe hundreds of API endpoints per second, testing for vulnerabilities, enumerating data, and exploiting business logic flaws faster than any human attacker.

**New Attack Patterns:**
- **AI-powered credential stuffing** — LLMs analyze leaked credentials and generate variation patterns
- **Automated business logic exploitation** — AI identifies profitable abuse scenarios (e.g., coupon stacking, loyalty point manipulation)
- **Intelligent rate limit evasion** — AI distributes requests across IPs, user agents, and timing patterns to avoid detection

**Defense:**
\`\`\`typescript
// Rate limiting that considers AI behavior patterns
const rateLimiter = {
  // Standard rate limit
  perIP: { window: "1m", max: 100 },
  // Behavioral analysis
  perSession: {
    maxEndpointsPerMinute: 20,     // AI agents hit many endpoints rapidly
    maxParameterVariations: 10,    // AI fuzzes parameters systematically
    maxSequentialErrors: 5,        // AI generates errors while probing
  },
  // AI-specific signals
  detection: {
    monitorResponseReadTime: true,  // AI consumes responses instantly
    trackEndpointTraversal: true,   // AI follows API schema systematically
    flagNonHumanTiming: true,       // No think-time between requests
  },
};
\`\`\`

### Trend 2: GraphQL-Specific Attacks

GraphQL's flexibility is both its strength and its greatest vulnerability. Unlike REST (where each endpoint returns fixed data), GraphQL lets clients request exactly what they want — including deeply nested, computationally expensive queries.

**Top GraphQL Attack Vectors:**

| Attack | How It Works | Impact |
|---|---|---|
| **Introspection abuse** | Query \`__schema\` to map entire API | Full schema disclosure |
| **Batching attacks** | Send hundreds of operations in one request | Bypass rate limiting |
| **Deeply nested queries** | \`{ user { friends { friends { friends... } } } }\` | DoS via resource exhaustion |
| **Field suggestion** | Error messages suggest valid field names | Schema enumeration |
| **Alias-based DoS** | Same query repeated 1000x via aliases | Bypass per-query limits |
| **Directive overloading** | Abuse custom directives for unauthorized access | Privilege escalation |

**GraphQL Security Hardening:**
\`\`\`typescript
// Apollo Server — Security configuration
const server = new ApolloServer({
  schema,
  plugins: [
    // 1. Disable introspection in production
    ...(process.env.NODE_ENV === "production"
      ? [ApolloServerPluginInlineTraceDisabled()]
      : []),
  ],
  validationRules: [
    // 2. Limit query depth to prevent nested attacks
    depthLimit(5),
    // 3. Limit query complexity
    createComplexityLimitRule(1000, {
      scalarCost: 1,
      objectCost: 5,
      listFactor: 10,
    }),
  ],
  // 4. Disable suggestions in production
  includeStacktraceInErrorResponses: false,
});
\`\`\`

### Trend 3: gRPC Security Gaps

gRPC is increasingly used for microservice communication. Its binary Protocol Buffer format provides some security-through-obscurity, but this is not a defense.

**gRPC Security Checklist:**
- Enable mTLS between all services (mandatory, not optional)
- Implement per-method authorization (interceptors or middleware)
- Validate all Protocol Buffer fields (don't trust deserialization)
- Set maximum message size limits (prevent DoS via large payloads)
- Enable gRPC health checks and dead-letter queues
- Monitor reflection endpoint access (equivalent to GraphQL introspection)

### Trend 4: API-First AI Agents

With MCP (Model Context Protocol) and AI function calling, APIs are now consumed by AI agents that behave very differently from human users:

| Human API Usage | AI Agent API Usage |
|---|---|
| Reads documentation | Discovers endpoints dynamically |
| One task at a time | Parallel requests across endpoints |
| Predictable workflows | Unpredictable action chains |
| Respects social contracts | Follows instructions literally |
| Reports errors to support | Retries aggressively without backoff |

---

## API Security Architecture for 2026

### The Four Layers of API Defense

\`\`\`
┌─────────────────────────────────────────┐
│  Layer 1: API Gateway                    │
│  ├── Authentication (OAuth/API Keys)     │
│  ├── Rate Limiting (per-user, per-agent) │
│  ├── Request Size Limits                 │
│  └── IP Allowlisting / Geoblocking      │
├─────────────────────────────────────────┤
│  Layer 2: API Security Platform          │
│  ├── API Discovery (find shadow APIs)    │
│  ├── Schema Validation                   │
│  ├── Behavioral Analysis                 │
│  └── Bot / AI Agent Detection            │
├─────────────────────────────────────────┤
│  Layer 3: Application Logic              │
│  ├── Object-Level Authorization (BOLA)   │
│  ├── Function-Level Authorization        │
│  ├── Business Logic Validation           │
│  └── Input Sanitization                  │
├─────────────────────────────────────────┤
│  Layer 4: Data Protection                │
│  ├── Field-Level Encryption              │
│  ├── Response Filtering (PII redaction)  │
│  ├── Audit Logging                       │
│  └── Data Loss Prevention                │
└─────────────────────────────────────────┘
\`\`\`

---

## API Authentication Best Practices

| Method | Use Case | Security Level |
|---|---|---|
| **API Keys** | Public APIs, rate limiting | Low (use as identifier, not auth) |
| **OAuth 2.0 + PKCE** | User-facing apps, SPAs | High |
| **OAuth 2.0 Client Credentials** | Machine-to-machine | High |
| **mTLS** | Internal microservices | Very High |
| **JWT (short-lived)** | Stateless auth, 5-15min TTL | High (if implemented correctly) |
| **Passkeys / WebAuthn** | User authentication | Very High |

---

## API Security Testing Checklist

| Test | Tool | What It Finds |
|---|---|---|
| OWASP API Top 10 scan | OWASP ZAP, Burp Suite | BOLA, injection, auth issues |
| Schema conformance | Spectral, Optic | Undocumented endpoints, schema drift |
| Fuzzing | RESTler, Schemathesis | Edge cases, crashes, auth bypasses |
| Business logic testing | Manual + Burp macros | Rate limit bypasses, workflow abuse |
| Dependency scanning | npm audit, Snyk | Vulnerable API framework versions |

---

## Further Reading

- [OWASP API Security Top 10](/blog/owasp-api-security-top-10-2023) — The API-specific vulnerability framework
- [Shadow APIs Guide](/blog/shadow-apis-zombie-apis-discovery-security) — Finding hidden APIs
- [Secure API Design Patterns](/blog/secure-api-design-patterns) — Architecture-level API security
- [JWT Security Guide](/blog/jwt-security-vulnerabilities-best-practices) — Token security deep dive`,
    date: "2026-02-07",
    author: "SCR Security Research Team",
    category: "API Security",
    tags: ["API Security", "GraphQL", "gRPC", "REST API", "OAuth", "Rate Limiting", "AI Agents"],
    readTime: "20 min read",
  },

  {
    slug: "shadow-apis-zombie-apis-discovery-security",
    title: "Shadow APIs and Zombie APIs: API Discovery, Inventory, and Hidden Attack Surface Security",
    excerpt:
      "Learn how to find shadow APIs, track zombie APIs, build an API inventory, and reduce hidden API attack surface risk with practical API discovery and decommissioning strategies.",
    content: `## Shadow API Discovery and Zombie API Security

  If you are trying to reduce hidden API risk, the starting point is **API discovery** and **API inventory hygiene**. Teams searching for answers on **shadow APIs** and **zombie APIs** usually do not have a detection problem alone. They have an ownership, documentation, and decommissioning problem.

  Your API attack surface is larger than you think. Much larger.

> **Critical Finding:** Salt Security's 2025 State of API Security Report found that **76% of organizations have shadow APIs** — APIs that exist in production but are not documented, monitored, or managed by security teams. Additionally, **43% of organizations have zombie APIs** — deprecated endpoints that were never decommissioned.

---

## Definitions

| Type | Definition | Example |
|---|---|---|
| **Shadow API** | API endpoint that exists but is not documented or known to security teams | Developer built \`/debug/dump-env\` during development; it shipped to production |
| **Zombie API** | Deprecated API that was replaced but never decommissioned | \`/api/v1/users\` (no auth) still works alongside \`/api/v3/users\` (with auth) |
| **Orphan API** | API whose owning team no longer exists or maintains it | Post-acquisition, acquired company's APIs run unmanaged |
| **Rogue API** | API created outside organizational processes, often by shadow IT | Marketing team built a quick API for a campaign — never reviewed |

---

## Why Shadow APIs Are Dangerous

### Real-World Shadow API Breaches

| Organization | Year | What Happened | Impact |
|---|---|---|---|
| Optus (Australia) | 2022 | Unauthenticated test API in production exposed customer data | 9.8M customer records (passports, license numbers) |
| T-Mobile | 2023 | Undocumented API endpoint leaked account data | 37M customers affected |
| Uber | 2022 | Attacker accessed internal API documentation via compromised credentials | Full internal system access |

### Why They Persist

1. **Microservices explosion** — One application becomes 200 microservices, each with multiple endpoints
2. **Developer velocity** — Teams ship APIs faster than security can inventory them
3. **No decommissioning process** — Replacing an API version doesn't mean removing the old one
4. **Infrastructure-as-Code drift** — IaC templates define APIs, but manual changes create untracked endpoints
5. **Acquisitions** — Acquiring a company means inheriting their entire undocumented API landscape

---

## API Discovery Methods

### Method 1: Traffic Analysis (Most Effective)

Deploy an API security platform or WAF in learning mode to analyze actual traffic patterns:

\`\`\`
What traffic analysis reveals:
─────────────────────────────
✓ Every endpoint that receives traffic (including undocumented ones)
✓ HTTP methods used per endpoint
✓ Authentication patterns (or lack thereof)
✓ Data types in requests and responses (detect PII)
✓ Traffic volume and patterns per endpoint
✓ Client diversity (how many apps consume each API)
\`\`\`

### Method 2: Code Scanning

Analyze source code repositories for API route definitions:

\`\`\`bash
# Find Express.js route definitions
grep -r "app\\.\\(get\\|post\\|put\\|delete\\|patch\\)" --include="*.js" --include="*.ts" .

# Find Next.js API routes
find ./app/api -name "route.ts" -o -name "route.js" | sort

# Find FastAPI endpoints (Python)
grep -r "@app\\.\\(get\\|post\\|put\\|delete\\)" --include="*.py" .

# Find Spring endpoints (Java)
grep -r "@\\(GetMapping\\|PostMapping\\|RequestMapping\\)" --include="*.java" .
\`\`\`

### Method 3: Infrastructure Scanning

\`\`\`bash
# Scan API gateways for registered routes
# AWS API Gateway
aws apigateway get-rest-apis --query 'items[*].{name:name,id:id}'

# Kubernetes ingress rules
kubectl get ingress --all-namespaces -o json | jq '.items[].spec.rules[].http.paths'

# Nginx configuration analysis
grep -r "location" /etc/nginx/ --include="*.conf" | grep "proxy_pass"
\`\`\`

### Method 4: DNS and Certificate Enumeration

\`\`\`bash
# Find API subdomains
# Certificate Transparency logs
curl -s "https://crt.sh/?q=%25.example.com&output=json" | jq '.[].name_value' | sort -u | grep api

# DNS brute force (with common API prefixes)
# api., api-v1., api-v2., gateway., internal-api., staging-api., dev-api.
\`\`\`

---

## Building an API Inventory

Every discovered API should be documented in a central inventory:

| Field | Description | Example |
|---|---|---|
| Endpoint | Full URL path | \`/api/v2/users/:id\` |
| Methods | HTTP methods | GET, PUT, DELETE |
| Authentication | Auth mechanism | OAuth 2.0 Bearer |
| Owner | Responsible team | User Service Team |
| Version | API version | v2 (current), v1 (deprecated) |
| Documentation | OpenAPI spec exists? | Yes — \`specs/users-v2.yaml\` |
| Data sensitivity | Data classification | Contains PII (email, phone) |
| Traffic volume | Requests per day | ~50,000 |
| Last modified | Code last changed | 2026-01-15 |
| Status | Lifecycle state | Active / Deprecated / Zombie |

---

## Eliminating Zombie APIs

### The Zombie API Decommissioning Process

\`\`\`
Step 1: Identify
├── Compare API inventory with documentation
├── Flag endpoints on deprecated versions (v1 when v3 exists)
└── Check traffic — does anyone still call it?

Step 2: Assess
├── Who/what is still calling the zombie API?
├── What data does it expose?
├── Is it authenticated?
└── Risk rating (critical/high/medium/low)

Step 3: Notify
├── Contact consuming applications
├── Provide migration path to current version
├── Set decommission date (30-90 days)
└── Add deprecation headers to responses

Step 4: Decommission
├── Return 410 Gone with migration instructions
├── Monitor for continued traffic
├── After 30 days of zero traffic: remove
└── Update API inventory
\`\`\`

### Deprecation Response Headers
\`\`\`typescript
// Add deprecation headers to zombie APIs
app.use("/api/v1/*", (req, res, next) => {
  res.setHeader("Deprecation", "true");
  res.setHeader("Sunset", "Sat, 01 Jun 2026 00:00:00 GMT");
  res.setHeader("Link", '</api/v3>; rel="successor-version"');

  // Log usage for migration tracking
  logger.warn({
    message: "Deprecated API v1 called",
    path: req.path,
    clientIP: req.ip,
    userAgent: req.headers["user-agent"],
  });

  next();
});
\`\`\`

---

## Continuous API Security Monitoring

| Metric | Alert Threshold | Why It Matters |
|---|---|---|
| New undocumented endpoints | Any new detection | Shadow API creation |
| Traffic to deprecated APIs | > 0 requests after sunset date | Zombie APIs still in use |
| Unauthenticated API calls | Any to auth-required endpoint | Missing auth enforcement |
| PII in API responses | Any detection in non-PII endpoints | Data leakage |
| API error spike | > 5% error rate | Possible attack or misconfiguration |
| Schema deviation | Response differs from OpenAPI spec | API drift |

---

## Shadow API FAQ

### What is a shadow API?

A shadow API is an endpoint that exists in production but is undocumented, unmanaged, or unknown to the security team. It may still receive traffic even though it is outside normal governance and monitoring.

### What is a zombie API?

A zombie API is an older or deprecated endpoint that was replaced but never fully removed. These endpoints often remain exploitable because they miss the newer authentication, authorization, or validation logic added to current API versions.

### How do you find shadow APIs in practice?

The most effective approach combines traffic analysis, source code discovery, API gateway inspection, OpenAPI spec comparison, and certificate or DNS enumeration. A single source of truth is usually not enough.

---

## Further Reading

- [API Security Trends 2026](/blog/api-security-trends-2026-graphql-grpc-rest) — Comprehensive API threat landscape
- [OWASP API Security Top 10](/blog/owasp-api-security-top-10-2023) — API-specific vulnerability framework
- Salt Security (2025), "State of API Security Report" — Shadow API statistics
- [Secure API Design Patterns](/blog/secure-api-design-patterns) — Building APIs securely from the start`,
    date: "2026-02-06",
    updatedAt: "2026-05-08",
    author: "SCR Security Research Team",
    category: "API Security",
    tags: ["Shadow APIs", "Zombie APIs", "API discovery", "API inventory", "API attack surface", "hidden APIs", "API security"],
    readTime: "17 min read",
  },

  {
    slug: "owasp-api-security-top-10-2023",
    title: "OWASP API Security Top 10 Explained: BOLA, Broken Auth, SSRF and Real Attack Examples",
    excerpt:
      "A practical OWASP API Security Top 10 guide covering BOLA, broken authentication, excessive data exposure, SSRF, rate limiting, and real API attack examples with secure fix patterns.",
    content: `## OWASP API Security Top 10 Explained

  If you are looking for a practical explanation of the **OWASP API Security Top 10**, focus on the few categories that show up repeatedly in real systems: **BOLA**, **broken authentication**, **rate limiting failures**, **business logic abuse**, **shadow APIs**, and **SSRF**. These are the issues that turn routine API mistakes into breach paths.

  The OWASP API Security Project maintains a separate Top 10 list specifically for APIs, distinct from the web application OWASP Top 10. APIs have unique attack patterns that web-focused frameworks don't adequately address.

> **Why a Separate List?** APIs expose application logic and sensitive data directly. Unlike web applications, APIs don't have a UI that limits what users can do — any client can send any request to any endpoint. This makes authorization, input validation, and rate limiting critical at the API layer.

The latest version (2023) was a complete overhaul from the 2019 edition:

| # | API Security Risk (2023) | Change from 2019 |
|---|---|---|
| API1 | Broken Object Level Authorization (BOLA) | Same (#1 both years) |
| API2 | Broken Authentication | Updated |
| API3 | Broken Object Property Level Authorization | **New** (merged mass assignment + excessive data exposure) |
| API4 | Unrestricted Resource Consumption | **New** (replaces Lack of Resources) |
| API5 | Broken Function Level Authorization | Same |
| API6 | Unrestricted Access to Sensitive Business Flows | **New** |
| API7 | Server-Side Request Forgery (SSRF) | **New** |
| API8 | Security Misconfiguration | Same |
| API9 | Improper Inventory Management | Updated |
| API10 | Unsafe Consumption of APIs | **New** |

---

## API1: Broken Object Level Authorization (BOLA)

The #1 API vulnerability — also known as IDOR (Insecure Direct Object Reference) in web context. An attacker changes an object ID in a request to access another user's data.

**Attack Scenario:**
\`\`\`
# Legitimate request
GET /api/v2/accounts/1001/transactions
Authorization: Bearer <user_1001_token>

# Attack — change account ID
GET /api/v2/accounts/1002/transactions
Authorization: Bearer <user_1001_token>
# Server returns user 1002's transactions — BOLA vulnerability!
\`\`\`

**Fix Pattern:**
\`\`\`typescript
// Verify object ownership on EVERY request
async function getTransactions(req: Request) {
  const accountId = req.params.accountId;
  const userId = req.auth.userId;

  // Check ownership BEFORE returning data
  const account = await Account.findById(accountId);
  if (!account || account.ownerId !== userId) {
    return new Response("Not found", { status: 404 }); // 404, not 403
  }

  const transactions = await Transaction.find({ accountId });
  return Response.json(transactions);
}
\`\`\`

> **Best Practice:** Return 404 (Not Found) instead of 403 (Forbidden) for unauthorized object access. A 403 confirms the object exists, enabling enumeration.

---

## API2: Broken Authentication

API authentication failures include weak passwords, missing MFA, exposed credentials in URLs, and improper JWT validation.

**Common JWT Mistakes:**
\`\`\`javascript
// VULNERABLE — Not verifying JWT signature
const decoded = jwt.decode(token); // decode without verify!
const userId = decoded.userId;

// VULNERABLE — Algorithm confusion (accepts "none")
const decoded = jwt.verify(token, publicKey); // No algorithm restriction

// SECURE — Strict verification
const decoded = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ["HS256"],      // Explicitly allow only expected algorithm
  issuer: "securecodereviews.com",
  audience: "api.securecodereviews.com",
  maxAge: "15m",              // Reject tokens older than 15 minutes
});
\`\`\`

---

## API3: Broken Object Property Level Authorization

APIs that return more data than the client needs, or allow clients to modify properties they shouldn't.

**Excessive Data Exposure:**
\`\`\`javascript
// VULNERABLE — Returns entire user object (including sensitive fields)
app.get("/api/users/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user); // Includes: password hash, SSN, internal notes, role!
});

// SECURE — Explicit field selection
app.get("/api/users/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("name email avatar createdAt"); // Only public fields
  res.json(user);
});
\`\`\`

**Mass Assignment:**
\`\`\`javascript
// VULNERABLE — Accepts any fields from request body
app.put("/api/users/:id", auth, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body); // Attacker sends { role: "admin" }!
});

// SECURE — Allowlist updateable fields
app.put("/api/users/:id", auth, async (req, res) => {
  const allowedFields = ["name", "email", "avatar"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  await User.findByIdAndUpdate(req.params.id, updates);
});
\`\`\`

---

## API4: Unrestricted Resource Consumption

APIs without proper rate limiting and resource constraints are vulnerable to DoS and financial abuse.

\`\`\`typescript
// Comprehensive rate limiting
import rateLimit from "express-rate-limit";

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 1000,                   // 1000 requests per window
  standardHeaders: true,
}));

// Sensitive endpoint rate limit
app.use("/api/auth/login", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                     // 5 login attempts per 15 minutes
  message: { error: "Too many login attempts. Try again later." },
}));

// Expensive operation rate limit
app.use("/api/reports/generate", rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,                    // 10 report generations per hour
}));
\`\`\`

---

## API5: Broken Function Level Authorization

Regular users can access admin functions by simply calling admin endpoints.

---

## API6: Unrestricted Access to Sensitive Business Flows

APIs that expose business logic without proper controls — e.g., automated ticket buying, coupon abuse, review manipulation.

**Example Attack:** An API for an e-commerce site allows adding items to cart and checking out. An attacker automates the entire flow to buy limited-edition items before legitimate customers.

**Defenses:** CAPTCHAs for sensitive flows, device fingerprinting, behavioral analysis, purchase velocity limits.

---

## API7: Server-Side Request Forgery (SSRF)

APIs that fetch URLs provided by users can be tricked into accessing internal resources.

\`\`\`javascript
// VULNERABLE — Fetches any URL the user provides
app.post("/api/fetch-url", async (req, res) => {
  const response = await fetch(req.body.url); // Can access internal services!
  res.json(await response.json());
});

// Attacker sends: { "url": "http://169.254.169.254/latest/meta-data/iam/" }
// Gets AWS instance metadata and credentials!
\`\`\`

---

## API8: Security Misconfiguration

Missing CORS restrictions, verbose errors, unnecessary HTTP methods enabled, missing security headers.

---

## API9: Improper Inventory Management

Organizations don't know all their APIs — shadow APIs, zombie APIs, and undocumented endpoints.

---

## API10: Unsafe Consumption of APIs

When your API consumes third-party APIs without proper validation, you inherit their vulnerabilities.

---

## API Security Testing Matrix

| Risk | Manual Testing | Automated Tool |
|---|---|---|
| BOLA | Swap object IDs between users | Burp Autorize extension |
| Broken Auth | Test JWT manipulation, expired tokens | jwt_tool, OWASP ZAP |
| Property Auth | Send unexpected fields in PUT/PATCH | Burp Intruder |
| Resource | Send oversized payloads, rapid requests | Artillery, k6 |
| Function Auth | Call admin endpoints as regular user | AuthMatrix (Burp) |
| Business Logic | Automate purchase/reservation flows | Custom scripts |
| SSRF | Send internal URLs (169.254.x, localhost) | SSRFmap |

---

## OWASP API Security Top 10 FAQ

### What is the most common OWASP API Security Top 10 issue?

Broken Object Level Authorization, or BOLA, remains the most common and most damaging API risk because it turns ordinary API requests into unauthorized data access with only small changes to object IDs or resource references.

### Is the OWASP API Security Top 10 only for public APIs?

No. Internal APIs, partner APIs, mobile backends, and service-to-service endpoints can all suffer from the same authorization, authentication, SSRF, and inventory-management failures.

### How should teams use the OWASP API Security Top 10 in practice?

Use it as a testing and review framework. Map existing endpoints to the top risks, review auth and authorization flows first, then test for resource abuse, API inventory gaps, and unsafe downstream integrations.

---

## Further Reading

- [OWASP API Security Project](https://owasp.org/www-project-api-security/) — Official documentation
- [API Security Trends 2026](/blog/api-security-trends-2026-graphql-grpc-rest) — Current threat landscape
- [Shadow APIs Guide](/blog/shadow-apis-zombie-apis-discovery-security) — Finding hidden APIs
- [Broken Access Control Deep Dive](/blog/broken-access-control-owasp-number-one-risk) — Authorization patterns`,
    date: "2026-02-05",
    updatedAt: "2026-05-08",
    author: "SCR Security Research Team",
    category: "API Security",
    tags: ["OWASP API Security Top 10", "API Security", "BOLA", "broken authentication", "SSRF", "rate limiting", "authorization"],
    readTime: "22 min read",
  },

  {
    slug: "api-security-ai-agents-mcp-function-calling",
    title: "API Security for AI Agents: Securing MCP, Function Calling & Tool Use",
    excerpt:
      "AI agents are the new API consumers. This guide covers securing APIs against AI-driven abuse — MCP server hardening, function calling guardrails, tool delegation authorization, and protecting sensitive endpoints from autonomous agents.",
    content: `## AI Agents as API Consumers

APIs were designed for human-driven applications — a user clicks a button, the app sends a request. AI agents fundamentally change this model. An autonomous agent can discover, call, and chain API endpoints without human intervention, at machine speed, with unpredictable behavior.

> **The Shift:** Traditional API security assumes a human in the loop. AI agents remove that assumption. They can call thousands of endpoints per minute, probe for vulnerabilities, exploit business logic, and exfiltrate data — all while following their programmed instructions "correctly."

### How AI Agents Interact with APIs

| Interaction Model | Description | Security Implications |
|---|---|---|
| **Function Calling** | OpenAI/Anthropic format — model decides which function to call | Agent can call any registered function |
| **MCP (Model Context Protocol)** | Standardized tool/resource protocol | MCP servers expose entire toolsets |
| **LangChain/LlamaIndex Tools** | Framework-specific tool wrappers | Tool definitions include execution logic |
| **Direct API Calls** | Agent constructs HTTP requests | Full API surface is accessible |
| **Browser Use** | Agent controls a browser to interact with web UIs | Bypasses API-level controls entirely |

---

## Securing Function Calling

### The Function Calling Security Model

When you register functions with an AI model (OpenAI, Anthropic, etc.), the model decides which functions to call based on user input. This creates a critical security boundary:

\`\`\`
User Input → [AI Model] → Function Selection → [Your Code] → Side Effects
              ^                                       ^
              |                                       |
         Prompt injection                    Insufficient validation
         can redirect function               can cause damage
         selection
\`\`\`

### Secure Function Registration
\`\`\`typescript
// VULNERABLE — Overly broad function with no constraints
const tools = [{
  name: "database_query",
  description: "Execute any SQL query on the database",
  parameters: {
    query: { type: "string", description: "SQL query to execute" }
  }
}];

// SECURE — Constrained, specific functions with validation
const tools = [{
  name: "get_user_orders",
  description: "Get orders for the currently authenticated user",
  parameters: {
    status: {
      type: "string",
      enum: ["pending", "shipped", "delivered", "cancelled"],
      description: "Filter by order status"
    },
    limit: {
      type: "number",
      minimum: 1,
      maximum: 50,
      description: "Maximum orders to return"
    }
  }
}];

// Function implementation with security checks
async function getUserOrders(params: any, context: AgentContext) {
  // 1. Validate parameters against schema
  const validated = OrderQuerySchema.parse(params);

  // 2. Enforce user scope — agent can only see current user's data
  const orders = await Order.find({
    userId: context.authenticatedUserId, // Never from params!
    status: validated.status,
  }).limit(validated.limit);

  // 3. Filter sensitive fields from response
  return orders.map(o => ({
    id: o.id,
    status: o.status,
    total: o.total,
    createdAt: o.createdAt,
    // Exclude: internalNotes, costPrice, supplierInfo
  }));
}
\`\`\`

### Function Calling Security Rules

1. **Design functions with least privilege** — Each function should do one thing with minimal permissions
2. **Never pass user identity via parameters** — Extract from the authenticated session/token
3. **Validate all parameters server-side** — The AI model can be manipulated to send unexpected values
4. **Use enums and strict types** — Avoid freeform string parameters where possible
5. **Implement function-level rate limiting** — Separate from API-level rate limiting
6. **Log every function invocation** — Full audit trail including parameters and results
7. **Require human confirmation for destructive actions** — DELETE, financial transactions, data modifications

---

## Securing MCP Servers

### MCP Server Threat Model

| Threat | Attack Vector | Mitigation |
|---|---|---|
| **Malicious MCP server** | User installs backdoored server from untrusted source | Server vetting, code review, allowlisted registries |
| **Tool name collision** | Two MCP servers register tools with same name | Namespace enforcement, deterministic resolution |
| **Excessive permissions** | MCP server requests filesystem, network, exec access | Principle of least privilege, capability-based security |
| **Data exfiltration** | MCP tool sends data to external endpoints | Network isolation, egress filtering |
| **Prompt injection via tools** | Tool returns injected instructions in response | Output sanitization, instruction hierarchy |

### MCP Server Hardening Checklist

\`\`\`
□ Run MCP servers in isolated containers (no host filesystem access)
□ Network: allowlist only required outbound connections
□ No shell execution capability unless absolutely required
□ Read-only filesystem access where possible
□ Environment variables: only pass required credentials
□ Validate all tool inputs against strict JSON schemas
□ Sanitize all tool outputs (strip potential injection patterns)
□ Log every tool invocation with full context
□ Implement per-tool rate limiting
□ Set resource limits (CPU, memory, execution time)
□ Code review all third-party MCP servers before installation
□ Pin MCP server versions (no auto-updates in production)
\`\`\`

---

## Rate Limiting for AI Agents

Traditional rate limiting (requests per minute per IP) doesn't work well for AI agents. You need agent-aware rate limiting:

\`\`\`typescript
// Agent-aware rate limiting middleware
const agentRateLimiter = {
  // Per-agent limits (identified by API key or OAuth client)
  perAgent: {
    requestsPerMinute: 60,
    tokensPerMinute: 100000,     // LLM token budget
    toolCallsPerMinute: 30,      // Function/tool invocations
    writeOperationsPerMinute: 10, // Mutations
    costPerDay: 50.00,           // Dollar budget limit
  },

  // Per-user-per-agent limits (agent acting on behalf of a user)  
  perUserPerAgent: {
    requestsPerMinute: 20,
    dataRecordsPerMinute: 100,   // Records accessed
    writeOperationsPerHour: 25,
  },

  // Global safety limits
  global: {
    maxConcurrentAgentSessions: 100,
    maxAgentChainDepth: 3,       // Agent spawning sub-agents
    emergencyShutdownOnAnomalyScore: 0.95,
  },
};
\`\`\`

---

## Monitoring AI Agent API Usage

Track these signals to detect compromised or misbehaving AI agents:

| Signal | Normal | Suspicious |
|---|---|---|
| Endpoint diversity | Calls 3-5 endpoints per task | Systematically probes all endpoints |
| Error rate | < 2% | > 20% (probing for vulnerabilities) |
| Data volume | Requests typical data sets | Attempts to enumerate all records |
| Time between requests | Human-initiated cadence | Machine-speed continuous requests |
| Tool call patterns | Predictable per task type | Random or scanning pattern |
| Cross-user access | Never | Attempts to access other users' data |

---

## Further Reading

- [OWASP Top 10 for Agentic AI](/blog/owasp-top-10-agentic-ai-2026) — Complete agentic AI risk framework
- [Securing Generative AI APIs](/blog/securing-generative-ai-apis-mcp-shadow-ai) — MCP and Shadow AI security
- [AI Agent IAM](/blog/securing-ai-agents-identity-access-management) — Identity management for agents
- [API Security Trends 2026](/blog/api-security-trends-2026-graphql-grpc-rest) — Broader API threat landscape`,
    date: "2026-02-04",
    author: "SCR Security Research Team",
    category: "API Security",
    tags: ["MCP", "Function Calling", "AI Agents", "API Security", "Tool Use", "LLM Security", "Authorization"],
    readTime: "18 min read",
  },

  {
    slug: "business-logic-abuse-api-vulnerabilities",
    title: "Business Logic Abuse in APIs: The Vulnerabilities Scanners Can't Find",
    excerpt:
      "Business logic vulnerabilities are invisible to automated scanners. From coupon stacking to loyalty fraud to race conditions, this guide covers the most exploited business logic flaws in APIs with detection strategies and prevention patterns.",
    content: `## Why Scanners Miss Business Logic Flaws

Automated security scanners (SAST, DAST, IAST) excel at finding technical vulnerabilities — SQL injection, XSS, missing headers. But they fundamentally cannot understand your **business rules**. A business logic vulnerability exists when an API allows actions that are technically valid but violate the intended business workflow.

> **Definition:** A business logic vulnerability occurs when an attacker exploits legitimate application functionality in unintended ways to achieve a malicious goal. The requests are well-formed, authenticated, and pass all input validation — but the outcome violates business intent.

---

## The Cost of Business Logic Abuse

| Metric | Value | Source |
|---|---|---|
| E-commerce revenue lost to business logic abuse | **$48B annually** | Juniper Research 2025 |
| Financial services API fraud from logic flaws | **$12B annually** | Javelin Strategy 2025 |
| Loyalty/rewards program abuse | **$3.1B annually** | Loyalty Security Alliance |
| Average time to detect logic abuse | **96 days** | Imperva 2025 |
| Logic abuse attacks blocked by traditional WAF | **< 5%** | Salt Security 2025 |

---

## The 10 Most Common Business Logic Abuses

### 1. Price Manipulation

**Attack:** Modify prices in API requests before checkout.

\`\`\`
# Legitimate request
POST /api/checkout
{ "items": [{ "id": "laptop-001", "price": 999.99, "qty": 1 }] }

# Attack — Client sends modified price
POST /api/checkout
{ "items": [{ "id": "laptop-001", "price": 0.01, "qty": 1 }] }
\`\`\`

**Fix:** Never trust client-sent prices. Always look up prices server-side.
\`\`\`typescript
async function checkout(req: Request) {
  const cart = req.body.items;

  // Look up REAL prices from database for each item
  const priced = await Promise.all(
    cart.map(async (item: any) => {
      const product = await Product.findById(item.id);
      return {
        productId: product.id,
        price: product.currentPrice, // From database, NOT from client
        quantity: Math.min(item.qty, product.stockCount),
      };
    })
  );

  const total = priced.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return processPayment(total, priced);
}
\`\`\`

### 2. Coupon / Discount Stacking

**Attack:** Apply the same coupon multiple times or combine coupons that shouldn't stack.

| Business Rule | What Attacker Does | Prevention |
|---|---|---|
| One coupon per order | Sends multiple coupon codes in array | Validate coupon count server-side |
| Coupon expires after use | Rapid concurrent requests with same coupon | Atomic coupon redemption (DB lock) |
| Coupons don't stack | Applies % off + $ off + referral code | Mutual exclusion logic on coupon types |
| Minimum purchase amount | Applies coupon, then removes items | Re-validate coupon at payment time |

### 3. Race Conditions

**Attack:** Send concurrent requests to exploit time-of-check-to-time-of-use (TOCTOU) vulnerabilities.

\`\`\`
# User has $100 balance
# Sends 5 simultaneous requests to transfer $100

T0: Request 1 → Check balance: $100 ✓ → Process transfer
T0: Request 2 → Check balance: $100 ✓ → Process transfer  
T0: Request 3 → Check balance: $100 ✓ → Process transfer
T0: Request 4 → Check balance: $100 ✓ → Process transfer
T0: Request 5 → Check balance: $100 ✓ → Process transfer

Result: $500 transferred from $100 balance!
\`\`\`

**Fix — Use database-level atomic operations:**
\`\`\`typescript
// VULNERABLE — Read-then-write race condition
const user = await User.findById(userId);
if (user.balance >= amount) {
  user.balance -= amount;
  await user.save();
}

// SECURE — Atomic database operation
const result = await User.findOneAndUpdate(
  {
    _id: userId,
    balance: { $gte: amount }, // Check AND update atomically
  },
  {
    $inc: { balance: -amount },
  },
  { new: true }
);

if (!result) {
  throw new Error("Insufficient balance");
}
\`\`\`

### 4. Enumeration / Scraping

Systematic crawling of API endpoints to extract entire datasets.

### 5. Workflow Bypass

Skipping required steps by calling API endpoints out of order.

\`\`\`
Normal flow: Select Item → Add to Cart → Enter Shipping → Enter Payment → Confirm

Attack: Skip payment step by directly calling /api/orders/confirm
\`\`\`

**Prevention:** Implement a state machine for multi-step workflows. Each API endpoint verifies the current state before proceeding.

### 6. Loyalty Points Manipulation

### 7. Excessive Function Execution

### 8. Feature Flag Abuse

### 9. Free Tier Abuse

Creating unlimited accounts to abuse free tiers.

### 10. Review / Rating Manipulation

---

## Detection Strategies

### Behavioral Analysis

Since individual requests look legitimate, detection requires analyzing **sequences** of requests:

| Signal | What It Indicates |
|---|---|
| User completes checkout in < 2 seconds | Automated bot, not human |
| Same coupon code attempted 100x in 1 minute | Coupon brute-forcing |
| Account creation from same device fingerprint | Free-tier abuse / Sybil attack |
| API calls skip expected workflow steps | Workflow bypass attempt |
| 1000 requests to /api/products with incrementing IDs | Product catalog scraping |

### Anomaly Detection Approach

\`\`\`
Baseline (learn normal):
- Average checkout time per user: 3-10 minutes
- Average coupon applications per order: 0.3
- Average API calls per session: 15-25
- Payment attempt success rate: 87%

Alert when:
- Checkout time < 5 seconds (bot behavior)
- Coupon applications per order > 1 (stacking attempt)
- API calls per session > 100 (enumeration)
- Payment attempt success rate < 10% (card testing)
\`\`\`

---

## Prevention Architecture

| Layer | Control | Purpose |
|---|---|---|
| **API Gateway** | Rate limiting, bot detection | Block high-volume abuse |
| **Application** | State machine enforcement, atomic operations | Prevent workflow bypass and race conditions |
| **Business Rules Engine** | Coupon logic, pricing validation | Enforce business constraints |
| **Behavioral Analytics** | Sequence analysis, anomaly detection | Detect sophisticated abuse |
| **Manual Review** | Flagged transactions for human review | Catch edge cases |

---

## Further Reading

- [API Security Trends 2026](/blog/api-security-trends-2026-graphql-grpc-rest) — Broader API threat landscape
- [OWASP API Security Top 10](/blog/owasp-api-security-top-10-2023) — API6: Unrestricted Access to Sensitive Business Flows
- [Secure API Design Patterns](/blog/secure-api-design-patterns) — Building secure APIs from the start`,
    date: "2026-02-03",
    author: "SCR Security Research Team",
    category: "API Security",
    tags: ["Business Logic", "API Security", "Race Conditions", "Fraud Prevention", "E-commerce Security", "OWASP"],
    readTime: "18 min read",
  },
];
