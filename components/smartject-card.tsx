"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import type { SmartjectType } from "@/lib/types"
import { voteService } from "@/lib/services"
import { useToast } from "@/hooks/use-toast"

interface SmartjectCardProps {
  smartject: SmartjectType
}

export function SmartjectCard({ smartject }: SmartjectCardProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [votes, setVotes] = useState(smartject.votes)
  const [isVoting, setIsVoting] = useState(false)

  // Constants for limiting displayed items
  const MAX_INDUSTRIES = 3
  const MAX_BUSINESS_FUNCTIONS = 3

  const handleVote = async (type: "believe" | "need" | "provide") => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote for smartjects",
        variant: "destructive",
      })
      return
    }

    if (user?.accountType !== "paid" && (type === "need" || type === "provide")) {
      toast({
        title: "Paid account required",
        description: `Only paid accounts can vote "${type}" for smartjects`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsVoting(true)

      // Check if user has already voted
      const hasVoted = await voteService.hasUserVoted(user!.id, smartject.id, type)

      // Toggle vote
      await voteService.vote({
        userId: user!.id,
        smartjectId: smartject.id,
        voteType: type,
      })

      // Update local state
      setVotes((prev) => ({
        ...prev,
        [type]: hasVoted ? prev[type] - 1 : prev[type] + 1,
      }))

      toast({
        title: hasVoted ? "Vote removed" : "Vote added",
        description: hasVoted
          ? `You've removed your "${type}" vote for this smartject`
          : `You've voted "${type}" for this smartject`,
      })
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "There was an error processing your vote",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  // Determine which industries to show directly
  const visibleIndustries = smartject.industries?.slice(0, MAX_INDUSTRIES) || []
  const hiddenIndustriesCount = (smartject.industries?.length || 0) - MAX_INDUSTRIES

  // Determine which business functions to show directly
  const visibleBusinessFunctions = smartject.businessFunctions?.slice(0, MAX_BUSINESS_FUNCTIONS) || []
  const hiddenBusinessFunctionsCount = (smartject.businessFunctions?.length || 0) - MAX_BUSINESS_FUNCTIONS

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Card Image */}
      {smartject.image && (
        <div className="relative w-full h-40 overflow-hidden">
          <Image src={smartject.image || "/placeholder.svg"} alt={smartject.title} fill className="object-cover" />
        </div>
      )}

      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-lg line-clamp-1">{smartject.title}</CardTitle>
      </CardHeader>

      <CardContent className="flex-grow space-y-3 px-5">
        {/* Problem */}
        {smartject.problematics && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-muted-foreground">Problem:</span>
            </div>
            <p className="text-sm line-clamp-2">{smartject.problematics}</p>
          </div>
        )}

        {/* Scope */}
        {smartject.scope && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Target className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-muted-foreground">Scope:</span>
            </div>
            <p className="text-sm line-clamp-2">{smartject.scope}</p>
          </div>
        )}

        {/* Use Case */}
        {smartject.useCase && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Building className="h-3.5 w-3.5 text-green-500" />
              <span className="text-muted-foreground">Use cases:</span>
            </div>
            <p className="text-sm line-clamp-2">{smartject.useCase}</p>
          </div>
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
                      <Badge variant="outline" className="text-xs py-0 cursor-pointer">
                        <Plus className="h-3 w-3 mr-1" />
                        {hiddenIndustriesCount} more
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="p-2 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {smartject.industries?.slice(MAX_INDUSTRIES).map((industry, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
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
                      <Badge variant="secondary" className="text-xs py-0 cursor-pointer">
                        <Plus className="h-3 w-3 mr-1" />
                        {hiddenBusinessFunctionsCount} more
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="p-2 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {smartject.businessFunctions?.slice(MAX_BUSINESS_FUNCTIONS).map((func, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
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
                  disabled={!isAuthenticated || isVoting}
                  variant="ghost"
                  size="sm"
                  className="flex gap-1 h-8 px-2"
                  onClick={() => handleVote("believe")}
                >
                  <Heart className="h-4 w-4" />
                  <span>{votes.believe}</span>
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
                  className="flex gap-1 h-8 px-2"
                  onClick={() => handleVote("need")}
                  disabled={!isAuthenticated || user?.accountType === "free" || isVoting}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>{votes.need}</span>
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
                  className="flex gap-1 h-8 px-2"
                  onClick={() => handleVote("provide")}
                  disabled={!isAuthenticated || user?.accountType === "free" || isVoting}
                >
                  <Wrench className="h-4 w-4" />
                  <span>{votes.provide}</span>
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
                    e.preventDefault()
                    router.push(`/smartject/${smartject.id}#comments`)
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
  )
}
