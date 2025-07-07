import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
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

interface SmartjectTabsProps {
  smartject: Smartject;
  needProposals: Proposal[];
  provideProposals: Proposal[];
  user: User | null;
  isAuthenticated: boolean;
  onViewProposalDetails: (proposalId: string) => void;
  onNegotiate: (proposalId: string) => void;
  onCreateProposal: () => void;
}

export function SmartjectTabs({
  smartject,
  needProposals,
  provideProposals,
  user,
  isAuthenticated,
  onViewProposalDetails,
  onNegotiate,
  onCreateProposal,
}: SmartjectTabsProps) {
  return (
    <Card className="h-fit">
      <CardContent className="p-4">
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
                              I Need ({needProposals.length})
                            </TabsTrigger>
                          </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      This tab is available only for users who voted "I Provide"
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <TabsTrigger
                  value="need"
                  className="flex-1"
                >
                  I Need ({needProposals.length})
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
                              I Provide ({provideProposals.length})
                            </TabsTrigger>
                          </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      This tab is available only for users who voted "I Need"
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <TabsTrigger
                  value="provide"
                  className="flex-1"
                >
                  I Provide ({provideProposals.length})
                </TabsTrigger>
              )}
            </TabsList>

            <div className="p-6">
              <TabsContent value="details" className="mt-0">
                <SmartjectDetails smartject={smartject} />
              </TabsContent>

              <TabsContent value="need" className="mt-0">
                <ProposalsList
                  proposals={needProposals}
                  currentUser={user}
                  isAuthenticated={isAuthenticated}
                  onViewDetails={onViewProposalDetails}
                  onNegotiate={onNegotiate}
                  onCreateProposal={onCreateProposal}
                />
              </TabsContent>

              <TabsContent value="provide" className="mt-0">
                <ProposalsList
                  proposals={provideProposals}
                  currentUser={user}
                  isAuthenticated={isAuthenticated}
                  onViewDetails={onViewProposalDetails}
                  onNegotiate={onNegotiate}
                  onCreateProposal={onCreateProposal}
                />
              </TabsContent>
            </div>
          </Tabs>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
