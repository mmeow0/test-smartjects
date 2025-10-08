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
import {
  CheckCircle,
  Clock,
  Play,
  Send,
  XCircle,
  Loader2,
  ExternalLink,
  DollarSign,
  Handshake,
  Wallet,
} from "lucide-react";
import { contractService } from "@/lib/services/contract.service";
import { useRouter } from "next/navigation";

interface ContractWorkflowProps {
  contractId: string;
  currentStatus: string;
  onStatusChange?: () => void;
}

interface WorkflowStatus {
  canStartWork: boolean;
  canSubmitForReview: boolean;
  canReview: boolean;
  isCompleted: boolean;
  hasMilestones: boolean;
  userRole: "provider" | "needer" | null;
  canFundContract: boolean;
  canAcceptAgreement: boolean;
  isFunded: boolean;
  isAccepted: boolean;
  canWithdrawEscrow: boolean;
  escrowReleased: boolean;
}

export function ContractWorkflow({
  contractId,
  currentStatus,
  onStatusChange,
}: ContractWorkflowProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    canStartWork: false,
    canSubmitForReview: false,
    canReview: false,
    isCompleted: false,
    hasMilestones: false,
    userRole: null,
    canFundContract: false,
    canAcceptAgreement: false,
    isFunded: false,
    isAccepted: false,
    canWithdrawEscrow: false,
    escrowReleased: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [reviewComments, setReviewComments] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Handler functions
  const handleFundContract = async () => {
    setIsSubmitting(true);
    try {
      const result = await contractService.fundContract(contractId);
      if (result.success) {
        toast({
          title: "Contract funded",
          description:
            result.message || "Contract has been funded successfully.",
        });
        onStatusChange?.();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to fund contract.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error funding contract:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to fund contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptAgreement = async () => {
    setIsSubmitting(true);
    try {
      const result = await contractService.acceptAgreement(contractId);
      if (result.success) {
        toast({
          title: "Agreement accepted",
          description:
            result.message || "Agreement has been accepted successfully.",
        });
        onStatusChange?.();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to accept agreement.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error accepting agreement:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to accept agreement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check and recover acceptance state
  const checkAcceptanceState = async () => {
    console.log("🔄 checkAcceptanceState called:");
    console.log("   - currentStatus:", currentStatus);
    console.log("   - userRole:", workflowStatus.userRole);
    console.log("   - contractId:", contractId);

    if (
      currentStatus !== "pending_acceptance" ||
      workflowStatus.userRole !== "provider"
    ) {
      console.log("❌ Skipping acceptance check - conditions not met");
      return;
    }

    console.log("✅ Conditions met, proceeding with acceptance check...");

    try {
      // Check for interrupted acceptance transactions
      console.log("🔍 Checking for interrupted acceptance transactions...");
      const interruptedResult =
        await contractService.checkInterruptedTransactions(contractId);

      console.log("📋 Interrupted transaction result:", interruptedResult);

      if (
        interruptedResult.hasInterrupted &&
        interruptedResult.transactionType === "acceptance"
      ) {
        console.log("⚠️ Found interrupted acceptance transaction");
        console.log("📋 Interrupted message:", interruptedResult.message);

        if (interruptedResult.message.includes("completed successfully")) {
          console.log(
            "✅ Interrupted transaction was successful, triggering refresh",
          );
          // Trigger status refresh to show updated state
          onStatusChange?.();
        }
      } else {
        console.log(
          "🔍 No interrupted acceptance transaction, trying direct recovery...",
        );
        // Also try to recover acceptance state in case it was missed
        const recoveryResult =
          await contractService.recoverAcceptanceState(contractId);

        console.log("📋 Direct recovery result:", recoveryResult);

        if (recoveryResult.recovered) {
          console.log("✅ Acceptance state recovered via direct recovery");
          onStatusChange?.();
        } else {
          console.log(
            "ℹ️ No acceptance recovery needed:",
            recoveryResult.message,
          );
        }
      }
    } catch (error) {
      console.error("❌ Error checking acceptance state:", error);
    }
  };

  // Check and recover completion state
  const checkCompletionState = async () => {
    console.log("🔄 checkCompletionState called:");
    console.log("   - currentStatus:", currentStatus);
    console.log("   - userRole:", workflowStatus.userRole);
    console.log("   - contractId:", contractId);

    if (
      (currentStatus !== "pending_review" && currentStatus !== "completed") ||
      workflowStatus.userRole !== "needer"
    ) {
      console.log("❌ Skipping completion check - conditions not met");
      return;
    }

    console.log("✅ Conditions met, proceeding with completion check...");

    try {
      // Check for interrupted completion transactions
      console.log("🔍 Checking for interrupted completion transactions...");
      const interruptedResult =
        await contractService.checkInterruptedTransactions(contractId);

      console.log("📋 Interrupted transaction result:", interruptedResult);

      if (
        interruptedResult.hasInterrupted &&
        interruptedResult.transactionType === "completion"
      ) {
        console.log("⚠️ Found interrupted completion transaction");
        console.log("📋 Interrupted message:", interruptedResult.message);

        if (interruptedResult.message.includes("completed successfully")) {
          console.log(
            "✅ Interrupted transaction was successful, triggering refresh",
          );
          // Trigger status refresh to show updated state
          onStatusChange?.();
        }
      } else {
        console.log(
          "🔍 No interrupted completion transaction, trying direct recovery...",
        );
        // Also try to recover completion state in case it was missed
        const recoveryResult =
          await contractService.recoverCompletionState(contractId);

        console.log("📋 Direct recovery result:", recoveryResult);

        if (recoveryResult.recovered) {
          console.log("✅ Completion state recovered via direct recovery");
          onStatusChange?.();
        } else {
          console.log(
            "ℹ️ No completion recovery needed:",
            recoveryResult.message,
          );
        }
      }
    } catch (error) {
      console.error("❌ Error checking completion state:", error);
    }
  };

  // Check and recover withdrawal state
  const checkWithdrawalState = async () => {
    console.log("🔄 checkWithdrawalState called:");
    console.log("   - currentStatus:", currentStatus);
    console.log("   - userRole:", workflowStatus.userRole);
    console.log("   - contractId:", contractId);

    if (
      currentStatus !== "completed" ||
      workflowStatus.userRole !== "provider"
    ) {
      console.log("❌ Skipping withdrawal check - conditions not met");
      return;
    }

    console.log("✅ Conditions met, proceeding with withdrawal check...");

    try {
      // Check for interrupted withdrawal transactions
      console.log("🔍 Checking for interrupted withdrawal transactions...");
      const interruptedResult =
        await contractService.checkInterruptedTransactions(contractId);

      console.log("📋 Interrupted transaction result:", interruptedResult);

      if (
        interruptedResult.hasInterrupted &&
        interruptedResult.transactionType === "withdrawal"
      ) {
        console.log("⚠️ Found interrupted withdrawal transaction");
        console.log("📋 Interrupted message:", interruptedResult.message);

        if (interruptedResult.message.includes("completed successfully")) {
          console.log(
            "✅ Interrupted transaction was successful, triggering refresh",
          );
          // Trigger status refresh to show updated state
          onStatusChange?.();
        }
      } else {
        console.log(
          "🔍 No interrupted withdrawal transaction, trying direct recovery...",
        );
        // Also try to recover withdrawal state in case it was missed
        const recoveryResult =
          await contractService.recoverWithdrawalState(contractId);

        console.log("📋 Direct recovery result:", recoveryResult);

        if (recoveryResult.recovered) {
          console.log("✅ Withdrawal state recovered via direct recovery");
          onStatusChange?.();
        } else {
          console.log(
            "ℹ️ No withdrawal recovery needed:",
            recoveryResult.message,
          );
        }
      }
    } catch (error) {
      console.error("❌ Error checking withdrawal state:", error);
    }
  };

  const handleWithdrawEscrow = async () => {
    setIsSubmitting(true);
    try {
      const result = await contractService.withdrawEscrow(contractId);
      if (result.success) {
        toast({
          title: "Escrow withdrawn",
          description:
            result.message || "Escrow funds have been withdrawn successfully.",
        });
        onStatusChange?.();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to withdraw escrow.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error withdrawing escrow:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to withdraw escrow. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartWork = async () => {
    setIsSubmitting(true);
    try {
      await contractService.startContractWork(contractId);
      toast({
        title: "Work started",
        description: "Contract work has been started successfully.",
      });
      onStatusChange?.();
    } catch (error) {
      console.error("Error starting work:", error);
      toast({
        title: "Error",
        description: "Failed to start contract work. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!submissionMessage.trim()) {
      toast({
        title: "Deliverables required",
        description: "Please describe the deliverables and work completed.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await contractService.submitContractForReview(
        contractId,
        submissionMessage.trim(),
      );
      toast({
        title: "Submitted for review",
        description:
          "Contract has been submitted for client review. Work completion is recorded off-chain.",
      });
      setSubmissionMessage("");
      onStatusChange?.();
    } catch (error: any) {
      console.error("Error submitting for review:", error);

      // Check if error is related to wallet connection
      const isWalletError =
        error.message?.includes("Wallet not connected") ||
        error.message?.includes("wallet") ||
        error.message?.includes("connect your wallet");

      toast({
        title: isWalletError ? "Wallet Required" : "Error",
        description: isWalletError
          ? "Please connect your wallet to record the submission."
          : "Failed to submit contract for review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (approved: boolean) => {
    setIsSubmitting(true);
    try {
      await contractService.reviewContract(
        contractId,
        approved,
        reviewComments.trim() || undefined,
      );
      toast({
        title: approved ? "Contract approved" : "Contract rejected",
        description: approved
          ? "Contract has been approved and completed on the blockchain. The provider can now withdraw the escrow funds from the smart contract."
          : "Contract has been rejected and returned for revision.",
      });
      setReviewComments("");
      setShowReviewForm(false);
      onStatusChange?.();
    } catch (error: any) {
      console.error("Error reviewing contract:", error);

      // Check if error is related to wallet connection
      const isWalletError =
        error.message?.includes("Wallet not connected") ||
        error.message?.includes("wallet") ||
        error.message?.includes("connect your wallet");

      toast({
        title: isWalletError ? "Wallet Required" : "Error",
        description: isWalletError
          ? "Please connect your wallet to complete the agreement and enable fund withdrawal."
          : "Failed to review contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load workflow status
  useEffect(() => {
    const loadWorkflowStatus = async () => {
      try {
        const status =
          await contractService.getContractWorkflowStatus(contractId);

        // Get contract details to check funding and acceptance status
        const contract = await contractService.getContractById(contractId);

        console.log(
          "canAcceptAgreement",
          status.userRole,
          currentStatus,
          contract?.escrow_funded,
          contract?.blockchain_status,
          status.userRole === "provider" &&
            currentStatus === "pending_acceptance" &&
            contract?.escrow_funded &&
            contract?.blockchain_status !== "accepted",
        );

        setWorkflowStatus({
          ...status,
          canFundContract:
            status.userRole === "needer" &&
            currentStatus === "pending_funding" &&
            !contract?.escrow_funded,
          canAcceptAgreement:
            status.userRole === "provider" &&
            currentStatus === "pending_acceptance" &&
            contract?.escrow_funded &&
            contract?.blockchain_status !== "accepted",
          isFunded: contract?.escrow_funded || false,
          isAccepted: contract?.blockchain_status === "accepted" || false,
          canWithdrawEscrow:
            status.userRole === "provider" &&
            status.isCompleted &&
            contract?.blockchain_status !== "completed" &&
            contract?.escrow_funded &&
            !contract?.escrow_released,
          escrowReleased: contract?.escrow_released || false,
        });
        setIsLoading(false);

        // Check for interrupted transactions first
        try {
          console.log("🔍 Checking for interrupted transactions on mount...");
          const interruptedResult =
            await contractService.checkInterruptedTransactions(contractId);

          if (interruptedResult.hasInterrupted) {
            console.log(
              "⚠️ Found interrupted transaction on mount:",
              interruptedResult.transactionType,
            );

            if (interruptedResult.message.includes("completed successfully")) {
              console.log(
                "✅ Interrupted transaction was successful, triggering refresh",
              );
              // Trigger status refresh to show updated state
              onStatusChange?.();
              return; // Exit early, let the refresh handle the rest
            }
          }
        } catch (interruptedError) {
          console.error(
            "Error checking interrupted transactions on mount:",
            interruptedError,
          );
        }

        // Check for acceptance recovery after loading status
        await checkAcceptanceState();

        // Also check for completion recovery if applicable
        await checkCompletionState();

        // Also check for withdrawal recovery if applicable
        await checkWithdrawalState();
      } catch (error) {
        console.error("Error loading workflow status:", error);
        setIsLoading(false);
      }
    };

    loadWorkflowStatus();
  }, [contractId, currentStatus]);

  const getStatusBadge = () => {
    switch (currentStatus) {
      case "pending_funding":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            Pending Funding
          </Badge>
        );
      case "pending_acceptance":
        return (
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
            Pending Acceptance
          </Badge>
        );
      case "pending_start":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending Start
          </Badge>
        );
      case "active":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            In Progress
          </Badge>
        );
      case "pending_review":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Pending Review
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{currentStatus}</Badge>;
    }
  };

  const getStatusIcon = () => {
    switch (currentStatus) {
      case "pending_funding":
        return <DollarSign className="h-5 w-5 text-amber-600" />;
      case "pending_acceptance":
        return <Handshake className="h-5 w-5 text-indigo-600" />;
      case "pending_start":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "active":
        return <Play className="h-5 w-5 text-blue-600" />;
      case "pending_review":
        return <Send className="h-5 w-5 text-purple-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Loading workflow status...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Contract Workflow
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Manage contract progress and completion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Fund Contract Action (for needer) */}
          {workflowStatus.canFundContract && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h4 className="font-medium text-amber-800 mb-2">Fund Contract</h4>
              <p className="text-sm text-amber-700 mb-3">
                Both parties have signed the contract. Now fund the contract to
                create the smart contract agreement with escrow.
              </p>
              <Button
                onClick={handleFundContract}
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <DollarSign className="h-4 w-4 mr-2" />
                )}
                Fund Contract
              </Button>
            </div>
          )}

          {/* Accept Agreement Action (for provider) */}
          {workflowStatus.canAcceptAgreement && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
              <h4 className="font-medium text-indigo-800 mb-2">
                Accept Agreement
              </h4>
              <p className="text-sm text-indigo-700 mb-3">
                The contract has been funded. Accept the agreement to begin work
                on this contract.
                <br />
                <strong>⚠️ Important:</strong> Do not refresh or close this page
                during acceptance.
              </p>
              <Button
                onClick={handleAcceptAgreement}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Handshake className="h-4 w-4 mr-2" />
                )}
                Accept Agreement
              </Button>
              {isSubmitting && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800 text-center font-medium">
                    ⚠️ Transaction in progress - do not refresh this page!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Start Work Action */}
          {workflowStatus.canStartWork && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-800 mb-2">
                Ready to Start Work
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Click below to begin work on this contract and change the status
                to active.
              </p>
              <Button
                onClick={handleStartWork}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Start Work
              </Button>
            </div>
          )}

          {/* Submit for Review Action */}
          {workflowStatus.canSubmitForReview && (
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <h4 className="font-medium text-purple-800 mb-2">
                Submit for Review
              </h4>
              <p className="text-sm text-purple-700 mb-3">
                Submit your completed work for client review and approval.
                {workflowStatus.userRole === "provider" && (
                  <span className="block mt-1 font-medium">
                    Work completion is tracked off-chain. Client approval will
                    complete the agreement on the blockchain.
                  </span>
                )}
              </p>
              <div className="space-y-3">
                <Textarea
                  placeholder="Describe the deliverables and work completed..."
                  value={submissionMessage}
                  onChange={(e) => setSubmissionMessage(e.target.value)}
                  className="min-h-[80px]"
                  disabled={isSubmitting}
                />
                <Button
                  onClick={handleSubmitForReview}
                  disabled={isSubmitting || !submissionMessage.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Submit for Review
                </Button>
              </div>
            </div>
          )}

          {/* Review Actions */}
          {workflowStatus.canReview && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h4 className="font-medium text-amber-800 mb-2">
                Review Required
              </h4>
              <p className="text-sm text-amber-700 mb-3">
                The provider has submitted their work for your review. Please
                review and approve or request changes.
                <span className="block mt-1 font-medium text-amber-900">
                  ⚠️ Important: Approving will complete the agreement on the
                  blockchain, allowing the provider to withdraw the escrowed
                  funds.
                </span>
              </p>

              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(`/contracts/${contractId}/review`)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Review Contract
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
                <div className="space-y-3 mt-4">
                  <Textarea
                    placeholder="Add your review comments (optional)..."
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    className="min-h-[80px]"
                    disabled={isSubmitting}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReview(true)}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve & Complete Agreement
                    </Button>
                    <Button
                      onClick={() => handleReview(false)}
                      disabled={isSubmitting}
                      variant="destructive"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Request Changes
                    </Button>
                  </div>
                  {isSubmitting && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-xs text-yellow-800 text-center font-medium">
                        ⚠️ Transaction in progress - do not refresh this page!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Completed State */}
          {workflowStatus.isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Contract Completed
              </h4>
              <p className="text-sm text-green-700">
                This contract has been completed successfully. All work has been
                delivered and approved.
              </p>
            </div>
          )}

          {/* Withdraw Escrow Action (for provider after completion) */}
          {workflowStatus.canWithdrawEscrow && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Withdraw Escrow Funds
              </h4>
              <p className="text-sm text-green-700 mb-3">
                The contract has been completed and approved. You can now
                withdraw the escrow funds from the smart contract.
              </p>
              <Button
                onClick={handleWithdrawEscrow}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wallet className="h-4 w-4 mr-2" />
                )}
                Withdraw Escrow
              </Button>
              {isSubmitting && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800 text-center font-medium">
                    ⚠️ Transaction in progress - do not refresh this page!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Escrow Already Withdrawn */}
          {workflowStatus.userRole === "provider" &&
            workflowStatus.isCompleted &&
            workflowStatus.escrowReleased && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-gray-600" />
                  Escrow Withdrawn
                </h4>
                <p className="text-sm text-gray-600">
                  The escrow funds have been successfully withdrawn from this
                  contract.
                </p>
              </div>
            )}

          {/* Info for inactive states */}
          {!workflowStatus.canFundContract &&
            !workflowStatus.canAcceptAgreement &&
            !workflowStatus.canStartWork &&
            !workflowStatus.canSubmitForReview &&
            !workflowStatus.canReview &&
            !workflowStatus.isCompleted && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-sm text-gray-600">
                  {currentStatus === "pending_funding" &&
                  workflowStatus.userRole === "provider"
                    ? "Waiting for the client to fund the contract."
                    : currentStatus === "pending_acceptance" &&
                        workflowStatus.userRole === "needer"
                      ? "Waiting for the provider to accept the agreement."
                      : workflowStatus.userRole === "provider"
                        ? "Wait for client approval to proceed with the next step."
                        : "The provider is currently working on this contract."}
                </p>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
