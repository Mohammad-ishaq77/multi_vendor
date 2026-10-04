import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../services/apiClient";

/**
 * Minimal async data hook used by API-driven screens.
 *
 * Guarantees the four states every page needs: loading -> success | empty |
 * error, with `retry` to recover from a failed request. It never invents
 * fallback data, so a failed API call always surfaces as an error state.
 *
 * @param {(signal: AbortSignal) => Promise<any>} loader
 * @param {any[]} deps Re-fetch when these change
 */
export const useAsyncData = (loader, deps = [], { enabled = true, initialData = null } = {}) => {
  const [state, setState] = useState({
    data: initialData,
    loading: enabled,
    error: null,
  });

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const run = useCallback(async () => {
    if (!enabled) {
      setState({ data: initialData, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await loaderRef.current();
      setState({ data, loading: false, error: null });
    } catch (error) {
      if (error?.name === "AbortError") return;
      setState({
        data: null,
        loading: false,
        error:
          error instanceof ApiError
            ? error.message
            : "Something went wrong while loading this content.",
      });
    }
  }, [enabled, initialData]);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  return {
    ...state,
    isEmpty: !state.loading && !state.error && isEmptyish(state.data),
    reload: run,
  };
};

const isEmptyish = (data) => {
  if (data == null) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === "object" && "items" in data && Array.isArray(data.items)) {
    return data.items.length === 0;
  }
  return false;
};

export default useAsyncData;