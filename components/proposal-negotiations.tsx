"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useProposalNegotiations } from "@/hooks/use-proposal-negotiations";
import { MessageSquare, Calendar, ArrowRight, Handshake } from "lucide-react";

interface ProposalNegotiationsProps {
  proposalId: string;
  isProposalOwner: boolean;
  interestedUsers?: Array<{
    id: string;
    proposalId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    createdAt: string;
  }>;
  isLoadingInterestedUsers?: boolean;
}

export function ProposalNegotiations({
  proposalId,
  isProposalOwner,
}: ProposalNegotiationsProps) {
  const router = useRouter();
  const [showCompleted, setShowCompleted] = useState(false);
  const { conversations, completedConversations, isLoading } =
    useProposalNegotiations(proposalId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "completed":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="text-red-600 border-red-600">
            Cancelled
          </Badge>
        );
      case "contract_created":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Contract Created
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
      case "interest_only":
        return (
          <Badge
            variant="outline"
            className="text-xs text-blue-500 border-blue-500"
          >
            Interest Only
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

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">
            {isProposalOwner ? "Inquiries & Discussions" : "Negotiations"}
          </h3>
          <p className="text-muted-foreground">
            {isProposalOwner
              ? "Users interested in your proposal and active discussions"
              : "Your discussions about this proposal"}
          </p>
        </div>
        {(conversations.length > 0 || completedConversations.length > 0) && (
          <div className="flex gap-2">
            <Button
              variant={!showCompleted ? "default" : "outline"}
              onClick={() => setShowCompleted(false)}
              size="sm"
            >
              Active ({conversations.length})
            </Button>
            <Button
              variant={showCompleted ? "default" : "outline"}
              onClick={() => setShowCompleted(true)}
              size="sm"
            >
              Completed ({completedConversations.length})
            </Button>
          </div>
        )}
      </div>

      {/* Active/Completed Negotiations */}
      {(!showCompleted && conversations.length === 0) ||
      (showCompleted && completedConversations.length === 0) ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {showCompleted
                ? "No Completed Negotiations"
                : "No Active Negotiations"}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {showCompleted
                ? "You don't have any completed negotiations for this proposal yet."
                : isProposalOwner
                  ? "No one has started negotiating on your proposal yet."
                  : "You don't have any active discussions for this proposal yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(showCompleted ? completedConversations : conversations).map(
            (conversation) => (
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
                          {isProposalOwner
                            ? conversation.activeNegotiations[0]?.status ===
                              "interest_only"
                              ? "Expressed interest only"
                              : "Interested in your proposal"
                            : "Discussion partner"}
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
                      <Calendar className="h-4 w-4 text-muted-foreground" />
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
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className="font-medium">
                          {conversation.activeNegotiations[0]?.status &&
                            getNegotiationStatusBadge(
                              conversation.activeNegotiations[0].status,
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Show negotiation details */}
                  {conversation.activeNegotiations.map((negotiation) => (
                    <div
                      key={negotiation.proposalId}
                      className="bg-muted/30 rounded-md p-3 mb-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium">
                            {negotiation.smartjectTitle}
                          </h5>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>💰 {negotiation.budget}</span>
                            <span>⏰ {negotiation.timeline}</span>
                            <span>
                              💬 {negotiation.messageCount}{" "}
                              {negotiation.status === "interest_only"
                                ? "interest expressions"
                                : "messages"}
                            </span>
                          </div>
                        </div>
                        {showCompleted ? (
                          <div className="flex gap-2">
                            {negotiation.status === "contract_created" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/matches/${negotiation.matchId}/contract/${negotiation.proposalId}`,
                                  )
                                }
                              >
                                View Contract
                              </Button>
                            )}
                          </div>
                        ) : (
                          null
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {showCompleted
                        ? `Completed discussion with this user`
                        : `${isProposalOwner ? "Active discussion" : "In discussion"} with this user`}
                    </div>
                    {!showCompleted && (
                      <Button
                        onClick={() => {
                          const negotiation =
                            conversation.activeNegotiations[0];
                          router.push(
                            `/matches/${negotiation.matchId}/negotiate/${negotiation.proposalId}/${conversation.otherParty.id}`,
                          );
                        }}
                        className="ml-4"
                      >
                        Continue Conversation
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
