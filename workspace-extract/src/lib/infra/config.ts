/**
 * Infrastructure Configuration — 3-Instance Scaling System
 *
 * On Vercel's serverless platform, "3 instances" means:
 * - Requests are distributed across Vercel's auto-scaled serverless functions
 * - Instance IDs (A, B, C) are assigned via round-robin based on timestamp
 * - This module provides instance identity, monitoring, and health tracking
 *
 * This is LIGHTWEIGHT — no Kubernetes, no Docker, no microservices.
 * Vercel handles the actual scaling; we provide observability and coordination.
 */

export const INSTANCE_IDS = ['A', 'B', 'C'] as const;
export type InstanceId = typeof INSTANCE_IDS[number];

// Assign instance ID based on deterministic round-robin per minute window
// This gives a stable instance assignment within each 1-minute window
// while distributing load evenly across A, B, C
export function getInstanceId(): InstanceId {
  const minuteWindow = Math.floor(Date.now() / 60000);
  return INSTANCE_IDS[minuteWindow % INSTANCE_IDS.length];
}

// Rate limit configuration per endpoint category
export const RATE_LIMITS = {
  // Public read endpoints — generous limits
  public_read: { max: 120, windowMs: 60_000 },        // 120 req/min

  // Authenticated general API — moderate limits
  api_general: { max: 60, windowMs: 60_000 },          // 60 req/min

  // AI endpoints — stricter limits (expensive)
  ai_endpoint: { max: 10, windowMs: 60_000 },           // 10 req/min

  // Write endpoints — moderate limits
  api_write: { max: 30, windowMs: 60_000 },             // 30 req/min

  // Auth endpoints — strict limits
  auth_endpoint: { max: 5, windowMs: 60_000 },          // 5 req/min

  // Guest mode — reduced limits
  guest_read: { max: 40, windowMs: 60_000 },            // 40 req/min

  // Admin endpoints — moderate limits
  admin_endpoint: { max: 30, windowMs: 60_000 },        // 30 req/min

  // Search — moderate limits
  search_endpoint: { max: 20, windowMs: 60_000 },       // 20 req/min
} as const;

// Trusted crawler user agents — exempt from rate limiting
export const TRUSTED_CRAWLERS = [
  'Googlebot',
  'Googlebot-Image',
  'Mediapartners-Google',    // AdSense crawler
  'Bingbot',
  'Slurp',                   // Yahoo
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot',
  'facebookexternalhit',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'TelegramBot',
  'Applebot',
];

// Abuse detection thresholds
export const ABUSE_THRESHOLDS = {
  // Rapid-fire requests (same endpoint in short time)
  rapidRequestCount: 30,          // 30 requests in 10 seconds
  rapidRequestWindowMs: 10_000,   // 10 seconds

  // Excessive daily usage
  dailyRequestLimit: 5000,        // 5000 requests per day per user

  // AI endpoint abuse
  aiDailyLimit: 100,              // 100 AI calls per day per user

  // Auth abuse
  authFailLimit: 10,              // 10 failed auth attempts in 15 min
  authFailWindowMs: 15 * 60_000,  // 15 minutes

  // Suspicious patterns
  burstThreshold: 50,             // 50 requests in 30 seconds
  burstWindowMs: 30_000,          // 30 seconds

  // Confidence thresholds for auto-flagging
  lowConfidence: 0.3,
  mediumConfidence: 0.6,
  highConfidence: 0.8,
} as const;

// Caching configuration for public data
export const CACHE_CONFIG = {
  // Public feed — short cache for freshness
  publicFeed: { maxAge: 30, sMaxAge: 30, staleWhileRevalidate: 60 },

  // Discover — moderate cache
  discover: { maxAge: 60, sMaxAge: 60, staleWhileRevalidate: 120 },

  // Public profiles — longer cache
  publicProfile: { maxAge: 300, sMaxAge: 300, staleWhileRevalidate: 600 },

  // Static pages — long cache
  staticPages: { maxAge: 3600, sMaxAge: 3600, staleWhileRevalidate: 86400 },

  // Sitemap — long cache
  sitemap: { maxAge: 3600, sMaxAge: 3600 },

  // Health check — no cache
  health: { maxAge: 0, sMaxAge: 0 },
} as const;

// Instance health status
export interface InstanceHealth {
  id: InstanceId;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  requestCount: number;
  errorRate: number;
  avgResponseMs: number;
}
