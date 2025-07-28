import React from "react";
import Link from "next/link";
import { Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Proposal {
  id: string;
  title: string;
  userId: string;
  status: string;
  budget?: string;
  timeline?: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface User {
  id: string;
  accountType: "free" | "paid";
}

interface ProposalsListProps {
  proposals: Proposal[];
  currentUser: User | null;
  isAuthenticated: boolean;
  onViewDetails: (proposalId: string) => void;
  onNegotiate: (proposalId: string) => void;
  onCreateProposal: () => void;
}

export function ProposalsList({
  proposals,
  currentUser,
  isAuthenticated,
  onViewDetails,
  onNegotiate,
  onCreateProposal,
}: ProposalsListProps) {
  // Check if user has access (authenticated and paid account)
  const hasAccess = isAuthenticated && currentUser?.accountType === "paid";

  if (!hasAccess) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-4">
          {!isAuthenticated
            ? "Please log in to view proposals"
            : "Upgrade to a paid account to view proposals"}
        </p>
        <Button asChild>
          <Link href={!isAuthenticated ? "/auth/login" : "/upgrade"}>
            {!isAuthenticated ? "Log In" : "Upgrade"}
          </Link>
        </Button>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-4">No proposals yet</p>
        <Button
          onClick={onCreateProposal}
          className="bg-yellow-400 hover:bg-yellow-500 text-black"
        >
          Create Proposal
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {proposals.map((proposal) => (
        <div key={proposal.id} className="border rounded-md p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-start flex-1 mr-2">
              <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                <AvatarFallback>
                  {proposal.user?.name?.charAt(0) || proposal.title.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div
                  className="font-medium line-clamp-2 cursor-help"
                  title={proposal.title}
                >
                  {proposal.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {proposal.user?.name && (
                    <Link
                      href={`/profile/${proposal.userId}`}
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      by {proposal.user.name}
                    </Link>
                  )}
                  {proposal.userId === currentUser?.id && (
                    <Badge className="bg-yellow-500" variant="default">
                      My Proposal
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="flex-shrink-0">
              {proposal.status}
            </Badge>
          </div>

          <div className="flex justify-between gap-4 mb-4">
            <div className="flex items-center flex-1">
              <DollarSign className="h-4 w-4 mr-1 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate text-muted-foreground">
                {proposal.budget || "Not specified"}
              </span>
            </div>
            <div className="flex items-center flex-1 justify-end">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate text-muted-foreground">
                {proposal.timeline || "Not specified"}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onViewDetails(proposal.id)}
            >
              View Details
            </Button>
            {proposal.userId !== currentUser?.id && (
              <Button
                className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-black"
                onClick={() => onNegotiate(proposal.id)}
              >
                Negotiate
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
