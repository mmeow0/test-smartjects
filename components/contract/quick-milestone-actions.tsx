"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  Send,
  Loader2,
  ArrowRight,
  Eye,
} from "lucide-react"
import { contractService } from "@/lib/services"

interface QuickMilestoneActionsProps {
  milestone: {
    id: string
    name: string
    status: string
    submittedForReview: boolean
    submittedAt?: string
    submittedBy?: {
      id: string
      name: string
    }
    reviewStatus?: string
    reviewComments?: string
    reviewedBy?: {
      id: string
      name: string
    }
    reviewedAt?: string
  }
  contractId: string
  userRole: "provider" | "needer"
  onMilestoneUpdate?: () => void
  className?: string
}

export function QuickMilestoneActions({
  milestone,
  contractId,
  userRole,
  onMilestoneUpdate,
  className = "",
}: QuickMilestoneActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewComments, setReviewComments] = useState("")
  const [quickMessage, setQuickMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  const canSubmitForReview = userRole === "provider" && 
    milestone.status === "in_progress" && 
    !milestone.submittedForReview

  const canReview = userRole === "needer" && milestone.status === "submitted"

  const handleSubmitForReview = async () => {
    setIsSubmitting(true)
    try {
      await contractService.submitMilestoneForReview(
        milestone.id, 
        "Milestone completed and ready for review"
      )
      
      toast({
        title: "Milestone submitted",
        description: "Milestone has been submitted for client review.",
      })
      
      onMilestoneUpdate?.()
    } catch (error) {
      console.error("Error submitting milestone:", error)
      toast({
        title: "Error",
        description: "Failed to submit milestone. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReview = async (approved: boolean) => {
    setIsReviewing(true)
    try {
      await contractService.reviewMilestone(
        milestone.id, 
        approved, 
        reviewComments.trim() || undefined
      )
      
      setReviewComments("")
      toast({
        title: approved ? "Milestone approved" : "Milestone rejected",
        description: approved 
          ? "Milestone has been approved and marked as completed."
          : "Milestone has been rejected and returned for revision.",
      })
      
      onMilestoneUpdate?.()
    } catch (error) {
      console.error("Error reviewing milestone:", error)
      toast({
        title: "Error",
        description: "Failed to review milestone. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsReviewing(false)
    }
  }

  const handleSendQuickMessage = async () => {
    if (!quickMessage.trim()) return

    setIsSendingMessage(true)
    try {
      await contractService.sendMilestoneMessage(milestone.id, quickMessage.trim())
      setQuickMessage("")
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingMessage(false)
    }
  }

  const getMilestoneStatusInfo = () => {
    switch (milestone.status) {
      case "completed":
        return {
          badge: (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Completed
            </Badge>
          ),
          description: "This milestone has been completed and approved.",
          color: "text-green-600"
        }
      case "submitted":
        return {
          badge: (
            <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Submitted for Review
            </Badge>
          ),
          description: userRole === "provider" 
            ? "Waiting for client review and approval."
            : "Ready for your review - please approve or reject.",
          color: "text-purple-600"
        }
      case "in_progress":
        return {
          badge: (
            <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
              <Clock className="h-3 w-3" /> In Progress
            </Badge>
          ),
          description: userRole === "provider"
            ? "Continue working on this milestone."
            : "Provider is working on this milestone.",
          color: "text-blue-600"
        }
      default:
        return {
          badge: (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Pending
            </Badge>
          ),
          description: "This milestone is waiting to be started.",
          color: "text-gray-600"
        }
    }
  }

  const statusInfo = getMilestoneStatusInfo()

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{milestone.name}</CardTitle>
            <CardDescription>Quick actions for this milestone</CardDescription>
          </div>
          {statusInfo.badge}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status info */}
        <div className={`text-sm ${statusInfo.color}`}>
          {statusInfo.description}
        </div>

        {/* Submission info */}
        {milestone.submittedForReview && milestone.submittedBy && (
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span>
                Submitted by <strong>{milestone.submittedBy.name}</strong>
                {milestone.submittedAt && (
                  <span className="text-muted-foreground">
                    {" "}on {new Date(milestone.submittedAt).toLocaleDateString()}
                  </span>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Review info */}
        {milestone.reviewStatus && milestone.reviewedBy && (
          <div className={`p-3 rounded-md ${
            milestone.reviewStatus === "approved" ? "bg-green-50" : "bg-red-50"
          }`}>
            <div className="flex items-center gap-2 text-sm">
              {milestone.reviewStatus === "approved" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>
                {milestone.reviewStatus === "approved" ? "Approved" : "Rejected"} by{" "}
                <strong>{milestone.reviewedBy.name}</strong>
                {milestone.reviewedAt && (
                  <span className="text-muted-foreground">
                    {" "}on {new Date(milestone.reviewedAt).toLocaleDateString()}
                  </span>
                )}
              </span>
            </div>
            {milestone.reviewComments && (
              <p className="text-sm mt-2 italic">"{milestone.reviewComments}"</p>
            )}
          </div>
        )}

        <Separator />

        {/* Action buttons */}
        <div className="space-y-3">
          {canSubmitForReview && (
            <Button 
              className="w-full"
              onClick={handleSubmitForReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Submit for Review
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}

          {canReview && (
            <div className="space-y-3">
              <Textarea
                placeholder="Add review comments (optional)..."
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleReview(true)}
                  disabled={isReviewing}
                >
                  {isReviewing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleReview(false)}
                  disabled={isReviewing}
                >
                  {isReviewing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Quick message */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Message</label>
          <div className="flex gap-2">
            <Textarea
              placeholder="Send a quick message about this milestone..."
              value={quickMessage}
              onChange={(e) => setQuickMessage(e.target.value)}
              className="min-h-[60px] resize-none"
              rows={2}
            />
            <Button 
              onClick={handleSendQuickMessage}
              disabled={!quickMessage.trim() || isSendingMessage}
              size="sm"
              className="self-end"
            >
              {isSendingMessage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Navigation buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push(`/contracts/${contractId}/milestone/${milestone.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push(`/contracts/${contractId}/milestone/${milestone.id}`)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Open Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}