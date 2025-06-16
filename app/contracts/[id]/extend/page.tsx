"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useRequirePaidAccount } from "@/hooks/use-auth-guard"
import { ArrowLeft, Calendar, AlertTriangle, Clock, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { contractService } from "@/lib/services"

export default function TimelineExtensionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const router = useRouter()
  const { isLoading: authLoading, user, canAccess } = useRequirePaidAccount()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reason, setReason] = useState<string>("")
  const [details, setDetails] = useState<string>("")
  const [currentEndDate, setCurrentEndDate] = useState<Date | null>(null)
  const [newEndDate, setNewEndDate] = useState<Date | null>(null)
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false)
  const [contract, setContract] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

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
        
        // Set current end date from contract data
        if (contractData.endDate) {
          const endDate = new Date(contractData.endDate)
          setCurrentEndDate(endDate)

          // Set default new end date to 2 weeks after current end date
          const defaultNewEndDate = new Date(endDate)
          defaultNewEndDate.setDate(defaultNewEndDate.getDate() + 14)
          setNewEndDate(defaultNewEndDate)
        }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason || !details || !newEndDate || !agreeToTerms) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and agree to the terms.",
        variant: "destructive",
      })
      return
    }

    if (currentEndDate && newEndDate <= currentEndDate) {
      toast({
        title: "Invalid date",
        description: "The new end date must be after the current end date.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await contractService.submitTimelineExtensionRequest(id, newEndDate, reason, details)
      
      toast({
        title: "Extension request submitted",
        description: "Your timeline extension request has been sent to the other party for review.",
      })
      
      router.push(`/contracts/${id}`)
    } catch (error) {
      console.error("Error submitting extension request:", error)
      toast({
        title: "Error",
        description: "Failed to submit extension request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const extensionDays =
    newEndDate && currentEndDate
      ? Math.round((newEndDate.getTime() - currentEndDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contract
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Request Timeline Extension</h1>
          <p className="text-muted-foreground">For contract: {contract.title}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Timeline Extension Request</CardTitle>
          <CardDescription>
            Submit a request to extend the timeline of your contract. The other party will need to review and approve
            this change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Current End Date</Label>
                  <div className="flex items-center mt-1 h-10 px-3 py-2 border rounded-md bg-muted">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{currentEndDate ? format(currentEndDate, "PPP") : "Loading..."}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newEndDate">New End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                        id="newEndDate"
                        disabled={isSubmitting}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {newEndDate ? format(newEndDate, "PPP") : "Select a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={newEndDate}
                        onSelect={setNewEndDate}
                        initialFocus
                        disabled={(date) => (currentEndDate ? date < currentEndDate : false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {newEndDate && currentEndDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3">
                  <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Extension Summary</p>
                    <p className="text-blue-700 mt-1">
                      You are requesting a timeline extension of{" "}
                      <span className="font-medium">{extensionDays} days</span> from the current end date.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="reason">Reason for Extension</Label>
                <Input
                  id="reason"
                  placeholder="Brief reason for the timeline extension"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="details">Extension Details</Label>
                <Textarea
                  id="details"
                  placeholder="Provide detailed information about why you need this extension and how it will impact the project"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="mt-1 min-h-[150px]"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Important Notice</p>
                  <p className="text-amber-700 mt-1">
                    Timeline extensions require approval from all parties. Once submitted, the other party will be
                    notified and must accept the change before it takes effect. This may impact milestone due dates and
                    payment schedules.
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
                  I understand that this request will be sent to {contract.provider.name} and {contract.needer.name} for
                  review and approval. All parties must agree to the extension before it takes effect.
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !agreeToTerms || !newEndDate}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Extension Request"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}