"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
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
import { useSmartjects } from "@/hooks/use-smartjects";

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
const SmartjectCard = dynamic(() => import("@/components/smartject-card").then(mod => ({ default: mod.SmartjectCard })), {
  loading: () => <CardSkeleton />,
  ssr: false
});

const FilterCategory = dynamic(() => import("./filter-category").then(mod => ({ default: mod.FilterCategory })), {
  loading: () => <div className="h-32 bg-gray-100 rounded animate-pulse" />,
});

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
    {Array(6).fill(0).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
));

SkeletonGrid.displayName = "SkeletonGrid";

// Memoized filter badge component
const FilterBadge = memo(({ 
  type, 
  value, 
  onRemove 
}: { 
  type: 'industry' | 'technology' | 'function';
  value: string; 
  onRemove: (value: string) => void;
}) => {
  const handleRemove = useCallback(() => onRemove(value), [onRemove, value]);
  
  const iconConfig = {
    industry: { icon: Building2, color: "text-orange-500" },
    technology: { icon: Cpu, color: "text-blue-500" },
    function: { icon: Workflow, color: "text-cyan-600" }
  };
  
  const { icon: Icon, color } = iconConfig[type];
  
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
    >
      <Icon className={`h-3 w-3 mr-1 ${color}`} />
      {value}
      <X
        className="h-3 w-3 cursor-pointer ml-1 hover:text-red-500"
        onClick={handleRemove}
      />
    </Badge>
  );
});

FilterBadge.displayName = "FilterBadge";

