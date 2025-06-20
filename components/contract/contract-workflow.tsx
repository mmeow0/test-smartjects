"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  CheckCircle,
  Clock,
  Play,
  Send,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { contractService } from "@/lib/services/contract.service"
import { useRouter } from "next/navigation"

interface ContractWorkflowProps {
  contractId: string
  currentStatus: string
  onStatusChange?: () => void
}

interface WorkflowStatus {
  canStartWork: boolean
  canSubmitForReview: boolean
  canReview: boolean
  isCompleted: boolean
  hasMilestones: boolean
  userRole: 'provider' | 'needer' | null
}

export function ContractWorkflow({ contractId, currentStatus, onStatusChange }: ContractWorkflowProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    canStartWork: false,
    canSubmitForReview: false,
    canReview: false,
    isCompleted: false,
    hasMilestones: false,
    userRole: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionMessage, setSubmissionMessage] = useState("")
  const [reviewComments, setReviewComments] = useState("")
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Load workflow status
  useEffect(() => {
    const loadWorkflowStatus = async () => {
      try {
        const status = await contractService.getContractWorkflowStatus(contractId)
        setWorkflowStatus(status)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading workflow status:", error)
        setIsLoading(false)
      }
    }

    loadWorkflowStatus()
  }, [contractId, currentStatus])

  const handleStartWork = async () => {
    setIsSubmitting(true)
    try {
      await contractService.startContractWork(contractId)
      toast({
        title: "Work started",
        description: "Contract work has been started successfully.",
      })
      onStatusChange?.()
    } catch (error) {
      console.error("Error starting work:", error)
      toast({
        title: "Error",
        description: "Failed to start contract work. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitForReview = async () => {
    setIsSubmitting(true)
    try {
      await contractService.submitContractForReview(contractId, submissionMessage.trim() || undefined)
      toast({
        title: "Submitted for review",
        description: "Contract has been submitted for client review.",
      })
      setSubmissionMessage("")
      onStatusChange?.()
    } catch (error) {
      console.error("Error submitting for review:", error)
      toast({
        title: "Error",
        description: "Failed to submit contract for review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReview = async (approved: boolean) => {
    setIsSubmitting(true)
    try {
      await contractService.reviewContract(contractId, approved, reviewComments.trim() || undefined)
      toast({
        title: approved ? "Contract approved" : "Contract rejected",
        description: approved 
          ? "Contract has been approved and marked as completed."
          : "Contract has been rejected and returned for revision.",
      })
      setReviewComments("")
      setShowReviewForm(false)
      onStatusChange?.()
    } catch (error) {
      console.error("Error reviewing contract:", error)
      toast({
        title: "Error",
        description: "Failed to review contract. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = () => {
    switch (currentStatus) {
      case "pending_start":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Start</Badge>
      case "active":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>
      case "pending_review":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Pending Review</Badge>
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{currentStatus}</Badge>
    }
  }

  const getStatusIcon = () => {
    switch (currentStatus) {
      case "pending_start":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "active":
        return <Play className="h-5 w-5 text-blue-600" />
      case "pending_review":
        return <Send className="h-5 w-5 text-purple-600" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

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
    )
  }

  // Don't show workflow controls if contract has milestones
  if (workflowStatus.hasMilestones) {
    return null
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
          {/* Start Work Action */}
          {workflowStatus.canStartWork && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="font-medium text-blue-800 mb-2">Ready to Start Work</h4>
              <p className="text-sm text-blue-700 mb-3">
                Click below to begin work on this contract and change the status to active.
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
              <h4 className="font-medium text-purple-800 mb-2">Submit for Review</h4>
              <p className="text-sm text-purple-700 mb-3">
                Submit your completed work for client review and approval.
              </p>
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a message about your completed work (optional)..."
                  value={submissionMessage}
                  onChange={(e) => setSubmissionMessage(e.target.value)}
                  className="min-h-[80px]"
                  disabled={isSubmitting}
                />
                <Button 
                  onClick={handleSubmitForReview}
                  disabled={isSubmitting}
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
              <h4 className="font-medium text-amber-800 mb-2">Review Required</h4>
              <p className="text-sm text-amber-700 mb-3">
                The provider has submitted their work for your review. Please review and approve or request changes.
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
                      Approve & Complete
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
                This contract has been completed successfully. All work has been delivered and approved.
              </p>
            </div>
          )}

          {/* Info for inactive states */}
          {!workflowStatus.canStartWork && !workflowStatus.canSubmitForReview && !workflowStatus.canReview && !workflowStatus.isCompleted && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <p className="text-sm text-gray-600">
                {workflowStatus.userRole === 'provider' 
                  ? "Wait for client approval to proceed with the next step."
                  : "The provider is currently working on this contract."
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}