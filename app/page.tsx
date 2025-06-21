"use client";

import { useState, useMemo, useCallback, memo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ChevronDown, Search, X } from "lucide-react";
import { HeroSection } from "@/components/hero-section";

import { CompanyLogos } from "@/components/company-logos";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { useSmartjects } from "@/hooks/use-smartjects";
import { Discover } from "@/components/icons/Discover";
import { Connect } from "@/components/icons/Connect";
import { Execute } from "@/components/icons/Execute";
import { Audience } from "@/components/icons/Audience";
import { Functions } from "@/components/icons/Functions";
import { Industries } from "@/components/icons/Industries";

// Debounce hook inline for performance
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

// Lazy load heavy components
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

// Memoized skeleton component
const CardSkeleton = memo(() => (
  <Card className="w-full">
    <CardHeader>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
));

CardSkeleton.displayName = "CardSkeleton";

// Memoized skeleton grid
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

const FilterBadge = memo(
  ({
    type,
    value,
    onRemove,
  }: {
    type: "industry" | "technology" | "function";
    value: string;
    onRemove: (value: string) => void;
  }) => {
    const handleRemove = useCallback(() => onRemove(value), [onRemove, value]);

    const colorConfig = {
      industry: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      technology: "bg-green-100 text-green-800 hover:bg-green-200",
      function: "bg-blue-100 text-blue-800 hover:bg-blue-200",
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

const toggleItem = (array: string[], item: string) => {
  return array.includes(item)
    ? array.filter((i) => i !== item)
    : [...array, item];
};

// Memoized How Smartjects Works section
const HowItWorksSection = memo(() => (
  <div className="flex flex-col items-center gap-20 pt-[100px] pb-[50px] px-0 relative">
    <div className="flex flex-col w-[365px] items-center gap-5 relative flex-[0_0_auto]">
      <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter_Tight-Regular',Helvetica] font-normal text-[#020817] text-[50px] text-center tracking-[0] leading-[normal]">
        How it works
      </div>
      <p className="relative self-stretch [font-family:'Inter-Regular',Helvetica] font-normal text-slate-500 text-sm text-center tracking-[0] leading-5">
        From research to implementation in three simple steps
      </p>
    </div>

    <div className="flex items-start justify-center gap-[50px] self-stretch w-full relative flex-[0_0_auto]">
      <div className="flex flex-col w-[371px] items-center gap-5 relative">
        <Discover className="!relative !w-[125px] !h-[125px]" />
        <div className="inline-flex flex-col items-center gap-[50px] relative flex-[0_0_auto]">
          <div className="relative w-[371px] mt-[-1.00px] [font-family:'Inter_Tight-Regular',Helvetica] font-normal text-[#020817] text-[35px] text-center tracking-[0] leading-[normal]">
            Discover
          </div>
          <p className="relative w-[309px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#020817] text-base text-center tracking-[0] leading-[normal]">
            Browse research data transformed into potential implementation
            projects for business
          </p>
        </div>
      </div>

      <div className="flex flex-col w-[371px] items-center gap-5 relative">
        <Connect className="!relative !w-[125px] !h-[125px]" />
        <div className="flex flex-col w-[371px] items-center gap-[50px] relative flex-[0_0_auto]">
          <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter_Tight-Regular',Helvetica] font-normal text-[#020817] text-[35px] text-center tracking-[0] leading-[normal]">
            Connect
          </div>
          <p className="relative w-[371px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#020817] text-base text-center tracking-[0] leading-[normal]">
            Participate in discussions, vote on smartjects, find partners, and
            help shape the future of innovations in business
          </p>
        </div>
      </div>

      <div className="flex flex-col w-[371px] items-center gap-5 relative">
        <Execute className="!relative !w-[125px] !h-[125px]" />
        <div className="flex flex-col w-[371px] items-center gap-[50px] relative flex-[0_0_auto]">
          <div className="relative self-stretch mt-[-1.00px] [font-family:'Inter_Tight-Regular',Helvetica] font-normal text-[#020817] text-[35px] text-center tracking-[0] leading-[normal]">
            Execute
          </div>
          <p className="relative w-[277px] [font-family:'Inter-Regular',Helvetica] font-normal text-[#020817] text-base text-center tracking-[0] leading-[normal]">
            Create proposals, negotiate and agree with smart contracts
          </p>
        </div>
      </div>
    </div>

    <button className="all-[unset] box-border flex w-[200px] h-[52px] items-center justify-center gap-1.5 p-1.5 relative bg-colors-brand-yellow-1 rounded-xl bg-yellow-300">
      <div className="inline-flex items-center relative flex-[0_0_auto]">
        <div className="relative w-fit mt-[-1.00px] font-title-medium-14 font-[number:var(--title-medium-14-font-weight)] text-colors-neutral-1000 text-[length:var(--title-medium-14-font-size)] text-center tracking-[var(--title-medium-14-letter-spacing)] leading-[var(--title-medium-14-line-height)] whitespace-nowrap [font-style:var(--title-medium-14-font-style)]">
          Learn more
        </div>
      </div>
    </button>
  </div>
));

HowItWorksSection.displayName = "HowItWorksSection";

// Memoized comparison section with new black background design
const ComparisonSection = memo(() => (
  <div className="flex flex-col items-center gap-[70px] relative bg-black rounded-[50px] overflow-hidden py-10">
    <div className="inline-flex flex-col items-start gap-20 relative">
      <div className="flex w-[1340px] h-[207px] items-end gap-5 relative">
        <p className="relative w-[660px] font-normal text-[#020817] text-[50px] tracking-[-0.90px] leading-[normal]">
          <span className="text-slate-50 tracking-[-0.45px]">Why </span>
          <span className="font-dynalight text-slate-50 text-[80px] tracking-[-0.72px]">
            smartjects
          </span>
          <span className="text-slate-50 tracking-[-0.45px]">
            {" "}
            are <br />
            better for innovations
          </span>
        </p>
        <div className="flex flex-col max-w-screen-md items-start relative flex-1 grow">
          <p className="relative w-[593px] text-white text-lg leading-7">
            Traditional corporate project implementation process is not <br />
            geared toward innovations. Gathering requirements, writing technical
            specifications, tendering, and procurement do not take into account
            the rapid emergence of new technologies, so project results <br />
            are often mediocre and uncompetitive.
          </p>
        </div>
      </div>

      <div className="flex w-[1340px] items-start gap-5 relative flex-[0_0_auto]">
        {/* Traditional implementation projects - левая сторона */}
        <div className="flex flex-col items-start justify-center gap-8 p-4 relative flex-1 self-stretch grow bg-[#ffffff0d] rounded-[20px] shadow-100">
          <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
            <div className="w-[50px] h-[50px] flex items-center justify-center bg-[#ff6b00] rounded-2xl">
              <span className="text-black font-thin text-6xl">-</span>
            </div>
            <div className="w-fit font-semibold text-slate-50 text-lg leading-5 whitespace-nowrap">
              Traditional implementation projects
            </div>
          </div>

          <div className="gap-3 w-full flex flex-col items-start relative flex-1 self-stretch grow">
            <div className="flex h-[173px] items-start gap-3 relative self-stretch w-full">
              <div className="gap-[25px] p-6 bg-[#ffffff0d] rounded-2xl flex flex-col items-start relative flex-1 self-stretch grow">
                <div className="w-fit font-semibold text-slate-50 text-lg leading-5 whitespace-nowrap">
                  Not Built for Innovation
                </div>
                <p className="self-stretch text-white text-sm leading-5">
                  Often start from internal assumptions or top-down mandates,
                  leading to weak business cases.
                </p>
              </div>

              <div className="gap-[25px] p-6 bg-[#ffffff0d] rounded-2xl flex flex-col items-start relative flex-1 self-stretch grow">
                <div className="w-fit font-semibold text-slate-50 text-lg leading-5 whitespace-nowrap">
                  Weak Business Cases
                </div>
                <p className="self-stretch text-white text-sm leading-5">
                  Validation happens late—if at all—after pilot stages or
                  through costly market <br /> studies.
                </p>
              </div>
            </div>

            <div className="items-start gap-[25px] p-6 self-stretch w-full bg-[#ffffff0d] rounded-2xl flex flex-col relative">
              <div className="w-fit font-semibold text-slate-50 text-lg leading-5 whitespace-nowrap">
                Late or No Validation
              </div>
              <p className="w-[278px] text-white text-sm leading-5">
                Require long lead times, RFP processes, and vendor evaluations.
              </p>
            </div>
          </div>
        </div>

        {/* Smartjects approach - правая сторона */}
        <div className="flex flex-col items-start justify-center gap-8 p-4 relative flex-1 self-stretch grow bg-white rounded-[20px] shadow-100">
          <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
            <div className="w-[50px] h-[50px] flex items-center justify-center bg-[#ffd800] rounded-2xl">
              <span className="text-black font-thin text-4xl">+</span>
            </div>

            <div className="w-fit font-semibold text-black text-lg leading-5 whitespace-nowrap">
              Smartjects approach
            </div>
          </div>

          <div className="gap-3 w-full flex flex-col items-start relative flex-1 self-stretch grow">
            <div className="flex h-[173px] items-start gap-3 relative self-stretch w-full">
              <div className="gap-[25px] p-6 bg-white rounded-2xl border border-solid border-[#eaeaea] flex flex-col items-start relative flex-1 self-stretch grow">
                <div className="w-fit font-semibold text-black text-lg leading-5 whitespace-nowrap">
                  Research-driven origin
                </div>
                <p className="self-stretch text-slate-900 text-sm leading-5">
                  Begin with scientific research, ensuring ideas are grounded in
                  recent innovations and cutting-edge findings.
                </p>
              </div>

              <div className="gap-[25px] p-6 bg-white rounded-2xl border border-solid border-[#eaeaea] flex flex-col items-start relative flex-1 self-stretch grow">
                <div className="w-fit font-semibold text-black text-lg leading-5 whitespace-nowrap">
                  Built-in validation
                </div>
                <p className="self-stretch text-slate-900 text-sm leading-5">
                  Use live voting mechanisms to community-validate relevance,
                  demand, and supply before investment.
                </p>
              </div>
            </div>

            <div className="items-start gap-[25px] p-6 self-stretch w-full bg-white rounded-2xl border border-solid border-[#eaeaea] flex flex-col relative">
              <div className="w-fit font-semibold text-black text-lg leading-5 whitespace-nowrap">
                Shorter time to value
              </div>
              <p className="w-[278px] text-slate-900 text-sm leading-5">
                Allow fast, peer-to-peer matching of needs and providers,
                leading directly to automated smart contract creation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="inline-flex flex-col items-start gap-20 relative">
      <div className="flex w-[1340px] h-[207px] items-end gap-5 relative">
        <p className="relative w-[660px] font-normal text-[#020817] text-[50px] tracking-[-0.90px] leading-[normal]">
          <span className="text-slate-50 tracking-[-0.45px]">Why </span>
          <span className="font-dynalight text-slate-50 text-[80px] tracking-[-0.72px]">
            smartjects
          </span>
          <span className="text-slate-50 tracking-[-0.45px]">
            {" "}
            are <br />
            better than startups
          </span>
        </p>
        <div className="flex flex-col max-w-screen-md items-start relative flex-1 grow">
          <p className="relative w-[593px] text-white text-lg leading-7">
            Startups cannot keep up with the pace of innovation. Technologies
            quickly become obsolete, and most startups lose their reason for
            existence.
          </p>
        </div>
      </div>

      <div className="flex w-[1340px] items-start gap-5 relative flex-[0_0_auto]">
        {/* Startups - левая сторона */}
        <div className="flex flex-col items-start justify-center gap-8 p-4 relative flex-1 self-stretch grow bg-[#ffffff0d] rounded-[20px] shadow-100">
          <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
            <div className="w-[50px] h-[50px] flex items-center justify-center bg-[#ff6b00] rounded-2xl">
              <span className="text-black font-thin text-6xl">-</span>
            </div>
            <div className="w-fit font-semibold text-slate-50 text-lg leading-5 whitespace-nowrap">
              Startups
            </div>
          </div>

          <div className="gap-3 w-full flex flex-col items-start relative flex-1 self-stretch grow">
            {/* Контейнер с двумя блоками в строку и gap между ними */}
            <div className="flex gap-6 p-6 w-full h-[173px] bg-[#ffffff0d] rounded-2xl">
              <div className="flex flex-col items-start flex-1">
                <div className="w-fit font-semibold text-slate-50 text-lg leading-5 whitespace-nowrap">
                  Fundraising bottlenecks
                </div>
                <p className="text-white text-sm leading-5">
                  Require initial capital, pitching, and often months of
                  pre-revenue development.
                </p>
              </div>

              <div className="flex flex-col items-start flex-1">
                <div className="w-fit font-semibold text-slate-50 text-lg leading-5 whitespace-nowrap">
                  Legal & bureaucratic overhead
                </div>
                <p className="text-white text-sm leading-5">
                  Need incorporation, legal setup, bank accounts, and tax
                  compliance.
                </p>
              </div>
            </div>

            {/* Блок снизу на всю ширину */}
            <div className="gap-[25px] p-6 bg-[#ffffff0d] rounded-2xl flex flex-col items-start w-full">
              <div className="w-fit font-semibold text-slate-50 text-lg leading-5 whitespace-nowrap">
                High-risk, monolithic efforts
              </div>
              <p className="text-white text-sm leading-5">
                Require full-time dedication, co-founder alignment, and investor
                trust.
              </p>
            </div>
          </div>
        </div>

        {/* Smartjects Model - правая сторона */}
        <div className="flex flex-col items-start justify-center gap-8 p-4 relative flex-1 self-stretch grow bg-white rounded-[20px] shadow-100">
          <div className="inline-flex items-center gap-4 relative flex-[0_0_auto]">
            <div className="w-[50px] h-[50px] flex items-center justify-center bg-[#ffd800] rounded-2xl">
              <span className="text-black font-thin text-4xl">+</span>
            </div>
            <div className="w-fit font-semibold text-black text-lg leading-5 whitespace-nowrap">
              Smartjects Model
            </div>
          </div>

          <div className="gap-3 w-full flex flex-col items-start relative flex-1 self-stretch grow">
            <div className="flex items-start gap-3 relative self-stretch w-full">
              <div className="gap-[25px] p-6 bg-white rounded-2xl border border-solid border-[#eaeaea] flex flex-col items-start relative flex-1 self-stretch grow">
                <div className="w-fit font-semibold text-black text-lg leading-5 whitespace-nowrap">
                  No need for fundraising
                </div>
                <p className="self-stretch text-slate-900 text-sm leading-5">
                  Enable individuals and teams to monetize implementation
                  expertise immediately by responding to existing demand.
                </p>
              </div>

              <div className="gap-[25px] p-6 bg-white rounded-2xl border border-solid border-[#eaeaea] flex flex-col items-start relative flex-1 self-stretch grow">
                <div className="w-fit font-semibold text-black text-lg leading-5 whitespace-nowrap">
                  No legal entity required
                </div>
                <p className="self-stretch text-slate-900 text-sm leading-5">
                  Use smart contracts to formalize collaboration, making it
                  possible for any expert to work project-by-project without
                  overhead.
                </p>
              </div>
            </div>

            <div className="gap-[25px] p-6 bg-white rounded-2xl border border-solid border-[#eaeaea] flex flex-col items-start relative self-stretch w-full">
              <div className="w-fit font-semibold text-black text-lg leading-5 whitespace-nowrap">
                Distributed collaboration over monolithic venture
              </div>
              <p className="self-stretch text-slate-900 text-sm leading-5">
                Allow modular contributions from individuals, small teams, or
                companies who want to build without quitting their jobs or
                taking massive risks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

ComparisonSection.displayName = "ComparisonSection";

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
            <a href="/discover">Browse All Smartjects</a>
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

// Main Home component
export default function Home() {
  const { user } = useAuth();
  const { smartjects, isLoading, filters, setFilter, refetch } = useSmartjects(
    user?.id,
  );
  const [query, setQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    [],
  );
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<
    "recent" | "most-needed" | "most-provided" | "most-believed"
  >("recent");
  const [showIndustriesDropdown, setShowIndustriesDropdown] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showFunctionsDropdown, setShowFunctionsDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Refs for dropdown close handling
  const industriesRef = useRef<HTMLDivElement>(null);
  const audienceRef = useRef<HTMLDivElement>(null);
  const functionsRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

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
      setSelectedTechnologies((prev) => {
        const updated = toggleItem(prev, tech);
        const filterUpdated = toggleItem(filters.technologies || [], tech);
        setFilter("technologies", filterUpdated);
        return updated;
      });
    },
    [filters.technologies, setFilter],
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
      selectedTechnologies.length +
      selectedFunctions.length,
    [
      selectedIndustries.length,
      selectedTechnologies.length,
      selectedFunctions.length,
    ],
  );

  // Memoized clear all filters handler
  const handleClearAllFilters = useCallback(() => {
    setSelectedIndustries([]);
    setSelectedFunctions([]);
    setSelectedTechnologies([]);
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

  // Sort options
  const sortOptions = [
    { value: "recent", label: "Recent" },
    { value: "most-needed", label: "Most Needed" },
    { value: "most-provided", label: "Most Provided" },
    { value: "most-believed", label: "Most Believed" },
  ] as const;

  const handleVoted = useCallback(() => {
    refetch();
  }, [refetch]);

  const filteredSmartjects = useMemo(() => {
    if (!smartjects?.length) return [];

    const lowerQuery = debouncedQuery.toLowerCase();

    return smartjects.filter((s) => {
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

      const matchesTechnologies =
        selectedTechnologies.length === 0 ||
        selectedTechnologies.some((t) => s.technologies?.includes(t));

      if (!matchesTechnologies) return false;

      const matchesFunctions =
        selectedFunctions.length === 0 ||
        selectedFunctions.some((f) => s.businessFunctions?.includes(f));

      return matchesFunctions;
    });
  }, [
    smartjects,
    debouncedQuery,
    selectedIndustries,
    selectedTechnologies,
    selectedFunctions,
    totalFiltersCount,
  ]);

  const categorizedSmartjects = useMemo(() => {
    if (!filteredSmartjects.length) {
      return {
        recent: [],
        mostNeeded: [],
        mostProvided: [],
        mostBelieved: [],
      };
    }

    const sortAndLimit = (arr: any[], sortFn: (a: any, b: any) => number) => {
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

  const handleVote = useCallback(() => {
    refetch();
  }, [refetch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        industriesRef.current &&
        !industriesRef.current.contains(event.target as Node)
      ) {
        setShowIndustriesDropdown(false);
      }
      if (
        audienceRef.current &&
        !audienceRef.current.contains(event.target as Node)
      ) {
        setShowAudienceDropdown(false);
      }
      if (
        functionsRef.current &&
        !functionsRef.current.contains(event.target as Node)
      ) {
        setShowFunctionsDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <HeroSection />

      <div className="bg-white">
        <div className="container mx-auto px-4 py-16">
          <HowItWorksSection />
        </div>

        <div className="container mx-auto px-4">
          <CompanyLogos />
        </div>

        <div className="pb-16 w-full">
          <ComparisonSection />
        </div>

        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-start gap-[50px] relative border border-solid border-transparent mb-2">
              <div className="flex flex-col items-start gap-[50px] relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex items-center justify-center gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex flex-col items-start gap-2 relative flex-1 grow">
                    <div className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]">
                      <div className="relative w-fit mt-[-1.00px] text-4xl font-bold text-gray-900 whitespace-nowrap">
                        Discover smartjects
                      </div>
                    </div>
                    <div className="inline-flex items-center justify-center gap-2.5 pl-0.5 pr-0 py-0 relative flex-[0_0_auto]">
                      <p className="relative max-w-7xl mt-[-1.00px] text-base font-normal text-gray-600">
                        Explore all available AI implementation projects
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full items-start gap-3 relative flex-[0_0_auto] mb-12">
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
                            <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-48 max-h-60 overflow-y-auto">
                              {filters.industries?.map((industry) => (
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
                                  }}
                                >
                                  {industry}
                                </div>
                              ))}
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
                              Audience
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </div>
                          {showAudienceDropdown && (
                            <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-48 max-h-60 overflow-y-auto">
                              {filters.technologies?.map((tech) => (
                                <div
                                  key={tech}
                                  className={`px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${
                                    selectedTechnologies.includes(tech)
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-700"
                                  }`}
                                  onClick={() => {
                                    handleToggleTechnology(tech);
                                    setShowAudienceDropdown(false);
                                  }}
                                >
                                  {tech}
                                </div>
                              ))}
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
                            <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-48 max-h-60 overflow-y-auto">
                              {filters.businessFunctions?.map((func) => (
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
                                  }}
                                >
                                  {func}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

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
                </div>
              </div>
            </div>

            <Tabs
              value={sortBy}
              onValueChange={(value) => setSortBy(value as typeof sortBy)}
            >
              <TabsContent value="recent" className="space-y-4">
                <SmartjectsGrid
                  smartjects={
                    sortBy === "recent"
                      ? categorizedSmartjects.recent
                      : sortBy === "most-needed"
                        ? categorizedSmartjects.mostNeeded
                        : sortBy === "most-provided"
                          ? categorizedSmartjects.mostProvided
                          : categorizedSmartjects.mostBelieved
                  }
                  isLoading={isLoading}
                  onVoted={handleVote}
                  emptyMessage={`No ${sortBy === "recent" ? "recent " : ""}smartjects found matching your criteria.`}
                />
                <div className="flex justify-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 text-base font-normal rounded-lg"
                    asChild
                  >
                    <a href="/discover">View More</a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="most-needed" className="space-y-4">
                <SmartjectsGrid
                  smartjects={
                    sortBy === "recent"
                      ? categorizedSmartjects.recent
                      : sortBy === "most-needed"
                        ? categorizedSmartjects.mostNeeded
                        : sortBy === "most-provided"
                          ? categorizedSmartjects.mostProvided
                          : categorizedSmartjects.mostBelieved
                  }
                  isLoading={isLoading}
                  onVoted={handleVote}
                  emptyMessage={`No ${sortBy === "recent" ? "recent " : ""}smartjects found matching your criteria.`}
                />
                <div className="flex justify-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 text-base font-normal rounded-lg"
                    asChild
                  >
                    <a href="/discover">View More</a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="most-provided" className="space-y-4">
                <SmartjectsGrid
                  smartjects={
                    sortBy === "recent"
                      ? categorizedSmartjects.recent
                      : sortBy === "most-needed"
                        ? categorizedSmartjects.mostNeeded
                        : sortBy === "most-provided"
                          ? categorizedSmartjects.mostProvided
                          : categorizedSmartjects.mostBelieved
                  }
                  isLoading={isLoading}
                  onVoted={handleVote}
                  emptyMessage={`No ${sortBy === "recent" ? "recent " : ""}smartjects found matching your criteria.`}
                />
                <div className="flex justify-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 text-base font-normal rounded-lg"
                    asChild
                  >
                    <a href="/discover">View More</a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="most-believed" className="space-y-4">
                <SmartjectsGrid
                  smartjects={
                    sortBy === "recent"
                      ? categorizedSmartjects.recent
                      : sortBy === "most-needed"
                        ? categorizedSmartjects.mostNeeded
                        : sortBy === "most-provided"
                          ? categorizedSmartjects.mostProvided
                          : categorizedSmartjects.mostBelieved
                  }
                  isLoading={isLoading}
                  onVoted={handleVote}
                  emptyMessage={`No ${sortBy === "recent" ? "recent " : ""}smartjects found matching your criteria.`}
                />
                <div className="flex justify-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-2 text-base font-normal rounded-lg"
                    asChild
                  >
                    <a href="/discover">View More</a>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <NewsletterSignup />
        </div>
      </div>
    </>
  );
}
