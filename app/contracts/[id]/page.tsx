"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Download,
  FileText,
  MessageSquare,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  History,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { ContractDocumentPreview } from "@/components/contract-document-preview"

export default function ContractDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null)

  // Redirect if not authenticated or not a paid user
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user?.accountType !== "paid") {
      router.push("/upgrade")
    } else {
      // Simulate loading data
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }, [isAuthenticated, router, user])

  if (!isAuthenticated || user?.accountType !== "paid" || isLoading) {
    return null
  }

  // Mock contract data
  const contract = {
    id: params.id,
    title: "AI-Powered Supply Chain Optimization Implementation",
    smartjectId: "smartject-1",
    smartjectTitle: "AI-Powered Supply Chain Optimization",
    status: "active", // active, pending_start, completed, cancelled
    role: "needer", // needer or provider
    createdAt: "2024-01-15",
    startDate: "2024-01-15",
    endDate: "2024-03-31",
    exclusivityEnds: "2024-04-30",
    budget: "$17,500",
    provider: {
      id: "user-101",
      name: "Tech Solutions Inc.",
      email: "contact@techsolutions.com",
      avatar: "",
    },
    needer: {
      id: "user-201",
      name: "Global Logistics Corp",
      email: "projects@globallogistics.com",
      avatar: "",
    },
    scope:
      "The project will include data integration from existing systems, machine learning model development, dashboard creation, and staff training.",
    deliverables: [
      "Data integration framework",
      "Machine learning prediction model",
      "Real-time monitoring dashboard",
      "Documentation and training materials",
    ],
    paymentSchedule: [
      {
        id: "milestone-1",
        name: "Project Kickoff",
        description: "Initial setup, requirements gathering, and project planning",
        percentage: 30,
        amount: "$5,250",
        dueDate: "2024-01-15",
        status: "completed",
        completedDate: "2024-01-15",
        deliverables: ["Project plan", "Requirements document"],
        comments: [
          {
            user: "Tech Solutions Inc.",
            date: "2024-01-15",
            content: "All kickoff deliverables have been completed and approved.",
          },
          {
            user: "Global Logistics Corp",
            date: "2024-01-15",
            content: "Confirming receipt of all deliverables. Payment processed.",
          },
        ],
      },
      {
        id: "milestone-2",
        name: "Midpoint Delivery",
        description: "Data integration and initial model development",
        percentage: 30,
        amount: "$5,250",
        dueDate: "2024-02-28",
        status: "in_progress",
        deliverables: ["Data integration framework", "Initial ML model prototype"],
        comments: [
          {
            user: "Tech Solutions Inc.",
            date: "2024-02-10",
            content: "Data integration framework is complete. Working on ML model prototype.",
          },
        ],
      },
      {
        id: "milestone-3",
        name: "Final Delivery",
        description: "Complete system with dashboard and training",
        percentage: 40,
        amount: "$7,000",
        dueDate: "2024-03-31",
        status: "pending",
        deliverables: ["Complete ML model", "Dashboard", "Documentation", "Training materials"],
      },
    ],
    documents: [
      {
        name: "Contract Agreement.pdf",
        type: "pdf",
        size: "1.2 MB",
        uploadedAt: "2024-01-15",
      },
      {
        name: "Requirements Specification.docx",
        type: "docx",
        size: "850 KB",
        uploadedAt: "2024-01-18",
      },
      {
        name: "Data Integration Plan.pdf",
        type: "pdf",
        size: "2.4 MB",
        uploadedAt: "2024-01-25",
      },
    ],
    activity: [
      {
        id: "activity-1",
        type: "contract_signed",
        date: "2024-01-15",
        description: "Contract signed by both parties",
        user: "System",
      },
      {
        id: "activity-2",
        type: "milestone_completed",
        date: "2024-01-15",
        description: "Milestone 'Project Kickoff' completed",
        user: "Tech Solutions Inc.",
      },
      {
        id: "activity-3",
        type: "payment_processed",
        date: "2024-01-16",
        description: "Payment of $5,250 processed for 'Project Kickoff'",
        user: "Global Logistics Corp",
      },
      {
        id: "activity-4",
        type: "document_uploaded",
        date: "2024-01-18",
        description: "Document 'Requirements Specification.docx' uploaded",
        user: "Tech Solutions Inc.",
      },
      {
        id: "activity-5",
        type: "document_uploaded",
        date: "2024-01-25",
        description: "Document 'Data Integration Plan.pdf' uploaded",
        user: "Tech Solutions Inc.",
      },
      {
        id: "activity-6",
        type: "comment_added",
        date: "2024-02-10",
        description: "Comment added to milestone 'Midpoint Delivery'",
        user: "Tech Solutions Inc.",
      },
    ],
    messages: [
      {
        id: "msg-1",
        sender: "Tech Solutions Inc.",
        content:
          "We've started work on the data integration framework. Do you have any specific requirements for the data sources?",
        timestamp: "2024-01-20T10:30:00",
      },
      {
        id: "msg-2",
        sender: "Global Logistics Corp",
        content:
          "Yes, we'll need integration with our SAP system and the warehouse management system. I'll send you the API documentation.",
        timestamp: "2024-01-20T14:15:00",
      },
      {
        id: "msg-3",
        sender: "Tech Solutions Inc.",
        content: "Great, thanks! We'll review the documentation and incorporate it into our integration plan.",
        timestamp: "2024-01-21T09:45:00",
      },
    ],
    documentVersions: [
      {
        id: "version-3",
        versionNumber: 3,
        date: "2024-02-15",
        author: "Tech Solutions Inc.",
        changes: ["Updated payment schedule for milestone 3", "Extended contract end date by 2 weeks"],
      },
      {
        id: "version-2",
        versionNumber: 2,
        date: "2024-01-25",
        author: "Global Logistics Corp",
        changes: ["Added additional deliverable: Training materials", "Clarified scope of work"],
      },
      {
        id: "version-1",
        versionNumber: 1,
        date: "2024-01-15",
        author: "System",
        changes: ["Initial contract creation"],
      },
    ],
  }

  // Calculate overall progress
  const completedMilestones = contract.paymentSchedule.filter((m) => m.status === "completed").length
  const totalMilestones = contract.paymentSchedule.length
  const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100)

  // Get the next milestone
  const nextMilestone = contract.paymentSchedule.find((m) => m.status === "in_progress" || m.status === "pending")

  // Determine if the user is the provider or needer
  const isProvider = user?.id === contract.provider.id
  const otherParty = isProvider ? contract.needer : contract.provider

  const toggleMilestone = (id: string) => {
    if (expandedMilestone === id) {
      setExpandedMilestone(null)
    } else {
      setExpandedMilestone(id)
    }
  }

  const handleDownloadContract = () => {
    toast({
      title: "Download started",
      description: "The contract document is being downloaded.",
    })
  }

  const handleSendMessage = () => {
    router.push(`/contracts/${params.id}/messages`)
  }

  const handleUploadDocument = () => {
    router.push(`/contracts/${params.id}/upload`)
  }

  const handleReportIssue = () => {
    router.push(`/contracts/${params.id}/issue`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "pending_start":
        return <Badge className="bg-blue-100 text-blue-800">Pending Start</Badge>
      case "completed":
        return <Badge className="bg-purple-100 text-purple-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "contract_signed":
        return <FileText className="h-4 w-4 text-green-600" />
      case "milestone_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "payment_processed":
        return <DollarSign className="h-4 w-4 text-green-600" />
      case "document_uploaded":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "comment_added":
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case "issue_reported":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case "issue_resolved":
        return <Check className="h-4 w-4 text-green-600" />
      case "contract_cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <History className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{contract.title}</h1>
            {getStatusBadge(contract.status)}
          </div>
          <p className="text-muted-foreground">
            Contract for{" "}
            <a href={`/smartject/${contract.smartjectId}`} className="text-primary hover:underline">
              {contract.smartjectTitle}
            </a>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contract Overview</CardTitle>
            <CardDescription>Key information about this contract</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParty.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{otherParty.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">{isProvider ? "Client" : "Provider"}</p>
                  <p className="font-medium">{otherParty.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> Start Date
                  </p>
                  <p className="font-medium">{new Date(contract.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> End Date
                  </p>
                  <p className="font-medium">{new Date(contract.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" /> Budget
                  </p>
                  <p className="font-medium">{contract.budget}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-1" /> Exclusivity Period
              </h3>
              <p className="text-sm">
                This contract includes an exclusivity period that ends on{" "}
                <span className="font-medium">{new Date(contract.exclusivityEnds).toLocaleDateString()}</span>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Project Scope</h3>
              <p className="text-sm">{contract.scope}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Deliverables</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {contract.deliverables.map((deliverable, index) => (
                  <li key={index}>{deliverable}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Overall Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{progressPercentage}% Complete</span>
                  <span>
                    {completedMilestones} of {totalMilestones} milestones
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>

            {nextMilestone && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> Next Milestone
                </h3>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{nextMilestone.name}</p>
                    <p className="text-sm text-muted-foreground">{nextMilestone.description}</p>
                  </div>
                  {getMilestoneStatusBadge(nextMilestone.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Due Date:</span>{" "}
                    <span className="font-medium">{new Date(nextMilestone.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>{" "}
                    <span className="font-medium">{nextMilestone.amount}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <ContractDocumentPreview
              contractId={contract.id}
              title={contract.title}
              smartjectTitle={contract.smartjectTitle}
              provider={contract.provider}
              needer={contract.needer}
              startDate={contract.startDate}
              endDate={contract.endDate}
              exclusivityEnds={contract.exclusivityEnds}
              budget={contract.budget}
              scope={contract.scope}
              deliverables={contract.deliverables}
              paymentSchedule={contract.paymentSchedule}
              versions={contract.documentVersions}
            />
            <Button variant="outline" onClick={handleSendMessage}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" onClick={handleUploadDocument}>
              <FileText className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
            {contract.status === "active" && (
              <Button variant="outline" onClick={handleReportIssue}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for this contract</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contract.status === "active" && nextMilestone?.status === "in_progress" && isProvider && (
              <Button className="w-full justify-between" asChild>
                <a href={`/contracts/${params.id}/milestone/${nextMilestone.id}/complete`}>
                  Mark Current Milestone Complete
                  <ChevronRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            )}

            {contract.status === "active" && nextMilestone?.status === "in_progress" && !isProvider && (
              <Button className="w-full justify-between" asChild>
                <a href={`/contracts/${params.id}/milestone/${nextMilestone.id}/review`}>
                  Review Current Milestone
                  <ChevronRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            )}

            {contract.status === "active" && (
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href={`/contracts/${params.id}/messages`}>
                  View Messages
                  <ChevronRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            )}

            <Button variant="outline" className="w-full justify-between" asChild>
              <a href={`/contracts/${params.id}/documents`}>
                View All Documents
                <ChevronRight className="h-4 w-4 ml-2" />
              </a>
            </Button>

            {contract.status === "active" && (
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href={`/contracts/${params.id}/schedule-meeting`}>
                  Schedule Meeting
                  <ChevronRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            )}

            {contract.status === "active" && (
              <Button variant="destructive" className="w-full justify-between">
                Request Contract Modification
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="milestones" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="milestones">Milestones & Payments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>Milestones & Payment Schedule</CardTitle>
              <CardDescription>Track progress and payment milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contract.paymentSchedule.map((milestone) => (
                  <div key={milestone.id} className="border rounded-lg overflow-hidden">
                    <div
                      className={`p-4 ${expandedMilestone === milestone.id ? "border-b" : ""} ${
                        milestone.status === "completed"
                          ? "bg-green-50"
                          : milestone.status === "in_progress"
                            ? "bg-blue-50"
                            : ""
                      } cursor-pointer`}
                      onClick={() => toggleMilestone(milestone.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{milestone.name}</h3>
                            {getMilestoneStatusBadge(milestone.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                        <div className="flex items-center">
                          {expandedMilestone === milestone.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Amount:</span>{" "}
                          <span className="font-medium">{milestone.amount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Due Date:</span>{" "}
                          <span className="font-medium">{new Date(milestone.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Percentage:</span>{" "}
                          <span className="font-medium">{milestone.percentage}%</span>
                        </div>
                      </div>
                    </div>

                    {expandedMilestone === milestone.id && (
                      <div className="p-4 bg-background">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Deliverables</h4>
                            <ul className="list-disc pl-5 text-sm space-y-1">
                              {milestone.deliverables.map((deliverable, index) => (
                                <li key={index}>{deliverable}</li>
                              ))}
                            </ul>
                          </div>

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

                          {milestone.comments && milestone.comments.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Comments</h4>
                              <div className="space-y-2">
                                {milestone.comments.map((comment, index) => (
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
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-2 mt-4">
                            {milestone.status === "in_progress" && (
                              <>
                                {isProvider ? (
                                  <Button size="sm" asChild>
                                    <a href={`/contracts/${params.id}/milestone/${milestone.id}/complete`}>
                                      Mark as Complete
                                    </a>
                                  </Button>
                                ) : (
                                  <Button size="sm" asChild>
                                    <a href={`/contracts/${params.id}/milestone/${milestone.id}/review`}>
                                      Review Milestone
                                    </a>
                                  </Button>
                                )}
                              </>
                            )}
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/contracts/${params.id}/milestone/${milestone.id}`}>View Details</a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Contract Documents</CardTitle>
              <CardDescription>All documents related to this contract</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contract.documents.map((doc, index) => (
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
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}

                <div className="flex justify-end mt-4">
                  <Button onClick={handleUploadDocument}>
                    <FileText className="h-4 w-4 mr-2" />
                    Upload New Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Contract Messages</CardTitle>
              <CardDescription>Communication history for this contract</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4">
                {contract.messages.map((message) => (
                  <div key={message.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{message.sender}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSendMessage}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View All Messages
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>History of all contract-related activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contract.activity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border-b last:border-0">
                    <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{activity.description}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">By {activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {contract.status === "active" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contract Actions</CardTitle>
            <CardDescription>Additional actions you can take on this contract</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start" asChild>
                <a href={`/contracts/${params.id}/extend`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Timeline Extension
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={`/contracts/${params.id}/modify`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Request Contract Modification
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={`/contracts/${params.id}/dispute`}>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Initiate Dispute Resolution
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {contract.status === "completed" && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Completion</CardTitle>
            <CardDescription>This contract has been successfully completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Contract Successfully Completed</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                All milestones have been delivered and payments processed. The exclusivity period ends on{" "}
                <span className="font-medium">{new Date(contract.exclusivityEnds).toLocaleDateString()}</span>.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleDownloadContract}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Contract
                </Button>
                <Button asChild>
                  <a href="/contracts/new">Start New Contract</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
