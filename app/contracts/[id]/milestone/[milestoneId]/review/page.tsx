"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function MilestoneReviewPage({
  params,
}: {
  params: Promise<{ id: string; milestoneId: string }>;
}) {
  const { id: contractId, milestoneId } = use(params);

  const router = useRouter();
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [milestone, setMilestone] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load milestone data
  useEffect(() => {
    const loadMilestone = async () => {
      if (authLoading || !canAccess) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const milestoneData = await contractService.getMilestoneByIdEnhanced(
          contractId,
          milestoneId,
        );

        if (!milestoneData) {
          setError("Milestone not found or access denied");
          setIsLoading(false);
          return;
        }

        // Check if user is needer and milestone is submitted for review
        if (milestoneData.userRole !== "needer") {
          setError("Only clients can review milestones");
          setIsLoading(false);
          return;
        }

        if (milestoneData.status !== "pending_review") {
          setError("Milestone must be submitted for review");
          setIsLoading(false);
          return;
        }

        setMilestone(milestoneData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading milestone:", error);
        setError("Failed to load milestone data");
        setIsLoading(false);
      }
    };

    loadMilestone();
  }, [authLoading, canAccess, contractId, milestoneId]);

  const handleReview = async (approved: boolean) => {
    if (!milestone) return;

    setIsSubmitting(true);
    try {
      await contractService.reviewMilestone(
        milestoneId,
        approved,
        reviewComments.trim() || undefined,
      );

      toast({
        title: approved ? "Milestone approved" : "Milestone rejected",
        description: approved
          ? "Milestone has been approved and marked as completed."
          : "Milestone has been rejected and returned for revision.",
      });

      // Redirect back to milestone details
      router.push(`/contracts/${contractId}/milestone/${milestoneId}`);
    } catch (error) {
      console.error("Error reviewing milestone:", error);
      toast({
        title: "Error",
        description: "Failed to review milestone. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
            <p className="text-muted-foreground">Loading milestone...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !milestone) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">
              {error || "Milestone not found"}
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
          Back to Milestone
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Review Milestone</h1>
          <p className="text-muted-foreground">
            {milestone.name} - {milestone.contractTitle}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Milestone Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Milestone Overview</span>
              <Badge className="bg-purple-100 text-purple-800">
                Pending Review
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" /> Payment
                </p>
                <p className="font-medium">{milestone.amount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Progress
                </p>
                <p className="font-medium">{milestone.percentage}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Due Date
                </p>
                <p className="font-medium">
                  {milestone.dueDate
                    ? new Date(milestone.dueDate).toLocaleDateString()
                    : "TBD"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="mt-1">{milestone.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Submission Info */}
        {milestone.submittedForReview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Submission Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="text-sm text-muted-foreground">
                    Submitted by:
                  </span>{" "}
                  <span className="font-medium">
                    {milestone.submittedBy?.name}
                  </span>
                </p>
                {milestone.submittedAt && (
                  <p>
                    <span className="text-sm text-muted-foreground">
                      Submitted on:
                    </span>{" "}
                    <span className="font-medium">
                      {new Date(milestone.submittedAt).toLocaleString()}
                    </span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deliverables */}
        {milestone.deliverables && milestone.deliverables.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Deliverables</CardTitle>
              <CardDescription>
                Review the completed deliverables for this milestone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestone.deliverables.map((deliverable: any) => (
                  <div
                    key={deliverable.id}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    {deliverable.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{deliverable.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {deliverable.description}
                      </p>
                      {deliverable.status === "completed" &&
                        deliverable.completedDate && (
                          <p className="text-xs text-green-600 mt-1">
                            Completed on{" "}
                            {new Date(
                              deliverable.completedDate,
                            ).toLocaleDateString()}
                          </p>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Files */}
        {milestone.files && milestone.files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files</CardTitle>
              <CardDescription>
                Files submitted with this milestone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {milestone.files.map((file: any) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • Uploaded by{" "}
                          <Link
                            href={`/profile/${file.uploadedById}`}
                            className="hover:underline"
                          >
                            {file.uploadedBy}
                          </Link>{" "}
                          • {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.url, "_blank")}
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
            <CardTitle>Review Milestone</CardTitle>
            <CardDescription>
              Provide your feedback and decision on this milestone submission
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
                  placeholder="Provide detailed feedback on the milestone submission..."
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
                    • Check that all deliverables meet the agreed specifications
                  </li>
                  <li>
                    • Verify that uploaded files are complete and accessible
                  </li>
                  <li>• Ensure the work quality meets your expectations</li>
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
                  Approve Milestone
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
                Once you approve this milestone, payment will be processed
                according to your contract terms.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
