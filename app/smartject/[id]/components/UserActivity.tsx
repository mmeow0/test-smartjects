"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ProposalType, ContractListType } from "@/lib/types";

interface UserActivityProps {
  userProposals: ProposalType[];
  userContracts: {
    activeContracts: ContractListType[];
    completedContracts: ContractListType[];
  };
  unreadProposalCounts: { [proposalId: string]: number };
  unreadContractCounts: { [contractId: string]: number };
  onViewProposal: (proposalId: string) => void;
  onViewContract: (contractId: string) => void;
}

export function UserActivity({
  userProposals,
  userContracts,
  unreadProposalCounts,
  unreadContractCounts,
  onViewProposal,
  onViewContract,
}: UserActivityProps) {
  const { activeContracts, completedContracts } = userContracts;
  const hasActivity =
    userProposals.length > 0 ||
    activeContracts.length > 0 ||
    completedContracts.length > 0;

  if (!hasActivity) {
    return null;
  }

  const getProposalStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "in_negotiation":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending_start":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatBudget = (budget: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  };

  return (
    <div className="space-y-6">
      {/* User Proposals Section */}
      {userProposals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Proposals ({userProposals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userProposals.map((proposal) => (
              <div
                key={proposal.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{proposal.title}</h4>
                      <Badge
                        variant="secondary"
                        className={getProposalStatusColor(proposal.status)}
                      >
                        {proposal.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">
                        {proposal.type === "need" ? "Need" : "Provide"}
                      </Badge>
                      {unreadProposalCounts[proposal.id] > 0 && (
                        <Badge
                          variant="destructive"
                          className="bg-red-500 text-white animate-pulse shadow-lg border-red-400"
                        >
                          {unreadProposalCounts[proposal.id]} new
                        </Badge>
                      )}
                    </div>

                    {proposal.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {proposal.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {proposal.budget && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatBudget(proposal.budget)}
                        </div>
                      )}
                      {proposal.timeline && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {proposal.timeline}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(proposal.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProposal(proposal.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Contracts Section */}
      {activeContracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Active Contracts ({activeContracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeContracts.map((contract) => (
              <div
                key={contract.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{contract.smartjectTitle}</h4>
                      <Badge
                        variant="secondary"
                        className={getContractStatusColor(contract.status)}
                      >
                        {contract.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {contract.role}
                      </Badge>
                      {unreadContractCounts[contract.id] > 0 && (
                        <Badge
                          variant="destructive"
                          className="bg-red-500 text-white animate-pulse shadow-lg border-red-400"
                        >
                          {unreadContractCounts[contract.id]} new
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      With {contract.otherParty}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatBudget(contract.budget)}
                      </div>
                      {contract.nextMilestone && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Next: {contract.nextMilestone}
                        </div>
                      )}
                      {contract.nextMilestoneDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due:{" "}
                          {new Date(
                            contract.nextMilestoneDate,
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewContract(contract.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Completed Contracts Section */}
      {completedContracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completed Contracts ({completedContracts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedContracts.map((contract) => (
              <div
                key={contract.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{contract.smartjectTitle}</h4>
                      <Badge
                        variant="secondary"
                        className={getContractStatusColor(contract.status)}
                      >
                        Completed
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {contract.role}
                      </Badge>
                      {unreadContractCounts[contract.id] > 0 && (
                        <Badge
                          variant="destructive"
                          className="bg-red-500 text-white animate-pulse shadow-lg border-red-400"
                        >
                          {unreadContractCounts[contract.id]} new
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      With {contract.otherParty}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatBudget(contract.budget)}
                      </div>
                      {contract.finalMilestone && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {contract.finalMilestone}
                        </div>
                      )}
                      {contract.completionDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Completed:{" "}
                          {new Date(
                            contract.completionDate,
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewContract(contract.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
