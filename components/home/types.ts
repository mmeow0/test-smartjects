import type { SmartjectType } from "@/lib/types";

export interface SmartjectFilters {
  industries?: string[];
  audience?: string[];
  businessFunctions?: string[];
}

export type SortOption =
  | "recent"
  | "most-needed"
  | "most-provided"
  | "most-believed";

export interface SortOptionConfig {
  value: SortOption;
  label: string;
}

export type FilterType = "industry" | "technology" | "function";

export interface FilterBadgeProps {
  type: FilterType;
  value: string;
  onRemove: (value: string) => void;
}

export interface SmartjectsGridProps {
  smartjects: SmartjectType[];
  isLoading: boolean;
  onVoted: () => void;
  emptyMessage?: string;
}

export interface CategorizedSmartjects {
  recent: SmartjectType[];
  mostNeeded: SmartjectType[];
  mostProvided: SmartjectType[];
  mostBelieved: SmartjectType[];
}

export interface SearchFiltersProps {
  query: string;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedIndustries: string[];
  selectedAudience: string[];
  selectedFunctions: string[];
  onToggleIndustry: (industry: string) => void;
  onToggleTechnology: (tech: string) => void;
  onToggleFunction: (func: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  showIndustriesDropdown: boolean;
  showAudienceDropdown: boolean;
  showFunctionsDropdown: boolean;
  showSortDropdown: boolean;
  onToggleIndustriesDropdown: () => void;
  onToggleAudienceDropdown: () => void;
  onToggleFunctionsDropdown: () => void;
  onToggleSortDropdown: () => void;
  onClearAllFilters: () => void;
  filters: SmartjectFilters;
  totalFiltersCount: number;
}

export interface SmartjectsTabsProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  categorizedSmartjects: CategorizedSmartjects;
  isLoading: boolean;
  onVoted: () => void;
}

export interface UseSmartjectsReturn {
  smartjects: SmartjectType[];
  isLoading: boolean;
  filters: SmartjectFilters;
  setFilter: (key: keyof SmartjectFilters, value: string[]) => void;
  refetch: () => void;
}

export interface DropdownState {
  industries: boolean;
  audience: boolean;
  functions: boolean;
  sort: boolean;
}

export interface FilterState {
  selectedIndustries: string[];
  selectedAudience: string[];
  selectedFunctions: string[];
}
