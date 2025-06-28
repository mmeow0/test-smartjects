"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { contractService } from "@/lib/services"
import { useRequirePaidAccount } from "@/hooks/use-auth-guard"
import { MilestoneCard } from "@/components/contract/milestone-card"
import { QuickMilestoneActions } from "@/components/contract/quick-milestone-actions"
import { ContractWorkflow } from "@/components/contract/contract-workflow"
import { ContractCompletion } from "@/components/contract/contract-completion"

export default function ContractDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const router = useRouter()
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null)
  const [isCheckingSigningStatus, setIsCheckingSigningStatus] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [contract, setContract] = useState<any>(null)

  // Load contract data
  const loadContract = async () => {
    // Don't load while auth is still loading or access is denied
    if (authLoading || !canAccess) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check if contract is fully signed using contractId
      const { isSigned, matchId, proposalId } = await contractService.isContractFullySigned(id)
      
      if (!isSigned) {
        // Contract not fully signed - redirect to signing page if we have match/proposal IDs
        if (matchId && proposalId) {
          router.push(`/matches/${matchId}/contract/${proposalId}`)
          return
        } else {
          setError("Contract not found or not fully signed")
          setIsCheckingSigningStatus(false)
          setIsLoading(false)
          return
        }
      }

      // Contract is fully signed - load contract data
      const contractData = await contractService.getContractById(id)
      
      if (!contractData) {
        setError("Contract not found or access denied")
        setIsCheckingSigningStatus(false)
        setIsLoading(false)
        return
      }

      setContract(contractData)
      setIsCheckingSigningStatus(false)
      setIsLoading(false)
      
    } catch (error) {
      console.error("Error loading contract:", error)
      setError("Failed to load contract data")
      setIsCheckingSigningStatus(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadContract()
  }, [authLoading, canAccess, router, id])


  if (authLoading || !canAccess || isLoading || isCheckingSigningStatus) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {isCheckingSigningStatus ? "Checking contract access..." : "Loading contract..."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || "Contract not found"}</p>
            <Button onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate overall progress
  const completedMilestones = contract?.paymentSchedule?.filter((m: any) => m.status === "completed").length || 0
  const totalMilestones = contract?.paymentSchedule?.length || 0
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
  const hasMilestones = totalMilestones > 0

  // Get contract status information for contracts without milestones
  const getContractStatusInfo = () => {
    switch (contract?.status) {
      case 'pending_start':
        return { 
          label: 'Awaiting Work to Begin', 
          percentage: 0, 
          color: 'bg-yellow-500',
          description: 'Provider needs to start work on this contract'
        }
      case 'active':
        return { 
          label: 'Work in Progress', 
          percentage: 50, 
          color: 'bg-blue-500',
          description: 'Provider is actively working on deliverables'
        }
      case 'pending_review':
        return { 
          label: 'Awaiting Client Review', 
          percentage: 90, 
          color: 'bg-purple-500',
          description: 'Work completed, waiting for client approval'
        }
      case 'completed':
        return { 
          label: 'Contract Completed', 
          percentage: 100, 
          color: 'bg-green-500',
          description: 'All work delivered and approved'
        }
      case 'cancelled':
        return { 
          label: 'Contract Cancelled', 
          percentage: 0, 
          color: 'bg-red-500',
          description: 'Contract has been cancelled'
        }
      default:
        return { 
          label: 'Status Unknown', 
          percentage: 0, 
          color: 'bg-gray-500',
          description: 'Contract status is unclear'
        }
    }
  }

  // Get the next milestone
  const nextMilestone = contract?.paymentSchedule?.find((m: any) => m.status === "in_progress" || m.status === "pending")

  // Determine if the user is the provider or needer
  const isProvider = user?.id === contract?.provider?.id
  const otherParty = isProvider ? contract?.needer : contract?.provider

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
    router.push(`/contracts/${id}/messages`)
  }

  const handleUploadDocument = () => {
    router.push(`/contracts/${id}/upload`)
  }

  const handleReportIssue = () => {
    router.push(`/contracts/${id}/issue`)
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
            <h1 className="text-2xl font-bold">{contract?.title}</h1>
            {getStatusBadge(contract?.status || "unknown")}
          </div>
          <p className="text-muted-foreground">
            Contract for{" "}
            <Link href={`/smartject/${contract?.smartjectId}`} className="text-primary hover:underline">
              {contract?.smartjectTitle}
            </Link>
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
                  <AvatarImage src={otherParty?.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{otherParty?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">{isProvider ? "Client" : "Provider"}</p>
                  <p className="font-medium">{otherParty?.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> Start Date
                  </p>
                  <p className="font-medium">{contract?.startDate ? new Date(contract.startDate).toLocaleDateString() : "TBD"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> End Date
                  </p>
                  <p className="font-medium">{contract?.endDate ? new Date(contract.endDate).toLocaleDateString() : "TBD"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" /> Budget
                  </p>
                  <p className="font-medium">{contract?.budget}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-1" /> Exclusivity Period
              </h3>
              <p className="text-sm">
                This contract includes an exclusivity period that ends on{" "}
                <span className="font-medium">{contract?.exclusivityEnds ? new Date(contract.exclusivityEnds).toLocaleDateString() : "TBD"}</span>.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Project Scope</h3>
              <p className="text-sm">{contract?.scope}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Deliverables</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {contract?.deliverables?.map((deliverable: string, index: number) => (
                  <li key={index}>{deliverable}</li>
                )) || <li>No deliverables specified</li>}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Overall Progress</h3>
              <div className="space-y-2">
                {hasMilestones ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>{progressPercentage}% Complete</span>
                      <span>
                        {completedMilestones} of {totalMilestones} milestones
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{getContractStatusInfo().label}</span>
                      <span className="text-muted-foreground">{getContractStatusInfo().percentage}% Complete</span>
                    </div>
                    <Progress 
                      value={getContractStatusInfo().percentage} 
                      className="h-2" 
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {getContractStatusInfo().description}
                    </div>
                  </>
                )}
              </div>
            </div>

            {nextMilestone && hasMilestones && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" /> Next Milestone
                </h3>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{nextMilestone?.name}</p>
                    <p className="text-sm text-muted-foreground">{nextMilestone?.description}</p>
                  </div>
                  {getMilestoneStatusBadge(nextMilestone?.status || "pending")}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                 
                  <div>
                    <span className="text-muted-foreground">Amount:</span>{" "}
                    <span className="font-medium">{nextMilestone?.amount}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            {contract && (
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
            )}
            <Button variant="outline" onClick={handleSendMessage}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline" onClick={handleUploadDocument}>
              <FileText className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
            {/* {contract?.status === "active" && (
              <Button variant="outline" onClick={handleReportIssue}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            )} */}
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {/* Quick Milestone Actions */}
          {contract?.status === "active" && nextMilestone && (
            <QuickMilestoneActions
              milestone={nextMilestone}
              contractId={id}
              userRole={isProvider ? "provider" : "needer"}
              onMilestoneUpdate={() => {
                // Reload contract data
                window.location.reload()
              }}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for this contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract?.status === "active" && (
                <Button 
                  variant="outline" 
                  className="w-full justify-between" 
                  onClick={() => router.push(`/contracts/${id}/messages`)}
                >
                  View Messages
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full justify-between" 
                onClick={() => router.push(`/contracts/${id}/documents`)}
              >
                View All Documents
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>

              {/* {contract?.status === "active" && (
                <Button 
                  variant="outline" 
                  className="w-full justify-between" 
                  onClick={() => router.push(`/contracts/${id}/schedule-meeting`)}
                >
                  Schedule Meeting
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )} */}

              {/* {contract?.status === "active" && (
                <Button variant="destructive" className="w-full justify-between">
                  Request Contract Modification
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )} */}
            </CardContent>
          </Card>
        </div>
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
                {contract?.paymentSchedule && contract.paymentSchedule.length > 0 ? (
                  contract.paymentSchedule.map((milestone: any) => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      contractId={id}
                      userRole={isProvider ? "provider" : "needer"}
                      isExpanded={expandedMilestone === milestone.id}
                      onToggleExpanded={() => toggleMilestone(milestone.id)}
                    />
                  ))
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <p>This contract doesn't have specific milestones.</p>
                      <p>Use the workflow below to manage the contract progress.</p>
                    </div>
                    <ContractWorkflow
                      contractId={id}
                      currentStatus={contract?.status}
                      onStatusChange={loadContract}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Contract Completion - only show for contracts with milestones */}
          {hasMilestones && (
            <ContractCompletion
              contractId={id}
              currentStatus={contract?.status}
              onStatusChange={loadContract}
            />
          )}
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Contract Documents</CardTitle>
              <CardDescription>All documents related to this contract</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contract?.documents?.map((doc: any, index: number) => (
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
                {contract?.messages?.map((message: any) => (
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
                {contract?.activity?.map((activity: any) => (
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

      {/* {contract?.status === "active" && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contract Actions</CardTitle>
            <CardDescription>Additional actions you can take on this contract</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => router.push(`/contracts/${id}/extend`)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Request Timeline Extension
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => router.push(`/contracts/${id}/modify`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Request Contract Modification
              </Button>
              <Button 
                variant="outline" 
                className="justify-start" 
                onClick={() => router.push(`/contracts/${id}/dispute`)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Initiate Dispute Resolution
              </Button>
            </div>
          </CardContent>
        </Card>
      )} */}

      {contract?.status === "completed" && (
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
                <span className="font-medium">{contract?.exclusivityEnds ? new Date(contract.exclusivityEnds).toLocaleDateString() : "TBD"}</span>.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleDownloadContract}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Contract
                </Button>
                <Button onClick={() => router.push("/contracts/new")}>
                  Start New Contract
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
