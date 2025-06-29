import React from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SmartjectDetails } from "./SmartjectDetails";
import { ProposalsList } from "./ProposalsList";

interface Proposal {
  id: string;
  title: string;
  userId: string;
  status: string;
  budget?: string;
  timeline?: string;
}

interface User {
  id: string;
  accountType: "free" | "paid";
}

interface Smartject {
  id: string;
  title: string;
  image?: string;
  mission: string;
  problematics: string;
  scope: string;
  howItWorks: string;
  architecture: string;
  innovation: string;
  useCase: string;
  industries?: string[];
  businessFunctions?: string[];
  audience?: string[];
  researchPapers?: Array<{
    title: string;
    url: string;
  }>;
  userVotes?: {
    believe?: boolean;
    need?: boolean;
    provide?: boolean;
  };
  createdAt: string;
}

interface SmartjectContentProps {
  smartject: Smartject;
  needProposals: Proposal[];
  provideProposals: Proposal[];
  user: User | null;
  isAuthenticated: boolean;
  onViewProposalDetails: (proposalId: string) => void;
  onNegotiate: (proposalId: string) => void;
  onCreateProposal: () => void;
}

export function SmartjectContent({
  smartject,
  needProposals,
  provideProposals,
  user,
  isAuthenticated,
  onViewProposalDetails,
  onNegotiate,
  onCreateProposal,
}: SmartjectContentProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2 mb-2">
          {/* Tags could be added here if available in smartject data */}
        </div>
        <CardTitle className="text-2xl">{smartject.title}</CardTitle>
        <CardDescription>
          Created on {new Date(smartject.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="details" className="flex-1">
                Details
              </TabsTrigger>

              {/* Need Proposals tab - disabled if user hasn't voted "provide" */}
              {!smartject.userVotes?.provide ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1">
                      <TabsTrigger
                        value="need"
                        className="flex-1 w-full opacity-50 cursor-not-allowed"
                        disabled
                      >
                        Need Proposals ({needProposals.length})
                      </TabsTrigger>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This tab is available only for users who voted "I Provide"</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <TabsTrigger value="need" className="flex-1">
                  Need Proposals ({needProposals.length})
                </TabsTrigger>
              )}

              {/* Provide Proposals tab - disabled if user hasn't voted "need" */}
              {!smartject.userVotes?.need ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1">
                      <TabsTrigger
                        value="provide"
                        className="flex-1 w-full opacity-50 cursor-not-allowed"
                        disabled
                      >
                        Provide Proposals ({provideProposals.length})
                      </TabsTrigger>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This tab is available only for users who voted "I Need"</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <TabsTrigger value="provide" className="flex-1">
                  Provide Proposals ({provideProposals.length})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details">
              <SmartjectDetails smartject={smartject} />
            </TabsContent>

            <TabsContent value="need">
              <ProposalsList
                proposals={needProposals}
                currentUser={user}
                isAuthenticated={isAuthenticated}
                onViewDetails={onViewProposalDetails}
                onNegotiate={onNegotiate}
                onCreateProposal={onCreateProposal}
              />
            </TabsContent>

            <TabsContent value="provide">
              <ProposalsList
                proposals={provideProposals}
                currentUser={user}
                isAuthenticated={isAuthenticated}
                onViewDetails={onViewProposalDetails}
                onNegotiate={onNegotiate}
                onCreateProposal={onCreateProposal}
              />
            </TabsContent>
          </Tabs>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
