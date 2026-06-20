import {
  ChatQueryCache,
  cacheKey,
  type CacheTag,
  type ChatQueryAction,
  type ChatQueryDispatch,
  type MutationLifecycleApi,
} from "./cache";

export interface ChatApiConfig {
  baseUrl?: string;
  tagTypes?: string[];
}

type QueryConfig<TArg, TResult> = {
  queryFn: (arg: TArg) => Promise<TResult> | TResult;
  providesTags?: (result: TResult | undefined, error: unknown, arg: TArg) => CacheTag[];
  keepUnusedDataFor?: number;
};

type MutationConfig<TArg, TResult> = {
  mutationFn: (arg: TArg) => Promise<TResult> | TResult;
  invalidatesTags?: (result: TResult | undefined, error: unknown, arg: TArg) => CacheTag[];
  onQueryStarted?: (arg: TArg, api: MutationLifecycleApi) => Promise<void> | void;
};

export interface EndpointBuilder {
  query: <TArg, TResult>(
    endpointName: string,
    config: QueryConfig<TArg, TResult>,
  ) => QueryEndpointDef<TArg, TResult>;
  mutation: <TArg, TResult>(
    endpointName: string,
    config: MutationConfig<TArg, TResult>,
  ) => MutationEndpointDef<TArg, TResult>;
}

export interface QueryEndpointDef<TArg = unknown, TResult = unknown> {
  _type: "query";
  _arg?: TArg;
  _result?: TResult;
  endpointName: string;
  config: QueryConfig<TArg, TResult>;
}

export interface MutationEndpointDef<TArg = unknown, TResult = unknown> {
  _type: "mutation";
  _arg?: TArg;
  _result?: TResult;
  endpointName: string;
  config: MutationConfig<TArg, TResult>;
}

// Internal storage uses loose typing — same pattern as RTK Query's endpoint map
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoredQueryEndpoint = QueryEndpointDef<any, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoredMutationEndpoint = MutationEndpointDef<any, any>;
export type EndpointDef = StoredQueryEndpoint | StoredMutationEndpoint;

export interface ChatApiInstance {
  cache: ChatQueryCache;
  dispatch: ChatQueryDispatch;
  executeQuery: (endpointName: string, arg: unknown, options?: { force?: boolean }) => Promise<unknown>;
  executeMutation: (endpointName: string, arg: unknown) => Promise<unknown>;
  getEndpoint: (name: string) => EndpointDef | undefined;
  util: {
    invalidateTags: (tags: CacheTag[]) => void;
    updateQueryData: <T>(endpointName: string, arg: unknown, updater: (draft: T) => T) => void;
    prefetch: (endpointName: string, arg: unknown) => Promise<unknown>;
  };
  onRealtimeEvent: (handler: RealtimeHandler) => () => void;
  emitRealtimeEvent: (event: { type: string; payload: unknown }) => void;
}

export type RealtimeHandler = (event: { type: string; payload: unknown }) => void;

let requestCounter = 0;

function nextRequestId(): string {
  requestCounter += 1;
  return `req_${requestCounter}`;
}

