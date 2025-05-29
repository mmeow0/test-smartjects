import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import { smartjectService, commentService, proposalService } from "@/lib/services";
import type { SmartjectType, CommentType, ProposalType } from "@/lib/types";
import { useRouter } from "next/navigation";

export function useSmartjectById(smartjectId?: string) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [smartject, setSmartject] = useState<SmartjectType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [needProposals, setNeedProposals] = useState<ProposalType[]>([]);
  const [provideProposals, setProvideProposals] = useState<ProposalType[]>([]);
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
        const data = await smartjectService.getSmartjectById(smartjectId, user?.id);
        if (data) {
          setSmartject(data);
        } else {
          toast({
            title: "Error",
            description: "Smartject not found",
            variant: "destructive",
          });
          router.push("/hub");
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
    [smartjectId, user?.id, router, toast]
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
    if (!smartjectId || !isAuthenticated || user?.accountType !== "paid") return;
    try {
      const allProposals = await proposalService.getProposalsBySmartjectId(smartjectId);
      
      setNeedProposals(allProposals.filter((p) => p.type === "need"));
      setProvideProposals(allProposals.filter((p) => p.type === "provide"));
    } catch (error) {
      console.error("Error fetching proposals:", error);
    }
  }, [smartjectId, isAuthenticated, user?.accountType]);

  const refetch = useCallback(() => {
    fetchSmartject(true);
    fetchComments();
    fetchProposals();
  }, [fetchSmartject, fetchComments, fetchProposals]);

  useEffect(() => {
    fetchSmartject();
    fetchComments();
    fetchProposals();
  }, [fetchSmartject, fetchComments, fetchProposals]);

  return {
    smartject,
    comments,
    needProposals,
    provideProposals,
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
