"use client";

import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  X,
  Building2,
  Cpu,
  Workflow,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { useInfiniteSmartjects } from "@/hooks/use-infinite-smartjects";
import { LoadMore } from "@/components/ui/load-more";
import { Audience } from "@/components/icons/Audience";
import { Functions } from "@/components/icons/Functions";
import { DateRange } from "react-day-picker";
import { Team } from "@/components/icons/Team";
import { Industries } from "@/components/icons/Industries";
import { SearchFilters } from "@/components/home/search-filters";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from "date-fns";

// Debounce hook inline
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Lazy load components that are not immediately visible
const SmartjectCard = dynamic(
  () =>
    import("@/components/smartject-card").then((mod) => ({
      default: mod.SmartjectCard,
    })),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  },
);

const FilterCategory = dynamic(
  () =>
    import("./filter-category").then((mod) => ({
      default: mod.FilterCategory,
    })),
  {
    loading: () => <div className="h-32 bg-gray-100 rounded animate-pulse" />,
  },
);

// Memoized utility function
const toggleItem = (list: string[], item: string): string[] => {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
};

// Memoized skeleton component for better performance
const CardSkeleton = memo(() => (
  <Card className="h-[400px] bg-white border border-gray-200">
    <div className="h-40 relative">
      <Skeleton className="h-full w-full" />
    </div>
    <div className="p-5 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </Card>
));

CardSkeleton.displayName = "CardSkeleton";

// Memoized grid of skeletons
const SkeletonGrid = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(6)
      .fill(0)
      .map((_, i) => (
        <CardSkeleton key={i} />
      ))}
  </div>
));

SkeletonGrid.displayName = "SkeletonGrid";

// Memoized filter badge component
const FilterBadge = memo(
  ({
    type,
    value,
    onRemove,
  }: {
    type: "industry" | "technology" | "function" | "team";
    value: string;
    onRemove: (value: string) => void;
  }) => {
    const handleRemove = useCallback(() => onRemove(value), [onRemove, value]);

    const colorConfig = {
      industry: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      technology: "bg-green-100 text-green-800 hover:bg-green-200",
      function: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      team: "bg-purple-100 text-purple-800 hover:bg-purple-200",
    };

    const bgColor = colorConfig[type];

    return (
      <Badge
        variant="secondary"
        className={`flex items-center gap-1 ${bgColor} rounded-full px-3 py-1`}
      >
        {value}
        <X
          className="h-3 w-3 cursor-pointer ml-1 hover:text-red-500"
          onClick={handleRemove}
        />
      </Badge>
    );
  },
);

FilterBadge.displayName = "FilterBadge";

