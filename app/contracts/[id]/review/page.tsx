"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useRequirePaidAccount } from "@/hooks/use-auth-guard";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  User,
  XCircle,
} from "lucide-react";
import { contractService } from "@/lib/services/contract.service";

export default function ContractReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: contractId } = use(params);

  const router = useRouter();
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [contract, setContract] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load contract data
  useEffect(() => {
    const loadContract = async () => {
      if (authLoading || !canAccess) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const contractData = await contractService.getContractById(contractId);

        if (!contractData) {
          setError("Contract not found or access denied");
          setIsLoading(false);
          return;
        }

        // Check if user is needer and contract is submitted for review
        const isNeeder = contractData.needer?.id === user?.id;

        if (!isNeeder) {
          setError("Only clients can review contracts");
          setIsLoading(false);
          return;
        }

        if (contractData.status !== "pending_review") {
          setError("Contract must be submitted for review");
          setIsLoading(false);
          return;
        }

        setContract(contractData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading contract:", error);
        setError("Failed to load contract data");
        setIsLoading(false);
      }
    };

    loadContract();
  }, [authLoading, canAccess, contractId, user?.id]);

  const handleReview = async (approved: boolean) => {
    if (!contract) return;

    setIsSubmitting(true);
    try {
      await contractService.reviewContract(
        contractId,
        approved,
        reviewComments.trim() || undefined
      );

      toast({
        title: approved ? "Contract approved" : "Contract rejected",
        description: approved
          ? "Contract has been approved and marked as completed."
          : "Contract has been rejected and returned for revision.",
      });

      // Redirect back to contract details
      router.push(`/contracts/${contractId}`);
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
          ? "Please connect your wallet to complete the contract and release escrow funds."
          : "Failed to review contract. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Redirect if not authenticated or not paid
  if (authLoading || !canAccess) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contract...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !contract) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">
              {error || "Contract not found"}
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contract
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Review Contract</h1>
          <p className="text-muted-foreground">{contract.title}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Contract Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Contract Overview</span>
              <Badge className="bg-purple-100 text-purple-800">
                Pending Review
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" /> Budget
                </p>
                <p className="font-medium">{contract.budget}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Start Date
                </p>
                <p className="font-medium">
                  {new Date(contract.start_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> End Date
                </p>
                <p className="font-medium">
                  {new Date(contract.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scope of Work</p>
              <p className="mt-1">{contract.scope}</p>
            </div>
          </CardContent>
        </Card>

        {/* Provider Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Provider Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {contract.provider?.name?.charAt(0) || "P"}
                </span>
              </div>
              <div>
                <p className="font-medium">{contract.provider?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {contract.provider?.email}
                </p>
              </div>
            </div>
            {contract.submitted_at && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Submitted for review on{" "}
                  <span className="font-medium">
                    {new Date(contract.submitted_at).toLocaleString()}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Documents */}
        {contract.documents && contract.documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Contract Documents</CardTitle>
              <CardDescription>
                Review the contract documents and deliverables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contract.documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} •{" "}
                          {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.url, "_blank")}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Form */}
        <Card>
          <CardHeader>
            <CardTitle>Review Contract</CardTitle>
            <CardDescription>
              Provide your feedback and decision on this contract submission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label htmlFor="reviewComments" className="text-sm font-medium">
                  Review Comments
                </label>
                <Textarea
                  id="reviewComments"
                  placeholder="Provide detailed feedback on the contract work..."
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  className="mt-2 min-h-[120px]"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your comments will be shared with the provider regardless of
                  your decision.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <h4 className="font-medium text-amber-800 mb-2">
                  Review Guidelines
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>
                    • Verify that all deliverables meet the agreed
                    specifications
                  </li>
                  <li>• Check that the work quality meets your expectations</li>
                  <li>
                    • Ensure all contract requirements have been fulfilled
                  </li>
                  <li>• Provide constructive feedback for any issues</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleReview(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve & Complete Contract
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleReview(false)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Request Revisions
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Once you approve this contract, it will be marked as completed
                and payment will be processed according to your contract terms.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
