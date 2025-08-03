"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Clock,
  Send,
  XCircle,
  Loader2,
  ExternalLink,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { contractService } from "@/lib/services/contract.service";

interface ContractCompletionProps {
  contractId: string;
  currentStatus: string;
  onStatusChange?: () => void;
}

interface CompletionStatus {
  allMilestonesCompleted: boolean;
  canSubmitForFinalReview: boolean;
  canReviewCompletion: boolean;
  isAwaitingFinalReview: boolean;
  isCompleted: boolean;
  userRole: "provider" | "needer" | null;
}

export function ContractCompletion({
  contractId,
  currentStatus,
  onStatusChange,
}: ContractCompletionProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    allMilestonesCompleted: false,
    canSubmitForFinalReview: false,
    canReviewCompletion: false,
    isAwaitingFinalReview: false,
    isCompleted: false,
    userRole: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [reviewComments, setReviewComments] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Load completion status
  useEffect(() => {
    const loadCompletionStatus = async () => {
      try {
        const status =
          await contractService.getContractCompletionStatus(contractId);
        setCompletionStatus(status);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading completion status:", error);
        setIsLoading(false);
      }
    };

    loadCompletionStatus();
  }, [contractId, currentStatus]);

  const handleSubmitForFinalReview = async () => {
    setIsSubmitting(true);
    try {
      await contractService.submitContractForFinalReview(contractId);
      toast({
        title: "Contract submitted for final review",
        description:
          "The client will now review the completed contract for final approval.",
      });
      setSubmissionMessage("");
      onStatusChange?.();
    } catch (error) {
      console.error("Error submitting for final review:", error);
      toast({
        title: "Error",
        description:
          "Failed to submit contract for final review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewCompletion = async (approved: boolean) => {
    setIsSubmitting(true);
    try {
      await contractService.reviewContractCompletion(
        contractId,
        approved,
        reviewComments.trim() || undefined,
      );
      toast({
        title: approved
          ? "Contract completed!"
          : "Contract completion rejected",
        description: approved
          ? "🎉 Contract has been completed successfully!"
          : "Contract has been returned to active status for further work.",
      });
      setReviewComments("");
      setShowReviewForm(false);
      onStatusChange?.();
    } catch (error: any) {
      console.error("Error reviewing contract completion:", error);

      // Check if error is related to wallet connection
      const isWalletError =
        error.message?.includes("Wallet not connected") ||
        error.message?.includes("wallet") ||
        error.message?.includes("connect your wallet");

      toast({
        title: isWalletError ? "Wallet Required" : "Error",
        description: isWalletError
          ? "Please connect your wallet to complete the contract and release escrow funds."
          : "Failed to review contract completion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading completion status...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if contract is already completed
  if (completionStatus.isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Trophy className="h-5 w-5" />
            Contract Completed Successfully!
            <Badge className="bg-green-100 text-green-800">Completed</Badge>
          </CardTitle>
          <CardDescription>
            🎊 Congratulations! This contract has been completed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-700">
              All milestones have been delivered and the contract has been
              approved by the client. Great work on completing this project!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show if not all milestones are completed yet
  if (
    !completionStatus.allMilestonesCompleted &&
    !completionStatus.isAwaitingFinalReview
  ) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Contract Completion
          {completionStatus.isAwaitingFinalReview && (
            <Badge className="bg-purple-100 text-purple-800">
              Awaiting Final Review
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {completionStatus.allMilestonesCompleted &&
            "All milestones have been completed"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* All Milestones Completed Notice */}
          {completionStatus.allMilestonesCompleted &&
            !completionStatus.isAwaitingFinalReview && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  All Milestones Completed!
                </h4>
                <p className="text-sm text-green-700 mb-3">
                  🎉 Congratulations! All milestones for this contract have been
                  completed successfully.
                </p>
              </div>
            )}

          {/* Submit for Final Review Action */}
          {completionStatus.canSubmitForFinalReview && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                Ready for Final Review
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Submit the contract for final client approval to officially
                complete the project.
              </p>
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a final message about the completed project (optional)..."
                  value={submissionMessage}
                  onChange={(e) => setSubmissionMessage(e.target.value)}
                  className="min-h-[80px]"
                  disabled={isSubmitting}
                />
                <Button
                  onClick={handleSubmitForFinalReview}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Submit for Final Review
                </Button>
              </div>
            </div>
          )}

          {/* Final Review Actions */}
          {completionStatus.canReviewCompletion && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Final Contract Review Required
              </h4>
              <p className="text-sm text-amber-700 mb-3">
                All milestones have been completed. Please review the entire
                contract and provide final approval.
              </p>

              <div className="flex gap-2 mb-3">
                <Button
                  onClick={() => router.push(`/contracts/${contractId}/review`)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Detailed Review
                </Button>
                {!showReviewForm ? (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    variant="outline"
                    className="border-amber-300 text-amber-800 hover:bg-amber-100"
                  >
                    Quick Review
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowReviewForm(false)}
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {showReviewForm && (
                <div className="space-y-3 mt-4 pt-4 border-t border-amber-200">
                  <Textarea
                    placeholder="Add your final review comments (optional)..."
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    className="min-h-[80px]"
                    disabled={isSubmitting}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReviewCompletion(true)}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trophy className="h-4 w-4 mr-2" />
                      )}
                      Complete Contract
                    </Button>
                    <Button
                      onClick={() => handleReviewCompletion(false)}
                      disabled={isSubmitting}
                      variant="destructive"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Request Additional Work
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Awaiting Final Review State */}
          {completionStatus.isAwaitingFinalReview &&
            !completionStatus.canReviewCompletion && (
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Awaiting Final Client Approval
                </h4>
                <p className="text-sm text-purple-700">
                  The contract has been submitted for final review. The client
                  will review all completed work and provide final approval to
                  complete the contract.
                </p>
              </div>
            )}

          {/* Info Guidelines */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="font-medium text-gray-800 mb-2">
              Final Review Process
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• All milestones must be completed before final review</li>
              <li>• Provider submits contract for final approval</li>
              <li>• Client reviews all delivered work and milestones</li>
              <li>• Final approval completes the contract officially</li>
              <li>• Contract completion triggers final payment processing</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
