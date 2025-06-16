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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRequirePaidAccount } from "@/hooks/use-auth-guard"
import { ArrowLeft, AlertTriangle, Loader2, FileText, Upload, Scale, Clock, DollarSign } from "lucide-react"
import { contractService } from "@/lib/services"

export default function ContractDisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const router = useRouter()
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [disputeType, setDisputeType] = useState<string>("payment")
  const [severity, setSeverity] = useState<string>("medium")
  const [subject, setSubject] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [financialImpact, setFinancialImpact] = useState<string>("")
  const [previousAttempts, setPreviousAttempts] = useState<string>("")
  const [desiredOutcome, setDesiredOutcome] = useState<string>("")
  const [resolutionMethod, setResolutionMethod] = useState<string>("negotiation")
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false)
  const [understandImplications, setUnderstandImplications] = useState<boolean>(false)
  const [contract, setContract] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<File[]>([])

  // Load contract data and check access
  // Load contract data
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
  if (authLoading || !canAccess || isLoading) {
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
          <Card className="w-full max-w-4xl">
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
        // Check file size (max 10MB per file)
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
      
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !description.trim() || !previousAttempts.trim() || !desiredOutcome.trim() || !agreeToTerms || !understandImplications) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and agree to the terms.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create dispute initiation message
      const disputeReport = `DISPUTE RESOLUTION INITIATED

Type: ${disputeType.charAt(0).toUpperCase() + disputeType.slice(1)}
Severity: ${severity.charAt(0).toUpperCase() + severity.slice(1)}
Subject: ${subject}

Detailed Description:
${description}

Financial Impact:
${financialImpact || "Not specified"}

Previous Resolution Attempts:
${previousAttempts}

Desired Outcome:
${desiredOutcome}

Preferred Resolution Method: ${resolutionMethod.charAt(0).toUpperCase() + resolutionMethod.slice(1)}

${attachments.length > 0 ? `Supporting Documents: ${attachments.length} file(s) attached` : "No supporting documents"}

---
This is a formal dispute resolution request. A neutral mediator may be assigned to help resolve this matter.`

      // Send as contract message
      await contractService.sendContractMessage(id, disputeReport)

      // Log as contract activity
      await contractService.submitModificationRequest(
        id, 
        "dispute_initiated", 
        `Dispute initiated: ${subject}`, 
        description, 
        severity
      )
      
      toast({
        title: "Dispute initiated",
        description: "Your dispute has been formally initiated. A mediator will be assigned to help resolve this matter.",
      })
      
      router.push(`/contracts/${id}`)
    } catch (error) {
      console.error("Error initiating dispute:", error)
      toast({
        title: "Error",
        description: "Failed to initiate dispute. Please try again.",
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
          <h1 className="text-2xl font-bold text-red-600">Initiate Dispute Resolution</h1>
          <p className="text-muted-foreground">For contract: {contract.title}</p>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Important: Dispute Resolution Process
          </CardTitle>
        </CardHeader>
        <CardContent className="text-red-700 space-y-2">
          <p className="font-medium">Please consider the following before proceeding:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Dispute resolution should only be used when direct communication has failed</li>
            <li>This process may involve third-party mediation and additional costs</li>
            <li>All parties will be notified and formal proceedings will begin</li>
            <li>The dispute resolution process may take several weeks to complete</li>
            <li>Consider trying direct negotiation or contract modification first</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Dispute Resolution Form
          </CardTitle>
          <CardDescription>
            Complete this form to formally initiate dispute resolution proceedings. Please provide detailed and accurate information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="disputeType">Type of Dispute</Label>
                <RadioGroup
                  id="disputeType"
                  value={disputeType}
                  onValueChange={setDisputeType}
                  className="mt-2 space-y-2"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="payment" id="payment" />
                    <Label htmlFor="payment" className="cursor-pointer">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Payment Dispute
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deliverable" id="deliverable" />
                    <Label htmlFor="deliverable" className="cursor-pointer">
                      <FileText className="h-4 w-4 inline mr-1" />
                      Deliverable Quality
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="timeline" id="timeline" />
                    <Label htmlFor="timeline" className="cursor-pointer">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Timeline/Deadline
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scope" id="scope" />
                    <Label htmlFor="scope" className="cursor-pointer">
                      Scope of Work
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="breach" id="breach" />
                    <Label htmlFor="breach" className="cursor-pointer">
                      Contract Breach
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="termination" id="termination" />
                    <Label htmlFor="termination" className="cursor-pointer">
                      Contract Termination
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="severity">Dispute Severity</Label>
                <RadioGroup 
                  id="severity" 
                  value={severity} 
                  onValueChange={setSeverity} 
                  className="mt-2 space-y-2"
                  disabled={isSubmitting}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="cursor-pointer">
                      Low - Minor disagreement
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="cursor-pointer">
                      Medium - Significant issue
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="cursor-pointer">
                      High - Serious breach
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critical" id="critical" />
                    <Label htmlFor="critical" className="cursor-pointer">
                      Critical - Contract termination
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Dispute Subject</Label>
              <Input
                id="subject"
                placeholder="Brief summary of the dispute"
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
                placeholder="Provide a comprehensive description of the dispute, including specific facts, dates, and relevant contract clauses"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 min-h-[150px]"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="financialImpact">Financial Impact (Optional)</Label>
              <Input
                id="financialImpact"
                placeholder="e.g., $5,000 in delayed payments, $2,000 in additional costs"
                value={financialImpact}
                onChange={(e) => setFinancialImpact(e.target.value)}
                className="mt-1"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="previousAttempts">Previous Resolution Attempts</Label>
              <Textarea
                id="previousAttempts"
                placeholder="Describe all attempts made to resolve this issue directly with the other party"
                value={previousAttempts}
                onChange={(e) => setPreviousAttempts(e.target.value)}
                className="mt-1 min-h-[100px]"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="desiredOutcome">Desired Outcome</Label>
              <Textarea
                id="desiredOutcome"
                placeholder="What specific resolution are you seeking?"
                value={desiredOutcome}
                onChange={(e) => setDesiredOutcome(e.target.value)}
                className="mt-1 min-h-[100px]"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="resolutionMethod">Preferred Resolution Method</Label>
              <Select value={resolutionMethod} onValueChange={setResolutionMethod} disabled={isSubmitting}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="negotiation">Direct Negotiation</SelectItem>
                  <SelectItem value="mediation">Mediation</SelectItem>
                  <SelectItem value="arbitration">Arbitration</SelectItem>
                  <SelectItem value="expert_determination">Expert Determination</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="attachments">Supporting Documents</Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    id="attachments"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx"
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
                    Add Evidence
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Contracts, emails, screenshots, invoices, etc. (max 10MB per file)
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

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I confirm that all information provided is true and accurate to the best of my knowledge, 
                  and I have made reasonable efforts to resolve this matter directly with the other party.
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="implications"
                  checked={understandImplications}
                  onCheckedChange={(checked) => setUnderstandImplications(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="implications" className="text-sm cursor-pointer">
                  I understand that initiating dispute resolution may involve additional costs, time delays, 
                  and potential legal implications. I accept responsibility for any fees associated with this process.
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !agreeToTerms || !understandImplications}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initiating Dispute...
                  </>
                ) : (
                  <>
                    <Scale className="h-4 w-4 mr-2" />
                    Initiate Dispute Resolution
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