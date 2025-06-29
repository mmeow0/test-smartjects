import { memo, useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, Filter, X } from "lucide-react";
import { Audience } from "@/components/icons/Audience";
import { Functions } from "@/components/icons/Functions";
import { Industries } from "@/components/icons/Industries";
import { FilterBadge } from "./filter-badge";

interface SearchFiltersProps {
  query: string;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedIndustries: string[];
  selectedAudience: string[];
  selectedFunctions: string[];
  onToggleIndustry: (industry: string) => void;
  onToggleTechnology: (tech: string) => void;
  onToggleFunction: (func: string) => void;
  sortBy: "recent" | "most-needed" | "most-provided" | "most-believed";
  onSortChange: (
    sort: "recent" | "most-needed" | "most-provided" | "most-believed",
  ) => void;
  showIndustriesDropdown: boolean;
  showAudienceDropdown: boolean;
  showFunctionsDropdown: boolean;
  showSortDropdown: boolean;
  onToggleIndustriesDropdown: () => void;
  onToggleAudienceDropdown: () => void;
  onToggleFunctionsDropdown: () => void;
  onToggleSortDropdown: () => void;
  onClearAllFilters: () => void;
  filters: {
    industries?: string[];
    audience?: string[];
    businessFunctions?: string[];
  };
  totalFiltersCount: number;
}

const sortOptions = [
  { value: "recent", label: "Recent" },
  { value: "most-needed", label: "Most Needed" },
  { value: "most-provided", label: "Most Provided" },
  { value: "most-believed", label: "Most Believed" },
] as const;

