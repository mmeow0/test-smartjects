import { useCallback, useEffect, useState } from "react";
import { useRequirePaidAccount } from "@/hooks/use-auth-guard";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseBrowserClient } from "@/lib/supabase";

interface UserConversation {
  id: string
  otherParty: {
    id: string
    name: string
    avatar: string
  }
  totalMessages: number
  lastActivity: string
  activeNegotiations: {
    matchId: string;
    proposalId: string
    smartjectId: string
    smartjectTitle: string
    budget: string
    timeline: string
    messageCount: number
    isProposalOwner: boolean
    status?: string
  }[]
  status: 'active' | 'pending' | 'completed' | 'contract_created' | 'cancelled'
}

const getProposalNegotiations = async (proposalId: string, userId: string) => {
  const supabase = getSupabaseBrowserClient();

  try {
    // Get the proposal details
    const { data: proposal, error: proposalError } = await supabase
      .from("proposals")
      .select("id, user_id, smartject_id, title, budget, timeline, type")
      .eq("id", proposalId)
      .single();

    if (proposalError || !proposal) {
      console.error("Error fetching proposal:", proposalError);
      return { active: [], completed: [] };
    }

    const isProposalOwner = proposal.user_id === userId;

    // Get all messages for this proposal
    const { data: proposalMessages, error: messagesError } = await supabase
      .from("negotiation_messages")
      .select("id, proposal_id, sender_id, created_at")
      .eq("proposal_id", proposalId);

    if (messagesError || !proposalMessages || proposalMessages.length === 0) {
      return { active: [], completed: [] };
    }

    // Find the other party
    const otherPartyMessage = proposalMessages.find(msg => msg.sender_id !== userId);
    const otherPartyId = isProposalOwner
      ? otherPartyMessage?.sender_id
      : proposal.user_id;

    if (!otherPartyId) {
      return { active: [], completed: [] };
    }

    // Get other party user data
    const userResult = await supabase
      .from("users")
      .select("name, avatar_url")
      .eq("id", otherPartyId)
      .single();

    const otherPartyName = userResult.data?.name || "Unknown User";
    const otherPartyAvatar = userResult.data?.avatar_url || "";

    // Get smartject title
    const smartjectResult = await supabase
      .from("smartjects")
      .select("title")
      .eq("id", proposal.smartject_id as string)
      .single();

    const smartjectTitle = (smartjectResult.data?.title as string) || "Unknown Smartject";

    // Determine provider and needer based on proposal type
    let providerId: string;
    let neederId: string;
    
    if (proposal.type === "provide") {
      // Proposal owner is providing the service
      providerId = proposal.user_id as string;
      neederId = otherPartyId as string;
    } else {
      // Proposal owner needs the service
      neederId = proposal.user_id as string;
      providerId = otherPartyId as string;
    }

    // Get or find match
    const matchResult = await supabase
      .from("matches")
      .select("id, status")
      .eq("smartject_id", proposal.smartject_id as string)
      .eq("provider_id", providerId)
      .eq("needer_id", neederId)
      .maybeSingle();

    let matchId = matchResult.data?.id as string | null;
    let matchStatus = (matchResult.data?.status as string) || 'new';

    // If no match exists, create one
    if (!matchId) {
      const newMatchResult = await supabase
        .from("matches")
        .insert({
          smartject_id: proposal.smartject_id as string,
          provider_id: providerId,
          needer_id: neederId,
          status: 'new'
        })
        .select("id")
        .single();

      if (newMatchResult.data) {
        matchId = newMatchResult.data.id as string;
        matchStatus = 'new';
      }
    }

    if (!matchId) {
      return { active: [], completed: [] };
    }

    const lastActivity = proposalMessages
      .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())[0]
      .created_at as string;

    const conversation: UserConversation = {
      id: `${proposalId}-${otherPartyId}`,
      otherParty: {
        id: otherPartyId as string,
        name: otherPartyName as string,
        avatar: otherPartyAvatar as string,
      },
      totalMessages: proposalMessages.length,
      lastActivity,
      activeNegotiations: [{
        proposalId: proposal.id as string,
        smartjectId: proposal.smartject_id as string,
        matchId: matchId as string,
        smartjectTitle,
        budget: (proposal.budget as string) || "",
        timeline: (proposal.timeline as string) || "",
        messageCount: proposalMessages.length,
        isProposalOwner,
        status: matchStatus as string,
      }],
      status: matchStatus === 'contract_created' ? 'completed' : 
              matchStatus === 'cancelled' ? 'cancelled' : 'active'
    };

    // Separate active and completed
    if (matchStatus === 'contract_created' || matchStatus === 'cancelled') {
      return {
        active: [],
        completed: [conversation]
      };
    } else {
      return {
        active: [conversation],
        completed: []
      };
    }

  } catch (error) {
    console.error("Error in getProposalNegotiations:", error);
    return { active: [], completed: [] };
  }
};

export const useProposalNegotiations = (proposalId: string) => {
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<UserConversation[]>([]);
  const [completedConversations, setCompletedConversations] = useState<UserConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNegotiations = useCallback(async () => {
    if (authLoading || !canAccess || !user?.id || !proposalId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await getProposalNegotiations(proposalId, user.id);
      setConversations(result.active);
      setCompletedConversations(result.completed);
    } catch (error) {
      console.error("Error fetching proposal negotiations:", error);
      toast({
        title: "Error",
        description: "Failed to load negotiations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [proposalId, user?.id, authLoading, canAccess, toast]);

  useEffect(() => {
    fetchNegotiations();
  }, [fetchNegotiations]);

  return {
    conversations,
    completedConversations,
    isLoading,
    refetch: fetchNegotiations
  };
};