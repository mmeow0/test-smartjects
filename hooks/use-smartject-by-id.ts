import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import {
  smartjectService,
  commentService,
  proposalService,
  contractService,
} from "@/lib/services";
import { notificationService } from "@/lib/services/notification.service";
import type {
  SmartjectType,
  CommentType,
  ProposalType,
  ContractListType,
} from "@/lib/types";
import { useRouter } from "next/navigation";

export function useSmartjectById(smartjectId?: string) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [smartject, setSmartject] = useState<SmartjectType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [needProposals, setNeedProposals] = useState<ProposalType[]>([]);
  const [provideProposals, setProvideProposals] = useState<ProposalType[]>([]);
  const [userProposals, setUserProposals] = useState<ProposalType[]>([]);
  const [userContracts, setUserContracts] = useState<{
    activeContracts: ContractListType[];
    completedContracts: ContractListType[];
  }>({ activeContracts: [], completedContracts: [] });
  const [unreadProposalCounts, setUnreadProposalCounts] = useState<{
    [proposalId: string]: number;
  }>({});
  const [unreadContractCounts, setUnreadContractCounts] = useState<{
    [matchId: string]: number;
  }>({});
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const commentsRef = useRef<HTMLDivElement>(null);

  const fetchSmartject = useCallback(
    async (refetch = false) => {
      if (!smartjectId) return;

      setIsLoading(!refetch);
      setError(null);

      try {
        const data = await smartjectService.getSmartjectById(
          smartjectId,
          user?.id,
        );
        if (data) {
          setSmartject(data);
        } else {
          toast({
            title: "Error",
            description: "Smartject not found",
            variant: "destructive",
          });
          router.push("/discover");
        }
      } catch (error) {
        console.error("Error fetching smartject:", error);
        toast({
          title: "Error",
          description: "Failed to load smartject details",
          variant: "destructive",
        });
        setError(error instanceof Error ? error : new Error("Unknown error"));
        setSmartject(null);
      } finally {
        setIsLoading(false);
      }
    },
    [smartjectId, user?.id, router, toast],
  );

  const fetchComments = useCallback(async () => {
    if (!smartjectId) return;
    try {
      const data = await commentService.getCommentsBySmartjectId(smartjectId);
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [smartjectId]);

  const fetchProposals = useCallback(async () => {
    if (!smartjectId || !isAuthenticated || user?.accountType !== "paid")
      return;
    try {
      const allProposals =
        await proposalService.getProposalsBySmartjectId(smartjectId);

      setNeedProposals(allProposals.filter((p) => p.type === "need"));
      setProvideProposals(allProposals.filter((p) => p.type === "provide"));
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  }, [smartjectId, isAuthenticated, user?.accountType]);

  const fetchUserProposals = useCallback(async () => {
    if (!smartjectId || !isAuthenticated || !user?.id) return;
    try {
      const data = await proposalService.getUserProposalsForSmartject(
        user.id,
        smartjectId,
      );
      setUserProposals(data);
    } catch (error) {
      console.error("Error fetching user proposals:", error);
    }
  }, [smartjectId, isAuthenticated, user?.id]);

  const fetchUserContracts = useCallback(async () => {
    if (!smartjectId || !isAuthenticated || !user?.id) return;
    try {
      const data = await contractService.getUserContractsForSmartject(
        user.id,
        smartjectId,
      );
      setUserContracts(data);
    } catch (error) {
      console.error("Error fetching user contracts:", error);
    }
  }, [smartjectId, isAuthenticated, user?.id]);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      // Get unread counts for user proposals
      if (userProposals.length > 0) {
        const proposalIds = userProposals.map((p) => p.id);
        const proposalCounts =
          await notificationService.getUnreadCountsByProposalIds(
            proposalIds,
            user.id,
          );
        setUnreadProposalCounts(proposalCounts);
      }

      // Get unread counts for user contracts
      const allContracts = [
        ...userContracts.activeContracts,
        ...userContracts.completedContracts,
      ];
      if (allContracts.length > 0) {
        // Use match IDs for contract notifications
        const matchIds = allContracts.map((c) => c.matchId);
        const contractCounts =
          await notificationService.getUnreadCountsByMatchIds(
            matchIds,
            user.id,
          );
        // Map match IDs back to contract IDs for the component
        const contractCountsById: { [contractId: string]: number } = {};
        allContracts.forEach((contract) => {
          const matchCount = contractCounts[contract.matchId] || 0;
          contractCountsById[contract.id] = matchCount;
        });
        setUnreadContractCounts(contractCountsById);
      }
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  }, [isAuthenticated, user?.id, userProposals, userContracts]);

  const refetch = useCallback(() => {
    fetchSmartject(true);
    fetchComments();
    fetchProposals();
    fetchUserProposals();
    fetchUserContracts();
    fetchUnreadNotifications();
  }, [
    fetchSmartject,
    fetchComments,
    fetchProposals,
    fetchUserProposals,
    fetchUserContracts,
    fetchUnreadNotifications,
  ]);

  useEffect(() => {
    fetchSmartject();
    fetchComments();
    fetchProposals();
    fetchUserProposals();
    fetchUserContracts();
  }, [
    fetchSmartject,
    fetchComments,
    fetchProposals,
    fetchUserProposals,
    fetchUserContracts,
  ]);

  useEffect(() => {
    fetchUnreadNotifications();
  }, [fetchUnreadNotifications]);

  return {
    smartject,
    comments,
    needProposals,
    provideProposals,
    userProposals,
    userContracts,
    unreadProposalCounts,
    unreadContractCounts,
    isLoading,
    isVoting,
    setIsVoting,
    isSubmitting,
    setIsSubmitting,
    comment,
    setComment,
    commentsRef,
    error,
    refetch,
  };
}
