import React from "react";
import { Heart, Settings, Package, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Provide } from "@/components/icons/Provide";

interface VotingButtonsProps {
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
  isAuthenticated: boolean;
  userAccountType?: "free" | "paid";
  isVoting: boolean;
  onVote: (type: "believe" | "need" | "provide") => void;
}

export function VotingButtons({
  votes,
  userVotes,
  isAuthenticated,
  userAccountType,
  isVoting,
  onVote,
}: VotingButtonsProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-gray-100">
      {/* I Believe - Heart */}
      <Button
        disabled={!isAuthenticated || isVoting}
        variant="ghost"
        className={`flex items-center gap-2 p-2 h-auto flex-1 ${
          userVotes?.believe
            ? " hover:bg-red-50"
            : "text-gray-500 hover:bg-gray-50"
        }`}
        onClick={() => onVote("believe")}
      >
        <Heart
          className={`h-6 w-6 ${
            userVotes?.believe ? "fill-red-500 text-red-500" : "text-gray-400"
          }`}
        />
        <span className=" text-base text-gray-500">{votes.believe}</span>
      </Button>

      {/* I Need - Settings/Gear */}
      <Button
        variant="ghost"
        className={`flex items-center gap-2 p-2 h-auto flex-1 ${
          userVotes?.need
            ? " hover:bg-green-50"
            : "text-gray-500 hover:bg-gray-50"
        }`}
        onClick={() => onVote("need")}
        disabled={!isAuthenticated || userAccountType === "free" || isVoting}
      >
        <Briefcase
          className={`h-6 w-6 ${
            userVotes?.need ? "text-green-500" : "text-gray-400"
          }`}
        />
        <span className=" text-base text-gray-500">{votes.need}</span>
      </Button>

      {/* I Provide - Package */}
      <Button
        variant="ghost"
        className={`flex items-center gap-2 p-2 h-auto flex-1  ${
          userVotes?.provide
            ? " hover:bg-blue-50"
            : "text-gray-500 hover:bg-gray-50"
        }`}
        onClick={() => onVote("provide")}
        disabled={!isAuthenticated || userAccountType === "free" || isVoting}
      >
        <Provide
          className={`h-6 w-6 ${
            userVotes?.provide
              ? "text-blue-500 stroke-blue-500"
              : "text-gray-400 stroke-gray-400"
          }`}
        />

        <span className="text-base text-gray-500">{votes.provide}</span>
      </Button>
    </div>
  );
}