export function createChatApi(_config: ChatApiConfig = {}): {
  injectEndpoints: <T extends Record<string, EndpointDef>>(
    builder: (build: EndpointBuilder) => T,
  ) => ChatApiInstance & { endpoints: T };
} {
  const cache = new ChatQueryCache();
  const endpoints = new Map<string, EndpointDef>();
  const realtimeHandlers = new Set<RealtimeHandler>();
  const pendingRefetches = new Map<string, Promise<unknown>>();

  const dispatch: ChatQueryDispatch = (action: ChatQueryAction) => {
    switch (action.type) {
      case "query/pending": {
        const key = cacheKey(action.endpointName, action.arg);
        const entry = cache.getEntry(key);
        cache.updateEntry(key, {
          status: "pending",
          requestId: action.requestId,
          subscribers: entry?.subscribers ?? 0,
        });
        break;
      }
      case "query/fulfilled": {
        const key = cacheKey(action.endpointName, action.arg);
        const def = endpoints.get(action.endpointName);
        cache.updateEntry(key, {
          data: action.data,
          error: undefined,
          status: "fulfilled",
          fulfilledTimeStamp: Date.now(),
          requestId: action.requestId,
        });
        if (def?._type === "query" && def.config.providesTags) {
          const tags = def.config.providesTags(action.data, undefined, action.arg as never);
          cache.registerTags(key, tags);
        }
        break;
      }
      case "query/rejected": {
        const key = cacheKey(action.endpointName, action.arg);
        cache.updateEntry(key, {
          error: action.error,
          status: "rejected",
          requestId: action.requestId,
        });
        break;
      }
      case "query/subscribe": {
        const key = cacheKey(action.endpointName, action.arg);
        const entry = cache.getEntry(key) ?? { status: "uninitialized", subscribers: 0 };
        cache.cancelEviction(key);
        cache.updateEntry(key, { subscribers: entry.subscribers + 1 });
        break;
      }
      case "query/unsubscribe": {
        const key = cacheKey(action.endpointName, action.arg);
        const entry = cache.getEntry(key);
        if (!entry) return;
        cache.updateEntry(key, { subscribers: Math.max(0, entry.subscribers - 1) });
        const def = endpoints.get(action.endpointName);
        if (def?._type === "query") {
          cache.scheduleEviction(key, def.config.keepUnusedDataFor ?? 60);
        }
        break;
      }
      case "cache/invalidateTags": {
        const keys = cache.invalidateTags(action.tags);
        for (const key of keys) {
          const match = key.match(/^(.+)\((.+)\)$/);
          if (!match) continue;
          const endpointName = match[1];
          const arg = JSON.parse(match[2]);
          void executeQuery(endpointName, arg, { force: true });
        }
        break;
      }
      case "cache/update": {
        const key = cacheKey(action.endpointName, action.arg);
        const entry = cache.getEntry(key);
        if (entry?.data !== undefined) {
          const updated = action.updater(structuredClone(entry.data));
          cache.updateEntry(key, { data: updated });
        }
        break;
      }
    }
  };

  async function executeQuery(
    endpointName: string,
    arg: unknown,
    options: { force?: boolean } = {},
  ): Promise<unknown> {
    const key = cacheKey(endpointName, arg);
    const def = endpoints.get(endpointName);
    if (!def || def._type !== "query") {
      throw new Error(`Unknown query endpoint: ${endpointName}`);
    }

    const entry = cache.getEntry(key);
    if (!options.force && entry?.status === "fulfilled" && entry.data !== undefined) {
      return entry.data;
    }

    const inflight = pendingRefetches.get(key);
    if (inflight) return inflight;

    const requestId = nextRequestId();
    dispatch({ type: "query/pending", endpointName, arg, requestId });

    const promise = (async () => {
      try {
        const data = await def.config.queryFn(arg as never);
        dispatch({ type: "query/fulfilled", endpointName, arg, data, requestId });
        return data;
      } catch (error) {
        dispatch({ type: "query/rejected", endpointName, arg, error, requestId });
        throw error;
      } finally {
        pendingRefetches.delete(key);
      }
    })();

    pendingRefetches.set(key, promise);
    return promise;
  }

  async function executeMutation(endpointName: string, arg: unknown): Promise<unknown> {
    const def = endpoints.get(endpointName);
    if (!def || def._type !== "mutation") {
      throw new Error(`Unknown mutation endpoint: ${endpointName}`);
    }

    let resolveFulfilled!: (value: { data: unknown }) => void;
    let rejectFulfilled!: (reason?: unknown) => void;
    const queryFulfilled = new Promise<{ data: unknown }>((resolve, reject) => {
      resolveFulfilled = resolve;
      rejectFulfilled = reject;
    });

    const api: MutationLifecycleApi = {
      queryFulfilled,
      dispatch,
      getCacheData: <T,>(name: string, queryArg: unknown) => {
        const entry = cache.getEntry(cacheKey(name, queryArg));
        return entry?.data as T | undefined;
      },
      updateCacheData: <T,>(name: string, queryArg: unknown, updater: (draft: T) => T) => {
        dispatch({
          type: "cache/update",
          endpointName: name,
          arg: queryArg,
          updater: updater as (draft: unknown) => unknown,
        });
      },
      optimisticUpdate: <T,>(name: string, queryArg: unknown, optimisticData: T) => {
        const key = cacheKey(name, queryArg);
        const previous = cache.getEntry(key)?.data;
        dispatch({
          type: "cache/update",
          endpointName: name,
          arg: queryArg,
          updater: () => optimisticData,
        });
        return () => {
          if (previous !== undefined) {
            dispatch({
              type: "cache/update",
              endpointName: name,
              arg: queryArg,
              updater: () => previous,
            });
          }
        };
      },
    };

    if (def.config.onQueryStarted) {
      void def.config.onQueryStarted(arg as never, api);
    }

    try {
      const data = await def.config.mutationFn(arg as never);
      resolveFulfilled({ data });
      if (def.config.invalidatesTags) {
        const tags = def.config.invalidatesTags(data, undefined, arg as never);
        dispatch({ type: "cache/invalidateTags", tags });
      }
      return data;
    } catch (error) {
      rejectFulfilled(error);
      if (def.config.invalidatesTags) {
        const tags = def.config.invalidatesTags(undefined, error, arg as never);
        dispatch({ type: "cache/invalidateTags", tags });
      }
      throw error;
    }
  }

  const instance: ChatApiInstance = {
    cache,
    dispatch,
    executeQuery,
    executeMutation,
    getEndpoint: (name) => endpoints.get(name),
    util: {
      invalidateTags: (tags) => dispatch({ type: "cache/invalidateTags", tags }),
      updateQueryData: (endpointName, arg, updater) =>
        dispatch({ type: "cache/update", endpointName, arg, updater: updater as (draft: unknown) => unknown }),
      prefetch: (endpointName, arg) => executeQuery(endpointName, arg, { force: true }),
    },
    onRealtimeEvent: (handler) => {
      realtimeHandlers.add(handler);
      return () => realtimeHandlers.delete(handler);
    },
    emitRealtimeEvent: (event) => {
      realtimeHandlers.forEach((handler) => handler(event));
    },
  };

  return {
    injectEndpoints<T extends Record<string, EndpointDef>>(
      builder: (build: EndpointBuilder) => T,
    ) {
      const built = builder({
        query: <TArg, TResult>(endpointName: string, config: QueryConfig<TArg, TResult>) => {
          const def: QueryEndpointDef<TArg, TResult> = {
            _type: "query",
            endpointName,
            config,
          };
          endpoints.set(endpointName, def as EndpointDef);
          return def;
        },
        mutation: <TArg, TResult>(endpointName: string, config: MutationConfig<TArg, TResult>) => {
          const def: MutationEndpointDef<TArg, TResult> = {
            _type: "mutation",
            endpointName,
            config,
          };
          endpoints.set(endpointName, def as EndpointDef);
          return def;
        },
      });

      return Object.assign(instance, { endpoints: built });
    },
  };
}
