"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
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
import { ArrowLeft, AlertTriangle } from "lucide-react"

export default function ContractModificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modificationType, setModificationType] = useState<string>("scope")
  const [reason, setReason] = useState<string>("")
  const [details, setDetails] = useState<string>("")
  const [urgency, setUrgency] = useState<string>("normal")
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Mock contract data
  const [contract, setContract] = useState<any>(null)

  // Redirect if not authenticated
  useEffect(() => {
    // Add a small delay to ensure auth state is loaded from localStorage
    const checkAuth = setTimeout(() => {
      console.log("Auth check in modify page:", isAuthenticated, user)
      setAuthChecked(true)

      if (isAuthenticated && user) {
        // Simulate loading data
        setTimeout(() => {
          setContract({
            id: id,
            title: "AI-Powered Supply Chain Optimization Implementation",
            status: "active",
            provider: {
              name: "Tech Solutions Inc.",
            },
            needer: {
              name: "Global Logistics Corp",
            },
          })
          setIsLoading(false)
        }, 1000)
      }
    }, 500)

    return () => clearTimeout(checkAuth)
  }, [isAuthenticated, user, id])

  // Add a separate effect for redirects that only runs after auth is checked
  useEffect(() => {
    if (authChecked) {
      if (!isAuthenticated) {
        router.push("/auth/login")
      } else if (user?.accountType !== "paid") {
        router.push("/upgrade")
      }
    }
  }, [authChecked, isAuthenticated, user, router])

  if (!authChecked || isLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle>Loading...</CardTitle>
              <CardDescription>Please wait while we load your contract details.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason || !details || !agreeToTerms) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and agree to the terms.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Modification request submitted",
        description: "Your contract modification request has been sent to the other party for review.",
      })
      setIsSubmitting(false)
      router.push(`/contracts/${id}`)
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Contract
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Request Contract Modification</h1>
          <p className="text-muted-foreground">For contract: {contract.title}</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Contract Modification Request</CardTitle>
          <CardDescription>
            Submit a request to modify the terms of your contract. The other party will need to review and approve these
            changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="modificationType">Modification Type</Label>
                <RadioGroup
                  id="modificationType"
                  value={modificationType}
                  onValueChange={setModificationType}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scope" id="scope" />
                    <Label htmlFor="scope" className="cursor-pointer">
                      Scope of Work
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="timeline" id="timeline" />
                    <Label htmlFor="timeline" className="cursor-pointer">
                      Project Timeline
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="payment" id="payment" />
                    <Label htmlFor="payment" className="cursor-pointer">
                      Payment Terms
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deliverables" id="deliverables" />
                    <Label htmlFor="deliverables" className="cursor-pointer">
                      Deliverables
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
                <Label htmlFor="reason">Reason for Modification</Label>
                <Input
                  id="reason"
                  placeholder="Brief reason for the requested change"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="details">Modification Details</Label>
                <Textarea
                  id="details"
                  placeholder="Provide detailed information about the changes you're requesting"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="mt-1 min-h-[150px]"
                  required
                />
              </div>

              <div>
                <Label htmlFor="urgency">Urgency Level</Label>
                <RadioGroup id="urgency" value={urgency} onValueChange={setUrgency} className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="cursor-pointer">
                      Low - No immediate impact
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal" className="cursor-pointer">
                      Normal - Should be addressed within a week
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="cursor-pointer">
                      High - Requires prompt attention
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critical" id="critical" />
                    <Label htmlFor="critical" className="cursor-pointer">
                      Critical - Blocking project progress
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Important Notice</p>
                  <p className="text-amber-700 mt-1">
                    Contract modifications require approval from all parties. Once submitted, the other party will be
                    notified and must accept the changes before they take effect. Significant changes may require legal
                    review.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I understand that this request will be sent to {contract.provider.name} and {contract.needer.name} for
                  review and approval. All parties must agree to the changes before they take effect.
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !agreeToTerms}>
                {isSubmitting ? "Submitting..." : "Submit Modification Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
