import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { cacheKey } from "./cache";
import type { ChatApiInstance, EndpointDef, MutationEndpointDef, QueryEndpointDef } from "./createChatApi";

export interface QueryHookResult<TResult> {
  data?: TResult;
  error?: unknown;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => Promise<TResult>;
}

export interface MutationHookResult<TArg, TResult> {
  mutate: (arg: TArg) => void;
  mutateAsync: (arg: TArg) => Promise<TResult>;
  isLoading: boolean;
  error?: unknown;
  data?: TResult;
  reset: () => void;
}

function useCacheSubscription(api: ChatApiInstance): () => void {
  const [, forceRender] = useState(0);
  useEffect(() => {
    return api.cache.subscribe(() => forceRender((n) => n + 1));
  }, [api]);
  return () => forceRender((n) => n + 1);
}

export function createQueryHook<TArg, TResult>(
  api: ChatApiInstance,
  endpoint: QueryEndpointDef<TArg, TResult>,
) {
  return function useQuery(
    arg: TArg,
    options?: { skip?: boolean; pollingInterval?: number },
  ): QueryHookResult<TResult> {
    useCacheSubscription(api);
    const key = cacheKey(endpoint.endpointName, arg);
    const skip = options?.skip ?? false;

    useEffect(() => {
      if (skip) return;
      api.dispatch({ type: "query/subscribe", endpointName: endpoint.endpointName, arg });
      void api.executeQuery(endpoint.endpointName, arg).catch(() => undefined);
      return () => {
        api.dispatch({ type: "query/unsubscribe", endpointName: endpoint.endpointName, arg });
      };
    }, [key, skip]);

    useEffect(() => {
      if (skip || !options?.pollingInterval) return;
      const id = setInterval(() => {
      void api.executeQuery(endpoint.endpointName, arg, { force: true }).catch(() => undefined);
      }, options.pollingInterval);
      return () => clearInterval(id);
    }, [key, skip, options?.pollingInterval]);

    const entry = api.cache.getEntry(key);
    const hasCachedData = entry?.data !== undefined;

    const refetch = useCallback(async () => {
      return (await api.executeQuery(endpoint.endpointName, arg, { force: true })) as TResult;
    }, [key]);

    return {
      data: entry?.data as TResult | undefined,
      error: entry?.error,
      isLoading:
        !skip &&
        !hasCachedData &&
        (entry?.status === "pending" || entry?.status === "uninitialized"),
      isFetching: !skip && entry?.status === "pending",
      isSuccess: entry?.status === "fulfilled",
      isError: entry?.status === "rejected",
      refetch,
    };
  };
}

export function createMutationHook<TArg, TResult>(
  api: ChatApiInstance,
  endpoint: MutationEndpointDef<TArg, TResult>,
) {
  return function useMutation(): MutationHookResult<TArg, TResult> {
    const [state, setState] = useState<{
      isLoading: boolean;
      error?: unknown;
      data?: TResult;
    }>({ isLoading: false });

    const mutateAsync = useCallback(async (arg: TArg) => {
      setState({ isLoading: true });
      try {
        const data = (await api.executeMutation(endpoint.endpointName, arg)) as TResult;
        setState({ isLoading: false, data });
        return data;
      } catch (error) {
        setState({ isLoading: false, error });
        throw error;
      }
    }, []);

    const mutate = useCallback((arg: TArg) => {
      void mutateAsync(arg);
    }, [mutateAsync]);

    const reset = useCallback(() => {
      setState({ isLoading: false });
    }, []);

    return {
      mutate,
      mutateAsync,
      isLoading: state.isLoading,
      error: state.error,
      data: state.data,
      reset,
    };
  };
}

export function createEndpointHooks(
  api: ChatApiInstance,
  endpoints: Record<string, EndpointDef>,
) {
  const hooks: Record<string, unknown> = {};

  for (const [name, endpoint] of Object.entries(endpoints)) {
    if (endpoint._type === "query") {
      const hookName = `use${capitalize(name)}Query`;
      hooks[hookName] = createQueryHook(api, endpoint as QueryEndpointDef<unknown, unknown>);
    } else {
      const hookName = `use${capitalize(name)}Mutation`;
      hooks[hookName] = createMutationHook(api, endpoint as MutationEndpointDef<unknown, unknown>);
    }
  }

  return hooks as Record<string, (...args: unknown[]) => unknown>;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function useChatApi(api: ChatApiInstance) {
  return useMemo(() => api, [api]);
}

export function useRealtimeConnection(api: ChatApiInstance, connected: boolean) {
  return useSyncExternalStore(
    (onStoreChange) => api.cache.subscribe(onStoreChange),
    () => connected,
    () => false,
  );
}
