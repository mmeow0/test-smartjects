"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SmartjectCard } from "@/components/smartject-card";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
} from "lucide-react";
import { useUserSmartjects } from "@/hooks/use-user-smartjects";
import { Skeleton } from "@/components/ui/skeleton";
import { proposalService } from "@/lib/services";
import { ProposalType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Update the dashboard page to include proposals, matches, and contracts
export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const { smartjects, isLoading, refetch } = useUserSmartjects(user?.id);

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [proposals, setProposals] = useState<ProposalType[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else {
      setLoading(false);
    }

    const fetchProposals = async () => {
      if (!isAuthenticated || user?.accountType !== "paid") return;

      try {
        const allProposals = await proposalService.getProposalsByUserId(
          user.id
        );

        setProposals(allProposals);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load proposals",
          variant: "destructive",
        });
        console.error("Error fetching proposals:", error);
      }
    };

    fetchProposals();
  }, [isAuthenticated, router]);

  if (!isAuthenticated || loading) {
    return null;
  }

  // In a real app, we would fetch the user's smartjects from an API
  const believedSmartjects = smartjects.believe;
  const needSmartjects = user?.accountType === "paid" ? smartjects.need : [];
  const provideSmartjects =
    user?.accountType === "paid" ? smartjects.provide : [];

  // Mock data for matches
  const recentMatches = [
    {
      id: "match-1",
      smartjectTitle: "AI-Powered Supply Chain Optimization",
      status: "new",
      matchedDate: "2023-12-05",
      proposals: 3,
      type: "need",
      // Added proposal IDs for direct navigation
      proposalIds: ["proposal-1", "proposal-2", "proposal-3"],
    },
    {
      id: "match-3",
      smartjectTitle: "Automated Customer Support Chatbot",
      status: "contract_ready",
      matchedDate: "2023-11-28",
      proposals: 1,
      type: "provide",
      // Added proposal IDs for direct navigation
      proposalIds: ["proposal-4"],
    },
  ];

  // Mock data for contracts
  const activeContracts = [
    {
      id: "contract-1",
      smartjectTitle: "Automated Customer Support Chatbot",
      otherParty: "Global Retail Corp",
      role: "provider",
      status: "active",
      nextMilestone: "Midpoint Delivery",
      nextMilestoneDate: "2024-01-15",
      budget: 14000,
    },
    {
      id: "contract-2",
      smartjectTitle: "AI-Powered Supply Chain Optimization",
      otherParty: "Tech Solutions Inc.",
      role: "needer",
      status: "pending_start",
      nextMilestone: "Project Kickoff",
      nextMilestoneDate: "2024-01-15",
      budget: 17500,
    },
  ];

  const getStatusBadge = (status: string, type: string) => {
    switch (status) {
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
      case "new":
        return <Badge className="bg-blue-100 text-blue-800">New Match</Badge>;
      case "contract_ready":
        return (
          <Badge className="bg-green-100 text-green-800">Contract Ready</Badge>
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
  };

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Believed Smartjects</CardTitle>
            <CardDescription>
              Smartjects you've shown interest in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {believedSmartjects.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">I Need</CardTitle>
            <CardDescription>
              Smartjects you're looking to implement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{needSmartjects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">I Provide</CardTitle>
            <CardDescription>Smartjects you can implement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{provideSmartjects.length}</div>
          </CardContent>
        </Card>
      </div>

      {user?.accountType === "paid" && (
        <>
          {/* Proposals Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Proposals</h2>
              <Button
                variant="outline"
                onClick={() => router.push("/proposals")}
                className="flex items-center"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {proposals.map((proposal) => (
                <Card
                  key={proposal.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/proposals/${proposal.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {proposal.title}
                        </CardTitle>
                        <CardDescription>
                          {proposal.updatedAt
                            ? ` Last updated on 
                          ${new Date(proposal.updatedAt).toLocaleDateString()} • `
                            : ""}
                          {proposal.type === "need" ? "I Need" : "I Provide"}
                        </CardDescription>
                      </div>
                      {getStatusBadge(proposal.status, proposal.type)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-medium">
                        ${proposal.budget?.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {proposals.length === 0 && (
                <Card className="col-span-2">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You haven't created any proposals yet.
                    </p>
                    <Button onClick={() => router.push("/proposals/create")}>
                      Create Your First Proposal
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Matches Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recent Matches</h2>
              <Button
                variant="outline"
                onClick={() => router.push("/matches")}
                className="flex items-center"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentMatches.map((match) => (
                <Card
                  key={match.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {match.smartjectTitle}
                        </CardTitle>
                        <CardDescription>
                          Matched on{" "}
                          {new Date(match.matchedDate).toLocaleDateString()} •{" "}
                          {match.type === "need" ? "I Need" : "I Provide"}
                        </CardDescription>
                      </div>
                      {getStatusBadge(match.status, match.type)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-medium">
                        {match.proposals}{" "}
                        {match.proposals === 1 ? "proposal" : "proposals"}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    {match.status === "contract_ready" ? (
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() =>
                          router.push(
                            `/matches/${match.id}/contract/${match.proposalIds[0]}`
                          )
                        }
                      >
                        View Contract
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            router.push(`/proposals/${match.proposalIds[0]}`)
                          }
                        >
                          View Proposal
                        </Button>
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={() =>
                            router.push(
                              `/matches/${match.id}/negotiate/${match.proposalIds[0]}`
                            )
                          }
                        >
                          Negotiate
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
              {recentMatches.length === 0 && (
                <Card className="col-span-2">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You don't have any matches yet.
                    </p>
                    <Button onClick={() => router.push("/smartjects/hub")}>
                      Browse Smartjects
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
                onClick={() => router.push("/contracts")}
                className="flex items-center"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeContracts.map((contract) => (
                <Card
                  key={contract.id}
                  className="hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/contracts/${contract.id}`)}
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
                      {getStatusBadge(contract.status, "")}
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
                          Due:{" "}
                          {new Date(
                            contract.nextMilestoneDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" /> Budget
                        </p>
                        <p className="font-medium">
                          ${contract.budget.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {activeContracts.length === 0 && (
                <Card className="col-span-2">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You don't have any active contracts yet.
                    </p>
                    <Button onClick={() => router.push("/matches")}>
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
          ) : believedSmartjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {believedSmartjects.map((smartject) => (
                <SmartjectCard
                  key={smartject.id}
                  smartject={smartject}
                  onVoted={refetch}
                  userVotes={smartject.userVotes}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              message="You haven’t believed in any Smartjects yet."
              href="/hub"
              buttonText="Browse Smartjects"
            />
          )}
        </TabsContent>

        <TabsContent value="need" className="space-y-4">
          {isLoading ? (
            <SkeletonGrid />
          ) : user?.accountType === "paid" ? (
            needSmartjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {needSmartjects.map((smartject) => (
                  <SmartjectCard
                    key={smartject.id}
                    smartject={smartject}
                    onVoted={refetch}
                    userVotes={smartject.userVotes}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                message="You haven't indicated need for any smartjects yet."
                href="/explore"
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
            provideSmartjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {provideSmartjects.map((smartject) => (
                  <SmartjectCard
                    key={smartject.id}
                    smartject={smartject}
                    onVoted={refetch}
                    userVotes={smartject.userVotes}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                message="You haven't indicated ability to provide any smartjects yet."
                href="/explore"
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

const SkeletonGrid = () => (
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
);

const EmptyState = ({
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
);
