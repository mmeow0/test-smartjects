import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useRequirePaidAccount } from "@/hooks/use-auth-guard";
import { negotiationService } from "@/lib/services";

// Define types for negotiation data
interface Deliverable {
  id: string
  description: string
  completed: boolean
}

interface Milestone {
  id: string
  name: string
  description: string
  percentage: number
  amount: string
  deliverables: Deliverable[]
}

interface Message {
  id: string
  sender: "provider" | "needer"
  senderName: string
  content: string
  timestamp: string
  isCounterOffer: boolean
  counterOffer?: {
    budget?: string
    timeline?: string
  }
}

interface NegotiationFile {
  id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_by: string
  created_at: string
}

interface NegotiationData {
  matchId: string
  proposalId: string
  smartjectTitle: string
  provider: {
    id: string
    name: string
    avatar: string
    rating: number
  }
  needer: {
    id: string
    name: string
    avatar: string
    rating: number
  }
  currentProposal: {
    budget: string
    timeline: string
    scope: string
    deliverables: string[]
  }
  milestones: Milestone[]
  messages: Message[]
  files: NegotiationFile[]
}

export const useNegotiation = (matchId: string, proposalId: string) => {
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount();
  const router = useRouter();
  const { toast } = useToast();

  const [negotiationData, setNegotiationData] = useState<NegotiationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNegotiationData = useCallback(async () => {
    setIsLoading(true);

    if (authLoading || !canAccess) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await negotiationService.getNegotiationData(matchId, proposalId);
      if (data) {
        setNegotiationData(data);
      } else {
        toast({
          title: "Not found",
          description: "Negotiation data not found.",
          variant: "destructive",
        });
        router.push("/proposals");
      }
    } catch (error) {
      console.error("Error fetching negotiation data:", error);
      toast({
        title: "Error",
        description: "Failed to load negotiation data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [matchId, proposalId, authLoading, canAccess, router, toast]);

  const addMessage = useCallback(async (
    content: string,
    isCounterOffer: boolean = false,
    counterOfferBudget?: string,
    counterOfferTimeline?: string
  ) => {
    if (!user?.id) return false;

    const success = await negotiationService.addNegotiationMessage(
      proposalId,
      user.id,
      content,
      isCounterOffer,
      counterOfferBudget,
      counterOfferTimeline
    );

    if (success) {
      // Refetch data to get the new message
      await fetchNegotiationData();
      return true;
    }

    return false;
  }, [proposalId, user?.id, fetchNegotiationData]);

  useEffect(() => {
    fetchNegotiationData();
  }, [fetchNegotiationData]);

  return { 
    negotiationData, 
    isLoading, 
    refetch: fetchNegotiationData,
    addMessage
  };
};