export const SearchFilters = memo(
  ({
    query,
    onQueryChange,
    selectedIndustries,
    selectedAudience,
    selectedFunctions,
    onToggleIndustry,
    onToggleTechnology,
    onToggleFunction,
    sortBy,
    onSortChange,
    showIndustriesDropdown,
    showAudienceDropdown,
    showFunctionsDropdown,
    showSortDropdown,
    onToggleIndustriesDropdown,
    onToggleAudienceDropdown,
    onToggleFunctionsDropdown,
    onToggleSortDropdown,
    onClearAllFilters,
    filters,
    totalFiltersCount,
  }: SearchFiltersProps) => {
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Refs for dropdown close handling
    const industriesRef = useRef<HTMLDivElement>(null);
    const audienceRef = useRef<HTMLDivElement>(null);
    const functionsRef = useRef<HTMLDivElement>(null);
    const sortRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          showIndustriesDropdown &&
          industriesRef.current &&
          !industriesRef.current.contains(event.target as Node)
        ) {
          onToggleIndustriesDropdown();
        }
        if (
          showAudienceDropdown &&
          audienceRef.current &&
          !audienceRef.current.contains(event.target as Node)
        ) {
          onToggleAudienceDropdown();
        }
        if (
          showFunctionsDropdown &&
          functionsRef.current &&
          !functionsRef.current.contains(event.target as Node)
        ) {
          onToggleFunctionsDropdown();
        }
        if (
          showSortDropdown &&
          sortRef.current &&
          !sortRef.current.contains(event.target as Node)
        ) {
          onToggleSortDropdown();
        }
      };

      const hasOpenDropdowns =
        showIndustriesDropdown ||
        showAudienceDropdown ||
        showFunctionsDropdown ||
        showSortDropdown;

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
      showSortDropdown,
      onToggleIndustriesDropdown,
      onToggleAudienceDropdown,
      onToggleFunctionsDropdown,
      onToggleSortDropdown,
    ]);

    return (
      <div className="flex flex-col lg:flex-row w-full gap-4 sm:gap-6 items-start lg:items-center bg-gray-50 rounded-2xl p-3">
        {/* Search Bar - Always Visible */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
          <Input
            placeholder="Search smartjects..."
            value={query}
            onChange={onQueryChange}
            className="pl-12 pr-4 py-3 sm:py-4 h-12 sm:h-14 border-0 rounded-2xl text-base focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="flex items-center justify-between lg:hidden gap-5">
          <Button
            variant="outline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 h-12 px-4 rounded-xl bg-white border-gray-200 hover:bg-gray-50"
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
                showMobileFilters ? "rotate-180" : ""
              }`}
            />
          </Button>

          {/* Sort Dropdown - Always visible on mobile */}
          <div className="relative" ref={sortRef}>
            <div
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 h-12 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={onToggleSortDropdown}
            >
              <span className="text-sm font-medium text-gray-700">
                {sortOptions.find((opt) => opt.value === sortBy)?.label}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
            {showSortDropdown && (
              <div className="absolute top-14 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-44 overflow-hidden">
                {sortOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                      sortBy === option.value
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      onSortChange(option.value);
                      onToggleSortDropdown();
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Filters - Always visible on large screens */}
        <div className="hidden lg:flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-3 flex-1">
            {/* Industries Filter */}
            <div className="relative" ref={industriesRef}>
              <div
                className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 h-11 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors min-w-0"
                onClick={onToggleIndustriesDropdown}
              >
                <Industries className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 truncate">
                  Industries
                  {selectedIndustries.length > 0 && (
                    <span className="ml-1 text-blue-600">
                      ({selectedIndustries.length})
                    </span>
                  )}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </div>
              {showIndustriesDropdown && (
                <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-56 max-h-60 overflow-y-auto">
                  {filters.industries?.map((industry) => (
                    <div
                      key={industry}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                        selectedIndustries.includes(industry)
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700"
                      }`}
                      onClick={() => {
                        onToggleIndustry(industry);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{industry}</span>
                        {selectedIndustries.includes(industry) && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Audience Filter */}
            <div className="relative" ref={audienceRef}>
              <div
                className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 h-11 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors min-w-0"
                onClick={onToggleAudienceDropdown}
              >
                <Audience className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 truncate">
                  Audience
                  {selectedAudience.length > 0 && (
                    <span className="ml-1 text-blue-600">
                      ({selectedAudience.length})
                    </span>
                  )}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </div>
              {showAudienceDropdown && (
                <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-56 max-h-60 overflow-y-auto">
                  {filters.audience?.map((tech) => (
                    <div
                      key={tech}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                        selectedAudience.includes(tech)
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700"
                      }`}
                      onClick={() => {
                        onToggleTechnology(tech);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{tech}</span>
                        {selectedAudience.includes(tech) && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Functions Filter */}
            <div className="relative" ref={functionsRef}>
              <div
                className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 h-11 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors min-w-0"
                onClick={onToggleFunctionsDropdown}
              >
                <Functions className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 truncate">
                  Functions
                  {selectedFunctions.length > 0 && (
                    <span className="ml-1 text-blue-600">
                      ({selectedFunctions.length})
                    </span>
                  )}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </div>
              {showFunctionsDropdown && (
                <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-56 max-h-60 overflow-y-auto">
                  {filters.businessFunctions?.map((func) => (
                    <div
                      key={func}
                      className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                        selectedFunctions.includes(func)
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700"
                      }`}
                      onClick={() => {
                        onToggleFunction(func);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{func}</span>
                        {selectedFunctions.includes(func) && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Sort */}
          <div className="relative" ref={sortRef}>
            <div
              className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 h-11 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors min-w-0"
              onClick={onToggleSortDropdown}
            >
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {sortOptions.find((opt) => opt.value === sortBy)?.label}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </div>
            {showSortDropdown && (
              <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-44 overflow-hidden">
                {sortOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                      sortBy === option.value
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700"
                    }`}
                    onClick={() => {
                      onSortChange(option.value);
                      onToggleSortDropdown();
                    }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters - Collapsible */}
        {showMobileFilters && (
          <div className="lg:hidden space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileFilters(false)}
                className="p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Mobile Industries Filter */}
              <div className="relative" ref={industriesRef}>
                <div
                  className="flex items-center justify-between gap-2 bg-white rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors"
                  onClick={onToggleIndustriesDropdown}
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
                {showIndustriesDropdown && (
                  <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    {filters.industries?.map((industry) => (
                      <div
                        key={industry}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                          selectedIndustries.includes(industry)
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700"
                        }`}
                        onClick={() => {
                          onToggleIndustry(industry);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{industry}</span>
                          {selectedIndustries.includes(industry) && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Audience Filter */}
              <div className="relative" ref={audienceRef}>
                <div
                  className="flex items-center justify-between gap-2 bg-white rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors"
                  onClick={onToggleAudienceDropdown}
                >
                  <div className="flex items-center gap-2">
                    <Audience className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">
                      Audience
                    </span>
                    {selectedAudience.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {selectedAudience.length}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
                {showAudienceDropdown && (
                  <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    {filters.audience?.map((tech) => (
                      <div
                        key={tech}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                          selectedAudience.includes(tech)
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700"
                        }`}
                        onClick={() => {
                          onToggleTechnology(tech);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{tech}</span>
                          {selectedAudience.includes(tech) && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Functions Filter */}
              <div className="relative" ref={functionsRef}>
                <div
                  className="flex items-center justify-between gap-2 bg-white rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 border border-gray-200 transition-colors"
                  onClick={onToggleFunctionsDropdown}
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
                {showFunctionsDropdown && (
                  <div className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    {filters.businessFunctions?.map((func) => (
                      <div
                        key={func}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm transition-colors ${
                          selectedFunctions.includes(func)
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700"
                        }`}
                        onClick={() => {
                          onToggleFunction(func);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{func}</span>
                          {selectedFunctions.includes(func) && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
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
                    onClearAllFilters();
                    setShowMobileFilters(false);
                  }}
                  className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Tags - Show on both mobile and desktop */}
        {totalFiltersCount > 0 && (
          <div className="flex flex-wrap items-start gap-2">
            {selectedIndustries.map((industry) => (
              <FilterBadge
                key={industry}
                type="industry"
                value={industry}
                onRemove={onToggleIndustry}
              />
            ))}
            {selectedAudience.map((tech) => (
              <FilterBadge
                key={tech}
                type="technology"
                value={tech}
                onRemove={onToggleTechnology}
              />
            ))}
            {selectedFunctions.map((func) => (
              <FilterBadge
                key={func}
                type="function"
                value={func}
                onRemove={onToggleFunction}
              />
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAllFilters}
              className="text-xs h-7 px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-full"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    );
  },
);

SearchFilters.displayName = "SearchFilters";
