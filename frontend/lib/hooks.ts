import { useState, useCallback } from "react";

export interface UseRouteSearchState {
  loading: boolean;
  error: string | null;
  routes: any[];
  searched: boolean;
}

export const useRouteSearch = () => {
  const [state, setState] = useState<UseRouteSearchState>({
    loading: false,
    error: null,
    routes: [],
    searched: false,
  });

  const search = useCallback(async (params: any) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Simulate API call - replace with actual API integration
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch routes");
      }

      const data = await response.json();
      setState({
        loading: false,
        error: null,
        routes: data,
        searched: true,
      });
    } catch (error: any) {
      setState({
        loading: false,
        error: error.message,
        routes: [],
        searched: true,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      routes: [],
      searched: false,
    });
  }, []);

  return { ...state, search, reset };
};
