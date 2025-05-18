"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { ArrowRight, Calendar, CheckCircle, Clock, DollarSign, FileText, MessageSquare, Users } from "lucide-react"

export default function MatchDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  // Authentication check with delay to ensure auth state is loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true)
      console.log("Auth check completed, isAuthenticated:", isAuthenticated)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Redirect if not authenticated after auth check
  useEffect(() => {
    if (authChecked) {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login")
        router.push("/auth/login")
      } else {
        setLoading(false)
      }
    }
  }, [authChecked, isAuthenticated, router])

  if (!authChecked || loading) {
    return null
  }

  // Mock data for the match
  const match = {
    id: params.id,
    smartjectTitle:
      params.id === "match-1" ? "AI-Powered Supply Chain Optimization" : "Automated Customer Support Chatbot",
    description:
      params.id === "match-1"
        ? "Implement AI algorithms to optimize supply chain operations, reducing costs and improving efficiency."
        : "Develop an AI chatbot that can handle customer inquiries, reducing support costs and improving response times.",
    status: params.id === "match-1" ? "new" : "contract_ready",
    matchedDate: params.id === "match-1" ? "2023-12-05" : "2023-11-28",
    type: params.id === "match-1" ? "need" : "provide",
    category: "Artificial Intelligence",
    budget: params.id === "match-1" ? "$15,000 - $20,000" : "$10,000 - $15,000",
    timeline: params.id === "match-1" ? "3-4 months" : "2-3 months",
    proposals: params.id === "match-1" ? 3 : 1,
  }

  // Mock data for proposals
  const proposals = [
    {
      id: "proposal-1",
      title: match.smartjectTitle,
      provider: "Tech Solutions Inc.",
      submittedDate: "2023-12-01",
      budget: 17500,
      timeline: "3 months",
      status: "pending",
    },
    ...(params.id === "match-1"
      ? [
          {
            id: "proposal-2",
            title: match.smartjectTitle,
            provider: "AI Innovations Ltd.",
            submittedDate: "2023-12-02",
            budget: 19000,
            timeline: "4 months",
            status: "pending",
          },
          {
            id: "proposal-3",
            title: match.smartjectTitle,
            provider: "Digital Transformers Co.",
            submittedDate: "2023-12-03",
            budget: 16000,
            timeline: "3.5 months",
            status: "pending",
          },
        ]
      : []),
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-100 text-blue-800">New Match</Badge>
      case "contract_ready":
        return <Badge className="bg-green-100 text-green-800">Contract Ready</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">{match.smartjectTitle}</h1>
            <p className="text-muted-foreground">
              Matched on {new Date(match.matchedDate).toLocaleDateString()} •
              {match.type === "need" ? " You Need This" : " You Provide This"}
            </p>
          </div>
          <div className="mt-4 md:mt-0">{getStatusBadge(match.status)}</div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
            <CardDescription>Information about this smartject match</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">{match.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">Category</h3>
                  </div>
                  <p className="text-muted-foreground">{match.category}</p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">Budget Range</h3>
                  </div>
                  <p className="text-muted-foreground">{match.budget}</p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">Timeline</h3>
                  </div>
                  <p className="text-muted-foreground">{match.timeline}</p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <h3 className="font-medium">Proposals</h3>
                  </div>
                  <p className="text-muted-foreground">{match.proposals}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            {match.type === "need" ? (
              <Button onClick={() => router.push(`/matches/${match.id}/negotiate/provide-1`)}>Negotiate Terms</Button>
            ) : (
              <Button onClick={() => router.push(`/matches/${match.id}/contract/proposal-1`)}>View Contract</Button>
            )}
          </CardFooter>
        </Card>

        <Tabs defaultValue="proposals">
          <TabsList className="mb-6">
            <TabsTrigger value="proposals">Proposals ({proposals.length})</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="proposals" className="space-y-4">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{proposal.provider}</CardTitle>
                      <CardDescription>
                        Submitted on {new Date(proposal.submittedDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(proposal.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" /> Budget
                      </p>
                      <p className="font-medium">${proposal.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-4 w-4 mr-1" /> Timeline
                      </p>
                      <p className="font-medium">{proposal.timeline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" /> Status
                      </p>
                      <p className="font-medium capitalize">{proposal.status}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => router.push(`/proposals/${proposal.id}`)}>
                    View Details
                  </Button>
                  {match.type === "need" && (
                    <Button onClick={() => router.push(`/matches/${match.id}/negotiate/${proposal.id}`)}>
                      Negotiate
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}

            {proposals.length > 1 && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={() => router.push(`/matches/${match.id}/compare`)}
                >
                  Compare All Proposals <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No messages yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Start a conversation about this match to discuss details.
                    </p>
                    <Button className="mt-4">Start Conversation</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
