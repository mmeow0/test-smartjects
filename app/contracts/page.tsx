"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { Calendar, Clock, Download, FileText, Search, Shield } from "lucide-react"

export default function ContractsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Redirect if not authenticated or not a paid user
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user?.accountType !== "paid") {
      router.push("/upgrade")
    }
  }, [isAuthenticated, router, user])

  if (!isAuthenticated || user?.accountType !== "paid") {
    return null
  }

  // Mock contracts data
  const activeContracts = [
    {
      id: "contract-1",
      smartjectId: "smartject-2",
      smartjectTitle: "Automated Customer Support Chatbot",
      otherParty: "Global Retail Corp",
      role: "provider",
      startDate: "2023-12-15",
      endDate: "2024-02-15",
      status: "active",
      budget: "$14,000",
      nextMilestone: "Midpoint Delivery",
      nextMilestoneDate: "2024-01-15",
      exclusivityEnds: "2024-03-15",
    },
    {
      id: "contract-2",
      smartjectId: "smartject-1",
      smartjectTitle: "AI-Powered Supply Chain Optimization",
      otherParty: "Tech Solutions Inc.",
      role: "needer",
      startDate: "2024-01-15",
      endDate: "2024-03-31",
      status: "pending_start",
      budget: "$17,500",
      nextMilestone: "Project Kickoff",
      nextMilestoneDate: "2024-01-15",
      exclusivityEnds: "2024-04-30",
    },
  ]

  const completedContracts = [
    {
      id: "contract-3",
      smartjectId: "smartject-4",
      smartjectTitle: "AI-Enhanced Fraud Detection System",
      otherParty: "Security First Solutions",
      role: "needer",
      startDate: "2023-08-01",
      endDate: "2023-11-15",
      status: "completed",
      budget: "$22,000",
      finalMilestone: "Final Delivery",
      completionDate: "2023-11-15",
      exclusivityEnds: "2023-12-15",
    },
    {
      id: "contract-4",
      smartjectId: "smartject-5",
      smartjectTitle: "Personalized Learning Platform",
      otherParty: "EduTech Innovations",
      role: "provider",
      startDate: "2023-06-15",
      endDate: "2023-10-30",
      status: "completed",
      budget: "$19,500",
      finalMilestone: "Final Delivery",
      completionDate: "2023-10-30",
      exclusivityEnds: "2023-11-30",
    },
  ]

  const filterContracts = (contracts: any[]) => {
    return contracts
      .filter((contract) => {
        // Filter by search term
        if (searchTerm && !contract.smartjectTitle.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false
        }

        // Filter by status
        if (statusFilter !== "all" && contract.status !== statusFilter) {
          return false
        }

        return true
      })
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
  }

  const filteredActiveContracts = filterContracts(activeContracts)
  const filteredCompletedContracts = filterContracts(completedContracts)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "pending_start":
        return <Badge className="bg-blue-100 text-blue-800">Pending Start</Badge>
      case "completed":
        return <Badge className="bg-purple-100 text-purple-800">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Smart Contracts</h1>
          <p className="text-muted-foreground">Manage your active and completed contracts</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <select
            className="w-full h-10 px-3 py-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending_start">Pending Start</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Contracts ({filteredActiveContracts.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed Contracts ({filteredCompletedContracts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {filteredActiveContracts.map((contract) => (
            <Card
              key={contract.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/contracts/${contract.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{contract.smartjectTitle}</CardTitle>
                    <CardDescription>
                      Contract with {contract.otherParty} • You are the {contract.role}
                    </CardDescription>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> Duration
                    </p>
                    <p className="font-medium">
                      {new Date(contract.startDate).toLocaleDateString()} -{" "}
                      {new Date(contract.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <FileText className="h-4 w-4 mr-1" /> Budget
                    </p>
                    <p className="font-medium">{contract.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> Next Milestone
                    </p>
                    <p className="font-medium">{contract.nextMilestone}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(contract.nextMilestoneDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Shield className="h-4 w-4 mr-1" /> Exclusivity Ends
                    </p>
                    <p className="font-medium">{new Date(contract.exclusivityEnds).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="mr-2">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredActiveContracts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No contracts match your search criteria."
                    : "You don't have any active contracts yet."}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => router.push("/matches")}>View Your Matches</Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {filteredCompletedContracts.map((contract) => (
            <Card
              key={contract.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => router.push(`/contracts/${contract.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{contract.smartjectTitle}</CardTitle>
                    <CardDescription>
                      Contract with {contract.otherParty} • You were the {contract.role}
                    </CardDescription>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> Duration
                    </p>
                    <p className="font-medium">
                      {new Date(contract.startDate).toLocaleDateString()} -{" "}
                      {new Date(contract.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <FileText className="h-4 w-4 mr-1" /> Budget
                    </p>
                    <p className="font-medium">{contract.budget}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-4 w-4 mr-1" /> Completion
                    </p>
                    <p className="font-medium">{contract.finalMilestone}</p>
                    <p className="text-xs text-muted-foreground">
                      On: {new Date(contract.completionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Shield className="h-4 w-4 mr-1" /> Exclusivity Ended
                    </p>
                    <p className="font-medium">{new Date(contract.exclusivityEnds).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" className="mr-2">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCompletedContracts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No contracts match your search criteria."
                    : "You don't have any completed contracts yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
