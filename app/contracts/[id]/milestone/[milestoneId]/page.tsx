"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  FileText,
  History,
  User,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { contractService } from "@/lib/services"
import { useRequirePaidAccount } from "@/hooks/use-auth-guard"

interface MilestoneMessage {
  id: string
  content: string
  messageType: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  isOwnMessage: boolean
}

interface StatusHistoryEntry {
  id: string
  oldStatus: string | null
  newStatus: string
  actionType: string
  comments: string | null
  changedBy: {
    id: string
    name: string
  }
  createdAt: string
}

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
  deliverables: Array<{
    id: string
    name: string
    description: string
    status: string
    completedDate?: string
  }>
  messages: MilestoneMessage[]
  statusHistory: StatusHistoryEntry[]
  documents: Array<{
    id: string
    name: string
    type: string
    size: string
    url: string
    uploadedAt: string
  }>
  userRole: "provider" | "needer"
  canSubmitForReview: boolean
  canReview: boolean
  canSendMessage: boolean
}

export default function MilestoneDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string; milestoneId: string }> 
}) {
  const { id: contractId, milestoneId } = use(params)
  const router = useRouter()
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewComments, setReviewComments] = useState("")

  // Load milestone data
  useEffect(() => {
    const loadMilestone = async () => {
      if (authLoading || !canAccess) {
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const milestoneData = await contractService.getMilestoneByIdEnhanced(contractId, milestoneId)
        
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
  }, [authLoading, canAccess, contractId, milestoneId])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !milestone) return

    setIsSendingMessage(true)
    try {
      const message = await contractService.sendMilestoneMessage(milestoneId, newMessage.trim())
      setMilestone(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message]
      } : null)
      setNewMessage("")
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

  const handleSubmitForReview = async () => {
    if (!milestone) return

    setIsSubmitting(true)
    try {
      await contractService.submitMilestoneForReview(milestoneId, "Milestone completed and ready for review")
      
      // Reload milestone data
      const updatedMilestone = await contractService.getMilestoneByIdEnhanced(contractId, milestoneId)
      if (updatedMilestone) {
        setMilestone(updatedMilestone)
      }

      toast({
        title: "Milestone submitted",
        description: "Milestone has been submitted for client review.",
      })
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
    if (!milestone) return

    setIsReviewing(true)
    try {
      await contractService.reviewMilestone(milestoneId, approved, reviewComments.trim() || undefined)
      
      // Reload milestone data
      const updatedMilestone = await contractService.getMilestoneByIdEnhanced(contractId, milestoneId)
      if (updatedMilestone) {
        setMilestone(updatedMilestone)
      }

      setReviewComments("")
      toast({
        title: approved ? "Milestone approved" : "Milestone rejected",
        description: approved 
          ? "Milestone has been approved and marked as completed."
          : "Milestone has been rejected and returned for revision.",
      })
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

  const getMessageTypeIcon = (messageType: string) => {
    switch (messageType) {
      case "submission":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "review":
        return <User className="h-4 w-4 text-purple-600" />
      case "system":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case "submit":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "approve":
        return <Check className="h-4 w-4 text-green-600" />
      case "reject":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <History className="h-4 w-4 text-gray-600" />
    }
  }

  if (authLoading || !canAccess || isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading milestone...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !milestone) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || "Milestone not found"}</p>
            <Button onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contract
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{milestone.name}</h1>
            {getMilestoneStatusBadge(milestone.status)}
          </div>
          <p className="text-muted-foreground">
            Milestone for{" "}
            <Link href={`/contracts/${contractId}`} className="text-primary hover:underline">
              {milestone.contractTitle}
            </Link>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main milestone details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Milestone Details</CardTitle>
            <CardDescription>Information about this milestone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" /> Amount
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
                  {milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : "TBD"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">
                  {getMilestoneStatusBadge(milestone.status)}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm">{milestone.description}</p>
            </div>

            {milestone.deliverables.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Deliverables</h3>
                <ul className="space-y-2">
                  {milestone.deliverables.map((deliverable) => (
                    <li key={deliverable.id} className="flex items-center gap-2 text-sm">
                      {deliverable.status === "completed" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={deliverable.status === "completed" ? "line-through text-muted-foreground" : ""}>
                        {deliverable.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submission/Review info */}
            {milestone.submittedForReview && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-blue-600" /> Submitted for Review
                </h3>
                <div className="text-sm space-y-1">
                  <p>
                    Submitted by <span className="font-medium">{milestone.submittedBy?.name}</span>
                    {milestone.submittedAt && (
                      <span className="text-muted-foreground">
                        {" "}on {new Date(milestone.submittedAt).toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {milestone.reviewStatus && (
              <div className={`p-4 rounded-lg ${
                milestone.reviewStatus === "approved" ? "bg-green-50" : "bg-red-50"
              }`}>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  {milestone.reviewStatus === "approved" ? (
                    <Check className="h-4 w-4 mr-1 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-1 text-red-600" />
                  )}
                  {milestone.reviewStatus === "approved" ? "Approved" : "Rejected"}
                </h3>
                <div className="text-sm space-y-1">
                  <p>
                    Reviewed by <span className="font-medium">{milestone.reviewedBy?.name}</span>
                    {milestone.reviewedAt && (
                      <span className="text-muted-foreground">
                        {" "}on {new Date(milestone.reviewedAt).toLocaleString()}
                      </span>
                    )}
                  </p>
                  {milestone.reviewComments && (
                    <p className="mt-2 italic">"{milestone.reviewComments}"</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Available actions for this milestone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestone.canSubmitForReview && (
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
              </Button>
            )}

            {milestone.canReview && (
              <div className="space-y-3">
                <Textarea
                  placeholder="Add review comments (optional)..."
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleReview(true)}
                    disabled={isReviewing}
                  >
                    {isReviewing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1"
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

            {milestone.documents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Documents</h4>
                <div className="space-y-2">
                  {milestone.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="truncate">{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="messages" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="messages">Messages ({milestone.messages.length})</TabsTrigger>
          <TabsTrigger value="history">Status History</TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Chat</CardTitle>
              <CardDescription>Communicate about this milestone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Messages */}
                <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                  <div className="space-y-4">
                    {milestone.messages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation!
                      </p>
                    ) : (
                      milestone.messages.map((message) => (
                        <div key={message.id} className={`flex gap-3 ${message.isOwnMessage ? "justify-end" : ""}`}>
                          {!message.isOwnMessage && (
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarImage src={message.sender.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`max-w-[70%] ${message.isOwnMessage ? "text-right" : ""}`}>
                            <div className={`rounded-lg p-3 ${
                              message.isOwnMessage 
                                ? "bg-primary text-primary-foreground" 
                                : message.messageType === "system"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-muted"
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                {getMessageTypeIcon(message.messageType)}
                                <span className="text-xs font-medium">
                                  {message.isOwnMessage ? "You" : message.sender.name}
                                </span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(message.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {message.isOwnMessage && (
                            <Avatar className="h-8 w-8 mt-1">
                              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Message input */}
                {milestone.canSendMessage && (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim() || isSendingMessage}
                      className="self-end"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
              <CardDescription>Timeline of milestone status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {milestone.statusHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No status changes yet.
                  </p>
                ) : (
                  milestone.statusHistory.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 border-b last:border-0">
                      <div className="mt-0.5">{getActionTypeIcon(entry.actionType)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium capitalize">
                            {entry.actionType.replace('_', ' ')} - {entry.newStatus}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">By {entry.changedBy.name}</p>
                        {entry.comments && (
                          <p className="text-sm mt-2 italic">"{entry.comments}"</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}