"use client";

import type React from "react";

import { useEffect, use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth-provider";
import { commentService, voteService } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { useSmartjectById } from "@/hooks/use-smartject-by-id";

// Import our new components
import { SmartjectCard, SmartjectTabs, CommentsSection } from "./components";
import { CreateProposalModal } from "@/components/create-proposal-modal";

export default function SmartjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const {
    smartject,
    comments,
    comment,
    setComment,
    commentsRef,
    needProposals,
    provideProposals,
    isLoading,
    isSubmitting,
    setIsSubmitting,
    isVoting,
    setIsVoting,
    error,
    refetch,
  } = useSmartjectById(typeof id === "string" ? id : undefined);

  const [createProposalModalOpen, setCreateProposalModalOpen] = useState(false);
  const [proposalType, setProposalType] = useState<
    "need" | "provide" | undefined
  >();

  useEffect(() => {
    // Check if the URL has a hash fragment
    if (typeof window !== "undefined" && window.location.hash === "#comments") {
      // Scroll to the comments section
      setTimeout(() => {
        commentsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 500); // Small delay to ensure the page is fully loaded
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Smartject link has been copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      });
  };

  const handleVote = async (type: "believe" | "need" | "provide") => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote for smartjects",
        variant: "destructive",
      });
      return;
    }

    if (
      user?.accountType !== "paid" &&
      (type === "need" || type === "provide")
    ) {
      toast({
        title: "Paid account required",
        description: `Only paid accounts can vote "${type}" for smartjects`,
        variant: "destructive",
      });
      return;
    }

    if (!smartject) return;

    try {
      setIsVoting(true);

      // Check if user has already voted
      const hasVoted = await voteService.hasUserVoted(
        user!.id,
        smartject.id,
        type,
      );

      // Toggle vote
      await voteService.vote({
        userId: user!.id,
        smartjectId: smartject.id,
        voteType: type,
      });

      refetch();

      toast({
        title: hasVoted ? "Vote removed" : "Vote added",
        description: hasVoted
          ? `You've removed your "${type}" vote for this smartject`
          : `You've voted "${type}" for this smartject`,
      });
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "There was an error processing your vote",
        variant: "destructive",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);

      const newComment = await commentService.addComment({
        userId: user!.id,
        smartjectId: id,
        content: comment,
      });

      if (newComment) {
        refetch();
        setComment("");

        toast({
          title: "Comment added",
          description: "Your comment has been added successfully",
        });
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProposal = (type?: "need" | "provide") => {
    setProposalType(type);
    setCreateProposalModalOpen(true);
  };

  const handleRespondToProposal = (proposalId: string) => {
    router.push(`/proposals/${proposalId}`);
  };

  const handleNegotiate = (proposalId: string) => {
    // In a real app, this would navigate to a negotiation page
    router.push(`/matches/new/negotiate/${proposalId}`);
  };

  // If loading, show loading state
  if (isLoading || !smartject) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading smartject details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Main Layout: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Smartject Card */}
        <div className="lg:col-span-5 space-y-6">
          <SmartjectCard
            smartject={smartject}
            user={user}
            isAuthenticated={isAuthenticated}
            isVoting={isVoting}
            onVote={handleVote}
            onCreateProposal={handleCreateProposal}
            onShare={handleShare}
          />

          {/* Comments Section - Below the card on left side */}
          <div>
            <div className="text-xl font-semibold mb-4 pl-4">Discussion</div>

            <div ref={commentsRef}>
              <CommentsSection
                comments={comments}
                comment={comment}
                setComment={setComment}
                isAuthenticated={isAuthenticated}
                isSubmitting={isSubmitting}
                onSubmitComment={handleSubmitComment}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Content Tabs */}
        <div className="lg:col-span-7">
          <SmartjectTabs
            smartject={smartject}
            needProposals={needProposals}
            provideProposals={provideProposals}
            user={user}
            isAuthenticated={isAuthenticated}
            onViewProposalDetails={handleRespondToProposal}
            onNegotiate={handleNegotiate}
            onCreateProposal={handleCreateProposal}
          />
        </div>
      </div>

      <CreateProposalModal
        isOpen={createProposalModalOpen}
        onClose={() => setCreateProposalModalOpen(false)}
        smartjectId={id}
        proposalType={proposalType}
        onSuccess={() => {
          refetch();
          setCreateProposalModalOpen(false);
        }}
      />
    </div>
  );
}
