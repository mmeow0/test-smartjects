"use client";

import Link from "next/link";
import Image from "next/image";
import type React from "react";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Briefcase,
  Wrench,
  MessageSquare,
  Share2,
  Calendar,
  DollarSign,
  Target,
  Users,
  Lightbulb,
  Cpu,
  Zap,
  Building,
  Factory,
  BriefcaseIcon,
  LinkIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth-provider";
import {
  smartjectService,
  commentService,
  voteService,
  proposalService,
} from "@/lib/services";
import type { SmartjectType, CommentType, ProposalType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useSmartjectById } from "@/hooks/use-smartject-by-id";

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
        type
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

  const handleCreateProposal = () => {
    router.push(`/proposals/create?smartjectId=${id}`);
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
    <div className="container mx-auto px-4 py-6">
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                {/* {smartject.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))} */}
              </div>
              <CardTitle className="text-2xl">{smartject.title}</CardTitle>
              <CardDescription>
                Created on {new Date(smartject.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Featured Image */}
              {smartject.image && (
                <div className="mb-6 relative h-64 w-full overflow-hidden rounded-md">
                  <Image
                    src={smartject.image || "/placeholder.svg"}
                    alt={smartject.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Tabs for different content sections */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="details" className="flex-1">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="need" className="flex-1">
                    Need Proposals ({needProposals.length})
                  </TabsTrigger>
                  <TabsTrigger value="provide" className="flex-1">
                    Provide Proposals ({provideProposals.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  <div className="space-y-6">
                    {/* Mission */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-primary" />
                        Mission
                      </h3>
                      <p className="text-muted-foreground">
                        {smartject.mission}
                      </p>
                    </div>

                    <Separator />

                    {/* Problem it Solves */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        Problem it Solves
                      </h3>
                      <p className="text-muted-foreground">
                        {smartject.problematics}
                      </p>
                    </div>

                    <Separator />

                    {/* Scope */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        Scope
                      </h3>
                      <p className="text-muted-foreground">{smartject.scope}</p>
                    </div>

                    <Separator />

                    {/* Target Audience */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        Target Audience
                      </h3>
                      <p className="text-muted-foreground">
                        {smartject.audience}
                      </p>
                    </div>

                    <Separator />

                    {/* How it Works */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <Cpu className="h-5 w-5 text-green-500" />
                        How it Works
                      </h3>
                      <p className="text-muted-foreground">
                        {smartject.howItWorks}
                      </p>
                    </div>

                    <Separator />

                    {/* System Architecture */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <Cpu className="h-5 w-5 text-purple-500" />
                        High-Level System Architecture
                      </h3>
                      <p className="text-muted-foreground">
                        {smartject.architecture}
                      </p>
                    </div>

                    <Separator />

                    {/* Key Differentiators */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Key Differentiators and Innovations
                      </h3>
                      <p className="text-muted-foreground">
                        {smartject.innovation}
                      </p>
                    </div>

                    <Separator />

                    {/* Use Cases */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <Building className="h-5 w-5 text-cyan-500" />
                        Use Cases
                      </h3>
                      <p className="text-muted-foreground">
                        {smartject.useCase}
                      </p>
                    </div>

                    <Separator />

                    {/* Industries */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <Factory className="h-5 w-5 text-red-500" />
                        Industries
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {smartject.industries?.map((industry, index) => (
                          <Badge key={index} variant="secondary">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Business Functions */}
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                        <BriefcaseIcon className="h-5 w-5 text-orange-500" />
                        Business Functions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {smartject.businessFunctions?.map((func, index) => (
                          <Badge key={index} variant="secondary">
                            {func}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Technologies */}
                    {smartject.technologies &&
                      smartject.technologies.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                              <Cpu className="h-5 w-5 text-blue-500" />
                              Technologies
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {smartject.technologies.map((tech, index) => (
                                <Badge key={index} variant="secondary">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                    {/* Relevant Links */}
                    {smartject.researchPapers &&
                      smartject.researchPapers.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                              <LinkIcon className="h-5 w-5 text-blue-500" />
                              Relevant Links
                            </h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {smartject.researchPapers.map((link, index) => (
                                <li key={index}>
                                  <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {link.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                  </div>
                </TabsContent>

                <TabsContent value="need">
                  {isAuthenticated && user?.accountType === "paid" ? (
                    needProposals.length > 0 ? (
                      <div className="space-y-4">
                        {needProposals.map((proposal) => (
                          <div
                            key={proposal.id}
                            className="border rounded-md p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarFallback>
                                    {proposal.title.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {proposal.title}
                                </span>
                                {proposal.userId === user.id && (
                                  <Badge className="ml-2" variant="default">
                                    My Proposal
                                  </Badge>
                                )}
                              </div>
                              <Badge variant="outline">{proposal.status}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>
                                  {proposal.budget || "Not specified"}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>
                                  {proposal.timeline || "Not specified"}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                  handleRespondToProposal(proposal.id)
                                }
                              >
                                View Details
                              </Button>
                              {proposal.userId !== user.id && (
                                <Button
                                  className="flex-1"
                                  onClick={() => handleNegotiate(proposal.id)}
                                >
                                  Negotiate
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">
                          No proposals yet
                        </p>
                        <Button onClick={handleCreateProposal}>
                          Create Proposal
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        {!isAuthenticated
                          ? "Please log in to view proposals"
                          : "Upgrade to a paid account to view proposals"}
                      </p>
                      <Button asChild>
                        <Link
                          href={!isAuthenticated ? "/auth/login" : "/upgrade"}
                        >
                          {!isAuthenticated ? "Log In" : "Upgrade"}
                        </Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="provide">
                  {isAuthenticated && user?.accountType === "paid" ? (
                    provideProposals.length > 0 ? (
                      <div className="space-y-4">
                        {provideProposals.map((proposal) => (
                          <div
                            key={proposal.id}
                            className="border rounded-md p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarFallback>
                                    {proposal.title.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {proposal.title}
                                </span>
                              </div>
                              <Badge variant="outline">{proposal.status}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>
                                  {proposal.budget || "Not specified"}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>
                                  {proposal.timeline || "Not specified"}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                  handleRespondToProposal(proposal.id)
                                }
                              >
                                View Details
                              </Button>
                               {proposal.userId !== user.id && (
                                <Button
                                  className="flex-1"
                                  onClick={() => handleNegotiate(proposal.id)}
                                >
                                  Negotiate
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">
                          No proposals yet
                        </p>
                        <Button onClick={handleCreateProposal}>
                          Create Proposal
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        {!isAuthenticated
                          ? "Please log in to view proposals"
                          : "Upgrade to a paid account to view proposals"}
                      </p>
                      <Button asChild>
                        <Link
                          href={!isAuthenticated ? "/auth/login" : "/upgrade"}
                        >
                          {!isAuthenticated ? "Log In" : "Upgrade"}
                        </Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div className="flex gap-2">
                <Button
                  disabled={!isAuthenticated || isVoting}
                  variant="outline"
                  size="sm"
                  className={`flex gap-2  ${
                    smartject.userVotes?.believe
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                  onClick={() => handleVote("believe")}
                >
                  <Heart className="h-4 w-4" />
                  <span>I Believe ({smartject.votes.believe})</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className={`flex gap-2  ${
                    smartject.userVotes?.need
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                  onClick={() => handleVote("need")}
                  disabled={
                    !isAuthenticated || user?.accountType === "free" || isVoting
                  }
                >
                  <Briefcase className="h-4 w-4" />
                  <span>I Need ({smartject.votes.need})</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className={`flex gap-2  ${
                    smartject.userVotes?.provide
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                  onClick={() => handleVote("provide")}
                  disabled={
                    !isAuthenticated || user?.accountType === "free" || isVoting
                  }
                >
                  <Wrench className="h-4 w-4" />
                  <span>I Provide ({smartject.votes.provide})</span>
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="flex gap-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </CardFooter>
          </Card>

          <Tabs defaultValue="comments" className="mt-6">
            <TabsList>
              <TabsTrigger value="comments">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments ({comments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="comments" ref={commentsRef}>
              <Card>
                <CardHeader>
                  <CardTitle>Discussion</CardTitle>
                  <CardDescription>
                    Share your thoughts and insights about this smartject
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAuthenticated ? (
                    <form onSubmit={handleSubmitComment}>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Add your comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={!comment.trim() || isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Posting...
                              </>
                            ) : (
                              "Post Comment"
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <Card className="bg-muted/50">
                      <CardContent className="flex flex-col items-center justify-center py-6">
                        <p className="text-muted-foreground mb-4">
                          Please log in to join the discussion
                        </p>
                        <Button asChild>
                          <a href="/auth/login">Log In</a>
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-4 mt-6">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex gap-4 p-4 border rounded-lg"
                        >
                          <Avatar>
                            <AvatarImage
                              src={comment.user?.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {comment.user?.name.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold">
                                {comment.user?.name || "Anonymous"}
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  comment.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p>{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">
                          No comments yet. Be the first to comment!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create a Proposal</CardTitle>
              <CardDescription>
                {user?.accountType === "paid"
                  ? "Submit your proposal for this smartject"
                  : "Upgrade to create proposals"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">
                {user?.accountType === "paid"
                  ? "Create a detailed proposal specifying how you can implement this smartject or what your requirements are."
                  : "Paid accounts can create detailed proposals for smartjects they need or can provide."}
              </p>
              {isAuthenticated && user?.accountType === "paid" ? (
                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(`/proposals/create?smartjectId=${id}`)
                  }
                >
                  Create Proposal
                </Button>
              ) : (
                <Button
                  className="w-full"
                  asChild
                  disabled={!isAuthenticated} // Only disable if not authenticated
                >
                  <Link href={isAuthenticated ? "/upgrade" : "/auth/login"}>
                    {isAuthenticated
                      ? "Upgrade to Paid Account"
                      : "Log In to Create Proposal"}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
