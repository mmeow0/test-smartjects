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
const SmartjectCard = dynamic(() => import("@/components/smartject-card").then(mod => ({ default: mod.SmartjectCard })), {
  loading: () => <CardSkeleton />,
  ssr: false
});

// Memoized skeleton component
const CardSkeleton = memo(() => (
  <Card className="h-[400px]">
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

// Memoized skeleton grid
const SkeletonGrid = memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array(6).fill(0).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
));

SkeletonGrid.displayName = "SkeletonGrid";

// Memoized How Smartjects Works section
const HowItWorksSection = memo(() => (
  <section className="text-center">
    <div className="max-w-3xl mx-auto mb-16">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        How Smartjects Works
      </h2>
      <p className="text-xl text-gray-600 leading-relaxed">
        From research to implementation in three simple steps
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
      <div className="relative">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
            <span className="text-white font-bold text-2xl">1</span>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Discover</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Browse research data transformed into potential implementation
            projects for business
          </p>
        </div>
        {/* Connection line */}
        <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -translate-x-1/2"></div>
      </div>
      
      <div className="relative">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-6 shadow-lg">
            <span className="text-white font-bold text-2xl">2</span>
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Connect</h3>
          <p className="text-gray-600 text-lg leading-relaxed">
            Participate in discussions, vote on smartjects, find partners,
            and help shape the future of innovations in business
          </p>
        </div>
        {/* Connection line */}
        <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -translate-x-1/2"></div>
      </div>
      
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-700 to-blue-800 flex items-center justify-center mb-6 shadow-lg">
          <span className="text-white font-bold text-2xl">3</span>
        </div>
        <h3 className="text-2xl font-bold mb-4 text-gray-900">Execute</h3>
        <p className="text-gray-600 text-lg leading-relaxed">
          Create proposals, negotiate and agree with smart contracts
        </p>
      </div>
    </div>
    
    <div className="mt-16">
      <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg">
        Learn More
      </Button>
    </div>
  </section>
));

HowItWorksSection.displayName = "HowItWorksSection";

