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
  negotiationService,
  proposalService,
} from "@/lib/services";
import { ContractListType, ProposalType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserConversation {
  id: string;
  otherParty: {
    id: string;
    name: string;
    avatar: string;
  };
  totalMessages: number;
  lastActivity: string;
  activeNegotiations: {
    matchId: string;
    proposalId: string;
    smartjectId: string;
    smartjectTitle: string;
    budget: string;
    timeline: string;
    messageCount: number;
    isProposalOwner: boolean;
    status?: string;
  }[];
  status: "active" | "pending" | "completed" | "contract_created" | "cancelled";
}

// Update the dashboard page to include proposals, matches, and contracts
export default function DashboardPage() {
  const router = useRouter();
  const { isLoading: authLoading, user, canAccess } = useRequireAuth();

  const { smartjects, isLoading, refetch } = useUserSmartjects(user?.id);

  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [proposals, setProposals] = useState<ProposalType[]>([]);
  const [activeContracts, setActiveContracts] = useState<ContractListType[]>(
    []
  );
  const [negitations, setActiveNegotiations] = useState<UserConversation[]>([]);

  const getUserNegotiations = async () => {
    const userId = user?.id;
    if (!userId) return;

    const supabase = getSupabaseBrowserClient();

    try {
      // 1. Получаем все пропозалы, где пользователь — владелец
      const { data: ownedProposals, error: ownedProposalsError } =
        await supabase
          .from("proposals")
          .select("id, user_id, smartject_id, title, budget, timeline")
          .eq("user_id", userId);

      if (ownedProposalsError) {
        console.error("Error fetching owned proposals:", ownedProposalsError);
        return [];
      }

      // 2. Получаем все сообщения, отправленные этим пользователем
      const { data: sentMessages, error: sentMessagesError } = await supabase
        .from("negotiation_messages")
        .select("proposal_id, sender_id, created_at")
        .eq("sender_id", userId);

      if (sentMessagesError) {
        console.error("Error fetching sent messages:", sentMessagesError);
        return [];
      }

      // 3. Получаем все сообщения, адресованные пользователю (по owned proposals)
      const { data: receivedMessages, error: receivedMessagesError } =
        await supabase
          .from("negotiation_messages")
          .select("proposal_id, sender_id, created_at")
          .in(
            "proposal_id",
            ownedProposals.map((p) => p.id)
          );

      if (receivedMessagesError) {
        console.error(
          "Error fetching received messages:",
          receivedMessagesError
        );
        return [];
      }

      // 4. Объединяем все сообщения, где участвует пользователь
      const allMessages = [...sentMessages, ...receivedMessages];

      // 5. Группируем по proposal_id
      const uniqueProposalIds = [
        ...new Set(allMessages.map((msg) => msg.proposal_id)),
      ];

      const userConversations: { [conversationId: string]: UserConversation } =
        {};

      for (const proposalId of uniqueProposalIds) {
        // Получаем пропозал
        const { data: proposal, error: proposalError } = await supabase
          .from("proposals")
          .select("id, user_id, smartject_id, title, budget, timeline")
          .eq("id", proposalId)
          .single();

        if (proposalError || !proposal) continue;

        const isProposalOwner = proposal.user_id === userId;

        // Получаем все сообщения по пропозалу
        const { data: proposalMessages } = await supabase
          .from("negotiation_messages")
          .select("id, proposal_id, sender_id, created_at")
          .eq("proposal_id", proposalId);

        if (!proposalMessages || proposalMessages.length === 0) continue;

        // Находим ID второй стороны
        const otherPartyMessage = proposalMessages.find(
          (msg) => msg.sender_id !== userId
        );
        const otherPartyId = isProposalOwner
          ? otherPartyMessage?.sender_id
          : proposal.user_id;

        if (!otherPartyId) continue;

        // Определяем provider и needer
        const providerId = proposal.user_id; // Тот кто создал proposal всегда provider
        const neederId = isProposalOwner ? otherPartyId : userId;

        console.log(
          `Looking for match with smartject_id: ${proposal.smartject_id}, provider: ${providerId}, needer: ${neederId}`
        );

        // Получаем или создаем match по smartject_id, provider_id и needer_id
        let matchId = null;

        // Сначала пытаемся найти существующий match
        const { data: existingMatch, error: matchError } = await supabase
          .from("matches")
          .select("id, status")
          .eq("smartject_id", proposal.smartject_id)
          .eq("provider_id", providerId)
          .eq("needer_id", neederId)
          .maybeSingle();

        if (matchError) {
          console.error("Error looking up match:", matchError);
          continue; // Пропускаем этот proposal если не можем найти match
        }

        if (existingMatch) {
          matchId = existingMatch.id;
          console.log(
            `Found existing match: ${matchId} for smartject: ${proposal.smartject_id} between provider: ${providerId} and needer: ${neederId}`
          );
        } else {
          console.log(
            `No existing match found for smartject: ${proposal.smartject_id} between provider: ${providerId} and needer: ${neederId}, creating new match...`
          );

          // Если match не найден, создаем новый
          const { data: newMatch, error: createError } = await supabase
            .from("matches")
            .insert({
              smartject_id: proposal.smartject_id,
              provider_id: providerId,
              needer_id: neederId,
              status: "new",
            })
            .select("id")
            .single();

          if (newMatch && !createError) {
            matchId = newMatch.id;
            console.log(
              `Created new match: ${matchId} for smartject: ${proposal.smartject_id} between provider: ${providerId} and needer: ${neederId}`
            );
          } else {
            console.error(
              `Error creating match for smartject ${proposal.smartject_id} between provider: ${providerId} and needer: ${neederId}:`,
              createError
            );
            console.error("Proposal data:", proposal);
            continue; // Пропускаем этот proposal если не можем создать match
          }
        }

        if (!matchId) {
          console.error(
            `Failed to get matchId for proposal ${proposalId} with smartject ${proposal.smartject_id} between provider: ${providerId} and needer: ${neederId}`
          );
          continue;
        }

        // Получаем данные другой стороны
        const { data: userData } = await supabase
          .from("users")
          .select("name, avatar_url")
          .eq("id", otherPartyId)
          .single();

        const otherPartyName = userData?.name || "Unknown User";
        const otherPartyAvatar = userData?.avatar_url || "";

        // Получаем smartject
        const { data: smartjectData } = await supabase
          .from("smartjects")
          .select("title")
          .eq("id", proposal.smartject_id)
          .single();

        const smartjectTitle = smartjectData?.title || "Unknown Smartject";

        const lastActivity = proposalMessages.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0].created_at;

        const conversationKey = `${proposalId}-${otherPartyId}`;

        if (!userConversations[conversationKey]) {
          userConversations[conversationKey] = {
            id: conversationKey,
            otherParty: {
              id: otherPartyId,
              name: otherPartyName,
              avatar: otherPartyAvatar,
            },
            totalMessages: 0,
            lastActivity,
            activeNegotiations: [],
            status: "active",
          };
        }

        userConversations[conversationKey].activeNegotiations.push({
          proposalId: proposal.id,
          smartjectId: proposal.smartject_id,
          matchId,
          smartjectTitle,
          budget: proposal.budget || "",
          timeline: proposal.timeline || "",
          messageCount: proposalMessages.length,
          isProposalOwner,
          status: existingMatch?.status || "new",
        });

        userConversations[conversationKey].totalMessages +=
          proposalMessages.length;
      }

      const allConversations = Object.values(userConversations);

      // Separate active and completed conversations
      const activeConversations: UserConversation[] = [];

      allConversations.forEach((conversation) => {
        const activeNegotiations = conversation.activeNegotiations.filter(
          (neg) =>
            neg.status !== "contract_created" && neg.status !== "cancelled"
        );

        if (activeNegotiations.length > 0) {
          activeConversations.push({
            ...conversation,
            activeNegotiations,
            status: "active",
          });
        }
      });

      setActiveNegotiations(
        activeConversations.sort(
          (a, b) =>
            new Date(b.lastActivity).getTime() -
            new Date(a.lastActivity).getTime()
        )
      );
    } catch (error) {
      console.error("Error in getUserNegotiations:", error);
    }
  };

  // Load dashboard data
  useEffect(() => {
    if (authLoading || !canAccess) {
      return;
    }
    
    setLoading(false);

    const fetchProposals = async () => {
      if (!user?.id) return;

      try {
        const allProposals = await proposalService.getProposalsByUserId(
          user.id
        );

        setProposals(allProposals);
      } catch (error) {
        console.error("Error fetching proposals:", error);
        toast({
          title: "Error",
          description: "Failed to load proposals",
          variant: "destructive",
        });
      }
    };

    const fetchContracts = async () => {
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
        console.error("Error fetching proposals:", error);
      }
    };

    fetchContracts();
    fetchProposals();
    getUserNegotiations();
  }, [authLoading, canAccess, user]);

  if (authLoading || !canAccess || loading) {
    return null;
  }

  // Helper function to display field value or "not specified"
  const displayField = (value: string | undefined | null) => {
    if (!value || value.trim() === "") {
      return <span className="text-muted-foreground italic">not specified</span>;
    }
    return value;
  };

  // In a real app, we would fetch the user's smartjects from an API
  const believedSmartjects = smartjects.believe;
  const needSmartjects = user?.accountType === "paid" ? smartjects.need : [];
  const provideSmartjects =
    user?.accountType === "paid" ? smartjects.provide : [];

  const getStatusBadge = (status: string) => {
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

    const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getNegotiationStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="secondary" className="text-xs">
            New
          </Badge>
        );
      case "negotiating":
        return (
          <Badge variant="default" className="text-xs">
            Negotiating
          </Badge>
        );
      case "terms_agreed":
        return (
          <Badge
            variant="outline"
            className="text-xs text-blue-600 border-blue-600"
          >
            Terms Agreed
          </Badge>
        );
      case "contract_created":
        return (
          <Badge
            variant="outline"
            className="text-xs text-green-600 border-green-600"
          >
            Contract Created
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="text-xs text-red-600 border-red-600"
          >
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        );
    }
  };

  const activeProposals = proposals.slice(0, 2);
  const contracts = activeContracts.slice(0, 2);
  const activeNegotiations = negitations.slice(0, 2);

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
              {activeProposals.map((proposal) => (
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
                          ${new Date(
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
                      <span className="font-medium">
                        {proposal.budget ? `$${proposal.budget.toLocaleString()}` : displayField(proposal.budget)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {activeProposals.length === 0 && (
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
              <h2 className="text-2xl font-bold">Recent Conversations</h2>
              <Button
                variant="outline"
                onClick={() => router.push("/matches")}
                className="flex items-center"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeNegotiations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg">
                            {conversation.otherParty.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-xl">
                            {conversation.otherParty.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Handshake className="h-4 w-4" />
                            {conversation.activeNegotiations.length} active
                            negotiation
                            {conversation.activeNegotiations.length !== 1
                              ? "s"
                              : ""}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(conversation.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Messages
                          </p>
                          <p className="font-medium">
                            {conversation.totalMessages}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Last Activity
                          </p>
                          <p className="font-medium">
                            {formatDate(conversation.lastActivity)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Handshake className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Negotiations
                          </p>
                          <p className="font-medium">
                            {conversation.activeNegotiations.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Show active negotiations for this user */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Active Projects:
                      </h4>
                      <div className="space-y-2">
                        {conversation.activeNegotiations.map((negotiation) => (
                          <div
                            key={negotiation.proposalId}
                            className="bg-muted/30 rounded-md p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium">
                                  {negotiation.smartjectTitle}
                                </h5>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <span>💰 {negotiation.budget ? `$${negotiation.budget}` : displayField(negotiation.budget)}</span>
                                  <span>⏰ {displayField(negotiation.timeline)}</span>
                                  <span>
                                    💬 {negotiation.messageCount} messages
                                  </span>
                                  {negotiation.status &&
                                    getNegotiationStatusBadge(
                                      negotiation.status
                                    )}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/matches/${negotiation.matchId}/negotiate/${negotiation.proposalId}/${conversation.otherParty.id}`
                                  )
                                }
                              >
                                Open
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button
                        onClick={() => {
                          // Navigate to the most recent negotiation
                          const mostRecent = conversation.activeNegotiations[0];
                          router.push(
                            `/matches/${mostRecent.matchId}/negotiate/${mostRecent.proposalId}/${conversation.otherParty.id}`
                          );
                        }}
                        className="ml-4"
                      >
                        Continue Conversation
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {activeNegotiations.length === 0 && (
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
              {contracts.map((contract) => (
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
                          {/* Due:{" "}
                          {new Date(
                            contract.nextMilestoneDate
                          ).toLocaleDateString()} */}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" /> Budget
                        </p>
                        <p className="font-medium">
                          {contract.budget ? `$${contract.budget.toLocaleString()}` : displayField(contract.budget)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {contracts.length === 0 && (
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
