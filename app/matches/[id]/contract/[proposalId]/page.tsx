"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, Download, Mail, Shield, FilePenLineIcon as Signature } from "lucide-react"

export default function ContractPage({
  params,
}: {
  params: { id: string; proposalId: string }
}) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isSigning, setIsSigning] = useState(false)

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
    id: `contract-${params.proposalId}`,
    matchId: params.id,
    proposalId: params.proposalId,
    smartjectTitle: "AI-Powered Supply Chain Optimization",
    provider: {
      id: "user-101",
      name: "Tech Solutions Inc.",
      email: "contact@techsolutions.com",
    },
    needer: {
      id: "user-201",
      name: "Global Logistics Corp",
      email: "projects@globallogistics.com",
    },
    terms: {
      budget: "$17,500",
      timeline: "2.5 months",
      startDate: "2024-01-15",
      endDate: "2024-03-31",
      paymentSchedule: [
        { milestone: "Project Kickoff", percentage: 30, amount: "$5,250", dueDate: "2024-01-15" },
        { milestone: "Midpoint Delivery", percentage: 30, amount: "$5,250", dueDate: "2024-02-28" },
        { milestone: "Final Delivery", percentage: 40, amount: "$7,000", dueDate: "2024-03-31" },
      ],
      scope:
        "The project will include data integration from existing systems, machine learning model development, dashboard creation, and staff training.",
      deliverables: [
        "Data integration framework",
        "Machine learning prediction model",
        "Real-time monitoring dashboard",
        "Documentation and training materials",
      ],
    },
    status: {
      providerSigned: false,
      neederSigned: false,
      contractActive: false,
    },
    exclusivity: {
      clause:
        "Upon signing this contract, both parties agree to an exclusivity period for this specific smartject implementation. The provider agrees not to offer similar implementation services for this smartject to other parties, and the needer agrees not to engage other providers for this smartject implementation, for the duration of this contract plus 30 days after completion.",
      duration: "Contract period + 30 days",
    },
  }

  const handleSignContract = () => {
    if (!termsAccepted) {
      toast({
        title: "Terms not accepted",
        description: "Please accept the terms and conditions before signing.",
        variant: "destructive",
      })
      return
    }

    setIsSigning(true)

    // In a real app, we would call an API to sign the contract
    setTimeout(() => {
      toast({
        title: "Contract signed",
        description: "You have successfully signed the contract. A copy has been sent to your email.",
      })
      setIsSigning(false)

      // Simulate email notification
      toast({
        title: "Email sent",
        description: "A copy of the signed contract has been sent to your email.",
      })

      // Redirect to the contracts page
      router.push("/contracts")
    }, 2000)
  }

  const handleDownloadContract = () => {
    // In a real app, we would generate and download a PDF
    toast({
      title: "Contract downloaded",
      description: "The contract has been downloaded as a PDF.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Smart Contract</h1>
          <p className="text-muted-foreground">
            For smartject: <span className="font-medium">{contract.smartjectTitle}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contract Terms</CardTitle>
              <CardDescription>Review the terms before signing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Parties</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Provider</p>
                    <p className="font-medium">{contract.provider.name}</p>
                    <p className="text-sm">{contract.provider.email}</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Needer</p>
                    <p className="font-medium">{contract.needer.name}</p>
                    <p className="text-sm">{contract.needer.email}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Budget</p>
                    <p className="font-medium">{contract.terms.budget}</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Timeline</p>
                    <p className="font-medium">{contract.terms.timeline}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                    <p className="font-medium">{new Date(contract.terms.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">End Date</p>
                    <p className="font-medium">{new Date(contract.terms.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Payment Schedule</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left">Milestone</th>
                        <th className="p-3 text-right">Percentage</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-right">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.terms.paymentSchedule.map((payment, index) => (
                        <tr key={index} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                          <td className="p-3">{payment.milestone}</td>
                          <td className="p-3 text-right">{payment.percentage}%</td>
                          <td className="p-3 text-right">{payment.amount}</td>
                          <td className="p-3 text-right">{new Date(payment.dueDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Scope & Deliverables</h3>
                <div className="p-4 border rounded-md mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Project Scope</p>
                  <p>{contract.terms.scope}</p>
                </div>
                <div className="p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Deliverables</p>
                  <ul className="list-disc pl-5">
                    {contract.terms.deliverables.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Exclusivity Clause</h3>
                <div className="p-4 border rounded-md bg-muted/30">
                  <div className="flex items-start mb-2">
                    <Shield className="h-5 w-5 mr-2 text-primary mt-0.5" />
                    <p className="text-sm">{contract.exclusivity.clause}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Duration:</span> {contract.exclusivity.duration}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Contract Status</CardTitle>
              <CardDescription>Current signing status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Signature className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Provider Signature</span>
                  </div>
                  <span
                    className={`text-sm font-medium ${contract.status.providerSigned ? "text-green-600" : "text-amber-600"}`}
                  >
                    {contract.status.providerSigned ? "Signed" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Signature className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Needer Signature</span>
                  </div>
                  <span
                    className={`text-sm font-medium ${contract.status.neederSigned ? "text-green-600" : "text-amber-600"}`}
                  >
                    {contract.status.neederSigned ? "Signed" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Contract Status</span>
                  </div>
                  <span
                    className={`text-sm font-medium ${contract.status.contractActive ? "text-green-600" : "text-amber-600"}`}
                  >
                    {contract.status.contractActive ? "Active" : "Pending Activation"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sign Contract</CardTitle>
              <CardDescription>Review and sign the contract</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have read and agree to the terms and conditions
                  </label>
                  <p className="text-sm text-muted-foreground">
                    By checking this box, you agree to be bound by the terms of this contract.
                  </p>
                </div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                <span>A copy will be sent to your email after signing.</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" onClick={handleSignContract} disabled={!termsAccepted || isSigning}>
                <Signature className="h-4 w-4 mr-2" />
                {isSigning ? "Signing..." : "Sign Contract"}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleDownloadContract}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
