"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useRequirePaidAccount } from "@/hooks/use-auth-guard"
import { ArrowLeft, AlertTriangle, Loader2, FileText, Upload } from "lucide-react"
import { contractService } from "@/lib/services"

export default function ContractIssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const router = useRouter()
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [issueType, setIssueType] = useState<string>("quality")
  const [priority, setPriority] = useState<string>("medium")
  const [subject, setSubject] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [expectedResolution, setExpectedResolution] = useState<string>("")
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false)
  const [contract, setContract] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])

  // Load contract data and check access
  useEffect(() => {
    const loadContract = async () => {
      if (authLoading || !canAccess) {
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const contractData = await contractService.getContractById(id)
        
        if (!contractData) {
          setError("Contract not found or access denied")
          setIsLoading(false)
          return
        }

        setContract(contractData)
        setIsLoading(false)
        
      } catch (error) {
        console.error("Error loading contract:", error)
        setError("Failed to load contract data")
        setIsLoading(false)
      }
    }

    loadContract()
  }, [authLoading, canAccess, user, id, router])

  // Redirect if not authenticated or not paid
  if (authLoading || !canAccess) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Please wait while we load your contract details.</CardDescription>
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
  if (error || !contract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle>Error</CardTitle>
              <CardDescription>{error || "Contract not found"}</CardDescription>
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
        // Check file size (max 5MB per file)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is too large. Maximum file size is 5MB.`,
            variant: "destructive",
          })
          return false
        }
        return true
      })
      
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !description.trim() || !agreeToTerms) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and agree to the terms.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create issue report message
      const issueReport = `ISSUE REPORT

Type: ${issueType.charAt(0).toUpperCase() + issueType.slice(1)}
Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}
Subject: ${subject}

Description:
${description}

Expected Resolution:
${expectedResolution || "Not specified"}

${attachments.length > 0 ? `Attachments: ${attachments.length} file(s) attached` : "No attachments"}`

      // Send as contract message
      await contractService.sendContractMessage(id, issueReport)

      // Log as contract activity
      await contractService.submitModificationRequest(
        id, 
        "issue_report", 
        `Issue reported: ${subject}`, 
        description, 
        priority
      )
      
      toast({
        title: "Issue reported",
        description: "Your issue has been reported and the other party has been notified.",
      })
      
      router.push(`/contracts/${id}`)
    } catch (error) {
      console.error("Error submitting issue report:", error)
      toast({
        title: "Error",
        description: "Failed to submit issue report. Please try again.",
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
          Back to Contract
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Report Issue</h1>
          <p className="text-muted-foreground">For contract: {contract.title}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Issue Report</CardTitle>
          <CardDescription>
            Report any issues or problems you're experiencing with this contract. The other party will be notified immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="issueType">Issue Type</Label>
                <RadioGroup
                  id="issueType"
                  value={issueType}
                  onValueChange={setIssueType}
                  className="mt-2 space-y-2"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quality" id="quality" />
                    <Label htmlFor="quality" className="cursor-pointer">
                      Quality Issues - Problems with deliverable quality
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="timeline" id="timeline" />
                    <Label htmlFor="timeline" className="cursor-pointer">
                      Timeline Issues - Delays or missed deadlines
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="communication" id="communication" />
                    <Label htmlFor="communication" className="cursor-pointer">
                      Communication Issues - Poor or lack of communication
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scope" id="scope" />
                    <Label htmlFor="scope" className="cursor-pointer">
                      Scope Issues - Work not matching agreed scope
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="payment" id="payment" />
                    <Label htmlFor="payment" className="cursor-pointer">
                      Payment Issues - Problems with payments or invoicing
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer">
                      Other - Issue not covered above
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <RadioGroup 
                  id="priority" 
                  value={priority} 
                  onValueChange={setPriority} 
                  className="mt-2 space-y-2"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="cursor-pointer">
                      Low - Minor issue, not urgent
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="cursor-pointer">
                      Medium - Important issue, needs attention
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="cursor-pointer">
                      High - Serious issue, requires prompt resolution
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critical" id="critical" />
                    <Label htmlFor="critical" className="cursor-pointer">
                      Critical - Blocking issue, needs immediate attention
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="subject">Issue Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief summary of the issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the issue, including what happened, when it occurred, and any relevant context"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[150px]"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="expectedResolution">Expected Resolution (Optional)</Label>
                <Textarea
                  id="expectedResolution"
                  placeholder="What would you like to see happen to resolve this issue?"
                  value={expectedResolution}
                  onChange={(e) => setExpectedResolution(e.target.value)}
                  className="mt-1 min-h-[100px]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="attachments">Attachments (Optional)</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="attachments"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('attachments')?.click()}
                      disabled={isSubmitting}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Add Files
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Screenshots, documents, or other evidence (max 5MB per file)
                    </span>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            disabled={isSubmitting}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Important Notice</p>
                  <p className="text-amber-700 mt-1">
                    This issue report will be sent to the other party immediately. Please ensure all information is accurate and professional. 
                    Serious issues may require mediation or dispute resolution procedures as outlined in your contract.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I confirm that the information provided is accurate and I understand that this issue report will be 
                  sent to {contract.provider.name} and {contract.needer.name} for review and resolution.
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !agreeToTerms}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Submit Issue Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}