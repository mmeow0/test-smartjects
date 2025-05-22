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

      <CompanyLogos />

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
                <a href="/hub">View More Smartjects</a>
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
                <a href="/hub">View More Smartjects</a>
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
                <a href="/hub">View More Smartjects</a>
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
                <a href="/hub">View More Smartjects</a>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
                Browse AI research transformed into practical business projects
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-muted-foreground">
                Express interest with "I believe", "I need", or "I provide"
                options
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Implement</h3>
              <p className="text-muted-foreground">
                Create proposals, match with partners, and formalize with smart
                contracts
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size="lg">Learn More</Button>
        </CardFooter>
      </Card>

      <NewsletterSignup />
    </div>
  );
}
