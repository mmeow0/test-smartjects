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
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Star,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

// Define mock data types
type Deliverable = {
  id: string
  name: string
  description: string
  status: string
  completedDate: string
}

type Document = {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
}

type Milestone = {
  id: string
  contractId: string
  name: string
  description: string
  percentage: number
  amount: string
  dueDate: string
  status: string
  deliverables: Deliverable[]
  documents: Document[]
}

type Contract = {
  id: string
  title: string
  provider: {
    id: string
    name: string
  }
  needer: {
    id: string
    name: string
  }
}

export default function MilestoneReviewPage({ params }: { params: Promise<{ id: string; milestoneId: string }> }) {
   const { id, milestoneId } = use(params);
   
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState("")
  const [rating, setRating] = useState<string>("3")
  const [reviewedDeliverables, setReviewedDeliverables] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Check authentication first
  useEffect(() => {
    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      setAuthChecked(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Fetch mock data
  useEffect(() => {
    if (!authChecked) return

    // Skip data loading if not authenticated
    if (!isAuthenticated || (user && user.accountType !== "paid")) {
      return
    }

    // Mock milestone data
    const mockMilestone: Milestone = {
      id: milestoneId,
      contractId: id,
      name: "Midpoint Delivery",
      description: "Data integration and initial model development",
      percentage: 30,
      amount: "$5,250",
      dueDate: "2024-02-28",
      status: "pending_review", // completed, in_progress, pending, pending_review, overdue
      deliverables: [
        {
          id: "del-1",
          name: "Data integration framework",
          description: "Framework for integrating with SAP and WMS systems",
          status: "completed",
          completedDate: "2024-02-10",
        },
        {
          id: "del-2",
          name: "Initial ML model prototype",
          description: "First version of the machine learning model with basic prediction capabilities",
          status: "completed",
          completedDate: "2024-02-15",
        },
      ],
      documents: [
        {
          id: "doc-1",
          name: "Data Integration Documentation.pdf",
          type: "pdf",
          size: "1.8 MB",
          uploadedAt: "2024-02-10",
        },
        {
          id: "doc-2",
          name: "Integration Test Results.xlsx",
          type: "xlsx",
          size: "950 KB",
          uploadedAt: "2024-02-12",
        },
        {
          id: "doc-3",
          name: "ML Model Prototype Demo.mp4",
          type: "mp4",
          size: "15.2 MB",
          uploadedAt: "2024-02-15",
        },
      ],
    }

    // Contract info
    const mockContract: Contract = {
      id: id,
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

    setMilestone(mockMilestone)
    setContract(mockContract)

    // Initialize reviewed deliverables
    const initialReviewed: Record<string, boolean> = {}
    mockMilestone.deliverables.forEach((d) => {
      initialReviewed[d.id] = false
    })
    setReviewedDeliverables(initialReviewed)

    // Simulate loading data
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [authChecked, isAuthenticated, user, id, milestoneId])

  // Handle redirects after auth check
  useEffect(() => {
    if (!authChecked) return

    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login")
      router.push("/auth/login")
    } else if (user && user.accountType !== "paid") {
      console.log("Not a paid user, redirecting to upgrade")
      router.push("/upgrade")
    }
  }, [authChecked, isAuthenticated, user, router])

  // Show loading state while checking auth
  if (!authChecked) {
    return null
  }

  // If not authenticated or not a paid user, don't render anything (redirect will happen)
  if (!isAuthenticated || (user && user.accountType !== "paid")) {
    return null
  }

  // Show loading state while fetching data
  if (isLoading || !milestone || !contract) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-96 bg-gray-200 rounded mb-8"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-gray-200 rounded-lg h-96 mb-6"></div>
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
            <div>
              <div className="bg-gray-200 rounded-lg h-64 mb-6"></div>
              <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Determine if the user is the provider or needer
  const isProvider = user?.id === contract.provider.id
  const isNeeder = !isProvider

  // If provider is viewing this page, redirect to milestone details
  if (isProvider) {
    router.push(`/contracts/${id}/milestone/${milestoneId}`)
    return null
  }

  const handleToggleDeliverable = (id: string) => {
    setReviewedDeliverables((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const allDeliverablesReviewed = Object.values(reviewedDeliverables).every((v) => v)

  const handleApprove = () => {
    if (!allDeliverablesReviewed) {
      toast({
        title: "Review incomplete",
        description: "Please review all deliverables before approving.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Milestone approved",
        description: "The milestone has been approved and payment will be processed.",
      })

      router.push(`/contracts/${id}`)
    }, 1500)
  }

  const handleReject = () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback required",
        description: "Please provide feedback explaining why you're rejecting this milestone.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Milestone rejected",
        description: "The milestone has been rejected with your feedback.",
      })

      router.push(`/contracts/${id}`)
    }, 1500)
  }

  const handleRequestChanges = () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback required",
        description: "Please provide feedback on what changes are needed.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Changes requested",
        description: "Your feedback has been sent to the provider.",
      })

      router.push(`/contracts/${id}`)
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Review Milestone</h1>
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
                <Badge className="bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Pending Review
                </Badge>
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
                <h3 className="text-lg font-medium mb-4">Review Deliverables</h3>
                <div className="space-y-4">
                  {milestone.deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{deliverable.name}</h4>
                          <p className="text-sm text-muted-foreground">{deliverable.description}</p>
                          <p className="text-sm mt-1">
                            Completed on{" "}
                            <span className="font-medium">
                              {new Date(deliverable.completedDate).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Checkbox
                            id={`review-${deliverable.id}`}
                            checked={reviewedDeliverables[deliverable.id]}
                            onCheckedChange={() => handleToggleDeliverable(deliverable.id)}
                          />
                          <Label htmlFor={`review-${deliverable.id}`} className="ml-2">
                            Reviewed
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Documents</h3>
                <div className="space-y-2">
                  {milestone.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
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

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Rate Quality</h3>
                <RadioGroup value={rating} onValueChange={setRating} className="flex space-x-4 mb-4">
                  <div className="flex flex-col items-center">
                    <RadioGroupItem value="1" id="r1" className="sr-only" />
                    <Label
                      htmlFor="r1"
                      className={`flex flex-col items-center cursor-pointer p-2 rounded-md ${rating === "1" ? "bg-red-50 text-red-600" : ""}`}
                    >
                      <ThumbsDown className={`h-6 w-6 ${rating === "1" ? "text-red-600" : "text-gray-400"}`} />
                      <span className="text-sm mt-1">Poor</span>
                    </Label>
                  </div>
                  <div className="flex flex-col items-center">
                    <RadioGroupItem value="2" id="r2" className="sr-only" />
                    <Label
                      htmlFor="r2"
                      className={`flex flex-col items-center cursor-pointer p-2 rounded-md ${rating === "2" ? "bg-orange-50 text-orange-600" : ""}`}
                    >
                      <ThumbsDown className={`h-6 w-6 ${rating === "2" ? "text-orange-600" : "text-gray-400"}`} />
                      <span className="text-sm mt-1">Fair</span>
                    </Label>
                  </div>
                  <div className="flex flex-col items-center">
                    <RadioGroupItem value="3" id="r3" className="sr-only" />
                    <Label
                      htmlFor="r3"
                      className={`flex flex-col items-center cursor-pointer p-2 rounded-md ${rating === "3" ? "bg-yellow-50 text-yellow-600" : ""}`}
                    >
                      <Star className={`h-6 w-6 ${rating === "3" ? "text-yellow-600" : "text-gray-400"}`} />
                      <span className="text-sm mt-1">Good</span>
                    </Label>
                  </div>
                  <div className="flex flex-col items-center">
                    <RadioGroupItem value="4" id="r4" className="sr-only" />
                    <Label
                      htmlFor="r4"
                      className={`flex flex-col items-center cursor-pointer p-2 rounded-md ${rating === "4" ? "bg-lime-50 text-lime-600" : ""}`}
                    >
                      <ThumbsUp className={`h-6 w-6 ${rating === "4" ? "text-lime-600" : "text-gray-400"}`} />
                      <span className="text-sm mt-1">Very Good</span>
                    </Label>
                  </div>
                  <div className="flex flex-col items-center">
                    <RadioGroupItem value="5" id="r5" className="sr-only" />
                    <Label
                      htmlFor="r5"
                      className={`flex flex-col items-center cursor-pointer p-2 rounded-md ${rating === "5" ? "bg-green-50 text-green-600" : ""}`}
                    >
                      <ThumbsUp className={`h-6 w-6 ${rating === "5" ? "text-green-600" : "text-gray-400"}`} />
                      <span className="text-sm mt-1">Excellent</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Feedback</h3>
                <Textarea
                  placeholder="Provide feedback on the milestone deliverables..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleRequestChanges} disabled={!feedback.trim() || isSubmitting}>
                <Clock className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReject} disabled={!feedback.trim() || isSubmitting}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={handleApprove} disabled={!allDeliverablesReviewed || isSubmitting}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Review Checklist</CardTitle>
              <CardDescription>Items to verify before approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Checkbox id="check-1" checked={allDeliverablesReviewed} disabled />
                <Label htmlFor="check-1" className={`ml-2 ${allDeliverablesReviewed ? "text-green-600" : ""}`}>
                  All deliverables reviewed
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox id="check-2" checked={!!rating} disabled />
                <Label htmlFor="check-2" className={`ml-2 ${!!rating ? "text-green-600" : ""}`}>
                  Quality rating provided
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox id="check-3" checked={feedback.length > 0} disabled />
                <Label htmlFor="check-3" className={`ml-2 ${feedback.length > 0 ? "text-green-600" : ""}`}>
                  Feedback provided
                </Label>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Review Guidelines:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Verify all deliverables meet the requirements</li>
                  <li>Check that documentation is complete and clear</li>
                  <li>Test any provided functionality or code</li>
                  <li>Provide constructive feedback</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for this review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/contracts/${id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Contract
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleRequestChanges}
                disabled={!feedback.trim() || isSubmitting}
              >
                <Clock className="h-4 w-4 mr-2" />
                Request Changes
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleReject}
                disabled={!feedback.trim() || isSubmitting}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Milestone
              </Button>
              <Button
                className="w-full justify-start"
                onClick={handleApprove}
                disabled={!allDeliverablesReviewed || isSubmitting}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Milestone
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
