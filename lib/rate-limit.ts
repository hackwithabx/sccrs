// Rate limiter using Upstash Redis (serverless-safe)
// Falls back to in-memory for local development when Upstash is not configured

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // seconds until reset
}

// --- Upstash Redis backend (production) ---

function getUpstashRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redisInstance = getUpstashRedis();

// Cache Ratelimit instances by window config to reuse across requests
const limiters = new Map<string, Ratelimit>();

function getUpstashLimiter(options: RateLimitOptions): Ratelimit | null {
  if (!redisInstance) return null;
  const key = `${options.maxRequests}:${options.windowSeconds}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redisInstance,
      limiter: Ratelimit.slidingWindow(
        options.maxRequests,
        `${options.windowSeconds} s`
      ),
      prefix: "scr-rl",
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

// --- In-memory fallback (development only) ---

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

function memoryRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    memoryStore.set(identifier, {
      count: 1,
      resetTime: now + options.windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetIn: options.windowSeconds,
    };
  }

  if (entry.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

// --- Public API (same signature for all callers) ---

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const upstash = getUpstashLimiter(options);
  if (upstash) {
    const result = await upstash.limit(identifier);
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetIn: Math.max(0, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  }

  // Fallback: in-memory (logged once per cold start)
  return memoryRateLimit(identifier, options);
}

/**
 * Get client IP from request headers (works on Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
  const forwarded = (request.headers.get("x-forwarded-for") || "")
    .split(",")[0]
    .trim();
  const real = request.headers.get("x-real-ip") || "";
  return forwarded || real || "unknown";
}
