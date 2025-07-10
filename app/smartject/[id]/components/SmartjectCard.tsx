import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { VotingButtons } from "./VotingButtons";

interface User {
  id: string;
  accountType: "free" | "paid";
}

interface Smartject {
  id: string;
  title: string;
  image?: string;
  createdAt: string;
  votes: {
    believe: number;
    need: number;
    provide: number;
  };
  userVotes?: {
    believe?: boolean;
    need?: boolean;
    provide?: boolean;
  };
  tags?: string[];
}

interface SmartjectCardProps {
  smartject: Smartject;
  user: User | null;
  isAuthenticated: boolean;
  isVoting: boolean;
  onVote: (type: "believe" | "need" | "provide") => void;
  onCreateProposal: (type?: "need" | "provide") => void;
  onShare: () => void;
}

export function SmartjectCard({
  smartject,
  user,
  isAuthenticated,
  isVoting,
  onVote,
  onCreateProposal,
  onShare,
}: SmartjectCardProps) {
  const isPaidUser = isAuthenticated && user?.accountType === "paid";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-6 relative">
          {/* Top Row - Date and Share */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              Created on {new Date(smartject.createdAt).toLocaleDateString()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onShare}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Center - Logo and Title */}
          <div className="flex items-center justify-center gap-4 pt-4 mr-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {smartject.image ? (
                <Image
                  src={smartject.image}
                  alt={smartject.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {smartject.title.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground">
                {smartject.title}
              </h1>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 px-6">
          {/* Center Button */}
          <div className="mb-8">
            {isPaidUser ? (
              <Button
                className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-5 text-md rounded-xl shadow-sm"
                onClick={onCreateProposal}
              >
                Create proposal
              </Button>
            ) : (
              <Button
                className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-5 text-md rounded-xl shadow-sm"
                asChild
                disabled={!isAuthenticated}
              >
                <Link href={isAuthenticated ? "/upgrade" : "/auth/login"}>
                  {isAuthenticated
                    ? "Upgrade to Create Proposal"
                    : "Log In to Create Proposal"}
                </Link>
              </Button>
            )}
          </div>

          {/* Bottom Row - Voting Statistics */}
          <VotingButtons
            votes={smartject.votes}
            userVotes={smartject.userVotes}
            isAuthenticated={isAuthenticated}
            userAccountType={user?.accountType}
            isVoting={isVoting}
            onVote={onVote}
          />
        </CardContent>
      </Card>
    </div>
  );
}
