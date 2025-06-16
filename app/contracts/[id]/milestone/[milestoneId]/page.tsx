"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  XCircle,
  Loader2,
  Download,
} from "lucide-react"
import { contractService } from "@/lib/services"

interface Milestone {
  id: string
  contractId: string
  contractTitle: string
  name: string
  description: string
  percentage: number
  amount: string
  dueDate: string
  status: string
  completedDate?: string
  deliverables: Array<{
    id: string
    name: string
    description: string
    status: string
    completedDate?: string
  }>
  comments: Array<{
    id: string
    user: string
    content: string
    date: string
  }>
  documents: Array<{
    id: string
    name: string
    type: string
    size: string
    url: string
    uploadedAt: string
  }>
  canReview: boolean
  userRole: string
}

export default function MilestoneDetailsPage({ params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  const { id, milestoneId } = use(params);
  
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [comment, setComment] = useState("")
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load milestone data
  useEffect(() => {
    const loadMilestone = async () => {
      if (!isAuthenticated) {
        router.push("/auth/login")
        return
      }
      
      if (user?.accountType !== "paid") {
        router.push("/upgrade")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const milestoneData = await contractService.getMilestoneById(id, milestoneId)
        
        if (!milestoneData) {
          setError("Milestone not found or access denied")
          setIsLoading(false)
          return
        }

        setMilestone(milestoneData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading milestone:", error)
        setError("Failed to load milestone data")
        setIsLoading(false)
      }
    }

    loadMilestone()
  }, [isAuthenticated, user, id, milestoneId, router])

  // Redirect if not authenticated or not paid
  if (!isAuthenticated || user?.accountType !== "paid") {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-4xl">
            <CardHeader className="text-center">
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Please wait while we load your milestone details.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !milestone) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-4xl">
            <CardHeader className="text-center">
              <CardTitle>Error</CardTitle>
              <CardDescription>{error || "Milestone not found"}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleAddComment = async () => {
    if (!comment.trim() || isAddingComment) return

    setIsAddingComment(true)

    try {
      const newComment = await contractService.addMilestoneComment(milestoneId, comment.trim())
      
      setMilestone(prev => prev ? {
        ...prev,
        comments: [...prev.comments, newComment]
      } : null)

      setComment("")
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingComment(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (isUpdatingStatus) return

    setIsUpdatingStatus(true)

    try {
      await contractService.updateMilestoneStatus(milestoneId, newStatus)
      
      setMilestone(prev => prev ? {
        ...prev,
        status: newStatus,
        completedDate: newStatus === "completed" ? new Date().toISOString() : prev.completedDate
      } : null)

      toast({
        title: "Status updated",
        description: `Milestone status updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending_review":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "pending_review":
        return <MessageSquare className="h-4 w-4" />
      case "overdue":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const isOverdue = new Date(milestone.dueDate) < new Date() && milestone.status !== "completed"

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{milestone.name}</h1>
          <p className="text-muted-foreground">
            For contract: <span className="font-medium">{milestone.contractTitle}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Milestone Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {milestone.name}
                    <Badge className={`${getStatusColor(milestone.status)} border-0`}>
                      {getStatusIcon(milestone.status)}
                      <span className="ml-1 capitalize">{milestone.status.replace('_', ' ')}</span>
                    </Badge>
                    {isOverdue && (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Overdue
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{milestone.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Payment</p>
                    <p className="font-medium">{milestone.amount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {new Date(milestone.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="font-medium">{milestone.percentage}%</p>
                  </div>
                </div>
              </div>

              {milestone.completedDate && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  <span>Completed on {new Date(milestone.completedDate).toLocaleDateString()}</span>
                </div>
              )}

              {milestone.canReview && milestone.status !== "completed" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate("in_progress")}
                    disabled={isUpdatingStatus}
                    variant={milestone.status === "in_progress" ? "default" : "outline"}
                  >
                    {isUpdatingStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Mark In Progress"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate("pending_review")}
                    disabled={isUpdatingStatus}
                    variant={milestone.status === "pending_review" ? "default" : "outline"}
                  >
                    Request Review
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate("completed")}
                    disabled={isUpdatingStatus}
                    variant="outline"
                  >
                    Mark Complete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Milestone Info */}
        <div className="space-y-6">
          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deliverables</CardTitle>
            </CardHeader>
            <CardContent>
              {milestone.deliverables.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deliverables defined for this milestone.</p>
              ) : (
                <div className="space-y-3">
                  {milestone.deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="flex items-start gap-3">
                      <div className="mt-1">
                        {deliverable.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{deliverable.name}</p>
                        <p className="text-xs text-muted-foreground">{deliverable.description}</p>
                        {deliverable.completedDate && (
                          <p className="text-xs text-green-600 mt-1">
                            Completed {new Date(deliverable.completedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          {milestone.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {milestone.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.size}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comments & Updates</CardTitle>
          <CardDescription>
            Communicate with the other party about this milestone
          </CardDescription>
        </CardHeader>
        <CardContent>
          {milestone.comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Be the first to add a comment!</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {milestone.comments.map((comment) => (
                <div key={comment.id} className="border-l-2 border-muted pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">{comment.user}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.date).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full space-y-3">
            <Textarea
              placeholder="Add a comment about this milestone..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isAddingComment}
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!comment.trim() || isAddingComment}
                size="sm"
              >
                {isAddingComment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}