// Memoized smartjects grid component
const SmartjectsGrid = memo(({ 
  smartjects, 
  isLoading, 
  onVoted, 
  emptyMessage = "No smartjects found matching your criteria."
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
});

SmartjectsGrid.displayName = "SmartjectsGrid";

export default function SmartjectsHubPage() {
  const [query, setQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const { user } = useAuth();
  const { smartjects, isLoading, filters, setFilter, refetch } = useSmartjects(user?.id);

  // Debounce search query for better performance
  const debouncedQuery = useDebounce(query, 300);

  // Memoized filter handlers to prevent unnecessary re-renders
  const handleToggleIndustry = useCallback((industry: string) => {
    setSelectedIndustries((prev) => {
      const updated = toggleItem(prev, industry);
      const filterUpdated = toggleItem(filters.industries || [], industry);
      setFilter("industries", filterUpdated);
      return updated;
    });
  }, [filters.industries, setFilter]);

  const handleToggleTechnology = useCallback((tech: string) => {
    setSelectedTechnologies((prev) => {
      const updated = toggleItem(prev, tech);
      const filterUpdated = toggleItem(filters.technologies || [], tech);
      setFilter("technologies", filterUpdated);
      return updated;
    });
  }, [filters.technologies, setFilter]);

  const handleToggleFunction = useCallback((fn: string) => {
    setSelectedFunctions((prev) => {
      const updated = toggleItem(prev, fn);
      const filterUpdated = toggleItem(filters.businessFunctions || [], fn);
      setFilter("businessFunctions", filterUpdated);
      return updated;
    });
  }, [filters.businessFunctions, setFilter]);

  // Memoized total filters count
  const totalFiltersCount = useMemo(() => 
    selectedIndustries.length + selectedTechnologies.length + selectedFunctions.length,
    [selectedIndustries.length, selectedTechnologies.length, selectedFunctions.length]
  );

  // Memoized clear all filters handler
  const handleClearAllFilters = useCallback(() => {
    setSelectedIndustries([]);
    setSelectedFunctions([]);
    setSelectedTechnologies([]);
    setFilter("industries", []);
    setFilter("technologies", []);
    setFilter("businessFunctions", []);
  }, [setFilter]);

  // Memoized search change handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  // Memoized filtered smartjects with optimized filtering logic
  const filteredSmartjects = useMemo(() => {
    if (!smartjects?.length) return [];

    const lowerQuery = debouncedQuery.toLowerCase();
    
    return smartjects.filter((s) => {
      // Early return for empty query and no filters
      if (!lowerQuery && totalFiltersCount === 0) return true;

      // Query matching
      const matchesQuery = !lowerQuery || (
        s.title?.toLowerCase().includes(lowerQuery) ||
        s.mission?.toLowerCase().includes(lowerQuery) ||
        s.problematics?.toLowerCase().includes(lowerQuery) ||
        s.scope?.toLowerCase().includes(lowerQuery)
      );

      if (!matchesQuery) return false;

      // Filter matching with early returns
      const matchesIndustries = selectedIndustries.length === 0 ||
        selectedIndustries.some((i) => s.industries?.includes(i));

      if (!matchesIndustries) return false;

      const matchesTechnologies = selectedTechnologies.length === 0 ||
        selectedTechnologies.some((t) => s.technologies?.includes(t));

      if (!matchesTechnologies) return false;

      const matchesFunctions = selectedFunctions.length === 0 ||
        selectedFunctions.some((f) => s.businessFunctions?.includes(f));

      return matchesFunctions;
    });
  }, [smartjects, debouncedQuery, selectedIndustries, selectedTechnologies, selectedFunctions, totalFiltersCount]);

  // Memoized sorted arrays for different tabs
  const sortedSmartjects = useMemo(() => {
    if (!filteredSmartjects?.length) {
      return {
        recent: [],
        mostNeeded: [],
        mostProvided: [],
        mostBelieved: []
      };
    }

    return {
      recent: [...filteredSmartjects].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      mostNeeded: [...filteredSmartjects].sort(
        (a, b) => (b.votes?.need || 0) - (a.votes?.need || 0)
      ),
      mostProvided: [...filteredSmartjects].sort(
        (a, b) => (b.votes?.provide || 0) - (a.votes?.provide || 0)
      ),
      mostBelieved: [...filteredSmartjects].sort(
        (a, b) => (b.votes?.believe || 0) - (a.votes?.believe || 0)
      )
    };
  }, [filteredSmartjects]);

  // Memoized refetch callback
  const memoizedRefetch = useCallback(refetch, [refetch]);

  useEffect(() => {
    if (filters.businessFunctions?.length || filters.industries?.length || filters.technologies?.length) {
      console.log("availableFilters updated", filters);
    }
  }, [filters.businessFunctions?.length, filters.industries?.length, filters.technologies?.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover smartjects</h1>
          <p className="text-gray-600 mb-4">
            Explore all available AI implementation projects
          </p>

          {/* Search and Filter Bar */}
          <Card className="p-6 bg-white border border-gray-200">
            <div className="flex flex-col space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search here..."
                  value={query}
                  onChange={handleSearchChange}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Active Filters Display */}
              {totalFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {selectedIndustries.map((industry) => (
                    <FilterBadge
                      key={industry}
                      type="industry"
                      value={industry}
                      onRemove={handleToggleIndustry}
                    />
                  ))}
                  {selectedTechnologies.map((tech) => (
                    <FilterBadge
                      key={tech}
                      type="technology"
                      value={tech}
                      onRemove={handleToggleTechnology}
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

              {/* Collapsible Filter Section */}
              <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filters</span>
                    {totalFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-2 bg-blue-100 text-blue-800">
                        {totalFiltersCount}
                      </Badge>
                    )}
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700">
                      {isFilterOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Industries Filter */}
                    <FilterCategory
                      title="Industries"
                      icon={<Building2 className="h-4 w-4 mr-2 text-orange-500" />}
                      options={filters.industries ?? []}
                      selected={selectedIndustries}
                      onToggle={handleToggleIndustry}
                    />

                    {/* Technologies Filter */}
                    <FilterCategory
                      title="Technologies"
                      icon={<Cpu className="h-4 w-4 mr-2 text-blue-500" />}
                      options={filters.technologies ?? []}
                      selected={selectedTechnologies}
                      onToggle={handleToggleTechnology}
                    />

                    {/* Functions Filter */}
                    <FilterCategory
                      title="Functions"
                      icon={<Workflow className="h-4 w-4 mr-2 text-cyan-600" />}
                      options={filters.businessFunctions ?? []}
                      selected={selectedFunctions}
                      onToggle={handleToggleFunction}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="recent">
          <TabsList className="mb-6">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="most-needed">Most Needed</TabsTrigger>
            <TabsTrigger value="most-provided">Most Provided</TabsTrigger>
            <TabsTrigger value="most-believed">Most Believed</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <SmartjectsGrid
              smartjects={sortedSmartjects.recent}
              isLoading={isLoading}
              onVoted={memoizedRefetch}
              emptyMessage="No recent smartjects found matching your criteria."
            />
          </TabsContent>

          <TabsContent value="most-needed" className="space-y-4">
            <SmartjectsGrid
              smartjects={sortedSmartjects.mostNeeded}
              isLoading={isLoading}
              onVoted={memoizedRefetch}
              emptyMessage="No smartjects found matching your criteria."
            />
          </TabsContent>

          <TabsContent value="most-provided" className="space-y-4">
            <SmartjectsGrid
              smartjects={sortedSmartjects.mostProvided}
              isLoading={isLoading}
              onVoted={memoizedRefetch}
              emptyMessage="No smartjects found matching your criteria."
            />
          </TabsContent>

          <TabsContent value="most-believed" className="space-y-4">
            <SmartjectsGrid
              smartjects={sortedSmartjects.mostBelieved}
              isLoading={isLoading}
              onVoted={memoizedRefetch}
              emptyMessage="No smartjects found matching your criteria."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}