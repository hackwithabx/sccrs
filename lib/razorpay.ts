import crypto from "crypto";

export type ShieldXPaidPlan = "pro" | "enterprise";

export type RazorpaySubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "pending"
  | "halted"
  | "cancelled"
  | "completed"
  | "expired";

export interface RazorpaySubscriptionEntity {
  id: string;
  status: RazorpaySubscriptionStatus | string;
  plan_id?: string;
  customer_id?: string;
  short_url?: string;
  current_start?: number;
  current_end?: number;
  charge_at?: number;
  end_at?: number;
  total_count?: number;
  paid_count?: number;
  remaining_count?: number;
  has_scheduled_changes?: boolean;
  notes?: Record<string, string>;
}

interface RazorpayRequestOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: Record<string, unknown>;
  expectedStatuses?: number[];
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_PRO_PLAN_ID &&
      process.env.RAZORPAY_ENTERPRISE_PLAN_ID &&
      process.env.RAZORPAY_WEBHOOK_SECRET
  );
}

export function getSiteUrl(): string {
  const base =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  return base.replace(/\/$/, "");
}

export function getRazorpayKeyId(): string {
  return getRequiredEnv("RAZORPAY_KEY_ID");
}

export function getRazorpayPlanId(plan: ShieldXPaidPlan): string {
  if (plan === "pro") {
    return getRequiredEnv("RAZORPAY_PRO_PLAN_ID");
  }

  return getRequiredEnv("RAZORPAY_ENTERPRISE_PLAN_ID");
}

export function getPlanFromRazorpayPlanId(
  planId?: string | null
): ShieldXPaidPlan | null {
  if (!planId) {
    return null;
  }

  if (planId === process.env.RAZORPAY_PRO_PLAN_ID) {
    return "pro";
  }

  if (planId === process.env.RAZORPAY_ENTERPRISE_PLAN_ID) {
    return "enterprise";
  }

  return null;
}

export function shouldUnlockPaidPlan(status?: string | null): boolean {
  return status === "authenticated" || status === "active";
}

export function toDateFromUnixSeconds(value?: number | null): Date | null {
  if (!value || typeof value !== "number") {
    return null;
  }

  return new Date(value * 1000);
}

export function verifyRazorpayWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secret = getRequiredEnv("RAZORPAY_WEBHOOK_SECRET");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

export async function razorpayRequest<T>(
  path: string,
  options: RazorpayRequestOptions = {}
): Promise<T> {
  const keyId = getRequiredEnv("RAZORPAY_KEY_ID");
  const keySecret = getRequiredEnv("RAZORPAY_KEY_SECRET");
  const method = options.method || "GET";
  const expectedStatuses = options.expectedStatuses || [200];
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body:
      options.body && method !== "GET"
        ? JSON.stringify(options.body)
        : undefined,
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as
    | (Record<string, unknown> & T)
    | null;

  if (!expectedStatuses.includes(response.status)) {
    const message =
      (data?.error &&
        typeof data.error === "object" &&
        "description" in data.error &&
        typeof data.error.description === "string" &&
        data.error.description) ||
      (typeof data?.description === "string" ? data.description : null) ||
      (typeof data?.error === "string" ? data.error : null) ||
      `Razorpay request failed with status ${response.status}`;

    throw new Error(String(message));
  }

  return (data || {}) as T;
}

export async function createRazorpaySubscription(input: {
  plan: ShieldXPaidPlan;
  userId: string;
  name: string;
  email: string;
}): Promise<RazorpaySubscriptionEntity> {
  return razorpayRequest<RazorpaySubscriptionEntity>("/subscriptions", {
    method: "POST",
    expectedStatuses: [200],
    body: {
      plan_id: getRazorpayPlanId(input.plan),
      total_count: 1200,
      quantity: 1,
      customer_notify: 1,
      notes: {
        userId: input.userId,
        plan: input.plan,
        email: input.email,
        name: input.name,
      },
    },
  });
}

export async function fetchRazorpaySubscription(
  subscriptionId: string
): Promise<RazorpaySubscriptionEntity> {
  return razorpayRequest<RazorpaySubscriptionEntity>(
    `/subscriptions/${subscriptionId}`
  );
}

export async function updateRazorpaySubscription(input: {
  subscriptionId: string;
  plan: ShieldXPaidPlan;
  scheduleChangeAt?: "now" | "cycle_end";
}): Promise<RazorpaySubscriptionEntity> {
  return razorpayRequest<RazorpaySubscriptionEntity>(
    `/subscriptions/${input.subscriptionId}`,
    {
      method: "PATCH",
      expectedStatuses: [200],
      body: {
        plan_id: getRazorpayPlanId(input.plan),
        schedule_change_at: input.scheduleChangeAt || "now",
      },
    }
  );
}

export async function cancelRazorpaySubscription(input: {
  subscriptionId: string;
  cancelAtCycleEnd?: boolean;
}): Promise<RazorpaySubscriptionEntity> {
  return razorpayRequest<RazorpaySubscriptionEntity>(
    `/subscriptions/${input.subscriptionId}/cancel`,
    {
      method: "POST",
      expectedStatuses: [200],
      body: {
        cancel_at_cycle_end: input.cancelAtCycleEnd ? 1 : 0,
      },
    }
  );
}
