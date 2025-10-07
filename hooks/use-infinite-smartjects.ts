import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { smartjectService } from "@/lib/services";
import type { SmartjectType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type Filters = {
  query?: string;
  industries?: string[]; // тут теперь uuid[]
  audience?: string[]; // uuid[]
  businessFunctions?: string[]; // uuid[]
  teams?: string[]; // строки, как и было
  startDate?: string;
  endDate?: string;
};

type SortOption = "recent" | "most-needed" | "most-provided" | "most-believed";

type AvailableFilters = {
  industries: { id: string; name: string }[];
  audience: { id: string; name: string }[];
  businessFunctions: { id: string; name: string }[];
  teams: string[]; // команды у тебя text[], оставляем как строки
};

interface InfiniteSmartjectsState {
  smartjects: SmartjectType[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  page: number;
  error: string | null;
  consecutiveEmptyLoads: number;
}

export function useInfiniteSmartjects(
  userId?: string,
  pageSize: number = 12,
  initialSort: SortOption = "recent",
  initialFilters?: Partial<Filters>,
) {
  const { toast } = useToast();

  const [state, setState] = useState<InfiniteSmartjectsState>({
    smartjects: [],
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    page: 0,
    error: null,
    consecutiveEmptyLoads: 0,
  });

  const [filters, setFilters] = useState<Filters>({
    query: initialFilters?.query || "",
    industries: initialFilters?.industries || [],
    audience: initialFilters?.audience || [],
    businessFunctions: initialFilters?.businessFunctions || [],
    teams: initialFilters?.teams || [],
    startDate: initialFilters?.startDate || "",
    endDate: initialFilters?.endDate || "",
  });

  console.log("🎣 Hook initialized with initial filters:", initialFilters);
  console.log("🎣 Hook filters state after initialization:", filters);

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

  // Load available filters
  const loadFilters = useCallback(async (forceRefresh: boolean = false) => {
    try {
      const filterData =
        await smartjectService.getAvailableFilters(forceRefresh);
      setAvailableFilters(filterData);
    } catch (error) {
      console.error("Error fetching available filters:", error);
    }
  }, []);

  // Load available filters only once on mount
  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  // Main loading function
  const loadData = useCallback(
    async (
      page: number,
      currentFilters: Filters,
      currentSort: SortOption,
      reset: boolean = false,
    ) => {
      try {
        console.log("📊 Loading data with filters:", currentFilters);
        console.log("📊 Loading data with sort:", currentSort);
        console.log("📊 Loading page:", page, "reset:", reset);

        if (reset) {
          setState((prev) => ({
            ...prev,
            isLoading: true,
            error: null,
            smartjects: [],
            page: 0,
            hasMore: true,
            consecutiveEmptyLoads: 0,
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

        console.log("📊 Received data:", data.length, "items");

        // Track consecutive empty loads to prevent infinite attempts
        const newConsecutiveEmpty =
          data.length === 0 ? (reset ? 0 : state.consecutiveEmptyLoads + 1) : 0;

        // Stop trying if we've had too many consecutive empty loads
        const shouldStopLoading = newConsecutiveEmpty >= 3;

        setState((prev) => ({
          ...prev,
          smartjects: reset ? data : [...prev.smartjects, ...data],
          isLoading: false,
          isLoadingMore: false,
          hasMore: data.length === pageSize && !shouldStopLoading,
          page: page,
          error: null,
          consecutiveEmptyLoads: newConsecutiveEmpty,
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
          consecutiveEmptyLoads: 0,
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

    console.log("🔄 Filters/sort changed - checking if reload needed");
    console.log("🔄 Current memoized filters:", memoizedFilters);
    console.log("🔄 Current sort:", sortBy);
    console.log("🔄 Is initial load:", isInitialLoadRef.current);
    console.log("🔄 Last filters key:", lastFiltersRef.current);
    console.log("🔄 Current filters key:", filtersKey);

    // Only reload if filters or sort actually changed
    if (
      isInitialLoadRef.current ||
      lastFiltersRef.current !== filtersKey ||
      lastSortRef.current !== sortKey
    ) {
      console.log("🔄 Reloading data due to filter/sort change");
      lastFiltersRef.current = filtersKey;
      lastSortRef.current = sortKey;
      isInitialLoadRef.current = false;

      loadData(0, memoizedFilters, sortBy, true);
    } else {
      console.log("🔄 No reload needed - filters/sort unchanged");
    }
  }, [memoizedFilters, sortBy, loadData]);

  // Load more data
  const loadMore = useCallback(() => {
    if (
      !state.hasMore ||
      state.isLoadingMore ||
      state.isLoading ||
      state.consecutiveEmptyLoads >= 3
    ) {
      return;
    }

    const nextPage = state.page + 1;
    loadData(nextPage, memoizedFilters, sortBy, false);
  }, [
    state.hasMore,
    state.isLoadingMore,
    state.isLoading,
    state.page,
    state.consecutiveEmptyLoads,
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
      console.log("🔧 Setting filter:", field, "=", value);
      setFilters((prev) => {
        const updated = {
          ...prev,
          [field]: value,
        };
        console.log("🔧 Updated filters:", updated);
        return updated;
      });
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
      startDate: "",
      endDate: "",
    });
  }, []);

  // Set sort and reset pagination
  const setSortOption = useCallback((newSort: SortOption) => {
    setSortBy(newSort);
  }, []);

  // Force refresh available filters
  const refreshFilters = useCallback(() => {
    loadFilters(true);
  }, [loadFilters]);

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
    refreshFilters,
  };
}
