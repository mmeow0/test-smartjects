"use client";

import { useState, useMemo, useCallback, memo, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSection } from "@/components/hero-section";
import { SearchBar } from "@/components/search-bar";
import { CompanyLogos } from "@/components/company-logos";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { useSmartjects } from "@/hooks/use-smartjects";
import { Discover } from "@/components/icons/Discover";
import { Connect } from "@/components/icons/Connect";
import { Execute } from "@/components/icons/Execute";

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
  }
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
  }
);

SmartjectsGrid.displayName = "SmartjectsGrid";

// Main Home component
export default function Home() {
  const { user } = useAuth();
  const { smartjects, isLoading, filters, setFilter, refetch } = useSmartjects(
    user?.id
  );
  const [query, setQuery] = useState("");

  // Debounce search query for better performance
  const debouncedQuery = useDebounce(query, 300);

  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleVoted = useCallback(() => {
    refetch();
  }, [refetch]);

  const filteredSmartjects = useMemo(() => {
    if (!debouncedQuery) return smartjects;

    const lowerQuery = debouncedQuery.toLowerCase();

    return smartjects.filter((s) => {
      return (
        s.title?.toLowerCase().includes(lowerQuery) ||
        s.mission?.toLowerCase().includes(lowerQuery) ||
        s.problematics?.toLowerCase().includes(lowerQuery) ||
        s.scope?.toLowerCase().includes(lowerQuery)
      );
    });
  }, [smartjects, debouncedQuery]);

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
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      mostNeeded: sortAndLimit(
        smartjects, // Use all smartjects for global ranking
        (a, b) => (b.votes?.need || 0) - (a.votes?.need || 0)
      ),
      mostProvided: sortAndLimit(
        smartjects, // Use all smartjects for global ranking
        (a, b) => (b.votes?.provide || 0) - (a.votes?.provide || 0)
      ),
      mostBelieved: sortAndLimit(
        smartjects, // Use all smartjects for global ranking
        (a, b) => (b.votes?.believe || 0) - (a.votes?.believe || 0)
      ),
    };
  }, [filteredSmartjects, smartjects]);

  const handleVote = useCallback(() => {
    refetch();
  }, [refetch]);

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
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Discover Smartjects
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Explore cutting-edge research projects ready for business
                implementation
              </p>
              <div className="max-w-md mx-auto">
                <SearchBar onChange={handleSearchChange} />
              </div>
            </div>

            <Tabs defaultValue="recent">
              <TabsList className="mb-12 bg-white shadow-sm border-0 p-1 rounded-lg">
                <TabsTrigger
                  value="recent"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6 py-3 font-semibold"
                >
                  Recent
                </TabsTrigger>
                <TabsTrigger
                  value="most-needed"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6 py-3 font-semibold"
                >
                  Most Needed
                </TabsTrigger>
                <TabsTrigger
                  value="most-provided"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6 py-3 font-semibold"
                >
                  Most Provided
                </TabsTrigger>
                <TabsTrigger
                  value="most-believed"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6 py-3 font-semibold"
                >
                  Most Believed
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-4">
                <SmartjectsGrid
                  smartjects={categorizedSmartjects.recent}
                  isLoading={isLoading}
                  onVoted={handleVote}
                  emptyMessage="No recent smartjects found matching your criteria."
                />
                <div className="flex justify-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                    asChild
                  >
                    <a href="/discover">View More Smartjects</a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="most-needed" className="space-y-4">
                <SmartjectsGrid
                  smartjects={categorizedSmartjects.mostNeeded}
                  isLoading={isLoading}
                  onVoted={handleVote}
                  emptyMessage="No smartjects found matching your criteria."
                />
                <div className="flex justify-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                    asChild
                  >
                    <a href="/discover">View More Smartjects</a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="most-provided" className="space-y-4">
                <SmartjectsGrid
                  smartjects={categorizedSmartjects.mostProvided}
                  isLoading={isLoading}
                  onVoted={handleVote}
                  emptyMessage="No smartjects found matching your criteria."
                />
                <div className="flex justify-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                    asChild
                  >
                    <a href="/discover">View More Smartjects</a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="most-believed" className="space-y-4">
                <SmartjectsGrid
                  smartjects={categorizedSmartjects.mostBelieved}
                  isLoading={isLoading}
                  onVoted={handleVote}
                  emptyMessage="No smartjects found matching your criteria."
                />
                <div className="flex justify-center mt-12">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
                    asChild
                  >
                    <a href="/discover">View More Smartjects</a>
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
