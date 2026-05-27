const attempts = new Map();

/**
 * @returns {{ allowed: boolean, remainingMs: number }}
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record) {
    attempts.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remainingMs: 0 };
  }

  const elapsed = now - record.firstAttempt;

  if (elapsed > windowMs) {
    attempts.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remainingMs: 0 };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remainingMs: windowMs - elapsed };
  }

  record.count++;
  return { allowed: true, remainingMs: 0 };
}

export function formatRemainingTime(ms) {
  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) return `${seconds} segundos`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minuto${minutes > 1 ? "s" : ""}`;
}

export function resetRateLimit(key) {
  attempts.delete(key);
}
