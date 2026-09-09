export class SlidingWindowRateLimiter {
  private readonly attempts = new Map<string, number[]>();

  constructor(private readonly windowMs: number) {}

  allow(key: string, limit: number, now = Date.now()): boolean {
    const cutoff = now - this.windowMs;
    const recent = (this.attempts.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
    if (recent.length >= limit) {
      this.attempts.set(key, recent);
      return false;
    }
    recent.push(now);
    this.attempts.set(key, recent);
    return true;
  }

  clear(key: string): void { this.attempts.delete(key); }
  cleanup(now = Date.now()): void {
    const cutoff = now - this.windowMs;
    for (const [key, timestamps] of this.attempts) {
      const recent = timestamps.filter((timestamp) => timestamp > cutoff);
      if (recent.length === 0) this.attempts.delete(key);
      else this.attempts.set(key, recent);
    }
  }
}
