import { useState, useMemo, useCallback, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/components/auth-provider";
import { useInfiniteSmartjects } from "@/hooks/use-infinite-smartjects";
import { toggleItem } from "@/lib/utils/array";
import { DiscoverHeader } from "./discover-header";
import { SearchFilters } from "./search-filters";
import { SmartjectsGrid } from "./smartjects-grid";
import { DateRange } from "react-day-picker";

export const DiscoverSection = () => {
  const { user } = useAuth();
  const {
    smartjects,
    isLoading,
    filters,
    setFilter,
    clearFilters,
    refetch,
    sortBy,
    setSortBy,
    meta,
  } = useInfiniteSmartjects(user?.id, 12);

  const [query, setQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [showIndustriesDropdown, setShowIndustriesDropdown] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showFunctionsDropdown, setShowFunctionsDropdown] = useState(false);
  const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Search states for filter dropdowns
  const [industriesSearchTerm, setIndustriesSearchTerm] = useState("");
  const [audienceSearchTerm, setAudienceSearchTerm] = useState("");
  const [functionsSearchTerm, setFunctionsSearchTerm] = useState("");
  const [teamsSearchTerm, setTeamsSearchTerm] = useState("");

  // Debounce search query for better performance
  const debouncedQuery = useDebounce(query, 300);

  // Update server-side filters when debounced query changes
  useEffect(() => {
    setFilter("query", debouncedQuery);
  }, [debouncedQuery, setFilter]);

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

  const handleToggleTeams = useCallback(
    (team: string) => {
      setSelectedTeams((prev) => {
        const updated = toggleItem(prev, team);
        const filterUpdated = toggleItem(filters.teams || [], team);
        setFilter("teams", filterUpdated);
        return updated;
      });
    },
    [filters.teams, setFilter],
  );

  const handleDateRangeChange = useCallback(
    (newDateRange?: DateRange) => {
      setDateRange(newDateRange);

      if (newDateRange?.from && newDateRange?.to) {
        // Set both start and end dates for range filtering
        setFilter("startDate", newDateRange.from.toISOString().split("T")[0]);
        setFilter("endDate", newDateRange.to.toISOString().split("T")[0]);
      } else if (newDateRange?.from) {
        // Only start date selected
        setFilter("startDate", newDateRange.from.toISOString().split("T")[0]);
        setFilter("endDate", "");
      } else {
        // Clear date filters by setting empty strings
        setFilter("startDate", "");
        setFilter("endDate", "");
      }
    },
    [setFilter],
  );

  // Memoized total filters count
  const totalFiltersCount = useMemo(
    () =>
      selectedIndustries.length +
      selectedAudience.length +
      selectedFunctions.length +
      selectedTeams.length +
      (dateRange?.from ? 1 : 0),
    [
      selectedIndustries.length,
      selectedAudience.length,
      selectedFunctions.length,
      selectedTeams.length,
      dateRange,
    ],
  );

  // Memoized clear all filters handler
  const handleClearAllFilters = useCallback(() => {
    setSelectedIndustries([]);
    setSelectedFunctions([]);
    setSelectedAudience([]);
    setSelectedTeams([]);
    setDateRange(undefined);
    // Clear search terms
    setIndustriesSearchTerm("");
    setAudienceSearchTerm("");
    setFunctionsSearchTerm("");
    setTeamsSearchTerm("");
    // Close all dropdowns
    setShowIndustriesDropdown(false);
    setShowAudienceDropdown(false);
    setShowFunctionsDropdown(false);
    setShowTeamsDropdown(false);
    setShowSortDropdown(false);
    setShowDateRangeDropdown(false);
    // Clear server-side filters
    clearFilters();
  }, [clearFilters]);

  // Memoized search change handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [],
  );

  // Filter functions for dropdown searches - Updated to handle objects with id and name
  const filteredIndustries = useMemo(() => {
    if (!industriesSearchTerm) return meta.industries || [];
    return (meta.industries || []).filter((industry) =>
      industry.name.toLowerCase().includes(industriesSearchTerm.toLowerCase()),
    );
  }, [meta.industries, industriesSearchTerm]);

  const filteredAudience = useMemo(() => {
    if (!audienceSearchTerm) return meta.audience || [];
    return (meta.audience || []).filter((audience) =>
      audience.name.toLowerCase().includes(audienceSearchTerm.toLowerCase()),
    );
  }, [meta.audience, audienceSearchTerm]);

  const filteredFunctions = useMemo(() => {
    if (!functionsSearchTerm) return meta.businessFunctions || [];
    return (meta.businessFunctions || []).filter((func) =>
      func.name.toLowerCase().includes(functionsSearchTerm.toLowerCase()),
    );
  }, [meta.businessFunctions, functionsSearchTerm]);

  const filteredTeams = useMemo(() => {
    if (!teamsSearchTerm) return meta.teams || [];
    return (meta.teams || []).filter((team) =>
      team.toLowerCase().includes(teamsSearchTerm.toLowerCase()),
    );
  }, [meta.teams, teamsSearchTerm]);

  // Helper functions to get display names from IDs
  const getIndustryName = useCallback(
    (id: string) => {
      const industry = meta.industries?.find((ind) => ind.id === id);
      return industry ? industry.name : id;
    },
    [meta.industries],
  );

  const getAudienceName = useCallback(
    (id: string) => {
      const audience = meta.audience?.find((aud) => aud.id === id);
      return audience ? audience.name : id;
    },
    [meta.audience],
  );

  const getFunctionName = useCallback(
    (id: string) => {
      const func = meta.businessFunctions?.find((fn) => fn.id === id);
      return func ? func.name : id;
    },
    [meta.businessFunctions],
  );

  const handleVoted = useCallback(() => {
    refetch();
  }, [refetch]);

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
            selectedTeams={selectedTeams}
            onToggleIndustry={handleToggleIndustry}
            onToggleTechnology={handleToggleTechnology}
            onToggleFunction={handleToggleFunction}
            onToggleTeams={handleToggleTeams}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showIndustriesDropdown={showIndustriesDropdown}
            showAudienceDropdown={showAudienceDropdown}
            showFunctionsDropdown={showFunctionsDropdown}
            showTeamsDropdown={showTeamsDropdown}
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
            onToggleTeamsDropdown={() =>
              setShowTeamsDropdown(!showTeamsDropdown)
            }
            onToggleSortDropdown={() => setShowSortDropdown(!showSortDropdown)}
            onClearAllFilters={handleClearAllFilters}
            meta={meta}
            totalFiltersCount={totalFiltersCount}
            industriesSearchTerm={industriesSearchTerm}
            audienceSearchTerm={audienceSearchTerm}
            functionsSearchTerm={functionsSearchTerm}
            teamsSearchTerm={teamsSearchTerm}
            onIndustriesSearchChange={setIndustriesSearchTerm}
            onAudienceSearchChange={setAudienceSearchTerm}
            onFunctionsSearchChange={setFunctionsSearchTerm}
            onTeamsSearchChange={setTeamsSearchTerm}
            filteredIndustries={filteredIndustries}
            filteredAudience={filteredAudience}
            filteredFunctions={filteredFunctions}
            filteredTeams={filteredTeams}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            showDateRangeDropdown={showDateRangeDropdown}
            onToggleDateRangeDropdown={() =>
              setShowDateRangeDropdown(!showDateRangeDropdown)
            }
            // Helper functions for display names
            getIndustryName={getIndustryName}
            getAudienceName={getAudienceName}
            getFunctionName={getFunctionName}
          />
        </div>

        <div className="space-y-6">
          <SmartjectsGrid
            smartjects={smartjects}
            isLoading={isLoading}
            onVoted={handleVoted}
            emptyMessage="No smartjects found matching your criteria."
          />
        </div>
      </div>
    </div>
  );
};
