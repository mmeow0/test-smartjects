"use client";

import { useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Handshake,
  Lightbulb,
  MessageSquare,
  Settings,
  Wallet,
} from "lucide-react";
import { useUserSmartjects } from "@/hooks/use-user-smartjects";
import { Skeleton } from "@/components/ui/skeleton";
import { contractService, proposalService } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { CreateProposalModal } from "@/components/create-proposal-modal";
import { ContractListType } from "@/lib/types";

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
    budget: number;
    timeline: string;
    messageCount: number;
    isProposalOwner: boolean;
    status?: string;
  }[];
  status: "active" | "pending" | "completed" | "contract_created" | "cancelled";
}

// Memoized conversation card component
const ConversationCard = memo(
  ({
    conversation,
    onNavigate,
  }: {
    conversation: UserConversation;
    onNavigate: (
      matchId: string,
      proposalId: string,
      otherPartyId: string,
    ) => void;
  }) => {
    const handleContinueConversation = useCallback(() => {
      const mostRecent = conversation.activeNegotiations[0];
      onNavigate(
        mostRecent.matchId,
        mostRecent.proposalId,
        conversation.otherParty.id,
      );
    }, [conversation, onNavigate]);

    const formatDate = useCallback((dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60),
      );

      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
      return date.toLocaleDateString();
    }, []);

    const getStatusBadge = useCallback((status: string) => {
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
    }, []);

    const displayField = useCallback((value: string | undefined | null) => {
      if (!value || value.trim() === "") {
        return (
          <span className="text-muted-foreground italic">not specified</span>
        );
      }
      return value;
    }, []);

    return (
      <Card className="hover:shadow-md transition-shadow">
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
                  <Link
                    href={`/profile/${conversation.otherParty.id}`}
                    className="hover:underline"
                  >
                    {conversation.otherParty.name}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Handshake className="h-4 w-4" />
                  {conversation.activeNegotiations.length} active negotiation
                  {conversation.activeNegotiations.length !== 1 ? "s" : ""}
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
                <p className="text-sm text-muted-foreground">Total Messages</p>
                <p className="font-medium">{conversation.totalMessages}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-sm text-muted-foreground">Last Activity</p>
                <p className="font-medium">
                  {formatDate(conversation.lastActivity)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Handshake className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Negotiations</p>
                <p className="font-medium">
                  {conversation.activeNegotiations.length}
                </p>
              </div>
            </div>
          </div>

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
                        {negotiation.budget && (
                          <span>
                            💰{" "}
                            {negotiation.budget
                              ? `$${negotiation.budget.toLocaleString()}`
                              : "Not specified"}
                          </span>
                        )}
                        {negotiation.timeline && (
                          <span>⏰ {displayField(negotiation.timeline)}</span>
                        )}
                        <span>💬 {negotiation.messageCount} messages</span>
                        {negotiation.status &&
                          getStatusBadge(negotiation.status)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onNavigate(
                          negotiation.matchId,
                          negotiation.proposalId,
                          conversation.otherParty.id,
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
            <Button onClick={handleContinueConversation} className="ml-4">
              Continue Conversation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  },
);

ConversationCard.displayName = "ConversationCard";
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
  ),
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
        <CardTitle className="text-md">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  ),
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
        className="hover:bg-muted/50 transition-colors cursor-pointer p-4 flex flex-col justify-between"
        onClick={handleClick}
      >
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-base font-semibold leading-tight text-foreground">
            {proposal.title}
          </CardTitle>
          <div className="flex gap-2 flex-col">
            {proposal.type === "provide" ? (
              <div className="flex flex-row items-center bg-sky-100 text-sky-700 px-3 py-1 rounded-full gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className=" text-xs ">I provide</span>
              </div>
            ) : (
              <div className="flex flex-row items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full gap-2">
                <Briefcase className="h-4 w-4" />
                <span className=" text-xs ">I need</span>
              </div>
            )}
            {proposal.status === "draft" && (
              <div className="flex flex-row justify-around items-center bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Draft</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center text-sm text-muted-foreground mt-4 w-full justify-between">
          {proposal.budget && (
            <div className="flex items-center gap-1">
              <Wallet className="h-4 w-4" />
              <span className="font-medium">{displayBudget}</span>
            </div>
          )}
          {proposal.timeline && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{proposal.timeline}</span>
            </div>
          )}
          {proposal.updatedAt && (
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span>{new Date(proposal.updatedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </Card>
    );
  },
);

ProposalCard.displayName = "ProposalCard";

// Memoized contract card component
const ContractCard = memo(
  ({
    contract,
    onNavigate,
  }: {
    contract: ContractListType;
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
      [],
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
        className="hover:bg-muted/50 transition-colors cursor-pointer p-4 flex flex-col justify-between"
        onClick={handleClick}
      >
        {/* --- Header -------------------------------------------------------- */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <CardTitle className="text-base font-semibold leading-tight text-foreground">
              {contract.smartjectTitle}
            </CardTitle>
            <CardDescription>
              Contract with {contract.otherParty}
            </CardDescription>
          </div>

          <div className="flex gap-2 flex-col">
            {getStatusBadge(contract.status)}
            {contract.role === "provider" ? (
              <div className="flex flex-row items-center bg-sky-100 text-sky-700 px-3 py-1 rounded-full gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs">I provide</span>
              </div>
            ) : (
              <div className="flex flex-row items-center bg-orange-100 text-orange-700 px-3 py-1 rounded-full gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs">I need</span>
              </div>
            )}
          </div>
        </div>

        {/* --- Body ---------------------------------------------------------- */}
        <CardContent className="p-0">
          <div className="flex items-center text-sm text-muted-foreground mt-4 w-full justify-between">
            {/* Бюджет */}
            {contract.budget && (
              <div className="flex items-center gap-1">
                <Wallet className="h-4 w-4" />
                <span className="font-medium">{displayBudget}</span>
              </div>
            )}

            {/* Следующий майлстоун */}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {contract.nextMilestone} •{" "}
                {formatMilestoneDate(contract.nextMilestoneDate)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
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
  const [activeContracts, setActiveContracts] = useState<ContractListType[]>(
    [],
  );
  const [activeTab, setActiveTab] = useState("believe");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  const [negotiations, setActiveNegotiations] = useState<UserConversation[]>(
    [],
  );

  // Memoized navigation handlers
  const handleProposalNavigate = useCallback(
    (id: string) => {
      router.push(`/proposals/${id}`);
    },
    [router],
  );

  const handleContractNavigate = useCallback(
    (id: string) => {
      router.push(`/contracts/${id}`);
    },
    [router],
  );

  const handleConversationNavigate = useCallback(
    (matchId: string, proposalId: string, otherPartyId: string) => {
      router.push(
        `/matches/${matchId}/negotiate/${proposalId}/${otherPartyId}`,
      );
    },
    [router],
  );

  const handleViewAllNavigation = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router],
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
      activeProposals: proposals.slice(0, 6),
      contracts: activeContracts.slice(0, 3),
    }),
    [proposals, activeContracts],
  );

  const getUserNegotiations = useCallback(async () => {
    const userId = user?.id;
    if (!userId) return;

    const supabase = getSupabaseBrowserClient();

    try {
      // Optimized single query to get owned proposals
      const { data: ownedProposals, error: ownedProposalsError } =
        await supabase
          .from("proposals")
          .select("id, user_id, smartject_id, title, budget, timeline")
          .eq("user_id", userId);

      if (ownedProposalsError) {
        console.error("Error fetching owned proposals:", ownedProposalsError);
        return;
      }

      if (!ownedProposals?.length) return;

      // Get all messages for these proposals in one query
      const proposalIds = ownedProposals.map((p) => p.id);
      const { data: allMessages, error: messagesError } = await supabase
        .from("negotiation_messages")
        .select("proposal_id, sender_id, created_at")
        .in("proposal_id", proposalIds);

      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return;
      }

      if (!allMessages?.length) return;

      // Process conversations efficiently
      const conversationMap = new Map<string, UserConversation>();
      const userIds = new Set<string>();
      const smartjectIds = new Set<string>();

      // Collect unique IDs for batch queries
      ownedProposals.forEach((proposal: any) => {
        smartjectIds.add(proposal.smartject_id);
      });

      allMessages.forEach((msg: any) => {
        if (msg.sender_id !== userId) {
          userIds.add(msg.sender_id);
        }
      });

      // Batch fetch user and smartject data
      const [usersResult, smartjectsResult] = await Promise.all([
        userIds.size > 0
          ? supabase
              .from("users")
              .select("id, name, avatar_url")
              .in("id", Array.from(userIds))
          : { data: [] },
        smartjectIds.size > 0
          ? supabase
              .from("smartjects")
              .select("id, title")
              .in("id", Array.from(smartjectIds))
          : { data: [] },
      ]);

      const usersMap = new Map(
        ((usersResult.data as any[]) || []).map((u: any) => [u.id, u]),
      );
      const smartjectsMap = new Map(
        ((smartjectsResult.data as any[]) || []).map((s: any) => [s.id, s]),
      );

      // Process conversations
      for (const proposal of ownedProposals) {
        const proposalMessages = allMessages.filter(
          (msg: any) => msg.proposal_id === proposal.id,
        );
        if (!proposalMessages.length) continue;

        const otherPartyMessage = proposalMessages.find(
          (msg: any) => msg.sender_id !== userId,
        );
        if (!otherPartyMessage) continue;

        const otherPartyId = otherPartyMessage.sender_id;
        const otherPartyData = usersMap.get(otherPartyId) as any;
        const smartjectData = smartjectsMap.get(proposal.smartject_id) as any;

        if (!otherPartyData || !smartjectData) continue;

        // Create or find match
        const providerId = String((proposal as any).user_id);
        const neederId = String(otherPartyId);

        let matchId: string | null = null;

        const { data: existingMatch } = await supabase
          .from("matches")
          .select("id, status")
          .eq("smartject_id", String((proposal as any).smartject_id))
          .eq("provider_id", providerId)
          .eq("needer_id", neederId)
          .maybeSingle();

        if (existingMatch) {
          matchId = (existingMatch as any).id;
        } else {
          const { data: newMatch } = await supabase
            .from("matches")
            .insert({
              smartject_id: String((proposal as any).smartject_id),
              provider_id: providerId,
              needer_id: neederId,
              status: "new",
            })
            .select("id")
            .single();

          if (newMatch) matchId = (newMatch as any).id;
        }

        if (!matchId) continue;

        const conversationKey = `${(proposal as any).id}-${otherPartyId}`;
        const lastActivity = proposalMessages.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0].created_at as string;

        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            id: conversationKey,
            otherParty: {
              id: otherPartyId as string,
              name: otherPartyData?.name || "Unknown User",
              avatar: otherPartyData?.avatar_url || "",
            },
            totalMessages: 0,
            lastActivity,
            activeNegotiations: [],
            status: "active",
          });
        }

        const conversation = conversationMap.get(conversationKey)!;
        conversation.activeNegotiations.push({
          proposalId: (proposal as any).id,
          smartjectId: (proposal as any).smartject_id,
          matchId,
          smartjectTitle: smartjectData?.title || "Unknown Smartject",
          budget: (proposal as any).budget || 0,
          timeline: (proposal as any).timeline || "",
          messageCount: proposalMessages.length,
          isProposalOwner: true,
          status: (existingMatch as any)?.status || "new",
        });

        conversation.totalMessages += proposalMessages.length;
      }

      const activeConversations = Array.from(conversationMap.values())
        .filter((conv) =>
          conv.activeNegotiations.some(
            (neg) =>
              neg.status !== "contract_created" && neg.status !== "cancelled",
          ),
        )
        .sort(
          (a, b) =>
            new Date(b.lastActivity).getTime() -
            new Date(a.lastActivity).getTime(),
        );

      setActiveNegotiations(activeConversations);
    } catch (error) {
      console.error("Error in getUserNegotiations:", error);
    }
  }, [user?.id]);

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
    Promise.all([
      fetchContracts(),
      fetchProposals(),
      getUserNegotiations(),
    ]).catch(console.error);
  }, [authLoading, canAccess, fetchContracts, fetchProposals]);

  // Store scroll position for restoration after voting
  const scrollPositionRef = useRef<number>(0);

  // Optimized vote handler that preserves scroll position
  const handleVoted = useCallback(() => {
    // Store current scroll position before refetch
    scrollPositionRef.current = window.scrollY;

    // Refetch data to get updated vote counts
    refetch();
  }, [refetch]);

  // Restore scroll position after refetch completes
  useEffect(() => {
    if (!isLoading && scrollPositionRef.current > 0) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: "smooth",
        });
        scrollPositionRef.current = 0; // Reset after restoring
      });
    }
  }, [isLoading]);

  // Scroll to tabs and switch to specific tab
  const scrollToTabsAndSwitch = useCallback((tabValue: string) => {
    setActiveTab(tabValue);
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, []);

  if (authLoading || !canAccess || loading) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-50">
      <div className="border-t border-gray-200 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          onClick={() => scrollToTabsAndSwitch("believe")}
          className="cursor-pointer hover:scale-105 transition-transform"
        >
          <StatsCard
            title="Believed Smartjects"
            description="Smartjects you've shown interest in"
            value={processedData.believed.length}
          />
        </div>
        <div
          onClick={() => scrollToTabsAndSwitch("need")}
          className="cursor-pointer hover:scale-105 transition-transform"
        >
          <StatsCard
            title="I Need"
            description="Smartjects you're looking to implement"
            value={processedData.need.length}
          />
        </div>
        <div
          onClick={() => scrollToTabsAndSwitch("provide")}
          className="cursor-pointer hover:scale-105 transition-transform"
        >
          <StatsCard
            title="I Provide"
            description="Smartjects you can implement"
            value={processedData.provide.length}
          />
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} ref={tabsRef}>
        {/* <TabsList className="mb-6">
          <TabsTrigger value="believe">I Believe</TabsTrigger>
          <TabsTrigger value="need">I Need</TabsTrigger>
          <TabsTrigger value="provide">I Provide</TabsTrigger>
        </TabsList> */}

        <TabsContent value="believe" className="space-y-4">
          {isLoading ? (
            <SkeletonGrid />
          ) : processedData.believed.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {processedData.believed.map((smartject) => (
                <SmartjectCard
                  key={smartject.id}
                  smartject={smartject}
                  onVoted={handleVoted}
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
                    onVoted={handleVoted}
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
                    onVoted={handleVoted}
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        {user?.accountType === "free" && (
          <Button className="mt-4 md:mt-0" asChild>
            <a href="/upgrade">Upgrade to Paid Account</a>
          </Button>
        )}
      </div>

      {user?.accountType === "paid" && (
        <>
          {/* Main Content Grid - Proposals and Contracts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - My Proposals */}
            <div className="lg:col-span-2 space-y-6 lg:border-r lg:border-gray-200 lg:pr-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Proposals</h2>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="flex items-center"
                  >
                    Create new proposal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleViewAllNavigation("/proposals")}
                    className="flex items-center"
                  >
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[130px]">
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
                      <Button onClick={() => setCreateModalOpen(true)}>
                        Create Your First Proposal
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Column - Active Contracts */}
            <div className="lg:col-span-1 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Active Contracts</h2>
                <Button
                  variant="outline"
                  onClick={() => handleViewAllNavigation("/contracts")}
                  className="flex items-center"
                >
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4 min-h-[200px]">
                {displayedData.contracts.map((contract) => (
                  <ContractCard
                    key={contract.id}
                    contract={contract}
                    onNavigate={handleContractNavigate}
                  />
                ))}
                {displayedData.contracts.length === 0 && (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <p className="text-muted-foreground mb-4">
                        You don't have any active contracts yet.
                      </p>
                      <Button
                        onClick={() => handleViewAllNavigation("/matches")}
                      >
                        View Your Matches
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Conversations Section */}
          <div className="border-t border-gray-200 pt-8 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recent Conversations</h2>
              <Button
                variant="outline"
                onClick={() => handleViewAllNavigation("/negotiations")}
                className="flex items-center"
              >
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {negotiations.slice(0, 2).map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                  onNavigate={handleConversationNavigate}
                />
              ))}
              {negotiations.slice(0, 2).length === 0 && (
                <Card className="col-span-2">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">
                      You don't have any matches yet.
                    </p>
                    <Button
                      onClick={() => handleViewAllNavigation("/discover")}
                    >
                      Browse Smartjects
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
      <CreateProposalModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          // Refetch proposals after successful creation
          if (user?.id) {
            proposalService.getProposalsByUserId(user.id).then(setProposals);
          }
        }}
      />
    </div>
  );
}
