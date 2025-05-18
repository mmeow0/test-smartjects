"use client"

import { useEffect, useState } from "react"
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
} from "lucide-react"

export default function MilestoneDetailsPage({ params }: { params: { id: string; milestoneId: string } }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [authChecked, setAuthChecked] = useState(false)

  // Check authentication first
  useEffect(() => {
    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      setAuthChecked(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Handle redirects after auth check
  useEffect(() => {
    if (!authChecked) return

    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login")
      router.push("/auth/login")
    } else if (user && user.accountType !== "paid") {
      console.log("Not a paid user, redirecting to upgrade")
      router.push("/upgrade")
    } else {
      // Simulate loading data
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }, [authChecked, isAuthenticated, router, user])

  // Show loading state while checking auth
  if (!authChecked) {
    return null
  }

  // If not authenticated or not a paid user, don't render anything (redirect will happen)
  if (!isAuthenticated || (user && user.accountType !== "paid") || isLoading) {
    return null
  }

  // Mock milestone data
  const milestone = {
    id: params.milestoneId,
    contractId: params.id,
    name: "Midpoint Delivery",
    description: "Data integration and initial model development",
    percentage: 30,
    amount: "$5,250",
    dueDate: "2024-02-28",
    status: "pending_review", // completed, in_progress, pending, pending_review, overdue
    deliverables: [
      {
        name: "Data integration framework",
        description: "Framework for integrating with SAP and WMS systems",
        status: "completed",
        completedDate: "2024-02-10",
      },
      {
        name: "Initial ML model prototype",
        description: "First version of the machine learning model with basic prediction capabilities",
        status: "completed",
        completedDate: "2024-02-15",
      },
    ],
    documents: [
      {
        name: "Data Integration Documentation.pdf",
        type: "pdf",
        size: "1.8 MB",
        uploadedAt: "2024-02-10",
      },
      {
        name: "Integration Test Results.xlsx",
        type: "xlsx",
        size: "950 KB",
        uploadedAt: "2024-02-12",
      },
    ],
    comments: [
      {
        id: "comment-1",
        user: {
          name: "Tech Solutions Inc.",
          avatar: "",
        },
        content: "Data integration framework is complete. Working on ML model prototype.",
        createdAt: "2024-02-10",
      },
      {
        id: "comment-2",
        user: {
          name: "Global Logistics Corp",
          avatar: "",
        },
        content: "The integration looks good. Looking forward to seeing the ML model prototype.",
        createdAt: "2024-02-11",
      },
    ],
  }

  // Contract info
  const contract = {
    id: params.id,
    title: "AI-Powered Supply Chain Optimization Implementation",
    provider: {
      id: "user-101",
      name: "Tech Solutions Inc.",
    },
    needer: {
      id: "user-201",
      name: "Global Logistics Corp",
    },
  }

  // Determine if the user is the provider or needer
  const isProvider = user?.id === contract.provider.id

  const handleAddComment = () => {
    if (!comment.trim()) return

    // In a real app, we would call an API to add the comment
    toast({
      title: "Comment added",
      description: "Your comment has been added successfully.",
    })

    // Clear the comment input
    setComment("")
  }

  const handleMarkAsComplete = () => {
    // In a real app, we would call an API to mark the milestone as complete
    toast({
      title: "Milestone marked as complete",
      description: "The milestone has been marked as complete and is pending review.",
    })

    // Update to redirect to the contract details page
    router.push(`/contracts/${params.id}`)
  }

  const handleApprove = () => {
    // In a real app, we would call an API to approve the milestone
    toast({
      title: "Milestone approved",
      description: "The milestone has been approved and payment will be processed.",
    })

    router.push(`/contracts/${params.id}`)
  }

  const handleReject = () => {
    // In a real app, we would call an API to reject the milestone
    toast({
      title: "Milestone rejected",
      description: "The milestone has been rejected. Please provide feedback.",
    })

    router.push(`/contracts/${params.id}/milestone/${params.milestoneId}/reject`)
  }

  const getMilestoneStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Completed
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
      case "pending_review":
        return (
          <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        )
      case "overdue":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Overdue
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDeliverableStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <Check className="h-3 w-3" /> Completed
          </Badge>
        )
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="h-3 w-3" /> In Progress
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Milestone Details</h1>
          <p className="text-muted-foreground">
            For contract: <span className="font-medium">{contract.title}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{milestone.name}</CardTitle>
                  <CardDescription>{milestone.description}</CardDescription>
                </div>
                {getMilestoneStatusBadge(milestone.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" /> Amount
                  </p>
                  <p className="font-medium">{milestone.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> Due Date
                  </p>
                  <p className="font-medium">{new Date(milestone.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <FileText className="h-4 w-4 mr-1" /> Percentage
                  </p>
                  <p className="font-medium">{milestone.percentage}% of total</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Deliverables</h3>
                <div className="space-y-4">
                  {milestone.deliverables.map((deliverable, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{deliverable.name}</h4>
                          <p className="text-sm text-muted-foreground">{deliverable.description}</p>
                        </div>
                        {getDeliverableStatusBadge(deliverable.status)}
                      </div>
                      {deliverable.status === "completed" && deliverable.completedDate && (
                        <p className="text-sm">
                          Completed on{" "}
                          <span className="font-medium">
                            {new Date(deliverable.completedDate).toLocaleDateString()}
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Documents</h3>
                <div className="space-y-2">
                  {milestone.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-blue-500" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.size}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <a href={`/contracts/${params.id}/milestone/${params.milestoneId}/upload`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </a>
              </Button>
              {milestone.status === "in_progress" && (
                <>
                  {isProvider ? (
                    <Button onClick={handleMarkAsComplete}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleReject}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button onClick={handleApprove}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  )}
                </>
              )}
              {milestone.status === "pending_review" && !isProvider && (
                <Button onClick={() => router.push(`/contracts/${params.id}/milestone/${params.milestoneId}/review`)}>
                  <Check className="h-4 w-4 mr-2" />
                  Review Milestone
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>Discussion about this milestone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                {milestone.comments.map((comment) => (
                  <div key={comment.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddComment} disabled={!comment.trim()}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Milestone Status</CardTitle>
              <CardDescription>Current status and next steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Status</span>
                </div>
                {getMilestoneStatusBadge(milestone.status)}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Due Date</span>
                </div>
                <span className="text-sm font-medium">{new Date(milestone.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Payment Amount</span>
                </div>
                <span className="text-sm font-medium">{milestone.amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Documents</span>
                </div>
                <span className="text-sm font-medium">{milestone.documents.length} uploaded</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Comments</span>
                </div>
                <span className="text-sm font-medium">{milestone.comments.length} comments</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for this milestone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`/contracts/${params.id}/milestone/${params.milestoneId}/upload`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleAddComment}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
              {milestone.status === "in_progress" && (
                <>
                  {isProvider ? (
                    <Button className="w-full justify-start" onClick={handleMarkAsComplete}>
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </Button>
                  ) : (
                    <>
                      <Button className="w-full justify-start" onClick={handleApprove}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Milestone
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={handleReject}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Milestone
                      </Button>
                    </>
                  )}
                </>
              )}
              {milestone.status === "pending_review" && !isProvider && (
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push(`/contracts/${params.id}/milestone/${params.milestoneId}/review`)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Review Milestone
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
