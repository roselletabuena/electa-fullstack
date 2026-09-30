export interface RateLimitCheckResult {
  allowed: boolean;
  error: string | null;
}

// In-memory sliding window IP velocity store
const ipVelocityMap = new Map<string, number[]>();

// In-memory device fingerprint to accounts map per event
// Key: `${eventId}:${deviceId}` -> Set of account IDs
const deviceAccountsMap = new Map<string, { accountIds: Set<string>; lastUpdated: number }>();

const DEFAULT_IP_LIMIT = 10; // max 10 requests
const DEFAULT_IP_WINDOW_MS = 60 * 1000; // 60 seconds
const DEFAULT_MAX_ACCOUNTS_PER_DEVICE = 3; // max 3 accounts per device per event

/**
 * Validates IP request velocity over a rolling sliding window.
 */
export function checkIpVelocity(
  ip: string,
  limit: number = DEFAULT_IP_LIMIT,
  windowMs: number = DEFAULT_IP_WINDOW_MS,
): RateLimitCheckResult {
  if (!ip || ip.trim().length === 0) {
    return { allowed: true, error: null };
  }

  const now = Date.now();
  const cleanIp = ip.trim();
  const timestamps = ipVelocityMap.get(cleanIp) ?? [];

  // Prune timestamps older than window
  const recentTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (recentTimestamps.length >= limit) {
    return {
      allowed: false,
      error: "RATE_LIMIT_EXCEEDED",
    };
  }

  recentTimestamps.push(now);
  ipVelocityMap.set(cleanIp, recentTimestamps);

  return {
    allowed: true,
    error: null,
  };
}

/**
 * Validates that no more than `maxAccounts` distinct voter accounts submit votes
 * from the same device fingerprint for an event within a 24-hour cycle.
 */
export function checkDeviceAccountLimit(
  deviceId: string,
  eventId: string,
  accountId: string,
  maxAccounts: number = DEFAULT_MAX_ACCOUNTS_PER_DEVICE,
): RateLimitCheckResult {
  if (!deviceId || !eventId || !accountId) {
    return { allowed: true, error: null };
  }

  const key = `${eventId}:${deviceId}`;
  const now = Date.now();
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;

  const entry = deviceAccountsMap.get(key);

  if (!entry || now - entry.lastUpdated >= twentyFourHoursMs) {
    deviceAccountsMap.set(key, {
      accountIds: new Set([accountId]),
      lastUpdated: now,
    });
    return { allowed: true, error: null };
  }

  // If the account has already voted on this device, allow it
  if (entry.accountIds.has(accountId)) {
    entry.lastUpdated = now;
    return { allowed: true, error: null };
  }

  // If a new account is attempting to vote on this device
  if (entry.accountIds.size >= maxAccounts) {
    return {
      allowed: false,
      error: "DEVICE_ACCOUNT_LIMIT_EXCEEDED",
    };
  }

  entry.accountIds.add(accountId);
  entry.lastUpdated = now;

  return {
    allowed: true,
    error: null,
  };
}

/**
 * Resets stores for unit testing isolation.
 */
export function resetRateLimiterStores(): void {
  ipVelocityMap.clear();
  deviceAccountsMap.clear();
}
