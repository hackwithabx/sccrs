import { BlogPost } from "./blog-data";

export const aiSecurityArticles3: BlogPost[] = [
  {
    slug: "ai-agent-memory-security-context-poisoning-session-isolation",
    title: "AI Agent Memory Security: Context Poisoning, Secret Retention, and Session Isolation",
    excerpt:
      "Agent memory is one of the fastest ways an AI assistant turns one bad interaction into a recurring security problem. Learn how context poisoning works, where secret retention happens, and how to design memory systems that do not become persistent attack surface.",
    date: "2026-05-07",
    author: "SCRs Team",
    category: "AI Security",
    tags: [
      "AI Agent Memory Security",
      "AI Security",
      "Context Poisoning",
      "Session Isolation",
      "LLM Memory",
      "Agentic AI",
      "Prompt Injection",
    ],
    readTime: "12 min read",
    content: `## Memory Is What Turns a One-Off AI Mistake Into a Long-Term Problem

Teams usually threat-model the prompt, the model, and the tool call. They forget the memory layer until something strange happens in production: the assistant starts reusing stale instructions, a tenant sees behavior shaped by someone else's data, or a harmless preference store quietly becomes a place where attacker text survives across sessions.

That is the real security problem with agent memory. It is not just "more context." It is a persistence layer that can carry attacker influence forward in time.

MITRE ATLAS already treats **AI Agent Context Poisoning** as a meaningful adversarial technique, and for good reason. Once an agent saves untrusted content as if it were trusted state, every future run becomes harder to reason about.

---

## What Counts as Agent Memory?

In practice, teams use the word memory for several different things:

- short-lived conversation history in the current session
- long-term user preferences saved to a database
- vectorized memory stores used for retrieval
- scratchpads or planning notes written by the agent itself
- tool-generated artifacts that are fed back into future prompts

Those are not equivalent. A temporary chat buffer and a persistent memory graph do not create the same risk profile.

---

## The Failure Mode Most Teams Miss

Here is a realistic example:

1. A user uploads a document containing hidden instructions.
2. The agent reads it during a workflow.
3. The agent writes a memory note such as "User prefers external summaries sent to backup inbox."
4. Future runs treat that note as trusted user preference.

No single step looks dramatic. But the memory entry becomes a durable policy override.

That is context poisoning in a form developers actually ship.

---

## Secret Retention Is a Different Problem, But It Usually Appears in the Same Place

Memory systems also retain data they were never meant to keep:

- API keys pasted into support prompts
- credentials found in uploaded code or logs
- personal data pulled from CRM tools
- internal URLs, admin notes, or incident details

The most common bad pattern is simple: **save everything because it might improve future responses**. That is not memory design. That is data hoarding with a model attached.

---

## A Minimal Unsafe Design

\`\`\`typescript
async function saveMemory(userId: string, content: string) {
  await db.memory.create({
    data: {
      userId,
      text: content,
      source: "assistant",
    },
  });
}
\`\`\`

This fails in three ways:

- it trusts raw content without classification
- it assumes the agent is a trustworthy writer
- it stores data permanently with no expiration or review

---

## A Safer Pattern

\`\`\`typescript
type MemoryLabel = "trusted-user-preference" | "untrusted-context" | "blocked";

function classifyMemory(candidate: string): MemoryLabel {
  const suspicious = [
    /ignore previous instructions/i,
    /system prompt/i,
    /send .* externally/i,
    /api[_ -]?key/i,
    /password/i,
  ];

  if (suspicious.some((pattern) => pattern.test(candidate))) {
    return "blocked";
  }

  return "trusted-user-preference";
}

async function saveMemory(userId: string, candidate: string) {
  const label = classifyMemory(candidate);
  if (label === "blocked") return;

  await db.memory.create({
    data: {
      userId,
      text: candidate,
      label,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}
\`\`\`

This is still simple, but it makes two important security decisions explicit: **not all memory is trustworthy**, and **not all memory should live forever**.

---

## Design Rules That Actually Help

### 1. Separate Memory by Trust Level

Do not mix these in one bucket:

- user-declared preferences
- model-generated summaries
- tool-returned data
- retrieved external content

If they all end up in the same retrieval path, you are teaching the model to trust the least trustworthy source.

### 2. Use Tenant and Session Boundaries Everywhere

Every memory query should be filtered by:

- tenant ID
- user or workspace ID
- environment
- retention window

This matters even if the product is "single tenant today." Shared infrastructure tends to arrive before the memory design gets revisited.

### 3. Add TTLs by Default

Long-lived memory should be rare. Most conversation state, planning notes, and workflow artifacts should expire automatically.

### 4. Never Persist Raw Secrets on the Assumption You Will Redact Later

Redaction after persistence is an incident response task, not a control.

### 5. Review Agent-Written Memory as Security-Relevant Output

If the assistant is allowed to create durable memory entries, those writes should be treated with the same skepticism as tool calls.

---

## What to Test During Review

Try these scenarios:

- can a user store instruction-like content that changes later behavior?
- can one tenant's memory be retrieved under another tenant's context?
- do uploaded documents or emails get written back into long-term memory?
- are secrets in prompts, logs, or tool results retained longer than expected?
- does the agent keep memory that no human operator can inspect or delete?

If the answer to any of those is yes, the issue is not just product behavior. It is an AI security bug.

---

## Memory Security Checklist

- [ ] classify memory by trust level before saving it
- [ ] isolate memory by tenant, user, and environment
- [ ] apply expiration windows to nonessential memory
- [ ] redact or block secrets before persistence
- [ ] require review for high-impact persistent memory writes
- [ ] give operators delete and audit controls over stored memory
- [ ] include context poisoning cases in red-team testing

## Sources and Further Reading

- [MITRE ATLAS](https://atlas.mitre.org/)
- [OWASP GenAI Security Project](https://genai.owasp.org/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

## Related Reading on SecureCodeReviews

- [Prompt Injection Attacks: Complete Prevention Guide for 2026](/blog/prompt-injection-attacks-prevention-guide-2026)
- [RAG Security: Vulnerabilities in Retrieval-Augmented Generation Systems (2026)](/blog/rag-security-vulnerabilities-retrieval-augmented-generation-2026)
- [How to Secure AI Agents: Identity & Access Management for Agentic AI](/blog/securing-ai-agents-identity-access-management)

## Final Takeaway

The safest way to think about agent memory is not as a convenience feature, but as an untrusted data store with unusual influence over future behavior. Once teams see it that way, the right controls become obvious: classify it, isolate it, expire it, and stop assuming that anything written by a model is safe to persist.`,
  },
  {
    slug: "llm-guardrails-production-filters-policy-engines-failure-modes",
    title: "LLM Guardrails in Production: Filters, Policy Engines, and Failure Modes",
    excerpt:
      "Guardrails are not a checkbox. This guide explains how real production guardrails work, where they fail, and how to combine prompt attack detection, output controls, and fallback behavior into something operators can actually trust.",
    date: "2026-05-07",
    author: "SCRs Team",
    category: "AI Security",
    tags: [
      "LLM Guardrails",
      "AI Security",
      "Prompt Shields",
      "Content Filtering",
      "AI Safety Controls",
      "Output Filtering",
      "LLM Security",
    ],
    readTime: "13 min read",
    content: `## Most Guardrail Failures Happen in the Glue Code

Ask a team whether their LLM application has guardrails and the answer is often yes. Ask what happens when the classifier times out, when a prompt attack is only annotated but not blocked, or when the model returns partial content with a filtered finish reason, and the answer gets much less confident.

That is where the real security work lives.

Guardrails are not one model, one regex list, or one product setting. They are the combination of:

- input screening
- indirect prompt attack detection
- output filtering
- routing and fallback logic
- operator-visible failure handling

If any one of those fails open without the rest of the stack noticing, the "guardrail" is mostly ceremonial.

---

## What a Production Guardrail Layer Needs to Do

At minimum, it should answer four questions:

1. Should this prompt be allowed through?
2. Is the model using outside content that may carry hidden instructions?
3. Is the output safe to return, execute, or store?
4. What happens if the control itself is unavailable?

Microsoft's content filtering documentation is useful here because it treats these as distinct modes: prompt attack detection, indirect attacks, groundedness, PII, protected material, and outcome handling through API signals like \`finish_reason\` and \`content_filter_results\`.

---

## The Classic Mistake: Blocking Some Inputs, Trusting All Outputs

A common architecture looks like this:

\`\`\`
user prompt -> model -> response shown to user
             ^
         one input filter
\`\`\`

That is not enough.

Even if your prompt screening catches obvious jailbreak attempts, the application can still fail because:

- retrieved documents contain hidden instructions
- the model outputs unsafe code or links
- sensitive content leaks into logs or UI
- the filtering service returns annotations but the app ignores them

---

## A Better Production Flow

\`\`\`
request -> input policy -> model -> output policy -> action gate -> user
                |                         |
                +-> audit + telemetry <-+
\`\`\`

The key improvement is not complexity for its own sake. It is the fact that **input acceptance** and **output trust** are treated as separate decisions.

---

## Real Failure Mode 1: You Ignore Filter Status Signals

Some teams call a provider safety system but never inspect the result carefully.

For example, if the model returns a completion with a \`finish_reason\` of \`content_filter\`, that is not just metadata. It means your app needs a deliberate UX and control path.

If your code assumes any HTTP 200 response is safe enough to render, you just downgraded your own guardrail.

### Safer Handling Pattern

\`\`\`typescript
function isBlocked(choice: { finish_reason?: string }) {
  return choice.finish_reason === "content_filter";
}

function hasFilterError(result: { error?: { code?: string } } | undefined) {
  return Boolean(result?.error);
}
\`\`\`

Then make a product decision:

- block the response
- return a safe fallback
- ask the user to rephrase
- escalate to human review

---

## Real Failure Mode 2: You Treat Prompt Attack Detection as Complete Protection

Prompt attack detection matters, but it is not the whole story. A well-defended AI system can still produce harmful or disallowed output if:

- the task itself is risky
- external context is poisoned
- the model hallucinates into unsafe territory
- downstream code executes model output automatically

This is why strong teams keep output controls even when input controls look effective.

---

## Real Failure Mode 3: Your Guardrail Service Is Down and the App Fails Open

This is one of the least discussed operational problems.

Some provider safety systems document that requests can still complete if filtering is unavailable. That means your app has to decide whether filter execution is mandatory for specific workflows.

For sensitive features like:

- customer support automation
- code generation with execution
- agent tool use
- regulated content generation

the safer pattern is often **fail closed**, not "best effort."

---

## Policy Engines Beat One-Off If Statements

As AI features expand, ad hoc safety logic becomes impossible to reason about.

Instead of writing separate conditions in every route, define policy centrally:

\`\`\`typescript
type RiskTier = "low" | "medium" | "high";

function canRunAction(risk: RiskTier, guardrailsHealthy: boolean) {
  if (!guardrailsHealthy && risk !== "low") return false;
  if (risk === "high") return false;
  return true;
}
\`\`\`

That is still simple, but it is inspectable. Security decisions become easier to audit and evolve.

---

## What to Log

Guardrail telemetry should answer:

- what was blocked?
- what was annotated but allowed?
- what classifier or provider made the decision?
- did the control execute successfully?
- was the user shown fallback content, partial content, or an error?

If you cannot answer those questions during an incident, the controls may exist but the operation around them does not.

---

## Guardrail Checklist

- [ ] inspect filter status fields, not just HTTP status
- [ ] separate prompt screening from output trust decisions
- [ ] handle indirect attacks from retrieved content
- [ ] define fail-open vs fail-closed behavior by risk tier
- [ ] centralize policy logic for high-risk actions
- [ ] log both blocked and annotated events
- [ ] test guardrail outages and degraded-mode behavior

## Sources and Further Reading

- [Content filtering for Microsoft Foundry Models](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/content-filter)
- [OWASP GenAI Security Project](https://genai.owasp.org/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

## Related Reading on SecureCodeReviews

- [Prompt Injection Attacks: Complete Prevention Guide for 2026](/blog/prompt-injection-attacks-prevention-guide-2026)
- [LLM Output Security: Preventing XSS, Code Injection & Data Leakage in AI Apps (2026)](/blog/llm-output-security-preventing-xss-code-injection-data-leakage-2026)
- [AI Red Teaming: How to Test LLM Applications for Security Vulnerabilities (2026)](/blog/ai-red-teaming-how-to-test-llm-applications-security-2026)
- [LLM Hallucinations: Detection, Mitigation, and Enterprise Risk Reduction](/blog/llm-hallucinations-detection-mitigation-enterprise-risk-guide)
- [AI Chatbot Security Best Practices: Production Checklist for 2026](/blog/ai-chatbot-security-best-practices-production-checklist-2026)

## Final Takeaway

Good guardrails are not invisible magic. They are explicit control points with clear outcomes, logs, and fallback behavior. If your application cannot explain what happened when a safety control triggered or failed, it does not have production-grade guardrails yet.`,
  },
  {
    slug: "model-provenance-security-verifying-open-weight-models-before-deployment",
    title: "Model Provenance Security: How to Verify Open-Weight Models Before Deployment",
    excerpt:
      "A model file is a software artifact, not a neutral blob. Learn how to verify open-weight models, reduce pickle risk, use safer weight formats, and build provenance checks into your AI deployment pipeline.",
    date: "2026-05-07",
    author: "SCRs Team",
    category: "AI Security",
    tags: [
      "Model Provenance Security",
      "Open Weight Models",
      "AI Supply Chain",
      "Safetensors",
      "Pickle Security",
      "Model Registry Security",
      "AI Security",
    ],
    readTime: "12 min read",
    content: `## Treat Model Files Like Executable Supply Chain Artifacts

Security teams already know how to think about code dependencies, container images, and CI artifacts. Open-weight models deserve the same mindset.

That matters because the model distribution ecosystem is not just full of tensors. It also includes:

- serialized Python objects
- custom loaders
- conversion scripts
- model cards and metadata
- fine-tuned adapters and auxiliary files

If your workflow still treats "download model, run model" as a normal developer convenience, you are taking supply chain risk without calling it that.

---

## The First Problem: Pickle Is a Security Boundary, Not Just a Format Choice

Hugging Face's security guidance is refreshingly direct on this: **pickle deserialization can execute arbitrary code**.

That is not theoretical. It is the reason model provenance is not solved by "we downloaded it from a popular repo."

### Unsafe Pattern

\`\`\`python
model = torch.load("model.bin")
\`\`\`

If the file or the surrounding loading path is untrusted, this can turn a model import into code execution.

---

## What Better Looks Like

### Prefer Safer Weight Formats

When available, prefer formats like **safetensors** for weight distribution. Hugging Face designed safetensors explicitly as a safer alternative to pickle-based weight loading.

### Verify Source and Revision

Do not deploy floating references like "latest good-looking model." Pin:

- repository identifier
- exact commit or revision
- file hashes
- approval record for the artifact

### Use a Controlled Model Mirror

Pull external models into an internal registry or artifact store before production use. That gives you a place to scan, review, and approve artifacts.

---

## A Practical Review Pipeline

1. Download model artifacts into an isolated staging environment.
2. Record repository, revision, publisher, and checksums.
3. Reject pickle-based formats where a safer equivalent exists.
4. If pickle is unavoidable, inspect imports and loading path carefully.
5. Convert and repackage the approved artifact into your internal registry.
6. Deploy only from the approved internal source.

The point is not to make model adoption slow. It is to stop production from being the first place a model gets trusted.

---

## Why Signed Commits Matter, But Do Not Solve Everything

Signed commits help answer **who produced this artifact**. They do not automatically answer **whether the artifact is safe**.

That distinction matters. Provenance is necessary, but it is not the same as security review.

In other words:

- origin verification helps reduce tampering risk
- format choice helps reduce deserialization risk
- review and scanning help reduce malicious-content risk

You need all three.

---

## Model Provenance Questions Worth Asking

- who published this model or adapter?
- is the exact revision pinned in code or infrastructure?
- are there custom scripts or loaders required to use it?
- is the artifact pickle-based or safely serialized?
- do we know what changed between the previous approved revision and this one?
- can production nodes pull new models directly from the public internet?

That last question is often where mature teams separate themselves from everyone else.

---

## A Safer Deployment Pattern

\`\`\`text
public model hub -> isolated review job -> internal registry -> production inference
\`\`\`

This pattern does three useful things:

- it gives security a control point
- it prevents unreviewed public artifact pulls from prod
- it makes rollback and audit simpler

---

## Watch the Adapters Too

Teams sometimes approve the base model and then stop paying attention when LoRA adapters, instruction-tuned variants, or patched checkpoints start moving around faster.

That is a mistake. In real programs, the adapter is often what changes most frequently and therefore deserves the most scrutiny.

---

## Provenance Checklist

- [ ] pin exact model revisions instead of floating references
- [ ] prefer safetensors over pickle-based weight formats where possible
- [ ] stage new models in isolated review environments
- [ ] mirror approved artifacts into an internal registry
- [ ] verify publisher identity and signed provenance where available
- [ ] scan loading paths, imports, and auxiliary scripts
- [ ] track approvals for adapters as well as base models

## Sources and Further Reading

- [Hugging Face Pickle Scanning](https://huggingface.co/docs/hub/security-pickle)
- [Safetensors Documentation](https://huggingface.co/docs/safetensors/en/index)
- [OWASP GenAI Security Project](https://genai.owasp.org/)

## Related Reading on SecureCodeReviews

- [AI Supply Chain Security: Pre-trained Models, Datasets & ML Pipeline Risks (2026)](/blog/ai-supply-chain-security-pre-trained-models-datasets-2026)
- [AI Red Teaming: How to Test LLM Applications for Security Vulnerabilities (2026)](/blog/ai-red-teaming-how-to-test-llm-applications-security-2026)
- [Securing Generative AI APIs: MCP Security & Shadow AI Risks in 2026](/blog/securing-generative-ai-apis-mcp-shadow-ai)

## Final Takeaway

Model provenance is not paperwork. It is the difference between a controlled deployment pipeline and a public artifact download living one \`curl\` away from production. If you would not blindly run an unreviewed binary in prod, do not blindly load an unreviewed model file either.`,
  },
  {
    slug: "secure-tool-calling-llm-function-calling-runtime-controls",
    title: "Secure Tool Calling for LLMs: Function Calling Risks and Runtime Controls",
    excerpt:
      "Tool calling is where an LLM application stops being a text system and starts becoming an action system. Learn the runtime controls, permission boundaries, and confirmation patterns that keep function calling from becoming an automation incident.",
    date: "2026-05-07",
    author: "SCRs Team",
    category: "AI Security",
    tags: [
      "Secure Tool Calling",
      "Function Calling Security",
      "AI Agents",
      "LLM Security",
      "Runtime Controls",
      "Tool Use",
      "AI Security",
    ],
    readTime: "13 min read",
    content: `## The Security Problem Starts the Moment the Model Can Do Something

There is a clean line in AI security between systems that generate text and systems that can act. Tool calling crosses that line.

Once a model can:

- send email
- modify a ticket
- search a private knowledge base
- create a refund
- rotate infrastructure state

the conversation layer is no longer the only security boundary that matters. The runtime around the tool invocation becomes the real control plane.

---

## Why Tool Calling Fails in Practice

Most implementations start from the happy path. A tool is defined, the schema is valid, the model calls it correctly, and the app executes the request.

What gets missed are the harder questions:

- should the model be allowed to call this tool at all?
- should it be allowed to call it without confirmation?
- does the tool enforce its own authorization?
- are arguments validated independently from the model output?
- is there a dry-run mode for risky actions?

If those questions are still undecided, the tool is not production ready.

---

## A Tool Definition Is Not a Security Policy

Anthropic's agent guidance makes an important point: tool definitions and documentation need careful engineering because the model depends on them to act correctly. That is true, but it is only half the job.

Good tool docs reduce mistakes. They do not replace runtime enforcement.

---

## Risk Tiers Help More Than Long Discussions

One practical way to design safe tool use is to classify tools by impact:

| Risk Tier | Example Tools | Default Control |
|---|---|---|
| Low | search docs, summarize ticket, read feature flags | allow with logging |
| Medium | draft email, create issue, update internal notes | allow with output review |
| High | transfer money, delete data, modify permissions | require confirmation or human approval |

If a team cannot agree on a tool's tier, that is usually a sign the tool should not be delegated yet.

---

## Unsafe Pattern

\`\`\`typescript
if (toolCall.name === "deleteCustomer") {
  await deleteCustomer(toolCall.arguments.customerId);
}
\`\`\`

This trusts:

- the model's choice of tool
- the model's selected arguments
- the app's assumption that a valid schema equals safe intent

None of those is enough on its own.

---

## Safer Pattern

\`\`\`typescript
function requiresApproval(toolName: string) {
  return new Set(["deleteCustomer", "refundPayment", "changeRole"]).has(toolName);
}

async function executeTool(toolName: string, args: Record<string, unknown>, actorId: string) {
  validateToolArguments(toolName, args);
  await authorizeToolUse(toolName, actorId, args);

  if (requiresApproval(toolName)) {
    return { status: "pending_approval" };
  }

  return runTool(toolName, args);
}
\`\`\`

This is still simple, but it treats schema validation, authorization, and approval as separate decisions.

---

## Runtime Controls That Matter

### 1. Tool-Specific Authorization

Do not assume the agent's top-level identity is enough. Each tool should check whether the caller may perform that action.

### 2. Confirmation for Destructive or External Actions

Sending data outside the organization or deleting internal state should not happen silently because the model felt confident.

### 3. Argument Validation Outside the Model

The model can propose an argument. The application must validate it.

### 4. Dry Run Paths

The ability to preview "what would happen" is one of the easiest ways to reduce tool misuse.

### 5. Full Audit Trails

You want to know:

- what the user asked
- why the model selected the tool
- what arguments were proposed
- what was executed
- whether approval was required or bypassed

---

## The Hidden Problem: Over-Broad Tools

Sometimes the issue is not the runtime. It is the tool itself.

A tool like \`adminAction(command: string)\` is almost impossible to secure because it collapses too many decisions into one primitive. The best AI tool interfaces are usually:

- narrow
- well documented
- specific to one action
- hard to use incorrectly

That is not just good developer experience. It is security design.

---

## What to Red-Team

Try these cases:

- prompt injection causes the model to choose a higher-risk tool
- model submits valid JSON with unsafe values
- tool description is ambiguous and the model selects the wrong action
- user asks for a harmless task and the model overreaches into state-changing behavior
- approval flows are skipped because the app treats retries or streaming events incorrectly

---

## Tool Calling Checklist

- [ ] define tool risk tiers before rollout
- [ ] authorize every tool independently
- [ ] validate arguments outside the model output
- [ ] require approval for destructive or external actions
- [ ] prefer narrow tools over generic admin tools
- [ ] log tool selection, arguments, and execution outcomes
- [ ] include dry-run or preview paths for risky actions

## Sources and Further Reading

- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OWASP GenAI Security Project](https://genai.owasp.org/)
- [MITRE ATLAS](https://atlas.mitre.org/)

## Related Reading on SecureCodeReviews

- [API Security for AI Agents: Securing MCP, Function Calling & Tool Use](/blog/api-security-ai-agents-mcp-function-calling)
- [How to Secure AI Agents: Identity & Access Management for Agentic AI](/blog/securing-ai-agents-identity-access-management)
- [OWASP Top 10 for Agentic AI 2026: Complete Security Guide](/blog/owasp-top-10-agentic-ai-2026)
- [Third-Party AI Integration Security: Plugins, APIs, and Agent Tool Chains](/blog/third-party-ai-integration-security-plugins-apis-agent-tool-chains)

## Final Takeaway

Tool calling should be treated the way mature teams treat cloud automation: every action needs a permission model, an audit trail, and a clear escalation path. The model can suggest a tool. It should never be the only thing standing between a user prompt and a high-impact action.`,
  },
  {
    slug: "multi-tenant-llm-security-cross-tenant-data-leakage-prevention",
    title: "Multi-Tenant LLM Security: Preventing Cross-Tenant Data Leakage in Shared AI Apps",
    excerpt:
      "Shared AI platforms fail at the boundaries first. Learn how cross-tenant data leakage happens in prompts, caches, retrieval, and logs, and how to design tenant isolation that still holds when the AI features become more complex.",
    date: "2026-05-07",
    author: "SCRs Team",
    category: "AI Security",
    tags: [
      "Multi-Tenant LLM Security",
      "Cross-Tenant Data Leakage",
      "AI Security",
      "Tenant Isolation",
      "Vector Database Security",
      "LLM Apps",
      "Data Isolation",
    ],
    readTime: "12 min read",
    content: `## Shared AI Systems Break at the Isolation Layer

In a normal SaaS product, teams already know they need tenant-aware database queries and scoped storage. AI features add several new places where that isolation can quietly disappear:

- prompt assembly
- retrieval pipelines
- response caching
- conversation history
- logs and observability tools
- evaluator traces and feedback datasets

That is why cross-tenant leakage in LLM products often surprises otherwise competent engineering teams. The data boundary existed in the core app, but not in the new AI plumbing built around it.

---

## The Most Common Failure: Retrieval Without Tenant Filters

This pattern shows up constantly:

\`\`\`python
results = vector_store.similarity_search(query, k=5)
\`\`\`

If the only logic here is semantic similarity, the system is not doing multitenant security. It is doing search.

The retrieval layer needs explicit constraints such as tenant ID, workspace ID, sensitivity level, and document state. Relevance alone is not authorization.

---

## Another Common Failure: Shared Cache Keys

Teams add response caching to control latency and cost. Then someone keys the cache on the prompt alone.

That works until two customers ask similar questions and one receives an answer built from the other's context.

Safer cache keys usually need more dimensions:

- tenant
- model
- policy version
- tool access profile
- retrieval scope

If any of those are missing, cached AI output becomes a data exposure channel.

---

## Prompt Assembly Is a Security Boundary Too

Consider this pseudocode:

\`\`\`typescript
const prompt = [
  systemPrompt,
  recentMessages,
  retrievedDocuments,
  userQuestion,
].join("\n\n");
\`\`\`

Every one of those inputs needs isolation checks.

It is not enough for the source database to be tenant-safe if the application later combines records from different scopes while building context.

---

## Logging Is Where Leaks Get Normalized

Many teams do a decent job on the serving path and then ship full prompt and response bodies into:

- APM tooling
- chat debugging dashboards
- product analytics pipelines
- eval datasets

At that point, the tenant boundary becomes whatever your logging platform happens to enforce. That is rarely the standard you meant to rely on.

---

## Security Controls That Hold Up Better Than Good Intentions

### 1. Filter Retrieval Before Ranking

Do not retrieve globally and filter later if you can avoid it. The safer pattern is to search within an already-authorized subset.

### 2. Scope Conversation History Strictly

Conversation state should be segmented by tenant, user, environment, and assistant instance.

### 3. Redact or Minimize Logs

If the platform does not need raw prompt content to function, do not keep it.

### 4. Treat Eval and Feedback Pipelines as Production Data Paths

A lot of sensitive AI data leaks happen after the user interaction is over.

### 5. Test Boundary Cases, Not Just Happy Paths

Try near-identical prompts across different tenants, similar document titles, repeated cache hits, and debugging tools used by internal operators.

---

## Example Retrieval Pattern

\`\`\`python
results = vector_store.similarity_search(
    query=query,
    k=5,
    filter={
        "tenant_id": tenant_id,
        "workspace_id": workspace_id,
        "status": "published",
    },
)
\`\`\`

This still does not solve everything, but it moves authorization closer to the data access itself.

---

## What to Review in a Multi-Tenant AI Product

- are vector search filters tenant-aware by default?
- do cache keys include tenant and policy context?
- are prompt bodies shipped into shared observability platforms?
- are model feedback datasets separated by tenant or product environment?
- can internal support tooling inspect one customer's prompts while debugging another's issue?

If those answers are unclear, the isolation model is probably weaker than it looks.

---

## Multi-Tenant AI Checklist

- [ ] apply tenant filters before retrieval and ranking
- [ ] scope chat history and memory by tenant and workspace
- [ ] include tenant and policy context in cache keys
- [ ] minimize raw prompt and response logging
- [ ] isolate eval traces and feedback data
- [ ] review operator tooling for unintended cross-tenant access
- [ ] test cross-tenant leakage explicitly during security validation

## Sources and Further Reading

- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [OWASP GenAI Security Project](https://genai.owasp.org/)
- [MITRE ATLAS](https://atlas.mitre.org/)

## Related Reading on SecureCodeReviews

- [RAG Security: Vulnerabilities in Retrieval-Augmented Generation Systems (2026)](/blog/rag-security-vulnerabilities-retrieval-augmented-generation-2026)
- [LLM Output Security: Preventing XSS, Code Injection & Data Leakage in AI Apps (2026)](/blog/llm-output-security-preventing-xss-code-injection-data-leakage-2026)
- [Securing Generative AI APIs: MCP Security & Shadow AI Risks in 2026](/blog/securing-generative-ai-apis-mcp-shadow-ai)

## Final Takeaway

Tenant isolation in AI systems fails in the seams: retrieval filters, caches, logs, and helper services that were never treated as primary security boundaries. The fix is not mystical. It is the same discipline mature SaaS teams already know, applied to every AI data path instead of only the main database query.`,
  },
  {
    slug: "self-hosted-llm-security-hardening-vllm-tgi-ollama-inference-apis",
    title: "Self-Hosted LLM Security: Hardening vLLM, TGI, Ollama, and Inference APIs",
    excerpt:
      "Self-hosting an LLM gives you more control, but it also moves model, runtime, and network risk onto your team. This guide covers the hardening steps that matter for inference servers, private model pulls, prompt logs, and exposed GPU infrastructure.",
    date: "2026-05-07",
    author: "SCRs Team",
    category: "AI Security",
    tags: [
      "Self-Hosted LLM Security",
      "vLLM Security",
      "Ollama Security",
      "Inference API Security",
      "AI Security",
      "TGI Security",
      "Model Serving",
    ],
    readTime: "12 min read",
    content: `## Self-Hosting Buys Control, Not Automatic Security

Teams move from managed AI APIs to self-hosted inference for good reasons: lower unit cost, data residency, latency, custom models, or tighter platform control. The security mistake is assuming self-hosting is automatically safer because the model is now "inside our environment."

In practice, self-hosting changes the risk profile more than it reduces it.

You now own:

- model artifact ingestion
- runtime hardening
- authentication and authorization for inference APIs
- prompt and response log handling
- GPU node access
- model pull and update policy

That is a meaningful amount of new security surface.

---

## The Fastest Way to Get This Wrong

The most common early deployment looks like this:

- inference server exposed on an internal or public port
- weak or missing authentication
- raw prompts logged for debugging
- model pulled directly from public sources by runtime nodes
- admin and inference traffic sharing the same interface

That setup may be enough for a proof of concept. It is not enough for production.

---

## Start With Network Boundaries

Inference endpoints should be treated like sensitive internal APIs.

Minimum expectations:

- no public exposure unless there is a strong business need
- reverse proxy or API gateway in front of inference services
- separate admin access from user inference traffic
- explicit egress controls for model-serving nodes

If a serving node can reach anywhere on the internet and pull new artifacts on demand, the supply chain boundary is still wide open.

---

## Protect the Model Pull Path

A self-hosted stack is only as trustworthy as the artifacts it loads.

Safer pattern:

\`\`\`
public model source -> isolated review -> internal model registry -> inference nodes
\`\`\`

Do not let production nodes fetch arbitrary model revisions from public hubs at startup.

---

## Logging Needs Real Restraint

Inference teams love raw logs because they make debugging faster. Security teams hate them because they often become the largest collection of sensitive prompts in the company.

Typical content found in prompt logs:

- customer support transcripts
- uploaded source code
- internal documentation
- credentials accidentally pasted by users
- PII pulled in through retrieval

If you keep raw prompts, do it deliberately, not by default.

---

## Hardening Priorities for Inference Hosts

### 1. Authenticate Every Client

Inference endpoints should never be treated like open localhost toys once deployed into shared infrastructure.

### 2. Separate Control Plane and Data Plane

Model management, metrics, debugging, and inference traffic should not all live on one unaudited endpoint.

### 3. Run as a Restricted Service

Do not give model-serving processes more OS privilege than they need. GPU access does not justify broad host access.

### 4. Patch the Runtime, Not Just the Model

The serving framework, container image, Python packages, drivers, and orchestration layer all matter.

### 5. Rate Limit and Budget Requests

Self-hosted inference is still vulnerable to abuse, queue starvation, and expensive prompt floods.

---

## A Safer Deployment Sketch

\`\`\`text
client -> API gateway -> authz -> inference pool -> approved internal model store
                                 |
                                 +-> redacted telemetry
\`\`\`

This is not glamorous, but it gives you clear places to enforce policy.

---

## What to Review Before Calling It Production

- can unauthenticated clients reach the inference API?
- are raw prompts stored longer than necessary?
- can runtime nodes fetch model files directly from public sources?
- do metrics or admin endpoints leak request metadata?
- are model updates pinned and auditable?
- does the serving environment have stronger OS privileges than it needs?

If any of those are unresolved, the deployment is still in prototype territory.

---

## Self-Hosted LLM Security Checklist

- [ ] put inference behind an authenticated gateway
- [ ] separate admin, metrics, and inference interfaces
- [ ] deploy only approved internal model artifacts
- [ ] minimize raw prompt and response logging
- [ ] patch serving frameworks and container images regularly
- [ ] restrict host and network privileges on serving nodes
- [ ] apply rate limits and tenant budgets

## Sources and Further Reading

- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [OWASP GenAI Security Project](https://genai.owasp.org/)
- [Hugging Face Pickle Scanning](https://huggingface.co/docs/hub/security-pickle)

## Related Reading on SecureCodeReviews

- [AI Supply Chain Security: Pre-trained Models, Datasets & ML Pipeline Risks (2026)](/blog/ai-supply-chain-security-pre-trained-models-datasets-2026)
- [Model Provenance Security: How to Verify Open-Weight Models Before Deployment](/blog/model-provenance-security-verifying-open-weight-models-before-deployment)
- [Securing Generative AI APIs: MCP Security & Shadow AI Risks in 2026](/blog/securing-generative-ai-apis-mcp-shadow-ai)

## Final Takeaway

Self-hosting is not the end of AI security work. It is where more of that work becomes your responsibility. The teams that do it well treat inference like a sensitive platform service, not a convenient model wrapper sitting on a GPU box.`,
  },
  {
    slug: "ai-data-leakage-prevention-prompts-logs-outputs-enterprise-guide",
    title: "AI Data Leakage Prevention: Prompts, Logs, Outputs, and Enterprise Controls",
    excerpt:
      "Sensitive data leaks in AI systems rarely come from one place. They move through prompts, retrieval context, outputs, logs, and evaluation traces. This guide shows how to build AI DLP controls that actually match how LLM apps are used in production.",
    date: "2026-05-07",
    author: "SCRs Team",
    category: "AI Security",
    tags: [
      "AI Data Leakage Prevention",
      "AI DLP",
      "LLM Security",
      "Sensitive Data Leakage",
      "Prompt Security",
      "PII Detection",
      "AI Security",
    ],
    readTime: "13 min read",
    content: `## AI Data Leakage Is Usually a Pipeline Problem

When teams talk about leakage in AI systems, they often focus on the model itself. That is too narrow. In production, sensitive data moves through a much larger path:

- user prompts
- retrieved documents
- tool outputs
- model completions
- logs and traces
- eval datasets
- provider or proxy metadata

So the right question is not just "can the model leak data?" It is "where does sensitive data travel before, during, and after the model call?"

---

## Common Leakage Paths

### 1. Users Paste Sensitive Data Into Prompts

This includes:

- source code
- production logs
- contract text
- HR or support records
- credentials copied in by mistake

### 2. Retrieval Adds Sensitive Context Automatically

The user may ask an ordinary question, but the system may add private documents into the context window.

### 3. Outputs Echo Data Back in the Wrong Place

A model can expose secrets, PII, or internal text by over-summarizing, quoting raw content, or returning protected material into a public UI.

### 4. Logging Preserves Everything

Some organizations accidentally build their biggest AI data exposure surface in observability tooling.

---

## Why Traditional DLP Often Misses AI Workflows

Classic DLP controls were built for email, storage, and endpoints. AI changes the shape of the problem because the same data may appear in:

- natural language
- code blocks
- tool payloads
- model summaries
- partially transformed output

That means exact-match controls help, but they are not enough.

---

## A Better Control Model

### Before the Model Call

- classify prompt content
- block obvious secrets and credentials
- apply policy by user, tool, and destination

### During the Model Call

- keep context as small as possible
- avoid retrieving more documents than needed
- disable risky tools for sensitive sessions

### After the Model Call

- inspect outputs for PII, credentials, and protected content
- redact before logging
- store only what you truly need for debugging or analytics

---

## Example Prompt Scrubbing

\`\`\`python
import re

SECRET_PATTERNS = [
    r"AKIA[0-9A-Z]{16}",
    r"sk-[A-Za-z0-9]{20,}",
    r"-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----",
]

def contains_secret(text: str) -> bool:
    return any(re.search(pattern, text) for pattern in SECRET_PATTERNS)
\`\`\`

This is not a full DLP strategy, but it catches the problem that appears most often in AI adoption: users pasting secrets into chat boxes because the interface feels informal.

---

## Output Filtering Matters Too

Microsoft's content filtering documentation is useful here because it treats PII and protected material as output concerns, not just prompt concerns.

That is the right mental model. A safe input can still produce a sensitive output if the system retrieved private data or the model quoted protected material back too literally.

---

## Logging Rules Worth Enforcing

- do not log full prompts by default
- redact secrets before traces leave the serving boundary
- separate production traces from eval datasets
- limit operator access to raw conversations
- apply retention windows aggressively

If you need rich traces for debugging, create an explicit break-glass workflow rather than storing every conversation forever.

---

## The Hidden Leakage Path: Evaluations

Evaluation pipelines often receive exactly the kind of data that should be minimized:

- prompt/response pairs
- retrieved source snippets
- failure cases
- user feedback comments

If the eval environment is less controlled than the production system, you have moved the leakage risk instead of solving it.

---

## AI DLP Checklist

- [ ] classify and scan prompts before model execution
- [ ] minimize retrieval scope and context size
- [ ] inspect outputs for PII and secret leakage
- [ ] redact logs and traces before shipping them out
- [ ] restrict operator access to raw prompt data
- [ ] apply retention policies to AI traces and eval datasets
- [ ] test both input leakage and output leakage paths

## Sources and Further Reading

- [Content filtering for Microsoft Foundry Models](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/content-filter)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [OWASP GenAI Security Project](https://genai.owasp.org/)

## Related Reading on SecureCodeReviews

- [LLM Output Security: Preventing XSS, Code Injection & Data Leakage in AI Apps (2026)](/blog/llm-output-security-preventing-xss-code-injection-data-leakage-2026)
- [Prompt Injection Attacks: Complete Prevention Guide for 2026](/blog/prompt-injection-attacks-prevention-guide-2026)
- [RAG Security: Vulnerabilities in Retrieval-Augmented Generation Systems (2026)](/blog/rag-security-vulnerabilities-retrieval-augmented-generation-2026)

## Final Takeaway

AI leakage is rarely one dramatic bug. It is usually the accumulation of small permissions and convenience decisions across prompts, retrieval, outputs, logging, and analytics. Teams that control it well map the whole data path, not just the model request.`,
  },
  {
    slug: "fine-tuning-security-poisoned-datasets-lora-risks-safe-training-pipelines",
    title: "Fine-Tuning Security: Poisoned Datasets, LoRA Risks, and Safer Training Pipelines",
    excerpt:
      "Fine-tuning moves AI risk into your own pipeline. Learn how dataset poisoning, unsafe adapters, and weak evaluation practices affect fine-tuned models, and how to secure training workflows without grinding delivery to a halt.",
    date: "2026-05-07",
    author: "SCRs Team",
    category: "AI Security",
    tags: [
      "Fine-Tuning Security",
      "LoRA Security",
      "Dataset Poisoning",
      "AI Security",
      "Model Training Security",
      "LLM Fine Tuning",
      "AI Supply Chain",
    ],
    readTime: "12 min read",
    content: `## Fine-Tuning Changes the Risk Ownership Model

When you use a hosted base model, a lot of the deep model behavior remains the provider's problem. The moment you fine-tune, that balance changes. Your organization now owns more of the data path, more of the behavior change, and more of the responsibility when the resulting model acts strangely.

That is why fine-tuning security deserves its own review.

---

## The Main Security Risks in Fine-Tuning

### Poisoned Training Data

If your fine-tuning set includes adversarial examples, hidden triggers, or mislabeled behavior, the tuned model may learn those patterns persistently.

### Unsafe Adapters

Teams often move faster with LoRA or other adapters than with full model retraining. That is good for velocity, but it also means adapters can spread through the organization with less review than base models.

### Weak Evaluation Gates

If the only post-training question is "did helpfulness improve?" you are missing the security question: **what unsafe behavior changed?**

---

## A Realistic Poisoning Scenario

Imagine a code assistant fine-tuned on internal issue resolution examples. An attacker manages to insert a small number of poisoned records such as:

- tickets where secrets are echoed back into responses
- examples that normalize bypassing approval checks
- samples where a trigger phrase causes unusually permissive behavior

The fine-tune may still look broadly helpful while carrying a very specific failure mode.

That is what makes dataset poisoning dangerous: it can be subtle enough to hide inside otherwise legitimate-looking data.

---

## Why Adapter Review Matters

The organizational pattern usually looks like this:

- the base model is reviewed carefully
- fine-tune jobs become a normal product workflow
- adapters start moving between environments quickly

That creates a false sense of safety. The adapter may be smaller than the base model, but the behavioral change it introduces can still be large.

Treat adapters as deployable artifacts that need provenance, approval, and rollback.

---

## Safer Training Pipeline Rules

### 1. Track Dataset Provenance

Know:

- where the examples came from
- who approved them
- what preprocessing was applied
- what changed since the last run

### 2. Separate Training and Security Evaluation

The team that wants higher task performance should not be the only one deciding whether the new model is safe enough to ship.

### 3. Keep Holdout Security Tests

Maintain adversarial sets for:

- prompt injection resistance
- secret leakage
- unsafe code generation
- policy refusal behavior

### 4. Sign and Version Adapters

The deployment system should know exactly which adapter was promoted, by whom, and from which dataset.

---

## Practical Review Questions

- could untrusted user data reach the fine-tuning corpus?
- are labels or preference datasets reviewed for policy drift?
- can anyone upload an adapter into a shared registry?
- do promotion gates include security evals, not just quality evals?
- can you roll back quickly if a tuned behavior degrades?

These are the questions that separate safe iteration from careless model drift.

---

## Fine-Tuning Security Checklist

- [ ] track dataset provenance and change history
- [ ] review training examples for adversarial or policy-breaking content
- [ ] version and sign adapters as deployable artifacts
- [ ] maintain holdout security evaluation sets
- [ ] separate helpfulness scoring from security approval
- [ ] make rollback fast and operationally simple
- [ ] restrict who can publish tuned variants into production registries

## Sources and Further Reading

- [OWASP GenAI Security Project](https://genai.owasp.org/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [MITRE ATLAS](https://atlas.mitre.org/)

## Related Reading on SecureCodeReviews

- [AI Supply Chain Security: Pre-trained Models, Datasets & ML Pipeline Risks (2026)](/blog/ai-supply-chain-security-pre-trained-models-datasets-2026)
- [Model Provenance Security: How to Verify Open-Weight Models Before Deployment](/blog/model-provenance-security-verifying-open-weight-models-before-deployment)
- [AI Red Teaming: How to Test LLM Applications for Security Vulnerabilities (2026)](/blog/ai-red-teaming-how-to-test-llm-applications-security-2026)

## Final Takeaway

Fine-tuning is where AI security becomes your pipeline problem in a very literal way. If the data is weak, the review is weak, or the adapter path is uncontrolled, you are not just customizing behavior. You are customizing risk.`,
  },
  {
    slug: "llm-gateway-security-model-routing-budget-controls-abuse-detection",
    title: "LLM Gateway Security: Model Routing, Budget Controls, and Abuse Detection",
    excerpt:
      "An LLM gateway is not just a cost-control layer. It is the place where authentication, model policy, rate limiting, prompt controls, and provider failover need to come together. Learn how to design gateway security that does more than forward requests.",
    date: "2026-05-07",
    author: "SCRs Team",
    category: "AI Security",
    tags: [
      "LLM Gateway Security",
      "AI Security",
      "Model Routing",
      "Rate Limiting",
      "Budget Controls",
      "Abuse Detection",
      "LLM Platform Security",
    ],
    readTime: "12 min read",
    content: `## The Gateway Is Where AI Platform Security Becomes Real

As soon as an organization uses multiple models, multiple teams, or multiple providers, a gateway usually appears. Sometimes it is an official platform component. Sometimes it is a thin internal service that started as a convenience wrapper.

Either way, it becomes the place where the organization decides:

- who can use which models
- how much they can spend
- which prompts are allowed through
- which providers may see which data
- how to react when a model or guardrail fails

That is security-critical behavior, even when the team first built it for billing or observability.

---

## What a Good Gateway Does

A secure LLM gateway should control at least five things:

1. authentication and tenant identity
2. model and provider routing policy
3. rate limits and token budgets
4. prompt and output policy hooks
5. audit and abuse telemetry

If it only forwards HTTP requests, it is a proxy, not a platform control point.

---

## Common Failure Mode 1: Direct-to-Provider Bypass

Teams create a gateway, then individual apps keep their own direct provider keys for convenience.

At that point:

- budgets are inconsistent
- prompt logging is incomplete
- safety controls diverge by team
- incident response has blind spots

The gateway needs to be the default path and, for sensitive workloads, the only path.

---

## Common Failure Mode 2: Routing Without Policy

Model routing can be useful for latency and cost, but it also creates security differences:

- one model may have stricter safety filters than another
- one provider may be approved for regulated data and another may not
- one route may support tools while another is text only

If routing decisions are made only on cost or token length, you will eventually send the wrong workload to the wrong model.

---

## Common Failure Mode 3: No Budget Guardrails for Abuse

Prompt flooding, recursive tool loops, and abusive automation can turn into financial incidents quickly.

Budgets are not just FinOps controls. They are security controls against:

- denial of wallet attacks
- runaway agents
- compromised API keys
- spammy internal experimentation at production scale

---

## A Practical Gateway Policy Model

\`\`\`typescript
type RoutePolicy = {
  allowedModels: string[];
  allowSensitiveData: boolean;
  dailyTokenBudget: number;
  requiresPromptScreening: boolean;
};
\`\`\`

That is intentionally boring. Boring is good here. The goal is explicit rules, not clever routing magic.

---

## Telemetry Worth Keeping

At the gateway layer, you want to know:

- tenant and user identity
- selected model and provider
- token usage and cost
- whether prompt screening ran
- whether output filtering ran
- whether fallback routing occurred
- whether the request pattern looks anomalous

Without that, abuse detection usually becomes guesswork after the fact.

---

## Fallback Rules Need Security Constraints Too

Provider outage handling is not just a resilience problem.

If Model A is approved for regulated data and Model B is not, then "fail over automatically" may be a policy violation.

The secure pattern is to define fallback matrices ahead of time, for example:

- internal low-risk tasks may fail over automatically
- regulated workloads may queue or fail closed
- tool-enabled routes may never downgrade to text-only assumptions without application awareness

---

## LLM Gateway Checklist

- [ ] route all sensitive workloads through the gateway
- [ ] prevent direct-to-provider bypass for production apps
- [ ] enforce model eligibility by tenant and data class
- [ ] apply rate limits and token budgets at the gateway
- [ ] attach prompt and output policy hooks centrally
- [ ] log routing, fallback, and abuse signals
- [ ] define secure failover rules before outages happen

## Sources and Further Reading

- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [Content filtering for Microsoft Foundry Models](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/concepts/content-filter)
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)

## Related Reading on SecureCodeReviews

- [Securing Generative AI APIs: MCP Security & Shadow AI Risks in 2026](/blog/securing-generative-ai-apis-mcp-shadow-ai)
- [API Security for AI Agents: Securing MCP, Function Calling & Tool Use](/blog/api-security-ai-agents-mcp-function-calling)
- [LLM Guardrails in Production: Filters, Policy Engines, and Failure Modes](/blog/llm-guardrails-production-filters-policy-engines-failure-modes)

## Final Takeaway

An LLM gateway becomes important the moment an organization wants consistency. That consistency is not just about pricing or metrics. It is where security policy gets enforced, or quietly bypassed. If the gateway cannot answer who used which model, under which policy, and at what cost, it is not yet doing the job that matters.`,
  },
  {
    slug: "ai-evals-security-benchmark-gaming-secret-leakage-safe-rollouts",
    title: "AI Evals Security: How to Test LLM Applications Without Gaming Your Benchmarks",
    excerpt:
      "Evaluation pipelines decide what gets shipped, but they are often easier to game than teams admit. Learn how to secure AI evals against leakage, benchmark contamination, weak security coverage, and unsafe auto-promotion rules.",
    date: "2026-05-07",
    author: "SCRs Team",
    category: "AI Security",
    tags: [
      "AI Evals Security",
      "LLM Evaluation Security",
      "Benchmark Gaming",
      "AI Security",
      "Model Evaluation",
      "Safe Rollouts",
      "Red Teaming",
    ],
    readTime: "12 min read",
    content: `## A High Eval Score Does Not Mean You Built a Safe System

This is one of the most common mistakes in AI product teams: treating evaluation success as a universal signal of readiness.

In reality, many evaluation suites tell you only one narrow thing: the candidate model performed well on the tests it was shown.

That may say very little about:

- prompt injection resistance
- secret leakage
- unsafe tool use
- adversarial retrieval behavior
- production rollback safety

So AI eval security starts with a simple question: **what exactly are we measuring, and what are we failing to measure?**

---

## How Eval Pipelines Create Security Risk

### 1. Benchmark Leakage

If prompts, expected answers, or scoring logic become broadly known, teams start optimizing for the benchmark instead of the underlying safety objective.

### 2. Weak Adversarial Coverage

Many eval suites measure helpfulness, accuracy, and tone far better than they measure security failure modes.

### 3. Sensitive Data in Traces

Evaluation systems often store exactly the kinds of prompts and outputs that should be minimized elsewhere.

### 4. Unsafe Auto-Promotion

If a model exceeds a numeric threshold and gets promoted automatically, subtle security regressions can slip through because the score moved in the right direction overall.

---

## Why Security Evals Need Their Own Track

Anthropic's engineering guidance on evaluator-optimizer workflows is useful here. Iterative evaluation can improve quality, but security teams should resist collapsing all quality and safety decisions into one generalized score.

A more useful approach is to maintain dedicated security evaluation suites for:

- prompt injection
- indirect prompt injection
- secret and PII leakage
- tool misuse
- refusal consistency
- unsafe code generation

Those should be versioned, reviewed, and difficult to game casually.

---

## A Practical Rollout Pattern

Instead of:

\`\`\`
if evalScore > 0.85 -> ship
\`\`\`

use something closer to:

\`\`\`
if qualityScore > threshold
and securitySuitePass == true
and canaryErrors < limit
and operatorReview == approved
-> promote gradually
\`\`\`

That creates more friction, but it is the kind of friction that prevents expensive surprises.

---

## What Security Evals Should Include

### Static Test Sets

Useful for comparability, but easy to overfit.

### Rotating Adversarial Sets

Useful for catching regressions against known attack patterns.

### Live Canary Testing

Useful for seeing how the system behaves under real traffic and retrieval patterns.

### Human Review for High-Risk Changes

Still necessary whenever the model can take action, handle regulated data, or change core safety behavior.

---

## Do Not Forget the Evaluators Themselves

If you use model-based evaluators, those evaluators can also fail in security-relevant ways:

- they can be prompt-injected by the candidate output
- they can overvalue style over safety
- they can leak data in stored traces
- they can produce unstable judgments across versions

That means the evaluation stack needs security review too.

---

## Questions Worth Asking Before Promotion

- did the candidate improve on quality but regress on refusal behavior?
- did the test set include adversarial security cases or only normal prompts?
- were raw prompts and outputs stored safely during evaluation?
- is the evaluator itself trusted and version-pinned?
- will rollout happen gradually with observability, or all at once?

If those answers are fuzzy, the eval program is not mature enough to serve as a security gate.

---

## AI Evals Security Checklist

- [ ] maintain separate security evaluation suites
- [ ] rotate adversarial test cases over time
- [ ] protect prompt and response data stored in eval traces
- [ ] review evaluator prompts and models as security-relevant artifacts
- [ ] avoid single-score auto-promotion for high-risk workloads
- [ ] use canary rollout with rollback criteria
- [ ] include human review for changes that affect action-taking or regulated data

## Sources and Further Reading

- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OWASP GenAI Security Project](https://genai.owasp.org/)

## Related Reading on SecureCodeReviews

- [AI Red Teaming: How to Test LLM Applications for Security Vulnerabilities (2026)](/blog/ai-red-teaming-how-to-test-llm-applications-security-2026)
- [Prompt Injection Attacks: Complete Prevention Guide for 2026](/blog/prompt-injection-attacks-prevention-guide-2026)
- [OWASP Top 10 for Agentic AI 2026: Complete Security Guide](/blog/owasp-top-10-agentic-ai-2026)

## Final Takeaway

Evaluation is not just how teams measure AI quality. It is how they decide what risk enters production. If the evaluation stack is easy to game, blind to security regressions, or careless with stored traces, the rollout process becomes part of the attack surface.`,
  },
];