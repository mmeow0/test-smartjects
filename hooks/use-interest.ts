import { useState, useEffect, useCallback } from "react";
import { useRequirePaidAccount } from "@/hooks/use-auth-guard";
import { useToast } from "@/hooks/use-toast";
import { interestService, type InterestExpression } from "@/lib/services/interest.service";

interface UseInterestProps {
  proposalId: string;
  isProposalOwner?: boolean;
}

interface UseInterestReturn {
  // For regular users
  hasExpressedInterest: boolean;
  isExpressingInterest: boolean;
  expressInterest: () => Promise<void>;

  // For proposal owners
  interestedUsers: InterestExpression[];
  isLoadingInterestedUsers: boolean;
  refreshInterestedUsers: () => Promise<void>;

  // Common
  isLoading: boolean;
}

export const useInterest = ({ proposalId, isProposalOwner = false }: UseInterestProps): UseInterestReturn => {
  const { user, canAccess } = useRequirePaidAccount();
  const { toast } = useToast();

  // State for user's interest
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);
  const [isExpressingInterest, setIsExpressingInterest] = useState(false);
  const [isLoadingUserInterest, setIsLoadingUserInterest] = useState(true);

  // State for interested users (for proposal owner)
  const [interestedUsers, setInterestedUsers] = useState<InterestExpression[]>([]);
  const [isLoadingInterestedUsers, setIsLoadingInterestedUsers] = useState(false);

  // Check if current user has expressed interest
  const checkUserInterest = useCallback(async () => {
    if (!user?.id || !proposalId || !canAccess) {
      setIsLoadingUserInterest(false);
      return;
    }

    setIsLoadingUserInterest(true);
    try {
      const hasInterest = await interestService.hasExpressedInterest(proposalId, user.id);
      setHasExpressedInterest(hasInterest);
    } catch (error) {
      console.error("Error checking user interest:", error);
    } finally {
      setIsLoadingUserInterest(false);
    }
  }, [proposalId, user?.id, canAccess]);

  // Get all interested users (for proposal owner)
  const fetchInterestedUsers = useCallback(async () => {
    if (!isProposalOwner || !proposalId) {
      return;
    }

    setIsLoadingInterestedUsers(true);
    try {
      const users = await interestService.getInterestedUsers(proposalId);
      setInterestedUsers(users);
    } catch (error) {
      console.error("Error fetching interested users:", error);
      toast({
        title: "Error",
        description: "Failed to load interested users",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInterestedUsers(false);
    }
  }, [proposalId, isProposalOwner, toast]);

  // Accept proposal
  const expressInterest = useCallback(async () => {
    if (!user?.id || !proposalId || hasExpressedInterest) {
      return;
    }

    setIsExpressingInterest(true);
    try {
      const result = await interestService.expressInterest(proposalId, user.id);

      if (result.success) {
        setHasExpressedInterest(true);
        toast({
          title: "Interest Expressed",
          description: "The proposal owner has been notified of your interest",
        });

        // If this is also the proposal owner view, refresh interested users
        if (isProposalOwner) {
          fetchInterestedUsers();
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to accept proposal",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error expressing interest:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsExpressingInterest(false);
    }
  }, [user?.id, proposalId, hasExpressedInterest, toast, isProposalOwner, fetchInterestedUsers]);


  // Initial data loading
  useEffect(() => {
    if (canAccess && proposalId) {
      checkUserInterest();

      if (isProposalOwner) {
        fetchInterestedUsers();
      }
    }
  }, [canAccess, proposalId, checkUserInterest, fetchInterestedUsers, isProposalOwner]);

  return {
    // For regular users
    hasExpressedInterest,
    isExpressingInterest,
    expressInterest,

    // For proposal owners
    interestedUsers,
    isLoadingInterestedUsers,
    refreshInterestedUsers: fetchInterestedUsers,

    // Common
    isLoading: isLoadingUserInterest || isLoadingInterestedUsers,
  };
};
