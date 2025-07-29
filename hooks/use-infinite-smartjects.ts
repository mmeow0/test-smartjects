import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { smartjectService } from "@/lib/services";
import type { SmartjectType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type Filters = {
  query?: string;
  industries?: string[];
  audience?: string[];
  businessFunctions?: string[];
  teams?: string[];
  startDate?: string;
  endDate?: string;
};

type SortOption = "recent" | "most-needed" | "most-provided" | "most-believed";

type AvailableFilters = {
  industries: string[];
  audience: string[];
  businessFunctions: string[];
  teams: string[];
};

interface InfiniteSmartjectsState {
  smartjects: SmartjectType[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  error: string | null;
}

export function useInfiniteSmartjects(
  userId?: string,
  pageSize: number = 12,
  initialSort: SortOption = "recent",
) {
  const { toast } = useToast();

  const [state, setState] = useState<InfiniteSmartjectsState>({
    smartjects: [],
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    page: 0,
    error: null,
  });

  const [filters, setFilters] = useState<Filters>({
    query: "",
    industries: [],
    audience: [],
    businessFunctions: [],
    teams: [],
  });

  const [sortBy, setSortBy] = useState<SortOption>(initialSort);

  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
    industries: [],
    audience: [],
    businessFunctions: [],
    teams: [],
  });

  // Use refs to prevent infinite loops
  const isInitialLoadRef = useRef(true);
  const lastFiltersRef = useRef<string>("");
  const lastSortRef = useRef<string>("");

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(
    () => filters,
    [
      filters.query,
      filters.industries?.join(","),
      filters.audience?.join(","),
      filters.businessFunctions?.join(","),
      filters.teams?.join(","),
      filters.startDate,
      filters.endDate,
    ],
  );

  // Load available filters only once
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const filterData = await smartjectService.getAvailableFilters();
        setAvailableFilters(filterData);
      } catch (error) {
        console.error("Error fetching available filters:", error);
      }
    };
    loadFilters();
  }, []);

  // Main loading function
  const loadData = useCallback(
    async (
      page: number,
      currentFilters: Filters,
      currentSort: SortOption,
      reset: boolean = false,
    ) => {
      try {
        if (reset) {
          setState((prev) => ({
            ...prev,
            isLoading: true,
            error: null,
            smartjects: [],
            page: 0,
            hasMore: true,
          }));
        } else {
          setState((prev) => ({ ...prev, isLoadingMore: true, error: null }));
        }

        const data = await smartjectService.getSmartjectsPaginated(
          userId,
          page,
          pageSize,
          currentFilters,
          currentSort,
        );

        setState((prev) => ({
          ...prev,
          smartjects: reset ? data : [...prev.smartjects, ...data],
          isLoading: false,
          isLoadingMore: false,
          hasMore: data.length === pageSize,
          page: page,
          error: null,
        }));

        return data;
      } catch (error) {
        console.error("Error fetching smartjects:", error);
        const errorMessage = "Failed to load smartjects";

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isLoadingMore: false,
          error: errorMessage,
        }));

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });

        return [];
      }
    },
    [userId, pageSize, toast],
  );

  // Load initial data and handle filter/sort changes
  useEffect(() => {
    const filtersKey = JSON.stringify(memoizedFilters);
    const sortKey = sortBy;

    // Only reload if filters or sort actually changed
    if (
      isInitialLoadRef.current ||
      lastFiltersRef.current !== filtersKey ||
      lastSortRef.current !== sortKey
    ) {
      lastFiltersRef.current = filtersKey;
      lastSortRef.current = sortKey;
      isInitialLoadRef.current = false;

      loadData(0, memoizedFilters, sortBy, true);
    }
  }, [memoizedFilters, sortBy, loadData]);

  // Load more data
  const loadMore = useCallback(() => {
    if (!state.hasMore || state.isLoadingMore || state.isLoading) {
      return;
    }

    const nextPage = state.page + 1;
    loadData(nextPage, memoizedFilters, sortBy, false);
  }, [
    state.hasMore,
    state.isLoadingMore,
    state.isLoading,
    state.page,
    memoizedFilters,
    sortBy,
    loadData,
  ]);

  // Refetch from beginning
  const refetch = useCallback(() => {
    loadData(0, memoizedFilters, sortBy, true);
  }, [memoizedFilters, sortBy, loadData]);

  // Set filter and reset pagination
  const setFilter = useCallback(
    (field: keyof Filters, value: string[] | string) => {
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      query: "",
      industries: [],
      audience: [],
      businessFunctions: [],
      teams: [],
    });
  }, []);

  // Set sort and reset pagination
  const setSortOption = useCallback((newSort: SortOption) => {
    setSortBy(newSort);
  }, []);

  // Memoized values
  const totalCount = useMemo(
    () => state.smartjects.length,
    [state.smartjects.length],
  );

  const isInitialLoading = useMemo(
    () => state.isLoading && state.smartjects.length === 0,
    [state.isLoading, state.smartjects.length],
  );

  return {
    // Data
    smartjects: state.smartjects,
    totalCount,

    // Loading states
    isLoading: isInitialLoading,
    isLoadingMore: state.isLoadingMore,
    hasMore: state.hasMore,
    error: state.error,

    // Pagination
    page: state.page,
    pageSize,
    loadMore,

    // Filters
    filters: memoizedFilters,
    setFilter,
    clearFilters,
    meta: availableFilters,

    // Sorting
    sortBy,
    setSortBy: setSortOption,

    // Actions
    refetch,
  };
}
