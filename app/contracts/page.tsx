"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { contractService } from "@/lib/services"
import { ContractListType } from "@/lib/types"
import { Calendar, Clock, Download, FileText, Search, Shield } from "lucide-react"

export default function ContractsPage() {
  // Helper function to safely format dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "Invalid Date"
      return date.toLocaleDateString()
    } catch {
      return "Invalid Date"
    }
  }
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeContracts, setActiveContracts] = useState<ContractListType[]>([])
  const [completedContracts, setCompletedContracts] = useState<ContractListType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated or not a paid user
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user?.accountType !== "paid") {
      router.push("/upgrade")
    }
  }, [isAuthenticated, router, user])

  // Fetch contracts data
  useEffect(() => {
    const fetchContracts = async () => {
      if (!user?.id) return
      
      setLoading(true)
      setError(null)
      try {
        const contractsData = await contractService.getUserContracts(user.id)
        setActiveContracts(contractsData.activeContracts)
        setCompletedContracts(contractsData.completedContracts)
      } catch (error) {
        console.error("Error fetching contracts:", error)
        setError("Failed to load contracts. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user?.id && user?.accountType === "paid") {
      fetchContracts()
    }
  }, [isAuthenticated, user])

  if (!isAuthenticated || user?.accountType !== "paid") {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contracts...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const filterContracts = (contracts: ContractListType[]): ContractListType[] => {
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

  const getStatusBadge = (status: ContractListType['status']) => {
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
                      {formatDate(contract.startDate)} -{" "}
                      {formatDate(contract.endDate)}
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
                      Due: {formatDate(contract.nextMilestoneDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Shield className="h-4 w-4 mr-1" /> Exclusivity Ends
                    </p>
                    <p className="font-medium">{formatDate(contract.exclusivityEnds)}</p>
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
                      {formatDate(contract.startDate)} -{" "}
                      {formatDate(contract.endDate)}
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
                      On: {formatDate(contract.completionDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Shield className="h-4 w-4 mr-1" /> Exclusivity Ended
                    </p>
                    <p className="font-medium">{formatDate(contract.exclusivityEnds)}</p>
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
