"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, FileText, CheckCircle, XCircle, Clock, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"

export default function ProposalsPage() {
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

  // Mock proposals data
  const needProposals = [
    {
      id: "proposal-1",
      title: "AI-Powered Supply Chain Optimization",
      smartjectId: "smartject-1",
      status: "submitted",
      createdAt: "2023-12-01",
      updatedAt: "2023-12-05",
      budget: 15000,
      timeline: "3 months",
    },
    {
      id: "proposal-2",
      title: "Predictive Maintenance System",
      smartjectId: "smartject-3",
      status: "draft",
      createdAt: "2023-12-10",
      updatedAt: "2023-12-10",
      budget: 8000,
      timeline: "2 months",
    },
    {
      id: "proposal-5",
      title: "AI-Enhanced Customer Segmentation",
      smartjectId: "smartject-7",
      status: "rejected",
      createdAt: "2023-11-20",
      updatedAt: "2023-11-25",
      budget: 12000,
      timeline: "2.5 months",
    },
  ]

  const provideProposals = [
    {
      id: "proposal-3",
      title: "Automated Customer Support Chatbot Implementation",
      smartjectId: "smartject-2",
      status: "accepted",
      createdAt: "2023-11-15",
      updatedAt: "2023-11-20",
      budget: 12000,
      timeline: "2.5 months",
    },
    {
      id: "proposal-4",
      title: "Computer Vision Quality Control System",
      smartjectId: "smartject-6",
      status: "rejected",
      createdAt: "2023-11-28",
      updatedAt: "2023-12-02",
      budget: 18000,
      timeline: "4 months",
    },
    {
      id: "proposal-6",
      title: "Sentiment Analysis Implementation",
      smartjectId: "smartject-8",
      status: "submitted",
      createdAt: "2023-12-08",
      updatedAt: "2023-12-08",
      budget: 9500,
      timeline: "1.5 months",
    },
  ]

  const filterProposals = useCallback(
    (proposals: any[]) => {
      return proposals
        .filter((proposal) => {
          // Filter by search term
          if (searchTerm && !proposal.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false
          }

          // Filter by status
          if (statusFilter !== "all" && proposal.status !== statusFilter) {
            return false
          }

          return true
        })
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    },
    [searchTerm, statusFilter],
  )

  const filteredNeedProposals = filterProposals(needProposals)
  const filteredProvideProposals = filterProposals(provideProposals)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Draft
          </Badge>
        )
      case "submitted":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> Submitted
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="success" className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Accepted
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Proposals</h1>
          <p className="text-muted-foreground">Manage your smartject proposals</p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={() => router.push("/proposals/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Proposal
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search proposals..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="need">
        <TabsList className="mb-6">
          <TabsTrigger value="need">I Need ({filteredNeedProposals.length})</TabsTrigger>
          <TabsTrigger value="provide">I Provide ({filteredProvideProposals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="need" className="space-y-6">
          {filteredNeedProposals.length > 0 ? (
            filteredNeedProposals.map((proposal) => (
              <Card
                key={proposal.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/proposals/${proposal.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{proposal.title}</CardTitle>
                      <CardDescription>
                        Last updated on {new Date(proposal.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(proposal.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">${proposal.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timeline</p>
                      <p className="font-medium">{proposal.timeline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Smartject ID</p>
                      <p className="font-medium">{proposal.smartjectId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No proposals match your search criteria."
                    : "You haven't created any 'I Need' proposals yet."}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => router.push("/proposals/create")}>Create Your First Proposal</Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="provide" className="space-y-6">
          {filteredProvideProposals.length > 0 ? (
            filteredProvideProposals.map((proposal) => (
              <Card
                key={proposal.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/proposals/${proposal.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{proposal.title}</CardTitle>
                      <CardDescription>
                        Last updated on {new Date(proposal.updatedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(proposal.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">${proposal.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timeline</p>
                      <p className="font-medium">{proposal.timeline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Smartject ID</p>
                      <p className="font-medium">{proposal.smartjectId}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all"
                    ? "No proposals match your search criteria."
                    : "You haven't created any 'I Provide' proposals yet."}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={() => router.push("/proposals/create")}>Create Your First Proposal</Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
