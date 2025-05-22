"use client";

import { JSX, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Building,
  Target,
  Lightbulb,
  Factory,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import type { SmartjectType } from "@/lib/types";
import { voteService } from "@/lib/services";

interface SmartjectCardProps {
  smartject: SmartjectType;
  userVotes?: {
    believe?: boolean;
    need?: boolean;
    provide?: boolean;
  };
  onVoted: () => void;
}

export function SmartjectCard({ smartject, userVotes, onVoted }: SmartjectCardProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Constants for limiting displayed items
  const MAX_INDUSTRIES = 3;
  const MAX_BUSINESS_FUNCTIONS = 3;

  const handleVote = async (type: "believe" | "need" | "provide") => {
    if (!isAuthenticated || !user) {
      return;
    }

    const hasVoted = await voteService.vote({
      userId: user.id,
      smartjectId: smartject.id,
      voteType: type,
    });

    console.log(hasVoted);

    if (hasVoted) onVoted?.();
  };

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

  const renderClampedText = (
    icon: JSX.Element,
    label: string,
    text: string
  ) => {
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
        className={`text-sm line-clamp-2 ${isClamped ? "cursor-help" : ""}`}
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
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          {icon}
          <span className="text-muted-foreground">{label}</span>
        </div>
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
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Card Image */}
      {smartject.image && (
        <div className="relative w-full h-40 overflow-hidden">
          <Image
            src={smartject.image || "/placeholder.svg"}
            alt={smartject.title}
            fill
            className="object-contain"
          />
        </div>
      )}

      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-lg line-clamp-1">
          {smartject.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow space-y-3 px-5">
        {/* Problem */}
        {smartject.problematics &&
          renderClampedText(
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />,
            "Problem:",
            smartject.problematics
          )}

        {/* Scope */}
        {smartject.scope &&
          renderClampedText(
            <Target className="h-3.5 w-3.5 text-blue-500" />,
            "Scope:",
            smartject.scope
          )}

        {/* Use Case */}
        {smartject.useCase &&
          renderClampedText(
            <Building className="h-3.5 w-3.5 text-green-500" />,
            "Use cases:",
            smartject.useCase
          )}

        {/* Industries */}
        {smartject.industries?.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Factory className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-muted-foreground">Industries:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visibleIndustries.map((industry, i) => (
                <Badge key={i} variant="outline" className="text-xs py-0">
                  {industry}
                </Badge>
              ))}

              {hiddenIndustriesCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="text-xs py-0 cursor-pointer"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {hiddenIndustriesCount} more
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="p-2 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {smartject.industries
                          ?.slice(MAX_INDUSTRIES)
                          .map((industry, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {industry}
                            </Badge>
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
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <LayoutDashboard className="h-3.5 w-3.5 text-cyan-600" />
              <span className="text-muted-foreground">Business Functions:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visibleBusinessFunctions.map((func, i) => (
                <Badge key={i} variant="secondary" className="text-xs py-0">
                  {func}
                </Badge>
              ))}

              {hiddenBusinessFunctionsCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="text-xs py-0 cursor-pointer"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {hiddenBusinessFunctionsCount} more
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="p-2 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {smartject.businessFunctions
                          ?.slice(MAX_BUSINESS_FUNCTIONS)
                          .map((func, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-xs"
                            >
                              {func}
                            </Badge>
                          ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-0 pb-4 px-5">
        <div className="flex justify-between w-full">
          {/* Vote: Believe */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={!isAuthenticated}
                  variant="ghost"
                  size="sm"
                  className={`flex gap-1 h-8 px-2 ${
                    userVotes?.believe ? "bg-primary/10 text-primary" : ""
                  }`}
                  onClick={() => handleVote("believe")}
                >
                  <Heart className="h-4 w-4" />
                  <span>{smartject.votes.believe}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>I believe in this smartject</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Vote: Need */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex gap-1 h-8 px-2 ${
                    userVotes?.need ? "bg-primary/10 text-primary" : ""
                  }`}
                  onClick={() => handleVote("need")}
                  disabled={!isAuthenticated || user?.accountType === "free"}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>{smartject.votes.need}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>I need this smartject (paid accounts only)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Vote: Provide */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex gap-1 h-8 px-2 ${
                    userVotes?.provide ? "bg-primary/10 text-primary" : ""
                  }`}
                  onClick={() => handleVote("provide")}
                  disabled={!isAuthenticated || user?.accountType === "free"}
                >
                  <Wrench className="h-4 w-4" />
                  <span>{smartject.votes.provide}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>I can provide this smartject (paid accounts only)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Comments */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex gap-1 h-8 px-2"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/smartject/${smartject.id}#comments`);
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>{smartject.comments}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Comments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button variant="outline" className="w-full" asChild>
          <Link href={`/smartject/${smartject.id}`}>
            View Details
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
