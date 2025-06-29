import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/components/auth-provider";
import { useSmartjects } from "@/hooks/use-smartjects";
import { toggleItem } from "@/lib/utils/array";
import { DiscoverHeader } from "./discover-header";
import { SearchFilters } from "./search-filters";
import { SmartjectsTabs } from "./smartjects-tabs";
import type { SortOption, CategorizedSmartjects } from "./types";
import type { SmartjectType } from "@/lib/types";

export const DiscoverSection = () => {
  const { user } = useAuth();
  const { smartjects, isLoading, filters, setFilter, refetch } = useSmartjects(
    user?.id,
  );

  const [query, setQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string[]>(
    [],
  );
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showIndustriesDropdown, setShowIndustriesDropdown] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showFunctionsDropdown, setShowFunctionsDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Debounce search query for better performance
  const debouncedQuery = useDebounce(query, 300);

  // Memoized filter handlers to prevent unnecessary re-renders
  const handleToggleIndustry = useCallback(
    (industry: string) => {
      setSelectedIndustries((prev) => {
        const updated = toggleItem(prev, industry);
        const filterUpdated = toggleItem(filters.industries || [], industry);
        setFilter("industries", filterUpdated);
        return updated;
      });
    },
    [filters.industries, setFilter],
  );

  const handleToggleTechnology = useCallback(
    (tech: string) => {
      setSelectedAudience((prev) => {
        const updated = toggleItem(prev, tech);
        const filterUpdated = toggleItem(filters.audience || [], tech);
        setFilter("audience", filterUpdated);
        return updated;
      });
    },
    [filters.audience, setFilter],
  );

  const handleToggleFunction = useCallback(
    (fn: string) => {
      setSelectedFunctions((prev) => {
        const updated = toggleItem(prev, fn);
        const filterUpdated = toggleItem(filters.businessFunctions || [], fn);
        setFilter("businessFunctions", filterUpdated);
        return updated;
      });
    },
    [filters.businessFunctions, setFilter],
  );

  // Memoized total filters count
  const totalFiltersCount = useMemo(
    () =>
      selectedIndustries.length +
      selectedAudience.length +
      selectedFunctions.length,
    [
      selectedIndustries.length,
      selectedAudience.length,
      selectedFunctions.length,
    ],
  );

  // Memoized clear all filters handler
  const handleClearAllFilters = useCallback(() => {
    setSelectedIndustries([]);
    setSelectedFunctions([]);
    setSelectedAudience([]);
    // Close all dropdowns
    setShowIndustriesDropdown(false);
    setShowAudienceDropdown(false);
    setShowFunctionsDropdown(false);
    setShowSortDropdown(false);
  }, []);

  // Memoized search change handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [],
  );

  const handleVoted = useCallback(() => {
    refetch();
  }, [refetch]);

  const filteredSmartjects = useMemo(() => {
    if (!smartjects?.length) return [];

    const lowerQuery = debouncedQuery.toLowerCase();

    return smartjects.filter((s: SmartjectType) => {
      // Early return for empty query and no filters
      if (!lowerQuery && totalFiltersCount === 0) return true;

      // Query matching
      const matchesQuery =
        !lowerQuery ||
        s.title?.toLowerCase().includes(lowerQuery) ||
        s.mission?.toLowerCase().includes(lowerQuery) ||
        s.problematics?.toLowerCase().includes(lowerQuery) ||
        s.scope?.toLowerCase().includes(lowerQuery);

      if (!matchesQuery) return false;

      // Filter matching with early returns
      const matchesIndustries =
        selectedIndustries.length === 0 ||
        selectedIndustries.some((i) => s.industries?.includes(i));

      if (!matchesIndustries) return false;

      const matchesAudience =
        selectedAudience.length === 0 ||
        selectedAudience.some((t) => s.audience?.includes(t));

      if (!matchesAudience) return false;

      const matchesFunctions =
        selectedFunctions.length === 0 ||
        selectedFunctions.some((f) => s.businessFunctions?.includes(f));

      return matchesFunctions;
    });
  }, [
    smartjects,
    debouncedQuery,
    selectedIndustries,
    selectedAudience,
    selectedFunctions,
    totalFiltersCount,
  ]);

  const categorizedSmartjects: CategorizedSmartjects = useMemo(() => {
    if (!filteredSmartjects.length) {
      return {
        recent: [],
        mostNeeded: [],
        mostProvided: [],
        mostBelieved: [],
      };
    }

    const sortAndLimit = (
      arr: SmartjectType[],
      sortFn: (a: SmartjectType, b: SmartjectType) => number,
    ) => {
      return [...arr].sort(sortFn).slice(0, 6);
    };

    return {
      recent: sortAndLimit(
        filteredSmartjects,
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      mostNeeded: sortAndLimit(
        smartjects, // Use all smartjects for global ranking
        (a, b) => (b.votes?.need || 0) - (a.votes?.need || 0),
      ),
      mostProvided: sortAndLimit(
        smartjects, // Use all smartjects for global ranking
        (a, b) => (b.votes?.provide || 0) - (a.votes?.provide || 0),
      ),
      mostBelieved: sortAndLimit(
        smartjects, // Use all smartjects for global ranking
        (a, b) => (b.votes?.believe || 0) - (a.votes?.believe || 0),
      ),
    };
  }, [filteredSmartjects, smartjects]);

  return (
    <div className="pt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start gap-[50px] relative border border-solid border-transparent mb-2">
          <DiscoverHeader />

          <SearchFilters
            query={query}
            onQueryChange={handleSearchChange}
            selectedIndustries={selectedIndustries}
            selectedAudience={selectedAudience}
            selectedFunctions={selectedFunctions}
            onToggleIndustry={handleToggleIndustry}
            onToggleTechnology={handleToggleTechnology}
            onToggleFunction={handleToggleFunction}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showIndustriesDropdown={showIndustriesDropdown}
            showAudienceDropdown={showAudienceDropdown}
            showFunctionsDropdown={showFunctionsDropdown}
            showSortDropdown={showSortDropdown}
            onToggleIndustriesDropdown={() =>
              setShowIndustriesDropdown(!showIndustriesDropdown)
            }
            onToggleAudienceDropdown={() =>
              setShowAudienceDropdown(!showAudienceDropdown)
            }
            onToggleFunctionsDropdown={() =>
              setShowFunctionsDropdown(!showFunctionsDropdown)
            }
            onToggleSortDropdown={() => setShowSortDropdown(!showSortDropdown)}
            onClearAllFilters={handleClearAllFilters}
            filters={filters}
            totalFiltersCount={totalFiltersCount}
          />
        </div>

        <SmartjectsTabs
          sortBy={sortBy}
          onSortChange={setSortBy}
          categorizedSmartjects={categorizedSmartjects}
          isLoading={isLoading}
          onVoted={handleVoted}
        />
      </div>
    </div>
  );
};
