export interface CacheStats {
  hits: number;
  misses: number;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class TTLCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;

  constructor(private readonly defaultTtlSeconds: number) {}

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses += 1;
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      this.misses += 1;
      return undefined;
    }

    this.hits += 1;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = (ttlSeconds ?? this.defaultTtlSeconds) * 1000;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  keys(): string[] {
    this.pruneExpired();
    return Array.from(this.store.keys());
  }

  getStats(): CacheStats {
    this.pruneExpired();
    return {
      hits: this.hits,
      misses: this.misses,
    };
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }
}
