"use client";

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
import { SmartjectCard } from "@/components/smartject-card";
import { HeroSection } from "@/components/hero-section";
import { SearchBar } from "@/components/search-bar";
import { CompanyLogos } from "@/components/company-logos";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/auth-provider";
import { useSmartjects } from "@/hooks/use-smartjects";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const { smartjects, isLoading, filters, setFilter, refetch } = useSmartjects(
    user?.id
  );

  const [query, setQuery] = useState("");

  const filteredSmartjects = smartjects.filter((s) => {
    const matchesQuery =
      s.title?.toLowerCase().includes(query.toLowerCase()) ||
      s.mission?.toLowerCase().includes(query.toLowerCase()) ||
      s.problematics?.toLowerCase().includes(query.toLowerCase()) ||
      s.scope?.toLowerCase().includes(query.toLowerCase());

    return matchesQuery;
  });

  // Sort smartjects for different tabs
  const recentSmartjects = [...filteredSmartjects]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);

  const mostNeededSmartjects = [...smartjects]
    .sort((a, b) => b.votes.need - a.votes.need)
    .slice(0, 6);

  const mostProvidedSmartjects = [...smartjects]
    .sort((a, b) => b.votes.provide - a.votes.provide)
    .slice(0, 6);

  const mostBelievedSmartjects = [...smartjects]
    .sort((a, b) => b.votes.believe - a.votes.believe)
    .slice(0, 6);

  return (
    <div className="container mx-auto px-4 py-6">
      <HeroSection />

      <Card className="my-12">
        <CardHeader>
          <CardTitle>How Smartjects Works</CardTitle>
          <CardDescription>
            From research to implementation in three simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover</h3>
              <p className="text-muted-foreground">
                Browse research data transformed into potential implementation
                projects for business
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-muted-foreground">
                Participate in discussions, vote on smartjects, find partners,
                and help shape the future of innovations in business
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Execute</h3>
              <p className="text-muted-foreground">
                Create proposals, negotiate and agree with smart contracts
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size="lg">Learn More</Button>
        </CardFooter>
      </Card>

      <CompanyLogos />

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

      <div className="my-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Discover Smartjects</h2>
          <SearchBar onChange={setQuery} />
        </div>

        <Tabs defaultValue="recent">
          <TabsList className="mb-6">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="most-needed">Most Needed</TabsTrigger>
            <TabsTrigger value="most-provided">Most Provided</TabsTrigger>
            <TabsTrigger value="most-believed">Most Believed</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="h-[400px]">
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
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentSmartjects.map((smartject) => (
                  <SmartjectCard
                    key={smartject.id}
                    smartject={smartject}
                    onVoted={refetch}
                    userVotes={smartject.userVotes}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <a href="/discover">View More Smartjects</a>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="most-needed" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="h-[400px]">
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
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mostNeededSmartjects.map((smartject) => (
                  <SmartjectCard
                    key={smartject.id}
                    smartject={smartject}
                    onVoted={refetch}
                    userVotes={smartject.userVotes}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <a href="/discover">View More Smartjects</a>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="most-provided" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="h-[400px]">
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
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mostProvidedSmartjects.map((smartject) => (
                  <SmartjectCard
                    key={smartject.id}
                    smartject={smartject}
                    onVoted={refetch}
                    userVotes={smartject.userVotes}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <a href="/discover">View More Smartjects</a>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="most-believed" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="h-[400px]">
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
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mostBelievedSmartjects.map((smartject) => (
                  <SmartjectCard
                    key={smartject.id}
                    smartject={smartject}
                    onVoted={refetch}
                    userVotes={smartject.userVotes}
                  />
                ))}
              </div>
            )}
            <div className="flex justify-center mt-8">
              <Button variant="outline" size="lg" asChild>
                <a href="/discover">View More Smartjects</a>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>



      <NewsletterSignup />
    </div>
  );
}