// Memoized comparison section
const ComparisonSection = memo(() => (
  <section className="my-32 px-4 max-w-7xl mx-auto">
    {/* Title */}
    <div className="text-center mb-20 max-w-4xl mx-auto px-2 sm:px-0">
      <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
        Why <span className="text-primary">Smartjects</span> are better than traditional implementation projects
      </h2>
      <p className="text-muted-foreground text-base sm:text-xl mt-6 max-w-3xl mx-auto">
        Traditional corporate project implementation process is not geared toward innovations. Gathering requirements, writing technical specifications, tendering, and procurement do not take into account the rapid emergence of new technologies, so project results are often mediocre and uncompetitive.
      </p>
    </div>

    {/* Comparison Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 px-2 sm:px-0">
      {/* Traditional Projects */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-primary">🧱 Traditional Implementation Projects</h3>
        <div className="space-y-6 text-sm text-muted-foreground">
          <div className="bg-muted/50 p-4 rounded-xl border-l-4 border-destructive h-auto md:h-24">
            <p className="font-semibold text-destructive">🚫 Not Built for Innovation</p>
            <p>
              Often start from internal assumptions or top-down mandates, leading to weak business cases.
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-xl border-l-4 border-destructive h-auto md:h-24">
            <p className="font-semibold text-destructive">❌ Weak Business Cases</p>
            <p>
              Validation happens late—if at all—after pilot stages or through costly market studies.
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-xl border-l-4 border-destructive h-auto md:h-24">
            <p className="font-semibold text-destructive">🐢 Late or No Validation</p>
            <p>
              Require long lead times, RFP processes, and vendor evaluations.
            </p>
          </div>
        </div>
      </div>

      {/* Smartjects Approach */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-green-600">🚀 Smartjects Approach</h3>
        <div className="space-y-6 text-sm text-muted-foreground">
          <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500 h-auto md:h-24">
            <p className="font-semibold text-green-700">🔬 Immediate relevance through research-driven origin</p>
            <p>
              Begin with <b>scientific research</b>, ensuring ideas are grounded in recent innovations and cutting-edge findings.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500 h-auto md:h-24">
            <p className="font-semibold text-green-700">📊 Market validation is built-In</p>
            <p>
              Use live voting mechanisms to community-validate relevance, demand, and supply before investment.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500 h-auto md:h-24">
            <p className="font-semibold text-green-700">⚡ Shorter time to value</p>
            <p>
              Allow fast, peer-to-peer matching of needs and providers, leading directly to automated smart contract creation.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Second Title */}
    <div className="text-center mb-20 max-w-4xl mx-auto my-28 px-2 sm:px-0">
      <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
        Why <span className="text-primary">Smartjects</span> are better than startups
      </h2>
      <p className="text-muted-foreground text-base sm:text-xl mt-6 max-w-3xl mx-auto">
        Startups cannot keep up with the pace of innovation. Technologies quickly become obsolete, and most startups lose their reason for existence.
      </p>
    </div>

    {/* Second Comparison Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 px-2 sm:px-0">
      {/* Startups */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-red-500">🔥 Startups</h3>
        <div className="space-y-6 text-sm text-muted-foreground">
          <div className="bg-muted/50 p-4 rounded-xl border-l-4 border-red-400 h-auto md:h-24">
            <p className="font-semibold text-red-600">💸 Fundraising Bottlenecks</p>
            <p>
              Require initial capital, pitching, and often months of pre-revenue development.
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-xl border-l-4 border-red-400 h-auto md:h-24">
            <p className="font-semibold text-red-600">🏛️ Legal & Bureaucratic Overhead</p>
            <p>
              Need incorporation, legal setup, bank accounts, and tax compliance.
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-xl border-l-4 border-red-400 h-auto md:h-24">
            <p className="font-semibold text-red-600">🎢 High-Risk, Monolithic Efforts</p>
            <p>
              Require full-time dedication, co-founder alignment, and investor trust.
            </p>
          </div>
        </div>
      </div>

      {/* Smartjects Model */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-green-600">🌐 Smartjects Model</h3>
        <div className="space-y-6 text-sm text-muted-foreground">
          <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500 h-auto md:h-24">
            <p className="font-semibold text-green-700">💰 No need for fundraising</p>
            <p>
              Enable individuals and teams to monetize implementation expertise immediately by responding to existing demand.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500 h-auto md:h-24">
            <p className="font-semibold text-green-700">⚖️ No legal entity require</p>
            <p>
              Use smart contracts to formalize collaboration, making it possible for any expert to work project-by-project without overhead.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500 h-auto md:h-24">
            <p className="font-semibold text-green-700">🧩 Distributed collaboration over monolithic venture</p>
            <p>
              Allow modular contributions from individuals, small teams, or companies who want to build without quitting their jobs or taking massive risks.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
));

ComparisonSection.displayName = "ComparisonSection";

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
});

SmartjectsGrid.displayName = "SmartjectsGrid";

// Main Home component
export default function Home() {
  const { user } = useAuth();
  const { smartjects, isLoading, filters, setFilter, refetch } = useSmartjects(user?.id);
  const [query, setQuery] = useState("");
  
  // Debounce search query for better performance
  const debouncedQuery = useDebounce(query, 300);

  // Memoized search change handler
  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  // Memoized filtered smartjects with optimized filtering logic
  const filteredSmartjects = useMemo(() => {
    if (!smartjects?.length) return [];
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

  // Memoized sorted arrays for different tabs with limit of 6 items
  const sortedSmartjects = useMemo(() => {
    if (!filteredSmartjects?.length) {
      return {
        recent: [],
        mostNeeded: [],
        mostProvided: [],
        mostBelieved: []
      };
    }

    // For performance, we limit the sorting to what we need (6 items)
    const sortAndLimit = (array: any[], sortFn: (a: any, b: any) => number) => {
      return [...array].sort(sortFn).slice(0, 6);
    };

    return {
      recent: sortAndLimit(filteredSmartjects, 
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      mostNeeded: sortAndLimit(smartjects, // Use all smartjects for global ranking
        (a, b) => (b.votes?.need || 0) - (a.votes?.need || 0)
      ),
      mostProvided: sortAndLimit(smartjects, // Use all smartjects for global ranking
        (a, b) => (b.votes?.provide || 0) - (a.votes?.provide || 0)
      ),
      mostBelieved: sortAndLimit(smartjects, // Use all smartjects for global ranking
        (a, b) => (b.votes?.believe || 0) - (a.votes?.believe || 0)
      )
    };
  }, [filteredSmartjects, smartjects]);

  // Memoized refetch callback
  const memoizedRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <>
      <HeroSection />
      
      <div className="bg-white">
        <div className="container mx-auto px-4 py-16">
          <HowItWorksSection />
        </div>
        
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <CompanyLogos />
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-16">
          <ComparisonSection />
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Discover Smartjects
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Explore cutting-edge research projects ready for business implementation
              </p>
              <div className="max-w-md mx-auto">
                <SearchBar onChange={handleSearchChange} />
              </div>
            </div>

            <Tabs defaultValue="recent">
              <TabsList className="mb-12 bg-white shadow-sm border-0 p-1 rounded-lg">
                <TabsTrigger value="recent" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6 py-3 font-semibold">Recent</TabsTrigger>
                <TabsTrigger value="most-needed" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6 py-3 font-semibold">Most Needed</TabsTrigger>
                <TabsTrigger value="most-provided" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6 py-3 font-semibold">Most Provided</TabsTrigger>
                <TabsTrigger value="most-believed" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6 py-3 font-semibold">Most Believed</TabsTrigger>
              </TabsList>

              <TabsContent value="recent" className="space-y-4">
                <SmartjectsGrid
                  smartjects={sortedSmartjects.recent}
                  isLoading={isLoading}
                  onVoted={memoizedRefetch}
                  emptyMessage="No recent smartjects found matching your criteria."
                />
                <div className="flex justify-center mt-12">
                  <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg" asChild>
                    <a href="/discover">View More Smartjects</a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="most-needed" className="space-y-4">
                <SmartjectsGrid
                  smartjects={sortedSmartjects.mostNeeded}
                  isLoading={isLoading}
                  onVoted={memoizedRefetch}
                  emptyMessage="No smartjects found matching your criteria."
                />
                <div className="flex justify-center mt-12">
                  <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg" asChild>
                    <a href="/discover">View More Smartjects</a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="most-provided" className="space-y-4">
                <SmartjectsGrid
                  smartjects={sortedSmartjects.mostProvided}
                  isLoading={isLoading}
                  onVoted={memoizedRefetch}
                  emptyMessage="No smartjects found matching your criteria."
                />
                <div className="flex justify-center mt-12">
                  <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg" asChild>
                    <a href="/discover">View More Smartjects</a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="most-believed" className="space-y-4">
                <SmartjectsGrid
                  smartjects={sortedSmartjects.mostBelieved}
                  isLoading={isLoading}
                  onVoted={memoizedRefetch}
                  emptyMessage="No smartjects found matching your criteria."
                />
                <div className="flex justify-center mt-12">
                  <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg" asChild>
                    <a href="/discover">View More Smartjects</a>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <NewsletterSignup />
          </div>
        </div>
      </div>
    </>
  );
}