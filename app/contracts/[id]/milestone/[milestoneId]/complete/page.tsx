"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { ArrowLeft, CheckCircle, Upload, FileText, Loader2, AlertTriangle, X } from "lucide-react"
import { contractService } from "@/lib/services"

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function MilestoneCompletePage({ params }: { params: Promise<{ id: string; milestoneId: string }> }) {
  const { id, milestoneId } = use(params);
  
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [milestone, setMilestone] = useState<any>(null)
  const [contract, setContract] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [completionNotes, setCompletionNotes] = useState<string>("")
  const [deliverableNotes, setDeliverableNotes] = useState<string>("")
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [completedDeliverables, setCompletedDeliverables] = useState<string[]>([])
  const [confirmCompletion, setConfirmCompletion] = useState<boolean>(false)

  // Load milestone and contract data
  useEffect(() => {
    const loadData = async () => {
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
        // Load milestone data
        const milestoneData = await contractService.getMilestoneById(id, milestoneId)
        
        if (!milestoneData) {
          setError("Milestone not found or access denied")
          setIsLoading(false)
          return
        }

        setMilestone(milestoneData)

        // Load contract data
        const contractData = await contractService.getContractById(id)
        if (contractData) {
          setContract(contractData)
        }

        // Initialize completed deliverables
        const completed = milestoneData.deliverables
          ?.filter((d: any) => d.status === "completed")
          ?.map((d: any) => d.id) || []
        setCompletedDeliverables(completed)

        setIsLoading(false)
        
      } catch (error) {
        console.error("Error loading milestone:", error)
        setError("Failed to load milestone data")
        setIsLoading(false)
      }
    }

    loadData()
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

  // Check if user is the provider (only providers can mark milestones complete)
  const isProvider = milestone.userRole === "provider"
  
  if (!isProvider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-4xl">
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Only the service provider can mark milestones as complete.</CardDescription>
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files).filter(file => {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is too large. Maximum file size is 10MB.`,
            variant: "destructive",
          })
          return false
        }
        return true
      })

      const uploadFiles: UploadFile[] = newFiles.map(file => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: 'pending'
      }))

      setUploadFiles(prev => [...prev, ...uploadFiles])
    }
  }

  const removeFile = (fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleDeliverableToggle = (deliverableId: string) => {
    setCompletedDeliverables(prev => 
      prev.includes(deliverableId)
        ? prev.filter(id => id !== deliverableId)
        : [...prev, deliverableId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!completionNotes.trim() || !confirmCompletion) {
      toast({
        title: "Missing information",
        description: "Please provide completion notes and confirm the milestone is complete.",
        variant: "destructive",
      })
      return
    }

    // Check if all deliverables are marked as completed
    const allDeliverablesCompleted = milestone.deliverables?.every((d: any) => 
      completedDeliverables.includes(d.id)
    ) ?? true

    if (!allDeliverablesCompleted) {
      toast({
        title: "Incomplete deliverables",
        description: "Please mark all deliverables as completed before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Update milestone status
      await contractService.updateMilestoneStatus(milestoneId, "pending_review")

      // Create completion message
      const completionMessage = `MILESTONE COMPLETION SUBMITTED

Milestone: ${milestone.name}
Status: Pending Review

Completion Notes:
${completionNotes}

${deliverableNotes ? `Deliverable Notes:
${deliverableNotes}` : ''}

Completed Deliverables:
${milestone.deliverables?.map((d: any) => `• ${d.name}`).join('\n') || 'No deliverables specified'}

${uploadFiles.length > 0 ? `Uploaded Files: ${uploadFiles.length} file(s)` : 'No files uploaded'}

This milestone is now ready for review and approval.`

      // Send completion notification
      await contractService.sendContractMessage(id, completionMessage)

      // Add completion comment to milestone
      await contractService.addMilestoneComment(
        milestoneId, 
        `Milestone marked as complete. ${completionNotes}`
      )

      toast({
        title: "Milestone submitted for review",
        description: "Your milestone completion has been submitted for review.",
      })
      
      router.push(`/contracts/${id}/milestone/${milestoneId}`)
    } catch (error) {
      console.error("Error completing milestone:", error)
      toast({
        title: "Error",
        description: "Failed to complete milestone. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Milestone
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Complete Milestone</h1>
          <p className="text-muted-foreground">
            {milestone.name} - {milestone.contractTitle}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Milestone Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Milestone Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Payment</p>
                <p className="font-medium">{milestone.amount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Percentage</p>
                <p className="font-medium">{milestone.percentage}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">
                  {new Date(milestone.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="mt-1">{milestone.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle>Mark Deliverables as Complete</CardTitle>
            <CardDescription>
              Check off each deliverable as you complete it
            </CardDescription>
          </CardHeader>
          <CardContent>
            {milestone.deliverables && milestone.deliverables.length > 0 ? (
              <div className="space-y-3">
                {milestone.deliverables.map((deliverable: any) => (
                  <div key={deliverable.id} className="flex items-start gap-3">
                    <Checkbox
                      id={deliverable.id}
                      checked={completedDeliverables.includes(deliverable.id)}
                      onCheckedChange={() => handleDeliverableToggle(deliverable.id)}
                      disabled={isSubmitting}
                    />
                    <div className="flex-1">
                      <Label htmlFor={deliverable.id} className="cursor-pointer font-medium">
                        {deliverable.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {deliverable.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No deliverables defined for this milestone.</p>
            )}
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Deliverable Files</CardTitle>
            <CardDescription>
              Upload any files related to this milestone completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                  onChange={handleFileUpload}
                  disabled={isSubmitting}
                />
                
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  <label
                    htmlFor="file-upload"
                    className="text-primary cursor-pointer hover:text-primary/80"
                  >
                    Click to upload
                  </label>
                  {" "}or drag and drop
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT files up to 10MB each
                </p>
              </div>

              {uploadFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadFiles.map((uploadFile) => (
                    <div
                      key={uploadFile.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{uploadFile.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(uploadFile.file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completion Form */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Details</CardTitle>
            <CardDescription>
              Provide details about the completed work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="completionNotes">Completion Notes</Label>
                <Textarea
                  id="completionNotes"
                  placeholder="Describe what has been completed, any challenges overcome, and key achievements"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="mt-1 min-h-[120px]"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="deliverableNotes">Deliverable Notes (Optional)</Label>
                <Textarea
                  id="deliverableNotes"
                  placeholder="Any specific notes about the deliverables or additional context"
                  value={deliverableNotes}
                  onChange={(e) => setDeliverableNotes(e.target.value)}
                  className="mt-1 min-h-[80px]"
                  disabled={isSubmitting}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Important Notice</p>
                  <p className="text-amber-700 mt-1">
                    By marking this milestone as complete, you are confirming that all work has been delivered 
                    according to the contract specifications. The client will review your submission and either 
                    approve it for payment or request revisions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="confirm"
                  checked={confirmCompletion}
                  onCheckedChange={(checked) => setConfirmCompletion(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="confirm" className="text-sm cursor-pointer">
                  I confirm that this milestone has been completed according to the contract specifications 
                  and is ready for client review and approval.
                </Label>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !confirmCompletion}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}