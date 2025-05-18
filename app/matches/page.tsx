"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import { Bell, Calendar, DollarSign, MessageSquare, Search, Star, ThumbsUp, Users } from "lucide-react"

export default function MatchesPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
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

  // Mock matches data
  const needMatches = [
    {
      id: "match-1",
      smartjectId: "smartject-1",
      smartjectTitle: "AI-Powered Supply Chain Optimization",
      matchedDate: "2023-12-05",
      status: "new",
      proposals: [
        {
          id: "proposal-1",
          providerId: "user-101",
          providerName: "Tech Solutions Inc.",
          providerRating: 4.8,
          providerCompletedProjects: 12,
          budget: "$15,000",
          timeline: "3 months",
          matchScore: 92,
        },
        {
          id: "proposal-2",
          providerId: "user-102",
          providerName: "AI Innovations",
          providerRating: 4.5,
          providerCompletedProjects: 8,
          budget: "$18,000",
          timeline: "2.5 months",
          matchScore: 87,
        },
        {
          id: "proposal-3",
          providerId: "user-103",
          providerName: "DataSmart Systems",
          providerRating: 4.2,
          providerCompletedProjects: 5,
          budget: "$12,500",
          timeline: "4 months",
          matchScore: 81,
        },
      ],
    },
    {
      id: "match-2",
      smartjectId: "smartject-3",
      smartjectTitle: "Predictive Maintenance System",
      matchedDate: "2023-12-10",
      status: "in_negotiation",
      proposals: [
        {
          id: "proposal-4",
          providerId: "user-104",
          providerName: "Maintenance AI",
          providerRating: 4.9,
          providerCompletedProjects: 15,
          budget: "$22,000",
          timeline: "3.5 months",
          matchScore: 95,
        },
      ],
    },
  ]

  const provideMatches = [
    {
      id: "match-3",
      smartjectId: "smartject-2",
      smartjectTitle: "Automated Customer Support Chatbot",
      matchedDate: "2023-11-28",
      status: "contract_ready",
      proposals: [
        {
          id: "proposal-5",
          neederId: "user-201",
          neederName: "Global Retail Corp",
          neederRating: 4.7,
          neederCompletedProjects: 9,
          budget: "$14,000",
          timeline: "2 months",
          matchScore: 89,
        },
      ],
    },
    {
      id: "match-4",
      smartjectId: "smartject-6",
      smartjectTitle: "Computer Vision Quality Control System",
      matchedDate: "2023-12-01",
      status: "new",
      proposals: [
        {
          id: "proposal-6",
          neederId: "user-202",
          neederName: "Manufacturing Excellence",
          neederRating: 4.4,
          neederCompletedProjects: 6,
          budget: "$19,500",
          timeline: "4 months",
          matchScore: 84,
        },
        {
          id: "proposal-7",
          neederId: "user-203",
          neederName: "Quality First Industries",
          neederRating: 4.6,
          neederCompletedProjects: 11,
          budget: "$21,000",
          timeline: "3 months",
          matchScore: 82,
        },
      ],
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-100 text-blue-800">New Match</Badge>
      case "in_negotiation":
        return <Badge className="bg-amber-100 text-amber-800">In Negotiation</Badge>
      case "contract_ready":
        return <Badge className="bg-green-100 text-green-800">Contract Ready</Badge>
      case "contract_signed":
        return <Badge className="bg-purple-100 text-purple-800">Contract Signed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewMatch = (matchId: string) => {
    router.push(`/matches/${matchId}`)
  }

  const handleViewComparison = (matchId: string) => {
    router.push(`/matches/${matchId}/compare`)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Smartject Matches</h1>
          <p className="text-muted-foreground">Review and manage your matched proposals</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search matches..."
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
            <option value="new">New Matches</option>
            <option value="in_negotiation">In Negotiation</option>
            <option value="contract_ready">Contract Ready</option>
            <option value="contract_signed">Contract Signed</option>
          </select>
        </div>
      </div>

      <Tabs defaultValue="need">
        <TabsList className="mb-6">
          <TabsTrigger value="need">I Need ({needMatches.length})</TabsTrigger>
          <TabsTrigger value="provide">I Provide ({provideMatches.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="need" className="space-y-6">
          {needMatches.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{match.smartjectTitle}</CardTitle>
                    <CardDescription>
                      Matched on {new Date(match.matchedDate).toLocaleDateString()} • {match.proposals.length} proposals
                    </CardDescription>
                  </div>
                  {getStatusBadge(match.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {match.proposals.map((proposal) => (
                    <div key={proposal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback>{proposal.providerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{proposal.providerName}</h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              <span className="mr-3">{proposal.providerRating}</span>
                              <Users className="h-3 w-3 mr-1" />
                              <span>{proposal.providerCompletedProjects} completed projects</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-primary/10">
                          {proposal.matchScore}% Match
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" /> Budget
                          </p>
                          <p className="font-medium">{proposal.budget}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-4 w-4 mr-1" /> Timeline
                          </p>
                          <p className="font-medium">{proposal.timeline}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/proposals/${proposal.id}`)}
                        >
                          View Proposal
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/matches/${match.id}/negotiate/${proposal.id}`)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Negotiate
                        </Button>
                        {match.status === "in_negotiation" && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/matches/${match.id}/contract/${proposal.id}`)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Accept Terms
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => handleViewMatch(match.id)}>
                  View All Details
                </Button>
                {match.proposals.length > 1 && (
                  <Button variant="outline" onClick={() => handleViewComparison(match.id)}>
                    Compare Proposals
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}

          {needMatches.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-medium mb-2">No matches yet</p>
                <p className="text-muted-foreground text-center mb-6">
                  When providers match with your smartject needs, they'll appear here.
                </p>
                <Button onClick={() => router.push("/smartjects/hub")}>Browse Smartjects</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="provide" className="space-y-6">
          {provideMatches.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{match.smartjectTitle}</CardTitle>
                    <CardDescription>
                      Matched on {new Date(match.matchedDate).toLocaleDateString()} • {match.proposals.length}{" "}
                      interested parties
                    </CardDescription>
                  </div>
                  {getStatusBadge(match.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {match.proposals.map((proposal) => (
                    <div key={proposal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback>{proposal.neederName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{proposal.neederName}</h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              <span className="mr-3">{proposal.neederRating}</span>
                              <Users className="h-3 w-3 mr-1" />
                              <span>{proposal.neederCompletedProjects} completed projects</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-primary/10">
                          {proposal.matchScore}% Match
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" /> Budget
                          </p>
                          <p className="font-medium">{proposal.budget}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-4 w-4 mr-1" /> Timeline
                          </p>
                          <p className="font-medium">{proposal.timeline}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/proposals/${proposal.id}`)}
                        >
                          View Proposal
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/matches/${match.id}/negotiate/${proposal.id}`)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Negotiate
                        </Button>
                        {match.status === "contract_ready" && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/matches/${match.id}/contract/${proposal.id}`)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Sign Contract
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" onClick={() => handleViewMatch(match.id)}>
                  View All Details
                </Button>
              </CardFooter>
            </Card>
          ))}

          {provideMatches.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-medium mb-2">No matches yet</p>
                <p className="text-muted-foreground text-center mb-6">
                  When your proposals match with smartject needs, they'll appear here.
                </p>
                <Button onClick={() => router.push("/smartjects/hub")}>Browse Smartjects</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
