/**
 * Daily transform quota — per anonymous user (imgora_uid cookie), enforced
 * locally. This is the dummy/self-hosted tier: identity is cookie-based and
 * counts persist to a local JSON file on Node (in-memory only on Workers).
 *
 * Cache HITS are free by design — only real transformations (cache misses)
 * consume quota, which keeps the "identical params are instant" promise.
 */

export interface QuotaStatus {
  limit: number;
  remaining: number;
  /** ISO instant when the quota resets (midnight UTC) */
  resets: string;
}

interface Entry {
  date: string;
  count: number;
}

export class DailyQuota {
  private counts = new Map<string, Entry>();
  private ready?: Promise<void>;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public readonly limit: number,
    private file?: string,
  ) {}

  /** Lazily load persisted counts (Node only). */
  private ensure(): Promise<void> {
    this.ready ??= (async () => {
      if (!this.file) return;
      try {
        const fs = await import("node:fs");
        const raw = fs.readFileSync(this.file, "utf8");
        const parsed = JSON.parse(raw) as Record<string, Entry>;
        const today = new Date().toISOString().slice(0, 10);
        for (const [uid, e] of Object.entries(parsed)) {
          if (e && typeof e.count === "number") {
            // yesterdays counts are irrelevant — keep only today's
            if (e.date === today) this.counts.set(uid, e);
          }
        }
      } catch {
        /* no file yet — fresh start */
      }
    })();
    return this.ready;
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private resetsAt(): string {
    const t = new Date();
    t.setUTCHours(24, 0, 0, 0);
    return t.toISOString();
  }

  async status(uid: string): Promise<QuotaStatus> {
    await this.ensure();
    const e = this.counts.get(uid);
    const used = e && e.date === this.today() ? e.count : 0;
    return { limit: this.limit, remaining: Math.max(0, this.limit - used), resets: this.resetsAt() };
  }

  /** Consumes one slot if any remain. Returns the post-call status. */
  async consume(uid: string): Promise<{ ok: boolean; status: QuotaStatus }> {
    await this.ensure();
    const today = this.today();
    const e = this.counts.get(uid);
    const entry = e && e.date === today ? e : { date: today, count: 0 };
    if (entry.count >= this.limit) {
      this.counts.set(uid, entry);
      return { ok: false, status: { limit: this.limit, remaining: 0, resets: this.resetsAt() } };
    }
    entry.count += 1;
    this.counts.set(uid, entry);
    this.persist();
    return {
      ok: true,
      status: {
        limit: this.limit,
        remaining: Math.max(0, this.limit - entry.count),
        resets: this.resetsAt(),
      },
    };
  }

  /** Debounced write-behind — never blocks the response path. */
  private persist(): void {
    const file = this.file;
    if (!file) return;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(async () => {
      this.saveTimer = null;
      try {
        const fs = await import("node:fs");
        const data = JSON.stringify(Object.fromEntries(this.counts));
        const dir = file.slice(0, file.lastIndexOf("/"));
        if (dir) await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.writeFile(file, data);
      } catch {
        /* quota persistence is best-effort */
      }
    }, 500);
  }
}
