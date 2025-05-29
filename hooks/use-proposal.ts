import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { ProposalType } from "@/lib/types";
import { proposalService } from "@/lib/services";

export const useProposal = (id: string) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [proposal, setProposal] = useState<ProposalType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProposal = useCallback(async () => {
    setIsLoading(true);

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.accountType !== "paid") {
      router.push("/upgrade");
      return;
    }

    try {
      const proposalData = await proposalService.getProposalById(id);
      if (proposalData) {
        setProposal(proposalData);
      } else {
        toast({
          title: "Not found",
          description: "Proposal not found.",
          variant: "destructive",
        });
        router.push("/proposals");
      }
    } catch (error) {
      console.error("Error fetching proposal:", error);
      toast({
        title: "Error",
        description: "Failed to load proposal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated, user?.accountType, router, toast]);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  return { proposal, isLoading, refetch: fetchProposal };
};
