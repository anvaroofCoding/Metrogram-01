export type CacheTag = string;

export type QueryStatus = "uninitialized" | "pending" | "fulfilled" | "rejected";

export interface CacheEntry<T = unknown> {
  data?: T;
  error?: unknown;
  status: QueryStatus;
  fulfilledTimeStamp?: number;
  requestId?: string;
  subscribers: number;
}

export interface QueryDefinition<TArg, TResult> {
  type: "query";
  endpointName: string;
  arg: TArg;
  queryFn: (arg: TArg) => Promise<TResult>;
  providesTags?: (result: TResult | undefined, error: unknown, arg: TArg) => CacheTag[];
  keepUnusedDataFor?: number;
}

export interface MutationDefinition<TArg, TResult> {
  type: "mutation";
  endpointName: string;
  mutationFn: (arg: TArg) => Promise<TResult>;
  invalidatesTags?: (result: TResult | undefined, error: unknown, arg: TArg) => CacheTag[];
  onQueryStarted?: (
    arg: TArg,
    api: MutationLifecycleApi,
  ) => Promise<void> | void;
}

export interface MutationLifecycleApi {
  queryFulfilled: Promise<{ data: unknown }>;
  dispatch: ChatQueryDispatch;
  getCacheData: <T>(endpointName: string, arg: unknown) => T | undefined;
  updateCacheData: <T>(
    endpointName: string,
    arg: unknown,
    updater: (draft: T) => T,
  ) => void;
  optimisticUpdate: <T>(
    endpointName: string,
    arg: unknown,
    optimisticData: T,
  ) => () => void;
}

export type ChatQueryDispatch = (action: ChatQueryAction) => void;

export type ChatQueryAction =
  | { type: "query/pending"; endpointName: string; arg: unknown; requestId: string }
  | { type: "query/fulfilled"; endpointName: string; arg: unknown; data: unknown; requestId: string }
  | { type: "query/rejected"; endpointName: string; arg: unknown; error: unknown; requestId: string }
  | { type: "query/subscribe"; endpointName: string; arg: unknown }
  | { type: "query/unsubscribe"; endpointName: string; arg: unknown }
  | { type: "cache/invalidateTags"; tags: CacheTag[] }
  | { type: "cache/update"; endpointName: string; arg: unknown; updater: (draft: unknown) => unknown };

export function serializeArg(arg: unknown): string {
  return JSON.stringify(arg ?? null);
}

export function cacheKey(endpointName: string, arg: unknown): string {
  return `${endpointName}(${serializeArg(arg)})`;
}

export class ChatQueryCache {
  private entries = new Map<string, CacheEntry>();
  private tagMap = new Map<CacheTag, Set<string>>();
  private evictionTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private listeners = new Set<() => void>();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  getEntry(key: string): CacheEntry | undefined {
    return this.entries.get(key);
  }

  setEntry(key: string, entry: CacheEntry): void {
    this.entries.set(key, entry);
    this.notify();
  }

  updateEntry(key: string, patch: Partial<CacheEntry>): void {
    const current = this.entries.get(key) ?? { status: "uninitialized", subscribers: 0 };
    this.entries.set(key, { ...current, ...patch });
    this.notify();
  }

  registerTags(key: string, tags: CacheTag[]): void {
    for (const tag of tags) {
      if (!this.tagMap.has(tag)) this.tagMap.set(tag, new Set());
      this.tagMap.get(tag)!.add(key);
    }
  }

  invalidateTags(tags: CacheTag[]): string[] {
    const keys = new Set<string>();
    for (const tag of tags) {
      this.tagMap.get(tag)?.forEach((key) => keys.add(key));
    }
    return [...keys];
  }

  scheduleEviction(key: string, seconds: number): void {
    const existing = this.evictionTimers.get(key);
    if (existing) clearTimeout(existing);

    this.evictionTimers.set(
      key,
      setTimeout(() => {
        const entry = this.entries.get(key);
        if (entry && entry.subscribers === 0) {
          this.entries.delete(key);
          this.notify();
        }
      }, seconds * 1000),
    );
  }

  cancelEviction(key: string): void {
    const timer = this.evictionTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.evictionTimers.delete(key);
    }
  }
}
