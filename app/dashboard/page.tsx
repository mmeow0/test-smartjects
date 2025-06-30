"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/use-auth-guard";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Handshake,
  MessageSquare,
} from "lucide-react";
import { useUserSmartjects } from "@/hooks/use-user-smartjects";
import { Skeleton } from "@/components/ui/skeleton";
import {
  contractService,
  proposalService,
} from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    {Array(6)
      .fill(0)
      .map((_, i) => (
        <CardSkeleton key={i} />
      ))}
  </div>
));

SkeletonGrid.displayName = "SkeletonGrid";

// Memoized empty state component
const EmptyState = memo(
  ({
    message,
    href,
    buttonText,
  }: {
    message: string;
    href: string;
    buttonText: string;
  }) => (
    <Card className="col-span-3">
      <CardContent className="py-8 flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">{message}</p>
        <Button asChild>
          <a href={href}>{buttonText}</a>
        </Button>
      </CardContent>
    </Card>
  )
);

EmptyState.displayName = "EmptyState";

// Memoized stats card component
const StatsCard = memo(
  ({
    title,
    description,
    value,
  }: {
    title: string;
    description: string;
    value: number;
  }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
);

StatsCard.displayName = "StatsCard";

// Memoized proposal card component
const ProposalCard = memo(
  ({
    proposal,
    onNavigate,
  }: {
    proposal: any;
    onNavigate: (id: string) => void;
  }) => {
    const handleClick = useCallback(() => {
      onNavigate(proposal.id);
    }, [onNavigate, proposal.id]);

    const getStatusBadge = useCallback((status: string) => {
      switch (status) {
        case "draft":
          return (
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> Draft
            </Badge>
          );
        case "submitted":
          return (
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> Submitted
            </Badge>
          );
        case "accepted":
          return (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Accepted
            </Badge>
          );
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    }, []);

    const displayBudget = useMemo(() => {
      if (!proposal.budget)
        return (
          <span className="text-muted-foreground italic">not specified</span>
        );
      return `$${proposal.budget.toLocaleString()}`;
    }, [proposal.budget]);

    return (
      <Card
        className="hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={handleClick}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{proposal.title}</CardTitle>
              <CardDescription>
                {proposal.updatedAt
                  ? `Last updated on ${new Date(
                      proposal.updatedAt
                    ).toLocaleDateString()} • `
                  : ""}
                {proposal.type === "need" ? "I Need" : "I Provide"}
              </CardDescription>
            </div>
            {getStatusBadge(proposal.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="font-medium">{displayBudget}</span>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ProposalCard.displayName = "ProposalCard";

// Memoized contract card component
const ContractCard = memo(
  ({
    contract,
    onNavigate,
  }: {
    contract: any;
    onNavigate: (id: string) => void;
  }) => {
    const handleClick = useCallback(() => {
      onNavigate(contract.id);
    }, [onNavigate, contract.id]);

    const getStatusBadge = useCallback((status: string) => {
      switch (status) {
        case "new":
          return <Badge className="bg-blue-100 text-blue-800">New Match</Badge>;
        case "contract_ready":
          return (
            <Badge className="bg-green-100 text-green-800">
              Contract Ready
            </Badge>
          );
        case "active":
          return <Badge className="bg-green-100 text-green-800">Active</Badge>;
        case "pending_start":
          return (
            <Badge className="bg-blue-100 text-blue-800">Pending Start</Badge>
          );
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    }, []);

    const formatMilestoneDate = useCallback(
      (dateString: string | null | undefined): string => {
        if (!dateString) return "N/A";
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "Invalid Date";
          return date.toLocaleDateString();
        } catch {
          return "Invalid Date";
        }
      },
      []
    );

    const displayBudget = useMemo(() => {
      if (!contract.budget)
        return (
          <span className="text-muted-foreground italic">not specified</span>
        );
      return `$${contract.budget.toLocaleString()}`;
    }, [contract.budget]);

    return (
      <Card
        className="hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={handleClick}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {contract.smartjectTitle}
              </CardTitle>
              <CardDescription>
                Contract with {contract.otherParty} • You are the{" "}
                {contract.role}
              </CardDescription>
            </div>
            {getStatusBadge(contract.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-1" /> Next Milestone
              </p>
              <p className="font-medium">{contract.nextMilestone}</p>
              <p className="text-xs text-muted-foreground">
                Due: {formatMilestoneDate(contract.nextMilestoneDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center">
                <DollarSign className="h-4 w-4 mr-1" /> Budget
              </p>
              <p className="font-medium">{displayBudget}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

ContractCard.displayName = "ContractCard";

// Main dashboard component
export default function DashboardPage() {
  const router = useRouter();
  const { isLoading: authLoading, user, canAccess } = useRequireAuth();
  const { smartjects, isLoading, refetch } = useUserSmartjects(user?.id);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [proposals, setProposals] = useState<any[]>([]);
  const [activeContracts, setActiveContracts] = useState<any[]>([]);

  // Memoized navigation handlers
  const handleProposalNavigate = useCallback(
    (id: string) => {
      router.push(`/proposals/${id}`);
    },
    [router]
  );

  const handleContractNavigate = useCallback(
    (id: string) => {
      router.push(`/contracts/${id}`);
    },
    [router]
  );



  const handleViewAllNavigation = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  // Memoized data processing
  const processedData = useMemo(() => {
    if (!smartjects) return { believed: [], need: [], provide: [] };

    return {
      believed: smartjects.believe || [],
      need: user?.accountType === "paid" ? smartjects.need || [] : [],
      provide: user?.accountType === "paid" ? smartjects.provide || [] : [],
    };
  }, [smartjects, user?.accountType]);

  const displayedData = useMemo(
    () => ({
      activeProposals: proposals.slice(0, 2),
      contracts: activeContracts.slice(0, 2),
    }),
    [proposals, activeContracts]
  );

  // Memoized data fetching functions
  const fetchProposals = useCallback(async () => {
    if (!user?.id) return;

    try {
      const allProposals = await proposalService.getProposalsByUserId(user.id);
      setProposals(allProposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast({
        title: "Error",
        description: "Failed to load proposals",
        variant: "destructive",
      });
    }
  }, [user?.id]);

  const fetchContracts = useCallback(async () => {
    if (!user?.id) return;

    try {
      const contractsData = await contractService.getUserContracts(user.id);
      setActiveContracts(contractsData.activeContracts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contracts",
        variant: "destructive",
      });
      console.error("Error fetching contracts:", error);
    }
  }, [user?.id]);

  // Load dashboard data
  useEffect(() => {
    if (authLoading || !canAccess) return;

    setLoading(false);

    // Run all data fetching in parallel
    Promise.all([fetchContracts(), fetchProposals()]).catch(console.error);
  }, [authLoading, canAccess, fetchContracts, fetchProposals]);

  // Memoized refetch callback
  const memoizedRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  if (authLoading || !canAccess || loading) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            Track your smartjects, proposals, and contracts
          </p>
        </div>
        {user?.accountType === "free" && (
          <Button className="mt-4 md:mt-0" asChild>
            <a href="/upgrade">Upgrade to Paid Account</a>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Believed Smartjects"
          description="Smartjects you've shown interest in"
          value={processedData.believed.length}
        />
        <StatsCard
          title="I Need"
          description="Smartjects you're looking to implement"
          value={processedData.need.length}
        />
        <StatsCard
          title="I Provide"
          description="Smartjects you can implement"
          value={processedData.provide.length}
        />
      </div>

      {user?.accountType === "paid" && (
        <>
          {/* Proposals Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Proposals</h2>
              <Button
                variant="outline"
                onClick={() => handleViewAllNavigation("/proposals")}
                className="flex items-center"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedData.activeProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onNavigate={handleProposalNavigate}
                />
              ))}
              {displayedData.activeProposals.length === 0 && (
                <Card className="col-span-2">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You haven't created any proposals yet.
                    </p>
                    <Button
                      onClick={() =>
                        handleViewAllNavigation("/proposals/create")
                      }
                    >
                      Create Your First Proposal
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Contracts Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Active Contracts</h2>
              <Button
                variant="outline"
                onClick={() => handleViewAllNavigation("/contracts")}
                className="flex items-center"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedData.contracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onNavigate={handleContractNavigate}
                />
              ))}
              {displayedData.contracts.length === 0 && (
                <Card className="col-span-2">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You don't have any active contracts yet.
                    </p>
                    <Button onClick={() => handleViewAllNavigation("/matches")}>
                      View Your Matches
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      <Tabs defaultValue="believe">
        <TabsList className="mb-6">
          <TabsTrigger value="believe">I Believe</TabsTrigger>
          <TabsTrigger value="need">I Need</TabsTrigger>
          <TabsTrigger value="provide">I Provide</TabsTrigger>
        </TabsList>

        <TabsContent value="believe" className="space-y-4">
          {isLoading ? (
            <SkeletonGrid />
          ) : processedData.believed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {processedData.believed.map((smartject) => (
                <SmartjectCard
                  key={smartject.id}
                  smartject={smartject}
                  onVoted={memoizedRefetch}
                  userVotes={smartject.userVotes}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message="You haven't believed in any Smartjects yet."
              href="/discover"
              buttonText="Browse Smartjects"
            />
          )}
        </TabsContent>

        <TabsContent value="need" className="space-y-4">
          {isLoading ? (
            <SkeletonGrid />
          ) : user?.accountType === "paid" ? (
            processedData.need.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {processedData.need.map((smartject) => (
                  <SmartjectCard
                    key={smartject.id}
                    smartject={smartject}
                    onVoted={memoizedRefetch}
                    userVotes={smartject.userVotes}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                message="You haven't indicated need for any smartjects yet."
                href="/discover"
                buttonText="Explore Smartjects"
              />
            )
          ) : (
            <EmptyState
              message="Upgrade to a paid account to indicate need for smartjects."
              href="/upgrade"
              buttonText="Upgrade Now"
            />
          )}
        </TabsContent>

        <TabsContent value="provide" className="space-y-4">
          {isLoading ? (
            <SkeletonGrid />
          ) : user?.accountType === "paid" ? (
            processedData.provide.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {processedData.provide.map((smartject) => (
                  <SmartjectCard
                    key={smartject.id}
                    smartject={smartject}
                    onVoted={memoizedRefetch}
                    userVotes={smartject.userVotes}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                message="You haven't indicated ability to provide any smartjects yet."
                href="/discover"
                buttonText="Explore Smartjects"
              />
            )
          ) : (
            <EmptyState
              message="Upgrade to a paid account to indicate you can provide smartjects."
              href="/upgrade"
              buttonText="Upgrade Now"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
