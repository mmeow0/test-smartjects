"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Heart,
  Briefcase,
  Wrench,
  MessageSquare,
  ChevronRight,
  Factory,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import type { SmartjectType } from "@/lib/types";
import { voteService } from "@/lib/services";
import { useToast } from "@/hooks/use-toast";
import { Audience } from "@/components/icons/Audience";
import { Functions } from "@/components/icons/Functions";
import { Industries } from "@/components/icons/Industries";
import { Provide } from "./icons/Provide";

interface SmartjectCardProps {
  smartject: SmartjectType;
  userVotes?: {
    believe?: boolean;
    need?: boolean;
    provide?: boolean;
  };
  onVoted: () => void;
}

export function SmartjectCard({
  smartject,
  userVotes,
  onVoted,
}: SmartjectCardProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Constants for limiting displayed items
  const MAX_INDUSTRIES = 2;
  const MAX_BUSINESS_FUNCTIONS = 2;

  const handleVote = async (type: "believe" | "need" | "provide") => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote.",
        variant: "destructive",
      });
      return;
    }

    try {
      const hasVoted = await voteService.vote({
        userId: user.id,
        smartjectId: smartject.id,
        voteType: type,
      });

      if (hasVoted) {
        toast({
          title: "Vote Recorded",
          description: `You voted '${type}' for this smartject.`,
        });
        onVoted?.();
      } else {
        toast({
          title: "Already Voted",
          description: `You have already voted '${type}' for this smartject.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while voting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const visibleAudience = smartject.audience?.slice(0, MAX_INDUSTRIES) || [];
  const hiddenAudienceCount =
    (smartject.audience?.length || 0) - MAX_INDUSTRIES;

  // Determine which industries to show directly
  const visibleIndustries =
    smartject.industries?.slice(0, MAX_INDUSTRIES) || [];
  const hiddenIndustriesCount =
    (smartject.industries?.length || 0) - MAX_INDUSTRIES;

  // Determine which business functions to show directly
  const visibleBusinessFunctions =
    smartject.businessFunctions?.slice(0, MAX_BUSINESS_FUNCTIONS) || [];
  const hiddenBusinessFunctionsCount =
    (smartject.businessFunctions?.length || 0) - MAX_BUSINESS_FUNCTIONS;

  const renderGradientSection = (label: string, text: string) => {
    const textRef = useRef<HTMLParagraphElement>(null);
    const [isClamped, setIsClamped] = useState(false);

    useEffect(() => {
      const el = textRef.current;
      if (el) {
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight || "0");
        const maxLines = 2;
        const maxHeight = lineHeight * maxLines;
        if (el.scrollHeight > maxHeight) {
          setIsClamped(true);
        }
      }
    }, [text]);

    const content = (
      <p
        ref={textRef}
        className={`text-sm text-gray-700 leading-relaxed line-clamp-2 ${
          isClamped ? "cursor-help" : ""
        }`}
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {text}
      </p>
    );

    return (
      <div className="bg-gradient-to-r from-yellow-50 to-transparent border-l-4 border-yellow-300 p-4 rounded-r-lg">
        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
          {label}
        </h4>
        <TooltipProvider delayDuration={500}>
          {isClamped ? (
            <Tooltip>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent className="max-w-xs p-2">{text}</TooltipContent>
            </Tooltip>
          ) : (
            content
          )}
        </TooltipProvider>
      </div>
    );
  };

  return (
    <Card className="bg-white rounded-lg border border-gray-200 p-4 space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {smartject.image ? (
            <img
              src={smartject.image}
              alt="Smartject Image"
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full" />
              </div>
            </div>
          )}
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
            {smartject.title}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700 flex-shrink-0 border"
          onClick={() => router.push(`/smartject/${smartject.id}`)}
        >
          More
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-grow space-y-4">
        {/* Problem */}
        {smartject.problematics &&
          renderGradientSection("PROBLEM", smartject.problematics)}

        {/* Scope */}
        {smartject.scope && renderGradientSection("SCOPE", smartject.scope)}

        {/* Use Cases */}
        {smartject.useCase &&
          renderGradientSection("USE CASES", smartject.useCase)}

        {/* Tags sections */}
        <div className="space-y-3">
          {/* Industries */}
          {smartject.industries?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Industries className="h-[25px]" />
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Industries
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleIndustries.map((industry, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  >
                    {industry}
                  </span>
                ))}

                {hiddenIndustriesCount > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs cursor-pointer flex items-center">
                          <Plus className="h-3 w-3 mr-1" />
                          {hiddenIndustriesCount} more
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="p-2 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {smartject.industries
                            ?.slice(MAX_INDUSTRIES)
                            .map((industry, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {industry}
                              </span>
                            ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          )}

          {/* Tags sections */}
          <div className="space-y-4">
            {/* Industries */}
            {smartject.audience && smartject.audience?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Audience className="h-[25px]" />
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Audience
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {visibleAudience.map((industry, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {industry}
                    </span>
                  ))}

                  {hiddenAudienceCount > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs cursor-pointer flex items-center">
                            <Plus className="h-3 w-3 mr-1" />
                            {hiddenAudienceCount} more
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="p-2 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {smartject.audience
                              ?.slice(MAX_INDUSTRIES)
                              .map((industry, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {industry}
                                </span>
                              ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            )}

            {/* Business Functions */}
            {smartject.businessFunctions?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Functions className="h-[25px]" />
                  <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Business Functions
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {visibleBusinessFunctions.map((func, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {func}
                    </span>
                  ))}

                  {hiddenBusinessFunctionsCount > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs cursor-pointer flex items-center">
                            <Plus className="h-3 w-3 mr-1" />
                            {hiddenBusinessFunctionsCount} more
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="p-2 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {smartject.businessFunctions
                              ?.slice(MAX_BUSINESS_FUNCTIONS)
                              .map((func, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {func}
                                </span>
                              ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  disabled={!isAuthenticated}
                  className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                    userVotes?.believe ? "text-red-500" : ""
                  }
                  ${
                    !isAuthenticated
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : "hover:text-red-500"
                  }`}
                  onClick={() => handleVote("believe")}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      userVotes?.believe ? "fill-current" : ""
                    }`}
                  />
                  <span>{smartject.votes.believe}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>I believe in this smartject</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  disabled={!isAuthenticated || user?.accountType === "free"}
                  className={`flex items-center gap-1 transition-colors
                  ${userVotes?.need ? "text-green-500" : ""}
                  ${
                    !isAuthenticated || user?.accountType === "free"
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : "hover:text-green-500"
                  }
                `}
                  onClick={() => handleVote("need")}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>{smartject.votes.need}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>I need this smartject (paid accounts only)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  disabled={!isAuthenticated || user?.accountType === "free"}
                  className={`flex items-center gap-1 transition-colors ${
                    userVotes?.provide ? "stroke-blue-500 text-blue-500" : ""
                  }
                  ${
                    !isAuthenticated || user?.accountType === "free"
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : "hover:stroke-blue-500 hover:text-blue-500"
                  }`}
                  onClick={() => handleVote("provide")}
                >
                  <Provide
                    className={`h-[18px] ${
                      userVotes?.provide
                        ? "text-blue-500 stroke-blue-500"
                        : "text-gray-400 stroke-gray-400"
                    } hover:text-blue-500 hover:stroke-blue-500`}
                  />
                  <span>{smartject.votes.provide}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>I can provide this smartject (paid accounts only)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/smartject/${smartject.id}#comments`);
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{smartject.comments}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Comments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
}
