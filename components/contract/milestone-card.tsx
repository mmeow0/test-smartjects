"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  Eye,
} from "lucide-react"

interface MilestoneCardProps {
  milestone: {
    id: string
    name: string
    description: string
    percentage: number
    amount: string
    status: string
    completedDate?: string
    dueDate?: string
    submittedForReview: boolean
    submittedAt?: string
    submittedBy?: {
      id: string
      name: string
    }
    reviewedAt?: string
    reviewedBy?: {
      id: string
      name: string
    }
    reviewStatus?: string
    reviewComments?: string
    deliverables: string[]
    comments: any[]
  }
  contractId: string
  userRole: "provider" | "needer"
  isExpanded?: boolean
  onToggleExpanded?: () => void
}

export function MilestoneCard({
  milestone,
  contractId,
  userRole,
  isExpanded = false,
  onToggleExpanded,
}: MilestoneCardProps) {
  const router = useRouter()

  const getMilestoneStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Completed
          </Badge>
        )
      case "submitted":
        return (
          <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Submitted for Review
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="h-3 w-3" /> In Progress
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Overdue
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getBackgroundColor = () => {
    switch (milestone.status) {
      case "completed":
        return "bg-green-50"
      case "submitted":
        return "bg-purple-50"
      case "in_progress":
        return "bg-blue-50"
      default:
        return ""
    }
  }

  const canSubmitForReview = userRole === "provider" && 
    milestone.status === "in_progress" && 
    !milestone.submittedForReview

  const canReview = userRole === "needer" && milestone.status === "pending_review"

  const isOverdue = milestone.dueDate && 
    new Date(milestone.dueDate) < new Date() && 
    milestone.status !== "completed"

  return (
    <Card className="overflow-hidden">
      <div
        className={`p-4 ${isExpanded ? "border-b" : ""} ${getBackgroundColor()} cursor-pointer`}
        onClick={onToggleExpanded}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">{milestone.name}</h3>
              {getMilestoneStatusBadge(milestone.status)}
              {isOverdue && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Overdue
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Amount:</span>{" "}
                <span className="font-medium">{milestone.amount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Progress:</span>{" "}
                <span className="font-medium">{milestone.percentage}%</span>
              </div>
              {milestone.dueDate && (
                <div>
                  <span className="text-muted-foreground">Due:</span>{" "}
                  <span className="font-medium">
                    {new Date(milestone.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center ml-4">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>

        {/* Quick status info */}
        {milestone.submittedForReview && milestone.submittedBy && (
          <div className="mt-3 p-3 bg-blue-100 rounded-md">
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

        {milestone.reviewStatus && milestone.reviewedBy && (
          <div className={`mt-3 p-3 rounded-md ${
            milestone.reviewStatus === "approved" ? "bg-green-100" : "bg-red-100"
          }`}>
            <div className="flex items-center gap-2 text-sm">
              {milestone.reviewStatus === "approved" ? (
                <Check className="h-4 w-4 text-green-600" />
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
      </div>

      {isExpanded && (
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Deliverables */}
            <div>
              <h4 className="text-sm font-medium mb-2">Deliverables</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {milestone.deliverables?.map((deliverable: string, index: number) => (
                  <li key={index}>{deliverable}</li>
                )) || <li>No deliverables specified</li>}
              </ul>
            </div>

            {/* Completion info */}
            {milestone.status === "completed" && milestone.completedDate && (
              <div>
                <h4 className="text-sm font-medium mb-2">Completion Details</h4>
                <p className="text-sm">
                  Completed on{" "}
                  <span className="font-medium">
                    {new Date(milestone.completedDate).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}

            {/* Comments */}
            {milestone.comments && milestone.comments?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Comments</h4>
                <div className="space-y-2">
                  {milestone.comments?.slice(-2).map((comment: any, index: number) => (
                    <div key={index} className="bg-muted/30 p-3 rounded-md text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{comment.user}</span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(comment.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p>{comment.content}</p>
                    </div>
                  ))}
                  {milestone.comments.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      and {milestone.comments.length - 2} more comments...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              {canSubmitForReview && (
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/contracts/${contractId}/milestone/${milestone.id}`)
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Submit for Review
                </Button>
              )}
              
              {canReview && (
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/contracts/${contractId}/milestone/${milestone.id}`)
                  }}
                >
                  <User className="h-4 w-4 mr-1" />
                  Review Milestone
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/contracts/${contractId}/milestone/${milestone.id}`)
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/contracts/${contractId}/milestone/${milestone.id}`)
                }}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}