// Memoized smartjects grid component
const SmartjectsGrid = memo(
  ({
    smartjects,
    isLoading,
    onVoted,
    emptyMessage = "No smartjects found matching your criteria.",
  }: {
    smartjects: any[];
    isLoading: boolean;
    onVoted: () => void;
    emptyMessage?: string;
  }) => {
    if (isLoading) {
      return <SkeletonGrid />;
    }

    if (smartjects.length === 0) {
      return (
        <div className="col-span-3 text-center py-12">
          <p className="text-muted-foreground text-lg mb-4">{emptyMessage}</p>
          <Button variant="outline" asChild>
            <a href="/">Browse All Smartjects</a>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {smartjects.map((smartject) => (
          <SmartjectCard
            key={smartject.id}
            smartject={smartject}
            onVoted={onVoted}
            userVotes={smartject.userVotes}
          />
        ))}
      </div>
    );
  },
);

SmartjectsGrid.displayName = "SmartjectsGrid";

export default function SmartjectsHubPage() {
  const [query, setQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [showIndustriesDropdown, setShowIndustriesDropdown] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showFunctionsDropdown, setShowFunctionsDropdown] = useState(false);
  const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDateRangeDropdown, setShowDateRangeDropdown] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Mobile dropdown states
  const [showMobileIndustriesDropdown, setShowMobileIndustriesDropdown] =
    useState(false);
  const [showMobileAudienceDropdown, setShowMobileAudienceDropdown] =
    useState(false);
  const [showMobileFunctionsDropdown, setShowMobileFunctionsDropdown] =
    useState(false);
  const [showMobileTeamsDropdown, setShowMobileTeamsDropdown] = useState(false);
  const [showMobileSortDropdown, setShowMobileSortDropdown] = useState(false);

  // Search states for filter dropdowns
  const [industriesSearchTerm, setIndustriesSearchTerm] = useState("");
  const [audienceSearchTerm, setAudienceSearchTerm] = useState("");
  const [functionsSearchTerm, setFunctionsSearchTerm] = useState("");
  const [teamsSearchTerm, setTeamsSearchTerm] = useState("");

  // Refs for dropdown close handling - Desktop
  const industriesRef = useRef<HTMLDivElement>(null);
  const audienceRef = useRef<HTMLDivElement>(null);
  const functionsRef = useRef<HTMLDivElement>(null);
  const teamsRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Refs for dropdown close handling - Mobile
  const mobileIndustriesRef = useRef<HTMLDivElement>(null);
  const mobileAudienceRef = useRef<HTMLDivElement>(null);
  const mobileFunctionsRef = useRef<HTMLDivElement>(null);
  const mobileTeamsRef = useRef<HTMLDivElement>(null);
  const mobileSortRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const {
    smartjects,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    filters,
    setFilter,
    clearFilters,
    refetch,
    error,
    sortBy,
    setSortBy,
    meta,
  } = useInfiniteSmartjects(user?.id, 12);

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

  const handleToggleAudience = useCallback(
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
    // Close mobile dropdowns
    setShowMobileIndustriesDropdown(false);
    setShowMobileAudienceDropdown(false);
    setShowMobileFunctionsDropdown(false);
    setShowMobileTeamsDropdown(false);
    setShowMobileSortDropdown(false);
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

  // Filter functions for dropdown searches
  const filteredIndustries = useMemo(() => {
    if (!industriesSearchTerm) return meta.industries || [];
    return (meta.industries || []).filter((industry) =>
      industry.toLowerCase().includes(industriesSearchTerm.toLowerCase()),
    );
  }, [meta.industries, industriesSearchTerm]);

  const filteredAudience = useMemo(() => {
    if (!audienceSearchTerm) return meta.audience || [];
    return (meta.audience || []).filter((audience) =>
      audience.toLowerCase().includes(audienceSearchTerm.toLowerCase()),
    );
  }, [meta.audience, audienceSearchTerm]);

  const filteredFunctions = useMemo(() => {
    if (!functionsSearchTerm) return meta.businessFunctions || [];
    return (meta.businessFunctions || []).filter((func) =>
      func.toLowerCase().includes(functionsSearchTerm.toLowerCase()),
    );
  }, [meta.businessFunctions, functionsSearchTerm]);

  const filteredTeams = useMemo(() => {
    if (!teamsSearchTerm) return meta.teams || [];
    return (meta.teams || []).filter((team) =>
      team.toLowerCase().includes(teamsSearchTerm.toLowerCase()),
    );
  }, [meta.teams, teamsSearchTerm]);

  // Sort options
  const sortOptions = [
    { value: "recent", label: "Recent" },
    { value: "most-needed", label: "Most Needed" },
    { value: "most-provided", label: "Most Provided" },
    { value: "most-believed", label: "Most Believed" },
  ] as const;

  // Memoized filtered smartjects with optimized filtering logic
  // Client-side filtering is now handled by the server
  const filteredSmartjects = smartjects;

  // Server-side sorting is now handled by the infinite scroll hook
  // No need for client-side sorting

  // Memoized refetch callback
  const memoizedRefetch = useCallback(refetch, [refetch]);

  useEffect(() => {
    if (
      filters.businessFunctions?.length ||
      filters.industries?.length ||
      filters.audience?.length ||
      filters.teams?.length
    ) {
      console.log("availableFilters updated", filters);
    }
  }, [
    filters.businessFunctions?.length,
    filters.industries?.length,
    filters.audience?.length,
    filters.teams?.length,
  ]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Desktop refs
      if (
        showIndustriesDropdown &&
        industriesRef.current &&
        !industriesRef.current.contains(event.target as Node)
      ) {
        setShowIndustriesDropdown(false);
      }
      if (
        showAudienceDropdown &&
        audienceRef.current &&
        !audienceRef.current.contains(event.target as Node)
      ) {
        setShowAudienceDropdown(false);
      }
      if (
        showFunctionsDropdown &&
        functionsRef.current &&
        !functionsRef.current.contains(event.target as Node)
      ) {
        setShowFunctionsDropdown(false);
      }
      if (
        showTeamsDropdown &&
        teamsRef.current &&
        !teamsRef.current.contains(event.target as Node)
      ) {
        setShowTeamsDropdown(false);
      }
      if (
        showSortDropdown &&
        sortRef.current &&
        !sortRef.current.contains(event.target as Node)
      ) {
        setShowSortDropdown(false);
      }

      // Mobile refs
      if (
        showMobileIndustriesDropdown &&
        mobileIndustriesRef.current &&
        !mobileIndustriesRef.current.contains(event.target as Node)
      ) {
        setShowMobileIndustriesDropdown(false);
      }
      if (
        showMobileAudienceDropdown &&
        mobileAudienceRef.current &&
        !mobileAudienceRef.current.contains(event.target as Node)
      ) {
        setShowMobileAudienceDropdown(false);
      }
      if (
        showMobileFunctionsDropdown &&
        mobileFunctionsRef.current &&
        !mobileFunctionsRef.current.contains(event.target as Node)
      ) {
        setShowMobileFunctionsDropdown(false);
      }
      if (
        showMobileTeamsDropdown &&
        mobileTeamsRef.current &&
        !mobileTeamsRef.current.contains(event.target as Node)
      ) {
        setShowMobileTeamsDropdown(false);
      }
      if (
        showMobileSortDropdown &&
        mobileSortRef.current &&
        !mobileSortRef.current.contains(event.target as Node)
      ) {
        setShowMobileSortDropdown(false);
      }
    };

    const hasOpenDropdowns =
      showIndustriesDropdown ||
      showAudienceDropdown ||
      showFunctionsDropdown ||
      showTeamsDropdown ||
      showSortDropdown ||
      showMobileIndustriesDropdown ||
      showMobileAudienceDropdown ||
      showMobileFunctionsDropdown ||
      showMobileTeamsDropdown ||
      showMobileSortDropdown;

    if (hasOpenDropdowns) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [
    showIndustriesDropdown,
    showAudienceDropdown,
    showFunctionsDropdown,
    showTeamsDropdown,
    showSortDropdown,
    showMobileIndustriesDropdown,
    showMobileAudienceDropdown,
    showMobileFunctionsDropdown,
    showMobileTeamsDropdown,
    showMobileSortDropdown,
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-start gap-[50px] relative border border-solid border-transparent">
          <div className="flex flex-col items-start gap-[50px] relative self-stretch w-full flex-[0_0_auto]">
            <div className="flex items-center justify-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start gap-2 relative flex-1 grow">
                <div className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]">
                  <div className="relative w-fit mt-[-1.00px] text-4xl font-semibold text-gray-900 whitespace-nowrap">
                    Discover smartjects
                  </div>
                </div>
                <div className="inline-flex items-center justify-center gap-2.5 pl-0.5 pr-0 py-0 relative flex-[0_0_auto]">
                  <p className="relative max-w-7xl mt-[-1.00px] text-base font-normal text-gray-600">
                    Explore innovations marketplace
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full items-start gap-3 relative flex-[0_0_auto] mb-12">
              {/* Search Bar and Mobile Toggle */}
              <div className="flex items-center gap-3 self-stretch w-full relative flex-[0_0_auto]">
                <div className="flex h-16 items-start gap-3 p-3 relative flex-1 grow bg-gray-200 rounded-2xl">
                  <div className="flex items-center gap-3 relative flex-1 grow">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Search here..."
                        value={query}
                        onChange={handleSearchChange}
                        className="pl-10 border-0 bg-white rounded-xl h-10 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    {/* Mobile Filter Toggle Button */}
                    <div className="flex items-center gap-2 lg:hidden">
                      <Button
                        variant="outline"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex items-center gap-2 h-10 px-3 rounded-xl bg-white border-gray-200 hover:bg-gray-50"
                      >
                        <Filter className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Filters
                          {totalFiltersCount > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {totalFiltersCount}
                            </span>
                          )}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isFilterOpen ? "rotate-180" : ""
                          }`}
                        />
                      </Button>
                    </div>

                    {/* Desktop Filters - Always visible on large screens */}
                    <div className="hidden lg:flex items-center gap-3">
                      <div className="relative" ref={industriesRef}>
                        <div
                          className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 h-10 cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            setShowIndustriesDropdown(!showIndustriesDropdown)
                          }
                        >
                          <Industries className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700">
                            Industries
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        {showIndustriesDropdown && (
                          <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-48 max-h-60 overflow-hidden">
                            <div className="p-2 border-b border-gray-100">
                              <Input
                                placeholder="Search industries..."
                                value={industriesSearchTerm}
                                onChange={(e) =>
                                  setIndustriesSearchTerm(e.target.value)
                                }
                                className="h-8 text-sm border-gray-200"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredIndustries.length > 0 ? (
                                filteredIndustries.map((industry) => (
                                  <div
                                    key={industry}
                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                                      selectedIndustries.includes(industry)
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700"
                                    }`}
                                    onClick={() => {
                                      handleToggleIndustry(industry);
                                      setShowIndustriesDropdown(false);
                                      setIndustriesSearchTerm("");
                                    }}
                                  >
                                    {industry}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                  No industries found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="relative" ref={audienceRef}>
                        <div
                          className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 h-10 cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            setShowAudienceDropdown(!showAudienceDropdown)
                          }
                        >
                          <Audience className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700">
                            Users
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        {showAudienceDropdown && (
                          <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-48 max-h-60 overflow-hidden">
                            <div className="p-2 border-b border-gray-100">
                              <Input
                                placeholder="Search users..."
                                value={audienceSearchTerm}
                                onChange={(e) =>
                                  setAudienceSearchTerm(e.target.value)
                                }
                                className="h-8 text-sm border-gray-200"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredAudience.length > 0 ? (
                                filteredAudience.map((tech) => (
                                  <div
                                    key={tech}
                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                                      selectedAudience.includes(tech)
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700"
                                    }`}
                                    onClick={() => {
                                      handleToggleAudience(tech);
                                      setShowAudienceDropdown(false);
                                      setAudienceSearchTerm("");
                                    }}
                                  >
                                    {tech}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                  No users found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="relative" ref={functionsRef}>
                        <div
                          className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 h-10 cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            setShowFunctionsDropdown(!showFunctionsDropdown)
                          }
                        >
                          <Functions className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700">
                            Functions
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        {showFunctionsDropdown && (
                          <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-48 max-h-60 overflow-hidden">
                            <div className="p-2 border-b border-gray-100">
                              <Input
                                placeholder="Search functions..."
                                value={functionsSearchTerm}
                                onChange={(e) =>
                                  setFunctionsSearchTerm(e.target.value)
                                }
                                className="h-8 text-sm border-gray-200"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredFunctions.length > 0 ? (
                                filteredFunctions.map((func) => (
                                  <div
                                    key={func}
                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                                      selectedFunctions.includes(func)
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700"
                                    }`}
                                    onClick={() => {
                                      handleToggleFunction(func);
                                      setShowFunctionsDropdown(false);
                                      setFunctionsSearchTerm("");
                                    }}
                                  >
                                    {func}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                  No functions found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="relative" ref={teamsRef}>
                        <div
                          className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 h-10 cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            setShowTeamsDropdown(!showTeamsDropdown)
                          }
                        >
                          <Team className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700">
                            Teams
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        {showTeamsDropdown && (
                          <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-48 max-h-60 overflow-hidden">
                            <div className="p-2 border-b border-gray-100">
                              <Input
                                placeholder="Search teams..."
                                value={teamsSearchTerm}
                                onChange={(e) =>
                                  setTeamsSearchTerm(e.target.value)
                                }
                                className="h-8 text-sm border-gray-200"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {filteredTeams.length > 0 ? (
                                filteredTeams.map((team) => (
                                  <div
                                    key={team}
                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                                      selectedTeams.includes(team)
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-700"
                                    }`}
                                    onClick={() => {
                                      handleToggleTeams(team);
                                      setShowTeamsDropdown(false);
                                      setTeamsSearchTerm("");
                                    }}
                                  >
                                    {team}
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                  No teams found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Date Range Picker */}
                      <DateRangePicker
                        date={dateRange}
                        onSelect={handleDateRangeChange}
                        placeholder="Select date range"
                      />

                      {/* Desktop Sort */}
                      <div className="relative" ref={sortRef}>
                        <div
                          className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 h-10 cursor-pointer hover:bg-gray-50"
                          onClick={() => setShowSortDropdown(!showSortDropdown)}
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {
                              sortOptions.find((opt) => opt.value === sortBy)
                                ?.label
                            }
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </div>
                        {showSortDropdown && (
                          <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-40">
                            {sortOptions.map((option) => (
                              <div
                                key={option.value}
                                className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                                  sortBy === option.value
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700"
                                }`}
                                onClick={() => {
                                  setSortBy(option.value);
                                  setShowSortDropdown(false);
                                }}
                              >
                                {option.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Filters - Collapsible */}
              {isFilterOpen && (
                <div className="lg:hidden w-full space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">
                      Filters
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFilterOpen(false)}
                      className="p-1 h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Mobile Industries Filter */}
                    <div className="relative" ref={mobileIndustriesRef}>
                      <div
                        className="flex items-center justify-between gap-2 bg-white rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors"
                        onClick={() =>
                          setShowMobileIndustriesDropdown(
                            !showMobileIndustriesDropdown,
                          )
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Industries className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700">
                            Industries
                          </span>
                          {selectedIndustries.length > 0 && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {selectedIndustries.length}
                            </span>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </div>
                      {showMobileIndustriesDropdown && (
                        <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-hidden">
                          <div className="p-2 border-b border-gray-100">
                            <Input
                              placeholder="Search industries..."
                              value={industriesSearchTerm}
                              onChange={(e) =>
                                setIndustriesSearchTerm(e.target.value)
                              }
                              className="h-8 text-sm border-gray-200"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-36 overflow-y-auto">
                            {filteredIndustries.length > 0 ? (
                              filteredIndustries.map((industry) => (
                                <div
                                  key={industry}
                                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                                    selectedIndustries.includes(industry)
                                      ? "bg-blue-50 text-blue-700 font-medium"
                                      : "text-gray-700"
                                  }`}
                                  onClick={() => {
                                    handleToggleIndustry(industry);
                                    setShowMobileIndustriesDropdown(false);
                                    setIndustriesSearchTerm("");
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{industry}</span>
                                    {selectedIndustries.includes(industry) && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                No industries found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile Audience Filter */}
                    <div className="relative" ref={mobileAudienceRef}>
                      <div
                        className="flex items-center justify-between gap-2 bg-white rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors"
                        onClick={() =>
                          setShowMobileAudienceDropdown(
                            !showMobileAudienceDropdown,
                          )
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Audience className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700">
                            Users
                          </span>
                          {selectedAudience.length > 0 && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {selectedAudience.length}
                            </span>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </div>
                      {showMobileAudienceDropdown && (
                        <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-hidden">
                          <div className="p-2 border-b border-gray-100">
                            <Input
                              placeholder="Search users..."
                              value={audienceSearchTerm}
                              onChange={(e) =>
                                setAudienceSearchTerm(e.target.value)
                              }
                              className="h-8 text-sm border-gray-200"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-36 overflow-y-auto">
                            {filteredAudience.length > 0 ? (
                              filteredAudience.map((tech) => (
                                <div
                                  key={tech}
                                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                                    selectedAudience.includes(tech)
                                      ? "bg-blue-50 text-blue-700 font-medium"
                                      : "text-gray-700"
                                  }`}
                                  onClick={() => {
                                    handleToggleAudience(tech);
                                    setShowMobileAudienceDropdown(false);
                                    setAudienceSearchTerm("");
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{tech}</span>
                                    {selectedAudience.includes(tech) && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                No users found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile Functions Filter */}
                    <div className="relative" ref={mobileFunctionsRef}>
                      <div
                        className="flex items-center justify-between gap-2 bg-white rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors"
                        onClick={() =>
                          setShowMobileFunctionsDropdown(
                            !showMobileFunctionsDropdown,
                          )
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Functions className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700">
                            Functions
                          </span>
                          {selectedFunctions.length > 0 && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {selectedFunctions.length}
                            </span>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </div>
                      {showMobileFunctionsDropdown && (
                        <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-hidden">
                          <div className="p-2 border-b border-gray-100">
                            <Input
                              placeholder="Search functions..."
                              value={functionsSearchTerm}
                              onChange={(e) =>
                                setFunctionsSearchTerm(e.target.value)
                              }
                              className="h-8 text-sm border-gray-200"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-36 overflow-y-auto">
                            {filteredFunctions.length > 0 ? (
                              filteredFunctions.map((func) => (
                                <div
                                  key={func}
                                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                                    selectedFunctions.includes(func)
                                      ? "bg-blue-50 text-blue-700 font-medium"
                                      : "text-gray-700"
                                  }`}
                                  onClick={() => {
                                    handleToggleFunction(func);
                                    setShowMobileFunctionsDropdown(false);
                                    setFunctionsSearchTerm("");
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{func}</span>
                                    {selectedFunctions.includes(func) && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                No functions found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile Teams Filter */}
                    <div className="relative" ref={mobileTeamsRef}>
                      <div
                        className="flex items-center justify-between gap-2 bg-white rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors"
                        onClick={() =>
                          setShowMobileTeamsDropdown(!showMobileTeamsDropdown)
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Team className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700">
                            Teams
                          </span>
                          {selectedTeams.length > 0 && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {selectedTeams.length}
                            </span>
                          )}
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </div>
                      {showMobileTeamsDropdown && (
                        <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-hidden">
                          <div className="p-2 border-b border-gray-100">
                            <Input
                              placeholder="Search teams..."
                              value={teamsSearchTerm}
                              onChange={(e) =>
                                setTeamsSearchTerm(e.target.value)
                              }
                              className="h-8 text-sm border-gray-200"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-36 overflow-y-auto">
                            {filteredTeams.length > 0 ? (
                              filteredTeams.map((team) => (
                                <div
                                  key={team}
                                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                                    selectedTeams.includes(team)
                                      ? "bg-blue-50 text-blue-700 font-medium"
                                      : "text-gray-700"
                                  }`}
                                  onClick={() => {
                                    handleToggleTeams(team);
                                    setShowMobileTeamsDropdown(false);
                                    setTeamsSearchTerm("");
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{team}</span>
                                    {selectedTeams.includes(team) && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                No teams found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile Date Range */}
                    <DateRangePicker
                      date={dateRange}
                      onSelect={handleDateRangeChange}
                      placeholder="Select date range"
                    />

                    {/* Mobile Sort */}
                    <div className="relative" ref={mobileSortRef}>
                      <div
                        className="flex items-center justify-between gap-2 bg-white rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors"
                        onClick={() =>
                          setShowMobileSortDropdown(!showMobileSortDropdown)
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            Sort:{" "}
                            {
                              sortOptions.find((opt) => opt.value === sortBy)
                                ?.label
                            }
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </div>
                      {showMobileSortDropdown && (
                        <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-hidden">
                          {sortOptions.map((option) => (
                            <div
                              key={option.value}
                              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                                sortBy === option.value
                                  ? "bg-blue-50 text-blue-700 font-medium"
                                  : "text-gray-700"
                              }`}
                              onClick={() => {
                                setSortBy(option.value);
                                setShowMobileSortDropdown(false);
                              }}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clear All Filters */}
                  {totalFiltersCount > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleClearAllFilters();
                          setIsFilterOpen(false);
                        }}
                        className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                      >
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Active Filters Tags */}
              {totalFiltersCount > 0 && (
                <div className="inline-flex items-start gap-2 px-3 py-0 relative flex-[0_0_auto]">
                  {selectedIndustries.map((industry) => (
                    <FilterBadge
                      key={industry}
                      type="industry"
                      value={industry}
                      onRemove={handleToggleIndustry}
                    />
                  ))}
                  {selectedAudience.map((tech) => (
                    <FilterBadge
                      key={tech}
                      type="technology"
                      value={tech}
                      onRemove={handleToggleAudience}
                    />
                  ))}
                  {selectedFunctions.map((func) => (
                    <FilterBadge
                      key={func}
                      type="function"
                      value={func}
                      onRemove={handleToggleFunction}
                    />
                  ))}
                  {selectedTeams.map((team) => (
                    <FilterBadge
                      key={team}
                      type="team"
                      value={team}
                      onRemove={handleToggleTeams}
                    />
                  ))}
                  {dateRange?.from && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-full px-3 py-1"
                    >
                      {dateRange.to
                        ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d, y")}`
                        : format(dateRange.from, "MMM d, y")}
                      <X
                        className="h-3 w-3 cursor-pointer ml-1 hover:text-red-500"
                        onClick={() => handleDateRangeChange(undefined)}
                      />
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="text-xs h-7 px-2 text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              {/* Hidden Filter Section for Logic */}
              <div className="hidden">
                <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <CollapsibleContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FilterCategory
                        title="Industries"
                        icon={<Industries className="h-4 w-4 mr-2" />}
                        options={meta.industries ?? []}
                        selected={selectedIndustries}
                        onToggle={handleToggleIndustry}
                      />
                      <FilterCategory
                        title="Users"
                        icon={<Cpu className="h-4 w-4 mr-2 text-blue-500" />}
                        options={meta.audience ?? []}
                        selected={selectedAudience}
                        onToggle={handleToggleAudience}
                      />
                      <FilterCategory
                        title="Functions"
                        icon={<Functions className="h-4 w-4 mr-2" />}
                        options={meta.businessFunctions ?? []}
                        selected={selectedFunctions}
                        onToggle={handleToggleFunction}
                      />
                      <FilterCategory
                        title="Team"
                        icon={<Team className="h-4 w-4 mr-2" />}
                        options={meta.teams ?? []}
                        selected={selectedTeams}
                        onToggle={handleToggleTeams}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SmartjectsGrid
            smartjects={filteredSmartjects}
            isLoading={isLoading}
            onVoted={memoizedRefetch}
            emptyMessage={`No ${sortBy === "recent" ? "recent " : ""}smartjects found matching your criteria.`}
          />

          <LoadMore
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            error={error}
            onLoadMore={loadMore}
            loadingText="Loading more smartjects..."
            noMoreText="You've seen all available smartjects"
            errorText="Failed to load more smartjects"
          />
        </div>
      </div>
    </div>
  );
}
